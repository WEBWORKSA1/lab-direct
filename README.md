# Lab.Direct

Independent guide to direct-access lab testing: a 36-test library with a static page per test, results decoder, cash-price estimator, lab finder, testing-plan lead funnel, guides, videos, live health news, donations, contests, careers and advertising pages.

Plain HTML, CSS and vanilla JavaScript, assembled by GitHub Pages' built-in Jekyll. No Actions workflow or local build is required, so it runs on the GitHub Pages free plan from the `main` branch root.

## Publish

1. **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.** The first build takes about a minute.
2. **Custom domain:** Settings → Pages → Custom domain → `lab.direct`. At the registrar, add apex `A` records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and a `www` `CNAME` to `webworksa1.github.io`. Turn on **Enforce HTTPS** once the certificate is issued.
3. **Forms:** submit any form once. FormSubmit emails an activation link to the owner inbox; click it. Optionally paste the random alias FormSubmit gives you into `formAlias` in `assets/js/config.js`.
4. **AdSense:** once `https://lab.direct/ads.txt` resolves, add the site in AdSense and request review. Turn on AdSense **Privacy & messaging → European regulations** for EEA/UK/CH visitors.
5. **Payments:** add PayPal, Stripe, Buy Me a Coffee or GitHub Sponsors links in `assets/js/config.js` → `payments`. Until then, donate buttons collect pledges by form.
6. **Optional daily news commit:** move `scripts/auto-update.yml` to `.github/workflows/auto-update.yml`.

## How it's built

| Piece | Where |
|---|---|
| Shared `<head>` (AdSense, SEO tags), top banner, header, footer | `_includes/head.html`, `_includes/header.html`, `_includes/footer.html` |
| Page title and description | front matter at the top of each page |
| Test catalog (single source of truth) | `_data/tests.json` — published to `data/tests.json` and rendered into `tests/<slug>.html` through `_layouts/test.html` |
| Add a test | add an entry to `_data/tests.json` and a 3-line stub `tests/<slug>.html` with `test_slug: <slug>` |
| Decoder ranges | `data/analytes.json` |
| Videos | `data/videos.json` (YouTube IDs + tags) |
| Guides list | `data/guides.json` + a page in `guides/` |
| Payments, fund meter, contact routing | `assets/js/config.js` |
| Styles | `assets/css/site.css` |
| Sitemap | generated automatically by `jekyll-sitemap` |

Self-updating: test of the day rotates daily, the news list refreshes in the browser from NIH and FDA feeds (`assets/js/live.js`), and every push rebuilds the site. `404.html` forwards unknown `tests/<slug>.html` URLs to the dynamic `test.html?t=<slug>` page.

## Contact routing

All forms post to the owner inbox via FormSubmit's AJAX endpoint. The address is stored obfuscated in `assets/js/config.js` and assembled only at submit time or when an "Email us" link is clicked; it never appears in page text or HTML.

## Legal

© Lab.Direct. All rights reserved. Not affiliated with Laboratory Corporation of America Holdings, Quest Diagnostics, or any "LabDirect"-named company or program. See `disclaimer.html`. The build plan is in `PROMPT.md`.
