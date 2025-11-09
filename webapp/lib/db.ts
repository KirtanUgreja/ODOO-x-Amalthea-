import { Pool, PoolClient, QueryConfig, QueryResult, QueryResultRow } from 'pg'

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  database: process.env.POSTGRES_DB || 'project_management_system',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const query = async <T extends QueryResultRow = any>(
  text: string | QueryConfig,
  params?: any[]
): Promise<QueryResult<T>> => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('Executed query', {
    text: typeof text === 'string' ? text : text.text,
    duration,
    rows: res.rowCount
  })
  return res
}

interface TrackedPoolClient extends PoolClient {
  lastQuery?: string;
}

export const getClient = async (): Promise<TrackedPoolClient> => {
  const client = await pool.connect() as TrackedPoolClient
  const originalQuery = client.query.bind(client)
  const originalRelease = client.release.bind(client)
  
  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!')
    console.error(`The last executed query on this client was: ${client.lastQuery}`)
  }, 5000)

  const trackedClient = client as TrackedPoolClient
  
  // Store the original methods for restoration
  const originalMethods = {
    query: originalQuery,
    release: originalRelease
  }

  // Override the query method to track the last query
  trackedClient.query = (async (text: string | QueryConfig, values?: any[]) => {
    trackedClient.lastQuery = typeof text === 'string' ? text : text.text
    return originalMethods.query(text, values)
  }) as typeof client.query
  
  trackedClient.release = () => {
    clearTimeout(timeout)
    // Restore original methods
    trackedClient.query = originalMethods.query
    trackedClient.release = originalMethods.release
    return originalMethods.release()
  }
  
  return trackedClient
}

export default pool