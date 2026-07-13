/**
 * global.ts
 * Comportements communs à toutes les pages :
 *   - Ombre sur la navbar au défilement
 *   - Menu burger responsive (ouverture / fermeture)
 *   - Fermeture par touche Échap, clic extérieur, redimensionnement
 */

(function (): void {
  'use strict';

  /* ── Sélecteurs ─────────────────────────────────────────── */
  const navbar  = document.getElementById('navbar')        as HTMLElement     | null;
  const burger  = document.getElementById('navbar-burger') as HTMLButtonElement | null;
  const navMenu = document.getElementById('navbar-nav')    as HTMLElement     | null;

  /* ── Ombre au scroll ────────────────────────────────────── */
  function handleScroll(): void {
    if (!navbar) return;
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Appel initial pour les pages rechargées avec ancre
  handleScroll();

  /* ── Menu burger ────────────────────────────────────────── */
  function openMenu(): void {
    if (!burger || !navMenu) return;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    navMenu.classList.add('navbar__nav--open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu(): void {
    if (!burger || !navMenu) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    navMenu.classList.remove('navbar__nav--open');
    document.body.style.overflow = '';
  }

  function isMenuOpen(): boolean {
    return burger?.getAttribute('aria-expanded') === 'true';
  }

  function toggleMenu(): void {
    isMenuOpen() ? closeMenu() : openMenu();
  }

  // Clic sur le burger
  burger?.addEventListener('click', toggleMenu);

  // Fermeture sur clic d'un lien de navigation
  navMenu?.querySelectorAll<HTMLAnchorElement>('.navbar__link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Fermeture sur clic en dehors de la navbar
  document.addEventListener('click', (event: MouseEvent) => {
    if (isMenuOpen() && !navbar?.contains(event.target as Node)) {
      closeMenu();
    }
  });

  // Fermeture avec la touche Échap
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isMenuOpen()) {
      closeMenu();
      burger?.focus();
    }
  });

  // Fermeture au passage sur desktop (évite un menu ouvert fantôme)
  window.matchMedia('(min-width: 769px)').addEventListener(
    'change',
    (event: MediaQueryListEvent) => {
      if (event.matches) closeMenu();
    }
  );

})();
