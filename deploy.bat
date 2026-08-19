@echo off
title ZhiYin - Production Deployment
cd /d E:\zyly

set "NODE_DIR=C:\Users\admin\.local\share\TeleAgent\runtimes\node"
set "PATH=%NODE_DIR%;%PATH%"

echo ============================================
echo   ZhiYin (知音) - Production Deployment
echo ============================================
echo.

:: Check mode
if /i "%1"=="docker" goto :docker
if /i "%1"=="local" goto :local
if /i "%1"=="" goto :choose

:choose
echo Select deployment mode:
echo   1. Docker (recommended - best security)
echo   2. Local (standalone server)
echo.
set /p choice="Enter choice (1 or 2): "
if "%choice%"=="1" goto :docker
if "%choice%"=="2" goto :local
goto :choose

:docker
echo.
echo [Docker Deployment]
echo Building Docker image (multi-stage, source code excluded)...
echo.
docker compose build
if errorlevel 1 (
    echo [ERROR] Docker build failed. Is Docker installed and running?
    echo Download: https://docs.docker.com/get-docker
    pause
    exit /b 1
)
echo.
echo Starting container...
docker compose up -d
echo.
echo Waiting for server...
timeout /t 8 /nobreak >nul
curl -s http://localhost:3456 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo   [OK] Server running at http://localhost:3456
    echo ============================================
    echo.
    echo Commands:
    echo   View logs:   docker compose logs -f
    echo   Stop:        docker compose down
    echo   Restart:     docker compose restart
) else (
    echo [WARN] Server may still be starting. Check: docker compose logs
)
pause
exit /b 0

:local
echo.
echo [Local Standalone Deployment]
echo Installing dependencies if needed...
if not exist node_modules (
    where pnpm >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        call pnpm install --registry https://registry.npmmirror.com
    ) else (
        call npm install --registry https://registry.npmmirror.com --legacy-peer-deps
    )
)

echo.
echo Building standalone production bundle...
echo This may take 3-5 minutes...
echo.
call npx next build --webpack
if errorlevel 1 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)

echo.
echo Initializing database...
node scripts\init-db.js

echo.
echo ============================================
echo   [OK] Build complete!
echo ============================================
echo.
echo To start the production server:
echo   set NODE_ENV=production
echo   node .next\standalone\server.js
echo.
echo URL: http://localhost:3456
pause
exit /b 0
