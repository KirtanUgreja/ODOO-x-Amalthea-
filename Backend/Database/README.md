# OneFlow Database Setup

This directory contains the database schema and setup scripts for the OneFlow ERP system - Plan to Bill in One Place.

## ⚠️ IMPORTANT: PostgreSQL Installation Fix

If you're having issues with PostgreSQL not being recognized, follow these exact steps:

1. **Uninstall PostgreSQL** (if already installed):
   - Open Control Panel
   - Programs and Features
   - Uninstall any existing PostgreSQL installations
   - Delete the PostgreSQL folder if it still exists in Program Files

2. **Install PostgreSQL 15 or newer**:
   - Download the installer from: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Run as Administrator
   - Install to default location (`C:\Program Files\PostgreSQL\15`)
   - Use default port 5432
   - Set password: `postgres`
   - Keep default locale

3. **Fix PATH manually**:
   ```powershell
   # Run PowerShell as Administrator and execute:
   $pgPath = "C:\Program Files\PostgreSQL\15\bin"
   $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
   if ($currentPath -notlike "*PostgreSQL*") {
       [Environment]::SetEnvironmentVariable("Path", "$currentPath;$pgPath", "Machine")
   }
   ```

4. **Verify Installation**:
   - Restart your computer (important!)
   - Open PowerShell
   - Run: `psql --version`
   - Should show: `psql (PostgreSQL) 15.x`

If still having issues:
1. Try running VS Code as Administrator
2. The setup script will attempt to find PostgreSQL automatically
3. Contact support if problems persist

## Directory Structure

```
backend/database/
├── sql/
│   ├── create_tables.sql    # Schema definition
│   ├── drop_tables.sql      # Clean removal of schema
│   ├── seed_data.sql        # Sample data
│   └── view_project_financials.sql  # Financial reporting view
├── scripts/
│   └── setup-db.bat         # Windows setup script
└── README.md                # This file
```

## Prerequisites

### Step 1 — Install PostgreSQL

1. Download PostgreSQL installer from:
   https://www.postgresql.org/download/windows/

2. During installation:
   - Choose your preferred installation directory
   - Select all components including:
     - PostgreSQL Server
     - pgAdmin 4
     - Command Line Tools
   - **IMPORTANT**: Check "Add to PATH" option during installation
   - Set a password for the postgres superuser
   - Default port (5432) is fine for most cases
   - Default locale is fine

3. After installation, you need to add PostgreSQL to your system PATH manually if it's not working:
   - Open Windows Start menu
   - Search for "Environment Variables" and click "Edit the system environment variables"
   - Click "Environment Variables" button
   - Under "System Variables", find and select "Path"
   - Click "Edit"
   - Click "New"
   - Add the PostgreSQL bin directory (typically `C:\Program Files\PostgreSQL\15\bin`)
   - Click "OK" on all windows
   - **Important**: Close and reopen your terminal/VS Code for changes to take effect

### Step 2 — Verify Installation

Open a command prompt and run:

```bash
psql --version
```

You should see the PostgreSQL version number.

## Database Setup

### Step 3 — Run Setup Script

1. Open VS Code terminal
2. Navigate to the database directory:
   ```bash
   cd backend\database
   ```
3. Run the setup script:
   ```bash
   scripts\setup-db.bat
   ```

### Step 4 — Verify Database

Run these commands to verify the installation:

```bash
psql -U oneflow_user -d oneflow_dev -c "\dt"
psql -U oneflow_user -d oneflow_dev -c "SELECT * FROM project_financials;"
```

## Database Details

- **Database Name:** oneflow_dev
- **User:** oneflow_user
- **Password:** oneflow_pass

### Key Features

- Complete ERP schema with 10 tables
- Project management and financial tracking
- Time tracking and billing
- Purchase and sales order management
- Expense tracking
- Financial reporting view

### Tables

1. `users` - System users and roles
2. `projects` - Project management
3. `project_members` - Project team assignments
4. `tasks` - Project tasks and progress
5. `timesheets` - Time tracking
6. `sales_orders` - Customer orders
7. `purchase_orders` - Vendor orders
8. `customer_invoices` - Billing
9. `vendor_bills` - Expenses
10. `expenses` - Additional costs

## Development Notes

- All foreign keys are indexed
- ON DELETE CASCADE where appropriate
- CHECK constraints for positive amounts
- Computed columns for financial totals
- Complete financial reporting view