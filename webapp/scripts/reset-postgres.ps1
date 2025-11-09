$ErrorActionPreference = "Stop"

# Self-elevate the script if required
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
    Write-Host "Requesting administrative privileges..." -ForegroundColor Yellow
    $CommandLine = "-File `"" + $MyInvocation.MyCommand.Path + "`""
    Start-Process -FilePath PowerShell.exe -ArgumentList $CommandLine -Verb RunAs
    exit
}

Write-Host "PostgreSQL Reset Script" -ForegroundColor Green
Write-Host "----------------------" -ForegroundColor Green

try {
    $pgBin = "C:\Program Files\PostgreSQL\18\bin"
    $pgData = "C:\Program Files\PostgreSQL\18\data"
    $pgPass = "$env:USERPROFILE\AppData\Roaming\postgresql\pgpass.conf"

    Write-Host "1. Creating .postgresql directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\AppData\Roaming\postgresql" | Out-Null

    Write-Host "2. Creating pgpass file..." -ForegroundColor Yellow
    "*:5432:*:postgres:1234" | Set-Content $pgPass -Force
    
    # Set strict permissions on pgpass file
    $acl = Get-Acl $pgPass
    $acl.SetAccessRuleProtection($true, $false)
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME, "FullControl", "Allow")
    $acl.AddAccessRule($rule)
    Set-Acl $pgPass $acl

    Write-Host "3. Stopping PostgreSQL service..." -ForegroundColor Yellow
    Stop-Service postgresql-x64-18 -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 5

    Write-Host "4. Setting minimal pg_hba.conf..." -ForegroundColor Yellow
    $hbaContent = @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
"@
    $hbaContent | Set-Content "$pgData\pg_hba.conf" -Force

    Write-Host "5. Starting PostgreSQL service..." -ForegroundColor Yellow
    Start-Service postgresql-x64-18
    Start-Sleep -Seconds 5

    Write-Host "6. Setting new password..." -ForegroundColor Yellow
    & "$pgBin\psql.exe" -U postgres -h localhost -d postgres -c "ALTER USER postgres WITH PASSWORD '1234';" 2>&1

    Write-Host "7. Updating pg_hba.conf to md5..." -ForegroundColor Yellow
    $hbaContent = @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
"@
    $hbaContent | Set-Content "$pgData\pg_hba.conf" -Force

    Write-Host "8. Restarting PostgreSQL service..." -ForegroundColor Yellow
    Restart-Service postgresql-x64-18
    Start-Sleep -Seconds 5

    Write-Host "9. Testing connection..." -ForegroundColor Yellow
    $testResult = & "$pgBin\psql.exe" -U postgres -h localhost -d postgres -c "\l" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nPostgreSQL reset successful!" -ForegroundColor Green
        Write-Host "You can now connect with:"
        Write-Host "Username: postgres"
        Write-Host "Password: 1234"
        Write-Host "Host: localhost"
        Write-Host "Port: 5432"
    } else {
        throw "Failed to connect to PostgreSQL after reset. Error: $testResult"
    }

} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
} finally {
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}