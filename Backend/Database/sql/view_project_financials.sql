-- Drop existing view if it exists
DROP VIEW IF EXISTS project_financials;

-- Create project financials view
CREATE VIEW project_financials AS
SELECT 
    p.project_id,
    p.name AS project_name,
    p.manager_id,
    u.name AS manager_name,
    p.status,
    p.budget,
    COALESCE(SUM(DISTINCT ci.amount), 0) as revenue_invoiced,
    p.revenue_total,
    COALESCE(SUM(DISTINCT vb.amount), 0) as costs_billed,
    COALESCE(SUM(DISTINCT e.amount), 0) as expenses_total,
    COALESCE(SUM(DISTINCT t.cost), 0) as labor_cost,
    p.cost_total,
    p.profit_total,
    p.progress,
    p.start_date,
    p.end_date
FROM 
    projects p
    LEFT JOIN users u ON p.manager_id = u.user_id
    LEFT JOIN customer_invoices ci ON p.project_id = ci.project_id
    LEFT JOIN vendor_bills vb ON p.project_id = vb.project_id
    LEFT JOIN expenses e ON p.project_id = e.project_id
    LEFT JOIN tasks ta ON p.project_id = ta.project_id
    LEFT JOIN timesheets t ON ta.task_id = t.task_id
GROUP BY 
    p.project_id,
    p.name,
    p.manager_id,
    u.name,
    p.status,
    p.budget,
    p.revenue_total,
    p.cost_total,
    p.profit_total,
    p.progress,
    p.start_date,
    p.end_date;