@echo off
setlocal
cd /d "%~dp0"
call "%~dp0postgres-local-start.cmd"
start "StructureHealthIdentity" /min cmd.exe /c "%~dp0identity-local.cmd"
start "StructureHealthPatient" /min cmd.exe /c "%~dp0patient-local.cmd"
start "StructureHealthCare" /min cmd.exe /c "%~dp0care-local.cmd"
start "StructureHealthBilling" /min cmd.exe /c "%~dp0billing-local.cmd"
start "StructureHealthReporting" /min cmd.exe /c "%~dp0reporting-local.cmd"
start "StructureHealthGateway" /min cmd.exe /c "%~dp0backend-local.cmd"
