/**
 * salle.ts
 * Interactions page La Salle :
 *   - Lightbox pour la galerie photos
 *   - Scroll reveal sur les sections
 */

(function (): void {
  'use strict';

  /* ================================================================
     LIGHTBOX
     ================================================================ */

  interface GalleryEntry {
    imgSrc:    string;
    imgAlt:    string;
    title:     string;
    desc:      string;
  }

  // Collecte les données de la galerie depuis le DOM
  function buildGalleryEntries(): GalleryEntry[] {
    const items = document.querySelectorAll<HTMLElement>('.gallery__item');
    const entries: GalleryEntry[] = [];

    items.forEach((item) => {
      const img     = item.querySelector<HTMLImageElement>('.gallery__img-wrap img');
      const title   = item.querySelector<HTMLElement>('.gallery__caption-title');
      const desc    = item.querySelector<HTMLElement>('.gallery__caption-desc');

      if (img) {
        entries.push({
          imgSrc: img.src,
          imgAlt: img.alt,
          title:  title?.textContent?.trim() ?? '',
          desc:   desc?.textContent?.trim()  ?? '',
        });
      }
    });

    return entries;
  }

  // Initialise la lightbox
  function initLightbox(entries: GalleryEntry[]): void {
    if (entries.length === 0) return;

    const overlay       = document.getElementById('lightbox')                           as HTMLElement      | null;
    const lightboxImg   = overlay?.querySelector<HTMLImageElement>('.lightbox__img')    ?? null;
    const captionTitle  = overlay?.querySelector<HTMLElement>('.lightbox__caption-title') ?? null;
    const captionDesc   = overlay?.querySelector<HTMLElement>('.lightbox__caption-desc')  ?? null;
    const counterEl     = overlay?.querySelector<HTMLElement>('.lightbox__counter')     ?? null;
    const btnClose      = overlay?.querySelector<HTMLButtonElement>('.lightbox__close') ?? null;
    const btnPrev       = overlay?.querySelector<HTMLButtonElement>('.lightbox__prev')  ?? null;
    const btnNext       = overlay?.querySelector<HTMLButtonElement>('.lightbox__next')  ?? null;

    if (!overlay || !lightboxImg) return;

    let currentIndex = 0;

    function renderItem(index: number): void {
      const entry = entries[index];
      if (!entry || !lightboxImg) return;

      lightboxImg.src = entry.imgSrc;
      lightboxImg.alt = entry.imgAlt;
      if (captionTitle) captionTitle.textContent = entry.title;
      if (captionDesc)  captionDesc.textContent  = entry.desc;
      if (counterEl)    counterEl.textContent     = `${index + 1} / ${entries.length}`;
    }

    function openAt(index: number): void {
      currentIndex = ((index % entries.length) + entries.length) % entries.length;
      renderItem(currentIndex);
      overlay.classList.add('lightbox--open');
      document.body.style.overflow = 'hidden';
      overlay.focus();
    }

    function close(): void {
      overlay.classList.remove('lightbox--open');
      document.body.style.overflow = '';
    }

    function prev(): void {
      currentIndex = (currentIndex - 1 + entries.length) % entries.length;
      renderItem(currentIndex);
    }

    function next(): void {
      currentIndex = (currentIndex + 1) % entries.length;
      renderItem(currentIndex);
    }

    // Clic sur les items de la galerie
    document.querySelectorAll<HTMLElement>('.gallery__item').forEach((item, idx) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `Agrandir : ${entries[idx]?.title ?? 'photo'}`);

      item.addEventListener('click', () => openAt(idx));
      item.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAt(idx);
        }
      });
    });

    // Boutons de la lightbox
    btnClose?.addEventListener('click', close);
    btnPrev?.addEventListener('click', prev);
    btnNext?.addEventListener('click', next);

    // Clic sur l'overlay (fond) ferme la lightbox
    overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === overlay) close();
    });

    // Clavier
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!overlay.classList.contains('lightbox--open')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    });
  }

  /* ================================================================
     SCROLL REVEAL
     ================================================================ */
  function initReveal(): void {
    const selectors = [
      '.salle-desc__text',
      '.salle-desc__specs',
      '.equip-card',
      '.capacity-card',
      '.gallery__item',
      '.access__map',
      '.access__info',
    ];

    const entries: Array<{ el: HTMLElement; delay: number }> = [];
    const delayedSelectors = ['.equip-card', '.capacity-card', '.gallery__item'];

    selectors.forEach((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach((el, idx) => {
        el.classList.add('reveal');
        const delay = delayedSelectors.includes(sel) ? idx * 60 : 0;
        entries.push({ el, delay });
      });
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (observed: IntersectionObserverEntry[]) => {
          observed.forEach((entry) => {
            if (entry.isIntersecting) {
              const matched = entries.find((r) => r.el === entry.target);
              if (matched) {
                setTimeout(() => matched.el.classList.add('is-visible'), matched.delay);
              }
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      entries.forEach(({ el }) => observer.observe(el));
    } else {
      entries.forEach(({ el }) => el.classList.add('is-visible'));
    }
  }

  /* ================================================================
     INIT
     ================================================================ */
  const galleryEntries = buildGalleryEntries();
  initLightbox(galleryEntries);
  initReveal();

})();
