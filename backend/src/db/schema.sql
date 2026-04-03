/**
 * PostgreSQL Database Schema for Cyber Etymology
 * 
 * This file contains all table definitions and relationships
 */

-- Users Table (Team Authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT college_id_length CHECK (length(college_id) >= 3)
);

-- Teams Table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  team_name VARCHAR(100) NOT NULL UNIQUE,
  college_id VARCHAR(50) NOT NULL REFERENCES users(college_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  is_disqualified BOOLEAN DEFAULT FALSE,
  disqualified_reason VARCHAR(255),
  disqualified_at TIMESTAMP,
  CONSTRAINT team_name_length CHECK (length(team_name) >= 2)
);

-- Team Members Table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  member_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT member_name_length CHECK (length(member_name) >= 2)
);

-- Game Sessions Table
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'paused', 'completed')),
  round VARCHAR(20) DEFAULT 'preliminary' CHECK (round IN ('preliminary', 'finals')),
  current_question_index INT DEFAULT 0,
  total_questions INT DEFAULT 5,
  started_at TIMESTAMP,
  paused_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_index INT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('START', 'CONTAIN')),
  characters VARCHAR(10) NOT NULL,
  time_limit INT NOT NULL, -- in seconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT question_index_positive CHECK (question_index > 0 AND question_index <= 5)
);

-- Answers/Submissions Table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  word VARCHAR(100),
  score INT DEFAULT 0,
  is_valid BOOLEAN DEFAULT FALSE,
  validation_message TEXT,
  validation_error_code VARCHAR(50),
  submitted_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT word_length_check CHECK (word IS NULL OR length(word) >= 1)
);

-- Game Scores Table (Per Round)
CREATE TABLE game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  total_score INT DEFAULT 0,
  rank INT,
  is_qualified_for_finals BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_session_id, team_id)
);

-- Question Scores Breakdown (Per Question)
CREATE TABLE question_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  question_index INT NOT NULL,
  score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_session_id, team_id, question_index)
);

-- Leaderboard (Denormalized for fast queries)
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID NOT NULL UNIQUE REFERENCES game_sessions(id) ON DELETE CASCADE,
  standings JSONB NOT NULL, -- Stores array of team rankings
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super-admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Sessions Table (For JWT refresh tokens, if needed)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  admin_user_id UUID,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  user_id UUID,
  admin_user_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Indices for Performance
CREATE INDEX idx_users_college_id ON users(college_id);
CREATE INDEX idx_teams_user_id ON teams(user_id);
CREATE INDEX idx_teams_college_id ON teams(college_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_questions_game_session_id ON questions(game_session_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_team_id ON answers(team_id);
CREATE INDEX idx_answers_game_session_id ON answers(game_session_id);
CREATE INDEX idx_answers_submitted_at ON answers(submitted_at);
CREATE INDEX idx_game_scores_game_session_id ON game_scores(game_session_id);
CREATE INDEX idx_game_scores_team_id ON game_scores(team_id);
CREATE INDEX idx_game_scores_rank ON game_scores(rank);
CREATE INDEX idx_question_scores_game_session_id ON question_scores(game_session_id);
CREATE INDEX idx_question_scores_team_id ON question_scores(team_id);
CREATE INDEX idx_leaderboards_game_session_id ON leaderboards(game_session_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
