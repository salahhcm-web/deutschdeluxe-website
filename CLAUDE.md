# Deutsch Deluxe website — project guide for Claude Code

Static marketing website for the Deutsch Deluxe German training center (Nasr City, Cairo), served from Namecheap cPanel
`public_html` at https://deutschdeluxe.site. The student portal is a separate Laravel repo (deutschdeluxe-portal) at
https://portal.deutschdeluxe.site.

## Stack and rules
- Plain HTML + CSS + vanilla JS. **No build step, no frameworks, no CDN assets, no inline scripts/styles** — the `.htaccess`
  CSP is `default-src 'self'` and must keep passing.
- Pages: index, courses, placement-test, exams, about, contact, 404. Header/footer markup is duplicated in every page: change all 7.
- Copy: English lives in the HTML; Arabic in `js/i18n.js` under the same `data-i18n` key (551 keys). Every new visible string needs both.
- Design: mixed world — dark navy/neon "night" bands (hero, how-it-works, feedback, CTA, footer) and light "day" bands
  (tracks, trainers, prices, FAQ, contact). Tokens at the top of `css/site.css`. Logo files in `img/logo/` are the official
  assets — never recolour or redraw them.
- Placeholders the owner must replace are marked `<!-- PLACEHOLDER: replace with real data -->` (prices, dates, stats,
  trainer names, testimonials, address, map link). Full list in README.md. Do not invent real-looking numbers.
- `reference/` holds a brand image with real customer names: git-ignored, never publish it.

## Check before committing
```bash
php -r 'foreach (glob("*.html") as $f) { $d = new DOMDocument; libxml_use_internal_errors(true); $d->loadHTMLFile($f); echo $f, ": ", count(libxml_get_errors()), " errors\n"; libxml_clear_errors(); }'
```
Open each page at 375px width and confirm no horizontal scroll; toggle EN/AR on every page; run the placement test once.

## Preview locally
```bash
php -S 127.0.0.1:8080 -t .
```

## Deploy
Upload everything except `README.md`, `CLAUDE.md`, `reference/`, `.git/` into cPanel `public_html` (show hidden files so
`.htaccess` is included), or connect this repo in cPanel » Git Version Control with the deploy path set to `public_html`.
