"use strict";
/**
 * formules.js — Compiled from ts/formules.ts
 * Accordéon FAQ + scroll reveal
 */
(function () {
  'use strict';

  /* ── Accordéon FAQ ───────────────────────────────────────── */
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var button = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');

    if (!button || !answer) return;

    button.setAttribute('aria-expanded', 'false');
    answer.setAttribute('aria-hidden', 'true');

    button.addEventListener('click', function () {
      var isOpen = item.classList.contains('faq-item--open');

      // Fermer tous
      faqItems.forEach(function (other) {
        var otherBtn    = other.querySelector('.faq-question');
        var otherAnswer = other.querySelector('.faq-answer');
        other.classList.remove('faq-item--open');
        if (otherBtn)    otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.setAttribute('aria-hidden', 'true');
      });

      // Ouvrir si pas encore ouvert
      if (!isOpen) {
        item.classList.add('faq-item--open');
        button.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
      }
    });

    // Navigation clavier dans la FAQ
    button.addEventListener('keydown', function (e) {
      var allButtons = Array.from(document.querySelectorAll('.faq-question'));
      var idx = allButtons.indexOf(button);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        var next = allButtons[(idx + 1) % allButtons.length];
        if (next) next.focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = allButtons[(idx - 1 + allButtons.length) % allButtons.length];
        if (prev) prev.focus();
      }
      if (e.key === 'Home') {
        e.preventDefault();
        if (allButtons[0]) allButtons[0].focus();
      }
      if (e.key === 'End') {
        e.preventDefault();
        var last = allButtons[allButtons.length - 1];
        if (last) last.focus();
      }
    });
  });

  /* ── Scroll reveal ────────────────────────────────────────── */
  var revealGroups = [
    { selector: '.pricing-card', delayStep: 120 },
    { selector: '.option-card',  delayStep: 70  },
    { selector: '.faq-item',     delayStep: 50  },
    { selector: '.intro',        delayStep: 0   },
  ];

  var revealEntries = [];

  revealGroups.forEach(function (group) {
    document.querySelectorAll(group.selector).forEach(function (el, idx) {
      el.classList.add('reveal');
      revealEntries.push({ el: el, delay: idx * group.delayStep });
    });
  });

  if ('IntersectionObserver' in window && revealEntries.length > 0) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var matched = revealEntries.find(function (r) { return r.el === entry.target; });
            if (matched) {
              setTimeout(function () { matched.el.classList.add('is-visible'); }, matched.delay);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    revealEntries.forEach(function (item) { observer.observe(item.el); });
  } else {
    revealEntries.forEach(function (item) { item.el.classList.add('is-visible'); });
  }

})();
