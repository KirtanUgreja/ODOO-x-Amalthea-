-- Drop views first
DROP VIEW IF EXISTS project_financials;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS vendor_bills;
DROP TABLE IF EXISTS customer_invoices;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS sales_orders;
DROP TABLE IF EXISTS timesheets;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

-- Drop ENUM types
DROP TYPE IF EXISTS priority;
DROP TYPE IF EXISTS task_status;
DROP TYPE IF EXISTS project_status;
DROP TYPE IF EXISTS user_role;