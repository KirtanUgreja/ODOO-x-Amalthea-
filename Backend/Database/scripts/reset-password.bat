@echo off
echo Resetting OneFlow User Password
echo -----------------------------

:: Set PostgreSQL path
set "PGBIN=C:\Program Files\PostgreSQL\18\bin"
set "PATH=%PGBIN%;%PATH%"

:: Reset oneflow_user password
echo.
echo Please enter the postgres user password when prompted.
echo.

psql -U postgres -c "ALTER USER oneflow_user WITH PASSWORD 'oneflow_pass';"

echo.
echo Password reset completed! Try these commands to verify:
echo psql -U oneflow_user -d oneflow_dev -c "\conninfo"
echo.
echo If successful, run setup-db-18.bat again
pause