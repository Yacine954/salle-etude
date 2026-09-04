# La Salle d'Étude

Application de révision du M2 Finance d'entreprise : cours, définitions et formules en mode cartes, quiz corrigés, exercices et notes personnelles, module par module.

Tout le projet tient dans ce dossier. Le contenu est écrit en fichiers texte (Markdown), le design dans un fichier de style, et un script assemble le tout en **une seule page HTML** (`docs/index.html`) qui fonctionne partout : navigateur, site GitHub Pages, artefact Claude et application Windows.

```
salle-etude/
├── content/
│   ├── config.json          titre, textes d'accueil, semestres, dates d'examens, bannière nouveautés
│   ├── modules/             un fichier .md par module (l'ordre des fichiers = l'ordre des modules)
│   └── pwa/                 les icônes de l'application installée sur téléphone
├── src/
│   ├── style.css            tout le design (les couleurs et polices sont en haut du fichier)
│   ├── app.js               la logique (navigation, cartes, quiz, progression)
│   ├── pwa.js               installation sur l'appareil, hors ligne, bandeau de mise à jour
│   ├── sw.js                le modèle du service worker (le cache hors ligne)
│   └── template.html        le squelette de la page
├── docs/index.html          LA PAGE CONSTRUITE (ne pas modifier à la main, servie par GitHub Pages)
├── electron/                l'enveloppe « application Windows »
├── build.js                 le script de construction
└── package.json             les commandes npm
```

## 1. Installer (une seule fois par PC)

1. Installer [Node.js](https://nodejs.org) (version LTS).
2. Ouvrir un terminal dans ce dossier et lancer :

```bash
npm install
```

Si plus tard `npm start` se plaint qu'Electron n'est pas installé (le téléchargement de 100 Mo s'est interrompu), relance simplement :

```bash
node node_modules/electron/install.js
```

**Si PowerShell refuse de lancer npm** (« l'exécution de scripts est désactivée sur ce système ») : c'est Windows qui bloque les scripts, pas le projet. Deux solutions, au choix :

```powershell
npm.cmd install                                              # contourne, rien à changer sur le PC
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned   # autorise une fois pour toutes
```

Après la seconde commande (répondre `O`), ferme et rouvre le terminal. Sur un poste géré par l'entreprise, la modification peut être refusée : reste alors sur `npm.cmd`.

## 2. Les commandes du quotidien

| Commande | Effet |
| --- | --- |
| `npm run build` | reconstruit `docs/index.html` à partir de `content/` et `src/` |
| `npm run watch` | idem, en continu : chaque enregistrement reconstruit la page |
| `npm start` | construit puis ouvre l'application Windows (fenêtre autonome) |
| `npm run package` | fabrique l'exécutable distribuable dans `release/` |

Pour voir le résultat pendant que tu travailles : lance `npm run watch`, ouvre `docs/index.html` dans ton navigateur et recharge la page après chaque modification.

**Sans terminal.** Deux fichiers à double-cliquer dans le dossier du projet font le travail à ta place :

- `publier.cmd` — reconstruit la page, enregistre les changements et les envoie sur GitHub (le site est à jour une à deux minutes plus tard). S'il n'y a rien de nouveau, il le dit et s'arrête.
- `fabriquer-application.cmd` — fabrique l'application Windows dans `release\` et ouvre le dossier à la fin (quelques minutes).

En cas de problème, la fenêtre reste ouverte avec le message d'erreur : copie-le à Claude.

## 3. Ajouter ou modifier un module

Chaque module est un fichier `content/modules/NN-identifiant.md`. Le numéro `NN` fixe l'ordre d'affichage. Pour créer un module, copie un fichier existant, renomme-le et change son en-tête :

```markdown
---
id: fiscalite            identifiant unique, sans espace ni accent
code: S10                groupe (semestre) ; son nom lisible est dans config.json
priorite: 2              1, 2 ou 3
titre: Fiscalité de l'entreprise
accroche: Une phrase qui résume le module.
couleur: 300             teinte de 0 à 360 (0 rouge, 120 vert, 200 bleu, 280 violet…)
---
```

Le corps du fichier est découpé en sections `# ` et en éléments `## ` :

````markdown
# Cours

## Titre de la leçon
Texte de la leçon en Markdown : **gras**, listes, tableaux…

```formule
Résultat = Produits − Charges
```

> **À retenir** : la phrase clé de la leçon.

# Définitions

## Terme
Sa définition en une ou deux phrases.

# Formules

## Nom de la formule
```
Formule = A × B
```
> Remarque facultative.

# Quiz

## La question ?
- Mauvaise réponse
- [x] Bonne réponse
- Autre mauvaise réponse
> Explication affichée après correction.

# Exercices

## Titre de l'exercice
L'énoncé.

> **Solution** : la correction.

# Notes

Espace libre en Markdown : tes remarques, ce que le prof a dit en cours, des liens…
````

Règles utiles :

- Les leçons existantes sont écrites en HTML (elles commencent par `<p>`). Tu peux les garder telles quelles ou les réécrire en Markdown ; le script accepte les deux.
- Une section vide peut être omise. Un module sans quiz affiche simplement « — ».
- Pour un « < » suivi d'une lettre dans un texte, écris `&lt;` (sinon le navigateur croit à une balise).
- Le script signale dans le terminal un quiz sans réponse `[x]` ou un en-tête incomplet.

## 4. Ajouter des notes

Ouvre le fichier du module, écris sous `# Notes`, relance `npm run build`. L'onglet **Notes** du module affiche le résultat, et la recherche fouille aussi dedans.

## 4 bis. Les annales (sujets d'examen)

La page **Annales** du menu rassemble les sujets d'examen, partiels et devoirs, classés par module, avec un corrigé dépliable. Chaque module concerné gagne aussi un onglet « Annales ».

Tout se passe dans le dossier `content/annales/` :

- **Le plus simple** : dépose un PDF ou une image (`.png`, `.jpg`, `.webp`) dans le dossier. Il devient un sujet à part entière ; le nom du fichier sert de titre. Nomme-le avec l'année et l'identifiant du module pour qu'il soit rangé automatiquement, par exemple `2025-partiel-risques.pdf` ou `2024-examen-tresorerie-page1.jpg`.
- **Plus complet** : un fichier `.md` décrit le sujet, joint des fichiers et contient le texte du sujet et son corrigé :

````markdown
---
titre: Partiel de gestion des risques
module: risques              identifiant du module (voir l'en-tête de son fichier)
annee: 2025
session: Janvier
type: Partiel                Partiel, Examen, Rattrapage, Devoir, TD…
duree: 2 h
fichiers: 2025-partiel-risques.pdf, 2025-partiel-risques-annexe.png
---

# Sujet
Le texte du sujet en Markdown (facultatif si le PDF suffit).

# Corrigé
Le corrigé, affiché seulement quand l'étudiant clique sur « Voir le corrigé ».
````

Puis `npm run build` : les fichiers sont copiés dans `docs/annales/` et publiés avec le site. Les PDF s'ouvrent dans un nouvel onglet, les images s'affichent en vignettes cliquables, et la recherche fouille les titres et les textes.

Un exemple (`2025-partiel-risques-exemple.md` et son PDF) est fourni : supprime-le quand tu as tes vrais sujets. Évite les PDF de plus d'une vingtaine de Mo : le dépôt GitHub deviendrait lourd à cloner.

## 4 ter. S'entraîner : révision espacée, examen blanc, compte à rebours, fiches

Depuis la version 1.3, le menu a une rubrique **S'entraîner** et l'accueil affiche deux cartes : la révision du jour et les prochains examens. Rien de tout cela ne demande de serveur : tout est calculé et enregistré sur l'appareil de l'élève (et compris dans l'export de progression, voir plus bas).

**Révision espacée (boîtes de Leitner).** Chaque définition et chaque formule est une carte. Quand l'élève révèle une carte en mode cartes (dans un module ou dans la révision du jour), il répond « Je savais » ou « Je ne savais pas ». Une carte sue monte d'une boîte et revient plus tard (1, 2, 4, 8, 16 puis 32 jours) ; une carte ratée redescend en boîte 1 et revient dès le lendemain. Chaque jour, au plus dix cartes jamais vues s'ajoutent, en commençant par les modules de priorité 1. À partir de la boîte 4, la carte est automatiquement cochée « maîtrisée » dans l'avancement. Le nombre de cartes du jour est affiché dans le menu ; la page « Révision du jour » montre aussi le remplissage des boîtes. Pour changer le rythme : `LEITNER_DAYS` et `NEW_PER_DAY` en haut de la section « Révision espacée » de `src/app.js`.

**Examen blanc.** L'élève choisit ses modules (boutons « Tout », « Aucun », « Priorité 1 »), le nombre de questions (10 à 40) et la durée (10 à 45 minutes, ou sans limite). Les questions sont tirées au hasard dans les quiz des modules choisis et **l'ordre des réponses est mélangé** (et, dans les modules, `npm run quiz` répartit les bonnes réponses équitablement entre A, B, C et D sans toucher aux textes — à relancer après avoir ajouté des questions ; `npm run quiz -- --voir` montre la répartition sans rien écrire). Le chronomètre rend la copie tout seul à la fin du temps. La correction donne une note sur 20 (au demi-point), le détail question par question avec l'explication et le module d'origine, et l'historique des huit derniers examens reste visible sur la page de réglage.

**Compte à rebours des examens.** Renseigne tes dates dans `content/config.json`, clé `examens` :

```json
"examens": [
  { "titre": "Partiel risques financiers", "date": "2027-01-12", "heure": "9h", "lieu": "Amphi B", "modules": ["risques"] },
  { "titre": "Partiel IFRS", "date": "2027-01-15", "modules": ["valeur", "gouvernance"] }
]
```

Seuls `titre` et `date` (format AAAA-MM-JJ) sont obligatoires ; `modules` reprend les identifiants (`id`) des fichiers de modules et les affiche en boutons cliquables. L'accueil montre les quatre prochains examens avec le nombre de jours restants (en rouge à moins de sept jours) ; les dates passées disparaissent d'elles-mêmes. Reconstruis et publie après modification.

**Fiche de révision imprimable.** Dans un module, le bouton « Fiche de révision imprimable » (en haut à droite) rassemble les encadrés « À retenir » du cours, toutes les formules et toutes les définitions sur une page épurée, puis « Imprimer » (ou « Enregistrer en PDF » dans la boîte d'impression du navigateur).

**Bannière « Nouveautés ».** Pour annoncer une évolution, remplis `nouveautes` dans `content/config.json` (`version`, `titre`, `texte`). La bannière s'affiche sur l'accueil jusqu'à ce que l'élève la ferme ; elle réapparaît quand tu changes `version`. Supprime la clé ou vide `texte` pour ne rien afficher.

**Sauvegarder / transférer sa progression.** En bas du menu, « Exporter ma progression » télécharge un fichier `salle-etude-progression-AAAA-MM-JJ.json` (leçons lues, cartes, boîtes de révision, meilleurs scores, examens blancs). « Importer une sauvegarde » le relit sur un autre appareil et **fusionne** : rien de ce qui a été fait sur l'un ou l'autre n'est perdu. C'est le moyen de changer de téléphone ou de passer du PC au mobile.

## 5. Changer le design

Tout est dans `src/style.css`. Les couleurs, la teinte d'accent et les ombres sont des variables en tête de fichier (`--bg`, `--ink`, `--acc-s`…), en deux jeux : thème clair puis thème sombre. Les polices sont chargées dans `src/template.html` (Google Fonts) : change les familles là, puis les noms dans `style.css`.

Les textes de l'accueil, le titre de l'application et les noms des semestres sont dans `content/config.json`.

### L'ambiance lofi

Le fond « lofi » (ciel de fin de journée, skyline avec fenêtres allumées, étoiles qui scintillent la nuit, léger grain) se règle dans `content/config.json` : `"ambiance": "lofi"` pour l'activer par défaut, `"neutre"` pour le fond uni. Chaque personne peut ensuite l'activer ou le couper avec le bouton « Ambiance lofi » en bas du menu ; son choix est mémorisé sur son appareil.

Le bouton « Thème » du menu force le mode clair ou sombre (ou suit le réglage de Windows en « automatique ») ; c'est en mode sombre que l'ambiance lofi donne la vraie scène de nuit. La valeur par défaut se règle avec `"theme": "auto" | "light" | "dark"` dans `content/config.json`.

Les dessins sont dans `src/assets/` (`skyline-night.svg`, `skyline-day.svg`, `grain.svg`) et les couleurs du ciel dans `src/style.css`, variables `--lofi-…` (un jeu pour le jour, un pour la nuit). Pour une autre image de fond, dépose-la dans `src/assets/` et référence-la dans le CSS avec `url("assets/mon-image.jpg")` : le script l'intègre à la page.

### Le logo

- **Sans image** : la pastille de la barre latérale affiche un sigle, réglable avec `"sigle": "SÉ"` dans `content/config.json`.
- **Avec image** : dépose `content/logo.svg` ou `content/logo.png` (carré, fond transparent de préférence). Au prochain `npm run build`, l'image remplace le sigle dans la barre latérale et devient l'icône de l'onglet du navigateur.
- **Icône de l'application Windows** : avec un `content/logo.png` de 256×256 pixels, lance `npm run icon` puis `npm run package`. L'icône de la fenêtre, de la barre des tâches et du raccourci est mise à jour.

Pour convertir ou redimensionner une image en PNG 256×256, Paint ou n'importe quel outil en ligne suffit.

## 5 bis. L'assistant IA

Un bouton « Assistant » en bas à droite ouvre une discussion avec Claude : questions de cours, exercices corrigés, recherches sur le web avec sources. L'assistant reçoit le contenu du module ouvert, il répond donc dans le vocabulaire du cours.

Pour qu'il fonctionne, il faut un petit service intermédiaire qui garde la clé API : tout est expliqué dans [assistant-worker/README.md](assistant-worker/README.md). Une fois déployé, renseigne son adresse dans `content/config.json` (`assistant.url`), reconstruis, publie. Les élèves saisissent le code d'accès une fois.

L'assistant est **désactivé** pour l'instant (`"enabled": false` dans `content/config.json`, section `assistant`) : le bouton n'apparaît pas. Passe la valeur à `true` pour le réactiver. Sans adresse configurée, le bouton propose alors de saisir l'adresse du service : pratique pour tester avec le faux assistant local (`node tools/mock-assistant.js`, adresse `http://localhost:8787`, code `test`).

## 5 ter. Accès réservé : un code par personne

Le site n'est pas ouvert à tous : à l'entrée, un écran demande un **code d'accès personnel**. Le contenu (cours, annales) est chiffré dans la page ; sans code valide, il est illisible, même en lisant le code source. Les fichiers PDF et images du dossier `docs/annales/` restent en revanche accessibles à qui connaît leur adresse exacte.

Les commandes, depuis le dossier du projet :

```bash
npm run acces -- ajouter "Prénom Nom"
```

affiche le code une seule fois (du type `SE-7K3P-9QWX`) : note-le et transmets-le à la personne. Puis publie :

```bash
npm run build
```

```bash
git add -A
```

```bash
git commit -m "Accès pour Prénom Nom"
```

```bash
git push
```

Autres commandes : `npm run acces -- liste` (qui a un code) et `npm run acces -- retirer "Prénom Nom"` (coupe l'accès à la prochaine publication). Chaque personne saisit son code une fois ; il reste enregistré sur son appareil, et le bouton « Se déconnecter » en bas du menu l'efface.

**Codes à durée limitée.** Tu peux donner une date de fin à un code (la date est incluse) ou un essai de sept jours :

```bash
npm run acces -- ajouter "Prénom Nom" --jusqu-au 2027-01-31
npm run acces -- ajouter "Prénom Nom" --essai
```

Passé la date, la personne voit « Ton code a expiré le … » avec ton adresse pour le prolonger, et sa mention « Accès valable jusqu'au … » apparaît en bas de son menu avant. Pour prolonger ou lever la limite :

```bash
npm run acces -- prolonger "Prénom Nom" --jusqu-au 2027-06-30
npm run acces -- prolonger "Prénom Nom" --illimite
```

`npm run acces -- liste` signale les codes qui expirent bientôt (⏳) ou sont expirés (✘). Deux choses à savoir : la date est vérifiée sur l'appareil du visiteur, mais c'est surtout la **publication** qui compte — à chaque `npm run build`, la clé d'un code expiré n'est plus mise dans la page, donc il ne peut plus rien déchiffrer. Pense à republier de temps en temps (n'importe quelle publication suffit) pour que les expirations prennent effet côté serveur.

Deux précautions :

- **`content/cle-contenu.txt`** est la clé qui chiffre le contenu. Elle n'est jamais publiée sur GitHub. Sauvegarde-la et copie-la sur ton autre PC (même dossier), sinon il faudra recréer tous les codes.
- **Ton propre code** : crée-toi un code comme aux autres, il sert aussi pour l'application Windows.

**Recevoir les demandes.** L'écran d'entrée propose un bouton « Demander un accès ». Par défaut il ouvre un e-mail pré-rempli (nom, prénom, adresse, promotion) vers l'adresse `acces.contact` de `content/config.json`. Tu peux à la place indiquer l'adresse d'un formulaire en ligne (Google Forms, Tally…) dans `acces.formulaire` : le bouton l'ouvrira. Le texte sous le bouton (`acces.info`) sert par exemple à indiquer comment participer aux frais.

Pour rouvrir le site à tout le monde : vide la liste dans `content/acces.json` (`{ "codes": [] }`) et republie.

## 6. Publier pour la classe (GitHub Pages)

Le dossier `docs/` est servi tel quel par GitHub Pages. Une seule personne (toi) a le droit d'écrire dans le dépôt ; les autres ne font que consulter.

Première fois : sur GitHub, dans le dépôt → **Settings → Pages → Build and deployment** : *Source* = « Deploy from a branch », *Branch* = `main`, dossier `/docs`. L'adresse sera `https://<ton-compte>.github.io/salle-etude/`.

À chaque mise à jour :

```bash
npm run build
git add -A
git commit -m "Ajout du module fiscalité"
git push
```

La page en ligne se met à jour en une ou deux minutes. La progression de chaque élève reste sur son propre appareil.

## 6 bis. L'application sur téléphone (et le mode hors ligne)

Depuis la version 1.2, le site publié est une **application installable** : tes camarades peuvent l'ajouter à leur écran d'accueil et l'ouvrir sans connexion (dans le métro, en amphi, en examen blanc).

**Pour l'installer**, il suffit d'ouvrir l'adresse du site :

- **Android / Chrome** : un bandeau « Installer » apparaît au bout de quelques secondes ; sinon menu ⋮ → *Ajouter à l'écran d'accueil*.
- **iPhone / Safari** : bouton Partager → *Sur l'écran d'accueil*. (Apple n'affiche pas de bandeau automatique.)
- **Ordinateur / Chrome ou Edge** : icône d'installation dans la barre d'adresse, ou le bouton « Installer l'application » en bas du menu de gauche.

**Ce qui marche sans connexion** : toute la page (les dix modules, les cartes, les quiz, les exercices, les notes), les annales jointes et les icônes. La progression est de toute façon enregistrée sur l'appareil. Le code d'accès reste demandé, mais il est mémorisé après la première fois : une fois entré, le contenu se déchiffre même hors ligne.

**Les mises à jour sont automatiques.** À chaque `npm run build`, une empreinte de version est écrite dans `docs/sw.js`. Le visiteur qui rouvre l'application voit un bandeau « Une nouvelle version est prête » avec un bouton *Actualiser* ; tant qu'il ne clique pas, il continue sur l'ancienne version sans rien casser. Rien à faire de plus que publier comme d'habitude.

**Deux points à connaître :**

- L'installation exige une adresse en `https` : elle marche sur GitHub Pages, pas en ouvrant `docs/index.html` depuis le disque. L'application Windows (Electron) n'est pas concernée et ignore complètement cette partie.
- Les icônes viennent de `content/pwa/` et sont fabriquées une fois pour toutes à partir de `content/logo.png`. Si tu changes de logo, refais-les à la même taille (192 px, 512 px, une version « maskable » 512 px sur fond plein, et 180 px pour l'iPhone).

## 7. Travailler depuis un autre PC

Sur le second PC : installer Node.js et Git, puis

```bash
git clone https://github.com/<ton-compte>/salle-etude.git
cd salle-etude
npm install
```

Ensuite, avant de commencer une séance de travail : `git pull` ; à la fin : `git add -A`, `git commit -m "…"`, `git push`. Les deux PC restent ainsi synchronisés par GitHub.

## 8. Fabriquer l'application Windows

```bash
npm run package
```

Le dossier `release/Salle d'etude-win32-x64/` contient `Salle d'etude.exe` et tout ce qu'il lui faut (environ 370 Mo). C'est ta version personnelle hors ligne ; pour la classe, le site GitHub Pages est plus pratique.
