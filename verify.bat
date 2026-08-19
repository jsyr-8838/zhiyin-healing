@echo off
chcp 65001 >nul
title 知音疗愈 - 环境验证

echo ============================================
echo   知音疗愈 (ZhiYin) - 环境验证
echo ============================================
echo.

:: 检查Node.js
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js: %%i
) else (
    echo [X] Node.js 未安装
)

:: 检查npm
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm --version') do echo [OK] npm: %%i
) else (
    echo [X] npm 未安装
)

:: 检查pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('pnpm --version') do echo [OK] pnpm: %%i
) else (
    echo [!] pnpm 未安装（可选）
)

:: 检查项目文件
if exist "E:\zyly\package.json" (
    echo [OK] package.json 存在
) else (
    echo [X] package.json 缺失
)

if exist "E:\zyly\prisma\dev.db" (
    echo [OK] 数据库文件存在
) else (
    echo [X] 数据库文件缺失
)

if exist "E:\zyly\.env.local" (
    echo [OK] 环境变量配置存在
) else (
    echo [X] 环境变量配置缺失
)

echo.
echo ============================================
echo   验证完成！双击 start.bat 启动知音疗愈
echo ============================================
pause
