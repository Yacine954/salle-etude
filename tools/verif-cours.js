// Vérifie qu'une réécriture des leçons n'a rien cassé : mêmes leçons, mêmes formules, encadrés présents,
// longueur raisonnable. Usage : node tools/verif-cours.js chemin/vers/baseline.json
const fs = require("fs");
const path = require("path");
const { parseModule } = require("../build.js");

const baseline = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const dir = path.join(__dirname, "..", "content", "modules");
let problems = 0, lessons = 0, wordsBefore = 0, wordsAfter = 0;

Object.keys(baseline).forEach(function (f) {
  const m = parseModule(path.join(dir, f));
  const ref = baseline[f];
  if (m.lessons.length !== ref.length) { console.log("✘ " + f + " : " + m.lessons.length + " leçons au lieu de " + ref.length); problems++; return; }
  m.lessons.forEach(function (l, i) {
    lessons++;
    const r = ref[i];
    const tag = f + " › " + l.title;
    if (l.title !== r.title) { console.log("✘ " + tag + " : titre modifié (avant : " + r.title + ")"); problems++; }
    const formulas = l.html.match(/<div class="formula">[\s\S]*?<\/div>/g) || [];
    if (formulas.length !== r.formulas) { console.log("✘ " + tag + " : " + formulas.length + " bloc(s) formule au lieu de " + r.formulas); problems++; }
    else formulas.forEach(function (fx, k) { if (fx !== r.formulaTexts[k]) { console.log("✘ " + tag + " : formule n°" + (k + 1) + " modifiée"); problems++; } });
    const retenir = (l.html.match(/class="retenir"/g) || []).length;
    if (retenir !== r.retenir) { console.log("✘ " + tag + " : " + retenir + " encadré(s) « À retenir » au lieu de " + r.retenir); problems++; }
    const words = l.html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    wordsBefore += r.words; wordsAfter += words;
    const ratio = words / r.words;
    if (ratio < 0.8 || ratio > 1.45) { console.log("⚠ " + tag + " : " + r.words + " → " + words + " mots (×" + ratio.toFixed(2) + ")"); }
    if (!/^\s*</.test(l.html)) { console.log("✘ " + tag + " : le corps ne commence pas par une balise HTML"); problems++; }
    if (/<(?:p|li|dd)>[^<]*[^&]<\s/.test(l.html)) { console.log("⚠ " + tag + " : « < » brut suspect dans le texte"); }
    const open = (l.html.match(/<p>/g) || []).length, close = (l.html.match(/<\/p>/g) || []).length;
    if (open !== close) { console.log("✘ " + tag + " : balises <p> déséquilibrées (" + open + " ouvertes, " + close + " fermées)"); problems++; }
  });
});
console.log((problems ? "✘ " + problems + " problème(s)" : "✔ aucune anomalie") + " — " + lessons + " leçons, " + wordsBefore + " → " + wordsAfter + " mots (×" + (wordsAfter / wordsBefore).toFixed(2) + ")");
process.exit(problems ? 1 : 0);
