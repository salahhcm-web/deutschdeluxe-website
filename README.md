# Deutsch Deluxe — public website

Static marketing site for **Deutsch Deluxe**, German language training center, Nasr City, Cairo.
Plain HTML + CSS + vanilla JS. No build step, no frameworks, no CDN — everything is self-hosted and
works under the strict Content-Security-Policy shipped in `.htaccess`.

Live domain: `https://deutschdeluxe.site/` · Student portal: `https://portal.deutschdeluxe.site`

## Structure

```
index.html            Home: hero (night), stats, feature pills, tracks, how it works, trainers,
                      chat-style feedback, community, FAQ, location, final CTA (+ JSON-LD Org/FAQ)
courses.html          Levels A1–C1: overview table, schedules, per-level detail, offers, kids (+ Course JSON-LD)
placement-test.html   15-question A1→B1 quiz (js/placement.js) with WhatsApp / mailto lead hand-off
exams.html            Goethe / ÖSD / telc comparison, bootcamp, week plan, dates, medical FSP track
about.html            Story, method (4 skills), trainers, student portal, certificates
contact.html          WhatsApp / phone / email / address / hours / map link + contact form (WhatsApp or mailto)
404.html              Error page (asset links are root-absolute so it works from any path)
css/site.css          The whole design system (tokens, night/day bands, components, RTL, dark mode, motion)
js/site.js            Header menu, EN/AR toggle (data-i18n), WhatsApp deep links, contact form, back-to-top
js/i18n.js            Arabic dictionary: window.DD_I18N.ar[key]  (English lives in the HTML)
js/placement.js       Quiz questions, scoring, result copy, lead form
img/logo/             Official logo files (never recolour). Header/footer use logo-white.svg
favicon.svg           = img/logo/icon.svg      apple-touch-icon.png = 180px render of the icon
og-image.png / .svg   1200×630 social preview built around img/logo/logo.png
robots.txt, sitemap.xml, .htaccess
reference/            Internal design reference only — do NOT upload (see below)
```

Every page contains the same header/footer markup (there is no include mechanism on static hosting).
If you change the header or footer, change it in all seven HTML files (search for `<header class="site-header"`
and `<footer class="site-footer"`).

## Editing prices, dates, seats, teachers (the "data" places)

There is no database; the text lives in the HTML and its Arabic twin lives in `js/i18n.js`.
Search for the comment `<!-- PLACEHOLDER: replace with real data -->` — every placeholder block is marked.

| What | English (HTML) | Arabic (`js/i18n.js` key) |
|---|---|---|
| Course durations / sessions / start dates / seats | `courses.html` → overview `<table>` **and** the per-level `.price-box` blocks (both places) | `courses.a1.duration`, `courses.a1.sessions`, `courses.a1.start`, `courses.a1.seats` … (a2, b1, b2, c1) |
| Prices (EGP) | `courses.html` → `<span class="price ltr">4,500 EGP</span>` and `.price-box .price` | prices are numbers, not translated |
| Offers (early-bird, bundle, installments) | `courses.html` `#offers` and the note under the table | `offers.*`, `courses.tableNote` |
| Schedules (days/times) | `courses.html` `#schedule` | `courses.sched.m.body` … |
| Kids & teens fee | `courses.html` `#kids` | `kids.*` |
| Bootcamp fee, dates | `exams.html` `#bootcamp`, `#dates` | `ex.bc.*`, `ex.d1.*`, `ex.d2.*`, `ex.d3.*` |
| Stats (students, rating, since-year) | `index.html` `.hero-stats` and `.side-badges`; `about.html` `.stats` | `hero.stat*`, `side.*`, `stats.*` |
| Trainers (names, roles, qualifications) | `index.html` `#teachers`, `about.html` `#teachers` | `teachers.t1.*` … `teachers.t5.*` |
| Trainer photos | replace `<div class="avatar">MA</div>` with `<img class="avatar" src="img/team/name.jpg" alt="Name, role">` | — |
| Testimonials (chat bubbles) | `index.html` `#reviews` `.chat` blocks | `chat.1.*`, `chat.2.*`, `chat.3.*` |
| Address, opening hours | `index.html` `#location`, `contact.html`, footer, JSON-LD `openingHoursSpecification` | `location.*`, `footer.addr`, `footer.hours`, `ct.addr` |
| WhatsApp pre-filled messages | `js/site.js` → `WA_MESSAGES` | `wa.*` |
| Placement quiz questions | `js/placement.js` → `QUESTIONS` (keep 5 per level; `PASS_MARK` = 4/5) | `quiz.*` (UI strings only) |

How the Arabic toggle works: any element with `data-i18n="key"` gets its innerHTML replaced by
`DD_I18N.ar[key]` when Arabic is selected (attributes via `data-i18n-attr="content:key"`). English is
cached from the HTML on first switch, so both directions work without reload. Choice is stored in
`localStorage` (`dd-lang`); `?lang=ar` in the URL forces Arabic. Keys with no Arabic entry simply stay English.

## Uploading to Namecheap cPanel (public_html)

1. cPanel → **File Manager** → `public_html` (or the domain's document root).
2. Upload everything in this folder **except** `README.md`, `reference/` and `.git/`:
   `index.html`, `courses.html`, `placement-test.html`, `exams.html`, `about.html`, `contact.html`, `404.html`,
   `css/`, `js/`, `img/`, `favicon.svg`, `apple-touch-icon.png`, `og-image.png`, `og-image.svg`,
   `robots.txt`, `sitemap.xml`, `.htaccess` (enable "Show hidden files" to see it).
   Easiest: zip the folder, upload the zip, "Extract" in File Manager, delete the zip.
3. Make sure **AutoSSL / Let's Encrypt** is active for `deutschdeluxe.site` — `.htaccess` redirects everything to HTTPS.
4. Test: `https://deutschdeluxe.site/`, `/courses`, `/placement-test.html`, a wrong URL (should show the 404 page),
   the Arabic toggle, and one "Ask on WhatsApp" button on a phone.
5. Optional: Google Search Console → submit `https://deutschdeluxe.site/sitemap.xml`.

`.htaccess` gives you: HTTPS + non-www redirect, clean URLs (`/courses` → `courses.html`), 404 page,
no directory listing, gzip/brotli, cache headers, HSTS, `X-Frame-Options: DENY`, nosniff, referrer policy,
permissions policy and a strict CSP (`default-src 'self'`, `img-src 'self' data:`, `frame-src 'none'`).
Because of the CSP: never add inline `<script>`/`style=""` or third-party scripts without extending the policy.
To embed a Google Maps iframe, change `frame-src 'none'` to `frame-src https://www.google.com`.

## Validation done

* HTML parses without errors (PHP DOMDocument), all internal links and anchors resolve.
* JS logic verified in headless Chrome: quiz scoring (all-correct → B2+, A1-only → A2, A1+A2 → B1, 4/5 rule),
  EN↔AR toggle re-renders every page and the quiz, WhatsApp links rebuild per language.
* No horizontal overflow at 375px on any page (EN and AR); no inline styles (CSP-safe).

## TODO — placeholders the owner must replace

- [ ] Stats: `1000+` students, `5/5` rating, `Seit 20XX` founding year (`index.html`, `about.html`, i18n `hero.stat*`, `side.*`, `stats.*`)
- [ ] Prices "from X EGP", durations, sessions, next start dates, seats left — all five levels (`courses.html`)
- [ ] Offer terms: early-bird −10 %, A1+A2 bundle (−1,000 EGP), installments (`courses.html#offers`)
- [ ] Schedule days/times (morning / evening / weekend / intensive)
- [ ] Kids & teens fee and term length
- [ ] Exam bootcamp fee, upcoming bootcamp dates and target exam sessions (`exams.html#dates`)
- [ ] Trainer names, photos, real qualifications (`index.html#teachers`, `about.html#teachers`); remove "(example)"
- [ ] Real testimonials with permission — replace the three example chat bubbles; link Google/Facebook reviews
- [ ] Exact street address, building, floor, landmark; confirm opening hours (also in JSON-LD on `index.html`)
- [ ] Google Maps link: replace the search URL with the real place link (`index.html`, `contact.html`)
- [ ] Real photos for the Instagram tiles (`index.html#community`) with alt text
- [ ] Partnerships / accreditations line (`about.html#certificates`)
- [ ] Founding story details (`about.html#story`)
- [ ] `sitemap.xml` `<lastmod>` dates when you publish changes

`reference/brand-feedback-post.webp` is an internal design reference that contains real customer names — it
is git-ignored and must not be uploaded to the server.
