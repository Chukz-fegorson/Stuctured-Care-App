@echo off
setlocal
cd /d "%~dp0"
if not exist ".local\logs" mkdir ".local\logs"
set "JAVA_HOME=C:\Users\chuks.omedo\Desktop\JAVA PROJECTS\oracleJdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "STRUCTURE_HEALTH_DB_URL=jdbc:postgresql://localhost:5432/strutured_care"
set "STRUCTURE_HEALTH_DB_USERNAME=strutured_care"
set "STRUCTURE_HEALTH_DB_PASSWORD=strutured_care"
"%JAVA_HOME%\bin\java.exe" -jar "backend\target\backend-0.1.0-SNAPSHOT.jar" >> ".local\logs\backend.out.log" 2>> ".local\logs\backend.err.log"
