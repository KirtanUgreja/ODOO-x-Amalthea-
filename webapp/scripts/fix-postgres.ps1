$ErrorActionPreference = "Stop"

# Self-elevate the script if required
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
    Write-Host "Requesting administrative privileges..." -ForegroundColor Yellow
    $CommandLine = "-File `"" + $MyInvocation.MyCommand.Path + "`""
    Start-Process -FilePath PowerShell.exe -ArgumentList $CommandLine -Verb RunAs
    exit
}

Write-Host "PostgreSQL Database Setup Script" -ForegroundColor Green
Write-Host "--------------------------------" -ForegroundColor Green

try {
    Write-Host "1. Stopping PostgreSQL service..." -ForegroundColor Yellow
    Stop-Service postgresql-x64-18 -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 5

    Write-Host "2. Starting PostgreSQL service..." -ForegroundColor Yellow
    Start-Service postgresql-x64-18
    Start-Sleep -Seconds 5

    Write-Host "3. Setting up PostgreSQL password..." -ForegroundColor Yellow
    $env:PGPASSWORD = "1234"
    $pgBin = "C:\Program Files\PostgreSQL\18\bin"
    
    & "$pgBin\psql.exe" -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD '1234';"
    
    Write-Host "4. Updating pg_hba.conf..." -ForegroundColor Yellow
    $hbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
    $hbaContent = Get-Content $hbaPath
    $hbaContent = $hbaContent -replace "scram-sha-256", "md5"
    $hbaContent | Set-Content $hbaPath

    Write-Host "5. Restarting PostgreSQL service..." -ForegroundColor Yellow
    Restart-Service postgresql-x64-18
    Start-Sleep -Seconds 5

    Write-Host "Setup completed successfully!" -ForegroundColor Green
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}