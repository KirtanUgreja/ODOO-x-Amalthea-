const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// First connect as superuser to postgres database
const initClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234',
  port: 5432
});

async function setupDatabase() {
  try {
    // Connect to postgres database first
    await initClient.connect();
    
    // Drop database if exists and create new one
    await initClient.query('DROP DATABASE IF EXISTS project_management_system');
    await initClient.query('CREATE DATABASE project_management_system');
    console.log('Database created successfully');
    await initClient.end();
    
    // Connect to new database
    const dbPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'project_management_system',
      password: '1234',
      port: 5432,
    });
    
    // Read and execute SQL files
    const sqlFiles = ['schema.sql', 'indexes.sql', 'triggers.sql', 'views.sql', 'functions.sql', 'seed_data.sql'];
    
    for (const file of sqlFiles) {
      const sqlPath = path.join(__dirname, '../../database', file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await dbPool.query(sql);
      console.log(`Executed ${file}`);
    }
    
    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database already exists, skipping creation');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

setupDatabase();