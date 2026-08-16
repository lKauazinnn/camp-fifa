@echo off
chcp 65001 >nul
title Enviar alteracoes para o GitHub
cd /d "%~dp0"

echo.
echo  ============================================
echo    ENVIAR ALTERACOES PARA O GITHUB
echo  ============================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo  [ERRO] Git nao encontrado. Instale em https://git-scm.com
    pause
    exit /b 1
)

git status --short
echo.

set "MSG="
set /p MSG=  Descreva o que mudou (enter para "Atualiza o site"):
if "%MSG%"=="" set "MSG=Atualiza o site"

git add -A
git commit -m "%MSG%"
if errorlevel 1 (
    echo.
    echo  Nada novo para enviar.
    pause
    exit /b 0
)

git push
if errorlevel 1 (
    echo.
    echo  [ERRO] Falha ao enviar. Verifique sua conexao e o login do GitHub.
    pause
    exit /b 1
)

echo.
echo  Enviado! A Vercel publica a nova versao automaticamente.
pause
