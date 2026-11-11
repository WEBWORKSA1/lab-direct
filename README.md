# Lab.Direct

Independent guide to direct-access lab testing: a 36-test library, results decoder, cash-price estimator, lab finder, testing-plan lead funnel, guides, videos, auto-updated news, donations, contests, careers and advertising pages.

Static HTML, CSS and vanilla JavaScript. No build step is needed to serve it, so it runs on the GitHub Pages free plan from the `main` branch root.

## Publish

1. **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`.**
2. **Settings → Actions → General → Workflow permissions → Read and write**, so the daily auto-update can commit.
3. **Custom domain:** Settings → Pages → Custom domain → `lab.direct`. At the registrar, add apex `A` records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and a `www` `CNAME` to `webworksa1.github.io`. Turn on **Enforce HTTPS** once the certificate is issued.
4. **Forms:** submit any form once. FormSubmit emails an activation link to the owner inbox; click it. Optionally paste the random alias FormSubmit gives you into `formAlias` in `assets/js/config.js`.
5. **AdSense:** once `https://lab.direct/ads.txt` resolves, add the site in AdSense and request review. Turn on AdSense **Privacy & messaging → European regulations** for EEA/UK/CH visitors.
6. **Payments:** add PayPal, Stripe, Buy Me a Coffee or GitHub Sponsors links in `assets/js/config.js` → `payments`. Until then, donate buttons collect pledges by form.

## Edit and extend

| Task | Where |
|---|---|
| Add or edit a test | `data/tests.json` (static page and sitemap entry are generated automatically) |
| Decoder ranges | `data/analytes.json` |
| Videos | `data/videos.json` (YouTube IDs + tags) |
| Guides list | `data/guides.json` + a page in `guides/` |
| Header, footer, `<head>` tags | `scripts/build.py`, then run `python3 scripts/build.py` (the workflow also runs it) |
| Payments, fund meter, contact routing | `assets/js/config.js` |
| Styles | `assets/css/site.css` |

## Automation

`.github/workflows/auto-update.yml` runs on pushes to content, daily at 06:17 UTC, and on demand:

- `scripts/update_news.py` refreshes `data/news.json` from NIH and FDA RSS feeds.
- `scripts/build.py` re-applies shared chrome to every page, regenerates `tests/<slug>.html` and rebuilds `sitemap.xml`.

`404.html` forwards any not-yet-generated `tests/<slug>.html` URL to `test.html?t=<slug>`.

## Contact routing

All forms post to the owner inbox via FormSubmit's AJAX endpoint. The address is stored obfuscated in `assets/js/config.js` and assembled only at submit time or when an "Email us" link is clicked; it never appears in page text or HTML.

## Legal

© Lab.Direct. All rights reserved. Not affiliated with Laboratory Corporation of America Holdings, Quest Diagnostics, or any "LabDirect"-named company or program. See `disclaimer.html`. The build plan is in `PROMPT.md`.
