// Fabrique les icônes de l'application à partir du logo :
//   content/logo.svg  →  content/logo.png (256×256, rendu par Electron)
//   content/logo.png  →  electron/icon.ico
// Usage : npm run icon   (s'exécute avec Electron, sans fenêtre visible)
const fs = require("fs");
const path = require("path");
const { app, BrowserWindow } = require("electron");

const CONTENT = path.join(__dirname, "..", "content");
const SVG = path.join(CONTENT, "logo.svg");
const PNG = path.join(CONTENT, "logo.png");
const ICO = path.join(__dirname, "..", "electron", "icon.ico");
const SIZE = 256;

function pngToIco(png) {
  if (png.slice(1, 4).toString() !== "PNG") throw new Error("content/logo.png n'est pas un fichier PNG.");
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
  if (w !== h) console.warn("⚠ l'image n'est pas carrée (" + w + "×" + h + ") : l'icône sera déformée.");
  if (w > 256) console.warn("⚠ image de " + w + " px : Windows préfère 256 px maximum pour une icône.");
  const hdr = Buffer.alloc(6); hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(1, 4);
  const ent = Buffer.alloc(16);
  ent[0] = w >= 256 ? 0 : w; ent[1] = h >= 256 ? 0 : h;
  ent.writeUInt16LE(1, 4); ent.writeUInt16LE(32, 6); ent.writeUInt32LE(png.length, 8); ent.writeUInt32LE(22, 12);
  fs.writeFileSync(ICO, Buffer.concat([hdr, ent, png]));
  console.log("✔ electron/icon.ico écrit (" + w + "×" + h + "). Relance « npm run package » pour une application avec cette icône.");
}

async function rasterize() {
  const svg = fs.readFileSync(SVG, "utf8");
  const win = new BrowserWindow({
    width: SIZE, height: SIZE, show: false, frame: false, transparent: true,
    webPreferences: { offscreen: true, sandbox: true }
  });
  const html = "<!doctype html><html><head><style>html,body{margin:0;background:transparent;overflow:hidden}img{display:block;width:" + SIZE + "px;height:" + SIZE + "px}</style></head><body><img src=\"data:image/svg+xml;base64," + Buffer.from(svg).toString("base64") + "\"></body></html>";
  await win.loadURL("data:text/html;base64," + Buffer.from(html).toString("base64"));
  await new Promise(function (r) { setTimeout(r, 400); });
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: SIZE, height: SIZE });
  const png = image.resize({ width: SIZE, height: SIZE }).toPNG();
  fs.writeFileSync(PNG, png);
  console.log("✔ content/logo.png rendu depuis logo.svg (" + SIZE + "×" + SIZE + ").");
  win.destroy();
  return png;
}

app.whenReady().then(async function () {
  try {
    let png;
    if (fs.existsSync(SVG)) png = await rasterize();
    else if (fs.existsSync(PNG)) png = fs.readFileSync(PNG);
    else throw new Error("aucun logo : ajoute content/logo.svg ou content/logo.png.");
    pngToIco(png);
    app.exit(0);
  } catch (e) {
    console.error("✘ " + e.message);
    app.exit(1);
  }
});
