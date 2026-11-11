/* Lab.Direct — live news refresh. Pulls the latest NIH and FDA headlines in the browser and merges them
   with data/news.json, so the news list stays current even between site rebuilds. Fails silently. */
(function () {
  "use strict";
  var LD = window.LD, list = document.getElementById("news-list");
  if (!LD || !list || !window.fetch) return;
  var feeds = [
    ["NIH", "https://www.nih.gov/news-releases/feed.xml"],
    ["FDA", "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml"]
  ];
  function get(f) {
    return fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(f[1]))
      .then(function (r) { return r.ok ? r.json() : { items: [] }; })
      .then(function (j) {
        return (j.items || []).map(function (i) {
          var d = new Date(String(i.pubDate || "").replace(" ", "T"));
          return { title: i.title, link: i.link, source: f[0], date: isNaN(d) ? "" : d.toISOString().slice(0, 10) };
        });
      })
      .catch(function () { return []; });
  }
  Promise.all([LD.json("data/news.json").catch(function () { return { items: [] }; })].concat(feeds.map(get))).then(function (r) {
    var fresh = [].concat.apply([], r.slice(1));
    if (!fresh.length) return;
    var seen = {}, all = fresh.concat(r[0].items || []).filter(function (n) {
      var k = (n.title || "").toLowerCase(); if (!k || seen[k] || !/^https?:/.test(n.link || "")) return false; seen[k] = 1; return true;
    }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var lim = +list.getAttribute("data-limit") || 30;
    list.innerHTML = all.slice(0, lim).map(function (n) {
      return '<article class="news-item"><h3><a href="' + LD.esc(n.link) + '" target="_blank" rel="noopener">' + LD.esc(n.title) + '</a></h3><p class="small muted" style="margin:0">' + LD.esc(n.source) + ", " + LD.esc(n.date) + "</p></article>";
    }).join("");
    var u = document.getElementById("news-updated");
    if (u) u.textContent = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  });
})();
