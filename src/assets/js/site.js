// Mobile menu
(function () {
  var btn = document.querySelector('.hdr__burger'), nav = document.getElementById('mnav');
  if (!btn || !nav) return;
  var close = nav.querySelector('.mnav__close');
  function set(open) { nav.hidden = !open; btn.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; if (open) close.focus(); }
  btn.addEventListener('click', function () { set(true); });
  close.addEventListener('click', function () { set(false); btn.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !nav.hidden) set(false); });
})();

// Hero background video: the poster image shows instantly; the video only starts
// downloading after the page has finished loading, so it never slows the first view.
(function () {
  var v = document.querySelector('video[data-lazy-hero]');
  if (!v) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function start() {
    var src = window.innerWidth < 768 ? v.dataset.srcMobile : v.dataset.src;
    if (navigator.connection && navigator.connection.saveData) return;
    v.src = src; v.load();
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  // Wait until the page has loaded and the browser is idle before pulling the video.
  function later() { (window.requestIdleCallback || setTimeout)(start, { timeout: 1500 }); }
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later);
})();

// Reviews widget: read more, site tabs, write-a-review menu, arrows, autoplay
(function () {
  function fit(t) {
    var b = t.parentNode.nextElementSibling;
    if (!b || !b.classList.contains('review__more')) return;
    b.hidden = !t.classList.contains('open') && t.scrollHeight <= t.clientHeight + 2 && !t.parentNode.querySelector('.review__photo');
  }
  document.querySelectorAll('[data-reviews]').forEach(function (w) {
    var tr = w.querySelector('.reviews__track'), items = [].slice.call(tr.querySelectorAll('.review'));
    items.forEach(function (r) {
      var t = r.querySelector('.review__text'), b = r.querySelector('.review__more');
      fit(t);
      b.addEventListener('click', function () {
        var o = t.classList.toggle('open'); b.textContent = o ? 'Hide' : 'Read more'; stop();
      });
    });
    // tabs
    w.querySelectorAll('.tiw__tabs button').forEach(function (tab) {
      tab.addEventListener('click', function () {
        w.querySelectorAll('.tiw__tabs button').forEach(function (x) { x.setAttribute('aria-selected', x === tab); });
        items.forEach(function (r) { r.hidden = tab.dataset.src !== 'all' && r.dataset.src !== tab.dataset.src; });
        tr.scrollLeft = 0; items.forEach(function (r) { if (!r.hidden) fit(r.querySelector('.review__text')); });
      });
    });
    // write a review menu
    var wr = w.querySelector('.tiw__write'), wb = wr && wr.querySelector('.tiw__writebtn');
    if (wb) {
      wb.addEventListener('click', function (e) { e.stopPropagation(); var o = wr.classList.toggle('open'); wb.setAttribute('aria-expanded', o); });
      document.addEventListener('click', function () { wr.classList.remove('open'); wb.setAttribute('aria-expanded', false); });
    }
    // arrows (wrap around at the ends)
    function go(dir) {
      var max = tr.scrollWidth - tr.clientWidth;
      if (dir > 0 && tr.scrollLeft >= max - 4) tr.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir < 0 && tr.scrollLeft <= 4) tr.scrollTo({ left: max, behavior: 'smooth' });
      else {
        var first = items.filter(function (r) { return !r.hidden; })[0];
        var step = first ? first.offsetWidth + parseFloat(getComputedStyle(tr).columnGap || 16) : tr.clientWidth;
        tr.scrollBy({ left: step * dir, behavior: 'smooth' });
      }
    }
    w.querySelectorAll('[data-dir]').forEach(function (b) {
      b.addEventListener('click', function () { stop(); go(+b.dataset.dir); });
    });
    // autoplay every 6 seconds while on screen; stops once the visitor interacts
    var timer = null, stopped = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function stop() { stopped = true; clearInterval(timer); timer = null; }
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (ev) { tr.addEventListener(ev, stop, { passive: true }); });
    w.addEventListener('mouseenter', function () { clearInterval(timer); timer = null; });
    w.addEventListener('mouseleave', function () { if (!stopped && visible && !timer) timer = setInterval(function () { go(1); }, 6000); });
    var visible = false;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      clearInterval(timer); timer = null;
      if (visible && !stopped) timer = setInterval(function () { go(1); }, 6000);
    }).observe(w);
  });
})();

// Section background images: load each one shortly before it scrolls into view.
(function () {
  var els = document.querySelectorAll('.lazy-bg');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('bg-on'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('bg-on'); io.unobserve(en.target); } });
  }, { rootMargin: '600px 0px' });
  els.forEach(function (e) { io.observe(e); });
})();

// FareHarbor booking pop-up: its scripts load on the visitor's first scroll/tap (or after a few seconds),
// not during page load. A Book Now click before then loads it and opens the pop-up straight away.
(function () {
  var state = 0, pending = null; // 0 = not loaded, 1 = loading, 2 = ready
  function load() {
    if (state) return; state = 1;
    var s = document.createElement('script');
    s.src = 'https://fareharbor.com/embeds/api/v1/?autolightframe=yes'; s.async = true;
    s.onload = function () { state = 2; if (pending) { var a = pending; pending = null; setTimeout(function () { a.click(); }, 50); } };
    s.onerror = function () { state = 0; if (pending) { window.open(pending.href, '_blank', 'noopener'); pending = null; } };
    document.head.appendChild(s);
  }
  ['scroll', 'pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { addEventListener(ev, load, { once: true, passive: true }); });
  addEventListener('load', function () { setTimeout(load, 4000); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="fareharbor.com/embeds/book"]');
    if (!a || state === 2) return;
    e.preventDefault(); pending = a; load();
  }, true);
})();
