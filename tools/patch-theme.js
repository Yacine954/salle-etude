const fs = require("fs"); const path = require("path"); const ROOT = path.join(__dirname, "..");
function rep(file, a, b) { file = path.join(ROOT, file); let s = fs.readFileSync(file, "utf8"); const n = s.split(a).length - 1; if (n !== 1) throw new Error(file + ": " + n + " pour " + a.slice(0, 60)); fs.writeFileSync(file, s.replace(a, () => b)); }
rep("src/app.js", `lastModule: state.lastModule, ambiance: state.ambiance })`, `lastModule: state.lastModule, ambiance: state.ambiance, theme: state.theme })`);
rep("src/app.js", `    ambiance: prefs.ambiance || CONFIG.ambiance || "neutre",`, `    ambiance: prefs.ambiance || CONFIG.ambiance || "neutre",
    theme: prefs.theme || CONFIG.theme || "auto",`);
rep("src/app.js", `        '<button class="btn ghost sm" data-ambiance="1" style="justify-content:center">'`, `        '<button class="btn ghost sm" data-theme-toggle="1" style="justify-content:center">' + ({ auto: "Thème : automatique", light: "Thème : clair", dark: "Thème : sombre" })[state.theme] + '</button>' +
        '<button class="btn ghost sm" data-ambiance="1" style="justify-content:center">'`);
rep("src/app.js", `    document.body.classList.toggle("ambiance-lofi", state.ambiance === "lofi");`, `    document.body.classList.toggle("ambiance-lofi", state.ambiance === "lofi");
    if (state.theme === "light" || state.theme === "dark") document.documentElement.setAttribute("data-theme", state.theme);
    else document.documentElement.removeAttribute("data-theme");`);
rep("src/app.js", `    if ((el = t.closest("[data-ambiance]")))`, `    if ((el = t.closest("[data-theme-toggle]"))) { state.theme = state.theme === "auto" ? "dark" : state.theme === "dark" ? "light" : "auto"; savePrefs(); render(); return; }
    if ((el = t.closest("[data-ambiance]")))`);
rep("electron/main.js", `const { app, BrowserWindow, shell, Menu } = require("electron");`, `const { app, BrowserWindow, shell, Menu, nativeTheme } = require("electron");`);
rep("electron/main.js", `app.whenReady().then(() => {
  createWindow();`, `app.whenReady().then(() => {
  if (process.env.SMOKE_THEME) nativeTheme.themeSource = process.env.SMOKE_THEME;
  createWindow();`);
console.log("thème ok");
