import * as dotenv from 'dotenv';
import * as path from 'path';
import { initializeDatabase } from './connection';

// Load environment variables from root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function migrate() {
  try {
    await initializeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
