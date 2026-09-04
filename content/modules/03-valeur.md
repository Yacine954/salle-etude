---
id: valeur
code: S9
priorite: 2
titre: Entreprise et valeur : IFRS, analyse financière, évaluation
accroche: Lire des comptes en IFRS, diagnostiquer avec les bons ratios, puis valoriser par DCF et par multiples.
couleur: 212
---

# Cours

## Le référentiel IFRS : principes et normes clés

<p>Les IFRS (International Financial Reporting Standards) s'appliquent aux comptes consolidés des sociétés cotées européennes. Deux principes structurants : la <strong>prééminence de la substance sur la forme</strong> (on comptabilise la réalité économique) et un recours étendu à la <strong>juste valeur</strong> (fair value) à côté du coût historique.</p>
<dl>
  <dt>IAS 1 / IAS 7</dt><dd>présentation des états financiers / tableau des flux de trésorerie (exploitation, investissement, financement).</dd>
  <dt>IFRS 9</dt><dd>instruments financiers : classement, évaluation, dépréciation des créances en pertes attendues, comptabilité de couverture.</dd>
  <dt>IFRS 15</dt><dd>revenu : reconnu quand chaque obligation de performance est remplie (modèle en 5 étapes).</dd>
  <dt>IFRS 16</dt><dd>locations : le preneur inscrit un droit d'utilisation à l'actif et une dette de loyers au passif — l'EBITDA monte, la dette aussi.</dd>
  <dt>IAS 36 / IAS 38</dt><dd>dépréciation d'actifs (test de valeur recouvrable, goodwill) / immobilisations incorporelles (frais de développement activables sous conditions).</dd>
</dl>
<div class="retenir"><span class="label">À retenir</span><p>Pour l'examen : IFRS 9 = créances et dérivés, IFRS 15 = chiffre d'affaires, IFRS 16 = loyers au bilan, IAS 36 = dépréciation/goodwill.</p></div>

## Lire les comptes : bilan fonctionnel et SIG

<p>Le <strong>bilan fonctionnel</strong> reclasse le bilan par cycles : investissement (actif immobilisé), financement (capitaux permanents = capitaux propres + dettes financières à long terme), exploitation (stocks, créances, dettes fournisseurs) et trésorerie.</p>
<div class="formula">FR = Capitaux permanents − Actif immobilisé
BFR = Stocks + Créances d'exploitation − Dettes d'exploitation
Trésorerie nette = FR − BFR</div>
<p>Les <strong>soldes intermédiaires de gestion</strong> (SIG) décomposent le compte de résultat en cascade : marge commerciale → production → valeur ajoutée → excédent brut d'exploitation (EBE, proche de l'EBITDA) → résultat d'exploitation (REX, proche de l'EBIT) → résultat courant avant impôt → résultat net.</p>
<p>La <strong>capacité d'autofinancement</strong> (CAF) mesure le cash potentiel généré par l'activité : résultat net + charges calculées (dotations) − produits calculés (reprises) − plus-values de cession.</p>
<div class="retenir"><span class="label">À retenir</span><p>Un FR positif finance le BFR ; si le BFR dépasse le FR, la trésorerie nette est négative et l'entreprise vit à découvert. C'est le diagnostic de base.</p></div>

## Les ratios de diagnostic

<p>Quatre familles de ratios, à toujours lire en tendance et en comparaison sectorielle :</p>
<ul>
  <li><strong>Rotation / délais</strong> : DSO (délai clients), DPO (délai fournisseurs), DIO (délai stocks). BFR en jours de CA = BFR ÷ CA × 360.</li>
  <li><strong>Structure</strong> : endettement net ÷ capitaux propres (gearing), dette nette ÷ EBITDA (capacité de remboursement, alerte au-delà de 3-4x), autonomie financière.</li>
  <li><strong>Rentabilité</strong> : marge d'EBITDA, ROCE (rentabilité économique des capitaux employés), ROE (rentabilité des capitaux propres).</li>
  <li><strong>Liquidité</strong> : ratio de liquidité générale (actif circulant ÷ passif circulant), couverture des intérêts (EBIT ÷ charges d'intérêts).</li>
</ul>
<p>L'<strong>effet de levier</strong> relie les deux rentabilités : s'endetter augmente le ROE tant que la rentabilité économique dépasse le coût de la dette.</p>
<div class="formula">ROE = ROCE + (ROCE − i) × D ÷ CP   (après impôt)
DSO = Créances clients TTC ÷ CA TTC × 365</div>
<div class="retenir"><span class="label">À retenir</span><p>Le levier joue dans les deux sens : si ROCE < i, la dette détruit de la rentabilité pour l'actionnaire (« effet de massue »).</p></div>

## Évaluer par les flux : le DCF

<p>La méthode DCF (discounted cash flows) valorise l'entreprise par la somme actualisée de ses flux de trésorerie disponibles futurs.</p>
<ol>
  <li>Prévoir les <strong>free cash flows</strong> (FCF) sur 5 à 7 ans : FCF = EBIT × (1 − t) + dotations − investissements − ΔBFR.</li>
  <li>Calculer le <strong>WACC</strong> (coût moyen pondéré du capital) : moyenne du coût des fonds propres (ke, par le MEDAF) et du coût de la dette après impôt, pondérée par la structure financière cible.</li>
  <li>Calculer la <strong>valeur terminale</strong> (Gordon-Shapiro) : FCF de l'année n+1 ÷ (WACC − g), g étant le taux de croissance à l'infini (prudent : 1-2 %).</li>
  <li>Actualiser FCF et valeur terminale : on obtient la <strong>valeur d'entreprise</strong> (VE).</li>
  <li>Passer à la <strong>valeur des fonds propres</strong> : VE − dette nette (dettes financières − trésorerie) − intérêts minoritaires + participations.</li>
</ol>
<div class="formula">WACC = E/(D+E) × ke + D/(D+E) × kd × (1 − t)
ke = rf + β × (Rm − rf)
VT = FCF(n+1) ÷ (WACC − g)</div>
<div class="retenir"><span class="label">À retenir</span><p>La valeur terminale pèse souvent 60-80 % de la VE : les hypothèses g et WACC sont donc les plus sensibles — toujours présenter une matrice de sensibilité.</p></div>

## Évaluer par comparaison : multiples et ANR

<p>Les <strong>multiples</strong> valorisent en appliquant à un agrégat de la cible le rapport observé sur des sociétés comparables (cotées : multiples boursiers ; ou transactions récentes : multiples transactionnels).</p>
<ul>
  <li>Multiples de valeur d'entreprise : VE ÷ EBITDA (le plus courant), VE ÷ EBIT, VE ÷ CA.</li>
  <li>Multiples de capitaux propres : PER (cours ÷ BPA), P/B (cours ÷ actif net comptable).</li>
  <li>Ajustements : décote d'illiquidité pour une société non cotée (20-30 %), prime de contrôle pour une acquisition majoritaire.</li>
</ul>
<p>L'<strong>actif net réévalué</strong> (ANR) : capitaux propres comptables corrigés des plus ou moins-values latentes sur les actifs — pertinent pour les holdings, foncières, sociétés à forte composante patrimoniale.</p>
<p>En pratique, on croise les méthodes (« football field ») et on retient une fourchette, pas un chiffre.</p>
<div class="retenir"><span class="label">À retenir</span><p>VE/EBITDA compare des entreprises indépendamment de leur structure financière ; le PER dépend de l'endettement. Ne jamais mélanger un multiple de VE avec un agrégat de fonds propres.</p></div>

## Application : le poste clients dans le diagnostic

<p>Le DSO est l'indicateur qui mesure, à l'échelle de l'entreprise, l'efficacité du recouvrement. Un DSO de 60 jours signifie que le chiffre d'affaires d'environ deux mois est immobilisé chez les clients.</p>
<ul>
  <li>Impact trésorerie : chaque jour de DSO en plus immobilise CA TTC ÷ 365 de cash supplémentaire.</li>
  <li>Impact résultat : les créances anciennes génèrent des provisions (IFRS 9) et des pertes définitives (créances irrécouvrables).</li>
  <li>Impact valorisation : un BFR structurellement élevé réduit les FCF, donc la valeur DCF ; un acheteur ajuste le prix (« BFR normatif ») dans une acquisition.</li>
</ul>
<p>Un diagnostic complet du poste clients : DSO en tendance, balance âgée (part > 90 jours), concentration (part des 10 premiers clients), taux de litiges, taux de pertes sur créances, comparaison avec les conditions de paiement contractuelles (écart = retard moyen).</p>
<div class="retenir"><span class="label">À retenir</span><p>Sais faire le lien chiffré : ΔDSO × CA journalier = cash immobilisé ; c'est aussi l'argument pour justifier un investissement dans le recouvrement.</p></div>

# Définitions

## Juste valeur
Prix qui serait reçu pour vendre un actif lors d'une transaction normale entre participants de marché à la date d'évaluation.

## Fonds de roulement (FR)
Excédent des ressources stables sur les emplois stables ; finance le BFR.

## BFR
Besoin en fonds de roulement : stocks + créances d'exploitation − dettes d'exploitation ; besoin de financement du cycle d'exploitation.

## Trésorerie nette
FR − BFR ; disponibilités moins concours bancaires courants.

## EBE / EBITDA
Résultat de l'exploitation avant amortissements, provisions, résultat financier et impôt ; mesure la performance opérationnelle brute.

## CAF
Capacité d'autofinancement : flux de trésorerie potentiel dégagé par l'activité (résultat net + charges calculées − produits calculés).

## DSO / DPO / DIO
Délais moyens en jours de recouvrement clients, de paiement fournisseurs et de rotation des stocks.

## ROCE
Return on capital employed : rentabilité économique = REX après impôt ÷ capitaux employés (immobilisations + BFR).

## ROE
Return on equity : rentabilité des capitaux propres = résultat net ÷ capitaux propres.

## Effet de levier
Amplification du ROE par l'endettement, positive si la rentabilité économique dépasse le coût de la dette, négative sinon.

## WACC
Coût moyen pondéré du capital : taux d'actualisation des FCF, moyenne du coût des fonds propres et de la dette après impôt.

## Free cash flow
Flux de trésorerie disponible après impôt sur l'exploitation, investissements et variation de BFR ; ce qui revient aux apporteurs de capitaux.

## Valeur terminale
Valeur de l'entreprise au-delà de l'horizon de prévision, calculée par une rente perpétuelle croissante (Gordon-Shapiro).

## Valeur d'entreprise vs valeur des fonds propres
VE = valeur de l'actif économique ; valeur des fonds propres = VE − dette nette.

## Dette nette
Dettes financières − trésorerie et placements.

## PER
Price earnings ratio : cours ÷ bénéfice par action ; multiple de capitaux propres.

## Goodwill
Écart d'acquisition : prix payé − juste valeur des actifs nets identifiables ; soumis à un test de dépréciation annuel (IAS 36).

## BFR normatif
Niveau « normal » de BFR retenu dans une acquisition pour ajuster le prix.

# Formules

## Bilan fonctionnel
```
FR = Capitaux permanents − Actif immobilisé ; BFR = Stocks + Créances − Dettes d'exploitation ; TN = FR − BFR
```
> Diagnostic d'équilibre financier.

## EBE
```
EBE = Valeur ajoutée + Subventions d'exploitation − Impôts et taxes − Charges de personnel
```
> ≈ EBITDA.

## CAF
```
CAF = Résultat net + Dotations − Reprises + VNC des actifs cédés − Produits de cession
```
> Ou : EBE + produits encaissables − charges décaissables.

## Délais
```
DSO = Créances TTC ÷ CA TTC × 365 ; DPO = Dettes fournisseurs ÷ Achats TTC × 365 ; DIO = Stocks ÷ Coût des ventes × 365
```
> 365 ou 360 selon la convention du cours.

## Rentabilités
```
ROE = Résultat net ÷ Capitaux propres ; ROCE = REX × (1 − t) ÷ (Immobilisations + BFR)
```
> t = taux d'impôt.

## Effet de levier
```
ROE = ROCE + (ROCE − i) × D ÷ CP
```
> i = coût de la dette après impôt.

## Coût des fonds propres (MEDAF)
```
ke = rf + β × (Rm − rf)
```
> rf = taux sans risque, (Rm − rf) = prime de risque de marché.

## WACC
```
WACC = E/(D+E) × ke + D/(D+E) × kd × (1 − t)
```
> Pondérations en valeur de marché.

## Free cash flow
```
FCF = EBIT × (1 − t) + Dotations − Capex − ΔBFR
```
> ΔBFR positif = consommation de cash.

## Valeur terminale (Gordon)
```
VT = FCF(n+1) ÷ (WACC − g)
```
> Actualiser ensuite : VT ÷ (1 + WACC)^n.

## Du DCF à la valeur des titres
```
VE = Σ FCF(t) ÷ (1 + WACC)^t + VT ÷ (1 + WACC)^n ; Valeur des fonds propres = VE − Dette nette
```
> Equity bridge.

## Multiples
```
VE = multiple × EBITDA ; Capitalisation = PER × Résultat net
```
> Ne pas mélanger VE et fonds propres.

## Impact du DSO
```
Cash immobilisé = ΔDSO × CA TTC ÷ 365
```
> Argument chiffré pour le recouvrement.

# Quiz

## Sous IFRS 16, un contrat de location chez le preneur :
- Reste hors bilan
- [x] Crée un actif « droit d'utilisation » et une dette de loyers
- Est comptabilisé en charge unique à la signature
- N'a aucun effet sur l'EBITDA
> L'actif et la dette apparaissent au bilan ; le loyer est remplacé par amortissement + intérêts, ce qui augmente l'EBITDA.

## FR = 200, BFR = 260. La trésorerie nette est de :
- +60
- [x] −60
- +460
- 0
> TN = FR − BFR = 200 − 260 = −60 : l'entreprise finance une partie de son BFR par du découvert.

## Le ROCE est de 8 % et le coût de la dette après impôt de 5 %. S'endetter davantage :
- Réduit le ROE
- [x] Augmente le ROE (levier positif)
- N'a aucun effet sur le ROE
- Rend le ROE négatif
> ROCE > i : chaque euro emprunté rapporte plus qu'il ne coûte, le ROE augmente.

## Dans un DCF, la valeur terminale se calcule par :
- EBITDA × multiple sectoriel uniquement
- [x] FCF(n+1) ÷ (WACC − g)
- Somme des dividendes passés
- Capitaux propres × PER
> Formule de Gordon-Shapiro, rente perpétuelle croissante au taux g.

## VE = 120 M€, dette financière = 40 M€, trésorerie = 10 M€. La valeur des fonds propres est :
- 120 M€
- 80 M€
- [x] 90 M€
- 150 M€
> Dette nette = 40 − 10 = 30 ; fonds propres = 120 − 30 = 90 M€.

## Quel multiple compare des entreprises indépendamment de leur structure financière ?
- PER
- [x] VE / EBITDA
- P/B
- Dividende / cours
> Le PER est affecté par les charges financières ; VE/EBITDA raisonne avant financement.

## Un DSO qui passe de 45 à 60 jours avec un CA TTC de 36,5 M€ immobilise en plus :
- 150 000 €
- [x] 1 500 000 €
- 15 000 €
- 6 000 000 €
> CA journalier = 36,5 M ÷ 365 = 100 k€ ; 15 jours × 100 k€ = 1,5 M€.

## Le goodwill est :
- Amorti linéairement sur 5 ans en IFRS
- [x] Soumis à un test de dépréciation annuel (IAS 36)
- Toujours nul dans les comptes consolidés
- Un passif
> En IFRS, le goodwill n'est pas amorti mais testé chaque année (et en cas d'indice de perte de valeur).

# Exercices

## Bilan fonctionnel
Capitaux propres 500, dettes financières LT 300, actif immobilisé 650, stocks 120, créances clients 210, dettes fournisseurs 160, disponibilités 20. Calcule FR, BFR et TN, puis vérifie la cohérence.

> **Solution** : FR = (500 + 300) − 650 = 150. BFR = 120 + 210 − 160 = 170. TN = 150 − 170 = −20. Vérification : disponibilités 20 − concours bancaires 40 = −20 (il manque 40 de découvert au passif pour équilibrer, ce qui est cohérent avec une TN négative).

## WACC et coût des fonds propres
rf = 3 %, prime de marché = 5 %, β = 1,2, coût de la dette avant impôt = 4 %, taux d'impôt 25 %, structure cible 60 % fonds propres / 40 % dette. Calcule ke puis le WACC.

> **Solution** : ke = 3 % + 1,2 × 5 % = 9 %. kd après impôt = 4 % × 0,75 = 3 %. WACC = 0,6 × 9 % + 0,4 × 3 % = 5,4 % + 1,2 % = 6,6 %.

## DCF simplifié
FCF prévus : 10, 12, 14 (années 1 à 3). WACC = 8 %, g = 2 %. Dette nette = 30. Calcule la VE et la valeur des fonds propres.

> **Solution** : Actualisation : 10/1,08 = 9,26 ; 12/1,08² = 10,29 ; 14/1,08³ = 11,11 → somme 30,66. VT = 14 × 1,02 ÷ (0,08 − 0,02) = 238 ; actualisée : 238 ÷ 1,08³ = 188,9. VE ≈ 219,6. Fonds propres = 219,6 − 30 ≈ 189,6. La VT représente 86 % de la VE : sensibilité forte à g et au WACC.

## Effet de levier
Capitaux employés 1 000 (CP 400, dette 600). REX 100, taux d'impôt 25 %, coût de la dette 4 % avant impôt. Calcule ROCE, i après impôt et ROE par la formule du levier, puis vérifie par le compte de résultat.

> **Solution** : ROCE = 100 × 0,75 ÷ 1 000 = 7,5 %. i = 4 % × 0,75 = 3 %. ROE = 7,5 % + (7,5 % − 3 %) × 600/400 = 7,5 % + 6,75 % = 14,25 %. Vérification : intérêts 24, résultat avant impôt 76, RN = 57, ROE = 57 ÷ 400 = 14,25 %.

# Notes

