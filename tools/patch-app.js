// Migration unique : adapte src/app.js et src/style.css au nouveau projet
// (config externe, groupes génériques, couleur par module, onglet Notes).
const fs = require("fs");
const path = require("path");
function patch(file, pairs) {
  let s = fs.readFileSync(file, "utf8");
  pairs.forEach(([a, b]) => {
    const n = s.split(a).length - 1;
    if (n !== 1) throw new Error(file + ": " + n + " correspondance(s) pour « " + a.slice(0, 70) + " »");
    s = s.replace(a, () => b);
  });
  fs.writeFileSync(file, s);
  console.log("patché", path.basename(file));
}

patch(path.join(__dirname, "..", "src", "app.js"), [
  [`  var PRIO_LABEL = { 1: "Priorité 1", 2: "Priorité 2", 3: "Priorité 3" };
  var HUES = { startups: 24, risques: 355, valeur: 212, gouvernance: 272, vba: 152, hautbilan: 40, tresorerie: 186, recherche: 236, memoire: 318, anglais: 96 };`,
   `  var PRIO_LABEL = CONFIG.priorites || { 1: "Priorité 1", 2: "Priorité 2", 3: "Priorité 3" };
  /* Groupes (semestres) dans l'ordre d'apparition des modules */
  function codes() { var seen = []; MODULES.forEach(function (m) { if (seen.indexOf(m.code) === -1) seen.push(m.code); }); return seen; }
  function groupLabel(c) { return (CONFIG.groupes && CONFIG.groupes[c]) || c; }`],
  [`  function hue(m) { return HUES[m.id] || 185; }`, `  function hue(m) { return m.hue || 185; }`],
  [`'<div class="brand"><div class="mark">SÉ</div><div><div class="t">La salle d\\'étude</div><div class="s">M2 Finance d\\'entreprise · Nanterre</div></div></div>' +`,
   `'<div class="brand"><div class="mark">' + esc(CONFIG.sigle || "SÉ") + '</div><div><div class="t">' + esc(CONFIG.titre) + '</div><div class="s">' + esc(CONFIG.sousTitre || "") + '</div></div></div>' +`],
  [`      '<div class="side-group"><div class="side-label">Semestre 9</div>' + modItems("S9") + '</div>' +
      '<div class="side-group"><div class="side-label">Semestre 10</div>' + modItems("S10") + '</div>' +`,
   `      codes().map(function (c) { return '<div class="side-group"><div class="side-label">' + esc(groupLabel(c)) + '</div>' + modItems(c) + '</div>'; }).join("") +`],
  [`'<div class="topbar"><div class="brand"><div class="mark">SÉ</div><div><div class="t">La salle d\\'étude</div></div></div>' +`,
   `'<div class="topbar"><div class="brand"><div class="mark">' + esc(CONFIG.sigle || "SÉ") + '</div><div><div class="t">' + esc(CONFIG.titre) + '</div></div></div>' +`],
  [`    return '<div class="home-hero"><div><h1>Réussir le M2, module par module.</h1><p>Dix modules qui suivent le programme officiel : cours, définitions et formules à mémoriser en mode cartes, quiz corrigés et exercices. <span data-sync-copy>' + syncCopy() + '</span></p></div>' +`,
   `    return '<div class="home-hero"><div><h1>' + CONFIG.accueilTitre + '</h1><p>' + CONFIG.accueilTexte + ' <span data-sync-copy>' + syncCopy() + '</span></p></div>' +`],
  [`      '<div class="sem-head"><h2>Semestre 9</h2><span>' + MODULES.filter(function (m) { return m.code === "S9"; }).length + ' modules</span></div>' + grid("S9") +
      '<div class="sem-head"><h2>Semestre 10</h2><span>' + MODULES.filter(function (m) { return m.code === "S10"; }).length + ' modules</span></div>' + grid("S10") +
      '<div class="foot"><span>Contenu construit à partir du programme officiel — à croiser avec les supports de tes professeurs. Priorité 1 = lien direct avec ton poste.</span></div>';`,
   `      codes().map(function (c) { var n = MODULES.filter(function (m) { return m.code === c; }).length; return '<div class="sem-head"><h2>' + esc(groupLabel(c)) + '</h2><span>' + n + ' module' + (n > 1 ? 's' : '') + '</span></div>' + grid(c); }).join("") +
      '<div class="foot"><span>' + (CONFIG.pied || "") + '</span></div>';`],
  [`      ["exercices", "Exercices", st.ex + "/" + m.exercises.length]
    ];`,
   `      ["exercices", "Exercices", st.ex + "/" + m.exercises.length],
      ["notes", "Notes", m.notes ? "✎" : "—"]
    ];`],
  [`  function renderModule(m) {
    var body;
    switch (state.tab) {`,
   `  function renderNotes(m) {
    if (!m.notes) {
      return '<div class="notes-empty"><p>Pas encore de notes pour ce module.</p><p>Pour en ajouter : ouvre le fichier du module dans <code>content/modules/</code>, écris sous la section <code># Notes</code>, puis relance <code>npm run build</code>.</p></div>';
    }
    return '<article class="lesson"><div class="lesson-body notes">' + m.notes + '</div></article>';
  }

  function renderModule(m) {
    var body;
    switch (state.tab) {
      case "notes": body = renderNotes(m); break;`],
  [`      m.lessons.forEach(function (l) { var txt = l.html.replace(/<[^>]+>/g, " "); if (norm(l.title + " " + txt).indexOf(q) !== -1) hits.push({ k: "Leçon", t: l.title, d: "Dans le cours du module " + pad(moduleIndex(m)), m: m, tab: "cours" }); });`,
   `      m.lessons.forEach(function (l) { var txt = l.html.replace(/<[^>]+>/g, " "); if (norm(l.title + " " + txt).indexOf(q) !== -1) hits.push({ k: "Leçon", t: l.title, d: "Dans le cours du module " + pad(moduleIndex(m)), m: m, tab: "cours" }); });
      if (m.notes && norm(m.notes.replace(/<[^>]+>/g, " ")).indexOf(q) !== -1) hits.push({ k: "Notes", t: "Notes du module " + pad(moduleIndex(m)), d: m.title, m: m, tab: "notes" });`]
]);

patch(path.join(__dirname, "..", "src", "style.css"), [
  [`.strip { display: grid; grid-template-columns: repeat(10, 1fr); gap: 0.35rem; margin-bottom: 1.6rem; }`,
   `.strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(52px, 1fr)); gap: 0.35rem; margin-bottom: 1.6rem; }`],
  [`/* Flashcards */`,
   `/* Notes et contenu Markdown */
.lesson-body h1, .lesson-body h2, .lesson-body h3 { margin: 1.1rem 0 0.5rem; max-width: 66ch; }
.lesson-body h1 { font-size: 1.35rem; } .lesson-body h2 { font-size: 1.15rem; } .lesson-body h3 { font-size: 1rem; }
.lesson-body > :first-child { margin-top: 0; }
.lesson-body blockquote { margin: 0 0 0.85rem; padding: 0.5rem 0.9rem; border-left: 3px solid var(--line-strong); color: var(--ink-2); max-width: 66ch; }
.lesson-body pre { background: var(--bg-sunk); border-radius: 8px; padding: 0.7rem 0.9rem; overflow-x: auto; font-family: "DM Mono", ui-monospace, monospace; font-size: 0.84rem; line-height: 1.5; margin: 0 0 0.9rem; max-width: 66ch; }
.lesson-body pre code { background: none; padding: 0; font-size: inherit; }
.lesson-body table { border-collapse: collapse; margin: 0 0 0.9rem; font-size: 0.9rem; display: block; overflow-x: auto; max-width: 100%; }
.lesson-body th, .lesson-body td { border: 1px solid var(--line); padding: 0.35rem 0.6rem; text-align: left; vertical-align: top; }
.lesson-body th { background: var(--bg-sunk); font-weight: 600; }
.lesson-body hr { border: none; border-top: 1px solid var(--line); margin: 1.2rem 0; }
.lesson-body img { border-radius: 8px; }
.notes-empty { background: var(--bg-elev); border: 1px dashed var(--line-strong); border-radius: 14px; padding: 1.2rem 1.4rem; color: var(--ink-2); max-width: 66ch; }
.notes-empty p { margin: 0 0 0.5rem; } .notes-empty p:last-child { margin: 0; }

/* Flashcards */`]
]);
