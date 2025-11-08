-- Insert users
INSERT INTO users (name, email, password_hash, role, hourly_rate, is_active) VALUES
('John Admin', 'admin@oneflow.com', 'hashed_password_1', 'admin', 100.00, true),
('Sarah Manager', 'pm@oneflow.com', 'hashed_password_2', 'project_manager', 85.00, true),
('Mike Developer', 'dev1@oneflow.com', 'hashed_password_3', 'team_member', 75.00, true),
('Lisa Designer', 'dev2@oneflow.com', 'hashed_password_4', 'team_member', 70.00, true),
('Tom Finance', 'finance@oneflow.com', 'hashed_password_5', 'finance', 80.00, true);

-- Insert sample project
INSERT INTO projects (
    name, description, manager_id, start_date, end_date, 
    budget, progress, status, revenue_total, cost_total
) VALUES (
    'Brand Website Redesign',
    'Complete redesign of corporate website with new branding',
    2, -- Sarah Manager
    '2025-11-01',
    '2025-12-31',
    50000.00,
    25,
    'in_progress',
    60000.00,
    35000.00
);

-- Add project members
INSERT INTO project_members (project_id, user_id, role_in_project) VALUES
(1, 2, 'Project Manager'),
(1, 3, 'Lead Developer'),
(1, 4, 'UI/UX Designer');

-- Insert tasks
INSERT INTO tasks (
    project_id, assignee_id, name, description,
    priority, status, due_date, estimated_hours, logged_hours
) VALUES
(1, 4, 'Design Homepage', 'Create new homepage design with updated branding',
'high', 'in_progress', '2025-11-15', 40.0, 20.0),
(1, 3, 'Implement Frontend', 'Build responsive frontend using approved design',
'high', 'new', '2025-12-15', 80.0, 0.0);

-- Insert timesheets
INSERT INTO timesheets (task_id, user_id, date, hours, billable) VALUES
(1, 4, '2025-11-08', 8.0, true),
(1, 4, '2025-11-07', 6.0, true);

-- Insert sales order
INSERT INTO sales_orders (
    project_id, customer_name, so_number,
    total_amount, status, created_date
) VALUES (
    1, 'Acme Corp', 'SO-2025-001',
    60000.00, 'approved', '2025-10-15'
);

-- Insert purchase order
INSERT INTO purchase_orders (
    project_id, vendor_name, po_number,
    total_amount, status, created_date
) VALUES (
    1, 'WebHost Pro', 'PO-2025-001',
    12000.00, 'approved', '2025-10-20'
);

-- Insert customer invoice
INSERT INTO customer_invoices (
    project_id, so_id, amount,
    invoice_date, status
) VALUES (
    1, 1, 30000.00,
    '2025-11-01', 'sent'
);

-- Insert vendor bill
INSERT INTO vendor_bills (
    project_id, po_id, amount,
    bill_date, status
) VALUES (
    1, 1, 6000.00,
    '2025-11-01', 'paid'
);

-- Insert expense
INSERT INTO expenses (
    project_id, user_id, description,
    amount, billable, receipt_url, status
) VALUES (
    1, 2, 'Software Licenses',
    1500.00, true, 'https://receipts.oneflow.com/exp-001.pdf', 'approved'
);