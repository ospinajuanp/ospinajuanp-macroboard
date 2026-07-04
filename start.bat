@echo off
echo.
echo ========================================
echo    ospinajuanp-macroboard
echo ========================================
echo.
git pull
echo.
echo Building...
pnpm build
echo.
echo Starting server...
echo.
node packages/server/dist/index.js
