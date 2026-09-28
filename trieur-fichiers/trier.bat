@echo off
rem Double-cliquez sur ce fichier pour ranger Telechargements et Bureau.
chcp 65001 >nul
set PYTHONUTF8=1
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
    py -3 trieur.py %*
    goto fin
)
where python >nul 2>nul
if %errorlevel%==0 (
    python trieur.py %*
    goto fin
)
echo.
echo Python n'est pas installe sur cet ordinateur.
echo Installez-le gratuitement depuis https://www.python.org/downloads/
echo (cochez "Add python.exe to PATH" pendant l'installation), puis relancez.

:fin
echo.
pause
