#!/bin/bash

echo "OneFlow Database Setup Script for macOS/Linux"
echo "=============================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL first:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

echo "PostgreSQL found: $(psql --version)"

# Check if PostgreSQL service is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "PostgreSQL service is not running. Starting it..."
    if command -v brew &> /dev/null; then
        # macOS with Homebrew
        brew services start postgresql
    elif systemctl is-active --quiet postgresql; then
        # Linux with systemd
        sudo systemctl start postgresql
    else
        echo "Please start PostgreSQL service manually"
        exit 1
    fi
fi

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h localhost -p 5432; do
    sleep 1
done

echo "Creating database role and database..."

# Create role and database (suppress output if they already exist)
psql -U postgres -c "CREATE ROLE oneflow_user WITH LOGIN PASSWORD 'oneflow_pass' CREATEDB;" 2>/dev/null || true
psql -U postgres -c "CREATE DATABASE oneflow_dev OWNER oneflow_user;" 2>/dev/null || true

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_DIR="$(dirname "$SCRIPT_DIR")/sql"

echo "Running SQL scripts from: $SQL_DIR"

# Run SQL files in order
echo "Creating database schema..."
psql -U oneflow_user -d oneflow_dev -f "$SQL_DIR/create_tables.sql"

if [ $? -eq 0 ]; then
    echo "✓ Database schema created successfully"
else
    echo "✗ Failed to create database schema"
    exit 1
fi

echo "Adding sample data..."
psql -U oneflow_user -d oneflow_dev -f "$SQL_DIR/seed_data.sql"

if [ $? -eq 0 ]; then
    echo "✓ Sample data added successfully"
else
    echo "✗ Failed to add sample data"
    exit 1
fi

echo "Creating financial view..."
psql -U oneflow_user -d oneflow_dev -f "$SQL_DIR/view_project_financials.sql"

if [ $? -eq 0 ]; then
    echo "✓ Financial view created successfully"
else
    echo "✗ Failed to create financial view"
    exit 1
fi

echo ""
echo "Database setup completed successfully!"
echo ""
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: oneflow_dev"
echo "  Username: oneflow_user"
echo "  Password: oneflow_pass"
echo ""
echo "Test connection with:"
echo "  psql -U oneflow_user -d oneflow_dev"
echo ""
echo "Or connect via pgAdmin 4 using the above credentials."
