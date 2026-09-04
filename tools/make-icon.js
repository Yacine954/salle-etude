// Fabrique electron/icon.ico à partir de content/logo.png (PNG carré, 256×256 conseillé).
// Usage : npm run icon
const fs = require("fs");
const path = require("path");
const src = path.join(__dirname, "..", "content", "logo.png");
const out = path.join(__dirname, "..", "electron", "icon.ico");
if (!fs.existsSync(src)) { console.error("✘ content/logo.png introuvable (un PNG carré, 256×256 de préférence)."); process.exit(1); }
const png = fs.readFileSync(src);
if (png.slice(1, 4).toString() !== "PNG") { console.error("✘ content/logo.png n'est pas un fichier PNG."); process.exit(1); }
const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
if (w !== h) console.warn("⚠ l'image n'est pas carrée (" + w + "×" + h + ") : l'icône sera déformée.");
if (w > 256) console.warn("⚠ image de " + w + " px : Windows préfère 256 px maximum pour une icône.");
const hdr = Buffer.alloc(6); hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(1, 4);
const ent = Buffer.alloc(16); ent[0] = w >= 256 ? 0 : w; ent[1] = h >= 256 ? 0 : h; ent.writeUInt16LE(1, 4); ent.writeUInt16LE(32, 6); ent.writeUInt32LE(png.length, 8); ent.writeUInt32LE(22, 12);
fs.writeFileSync(out, Buffer.concat([hdr, ent, png]));
console.log("✔ electron/icon.ico écrit (" + w + "×" + h + "). Relance « npm run package » pour une application avec cette icône.");
