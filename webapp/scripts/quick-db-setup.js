const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: process.env.USERNAME // Use Windows username
    });

    try {
        console.log('Setting up database...');

        // Create database if not exists
        const dbResult = await pool.query(`
            SELECT datname FROM pg_database WHERE datname = 'project_management_system'
        `);

        if (dbResult.rows.length === 0) {
            console.log('Creating database...');
            await pool.query('CREATE DATABASE project_management_system');
        }

        // Close connection to postgres database
        await pool.end();

        // Connect to our new database
        const projectPool = new Pool({
            host: 'localhost',
            port: 5432,
            database: 'project_management_system',
            user: process.env.USERNAME // Use Windows username
        });

        // Read schema file
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');

        // Execute schema
        console.log('Creating tables...');
        await projectPool.query(schema);

        // Optional: Load other SQL files if they exist
        const sqlFiles = ['indexes.sql', 'triggers.sql', 'views.sql', 'functions.sql'];
        
        for (const file of sqlFiles) {
            try {
                const filePath = path.join(__dirname, '../../database', file);
                console.log(`Executing ${file}...`);
                const sql = await fs.readFile(filePath, 'utf8');
                await projectPool.query(sql);
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.log(`Optional file ${file} not found, skipping...`);
                } else {
                    throw err;
                }
            }
        }

        console.log('Database setup completed successfully!');
        await projectPool.end();

    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase();