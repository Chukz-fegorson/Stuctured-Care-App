@echo off
setlocal
cd /d "%~dp0"
call "C:\Program Files\nodejs\npm.cmd" --prefix webapp install
call "C:\Program Files\nodejs\npm.cmd" --prefix webapp run build
set "JAVA_HOME=C:\Users\chuks.omedo\Desktop\JAVA PROJECTS\oracleJdk-21"
set "PATH=%JAVA_HOME%\bin;%PATH%"
mvn -DskipTests package
