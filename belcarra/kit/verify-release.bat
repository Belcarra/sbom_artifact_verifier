@echo off
setlocal EnableExtensions EnableDelayedExpansion

:: 1. Validate the sbom catalog file if signtool is available in the PATH
::    and the catalog file exists. The catalog file is the manifest JSON
::    name with ".cat" appended (e.g., manifest.spdx.json.cat).

set "MANIFEST_DIR=_manifest\spdx_2.2"
set "CAT_FILE="

:: Find the manifest JSON and derive the .cat path (take the first match)
for %%F in ("%MANIFEST_DIR%\*.spdx.json") do (
    set "CAT_FILE=%MANIFEST_DIR%\%%~nxF.cat"
    goto :haveCat
)
:haveCat

if not defined CAT_FILE (
    echo No manifest JSON found in %MANIFEST_DIR%. Skipping signature verification.
) else if not exist "%CAT_FILE%" (
    echo Catalog file not found: "%CAT_FILE%". Skipping signature verification.
) else (
    set "SIGNTOOL_EXE=signtool"
    where /q "!SIGNTOOL_EXE!"
    if errorlevel 1 (
        echo !SIGNTOOL_EXE! not found in PATH. Skipping signature verification.
    ) else (
        echo !SIGNTOOL_EXE! found in PATH. Verifying catalog signature...
        echo Catalog: "%CAT_FILE%"
        "!SIGNTOOL_EXE!" verify /pa /v "%CAT_FILE%"
        if errorlevel 1 (
            echo FAILURE: Catalog signature verification failed.
        ) else (
            echo SUCCESS: Catalog signature is valid.
        )
    )
)



:: 2. Run SBOM manifest validation
:: We use -m _manifest because the tool appends \spdx_2.2\ automatically.
:: We use ../report.json to satisfy the tool's path requirements.
::
:: one of Verbose, Debug, Information, Warning, Error, Fatal
set VERBOSE=Warning
set TOOL_EXE=sbom-tool-win-x64
where %TOOL_EXE% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo %TOOL_EXE% not found in PATH. Please ensure it is installed and added to PATH.
    exit /b 1
)
echo %TOOL_EXE% found in PATH. 

%TOOL_EXE% validate -b . -m _manifest -o ../report.json -mi SPDX:2.2 -V %VERBOSE%

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo   SUCCESS: All driver files match the manifest.
    echo   SUCCESS: Manifest validation completed.
    echo ============================================================
) else (
    echo.
    echo ############################################################
    echo   FAILURE: Verification failed! 
    echo   Check report.json for details on mismatched or missing files.
    echo ############################################################
)

pause
