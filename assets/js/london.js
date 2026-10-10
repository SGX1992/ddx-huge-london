import { SUBMIT_ENDPOINT, LONDON_EVENT_ID } from './config.js?v=20261010000410';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- the event ----------
   Venue and time confirmed 9 October 2026: Spring, in the New Wing of
   Somerset House, 7:30 PM. The calendar file blocks 19:30–22:30 London time. */
const EVENT = {
  id: LONDON_EVENT_ID,
  title: 'VIP Dinner Roundtable',
  by: 'Huge \u00d7 DDX',
  start: '2026-11-19T19:30:00',
  end: '2026-11-19T22:30:00',
  venue: 'Spring, Somerset House',
  address: 'Spring, Somerset House, New Wing, Lancaster Place, London WC2R 1LA',
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
$('#heroCal').href = calHref;
$('#doneCal').href = calHref;

/* ---------- the DDX logo wall ----------
   Same 22 marks and 28 names as the NYC page; rendered from here so the two
   pages cannot drift apart. */
const BRANDS = [
  {cls:"", file:"google", alt:"Google", w:308, h:112},
  {cls:"", file:"adobe", alt:"Adobe", w:357, h:112},
  {cls:"is-tall", file:"apple", alt:"Apple", w:65, h:79},
  {cls:"", file:"amazon", alt:"Amazon", w:332, h:112},
  {cls:"", file:"nvidia", alt:"NVIDIA", w:504, h:112},
  {cls:"is-tall", file:"salesforce", alt:"Salesforce", w:133, h:96},
  {cls:"", file:"siemens", alt:"Siemens", w:544, h:112},
  {cls:"is-tall", file:"volkswagen", alt:"Volkswagen", w:96, h:96},
  {cls:"", file:"visa", alt:"VISA", w:308, h:112},
  {cls:"", file:"deloitte", alt:"Deloitte", w:507, h:112},
  {cls:"", file:"forbes", alt:"Forbes", w:384, h:112},
  {cls:"", file:"allianz", alt:"Allianz", w:385, h:112},
  {cls:"is-tall", file:"intel", alt:"Intel", w:142, h:96},
  {cls:"is-tall", file:"cisco", alt:"Cisco", w:172, h:95},
  {cls:"is-tall", file:"hp", alt:"HP", w:97, h:96},
  {cls:"is-tall", file:"ea", alt:"EA", w:94, h:95},
  {cls:"", file:"zalando", alt:"Zalando", w:479, h:112},
  {cls:"", file:"us-bank", alt:"U.S. Bank", w:359, h:112},
  {cls:"is-faint", file:"walt-disney", alt:"Walt Disney", w:364, h:112},
  {cls:"is-faint", file:"american-airlines", alt:"American Airlines", w:275, h:112},
  {cls:"is-faint", file:"shopify", alt:"Shopify", w:360, h:112},
  {cls:"is-tall is-faint", file:"publicis-sapient", alt:"Publicis Sapient", w:207, h:96}
];
const MORE = ['Microsoft', 'Meta', 'AWS', 'IBM', 'Sony', 'Qualcomm', 'Oracle', 'ServiceNow', 'Workday', 'HubSpot', 'Webflow', 'Pinterest', 'The New York Times', 'Nordstrom', 'State Farm', 'Allstate', 'Nationwide', 'PwC', 'Schneider Electric', 'Stryker', 'Genentech', 'Dexcom', 'ResMed', 'United Airlines', 'Zoom', 'Thoughtworks', 'LINE', 'Medium'];
$('#wall').innerHTML = BRANDS.map((b) =>
  `<li${b.cls ? ` class="${b.cls}"` : ''}><img src="../assets/img/brands/${b.file}.png" alt="${b.alt}" width="${b.w}" height="${b.h}" loading="lazy"></li>`).join('');
$('#moreList').innerHTML = MORE.map((n) => `<li>${n}</li>`).join('');

/* ---------- scroll reveals ---------- */
const revealables = [
  ...$$('.split__lead, .split__body'),
  ...$$('#evening .section__head, .expect article, .shots'),
  ...$$('.room__in > *'),
  ...$$('#venue .section__head, .venue__shots, .venue__grid'),
  ...$$('.brands .section__head, .wall, .more'),
  ...$$('#rsvp .section__head, .signup'),
];
revealables.forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', `${(i % 4) * 70}ms`); });
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
revealables.forEach((el) => io.observe(el));

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
const hero = $('.hero__img');
Promise.all([document.fonts.ready, hero.complete ? Promise.resolve() : new Promise((r) => { hero.onload = r; hero.onerror = r; })])
  .then(() => document.body.classList.add('ready'));
