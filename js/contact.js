"use strict";
/**
 * contact.js — Compiled from ts/contact.ts
 * Calendrier interactif + validation formulaire
 */
(function () {
  'use strict';

  /* =====================================================
     CONFIGURATION — DATES RÉSERVÉES
     Modifiez ce tableau pour mettre à jour le calendrier.
     Format : 'AAAA-MM-JJ'   ex : '2026-07-25'
     ===================================================== */
  var RESERVED_DATES = [
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

  var MONTHS_FR = [
    'Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
  ];

  /* ── Calendrier ─────────────────────────────────────── */
  function fmt(y, m, d) {
    return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  var now          = new Date();
  var calYear      = now.getFullYear();
  var calMonth     = now.getMonth();
  var selectedDate = null;
  var reservedSet  = new Set(RESERVED_DATES);
  var todayStr     = fmt(now.getFullYear(), now.getMonth(), now.getDate());

  var gridEl       = document.getElementById('calendar-grid');
  var monthLabelEl = document.getElementById('calendar-month-label');
  var prevBtn      = document.getElementById('cal-prev');
  var nextBtn      = document.getElementById('cal-next');
  var selInfoEl    = document.getElementById('calendar-selection-info');
  var selTextEl    = document.getElementById('calendar-selection-text');
  var dateInput    = document.getElementById('field-date');

  function selectDate(dateStr, updateInput) {
    selectedDate = dateStr;

    if (updateInput !== false && dateInput) {
      dateInput.value = dateStr;
      dateInput.dispatchEvent(new Event('input'));
    }

    if (selInfoEl && selTextEl) {
      var parts = dateStr.split('-').map(Number);
      var dt    = new Date(parts[0], parts[1] - 1, parts[2]);
      selTextEl.textContent = dt.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
      selInfoEl.classList.add('is-visible');
    }
  }

  function renderCalendar() {
    if (!gridEl || !monthLabelEl) return;

    monthLabelEl.textContent = MONTHS_FR[calMonth] + ' ' + calYear;

    var todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    var isCurrentMonth = calYear === todayDate.getFullYear() && calMonth === todayDate.getMonth();
    if (prevBtn) prevBtn.disabled = isCurrentMonth;

    var daysInMonth  = new Date(calYear, calMonth + 1, 0).getDate();
    var rawFirstDay  = new Date(calYear, calMonth, 1).getDay();
    var firstWeekday = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

    var fragment = document.createDocumentFragment();

    // Cases vides
    for (var i = 0; i < firstWeekday; i++) {
      var empty = document.createElement('div');
      empty.className = 'calendar__day calendar__day--empty';
      fragment.appendChild(empty);
    }

    // Cases des jours
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr  = fmt(calYear, calMonth, d);
      var cell     = document.createElement('div');
      var dayDate  = new Date(calYear, calMonth, d);
      var isPast   = dayDate < todayDate;
      var isToday  = dateStr === todayStr;
      var isReserved = reservedSet.has(dateStr);

      var num = document.createElement('span');
      num.className   = 'calendar__day-num';
      num.textContent = String(d);
      cell.appendChild(num);

      cell.className = 'calendar__day';

      if (isPast) {
        cell.classList.add('calendar__day--past');
      } else if (isReserved) {
        cell.classList.add('calendar__day--reserved');
        cell.setAttribute('title', 'Date non disponible');
        cell.setAttribute('aria-label', d + ' ' + MONTHS_FR[calMonth] + ' — Réservé');
        cell.setAttribute('aria-disabled', 'true');
      } else {
        cell.classList.add('calendar__day--available');
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', d + ' ' + MONTHS_FR[calMonth] + ' — Disponible');

        if (dateStr === selectedDate) {
          cell.classList.add('calendar__day--selected');
        }

        (function(ds) {
          function onSelect() {
            selectedDate = ds;
            selectDate(ds);
            renderCalendar();
            if (window.innerWidth < 1024) {
              var formEl = document.getElementById('booking-form');
              if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
          cell.addEventListener('click', onSelect);
          cell.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect();
            }
          });
        })(dateStr);
      }

      if (isToday) cell.classList.add('calendar__day--today');

      fragment.appendChild(cell);
    }

    gridEl.replaceChildren(fragment);
  }

  // Navigation mois
  if (prevBtn) prevBtn.addEventListener('click', function() {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });

  if (nextBtn) nextBtn.addEventListener('click', function() {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  // Sync champ date → calendrier
  if (dateInput) {
    dateInput.addEventListener('change', function() {
      var val = dateInput.value;
      if (val && !reservedSet.has(val)) {
        selectDate(val, false);
        var parts = val.split('-').map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          calYear  = parts[0];
          calMonth = parts[1] - 1;
          renderCalendar();
        }
      }
    });
  }

  renderCalendar();

  /* ── Validation formulaire ──────────────────────────── */
  function getField(name)  { return document.getElementById('field-' + name); }
  function getError(name)  { return document.getElementById('error-' + name); }
  function getValue(name)  {
    var el = getField(name);
    return el ? el.value.trim() : '';
  }
  function isChecked(name) {
    var el = getField(name);
    return el ? el.checked : false;
  }
  function getRadioValue(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  function showError(name, msg) {
    var f = getField(name), e = getError(name);
    if (f) f.classList.add('is-error');
    if (e) { e.textContent = msg; e.classList.add('is-visible'); }
  }

  function clearError(name) {
    var f = getField(name), e = getError(name);
    if (f) f.classList.remove('is-error');
    if (e) e.classList.remove('is-visible');
  }

  function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function validatePhone(v) { return /^[\d\s+\-.()\u00A0]{8,}$/.test(v); }

  function validateForm() {
    ['prenom','nom','email','tel','event-type','date','guests','formule','rgpd'].forEach(clearError);
    var valid = true;

    if (!getValue('prenom'))   { showError('prenom',     'Veuillez saisir votre prénom.'); valid = false; }
    if (!getValue('nom'))      { showError('nom',        'Veuillez saisir votre nom.'); valid = false; }

    var email = getValue('email');
    if (!email)                { showError('email', 'Veuillez saisir votre adresse email.'); valid = false; }
    else if (!validateEmail(email)) { showError('email', "L'adresse email ne semble pas valide."); valid = false; }

    var tel = getValue('tel');
    if (tel && !validatePhone(tel)) { showError('tel', 'Le numéro de téléphone ne semble pas valide.'); valid = false; }

    if (!getValue('event-type')) { showError('event-type', "Veuillez sélectionner un type d'événement."); valid = false; }
    if (!getValue('date'))       { showError('date', 'Veuillez sélectionner ou saisir une date.'); valid = false; }

    var guests = parseInt(getValue('guests'), 10);
    if (!getValue('guests'))     { showError('guests', 'Veuillez indiquer le nombre de personnes.'); valid = false; }
    else if (isNaN(guests) || guests < 1) { showError('guests', 'Le nombre de personnes doit être au moins 1.'); valid = false; }
    else if (guests > 120)       { showError('guests', 'Notre salle accueille au maximum 120 personnes.'); valid = false; }

    if (!getRadioValue('formule')) { showError('formule', 'Veuillez choisir une formule.'); valid = false; }
    if (!isChecked('rgpd'))        { showError('rgpd',    'Vous devez accepter la politique de confidentialité.'); valid = false; }

    return valid;
  }

  // Effacer les erreurs à la saisie
  ['prenom','nom','email','tel','event-type','date','guests'].forEach(function(name) {
    var el = getField(name);
    if (el) el.addEventListener('input', function() { clearError(name); });
  });
  document.querySelectorAll('input[name="formule"]').forEach(function(radio) {
    radio.addEventListener('change', function() { clearError('formule'); });
  });
  var rgpdEl = getField('rgpd');
  if (rgpdEl) rgpdEl.addEventListener('change', function() { clearError('rgpd'); });

  // Soumission
  var form         = document.getElementById('booking-form');
  var confirmation = document.getElementById('booking-confirmation');

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (validateForm()) {
        var prenom  = getValue('prenom');
        var dateVal = getValue('date');
        var confPrenom = document.getElementById('conf-prenom');
        var confDate   = document.getElementById('conf-date');
        if (confPrenom) confPrenom.textContent = prenom;
        if (confDate && dateVal) {
          var parts = dateVal.split('-').map(Number);
          var dt    = new Date(parts[0], parts[1] - 1, parts[2]);
          confDate.textContent = dt.toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          });
        }
        form.style.display = 'none';
        if (confirmation) {
          confirmation.classList.add('is-visible');
          confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        var firstError = document.querySelector('.form-error.is-visible');
        if (firstError) {
          var group = firstError.closest('.form-group');
          if (group) group.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

})();
