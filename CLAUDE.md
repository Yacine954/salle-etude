# La Salle d'Étude — repères pour Claude

Application de révision (M2 Finance d'entreprise, Nanterre) maintenue par Yacine Guettari avec l'aide de Claude. Yacine n'est pas développeur : il décrit ce qu'il veut, Claude écrit le code, puis explique en français simple. Répondre en français, tutoiement dans les textes de l'application, vouvoiement avec Yacine.

## Ce qu'est le projet

- Contenu en Markdown : `content/modules/*.md` (un module par fichier, sections `# Cours / Définitions / Formules / Quiz / Exercices / Notes`), `content/annales/` (sujets d'examen : PDF, images, `.md`), réglages dans `content/config.json`.
- Design dans `src/style.css`, logique dans `src/app.js` (+ `src/gate.js` pour l'accès réservé, `src/assistant.js` désactivé), squelette `src/template.html`, images dans `src/assets/`.
- Application installable (PWA) : `src/pwa.js` (enregistrement, bandeau d'installation, bandeau de mise à jour), modèle `src/sw.js`, icônes dans `content/pwa/`. Le build écrit `docs/manifest.webmanifest`, `docs/sw.js` (version = empreinte de la page) et copie les icônes. Inactif en `file://`, donc sans effet dans Electron.
- `node build.js` assemble tout en **une page unique** `docs/index.html`, servie par GitHub Pages : https://yacine954.github.io/salle-etude/ (dépôt https://github.com/Yacine954/salle-etude, branche `main`, dossier `/docs`).
- `npm run package` fabrique l'application Windows (Electron) dans `release/` ; sur le PC du bureau elle est installée dans `%LOCALAPPDATA%\Programs\Salle d'etude`.
- PC de développement principal (depuis le 04/09/2026) : dossier `C:\Users\Yves\Projets\salle-etude` (Node 24, Git, npm autorisé dans PowerShell). Deux scripts double-clic à la racine : `publier.cmd` (build + commit + push) et `fabriquer-application.cmd` (build + package Electron, ouvre `release\`) et `installer-application.cmd` (copie `release\` dans `%LOCALAPPDATA%\Programs\Salle d'etude`, raccourcis via `tools/raccourcis.ps1`, lancement). Depuis Cowork, le dossier peut être partagé (« Ajouter un dossier ») et les scripts lancés par double-clic dans l'Explorateur.
- Le README.md (en français) est le guide utilisateur complet : le tenir à jour à chaque nouvelle fonctionnalité.

## Accès réservé (important)

- Le site est fermé : chaque visiteur a un code personnel (`npm run acces -- ajouter "Prénom Nom"`, `liste`, `retirer`). Le code est mémorisé sur l'appareil (localStorage + IndexedDB + `storage.persist()`) ; un lien direct `#acces=CODE` déverrouille et mémorise en un clic (`src/gate.js`). Le contenu est chiffré dans la page (AES-GCM), clé dans `content/cle-contenu.txt` (**jamais commité**, à copier à la main d'un PC à l'autre ; sans elle, impossible de créer des codes). Les empreintes et clés enveloppées sont dans `content/acces.json` (commité).
- Après tout changement de contenu ou de code d'accès : `node build.js`, puis `git add -A`, `git commit`, `git push`. Le site se met à jour en une à deux minutes.
- Les camarades demandent un accès via le bouton « Demander un accès » (e-mail pré-rempli vers `acces.contact` dans config.json). Yacine encaisse une participation de façon informelle, puis crée le code et l'envoie.
- Le réseau de l'entreprise de Yacine bloque `*.github.io` : tester depuis un autre réseau.

## Conventions de travail

- Toujours vérifier le build (`node build.js` sans avertissement) et, pour un changement de rendu, regarder la page dans un navigateur avant de publier.
- Ne jamais modifier le texte des blocs `<div class="formula">` ni supprimer un encadré « À retenir » sans demande explicite. `tools/verif-cours.js` compare une réécriture de cours à une baseline.
- Les scripts `tools/patch-*.js` sont des migrations déjà appliquées : ne pas les relancer.
- Après une fonctionnalité : commit, push, et si elle touche l'application, repackager.
- L'assistant IA (`assistant-worker/`, `src/assistant.js`) est mis de côté pour raison de coût : ne pas le réactiver sans demande.

## État du plan (validé par Yacine)

Les cinq fonctionnalités du plan sont faites, sans infrastructure payante :

1. **PWA** — v1.2 : manifeste, service worker, installation sur téléphone, hors ligne, mise à jour automatique.
2. **Révision espacée** — v1.3 : boîtes de Leitner (`LEITNER_DAYS`, `NEW_PER_DAY` dans `src/app.js`), stockées dans `progress[module].leitner["definitions:3"] = [boîte, à revoir le, dernière révision, créée le]` ; vue `revision`, carte « Révision espacée » sur l'accueil, boutons « Je savais / Je ne savais pas » sur les cartes révélées d'un module. Boîte ≥ 4 ⇒ carte cochée « maîtrisée ».
3. **Examen blanc** — v1.3 : vue `examen` (setup → run → done), tirage au hasard, **ordre des réponses mélangé** ; les quiz des modules ont été rééquilibrés (`npm run quiz`, script `tools/equilibre-quiz.js`, reproductible et idempotent : à relancer après ajout de questions), chronomètre, note /20 au demi-point, historique dans `localStorage` (`salle-etude-examens-v1`).
4. **Codes à durée limitée** — v1.3 : `tools/acces.js` (`--jusqu-au`, `--essai`, `prolonger … --illimite`), champ `expire` dans `acces.json` ; au build, un code expiré perd sa clé enveloppée (`w`) et garde `e` pour le message « code expiré » (`src/gate.js`).
5. **Compte à rebours** — v1.3 : `config.examens` (titre, date, heure, lieu, modules), carte « Prochains examens » sur l'accueil.

Extras faits en v1.3 : bannière « Nouveautés » (`config.nouveautes`, fermeture mémorisée par version), fiche de révision imprimable par module (vue `fiche`), export / import de la progression (JSON fusionné avec `mergeProgress`).

Idées gardées pour plus tard : sections « Erreurs fréquentes » et « Méthode de l'épreuve » (contenu à écrire), liens vidéo en fin de leçon, compteur de visites anonyme (demande un service).

## Circuit des demandes d'accès (mis en place le 04/09/2026)

- Les demandes arrivent par e-mail « Demande d'accès — La salle d'étude » sur yacineguett@gmail.com (connecteur Gmail de Claude, compte reconnecté sur cette adresse). Labels Gmail : `Label_3` = « Salle d'étude/En attente » (signalée à Yacine), `Label_2` = « Salle d'étude/Code envoyé » (traitée).
- Une tâche planifiée Claude (« Salle d'étude — demandes d'accès », 9h et 19h Paris) lit les demandes non traitées, pose `Label_3` sur les nouvelles et notifie Yacine. Elle ne répond jamais aux demandeurs et ne crée aucun code. **Pas de relance de paiement** aux demandeurs : c'est une décision de Yacine.
- Yacine vérifie qu'il a reçu la participation, puis dit à Claude « ok pour Prénom Nom » (depuis n'importe quel appareil). Claude fait alors, **entièrement dans le cloud, PC éteint ou non** :
  1. retrouver le thread Gmail (`label:Label_3`), relever prénom, nom, adresse, `messageId` du dernier message du demandeur ;
  2. `git clone https://github.com/Yacine954/salle-etude.git` (le dépôt doit être dans les sources GitHub autorisées de la session pour pouvoir pousser), `npm install marked` ;
  3. la clé : fichier `cle-contenu.txt` dans le Google Drive de Yacine, dossier « Salle d'étude (privé) » (id fichier `1I0xZz6dv7jdkP_8rZHt-ZPZ21Q--NDCM`), lu via le connecteur Google Drive et écrit dans `content/cle-contenu.txt` (jamais commité — `.gitignore`) ;
  4. `node tools/acces.js ajouter "Prénom Nom"` (option `--essai` ou `--jusqu-au` si demandé) → code + lien direct ; `node build.js` ; `git add -A`, `git commit -m "Accès pour Prénom Nom"`, `git push` ;
  5. répondre au demandeur dans son thread avec le modèle ci-dessous (Gmail `reply`), poser `Label_2`, retirer `Label_3` ;
  6. supprimer la copie de la clé côté cloud.
  Si le push cloud est refusé (403), repli : déposer `content/acces.json`, `docs/index.html`, `docs/sw.js` dans le dossier du PC (device_commit_files) et lancer `publier.cmd` (double-clic dans l'Explorateur via le contrôle de l'ordinateur). `publier.cmd` fait un `git pull --rebase` avant de construire, pour intégrer les publications faites depuis le cloud.
- Modèle d'e-mail (tutoiement, validé par Yacine) :

  > Salut {Prénom},
  >
  > Voici ton code d'accès personnel à la salle d'étude : **{CODE}**
  > Clique ici, ça s'ouvre directement : https://yacine954.github.io/salle-etude/#acces={CODE}
  > (Le lien sans code, si besoin : https://yacine954.github.io/salle-etude/ )
  >
  > Le code reste enregistré sur ton appareil : tu n'as pas à le retaper. Sur téléphone, tu peux l'installer comme une appli : bandeau « Installer » (Android / Chrome) ou Partager → « Sur l'écran d'accueil » (iPhone / Safari) ; elle marche ensuite même sans connexion.
  >
  > Le code est personnel : merci de ne pas le partager.
  >
  > Bonnes révisions,
  > Yacine
