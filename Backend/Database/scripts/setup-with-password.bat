@echo off
echo OneFlow Database Setup with Password
echo ---------------------------------

:: Set PostgreSQL path and password
set "PGBIN=C:\Program Files\PostgreSQL\18\bin"
set "PATH=%PGBIN%;%PATH%"
set PGPASSWORD=postgres

:: Drop and recreate user and database
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
echo Testing connection...
psql -U oneflow_user -d oneflow_dev -c "\conninfo"

echo.
echo ✅ OneFlow Database setup completed!
echo.
echo To verify tables, run:
echo psql -U oneflow_user -d oneflow_dev -c "\dt"
pause