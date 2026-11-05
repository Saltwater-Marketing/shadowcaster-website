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

// Reviews: read more + arrows
(function () {
  document.querySelectorAll('.review__text').forEach(function (t) {
    var b = t.nextElementSibling;
    if (!b || !b.classList.contains('review__more')) return;
    if (t.scrollHeight <= t.clientHeight + 2) { b.remove(); return; }
    b.addEventListener('click', function () { var o = t.classList.toggle('open'); b.textContent = o ? 'Show less' : 'Read more'; });
  });
  document.querySelectorAll('[data-reviews]').forEach(function (w) {
    var tr = w.querySelector('.reviews__track');
    w.querySelectorAll('[data-dir]').forEach(function (b) {
      b.addEventListener('click', function () { tr.scrollBy({ left: tr.clientWidth * (+b.dataset.dir), behavior: 'smooth' }); });
    });
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
