@echo off
chcp 65001 >nul
title Didi's Heart Island - Local Server
cd /d "%~dp0"
echo Starting local server at http://localhost:8000
echo The browser will open automatically. Close this window to stop the server.
start "" http://localhost:8000
python -m http.server 8000
pause
