#!/usr/bin/env python3
"""Pull public health news (NIH, FDA) into data/news.json. Keeps the newest 30 items.
Failed feeds are skipped, so the file is never emptied by a temporary outage."""
import datetime, email.utils, json, os, re, urllib.request, xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "news.json")
FEEDS = [
    ("NIH", "https://www.nih.gov/news-releases/feed.xml"),
    ("FDA", "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml"),
]
UA = {"User-Agent": "Mozilla/5.0 (compatible; LabDirectNewsBot/1.0; +https://lab.direct)"}


def parse_date(s):
    s = (s or "").strip()
    try:
        return email.utils.parsedate_to_datetime(s).strftime("%Y-%m-%d")
    except Exception:
        pass
    m = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", s)  # NIH style: Fri, 10/23/2026 - 13:00
    if m:
        return f"{m.group(3)}-{int(m.group(1)):02d}-{int(m.group(2)):02d}"
    m = re.search(r"\d{4}-\d{2}-\d{2}", s)
    return m.group(0) if m else datetime.date.today().isoformat()


def fetch(source, url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        root = ET.fromstring(r.read())
    items = []
    for it in root.iter("item"):
        title = (it.findtext("title") or "").strip()
        link = (it.findtext("link") or "").strip()
        if title and link.startswith("http"):
            items.append({"title": re.sub(r"\s+", " ", title), "link": link, "source": source, "date": parse_date(it.findtext("pubDate"))})
    return items[:20]


def main():
    try:
        old = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        old = {"items": []}
    fresh = []
    for source, url in FEEDS:
        try:
            fresh += fetch(source, url)
            print(f"{source}: ok")
        except Exception as e:
            print(f"{source}: skipped ({e})")
    if not fresh:
        print("no feeds reachable; leaving news.json unchanged")
        return
    seen, merged = set(), []
    for n in sorted(fresh + old.get("items", []), key=lambda x: x["date"], reverse=True):
        key = n["title"].lower()
        if key in seen:
            continue
        seen.add(key)
        merged.append(n)
    merged = merged[:30]
    if merged == old.get("items"):
        print("no change")
        return
    json.dump({"updated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "items": merged}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"wrote {len(merged)} items")


if __name__ == "__main__":
    main()
