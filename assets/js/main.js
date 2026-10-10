import { SUBMIT_ENDPOINT, EVENT_ID } from './config.js?v=20261010000410';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- the event, once ---------- */
const EVENT = {
  id: EVENT_ID,
  title: 'MAKE.EXE VIP Access',
  by: 'Huge × DDX',
  start: '2026-10-06T16:30:00',
  end: '2026-10-06T17:45:00',
  venue: 'SHiFT Midtown',
  address: '330 W 38th St, New York, NY 10018',
  lede: 'The VIP experience before MAKE.EXE, Huge\'s live GenAI creative battle. Private reception on the mezzanine 4:30–5:45 PM; general doors downstairs at 5:00; the competition starts at 6:00 PM.',
};

function ics(e) {
  const stamp = (s) => s.replace(/[-:]/g, '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DDX//MAKE.EXE VIP//EN', 'BEGIN:VEVENT',
    `UID:${e.id}-2026@ddxconference.com`,
    `DTSTART;TZID=America/New_York:${stamp(e.start)}`,
    `DTEND;TZID=America/New_York:${stamp(e.end)}`,
    `SUMMARY:${e.title} · ${e.by}`,
    `LOCATION:${e.venue}, ${e.address}`,
    `DESCRIPTION:${e.lede}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}
const calHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics(EVENT))}`;
$('#heroCal').href = calHref;
$('#doneCal').href = calHref;

/* ---------- scroll reveals ----------
   Every section's direct children rise in as they arrive; the hero has its
   own choreography and is left alone. */
const revealables = [
  ...$$('.keyart, .split__lead, .split__body, .gallery figure'),
  ...$$('#evening .section__head, .timeline li, .expect article, .shots'),
  ...$$('.room__in > *'),
  ...$$('.brands .section__head, .wall, .more'),
  ...$$('#rsvp .section__head, .signup'),
];
revealables.forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', `${(i % 4) * 70}ms`); });
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
revealables.forEach((el) => io.observe(el));

/* ---------- the form ---------- */
const form = $('#signup');
const submitBtn = $('#submitBtn');
const submitLabel = $('#submitLabel');
const barBtn = $('#barBtn');
const status = $('#status');
const bar = $('#bar');

/* The CTA lights up the moment the form could be sent. */
function readiness() {
  const ok = form.checkValidity();
  submitBtn.classList.toggle('attention', ok);
  barBtn.classList.toggle('attention', ok);
}
form.addEventListener('input', readiness);

/* The phone bar's button is the same submit, from outside the form. */
barBtn.addEventListener('click', () => {
  if (!form.checkValidity()) {
    $('#rsvp').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => form.reportValidity(), 500);
    return;
  }
  form.requestSubmit();
});

const payload = () => {
  const f = new FormData(form);
  return {
    events: [EVENT.id],
    name: f.get('name').trim(),
    email: f.get('email').trim(),
    role: f.get('role').trim(),
    company: f.get('company').trim(),
    country: '',
    phone: '',
    ticket: false,
    notes: (f.get('dietary') || '').trim(),
    submittedAt: new Date().toISOString(),
    page: location.href,
  };
};

async function send(data) {
  if (!SUBMIT_ENDPOINT) {
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, preview: true };
  }
  const res = await fetch(SUBMIT_ENDPOINT, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `The server answered ${res.status}.`);
  return body;
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  if (!form.reportValidity()) return;
  const data = payload();
  [submitBtn, barBtn].forEach((b) => { b.disabled = true; b.classList.add('is-busy'); b.classList.remove('attention'); });
  submitLabel.textContent = 'Saving…';
  barBtn.textContent = 'Saving…';
  status.hidden = true;
  try {
    const r = await send(data);
    done(data, r);
  } catch (err) {
    status.hidden = false;
    status.textContent = `Couldn’t save that — ${err.message} Your answers are still here; try again in a moment.`;
    [submitBtn, barBtn].forEach((b) => { b.disabled = false; b.classList.remove('is-busy'); });
    submitLabel.textContent = 'Accept the invitation';
    barBtn.textContent = 'Accept the invitation';
    readiness();
  }
});

function done(data, r) {
  $('#doneName').textContent = data.name.split(' ')[0] || 'you';
  $('#doneMail').textContent = data.email;
  $('#donePreview').hidden = !r.preview;
  $('#formWrap').hidden = true;
  bar.hidden = true;
  document.body.classList.remove('has-bar');
  const doneEl = $('#done');
  doneEl.hidden = false;
  doneEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- ready ---------- */
if (!SUBMIT_ENDPOINT) $('#previewBar').hidden = false;
document.body.classList.add('has-bar');
const hero = $('.hero__img');
Promise.all([document.fonts.ready, hero.complete ? Promise.resolve() : new Promise((r) => { hero.onload = r; hero.onerror = r; })])
  .then(() => document.body.classList.add('ready'));
