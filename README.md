# La Salle d'Étude

Application de révision du M2 Finance d'entreprise : cours, définitions et formules en mode cartes, quiz corrigés, exercices et notes personnelles, module par module.

Tout le projet tient dans ce dossier. Le contenu est écrit en fichiers texte (Markdown), le design dans un fichier de style, et un script assemble le tout en **une seule page HTML** (`docs/index.html`) qui fonctionne partout : navigateur, site GitHub Pages, artefact Claude et application Windows.

```
salle-etude/
├── content/
│   ├── config.json          titre, sous-titre, texte d'accueil, noms des semestres
│   └── modules/             un fichier .md par module (l'ordre des fichiers = l'ordre des modules)
├── src/
│   ├── style.css            tout le design (les couleurs et polices sont en haut du fichier)
│   ├── app.js               la logique (navigation, cartes, quiz, progression)
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

## 2. Les commandes du quotidien

| Commande | Effet |
| --- | --- |
| `npm run build` | reconstruit `docs/index.html` à partir de `content/` et `src/` |
| `npm run watch` | idem, en continu : chaque enregistrement reconstruit la page |
| `npm start` | construit puis ouvre l'application Windows (fenêtre autonome) |
| `npm run package` | fabrique l'exécutable distribuable dans `release/` |

Pour voir le résultat pendant que tu travailles : lance `npm run watch`, ouvre `docs/index.html` dans ton navigateur et recharge la page après chaque modification.

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

## 5. Changer le design

Tout est dans `src/style.css`. Les couleurs, la teinte d'accent et les ombres sont des variables en tête de fichier (`--bg`, `--ink`, `--acc-s`…), en deux jeux : thème clair puis thème sombre. Les polices sont chargées dans `src/template.html` (Google Fonts) : change les familles là, puis les noms dans `style.css`.

Les textes de l'accueil, le titre de l'application et les noms des semestres sont dans `content/config.json`.

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
