// Construction de la Salle d'étude.
// Lit content/config.json et content/modules/*.md, assemble src/template.html,
// src/style.css et src/app.js, et écrit docs/index.html (un seul fichier autonome).
//
//   node build.js            construit une fois
//   node build.js --watch    reconstruit à chaque modification de content/ ou src/

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { marked } = require("marked");
const acces = require("./tools/acces.js");

const ROOT = __dirname;
const CONTENT = path.join(ROOT, "content");
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "docs", "index.html");

marked.setOptions({ gfm: true, breaks: false });

/* ---------- petits utilitaires ---------- */

function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim(); }

// Mise en forme "légère" pour les textes courts (définitions, questions, énoncés) :
// **gras** et `code` seulement ; le reste est laissé tel quel.
function inline(s) {
  return String(s).trim()
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

// Markdown complet → HTML, avec deux blocs maison :
//   ```formule ... ```              → encadré formule
//   > **À retenir** : texte         → encadré "À retenir"
function mdToHtml(md) {
  var html = marked.parse(md);
  html = html.replace(/<pre><code class="language-formule">([\s\S]*?)<\/code>\s*<\/pre>/g, function (_, body) {
    return '<div class="formula">' + body.replace(/\n$/, "") + "</div>";
  });
  html = html.replace(/<blockquote>\s*<p>(?:<strong>)?\s*À retenir\s*(?:<\/strong>)?\s*:?\s*([\s\S]*?)<\/p>\s*<\/blockquote>/g, function (_, body) {
    return '<div class="retenir"><span class="label">À retenir</span><p>' + body.trim() + "</p></div>";
  });
  return html.trim();
}

// Corps d'une leçon : si l'auteur a écrit du HTML (première ligne commence par <), on le garde tel quel ;
// sinon c'est du Markdown.
function lessonBody(text) {
  var t = text.trim();
  if (t.charAt(0) === "<") return t;
  return mdToHtml(t);
}

/* ---------- lecture d'un fichier module ---------- */

function parseFrontmatter(lines) {
  var meta = {}, i = 0;
  if (lines[0] !== "---") return { meta: meta, rest: lines };
  for (i = 1; i < lines.length && lines[i] !== "---"; i++) {
    var m = lines[i].match(/^([\w-]+)\s*:\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return { meta: meta, rest: lines.slice(i + 1) };
}

// Découpe le corps en sections (# Titre) contenant des éléments (## Titre + corps).
function splitSections(lines) {
  var sections = {}, current = null, item = null, inFence = false;
  lines.forEach(function (line) {
    if (/^```/.test(line)) inFence = !inFence;
    if (!inFence && /^# /.test(line)) {
      current = norm(line.slice(2));
      sections[current] = sections[current] || [];
      item = null;
      return;
    }
    if (!inFence && /^## /.test(line) && current) {
      item = { title: line.slice(3).trim(), body: [] };
      sections[current].push(item);
      return;
    }
    if (item) item.body.push(line);
    else if (current) {
      // texte libre avant le premier ## (utile pour les notes)
      sections[current]._free = (sections[current]._free || []).concat([line]);
    }
  });
  return sections;
}

function quoteLines(body) {
  return body.filter(function (l) { return /^>\s?/.test(l); }).map(function (l) { return l.replace(/^>\s?/, ""); });
}
function plainLines(body) {
  return body.filter(function (l) { return !/^>\s?/.test(l); });
}

function parseModule(file) {
  var text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  var fm = parseFrontmatter(text.split("\n"));
  var meta = fm.meta;
  var sections = splitSections(fm.rest);
  var name = path.basename(file);
  var problems = [];

  function need(key) { if (!meta[key]) problems.push("champ « " + key + " » manquant dans l'en-tête"); return meta[key] || ""; }

  var mod = {
    id: need("id"),
    code: need("code"),
    priority: parseInt(meta.priorite || "3", 10),
    title: need("titre"),
    tagline: meta.accroche || "",
    hue: parseInt(meta.couleur || "185", 10),
    lessons: [], glossary: [], formulas: [], quiz: [], exercises: [], notes: ""
  };

  (sections.cours || []).forEach(function (it) {
    mod.lessons.push({ title: inline(it.title), html: lessonBody(it.body.join("\n")) });
  });

  (sections.definitions || []).forEach(function (it) {
    mod.glossary.push({ term: inline(it.title), def: inline(it.body.join("\n")) });
  });

  (sections.formules || []).forEach(function (it) {
    var f = [], inFence = false, fenced = false;
    it.body.forEach(function (l) {
      if (/^```/.test(l)) { inFence = !inFence; fenced = true; return; }
      if (inFence) f.push(l);
    });
    if (!fenced) f = plainLines(it.body).filter(function (l) { return l.trim(); });
    var note = quoteLines(it.body).join(" ").trim();
    var entry = { name: inline(it.title), f: f.join("\n").trim() };
    if (note) entry.note = note;
    mod.formulas.push(entry);
  });

  (sections.quiz || []).forEach(function (it) {
    var options = [], correct = -1;
    it.body.forEach(function (l) {
      var m = l.match(/^[-*]\s+(.*)$/);
      if (!m) return;
      var opt = m[1];
      if (/^\[x\]\s*/i.test(opt)) { correct = options.length; opt = opt.replace(/^\[x\]\s*/i, ""); }
      else opt = opt.replace(/^\[ \]\s*/, "");
      options.push(inline(opt));
    });
    if (correct < 0) { problems.push("quiz « " + it.title + " » : aucune bonne réponse marquée [x]"); correct = 0; }
    mod.quiz.push({ q: inline(it.title), options: options, correct: correct, explain: inline(quoteLines(it.body).join(" ")) });
  });

  (sections.exercices || []).forEach(function (it) {
    var solution = quoteLines(it.body).join(" ").replace(/^\**\s*Solution\s*\**\s*:?\s*/i, "").trim();
    var statement = plainLines(it.body).join("\n").trim();
    mod.exercises.push({ title: inline(it.title), statement: inline(statement), solution: inline(solution) });
  });

  if (sections.notes) {
    var free = (sections.notes._free || []).join("\n");
    var items = sections.notes.map(function (it) { return "## " + it.title + "\n" + it.body.join("\n"); }).join("\n\n");
    var all = (free + "\n\n" + items).trim();
    mod.notes = all ? mdToHtml(all) : "";
  }

  if (problems.length) console.warn("  ⚠ " + name + " : " + problems.join(" ; "));
  return mod;
}

// Logo : content/logo.svg ou content/logo.png (le premier trouvé), intégré dans la page.
function readLogo() {
  var candidates = [["logo.svg", "image/svg+xml"], ["logo.png", "image/png"]];
  for (var i = 0; i < candidates.length; i++) {
    var p = path.join(CONTENT, candidates[i][0]);
    if (fs.existsSync(p)) return "data:" + candidates[i][1] + ";base64," + fs.readFileSync(p).toString("base64");
  }
  return null;
}

// Dans le CSS, url("assets/x.svg") devient une image intégrée (lue dans src/assets/).
function inlineAssets(css) {
  var mime = { svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };
  return css.replace(/url\("assets\/([^"]+)"\)/g, function (_, name) {
    var file = path.join(SRC, "assets", name);
    if (!fs.existsSync(file)) { console.warn("  ⚠ image introuvable : src/assets/" + name); return "none"; }
    var ext = name.split(".").pop().toLowerCase();
    return 'url("data:' + (mime[ext] || "application/octet-stream") + ";base64," + fs.readFileSync(file).toString("base64") + '")';
  });
}

/* ---------- annales (sujets d'examen) ---------- */

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
  var mds = all.filter(function (f) { return /\.md$/i.test(f); }).sort();
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
    var base = name.replace(/\.[^.]+$/, "");
    var year = (base.match(/(20\d{2})/) || [])[1] || "";
    var mod = moduleIds.filter(function (id) { return norm(base).indexOf(id) !== -1; })[0] || "";
    var title = base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
    return { title: title.charAt(0).toUpperCase() + title.slice(1), annee: year, module: mod };
  }

  mds.forEach(function (f) {
    var text = fs.readFileSync(path.join(dir, f), "utf8").replace(/\r\n/g, "\n");
    var fm = parseFrontmatter(text.split("\n"));
    var meta = fm.meta;
    var sections = splitSections(fm.rest);
    var guess = guessFromName(f);
    var files = String(meta.fichiers || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean).map(fileEntry).filter(Boolean);
    var free = function (key) { var sec = sections[key]; if (!sec) return ""; var body = (sec._free || []).concat(sec.map(function (it) { return "## " + it.title + "\n" + it.body.join("\n"); })).join("\n").trim(); return body ? mdToHtml(body) : ""; };
    var sujet = free("sujet") || (function () { var lines = fm.rest.filter(function (l) { return !/^# /.test(l); }); var noSection = Object.keys(sections).length === 0; return noSection && lines.join("\n").trim() ? mdToHtml(lines.join("\n")) : ""; })();
    if (meta.module && moduleIds.indexOf(meta.module) === -1) console.warn("  ⚠ " + f + " : module inconnu « " + meta.module + " »");
    entries.push({
      id: slug(f.replace(/\.md$/i, "")),
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

/* ---------- application installable (PWA) ---------- */

// Icônes fournies dans content/pwa/ (fabriquées une fois à partir de content/logo.png).
var PWA_ICONS = [
  { file: "icone-192.png", sizes: "192x192", purpose: "any" },
  { file: "icone-512.png", sizes: "512x512", purpose: "any" },
  { file: "icone-maskable-512.png", sizes: "512x512", purpose: "maskable" }
];

// Écrit docs/manifest.webmanifest, copie les icônes et génère docs/sw.js à partir de src/sw.js.
// Le service worker garde en cache la page, les icônes et les annales : la salle d'étude
// s'installe sur le téléphone et fonctionne sans connexion.
function writePwa(config, html, annales) {
  var outDir = path.dirname(OUT);
  var iconsDir = path.join(CONTENT, "pwa");
  var icons = [];

  PWA_ICONS.forEach(function (icon) {
    var src = path.join(iconsDir, icon.file);
    if (!fs.existsSync(src)) { console.warn("  ⚠ icône PWA manquante : content/pwa/" + icon.file); return; }
    fs.copyFileSync(src, path.join(outDir, icon.file));
    icons.push({ src: icon.file, sizes: icon.sizes, type: "image/png", purpose: icon.purpose });
  });

  var apple = path.join(iconsDir, "icone-apple-180.png");
  if (fs.existsSync(apple)) fs.copyFileSync(apple, path.join(outDir, "icone-apple-180.png"));

  var manifest = {
    name: config.titre,
    short_name: config.courtNom || config.titre,
    description: config.sousTitre || "",
    lang: "fr",
    dir: "ltr",
    start_url: ".",
    scope: ".",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F1F1EE",
    theme_color: "#F1F1EE",
    categories: ["education"],
    icons: icons
  };
  fs.writeFileSync(path.join(outDir, "manifest.webmanifest"), JSON.stringify(manifest, null, 2));

  // Tout ce qui doit être disponible hors ligne. index.html en premier : c'est le secours
  // utilisé par le service worker quand la navigation échoue.
  var fichiers = ["index.html", "manifest.webmanifest"]
    .concat(icons.map(function (i) { return i.src; }))
    .concat(fs.existsSync(apple) ? ["icone-apple-180.png"] : [])
    .concat(annales.reduce(function (acc, a) { return acc.concat(a.files.map(function (f) { return f.url; })); }, []));

  // La version change dès que la page ou la liste des fichiers change : c'est ce qui
  // déclenche le bandeau « nouvelle version » chez les visiteurs.
  var version = crypto.createHash("sha256").update(html).update(fichiers.join("|")).digest("hex").slice(0, 12);
  var sw = fs.readFileSync(path.join(SRC, "sw.js"), "utf8")
    .replace("{{VERSION}}", version)
    .replace("{{FICHIERS}}", JSON.stringify(fichiers));
  fs.writeFileSync(path.join(outDir, "sw.js"), sw);

  return { version: version, fichiers: fichiers.length };
}

/* ---------- assemblage ---------- */

function build() {
  var t0 = Date.now();
  var config = JSON.parse(fs.readFileSync(path.join(CONTENT, "config.json"), "utf8"));
  var logo = readLogo();
  if (logo) config.logo = logo;
  var files = fs.readdirSync(path.join(CONTENT, "modules")).filter(function (f) { return /\.md$/i.test(f); }).sort();
  var modules = files.map(function (f) { return parseModule(path.join(CONTENT, "modules", f)); });

  var ids = {};
  modules.forEach(function (m) { if (ids[m.id]) console.warn("  ⚠ id en double : " + m.id); ids[m.id] = true; });

  var template = fs.readFileSync(path.join(SRC, "template.html"), "utf8");
  var style = inlineAssets(fs.readFileSync(path.join(SRC, "style.css"), "utf8"));
  var app = fs.readFileSync(path.join(SRC, "gate.js"), "utf8") + "\n" + fs.readFileSync(path.join(SRC, "app.js"), "utf8") + "\n" + fs.readFileSync(path.join(SRC, "assistant.js"), "utf8") + "\n" + fs.readFileSync(path.join(SRC, "pwa.js"), "utf8");
  var annales = parseAnnales(modules.map(function (m) { return m.id; }));
  var data;
  var codes = acces.readAcces().codes;
  if (codes.length) {
    var contentKey = acces.readContentKey(false);
    if (!contentKey) throw new Error("content/cle-contenu.txt est absent alors que des codes d'accès existent. Récupère-le depuis ton autre PC, ou vide content/acces.json et recrée les codes.");
    var sealed = acces.aesEncrypt(contentKey, Buffer.from(JSON.stringify({ modules: modules, annales: annales }), "utf8"));
    // Un code expiré garde son empreinte (pour afficher « code expiré ») mais perd sa clé enveloppée :
    // il ne peut plus rien déchiffrer, quoi qu'il arrive côté navigateur.
    var expired = 0;
    var verrou = { iter: acces.ITER, iv: sealed.iv, data: sealed.data, codes: codes.map(function (c) {
      var entry = { h: c.hash, s: c.salt, i: c.iv, w: c.wrap };
      if (c.expire) entry.e = c.expire;
      if (acces.isExpired(c)) { delete entry.w; expired++; }
      return entry;
    }) };
    data = "var MODULES = [];\nvar ANNALES = [];\nvar CONFIG = " + JSON.stringify(config) + ";\nvar VERROU = " + JSON.stringify(verrou) + ";";
    console.log("  🔒 accès réservé : " + (codes.length - expired) + " code(s) actif(s)" + (expired ? ", " + expired + " expiré(s) non publié(s)" : "") + ", contenu chiffré");
  } else {
    data = "var MODULES = " + JSON.stringify(modules) + ";\nvar CONFIG = " + JSON.stringify(config) + ";\nvar ANNALES = " + JSON.stringify(annales) + ";";
  }
  data = data.replace(/<\//g, "<\\/"); // jamais de </script> accidentel dans les données

  var html = template
    .replace(/\{\{TITLE\}\}/g, function () { return config.titre; })
    .replace("{{FAVICON}}", logo ? '<link rel="icon" href="' + logo + '">' : "")
    .replace("{{STYLE}}", function () { return style; })
    .replace("{{DATA}}", function () { return data; })
    .replace("{{APP}}", function () { return app; });

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  var nojekyll = path.join(path.dirname(OUT), ".nojekyll");
  if (!fs.existsSync(nojekyll)) fs.writeFileSync(nojekyll, "");
  var pwa = writePwa(config, html, annales);
  console.log("  📱 application installable : version " + pwa.version + ", " + pwa.fichiers + " fichier(s) disponibles hors ligne");
  console.log("✔ " + path.relative(ROOT, OUT) + " — " + modules.length + " modules, " + annales.length + " annale(s), " + Math.round(html.length / 1024) + " Ko, " + (Date.now() - t0) + " ms");
  return modules;
}

module.exports = { build: build, parseModule: parseModule };

if (require.main === module) {
  build();
  if (process.argv.includes("--watch")) {
    var timer = null;
    function schedule() { clearTimeout(timer); timer = setTimeout(function () { try { build(); } catch (e) { console.error("✘ " + e.message); } }, 150); }
    [CONTENT, path.join(CONTENT, "modules"), SRC].forEach(function (dir) { fs.watch(dir, schedule); });
    console.log("… en veille : modifie content/ ou src/ et la page se reconstruit.");
  }
}
