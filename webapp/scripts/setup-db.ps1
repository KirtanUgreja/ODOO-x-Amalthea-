$env:PGPASSWORD = "1234"
$pgPath = "C:\Program Files\PostgreSQL\18\bin"
$dbName = "project_management_system"

Write-Host "Dropping database if exists..."
& "$pgPath\dropdb.exe" -U postgres -h localhost $dbName -w --if-exists

Write-Host "Creating database..."
& "$pgPath\createdb.exe" -U postgres -h localhost $dbName -w

Write-Host "Running SQL files..."
$sqlFiles = @(
    "schema.sql",
    "indexes.sql",
    "triggers.sql",
    "views.sql",
    "functions.sql",
    "seed_data.sql"
)

foreach ($file in $sqlFiles) {
    $sqlPath = Join-Path "..\database" $file
    if (Test-Path $sqlPath) {
        Write-Host "Executing $file..."
        Get-Content $sqlPath | & "$pgPath\psql.exe" -U postgres -d $dbName -w
    } else {
        Write-Host "Warning: $file not found"
    }
}

Write-Host "Database setup complete!"