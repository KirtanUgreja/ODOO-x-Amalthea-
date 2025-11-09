const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// First, we'll try to create the database using a simple client
async function setupDatabase() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'postgres',  // connect to default database first
        user: 'postgres',
        password: '1234',
        // Add these options to avoid SSL issues
        ssl: false,
        rejectUnauthorized: false
    });

    try {
        console.log('Connecting to PostgreSQL...');
        await client.connect();
        
        // Drop database if exists
        console.log('Dropping existing database if any...');
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'project_management_system'
            AND pid <> pg_backend_pid();
        `).catch(() => {});
        
        await client.query('DROP DATABASE IF EXISTS project_management_system;');
        
        // Create fresh database
        console.log('Creating new database...');
        await client.query('CREATE DATABASE project_management_system;');
        
        // Close connection to postgres database
        await client.end();
        
        // Connect to new database
        const projectClient = new Client({
            host: 'localhost',
            port: 5432,
            database: 'project_management_system',
            user: 'postgres',
            password: '1234',
            // Add these options to avoid SSL issues
            ssl: false,
            rejectUnauthorized: false
        });
        
        await projectClient.connect();
        
        // Read and execute schema
        console.log('Creating tables...');
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        await projectClient.query(schema);
        
        // Read and execute other SQL files
        const sqlFiles = ['indexes.sql', 'triggers.sql', 'views.sql', 'functions.sql'];
        
        for (const file of sqlFiles) {
            try {
                const filePath = path.join(__dirname, '../../database', file);
                const sql = await fs.readFile(filePath, 'utf8');
                console.log(`Executing ${file}...`);
                await projectClient.query(sql);
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.log(`Optional file ${file} not found, skipping...`);
                } else {
                    throw err;
                }
            }
        }
        
        console.log('Database setup completed successfully!');
        await projectClient.end();
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

setupDatabase();