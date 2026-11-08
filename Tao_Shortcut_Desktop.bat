@echo off
title Tao Shortcut Casio fx-580VN X
cd /d "%~dp0"

echo Dang tao shortcut ra man hinh Desktop...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create_shortcut.ps1"

echo.
echo ==========================================================
echo  HOAN TAT!
echo  Ban co the click dup vao icon tren Desktop de mo may tinh.
echo ==========================================================
pause
