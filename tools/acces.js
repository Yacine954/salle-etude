// Gestion des codes d'accès personnels.
//
//   npm run acces -- ajouter "Prénom Nom"                       crée un code et l'affiche UNE SEULE FOIS
//   npm run acces -- ajouter "Prénom Nom" --jusqu-au 2027-01-31 idem, valable jusqu'à cette date incluse
//   npm run acces -- ajouter "Prénom Nom" --essai               idem, essai de sept jours
//   npm run acces -- prolonger "Prénom Nom" --jusqu-au 2027-06-30   change la date de fin
//   npm run acces -- prolonger "Prénom Nom" --illimite          retire la date de fin
//   npm run acces -- liste                                      liste les personnes ayant un code
//   npm run acces -- retirer "Prénom Nom"                       désactive le code de cette personne
//
// Après chaque changement : npm run build, puis git add / commit / push.
//
// Comment ça marche : le contenu de la page est chiffré avec une clé secrète (content/cle-contenu.txt,
// jamais publiée). Pour chaque personne, cette clé est elle-même chiffrée avec son code personnel.
// La page publique ne contient que des empreintes et des clés chiffrées : sans code valide, rien n'est lisible.
// Un code à durée limitée porte une date de fin : passé cette date, le build ne publie plus sa clé
// chiffrée (le code ne peut donc plus rien déchiffrer) et la page affiche « code expiré ».

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const ACCES = path.join(ROOT, "content", "acces.json");
const KEYFILE = path.join(ROOT, "content", "cle-contenu.txt");
const ITER = 150000;
const ESSAI_JOURS = 7;

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

/* ---------- dates ---------- */

function today() { return new Date().toISOString().slice(0, 10); }
function plusDays(n) { const d = new Date(); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function checkDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || isNaN(Date.parse(s + "T00:00:00Z"))) throw new Error("date invalide « " + s + "» : attendu AAAA-MM-JJ, par exemple 2027-01-31");
  if (s < today()) throw new Error("la date " + s + " est déjà passée");
  return s;
}
// Un code est expiré le lendemain de sa date de fin (la date de fin est incluse).
function isExpired(c, ref) { return !!c.expire && c.expire < (ref || today()); }
function activeCodes(acces) { return (acces || readAcces()).codes.filter((c) => !isExpired(c)); }

// Lit « --jusqu-au 2027-01-31 », « --essai » ou « --illimite » dans les arguments ; renvoie le reste (le nom).
function parseArgs(rest) {
  const out = { name: [], expire: undefined, illimite: false };
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--jusqu-au" || a === "--jusquau") { out.expire = checkDate(rest[++i] || ""); }
    else if (a === "--essai") { out.expire = plusDays(ESSAI_JOURS); }
    else if (a === "--illimite" || a === "--illimité") { out.illimite = true; }
    else out.name.push(a);
  }
  out.name = out.name.join(" ").trim();
  return out;
}

/* ---------- fichiers ---------- */

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

// Adresse publique du site (config.json, clé « site »), pour fabriquer le lien direct.
function siteUrl() {
  try { const c = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "config.json"), "utf8")); return c.site ? String(c.site).replace(/\/?$/, "/") : ""; } catch (e) { return ""; }
}

function findCode(acces, name) {
  const key = String(name || "").toLowerCase();
  return acces.codes.filter((c) => c.nom.toLowerCase() === key)[0];
}

/* ---------- commandes ---------- */

function addCode(opts) {
  if (!opts.name) throw new Error("indique un nom : npm run acces -- ajouter \"Prénom Nom\"");
  const acces = readAcces();
  const key = readContentKey(true);
  const code = generateCode();
  const salt = crypto.randomBytes(16).toString("hex");
  const wrapped = aesEncrypt(deriveKey(code, salt), key);
  const entry = { nom: opts.name, date: today(), hash: hashCode(code), salt: salt, iv: wrapped.iv, wrap: wrapped.data };
  if (opts.expire) entry.expire = opts.expire;
  acces.codes.push(entry);
  writeAcces(acces);
  const duree = opts.expire ? "\n   Valable jusqu'au " + opts.expire + " inclus." : "";
  const lien = siteUrl() ? "\n   Lien direct (connecte en un clic) : " + siteUrl() + "#acces=" + code + "\n" : "";
  console.log("\n✔ Code créé pour " + opts.name + " :\n\n      " + code + "\n" + duree + lien + "\nNote-le maintenant : il n'est stocké nulle part en clair. Puis : npm run build, git add -A, git commit, git push.\n");
}

function extendCode(opts) {
  if (!opts.name) throw new Error("indique un nom : npm run acces -- prolonger \"Prénom Nom\" --jusqu-au 2027-06-30");
  if (!opts.expire && !opts.illimite) throw new Error("indique la nouvelle fin : --jusqu-au AAAA-MM-JJ, --essai, ou --illimite");
  const acces = readAcces();
  const c = findCode(acces, opts.name);
  if (!c) throw new Error("aucun code au nom de « " + opts.name + " ». Voir : npm run acces -- liste");
  if (opts.illimite) delete c.expire; else c.expire = opts.expire;
  writeAcces(acces);
  console.log("✔ Code de " + c.nom + (c.expire ? " valable jusqu'au " + c.expire + " inclus." : " sans limite de durée.") + " Puis : npm run build, git add -A, git commit, git push.");
}

function listCodes() {
  const acces = readAcces();
  if (!acces.codes.length) { console.log("Aucun code : le site est ouvert à tous. Crée le premier avec : npm run acces -- ajouter \"Ton nom\""); return; }
  const actifs = activeCodes(acces).length;
  console.log(acces.codes.length + " code(s), dont " + actifs + " actif(s) :");
  acces.codes.forEach((c) => {
    const etat = isExpired(c) ? "  ✘ EXPIRÉ depuis le " + c.expire : c.expire ? "  ⏳ jusqu'au " + c.expire : "";
    console.log("  • " + c.nom + "  (créé le " + c.date + ")" + etat);
  });
  if (actifs < acces.codes.length) console.log("Les codes expirés ne sont plus publiés au prochain build. Pour en réactiver un : npm run acces -- prolonger \"Nom\" --jusqu-au AAAA-MM-JJ");
}

function removeCode(name) {
  const acces = readAcces();
  const before = acces.codes.length;
  acces.codes = acces.codes.filter((c) => c.nom.toLowerCase() !== String(name || "").toLowerCase());
  if (acces.codes.length === before) throw new Error("aucun code au nom de « " + name + " ». Voir : npm run acces -- liste");
  writeAcces(acces);
  console.log("✔ Code de " + name + " retiré. Puis : npm run build, git add -A, git commit, git push — l'accès sera coupé à la publication.");
}

module.exports = { ITER, readAcces, readContentKey, aesEncrypt, hashCode, isExpired, activeCodes, today };

if (require.main === module) {
  const [cmd, ...rest] = process.argv.slice(2);
  try {
    if (cmd === "ajouter") addCode(parseArgs(rest));
    else if (cmd === "prolonger") extendCode(parseArgs(rest));
    else if (cmd === "liste") listCodes();
    else if (cmd === "retirer") removeCode(rest.join(" ").trim());
    else {
      console.log("Usage :\n  npm run acces -- ajouter \"Prénom Nom\" [--jusqu-au AAAA-MM-JJ | --essai]\n  npm run acces -- prolonger \"Prénom Nom\" (--jusqu-au AAAA-MM-JJ | --essai | --illimite)\n  npm run acces -- liste\n  npm run acces -- retirer \"Prénom Nom\"");
      process.exit(cmd ? 1 : 0);
    }
  } catch (e) { console.error("✘ " + e.message); process.exit(1); }
}
