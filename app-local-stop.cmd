@echo off
setlocal
for %%r in (6060 6061 6062 6063 6064 6065) do (
  for /f "tokens=5" %%p in ('netstat -ano ^| findstr :%%r ^| findstr LISTENING') do taskkill /PID %%p /F >nul 2>nul
)
call "%~dp0postgres-local-stop.cmd"
