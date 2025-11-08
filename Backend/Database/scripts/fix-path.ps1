# This script must be run as Administrator
Write-Host "PostgreSQL Path Fix Script" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Green

# Find psql.exe location
$psqlPath = (Get-Command psql -ErrorAction SilentlyContinue).Path
if ($psqlPath) {
    $pgBinPath = Split-Path -Parent $psqlPath
    Write-Host "Found PostgreSQL at: $pgBinPath" -ForegroundColor Green
    
    # Get current PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    
    # Check if path is already in PATH
    if ($currentPath -notlike "*$pgBinPath*") {
        # Add to PATH
        $newPath = "$currentPath;$pgBinPath"
        try {
            [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
            Write-Host "Successfully added PostgreSQL to PATH!" -ForegroundColor Green
        } catch {
            Write-Host "Error updating PATH. Try running as Administrator" -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "PostgreSQL is already in PATH" -ForegroundColor Yellow
    }

    # Test database connection
    Write-Host "`nTesting PostgreSQL connection..." -ForegroundColor Cyan
    try {
        $version = psql --version
        Write-Host "PostgreSQL is working! Version: $version" -ForegroundColor Green
        
        # Try to connect to postgres database
        Write-Host "`nTrying to connect to default database..." -ForegroundColor Cyan
        $result = psql -U postgres -c "\conninfo" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Successfully connected to PostgreSQL!" -ForegroundColor Green
        } else {
            Write-Host "Could not connect to PostgreSQL. You may need to:" -ForegroundColor Yellow
            Write-Host "1. Start the PostgreSQL service" -ForegroundColor White
            Write-Host "2. Check if the postgres user password is set" -ForegroundColor White
        }
    } catch {
        Write-Host "Error testing PostgreSQL: $_" -ForegroundColor Red
    }
} else {
    Write-Host "PostgreSQL is in PATH but psql.exe location could not be determined" -ForegroundColor Red

foreach ($pgPath in $pgPaths) {
    if (Test-Path "$pgPath\psql.exe") {
        Write-Host "Found PostgreSQL at: $pgPath" -ForegroundColor Green
        
        # Get current PATH
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        
        # Check if path is already in PATH
        if ($currentPath -notlike "*$pgPath*") {
            # Add to PATH
            $newPath = "$currentPath;$pgPath"
            [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
            Write-Host "Successfully added PostgreSQL to PATH!" -ForegroundColor Green
        } else {
            Write-Host "PostgreSQL is already in PATH" -ForegroundColor Yellow
        }
        
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host "PostgreSQL not found in common locations!" -ForegroundColor Red
    Write-Host "Would you like to download PostgreSQL? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "Y") {
        Start-Process "https://www.enterprisedb.com/downloads/postgres-postgresql-downloads"
    }
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Close all PowerShell/VS Code windows" -ForegroundColor White
Write-Host "2. Open a new terminal" -ForegroundColor White
Write-Host "3. Try 'psql --version' again" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")