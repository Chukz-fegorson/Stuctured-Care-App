@echo off
setlocal
cd /d "%~dp0"
set "PSQL_EXE=C:\Program Files\PostgreSQL\17\bin\psql.exe"
if not exist "%PSQL_EXE%" set "PSQL_EXE=psql"
set "PGHOST=%STRUCTURE_HEALTH_DB_HOST%"
if not defined PGHOST set "PGHOST=localhost"
set "PGPORT=%STRUCTURE_HEALTH_DB_PORT%"
if not defined PGPORT set "PGPORT=5432"
set "PGDATABASE=%STRUCTURE_HEALTH_DB_NAME%"
if not defined PGDATABASE set "PGDATABASE=strutured_care"
set "PGUSER=%STRUCTURE_HEALTH_DB_USERNAME%"
if not defined PGUSER set "PGUSER=strutured_care"
set "PGPASSWORD=%STRUCTURE_HEALTH_DB_PASSWORD%"
if not defined PGPASSWORD set "PGPASSWORD=strutured_care"

echo Resetting demo dataset on %PGHOST%:%PGPORT%/%PGDATABASE%
"%PSQL_EXE%" -v ON_ERROR_STOP=1 -h "%PGHOST%" -p "%PGPORT%" -U "%PGUSER%" -d "%PGDATABASE%" -f "%~dp0database\demo-reset.sql"
if errorlevel 1 exit /b %errorlevel%
"%PSQL_EXE%" -v ON_ERROR_STOP=1 -h "%PGHOST%" -p "%PGPORT%" -U "%PGUSER%" -d "%PGDATABASE%" -f "%~dp0database\demo-seed.sql"
if errorlevel 1 exit /b %errorlevel%
echo Demo dataset restored.
