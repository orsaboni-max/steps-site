(function () {
  'use strict';
  // Both Arbox routes use the same class ID; only the trial filter changes.
  function regularUrl(href) {
    var url = new URL(href);
    if (url.hostname.toLowerCase() !== 'bp4jsudd1589999012.web.arboxapp.com') return null;
    if (!/^\/group(?:\/(?:trial\/)?\d+)?\/?$/.test(url.pathname)) return null;
    url.pathname = url.pathname.replace('/group/trial/', '/group/');
    var filters = JSON.parse(url.searchParams.get('filters') || '{}');
    delete filters.trial;
    url.searchParams.set('filters', JSON.stringify(filters));
    return url.toString();
  }
  if (typeof module === 'object' && module.exports) { module.exports = regularUrl; return; }
  if (!HTMLDialogElement.prototype.showModal) return;

  var dialog = document.createElement('dialog');
  dialog.className = 'booking-choice';
  dialog.dir = 'rtl';
  dialog.setAttribute('aria-labelledby', 'booking-title');
  dialog.setAttribute('aria-describedby', 'booking-note');
  dialog.innerHTML = '<button class="booking-close" type="button" aria-label="סגירת אפשרויות ההרשמה">×</button>' +
    '<p class="booking-eyebrow">האימון הבא שלך ב־STEPS</p><h2 id="booking-title">איך תרצי להגיע?</h2>' +
    '<p id="booking-note">היכרות ראשונה או עוד אימון? בחרי את האפשרות שמתאימה לך.</p>' +
    '<a class="booking-option booking-trial" data-booking-choice="trial"><strong>זו הפעם הראשונה שלי <span>50 ₪</span></strong><small>אימון היכרות אחד בלבד · ללא התחייבות למנוי</small></a>' +
    '<a class="booking-option booking-regular" data-booking-choice="regular" data-track="arbox-open"><strong>כבר התאמנתי ב־STEPS <span>70 ₪</span></strong><small>אימון חד־פעמי · GYM, בר ופילאטיס מכשירים</small></a>' +
    '<p class="booking-footnote">המחירים כוללים מע״מ. הרשמה ותשלום במערכת Arbox.<br>יש לך מנוי או כרטיסייה? התחברי בארבוקס והשתמשי בהם.</p>';
  document.body.appendChild(dialog);
  var trial = dialog.querySelector('.booking-trial');
  var regular = dialog.querySelector('.booking-regular');
  dialog.querySelector('button').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

  // Capture before existing click measurement: choosing a route is the actual outbound click.
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href]');
    if (!link || link.hasAttribute('data-booking-choice') || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var href = link.href, url, next;
    try {
      url = new URL(href);
      if (JSON.parse(url.searchParams.get('filters') || '{}').trial !== 'trial') return;
      next = regularUrl(href);
    } catch (_) { return; }
    if (!next) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    // A direct class trial has its own Arbox route, not just a query filter.
    if (/^\/group\/\d+\/?$/.test(url.pathname)) url.pathname = url.pathname.replace('/group/', '/group/trial/');
    trial.href = url.toString();
    regular.href = next;
    trial.setAttribute('data-track', 'trial-cta arbox-open');
    [trial, regular].forEach(function (a) {
      if (matchMedia('(max-width:768px)').matches) a.removeAttribute('target');
      else a.target = '_blank';
      a.rel = 'noopener';
    });
    dialog.showModal();
  }, true);

  // Keep the returning-client option visible next to the live timetable.
  var schedule = document.getElementById('sched');
  if (schedule) {
    var title = schedule.querySelector('h2');
    if (title) {
      var note = document.createElement('p');
      note.className = 'booking-schedule-note';
      note.textContent = 'היכרות ראשונה · 50 ₪ פעם אחת. כבר התאמנת? אימון חד־פעמי · 70 ₪. בחרי שיעור כדי להמשיך.';
      title.insertAdjacentElement('afterend', note);
    }
  }
})();
