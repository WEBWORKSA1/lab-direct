/* Lab.Direct — interactive tools: mini report, test library, test pages, decoder, price estimator,
   lab finder, testing-plan funnel, Lab IQ quiz, support page, news and guides lists. */
(function () {
  "use strict";
  var LD = window.LD, $ = LD.$, $$ = LD.$$, esc = LD.esc, C = window.LD_CONFIG || {};
  var qs = new URLSearchParams(location.search);

  /* ---------- range engine ---------- */
  function pick(v, sex) { return v && !Array.isArray(v) && typeof v === "object" ? v[sex || "m"] : v; }
  function classify(a, val, sex) {
    var bands = pick(a.bands, sex);
    for (var i = 0; i < bands.length; i++) if (bands[i][0] === null || val < bands[i][0]) return { label: bands[i][1], tone: bands[i][2], i: i };
    return null;
  }
  function barHTML(a, val, sex) {
    var bands = pick(a.bands, sex), sc = pick(a.scale, sex), lo = sc[0], hi = sc[1], prev = lo, out = "";
    bands.forEach(function (b) {
      var end = b[0] === null ? hi : Math.min(Math.max(b[0], lo), hi);
      var left = (prev - lo) / (hi - lo) * 100, w = (end - prev) / (hi - lo) * 100;
      if (w > 0) out += '<span class="z ' + (b[2] === "N" ? "ok" : b[2] === "B" ? "bd" : "hi") + '" style="left:' + left + "%;width:" + w + '%" title="' + esc(b[1]) + '"></span>';
      prev = end;
    });
    var pos = val == null || isNaN(val) ? null : Math.max(0, Math.min(100, (val - lo) / (hi - lo) * 100));
    return '<div class="rbar" aria-hidden="true">' + out + (pos == null ? "" : '<span class="pin" style="left:' + pos + '%"></span>') + "</div>";
  }
  function flagHTML(c) { if (!c) return '<span class="flag"></span>'; var t = c.tone === "N" ? "N" : c.tone; return '<span class="flag ' + t + '" title="' + esc(c.label) + '">' + (t === "N" ? "✓" : t === "B" ? "B" : t) + "</span>"; }
  LD.classify = classify;

  /* ---------- hero mini report ---------- */
  var mini = $("#mini-report");
  if (mini) LD.json("data/analytes.json").then(function (all) {
    var ids = ["glucose", "ldl", "hdl", "vitd"], vals = { glucose: 104, ldl: 132, hdl: 47, vitd: 18 }, sex = "f";
    var list = ids.map(function (id) { return all.filter(function (a) { return a.id === id; })[0]; });
    var body = $(".report-body", mini);
    function draw() {
      body.innerHTML = list.map(function (a) {
        var v = vals[a.id], c = classify(a, v, sex);
        return '<div class="rrow"><div class="an">' + esc(a.name) + "<small>" + esc(a.unit) + ' · <span data-lbl="' + a.id + '">' + esc(c ? c.label : "") + '</span></small></div><input inputmode="decimal" aria-label="' + esc(a.name) + ' value" data-id="' + a.id + '" value="' + v + '">' + barHTML(a, v, sex) + flagHTML(c) + "</div>";
      }).join("");
    }
    draw();
    body.addEventListener("input", function (e) {
      var id = e.target.getAttribute("data-id"); if (!id) return;
      var v = parseFloat(e.target.value); vals[id] = isNaN(v) ? null : v;
      var a = list.filter(function (x) { return x.id === id; })[0], row = e.target.closest(".rrow"), c = isNaN(v) ? null : classify(a, v, sex);
      row.querySelector(".rbar").outerHTML = barHTML(a, vals[id], sex);
      row.querySelector(".flag").outerHTML = flagHTML(c);
      row.querySelector("[data-lbl]").textContent = c ? c.label : "";
    });
    $$(".seg button", mini).forEach(function (b) { b.addEventListener("click", function () { sex = b.getAttribute("data-sex"); $$(".seg button", mini).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); draw(); }); });
  });

  /* ---------- test rows ---------- */
  function rowHTML(t) {
    return '<a class="row" href="' + LD.testUrl(t.slug) + '">' + LD.cap(t.tube) + '<div><h3>' + esc(t.name) + "</h3><p>" + esc(t.category) + " — " + esc(t.sample) + (t.fasting === "Yes" ? ' <span class="tag fast">Fasting</span>' : "") + (t.kit ? ' <span class="tag kit">At-home option</span>' : "") + '</p></div><div class="price">' + LD.money(t.price[0]) + "–" + LD.money(t.price[1]) + "<small>typical cash price</small></div></a>";
  }
  LD.rowHTML = rowHTML;
  var pop = $("#popular-tests");
  if (pop) LD.json("data/tests.json").then(function (ts) { pop.innerHTML = ts.filter(function (t) { return t.popular; }).slice(0, 8).map(rowHTML).join(""); });
  var totd = $("#totd");
  if (totd) LD.json("data/tests.json").then(function (ts) {
    var d = new Date(), n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5), t = ts[n % ts.length];
    totd.innerHTML = '<p class="small muted" style="margin:0 0 6px">Test of the day, ' + d.toLocaleDateString("en-US", { month: "long", day: "numeric" }) + '</p><h3 style="display:flex;gap:10px;align-items:center">' + LD.cap(t.tube) + esc(t.name) + "</h3><p>" + esc(t.why) + '</p><a class="btn btn-ghost btn-sm" href="' + LD.testUrl(t.slug) + '">Read the full guide</a>';
  });

  /* ---------- test library ---------- */
  var lib = $("#test-library");
  if (lib) LD.json("data/tests.json").then(function (ts) {
    var cats = ["All"].concat(ts.map(function (t) { return t.category; }).filter(function (c, i, a) { return a.indexOf(c) === i; }).sort());
    var state = { cat: qs.get("cat") || "All", q: qs.get("q") || "", fasting: false, kit: false, sort: "popular" };
    var chips = $("#lib-cats"), q = $("#lib-q"), out = $("#lib-rows"), count = $("#lib-count");
    chips.innerHTML = cats.map(function (c) { return '<button class="chip" type="button" aria-pressed="' + (c === state.cat) + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");
    q.value = state.q;
    function draw() {
      var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      var list = ts.filter(function (t) {
        if (state.cat !== "All" && t.category !== state.cat) return false;
        if (state.fasting && t.fasting !== "No") return false;
        if (state.kit && !t.kit) return false;
        var hay = (t.name + " " + t.aka.join(" ") + " " + t.measures.join(" ") + " " + t.category).toLowerCase();
        return words.every(function (w) { return hay.indexOf(w) > -1; });
      });
      list.sort(function (a, b) { return state.sort === "price" ? a.price[0] - b.price[0] : state.sort === "az" ? a.name.localeCompare(b.name) : (b.popular - a.popular) || a.name.localeCompare(b.name); });
      out.innerHTML = list.map(rowHTML).join("") || '<div class="empty">No tests match. Clear a filter or <button class="linkish" data-reset>show all tests</button>.</div>';
      count.textContent = list.length + " of " + ts.length + " tests";
    }
    chips.addEventListener("click", function (e) { var c = e.target.getAttribute("data-cat"); if (!c) return; state.cat = c; $$(".chip", chips).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-cat") === c); }); draw(); });
    q.addEventListener("input", function () { state.q = q.value; draw(); });
    $("#lib-fasting").addEventListener("change", function (e) { state.fasting = e.target.checked; draw(); });
    $("#lib-kit").addEventListener("change", function (e) { state.kit = e.target.checked; draw(); });
    $("#lib-sort").addEventListener("change", function (e) { state.sort = e.target.value; draw(); });
    out.addEventListener("click", function (e) { if (e.target.hasAttribute("data-reset")) { state = { cat: "All", q: "", fasting: false, kit: false, sort: "popular" }; q.value = ""; $("#lib-fasting").checked = false; $("#lib-kit").checked = false; $$(".chip", chips).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-cat") === "All"); }); draw(); } });
    draw();
  });

  /* ---------- test detail (dynamic fallback page) ---------- */
  var det = $("#test-detail");
  if (det) LD.json("data/tests.json").then(function (ts) {
    var slug = qs.get("t") || det.getAttribute("data-slug"), t = ts.filter(function (x) { return x.slug === slug; })[0];
    if (!t) { det.innerHTML = '<div class="wrap" style="padding:60px 20px"><h1>Test not found</h1><p>Try the <a href="tests.html">test library</a> or search.</p></div>'; return; }
    document.title = t.name + ": purpose, preparation, results and cost | Lab.Direct";
    var md = $('meta[name="description"]'); if (md) md.setAttribute("content", t.why);
    var canon = $('link[rel="canonical"]'); if (canon) canon.href = (C.siteUrl || "") + "/tests/" + t.slug + ".html";
    var byslug = {}; ts.forEach(function (x) { byslug[x.slug] = x; });
    det.innerHTML = LD.testPageHTML(t, byslug);
    LD.bindForm($("#aside-quote"));
    LD.renderVideos($("#test-videos"), t.video, 2);
  });
  LD.testPageHTML = function (t, byslug) {
    return '<div class="page-head"><div class="wrap"><div class="crumbs"><a href="' + LD.root + 'index.html">Home</a> / <a href="' + LD.root + 'tests.html">Tests</a> / ' + esc(t.category) + "</div>" +
      '<h1 style="max-width:20ch">' + esc(t.name) + '</h1><p class="lede">' + esc(t.why) + '</p><div class="chips" style="margin-top:14px"><span class="pill-note">' + LD.cap(t.tube) + esc(LD.tubeLabel[t.tube]) + '</span><span class="pill-note">Fasting: ' + esc(t.fasting) + '</span><span class="pill-note">Results: ' + esc(t.turnaround) + '</span><span class="pill-note">Typical cash price ' + LD.money(t.price[0]) + "–" + LD.money(t.price[1]) + "</span></div></div></div>" +
      '<section><div class="wrap article-grid"><div class="prose">' +
      "<h2>What it measures</h2><ul>" + t.measures.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + "</ul>" +
      "<h2>How to prepare</h2><p>" + esc(t.prep) + "</p><h2>Reading your results</h2><p>" + esc(t.results) + '</p><div class="callout">Your lab report\'s own reference range takes precedence over typical ranges. Use the <a href="' + LD.root + 'decoder.html">results decoder</a> to see where your numbers fall, then review them with a clinician.</div>' +
      "<h2>Who should consider it</h2><p>" + esc(t.who) + "</p>" +
      "<h2>Cost and where to get it</h2><p>Typical direct-pay price: <strong>" + LD.money(t.price[0]) + "–" + LD.money(t.price[1]) + "</strong>. " + (t.kit ? "An at-home collection kit is available from several providers. " : "This test needs a sample collected at a lab or clinic. ") + 'Compare totals in the <a href="' + LD.root + 'costs.html">price estimator</a> or <a href="' + LD.root + 'find-a-lab.html">find a lab near you</a>.</p>' +
      "<h2>Common questions</h2>" + t.faq.map(function (f) { return "<details><summary>" + esc(f[0]) + "</summary><p>" + esc(f[1]) + "</p></details>"; }).join("") +
      '<h2>Videos</h2><div class="vgrid" id="test-videos"></div>' +
      '<p class="small muted" style="margin-top:28px">Also called: ' + esc(t.aka.join(", ")) + ". Educational information compiled from public sources such as MedlinePlus (NIH), CDC and professional guidelines. Not medical advice.</p></div>" +
      '<aside><div class="panel" style="margin-bottom:16px"><h3>Get this test for less</h3><p class="small">Tell us your ZIP code and we\'ll send lower-cost options for this test.</p>' +
      '<form data-form="test-quote" data-subject="Quote request: ' + esc(t.name) + '" data-success="Thanks. We\'ll email lower-cost options shortly." id="aside-quote"><input type="hidden" name="test" value="' + esc(t.name) + '"><div class="field"><label for="aq-email">Email</label><input id="aq-email" type="email" name="email" required></div><div class="field"><label for="aq-zip">ZIP or postal code</label><input id="aq-zip" type="text" name="zip" required></div><input class="hp" type="text" name="_honey" tabindex="-1" autocomplete="off"><label class="check"><input type="checkbox" name="consent" value="yes" required> I agree to be contacted about this request.</label><button class="btn btn-gold" type="submit" style="width:100%;margin-top:12px">Get price options</button></form></div>' +
      '<div class="panel"><h3>Related tests</h3><ul class="list-plain">' + t.related.map(function (r) { var x = byslug[r]; return x ? '<li><a href="' + LD.testUrl(r) + '" style="display:flex;gap:10px;align-items:center">' + LD.cap(x.tube) + esc(x.name) + "</a></li>" : ""; }).join("") + "</ul></div></aside></div></section>";
  };

  /* ---------- results decoder ---------- */
  var dec = $("#decoder");
  if (dec) LD.json("data/analytes.json").then(function (all) {
    var sex = "f", chosen = (qs.get("a") || "glucose,a1c,ldl,hdl,tg,hgb,vitd,tsh").split(","), vals = {};
    var picker = $("#dec-picker"), rows = $("#dec-rows"), sum = $("#dec-summary");
    var groups = all.map(function (a) { return a.group; }).filter(function (g, i, arr) { return arr.indexOf(g) === i; });
    picker.innerHTML = groups.map(function (g) {
      return '<fieldset style="border:0;padding:0;margin:0 0 12px"><legend class="small muted" style="margin-bottom:6px">' + esc(g) + '</legend><div class="chips">' + all.filter(function (a) { return a.group === g; }).map(function (a) { return '<button type="button" class="chip" data-a="' + a.id + '" aria-pressed="' + (chosen.indexOf(a.id) > -1) + '">' + esc(a.name) + "</button>"; }).join("") + "</div></fieldset>";
    }).join("");
    function draw() {
      var list = all.filter(function (a) { return chosen.indexOf(a.id) > -1; });
      rows.innerHTML = list.length ? list.map(function (a) {
        var v = vals[a.id], c = v == null ? null : classify(a, v, sex);
        return '<div class="rrow" data-row="' + a.id + '"><div class="an">' + esc(a.name) + "<small>" + esc(a.unit) + (c ? " · " + esc(c.label) : "") + '</small></div><input inputmode="decimal" aria-label="' + esc(a.name) + ' in ' + esc(a.unit) + '" data-id="' + a.id + '" value="' + (v == null ? "" : v) + '" placeholder="—">' + barHTML(a, v, sex) + flagHTML(c) + "</div>";
      }).join("") : '<div class="empty">Pick the results you have from the list.</div>';
      summary();
    }
    function summary() {
      var list = all.filter(function (a) { return chosen.indexOf(a.id) > -1 && vals[a.id] != null; });
      if (!list.length) { sum.innerHTML = '<p class="muted">Enter values above to see a plain-language summary.</p>'; return; }
      var flagged = 0;
      sum.innerHTML = list.map(function (a) {
        var c = classify(a, vals[a.id], sex), note = c.tone === "N" ? "Within the typical range." : (c.tone === "L" ? a.low : a.high) || "Outside the typical range; review with a clinician.";
        if (c.tone !== "N") flagged++;
        return '<div class="news-item"><h3 style="display:flex;gap:10px;align-items:center">' + flagHTML(c) + esc(a.name) + ": " + vals[a.id] + " " + esc(a.unit) + ' <span class="tag">' + esc(c.label) + "</span></h3><p>" + esc(note) + ' <span class="small muted">Source: ' + esc(a.src) + '. <a href="' + LD.testUrl(a.test) + '">About this test</a></span></p></div>';
      }).join("") + '<p class="small muted" style="margin-top:14px">' + flagged + " of " + list.length + " values outside typical adult ranges. Ranges differ by lab, age, pregnancy and method; the range printed on your report wins. This is education, not a diagnosis.</p>";
    }
    picker.addEventListener("click", function (e) { var id = e.target.getAttribute("data-a"); if (!id) return; var on = chosen.indexOf(id) > -1; if (on) chosen.splice(chosen.indexOf(id), 1); else chosen.push(id); e.target.setAttribute("aria-pressed", !on); draw(); });
    rows.addEventListener("input", function (e) {
      var id = e.target.getAttribute("data-id"); if (!id) return;
      var v = parseFloat(String(e.target.value).replace(",", ".")); vals[id] = isNaN(v) ? null : v;
      var a = all.filter(function (x) { return x.id === id; })[0], row = e.target.closest(".rrow"), c = vals[id] == null ? null : classify(a, v, sex);
      row.querySelector(".rbar").outerHTML = barHTML(a, vals[id], sex);
      row.querySelector(".flag").outerHTML = flagHTML(c);
      row.querySelector(".an small").textContent = a.unit + (c ? " · " + c.label : "");
      summary();
    });
    $$("[data-dsex]").forEach(function (b) { b.addEventListener("click", function () { sex = b.getAttribute("data-dsex"); $$("[data-dsex]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); draw(); }); });
    $("#dec-print").addEventListener("click", function () { window.print(); });
    $("#dec-clear").addEventListener("click", function () { vals = {}; draw(); });
    var ef = $("#dec-email");
    if (ef) LD.bindForm(ef, { keep: true, extra: function () { return { summary: all.filter(function (a) { return vals[a.id] != null; }).map(function (a) { var c = classify(a, vals[a.id], sex); return a.name + ": " + vals[a.id] + " " + a.unit + " (" + c.label + ")"; }).join(" | "), sex_for_ranges: sex }; } });
    draw();
  });

  /* ---------- price estimator ---------- */
  var est = $("#cost-builder");
  if (est) LD.json("data/tests.json").then(function (ts) {
    var panel = (qs.get("tests") || "cbc,cmp,lipid-panel,hba1c").split(",").filter(function (s) { return ts.some(function (t) { return t.slug === s; }); });
    var list = $("#cost-list"), sel = $("#cost-selected"), q = $("#cost-q");
    function drawList() {
      var w = q.value.toLowerCase();
      list.innerHTML = ts.filter(function (t) { return !w || (t.name + " " + t.aka.join(" ")).toLowerCase().indexOf(w) > -1; }).map(function (t) {
        var on = panel.indexOf(t.slug) > -1;
        return '<label class="row" style="cursor:pointer">' + LD.cap(t.tube) + '<div><h3>' + esc(t.name) + "</h3><p>" + esc(t.category) + '</p></div><div class="price">' + LD.money(t.price[0]) + "–" + LD.money(t.price[1]) + ' <input type="checkbox" data-s="' + t.slug + '"' + (on ? " checked" : "") + ' aria-label="Add ' + esc(t.name) + '" style="margin-left:8px;width:18px;height:18px;accent-color:#14323A;vertical-align:middle"></div></label>';
      }).join("");
    }
    function drawSel() {
      var chosen = ts.filter(function (t) { return panel.indexOf(t.slug) > -1; });
      var lo = chosen.reduce(function (s, t) { return s + t.price[0]; }, 0), hi = chosen.reduce(function (s, t) { return s + t.price[1]; }, 0);
      var fasting = chosen.some(function (t) { return t.fasting === "Yes"; }), maybe = chosen.some(function (t) { return t.fasting === "Sometimes"; });
      sel.innerHTML = chosen.length ? '<ul class="list-plain">' + chosen.map(function (t) { return '<li style="display:flex;gap:10px;align-items:center">' + LD.cap(t.tube) + "<span>" + esc(t.name) + '</span><span class="num" style="margin-left:auto">' + LD.money(t.price[0]) + "–" + LD.money(t.price[1]) + "</span></li>"; }).join("") + "</ul>" +
        '<div style="border-top:2px solid var(--ink);margin-top:8px;padding-top:12px;display:flex;justify-content:space-between;align-items:baseline"><strong>Estimated total</strong><strong class="num" style="font:800 1.8rem var(--display)">' + LD.money(lo) + "–" + LD.money(hi) + "</strong></div>" +
        '<p class="small muted">' + chosen.length + " tests. " + (fasting ? "Includes a test that requires fasting — book a morning draw. " : maybe ? "Some tests may require fasting; check with the lab. " : "No fasting needed. ") + "Many direct-access providers add a physician-order or draw fee of about $5–$15. Bundled panels are often cheaper than the sum of single tests.</p>"
        : '<div class="empty">Tick tests on the left to build your panel.</div>';
      var hid = $("#cost-panel-field"); if (hid) hid.value = chosen.map(function (t) { return t.name; }).join(", ") + " | est. " + LD.money(lo) + "–" + LD.money(hi);
      try { history.replaceState(null, "", "?tests=" + panel.join(",")); } catch (e) {}
    }
    list.addEventListener("change", function (e) { var s = e.target.getAttribute("data-s"); if (!s) return; if (e.target.checked) { if (panel.indexOf(s) < 0) panel.push(s); } else panel.splice(panel.indexOf(s), 1); drawSel(); });
    q.addEventListener("input", drawList);
    drawList(); drawSel();
  });

  /* ---------- lab finder ---------- */
  var finder = $("#lab-finder");
  if (finder) finder.addEventListener("submit", function (e) {
    e.preventDefault();
    var loc = $("#lf-loc").value.trim(), kind = $("#lf-kind").value;
    if (!loc) { $("#lf-loc").focus(); return; }
    var q = encodeURIComponent(kind + " near " + loc);
    $("#lf-results").innerHTML = '<div class="panel"><h3>Results for ' + esc(loc) + '</h3><ul class="list-plain">' +
      '<li><a href="https://www.google.com/maps/search/' + q + '" target="_blank" rel="noopener">Open map results for “' + esc(kind) + " near " + esc(loc) + '”</a><br><span class="small muted">Shows walk-in labs and patient service centers with hours and directions.</span></li>' +
      '<li><a href="https://www.questdiagnostics.com/patients" target="_blank" rel="noopener">Quest Diagnostics: find a location and book</a></li>' +
      '<li><a href="https://www.labcorp.com/patients" target="_blank" rel="noopener">Labcorp: find a lab and book</a></li>' +
      '<li><a href="' + LD.root + 'get-tested.html?zip=' + encodeURIComponent(loc) + '">Get a testing plan with lower-cost options for ' + esc(loc) + "</a></li></ul>" +
      '<p class="small muted">Lab.Direct is not affiliated with these networks. Call ahead to confirm hours, walk-in policy and whether you need an order.</p></div>';
  });

  /* ---------- testing-plan funnel ---------- */
  var fun = $("#funnel");
  if (fun) LD.json("data/tests.json").then(function (ts) {
    var map = {
      checkup: ["cbc", "cmp", "lipid-panel", "hba1c", "tsh"], energy: ["cbc", "ferritin", "tsh", "vitamin-d", "vitamin-b12-folate"],
      heart: ["lipid-panel", "apob", "lipoprotein-a", "hs-crp", "hba1c"], sugar: ["hba1c", "glucose-fasting", "insulin-fasting", "lipid-panel"],
      hormones: ["testosterone", "estradiol", "tsh", "cortisol-am"], thyroid: ["thyroid-panel", "thyroid-antibodies", "cbc"],
      sexual: ["std-panel", "hiv-test", "hepatitis-c"], fitness: ["cbc", "cmp", "ferritin", "vitamin-d", "testosterone", "hs-crp"],
      organs: ["cmp", "egfr-creatinine", "uacr", "liver-panel"], gut: ["celiac-panel", "cbc", "iron-panel"]
    };
    var by = {}; ts.forEach(function (t) { by[t.slug] = t; });
    var steps = $$(".step", fun), bar = $$(".steps li", fun), cur = 0;
    if (qs.get("goal")) { var g = $('input[name="goal"][value="' + qs.get("goal") + '"]', fun); if (g) g.checked = true; }
    if (qs.get("zip")) $("#fz-zip").value = qs.get("zip");
    if (qs.get("email")) $("#fz-email").value = qs.get("email");
    function plan() {
      var goals = $$('input[name="goal"]:checked', fun).map(function (i) { return i.value; });
      var age = $("#fz-age").value, sexv = ($('input[name="sex"]:checked', fun) || {}).value, pref = $("#fz-pref").value;
      var out = [];
      goals.forEach(function (g) { (map[g] || []).forEach(function (s) { if (out.indexOf(s) < 0) out.push(s); }); });
      if (!goals.length) out = map.checkup.slice();
      if (sexv === "female") out = out.filter(function (s) { return s !== "psa"; });
      if (sexv === "male" && (age === "55-64" || age === "65+") && out.indexOf("psa") < 0 && goals.indexOf("checkup") > -1) out.push("psa");
      if ((age === "45-54" || age === "55-64" || age === "65+") && goals.indexOf("gut") > -1) out.push("fit-stool");
      var tests = out.map(function (s) { return by[s]; }).filter(Boolean);
      if (pref === "kit") tests = tests.filter(function (t) { return t.kit; }).concat(tests.filter(function (t) { return !t.kit; }));
      tests = tests.slice(0, 7);
      var lo = tests.reduce(function (s, t) { return s + t.price[0]; }, 0), hi = tests.reduce(function (s, t) { return s + t.price[1]; }, 0);
      return { tests: tests, lo: lo, hi: hi, goals: goals };
    }
    function go(n) {
      if (n > cur) { var inv = $$("input,select", steps[cur]).filter(function (i) { return !i.checkValidity(); }); if (inv.length) { inv[0].reportValidity(); return; } }
      cur = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach(function (s, i) { s.classList.toggle("active", i === cur); });
      bar.forEach(function (b, i) { b.className = i < cur ? "done" : i === cur ? "now" : ""; });
      if (steps[cur].hasAttribute("data-teaser")) { var p = plan(); $("#fz-teaser").innerHTML = "<strong>We matched " + p.tests.length + " tests to your goals.</strong> Estimated typical cash total: <strong>" + LD.money(p.lo) + "–" + LD.money(p.hi) + "</strong>. Add your details to see the full plan and get lower-cost options near you."; }
      var h = steps[cur].querySelector("h2,h3"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      fun.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    fun.addEventListener("click", function (e) { if (e.target.hasAttribute("data-next")) go(cur + 1); if (e.target.hasAttribute("data-prev")) go(cur - 1); });
    var form = $("form", fun);
    LD.bindForm(form, { extra: function () { var p = plan(); return { recommended_tests: p.tests.map(function (t) { return t.name; }).join(", "), estimated_total: LD.money(p.lo) + "–" + LD.money(p.hi) }; } });
    form.addEventListener("ld:sent", function () {
      var p = plan();
      $("#fz-result").innerHTML = '<div class="form-card"><h2>Your starter testing plan</h2><p>Based on: ' + esc(p.goals.join(", ") || "routine checkup") + '. We\'ll email lower-cost options shortly.</p><div class="rows">' + p.tests.map(rowHTML).join("") + '</div><p style="margin-top:14px"><strong>Estimated typical cash total: ' + LD.money(p.lo) + "–" + LD.money(p.hi) + '</strong></p><div class="chips"><a class="btn btn-gold" href="costs.html?tests=' + p.tests.map(function (t) { return t.slug; }).join(",") + '">Compare prices for this plan</a> <a class="btn btn-ghost" href="find-a-lab.html">Find a lab</a></div><p class="small muted" style="margin-top:14px">This plan is educational. A clinician can tailor testing to your history, medicines and symptoms.</p></div>';
      fun.style.display = "none"; $("#fz-result").scrollIntoView({ behavior: "smooth" });
    });
  });

  /* inline home lead form → funnel */
  var homeLead = $("#home-lead");
  if (homeLead) homeLead.addEventListener("submit", function (e) { e.preventDefault(); location.href = "get-tested.html?goal=" + encodeURIComponent($("#hl-goal").value) + "&email=" + encodeURIComponent($("#hl-email").value) + "&zip=" + encodeURIComponent($("#hl-zip").value); });

  /* ---------- Lab IQ quiz ---------- */
  var quiz = $("#lab-quiz");
  if (quiz) {
    var bank = [
      ["Which tube cap color is usually used for a complete blood count (CBC)?", ["Gold", "Lavender", "Light blue", "Gray"], 1, "CBCs are drawn in lavender-top EDTA tubes, which keep cells from clotting."],
      ["An A1c result reflects your average blood sugar over roughly how long?", ["24 hours", "2 weeks", "3 months", "1 year"], 2, "Red blood cells live about three months, so A1c reflects that period."],
      ["Which supplement can distort some thyroid and hormone test results?", ["Biotin", "Vitamin C", "Fish oil", "Magnesium"], 0, "High-dose biotin interferes with some immunoassays; the FDA has warned about it."],
      ["A fasting glucose of 110 mg/dL falls in which range?", ["Normal", "Prediabetes", "Diabetes", "Low"], 1, "100–125 mg/dL fasting is the prediabetes range (ADA)."],
      ["Which test is the best single marker of iron stores?", ["Serum iron", "Hemoglobin", "Ferritin", "MCV"], 2, "Ferritin reflects stored iron, though inflammation can raise it."],
      ["An eGFR below what value for three months or more is consistent with chronic kidney disease?", ["120", "90", "60", "30"], 2, "Below 60 mL/min/1.73m² for 3+ months meets the CKD threshold."],
      ["Which cholesterol-related marker is mostly inherited and worth checking once in adulthood?", ["HDL", "Lipoprotein(a)", "Triglycerides", "Total cholesterol"], 1, "Lp(a) is largely set by your genes."],
      ["Before a celiac blood test, you should:", ["Go gluten-free for a month", "Keep eating gluten", "Fast for 24 hours", "Stop all medicines"], 1, "Avoiding gluten first can cause a false-negative result."],
      ["An hs-CRP above 10 mg/L usually means:", ["Very low heart risk", "Acute inflammation — repeat later", "Vitamin deficiency", "Lab error"], 1, "Values over 10 mg/L usually reflect a recent infection or injury."],
      ["According to the NIH, what 25-hydroxy vitamin D level is adequate for most people?", ["5 ng/mL or more", "20 ng/mL or more", "100 ng/mL or more", "Any level"], 1, "20 ng/mL or higher is adequate for bone health in most people."],
      ["For most people, a cholesterol screening test:", ["Must be fasting", "Can be non-fasting", "Needs a 24-hour fast", "Needs a urine sample"], 1, "Non-fasting lipid panels are acceptable for most screening."],
      ["A raised AST right after a heavy workout could come from:", ["Muscle", "Bone", "Skin", "Eyes"], 0, "AST is found in muscle as well as the liver."],
      ["The CDC recommends HIV testing at least once for people aged:", ["13–64", "21–45", "50+", "Only with symptoms"], 0, "Everyone 13–64 should be tested at least once."],
      ["What should you avoid for about 48 hours before a PSA test?", ["Coffee", "Ejaculation", "Walking", "Water"], 1, "Ejaculation and vigorous cycling can raise PSA temporarily."],
      ["Uninsured or self-pay patients in the US can request a:", ["Good Faith Estimate", "Free test", "Reference range card", "Lab coupon"], 0, "The No Surprises Act gives self-pay patients the right to a Good Faith Estimate of costs."]
    ];
    var picks = bank.map(function (q, i) { return [Math.random(), i]; }).sort().slice(0, 10).map(function (p) { return bank[p[1]]; });
    var qi = 0, right = 0, area = $("#quiz-area");
    function show() {
      if (qi >= picks.length) {
        area.innerHTML = '<div class="quiz-q">You scored ' + right + " out of " + picks.length + '.</div><p>' + (right >= 8 ? "Excellent lab literacy." : right >= 5 ? "Solid. A few guides will take you to the top." : "Good start — our guides cover every question.") + ' Enter the monthly draw below with your score.</p><button class="btn btn-ghost btn-sm" type="button" id="quiz-again">Try a new set</button>';
        var sf = $("#quiz-score"); if (sf) sf.value = right + "/" + picks.length;
        $("#quiz-again").addEventListener("click", function () { location.reload(); });
        return;
      }
      var q = picks[qi];
      area.innerHTML = '<p class="small muted">Question ' + (qi + 1) + " of " + picks.length + " — score " + right + '</p><div class="quiz-q">' + esc(q[0]) + '</div><div class="quiz-opts">' + q[1].map(function (o, i) { return '<button type="button" data-o="' + i + '">' + esc(o) + "</button>"; }).join("") + '</div><p id="quiz-exp" class="small" style="margin-top:12px" aria-live="polite"></p>';
    }
    area.addEventListener("click", function (e) {
      var o = e.target.getAttribute("data-o"); if (o == null || area.dataset.lock) return;
      area.dataset.lock = 1; var q = picks[qi], ok = +o === q[2]; if (ok) right++;
      $$(".quiz-opts button", area).forEach(function (b, i) { if (i === q[2]) b.classList.add("right"); else if (i === +o) b.classList.add("wrong"); b.disabled = true; });
      $("#quiz-exp").textContent = (ok ? "Correct. " : "Not quite. ") + q[3];
      setTimeout(function () { delete area.dataset.lock; qi++; show(); }, 1700);
    });
    show();
  }
  var refGen = $("#ref-gen");
  if (refGen) refGen.addEventListener("submit", function (e) {
    e.preventDefault(); var n = $("#ref-name").value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30); if (!n) return;
    var url = (C.siteUrl || location.origin) + "/?ref=" + n; $("#ref-out").innerHTML = 'Your link: <strong>' + esc(url) + '</strong> <button type="button" class="btn btn-ghost btn-sm" id="ref-copy">Copy</button>';
    $("#ref-copy").addEventListener("click", function () { navigator.clipboard && navigator.clipboard.writeText(url); this.textContent = "Copied"; });
  });

  /* ---------- support page ---------- */
  var sup = $("#support");
  if (sup) {
    var f = C.fund || { goal: 25000, raised: 0, supporters: 0 };
    $("#fund-raised").textContent = LD.money(f.raised); $("#fund-goal").textContent = LD.money(f.goal); $("#fund-sup").textContent = f.supporters;
    setTimeout(function () { $("#fund-bar").style.width = Math.min(100, f.raised / f.goal * 100) + "%"; }, 200);
    var amt = $("#pl-amount");
    $$(".tier", sup).forEach(function (t) { t.addEventListener("click", function () { $$(".tier", sup).forEach(function (x) { x.setAttribute("aria-pressed", x === t); }); amt.value = t.getAttribute("data-amt"); $("#pl-tier").value = t.querySelector("span").textContent; }); });
    var P = C.payments || {}, any = false;
    [["paypal", "PayPal"], ["stripe", "Card (Stripe)"], ["buymeacoffee", "Buy Me a Coffee"], ["githubSponsors", "GitHub Sponsors"]].forEach(function (p) {
      if (P[p[0]]) { any = true; $("#pay-links").insertAdjacentHTML("beforeend", '<a class="btn btn-ink" href="' + esc(P[p[0]]) + '" target="_blank" rel="noopener">Give with ' + p[1] + "</a> "); }
    });
    if (!any) $("#pay-links").innerHTML = '<p class="small muted" style="margin:0">Submit the pledge form and we\'ll email a secure payment link within one business day.</p>';
  }

  /* ---------- news + guides lists ---------- */
  var news = $("#news-list");
  if (news) LD.json("data/news.json").then(function (d) {
    var lim = +news.getAttribute("data-limit") || 30;
    news.innerHTML = d.items.slice(0, lim).map(function (n) { return '<article class="news-item"><h3><a href="' + esc(n.link) + '" target="_blank" rel="noopener">' + esc(n.title) + '</a></h3><p class="small muted" style="margin:0">' + esc(n.source) + ", " + esc(n.date) + "</p></article>"; }).join("") || '<div class="empty">News will appear after the next automatic update.</div>';
    var u = $("#news-updated"); if (u) u.textContent = new Date(d.updated).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  });
  var gl = $("#guides-list");
  if (gl) LD.json("data/guides.json").then(function (gs) {
    var lim = +gl.getAttribute("data-limit") || 99;
    gl.innerHTML = gs.slice(0, lim).map(function (g) { return '<a class="row" href="' + LD.root + "guides/" + g.slug + '.html"><span class="cap cap-kit"></span><div><h3>' + esc(g.title) + "</h3><p>" + esc(g.summary) + '</p></div><div class="price">' + g.minutes + " min<small>read</small></div></a>"; }).join("");
  });
})();
