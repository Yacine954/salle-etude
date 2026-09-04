// Migration unique : ajoute l'ambiance lofi (scène CSS, bouton, images intégrées).
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
function rep(file, a, b) {
  file = path.join(ROOT, file);
  let s = fs.readFileSync(file, "utf8");
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error(file + ": " + n + " correspondance(s) pour « " + a.slice(0, 60) + " »");
  s = s.replace(a, () => b);
  fs.writeFileSync(file, s);
}

/* ---- style.css : jetons lofi dans les trois blocs de thème ---- */
rep("src/style.css", `  --wm-a: 0.10;
}`, `  --wm-a: 0.10;
  /* Ambiance lofi (jour) */
  --lofi-sky: linear-gradient(180deg, #c7d8ec 0%, #e5dbe9 42%, #f6d7c0 76%, #f4e6d6 100%);
  --lofi-glow: radial-gradient(55% 38% at 75% 100%, rgba(255, 186, 110, 0.5), transparent 70%);
  --lofi-skyline: url("assets/skyline-day.svg");
  --lofi-stars: 0;
  --lofi-elev: rgba(255, 255, 255, 0.76);
  --lofi-bg: rgba(255, 255, 255, 0.42);
  --lofi-sunk: rgba(214, 218, 214, 0.65);
}`);

{
  const file = path.join(ROOT, "src", "style.css");
  let css = fs.readFileSync(file, "utf8");
  const nightTokens = (indent) => [
    "--wm-a: 0.14;",
    "/* Ambiance lofi (nuit) */",
    "--lofi-sky: linear-gradient(180deg, #0b0a18 0%, #1f1838 38%, #48294f 68%, #9c4b3a 100%);",
    "--lofi-glow: radial-gradient(55% 38% at 70% 100%, rgba(255, 140, 80, 0.38), transparent 70%);",
    '--lofi-skyline: url("assets/skyline-night.svg");',
    "--lofi-stars: 1;",
    "--lofi-elev: rgba(21, 25, 29, 0.74);",
    "--lofi-bg: rgba(12, 14, 18, 0.45);",
    "--lofi-sunk: rgba(6, 8, 10, 0.6);"
  ].map((l, i) => (i ? indent : "") + l).join("\n" ).replace(/\n/g, "\n" ).split("\n").map((l, i) => i === 0 ? l : l).join("\n");
  // bloc @media (indenté de 4) puis bloc [data-theme="dark"] (indenté de 2)
  const parts = css.split("--wm-a: 0.14;");
  if (parts.length !== 3) throw new Error("blocs sombres attendus : 2, trouvés : " + (parts.length - 1));
  css = parts[0] + nightTokens("    ") + parts[1] + nightTokens("  ") + parts[2];
  fs.writeFileSync(file, css);
}

rep("src/style.css", `/* ---------- Responsive ---------- */`, `/* ---------- Ambiance lofi ---------- */
body.ambiance-lofi {
  --bg-elev: var(--lofi-elev);
  --bg: var(--lofi-bg);
  --bg-sunk: var(--lofi-sunk);
  background: var(--lofi-sky) fixed;
}
body.ambiance-lofi::before, body.ambiance-lofi::after {
  content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
}
/* Ciel, lueur chaude, skyline et premières étoiles */
body.ambiance-lofi::before {
  background:
    radial-gradient(1.6px 1.6px at 8% 12%, #fff 100%, transparent),
    radial-gradient(1.2px 1.2px at 21% 28%, #fff 100%, transparent),
    radial-gradient(1.8px 1.8px at 33% 9%, #fff 100%, transparent),
    radial-gradient(1.2px 1.2px at 47% 22%, #fff 100%, transparent),
    radial-gradient(1.5px 1.5px at 58% 6%, #fff 100%, transparent),
    radial-gradient(1.2px 1.2px at 69% 31%, #fff 100%, transparent),
    radial-gradient(1.7px 1.7px at 81% 14%, #fff 100%, transparent),
    radial-gradient(1.2px 1.2px at 92% 26%, #fff 100%, transparent),
    radial-gradient(1.4px 1.4px at 75% 40%, #fff 100%, transparent),
    radial-gradient(1.2px 1.2px at 14% 44%, #fff 100%, transparent),
    var(--lofi-skyline) center bottom / auto 240px repeat-x,
    var(--lofi-glow),
    var(--lofi-sky);
}
/* Deuxième couche d'étoiles, qui scintille (invisible de jour) */
body.ambiance-lofi::after {
  background:
    radial-gradient(1.3px 1.3px at 27% 17%, #fff 100%, transparent),
    radial-gradient(1.8px 1.8px at 40% 35%, #fff 100%, transparent),
    radial-gradient(1.2px 1.2px at 52% 13%, #fff 100%, transparent),
    radial-gradient(1.5px 1.5px at 64% 21%, #fff 100%, transparent),
    radial-gradient(1.2px 1.2px at 86% 8%, #fff 100%, transparent),
    radial-gradient(1.6px 1.6px at 95% 38%, #fff 100%, transparent),
    radial-gradient(1.2px 1.2px at 5% 30%, #fff 100%, transparent),
    radial-gradient(1.4px 1.4px at 44% 3%, #fff 100%, transparent);
  opacity: calc(var(--lofi-stars) * 0.9);
  animation: lofi-twinkle 6s ease-in-out infinite alternate;
}
@keyframes lofi-twinkle {
  from { opacity: calc(var(--lofi-stars) * 0.25); }
  to   { opacity: calc(var(--lofi-stars) * 0.95); }
}
/* Grain très léger par-dessus tout */
.ambiance-lofi .app::after {
  content: ""; position: fixed; inset: 0; z-index: 60; pointer-events: none; opacity: 0.07;
  background: url("assets/grain.svg") repeat; mix-blend-mode: multiply;
}
/* Les panneaux laissent deviner la scène */
.ambiance-lofi .sidebar, .ambiance-lofi .topbar, .ambiance-lofi .mcard, .ambiance-lofi .lesson, .ambiance-lofi .fc,
.ambiance-lofi .qq, .ambiance-lofi .ex, .ambiance-lofi .hit, .ambiance-lofi .qbar, .ambiance-lofi .notes-empty {
  backdrop-filter: blur(16px) saturate(1.15); -webkit-backdrop-filter: blur(16px) saturate(1.15);
}
.ambiance-lofi .sidebar { border-right-color: transparent; }
.ambiance-lofi .home-hero h1, .ambiance-lofi .ptitle h1 { text-shadow: 0 1px 0 var(--bg-elev); }

/* ---------- Responsive ---------- */`);

/* ---- app.js : état, bouton, classe sur body ---- */
rep("src/app.js", `  function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify({ cardMode: state.cardMode, lastModule: state.lastModule })); } catch (e) {} }`,
  `  function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify({ cardMode: state.cardMode, lastModule: state.lastModule, ambiance: state.ambiance })); } catch (e) {} }`);
rep("src/app.js", `    cardMode: prefs.cardMode || { definitions: false, formules: false },`,
  `    cardMode: prefs.cardMode || { definitions: false, formules: false },
    ambiance: prefs.ambiance || CONFIG.ambiance || "neutre",`);
rep("src/app.js", `        '<button class="btn ghost sm" data-reset="1" style="justify-content:center">' + (state.resetArmed ? "Confirmer la réinitialisation" : "Réinitialiser ma progression") + '</button></div>' +`,
  `        '<button class="btn ghost sm" data-ambiance="1" style="justify-content:center">' + (state.ambiance === "lofi" ? "Ambiance lofi ✓" : "Ambiance lofi") + '</button>' +
        '<button class="btn ghost sm" data-reset="1" style="justify-content:center">' + (state.resetArmed ? "Confirmer la réinitialisation" : "Réinitialiser ma progression") + '</button></div>' +`);
rep("src/app.js", `    app.innerHTML = '<div class="app hued" style="--h:' + h + '">' + renderSidebar() +`,
  `    document.body.classList.toggle("ambiance-lofi", state.ambiance === "lofi");
    app.innerHTML = '<div class="app hued" style="--h:' + h + '">' + renderSidebar() +`);
rep("src/app.js", `    if ((el = t.closest("[data-reset]"))) {`,
  `    if ((el = t.closest("[data-ambiance]"))) { state.ambiance = state.ambiance === "lofi" ? "neutre" : "lofi"; savePrefs(); render(); return; }
    if ((el = t.closest("[data-reset]"))) {`);

/* ---- build.js : images de src/assets/ intégrées dans le CSS ---- */
rep("build.js", `  var style = fs.readFileSync(path.join(SRC, "style.css"), "utf8");`,
  `  var style = inlineAssets(fs.readFileSync(path.join(SRC, "style.css"), "utf8"));`);
rep("build.js", `/* ---------- assemblage ---------- */`, `// Dans le CSS, url("assets/x.svg") devient une image intégrée (lue dans src/assets/).
function inlineAssets(css) {
  var mime = { svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" };
  return css.replace(/url\\("assets\\/([^"]+)"\\)/g, function (_, name) {
    var file = path.join(SRC, "assets", name);
    if (!fs.existsSync(file)) { console.warn("  ⚠ image introuvable : src/assets/" + name); return "none"; }
    var ext = name.split(".").pop().toLowerCase();
    return 'url("data:' + (mime[ext] || "application/octet-stream") + ";base64," + fs.readFileSync(file).toString("base64") + '")';
  });
}

/* ---------- assemblage ---------- */`);

/* ---- config : ambiance activée par défaut ---- */
{
  const file = path.join(ROOT, "content", "config.json");
  const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
  cfg.ambiance = "lofi";
  fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
}
console.log("patches ok");
