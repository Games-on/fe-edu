@echo off
echo ==========================================
echo EduSports Frontend - Unicode Fix Script
echo ==========================================
echo.

echo [1/6] Navigating to frontend directory...
cd /d "C:\Users\ACER\Desktop\fe\fe-edu"

echo [2/6] Stopping any running React server...
taskkill /f /im node.exe 2>nul

echo [3/6] Clearing npm cache...
npm cache clean --force

echo [4/6] Removing node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo [5/6] Installing fresh dependencies...
npm install

echo [6/6] Creating environment file...
if not exist .env.local (
    echo REACT_APP_API_URL=http://localhost:8080 > .env.local
    echo REACT_APP_ENV=development >> .env.local
    echo REACT_APP_DEBUG=true >> .env.local
    echo Environment file created!
) else (
    echo Environment file already exists.
)

echo.
echo ==========================================
echo Unicode issues fixed! Starting React...
echo ==========================================
echo.

npm start

pause
