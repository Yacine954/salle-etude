---
id: startups
code: S9
priorite: 3
titre: Financement des startups & capital-risque
accroche: Cycle de financement, acteurs du capital-risque, instruments, valorisation en incertitude et lecture d'un term sheet.
couleur: 24
---

# Cours

## Le cycle de financement d'une startup

<p>Une startup se finance par étapes successives, chacune correspondant à un niveau de maturité et à un type d'investisseur :</p>
<dl>
  <dt>Love money</dt><dd>apports des fondateurs, famille et proches — petits montants, quasi sans négociation.</dd>
  <dt>Business angels</dt><dd>particuliers fortunés investissant leur propre argent (50 k€ à 500 k€ typiquement), souvent avec un accompagnement.</dd>
  <dt>Amorçage (seed)</dt><dd>premier tour structuré avec des fonds spécialisés, pour valider le produit et les premiers clients.</dd>
  <dt>Séries A, B, C…</dt><dd>tours successifs de plus en plus gros pour accélérer (produit, commercial, international). Chaque tour est mené par un « lead investor ».</dd>
  <dt>Sortie (exit)</dt><dd>introduction en bourse (IPO) ou cession à un industriel (trade sale) ou à un autre fonds (secondary) : c'est là que les investisseurs réalisent leur plus-value.</dd>
</dl>
<p>À chaque tour, l'entreprise émet de nouvelles actions : les actionnaires existants sont <strong>dilués</strong>. La table de capitalisation (cap table) suit la répartition du capital tour après tour.</p>
<div class="retenir"><span class="label">À retenir</span><p>Post-money = Pre-money + montant levé. La part de l'investisseur = montant levé ÷ post-money. Tout le reste (dilution, cap table) découle de ces deux égalités.</p></div>

## Les acteurs du capital-risque

<p>Un fonds de capital-risque (venture capital, VC) est en général structuré en deux niveaux : les <strong>LP</strong> (limited partners : institutionnels, family offices, assureurs) apportent l'argent ; les <strong>GP</strong> (general partners : l'équipe de gestion) sélectionnent et accompagnent les participations.</p>
<ul>
  <li>Durée de vie du fonds : environ 10 ans (5 ans d'investissement, 5 ans de gestion et sortie).</li>
  <li>Rémunération des GP : frais de gestion (~2 % par an des montants engagés) et « carried interest » (~20 % de la plus-value au-delà d'un rendement minimum, le « hurdle rate »).</li>
  <li>Logique de portefeuille : sur 10 participations, quelques-unes échouent, la plupart rendent à peine la mise, une ou deux font le rendement du fonds (« power law »).</li>
</ul>
<p>Autres acteurs : corporate venture (fonds d'un grand groupe, logique stratégique), Bpifrance (financement public, prêts d'amorçage, co-investissement), accélérateurs et incubateurs (accompagnement contre une petite part du capital).</p>
<div class="retenir"><span class="label">À retenir</span><p>Le VC exige un rendement élevé (TRI cible 25-35 %) parce qu'il finance des actifs illiquides, risqués, et que quelques réussites doivent compenser de nombreux échecs.</p></div>

## Les instruments et les clauses du pacte

<p>Les investisseurs n'achètent presque jamais des actions ordinaires « nues ». Ils négocient des <strong>actions de préférence</strong> assorties de droits spécifiques, et parfois des instruments intermédiaires :</p>
<dl>
  <dt>BSA-AIR</dt><dd>bon de souscription « accord d'investissement rapide » : l'investisseur apporte les fonds maintenant, la valorisation sera fixée au tour suivant avec une décote et souvent un plafond (cap).</dd>
  <dt>Obligation convertible</dt><dd>dette qui se convertit en actions au tour suivant, à des conditions négociées (décote, cap).</dd>
</dl>
<p>Clauses fréquentes du pacte d'actionnaires :</p>
<ul>
  <li><strong>Préférence de liquidation</strong> : en cas de sortie, l'investisseur récupère d'abord sa mise (1x, parfois plus), avant le partage avec les autres.</li>
  <li><strong>Anti-dilution</strong> : si un tour suivant se fait à une valorisation plus basse (down round), l'investisseur reçoit des actions supplémentaires (« full ratchet » — le plus dur — ou « weighted average »).</li>
  <li><strong>Drag-along / tag-along</strong> : obligation de suivre une cession majoritaire / droit de vendre aux mêmes conditions.</li>
  <li><strong>Vesting</strong> des fondateurs : leurs actions se « libèrent » progressivement (souvent 4 ans, avec un « cliff » d'un an) ; en cas de départ, clauses de good/bad leaver.</li>
</ul>
<div class="retenir"><span class="label">À retenir</span><p>La valorisation affichée d'un tour ne dit pas tout : la préférence de liquidation et l'anti-dilution changent radicalement ce que les fondateurs touchent réellement à la sortie.</p></div>

## Valoriser une startup et suivre ses métriques

<p>Sans historique de résultats, le DCF est peu fiable. On utilise des méthodes qui partent de la sortie espérée ou de comparables :</p>
<dl>
  <dt>VC method</dt><dd>on estime la valeur de sortie dans n années, on l'actualise au TRI exigé (ou on la divise par le multiple visé) : cela donne la valorisation post-money acceptable aujourd'hui.</dd>
  <dt>Multiples</dt><dd>valorisation = multiple × ARR (revenu annuel récurrent) pour les SaaS, ou × GMV, × utilisateurs selon le secteur.</dd>
  <dt>Berkus / Scorecard</dt><dd>méthodes qualitatives pour l'amorçage : on attribue une valeur à chaque facteur (équipe, produit, marché, traction).</dd>
</dl>
<p>Métriques suivies par les investisseurs :</p>
<ul>
  <li><strong>Burn rate</strong> : trésorerie consommée par mois ; <strong>runway</strong> : nombre de mois avant la panne sèche.</li>
  <li><strong>CAC</strong> (coût d'acquisition client) et <strong>LTV</strong> (valeur vie client) : on vise LTV/CAC &gt; 3.</li>
  <li><strong>Churn</strong> : taux de perte de clients ; <strong>MRR/ARR</strong> : revenu récurrent mensuel/annuel.</li>
</ul>
<div class="retenir"><span class="label">À retenir</span><p>Runway = trésorerie ÷ burn rate mensuel. Une startup lève en général 12 à 18 mois de runway, et commence le tour suivant 6 mois avant la fin.</p></div>

## Application : lire un term sheet de série A

<p>Exemple : une startup a 1 000 000 d'actions détenues par les fondateurs. Un fonds propose 2 M€ sur une valorisation pre-money de 6 M€.</p>
<ul>
  <li>Post-money = 6 + 2 = 8 M€. Part du fonds = 2 ÷ 8 = 25 %.</li>
  <li>Prix par action = 6 M€ ÷ 1 000 000 = 6 €. Actions émises = 2 M€ ÷ 6 € ≈ 333 333.</li>
  <li>Les fondateurs passent de 100 % à 1 000 000 ÷ 1 333 333 = 75 %.</li>
  <li>Si le term sheet prévoit un pool d'options (BSPCE) de 10 % post-money créé <em>avant</em> l'entrée du fonds, la dilution est supportée par les fondateurs seuls : ils tombent à 65 %.</li>
</ul>
<p>Points à vérifier dans un term sheet : valorisation pre/post et traitement du pool d'options, préférence de liquidation (1x non participante est le standard « équilibré »), anti-dilution (weighted average plutôt que full ratchet), gouvernance (siège au board, droits de veto), clauses de sortie.</p>
<div class="retenir"><span class="label">À retenir</span><p>Sais refaire ce calcul en 4 lignes (post-money, %, prix par action, actions émises) — c'est l'exercice type de ce module.</p></div>

# Définitions

## Pre-money
Valorisation de l'entreprise juste avant l'entrée des nouveaux investisseurs.

## Post-money
Valorisation juste après le tour : pre-money + montant levé. Sert de base au calcul de la part des investisseurs.

## Dilution
Baisse du pourcentage de capital détenu par les actionnaires existants lorsque de nouvelles actions sont émises.

## Cap table
Table de capitalisation : tableau qui liste tous les actionnaires, leurs titres et leurs pourcentages, tour après tour.

## Term sheet
Lettre d'intention non engageante qui résume les conditions financières et juridiques proposées par l'investisseur avant la documentation définitive.

## BSA-AIR
Bon de souscription d'actions « accord d'investissement rapide » : financement immédiat dont la valorisation est fixée au tour suivant, avec décote et plafond.

## Préférence de liquidation
Droit de l'investisseur à récupérer sa mise (1x ou plus) en priorité lors d'une sortie, avant tout partage avec les actionnaires ordinaires.

## Anti-dilution (ratchet)
Clause qui protège l'investisseur si un tour suivant se fait à valorisation inférieure, en lui attribuant des actions supplémentaires (full ratchet ou weighted average).

## Vesting
Acquisition progressive des actions des fondateurs ou salariés dans le temps (souvent 4 ans avec un cliff d'un an), pour garantir leur engagement.

## Burn rate / runway
Trésorerie nette consommée par mois / nombre de mois de trésorerie restants au rythme actuel.

## Carried interest
Part de la plus-value (généralement 20 %) reversée à l'équipe de gestion d'un fonds au-delà d'un rendement minimum.

## Exit
Sortie des investisseurs : introduction en bourse, cession à un industriel ou à un autre fonds.

# Formules

## Post-money
```
Post-money = Pre-money + Montant levé
```
> Base de tout calcul de tour.

## Part de l'investisseur
```
% investisseur = Montant levé ÷ Post-money
```
> Ex. 2 M€ sur 8 M€ post = 25 %.

## Dilution des anciens actionnaires
```
Nouvelle part = Ancienne part × (Pre-money ÷ Post-money)
```
> Ex. 100 % × 6/8 = 75 %.

## Prix par action et actions émises
```
Prix = Pre-money ÷ Nombre d'actions existantes ; Actions émises = Montant levé ÷ Prix
```
> Vérifie que ancien + nouveau = 100 %.

## VC method
```
Post-money = Valeur de sortie ÷ (1 + TRI exigé)^n  (ou Valeur de sortie ÷ multiple visé)
```
> Pre-money = Post-money − montant investi.

## Runway
```
Runway (mois) = Trésorerie disponible ÷ Burn rate mensuel net
```
> Lever 12-18 mois de runway.

## LTV et ratio LTV/CAC
```
LTV = ARPU × marge brute ÷ taux de churn ; cible LTV/CAC > 3
```
> ARPU = revenu moyen par client par période.

# Quiz

## Une startup lève 1 M€ sur une valorisation pre-money de 4 M€. Quelle part du capital obtient l'investisseur ?
- 25 %
- [x] 20 %
- 33 %
- 80 %
> Post-money = 4 + 1 = 5 M€ ; part = 1 ÷ 5 = 20 %.

## Qu'est-ce qu'un BSA-AIR ?
- Une action de préférence avec dividende garanti
- [x] Un instrument qui finance immédiatement en reportant la valorisation au tour suivant
- Un prêt bancaire garanti par Bpifrance
- Une option d'achat sur les actions des fondateurs
> Le BSA-AIR reporte la fixation de la valorisation au tour suivant, avec décote et plafond négociés.

## La préférence de liquidation 1x signifie que l'investisseur :
- Reçoit le double de sa mise en cas de sortie
- [x] Récupère sa mise en priorité avant tout partage
- Est remboursé uniquement en cas de faillite
- Renonce à tout dividende
> En cas de sortie, l'investisseur touche d'abord 1x son investissement, puis le solde est partagé selon les règles du pacte.

## Le « carried interest » d'un fonds de VC correspond à :
- Les frais de gestion annuels
- [x] La part de plus-value reversée à l'équipe de gestion
- Les intérêts payés aux LP
- Le taux d'actualisation utilisé
> Le carried (souvent 20 %) rémunère les GP sur la performance, au-delà du hurdle rate.

## Une startup a 300 k€ en banque et un burn rate net de 50 k€/mois. Son runway est de :
- 3 mois
- [x] 6 mois
- 12 mois
- 15 mois
> 300 ÷ 50 = 6 mois. Il est temps de préparer le tour suivant.

## Le vesting avec « cliff » d'un an signifie que :
- Les actions sont vendues au bout d'un an
- [x] Aucune action n'est acquise avant 12 mois, puis acquisition progressive
- Le fondateur reçoit toutes ses actions à la signature
- Les actions sont bloquées 4 ans sans exception
> Le cliff empêche un départ précoce de repartir avec des actions ; après 12 mois, le vesting devient progressif.

## La méthode « VC method » consiste à :
- Actualiser les dividendes futurs
- [x] Partir de la valeur de sortie espérée et la ramener à aujourd'hui au TRI exigé
- Additionner les actifs de la startup
- Appliquer un PER sectoriel au bénéfice actuel
> Faute de résultats, on raisonne à partir de la sortie : valeur de sortie ÷ (1+TRI)^n = post-money acceptable.

## Un ratio LTV/CAC de 1,2 indique que :
- L'acquisition client est très rentable
- [x] Chaque client rapporte à peine plus qu'il ne coûte à acquérir — modèle fragile
- Le churn est nul
- La startup n'a pas de clients
> On vise LTV/CAC > 3 ; à 1,2, la marge dégagée par client couvre à peine son coût d'acquisition.

# Exercices

## Calcul de dilution
Les fondateurs détiennent 2 000 000 d'actions (100 %). Un fonds investit 3 M€ sur une pre-money de 9 M€. Calcule le post-money, la part du fonds, le prix par action, le nombre d'actions émises et la part finale des fondateurs.

> **Solution** : Post-money = 12 M€. Part du fonds = 3 ÷ 12 = 25 %. Prix par action = 9 M€ ÷ 2 000 000 = 4,50 €. Actions émises = 3 M€ ÷ 4,50 = 666 667. Fondateurs = 2 000 000 ÷ 2 666 667 = 75 %.

## VC method
Un fonds vise une sortie à 60 M€ dans 5 ans et exige un TRI de 40 %. Il souhaite investir 4 M€. Quelle valorisation post-money maximale peut-il accepter, et quelle pre-money cela implique-t-il ?

> **Solution** : (1,40)^5 ≈ 5,38. Post-money max = 60 ÷ 5,38 ≈ 11,2 M€. Pre-money = 11,2 − 4 ≈ 7,2 M€. Part du fonds = 4 ÷ 11,2 ≈ 36 %.

## Runway et prochain tour
Trésorerie : 900 k€. Charges mensuelles : 120 k€, revenus mensuels : 40 k€. Combien de mois de runway ? Si un tour prend 6 mois à boucler, quand faut-il le lancer ?

> **Solution** : Burn net = 120 − 40 = 80 k€/mois. Runway = 900 ÷ 80 ≈ 11 mois. Il faut lancer la levée dès maintenant ou au plus tard dans 5 mois (11 − 6).

# Notes

