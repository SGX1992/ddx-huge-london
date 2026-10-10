# MAKE.EXE VIP Access — Huge × DDX

RSVP page for the VIP hour before MAKE.EXE 2026 (Huge's live GenAI creative
battle), Tuesday 6 October 2026, 4:30 PM, SHiFT Midtown, 330 W 38th St, New York.
Huge hosts; DDX curates the 25–30 guests. Live at **huge.ddxconference.com**
(GitHub Pages, repo `SGX1992/ddx-huge`, `./deploy-pages.sh`).

Static site, no build step. Dev server: `node serve.mjs` → http://localhost:8797

```
index.html              the page: hero (invitation), what MAKE.EXE is, the evening, the room, RSVP, done
assets/css/style.css    DDX chrome with Huge's pink (#FF31A1) as the accent; Anton / Inter / Space Mono
assets/js/main.js       reveals, .ics, form validation, submit, done state
assets/js/config.js     SUBMIT_ENDPOINT (empty = preview build, nothing saved) and the event id
assets/img/             hero (Empire State, Unsplash/Todd Quackenbush), skyline (Unsplash/Jermaine Ee),
                        makeexe.png (lifted from Huge's invite PDF), texture.jpg (same PDF),
                        huge-grain.jpg (hugeinc.com event page background), huge.svg (their wordmark)
tools/                  crop.swift, knockout-dark.swift — how the wordmark was cut out
```

## Sources for the copy
- hugeinc.com/events/make-2026 (date, venue, schedule, "what to expect", form fields)
- hugeinc.com/case-study/make-exe-2025 (the 2025 numbers and quotes)
- Angela Yang's email of 2026-09-04 (the WIP VIP format: mezzanine, C-suite, one question to the room, 25–30 guests)
- MAKE_DDX_VIP_2026.pdf, Huge's draft invite (headline copy, 4:30–5:30 PM)

## Where RSVPs go

Live since 22 September 2026. The page posts to the shared DDX side-event
inbox (`https://ddx-side-events.netlify.app/api/submit`, the function in
`../ddx-side-sandiego/netlify/functions/submit.mjs`, which knows this event as
`huge-make-vip` from `assets/js/events-huge.js`). Sign-ups wait in Netlify
Blobs until the `ddx-signup-bridge` scheduled task on Sebastian's Mac carries
them into Notion through the Notion connector. No token lives anywhere here.

Destination: **Notion → DDX → HUGE Partnership → "HUGE NYC Target Invitees
(Work-In-Progress)"** (data source `580816a8-e86c-498a-acd7-4397c9e01e6a`) —
the same curated target list the team works from, not a separate CRM.

- Already on the list (matched by email, else by name) → that row is updated:
  Status → **Accepted**, plus Email, RSVP At, Dietary, RSVP Source. The
  research columns (Tier, Role, Company, sources, notes) are never overwritten.
- Not on the list → a new row: Company as the title, Name, Role, Email,
  Status **Accepted**, Tier **TBR**, and a Research Note saying it was a
  self-RSVP.

Four properties were added to that database on 22 September 2026 to make this
possible: `Email`, `RSVP At`, `Dietary`, `RSVP Source`. Nothing existing was
renamed or removed.

To go back to preview mode (nothing saved, pink bar at the top), set
`SUBMIT_ENDPOINT` back to `''` in `assets/js/config.js` and redeploy.
