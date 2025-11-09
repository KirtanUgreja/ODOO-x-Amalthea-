-- Complete database setup script
-- Run this file to create the entire database structure

-- Create database (run this separately as superuser)
-- CREATE DATABASE project_management_system;
-- \c project_management_system;

-- Run all setup scripts in order
\echo 'Creating database schema...'
\i schema.sql

\echo 'Creating indexes...'
\i indexes.sql

\echo 'Creating triggers...'
\i triggers.sql

\echo 'Creating views...'
\i views.sql

\echo 'Creating functions...'
\i functions.sql

\echo 'Inserting seed data...'
\i seed_data.sql

\echo 'Database setup complete!'

-- Grant permissions (adjust as needed for your environment)
-- GRANT CONNECT ON DATABASE project_management_system TO app_user;
-- GRANT USAGE ON SCHEMA public TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;