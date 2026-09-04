---
id: risques
code: S9
priorite: 1
titre: Contrôle et gestion des risques financiers
accroche: Typologie des risques, exposition de taux et de change, dérivés de couverture, VaR, contrôle interne — et le risque de crédit client vu du terrain.
couleur: 355
---

# Cours

## Les quatre familles de risques financiers

<p>Quand on parle de risques financiers dans une entreprise, on distingue quatre grandes familles. Chacune répond à une question différente : qui peut ne pas me payer, quel prix peut bouger contre moi, aurai-je le cash au bon moment, et qu'est-ce qui peut défaillir dans mon organisation ?</p>
<dl>
  <dt>Risque de crédit</dt><dd>c'est la probabilité qu'une contrepartie (client, emprunteur, banque) ne paie pas ce qu'elle doit.</dd>
  <dt>Risque de marché</dt><dd>c'est la variation défavorable d'un prix : taux d'intérêt, taux de change, cours des actions, matières premières.</dd>
  <dt>Risque de liquidité</dt><dd>c'est l'incapacité à mobiliser du cash à temps pour honorer un engagement — même si, sur le papier, l'entreprise est solvable.</dd>
  <dt>Risque opérationnel</dt><dd>ce sont les pertes liées à des processus, des systèmes ou des personnes défaillants : erreur de saisie, fraude, panne informatique, cyberattaque.</dd>
</dl>
<p>Arrêtons-nous sur le risque de crédit, parce qu'il se quantifie précisément. Il se décompose en trois paramètres, et c'est leur produit qui donne la perte attendue :</p>
<div class="formula">Perte attendue (ECL) = PD × EAD × LGD
PD = probabilité de défaut · EAD = exposition au moment du défaut · LGD = perte en cas de défaut (1 − taux de récupération)</div>
<div class="retenir"><span class="label">À retenir</span><p>Cette formule est la base de la dépréciation des créances sous IFRS 9 : tu la retrouveras dans la dernière leçon de ce module et dans le module Entreprise et valeur.</p></div>

## Mesurer l'exposition : taux et change

<p>Avant de couvrir un risque, il faut d'abord le mesurer : on ne peut pas se protéger contre une exposition qu'on ne connaît pas. En entreprise, deux expositions reviennent systématiquement.</p>
<p><strong>Risque de change.</strong> Prenons une entreprise qui facture en dollars et paie ses charges en euros : elle est exposée à la baisse du dollar. On distingue trois formes d'exposition : l'exposition de transaction (les flux déjà engagés), l'exposition de consolidation (les filiales étrangères) et l'exposition économique (la compétitivité). Pour mesurer tout cela, on calcule la position de change nette = créances en devise − dettes en devise, et ce par devise et par échéance.</p>
<p><strong>Risque de taux.</strong> Ici, tout dépend de ce qu'on détient. Une dette à taux variable expose à la hausse des taux ; un placement à taux fixe expose lui aussi à la hausse des taux, mais sous la forme d'une perte de valeur. Pour une obligation, cette sensibilité se mesure par la <strong>duration</strong> : plus elle est longue, plus le prix réagit aux variations de taux.</p>
<div class="formula">Variation de prix d'une obligation ≈ − Duration modifiée × Δ taux × Prix
Duration modifiée = Duration ÷ (1 + taux)</div>
<div class="retenir"><span class="label">À retenir</span><p>On ne couvre que ce qu'on a mesuré : la position nette par devise et par échéance, et le gap de taux entre actifs et passifs.</p></div>

## Se couvrir : les instruments dérivés

<p>Une fois l'exposition mesurée, comment s'en protéger ? Quatre familles d'instruments dérivés permettent de couvrir un risque de marché :</p>
<dl>
  <dt>Forward</dt><dd>un contrat de gré à gré qui fixe aujourd'hui un prix pour une transaction future. C'est un engagement ferme des deux parties. Ex. : vente à terme de 1 M$ à 0,92 € dans 3 mois.</dd>
  <dt>Future</dt><dd>l'équivalent standardisé et coté du forward. Il s'accompagne d'appels de marge quotidiens et d'une chambre de compensation, ce qui élimine le risque de contrepartie.</dd>
  <dt>Option</dt><dd>un droit, et non une obligation, d'acheter (call) ou de vendre (put) à un prix fixé (le strike), moyennant une prime payée d'avance. L'intérêt pour l'acheteur : sa perte est limitée à la prime, et il garde tout le potentiel favorable.</dd>
  <dt>Swap</dt><dd>un échange de flux futurs. Le swap de taux échange un taux fixe contre un taux variable sur un même notionnel, sans jamais échanger le capital ; le swap de devises, lui, échange des flux dans deux devises.</dd>
</dl>
<p>Un mot sur le traitement comptable : IFRS 9 permet la « comptabilité de couverture » à condition que la relation de couverture soit documentée et efficace. L'avantage, c'est d'éviter la volatilité du résultat.</p>
<div class="retenir"><span class="label">À retenir</span><p>Forward et future = engagement ferme (on renonce au gain potentiel) ; option = droit (perte limitée à la prime, on garde le gain potentiel — mais ça coûte).</p></div>

## Mesurer le risque : VaR et stress tests

<p>La Value at Risk (VaR) répond à une question simple : quelle est la perte maximale probable sur un horizon donné, avec un niveau de confiance donné (95 % ou 99 %) ? Pour la calculer, trois approches existent :</p>
<ul>
  <li><strong>Paramétrique</strong> : on suppose que les rendements suivent une loi normale, et alors VaR = valeur × z × σ.</li>
  <li><strong>Historique</strong> : on rejoue les variations passées et on prend le quantile correspondant.</li>
  <li><strong>Monte-Carlo</strong> : on simule des milliers de scénarios.</li>
</ul>
<div class="formula">VaR paramétrique = Valeur du portefeuille × z × σ
z = 1,645 (95 %) · 2,326 (99 %) · VaR sur T jours ≈ VaR 1 jour × √T</div>
<p>La VaR a toutefois ses limites. D'abord, l'hypothèse de normalité sous-estime les événements extrêmes (les fameuses « queues épaisses »). Ensuite, la VaR ne dit rien de l'ampleur de la perte au-delà du seuil — d'où l'« expected shortfall », qui mesure la moyenne des pertes au-delà de la VaR. C'est pourquoi les <strong>stress tests</strong> viennent la compléter : ils simulent des chocs concrets, comme la crise de 2008, une hausse de taux de 300 pb ou le défaut du premier client.</p>
<div class="retenir"><span class="label">À retenir</span><p>VaR 99 % > VaR 95 % ; la VaR croît avec la racine du temps ; les stress tests répondent à « et si ça dérape vraiment ? ».</p></div>

## Le contrôle interne : cadre COSO et trois lignes

<p>Gérer les risques, c'est aussi organiser l'entreprise pour qu'ils soient détectés et maîtrisés au quotidien : c'est le rôle du contrôle interne. Le référentiel COSO le structure autour de cinq composantes :</p>
<ul>
  <li>l'environnement de contrôle, c'est-à-dire la culture, les valeurs, l'organisation et l'exemplarité de la direction ;</li>
  <li>l'évaluation des risques, à travers une cartographie qui croise probabilité × impact ;</li>
  <li>les activités de contrôle : procédures, autorisations, séparation des tâches, rapprochements ;</li>
  <li>l'information et la communication ;</li>
  <li>le pilotage, autrement dit la supervision continue du dispositif dans le temps.</li>
</ul>
<p>Parmi toutes ces activités de contrôle, le principe le plus testé en pratique est la <strong>séparation des tâches</strong>. L'idée est simple : la personne qui engage une opération ne doit pas être celle qui la valide, ni celle qui l'exécute ou l'enregistre.</p>
<p>Reste à savoir qui est responsable de quoi. C'est l'objet du modèle des « trois lignes de maîtrise » : la première ligne (les opérationnels) gère le risque au quotidien ; la deuxième (risques, conformité, contrôle de gestion) définit le cadre et contrôle ; la troisième (l'audit interne) évalue l'ensemble de façon indépendante et rapporte au comité d'audit.</p>
<div class="retenir"><span class="label">À retenir</span><p>Cinq composantes COSO, trois lignes de maîtrise, et un exemple concret de séparation des tâches (circuit achats ou circuit des encaissements) : c'est le trio à connaître par cœur.</p></div>

## Application : le risque de crédit client, du terrain à la norme

<p>Revenons au risque de crédit, cette fois du point de vue de la norme. IFRS 9 impose un modèle de dépréciation en « pertes attendues » à trois stades : au stade 1 (risque normal), la provision correspond aux pertes attendues à 12 mois ; au stade 2 (dégradation significative), elle passe aux pertes attendues à maturité ; le stade 3 est celui du défaut avéré. Pour les créances commerciales, la norme prévoit une approche simplifiée, qui utilise directement une <strong>matrice de provisionnement</strong> par tranche d'ancienneté.</p>
<p>Concrètement, une balance âgée est exactement cette matrice en devenir : chaque tranche (0-30, 31-60, 61-90, +90 jours) porte un taux de perte historique, et ce taux est croissant avec l'ancienneté. La provision s'obtient alors simplement : Provision = Σ (encours de la tranche × taux de perte de la tranche).</p>
<p>Le contrôle du risque client, lui, se joue en amont, avant que la créance ne se dégrade. Il repose sur une limite de crédit par client, un scoring (historique, notation Banque de France, comportement de paiement), des conditions générales adaptées (acomptes, pénalités de retard), une assurance-crédit, et une priorisation des relances là où la perte attendue (montant × probabilité de non-paiement) est la plus forte — c'est exactement la logique d'un TOP 15.</p>
<div class="formula">Provision IFRS 9 (approche simplifiée) = Σ (Encours par tranche d'ancienneté × Taux de perte attendu de la tranche)</div>
<div class="retenir"><span class="label">À retenir</span><p>Balance âgée → matrice de provisionnement → perte attendue : sais dérouler ce lien en une phrase, c'est l'angle qui rentabilise le plus ce module par rapport à ton poste.</p></div>

# Définitions

## PD / EAD / LGD
Probabilité de défaut, exposition au moment du défaut, perte en cas de défaut : les trois composantes de la perte attendue (ECL = PD × EAD × LGD).

## Risque de contrepartie
Risque que l'autre partie d'un contrat (dérivé, dépôt, créance) ne tienne pas son engagement.

## Position de change
Différence entre avoirs et engagements dans une devise, par échéance ; base de toute couverture de change.

## Duration
Durée moyenne pondérée des flux d'une obligation ; mesure sa sensibilité aux variations de taux.

## Forward
Contrat de gré à gré fixant aujourd'hui le prix d'une opération future ; engagement ferme des deux parties.

## Future
Contrat à terme standardisé, coté, avec appels de marge et chambre de compensation.

## Option (call / put)
Droit d'acheter (call) ou de vendre (put) à un prix fixé (strike) jusqu'à une échéance, contre paiement d'une prime.

## Swap de taux
Échange de flux d'intérêts fixes contre variables sur un notionnel identique, sans échange du capital.

## Notionnel
Montant de référence sur lequel sont calculés les flux d'un dérivé ; il n'est pas échangé.

## VaR
Value at Risk : perte maximale probable sur un horizon et à un niveau de confiance donnés.

## Expected shortfall
Perte moyenne dans les cas où la VaR est dépassée ; corrige la principale limite de la VaR.

## Stress test
Simulation d'un scénario extrême (historique ou hypothétique) pour mesurer l'impact sur l'entreprise.

## COSO
Référentiel de contrôle interne en cinq composantes : environnement, évaluation des risques, activités de contrôle, information/communication, pilotage.

## Séparation des tâches
Principe selon lequel engager, valider, exécuter et enregistrer une opération doivent relever de personnes différentes.

## Trois lignes de maîtrise
Opérationnels (1), fonctions risques/conformité (2), audit interne (3) : répartition des responsabilités de contrôle.

## Matrice de provisionnement
Tableau IFRS 9 (approche simplifiée) donnant un taux de perte attendu par tranche d'ancienneté des créances.

# Formules

## Perte attendue (ECL)
```
ECL = PD × EAD × LGD
```
> LGD = 1 − taux de récupération.

## VaR paramétrique
```
VaR = Valeur × z × σ
```
> z = 1,282 (90 %) · 1,645 (95 %) · 2,326 (99 %).

## VaR sur un horizon T
```
VaR(T jours) ≈ VaR(1 jour) × √T
```
> Hypothèse de rendements indépendants.

## Sensibilité d'une obligation
```
ΔPrix ≈ − Duration modifiée × Δtaux × Prix
```
> Duration modifiée = Duration ÷ (1 + taux).

## Résultat d'un call à l'échéance
```
Gain acheteur = max(S − K ; 0) − prime
```
> S = cours à l'échéance, K = strike.

## Résultat d'un put à l'échéance
```
Gain acheteur = max(K − S ; 0) − prime
```
> Couvre une baisse de S.

## Flux net d'un swap de taux
```
Flux net = Notionnel × (taux fixe − taux variable) × (jours ÷ 360)
```
> Payé par la partie dont le taux est le plus élevé.

## Provision par matrice d'ancienneté
```
Provision = Σ (encours tranche × taux de perte tranche)
```
> IFRS 9 approche simplifiée, créances commerciales.

## Score de risque (cartographie)
```
Criticité = Probabilité × Impact
```
> Échelles 1 à 4 ou 1 à 5.

# Quiz

## Que mesure la « perte en cas de défaut » (LGD) ?
- La probabilité que le client fasse défaut
- [x] La part de l'exposition qui ne sera pas récupérée si le défaut survient
- Le montant total de la créance
- Le délai moyen de paiement
> LGD = 1 − taux de récupération. Elle est distincte de la PD (probabilité) et de l'EAD (exposition).

## Une entreprise européenne qui encaissera 1 M$ dans 3 mois veut se couvrir sans renoncer à un éventuel gain si le dollar monte. Elle utilise :
- Une vente à terme (forward)
- [x] Un put sur dollar
- Un swap de taux
- Un future sur taux
> Le put protège contre la baisse du dollar tout en gardant le potentiel de hausse ; le forward fige le cours.

## Un swap de taux classique échange :
- Deux devises différentes
- [x] Un taux fixe contre un taux variable sur un même notionnel
- Des actions contre des obligations
- Une créance contre une dette
> Les flux d'intérêts sont échangés, jamais le notionnel.

## La VaR à 1 jour est de 10 000 €. La VaR à 16 jours vaut environ :
- 160 000 €
- [x] 40 000 €
- 10 000 €
- 2 500 €
> VaR(T) ≈ VaR(1) × √T = 10 000 × 4 = 40 000 €.

## Quelle est la principale limite de la VaR paramétrique ?
- Elle est trop complexe à calculer
- [x] Elle suppose des rendements normaux et sous-estime les événements extrêmes
- Elle ne s'applique qu'aux actions
- Elle nécessite un ordinateur puissant
> D'où les stress tests et l'expected shortfall.

## Parmi les composantes COSO, laquelle correspond à la supervision continue du dispositif ?
- L'environnement de contrôle
- [x] Le pilotage
- L'évaluation des risques
- L'information et la communication
> Le pilotage (monitoring) vérifie dans la durée que les contrôles fonctionnent.

## Dans le modèle des trois lignes de maîtrise, l'audit interne est :
- La première ligne
- La deuxième ligne
- [x] La troisième ligne
- Hors du modèle
> Il évalue de façon indépendante les deux premières lignes et rapporte au comité d'audit.

## Sous IFRS 9, l'approche simplifiée pour les créances commerciales utilise :
- Une provision forfaitaire de 5 %
- [x] Une matrice de taux de perte par tranche d'ancienneté
- Aucune provision avant le défaut avéré
- La valeur de marché des créances
> Chaque tranche de la balance âgée reçoit un taux de perte attendu ; provision = Σ encours × taux.

# Exercices

## VaR paramétrique
Un portefeuille vaut 500 000 €. L'écart-type mensuel des variations est de 4 %. Calcule la VaR mensuelle à 95 % (z = 1,645) et à 99 % (z = 2,326).

> **Solution** : VaR 95 % = 500 000 × 1,645 × 0,04 = 32 900 €. VaR 99 % = 500 000 × 2,326 × 0,04 = 46 520 €. Interprétation : dans 95 % (resp. 99 %) des mois, la perte ne dépasse pas ce montant.

## Matrice de provisionnement IFRS 9
Balance âgée : non échu 400 k€ (taux de perte 0,5 %), 1-30 j 120 k€ (2 %), 31-90 j 60 k€ (8 %), +90 j 30 k€ (40 %). Calcule la provision totale.

> **Solution** : 400 × 0,5 % = 2 ; 120 × 2 % = 2,4 ; 60 × 8 % = 4,8 ; 30 × 40 % = 12. Provision = 21,2 k€, soit 3,5 % de l'encours total de 610 k€.

## Couverture de change à terme
Un exportateur recevra 2 M$ dans 6 mois. Cours comptant : 1 € = 1,10 $. Cours à terme 6 mois : 1 € = 1,12 $. Combien d'euros sécurise-t-il en vendant à terme ? Que se passe-t-il si dans 6 mois le cours est de 1,05 $ ?

> **Solution** : À terme : 2 000 000 ÷ 1,12 = 1 785 714 €. Sans couverture à 1,05 $ : 2 000 000 ÷ 1,05 = 1 904 762 € — la couverture aurait « coûté » 119 048 € de manque à gagner, mais elle aurait protégé si le dollar avait baissé (ex. 1,20 $ → 1 666 667 €). Le forward fige, il ne parie pas.

## Faiblesse de contrôle interne
Dans une PME, le même collaborateur enregistre les règlements clients, lettre les comptes et prépare les avoirs. Quel risque et quelle correction ?

> **Solution** : Cumul des fonctions d'enregistrement, de rapprochement et d'ajustement : un détournement d'encaissement pourrait être masqué par un avoir (schéma « lapping »). Correction : séparer l'émission des avoirs (validation par un responsable avec seuil), rapprochement bancaire par une autre personne, revue mensuelle des avoirs par la direction.

# Notes

