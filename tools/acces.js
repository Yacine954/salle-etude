// Gestion des codes d'accès personnels.
//
//   npm run acces -- ajouter "Prénom Nom"     crée un code et l'affiche UNE SEULE FOIS
//   npm run acces -- liste                    liste les personnes ayant un code
//   npm run acces -- retirer "Prénom Nom"     désactive le code de cette personne
//
// Après chaque changement : npm run build, puis git add / commit / push.
//
// Comment ça marche : le contenu de la page est chiffré avec une clé secrète (content/cle-contenu.txt,
// jamais publiée). Pour chaque personne, cette clé est elle-même chiffrée avec son code personnel.
// La page publique ne contient que des empreintes et des clés chiffrées : sans code valide, rien n'est lisible.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const ACCES = path.join(ROOT, "content", "acces.json");
const KEYFILE = path.join(ROOT, "content", "cle-contenu.txt");
const ITER = 150000;

function normalize(code) { return String(code || "").normalize("NFKC").trim().toUpperCase(); }
function hashCode(code) { return crypto.createHash("sha256").update(normalize(code)).digest("hex"); }
function deriveKey(code, saltHex) { return crypto.pbkdf2Sync(normalize(code), Buffer.from(saltHex, "hex"), ITER, 32, "sha256"); }
function aesEncrypt(key, data) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([c.update(data), c.final(), c.getAuthTag()]);
  return { iv: iv.toString("base64"), data: enc.toString("base64") };
}
function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0/O ni 1/I
  const pick = (n) => Array.from(crypto.randomBytes(n)).map((b) => alphabet[b % alphabet.length]).join("");
  return "SE-" + pick(4) + "-" + pick(4);
}

function readAcces() {
  if (!fs.existsSync(ACCES)) return { codes: [] };
  try { return JSON.parse(fs.readFileSync(ACCES, "utf8")); } catch (e) { throw new Error("content/acces.json est illisible : " + e.message); }
}
function writeAcces(a) { fs.writeFileSync(ACCES, JSON.stringify(a, null, 2) + "\n"); }

function readContentKey(create) {
  if (fs.existsSync(KEYFILE)) {
    const hex = fs.readFileSync(KEYFILE, "utf8").trim();
    if (!/^[0-9a-f]{64}$/i.test(hex)) throw new Error("content/cle-contenu.txt est invalide.");
    return Buffer.from(hex, "hex");
  }
  if (!create) return null;
  const key = crypto.randomBytes(32);
  fs.writeFileSync(KEYFILE, key.toString("hex") + "\n");
  console.log("• Clé de contenu créée : content/cle-contenu.txt — SAUVEGARDE ce fichier (il n'est pas publié sur GitHub) et copie-le sur ton autre PC.");
  return key;
}

function addCode(name) {
  if (!name) throw new Error("indique un nom : npm run acces -- ajouter \"Prénom Nom\"");
  const acces = readAcces();
  const key = readContentKey(true);
  const code = generateCode();
  const salt = crypto.randomBytes(16).toString("hex");
  const wrapped = aesEncrypt(deriveKey(code, salt), key);
  acces.codes.push({ nom: name, date: new Date().toISOString().slice(0, 10), hash: hashCode(code), salt: salt, iv: wrapped.iv, wrap: wrapped.data });
  writeAcces(acces);
  console.log("\n✔ Code créé pour " + name + " :\n\n      " + code + "\n\nNote-le maintenant : il n'est stocké nulle part en clair. Puis : npm run build, git add -A, git commit, git push.\n");
}

function listCodes() {
  const acces = readAcces();
  if (!acces.codes.length) { console.log("Aucun code : le site est ouvert à tous. Crée le premier avec : npm run acces -- ajouter \"Ton nom\""); return; }
  console.log(acces.codes.length + " code(s) actif(s) :");
  acces.codes.forEach((c) => console.log("  • " + c.nom + "  (créé le " + c.date + ")"));
}

function removeCode(name) {
  const acces = readAcces();
  const before = acces.codes.length;
  acces.codes = acces.codes.filter((c) => c.nom.toLowerCase() !== String(name || "").toLowerCase());
  if (acces.codes.length === before) throw new Error("aucun code au nom de « " + name + " ». Voir : npm run acces -- liste");
  writeAcces(acces);
  console.log("✔ Code de " + name + " retiré. Puis : npm run build, git add -A, git commit, git push — l'accès sera coupé à la publication.");
}

module.exports = { ITER, readAcces, readContentKey, aesEncrypt, hashCode };

if (require.main === module) {
  const [cmd, ...rest] = process.argv.slice(2);
  const arg = rest.join(" ").trim();
  try {
    if (cmd === "ajouter") addCode(arg);
    else if (cmd === "liste") listCodes();
    else if (cmd === "retirer") removeCode(arg);
    else { console.log("Usage :\n  npm run acces -- ajouter \"Prénom Nom\"\n  npm run acces -- liste\n  npm run acces -- retirer \"Prénom Nom\""); process.exit(cmd ? 1 : 0); }
  } catch (e) { console.error("✘ " + e.message); process.exit(1); }
}
