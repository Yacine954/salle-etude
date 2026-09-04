/* ---------- Accès réservé : déverrouillage du contenu avec un code personnel ---------- */
(function () {
  "use strict";
  var VERROU = window.VERROU;
  if (!VERROU) return;
  var KEY = "salle-etude-acces-v1";
  var cfg = (window.CONFIG && CONFIG.acces) || {};
  var appEl = document.getElementById("app");

  function normalize(code) { return String(code || "").normalize("NFKC").trim().toUpperCase(); }
  function b64(s) { var bin = atob(s), arr = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); return arr; }
  function hexToBytes(h) { var arr = new Uint8Array(h.length / 2); for (var i = 0; i < arr.length; i++) arr[i] = parseInt(h.substr(i * 2, 2), 16); return arr; }
  function toHex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function unlock(code) {
    code = normalize(code);
    if (!code) return Promise.reject(new Error("Entre ton code d'accès."));
    if (!window.crypto || !crypto.subtle) return Promise.reject(new Error("Ce navigateur ne permet pas le déchiffrement. Ouvre la page en https ou dans un navigateur récent."));
    var enc = new TextEncoder();
    var entry;
    return crypto.subtle.digest("SHA-256", enc.encode(code)).then(function (h) {
      var hex = toHex(h);
      entry = VERROU.codes.filter(function (c) { return c.h === hex; })[0];
      if (!entry) throw new Error("Code inconnu ou désactivé.");
      return crypto.subtle.importKey("raw", enc.encode(code), "PBKDF2", false, ["deriveKey"]);
    }).then(function (base) {
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt: hexToBytes(entry.s), iterations: VERROU.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    }).then(function (wrapKey) {
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(entry.i) }, wrapKey, b64(entry.w));
    }).then(function (contentKeyRaw) {
      return crypto.subtle.importKey("raw", contentKeyRaw, "AES-GCM", false, ["decrypt"]);
    }).then(function (contentKey) {
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(VERROU.iv) }, contentKey, b64(VERROU.data));
    }).then(function (plain) {
      var data = JSON.parse(new TextDecoder().decode(plain));
      MODULES.length = 0; Array.prototype.push.apply(MODULES, data.modules);
      ANNALES.length = 0; Array.prototype.push.apply(ANNALES, data.annales);
      try { localStorage.setItem(KEY, code); } catch (e) {}
      return true;
    }, function (e) {
      throw new Error(e && e.message && /Code/.test(e.message) ? e.message : "Code inconnu ou désactivé.");
    });
  }

  // Lien « Demander un accès » : formulaire en ligne si configuré, sinon e-mail pré-rempli.
  function requestBlock() {
    var href = "";
    if (cfg.formulaire) href = cfg.formulaire;
    else if (cfg.contact) {
      var subject = "Demande d'accès — " + (CONFIG.titre || "Salle d'étude");
      var body = "Bonjour,\n\nJe souhaite un code d'accès à la salle d'étude.\n\nNom : \nPrénom : \nAdresse e-mail : \nPromotion / groupe : \n\nMerci !";
      href = "mailto:" + cfg.contact + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    }
    if (!href) return "";
    return '<div class="lock-request"><p>' + esc(cfg.demande || "Tu n'as pas encore de code ?") + '</p>' +
      '<a class="btn ghost sm" href="' + esc(href) + '"' + (cfg.formulaire ? ' target="_blank" rel="noopener"' : '') + '>' + esc(cfg.demandeBouton || "Demander un accès") + '</a>' +
      (cfg.info ? '<p class="lock-hint">' + esc(cfg.info) + '</p>' : '') + '</div>';
  }

  function renderLock(message, busy) {
    var logo = CONFIG.logo ? '<img src="' + CONFIG.logo + '" alt="">' : esc(CONFIG.sigle || "SÉ");
    appEl.innerHTML =
      '<div class="lock"><div class="lock-card">' +
        '<div class="brand"><div class="mark">' + logo + '</div><div><div class="t">' + esc(CONFIG.titre) + '</div><div class="s">' + esc(CONFIG.sousTitre || "") + '</div></div></div>' +
        '<h1>' + esc(cfg.titre || "Accès réservé") + '</h1>' +
        '<p>' + esc(cfg.message || "Cette salle d'étude est réservée aux personnes qui ont reçu un code d'accès personnel.") + '</p>' +
        '<form data-lock-form autocomplete="off"><input type="text" data-lock-code placeholder="SE-XXXX-XXXX" spellcheck="false" autocapitalize="characters" ' + (busy ? 'disabled' : '') + '>' +
        '<button class="btn acc" type="submit" ' + (busy ? 'disabled' : '') + '>' + (busy ? "Vérification…" : "Entrer") + '</button></form>' +
        (message ? '<p class="lock-err">' + esc(message) + '</p>' : '') +
        '<p class="lock-hint">' + esc(cfg.aide || "Le code est personnel : il t'a été remis directement. Il reste enregistré sur cet appareil.") + '</p>' +
        requestBlock() +
      '</div></div>';
    var input = appEl.querySelector("[data-lock-code]");
    if (input && !busy) input.focus();
  }

  function run(start) {
    if (CONFIG.ambiance === "lofi") document.body.classList.add("ambiance-lofi");
    var stored = "";
    try { stored = localStorage.getItem(KEY) || ""; } catch (e) {}
    var go = function () { appEl.innerHTML = ""; start(); };
    var attempt = function (code) {
      renderLock("", true);
      unlock(code).then(go, function (e) { renderLock(e.message, false); });
    };
    appEl.addEventListener("submit", function (e) {
      var f = e.target.closest("[data-lock-form]");
      if (!f) return;
      e.preventDefault();
      attempt(f.querySelector("[data-lock-code]").value);
    });
    if (stored) attempt(stored); else renderLock("", false);
  }

  window.SalleEtudeGate = {
    run: run,
    unlock: unlock,
    logout: function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
  };
})();
