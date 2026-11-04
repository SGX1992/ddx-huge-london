import { SUBMIT_ENDPOINT, LONDON_EVENT_ID } from './config.js?v=20261104034705';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- the event ----------
   Venue changed 17 October 2026 (Huge's decision): Tavern, 374-378 Old
   Street, Shoreditch (it was Spring at Somerset House). Time moved 7:30 → 7:00 PM
   on 29 October 2026; the three-hour length was kept, so the calendar file now
   blocks 19:00–22:00 London time. */
const EVENT = {
  id: LONDON_EVENT_ID,
  title: 'VIP Dinner Roundtable',
  by: 'Huge \u00d7 DDX',
  start: '2026-11-19T19:00:00',
  end: '2026-11-19T22:00:00',
  venue: 'Tavern, Old Street',
  address: 'Tavern, 374-378 Old Street, London EC1V 9LT',
  lede: 'A private dinner and roundtable with Huge and DDX for 15 brand, innovation and design leaders, the night before DDX London.',
};

function ics(e) {
  const stamp = (s) => s.replace(/[-:]/g, '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DDX//Huge London dinner//EN', 'BEGIN:VEVENT',
    `UID:${e.id}-2026@ddxconference.com`,
    `DTSTART;TZID=Europe/London:${stamp(e.start)}`,
    `DTEND;TZID=Europe/London:${stamp(e.end)}`,
    `SUMMARY:${e.title} \u00b7 ${e.by}`,
    `LOCATION:${e.address}`,
    `DESCRIPTION:${e.lede}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}
const calHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics(EVENT))}`;
/* Den Kalenderknopf gibt es im Hero nur noch auf der briefing-treuen
   Seite. Auf der Hauptseite steht er erst auf der Bestaetigung — vorher
   hat man ja noch nichts zugesagt. */
const heroCal = $('#heroCal');
if (heroCal) heroCal.href = calHref;
$('#doneCal').href = calHref;

/* ---------- scroll reveals ---------- */
const revealables = [
  /* The first two only exist on london-full.html, the comparison build with
     the photos and the venue back in; on the published page they match
     nothing, which is fine. */
  ...$$('#evening .section__head, .expect article, .shots'),
  ...$$('#venue .section__head, .venue__shots, .venue__grid'),
  ...$$('#rsvp .section__head, .signup'),
];
/* Auf der Hauptseite macht motion.js die Choreografie; die schlichten
   Reveals hier wuerden sonst dieselben Elemente ein zweites Mal anfassen. */
const choreographed = document.body.classList.contains('full');
if (!choreographed) {
  revealables.forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', `${(i % 4) * 70}ms`); });
}
if (!choreographed) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealables.forEach((el) => io.observe(el));
}


/* ---------- the Google map, click to load ----------
   Only on london-full.html. The map is the real Google one, so it stays
   behind a click: embedding it outright would set Google cookies on every
   visitor before anyone agreed to anything. Same rule as the guards on the
   main DDX site. */
const gmap = $('#gmap'), gmapLoad = $('#gmapLoad');
if (gmap && gmapLoad) {
  gmapLoad.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = gmap.dataset.src;
    f.title = 'Google map showing Tavern, 374-378 Old Street, London';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.allowFullscreen = true;
    gmap.replaceChildren(f);
    gmap.classList.add('is-live');
  });
}

/* ---------- the form ---------- */
const form = $('#signup'), submitBtn = $('#submitBtn'), submitLabel = $('#submitLabel');
const barBtn = $('#barBtn'), status = $('#status'), bar = $('#bar');

function readiness() {
  const ok = form.checkValidity();
  submitBtn.classList.toggle('attention', ok);
  barBtn.classList.toggle('attention', ok);
}
form.addEventListener('input', readiness);
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
    name: f.get('name').trim(), email: f.get('email').trim(),
    role: f.get('role').trim(), company: f.get('company').trim(),
    country: '', phone: '', ticket: false,
    notes: (f.get('dietary') || '').trim(),
    submittedAt: new Date().toISOString(), page: location.href,
  };
};

async function send(data) {
  if (!SUBMIT_ENDPOINT) { await new Promise((r) => setTimeout(r, 900)); return { ok: true, preview: true }; }
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
  submitLabel.textContent = 'Saving\u2026'; barBtn.textContent = 'Saving\u2026';
  status.hidden = true;
  try { done(data, await send(data)); }
  catch (err) {
    status.hidden = false;
    status.textContent = `Couldn\u2019t save that \u2014 ${err.message} Your answers are still here; try again in a moment.`;
    [submitBtn, barBtn].forEach((b) => { b.disabled = false; b.classList.remove('is-busy'); });
    submitLabel.textContent = 'Accept the invitation'; barBtn.textContent = 'Accept the invitation';
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
  const d = $('#done'); d.hidden = false;
  d.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

if (!SUBMIT_ENDPOINT) $('#previewBar').hidden = false;
document.body.classList.add('has-bar');
document.fonts.ready.then(() => document.body.classList.add('ready'));
