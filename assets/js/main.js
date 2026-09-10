(function () {
  "use strict";

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Language toggle (SI/EN), matching the FOTRA hub convention ---------- */
  var PAGE_DESC = {
    sl: 'Individualni tečaji jadranja, vzdrževanje plovil in skiperiranje/transfer. Odjadraj v neznano — z osebnim pristopom.',
    en: 'Individual sailing courses, boat maintenance and skippering/transfer. Sail into the unknown — with a personal touch.'
  };
  var VIDEO_TITLE = { sl: 'Jadranje', en: 'Sailing' };
  var currentLang = 'sl';

  function applyLang(lang) {
    if (lang !== 'en' && lang !== 'sl') lang = 'sl';
    currentLang = lang;

    var htmlRoot = document.getElementById('htmlRoot');
    if (htmlRoot) htmlRoot.lang = lang;

    var descEl = document.getElementById('pageDescription');
    if (descEl) descEl.setAttribute('content', PAGE_DESC[lang]);

    document.querySelectorAll('[data-sl][data-en]').forEach(function (el) {
      el.innerHTML = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-sl');
    });

    var videoIframe = document.getElementById('videoIframe');
    if (videoIframe) videoIframe.setAttribute('title', VIDEO_TITLE[lang]);

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    try { localStorage.setItem('jadranjeLang', lang); } catch (e) {}
  }

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
    });
  });

  var initialLang = 'sl';
  try {
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    var storedLang = localStorage.getItem('jadranjeLang');
    if (urlLang === 'en' || urlLang === 'sl') { initialLang = urlLang; }
    else if (storedLang === 'en' || storedLang === 'sl') { initialLang = storedLang; }
  } catch (e) {}

  applyLang(initialLang);

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
