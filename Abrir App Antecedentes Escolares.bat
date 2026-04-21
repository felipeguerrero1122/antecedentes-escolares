@echo off
setlocal

set "ROOT=%~dp0"
cd /d "%ROOT%"

call :ensure_port 3001 "Backend API" "npm.cmd run dev:server"
call :ensure_port 5173 "Frontend Vite" "npm.cmd run dev:client -- --host 0.0.0.0"

echo.
echo Abriendo la app en el navegador...
start "" "http://localhost:5173/"
echo.
echo Acceso administrador:
echo   Email: admin@colegio.cl
echo   Contrasena: Admin123456
echo.
echo Si alguna ventana muestra un error, dejala abierta y revisa el mensaje.
exit /b 0

:ensure_port
set "PORT=%~1"
set "LABEL=%~2"
set "COMMAND=%~3"

netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul 2>&1
if %errorlevel%==0 (
  echo %LABEL% ya esta corriendo en el puerto %PORT%.
  exit /b 0
)

echo Iniciando %LABEL% en el puerto %PORT%...
start "%LABEL%" cmd /k "cd /d ""%ROOT%"" && %COMMAND%"
timeout /t 3 /nobreak >nul
exit /b 0
