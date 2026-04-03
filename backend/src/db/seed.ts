import bcrypt from 'bcryptjs';
import { query } from './connection';

async function seed() {
  try {
    console.log('Seeding database...');

    // Seed admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminQuery = `
      INSERT INTO admin_users (username, password_hash, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO NOTHING
    `;
    await query(adminQuery, ['admin', adminPassword, 'super-admin']);
    console.log('✓ Admin user seeded');

    // Seed sample teams (optional - for testing)
    const teamPassword = await bcrypt.hash('team123', 10);
    for (let i = 1; i <= 3; i++) {
      const collegeId = `COLLEGE${i.toString().padStart(3, '0')}`;
      
      // Insert user
      const userQuery = `
        INSERT INTO users (college_id, password_hash)
        VALUES ($1, $2)
        ON CONFLICT (college_id) DO NOTHING
      `;
      await query(userQuery, [collegeId, teamPassword]);
      
      // Get user ID
      const userResult = await query('SELECT id FROM users WHERE college_id = $1', [collegeId]);
      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        
        // Insert team
        const teamQuery = `
          INSERT INTO teams (user_id, team_name, college_id)
          VALUES ($1, $2, $3)
          ON CONFLICT (team_name) DO NOTHING
        `;
        const teamName = `Team ${i}`;
        await query(teamQuery, [userId, teamName, collegeId]);
        
        // Get team ID
        const teamResult = await query('SELECT id FROM teams WHERE user_id = $1', [userId]);
        if (teamResult.rows.length > 0) {
          const teamId = teamResult.rows[0].id;
          
          // Insert team members
          for (let j = 1; j <= 3; j++) {
            const memberQuery = `
              INSERT INTO team_members (team_id, member_name)
              VALUES ($1, $2)
            `;
            await query(memberQuery, [teamId, `Member ${j}`]);
          }
        }
      }
    }
    console.log('✓ Sample teams seeded');

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
