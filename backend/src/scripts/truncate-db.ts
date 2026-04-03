/**
 * Database cleanup script - Truncate all tables
 * Usage: npm run db:truncate
 * or: npx ts-node backend/src/scripts/truncate-db.ts
 */

import { pool } from '../db/connection';

async function truncateDatabase() {
  console.log('🔄 Starting database truncation...\n');

  try {
    // List of tables in reverse dependency order
    const tables = [
      'audit_logs',
      'question_scores',
      'leaderboards',
      'game_scores',
      'answers',
      'questions',
      'game_sessions',
      'sessions',
      'admin_users',
      'team_members',
      'teams',
      'users',
    ];

    // Truncate each table (CASCADE handles foreign keys on managed databases)
    for (const table of tables) {
      try {
        await pool.query(`TRUNCATE TABLE ${table} CASCADE`);
        console.log(`✓ Truncated table: ${table}`);
      } catch (error: any) {
        // If CASCADE doesn't work, try DELETE instead
        if (error.code === '42P01') {
          console.log(`  (Table ${table} doesn't exist, skipping)`);
        } else {
          console.log(`  (Cascade failed for ${table}, attempting DELETE...)`);
          try {
            await pool.query(`DELETE FROM ${table}`);
            console.log(`✓ Deleted all rows from: ${table}`);
          } catch (deleteError) {
            console.log(`  (Could not delete from ${table})`);
          }
        }
      }
    }

    // Verify truncation
    console.log('\n📊 Verification - Current row counts:');
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${result.rows[0].count} rows`);
      } catch (error) {
        console.log(`   ${table}: (error reading)`);
      }
    }

    console.log('\n✅ Database truncation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during truncation:', error);
    process.exit(1);
  }
}

truncateDatabase();
