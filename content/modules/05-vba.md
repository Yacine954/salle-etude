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

<p>VBA (Visual Basic for Applications) est le langage intégré à Excel. On y accède par l'éditeur <strong>VBE</strong> (Alt + F11). Le code se range dans des <strong>modules</strong> (standard, de feuille, de classeur « ThisWorkbook », de formulaire).</p>
<ul>
  <li>L'<strong>enregistreur de macros</strong> traduit vos actions en code : idéal pour découvrir la syntaxe d'une opération (tri, mise en forme), à nettoyer ensuite (supprimer les Select/Activate inutiles).</li>
  <li>Un classeur contenant des macros doit être enregistré en <strong>.xlsm</strong> ; la sécurité des macros peut bloquer l'exécution (fichiers téléchargés).</li>
  <li><strong>Option Explicit</strong> en tête de module oblige à déclarer les variables : cela évite 80 % des bugs de faute de frappe.</li>
</ul>
<div class="formula">Option Explicit

Sub Bonjour()
    MsgBox "Classeur ouvert le " &amp; Format(Date, "dd/mm/yyyy")
End Sub</div>
<div class="retenir"><span class="label">À retenir</span><p>Sub = procédure qui agit ; Function = renvoie une valeur (utilisable dans une cellule). Option Explicit toujours.</p></div>

## Le modèle objet : Workbook, Worksheet, Range

<p>Tout en VBA passe par une hiérarchie d'objets : Application → Workbooks → Worksheets → Range/Cells. Un objet a des <strong>propriétés</strong> (Value, Font.Bold, Interior.Color) et des <strong>méthodes</strong> (Copy, Sort, ClearContents).</p>
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
<p>Les <strong>tableaux structurés</strong> (ListObject) sont plus robustes que des plages : <code>ws.ListObjects("tBalance").ListRows.Count</code>, <code>.ListColumns("Montant").DataBodyRange</code>. Toujours qualifier la feuille (ws.Range plutôt que Range) pour éviter d'écrire au mauvais endroit.</p>
<div class="retenir"><span class="label">À retenir</span><p>Set pour les objets, With…End With pour grouper, End(xlUp) pour trouver la dernière ligne : trois réflexes de base.</p></div>

## Variables, conditions, boucles, fonctions

<p><strong>Types</strong> : Long (entiers), Double (décimaux), String, Boolean, Date, Variant (à éviter), objets (Range, Worksheet). <strong>Conditions</strong> : If…ElseIf…Else…End If ; Select Case pour plusieurs valeurs.</p>
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
<p><strong>Boucles</strong> : For…Next (nombre connu), For Each (collection : chaque feuille, chaque cellule), Do While / Do Until (condition). <strong>Fonctions personnalisées</strong> :</p>
<div class="formula">Function ScoreRelance(montant As Double, jours As Long) As Double
    ScoreRelance = montant * (1 + jours / 30)
End Function
' Dans une cellule : =ScoreRelance(E2; F2)</div>
<div class="retenir"><span class="label">À retenir</span><p>For pour parcourir des lignes, Select Case pour classer, Function pour un calcul réutilisable dans les cellules.</p></div>

## Interaction, erreurs, événements, performance

<p><strong>Dialogue</strong> : MsgBox (message, choix Oui/Non), InputBox (saisie), UserForm (formulaire complet). <strong>Erreurs</strong> : sans traitement, une erreur arrête la macro ; on encadre les zones à risque.</p>
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
<p><strong>Événements</strong> : du code qui se déclenche tout seul. Dans ThisWorkbook : <code>Workbook_Open</code> (à l'ouverture) ; dans le module d'une feuille : <code>Worksheet_Change(ByVal Target As Range)</code> (à chaque modification — utile pour horodater une saisie de relance).</p>
<p><strong>Performance</strong> : désactiver ScreenUpdating et le calcul automatique pendant le traitement, lire une plage dans un tableau (Variant) plutôt que cellule par cellule, éviter Select/Activate.</p>
<div class="retenir"><span class="label">À retenir</span><p>On Error GoTo + Resume, ScreenUpdating False/True, événements Open et Change : ce qui distingue une macro « qui marche » d'une macro fiable.</p></div>

## Coder ou ne pas coder : formules modernes et Power Query

<p>Avant d'écrire une macro, vérifier si Excel sait déjà le faire :</p>
<dl>
  <dt>XLOOKUP / RECHERCHEX</dt><dd>remplace RECHERCHEV : =RECHERCHEX(clé ; plage_clés ; plage_résultats ; "non trouvé"). Pas de numéro de colonne, gestion de l'absence.</dd>
  <dt>FILTER / FILTRE, SORT / TRIER, UNIQUE</dt><dd>formules dynamiques : =TRIER(FILTRE(tBalance ; tBalance[Retard]&gt;90) ; 5 ; -1) donne la liste triée des créances > 90 jours, mise à jour automatiquement.</dd>
  <dt>SUMIFS / SOMME.SI.ENS, COUNTIFS</dt><dd>totaux par tranche d'ancienneté ou par agent, sans macro.</dd>
  <dt>LET, LAMBDA</dt><dd>nommer des étapes intermédiaires, créer ses fonctions sans VBA.</dd>
  <dt>Power Query</dt><dd>importer et transformer des données (fusion de fichiers mensuels, nettoyage, jointures) de façon rejouable en un clic : Données → Obtenir des données. Le bon outil pour consolider des exports de l'ERP.</dd>
</dl>
<p>Règle pratique : transformation de données → Power Query ; calcul et restitution → formules dynamiques et tableaux structurés ; actions répétitives (mise en forme, export, envoi, génération de rapport) → VBA.</p>
<div class="retenir"><span class="label">À retenir</span><p>Un VLOOKUP vers un fichier externe casse ; Power Query + tableau structuré + RECHERCHEX ne cassent pas. C'est la modernisation type d'un classeur de suivi.</p></div>

## Application : générer un TOP 15 automatiquement

<p>Objectif : à l'ouverture du classeur, trier la balance par score décroissant et copier les 15 premières lignes dans la feuille Synthèse, avec horodatage.</p>
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
<p>Variante sans VBA : dans Synthèse, <code>=PRENDRE(TRIER(tBalance ; 8 ; -1) ; 15)</code> donne le même TOP 15, recalculé en permanence.</p>
<div class="retenir"><span class="label">À retenir</span><p>Une macro utile = trouver la dernière ligne, trier, copier en valeurs, horodater. Sais la lire ligne par ligne, c'est un sujet d'examen classique.</p></div>

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

