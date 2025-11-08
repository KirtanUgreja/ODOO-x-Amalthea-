@echo off
echo Setting PostgreSQL Path
echo ---------------------

:: Try to find PostgreSQL 18 installation
set "PG_PATH=C:\Program Files\PostgreSQL\18\bin"

if exist "%PG_PATH%\psql.exe" (
    :: Add to PATH for current session
    set "PATH=%PG_PATH%;%PATH%"
    
    :: Add to system PATH permanently
    setx PATH "%PATH%" /M
    
    echo PostgreSQL path set to: %PG_PATH%
    echo Please close this terminal and open a new one
) else (
    echo Could not find PostgreSQL 18 installation.
    echo Please provide the correct path to your PostgreSQL bin directory.
)

pause