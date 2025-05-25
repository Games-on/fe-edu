@echo off
echo ================================================
echo           SUA LOI SAU KHI DON DEP
echo ================================================
echo.

cd /d "C:\Users\ACER\Desktop\fe\fe-edu"

echo [1/2] Xoa file backup khong can thiet...
if exist "src\components\admin\TournamentManagement.js.backup" (
    del "src\components\admin\TournamentManagement.js.backup"
    echo ✓ Xoa TournamentManagement.js.backup
)

echo.
echo [2/2] Kiem tra cac file da duoc tao lai...
if exist "src\components\debug\TournamentAPITester.js" (
    echo ✓ TournamentAPITester.js - OK
) else (
    echo ❌ TournamentAPITester.js - MISSING
)

if exist "src\components\tournament\TournamentDebugPanel.js" (
    echo ✓ TournamentDebugPanel.js - OK
) else (
    echo ❌ TournamentDebugPanel.js - MISSING
)

if exist "src\components\tournament\TournamentCreateForm.js" (
    echo ✓ TournamentCreateForm.js (ban chinh) - OK
) else (
    echo ❌ TournamentCreateForm.js - MISSING
)

echo.
echo ================================================
echo                  KIEM TRA
echo ================================================
echo.
echo Thu chay lai du an:
echo   npm start
echo.
echo Neu van co loi, hay kiem tra:
echo 1. Console cua browser co loi import nao khac khong
echo 2. Kiem tra cac file component co ton tai khong
echo 3. Chay "npm install" neu can thiet
echo.
pause
