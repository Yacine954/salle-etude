@echo off
rem Installe (ou met a jour) l'application Windows sur CE PC, a partir du dossier release\.
rem Double-clic suffit. Si release\ n'existe pas encore, lance d'abord fabriquer-application.cmd.
rem L'application est copiee dans %LOCALAPPDATA%\Programs\Salle d'etude, avec un raccourci
rem sur le Bureau et dans le menu Demarrer, puis elle est lancee.
setlocal
cd /d "%~dp0"
title Salle d'etude - installation sur ce PC

set "SRC=%~dp0release\Salle d'etude-win32-x64"
set "DEST=%LOCALAPPDATA%\Programs\Salle d'etude"

if not exist "%SRC%\Salle d'etude.exe" (
  echo Le dossier release\ est vide : lance d'abord fabriquer-application.cmd.
  goto :erreur
)

echo === 1/3 Fermeture de l'application si elle est ouverte ===
taskkill /f /im "Salle d'etude.exe" >nul 2>&1

echo === 2/3 Copie dans %DEST% ===
robocopy "%SRC%" "%DEST%" /MIR /NFL /NDL /NJH /NJS /NP
if errorlevel 8 goto :erreur

echo === 3/3 Raccourcis (Bureau, menu Demarrer) et lancement ===
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\raccourcis.ps1" "%DEST%\Salle d'etude.exe"
if errorlevel 1 goto :erreur
start "" "%DEST%\Salle d'etude.exe"

echo.
echo ================================================================
echo   Installee ! Pour l'epingler a la barre des taches :
echo   clic droit sur son icone dans la barre des taches,
echo   puis "Epingler a la barre des taches".
echo ================================================================
echo.
timeout /t 60
exit /b 0

:erreur
echo.
echo ================================================================
echo   L'installation a echoue. Copie ce qui est affiche ci-dessus
echo   et envoie-le a Claude.
echo ================================================================
pause
exit /b 1
