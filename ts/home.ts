/**
 * home.ts
 * Interactions spécifiques à la page Accueil :
 *   - Compteurs animés pour les chiffres clés (scroll-triggered)
 *   - Révélation des cartes et témoignages au défilement
 */

(function (): void {
  'use strict';

  /* ── Utilitaires ────────────────────────────────────────── */

  /**
   * Anime un compteur numérique de 0 vers `target` sur `duration` ms.
   * Utilise une courbe ease-out cubique pour un rendu naturel.
   */
  function animateCounter(el: HTMLElement, target: number, duration: number): void {
    const startTime = performance.now();

    function tick(now: number): void {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubique
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('fr-FR');
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  /* ── Compteurs des stats ────────────────────────────────── */
  const statNumbers = document.querySelectorAll<HTMLElement>('.stats__number[data-target]');

  if (statNumbers.length > 0) {
    if ('IntersectionObserver' in window) {
      const statsObserver = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el     = entry.target as HTMLElement;
              const target = parseInt(el.dataset['target'] ?? '0', 10);
              animateCounter(el, target, 1600);
              statsObserver.unobserve(el);
            }
          });
        },
        { threshold: 0.6 }
      );

      statNumbers.forEach((el) => statsObserver.observe(el));
    } else {
      // Fallback : affichage direct sans animation
      statNumbers.forEach((el) => {
        const target = parseInt(el.dataset['target'] ?? '0', 10);
        el.textContent = target.toLocaleString('fr-FR');
      });
    }
  }

  /* ── Révélation au défilement ───────────────────────────── */
  type RevealEntry = { el: HTMLElement; delay: number };

  const revealGroups: { selector: string; delayStep: number }[] = [
    { selector: '.stats__item',        delayStep: 80  },
    { selector: '.event-card',         delayStep: 100 },
    { selector: '.testimonial-card',   delayStep: 120 },
    { selector: '.cta-banner__content, .cta-banner__actions', delayStep: 100 },
  ];

  const revealEntries: RevealEntry[] = [];

  revealGroups.forEach(({ selector, delayStep }) => {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    elements.forEach((el, index) => {
      el.classList.add('reveal');
      revealEntries.push({ el, delay: index * delayStep });
    });
  });

  if ('IntersectionObserver' in window && revealEntries.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const matched = revealEntries.find((r) => r.el === entry.target);
            if (matched) {
              setTimeout(() => {
                matched.el.classList.add('is-visible');
              }, matched.delay);
            }
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    revealEntries.forEach(({ el }) => revealObserver.observe(el));
  } else {
    // Fallback : tout visible immédiatement
    revealEntries.forEach(({ el }) => el.classList.add('is-visible'));
  }

})();
