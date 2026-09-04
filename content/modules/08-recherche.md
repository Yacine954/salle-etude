---
id: recherche
code: S10
priorite: 3
titre: Outils de recherche : économétrie & théorie financière
accroche: Statistiques, régression, séries temporelles, portefeuille et MEDAF, efficience des marchés — et comment tester une hypothèse sur tes propres données.
couleur: 236
---

# Cours

## Statistiques descriptives et lois usuelles

<p>Avant toute modélisation, décrire : la <strong>moyenne</strong> (tendance centrale), la <strong>variance</strong> et l'<strong>écart-type</strong> (dispersion), la <strong>covariance</strong> et le <strong>coefficient de corrélation</strong> ρ (liaison linéaire entre deux variables, entre −1 et +1).</p>
<div class="formula">Moyenne x̄ = Σxᵢ ÷ n
Variance s² = Σ(xᵢ − x̄)² ÷ (n − 1)      Écart-type s = √s²
Cov(x,y) = Σ(xᵢ − x̄)(yᵢ − ȳ) ÷ (n − 1)      ρ = Cov(x,y) ÷ (sₓ · sᵧ)</div>
<p>La <strong>loi normale</strong> N(μ, σ) est centrale en finance : 68 % des observations à ±1σ, 95 % à ±1,96σ, 99 % à ±2,58σ. Un <strong>intervalle de confiance</strong> à 95 % pour une moyenne : x̄ ± 1,96 × s ÷ √n. Corrélation n'est pas causalité : deux séries peuvent monter ensemble sans lien de cause.</p>
<div class="retenir"><span class="label">À retenir</span><p>ρ mesure une liaison linéaire ; ρ = 0 n'exclut pas une relation non linéaire. 1,96 est le nombre magique du 95 %.</p></div>

## La régression linéaire par les MCO

<p>Le modèle : y = α + βx + ε. Les <strong>moindres carrés ordinaires</strong> (MCO) choisissent α et β pour minimiser la somme des carrés des résidus.</p>
<div class="formula">β̂ = Cov(x,y) ÷ Var(x)        α̂ = ȳ − β̂ x̄
R² = 1 − SCR ÷ SCT   (part de la variance de y expliquée par x)
t = β̂ ÷ se(β̂) ; |t| > 1,96 ⇒ β significatif à 5 %  (p-value < 0,05)</div>
<p>Interprétation : β est l'effet sur y d'une hausse d'une unité de x, toutes choses égales par ailleurs (en régression multiple). Hypothèses de Gauss-Markov pour que les MCO soient les meilleurs estimateurs linéaires sans biais : linéarité, résidus d'espérance nulle et de variance constante (<strong>homoscédasticité</strong>), non corrélés (<strong>pas d'autocorrélation</strong>), variables explicatives non corrélées au résidu (<strong>exogénéité</strong>) et non colinéaires.</p>
<p>Problèmes fréquents et remèdes : hétéroscédasticité (écarts-types robustes), autocorrélation (Durbin-Watson, termes retardés), multicolinéarité (VIF, retirer une variable), endogénéité (variables instrumentales), variables omises (biais).</p>
<div class="retenir"><span class="label">À retenir</span><p>Un coefficient se lit avec son signe, sa taille et sa significativité (t, p-value). R² élevé ≠ modèle causal.</p></div>

## Séries temporelles : notions essentielles

<p>Une série financière (cours, CA mensuel, encours clients) a souvent une <strong>tendance</strong>, une <strong>saisonnalité</strong> et une composante aléatoire. Régresser deux séries tendancielles l'une sur l'autre donne des corrélations trompeuses (« régression fallacieuse »).</p>
<p>Une série est <strong>stationnaire</strong> si sa moyenne et sa variance ne dépendent pas du temps ; on teste la présence d'une racine unitaire (test de Dickey-Fuller augmenté). Si la série n'est pas stationnaire, on travaille sur les différences (rendements plutôt que cours) ou on cherche une relation de cointégration.</p>
<p>Modèles usuels : moyenne mobile et lissage exponentiel pour prévoir, AR(p) (la valeur dépend de ses p valeurs passées), MA(q), ARIMA(p,d,q). Pour la volatilité des rendements : modèles ARCH/GARCH (la variance dépend des chocs passés — les crises se regroupent).</p>
<div class="retenir"><span class="label">À retenir</span><p>Stationnariser avant de modéliser ; rendements plutôt que niveaux ; GARCH pour la volatilité. Sais ce que teste Dickey-Fuller.</p></div>

## Théorie du portefeuille et MEDAF

<p><strong>Markowitz</strong> (1952) : un investisseur arbitre rendement espéré et risque (écart-type). La diversification réduit le risque d'un portefeuille tant que les actifs ne sont pas parfaitement corrélés ; la <strong>frontière efficiente</strong> regroupe les portefeuilles offrant le meilleur rendement pour chaque niveau de risque.</p>
<div class="formula">Portefeuille de 2 actifs : E(Rp) = w₁E(R₁) + w₂E(R₂)
σp² = w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂</div>
<p>Le <strong>MEDAF</strong> (CAPM, Sharpe 1964) ajoute l'actif sans risque : seul le risque <strong>systématique</strong> (non diversifiable, mesuré par le <strong>bêta</strong>) est rémunéré. Le bêta mesure la sensibilité du titre au marché (β &gt; 1 : amplifie ; β &lt; 1 : amortit).</p>
<div class="formula">E(Rᵢ) = r_f + βᵢ × [E(R_m) − r_f]        βᵢ = Cov(Rᵢ, R_m) ÷ Var(R_m)
Ratio de Sharpe = (Rp − r_f) ÷ σp</div>
<p>Le MEDAF fournit le coût des fonds propres (ke) utilisé dans le WACC. Limites : bêta instable, prime de risque à estimer, facteurs additionnels (taille, value, momentum — modèles de Fama-French).</p>
<div class="retenir"><span class="label">À retenir</span><p>Diversification = élimine le risque spécifique ; bêta = risque systématique ; MEDAF = prix de ce risque. Sais calculer un bêta à partir d'une covariance.</p></div>

## Efficience des marchés, structure financière, comportements

<p>L'<strong>hypothèse d'efficience</strong> (Fama, 1970) : les prix intègrent l'information disponible. Trois formes : <strong>faible</strong> (prix passés — l'analyse technique est inutile), <strong>semi-forte</strong> (toute information publique — l'analyse fondamentale ne bat pas le marché), <strong>forte</strong> (même l'information privée — contredite par les gains d'initiés).</p>
<p><strong>Modigliani-Miller</strong> : sans impôt ni frictions, la structure financière et la politique de dividende sont neutres ; avec impôt, la dette crée de la valeur. <strong>Théorie de l'agence</strong> appliquée à la finance : la dette discipline les dirigeants (flux disponibles réduits), les dividendes signalent la confiance.</p>
<p>La <strong>finance comportementale</strong> (Kahneman, Thaler) documente les écarts à la rationalité : excès de confiance, aversion aux pertes (on ressent une perte deux fois plus qu'un gain), ancrage, comportement moutonnier, biais de disposition (vendre les gagnants trop tôt, garder les perdants). Ces biais expliquent bulles et sur-réactions.</p>
<div class="retenir"><span class="label">À retenir</span><p>Trois formes d'efficience, MM sans/avec impôt, cinq biais comportementaux : le kit de la question de cours.</p></div>

## Application : tester l'effet d'une politique de relance

<p>Question de recherche : « une relance structurée réduit-elle le délai de paiement ? » Protocole possible sur des données de balance âgée anonymisées :</p>
<ol>
  <li><strong>Variable expliquée</strong> : délai de paiement observé (jours entre échéance et règlement) par facture.</li>
  <li><strong>Variables explicatives</strong> : nombre de relances reçues, montant de la facture, taille du client, secteur, ancienneté de la relation, mois (saisonnalité), variable indicatrice « après mise en place du TOP 15 ».</li>
  <li><strong>Modèle</strong> : régression multiple par MCO ; lire le signe et la significativité du coefficient « après TOP 15 » et de « nombre de relances ». Alternative : comparaison avant/après (test de Student sur les moyennes) ou différence de différences si un groupe de clients n'a pas été relancé.</li>
  <li><strong>Vigilance</strong> : endogénéité (on relance davantage les mauvais payeurs — le coefficient des relances peut sortir positif !), hétéroscédasticité (écarts-types robustes), variables omises (litiges).</li>
</ol>
<div class="retenir"><span class="label">À retenir</span><p>L'endogénéité est le piège : la relance cible ceux qui paient mal. Le comparer « avant/après » ou avec un groupe témoin est plus convaincant qu'une simple corrélation.</p></div>

# Définitions

## Variance / écart-type
Mesures de dispersion autour de la moyenne ; l'écart-type est la racine de la variance, dans l'unité de la variable.

## Covariance / corrélation
Co-variation de deux variables ; la corrélation ρ la normalise entre −1 et +1.

## Intervalle de confiance
Fourchette qui contient le vrai paramètre avec une probabilité donnée (95 % : ± 1,96 écart-type de l'estimateur).

## MCO
Moindres carrés ordinaires : méthode d'estimation qui minimise la somme des carrés des résidus.

## R²
Part de la variance de la variable expliquée restituée par le modèle (entre 0 et 1).

## t de Student / p-value
Statistique de test d'un coefficient / probabilité d'observer une telle valeur si le vrai coefficient est nul ; p < 0,05 = significatif.

## Hétéroscédasticité
Variance des résidus non constante ; biaise les écarts-types, pas les coefficients.

## Autocorrélation
Corrélation des résidus entre eux (séries temporelles) ; test de Durbin-Watson.

## Multicolinéarité
Variables explicatives fortement corrélées entre elles ; rend les coefficients instables (VIF).

## Endogénéité
Corrélation entre une variable explicative et le résidu (causalité inverse, variable omise) ; biaise les MCO.

## Stationnarité
Propriété d'une série dont moyenne et variance sont constantes dans le temps ; testée par Dickey-Fuller.

## ARIMA / GARCH
Modèles de séries temporelles pour le niveau (ARIMA) et pour la volatilité (GARCH).

## Frontière efficiente
Ensemble des portefeuilles offrant le rendement maximal pour chaque niveau de risque.

## Risque systématique / spécifique
Risque lié au marché, non diversifiable (bêta) / risque propre au titre, éliminé par la diversification.

## Bêta
Sensibilité du rendement d'un titre au rendement du marché : Cov(Rᵢ,Rₘ) ÷ Var(Rₘ).

## Prime de risque de marché
E(Rₘ) − r_f : rendement excédentaire attendu du marché sur l'actif sans risque.

## Ratio de Sharpe
Rendement excédentaire par unité de risque : (Rp − r_f) ÷ σp.

## Efficience (3 formes)
Faible (prix passés), semi-forte (information publique), forte (toute information).

## Aversion aux pertes
Biais comportemental : une perte est ressentie environ deux fois plus qu'un gain équivalent.

# Formules

## Moyenne, variance, écart-type
```
x̄ = Σxᵢ ÷ n ; s² = Σ(xᵢ − x̄)² ÷ (n − 1) ; s = √s²
```
> n − 1 pour un échantillon.

## Covariance et corrélation
```
Cov(x,y) = Σ(xᵢ − x̄)(yᵢ − ȳ) ÷ (n − 1) ; ρ = Cov(x,y) ÷ (sₓ sᵧ)
```
> ρ ∈ [−1 ; 1].

## Intervalle de confiance (95 %)
```
x̄ ± 1,96 × s ÷ √n
```
> 1,645 pour 90 %, 2,58 pour 99 %.

## Régression simple (MCO)
```
y = α + βx + ε ; β̂ = Cov(x,y) ÷ Var(x) ; α̂ = ȳ − β̂x̄
```
> β = effet marginal de x sur y.

## Qualité d'ajustement
```
R² = 1 − SCR ÷ SCT = SCE ÷ SCT
```
> R² ajusté pénalise le nombre de variables.

## Test de significativité
```
t = β̂ ÷ se(β̂) ; |t| > 1,96 ⇔ p < 0,05
```
> Grand échantillon.

## Rendement d'un titre
```
R = (P₁ − P₀ + D) ÷ P₀ ; rendement log = ln(P₁ ÷ P₀)
```
> Travailler sur les rendements, pas les cours.

## Portefeuille de deux actifs
```
E(Rp) = w₁E(R₁) + w₂E(R₂) ; σp² = w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂
```
> ρ < 1 ⇒ diversification.

## Bêta
```
βᵢ = Cov(Rᵢ, Rₘ) ÷ Var(Rₘ) = ρᵢₘ × σᵢ ÷ σₘ
```
> Pente de la régression du titre sur le marché.

## MEDAF (CAPM)
```
E(Rᵢ) = r_f + βᵢ × [E(Rₘ) − r_f]
```
> Donne ke pour le WACC.

## Ratio de Sharpe
```
Sharpe = (Rp − r_f) ÷ σp
```
> Comparer des portefeuilles à risque différent.

## Bêta d'une entreprise endettée
```
β_endetté = β_non endetté × [1 + (1 − t) × D ÷ E]
```
> Formule de Hamada.

# Quiz

## Un coefficient de corrélation de −0,9 entre deux variables indique :
- Aucune relation
- [x] Une forte relation linéaire décroissante
- Une causalité de x vers y
- Une relation non linéaire
> Proche de −1 : liaison linéaire forte et négative. Rien ne dit qu'elle est causale.

## Dans une régression, un coefficient a t = 0,8. On en conclut que :
- Il est significatif à 5 %
- [x] Il n'est pas significativement différent de zéro
- Le modèle est faux
- Le R² est élevé
> |t| < 1,96 : on ne peut pas rejeter l'hypothèse β = 0 au seuil de 5 %.

## L'hétéroscédasticité :
- Biaise les coefficients MCO
- [x] Biaise les écarts-types des coefficients
- Rend le R² négatif
- N'a aucun effet
> Les coefficients restent sans biais, mais les tests de significativité sont faussés ; remède : écarts-types robustes.

## Le test de Dickey-Fuller sert à :
- Détecter la multicolinéarité
- [x] Tester la stationnarité d'une série
- Calculer un bêta
- Mesurer l'efficience
> Il teste la présence d'une racine unitaire ; sans stationnarité, risque de régression fallacieuse.

## Deux actifs de même écart-type 20 % et de corrélation 0. Un portefeuille 50/50 a un écart-type de :
- 20 %
- [x] 14,1 %
- 10 %
- 0 %
> σp² = 0,25 × 0,04 + 0,25 × 0,04 + 0 = 0,02 ; σp = 14,1 %. La diversification réduit le risque.

## r_f = 3 %, prime de marché = 5 %, β = 1,4. Le rendement exigé par le MEDAF est :
- 8 %
- [x] 10 %
- 7 %
- 12 %
> 3 % + 1,4 × 5 % = 10 %.

## Selon la forme semi-forte de l'efficience :
- L'analyse technique bat le marché
- [x] L'information publique est déjà dans les prix
- Les initiés ne gagnent jamais
- Les prix sont aléatoires sans lien avec l'information
> L'analyse fondamentale sur information publique ne permet pas de battre durablement le marché.

## On observe que les factures les plus relancées sont payées le plus tard. Conclure que la relance retarde le paiement est une erreur de :
- Multicolinéarité
- [x] Endogénéité (causalité inverse)
- Saisonnalité
- Stationnarité
> On relance davantage les mauvais payeurs : la causalité va du retard vers la relance.

# Exercices

## Calcul d'un bêta
Cov(Rᵢ, Rₘ) = 0,024, Var(Rₘ) = 0,016. Calcule le bêta puis le rendement exigé avec r_f = 2,5 % et une prime de marché de 6 %.

> **Solution** : β = 0,024 ÷ 0,016 = 1,5. E(Rᵢ) = 2,5 % + 1,5 × 6 % = 11,5 %. Le titre amplifie les mouvements du marché de 50 %.

## Interpréter une régression
Délai de paiement (jours) = 32 + 0,004 × Montant (€) − 6,2 × Relances + 9,5 × Litige ; t respectifs : 5,1 ; 2,3 ; −3,8 ; 4,4 ; R² = 0,31 ; n = 1 200. Interprète.

> **Solution** : Toutes choses égales par ailleurs : +1 000 € de montant → +4 jours (significatif, t = 2,3) ; chaque relance supplémentaire → −6,2 jours (significatif, t = −3,8) ; un litige → +9,5 jours (significatif). Le modèle explique 31 % de la variance : d'autres facteurs comptent (client, secteur). Vigilance : l'effet des relances peut être sous-estimé par endogénéité (on relance les mauvais payeurs) — le signe négatif est donc d'autant plus rassurant.

## Portefeuille de deux actifs
Actif A : E(R) = 8 %, σ = 15 %. Actif B : E(R) = 12 %, σ = 25 %. ρ = 0,3. Portefeuille 60 % A / 40 % B. Calcule E(Rp) et σp, puis le ratio de Sharpe avec r_f = 2 %.

> **Solution** : E(Rp) = 0,6 × 8 + 0,4 × 12 = 9,6 %. σp² = 0,36 × 0,0225 + 0,16 × 0,0625 + 2 × 0,6 × 0,4 × 0,3 × 0,15 × 0,25 = 0,0081 + 0,01 + 0,0054 = 0,0235 ; σp = 15,3 %. Sharpe = (9,6 − 2) ÷ 15,3 = 0,50.

# Notes

