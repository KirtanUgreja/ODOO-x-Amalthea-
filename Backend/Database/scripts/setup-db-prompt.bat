@echo off
echo OneFlow Database Setup with Password
echo ---------------------------------

:: Set PostgreSQL path
set "PGBIN=C:\Program Files\PostgreSQL\18\bin"
set "PATH=%PGBIN%;%PATH%"

:: Prompt for postgres password
set /p PGPASS="Enter postgres user password: "
set PGPASSWORD=%PGPASS%

:: Drop and recreate user and database
echo.
echo Recreating user and database...
psql -U postgres -c "DROP DATABASE IF EXISTS oneflow_dev;"
psql -U postgres -c "DROP USER IF EXISTS oneflow_user;"
psql -U postgres -c "CREATE USER oneflow_user WITH PASSWORD 'oneflow_pass' CREATEDB;"
psql -U postgres -c "CREATE DATABASE oneflow_dev OWNER oneflow_user;"

:: Switch to oneflow_user
set PGPASSWORD=oneflow_pass

:: Run SQL files in order
echo.
echo Creating database schema...
psql -U oneflow_user -d oneflow_dev -f ..\sql\create_tables.sql

echo.
echo Loading sample data...
psql -U oneflow_user -d oneflow_dev -f ..\sql\seed_data.sql

echo.
echo Verifying tables...
psql -U oneflow_user -d oneflow_dev -c "\dt"

echo.
echo Testing a query...
psql -U oneflow_user -d oneflow_dev -c "SELECT * FROM users;"

echo.
echo ✅ OneFlow Database setup completed!
echo.
echo Connection info:
psql -U oneflow_user -d oneflow_dev -c "\conninfo"
pause