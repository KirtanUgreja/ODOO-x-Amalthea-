@echo off
echo PostgreSQL Database Setup
echo -----------------------

set PGPASSWORD=postgres
echo Using default password for postgres user...

echo.
echo Creating database user...
psql -U postgres -c "CREATE ROLE oneflow_user WITH LOGIN PASSWORD 'oneflow_pass' CREATEDB;"

echo.
echo Creating database...
psql -U postgres -c "CREATE DATABASE oneflow_dev OWNER oneflow_user;"

echo.
echo Setting up schema...
psql -U oneflow_user -d oneflow_dev -f ..\sql\create_tables.sql

echo.
echo Loading sample data...
psql -U oneflow_user -d oneflow_dev -f ..\sql\seed_data.sql

echo.
echo Done! To verify installation, run:
echo psql -U oneflow_user -d oneflow_dev -c "\dt"
pause