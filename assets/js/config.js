/* Deployment knobs.

   SUBMIT_ENDPOINT — where the RSVP is posted as JSON. Empty means "preview
   build": the page says so at the top and a submit is played back locally
   without saving anything.

   Live since 22 September 2026: the RSVP goes to the shared DDX side-event
   inbox on Netlify (netlify/functions/submit.mjs in ../ddx-side-sandiego,
   site ddx-side-events, which knows this event from events-huge.js). It waits
   there until the ddx-signup-bridge scheduled task carries it into Notion →
   DDX → HUGE Partnership → "HUGE NYC Target Invitees (Work-In-Progress)":
   an RSVP from someone already on the target list flips their row to
   Accepted; anyone else is added as a new row. No token lives in this repo. */
export const SUBMIT_ENDPOINT = 'https://ddx-side-events.netlify.app/api/submit';
export const EVENT_ID = 'huge-make-vip';
export const SITE_URL = 'https://huge.ddxconference.com/';

export const LONDON_EVENT_ID = 'huge-london-dinner';
