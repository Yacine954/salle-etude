// Migration unique : bouton « Demander un accès » sur l'écran d'entrée.
const fs = require("fs"); const path = require("path"); const ROOT = path.join(__dirname, "..");
function rep(file, a, b) { file = path.join(ROOT, file); let s = fs.readFileSync(file, "utf8"); const n = s.split(a).length - 1; if (n !== 1) throw new Error(file + ": " + n + " pour " + a.slice(0, 60)); fs.writeFileSync(file, s.replace(a, () => b)); }

rep("src/gate.js", `        (message ? '<p class="lock-err">' + esc(message) + '</p>' : '') +
        '<p class="lock-hint">' + esc(cfg.aide || "Le code est personnel : il t'a été remis directement. Il reste enregistré sur cet appareil.") + '</p>' +
      '</div></div>';`,
`        (message ? '<p class="lock-err">' + esc(message) + '</p>' : '') +
        '<p class="lock-hint">' + esc(cfg.aide || "Le code est personnel : il t'a été remis directement. Il reste enregistré sur cet appareil.") + '</p>' +
        requestBlock() +
      '</div></div>';`);

rep("src/gate.js", `  function renderLock(message, busy) {`, `  // Lien « Demander un accès » : formulaire en ligne si configuré, sinon e-mail pré-rempli.
  function requestBlock() {
    var href = "";
    if (cfg.formulaire) href = cfg.formulaire;
    else if (cfg.contact) {
      var subject = "Demande d'accès — " + (CONFIG.titre || "Salle d'étude");
      var body = "Bonjour,\\n\\nJe souhaite un code d'accès à la salle d'étude.\\n\\nNom : \\nPrénom : \\nAdresse e-mail : \\nPromotion / groupe : \\n\\nMerci !";
      href = "mailto:" + cfg.contact + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    }
    if (!href) return "";
    return '<div class="lock-request"><p>' + esc(cfg.demande || "Tu n'as pas encore de code ?") + '</p>' +
      '<a class="btn ghost sm" href="' + esc(href) + '"' + (cfg.formulaire ? ' target="_blank" rel="noopener"' : '') + '>' + esc(cfg.demandeBouton || "Demander un accès") + '</a>' +
      (cfg.info ? '<p class="lock-hint">' + esc(cfg.info) + '</p>' : '') + '</div>';
  }

  function renderLock(message, busy) {`);

rep("src/style.css", `.lock-hint { font-size: 0.8rem; color: var(--ink-3); }`, `.lock-hint { font-size: 0.8rem; color: var(--ink-3); }
.lock-request { border-top: 1px solid var(--line); padding-top: 0.9rem; margin-top: 0.2rem; display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start; }
.lock-request p { margin: 0; }
.lock-request .btn { text-decoration: none; }`);

{
  const file = path.join(ROOT, "content", "config.json");
  const c = JSON.parse(fs.readFileSync(file, "utf8"));
  c.acces.contact = "yacine.guettari@ciblex.fr";
  c.acces.formulaire = "";
  c.acces.demande = "Tu n'as pas encore de code ?";
  c.acces.demandeBouton = "Demander un accès";
  c.acces.info = "Envoie ta demande avec ton nom et ton prénom : tu reçois ton code personnel en retour.";
  fs.writeFileSync(file, JSON.stringify(c, null, 2) + "\n");
}
console.log("demande d'accès : ok");
