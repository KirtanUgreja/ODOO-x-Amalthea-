# Test script to verify database connectivity
Write-Host "OneFlow Database Connection Test" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

# 1. Test basic connection
Write-Host "1. Testing Basic Connection" -ForegroundColor Green
Write-Host "-----------------------"
$env:PGPASSWORD = "oneflow_pass"
$result = psql -U oneflow_user -d oneflow_dev -c "\conninfo"
Write-Host $result

# 2. Test sample queries
Write-Host "`n2. Running Sample Queries" -ForegroundColor Green
Write-Host "---------------------"

# Projects query
Write-Host "`nActive Projects:" -ForegroundColor Yellow
psql -U oneflow_user -d oneflow_dev -c "
SELECT name, status, budget, revenue_total, cost_total, profit_total 
FROM projects 
WHERE status = 'in_progress';"

# Tasks query
Write-Host "`nPending Tasks:" -ForegroundColor Yellow
psql -U oneflow_user -d oneflow_dev -c "
SELECT t.name, t.status, t.priority, u.name as assignee
FROM tasks t
JOIN users u ON t.assignee_id = u.user_id
WHERE t.status != 'done'
ORDER BY t.priority DESC;"

# Financial summary
Write-Host "`nFinancial Summary:" -ForegroundColor Yellow
psql -U oneflow_user -d oneflow_dev -c "
SELECT 
    p.name as project,
    COUNT(t.task_id) as total_tasks,
    SUM(t.logged_hours) as total_hours,
    p.budget,
    p.revenue_total,
    p.cost_total,
    p.profit_total
FROM projects p
LEFT JOIN tasks t ON p.project_id = t.project_id
GROUP BY p.project_id, p.name, p.budget, p.revenue_total, p.cost_total, p.profit_total;"

Write-Host "`n3. Connection Information for Applications" -ForegroundColor Green
Write-Host "------------------------------------"
Write-Host "Connection String: postgresql://oneflow_user:oneflow_pass@localhost:5432/oneflow_dev"
Write-Host "Host: localhost"
Write-Host "Port: 5432"
Write-Host "Database: oneflow_dev"
Write-Host "User: oneflow_user"
Write-Host "Password: oneflow_pass"

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Launch pgAdmin 4 to explore the database visually" -ForegroundColor White
Write-Host "2. Use the connection details in your backend application" -ForegroundColor White
Write-Host "3. Check CONNECT.md for detailed integration examples" -ForegroundColor White

pause