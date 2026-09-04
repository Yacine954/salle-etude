# Cree les raccourcis de l'application Windows (Bureau et menu Demarrer).
# Appele par installer-application.cmd avec le chemin de "Salle d'etude.exe".
param([Parameter(Mandatory = $true)][string]$Exe)

$nom = "Salle d'etude"
$shell = New-Object -ComObject WScript.Shell
$cibles = @(
  (Join-Path ([Environment]::GetFolderPath("Desktop")) "$nom.lnk"),
  (Join-Path ([Environment]::GetFolderPath("Programs")) "$nom.lnk")
)
foreach ($lnk in $cibles) {
  $s = $shell.CreateShortcut($lnk)
  $s.TargetPath = $Exe
  $s.WorkingDirectory = Split-Path $Exe
  $s.IconLocation = "$Exe,0"
  $s.Description = "La Salle d'Etude - M2 Finance d'entreprise"
  $s.Save()
  Write-Host "  raccourci : $lnk"
}
