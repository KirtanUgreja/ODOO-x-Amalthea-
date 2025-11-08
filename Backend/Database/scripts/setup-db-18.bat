@echo off
echo OneFlow Database Setup Script
echo ----------------------------

:: Set PostgreSQL path
set "PGBIN=C:\Program Files\PostgreSQL\18\bin"
set "PATH=%PGBIN%;%PATH%"

:: Create database and user
echo Creating database role and database...
echo.
echo Please enter the postgres user password when prompted.
echo.

psql -U postgres -c "CREATE ROLE oneflow_user WITH LOGIN PASSWORD 'oneflow_pass' CREATEDB;"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create user. If it already exists, this is fine.
)

psql -U postgres -c "CREATE DATABASE oneflow_dev OWNER oneflow_user;"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create database. If it already exists, this is fine.
)

:: Run SQL files in order
echo.
echo Creating database schema...
psql -U oneflow_user -d oneflow_dev -f sql/create_tables.sql

echo.
echo Loading sample data...
psql -U oneflow_user -d oneflow_dev -f sql/seed_data.sql

echo.
echo ✅ OneFlow Database setup completed!
echo.
echo To verify installation, run:
echo psql -U oneflow_user -d oneflow_dev -c "\dt"
echo psql -U oneflow_user -d oneflow_dev -c "SELECT * FROM project_financials;"
pause