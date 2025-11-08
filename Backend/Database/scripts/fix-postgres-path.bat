@echo off
echo PostgreSQL PATH Fix Script
echo ------------------------

:: Common PostgreSQL installation paths
set "PGPATHS=C:\Program Files\PostgreSQL\16\bin;C:\Program Files\PostgreSQL\15\bin;C:\Program Files\PostgreSQL\14\bin;C:\Program Files\PostgreSQL\13\bin"

:: Check each possible PostgreSQL path
for %%p in ("%PGPATHS:;=";"%") do (
    if exist %%~p\psql.exe (
        echo Found PostgreSQL at: %%~p
        
        :: Add to both current session and permanent PATH
        set "PATH=%%~p;%PATH%"
        
        :: Use setx to make PATH change permanent
        setx PATH "%PATH%" /M
        
        echo Successfully added PostgreSQL to PATH!
        echo Please close this terminal and open a new one.
        
        pause
        exit /b 0
    )
)

:: If we get here, PostgreSQL was not found
echo ERROR: PostgreSQL not found in common locations.
echo Checking if PostgreSQL is installed elsewhere...

:: Search entire Program Files for psql.exe
for /f "delims=" %%i in ('dir /s /b "C:\Program Files\psql.exe" 2^>nul') do (
    set "PGPATH=%%~dpi"
    echo Found PostgreSQL at: !PGPATH!
    
    :: Add to PATH
    setx PATH "%PATH%;!PGPATH!" /M
    set "PATH=!PGPATH!;%PATH%"
    
    echo Successfully added PostgreSQL to PATH!
    echo Please close this terminal and open a new one.
    
    pause
    exit /b 0
)

echo.
echo PostgreSQL not found! Please ensure it is installed.
echo.
echo Would you like to download and install PostgreSQL now? (Y/N)
choice /C YN /M "Download PostgreSQL"
if errorlevel 2 goto END
if errorlevel 1 goto DOWNLOAD

:DOWNLOAD
echo Opening PostgreSQL download page...
start https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
echo.
echo After installing:
echo 1. Make sure to check "Add to PATH" during installation
echo 2. Run this script again
echo 3. Open a new terminal and try 'psql --version'

:END
pause