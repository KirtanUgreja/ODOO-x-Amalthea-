const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
  // Create a client connected to default database
  const client = new Client({
    user: 'postgres',
    password: '1234',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();

    // Drop and recreate database
    console.log('Creating database...');
    await client.query('DROP DATABASE IF EXISTS project_management_system');
    await client.query('CREATE DATABASE project_management_system');
    await client.end();

    // Connect to new database
    const dbClient = new Client({
      user: 'postgres',
      password: '1234',
      host: 'localhost',
      port: 5432,
      database: 'project_management_system'
    });

    await dbClient.connect();

    // Read and execute SQL files
    const files = [
      'schema.sql',
      'indexes.sql',
      'triggers.sql',
      'views.sql',
      'functions.sql',
      'seed_data.sql'
    ];

    for (const file of files) {
      const filePath = path.join(__dirname, '../../database', file);
      try {
        console.log(`Executing ${file}...`);
        const sql = await fs.readFile(filePath, 'utf8');
        await dbClient.query(sql);
        console.log(`✓ ${file} executed successfully`);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log(`Warning: ${file} not found`);
        } else {
          throw err;
        }
      }
    }

    console.log('Database setup completed successfully!');
    await dbClient.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();