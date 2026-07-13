"use strict";
/**
 * salle.js — Compiled from ts/salle.ts
 * Lightbox galerie photos + scroll reveal
 */
(function () {
  'use strict';

  /* ── Collecte les données de la galerie depuis le DOM ──── */
  function buildGalleryEntries() {
    var items = document.querySelectorAll('.gallery__item');
    var entries = [];

    items.forEach(function (item) {
      var img   = item.querySelector('.gallery__img-wrap img');
      var title = item.querySelector('.gallery__caption-title');
      var desc  = item.querySelector('.gallery__caption-desc');

      if (img) {
        entries.push({
          imgSrc: img.src,
          imgAlt: img.alt,
          title:  (title && title.textContent) ? title.textContent.trim() : '',
          desc:   (desc  && desc.textContent)  ? desc.textContent.trim()  : '',
        });
      }
    });

    return entries;
  }

  /* ── Initialise la lightbox ───────────────────────────── */
  function initLightbox(entries) {
    if (entries.length === 0) return;

    var overlay      = document.getElementById('lightbox');
    var lightboxImg  = overlay ? overlay.querySelector('.lightbox__img')         : null;
    var captionTitle = overlay ? overlay.querySelector('.lightbox__caption-title'): null;
    var captionDesc  = overlay ? overlay.querySelector('.lightbox__caption-desc') : null;
    var counterEl    = overlay ? overlay.querySelector('.lightbox__counter')      : null;
    var btnClose     = overlay ? overlay.querySelector('.lightbox__close')        : null;
    var btnPrev      = overlay ? overlay.querySelector('.lightbox__prev')         : null;
    var btnNext      = overlay ? overlay.querySelector('.lightbox__next')         : null;

    if (!overlay || !lightboxImg) return;

    var currentIndex = 0;

    function renderItem(index) {
      var entry = entries[index];
      if (!entry) return;
      lightboxImg.src = entry.imgSrc;
      lightboxImg.alt = entry.imgAlt;
      if (captionTitle) captionTitle.textContent = entry.title;
      if (captionDesc)  captionDesc.textContent  = entry.desc;
      if (counterEl)    counterEl.textContent     = (index + 1) + ' / ' + entries.length;
    }

    function openAt(index) {
      currentIndex = ((index % entries.length) + entries.length) % entries.length;
      renderItem(currentIndex);
      overlay.classList.add('lightbox--open');
      document.body.style.overflow = 'hidden';
      overlay.focus();
    }

    function close() {
      overlay.classList.remove('lightbox--open');
      document.body.style.overflow = '';
    }

    function prev() {
      currentIndex = (currentIndex - 1 + entries.length) % entries.length;
      renderItem(currentIndex);
    }

    function next() {
      currentIndex = (currentIndex + 1) % entries.length;
      renderItem(currentIndex);
    }

    // Clic sur les items de la galerie
    document.querySelectorAll('.gallery__item').forEach(function (item, idx) {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Agrandir : ' + (entries[idx] ? entries[idx].title : 'photo'));

      item.addEventListener('click', function () { openAt(idx); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAt(idx);
        }
      });
    });

    if (btnClose) btnClose.addEventListener('click', close);
    if (btnPrev)  btnPrev.addEventListener('click', prev);
    if (btnNext)  btnNext.addEventListener('click', next);

    // Clic sur le fond ferme
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    // Clavier
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('lightbox--open')) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    });
  }

  /* ── Scroll reveal ────────────────────────────────────── */
  function initReveal() {
    var selectors = [
      '.salle-desc__text',
      '.salle-desc__specs',
      '.equip-card',
      '.capacity-card',
      '.gallery__item',
      '.access__map',
      '.access__info',
    ];

    var delayedSelectors = ['.equip-card', '.capacity-card', '.gallery__item'];
    var entries = [];

    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, idx) {
        el.classList.add('reveal');
        var delay = delayedSelectors.indexOf(sel) !== -1 ? idx * 60 : 0;
        entries.push({ el: el, delay: delay });
      });
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (observed) {
          observed.forEach(function (entry) {
            if (entry.isIntersecting) {
              var matched = entries.find(function (r) { return r.el === entry.target; });
              if (matched) {
                setTimeout(function () {
                  matched.el.classList.add('is-visible');
                }, matched.delay);
              }
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      entries.forEach(function (item) { observer.observe(item.el); });
    } else {
      entries.forEach(function (item) { item.el.classList.add('is-visible'); });
    }
  }

  /* ── Init ─────────────────────────────────────────────── */
  var galleryEntries = buildGalleryEntries();
  initLightbox(galleryEntries);
  initReveal();

})();
