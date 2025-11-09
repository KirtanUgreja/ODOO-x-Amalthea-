-- Useful views for common queries and reporting (optimized using LATERAL correlated subqueries)

-- User details with roles and departments
CREATE OR REPLACE VIEW user_details AS
SELECT
    u.id,
    u.email,
    u.name,
    u.phone,
    u.address,
    u.hourly_rate,
    u.status,
    u.created_at,
    COALESCE(r.roles, ARRAY[]::text[]) AS roles,
    COALESCE(d.departments, ARRAY[]::text[]) AS departments
FROM users u
LEFT JOIN LATERAL (
    SELECT ARRAY_REMOVE(ARRAY_AGG(DISTINCT r.name), NULL) AS roles
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = u.id
) r ON true
LEFT JOIN LATERAL (
    SELECT ARRAY_REMOVE(ARRAY_AGG(DISTINCT d.name), NULL) AS departments
    FROM user_departments ud
    JOIN departments d ON ud.department_id = d.id
    WHERE ud.user_id = u.id
) d ON true;

-- Project summary with team and financial info (use lateral aggregates per project)
CREATE OR REPLACE VIEW project_summary AS
SELECT
    p.id,
    p.name,
    p.description,
    p.status,
    p.start_date,
    p.end_date,
    p.budget,
    p.archived,
    u.name AS manager_name,
    c.name AS customer_name,
    COALESCE(team.team_size, 0) AS team_size,
    COALESCE(task_stats.total_tasks, 0) AS total_tasks,
    COALESCE(task_stats.completed_tasks, 0) AS completed_tasks,
    COALESCE(times.total_hours_logged, 0) AS total_hours_logged,
    COALESCE(times.billable_amount, 0) AS billable_amount,
    COALESCE(exp.total_expenses, 0) AS total_expenses
FROM projects p
LEFT JOIN users u ON p.manager_id = u.id
LEFT JOIN customers c ON p.customer_id = c.id
LEFT JOIN LATERAL (
    SELECT COUNT(DISTINCT ptm.user_id) AS team_size
    FROM project_team_members ptm
    WHERE ptm.project_id = p.id
) team ON true
LEFT JOIN LATERAL (
    SELECT COUNT(*) AS total_tasks,
                 COUNT(*) FILTER (WHERE t.status = 'completed') AS completed_tasks
    FROM tasks t
    WHERE t.project_id = p.id
) task_stats ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ts.hours), 0) AS total_hours_logged,
                 COALESCE(SUM(CASE WHEN ts.billable THEN ts.hours * u2.hourly_rate ELSE 0 END), 0) AS billable_amount
    FROM timesheets ts
    LEFT JOIN users u2 ON ts.user_id = u2.id
    WHERE ts.project_id = p.id
) times ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(e.amount), 0) AS total_expenses
    FROM expenses e
    WHERE e.project_id = p.id AND e.status = 'approved'
) exp ON true;

-- Task details with assignees
CREATE OR REPLACE VIEW task_details AS
SELECT
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.estimated_hours,
    t.actual_hours,
    t.created_at,
    p.name AS project_name,
    tl.name AS task_list_name,
    COALESCE(a.assignees, ARRAY[]::text[]) AS assignees,
    COALESCE(c.comment_count, 0) AS comment_count
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
LEFT JOIN task_lists tl ON t.task_list_id = tl.id
LEFT JOIN LATERAL (
    SELECT ARRAY_REMOVE(ARRAY_AGG(DISTINCT u.name), NULL) AS assignees
    FROM task_assignees ta
    JOIN users u ON ta.user_id = u.id
    WHERE ta.task_id = t.id
) a ON true
LEFT JOIN LATERAL (
    SELECT COUNT(*) AS comment_count
    FROM task_comments tc
    WHERE tc.task_id = t.id
) c ON true;

-- Timesheet summary by user and project (grouped monthly). Keep grouping but avoid extra joins in main query
CREATE OR REPLACE VIEW timesheet_summary AS
SELECT
    ts.user_id,
    u.name AS user_name,
    ts.project_id,
    p.name AS project_name,
    DATE_TRUNC('month', ts.date) AS month,
    SUM(ts.hours) AS total_hours,
    SUM(CASE WHEN ts.billable THEN ts.hours ELSE 0 END) AS billable_hours,
    SUM(CASE WHEN ts.billable THEN ts.hours * u.hourly_rate ELSE 0 END) AS billable_amount,
    ts.approval_status
FROM timesheets ts
JOIN users u ON ts.user_id = u.id
JOIN projects p ON ts.project_id = p.id
GROUP BY ts.user_id, u.name, ts.project_id, p.name, DATE_TRUNC('month', ts.date), ts.approval_status;

-- Financial overview by project (use lateral aggregates to avoid multi-join grouping)
CREATE OR REPLACE VIEW project_financials AS
SELECT
    p.id AS project_id,
    p.name AS project_name,
    p.budget,
    COALESCE(so.total_sales_orders, 0) AS total_sales_orders,
    COALESCE(po.total_purchase_orders, 0) AS total_purchase_orders,
    COALESCE(inv.total_invoiced, 0) AS total_invoiced,
    COALESCE(inv.total_paid, 0) AS total_paid,
    COALESCE(vb.total_vendor_bills, 0) AS total_vendor_bills,
    COALESCE(exp.total_expenses, 0) AS total_expenses,
    (p.budget - COALESCE(po.total_purchase_orders, 0) - COALESCE(exp.total_expenses, 0)) AS remaining_budget
FROM projects p
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(so.amount), 0) AS total_sales_orders
    FROM sales_orders so
    WHERE so.project_id = p.id AND so.status != 'cancelled'
) so ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(po.amount), 0) AS total_purchase_orders
    FROM purchase_orders po
    WHERE po.project_id = p.id AND po.status != 'cancelled'
) po ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(i.amount), 0) AS total_invoiced,
                 COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) AS total_paid
    FROM invoices i
    WHERE i.project_id = p.id AND i.status != 'cancelled'
) inv ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(vb.amount), 0) AS total_vendor_bills
    FROM vendor_bills vb
    WHERE vb.project_id = p.id AND vb.status != 'disputed'
) vb ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(e.amount), 0) AS total_expenses
    FROM expenses e
    WHERE e.project_id = p.id AND e.status = 'approved'
) exp ON true;

-- Overdue items dashboard (split into independent queries to avoid large joins)
CREATE OR REPLACE VIEW overdue_items AS
SELECT
    'task' AS item_type,
    t.id,
    t.title AS description,
    t.due_date,
    p.name AS project_name,
    COALESCE(a.assignees, ARRAY[]::text[]) AS assignees
FROM tasks t
JOIN projects p ON t.project_id = p.id
LEFT JOIN LATERAL (
    SELECT ARRAY_REMOVE(ARRAY_AGG(DISTINCT u.name), NULL) AS assignees
    FROM task_assignees ta
    JOIN users u ON ta.user_id = u.id
    WHERE ta.task_id = t.id
) a ON true
WHERE t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled')

UNION ALL

SELECT
    'invoice' AS item_type,
    i.id,
    COALESCE(i.description, '') AS description,
    i.due_date,
    p.name AS project_name,
    ARRAY[c.name] AS assignees
FROM invoices i
LEFT JOIN projects p ON i.project_id = p.id
JOIN customers c ON i.customer_id = c.id
WHERE i.due_date < CURRENT_DATE AND i.status NOT IN ('paid', 'cancelled')

UNION ALL

SELECT
    'vendor_bill' AS item_type,
    vb.id,
    COALESCE(vb.description, '') AS description,
    vb.due_date,
    p.name AS project_name,
    ARRAY[v.name] AS assignees
FROM vendor_bills vb
LEFT JOIN projects p ON vb.project_id = p.id
JOIN vendors v ON vb.vendor_id = v.id
WHERE vb.due_date < CURRENT_DATE AND vb.status NOT IN ('paid', 'disputed');

-- User workload view (use lateral counts to reduce join multiplicity)
CREATE OR REPLACE VIEW user_workload AS
SELECT
    u.id AS user_id,
    u.name AS user_name,
    COALESCE(active.active_tasks, 0) AS active_tasks,
    COALESCE(active.urgent_tasks, 0) AS urgent_tasks,
    COALESCE(active.tasks_due_soon, 0) AS tasks_due_soon,
    COALESCE(rem.estimated_remaining_hours, 0) AS estimated_remaining_hours,
    COALESCE(proj.active_projects, 0) AS active_projects
FROM users u
LEFT JOIN LATERAL (
    SELECT
        COUNT(DISTINCT ta.task_id) FILTER (WHERE t.status NOT IN ('completed', 'cancelled')) AS active_tasks,
        COUNT(DISTINCT ta.task_id) FILTER (WHERE t.priority = 'urgent' AND t.status NOT IN ('completed', 'cancelled')) AS urgent_tasks,
        COUNT(DISTINCT ta.task_id) FILTER (WHERE t.due_date < CURRENT_DATE + INTERVAL '7 days' AND t.status NOT IN ('completed', 'cancelled')) AS tasks_due_soon
    FROM task_assignees ta
    LEFT JOIN tasks t ON ta.task_id = t.id
    WHERE ta.user_id = u.id
) active ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(t.estimated_hours - t.actual_hours), 0) AS estimated_remaining_hours
    FROM task_assignees ta
    JOIN tasks t ON ta.task_id = t.id
    WHERE ta.user_id = u.id AND t.status NOT IN ('completed', 'cancelled')
) rem ON true
LEFT JOIN LATERAL (
    SELECT COUNT(DISTINCT ptm.project_id) AS active_projects
    FROM project_team_members ptm
    JOIN projects p ON ptm.project_id = p.id
    WHERE ptm.user_id = u.id AND p.status = 'in_progress'
) proj ON true;

-- Monthly revenue report (kept as grouping aggregation)
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
    DATE_TRUNC('month', i.invoice_date) AS month,
    COUNT(i.id) AS invoice_count,
    SUM(i.amount) AS total_invoiced,
    SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) AS total_paid,
    SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) / NULLIF(SUM(i.amount), 0) * 100 AS collection_rate
FROM invoices i
WHERE i.status != 'cancelled'
GROUP BY DATE_TRUNC('month', i.invoice_date)
ORDER BY month DESC;