-- Truncate all tables to reset database
-- Execute this script to clear all data from all tables

-- Disable foreign key constraints temporarily
SET session_replication_role = 'replica';

-- Truncate all tables in reverse order of creation (respecting dependencies)
TRUNCATE TABLE audit_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE question_scores RESTART IDENTITY CASCADE;
TRUNCATE TABLE leaderboards RESTART IDENTITY CASCADE;
TRUNCATE TABLE game_scores RESTART IDENTITY CASCADE;
TRUNCATE TABLE answers RESTART IDENTITY CASCADE;
TRUNCATE TABLE questions RESTART IDENTITY CASCADE;
TRUNCATE TABLE game_sessions RESTART IDENTITY CASCADE;
TRUNCATE TABLE sessions RESTART IDENTITY CASCADE;
TRUNCATE TABLE admin_users RESTART IDENTITY CASCADE;
TRUNCATE TABLE team_members RESTART IDENTITY CASCADE;
TRUNCATE TABLE teams RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Re-enable foreign key constraints
SET session_replication_role = 'origin';

-- Verify truncation
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM teams) as teams_count,
  (SELECT COUNT(*) FROM team_members) as team_members_count,
  (SELECT COUNT(*) FROM game_sessions) as game_sessions_count,
  (SELECT COUNT(*) FROM questions) as questions_count,
  (SELECT COUNT(*) FROM answers) as answers_count,
  (SELECT COUNT(*) FROM game_scores) as game_scores_count,
  (SELECT COUNT(*) FROM leaderboards) as leaderboards_count,
  (SELECT COUNT(*) FROM admin_users) as admin_users_count,
  (SELECT COUNT(*) FROM sessions) as sessions_count,
  (SELECT COUNT(*) FROM audit_logs) as audit_logs_count,
  (SELECT COUNT(*) FROM question_scores) as question_scores_count;
