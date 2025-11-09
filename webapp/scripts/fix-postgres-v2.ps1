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

    Write-Host "2. Updating pg_hba.conf to trust mode..." -ForegroundColor Yellow
    $hbaPath = "C:\Program Files\PostgreSQL\18\data\pg_hba.conf"
    $hbaContent = Get-Content $hbaPath
    
    # First backup the original file
    Copy-Item $hbaPath "$hbaPath.backup"
    
    # Replace authentication methods with 'trust' temporarily
    $hbaContent = $hbaContent -replace "scram-sha-256", "trust"
    $hbaContent = $hbaContent -replace "md5", "trust"
    $hbaContent | Set-Content $hbaPath

    Write-Host "3. Starting PostgreSQL service..." -ForegroundColor Yellow
    Start-Service postgresql-x64-18
    Start-Sleep -Seconds 5

    Write-Host "4. Setting up PostgreSQL password..." -ForegroundColor Yellow
    & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD '1234';"

    Write-Host "5. Updating pg_hba.conf to md5 mode..." -ForegroundColor Yellow
    $hbaContent = Get-Content $hbaPath
    $hbaContent = $hbaContent -replace "trust", "md5"
    $hbaContent | Set-Content $hbaPath

    Write-Host "6. Restarting PostgreSQL service..." -ForegroundColor Yellow
    Restart-Service postgresql-x64-18
    Start-Sleep -Seconds 5

    # Test the connection with the new password
    Write-Host "7. Testing connection..." -ForegroundColor Yellow
    $env:PGPASSWORD = "1234"
    $testResult = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -c "\l"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Setup completed successfully!" -ForegroundColor Green
    } else {
        throw "Failed to connect to PostgreSQL after setup"
    }

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    
    # Try to restore the backup if it exists
    if (Test-Path "$hbaPath.backup") {
        Write-Host "Restoring pg_hba.conf backup..." -ForegroundColor Yellow
        Copy-Item "$hbaPath.backup" $hbaPath
        Restart-Service postgresql-x64-18
    }
} finally {
    # Clean up backup file
    if (Test-Path "$hbaPath.backup") {
        Remove-Item "$hbaPath.backup"
    }
    
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}