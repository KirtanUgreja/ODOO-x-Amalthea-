$ErrorActionPreference = "Stop"

# Self-elevate the script if required
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
    Write-Host "Requesting administrative privileges..." -ForegroundColor Yellow
    $CommandLine = "-File `"" + $MyInvocation.MyCommand.Path + "`""
    Start-Process -FilePath PowerShell.exe -ArgumentList $CommandLine -Verb RunAs
    exit
}

Write-Host "PostgreSQL Local Setup" -ForegroundColor Green
Write-Host "-------------------" -ForegroundColor Green

try {
    $pgBin = "C:\Program Files\PostgreSQL\18\bin"
    $pgData = Join-Path $PSScriptRoot "pgdata"
    $dbPath = Join-Path (Split-Path $PSScriptRoot -Parent) "database"
    
    Write-Host "1. Cleaning up existing data directory..." -ForegroundColor Yellow
    if (Test-Path $pgData) {
        Remove-Item -Path $pgData -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $pgData | Out-Null
    
    Write-Host "2. Initializing new database cluster..." -ForegroundColor Yellow
    $env:PGDATA = $pgData
    "1234" | Set-Content "$pgData\pwfile" -NoNewline
    & "$pgBin\initdb.exe" -D $pgData -U postgres --pwfile="$pgData\pwfile" -E UTF8 --locale=C -A trust
    Remove-Item "$pgData\pwfile" -Force
    
    # Update postgresql.conf to use different port
    Write-Host "3. Configuring PostgreSQL..." -ForegroundColor Yellow
    $confPath = Join-Path $pgData "postgresql.conf"
    $conf = Get-Content $confPath
    $conf = $conf -replace '#port = 5432', 'port = 5433'  # Use port 5433 instead of 5432
    $conf | Set-Content $confPath -Force

    # Update pg_hba.conf for trust authentication
    $hbaPath = Join-Path $pgData "pg_hba.conf"
    @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
"@ | Set-Content $hbaPath -Force

    Write-Host "4. Starting PostgreSQL server..." -ForegroundColor Yellow
    $logFile = Join-Path $pgData "logfile.log"
    & "$pgBin\pg_ctl.exe" -D $pgData -l $logFile start
    Start-Sleep -Seconds 5

    Write-Host "5. Creating database..." -ForegroundColor Yellow
    & "$pgBin\createdb.exe" -U postgres -p 5433 project_management_system

    Write-Host "6. Running schema setup..." -ForegroundColor Yellow
    if (Test-Path "$dbPath\schema.sql") {
        Get-Content "$dbPath\schema.sql" | & "$pgBin\psql.exe" -U postgres -p 5433 -d project_management_system
        
        # Execute other SQL files if they exist
        $sqlFiles = @("indexes.sql", "triggers.sql", "views.sql", "functions.sql")
        foreach ($file in $sqlFiles) {
            $sqlPath = Join-Path $dbPath $file
            if (Test-Path $sqlPath) {
                Write-Host "   Executing $file..." -ForegroundColor Yellow
                Get-Content $sqlPath | & "$pgBin\psql.exe" -U postgres -p 5433 -d project_management_system
            }
        }
    } else {
        Write-Host "Warning: schema.sql not found at $dbPath\schema.sql" -ForegroundColor Yellow
    }
    
    Write-Host "`nSetup completed successfully!" -ForegroundColor Green
    Write-Host "Database is running with:"
    Write-Host "Port: 5432"
    Write-Host "Username: postgres"
    Write-Host "Password: 1234"
    Write-Host "Database: project_management_system"
    
} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
} finally {
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}