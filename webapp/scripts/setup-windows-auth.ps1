$ErrorActionPreference = "Stop"

# Self-elevate the script if required
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
    Write-Host "Requesting administrative privileges..." -ForegroundColor Yellow
    $CommandLine = "-File `"" + $MyInvocation.MyCommand.Path + "`""
    Start-Process -FilePath PowerShell.exe -ArgumentList $CommandLine -Verb RunAs
    exit
}

Write-Host "PostgreSQL Windows Auth Setup" -ForegroundColor Green
Write-Host "--------------------------" -ForegroundColor Green

try {
    $pgData = "C:\Program Files\PostgreSQL\18\data"
    
    Write-Host "1. Updating pg_hba.conf..." -ForegroundColor Yellow
    $hbaContent = @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             ugrej                                   trust
host    all             ugrej           127.0.0.1/32            trust
host    all             ugrej           ::1/128                 trust
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
"@
    $hbaContent | Set-Content "$pgData\pg_hba.conf" -Force

    Write-Host "2. Creating PostgreSQL user..." -ForegroundColor Yellow
    $env:PGPASSWORD = "1234"
    & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -c "CREATE USER ugrej SUPERUSER;" -c "ALTER USER ugrej WITH SUPERUSER;" 2>&1

    Write-Host "3. Restarting PostgreSQL..." -ForegroundColor Yellow
    Restart-Service postgresql-x64-18
    Start-Sleep -Seconds 5

    Write-Host "Setup completed!" -ForegroundColor Green

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
} finally {
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}