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

  /* ---------- Lightbox za galerijo ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var galleryTiles = Array.prototype.slice.call(document.querySelectorAll('.gtile'));
  var lightboxIndex = 0;
  var lastFocused = null;

  function tileImageUrl(el) {
    var bg = getComputedStyle(el).backgroundImage;
    var match = bg.match(/url\(["']?(.*?)["']?\)/);
    return match ? match[1] : '';
  }
  function showLightbox(index) {
    if (!galleryTiles.length) return;
    lightboxIndex = (index + galleryTiles.length) % galleryTiles.length;
    var el = galleryTiles[lightboxIndex];
    var url = tileImageUrl(el);
    if (!url) return;
    lightboxImg.src = url;
    var labelEl = el.querySelector('span');
    var label = labelEl ? labelEl.textContent : '';
    lightboxImg.alt = label;
    lightboxCaption.textContent = label;
    lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + galleryTiles.length;
  }
  function openLightbox(index) {
    lastFocused = document.activeElement;
    showLightbox(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxClose.focus();
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  galleryTiles.forEach(function (el, idx) {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.addEventListener('click', function () { openLightbox(idx); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function () { showLightbox(lightboxIndex - 1); });
  lightboxNext.addEventListener('click', function () { showLightbox(lightboxIndex + 1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showLightbox(lightboxIndex - 1);
    else if (e.key === 'ArrowRight') showLightbox(lightboxIndex + 1);
  });

  var touchStartX = null, touchStartY = null;
  lightbox.addEventListener('touchstart', function (e) {
    var t = e.changedTouches[0];
    touchStartX = t.clientX; touchStartY = t.clientY;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (touchStartX === null) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStartX;
    var dy = t.clientY - touchStartY;
    touchStartX = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) showLightbox(lightboxIndex + 1); else showLightbox(lightboxIndex - 1);
    }
  }, { passive: true });
})();
