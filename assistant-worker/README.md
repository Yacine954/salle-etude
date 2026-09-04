# Assistant IA — le relais (Cloudflare Worker)

La page de la Salle d'étude est publique : on ne peut pas y mettre une clé API, sinon n'importe qui la volerait et ferait payer la facture. Ce petit service, hébergé gratuitement chez Cloudflare, garde la clé pour lui, vérifie un **code d'accès** donné aux élèves, limite l'usage, et transmet les questions à Claude avec la recherche web activée.

```
élève ──(question + code)──▶ worker Cloudflare ──(clé API)──▶ API Claude (+ recherche web)
      ◀────── réponse en direct ──────┘
```

## Mise en place (une seule fois, environ 15 minutes)

1. **Une clé API Anthropic.** Sur https://console.anthropic.com : crée un compte, ajoute un moyen de paiement (ou des crédits prépayés), puis *API Keys → Create Key*. Garde la clé (`sk-ant-…`) sous la main. Dans *Settings → Limits*, fixe un plafond mensuel de dépense pour ne jamais avoir de surprise.
2. **Un compte Cloudflare** (gratuit) sur https://dash.cloudflare.com.
3. Dans un terminal, depuis ce dossier :

```bash
npm install
```

```bash
npx wrangler login
```

(une page web s'ouvre pour autoriser l'outil)

```bash
npm run secret:key
```

(colle la clé API quand elle est demandée)

```bash
npm run secret:code
```

(tape le code d'accès que tu donneras aux élèves, par exemple `m2finance2026`)

```bash
npm run deploy
```

La commande affiche l'adresse du service, du type `https://salle-etude-assistant.<ton-compte>.workers.dev`.

4. Dans `content/config.json` du projet, renseigne cette adresse :

```json
"assistant": { "url": "https://salle-etude-assistant.<ton-compte>.workers.dev" }
```

puis `npm run build`, `git add -A`, `git commit`, `git push`. Le bouton « Assistant » apparaît dans l'application ; à la première question, chaque élève saisit le code d'accès une fois.

## Vérifier que ça marche

```bash
curl https://salle-etude-assistant.<ton-compte>.workers.dev/health
```

doit répondre `{"ok":true,...}`. Pour voir les requêtes en direct : `npm run tail`.

## Régler le coût

Dans `wrangler.toml` (puis `npm run deploy`) :

- `MODEL` : `claude-opus-5` (le plus capable, environ 5 $ par million de mots lus et 25 $ par million écrits), `claude-sonnet-5` (2 $ / 10 $, très bon pour des questions de cours), `claude-haiku-4-5` (1 $ / 5 $, le plus économique).
- `EFFORT` : `low` pour des réponses plus rapides et moins chères, `high` pour les exercices difficiles.
- `MAX_SEARCHES` : nombre de recherches web par réponse (chaque recherche coûte environ 1 centime en plus).
- `DAILY_LIMIT` : messages par jour et par appareil, actif si un espace KV `QUOTA` est configuré (voir le fichier).

Ordre de grandeur : une question de cours avec le contexte du module coûte quelques centimes avec Opus, moins d'un centime avec Haiku. Le plafond de dépense côté Anthropic reste la vraie sécurité.

## Changer le comportement de l'assistant

Le texte qui définit son rôle (le « prompt système ») est au début de `src/index.js`, constante `SYSTEM_PROMPT`. Modifie-le librement, puis `npm run deploy`.

## Révoquer l'accès

Change le code (`npm run secret:code`) : les anciens codes cessent de fonctionner immédiatement. En cas de doute sur la clé API, supprime-la dans la console Anthropic et recrée-en une.
