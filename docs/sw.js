/* Service worker de la Salle d'étude — fichier généré par build.js, ne pas modifier ici.
   Le modèle se trouve dans src/sw.js ; la version change à chaque construction,
   ce qui déclenche la mise à jour chez les visiteurs. */
"use strict";

var VERSION = "b499890fa48f";
var CACHE = "salle-etude-" + VERSION;
var POLICES = "salle-etude-polices";
var FICHIERS = ["index.html","manifest.webmanifest","icone-192.png","icone-512.png","icone-maskable-512.png","icone-apple-180.png","annales/2025-partiel-risques-exemple.pdf"];

/* ---------- installation : on met tout en cache ---------- */

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // addAll échoue en bloc : on ajoute un par un pour qu'une annale manquante
      // n'empêche pas la mise en cache du reste.
      return Promise.all(FICHIERS.map(function (url) {
        return cache.add(new Request(url, { cache: "reload" })).catch(function () {});
      }));
    })
  );
});

/* ---------- activation : ménage des anciennes versions ---------- */

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (noms) {
      return Promise.all(noms.map(function (n) {
        if (n !== CACHE && n !== POLICES) return caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* ---------- la page demande à passer à la nouvelle version ---------- */

self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "activer-maintenant") self.skipWaiting();
});

/* ---------- lectures ---------- */

function reseauDabord(request, secours) {
  return fetch(request).then(function (rep) {
    if (rep && rep.ok) {
      var copie = rep.clone();
      caches.open(CACHE).then(function (c) { c.put(secours || request, copie); });
    }
    return rep;
  }).catch(function () {
    return caches.match(secours || request).then(function (cache) {
      if (cache) return cache;
      throw new Error("hors ligne");
    });
  });
}

function cacheDabord(request, nomCache) {
  return caches.match(request).then(function (cache) {
    if (cache) return cache;
    return fetch(request).then(function (rep) {
      if (rep && (rep.ok || rep.type === "opaque")) {
        var copie = rep.clone();
        caches.open(nomCache || CACHE).then(function (c) { c.put(request, copie); });
      }
      return rep;
    });
  });
}

self.addEventListener("fetch", function (e) {
  var request = e.request;
  if (request.method !== "GET") return;

  var url;
  try { url = new URL(request.url); } catch (err) { return; }

  // Polices Google : servies depuis le cache dès la deuxième visite, donc lisibles hors ligne.
  if (url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com") {
    e.respondWith(cacheDabord(request, POLICES));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // La page elle-même : réseau d'abord, pour recevoir les nouveautés dès qu'il y a du réseau.
  if (request.mode === "navigate") {
    e.respondWith(reseauDabord(request, FICHIERS[0]));
    return;
  }

  // Annales et icônes : cache d'abord, ça ne change pas d'une minute à l'autre.
  e.respondWith(cacheDabord(request));
});
