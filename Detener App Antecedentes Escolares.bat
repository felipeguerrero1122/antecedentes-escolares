@echo off
setlocal

call :kill_port 3001
call :kill_port 5173

echo.
echo Si habia procesos escuchando en 3001 o 5173, ya fueron cerrados.
exit /b 0

:kill_port
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%~1 .*LISTENING"') do (
  taskkill /PID %%P /F >nul 2>&1
)
exit /b 0
