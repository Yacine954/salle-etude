---
id: tresorerie
code: S10
priorite: 1
titre: Trésorerie et gestion des flux sous ERP
accroche: Prévoir, financer, placer, sécuriser et piloter la trésorerie — avec le lien direct entre relance client et cash du groupe.
couleur: 186
---

# Cours

## Budget de trésorerie et plan glissant

<p>Le <strong>budget de trésorerie</strong> prévoit, mois par mois sur l'année, les encaissements (ventes TTC selon les délais clients, subventions, cessions, emprunts) et les décaissements (achats TTC selon les délais fournisseurs, salaires, charges sociales, TVA, impôts, investissements, remboursements). Il se construit à partir des budgets d'exploitation, d'investissement et de financement, en tenant compte des <strong>décalages</strong> : une vente de janvier à 60 jours est encaissée en mars.</p>
<p>Le <strong>plan de trésorerie glissant</strong> (rolling forecast, souvent 13 semaines) est révisé chaque semaine ou chaque mois : il absorbe l'incertitude réelle des encaissements et permet d'anticiper les tensions.</p>
<div class="formula">Solde fin de période = Solde début + Encaissements − Décaissements
TVA à décaisser (mois M) = TVA collectée (M−1) − TVA déductible (M−1)</div>
<div class="retenir"><span class="label">À retenir</span><p>Le budget raisonne en TTC et en date d'encaissement, pas en HT et en date de facture. C'est le piège classique.</p></div>

## Le besoin en fonds de roulement et le cycle cash-to-cash

<p>Le BFR d'exploitation est le cash immobilisé par le cycle d'activité :</p>
<div class="formula">BFR = Stocks + Créances clients − Dettes fournisseurs (et autres dettes d'exploitation)
BFR en jours de CA = BFR ÷ CA HT × 360</div>
<p>Le <strong>cycle cash-to-cash</strong> (ou cash conversion cycle) mesure en jours le temps entre le paiement des fournisseurs et l'encaissement des clients :</p>
<div class="formula">CCC = DIO (stocks) + DSO (clients) − DPO (fournisseurs)</div>
<p>Leviers d'optimisation : réduire le DSO (conditions de paiement, facturation rapide, relance structurée, acomptes), réduire le DIO (gestion des stocks), allonger le DPO sans dégrader la relation fournisseur (dans la limite de la loi LME : 60 jours date de facture ou 45 jours fin de mois). Un BFR négatif (grande distribution) finance l'entreprise.</p>
<div class="retenir"><span class="label">À retenir</span><p>ΔBFR ≈ CA journalier × ΔDSO : un jour de DSO en moins, c'est un jour de CA de cash libéré. C'est LE calcul à maîtriser.</p></div>

## Financer les déficits, placer les excédents

<p><strong>Déficits court terme</strong> : facilité de caisse (quelques jours), découvert autorisé (montant et durée négociés, agios = montant × taux × jours ÷ 360 + commissions), escompte d'effets de commerce, cession Dailly (créances professionnelles), affacturage, billets de trésorerie (grandes entreprises). Un besoin <em>structurel</em> (BFR permanent) doit être financé par des ressources stables, pas par du découvert.</p>
<p><strong>Excédents</strong> : critères dans l'ordre sécurité, liquidité, rendement. Supports : comptes rémunérés, dépôts à terme, OPCVM monétaires, certificats de dépôt. Éviter d'immobiliser un excédent qui sera nécessaire au prochain pic de décaissements (paie, TVA, échéance d'emprunt).</p>
<p><strong>Dates de valeur et jours de banque</strong> : la banque crédite/débite avec un décalage ; connaître ces conventions évite des agios inutiles. La <strong>négociation bancaire</strong> porte sur les taux, les commissions (mouvement, plus fort découvert) et les dates de valeur.</p>
<div class="retenir"><span class="label">À retenir</span><p>Agios = montant × taux × jours ÷ 360. Découvert = besoin ponctuel ; ligne moyen terme ou fonds propres = besoin structurel.</p></div>

## Sécuriser : risques de taux, de change, de contrepartie

<p>Le trésorier gère aussi les risques de marché sur ses flux :</p>
<ul>
  <li><strong>Change</strong> : position par devise et échéance, couverture par ventes/achats à terme ou options ; facturation en euros ou clauses d'indexation quand c'est possible.</li>
  <li><strong>Taux</strong> : sur une dette à taux variable, plafonner par un cap ou fixer par un swap ; sur les placements, éviter le risque de perte en capital.</li>
  <li><strong>Contrepartie bancaire</strong> : diversifier les banques, suivre leur notation, limiter les dépôts par établissement.</li>
</ul>
<p>Le tout dans un cadre de <strong>contrôle interne</strong> : pouvoirs bancaires limités, double signature, séparation entre celui qui initie un virement et celui qui le valide, protection contre la fraude au président et au faux fournisseur (procédure de vérification des changements de RIB).</p>
<div class="retenir"><span class="label">À retenir</span><p>Les fraudes aux virements sont le premier risque opérationnel d'une trésorerie : double validation et vérification des RIB par un canal indépendant.</p></div>

## Le rôle de l'ERP et des outils de trésorerie

<p>Trois apports concrets des systèmes d'information :</p>
<dl>
  <dt>Rapprochement bancaire automatisé</dt><dd>les relevés (protocoles EBICS, SWIFT, formats CAMT/MT940) sont importés et lettrés automatiquement avec les écritures ; les exceptions sont traitées manuellement.</dd>
  <dt>Cash pooling</dt><dd>centralisation des soldes des filiales sur un compte pivot : physique (virements réels quotidiens, « zero balancing ») ou notionnel (compensation des intérêts sans mouvement de fonds). Réduit les frais financiers et optimise le placement du solde net du groupe.</dd>
  <dt>Prévision alimentée par les modules</dt><dd>ventes/facturation (échéances clients), achats (échéances fournisseurs), paie, immobilisations : la prévision de trésorerie devient un flux continu au lieu d'une reconstruction manuelle. Les TMS (treasury management systems) ajoutent la gestion des dérivés, des emprunts et du reporting.</dd>
</dl>
<p>Le <strong>netting</strong> intra-groupe compense les créances et dettes entre filiales pour réduire le nombre et le coût des flux.</p>
<div class="retenir"><span class="label">À retenir</span><p>Cash pooling physique vs notionnel, rapprochement automatique, netting : trois mots-clés d'examen sur l'ERP en trésorerie.</p></div>

## Piloter : reporting et indicateurs de trésorerie

<p>Un reporting de trésorerie efficace tient sur une page : position du jour (soldes par banque, lignes disponibles), prévision à 13 semaines avec écarts vs prévision précédente, indicateurs de BFR (DSO, DPO, DIO, CCC), coût de la dette et des couvertures, alertes (covenants, pics à venir).</p>
<p>Les indicateurs sont lus en tendance et expliqués par leurs causes : un DSO qui monte vient-il de nouveaux clients aux délais longs, de litiges, d'une relance insuffisante, ou d'un effet de saisonnalité du CA ? Le taux de recouvrement (encaissé ÷ échu du mois) et l'ancienneté moyenne pondérée complètent le DSO.</p>
<div class="formula">Taux de recouvrement = Encaissements du mois ÷ Encours échu en début de mois
Encaissement prévisionnel pondéré = Σ (Créance × Probabilité de règlement dans l'horizon)</div>
<div class="retenir"><span class="label">À retenir</span><p>Un bon reporting explique l'écart entre prévu et réalisé ; c'est là que se joue la crédibilité du trésorier.</p></div>

## Application : du recouvrement à la prévision de trésorerie

<p>Chaque ligne d'une balance âgée est, vue de la trésorerie, un encaissement futur incertain, avec une probabilité de règlement qui décroît avec l'ancienneté. Une prévision réaliste pondère chaque créance par cette probabilité, tranche par tranche, à partir des taux historiques de recouvrement.</p>
<p>Améliorer la priorisation des relances (viser les dossiers à plus fort montant × probabilité de récupération) réduit le DSO, donc le BFR, donc le besoin de financement court terme et son coût. Exemple : CA TTC 36,5 M€, DSO de 58 à 52 jours → 6 × 100 k€ = 600 k€ libérés ; à 5 % de coût de découvert, 30 k€ d'agios économisés par an, sans compter la baisse des provisions.</p>
<p>Le chaînage complet : qualité de facturation → relance structurée → DSO → BFR → trésorerie → coût de financement → résultat. Le recouvrement n'est pas une fonction administrative : c'est le premier fournisseur de cash de l'entreprise.</p>
<div class="retenir"><span class="label">À retenir</span><p>Sais chiffrer en trois lignes l'effet d'une baisse de DSO sur le cash et sur les agios : c'est l'argument qui justifie un investissement dans le recouvrement.</p></div>

# Définitions

## Budget de trésorerie
Prévision mensuelle des encaissements et décaissements sur l'année, en TTC et en dates de flux.

## Plan de trésorerie glissant
Prévision révisée en continu (souvent 13 semaines) pour anticiper les tensions.

## BFR
Besoin en fonds de roulement : cash immobilisé par le cycle d'exploitation (stocks + créances − dettes d'exploitation).

## DSO / DPO / DIO
Délais moyens de recouvrement clients, de paiement fournisseurs, de rotation des stocks.

## Cycle cash-to-cash (CCC)
DIO + DSO − DPO : jours entre le paiement des fournisseurs et l'encaissement des clients.

## Trésorerie nette
Disponibilités et placements − concours bancaires courants ; égale à FR − BFR.

## Découvert autorisé
Autorisation bancaire de solde débiteur dans une limite de montant et de durée, rémunérée par des agios.

## Facilité de caisse
Découvert de très courte durée (quelques jours par mois) pour absorber des décalages ponctuels.

## Escompte / Dailly
Mobilisation de créances : cession d'effets de commerce / cession de créances professionnelles à la banque.

## Agios
Intérêts et commissions facturés sur un découvert : montant × taux × jours ÷ 360 + commissions.

## Dates de valeur
Dates auxquelles la banque prend en compte une opération pour le calcul des intérêts, différentes de la date d'opération.

## Cash pooling
Centralisation des soldes des entités d'un groupe : physique (virements réels) ou notionnel (compensation des intérêts).

## Netting
Compensation des créances et dettes réciproques entre filiales pour réduire les flux.

## Rapprochement bancaire
Lettrage des écritures comptables avec les lignes du relevé bancaire, automatisable via l'ERP.

## EBICS / SWIFT
Protocoles d'échange sécurisé de fichiers (relevés, ordres) entre l'entreprise et ses banques.

## TMS
Treasury management system : logiciel spécialisé de gestion de trésorerie (positions, prévisions, dérivés, dettes).

## Cap de taux
Option qui plafonne le taux d'une dette variable contre paiement d'une prime.

## Fraude au président / au RIB
Escroquerie par usurpation d'identité pour obtenir un virement ou un changement de coordonnées bancaires.

## Taux de recouvrement
Encaissements du mois ÷ encours échu en début de mois.

# Formules

## Solde prévisionnel
```
Solde fin = Solde début + Encaissements − Décaissements
```
> En TTC et en date de flux.

## TVA à décaisser
```
TVA due (M) = TVA collectée (M−1) − TVA déductible (M−1)
```
> Régime réel normal, débits ou encaissements selon l'activité.

## BFR
```
BFR = Stocks + Créances clients − Dettes fournisseurs
```
> Compléter avec autres créances/dettes d'exploitation.

## BFR en jours de CA
```
BFR (jours) = BFR ÷ CA HT × 360
```
> Permet la comparaison sectorielle.

## Trésorerie nette
```
TN = FR − BFR
```
> Négative = découvert structurel.

## Cycle cash-to-cash
```
CCC = DIO + DSO − DPO
```
> Plus court = moins de cash immobilisé.

## Impact du DSO sur le BFR
```
ΔBFR ≈ CA TTC journalier × ΔDSO
```
> CA journalier = CA TTC ÷ 365.

## Agios de découvert
```
Agios = Montant × Taux × Jours ÷ 360 (+ commission de plus fort découvert)
```
> Année bancaire de 360 jours.

## Coût d'un jour de DSO
```
Coût annuel = CA journalier × Taux de financement
```
> Ex. 100 k€ × 5 % = 5 k€ par jour de DSO.

## Taux de recouvrement
```
Taux = Encaissements du mois ÷ Encours échu début de mois
```
> Complète le DSO.

## Encaissement pondéré
```
Prévision = Σ (Créance × Probabilité de règlement par tranche)
```
> Probabilités issues de l'historique.

# Quiz

## Dans un budget de trésorerie, une vente HT de 10 000 € facturée en janvier à 60 jours (TVA 20 %) apparaît :
- 10 000 € en janvier
- 12 000 € en janvier
- [x] 12 000 € en mars
- 10 000 € en mars
> On raisonne en TTC (12 000 €) et à la date d'encaissement (janvier + 60 jours = mars).

## Le BFR se calcule comme :
- [x] Stocks + Créances clients − Dettes fournisseurs
- Actif total − Passif total
- Créances clients − Dettes clients
- Chiffre d'affaires − Charges
> Formule classique du besoin en fonds de roulement d'exploitation.

## DIO 40 j, DSO 55 j, DPO 50 j. Le cycle cash-to-cash est de :
- 145 jours
- [x] 45 jours
- 65 jours
- 35 jours
> 40 + 55 − 50 = 45 jours.

## Découvert de 200 000 € pendant 45 jours à 6 %. Les agios s'élèvent à :
- 12 000 €
- [x] 1 500 €
- 1 479 €
- 9 000 €
> 200 000 × 6 % × 45 ÷ 360 = 1 500 €.

## Le cash pooling notionnel :
- Transfère physiquement les fonds chaque jour
- [x] Compense les intérêts sans mouvement de fonds
- Remplace le rapprochement bancaire
- Est réservé aux PME
> Les soldes restent sur chaque compte ; la banque calcule les intérêts sur la position nette.

## Pour placer un excédent à très court terme, le critère prioritaire est :
- Le rendement avant tout
- [x] La sécurité et la liquidité avant le rendement
- La durée la plus longue possible
- Le montant minimum
> Le placement doit être disponible pour le prochain pic de décaissements.

## La meilleure protection contre la fraude au changement de RIB fournisseur est :
- Payer plus vite
- [x] Vérifier le changement par un canal indépendant (appel à un contact connu) et double validation
- Ne plus payer par virement
- Faire confiance à l'email
> Le contrôle interne des paiements repose sur la vérification indépendante et la séparation initiation/validation.

## Dans une prévision d'encaissement construite à partir d'une balance âgée, chaque créance est pondérée par :
- Son montant uniquement
- [x] Une probabilité de règlement qui décroît avec l'ancienneté
- La devise de facturation
- Le nombre de relances, indépendamment du montant
> Prévision = Σ créance × probabilité par tranche, à partir des taux historiques.

# Exercices

## Budget de trésorerie sur trois mois
Solde au 1er janvier : 50 000 €. Ventes HT : déc. 150 000, janv. 180 000, fév. 160 000, mars 200 000, encaissées à 30 jours (TVA 20 %). Décaissements TTC : janv. 170 000, fév. 175 000, mars 150 000 (hors TVA à décaisser, négligée ici). Calcule les soldes fin janvier, février, mars.

> **Solution** : Encaissements : janvier = ventes de décembre TTC = 180 000 ; février = 216 000 ; mars = 192 000. Fin janvier = 50 000 + 180 000 − 170 000 = 60 000. Fin février = 60 000 + 216 000 − 175 000 = 101 000. Fin mars = 101 000 + 192 000 − 150 000 = 143 000 €.

## Impact du DSO sur le BFR et les agios
CA TTC 7 300 000 € (20 000 €/jour). Le DSO passe de 55 à 47 jours. Découvert moyen financé à 5 %. Quel effet sur le BFR et sur les agios annuels ?

> **Solution** : ΔDSO = −8 jours. ΔBFR ≈ 20 000 × (−8) = −160 000 € de cash libéré. Agios économisés = 160 000 × 5 % = 8 000 € par an — et un DSO plus bas réduit aussi les provisions IFRS 9.

## Cycle cash-to-cash et BFR en jours
Stocks 300 k€ (coût des ventes 2 700 k€/an), créances 900 k€ (CA TTC 7 300 k€), dettes fournisseurs 500 k€ (achats TTC 3 650 k€). Calcule DIO, DSO, DPO, le CCC et le BFR en jours de CA HT (CA HT 6 083 k€).

> **Solution** : DIO = 300 ÷ 2 700 × 365 = 40,6 j. DSO = 900 ÷ 7 300 × 365 = 45 j. DPO = 500 ÷ 3 650 × 365 = 50 j. CCC = 40,6 + 45 − 50 = 35,6 j. BFR = 300 + 900 − 500 = 700 k€, soit 700 ÷ 6 083 × 360 = 41 jours de CA HT.

## Prévision d'encaissement pondérée
Balance âgée : non échu 400 k€ (probabilité de règlement à 60 j : 95 %), 1-30 j 120 k€ (80 %), 31-90 j 60 k€ (50 %), +90 j 30 k€ (20 %). Calcule l'encaissement prévisionnel à 60 jours et compare à l'encours.

> **Solution** : 400 × 0,95 + 120 × 0,8 + 60 × 0,5 + 30 × 0,2 = 380 + 96 + 30 + 6 = 512 k€, soit 84 % d'un encours de 610 k€. Les 98 k€ restants sont l'enjeu de la relance.

# Notes

