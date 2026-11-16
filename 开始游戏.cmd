@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
if exist "%~dp0开始游戏.exe" (
  start "" "%~dp0开始游戏.exe"
  exit /b
)
set "COAST_NO_OPEN="
set "COAST_NODE=%~dp0runtime\node.exe"
if not exist "%COAST_NODE%" (
  echo 请先把完整压缩包“全部解压”，不要只运行压缩包中的一个文件。
  echo 请确认 runtime 和 dist 文件夹与本文件位于同一目录。
  pause
  exit /b 1
)
"%COAST_NODE%" "%~dp0server.mjs" --open
pause
