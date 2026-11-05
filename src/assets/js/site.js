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
  if (document.readyState === 'complete') setTimeout(start, 200);
  else window.addEventListener('load', function () { setTimeout(start, 200); });
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
