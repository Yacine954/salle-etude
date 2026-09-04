// Migration unique : accès réservé par code personnel (contenu chiffré dans la page).
const fs = require("fs"); const path = require("path"); const ROOT = path.join(__dirname, "..");
function rep(file, a, b) { file = path.join(ROOT, file); let s = fs.readFileSync(file, "utf8"); const n = s.split(a).length - 1; if (n !== 1) throw new Error(file + ": " + n + " pour " + a.slice(0, 60)); fs.writeFileSync(file, s.replace(a, () => b)); }

/* build.js : chiffrement quand des codes existent, gate.js inclus en premier */
rep("build.js", `const { marked } = require("marked");`, `const { marked } = require("marked");
const acces = require("./tools/acces.js");`);

rep("build.js", `  var data = "var MODULES = " + JSON.stringify(modules) + ";\\nvar CONFIG = " + JSON.stringify(config) + ";\\nvar ANNALES = " + JSON.stringify(annales) + ";";`,
`  var data;
  var codes = acces.readAcces().codes;
  if (codes.length) {
    var contentKey = acces.readContentKey(false);
    if (!contentKey) throw new Error("content/cle-contenu.txt est absent alors que des codes d'accès existent. Récupère-le depuis ton autre PC, ou vide content/acces.json et recrée les codes.");
    var sealed = acces.aesEncrypt(contentKey, Buffer.from(JSON.stringify({ modules: modules, annales: annales }), "utf8"));
    var verrou = { iter: acces.ITER, iv: sealed.iv, data: sealed.data, codes: codes.map(function (c) { return { h: c.hash, s: c.salt, i: c.iv, w: c.wrap }; }) };
    data = "var MODULES = [];\\nvar ANNALES = [];\\nvar CONFIG = " + JSON.stringify(config) + ";\\nvar VERROU = " + JSON.stringify(verrou) + ";";
    console.log("  🔒 accès réservé : " + codes.length + " code(s), contenu chiffré");
  } else {
    data = "var MODULES = " + JSON.stringify(modules) + ";\\nvar CONFIG = " + JSON.stringify(config) + ";\\nvar ANNALES = " + JSON.stringify(annales) + ";";
  }`);

rep("build.js", `  var app = fs.readFileSync(path.join(SRC, "app.js"), "utf8") + "\\n" + fs.readFileSync(path.join(SRC, "assistant.js"), "utf8");`,
`  var app = fs.readFileSync(path.join(SRC, "gate.js"), "utf8") + "\\n" + fs.readFileSync(path.join(SRC, "app.js"), "utf8") + "\\n" + fs.readFileSync(path.join(SRC, "assistant.js"), "utf8");`);

/* app.js : démarrage différé derrière le verrou + bouton de déconnexion */
rep("src/app.js", `(function () {
  "use strict";

  var STORAGE_KEY = "salle-etude-progress-v2";`, `function startApp() {
  "use strict";

  var STORAGE_KEY = "salle-etude-progress-v2";`);

rep("src/app.js", `  render();
  initSync();
})();`, `  render();
  initSync();
}
if (window.VERROU) window.SalleEtudeGate.run(startApp); else startApp();`);

rep("src/app.js", `        '<button class="btn ghost sm" data-reset="1" style="justify-content:center">' + (state.resetArmed ? "Confirmer la réinitialisation" : "Réinitialiser ma progression") + '</button></div>' +`,
`        '<button class="btn ghost sm" data-reset="1" style="justify-content:center">' + (state.resetArmed ? "Confirmer la réinitialisation" : "Réinitialiser ma progression") + '</button>' +
        (window.VERROU ? '<button class="btn ghost sm" data-logout="1" style="justify-content:center">Se déconnecter</button>' : '') + '</div>' +`);

rep("src/app.js", `    if ((el = t.closest("[data-print]"))) { window.print(); return; }`, `    if ((el = t.closest("[data-print]"))) { window.print(); return; }
    if ((el = t.closest("[data-logout]"))) { window.SalleEtudeGate.logout(); return; }`);

/* style.css : écran d'accès */
rep("src/style.css", `/* ---------- Ambiance lofi ---------- */`, `/* ---------- Accès réservé ---------- */
.lock { min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; }
.lock-card { width: min(440px, 100%); background: var(--bg-elev); border: 1px solid var(--line); border-radius: 18px; padding: 1.8rem 1.8rem 1.5rem; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 0.9rem; }
.ambiance-lofi .lock-card { backdrop-filter: blur(18px) saturate(1.15); -webkit-backdrop-filter: blur(18px) saturate(1.15); }
.lock-card .brand { padding: 0; }
.lock-card h1 { font-size: 1.5rem; letter-spacing: -0.02em; margin-top: 0.3rem; }
.lock-card p { margin: 0; color: var(--ink-2); font-size: 0.92rem; }
.lock-card form { display: flex; gap: 0.5rem; margin-top: 0.2rem; }
.lock-card input { flex: 1; font-family: "DM Mono", ui-monospace, monospace; font-size: 1.05rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.6rem 0.8rem; border: 1px solid var(--line-strong); border-radius: 10px; background: var(--bg); color: var(--ink); min-width: 0; }
.lock-card input:disabled, .lock-card button:disabled { opacity: 0.6; }
.lock-err { color: var(--bad); font-weight: 500; }
.lock-hint { font-size: 0.8rem; color: var(--ink-3); }

/* ---------- Ambiance lofi ---------- */`);

/* electron : smoke avec code d'accès */
rep("electron/main.js", `    win.webContents.once("did-finish-load", async () => {`, `    let reloaded = false;
    win.webContents.on("did-finish-load", async () => {
      if (process.env.SMOKE_CODE && !reloaded) {
        reloaded = true;
        await win.webContents.executeJavaScript("localStorage.setItem('salle-etude-acces-v1', " + JSON.stringify(process.env.SMOKE_CODE) + "); location.reload();");
        return;
      }
      await new Promise(r => setTimeout(r, 1500));`);

/* package.json : commande acces */
{
  const file = path.join(ROOT, "package.json");
  const p = JSON.parse(fs.readFileSync(file, "utf8"));
  p.scripts.acces = "node tools/acces.js";
  fs.writeFileSync(file, JSON.stringify(p, null, 2) + "\n");
}

/* config : textes de l'écran d'accès */
{
  const file = path.join(ROOT, "content", "config.json");
  const c = JSON.parse(fs.readFileSync(file, "utf8"));
  c.acces = { titre: "Accès réservé", message: "Cette salle d'étude est réservée aux personnes qui ont reçu un code d'accès personnel.", aide: "Le code est personnel : il t'a été remis directement. Il reste enregistré sur cet appareil." };
  fs.writeFileSync(file, JSON.stringify(c, null, 2) + "\n");
}

/* .gitignore : la clé de contenu ne se publie jamais */
{
  const file = path.join(ROOT, ".gitignore");
  let g = fs.readFileSync(file, "utf8");
  if (g.indexOf("cle-contenu") === -1) fs.writeFileSync(file, g.trimEnd() + "\ncontent/cle-contenu.txt\n");
}
console.log("accès réservé : patches appliqués");
