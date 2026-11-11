# Lab.Direct — Phase-wise Build Prompt

Use this prompt, phase by phase, to build (or rebuild and extend) Lab.Direct: an independent, ad-supported guide to direct-access lab testing. Each phase is self-contained. Finish its acceptance checks before moving on.

---

## Phase 0 — Positioning and guardrails

**Prompt:**
> You are building **Lab.Direct**, an independent educational publisher that helps adults understand, compare and plan direct-access lab tests: tests a person can order without a doctor's visit, at a walk-in lab or with an at-home kit. Lab.Direct does not sell tests, collect specimens or diagnose. It explains tests, decodes results against typical reference ranges, estimates cash prices, points people to labs, and captures qualified leads for partner labs and providers.
>
> Brand rules: always write the name as "Lab.Direct", never as one word. Do not imitate any lab company's branding. State on every page that Lab.Direct is not affiliated with Laboratory Corporation of America Holdings, Quest Diagnostics, or any company or program using "LabDirect" or similar names.
>
> Audience: US and Canadian adults aged 25–65 who are paying cash for labs, managing a chronic condition, tracking fitness or longevity, or confused by a lab report. Secondary audience: labs, clinics, telehealth and test-kit brands who want customers.

**Acceptance:** one-line value proposition; trademark/non-affiliation text approved; YMYL content rules written (cite public sources, no diagnosis, "your lab's reference range wins").

---

## Phase 1 — Competitive teardown (35+ sites)

**Prompt:**
> Visit at least 35 leading sites across four groups and log, for each: value proposition, navigation, tools, forms and calls to action, trust signals, prices shown, monetization and design.
> 1. **Direct-access sellers:** Quest (questhealth.com), Labcorp OnDemand, Walk-In Lab, Ulta Lab Tests, Personalabs, HealthLabs.com, Own Your Labs, Private MD Labs, Discounted Labs, Jason Health, Any Lab Test Now, Life Extension lab testing.
> 2. **At-home kits and memberships:** Everlywell, LetsGetChecked, myLAB Box, SiPhox Health, Function Health, Superpower, InsideTracker, Marek Health, imaware.
> 3. **Reference publishers:** MedlinePlus Lab Tests, Testing.com, Lab Tests Online UK, Mayo Clinic tests and procedures, Cleveland Clinic diagnostics, Healthline, WebMD, Verywell Health, Ada.
> 4. **Marketplaces, directories and price tools:** GoodRx, MDsave, Sesame, Healthgrades, Zocdoc, Labfinder, Rupa Health, Quest and Labcorp patient portals.
>
> Output a feature matrix and the gaps no single site covers.

**Findings to carry forward:**
- Sellers only show their own catalog. Nobody gives a neutral cross-provider view of what a test costs and where to get it.
- Reference sites explain tests well but have no price, no lab finder and no next step.
- Patterns that convert: ZIP-based lab locator, "Help me choose" by goal, 10–20% email/SMS unlock, step-by-step quiz funnels, HSA/FSA messaging, "no doctor visit needed" and "results in 1–3 days" claims.
- Trust patterns: named medical reviewers, editorial policy, CLIA/CAP mentions, price guarantees, verified reviews, government source citations.
- Price anchors seen in Nov 2026: lipid panel $10–$59, HbA1c $8.80–$50, CMP $10–$50, vitamin D $99–$135, ferritin $42, cortisol $47, thyroid panel $119, at-home STD panels $169–$409.

---

## Phase 2 — Information architecture

**Prompt:**
> Build a static, multi-page site deployable on GitHub Pages free tier from the `main` branch root. No build step is required to serve it. Pages:
> - `/` Home: hero with an interactive mini lab report, test search, popular tests, four tools, the lead funnel, videos, guides, support, contests, careers, FAQ.
> - `/tests.html` Test library: search, category filter, tube-cap legend, fasting filter, at-home filter.
> - `/test.html?t=slug` dynamic test page, plus generated static `/tests/<slug>.html` pages for SEO.
> - `/decoder.html` Results decoder: enter values from a report, see where each falls against typical ranges, print or email a summary.
> - `/costs.html` Cash-price estimator: build a panel, see a typical direct-pay range and request quotes.
> - `/find-a-lab.html` Lab finder: ZIP/city search that opens map results, major network locators, "List your lab" form.
> - `/get-tested.html` Dedicated lead funnel: multi-step testing-plan quiz.
> - `/guides.html` plus `/guides/*.html` long-form guides.
> - `/videos.html` YouTube library. `/news.html` auto-updated health news. `/resources.html` trusted sources and glossary.
> - `/support.html` donations. `/contests.html` contests and prizes. `/careers.html` hiring. `/advertise.html` advertising, sponsorship and partnership.
> - `/about.html`, `/contact.html`, `/privacy.html`, `/terms.html`, `/disclaimer.html` (medical, trademark and copyright disclosure), `/404.html`.
> - Root files: `ads.txt`, `robots.txt`, `_config.yml`, `site.webmanifest`, `favicon.svg`; `sitemap.xml` is generated at build time.

**Acceptance:** every page reachable in two clicks from the header or footer; sitemap lists every indexable URL.

---

## Phase 3 — Design system

**Prompt:**
> Design language comes from the lab itself. Color the interface with real specimen-tube cap colors and show on each test which tube it is usually drawn in: lavender (EDTA, hematology), gold (serum separator, chemistry), gray (fluoride, glucose), light blue (citrate, coagulation), plus urine cup and swab. Background is cool requisition-paper gray-green; text is deep teal ink; result flags use a clinical red only for out-of-range values. The "." in Lab.Direct is drawn as a tube cap seen from above.
> Typography: Bricolage Grotesque for display, Public Sans for text, tabular numerals for every value. Left-aligned layouts. Report-style rows instead of identical cards. One memorable moment: the interactive lab report in the hero. Everything else stays quiet.
> Quality floor: responsive from 320px, visible keyboard focus, reduced-motion respected, WCAG AA contrast, Lighthouse 90+.

**Acceptance:** tokens defined as CSS custom properties; no layout shift from ads (reserve space only where auto ads are allowed).

---

## Phase 4 — Data layer and tools

**Prompt:**
> Create `_data/tests.json` (30+ tests: slug, name, aliases, category, tube, sample, fasting, turnaround, typical direct-pay price range, what it measures, why it's ordered, preparation, how to read results, who should consider it, at-home availability, related tests, FAQs) and `data/analytes.json` (typical adult reference ranges with units, sex-specific limits, tiered cut-offs and plain-language meanings, sourced from MedlinePlus, ADA, NCEP ATP III, NIH ODS, AHA/CDC).
> Build tools in vanilla JavaScript:
> 1. **Site search** across tests and guides from the header.
> 2. **Results decoder** with sex selector, per-analyte range bar, tier labels, flags, a printable summary and an "email me my summary" lead capture.
> 3. **Price estimator**: add tests to a panel, see low/high totals and fasting needs, share the panel link, request quotes.
> 4. **Lab finder**: ZIP or city opens a map search for walk-in labs; network locator links; partner listing form.
> 5. **Testing-plan funnel**: goal, about you, preferences, location, contact. Show a teaser (number of tests and price range) before the contact step and the full plan after it.
> 6. **Lab IQ quiz** for contests.

**Acceptance:** all tools work offline from local JSON; no tool gives a diagnosis; every result screen says the report's own reference range takes precedence.

---

## Phase 5 — Monetization

**Prompt:**
> - **Google AdSense** (publisher `ca-pub-6620975821265271`): load the AdSense script in the `<head>` of every content page, add the `google-adsense-account` meta tag, publish `ads.txt` with `google.com, pub-6620975821265271, DIRECT, f08c47fec0942fa0`. Use Auto ads. Never place ads on the 404 page, never ask users to click ads, never place ads next to buttons in a way that could cause accidental clicks.
> - **YouTube**: lazy "lite" embeds (thumbnail first, iframe from youtube-nocookie.com on click) on the home page, video library and matching test pages.
> - **Affiliate-ready**: a config slot per provider so affiliate links can be added later with `rel="sponsored"` and a visible disclosure.
> - **Lead generation**: the dedicated funnel, inline home form, decoder and estimator captures, lab/partner listing form. Each lead is tagged by source.
> - **Advertising and sponsorship**: packages with starting prices and an inquiry form.
> - **Donations**: tiers, a fund allocation (operations, content and medical review, hiring, promotions and marketing, contests and prizes), a progress meter and a pledge form, with payment links set in one config file.
> - **Contests**: monthly Lab IQ draw, explainer-video contest, referral contest, with official rules (no purchase necessary, eligibility, odds, winner selection).
> - **Hiring**: open roles and an application form.

**Acceptance:** AdSense script present on every content page; policy pages linked in every footer.

---

## Phase 6 — Contact routing and privacy

**Prompt:**
> Every form (contact, leads, quotes, partner listings, pledges, contest entries, applications, ad inquiries) posts to one owner inbox through FormSubmit's AJAX endpoint. The owner email must never appear in page text, HTML attributes or plain source: store it as a character-code array in `assets/js/config.js`, assemble it only at submit time or when a visitor clicks an "Email us" link. Include a honeypot field, a consent checkbox and a clear success/failure message. On failure, offer the "Email us" link as a fallback.
> At the top of every page, above the header, show: "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership", linking to https://web.works/contact.
> Add a cookie notice (and turn on Google's certified consent message in AdSense for EEA/UK/CH traffic), a privacy policy covering Google advertising cookies and opt-outs, terms, a medical disclaimer, and the trademark/copyright disclosure.

**Acceptance:** `grep` for the email in the repository returns nothing; every page shows the top banner.

---

## Phase 7 — SEO and AdSense approval readiness

**Prompt:**
> - Unique title, meta description, canonical, Open Graph and Twitter tags per page.
> - JSON-LD: `Organization` and `WebSite` with `SearchAction` on the home page, `MedicalTest` and `FAQPage` on test pages, `Article` on guides, `BreadcrumbList` throughout.
> - At least six original long-form guides (800+ words) before applying: preparing for a blood test, reading a lab report, how direct-access testing works, at-home kits vs lab draws, saving money on lab tests, routine screening tests by age.
> - About, contact, privacy, terms and disclaimer pages complete; navigation clear; no broken links; no placeholder text; mobile-friendly; fast.
> - Content rules: cite public sources, show "last reviewed" dates, no miracle claims, no prohibited content.

**Acceptance:** every page passes a link check; every content page has 300+ words of unique text.

---

## Phase 8 — Automation (self-updating)

**Prompt:**
> Use GitHub Pages' built-in Jekyll build, so no Actions workflow or local build step is needed:
> 1. `_includes/head.html`, `header.html` and `footer.html` hold the shared `<head>` (AdSense, canonical, Open Graph), the top contact banner, navigation and footer. Each page sets only `title` and `description` in front matter.
> 2. `_data/tests.json` is the single source of truth. `_layouts/test.html` renders a static, schema-marked page for each 3-line stub in `tests/`, and `data/tests.json` republishes the same data for the browser tools.
> 3. `jekyll-sitemap` regenerates `sitemap.xml` on every build.
> 4. Client side: "test of the day" rotates daily; `assets/js/live.js` refreshes NIH and FDA headlines in the browser; `404.html` sends unknown `/tests/<slug>.html` requests to `test.html?t=<slug>`.
> 5. Optional: `scripts/auto-update.yml` (move to `.github/workflows/`) runs `scripts/update_news.py` daily to commit fresh `data/news.json`.

**Acceptance:** adding one entry to `_data/tests.json` plus its stub produces a new static page and sitemap entry without editing any template.

---

## Phase 9 — Launch

**Prompt:**
> 1. Push to `github.com/WEBWORKSA1/lab-direct`, branch `main`.
> 2. Settings → Pages → Deploy from a branch → `main` / root.
> 3. Custom domain: add `lab.direct` in Settings → Pages; at the registrar, point apex A records to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 and `www` CNAME to `webworksa1.github.io`; enable "Enforce HTTPS".
> 4. Submit one test form to activate FormSubmit for the owner inbox.
> 5. Add payment links (PayPal, Stripe, Buy Me a Coffee or GitHub Sponsors) in `assets/js/config.js`.
> 6. Verify the site in Google Search Console, submit `sitemap.xml`, then apply in AdSense once the custom domain serves `ads.txt` at the root.

## Phase 10 — Growth roadmap

- Expand to 100+ tests and 50+ guides; add city pages ("blood test without a doctor in <city>").
- Add affiliate links as partner programs approve the site; add a newsletter service.
- Recruit credentialed reviewers (MLS, RN, MD) and show reviewer bylines.
- Add a Spanish edition. Add a lab partner portal with paid featured listings.
