# Project Management System Database

A production-ready PostgreSQL database schema for a comprehensive project management system with proper normalization (3NF), many-to-many relationships, and optimized performance.

## Features

- **Normalized to 3NF** - Eliminates data redundancy and ensures data integrity
- **Many-to-Many Relationships** - Proper junction tables for tasks-users, projects-users, etc.
- **UUID Primary Keys** - Globally unique identifiers for all entities
- **Production Optimized** - Comprehensive indexing strategy for performance
- **Audit Logging** - Complete change tracking for critical tables
- **Auto-generated Numbers** - Automatic order/invoice number generation
- **Business Logic Functions** - Built-in calculations for reporting and analytics

## Database Structure

### Core Entities

- **Users** - System users with roles and departments
- **Projects** - Main project entities with team assignments
- **Tasks** - Project tasks with many-to-many user assignments
- **Customers** - Client information and contact details
- **Vendors** - Supplier information and services

### Financial Entities

- **Sales Orders** - Customer orders with line items
- **Purchase Orders** - Vendor orders with line items  
- **Invoices** - Customer billing with line items
- **Vendor Bills** - Supplier invoices
- **Expenses** - Project-related expenses
- **Products** - Service/product catalog

### Time Tracking

- **Timesheets** - Time logging with approval workflow
- **Task Comments** - Task communication and updates
- **Milestones** - Project milestones and deliverables

## Setup Instructions

### Prerequisites

- PostgreSQL 12+ with UUID extension
- Database user with CREATE privileges

### Installation

1. Create the database:
```sql
CREATE DATABASE project_management_system;
\c project_management_system;
```

2. Run the complete setup:
```bash
psql -d project_management_system -f setup.sql
```

Or run individual scripts in order:
```bash
psql -d project_management_system -f schema.sql
psql -d project_management_system -f indexes.sql
psql -d project_management_system -f triggers.sql
psql -d project_management_system -f views.sql
psql -d project_management_system -f functions.sql
psql -d project_management_system -f seed_data.sql
```

## Key Relationships

### Many-to-Many Relationships

- **Tasks ↔ Users** via `task_assignees` table
- **Projects ↔ Users** via `project_team_members` table  
- **Users ↔ Roles** via `user_roles` table
- **Users ↔ Departments** via `user_departments` table

### One-to-Many Relationships

- Projects → Tasks, Timesheets, Expenses, Sales Orders
- Users → Created Projects (as manager), Timesheets, Expenses
- Customers → Sales Orders, Invoices
- Vendors → Purchase Orders, Vendor Bills

## Performance Features

### Indexing Strategy

- Primary and foreign key indexes
- Status and date-based filtering indexes
- Composite indexes for common query patterns
- Full-text search indexes for titles and descriptions

### Triggers

- Automatic `updated_at` timestamp updates
- Audit logging for all critical operations
- Auto-generation of order/invoice numbers
- Task hours calculation from timesheets

## Business Logic Functions

### Project Analytics
- `get_project_completion_percentage(uuid)` - Calculate task completion %
- `get_project_profitability(uuid)` - Revenue, costs, and profit analysis
- `get_project_budget_status(uuid)` - Budget utilization tracking
- `get_project_dashboard(uuid)` - Complete project overview

### User Analytics  
- `get_user_utilization_rate(uuid, start_date, end_date)` - Time utilization %
- `get_user_overdue_tasks(uuid)` - Overdue task list

### Financial Analytics
- `get_invoice_aging()` - Accounts receivable aging report

## Useful Views

- `user_details` - Users with roles and departments
- `project_summary` - Projects with team and financial summary
- `task_details` - Tasks with assignees and comments
- `timesheet_summary` - Time tracking by user/project/month
- `project_financials` - Financial overview by project
- `overdue_items` - All overdue tasks, invoices, and bills
- `user_workload` - User task and project load
- `monthly_revenue` - Revenue and collection tracking

## Security Features

- UUID primary keys prevent enumeration attacks
- Audit logging tracks all changes with user attribution
- Role-based permissions structure
- Password hash storage (not plain text)

## Data Migration

The `seed_data.sql` includes commented examples for migrating from existing JSON data. Uncomment and modify the migration scripts as needed.

## Production Considerations

1. **Backup Strategy** - Implement regular backups
2. **Connection Pooling** - Use pgBouncer or similar
3. **Monitoring** - Set up query performance monitoring
4. **Partitioning** - Consider partitioning large tables (timesheets, audit_logs)
5. **Archiving** - Implement data archiving for old projects

## Environment Variables

Set these for application integration:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=project_management_system
DB_USER=your_app_user
DB_PASSWORD=your_secure_password
```

## Support

For questions or issues with the database schema, refer to the PostgreSQL documentation or create an issue in the project repository.