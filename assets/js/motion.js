/* Bewegung — nur auf der Hauptseite (london-full.html, body.full).
   Vokabular von sandbox.fastforward.global übernommen: GSAP + ScrollTrigger
   für die Choreografie, Lenis für den trägen Scroll, durchgehend expo.out,
   und maskierte Zeilen, die von unten hochfahren statt einzublenden.

   Die briefing-treue Zweitseite lädt diese Datei nicht; dort bleibt es bei den
   schlichten IntersectionObserver-Reveals in london.js.

   Wer prefers-reduced-motion gesetzt hat, bekommt gar nichts davon: die Seite
   steht dann sofort fertig da. Das ist kein Nice-to-have — auf einer Einladung
   zu einem Abend über inklusives Design wäre alles andere peinlich. */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const g = window.gsap;

if (!g || reduced) {
  /* Ohne GSAP oder mit Bewegungsbremse: alles sichtbar machen und aufhören. */
  document.querySelectorAll('.rv').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
  document.querySelectorAll('.rv-l .line span').forEach((el) => { el.style.transform = 'none'; });
} else {
  g.registerPlugin(window.ScrollTrigger);

  /* ---------- träger Scroll ----------
     lerp 0.085 ist der Wert von SANDBOX; darunter fühlt es sich schwammig an,
     darüber merkt man die Glättung kaum noch. */
  if (window.Lenis) {
    const lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on('scroll', window.ScrollTrigger.update);
    g.ticker.add((t) => lenis.raf(t * 1000));
    g.ticker.lagSmoothing(0);
  }

  /* ---------- der Auftritt ----------
     Läuft einmal beim Laden, ohne ScrollTrigger: die Zeilen des Titels fahren
     gestaffelt hoch, dann kommt der Rest nach. */
  const intro = g.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .to('.hero .rv-l .line span', { y: 0, duration: 1.25, stagger: 0.09 }, 0.15)
    .to('.hero .eyebrow', { opacity: 1, y: 0, duration: 1 }, 0.1)
    .to('.hero .facts', { opacity: 1, y: 0, duration: 1.1 }, 0.5)
    .to('.hero .hero__cta', { opacity: 1, y: 0, duration: 1.1 }, 0.62)
    .from('.hero__top', { opacity: 0, y: -14, duration: .9 }, 0);

  /* ---------- alles unterhalb des Hero ---------- */
  const below = (sel) => [...document.querySelectorAll(sel)].filter((el) => !el.closest('.hero'));

  below('.rv').forEach((el) => {
    g.to(el, {
      opacity: 1, y: 0, duration: 1.25, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  below('.rv-l').forEach((el) => {
    g.to(el.querySelectorAll('.line span'), {
      y: 0, duration: 1.25, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  /* Karten und Bildkacheln kommen als Gruppe, leicht versetzt. */
  const group = (sel, trigger) => {
    const items = document.querySelectorAll(sel);
    if (!items.length) return;
    g.from(items, {
      y: 44, opacity: 0, duration: 1.15, stagger: 0.07, ease: 'expo.out',
      scrollTrigger: { trigger: trigger || items[0].parentElement, start: 'top 82%' },
    });
  };
  group('.expect article');
  group('.shots__grid figure', '.shots__grid');
  group('.venue__shots figure', '.venue__shots');
  group('.venue__grid > *', '.venue__grid');

  /* ---------- Parallax ----------
     Die Bilder sitzen in Rahmen mit overflow:hidden, also kann das Motiv
     innerhalb wandern. 8 % Weg reichen; mehr sieht nach Effekt aus. */
  document.querySelectorAll('.shots__grid img, .venue__shots img').forEach((img) => {
    g.fromTo(img, { yPercent: -4, scale: 1.08 }, {
      yPercent: 4, scale: 1.08, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  /* ---------- die Leiste unten ----------
     Fährt erst hoch, wenn der Hero durch ist — vorher steht der gleiche Knopf
     ohnehin zwei Zentimeter weiter oben im Bild. */
  const bar = document.querySelector('.bar');
  if (bar) {
    g.set(bar, { yPercent: 110 });
    const show = () => g.to(bar, { yPercent: 0, duration: .8, ease: 'expo.out' });
    const hide = () => g.to(bar, { yPercent: 110, duration: .5, ease: 'power2.in' });

    /* Hoch, sobald der Hero durch ist … */
    window.ScrollTrigger.create({
      trigger: '.hero', start: 'bottom 70%',
      onEnter: show, onLeaveBack: hide,
    });
    /* … und wieder weg, sobald das Formular im Bild ist. Sonst stehen drei
       Knoepfe mit derselben Aufschrift gleichzeitig auf dem Schirm: im Hero,
       im Formular und hier unten. */
    window.ScrollTrigger.create({
      trigger: '#rsvp', start: 'top 85%', end: 'bottom top',
      onEnter: hide, onLeaveBack: show, onLeave: show, onEnterBack: hide,
    });
  }
}
