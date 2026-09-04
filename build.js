// Construction de la Salle d'étude.
// Lit content/config.json et content/modules/*.md, assemble src/template.html,
// src/style.css et src/app.js, et écrit docs/index.html (un seul fichier autonome).
//
//   node build.js            construit une fois
//   node build.js --watch    reconstruit à chaque modification de content/ ou src/

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

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

/* ---------- assemblage ---------- */

function build() {
  var t0 = Date.now();
  var config = JSON.parse(fs.readFileSync(path.join(CONTENT, "config.json"), "utf8"));
  var files = fs.readdirSync(path.join(CONTENT, "modules")).filter(function (f) { return /\.md$/i.test(f); }).sort();
  var modules = files.map(function (f) { return parseModule(path.join(CONTENT, "modules", f)); });

  var ids = {};
  modules.forEach(function (m) { if (ids[m.id]) console.warn("  ⚠ id en double : " + m.id); ids[m.id] = true; });

  var template = fs.readFileSync(path.join(SRC, "template.html"), "utf8");
  var style = fs.readFileSync(path.join(SRC, "style.css"), "utf8");
  var app = fs.readFileSync(path.join(SRC, "app.js"), "utf8");
  var data = "var MODULES = " + JSON.stringify(modules) + ";\nvar CONFIG = " + JSON.stringify(config) + ";";
  data = data.replace(/<\//g, "<\\/"); // jamais de </script> accidentel dans les données

  var html = template
    .replace("{{TITLE}}", config.titre)
    .replace("{{STYLE}}", function () { return style; })
    .replace("{{DATA}}", function () { return data; })
    .replace("{{APP}}", function () { return app; });

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  var nojekyll = path.join(path.dirname(OUT), ".nojekyll");
  if (!fs.existsSync(nojekyll)) fs.writeFileSync(nojekyll, "");
  console.log("✔ " + path.relative(ROOT, OUT) + " — " + modules.length + " modules, " + Math.round(html.length / 1024) + " Ko, " + (Date.now() - t0) + " ms");
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
