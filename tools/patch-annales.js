// Migration unique : ajoute la page « Annales » (sujets d'examen : PDF, images, texte).
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
function rep(file, a, b) {
  file = path.join(ROOT, file);
  let s = fs.readFileSync(file, "utf8");
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error(file + ": " + n + " correspondance(s) pour « " + a.slice(0, 60) + " »");
  fs.writeFileSync(file, s.replace(a, () => b));
}

/* ---------------- build.js ---------------- */
rep("build.js", `/* ---------- assemblage ---------- */`, `/* ---------- annales (sujets d'examen) ---------- */

var FILE_KINDS = { pdf: "pdf", png: "image", jpg: "image", jpeg: "image", webp: "image", gif: "image", docx: "doc", doc: "doc", xlsx: "doc", xls: "doc", pptx: "doc", txt: "doc" };

function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function humanSize(bytes) { return bytes < 1024 * 1024 ? Math.max(1, Math.round(bytes / 1024)) + " Ko" : (bytes / 1048576).toFixed(1).replace(".0", "") + " Mo"; }

// Lit content/annales/ : les .md décrivent un sujet (et ses fichiers joints) ; les PDF/images non
// mentionnés par un .md deviennent chacun un sujet à part entière. Les fichiers sont copiés dans docs/annales/.
function parseAnnales(moduleIds) {
  var dir = path.join(CONTENT, "annales");
  var outDir = path.join(ROOT, "docs", "annales");
  fs.rmSync(outDir, { recursive: true, force: true });
  if (!fs.existsSync(dir)) return [];
  fs.mkdirSync(outDir, { recursive: true });

  var all = fs.readdirSync(dir).filter(function (f) { return !f.startsWith("."); });
  var mds = all.filter(function (f) { return /\\.md$/i.test(f); }).sort();
  var attachments = all.filter(function (f) { return FILE_KINDS[f.split(".").pop().toLowerCase()]; });
  var used = {};
  var entries = [];

  function fileEntry(name) {
    var src = path.join(dir, name);
    if (!fs.existsSync(src)) { console.warn("  ⚠ annales : fichier joint introuvable : " + name); return null; }
    fs.copyFileSync(src, path.join(outDir, name));
    used[name] = true;
    var ext = name.split(".").pop().toLowerCase();
    return { name: name, url: "annales/" + encodeURIComponent(name), kind: FILE_KINDS[ext] || "doc", size: humanSize(fs.statSync(src).size) };
  }
  function guessFromName(name) {
    var base = name.replace(/\\.[^.]+$/, "");
    var year = (base.match(/(20\\d{2})/) || [])[1] || "";
    var mod = moduleIds.filter(function (id) { return norm(base).indexOf(id) !== -1; })[0] || "";
    var title = base.replace(/[-_]+/g, " ").replace(/\\s+/g, " ").trim();
    return { title: title.charAt(0).toUpperCase() + title.slice(1), annee: year, module: mod };
  }

  mds.forEach(function (f) {
    var text = fs.readFileSync(path.join(dir, f), "utf8").replace(/\\r\\n/g, "\\n");
    var fm = parseFrontmatter(text.split("\\n"));
    var meta = fm.meta;
    var sections = splitSections(fm.rest);
    var guess = guessFromName(f);
    var files = String(meta.fichiers || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean).map(fileEntry).filter(Boolean);
    var free = function (key) { var sec = sections[key]; if (!sec) return ""; var body = (sec._free || []).concat(sec.map(function (it) { return "## " + it.title + "\\n" + it.body.join("\\n"); })).join("\\n").trim(); return body ? mdToHtml(body) : ""; };
    var sujet = free("sujet") || (function () { var lines = fm.rest.filter(function (l) { return !/^# /.test(l); }); var noSection = Object.keys(sections).length === 0; return noSection && lines.join("\\n").trim() ? mdToHtml(lines.join("\\n")) : ""; })();
    if (meta.module && moduleIds.indexOf(meta.module) === -1) console.warn("  ⚠ " + f + " : module inconnu « " + meta.module + " »");
    entries.push({
      id: slug(f.replace(/\\.md$/i, "")),
      title: meta.titre || guess.title,
      module: meta.module || guess.module || "",
      annee: String(meta.annee || guess.annee || ""),
      session: meta.session || "",
      type: meta.type || "",
      duree: meta.duree || "",
      sujet: sujet,
      corrige: free("corrige"),
      files: files
    });
  });

  attachments.filter(function (f) { return !used[f]; }).sort().forEach(function (f) {
    var g = guessFromName(f);
    var fe = fileEntry(f);
    if (fe) entries.push({ id: slug(f), title: g.title, module: g.module, annee: g.annee, session: "", type: "", duree: "", sujet: "", corrige: "", files: [fe] });
  });

  entries.sort(function (a, b) { return (b.annee || "").localeCompare(a.annee || "") || a.title.localeCompare(b.title, "fr"); });
  return entries;
}

/* ---------- assemblage ---------- */`);

rep("build.js", `  var data = "var MODULES = " + JSON.stringify(modules) + ";\\nvar CONFIG = " + JSON.stringify(config) + ";";`,
`  var annales = parseAnnales(modules.map(function (m) { return m.id; }));
  var data = "var MODULES = " + JSON.stringify(modules) + ";\\nvar CONFIG = " + JSON.stringify(config) + ";\\nvar ANNALES = " + JSON.stringify(annales) + ";";`);

rep("build.js", `  console.log("✔ " + path.relative(ROOT, OUT) + " — " + modules.length + " modules, "`,
`  console.log("✔ " + path.relative(ROOT, OUT) + " — " + modules.length + " modules, " + annales.length + " annale(s), "`);

/* ---------------- app.js ---------------- */
rep("src/app.js", `    book: '<svg class="ic"`, `    scroll: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7"/><path d="M5 3a2 2 0 0 0-2 2v2h4V5a2 2 0 0 0-2-2z"/><path d="M7 21a2 2 0 0 1-2-2V7"/><path d="M11 8h6M11 12h6M11 16h4"/></svg>',
    book: '<svg class="ic"`);

rep("src/app.js", `    revealed: {},`, `    revealed: {},
    corrigeOpen: {},`);

rep("src/app.js", `'" data-go="glossaire">' + ICONS.book + 'Glossaire complet</button>' +`,
`'" data-go="glossaire">' + ICONS.book + 'Glossaire complet</button>' +
        '<button class="nav-item' + (state.view === "annales" ? ' active' : '') + '" data-go="annales">' + ICONS.scroll + 'Annales' + (ANNALES.length ? '<span class="count">' + ANNALES.length + '</span>' : '') + '</button>' +`);

rep("src/app.js", `      ["notes", "Notes", m.notes ? "✎" : "—"]
    ];`, `      ["notes", "Notes", m.notes ? "✎" : "—"]
    ];
    var nAnn = annalesOf(m.id).length;
    if (nAnn) tabs.push(["annales", "Annales", String(nAnn)]);`);

rep("src/app.js", `      case "exercices": body = renderExercices(m); break;`,
`      case "exercices": body = renderExercices(m); break;
      case "annales": body = renderAnnalesList(annalesOf(m.id), false); break;`);

rep("src/app.js", `  function renderGlobal(kind) {`, `  /* ---------- Annales ---------- */

  function annalesOf(moduleId) { return ANNALES.filter(function (a) { return a.module === moduleId; }); }

  function renderAnnale(a, showModule) {
    var m = a.module ? getModule(a.module) : null;
    var chips = [];
    if (a.annee) chips.push('<span class="chip acc">' + esc(a.annee) + '</span>');
    if (a.session) chips.push('<span class="chip">' + esc(a.session) + '</span>');
    if (a.type) chips.push('<span class="chip">' + esc(a.type) + '</span>');
    if (a.duree) chips.push('<span class="chip">' + esc(a.duree) + '</span>');
    if (showModule && m) chips.push('<button class="chip go" data-open-module="' + m.id + '">' + pad(moduleIndex(m)) + ' · ' + esc(m.title) + '</button>');
    var pdfs = a.files.filter(function (f) { return f.kind !== "image"; });
    var imgs = a.files.filter(function (f) { return f.kind === "image"; });
    var files = pdfs.map(function (f) {
      return '<a class="btn ghost sm" href="' + f.url + '" target="_blank" rel="noopener">' + (f.kind === "pdf" ? "Ouvrir le PDF" : "Télécharger") + ' <span class="mono" style="opacity:.7">' + esc(f.name) + ' · ' + f.size + '</span></a>';
    }).join("");
    var gallery = imgs.length ? '<div class="an-gallery">' + imgs.map(function (f) {
      return '<a href="' + f.url + '" target="_blank" rel="noopener" title="' + esc(f.name) + '"><img src="' + f.url + '" alt="' + esc(f.name) + '" loading="lazy"></a>';
    }).join("") + '</div>' : '';
    var open = !!state.corrigeOpen[a.id];
    var corrige = a.corrige
      ? (open ? '<div class="sol"><span class="label">Corrigé</span><div class="lesson-body">' + a.corrige + '</div></div><button class="btn ghost sm" data-corrige-hide="' + a.id + '">Masquer le corrigé</button>'
              : '<button class="btn ghost sm" data-corrige-show="' + a.id + '">Voir le corrigé</button>')
      : '';
    return '<article class="an hued" id="an-' + a.id + '" style="--h:' + (m ? hue(m) : 185) + '">' +
      '<div class="an-head"><h3>' + esc(a.title) + '</h3><div class="chips">' + chips.join("") + '</div></div>' +
      (files ? '<div class="an-files">' + files + '</div>' : '') + gallery +
      (a.sujet ? '<div class="lesson-body an-sujet">' + a.sujet + '</div>' : '') +
      (corrige ? '<div class="an-corrige">' + corrige + '</div>' : '') +
    '</article>';
  }

  function renderAnnalesList(list, groupByModule) {
    if (!list.length) return '<div class="notes-empty"><p>Aucun sujet pour l\\'instant.</p><p>Dépose un PDF, une image ou un fichier <code>.md</code> dans <code>content/annales/</code>, puis relance <code>npm run build</code>. Le guide du projet décrit le format.</p></div>';
    if (!groupByModule) return list.map(function (a) { return renderAnnale(a, false); }).join("");
    var groups = [], byKey = {};
    list.forEach(function (a) {
      var key = a.module && getModule(a.module) ? a.module : "_autres";
      if (!byKey[key]) { byKey[key] = []; groups.push(key); }
      byKey[key].push(a);
    });
    groups.sort(function (x, y) { var mx = getModule(x), my = getModule(y); return (mx ? moduleIndex(mx) : 999) - (my ? moduleIndex(my) : 999); });
    return groups.map(function (key) {
      var m = getModule(key);
      var head = m ? '<div class="ghead hued" style="--h:' + hue(m) + '"><span class="n">' + pad(moduleIndex(m)) + '</span><h2>' + esc(m.title) + '</h2></div>' : '<div class="ghead"><h2>Autres sujets</h2></div>';
      return head + byKey[key].map(function (a) { return renderAnnale(a, false); }).join("");
    }).join("");
  }

  function renderAnnales() {
    var years = {};
    ANNALES.forEach(function (a) { if (a.annee) years[a.annee] = true; });
    var yl = Object.keys(years).sort().reverse();
    return '<div class="ptitle"><h1>Annales</h1><p>' + (ANNALES.length ? ANNALES.length + ' sujet' + (ANNALES.length > 1 ? 's' : '') + (yl.length ? ' · ' + yl.join(", ") : '') + ', classés par module. Les corrigés se déplient sujet par sujet.' : 'Les sujets d\\'examen, partiels et devoirs, avec leurs corrigés.') + '</p>' +
      (ANNALES.length ? '<div style="margin-top:0.9rem"><button class="btn ghost sm" data-print="1">Imprimer</button></div>' : '') + '</div>' +
      renderAnnalesList(ANNALES, true);
  }

  function renderGlobal(kind) {`);

rep("src/app.js", `    } else if (state.view === "formulaire" || state.view === "glossaire") main = renderGlobal(state.view);`,
`    } else if (state.view === "formulaire" || state.view === "glossaire") main = renderGlobal(state.view);
    else if (state.view === "annales") main = renderAnnales();`);

rep("src/app.js", `      if (m.notes && norm(m.notes.replace(/<[^>]+>/g, " ")).indexOf(q) !== -1) hits.push({ k: "Notes", t: "Notes du module " + pad(moduleIndex(m)), d: m.title, m: m, tab: "notes" });`,
`      if (m.notes && norm(m.notes.replace(/<[^>]+>/g, " ")).indexOf(q) !== -1) hits.push({ k: "Notes", t: "Notes du module " + pad(moduleIndex(m)), d: m.title, m: m, tab: "notes" });
    });
    ANNALES.forEach(function (a) {
      var txt = a.title + " " + a.annee + " " + a.session + " " + a.type + " " + (a.sujet + " " + a.corrige).replace(/<[^>]+>/g, " ") + " " + a.files.map(function (f) { return f.name; }).join(" ");
      if (norm(txt).indexOf(q) !== -1) { var m = a.module ? getModule(a.module) : null; hits.push({ k: "Annale", t: a.title, d: [a.annee, a.session, a.type].filter(Boolean).join(" · ") || "Sujet d'examen", m: m, tab: "annales", annale: a.id }); }`);

// les résultats de recherche : ouvrir la page annales quand le résultat n'a pas de module
rep("src/app.js", `        '<button class="go" data-open-module-tab="' + h.m.id + ':' + h.tab + '">Ouvrir →</button>' +`,
`        (h.m ? '<button class="go" data-open-module-tab="' + h.m.id + ':' + h.tab + '">Ouvrir →</button>' : '<button class="go" data-go="annales">Ouvrir →</button>') +`);
rep("src/app.js", `      return '<div class="hit hued" style="--h:' + hue(h.m) + '">`, `      return '<div class="hit hued" style="--h:' + (h.m ? hue(h.m) : 185) + '">`);
rep("src/app.js", `' · module ' + pad(moduleIndex(h.m)) + '</div>`, `' + (h.m ? ' · module ' + pad(moduleIndex(h.m)) : '') + '</div>`);

rep("src/app.js", `    if ((el = t.closest("[data-ex-hide]"))) {`,
`    if ((el = t.closest("[data-corrige-show]"))) { state.corrigeOpen[el.getAttribute("data-corrige-show")] = true; render(); return; }
    if ((el = t.closest("[data-corrige-hide]"))) { state.corrigeOpen[el.getAttribute("data-corrige-hide")] = false; render(); return; }
    if ((el = t.closest("[data-ex-hide]"))) {`);

/* ---------------- style.css ---------------- */
rep("src/style.css", `/* Global & search */`, `/* Annales */
.nav-item .count { margin-left: auto; font-family: "DM Mono", monospace; font-size: 0.68rem; color: var(--ink-3); background: var(--bg-sunk); border-radius: 999px; padding: 0.1rem 0.5rem; }
.an { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 14px; padding: 1.1rem 1.25rem; margin-bottom: 0.9rem; border-left: 4px solid var(--acc); }
.an-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 0.7rem; }
.an-head h3 { font-size: 1.05rem; }
.an-head .chips { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.chip.go { cursor: pointer; }
.chip.go:hover { border-color: var(--acc); color: var(--acc); }
.an-files { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.8rem; }
.an-files .btn { text-decoration: none; }
.an-gallery { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 0.8rem; }
.an-gallery img { max-height: 180px; max-width: 100%; border-radius: 8px; border: 1px solid var(--line); background: #fff; display: block; transition: transform 0.15s; }
.an-gallery a:hover img { transform: scale(1.02); }
.an-sujet { max-width: 66ch; }
.an-corrige { margin-top: 0.6rem; }
.an-corrige .sol .lesson-body { padding: 0; }
.an-corrige .sol { margin-bottom: 0.6rem; }
@media print { .an { break-inside: avoid; } .an-gallery img { max-height: none; } }

/* Global & search */`);

/* ---------------- électron : ouvrir les PDF locaux dans l'application par défaut ---------------- */
rep("electron/main.js", `    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };`, `    if (/^(https?|file):/.test(url)) shell.openExternal(url);
    return { action: "deny" };`);

/* ---------------- empaquetage : embarquer docs/annales ---------------- */
rep("tools/package.js", `  fs.copyFileSync(path.join(ROOT, "docs", "index.html"), path.join(STAGE, "docs", "index.html"));`,
`  fs.copyFileSync(path.join(ROOT, "docs", "index.html"), path.join(STAGE, "docs", "index.html"));
  var annales = path.join(ROOT, "docs", "annales");
  if (fs.existsSync(annales)) fs.cpSync(annales, path.join(STAGE, "docs", "annales"), { recursive: true });`);

console.log("annales : patches appliqués");
