"use strict";
/**
 * global.js — Compiled from ts/global.ts
 * Comportements communs : navbar scroll shadow + burger menu responsive
 */
(function () {
  'use strict';

  const navbar  = document.getElementById('navbar');
  const burger  = document.getElementById('navbar-burger');
  const navMenu = document.getElementById('navbar-nav');

  /* ── Ombre au scroll ──────────────────────────────────────── */
  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── Menu burger ──────────────────────────────────────────── */
  function openMenu() {
    if (!burger || !navMenu) return;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    navMenu.classList.add('navbar__nav--open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!burger || !navMenu) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    navMenu.classList.remove('navbar__nav--open');
    document.body.style.overflow = '';
  }

  function isMenuOpen() {
    return (burger === null || burger === void 0 ? void 0 : burger.getAttribute('aria-expanded')) === 'true';
  }

  function toggleMenu() {
    isMenuOpen() ? closeMenu() : openMenu();
  }

  // Clic sur le burger
  if (burger) burger.addEventListener('click', toggleMenu);

  // Fermeture sur clic d'un lien de navigation
  if (navMenu) {
    navMenu.querySelectorAll('.navbar__link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // Fermeture sur clic extérieur
  document.addEventListener('click', function (event) {
    if (isMenuOpen() && navbar && !navbar.contains(event.target)) {
      closeMenu();
    }
  });

  // Fermeture avec Échap
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isMenuOpen()) {
      closeMenu();
      if (burger) burger.focus();
    }
  });

  // Fermeture au passage sur desktop
  window.matchMedia('(min-width: 769px)').addEventListener('change', function (event) {
    if (event.matches) closeMenu();
  });

})();
