@echo off
setlocal
cd /d "%~dp0webapp"
if not exist "..\.local\logs" mkdir "..\.local\logs"
call "C:\Program Files\nodejs\npm.cmd" run dev -- --host 127.0.0.1 --strictPort >> "..\.local\logs\webapp.out.log" 2>> "..\.local\logs\webapp.err.log"
