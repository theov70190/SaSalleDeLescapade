"use strict";
/**
 * home.js — Compiled from ts/home.ts
 * Compteurs animés + révélation au défilement pour la page Accueil
 */
(function () {
  'use strict';

  /* ── Compteur animé ease-out cubique ─────────────────────── */
  function animateCounter(el, target, duration) {
    const startTime = performance.now();

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('fr-FR');
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  /* ── Compteurs des stats (déclenchés au scroll) ────────────── */
  const statNumbers = document.querySelectorAll('.stats__number[data-target]');

  if (statNumbers.length > 0) {
    if ('IntersectionObserver' in window) {
      const statsObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              const el     = entry.target;
              const target = parseInt(el.dataset['target'] || '0', 10);
              animateCounter(el, target, 1600);
              statsObserver.unobserve(el);
            }
          });
        },
        { threshold: 0.6 }
      );

      statNumbers.forEach(function (el) { statsObserver.observe(el); });

    } else {
      // Fallback sans IntersectionObserver
      statNumbers.forEach(function (el) {
        const target = parseInt(el.dataset['target'] || '0', 10);
        el.textContent = target.toLocaleString('fr-FR');
      });
    }
  }

  /* ── Révélation au scroll (scroll reveal) ──────────────────── */
  const revealGroups = [
    { selector: '.stats__item',       delayStep: 80  },
    { selector: '.event-card',        delayStep: 100 },
    { selector: '.testimonial-card',  delayStep: 120 },
    { selector: '.cta-banner__content', delayStep: 0   },
    { selector: '.cta-banner__actions', delayStep: 100 },
  ];

  const revealEntries = [];

  revealGroups.forEach(function (group) {
    const elements = document.querySelectorAll(group.selector);
    elements.forEach(function (el, index) {
      el.classList.add('reveal');
      revealEntries.push({ el: el, delay: index * group.delayStep });
    });
  });

  if ('IntersectionObserver' in window && revealEntries.length > 0) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const matched = revealEntries.find(function (r) { return r.el === entry.target; });
            if (matched) {
              setTimeout(function () {
                matched.el.classList.add('is-visible');
              }, matched.delay);
            }
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    revealEntries.forEach(function (item) { revealObserver.observe(item.el); });

  } else {
    // Fallback : tout visible immédiatement
    revealEntries.forEach(function (item) { item.el.classList.add('is-visible'); });
  }

})();
