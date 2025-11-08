-- Reset schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'project_manager', 'team_member', 'finance');
CREATE TYPE project_status AS ENUM ('planned', 'in_progress', 'completed', 'on_hold');
CREATE TYPE task_status AS ENUM ('new', 'in_progress', 'blocked', 'done');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high');

-- Users table: Stores all system users with their roles and rates
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table: Main project information and financial tracking
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE,
    budget DECIMAL(12, 2) NOT NULL CHECK (budget >= 0),
    progress INTEGER CHECK (progress >= 0 AND progress <= 100),
    status project_status NOT NULL DEFAULT 'planned',
    revenue_total DECIMAL(12, 2) DEFAULT 0 CHECK (revenue_total >= 0),
    cost_total DECIMAL(12, 2) DEFAULT 0 CHECK (cost_total >= 0),
    profit_total DECIMAL(12, 2) GENERATED ALWAYS AS (revenue_total - cost_total) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project members: Links users to projects with their specific roles
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_in_project VARCHAR(50) NOT NULL,
    UNIQUE(project_id, user_id)
);

-- Tasks table: Project tasks with assignments and time tracking
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    priority priority NOT NULL DEFAULT 'medium',
    status task_status NOT NULL DEFAULT 'new',
    due_date DATE,
    estimated_hours DECIMAL(6, 2) CHECK (estimated_hours >= 0),
    logged_hours DECIMAL(6, 2) DEFAULT 0 CHECK (logged_hours >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timesheets: Time entries for tasks
CREATE TABLE timesheets (
    timesheet_id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hours DECIMAL(4, 2) NOT NULL CHECK (hours > 0 AND hours <= 24),
    billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10, 2) DEFAULT 0,
    cost DECIMAL(10, 2) GENERATED ALWAYS AS (hours * hourly_rate) STORED
);

-- Sales orders: Customer orders linked to projects
CREATE TABLE sales_orders (
    so_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE RESTRICT,
    customer_name VARCHAR(100) NOT NULL,
    so_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Purchase orders: Vendor orders linked to projects
CREATE TABLE purchase_orders (
    po_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE RESTRICT,
    vendor_name VARCHAR(100) NOT NULL,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Customer invoices: Invoices issued to customers
CREATE TABLE customer_invoices (
    invoice_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE RESTRICT,
    so_id INTEGER NOT NULL REFERENCES sales_orders(so_id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    invoice_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
);

-- Vendor bills: Bills received from vendors
CREATE TABLE vendor_bills (
    bill_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE RESTRICT,
    po_id INTEGER NOT NULL REFERENCES purchase_orders(po_id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    bill_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
);

-- Expenses: Project-related expenses
CREATE TABLE expenses (
    expense_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    billable BOOLEAN DEFAULT true,
    receipt_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_timesheets_task ON timesheets(task_id);
CREATE INDEX idx_timesheets_user ON timesheets(user_id);
CREATE INDEX idx_sales_orders_project ON sales_orders(project_id);
CREATE INDEX idx_purchase_orders_project ON purchase_orders(project_id);
CREATE INDEX idx_customer_invoices_project ON customer_invoices(project_id);
CREATE INDEX idx_customer_invoices_so ON customer_invoices(so_id);
CREATE INDEX idx_vendor_bills_project ON vendor_bills(project_id);
CREATE INDEX idx_vendor_bills_po ON vendor_bills(po_id);
CREATE INDEX idx_expenses_project ON expenses(project_id);
CREATE INDEX idx_expenses_user ON expenses(user_id);

-- Create trigger function to set hourly rate
CREATE OR REPLACE FUNCTION set_timesheet_hourly_rate()
RETURNS TRIGGER AS $$
BEGIN
    NEW.hourly_rate := (SELECT hourly_rate FROM users WHERE user_id = NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_hourly_rate_before_insert
    BEFORE INSERT ON timesheets
    FOR EACH ROW
    EXECUTE FUNCTION set_timesheet_hourly_rate();

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