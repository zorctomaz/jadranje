(function () {
  "use strict";

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- NAV: scroll shadow + mobile select ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var mobileNavSelect = document.getElementById('mobileNavSelect');
  mobileNavSelect.addEventListener('change', function () {
    var target = mobileNavSelect.value;
    mobileNavSelect.selectedIndex = 0;
    mobileNavSelect.blur();
    if (!target) return;
    // Small delay lets iOS/Android fully dismiss the native picker UI first.
    setTimeout(function () {
      var el = document.querySelector(target);
      if (!el) return;
      if (window.location.hash === target) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.hash = target;
      }
    }, 80);
  });

  /* ---------- Scrollspy: poudari aktivni razdelek v navigaciji ---------- */
  var navAnchors = document.querySelectorAll('nav.links a[href^="#"]');
  var sections = Array.prototype.map.call(navAnchors, function (a) {
    return document.getElementById(a.getAttribute('href').slice(1));
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (section) { observer.observe(section); });
  }
})();
