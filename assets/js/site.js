/* Lab.Direct — shared site behaviour: nav, footer, search, forms, hidden contact, cookies, video embeds. */
(function () {
  "use strict";
  var C = window.LD_CONFIG || {};
  var ROOT = document.body.getAttribute("data-root") || "";
  var LD = (window.LD = window.LD || {});
  LD.root = ROOT;

  /* ---------- helpers ---------- */
  LD.$ = function (s, el) { return (el || document).querySelector(s); };
  LD.$$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  LD.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  LD.money = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };
  var cache = {};
  LD.json = function (path) {
    if (!cache[path]) cache[path] = fetch(ROOT + path, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(path); return r.json(); });
    return cache[path];
  };
  LD.tubeLabel = {
    lavender: "Lavender-top tube (EDTA)", gold: "Gold-top tube (serum separator)", gray: "Gray-top tube (fluoride)",
    blue: "Light-blue-top tube (citrate)", green: "Green-top tube (heparin)", urine: "Urine cup", swab: "Swab or urine sample", kit: "At-home collection kit"
  };
  LD.cap = function (tube) { return '<span class="cap cap-' + LD.esc(tube) + '" title="' + LD.esc(LD.tubeLabel[tube] || "") + '"></span>'; };
  LD.testUrl = function (slug) { return ROOT + "tests/" + encodeURIComponent(slug) + ".html"; };

  /* ---------- hidden owner inbox ---------- */
  function inbox() { var k = C._k || [], o = C._o || 0, s = ""; for (var i = k.length - 1; i >= 0; i--) s += String.fromCharCode(k[i] - o); return s; }
  LD.mailto = function (subject, body) {
    window.location.href = "mai" + "lto:" + inbox() + "?subject=" + encodeURIComponent(subject || "Lab.Direct inquiry") + (body ? "&body=" + encodeURIComponent(body) : "");
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-email]");
    if (!a) return;
    e.preventDefault();
    LD.mailto(a.getAttribute("data-email") || "Lab.Direct inquiry");
  });

  /* ---------- attribution (utm / ref) ---------- */
  try {
    var qs = new URLSearchParams(location.search), keep = {};
    ["utm_source", "utm_medium", "utm_campaign", "ref"].forEach(function (k) { if (qs.get(k)) keep[k] = qs.get(k).slice(0, 80); });
    if (Object.keys(keep).length) sessionStorage.setItem("ld_attr", JSON.stringify(keep));
  } catch (e) {}
  function attribution() { try { return JSON.parse(sessionStorage.getItem("ld_attr") || "{}"); } catch (e) { return {}; } }

  /* ---------- form submission (FormSubmit AJAX) ---------- */
  LD.submit = function (data, subject) {
    var target = C.formAlias ? C.formAlias : inbox();
    var payload = Object.assign({}, data, attribution(), {
      _subject: subject || "Lab.Direct form",
      _template: "table",
      page: location.href,
      submitted_at: new Date().toISOString()
    });
    return fetch("https://formsubmit.co/ajax/" + target, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === "false" || j.success === false) throw new Error(j.message || "Send failed"); return j; }); });
  };
  function formToObject(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) { if (k === "_honey") return; o[k] = o[k] ? o[k] + ", " + v : v; });
    return o;
  }
  LD.bindForm = function (form, opts) {
    opts = opts || {};
    var msg = form.querySelector(".form-msg");
    if (!msg) { msg = document.createElement("div"); msg.className = "form-msg"; msg.setAttribute("role", "status"); form.appendChild(msg); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector("[name=_honey]") && form.querySelector("[name=_honey]").value) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector("[type=submit]"), label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      var data = formToObject(form);
      if (opts.extra) Object.assign(data, opts.extra());
      data.form = form.getAttribute("data-form") || "form";
      LD.submit(data, form.getAttribute("data-subject"))
        .then(function () {
          msg.className = "form-msg ok";
          msg.textContent = form.getAttribute("data-success") || "Received. We'll reply within one business day.";
          form.dispatchEvent(new CustomEvent("ld:sent", { detail: data }));
          if (!opts.keep) form.reset();
        })
        .catch(function () {
          msg.className = "form-msg err";
          msg.innerHTML = 'That didn\'t send. Check your connection and try again, or <a href="#" data-email="' + LD.esc(form.getAttribute("data-subject") || "Lab.Direct inquiry") + '">email us directly</a>.';
        })
        .then(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
    });
  };
  LD.$$("form[data-form]").forEach(function (f) { if (!f.hasAttribute("data-manual")) LD.bindForm(f); });

  /* ---------- nav ---------- */
  var menuBtn = LD.$(".menu-btn"), nav = LD.$(".nav");
  if (menuBtn && nav) menuBtn.addEventListener("click", function () { var o = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", o); });
  var here = location.pathname.split("/").pop() || "index.html";
  LD.$$(".nav a").forEach(function (a) { if (a.getAttribute("href").split("/").pop() === here) a.setAttribute("aria-current", "page"); });

  /* ---------- footer ---------- */
  var foot = LD.$("#site-footer");
  if (foot) {
    var y = new Date().getFullYear();
    foot.innerHTML =
      '<div class="wrap"><div class="fgrid">' +
      '<div><a class="logo" href="' + ROOT + 'index.html">Lab<span class="dot"></span>Direct</a>' +
      '<p style="margin-top:12px;max-width:30em">Independent, plain-language guides to direct-access lab tests: what they measure, what results mean, what they cost and where to get them.</p>' +
      '<form class="news-form" data-form="newsletter" data-subject="Lab Notes newsletter signup" data-success="You\'re on the list for Lab Notes.">' +
      '<label class="visually-hidden" for="nl-email">Email</label><input id="nl-email" type="email" name="email" placeholder="Your email" required>' +
      '<input class="hp" type="text" name="_honey" tabindex="-1" autocomplete="off"><button class="btn btn-gold btn-sm" type="submit">Subscribe</button></form></div>' +
      '<div><h4>Tests and tools</h4><ul><li><a href="' + ROOT + 'tests.html">Test library</a></li><li><a href="' + ROOT + 'decoder.html">Results decoder</a></li><li><a href="' + ROOT + 'costs.html">Price estimator</a></li><li><a href="' + ROOT + 'find-a-lab.html">Find a lab</a></li><li><a href="' + ROOT + 'get-tested.html">Get a testing plan</a></li></ul></div>' +
      '<div><h4>Learn</h4><ul><li><a href="' + ROOT + 'guides.html">Guides</a></li><li><a href="' + ROOT + 'videos.html">Videos</a></li><li><a href="' + ROOT + 'news.html">Health news</a></li><li><a href="' + ROOT + 'resources.html">Resources and glossary</a></li></ul></div>' +
      '<div><h4>Community</h4><ul><li><a href="' + ROOT + 'support.html">Support Lab.Direct</a></li><li><a href="' + ROOT + 'contests.html">Contests and prizes</a></li><li><a href="' + ROOT + 'careers.html">Careers</a></li><li><a href="' + ROOT + 'advertise.html">Advertise and partner</a></li></ul></div>' +
      '<div><h4>Company</h4><ul><li><a href="' + ROOT + 'about.html">About and editorial policy</a></li><li><a href="' + ROOT + 'contact.html">Contact</a></li><li><a href="#" data-email="Lab.Direct inquiry">Email us</a></li><li><a href="' + (C.ownerContactUrl || "https://web.works/contact") + '" rel="noopener">Buy this domain or site</a></li></ul></div>' +
      '</div><div class="flegal"><nav aria-label="Legal"><a href="' + ROOT + 'privacy.html">Privacy policy</a><a href="' + ROOT + 'terms.html">Terms of use</a><a href="' + ROOT + 'disclaimer.html">Medical, trademark and copyright disclosure</a><a href="#" id="cookie-prefs">Cookie preferences</a><a href="' + ROOT + 'sitemap.xml">Sitemap</a></nav>' +
      '<p style="margin:0">Lab.Direct is an independent educational publisher. It is not a laboratory, does not provide medical advice and is not affiliated with Laboratory Corporation of America Holdings (Labcorp), Quest Diagnostics, or any company, product or program named "LabDirect" or similar. All trademarks belong to their owners and are used only to identify their products. Information is general education; always follow your clinician and your lab\'s own reference ranges. In an emergency, call 911 or your local emergency number.</p>' +
      '<p style="margin:0">© ' + y + ' Lab.Direct. All rights reserved. Original text, data compilations, tools and design are protected by copyright.</p></div></div>';
    LD.bindForm(LD.$(".news-form", foot));
  }

  /* ---------- cookie notice ---------- */
  var ck = document.createElement("div");
  ck.className = "cookie"; ck.setAttribute("role", "dialog"); ck.setAttribute("aria-label", "Cookie notice");
  ck.innerHTML = 'Lab.Direct uses cookies for basic site features and Google AdSense advertising, which may use cookies to show ads based on your visits here and elsewhere. See our <a href="' + ROOT + 'privacy.html">privacy policy</a> or opt out of personalised ads at <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a>.' +
    '<div class="row-btns"><button class="btn btn-gold btn-sm" data-ck="all">Accept</button><button class="btn btn-ghost btn-sm" style="color:#fff;border-color:#557" data-ck="essential">Essential only</button></div>';
  document.body.appendChild(ck);
  function ckSet(v) { try { localStorage.setItem("ld_cookie", v); } catch (e) {} ck.classList.remove("show"); if (v === "essential") { (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1; } }
  var ckv = null; try { ckv = localStorage.getItem("ld_cookie"); } catch (e) {}
  if (!ckv) setTimeout(function () { ck.classList.add("show"); }, 900);
  else if (ckv === "essential") (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1;
  ck.addEventListener("click", function (e) { var b = e.target.getAttribute("data-ck"); if (b) ckSet(b); });
  document.addEventListener("click", function (e) { if (e.target.id === "cookie-prefs") { e.preventDefault(); ck.classList.add("show"); } });

  /* ---------- lite YouTube embeds ---------- */
  LD.lite = function (scope) {
    LD.$$("[data-yt]", scope).forEach(function (el) {
      if (el.dataset.ready) return; el.dataset.ready = 1;
      var id = el.getAttribute("data-yt");
      el.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
      el.addEventListener("click", function () {
        el.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="' + LD.esc(el.getAttribute("aria-label") || "Video") + '" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
      }, { once: true });
    });
  };
  LD.videoCard = function (v) {
    return '<article class="video"><button class="lite" data-yt="' + LD.esc(v.id) + '" aria-label="Play: ' + LD.esc(v.title) + '"></button><div class="meta"><h3>' + LD.esc(v.title) + '</h3><p>' + LD.esc(v.about) + ' <a href="https://www.youtube.com/watch?v=' + LD.esc(v.id) + '" rel="noopener" target="_blank">Watch on YouTube</a></p></div></article>';
  };
  LD.renderVideos = function (el, filter, limit) {
    if (!el) return;
    LD.json("data/videos.json").then(function (vs) {
      var list = vs.filter(function (v) { return !filter || v.tags.indexOf(filter) > -1; });
      if (limit) list = list.slice(0, limit);
      el.innerHTML = list.map(LD.videoCard).join("") || '<p class="muted">No videos yet for this topic.</p>';
      LD.lite(el);
    });
  };
  LD.lite(document);
  LD.$$("[data-videos]").forEach(function (el) { LD.renderVideos(el, el.getAttribute("data-videos") || "", +el.getAttribute("data-limit") || 0); });

  /* ---------- search palette ---------- */
  var pal = document.createElement("div");
  pal.className = "palette"; pal.setAttribute("role", "dialog"); pal.setAttribute("aria-label", "Search Lab.Direct");
  pal.innerHTML = '<div class="palette-box"><label class="visually-hidden" for="pal-q">Search tests, guides and tools</label><input id="pal-q" type="search" placeholder="Search tests, guides and tools — try “A1c”, “fasting”, “thyroid”" autocomplete="off"><div class="palette-res" id="pal-res"></div></div>';
  document.body.appendChild(pal);
  var palQ = LD.$("#pal-q"), palRes = LD.$("#pal-res"), index = null, sel = 0;
  var pages = [
    { t: "Results decoder", u: "decoder.html", k: "decode results report reference range interpret", g: "Tool" },
    { t: "Price estimator", u: "costs.html", k: "price cost cash estimate cheap quote", g: "Tool" },
    { t: "Find a lab near you", u: "find-a-lab.html", k: "lab near me location map walk-in zip", g: "Tool" },
    { t: "Get a personalised testing plan", u: "get-tested.html", k: "plan quiz recommend which test", g: "Tool" },
    { t: "Video library", u: "videos.html", k: "video youtube watch explained", g: "Page" },
    { t: "Support Lab.Direct", u: "support.html", k: "donate donation support give", g: "Page" },
    { t: "Contests and prizes", u: "contests.html", k: "contest prize quiz win giveaway", g: "Page" },
    { t: "Careers", u: "careers.html", k: "jobs hiring careers writer reviewer", g: "Page" },
    { t: "Advertise and partner", u: "advertise.html", k: "advertise sponsor partnership media kit", g: "Page" },
    { t: "Contact", u: "contact.html", k: "contact email message", g: "Page" }
  ];
  function buildIndex() {
    if (index) return Promise.resolve(index);
    return Promise.all([LD.json("data/tests.json").catch(function () { return []; }), LD.json("data/guides.json").catch(function () { return []; })]).then(function (r) {
      index = r[0].map(function (t) { return { t: t.name, u: "tests/" + t.slug + ".html", k: (t.aka || []).join(" ") + " " + t.category + " " + t.measures.join(" "), g: "Test", cap: t.tube }; })
        .concat(r[1].map(function (g) { return { t: g.title, u: "guides/" + g.slug + ".html", k: g.summary, g: "Guide" }; }))
        .concat(pages);
      return index;
    });
  }
  function score(item, q) {
    var t = item.t.toLowerCase(), k = (item.k || "").toLowerCase(), s = 0;
    q.split(/\s+/).forEach(function (w) { if (!w) return; if (t.indexOf(w) === 0) s += 6; else if (t.indexOf(w) > -1) s += 4; else if (k.indexOf(w) > -1) s += 2; else s -= 3; });
    return s;
  }
  function renderPal() {
    var q = palQ.value.trim().toLowerCase();
    buildIndex().then(function (ix) {
      var list = q ? ix.map(function (i) { return [score(i, q), i]; }).filter(function (p) { return p[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 12).map(function (p) { return p[1]; }) : ix.filter(function (i) { return i.g !== "Test"; }).slice(0, 8);
      sel = 0;
      palRes.innerHTML = list.length ? list.map(function (i, n) { return '<a href="' + ROOT + i.u + '"' + (n === 0 ? ' class="sel"' : "") + ">" + (i.cap ? LD.cap(i.cap) : "") + "<span>" + LD.esc(i.t) + "</span><small>" + i.g + "</small></a>"; }).join("") : '<div class="empty">No match. Try a test name like “ferritin” or a goal like “energy”.</div>';
    });
  }
  LD.openSearch = function (q) { pal.classList.add("open"); palQ.value = q || ""; renderPal(); palQ.focus(); };
  function closePal() { pal.classList.remove("open"); }
  palQ.addEventListener("input", renderPal);
  palQ.addEventListener("keydown", function (e) {
    var links = LD.$$("a", palRes);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!links.length) return; links[sel].classList.remove("sel"); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length; links[sel].classList.add("sel"); links[sel].scrollIntoView({ block: "nearest" }); }
    if (e.key === "Enter" && links[sel]) { location.href = links[sel].href; }
  });
  pal.addEventListener("click", function (e) { if (e.target === pal) closePal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePal();
    var typing = /input|textarea|select/i.test((document.activeElement || {}).tagName || "");
    if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); LD.openSearch(); }
  });
  LD.$$("[data-open-search]").forEach(function (b) { b.addEventListener("click", function () { LD.openSearch(); }); });
  LD.$$("form[data-search]").forEach(function (f) { f.addEventListener("submit", function (e) { e.preventDefault(); LD.openSearch(f.querySelector("input").value); }); });

  /* ---------- sticky mobile CTA ---------- */
  var sticky = LD.$(".sticky-cta");
  if (sticky) window.addEventListener("scroll", function () { sticky.classList.toggle("show", window.scrollY > 700); }, { passive: true });

  /* ---------- dynamic stamps ---------- */
  LD.$$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
