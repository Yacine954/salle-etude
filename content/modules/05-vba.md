---
id: vba
code: S9
priorite: 1
titre: Outils numériques : Excel avancé & VBA
accroche: Automatiser un classeur : objets, boucles, fonctions, gestion d'erreurs — et savoir quand une formule moderne ou Power Query suffit.
couleur: 152
---

# Cours

## L'environnement : VBE, modules, enregistreur

<p>VBA (Visual Basic for Applications) est le langage de programmation intégré à Excel : c'est lui qui te permet d'automatiser un classeur. Pour y accéder, tu ouvres l'éditeur <strong>VBE</strong> avec le raccourci Alt + F11. Le code que tu écris ne flotte pas n'importe où : il se range dans des <strong>modules</strong>, qui peuvent être de plusieurs natures — module standard, module de feuille, module de classeur (« ThisWorkbook ») ou module de formulaire.</p>
<ul>
  <li>Pour démarrer, l'<strong>enregistreur de macros</strong> est ton meilleur allié : il traduit tes actions en code. C'est idéal pour découvrir la syntaxe d'une opération (un tri, une mise en forme), à condition de nettoyer ensuite le code obtenu, notamment en supprimant les Select/Activate inutiles.</li>
  <li>Attention au format : un classeur contenant des macros doit être enregistré en <strong>.xlsm</strong>. Et même ainsi, la sécurité des macros peut bloquer l'exécution, en particulier pour les fichiers téléchargés.</li>
  <li>Enfin, prends l'habitude d'écrire <strong>Option Explicit</strong> en tête de chaque module : cette instruction t'oblige à déclarer tes variables. Pourquoi ? Parce que cela évite 80 % des bugs dus à une simple faute de frappe.</li>
</ul>
<div class="formula">Option Explicit

Sub Bonjour()
    MsgBox "Classeur ouvert le " &amp; Format(Date, "dd/mm/yyyy")
End Sub</div>
<div class="retenir"><span class="label">À retenir</span><p>Une Sub est une procédure qui agit ; une Function renvoie une valeur (et s'utilise donc dans une cellule). Et Option Explicit, toujours.</p></div>

## Le modèle objet : Workbook, Worksheet, Range

<p>En VBA, tout passe par une hiérarchie d'objets : Application → Workbooks → Worksheets → Range/Cells. Autrement dit, l'application contient des classeurs, qui contiennent des feuilles, qui contiennent elles-mêmes des plages et des cellules. Chaque objet possède des <strong>propriétés</strong>, c'est-à-dire des caractéristiques que tu peux lire ou modifier (Value, Font.Bold, Interior.Color), et des <strong>méthodes</strong>, c'est-à-dire des actions qu'il sait exécuter (Copy, Sort, ClearContents).</p>
<div class="formula">Dim ws As Worksheet
Set ws = ThisWorkbook.Worksheets("Balance")

ws.Range("A1").Value = "Client"
ws.Cells(2, 3).Value = 1500           ' ligne 2, colonne C
Dim lastRow As Long
lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row   ' dernière ligne remplie en colonne A

With ws.Range("A1:F1")
    .Font.Bold = True
    .Interior.Color = RGB(220, 228, 208)
End With</div>
<p>Concrètement, dès que tes données sont organisées en <strong>tableaux structurés</strong> (ListObject), préfère-les aux simples plages : ils sont bien plus robustes. Tu écriras par exemple <code>ws.ListObjects("tBalance").ListRows.Count</code> ou <code>.ListColumns("Montant").DataBodyRange</code>. Autre réflexe important : qualifie toujours la feuille (ws.Range plutôt que Range), sinon tu risques d'écrire au mauvais endroit.</p>
<div class="retenir"><span class="label">À retenir</span><p>Set pour affecter les objets, With…End With pour grouper les instructions, End(xlUp) pour trouver la dernière ligne : ce sont les trois réflexes de base.</p></div>

## Variables, conditions, boucles, fonctions

<p>Commençons par les <strong>types</strong> de variables : Long pour les entiers, Double pour les décimaux, String, Boolean, Date, Variant (à éviter) et les types objets (Range, Worksheet). Viennent ensuite les <strong>conditions</strong> : la structure If…ElseIf…Else…End If, et Select Case lorsqu'il faut distinguer plusieurs valeurs — c'est bien plus lisible qu'une cascade de If. Prenons un exemple : le classement d'une créance par tranche d'ancienneté.</p>
<div class="formula">Dim i As Long, anciennete As Long
For i = 2 To lastRow
    anciennete = Date - ws.Cells(i, "D").Value      ' D = date d'échéance
    Select Case anciennete
Case Is &lt;= 0:  ws.Cells(i, "G").Value = "Non échu"
Case 1 To 30:   ws.Cells(i, "G").Value = "1-30 j"
Case 31 To 90:  ws.Cells(i, "G").Value = "31-90 j"
Case Else:      ws.Cells(i, "G").Value = "+90 j"
    End Select
Next i</div>
<p>Passons aux <strong>boucles</strong>. Tu en as trois familles : For…Next quand le nombre d'itérations est connu, For Each pour parcourir une collection (chaque feuille, chaque cellule), et Do While / Do Until quand la répétition dépend d'une condition. Pour finir, VBA te permet d'écrire tes propres <strong>fonctions personnalisées</strong>, utilisables directement dans une cellule :</p>
<div class="formula">Function ScoreRelance(montant As Double, jours As Long) As Double
    ScoreRelance = montant * (1 + jours / 30)
End Function
' Dans une cellule : =ScoreRelance(E2; F2)</div>
<div class="retenir"><span class="label">À retenir</span><p>For pour parcourir des lignes, Select Case pour classer une valeur, Function pour un calcul réutilisable dans les cellules.</p></div>

## Interaction, erreurs, événements, performance

<p>Une macro a souvent besoin de <strong>dialoguer</strong> avec l'utilisateur. Pour cela, tu disposes de MsgBox (afficher un message, proposer un choix Oui/Non), d'InputBox (demander une saisie) et du UserForm (un formulaire complet). Vient ensuite la question des <strong>erreurs</strong> : sans traitement, la moindre erreur arrête la macro net. C'est pourquoi on encadre les zones à risque avec un gestionnaire d'erreurs, comme ici :</p>
<div class="formula">Sub Exporter()
    On Error GoTo Gestion
    Application.ScreenUpdating = False     ' plus rapide
    ' ... traitement ...
Sortie:
    Application.ScreenUpdating = True
    Exit Sub
Gestion:
    MsgBox "Erreur " &amp; Err.Number &amp; " : " &amp; Err.Description
    Resume Sortie
End Sub</div>
<p>Les <strong>événements</strong>, ce sont des morceaux de code qui se déclenchent tout seuls, en réaction à une action. Dans ThisWorkbook, <code>Workbook_Open</code> s'exécute à l'ouverture du classeur ; dans le module d'une feuille, <code>Worksheet_Change(ByVal Target As Range)</code> s'exécute à chaque modification — très utile, par exemple, pour horodater une saisie de relance.</p>
<p>Enfin, un mot sur la <strong>performance</strong>. Quelques réflexes suffisent : désactiver ScreenUpdating et le calcul automatique pendant le traitement, lire une plage entière dans un tableau (Variant) plutôt que cellule par cellule, et éviter Select/Activate.</p>
<div class="retenir"><span class="label">À retenir</span><p>On Error GoTo + Resume, ScreenUpdating False/True, événements Open et Change : voilà ce qui distingue une macro « qui marche » d'une macro fiable.</p></div>

## Coder ou ne pas coder : formules modernes et Power Query

<p>Avant d'écrire une macro, pose-toi toujours la question : Excel ne sait-il pas déjà le faire ? Bien souvent, la réponse est oui.</p>
<dl>
  <dt>XLOOKUP / RECHERCHEX</dt><dd>remplace avantageusement RECHERCHEV : =RECHERCHEX(clé ; plage_clés ; plage_résultats ; "non trouvé"). Plus besoin de numéro de colonne, et l'absence de résultat est gérée directement.</dd>
  <dt>FILTER / FILTRE, SORT / TRIER, UNIQUE</dt><dd>ce sont les formules dynamiques. Par exemple, =TRIER(FILTRE(tBalance ; tBalance[Retard]&gt;90) ; 5 ; -1) donne la liste triée des créances > 90 jours, mise à jour automatiquement.</dd>
  <dt>SUMIFS / SOMME.SI.ENS, COUNTIFS</dt><dd>pour obtenir des totaux par tranche d'ancienneté ou par agent, sans la moindre macro.</dd>
  <dt>LET, LAMBDA</dt><dd>pour nommer des étapes intermédiaires de calcul et créer tes propres fonctions, sans passer par VBA.</dd>
  <dt>Power Query</dt><dd>pour importer et transformer des données (fusion de fichiers mensuels, nettoyage, jointures) de façon rejouable en un clic, via Données → Obtenir des données. C'est le bon outil pour consolider des exports de l'ERP.</dd>
</dl>
<p>D'où une règle pratique simple : s'il s'agit de transformer des données, c'est Power Query ; s'il s'agit de calculer et de restituer, ce sont les formules dynamiques et les tableaux structurés ; et s'il s'agit d'actions répétitives (mise en forme, export, envoi, génération de rapport), c'est là que VBA prend tout son sens.</p>
<div class="retenir"><span class="label">À retenir</span><p>Un VLOOKUP vers un fichier externe casse ; Power Query + tableau structuré + RECHERCHEX, eux, ne cassent pas. C'est la modernisation type d'un classeur de suivi.</p></div>

## Application : générer un TOP 15 automatiquement

<p>Prenons un cas concret. L'objectif : à l'ouverture du classeur, trier la balance par score décroissant, puis copier les 15 premières lignes dans la feuille Synthèse, en ajoutant un horodatage. Voici la macro complète, à lire ligne par ligne.</p>
<div class="formula">Sub GenererTop15()
    Dim wsB As Worksheet, wsS As Worksheet
    Set wsB = ThisWorkbook.Worksheets("Balance")
    Set wsS = ThisWorkbook.Worksheets("Synthèse")

    Dim lastRow As Long
    lastRow = wsB.Cells(wsB.Rows.Count, 1).End(xlUp).Row
    If lastRow &lt; 2 Then Exit Sub

    ' Colonne H = score (montant × facteur d'ancienneté), calculé par formule
    With wsB.Sort
.SortFields.Clear
.SortFields.Add Key:=wsB.Range("H2:H" &amp; lastRow), Order:=xlDescending
.SetRange wsB.Range("A1:H" &amp; lastRow)
.Header = xlYes
.Apply
    End With

    wsS.Range("A3:H100").ClearContents
    wsB.Range("A2:H" &amp; Application.Min(16, lastRow)).Copy
    wsS.Range("A3").PasteSpecial xlPasteValues
    Application.CutCopyMode = False
    wsS.Range("A1").Value = "TOP 15 généré le " &amp; Format(Now, "dd/mm/yyyy hh:mm")
End Sub

' Dans ThisWorkbook :
Private Sub Workbook_Open()
    GenererTop15
End Sub</div>
<p>Il existe d'ailleurs une variante sans VBA : dans la feuille Synthèse, la formule <code>=PRENDRE(TRIER(tBalance ; 8 ; -1) ; 15)</code> donne exactement le même TOP 15, recalculé en permanence.</p>
<div class="retenir"><span class="label">À retenir</span><p>Une macro utile, c'est : trouver la dernière ligne, trier, copier en valeurs, horodater. Sais la lire ligne par ligne, c'est un sujet d'examen classique.</p></div>

# Définitions

## Macro
Suite d'instructions VBA exécutée par Excel pour automatiser une tâche.

## VBE
Visual Basic Editor : l'éditeur de code intégré (Alt + F11).

## Module
Conteneur de code : module standard, module de feuille, ThisWorkbook, UserForm.

## Sub / Function
Procédure qui exécute des actions / fonction qui renvoie une valeur (utilisable dans une formule).

## Option Explicit
Instruction qui oblige à déclarer toutes les variables ; évite les erreurs de frappe silencieuses.

## Objet, propriété, méthode
Élément d'Excel (Range, Worksheet) ; caractéristique (Value, Color) ; action (Copy, Sort).

## Range / Cells
Plage désignée par adresse ("A1:C10") / cellule désignée par ligne et colonne (Cells(2, 3)).

## ListObject
Tableau structuré Excel manipulable par nom (tBalance), avec colonnes nommées et extension automatique.

## With … End With
Bloc qui évite de répéter la référence à un objet.

## For … Next / For Each
Boucle avec compteur / boucle sur chaque élément d'une collection.

## Select Case
Structure de choix multiple, plus lisible qu'une cascade de If pour classer une valeur.

## On Error GoTo
Redirection vers un gestionnaire d'erreurs pour éviter l'arrêt brutal d'une macro.

## Événement
Procédure déclenchée automatiquement par une action : Workbook_Open, Worksheet_Change.

## ScreenUpdating
Propriété qui désactive le rafraîchissement de l'écran pendant une macro pour accélérer l'exécution.

## RECHERCHEX (XLOOKUP)
Fonction de recherche moderne remplaçant RECHERCHEV, avec valeur par défaut si non trouvé.

## Formules dynamiques
FILTRE, TRIER, UNIQUE, PRENDRE… : formules qui renvoient une plage entière et se recalculent seules.

## Power Query
Outil d'import et de transformation de données rejouable, intégré à Excel (Données → Obtenir des données).

# Formules

## Dernière ligne remplie
```
lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
```
> Colonne 1 = A ; adapter la colonne de référence.

## Boucle sur les lignes
```
For i = 2 To lastRow … Next i
```
> Commencer à 2 pour sauter l'en-tête.

## Ancienneté d'une créance
```
anciennete = Date − ws.Cells(i, "D").Value
```
> En formule : =AUJOURDHUI()−D2.

## Classement par tranche
```
Select Case anciennete : Case Is <= 0 / Case 1 To 30 / Case 31 To 90 / Case Else
```
> Tranches de balance âgée.

## Tri d'une plage
```
ws.Sort.SortFields.Add Key:=Range, Order:=xlDescending ; .SetRange ; .Header = xlYes ; .Apply
```
> Clear avant d'ajouter.

## Copie en valeurs
```
Source.Copy : Destination.PasteSpecial xlPasteValues : Application.CutCopyMode = False
```
> Évite de coller les formules.

## Gestion d'erreurs
```
On Error GoTo Gestion … Exit Sub … Gestion: MsgBox Err.Description : Resume Sortie
```
> Toujours rétablir ScreenUpdating.

## RECHERCHEX
```
=RECHERCHEX(clé ; plage_clés ; plage_résultats ; "non trouvé")
```
> Remplace RECHERCHEV.

## Filtrer et trier sans macro
```
=TRIER(FILTRE(tBalance ; tBalance[Retard]>90) ; 5 ; -1)
```
> 5 = index de la colonne de tri, -1 = décroissant.

## TOP N sans macro
```
=PRENDRE(TRIER(tBalance ; 8 ; -1) ; 15)
```
> Excel 365.

## Totaux par tranche
```
=SOMME.SI.ENS(tBalance[Montant] ; tBalance[Tranche] ; "+90 j")
```
> Répartition par antériorité ou par agent.

# Quiz

## Quelle est la différence entre Sub et Function ?
- Sub est plus rapide
- [x] Function renvoie une valeur et peut s'utiliser dans une cellule
- Sub ne peut pas contenir de boucle
- Il n'y a aucune différence
> Une Function renvoie un résultat (=MaFonction(A1)), une Sub exécute des actions.

## Que fait ws.Cells(ws.Rows.Count, 1).End(xlUp).Row ?
- Compte le nombre de feuilles
- [x] Renvoie le numéro de la dernière ligne remplie de la colonne A
- Supprime la dernière ligne
- Trie la colonne A
> On part du bas de la colonne et on remonte (xlUp) jusqu'à la première cellule non vide.

## Option Explicit sert à :
- Accélérer les macros
- [x] Obliger la déclaration des variables
- Afficher les erreurs en anglais
- Protéger le classeur
> Sans elle, une faute de frappe crée silencieusement une nouvelle variable vide.

## Pour classer une valeur dans l'une de quatre tranches, la structure la plus lisible est :
- Une boucle Do While
- [x] Select Case
- On Error GoTo
- With … End With
> Select Case gère des plages de valeurs (Case 1 To 30) de façon claire.

## Le code de la procédure Workbook_Open se place dans :
- Un module standard
- [x] ThisWorkbook
- Le module de la feuille Synthèse
- Un UserForm
> Les événements du classeur vivent dans ThisWorkbook ; ceux d'une feuille dans son module.

## Quel outil est le plus adapté pour fusionner chaque mois 12 exports CSV de l'ERP ?
- RECHERCHEV
- [x] Power Query
- Une mise en forme conditionnelle
- MsgBox
> Power Query rejoue l'import et la transformation en un clic, sans code.

## =RECHERCHEX(A2 ; tRef[Client] ; tRef[Niveau] ; "nouveau") renvoie "nouveau" quand :
- Le client existe
- [x] Le client est absent de tRef
- La formule est incorrecte
- Le classeur est fermé
> Le 4e argument est la valeur par défaut si la clé n'est pas trouvée.

## Pourquoi coller en valeurs (xlPasteValues) dans la Synthèse ?
- Pour garder les formules vivantes
- [x] Pour figer le résultat et éviter les liens cassés
- Pour changer la police
- Pour supprimer les doublons
> La Synthèse doit rester lisible même si la source change ou est absente.

# Exercices

## Écrire une boucle de classement
La colonne E contient les dates d'échéance (lignes 2 à lastRow). Écris le code qui inscrit en colonne F la tranche « Non échu », « 1-30 j », « 31-90 j » ou « +90 j ».

> **Solution** : For i = 2 To lastRow : j = Date − ws.Cells(i, "E").Value : Select Case j : Case Is <= 0: ws.Cells(i, "F") = "Non échu" : Case 1 To 30: ws.Cells(i, "F") = "1-30 j" : Case 31 To 90: ws.Cells(i, "F") = "31-90 j" : Case Else: ws.Cells(i, "F") = "+90 j" : End Select : Next i  (déclarer i et j As Long, ws As Worksheet).

## Trouver le bug
Ce code plante ou donne un mauvais résultat : Sub T() / For i = 1 To lastRow / Cells(i, 3).Value = Cells(i, 2).Value * 1.2 / Next i / End Sub. Trouve au moins trois problèmes.

> **Solution** : (1) i et lastRow ne sont pas déclarés ni calculés (lastRow vaut 0 → boucle vide) ; (2) la boucle commence à 1 et écrase l'en-tête ; (3) Cells n'est pas qualifié par une feuille : la macro écrit dans la feuille active, pas forcément la bonne ; (4) pas d'Option Explicit ; (5) 1.2 en dur : préférer une constante nommée.

## Remplacer un VLOOKUP externe
La colonne « Niveau de relance » était alimentée par RECHERCHEV vers le classeur du mois précédent, ce qui cassait le classement quand le fichier était absent. Propose une solution robuste en formule, puis une en Power Query.

> **Solution** : Formule : conserver un onglet « Historique » dans le classeur courant (copié en valeurs à la clôture du mois) et utiliser =RECHERCHEX([@Client] ; tHisto[Client] ; tHisto[Niveau] ; "nouveau") — pas de lien externe, valeur par défaut gérée. Power Query : requête qui charge le fichier du mois précédent depuis un dossier fixe, fusionne sur le code client (jointure externe gauche) et charge le résultat dans un tableau ; si le fichier manque, la requête signale l'erreur au lieu de casser silencieusement les formules.

# Notes

