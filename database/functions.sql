-- Useful functions for business logic and calculations

-- Function to calculate project completion percentage
CREATE OR REPLACE FUNCTION get_project_completion_percentage(project_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    completion_percentage DECIMAL(5,2);
BEGIN
    SELECT COUNT(*) INTO total_tasks
    FROM tasks
    WHERE project_id = project_uuid;
    
    IF total_tasks = 0 THEN
        RETURN 0.00;
    END IF;
    
    SELECT COUNT(*) INTO completed_tasks
    FROM tasks
    WHERE project_id = project_uuid AND status = 'completed';
    
    completion_percentage := (completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100;
    
    RETURN completion_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user utilization rate
CREATE OR REPLACE FUNCTION get_user_utilization_rate(
    user_uuid UUID,
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_hours DECIMAL(8,2);
    working_days INTEGER;
    expected_hours DECIMAL(8,2);
    utilization_rate DECIMAL(5,2);
BEGIN
    -- Calculate working days (excluding weekends)
    SELECT COUNT(*)
    INTO working_days
    FROM generate_series(start_date, end_date, '1 day'::interval) AS d
    WHERE EXTRACT(DOW FROM d) NOT IN (0, 6); -- 0 = Sunday, 6 = Saturday
    
    -- Expected hours (8 hours per working day)
    expected_hours := working_days * 8;
    
    IF expected_hours = 0 THEN
        RETURN 0.00;
    END IF;
    
    -- Get actual logged hours
    SELECT COALESCE(SUM(hours), 0)
    INTO total_hours
    FROM timesheets
    WHERE user_id = user_uuid
    AND date BETWEEN start_date AND end_date
    AND approval_status = 'approved';
    
    utilization_rate := (total_hours / expected_hours) * 100;
    
    RETURN LEAST(utilization_rate, 100.00); -- Cap at 100%
END;
$$ LANGUAGE plpgsql;

-- Function to calculate project profitability
CREATE OR REPLACE FUNCTION get_project_profitability(project_uuid UUID)
RETURNS TABLE(
    revenue DECIMAL(15,2),
    costs DECIMAL(15,2),
    profit DECIMAL(15,2),
    profit_margin DECIMAL(5,2)
) AS $$
DECLARE
    total_revenue DECIMAL(15,2) := 0;
    total_costs DECIMAL(15,2) := 0;
    total_profit DECIMAL(15,2);
    margin DECIMAL(5,2);
BEGIN
    -- Calculate revenue from invoices
    SELECT COALESCE(SUM(i.amount), 0)
    INTO total_revenue
    FROM invoices i
    WHERE i.project_id = project_uuid AND i.status = 'paid';
    
    -- Calculate costs (timesheets + expenses + purchase orders)
    SELECT COALESCE(
        (SELECT SUM(ts.hours * u.hourly_rate)
         FROM timesheets ts
         JOIN users u ON ts.user_id = u.id
         WHERE ts.project_id = project_uuid AND ts.approval_status = 'approved'), 0
    ) +
    COALESCE(
        (SELECT SUM(e.amount)
         FROM expenses e
         WHERE e.project_id = project_uuid AND e.status = 'approved'), 0
    ) +
    COALESCE(
        (SELECT SUM(po.amount)
         FROM purchase_orders po
         WHERE po.project_id = project_uuid AND po.status = 'completed'), 0
    )
    INTO total_costs;
    
    total_profit := total_revenue - total_costs;
    
    IF total_revenue > 0 THEN
        margin := (total_profit / total_revenue) * 100;
    ELSE
        margin := 0;
    END IF;
    
    RETURN QUERY SELECT total_revenue, total_costs, total_profit, margin;
END;
$$ LANGUAGE plpgsql;

-- Function to get overdue tasks for a user
CREATE OR REPLACE FUNCTION get_user_overdue_tasks(user_uuid UUID)
RETURNS TABLE(
    task_id UUID,
    task_title VARCHAR(255),
    project_name VARCHAR(255),
    due_date DATE,
    days_overdue INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.title,
        p.name,
        t.due_date,
        (CURRENT_DATE - t.due_date)::INTEGER
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN task_assignees ta ON t.id = ta.task_id
    WHERE ta.user_id = user_uuid
    AND t.due_date < CURRENT_DATE
    AND t.status NOT IN ('completed', 'cancelled')
    ORDER BY t.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice aging
CREATE OR REPLACE FUNCTION get_invoice_aging()
RETURNS TABLE(
    current_amount DECIMAL(15,2),
    days_30 DECIMAL(15,2),
    days_60 DECIMAL(15,2),
    days_90 DECIMAL(15,2),
    over_90 DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN i.due_date >= CURRENT_DATE THEN i.amount ELSE 0 END), 0) as current_amount,
        COALESCE(SUM(CASE WHEN i.due_date < CURRENT_DATE AND i.due_date >= CURRENT_DATE - INTERVAL '30 days' THEN i.amount ELSE 0 END), 0) as days_30,
        COALESCE(SUM(CASE WHEN i.due_date < CURRENT_DATE - INTERVAL '30 days' AND i.due_date >= CURRENT_DATE - INTERVAL '60 days' THEN i.amount ELSE 0 END), 0) as days_60,
        COALESCE(SUM(CASE WHEN i.due_date < CURRENT_DATE - INTERVAL '60 days' AND i.due_date >= CURRENT_DATE - INTERVAL '90 days' THEN i.amount ELSE 0 END), 0) as days_90,
        COALESCE(SUM(CASE WHEN i.due_date < CURRENT_DATE - INTERVAL '90 days' THEN i.amount ELSE 0 END), 0) as over_90
    FROM invoices i
    WHERE i.status IN ('sent', 'overdue');
END;
$$ LANGUAGE plpgsql;

-- Function to get project budget status
CREATE OR REPLACE FUNCTION get_project_budget_status(project_uuid UUID)
RETURNS TABLE(
    budget DECIMAL(15,2),
    spent DECIMAL(15,2),
    committed DECIMAL(15,2),
    remaining DECIMAL(15,2),
    budget_utilization DECIMAL(5,2)
) AS $$
DECLARE
    project_budget DECIMAL(15,2);
    total_spent DECIMAL(15,2);
    total_committed DECIMAL(15,2);
    remaining_budget DECIMAL(15,2);
    utilization DECIMAL(5,2);
BEGIN
    -- Get project budget
    SELECT p.budget INTO project_budget
    FROM projects p
    WHERE p.id = project_uuid;
    
    IF project_budget IS NULL OR project_budget = 0 THEN
        RETURN QUERY SELECT 0::DECIMAL(15,2), 0::DECIMAL(15,2), 0::DECIMAL(15,2), 0::DECIMAL(15,2), 0::DECIMAL(5,2);
        RETURN;
    END IF;
    
    -- Calculate spent amount (approved expenses + completed purchase orders + timesheet costs)
    SELECT COALESCE(
        (SELECT SUM(e.amount) FROM expenses e WHERE e.project_id = project_uuid AND e.status = 'approved'), 0
    ) +
    COALESCE(
        (SELECT SUM(po.amount) FROM purchase_orders po WHERE po.project_id = project_uuid AND po.status = 'completed'), 0
    ) +
    COALESCE(
        (SELECT SUM(ts.hours * u.hourly_rate)
         FROM timesheets ts
         JOIN users u ON ts.user_id = u.id
         WHERE ts.project_id = project_uuid AND ts.approval_status = 'approved'), 0
    )
    INTO total_spent;
    
    -- Calculate committed amount (approved purchase orders not yet completed)
    SELECT COALESCE(SUM(po.amount), 0)
    INTO total_committed
    FROM purchase_orders po
    WHERE po.project_id = project_uuid AND po.status = 'approved';
    
    remaining_budget := project_budget - total_spent - total_committed;
    utilization := ((total_spent + total_committed) / project_budget) * 100;
    
    RETURN QUERY SELECT project_budget, total_spent, total_committed, remaining_budget, utilization;
END;
$$ LANGUAGE plpgsql;

-- Function to generate project dashboard data
CREATE OR REPLACE FUNCTION get_project_dashboard(project_uuid UUID)
RETURNS TABLE(
    project_name VARCHAR(255),
    completion_percentage DECIMAL(5,2),
    budget_utilization DECIMAL(5,2),
    team_size INTEGER,
    active_tasks INTEGER,
    overdue_tasks INTEGER,
    total_hours DECIMAL(8,2),
    billable_hours DECIMAL(8,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name,
        get_project_completion_percentage(project_uuid),
        (SELECT budget_utilization FROM get_project_budget_status(project_uuid)),
        (SELECT COUNT(DISTINCT ptm.user_id)::INTEGER FROM project_team_members ptm WHERE ptm.project_id = project_uuid),
        (SELECT COUNT(t.id)::INTEGER FROM tasks t WHERE t.project_id = project_uuid AND t.status NOT IN ('completed', 'cancelled')),
        (SELECT COUNT(t.id)::INTEGER FROM tasks t WHERE t.project_id = project_uuid AND t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled')),
        COALESCE((SELECT SUM(ts.hours) FROM timesheets ts WHERE ts.project_id = project_uuid AND ts.approval_status = 'approved'), 0),
        COALESCE((SELECT SUM(ts.hours) FROM timesheets ts WHERE ts.project_id = project_uuid AND ts.billable = true AND ts.approval_status = 'approved'), 0)
    FROM projects p
    WHERE p.id = project_uuid;
END;
$$ LANGUAGE plpgsql;