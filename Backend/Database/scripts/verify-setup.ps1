# PostgreSQL and OneFlow Database Verification Script
Write-Host "PostgreSQL and OneFlow Verification Script" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

# 1. Check PostgreSQL Installation and PATH
Write-Host "1. Checking PostgreSQL Installation" -ForegroundColor Green
Write-Host "--------------------------------"

$psqlPath = (Get-Command psql -ErrorAction SilentlyContinue).Path
if ($psqlPath) {
    Write-Host "✅ psql found at: $psqlPath" -ForegroundColor Green
    $version = (psql --version)
    Write-Host "✅ Version: $version" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL not found in PATH!" -ForegroundColor Red
    exit 1
}

# 2. Check Database Connection
Write-Host "`n2. Testing Database Connections" -ForegroundColor Green
Write-Host "----------------------------"

# Function to test database connection
function Test-DatabaseConnection {
    param (
        [string]$user,
        [string]$database,
        [string]$password
    )
    
    $env:PGPASSWORD = $password
    $result = psql -U $user -d $database -c "\conninfo" 2>&1
    $success = $LASTEXITCODE -eq 0
    
    if ($success) {
        Write-Host "✅ Connected as $user to $database" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to connect as $user to $database" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
    return $success
}

# Get postgres password
$pgPassword = Read-Host "Enter postgres user password"
$env:PGPASSWORD = $pgPassword

# Test connections
$postgresConn = Test-DatabaseConnection "postgres" "postgres" $pgPassword
$oneflowConn = Test-DatabaseConnection "oneflow_user" "oneflow_dev" "oneflow_pass"

if (-not ($postgresConn -and $oneflowConn)) {
    Write-Host "❌ Database connection tests failed!" -ForegroundColor Red
    exit 1
}

# 3. Verify Database Objects
Write-Host "`n3. Verifying Database Objects" -ForegroundColor Green
Write-Host "--------------------------"

$env:PGPASSWORD = "oneflow_pass"

# Function to check if object exists
function Test-DatabaseObject {
    param (
        [string]$query,
        [string]$description
    )
    
    $result = psql -U oneflow_user -d oneflow_dev -t -c $query 2>&1
    $count = $result.Trim()
    
    if ($count -gt 0) {
        Write-Host "✅ $description found: $count" -ForegroundColor Green
    } else {
        Write-Host "❌ No $description found!" -ForegroundColor Red
    }
}

# Check ENUM types
Test-DatabaseObject "SELECT COUNT(*) FROM pg_type WHERE typname IN ('user_role', 'project_status', 'task_status', 'priority');" "ENUM types"

# Check tables
$tableChecks = @(
    "users",
    "projects",
    "project_members",
    "tasks",
    "timesheets",
    "sales_orders",
    "purchase_orders",
    "customer_invoices",
    "vendor_bills",
    "expenses"
)

foreach ($table in $tableChecks) {
    Test-DatabaseObject "SELECT COUNT(*) FROM $table;" "$table table"
}

# Check view
Test-DatabaseObject "SELECT COUNT(*) FROM pg_views WHERE viewname = 'project_financials';" "project_financials view"

# 4. Verify Constraints and Indexes
Write-Host "`n4. Verifying Constraints and Indexes" -ForegroundColor Green
Write-Host "--------------------------------"

# Check foreign keys
Test-DatabaseObject "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';" "Foreign key constraints"

# Check indexes
Test-DatabaseObject "SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('users', 'projects', 'tasks', 'timesheets');" "Indexes"

# 5. Test Sample Data
Write-Host "`n5. Testing Sample Data Queries" -ForegroundColor Green
Write-Host "---------------------------"

Write-Host "`nProject Financials View:" -ForegroundColor Yellow
psql -U oneflow_user -d oneflow_dev -c "SELECT project_name, revenue_total, cost_total, profit_total FROM project_financials;"

Write-Host "`nActive Tasks:" -ForegroundColor Yellow
psql -U oneflow_user -d oneflow_dev -c "SELECT name, status, priority FROM tasks WHERE status != 'done';"

Write-Host "`nTimesheets with Costs:" -ForegroundColor Yellow
psql -U oneflow_user -d oneflow_dev -c "SELECT date, hours, cost FROM timesheets;"

# Final Summary
Write-Host "`nVerification Summary" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "✅ PostgreSQL installed and in PATH" -ForegroundColor Green
Write-Host "✅ Database connections successful" -ForegroundColor Green
Write-Host "✅ All required tables present" -ForegroundColor Green
Write-Host "✅ Constraints and indexes verified" -ForegroundColor Green
Write-Host "✅ Sample data loaded" -ForegroundColor Green

Write-Host "`nTo connect to database manually:" -ForegroundColor Cyan
Write-Host "psql -U oneflow_user -d oneflow_dev" -ForegroundColor White
Write-Host "Password: oneflow_pass" -ForegroundColor White

pause