// Fabrique l'application Windows dans release/.
// 1. reconstruit docs/index.html ; 2. copie le strict nécessaire dans release/.stage ;
// 3. empaquette avec Electron. Usage : npm run package
const fs = require("fs");
const path = require("path");
const { packager } = require("@electron/packager");
const { build } = require("../build.js");

const ROOT = path.join(__dirname, "..");
const RELEASE = path.join(ROOT, "release");
const STAGE = path.join(RELEASE, ".stage");

async function main() {
  build();
  fs.rmSync(STAGE, { recursive: true, force: true });
  fs.mkdirSync(STAGE, { recursive: true });

  var pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  fs.writeFileSync(path.join(STAGE, "package.json"), JSON.stringify({
    name: pkg.name, productName: pkg.productName, version: pkg.version, description: pkg.description,
    main: "electron/main.js", author: pkg.author, license: pkg.license, private: true
  }, null, 2));
  fs.cpSync(path.join(ROOT, "electron"), path.join(STAGE, "electron"), { recursive: true });
  fs.mkdirSync(path.join(STAGE, "docs"));
  fs.copyFileSync(path.join(ROOT, "docs", "index.html"), path.join(STAGE, "docs", "index.html"));
  var annales = path.join(ROOT, "docs", "annales");
  if (fs.existsSync(annales)) fs.cpSync(annales, path.join(STAGE, "docs", "annales"), { recursive: true });

  var paths = await packager({
    dir: STAGE,
    out: RELEASE,
    name: pkg.productName,
    platform: "win32",
    arch: "x64",
    overwrite: true,
    asar: { unpack: "**/docs/annales/**" },
    tmpdir: false,
    icon: path.join(ROOT, "electron", "icon.ico"),
    appCopyright: pkg.author,
    win32metadata: { CompanyName: pkg.productName, ProductName: pkg.productName, FileDescription: pkg.description }
  });
  fs.rmSync(STAGE, { recursive: true, force: true });
  console.log("✔ application écrite dans " + path.relative(ROOT, paths[0]));
}

main().catch(function (e) { console.error("✘ " + e.message); process.exit(1); });
