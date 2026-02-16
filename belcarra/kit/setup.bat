@echo ON
SET "PATH=%~dp0;%PATH%"
ECHO "ENABLE DEBUGGING ON CONSOLE"

cd "%~dp0\drivers"
pnputil.exe /add-driver *.inf /install

pause

