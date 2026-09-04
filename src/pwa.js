/* ---------- PWA : installation sur l'appareil, hors ligne, mise à jour ----------
   Ce module est indépendant de l'application : il s'accroche à <body> et non à #app,
   pour survivre aux re-rendus et fonctionner aussi devant l'écran d'accès.
   Il ne fait rien dans l'application Windows (Electron ouvre la page en file://). */
(function () {
  "use strict";

  var http = location.protocol === "http:" || location.protocol === "https:";
  if (!http || !("serviceWorker" in navigator)) return;

  var DISMISS_KEY = "salle-etude-pwa-install-v1";
  var installEvent = null;
  var majDemandee = false;
  var reloading = false;
  var bar = null;

  function get(key) { try { return localStorage.getItem(key) || ""; } catch (e) { return ""; } }
  function set(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  /* ---------- bandeau ---------- */

  function hide() {
    if (!bar) return;
    bar.classList.remove("show");
    var el = bar;
    bar = null;
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
  }

  // actions : liste de { label, accent, run }. Une croix ferme toujours le bandeau.
  function show(text, actions, onClose) {
    hide();
    var el = document.createElement("div");
    el.className = "pwa-bar";
    el.setAttribute("role", "status");

    var p = document.createElement("p");
    p.textContent = text;
    el.appendChild(p);

    (actions || []).forEach(function (a) {
      var b = document.createElement("button");
      b.className = "btn sm " + (a.accent ? "acc" : "ghost");
      b.type = "button";
      b.textContent = a.label;
      b.addEventListener("click", function () { hide(); a.run(); });
      el.appendChild(b);
    });

    var close = document.createElement("button");
    close.className = "pwa-close";
    close.type = "button";
    close.setAttribute("aria-label", "Fermer");
    close.textContent = "×";
    close.addEventListener("click", function () { hide(); if (onClose) onClose(); });
    el.appendChild(close);

    document.body.appendChild(el);
    bar = el;
    requestAnimationFrame(function () { el.classList.add("show"); });
    return el;
  }

  function flash(text, ms) {
    show(text, []);
    setTimeout(hide, ms || 4000);
  }

  /* ---------- mise à jour ---------- */

  function proposeUpdate(worker) {
    show("Une nouvelle version de la salle d'étude est prête.", [
      { label: "Actualiser", accent: true, run: function () { majDemandee = true; worker.postMessage({ type: "activer-maintenant" }); } }
    ]);
  }

  function watch(reg) {
    // Un exemplaire déjà en attente (page rouverte avant d'avoir actualisé).
    if (reg.waiting && navigator.serviceWorker.controller) proposeUpdate(reg.waiting);

    reg.addEventListener("updatefound", function () {
      var worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", function () {
        if (worker.state !== "installed") return;
        if (navigator.serviceWorker.controller) proposeUpdate(worker);
        else flash("La salle d'étude est maintenant disponible hors ligne.");
      });
    });

    // Recherche de mise à jour au retour sur l'onglet, au maximum une fois par heure.
    var last = Date.now();
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - last < 3600000) return;
      last = Date.now();
      reg.update().catch(function () {});
    });
  }

  // On ne recharge que si le visiteur a demandé la mise à jour : à la toute première
  // visite, le service worker prend le contrôle de la page et cet événement se déclenche
  // aussi — recharger là serait un clignotement gratuit.
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (!majDemandee || reloading) return;
    reloading = true;
    location.reload();
  });

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").then(watch).catch(function () {});
  });

  /* ---------- installation ---------- */

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    installEvent = e;
    if (get(DISMISS_KEY) === "non") return;
    setTimeout(function () {
      if (!installEvent || bar) return;
      show("Installe la salle d'étude sur ton téléphone : elle s'ouvre comme une application et marche sans connexion.", [
        { label: "Installer", accent: true, run: install }
      ], function () { set(DISMISS_KEY, "non"); });
    }, 2500);
  });

  function install() {
    if (!installEvent) return Promise.resolve(false);
    var e = installEvent;
    installEvent = null;
    e.prompt();
    return e.userChoice.then(function (choice) { return choice.outcome === "accepted"; }, function () { return false; });
  }

  window.addEventListener("appinstalled", function () {
    installEvent = null;
    set(DISMISS_KEY, "non");
    flash("Installée. Retrouve la salle d'étude sur ton écran d'accueil.");
  });

  // Petite API pour l'application (bouton « Installer » dans les réglages).
  window.SalleEtudePWA = {
    installable: function () { return !!installEvent; },
    install: install
  };
})();
