import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env file - look for it in current directory or parent directories
let envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  envPath = path.resolve(process.cwd(), '..', '.env');
}
if (!fs.existsSync(envPath)) {
  envPath = path.resolve(__dirname, '../..', '.env');
}

console.log('Loading .env from:', envPath);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const { Pool } = pg;

// Initialize connection pool with Neon DB connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/cyber_etymology';

console.log('Connecting to database:', connectionString.split('/')[2]); // Log host:port

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Required for Neon
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('Initializing database...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await client.query(statement);
      }
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getConnection() {
  return pool.connect();
}

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export async function closePool(): Promise<void> {
  await pool.end();
}

export { pool };
