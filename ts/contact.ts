/**
 * contact.ts
 * Interactions page Contact & Réservation :
 *   - Calendrier interactif avec dates disponibles / réservées
 *   - Synchronisation sélection calendrier → champ date du formulaire
 *   - Validation complète du formulaire
 *   - Message de confirmation simulé
 */

(function (): void {
  'use strict';

  /* ================================================================
     CONFIGURATION — DATES RÉSERVÉES
     Modifiez ce tableau pour mettre à jour le calendrier.
     Format : 'AAAA-MM-JJ'   ex : '2026-07-25'
     ================================================================ */
  const RESERVED_DATES: string[] = [
    '2026-07-18',
    '2026-07-19',
    '2026-07-20',
    '2026-07-25',
    '2026-07-26',
    '2026-08-01',
    '2026-08-07',
    '2026-08-08',
    '2026-08-15',
    '2026-08-22',
    '2026-08-23',
    '2026-09-05',
    '2026-09-12',
    '2026-09-13',
    '2026-09-19',
    '2026-09-26',
    '2026-09-27',
    '2026-10-03',
    '2026-10-10',
    '2026-10-17',
  ];

  /* ================================================================
     CALENDRIER
     ================================================================ */
  const MONTHS_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  const WEEKDAYS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  class EventCalendar {
    private year:         number;
    private month:        number;
    private selectedDate: string | null = null;
    private reserved:     Set<string>;
    private today:        string;

    private gridEl:       HTMLElement | null;
    private monthLabelEl: HTMLElement | null;
    private prevBtn:      HTMLButtonElement | null;
    private nextBtn:      HTMLButtonElement | null;
    private selInfoEl:    HTMLElement | null;
    private selTextEl:    HTMLElement | null;
    private dateInput:    HTMLInputElement | null;

    constructor() {
      const now    = new Date();
      this.year    = now.getFullYear();
      this.month   = now.getMonth();
      this.today   = this.fmt(now.getFullYear(), now.getMonth(), now.getDate());
      this.reserved = new Set(RESERVED_DATES);

      this.gridEl       = document.getElementById('calendar-grid');
      this.monthLabelEl = document.getElementById('calendar-month-label');
      this.prevBtn      = document.getElementById('cal-prev') as HTMLButtonElement | null;
      this.nextBtn      = document.getElementById('cal-next') as HTMLButtonElement | null;
      this.selInfoEl    = document.getElementById('calendar-selection-info');
      this.selTextEl    = document.getElementById('calendar-selection-text');
      this.dateInput    = document.getElementById('field-date') as HTMLInputElement | null;

      this.prevBtn?.addEventListener('click', () => this.navigate(-1));
      this.nextBtn?.addEventListener('click', () => this.navigate(1));

      // Sync depuis le champ date vers le calendrier
      this.dateInput?.addEventListener('change', () => {
        const val = this.dateInput?.value ?? '';
        if (val && !this.reserved.has(val)) {
          this.selectDate(val, false);
          const [y, m] = val.split('-').map(Number);
          if (!isNaN(y) && !isNaN(m)) {
            this.year  = y;
            this.month = m - 1;
            this.render();
          }
        }
      });

      this.render();
    }

    private fmt(y: number, m: number, d: number): string {
      return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    private navigate(dir: number): void {
      this.month += dir;
      if (this.month > 11) { this.month = 0;  this.year++; }
      if (this.month < 0)  { this.month = 11; this.year--; }
      this.render();
    }

    private selectDate(dateStr: string, updateInput = true): void {
      this.selectedDate = dateStr;

      if (updateInput && this.dateInput) {
        this.dateInput.value = dateStr;
        this.dateInput.dispatchEvent(new Event('input'));
      }

      // Afficher l'info de sélection
      if (this.selInfoEl && this.selTextEl) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dt   = new Date(y, m - 1, d);
        const opts: Intl.DateTimeFormatOptions = {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        };
        this.selTextEl.textContent = dt.toLocaleDateString('fr-FR', opts);
        this.selInfoEl.classList.add('is-visible');
      }
    }

    render(): void {
      if (!this.gridEl || !this.monthLabelEl) return;

      // Label mois/année
      this.monthLabelEl.textContent = `${MONTHS_FR[this.month]} ${this.year}`;

      // Désactiver le bouton "mois précédent" si c'est le mois courant
      const now = new Date();
      if (this.prevBtn) {
        const isCurrentMonth = this.year === now.getFullYear() && this.month === now.getMonth();
        this.prevBtn.disabled = isCurrentMonth;
      }

      // Calculs du mois
      const daysInMonth   = new Date(this.year, this.month + 1, 0).getDate();
      const rawFirstDay   = new Date(this.year, this.month, 1).getDay();
      // Convertir dimanche=0 en lundi=0
      const firstWeekday  = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const fragment = document.createDocumentFragment();

      // Cases vides avant le 1er jour
      for (let i = 0; i < firstWeekday; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar__day calendar__day--empty';
        fragment.appendChild(empty);
      }

      // Cases des jours
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = this.fmt(this.year, this.month, d);
        const cell    = document.createElement('div');
        const dayDate = new Date(this.year, this.month, d);
        const isPast  = dayDate < todayDate;
        const isToday = dateStr === this.today;

        const num = document.createElement('span');
        num.className   = 'calendar__day-num';
        num.textContent = String(d);
        cell.appendChild(num);

        cell.className = 'calendar__day';

        if (isPast) {
          cell.classList.add('calendar__day--past');
        } else if (this.reserved.has(dateStr)) {
          cell.classList.add('calendar__day--reserved');
          cell.setAttribute('title', 'Date non disponible');
          cell.setAttribute('aria-label', `${d} ${MONTHS_FR[this.month]} — Réservé`);
          cell.setAttribute('aria-disabled', 'true');
        } else {
          cell.classList.add('calendar__day--available');
          cell.setAttribute('role', 'button');
          cell.setAttribute('tabindex', '0');
          cell.setAttribute('aria-label', `${d} ${MONTHS_FR[this.month]} — Disponible, cliquer pour sélectionner`);

          if (dateStr === this.selectedDate) {
            cell.classList.add('calendar__day--selected');
          }

          const onSelect = () => {
            this.selectedDate = dateStr;
            this.selectDate(dateStr);
            this.render();

            // Scroll vers le formulaire sur mobile
            const formEl = document.getElementById('booking-form');
            if (formEl && window.innerWidth < 1024) {
              formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          };

          cell.addEventListener('click', onSelect);
          cell.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect();
            }
          });
        }

        if (isToday) {
          cell.classList.add('calendar__day--today');
        }

        fragment.appendChild(cell);
      }

      this.gridEl.replaceChildren(fragment);
    }
  }

  /* ================================================================
     VALIDATION DU FORMULAIRE
     ================================================================ */
  type FieldName = 'prenom' | 'nom' | 'email' | 'tel' | 'event-type' | 'date' | 'guests' | 'formule' | 'rgpd';

  function getField(name: string): HTMLElement | null {
    return document.getElementById(`field-${name}`);
  }

  function getError(name: string): HTMLElement | null {
    return document.getElementById(`error-${name}`);
  }

  function showError(name: FieldName, message: string): void {
    const field = getField(name);
    const error = getError(name);
    field?.classList.add('is-error');
    if (error) {
      error.textContent = message;
      error.classList.add('is-visible');
    }
  }

  function clearError(name: FieldName): void {
    const field = getField(name);
    const error = getError(name);
    field?.classList.remove('is-error');
    error?.classList.remove('is-visible');
  }

  function getValue(name: string): string {
    return (document.getElementById(`field-${name}`) as HTMLInputElement | null)?.value.trim() ?? '';
  }

  function isChecked(name: string): boolean {
    return (document.getElementById(`field-${name}`) as HTMLInputElement | null)?.checked ?? false;
  }

  function getRadioValue(name: string): string {
    const checked = document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
    return checked?.value ?? '';
  }

  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function validatePhone(tel: string): boolean {
    return /^[\d\s\+\-\.()]{8,}$/.test(tel);
  }

  function validateForm(): boolean {
    const fields: FieldName[] = ['prenom', 'nom', 'email', 'tel', 'event-type', 'date', 'guests', 'formule', 'rgpd'];
    fields.forEach((f) => clearError(f));

    let valid = true;

    if (!getValue('prenom')) {
      showError('prenom', 'Veuillez saisir votre prénom.');
      valid = false;
    }

    if (!getValue('nom')) {
      showError('nom', 'Veuillez saisir votre nom.');
      valid = false;
    }

    const email = getValue('email');
    if (!email) {
      showError('email', 'Veuillez saisir votre adresse email.');
      valid = false;
    } else if (!validateEmail(email)) {
      showError('email', 'L\'adresse email ne semble pas valide.');
      valid = false;
    }

    const tel = getValue('tel');
    if (tel && !validatePhone(tel)) {
      showError('tel', 'Le numéro de téléphone ne semble pas valide.');
      valid = false;
    }

    if (!getValue('event-type')) {
      showError('event-type', 'Veuillez sélectionner un type d\'événement.');
      valid = false;
    }

    if (!getValue('date')) {
      showError('date', 'Veuillez sélectionner ou saisir une date.');
      valid = false;
    }

    const guests = parseInt(getValue('guests'), 10);
    if (!getValue('guests')) {
      showError('guests', 'Veuillez indiquer le nombre de personnes.');
      valid = false;
    } else if (isNaN(guests) || guests < 1) {
      showError('guests', 'Le nombre de personnes doit être au moins 1.');
      valid = false;
    } else if (guests > 60) {
      showError('guests', 'Notre salle accueille au maximum 60 personnes.');
      valid = false;
    }

    if (!getRadioValue('formule')) {
      showError('formule', 'Veuillez choisir une formule.');
      valid = false;
    }

    if (!isChecked('rgpd')) {
      showError('rgpd', 'Vous devez accepter la politique de confidentialité.');
      valid = false;
    }

    return valid;
  }

  /* ── Effacer les erreurs à la saisie ── */
  const fieldNames: FieldName[] = ['prenom', 'nom', 'email', 'tel', 'event-type', 'date', 'guests'];
  fieldNames.forEach((name) => {
    getField(name)?.addEventListener('input', () => clearError(name));
  });
  document.querySelectorAll<HTMLInputElement>('input[name="formule"]').forEach((radio) => {
    radio.addEventListener('change', () => clearError('formule'));
  });

  /* ── Soumission ── */
  const form         = document.getElementById('booking-form') as HTMLFormElement | null;
  const confirmation = document.getElementById('booking-confirmation');

  form?.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulation d'envoi — remplacer par un vrai appel API
      const prenom = getValue('prenom');
      const dateVal = getValue('date');

      const confPrenom = document.getElementById('conf-prenom');
      const confDate   = document.getElementById('conf-date');

      if (confPrenom) confPrenom.textContent = prenom;
      if (confDate && dateVal) {
        const [y, m, d] = dateVal.split('-').map(Number);
        const dt   = new Date(y, m - 1, d);
        const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        confDate.textContent = dt.toLocaleDateString('fr-FR', opts);
      }

      form.style.display     = 'none';
      if (confirmation) {
        confirmation.classList.add('is-visible');
        confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Scroll vers la première erreur
      const firstError = document.querySelector<HTMLElement>('.form-error.is-visible');
      firstError?.closest('.form-group')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  /* ================================================================
     INIT
     ================================================================ */
  new EventCalendar();

})();
