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
    $pgBin = "C:\Program Files\PostgreSQL\18\bin"
    $pgData = "C:\Program Files\PostgreSQL\18\data"
    
    Write-Host "1. Getting PostgreSQL service status..." -ForegroundColor Yellow
    $service = Get-Service postgresql-x64-18 -ErrorAction SilentlyContinue
    
    if ($service) {
        Write-Host "2. Stopping PostgreSQL service..." -ForegroundColor Yellow
        Stop-Service postgresql-x64-18 -Force
        Start-Sleep -Seconds 5
    }

    Write-Host "3. Updating pg_hba.conf..." -ForegroundColor Yellow
    $hbaPath = Join-Path $pgData "pg_hba.conf"
    $newHbaContent = @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
# Local socket connections:
local   all             all                                     trust
"@

    $newHbaContent | Set-Content $hbaPath -Force

    if ($service) {
        Write-Host "4. Starting PostgreSQL service..." -ForegroundColor Yellow
        Start-Service postgresql-x64-18
        Start-Sleep -Seconds 5
    } else {
        Write-Host "4. Starting PostgreSQL server directly..." -ForegroundColor Yellow
        $env:PGDATA = $pgData
        Start-Process -FilePath "$pgBin\pg_ctl.exe" -ArgumentList "start -D `"$pgData`"" -NoNewWindow -Wait
        Start-Sleep -Seconds 5
    }

    Write-Host "5. Setting up PostgreSQL password..." -ForegroundColor Yellow
    $env:PGPASSWORD = ""
    $env:PGHOST = "localhost"
    & "$pgBin\psql.exe" -U postgres -d postgres -h localhost -c "ALTER USER postgres WITH PASSWORD '1234';"

    Write-Host "6. Updating pg_hba.conf to md5..." -ForegroundColor Yellow
    $mdHbaContent = @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
host    all             all             ::1/128                 md5
# Local socket connections:
local   all             all                                     md5
"@

    $mdHbaContent | Set-Content $hbaPath -Force

    if ($service) {
        Write-Host "7. Restarting PostgreSQL service..." -ForegroundColor Yellow
        Restart-Service postgresql-x64-18
        Start-Sleep -Seconds 5
    } else {
        Write-Host "7. Restarting PostgreSQL server directly..." -ForegroundColor Yellow
        & "$pgBin\pg_ctl.exe" restart -D "$pgData"
        Start-Sleep -Seconds 5
    }

    Write-Host "8. Testing connection..." -ForegroundColor Yellow
    $env:PGPASSWORD = "1234"
    & "$pgBin\psql.exe" -U postgres -d postgres -h localhost -c "\l"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Setup completed successfully!" -ForegroundColor Green
    } else {
        throw "Failed to connect to PostgreSQL after setup"
    }

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
} finally {
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}