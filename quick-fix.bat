@echo off
echo ============================================
echo EduSports Frontend Quick Fix Script
echo ============================================
echo.

echo [1/5] Navigating to frontend directory...
cd /d "C:\Users\ACER\Desktop\fe\fe-edu"

echo [2/5] Installing missing dependencies...
npm install date-fns react-hook-form

echo [3/5] Creating environment file...
if not exist .env.local (
    echo REACT_APP_API_URL=http://localhost:8080 > .env.local
    echo REACT_APP_ENV=development >> .env.local
    echo REACT_APP_DEBUG=true >> .env.local
    echo Environment file created successfully!
) else (
    echo Environment file already exists.
)

echo [4/5] Clearing npm cache...
npm start -- --reset-cache

echo [5/5] Setup complete!
echo.
echo ============================================
echo Frontend should now start without errors
echo Open http://localhost:3000 in your browser
echo ============================================
pause
