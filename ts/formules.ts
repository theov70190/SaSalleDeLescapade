/**
 * formules.ts
 * Interactions page Nos Formules :
 *   - Accordéon FAQ (ouverture / fermeture avec ARIA)
 *   - Scroll reveal
 */

(function (): void {
  'use strict';

  /* ================================================================
     ACCORDÉON FAQ
     ================================================================ */
  const faqItems = document.querySelectorAll<HTMLElement>('.faq-item');

  faqItems.forEach((item) => {
    const button = item.querySelector<HTMLButtonElement>('.faq-question');
    const answer = item.querySelector<HTMLElement>('.faq-answer');

    if (!button || !answer) return;

    // Accessibilité : ARIA initial
    button.setAttribute('aria-expanded', 'false');
    answer.setAttribute('aria-hidden', 'true');

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq-item--open');

      // Fermer tous les items ouverts
      faqItems.forEach((other) => {
        const otherBtn    = other.querySelector<HTMLButtonElement>('.faq-question');
        const otherAnswer = other.querySelector<HTMLElement>('.faq-answer');
        other.classList.remove('faq-item--open');
        otherBtn?.setAttribute('aria-expanded', 'false');
        otherAnswer?.setAttribute('aria-hidden', 'true');
      });

      // Ouvrir le courant si ce n'était pas déjà ouvert
      if (!isOpen) {
        item.classList.add('faq-item--open');
        button.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
      }
    });

    // Navigation clavier
    button.addEventListener('keydown', (e: KeyboardEvent) => {
      const allButtons = Array.from(
        document.querySelectorAll<HTMLButtonElement>('.faq-question')
      );
      const idx = allButtons.indexOf(button);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        allButtons[(idx + 1) % allButtons.length]?.focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        allButtons[(idx - 1 + allButtons.length) % allButtons.length]?.focus();
      }
      if (e.key === 'Home') {
        e.preventDefault();
        allButtons[0]?.focus();
      }
      if (e.key === 'End') {
        e.preventDefault();
        allButtons[allButtons.length - 1]?.focus();
      }
    });
  });

  /* ================================================================
     SCROLL REVEAL
     ================================================================ */
  const revealGroups: { selector: string; delayStep: number }[] = [
    { selector: '.pricing-card',  delayStep: 120 },
    { selector: '.option-card',   delayStep: 70  },
    { selector: '.faq-item',      delayStep: 50  },
    { selector: '.intro',         delayStep: 0   },
  ];

  const revealEntries: Array<{ el: HTMLElement; delay: number }> = [];

  revealGroups.forEach(({ selector, delayStep }) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((el, idx) => {
      el.classList.add('reveal');
      revealEntries.push({ el, delay: idx * delayStep });
    });
  });

  if ('IntersectionObserver' in window && revealEntries.length > 0) {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const matched = revealEntries.find((r) => r.el === entry.target);
            if (matched) {
              setTimeout(() => matched.el.classList.add('is-visible'), matched.delay);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    revealEntries.forEach(({ el }) => observer.observe(el));
  } else {
    revealEntries.forEach(({ el }) => el.classList.add('is-visible'));
  }

})();
