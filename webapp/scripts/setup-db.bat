@echo off
set PGPASSWORD=1234
set PGBIN="C:\Program Files\PostgreSQL\18\bin"

echo Dropping existing database...
%PGBIN%\dropdb.exe -U postgres -h localhost project_management_system

echo Creating new database...
%PGBIN%\createdb.exe -U postgres -h localhost project_management_system

echo Running SQL files...
for %%f in (schema.sql indexes.sql triggers.sql views.sql functions.sql seed_data.sql) do (
    echo Executing %%f...
    %PGBIN%\psql.exe -U postgres -d project_management_system -f "..\database\%%f"
)

echo Database setup complete!