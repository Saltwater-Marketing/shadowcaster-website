const strip = s => String(s || "").replace(/\*/g, "").replace(/<[^>]+>/g, "").trim();

module.exports = {
  // Preload the hero image so it paints first.
  preload_image: data => (data.hero && data.hero.image) || data.preload_image,

  // Structured data for search engines, built from the page content.
  schema: data => {
    if (data.schema) return data.schema;
    const site = data.site, url = site.url + (data.page && data.page.url || "/");
    const graph = [];
    if (data.page && data.page.url === "/") {
      graph.push({
        "@type": ["LocalBusiness", "TouristAttraction"], "@id": site.url + "/#business",
        name: site.name, url: site.url, telephone: "+1-305-587-7669", email: site.email,
        image: site.url + site.default_image, logo: site.url + "/images/frame-181.webp",
        description: data.description, priceRange: "$700–$1200",
        address: { "@type": "PostalAddress", streetAddress: site.street, addressLocality: site.city, addressRegion: site.region, postalCode: site.postal, addressCountry: "US" },
        geo: { "@type": "GeoCoordinates", latitude: 24.5622, longitude: -81.8016 },
        sameAs: [site.instagram],
        aggregateRating: { "@type": "AggregateRating", ratingValue: data.reviews.rating, reviewCount: data.reviews.count },
        founder: { "@type": "Person", name: "Captain John Smouse" }
      });
    }
    if (data.layout === "post.njk") {
      graph.push({
        "@type": "BlogPosting", headline: strip(data.title), datePublished: new Date(data.page.date).toISOString(),
        image: site.url + (data.image || site.default_image), url, description: data.description,
        author: { "@type": "Person", name: "Captain John Smouse" },
        publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: site.url + "/images/frame-181.webp" } }
      });
    }
    const faqs = (data.sections || []).filter(s => s.type === "faq").flatMap(s => s.items || []);
    if (faqs.length) graph.push({ "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })) });
    return graph.length ? { "@context": "https://schema.org", "@graph": graph } : null;
  },
};
