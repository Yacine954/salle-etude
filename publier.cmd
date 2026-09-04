@echo off
rem Publier la salle d'etude : reconstruit la page, enregistre et envoie sur GitHub.
rem Double-clic sur ce fichier suffit. La fenetre se ferme seule au bout d'une minute
rem (ou tout de suite avec une touche) ; en cas d'erreur, elle reste ouverte.
setlocal
cd /d "%~dp0"
title Salle d'etude - publication

echo === 1/3 Construction de la page ===
call npm run build
if errorlevel 1 goto :erreur

echo.
echo === 2/3 Enregistrement ===
git add -A
git diff --cached --quiet && (
  echo Rien de nouveau a publier : le site est deja a jour.
  goto :fin
)
git commit -m "Mise a jour du %date% a %time:~0,5%"
if errorlevel 1 goto :erreur

echo.
echo === 3/3 Envoi sur GitHub ===
git push
if errorlevel 1 goto :erreur

echo.
echo ================================================================
echo   Publie ! Le site en ligne se met a jour dans une a deux minutes.
echo ================================================================

:fin
echo.
timeout /t 60
exit /b 0

:erreur
echo.
echo ================================================================
echo   Quelque chose a echoue. Copie ce qui est affiche ci-dessus
echo   et envoie-le a Claude.
echo ================================================================
pause
exit /b 1
