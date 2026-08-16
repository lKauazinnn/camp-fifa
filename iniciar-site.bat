@echo off
chcp 65001 >nul
title Campeonato FIFA - Unidos Acamp
cd /d "%~dp0"

echo.
echo  ============================================
echo    CAMPEONATO FIFA - UNIDOS ACAMP
echo  ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo  [ERRO] Node.js nao encontrado neste computador.
    echo  Instale em https://nodejs.org e rode este arquivo de novo.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo  Primeira execucao: instalando as dependencias...
    echo  Isso leva 1 ou 2 minutos, so acontece uma vez.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [ERRO] Falha ao instalar as dependencias.
        pause
        exit /b 1
    )
)

echo.
echo  Iniciando o site em http://localhost:5173
echo  O navegador abre sozinho em alguns segundos.
echo.
echo  DEIXE ESTA JANELA ABERTA enquanto estiver usando.
echo  Para parar: pressione Ctrl+C ou feche esta janela.
echo.

call npm run dev

echo.
echo  O site foi encerrado.
pause
