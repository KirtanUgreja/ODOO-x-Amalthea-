@echo off
setlocal enabledelayedexpansion

echo OneFlow Database Setup Script
echo ----------------------------

:: Try to find PostgreSQL installation directory
set "PGHOME="
for /d %%i in ("C:\Program Files\PostgreSQL\*") do (
    if exist "%%i\bin\psql.exe" (
        set "PGHOME=%%i"
    )
)

if not defined PGHOME (
    for /d %%i in ("C:\Program Files (x86)\PostgreSQL\*") do (
        if exist "%%i\bin\psql.exe" (
            set "PGHOME=%%i"
        )
    )
)

:: If PostgreSQL is found, add it to PATH for this session
if defined PGHOME (
    echo Found PostgreSQL at: %PGHOME%
    set "PATH=%PGHOME%\bin;%PATH%"
) else (
    echo ERROR: PostgreSQL installation not found!
    echo Please ensure PostgreSQL is installed in C:\Program Files\PostgreSQL
    echo or C:\Program Files (x86)\PostgreSQL
    exit /b 1
)

:: Verify psql is now accessible
echo Testing PostgreSQL connection...
psql --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL is installed but psql command failed
    echo Installation path: %PGHOME%
    echo Please verify your installation
    exit /b 1
)

:: Create role and database
echo Creating database role and database...
psql -U postgres -c "CREATE ROLE oneflow_user WITH LOGIN PASSWORD 'oneflow_pass' CREATEDB;" >nul 2>nul
psql -U postgres -c "CREATE DATABASE oneflow_dev OWNER oneflow_user;" >nul 2>nul

:: Run SQL files in order
echo Creating database schema...
psql -U oneflow_user -d oneflow_dev -f sql/create_tables.sql

echo Loading sample data...
psql -U oneflow_user -d oneflow_dev -f sql/seed_data.sql

echo ✅ OneFlow Database created successfully!
echo.
echo To verify installation, run:
echo psql -U oneflow_user -d oneflow_dev -c "\dt"
echo psql -U oneflow_user -d oneflow_dev -c "SELECT * FROM project_financials;"