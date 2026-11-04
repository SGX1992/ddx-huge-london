# Huge Matter

The brief asks for Huge Matter site-wide; the font files were not supplied with
it (the email of 2026-11-04 carried no attachment). `london.css` already
declares the @font-face rules, so the page picks the font up the moment these
files land here — no code change needed:

    HugeMatter-Regular.woff2    400   longer paragraphs
    HugeMatter-Medium.woff2     500   subheads, labels, captions
    HugeMatter-SemiBold.woff2   600   headlines, buttons, most text

Until then the stack falls through to Poppins, which the brief names as the
fallback. Add .woff as a second src if the licence package ships one.

The @font-face rules in `london.css` are **commented out** while this folder is
empty, so the live page does not fire three 404s per visit. Once the files are
here, uncomment that block — that is the only change needed.
