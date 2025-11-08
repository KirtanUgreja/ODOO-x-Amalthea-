@echo off
setlocal enabledelayedexpansion

echo PostgreSQL Installation Verification
echo ----------------------------------

:: Check for PostgreSQL in Program Files
echo Checking installation directories...
set "FOUND=0"
for /d %%i in ("C:\Program Files\PostgreSQL\*") do (
    if exist "%%i\bin\psql.exe" (
        echo Found PostgreSQL in: %%i
        set "PGPATH=%%i"
        set "FOUND=1"
    )
)

if "%FOUND%"=="0" (
    echo No PostgreSQL installation found in C:\Program Files\PostgreSQL
    echo Please follow the installation steps in README.md
    exit /b 1
)

:: Check PATH environment variable
echo.
echo Checking system PATH...
echo Current PATH entries:
for %%i in ("%PATH:;=" "%") do (
    echo %%~i
)

:: Try running psql
echo.
echo Testing psql command...
where psql
if %ERRORLEVEL% NEQ 0 (
    echo psql not found in PATH
    echo Please follow the PATH fix instructions in README.md
    exit /b 1
)

:: Display version info
echo.
echo PostgreSQL version information:
"%PGPATH%\bin\psql.exe" --version

echo.
echo All checks completed. If you see any errors above,
echo please follow the troubleshooting steps in README.md