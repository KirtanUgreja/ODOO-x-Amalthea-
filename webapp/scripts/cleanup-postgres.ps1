$ErrorActionPreference = "Stop"

# Self-elevate the script if required
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
    Write-Host "Requesting administrative privileges..." -ForegroundColor Yellow
    $CommandLine = "-File `"" + $MyInvocation.MyCommand.Path + "`""
    Start-Process -FilePath PowerShell.exe -ArgumentList $CommandLine -Verb RunAs
    exit
}

Write-Host "PostgreSQL Cleanup Script" -ForegroundColor Green
Write-Host "----------------------" -ForegroundColor Green

try {
    # Stop PostgreSQL service
    Write-Host "1. Stopping PostgreSQL services..." -ForegroundColor Yellow
    Get-Service postgresql* | Stop-Service -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 5

    # Backup data directory if it exists
    $pgData = "C:\Program Files\PostgreSQL\18\data"
    if (Test-Path $pgData) {
        Write-Host "2. Backing up data directory..." -ForegroundColor Yellow
        $backupPath = "C:\PostgreSQL_Backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item $pgData $backupPath -Recurse -Force
        Write-Host "   Data backed up to: $backupPath" -ForegroundColor Green
    }

    # Remove PostgreSQL services
    Write-Host "3. Removing PostgreSQL services..." -ForegroundColor Yellow
    Get-WmiObject Win32_Service | Where-Object {$_.Name -like 'postgresql*'} | ForEach-Object {
        Write-Host "   Removing service: $($_.Name)"
        $_.Delete()
    }

    # Clean up PostgreSQL directories
    Write-Host "4. Cleaning up PostgreSQL directories..." -ForegroundColor Yellow
    $dirsToClean = @(
        "C:\Program Files\PostgreSQL",
        "$env:USERPROFILE\AppData\Roaming\postgresql",
        "$env:PROGRAMDATA\PostgreSQL"
    )

    foreach ($dir in $dirsToClean) {
        if (Test-Path $dir) {
            Write-Host "   Removing: $dir"
            Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Host "`nCleanup completed successfully!" -ForegroundColor Green
    Write-Host "Please download and install PostgreSQL 14 from:"
    Write-Host "https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" -ForegroundColor Cyan
    Write-Host "`nDuring installation:"
    Write-Host "1. Select port: 5432"
    Write-Host "2. Set password: 1234"
    Write-Host "3. Keep default locale"
    Write-Host "4. Install all components"

} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
} finally {
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}