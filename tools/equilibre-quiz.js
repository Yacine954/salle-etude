// Rééquilibre la position des bonnes réponses dans les quiz des modules.
//
//   node tools/equilibre-quiz.js            réécrit content/modules/*.md
//   node tools/equilibre-quiz.js --voir     montre seulement la répartition, sans rien écrire
//
// Dans chaque question (section # Quiz, lignes « - option » / « - [x] option »), seul l'ORDRE des
// options change : les textes, les explications (« > … ») et tout le reste du fichier sont conservés
// à l'octet près. Les positions sont tirées de façon équilibrée par module (autant de A, B, C, D)
// avec un mélange reproductible : relancer le script sur un fichier déjà équilibré ne change rien.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DIR = path.join(__dirname, "..", "content", "modules");
const voir = process.argv.includes("--voir");

// Générateur pseudo-aléatoire reproductible (dépend du nom du fichier).
function rng(seed) {
  let h = crypto.createHash("sha256").update(seed).digest();
  let i = 0;
  return () => { if (i >= h.length - 4) { h = crypto.createHash("sha256").update(h).digest(); i = 0; } const v = h.readUInt32BE(i); i += 4; return v / 4294967296; };
}
function shuffle(arr, rand) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

function rebalance(file) {
  const text = fs.readFileSync(file, "utf8");
  const nl = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(nl);
  let inQuiz = false, inFence = false;
  const questions = []; // { start, end } indices des lignes d'options de chaque question
  let cur = null;
  lines.forEach((line, idx) => {
    if (/^```/.test(line)) inFence = !inFence;
    if (inFence) return;
    if (/^# /.test(line)) { inQuiz = /^# quiz/i.test(line.normalize("NFD")); cur = null; return; }
    if (!inQuiz) return;
    if (/^## /.test(line)) { cur = { opts: [] }; questions.push(cur); return; }
    if (cur && /^[-*]\s+/.test(line)) cur.opts.push(idx);
  });

  const rand = rng(path.basename(file));
  const before = [], after = [];
  // Cible équilibrée : on répartit les positions 0..3 le plus également possible, puis on mélange.
  const targets = shuffle(questions.map((_, i) => i % 4), rand);

  questions.forEach((q, qi) => {
    const optLines = q.opts.map((i) => lines[i]);
    const correct = optLines.findIndex((l) => /^[-*]\s+\[x\]/i.test(l));
    if (correct < 0 || optLines.length < 2) return;
    before.push(correct);
    const target = Math.min(targets[qi], optLines.length - 1);
    if (target === correct) { after.push(correct); return; }
    // On déplace la bonne réponse à la position cible, les autres gardent leur ordre relatif.
    const others = optLines.filter((_, i) => i !== correct);
    others.splice(target, 0, optLines[correct]);
    q.opts.forEach((lineIdx, i) => { lines[lineIdx] = others[i]; });
    after.push(target);
  });

  const out = lines.join(nl);
  return { before, after, changed: out !== text, write: () => fs.writeFileSync(file, out) };
}

function dist(arr) { const d = [0, 0, 0, 0]; arr.forEach((p) => d[p]++); return d.map((n, i) => "ABCD"[i] + ":" + n).join(" "); }

const files = fs.readdirSync(DIR).filter((f) => /\.md$/i.test(f)).sort();
let totalBefore = [], totalAfter = [];
files.forEach((f) => {
  const r = rebalance(path.join(DIR, f));
  totalBefore = totalBefore.concat(r.before); totalAfter = totalAfter.concat(r.after);
  console.log("  " + f.padEnd(20) + " avant  " + dist(r.before) + "   →  après  " + dist(r.after) + (r.changed ? "" : "   (inchangé)"));
  if (!voir && r.changed) r.write();
});
console.log("\n" + totalBefore.length + " questions — avant : " + dist(totalBefore) + "   →   après : " + dist(totalAfter));
console.log(voir ? "\nRien n'a été écrit (--voir). Relance sans --voir pour appliquer, puis : npm run build, git add -A, git commit, git push." : "\nFichiers réécrits. Vérifie avec : node build.js — puis git add -A, git commit, git push.");
