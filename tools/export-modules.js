// Outil de migration (utilisé une seule fois) : transforme l'ancien tableau MODULES
// (JSON) en fichiers Markdown, un par module, dans content/modules/.
// Usage : node tools/export-modules.js chemin/vers/modules.json
const fs = require("fs");
const path = require("path");

const src = process.argv[2];
if (!src) { console.error("usage: node tools/export-modules.js modules.json"); process.exit(1); }
const MODULES = JSON.parse(fs.readFileSync(src, "utf8"));
const HUES = { startups: 24, risques: 355, valeur: 212, gouvernance: 272, vba: 152, hautbilan: 40, tresorerie: 186, recherche: 236, memoire: 318, anglais: 96 };
const outDir = path.join(__dirname, "..", "content", "modules");
fs.mkdirSync(outDir, { recursive: true });

function dedent(html) {
  return html.split("\n").map(function (l) { return l.replace(/^ {8}/, ""); }).join("\n").trim();
}
function pad(n) { return (n < 10 ? "0" : "") + n; }

MODULES.forEach(function (m, idx) {
  var out = [];
  out.push("---");
  out.push("id: " + m.id);
  out.push("code: " + m.code);
  out.push("priorite: " + m.priority);
  out.push("titre: " + m.title);
  out.push("accroche: " + m.tagline);
  out.push("couleur: " + (HUES[m.id] || 185));
  out.push("---");
  out.push("");
  out.push("# Cours");
  m.lessons.forEach(function (l) {
    out.push("");
    out.push("## " + l.title);
    out.push("");
    out.push(dedent(l.html));
  });
  out.push("");
  out.push("# Définitions");
  m.glossary.forEach(function (g) {
    out.push("");
    out.push("## " + g.term);
    out.push(g.def);
  });
  out.push("");
  out.push("# Formules");
  m.formulas.forEach(function (f) {
    out.push("");
    out.push("## " + f.name);
    out.push("```");
    out.push(f.f);
    out.push("```");
    if (f.note) out.push("> " + f.note);
  });
  out.push("");
  out.push("# Quiz");
  m.quiz.forEach(function (q) {
    out.push("");
    out.push("## " + q.q);
    q.options.forEach(function (o, i) { out.push("- " + (i === q.correct ? "[x] " : "") + o); });
    out.push("> " + q.explain);
  });
  out.push("");
  out.push("# Exercices");
  m.exercises.forEach(function (e) {
    out.push("");
    out.push("## " + e.title);
    out.push(e.statement);
    out.push("");
    out.push("> **Solution** : " + e.solution);
  });
  out.push("");
  out.push("# Notes");
  out.push("");
  var file = path.join(outDir, pad(idx + 1) + "-" + m.id + ".md");
  fs.writeFileSync(file, out.join("\n") + "\n");
  console.log("écrit", path.relative(process.cwd(), file));
});
