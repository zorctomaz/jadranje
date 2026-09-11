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
})();
