@echo off
chcp 65001 >nul
title 知音疗愈 - 自动升级同步
echo ============================================
echo   知音疗愈 (ZhiYin) - 自动升级同步工具
echo ============================================
echo.
echo 源目录: E:\TeleClaw的工作空间\heytcm-pro
echo 目标目录: F:\zyly
echo.
echo 正在同步代码和数据（排除node_modules/.next/.temp）...
echo.

robocopy "E:\TeleClaw的工作空间\heytcm-pro" "F:\zyly" /E /XD node_modules .next .temp /XF *.log /NFL /NDL /MT:8

echo.
if %ERRORLEVEL% LEQ 7 (
    echo [成功] 同步完成！
    echo.
    echo 退出码: %ERRORLEVEL%
    echo   0 = 无变化
    echo   1 = 文件已复制
    echo   2 = 额外文件已删除
    echo   4 = 不匹配文件已跳过
    echo   8 = 失败（如文件被占用）
    echo.
) else (
    echo [警告] 同步可能有问题，退出码: %ERRORLEVEL%
)

echo ============================================
echo   同步完成！可运行 start.bat 启动知音疗愈
echo ============================================
pause
