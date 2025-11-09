-- Seed data for initial setup

-- Insert default roles
INSERT INTO roles (id, name, description, permissions) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'System Administrator', '{"all": true}'),
('550e8400-e29b-41d4-a716-446655440002', 'project_manager', 'Project Manager', '{"projects": ["read", "write"], "tasks": ["read", "write"], "timesheets": ["read", "approve"], "reports": ["read"]}'),
('550e8400-e29b-41d4-a716-446655440003', 'team_member', 'Team Member', '{"tasks": ["read", "write"], "timesheets": ["read", "write"], "expenses": ["read", "write"]}'),
('550e8400-e29b-41d4-a716-446655440004', 'sales_finance', 'Sales & Finance', '{"invoices": ["read", "write"], "sales_orders": ["read", "write"], "purchase_orders": ["read", "write"], "reports": ["read"]}');

-- Insert departments
INSERT INTO departments (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Engineering', 'Software Development and Engineering'),
('550e8400-e29b-41d4-a716-446655440011', 'Design', 'UI/UX Design and Creative'),
('550e8400-e29b-41d4-a716-446655440012', 'Finance', 'Finance and Accounting'),
('550e8400-e29b-41d4-a716-446655440013', 'Sales', 'Sales and Business Development'),
('550e8400-e29b-41d4-a716-446655440014', 'Fintech', 'Financial Technology Solutions');

-- Insert default admin user
INSERT INTO users (id, email, password_hash, name, phone, address, hourly_rate, status) VALUES
('550e8400-e29b-41d4-a716-446655440100', 'admin@oneflow.com', '$2b$10$example_hash_for_admin123', 'Admin User', NULL, NULL, 0, 'active');

-- Assign admin role
INSERT INTO user_roles (user_id, role_id) VALUES
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample customers
INSERT INTO customers (id, name, email, phone, address, payment_terms) VALUES
('550e8400-e29b-41d4-a716-446655440200', 'Acme Corporation', 'contact@acme.com', '+1-555-0123', '123 Business St, City, State 12345', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440201', 'Beta Industries', 'info@beta.com', '+1-555-0456', '456 Commerce Ave, City, State 12345', 'Net 15'),
('550e8400-e29b-41d4-a716-446655440202', 'Only Flow', 'contact@onlyflow.com', '+1-555-0789', '789 Tech Blvd, City, State 12345', 'Net 30');

-- Insert sample vendors
INSERT INTO vendors (id, name, email, phone, address, payment_terms, services) VALUES
('550e8400-e29b-41d4-a716-446655440300', 'TechCorp Solutions', 'billing@techcorp.com', '+1-555-0789', '789 Tech Blvd, City, State 12345', 'Net 30', 'Photography, Video Production'),
('550e8400-e29b-41d4-a716-446655440301', 'Design Studio Inc', 'hello@designstudio.com', '+1-555-0321', '321 Creative Way, City, State 12345', 'Net 15', 'UI/UX Design, Branding');

-- Insert sample products/services
INSERT INTO products (id, name, description, price, category, unit) VALUES
('550e8400-e29b-41d4-a716-446655440400', 'Website Design Package', 'Complete website design with 5 pages', 25000.00, 'Design Services', 'package'),
('550e8400-e29b-41d4-a716-446655440401', 'Development Hours', 'Custom development work per hour', 1500.00, 'Development Services', 'hour'),
('550e8400-e29b-41d4-a716-446655440402', 'Project Management', 'Project management services per hour', 2000.00, 'Management Services', 'hour'),
('550e8400-e29b-41d4-a716-446655440403', 'UI/UX Design', 'User interface and experience design', 1800.00, 'Design Services', 'hour');

-- Sample data migration script (commented out - use when migrating from existing JSON data)
/*
-- This would be used to migrate existing data from the JSON file
-- Example migration for users:

INSERT INTO users (id, email, password_hash, name, phone, address, hourly_rate, status, created_at)
SELECT 
    id::uuid,
    email,
    password as password_hash, -- Note: These should be properly hashed
    name,
    phone,
    address,
    COALESCE(hourlyRate, 0),
    COALESCE(status, 'active'),
    COALESCE(createdAt::timestamp with time zone, CURRENT_TIMESTAMP)
FROM json_populate_recordset(null::record, '[
    {"id": "user-1762638378559", "name": "yugansh", "email": "yugansh@gmail.com", "password": "Yugansh@12", "role": "team_member", "hourlyRate": 500, "createdAt": "2025-11-08T21:46:18.559Z"},
    {"id": "user-1762637552852", "name": "Shreyansh", "email": "shreyansh@gmail.com", "password": "Shreyansh@12", "role": "sales_finance", "hourlyRate": 500, "createdAt": "2025-11-08T21:32:32.852Z"}
]'::json);
*/