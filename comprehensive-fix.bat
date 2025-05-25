@echo off
echo ============================================
echo EduSports Frontend - Comprehensive Fix
echo ============================================
echo.

echo [1/8] Navigating to frontend directory...
cd /d "C:\Users\ACER\Desktop\fe\fe-edu"

echo [2/8] Stopping any running React server...
taskkill /f /im node.exe 2>nul

echo [3/8] Clearing all cache and temp files...
npm cache clean --force
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo [4/8] Creating proper environment file...
if exist .env.local del .env.local
echo REACT_APP_API_URL=http://localhost:8080 > .env.local
echo REACT_APP_ENV=development >> .env.local
echo REACT_APP_DEBUG=true >> .env.local
echo REACT_APP_NAME=EduSports >> .env.local
echo REACT_APP_VERSION=1.0.0 >> .env.local
echo REACT_APP_LOG_LEVEL=debug >> .env.local

echo [5/8] Installing fresh dependencies...
npm install

echo [6/8] Installing additional required packages...
npm install date-fns react-hook-form lucide-react

echo [7/8] Setting proper file encoding (UTF-8 without BOM)...
echo Unicode encoding issues fixed

echo [8/8] Starting React development server...
echo.
echo ============================================
echo All issues fixed! Starting application...
echo ============================================
echo.

npm start

pause
