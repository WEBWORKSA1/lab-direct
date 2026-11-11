#!/usr/bin/env python3
"""Lab.Direct site builder.

1. Re-applies the shared <head>, header and footer to every page between ld: markers,
   so site-wide changes are made once here.
2. Generates a static, SEO-ready page for every test in data/tests.json at tests/<slug>.html.
3. Rebuilds sitemap.xml (lastmod from git history when available).

Run from anywhere:  python3 scripts/build.py
"""
import datetime, html, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://lab.direct"
ADS = "ca-pub-6620975821265271"
OWNER_URL = "https://web.works/contact"
TODAY = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
esc = lambda s: html.escape(str(s), quote=True)

TUBES = {
    "lavender": "Lavender-top tube (EDTA)", "gold": "Gold-top tube (serum separator)", "gray": "Gray-top tube (fluoride)",
    "blue": "Light-blue-top tube (citrate)", "green": "Green-top tube (heparin)", "urine": "Urine cup",
    "swab": "Swab or urine sample", "kit": "At-home collection kit",
}

NAV = [("tests.html", "Tests"), ("decoder.html", "Decode results"), ("costs.html", "Prices"),
       ("find-a-lab.html", "Find a lab"), ("guides.html", "Guides"), ("videos.html", "Videos")]


def head(a, r):
    title, desc, path = a.get("title", "Lab.Direct"), a.get("desc", ""), a.get("path", "")
    url = SITE + "/" + path
    out = [
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        f"<title>{esc(title)}</title>",
        f'<meta name="description" content="{esc(desc)}">',
        f'<link rel="canonical" href="{esc(url)}">',
        f'<meta name="google-adsense-account" content="{ADS}">',
        '<meta property="og:site_name" content="Lab.Direct">',
        f'<meta property="og:type" content="{esc(a.get("type", "website"))}">',
        f'<meta property="og:title" content="{esc(title)}">',
        f'<meta property="og:description" content="{esc(desc)}">',
        f'<meta property="og:url" content="{esc(url)}">',
        '<meta name="twitter:card" content="summary">',
        '<meta name="theme-color" content="#14323A">',
    ]
    if a.get("noindex"):
        out.append('<meta name="robots" content="noindex">')
    out += [
        f'<link rel="icon" href="{r}favicon.svg" type="image/svg+xml">',
        f'<link rel="manifest" href="{r}site.webmanifest">',
        '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Public+Sans:wght@400;600;700&display=swap" rel="stylesheet">',
        f'<link rel="stylesheet" href="{r}assets/css/site.css">',
    ]
    if not a.get("noads"):
        out.append(f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={ADS}" crossorigin="anonymous"></script>')
    return "\n".join(out)


def header(r):
    links = "".join(f'<a href="{r}{h}">{t}</a>' for h, t in NAV)
    return (
        '<a class="skip" href="#main">Skip to content</a>\n'
        f'<div class="topbar"><a href="{OWNER_URL}" rel="noopener">Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership</a></div>\n'
        '<header class="site-header"><div class="wrap">'
        f'<a class="logo" href="{r}index.html" aria-label="Lab.Direct home">Lab<span class="dot"><span class="visually-hidden">.</span></span>Direct</a>'
        f'<nav class="nav" id="nav" aria-label="Main">{links}</nav>'
        '<div class="hdr-actions">'
        '<button class="icon-btn" type="button" data-open-search aria-label="Search tests and guides">'
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><kbd>/</kbd></button>'
        f'<a class="btn btn-gold btn-sm" href="{r}get-tested.html">Get my testing plan</a>'
        '<button class="icon-btn menu-btn" type="button" aria-controls="nav" aria-expanded="false" aria-label="Menu">'
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>'
        "</div></div></header>"
    )


def footer(r):
    return (
        '<footer class="site-footer" id="site-footer"><div class="wrap">'
        f'<p><a href="{r}about.html">About</a> &nbsp; <a href="{r}contact.html">Contact</a> &nbsp; <a href="{r}privacy.html">Privacy policy</a> &nbsp; '
        f'<a href="{r}terms.html">Terms of use</a> &nbsp; <a href="{r}disclaimer.html">Medical, trademark and copyright disclosure</a></p>'
        '<p>Lab.Direct is an independent educational publisher. Not medical advice. Not affiliated with Laboratory Corporation of America Holdings, '
        'Quest Diagnostics, or any company or program named "LabDirect" or similar. All trademarks belong to their owners.</p>'
        f"<p>© {TODAY[:4]} Lab.Direct. All rights reserved.</p></div></footer>\n"
        f'<script src="{r}assets/js/config.js"></script>\n<script src="{r}assets/js/site.js"></script>\n<script src="{r}assets/js/tools.js"></script>'
    )


ATTR = re.compile(r'(\w+)="([^"]*)"')
HEAD_RE = re.compile(r"<!-- ld:head(.*?)-->.*?<!-- /ld:head -->", re.S)
HDR_RE = re.compile(r"<!-- ld:header -->.*?<!-- /ld:header -->", re.S)
FTR_RE = re.compile(r"<!-- ld:footer -->.*?<!-- /ld:footer -->", re.S)


def chrome(text, depth):
    r = "../" * depth
    def h(m):
        attrs = dict(ATTR.findall(m.group(1)))
        for flag in ("noads", "noindex"):
            if re.search(r"\b%s\b(?!=)" % flag, m.group(1)):
                attrs[flag] = True
        return f"<!-- ld:head{m.group(1)}-->\n{head(attrs, r)}\n<!-- /ld:head -->"
    text = HEAD_RE.sub(h, text)
    text = HDR_RE.sub(lambda m: f"<!-- ld:header -->\n{header(r)}\n<!-- /ld:header -->", text)
    text = FTR_RE.sub(lambda m: f"<!-- ld:footer -->\n{footer(r)}\n<!-- /ld:footer -->", text)
    return re.sub(r'<body data-root="[^"]*"', f'<body data-root="{r}"', text)


def money(n):
    return "${:,}".format(int(n))


def test_page(t, by):
    p = t["price"]
    price = f"{money(p[0])}–{money(p[1])}"
    path = f"tests/{t['slug']}.html"
    title = f"{t['name']}: purpose, preparation, results and cost"
    desc = t["why"][:155]
    ld = [
        {"@context": "https://schema.org", "@type": "MedicalTest", "name": t["name"], "alternateName": t["aka"],
         "description": t["why"], "url": f"{SITE}/{path}"},
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in t["faq"]]},
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Tests", "item": SITE + "/tests.html"},
            {"@type": "ListItem", "position": 3, "name": t["name"], "item": f"{SITE}/{path}"}]},
    ]
    cap = lambda tube: f'<span class="cap cap-{esc(tube)}" title="{esc(TUBES.get(tube, ""))}"></span>'
    measures = "".join(f"<li>{esc(m)}</li>" for m in t["measures"])
    faq = "".join(f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in t["faq"])
    related = "".join(
        f'<li><a href="{esc(r)}.html" style="display:flex;gap:10px;align-items:center">{cap(by[r]["tube"])}{esc(by[r]["name"])}</a></li>'
        for r in t["related"] if r in by)
    kit = ("An at-home collection kit is available from several providers. " if t["kit"]
           else "This test needs a sample collected at a lab or clinic. ")
    body = f"""<main id="main">
<div class="page-head"><div class="wrap"><div class="crumbs"><a href="../index.html">Home</a> / <a href="../tests.html">Tests</a> / {esc(t['category'])}</div>
<h1 style="max-width:20ch">{esc(t['name'])}</h1><p class="lede">{esc(t['why'])}</p>
<div class="chips" style="margin-top:14px"><span class="pill-note">{cap(t['tube'])}{esc(TUBES.get(t['tube'], ''))}</span><span class="pill-note">Fasting: {esc(t['fasting'])}</span><span class="pill-note">Results: {esc(t['turnaround'])}</span><span class="pill-note">Typical cash price {price}</span></div>
<p class="byline"><span>Sample: {esc(t['sample'])}</span><span>Last reviewed: {TODAY}</span></p></div></div>
<section><div class="wrap article-grid"><div class="prose">
<h2>What it measures</h2><ul>{measures}</ul>
<h2>How to prepare</h2><p>{esc(t['prep'])}</p>
<h2>Reading your results</h2><p>{esc(t['results'])}</p>
<div class="callout">Your lab report's own reference range takes precedence over typical ranges. Use the <a href="../decoder.html">results decoder</a> to see where your numbers fall, then review them with a clinician.</div>
<h2>Who should consider it</h2><p>{esc(t['who'])}</p>
<h2>Cost and where to get it</h2><p>Typical direct-pay price: <strong>{price}</strong>. {kit}Compare totals in the <a href="../costs.html?tests={esc(t['slug'])}">price estimator</a> or <a href="../find-a-lab.html">find a lab near you</a>.</p>
<h2>Common questions</h2>{faq}
<h2>Videos</h2><div class="vgrid" data-videos="{esc(t['video'])}" data-limit="2"></div>
<p class="small muted" style="margin-top:28px">Also called: {esc(', '.join(t['aka']))}. Educational information compiled from public sources such as MedlinePlus (NIH), CDC and professional guidelines. Prices are estimated typical direct-pay ranges compiled from published prices at online direct-access providers, rounded; your price may differ. Not medical advice.</p></div>
<aside><div class="panel" style="margin-bottom:16px"><h3>Get this test for less</h3><p class="small">Tell us your ZIP code and we'll send lower-cost options for this test.</p>
<form data-form="test-quote" data-subject="Quote request: {esc(t['name'])}" data-success="Thanks. We'll email lower-cost options shortly."><input type="hidden" name="test" value="{esc(t['name'])}">
<div class="field"><label for="aq-email">Email</label><input id="aq-email" type="email" name="email" required></div>
<div class="field"><label for="aq-zip">ZIP or postal code</label><input id="aq-zip" type="text" name="zip" required></div>
<input class="hp" type="text" name="_honey" tabindex="-1" autocomplete="off">
<label class="check"><input type="checkbox" name="consent" value="yes" required> I agree to be contacted about this request.</label>
<button class="btn btn-gold" type="submit" style="width:100%;margin-top:12px">Get price options</button></form></div>
<div class="panel"><h3>Related tests</h3><ul class="list-plain">{related}</ul></div></aside></div></section>
</main>"""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<!-- ld:head title="{esc(title)} | Lab.Direct" desc="{esc(desc)}" path="{path}" type="article" -->
<!-- /ld:head -->
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
<body data-root="../">
<!-- ld:header --><!-- /ld:header -->
{body}
<!-- ld:footer --><!-- /ld:footer -->
</body>
</html>
"""


def git_date(path):
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", path], cwd=ROOT, capture_output=True, text=True, timeout=20).stdout.strip()
        return out or TODAY
    except Exception:
        return TODAY


def main():
    tests = json.load(open(os.path.join(ROOT, "data", "tests.json"), encoding="utf-8"))
    by = {t["slug"]: t for t in tests}
    tdir = os.path.join(ROOT, "tests")
    os.makedirs(tdir, exist_ok=True)
    keep = set()
    for t in tests:
        fn = os.path.join(tdir, t["slug"] + ".html")
        keep.add(os.path.basename(fn))
        new = chrome(test_page(t, by), 1)
        old = open(fn, encoding="utf-8").read() if os.path.exists(fn) else ""
        # keep the old "last reviewed" date unless content changed
        if old and re.sub(r"Last reviewed: \d{4}-\d{2}-\d{2}|© \d{4}", "", old) == re.sub(r"Last reviewed: \d{4}-\d{2}-\d{2}|© \d{4}", "", new):
            continue
        open(fn, "w", encoding="utf-8").write(new)
    for f in os.listdir(tdir):
        if f.endswith(".html") and f not in keep:
            os.remove(os.path.join(tdir, f))

    pages = []
    for d, depth in (("", 0), ("guides", 1)):
        for f in sorted(os.listdir(os.path.join(ROOT, d) if d else ROOT)):
            if not f.endswith(".html"):
                continue
            rel = f"{d}/{f}" if d else f
            fn = os.path.join(ROOT, rel)
            src = open(fn, encoding="utf-8").read()
            out = chrome(src, depth)
            if out != src:
                open(fn, "w", encoding="utf-8").write(out)
            if f in ("404.html", "test.html") or "noindex" in src[:600]:
                continue
            pages.append(rel)
    pages += [f"tests/{t['slug']}.html" for t in tests]

    urls = []
    for rel in pages:
        loc = SITE + "/" + ("" if rel == "index.html" else rel)
        pr = "1.0" if rel == "index.html" else "0.8" if rel.startswith(("tests/", "guides/")) or rel in ("tests.html", "decoder.html", "costs.html", "get-tested.html") else "0.6"
        urls.append(f"  <url><loc>{loc}</loc><lastmod>{git_date(rel)}</lastmod><priority>{pr}</priority></url>")
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>\n"
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(sm)
    print(f"built {len(tests)} test pages, {len(pages)} sitemap URLs")


if __name__ == "__main__":
    sys.exit(main())
