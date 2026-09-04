const { app, BrowserWindow, shell, Menu, nativeTheme } = require("electron");
const path = require("path");
const fs = require("fs");
const { fileURLToPath } = require("url");

// Ouvre un fichier local (PDF, image des annales) avec l'application par défaut de Windows.
// Dans l'application empaquetée, ces fichiers vivent dans app.asar.unpacked, pas dans l'archive.
function openLocalFile(url) {
  let p;
  try { p = fileURLToPath(url); } catch (e) { return; }
  const unpacked = p.replace(/app\.asar([\\/])/, "app.asar.unpacked$1");
  if (unpacked !== p && fs.existsSync(unpacked)) p = unpacked;
  shell.openPath(p);
}

const smoke = process.argv.includes("--smoke");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 720,
    minHeight: 520,
    title: "Salle d'étude",
    backgroundColor: "#F1F1EE",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });

  win.loadFile(path.join(__dirname, "..", "docs", "index.html"));

  // Links to external sites open in the default browser, never inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    else if (/^file:/.test(url)) openLocalFile(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file:")) { e.preventDefault(); shell.openExternal(url); }
    else if (!/index\.html/.test(url)) { e.preventDefault(); openLocalFile(url); }
  });

  if (smoke) {
    win.webContents.once("did-finish-load", async () => {
      const title = await win.webContents.executeJavaScript("(function(){var prev=localStorage.getItem('smoke-run');localStorage.setItem('smoke-run',String(Date.now()));return document.title + ' | modules=' + document.querySelectorAll('.mcard').length + ' | previous-run=' + prev;})()");
      console.log("SMOKE OK: " + title);
      if (process.env.SMOKE_SHOT) {
        await new Promise(r => setTimeout(r, 1200));
        const img = await win.webContents.capturePage();
        require("fs").writeFileSync(process.env.SMOKE_SHOT, img.toPNG());
      }
      app.exit(0);
    });
  }
}

const menu = Menu.buildFromTemplate([
  { label: "Fichier", submenu: [
    { label: "Imprimer la page…", accelerator: "CmdOrCtrl+P", click: (_, w) => w && w.webContents.print() },
    { type: "separator" },
    { role: "quit", label: "Quitter" }
  ] },
  { label: "Affichage", submenu: [
    { role: "reload", label: "Recharger" },
    { role: "resetZoom", label: "Taille normale" },
    { role: "zoomIn", label: "Zoom avant" },
    { role: "zoomOut", label: "Zoom arrière" },
    { type: "separator" },
    { role: "togglefullscreen", label: "Plein écran" }
  ] }
]);
Menu.setApplicationMenu(menu);

app.whenReady().then(() => {
  if (process.env.SMOKE_THEME) nativeTheme.themeSource = process.env.SMOKE_THEME;
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => app.quit());
