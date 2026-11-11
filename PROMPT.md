# Lab.Direct — Phase-wise Build Prompt

Use this prompt, phase by phase, to build (or rebuild and extend) Lab.Direct: an independent, ad-supported guide to direct-access lab testing. Each phase is self-contained. Finish its acceptance checks before moving on.

The complete plan is also saved in the Lab.Direct Claude project as "Lab.Direct phase-wise build prompt".

## Phases

0. **Positioning and guardrails** — independent educational publisher for direct-access lab testing; brand always written "Lab.Direct"; non-affiliation with Labcorp, Quest Diagnostics and any "LabDirect"-named company or program; YMYL rules (cite public sources, no diagnosis, the report's own reference range wins).
1. **Competitive teardown (35+ sites)** — direct-access sellers (Quest, Labcorp OnDemand, Walk-In Lab, Ulta Lab Tests, Personalabs, HealthLabs.com, Own Your Labs, Private MD Labs, Discounted Labs, Jason Health, Any Lab Test Now, Life Extension), at-home kits and memberships (Everlywell, LetsGetChecked, myLAB Box, SiPhox, Function Health, Superpower, InsideTracker, Marek Health, imaware), reference publishers (MedlinePlus, Testing.com, Lab Tests Online UK, Mayo Clinic, Cleveland Clinic, Healthline, WebMD, Ada), marketplaces and directories (GoodRx, MDsave, Sesame, Healthgrades, Zocdoc, Labfinder, Rupa Health, Quest and Labcorp patient portals). Gap: nobody combines neutral explanation, decoding, price ranges and a lab finder.
2. **Information architecture** — home, test library, generated test pages, results decoder, price estimator, lab finder, testing-plan funnel, guides, videos, news, resources, support, contests, careers, advertise, about, contact, privacy, terms, disclosures, 404; ads.txt, robots.txt, sitemap.xml, manifest, favicon, .nojekyll.
3. **Design system** — specimen-tube cap colors as the categorical palette (lavender, gold, gray, light blue, urine, swab), requisition-paper background, teal ink, clinical red only for flags; Bricolage Grotesque + Public Sans with tabular numerals; the dot in Lab.Direct drawn as a tube cap; one signature moment: the interactive lab report in the hero.
4. **Data layer and tools** — data/tests.json (36 tests), data/analytes.json (30 markers with sex-specific ranges and sources); site search, results decoder, price estimator, lab finder, testing-plan funnel, Lab IQ quiz.
5. **Monetization** — AdSense (ca-pub-6620975821265271) auto ads on every content page plus ads.txt; lite YouTube embeds; affiliate-ready config; lead generation (funnel, decoder, estimator, lab listings); advertising packages; donations with fund allocation; contests with official rules; hiring.
6. **Contact routing and privacy** — every form posts via FormSubmit AJAX to the owner inbox, stored obfuscated in assets/js/config.js and assembled only at submit or click; top banner on every page linking to web.works/contact; cookie notice; privacy, terms, medical disclaimer, trademark and copyright disclosure.
7. **SEO and AdSense readiness** — unique titles, descriptions, canonicals, Open Graph; JSON-LD (WebSite, Organization, MedicalTest, FAQPage, Article, BreadcrumbList); six long-form guides; no broken links; mobile-first.
8. **Automation** — GitHub Actions: build.py (shared chrome, static test pages, sitemap) and update_news.py (NIH and FDA RSS) on push, daily and on demand; 404 fallback to the dynamic test page.
9. **Launch** — GitHub Pages from main/root; Actions read-write; custom domain lab.direct with GitHub Pages A records and HTTPS; activate FormSubmit; add payment links; Search Console; AdSense review.
10. **Growth** — 100+ tests, 50+ guides, city pages, affiliate links, newsletter platform, credentialed reviewer bylines, Spanish edition, paid lab partner portal.
