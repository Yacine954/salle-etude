@echo off
rem Fabrique l'application Windows (Electron) dans le dossier release\.
rem Double-clic sur ce fichier suffit ; compte quelques minutes. A la fin, le dossier
rem release\ s'ouvre : copie "Salle d'etude-win32-x64" sur le PC ou tu veux l'installer.
setlocal
cd /d "%~dp0"
title Salle d'etude - fabrication de l'application Windows

echo === Fabrication de l'application (quelques minutes) ===
call npm run package
if errorlevel 1 goto :erreur

echo.
echo ================================================================
echo   Application prete dans release\Salle d'etude-win32-x64\
echo   Lance "Salle d'etude.exe" pour la tester.
echo ================================================================
start "" "release"
echo.
timeout /t 60
exit /b 0

:erreur
echo.
echo ================================================================
echo   La fabrication a echoue. Copie ce qui est affiche ci-dessus
echo   et envoie-le a Claude.
echo ================================================================
pause
exit /b 1
