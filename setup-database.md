# Database Setup Guide

## Prerequisites

1. Install PostgreSQL 12+ on your system
2. Create a database user with appropriate permissions

## Setup Steps

### 1. Create Database
```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database and user
CREATE DATABASE project_management_system;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE project_management_system TO your_username;
\q
```

### 2. Run Database Setup
```bash
# Navigate to project root
cd c:\Users\ugrej\Downloads\iitGan

# Run the complete setup
psql -U your_username -d project_management_system -f database/setup.sql
```

### 3. Configure Environment Variables
Update `webapp/.env.local` with your database credentials:
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/project_management_system"
```

### 4. Install Dependencies
```bash
cd webapp
npm install
```

### 5. Test Connection
```bash
npm run dev
```

Visit `http://localhost:3000/api/users` to test the database connection.

## Database Features

- **Normalized Schema**: 3NF with proper relationships
- **UUID Primary Keys**: Secure, globally unique identifiers
- **Audit Logging**: Complete change tracking
- **Business Functions**: Built-in analytics and calculations
- **Optimized Indexes**: Performance-tuned for common queries
- **Views**: Pre-built queries for complex data retrieval

## API Endpoints

- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project

## Troubleshooting

1. **Connection Issues**: Check PostgreSQL service is running
2. **Permission Errors**: Ensure user has proper database privileges
3. **Port Conflicts**: Default PostgreSQL port is 5432
4. **SSL Issues**: Disable SSL for local development in .env.local