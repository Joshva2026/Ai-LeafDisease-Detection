@echo off
setlocal

set "ROOT=%~dp0"
set "API_DIR=%ROOT%LeafDiseaseAPI"
set "APP_DIR=%ROOT%LeafDiseaseApp"
set "PYTHON=%API_DIR%\venv\Scripts\python.exe"

if not exist "%PYTHON%" (
    echo ERROR: Virtual-environment Python was not found:
    echo %PYTHON%
    pause
    exit /b 1
)

if not exist "%APP_DIR%\node_modules" (
    echo ERROR: Frontend dependencies are missing. Run npm.cmd install in LeafDiseaseApp first.
    pause
    exit /b 1
)

echo Starting Leaf Disease API at http://127.0.0.1:5000 ...
netstat -ano | findstr /r /c:":5000 .*LISTENING" >nul
if errorlevel 1 (
    start "Leaf Disease API" /D "%API_DIR%" cmd /k "\"%PYTHON%\" app.py"
) else (
    echo API is already running.
)

echo Starting Leaf Disease App on local network...
netstat -ano | findstr /r /c:":5173 .*LISTENING" >nul
if errorlevel 1 (
    start "Leaf Disease Frontend" /D "%APP_DIR%" cmd /k "call npm.cmd run dev -- --host 0.0.0.0"
) else (
    echo Frontend is already running.
)

echo Waiting for the frontend to start...
timeout /t 5 /nobreak >nul
start "" "http://127.0.0.1:5173/"

echo.
echo The application has been opened in your browser.
echo Keep the two server windows open while using it.
endlocal
