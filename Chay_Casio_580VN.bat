@echo off
title CASIO fx-580VN X Pro Emulator
cd /d "%~dp0"

set "HTML_PATH=%~dp0index.html"

:: Kiem tra Microsoft Edge
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="file:///%HTML_PATH%" --window-size=960,880
    exit /b
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="file:///%HTML_PATH%" --window-size=960,880
    exit /b
)

:: Kiem tra Google Chrome
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="file:///%HTML_PATH%" --window-size=960,880
    exit /b
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="file:///%HTML_PATH%" --window-size=960,880
    exit /b
)

:: Mac dinh mo bang trinh duyet
start "" "%HTML_PATH%"
exit /b
