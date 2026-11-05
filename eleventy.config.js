const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const md = markdownIt({ html: true, breaks: false, linkify: false });

// Read width/height from a WebP/PNG/JPEG header so every <img> gets real dimensions.
function imageSize(file) {
  try {
    const b = fs.readFileSync(file);
    if (b.toString("ascii", 0, 4) === "RIFF") {
      const t = b.toString("ascii", 12, 16);
      if (t === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
      if (t === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
      if (t === "VP8L") { const n = b.readUInt32LE(21); return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 }; }
    }
    if (b[0] === 0x89) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    if (b[0] === 0xff) { let i = 2; while (i < b.length) { const m = b[i + 1], l = b.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }; i += 2 + l; } }
  } catch (e) {}
  return null;
}

// Photos the client uploads through the editor (src/images/uploads) are resized and converted
// to WebP/AVIF on the fly by Netlify's image service, so a 6 MB phone photo never slows the site.
const cdn = (src, w = 1200) =>
  process.env.NETLIFY && src.startsWith("/images/uploads/") ? `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&q=75` : src;

module.exports = function (eleventyConfig) {
  ["src/images", "src/fonts", "src/video", "src/assets", "src/admin", "src/favicon.png", "src/favicon-32.png", "src/robots.txt", "src/_redirects"].forEach(p =>
    eleventyConfig.addPassthroughCopy(p));

  eleventyConfig.addFilter("md", s => (s ? md.render(String(s)) : ""));
  eleventyConfig.addFilter("mdi", s => (s ? md.renderInline(String(s)) : ""));
  // *word* in a heading becomes the blue accent colour, matching the original design.
  eleventyConfig.addFilter("accent", s => String(s || "").replace(/\*([^*]+)\*/g, '<span class="accent">$1</span>').replace(/\n/g, "<br>"));
  eleventyConfig.addFilter("plain", s => String(s || "").replace(/\*/g, ""));
  eleventyConfig.addFilter("imgsize", src => {
    if (!src || /^https?:/.test(src)) return null;
    return imageSize(path.join("src", src));
  });
  eleventyConfig.addFilter("date_long", d => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }));
  eleventyConfig.addFilter("date_iso", d => new Date(d).toISOString());
  eleventyConfig.addFilter("excerpt", (s, n = 220) => {
    const t = String(s || "").replace(/<[^>]+>/g, " ").replace(/[#*_>\[\]]|\(\/[^)]*\)/g, "").replace(/\s+/g, " ").trim();
    return t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t;
  });
  eleventyConfig.addFilter("limit", (a, n) => (a || []).slice(0, n));
  eleventyConfig.addFilter("external", u => /^https?:\/\//.test(u || "") && !/keysflatsfishing\.com/.test(u));
  eleventyConfig.addFilter("find", (arr, key, val) => (arr || []).find(x => x[key] === val));

  // Every <img> pointing at /images/ gets real width/height (no layout shift) and lazy-loading
  // unless it is marked high priority. Runs of 2+ photo-only paragraphs become a photo grid.
  eleventyConfig.addTransform("images", function (html) {
    if (!(this.page.outputPath || "").endsWith(".html")) return html;
    html = html.replace(/(?:<p>\s*(<img [^>]+>)\s*<\/p>\s*){2,}/g, m => '<div class="gallery">' + m.replace(/<\/?p>/g, "") + "</div>");
    return html.replace(/<img ([^>]*?)src="(\/images\/[^"]+)"([^>]*)>/g, (m, a, src, b) => {
      let attrs = a + b;
      if (!/\bwidth=/.test(attrs)) { const sz = imageSize(path.join("src", src)); if (sz) attrs += ` width="${sz.w}" height="${sz.h}"`; }
      if (!/loading=|fetchpriority=/.test(attrs)) attrs += ' loading="lazy" decoding="async"';
      return `<img ${attrs.trim()} src="${cdn(src)}">`.replace(/\s+/g, " ");
    }).replace(/url\('(\/images\/uploads\/[^']+)'\)/g, (m, src) => `url('${cdn(src, 1920)}')`);
  });

  eleventyConfig.addCollection("posts", api => api.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date));

  return { dir: { input: "src", output: "_site", includes: "_includes", data: "_data" }, markdownTemplateEngine: "njk", htmlTemplateEngine: "njk" };
};
