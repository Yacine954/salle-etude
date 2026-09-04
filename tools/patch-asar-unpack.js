// Migration unique : les fichiers d'annales doivent rester hors de l'archive app.asar
// pour que Windows puisse les ouvrir (PDF dans le lecteur par défaut, images dans la visionneuse).
const fs = require("fs"); const path = require("path"); const ROOT = path.join(__dirname, "..");
function rep(file, a, b) { file = path.join(ROOT, file); let s = fs.readFileSync(file, "utf8"); const n = s.split(a).length - 1; if (n !== 1) throw new Error(file + ": " + n + " pour " + a.slice(0, 60)); fs.writeFileSync(file, s.replace(a, () => b)); }

rep("tools/package.js", `    asar: true,`, `    asar: { unpack: "**/docs/annales/**" },`);

rep("electron/main.js", `const { app, BrowserWindow, shell, Menu, nativeTheme } = require("electron");
const path = require("path");`, `const { app, BrowserWindow, shell, Menu, nativeTheme } = require("electron");
const path = require("path");
const fs = require("fs");
const { fileURLToPath } = require("url");

// Ouvre un fichier local (PDF, image des annales) avec l'application par défaut de Windows.
// Dans l'application empaquetée, ces fichiers vivent dans app.asar.unpacked, pas dans l'archive.
function openLocalFile(url) {
  let p;
  try { p = fileURLToPath(url); } catch (e) { return; }
  const unpacked = p.replace(/app\\.asar([\\\\/])/, "app.asar.unpacked$1");
  if (unpacked !== p && fs.existsSync(unpacked)) p = unpacked;
  shell.openPath(p);
}`);

rep("electron/main.js", `    if (/^(https?|file):/.test(url)) shell.openExternal(url);
    return { action: "deny" };`, `    if (/^https?:/.test(url)) shell.openExternal(url);
    else if (/^file:/.test(url)) openLocalFile(url);
    return { action: "deny" };`);

rep("electron/main.js", `    if (!url.startsWith("file:")) { e.preventDefault(); shell.openExternal(url); }`, `    if (!url.startsWith("file:")) { e.preventDefault(); shell.openExternal(url); }
    else if (!/index\\.html/.test(url)) { e.preventDefault(); openLocalFile(url); }`);

console.log("asar unpack : ok");
