# La Salle d'Étude — repères pour Claude

Application de révision (M2 Finance d'entreprise, Nanterre) maintenue par Yacine Guettari avec l'aide de Claude. Yacine n'est pas développeur : il décrit ce qu'il veut, Claude écrit le code, puis explique en français simple. Répondre en français, tutoiement dans les textes de l'application, vouvoiement avec Yacine.

## Ce qu'est le projet

- Contenu en Markdown : `content/modules/*.md` (un module par fichier, sections `# Cours / Définitions / Formules / Quiz / Exercices / Notes`), `content/annales/` (sujets d'examen : PDF, images, `.md`), réglages dans `content/config.json`.
- Design dans `src/style.css`, logique dans `src/app.js` (+ `src/gate.js` pour l'accès réservé, `src/assistant.js` désactivé), squelette `src/template.html`, images dans `src/assets/`.
- Application installable (PWA) : `src/pwa.js` (enregistrement, bandeau d'installation, bandeau de mise à jour), modèle `src/sw.js`, icônes dans `content/pwa/`. Le build écrit `docs/manifest.webmanifest`, `docs/sw.js` (version = empreinte de la page) et copie les icônes. Inactif en `file://`, donc sans effet dans Electron.
- `node build.js` assemble tout en **une page unique** `docs/index.html`, servie par GitHub Pages : https://yacine954.github.io/salle-etude/ (dépôt https://github.com/Yacine954/salle-etude, branche `main`, dossier `/docs`).
- `npm run package` fabrique l'application Windows (Electron) dans `release/` ; sur le PC du bureau elle est installée dans `%LOCALAPPDATA%\Programs\Salle d'etude`.
- Le README.md (en français) est le guide utilisateur complet : le tenir à jour à chaque nouvelle fonctionnalité.

## Accès réservé (important)

- Le site est fermé : chaque visiteur a un code personnel (`npm run acces -- ajouter "Prénom Nom"`, `liste`, `retirer`). Le contenu est chiffré dans la page (AES-GCM), clé dans `content/cle-contenu.txt` (**jamais commité**, à copier à la main d'un PC à l'autre ; sans elle, impossible de créer des codes). Les empreintes et clés enveloppées sont dans `content/acces.json` (commité).
- Après tout changement de contenu ou de code d'accès : `node build.js`, puis `git add -A`, `git commit`, `git push`. Le site se met à jour en une à deux minutes.
- Les camarades demandent un accès via le bouton « Demander un accès » (e-mail pré-rempli vers `acces.contact` dans config.json). Yacine encaisse une participation de façon informelle, puis crée le code et l'envoie.
- Le réseau de l'entreprise de Yacine bloque `*.github.io` : tester depuis un autre réseau.

## Conventions de travail

- Toujours vérifier le build (`node build.js` sans avertissement) et, pour un changement de rendu, regarder la page dans un navigateur avant de publier.
- Ne jamais modifier le texte des blocs `<div class="formula">` ni supprimer un encadré « À retenir » sans demande explicite. `tools/verif-cours.js` compare une réécriture de cours à une baseline.
- Les scripts `tools/patch-*.js` sont des migrations déjà appliquées : ne pas les relancer.
- Après une fonctionnalité : commit, push, et si elle touche l'application, repackager.
- L'assistant IA (`assistant-worker/`, `src/assistant.js`) est mis de côté pour raison de coût : ne pas le réactiver sans demande.

## Prochaine séance (plan validé par Yacine)

Cinq fonctionnalités à réaliser, dans cet ordre, sans infrastructure payante :

1. ~~**PWA**~~ — **fait (v1.2)** : manifeste, service worker, installation sur téléphone, hors ligne, mise à jour automatique. Fonctionne avec l'écran d'accès (le déchiffrement se fait dans le navigateur, sur le contenu mis en cache).
2. **Révision espacée des cartes** (définitions et formules) : boîtes de Leitner, file « à revoir aujourd'hui » sur l'accueil.
3. **Mode examen blanc** : questions tirées au hasard dans les modules choisis, chronomètre, note sur 20, correction, historique des scores.
4. **Codes à durée limitée** : date d'expiration facultative par code (`npm run acces -- ajouter "Nom" --jusqu-au 2027-01-31`), essai de sept jours.
5. **Compte à rebours des examens** : dates dans `config.json`, rappel sur l'accueil avec modules prioritaires.

Idées gardées pour plus tard : bannière « Nouveautés », fiche de révision imprimable par module, sections « Erreurs fréquentes » et « Méthode de l'épreuve », liens vidéo en fin de leçon, compteur de visites anonyme, export/import de la progression.
