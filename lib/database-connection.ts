import { Pool, PoolClient } from 'pg';

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'oneflow_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'oneflow_dev',
  password: process.env.DB_PASSWORD || 'oneflow_pass',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

// Helper function to execute queries
export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to get a client from the pool
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

// Helper function to test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW() as now');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};
