@echo off
TITLE ForgeSight AI - Production Launch Control
CLS

echo ====================================================================
echo                   ForgeSight AI Launcher
echo     AMD-Powered Predictive Maintenance & Industrial Intelligence
echo ====================================================================
echo.

SET PROJECT_ROOT=%~dp0
CD /D "%PROJECT_ROOT%"
SET BACKEND_PORT=8001

REM Check Python Virtual Environment
IF EXIST "%PROJECT_ROOT%venv\Scripts\activate.bat" (
    SET VENV_PATH=%PROJECT_ROOT%venv\Scripts\activate.bat
) ELSE IF EXIST "%PROJECT_ROOT%backend\venv\Scripts\activate.bat" (
    SET VENV_PATH=%PROJECT_ROOT%backend\venv\Scripts\activate.bat
) ELSE (
    echo [INFO] Virtual environment not found. Creating venv in root...
    python -m venv venv
    IF ERRORLEVEL 1 (
        echo [ERROR] Failed to create Python virtual environment. Ensure Python is installed and in PATH.
        pause
        exit /b 1
    )
    SET VENV_PATH=%PROJECT_ROOT%venv\Scripts\activate.bat
    echo [INFO] Installing backend dependencies...
    call "%VENV_PATH%"
    pip install -r backend\requirements.txt
)

REM Check Frontend dependencies
IF NOT EXIST "%PROJECT_ROOT%frontend\node_modules" (
    echo [INFO] Frontend node_modules missing. Installing npm packages...
    CD /D "%PROJECT_ROOT%frontend"
    call npm install
    CD /D "%PROJECT_ROOT%"
)

echo [1/2] Starting Backend Server (FastAPI on http://localhost:%BACKEND_PORT%)...
start "ForgeSight AI - Backend (Port %BACKEND_PORT%)" cmd /k "cd /d "%PROJECT_ROOT%backend" && call "%VENV_PATH%" && uvicorn app.main:app --reload --port %BACKEND_PORT%"

echo [2/2] Starting Frontend Web App (Next.js on http://localhost:3000)...
start "ForgeSight AI - Frontend (Port 3000)" cmd /k "cd /d "%PROJECT_ROOT%frontend" && npm run dev"

echo.
echo ====================================================================
echo  ForgeSight AI is starting up!
echo.
echo  - Backend API:  http://localhost:%BACKEND_PORT%  (Docs: http://localhost:%BACKEND_PORT%/docs)
echo  - Frontend UI:   http://localhost:3000
echo.
echo  Waiting 5 seconds before launching browser...
echo ====================================================================

timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo Launch sequence complete. Keep the backend and frontend terminal windows open.
echo Press any key to exit this launcher window...
pause >nul
