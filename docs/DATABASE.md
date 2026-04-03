# Database Schema - Cyber Etymology

## Overview
PostgreSQL relational database with normalized schema for team management, game sessions, questions, answers, scoring, and analytics.

---

## Tables

### 1. `users`
**Purpose:** Store team authentication credentials

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `college_id` | VARCHAR(50) | UNIQUE, NOT NULL | Unique college identifier |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indices:**
- `idx_users_college_id` on `college_id`

---

### 2. `teams`
**Purpose:** Store team information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique team identifier |
| `user_id` | UUID | FOREIGN KEY, UNIQUE | References users table |
| `team_name` | VARCHAR(100) | UNIQUE, NOT NULL | Team name |
| `college_id` | VARCHAR(50) | FOREIGN KEY | References users college_id |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Team creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `is_disqualified` | BOOLEAN | DEFAULT FALSE | Disqualification status |
| `disqualified_reason` | VARCHAR(255) | NULLABLE | Reason for disqualification |
| `disqualified_at` | TIMESTAMP | NULLABLE | Disqualification timestamp |

**Indices:**
- `idx_teams_user_id` on `user_id`
- `idx_teams_college_id` on `college_id`
- `idx_teams_is_active` on `is_active`

---

### 3. `team_members`
**Purpose:** Store team member information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique member identifier |
| `team_id` | UUID | FOREIGN KEY, NOT NULL | References teams |
| `member_name` | VARCHAR(100) | NOT NULL | Member's full name |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Indices:**
- `idx_team_members_team_id` on `team_id`

---

### 4. `game_sessions`
**Purpose:** Store game session information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique game session ID |
| `status` | VARCHAR(20) | DEFAULT 'pending' | Game state (pending, in-progress, paused, completed) |
| `round` | VARCHAR(20) | DEFAULT 'preliminary' | Round type (preliminary, finals) |
| `current_question_index` | INT | DEFAULT 0 | Current question number (1-5) |
| `total_questions` | INT | DEFAULT 5 | Total questions per round |
| `started_at` | TIMESTAMP | NULLABLE | Game start time |
| `paused_at` | TIMESTAMP | NULLABLE | Pause time |
| `ended_at` | TIMESTAMP | NULLABLE | Game end time |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Constraints:**
- `status IN ('pending', 'in-progress', 'paused', 'completed')`
- `round IN ('preliminary', 'finals')`

---

### 5. `questions`
**Purpose:** Store questions for each game

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique question ID |
| `game_session_id` | UUID | FOREIGN KEY, NOT NULL | References game_sessions |
| `question_index` | INT | NOT NULL | Question number (1-5) |
| `question_type` | VARCHAR(20) | NOT NULL | Type: START or CONTAIN |
| `characters` | VARCHAR(10) | NOT NULL | Character(s) to use |
| `time_limit` | INT | NOT NULL | Time limit in seconds |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |

**Constraints:**
- `question_type IN ('START', 'CONTAIN')`
- `question_index BETWEEN 1 AND 5`

**Indices:**
- `idx_questions_game_session_id` on `game_session_id`

---

### 6. `answers`
**Purpose:** Store team submissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique answer ID |
| `question_id` | UUID | FOREIGN KEY, NOT NULL | References questions |
| `game_session_id` | UUID | FOREIGN KEY, NOT NULL | References game_sessions |
| `team_id` | UUID | FOREIGN KEY, NOT NULL | References teams |
| `word` | VARCHAR(100) | NULLABLE | Submitted word (null = skipped) |
| `score` | INT | DEFAULT 0 | Score calculated |
| `is_valid` | BOOLEAN | DEFAULT FALSE | Validation result |
| `validation_message` | TEXT | NULLABLE | Error/success message |
| `validation_error_code` | VARCHAR(50) | NULLABLE | Error code |
| `submitted_at` | TIMESTAMP | NOT NULL | Submission time |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Indices:**
- `idx_answers_question_id` on `question_id`
- `idx_answers_team_id` on `team_id`
- `idx_answers_game_session_id` on `game_session_id`
- `idx_answers_submitted_at` on `submitted_at`

**Unique Constraint:** One answer per team per question
```sql
UNIQUE(question_id, team_id)
```

---

### 7. `game_scores`
**Purpose:** Store cumulative scores per game

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique record ID |
| `game_session_id` | UUID | FOREIGN KEY, NOT NULL | References game_sessions |
| `team_id` | UUID | FOREIGN KEY, NOT NULL | References teams |
| `total_score` | INT | DEFAULT 0 | Total score for game |
| `rank` | INT | NULLABLE | Final ranking |
| `is_qualified_for_finals` | BOOLEAN | DEFAULT FALSE | Finals qualification |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indices:**
- `idx_game_scores_game_session_id` on `game_session_id`
- `idx_game_scores_team_id` on `team_id`
- `idx_game_scores_rank` on `rank`

**Unique Constraint:** One score entry per game per team
```sql
UNIQUE(game_session_id, team_id)
```

---

### 8. `question_scores`
**Purpose:** Store per-question scores for detailed analytics

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique record ID |
| `game_session_id` | UUID | FOREIGN KEY, NOT NULL | References game_sessions |
| `team_id` | UUID | FOREIGN KEY, NOT NULL | References teams |
| `question_index` | INT | NOT NULL | Question number |
| `score` | INT | DEFAULT 0 | Score for this question |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Indices:**
- `idx_question_scores_game_session_id` on `game_session_id`
- `idx_question_scores_team_id` on `team_id`

**Unique Constraint:** One score entry per team per question per game
```sql
UNIQUE(game_session_id, team_id, question_index)
```

---

### 9. `leaderboards`
**Purpose:** Denormalized leaderboard for fast queries

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique record ID |
| `game_session_id` | UUID | UNIQUE, FOREIGN KEY | References game_sessions |
| `standings` | JSONB | NOT NULL | Array of standings (denormalized) |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indices:**
- `idx_leaderboards_game_session_id` on `game_session_id`

**Example JSONB Structure:**
```json
[
  {
    "rank": 1,
    "teamId": "uuid",
    "teamName": "Team Alpha",
    "score": 250,
    "timeTaken": 1200,
    "questionScores": [50, 60, 40, 50, 50]
  }
]
```

---

### 10. `admin_users`
**Purpose:** Store admin authentication

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique admin ID |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Admin username |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role` | VARCHAR(20) | DEFAULT 'admin' | Role (admin, super-admin) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |
| `last_login` | TIMESTAMP | NULLABLE | Last login timestamp |

---

### 11. `sessions`
**Purpose:** Store active sessions and refresh tokens

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique session ID |
| `user_id` | UUID | FOREIGN KEY, NULLABLE | References users |
| `admin_user_id` | UUID | FOREIGN KEY, NULLABLE | References admin_users |
| `token_hash` | VARCHAR(255) | NOT NULL | Hashed token |
| `expires_at` | TIMESTAMP | NOT NULL | Token expiration time |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Session creation time |

---

### 12. `audit_logs`
**Purpose:** Store audit trail of actions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique log ID |
| `action` | VARCHAR(100) | NOT NULL | Action performed |
| `entity_type` | VARCHAR(50) | NULLABLE | Type of entity affected |
| `entity_id` | UUID | NULLABLE | ID of affected entity |
| `user_id` | UUID | FOREIGN KEY, NULLABLE | Team user performing action |
| `admin_user_id` | UUID | FOREIGN KEY, NULLABLE | Admin performing action |
| `details` | JSONB | NULLABLE | Additional details |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Log creation time |

**Indices:**
- `idx_audit_logs_action` on `action`
- `idx_audit_logs_user_id` on `user_id`

**Example Details:**
```json
{
  "wordSubmitted": "algorithm",
  "score": 15,
  "isValid": true,
  "timeTaken": 5
}
```

---

## Relationships

```
users (1) ──────── (1) teams ──────── (N) team_members
          ──────── (N) answers

admin_users ──────── (N) audit_logs

game_sessions ──────── (N) questions ──────── (N) answers
           ──────── (1) leaderboards
           ──────── (N) game_scores
           ──────── (N) question_scores

answers ──────┐
             └──── score calculation

teams ──────┐
           └──── game_scores
           └──── question_scores
```

---

## Query Examples

### Get Leaderboard
```sql
SELECT 
  gs.rank,
  t.team_name,
  gs.total_score,
  (SELECT EXTRACT(EPOCH FROM MAX(submitted_at)) FROM answers 
   WHERE team_id = t.id AND game_session_id = gs.game_session_id) as time_taken
FROM game_scores gs
JOIN teams t ON gs.team_id = t.id
WHERE gs.game_session_id = $1
ORDER BY gs.rank ASC;
```

### Get Team Scores per Question
```sql
SELECT 
  qs.question_index,
  qs.score,
  a.word,
  a.is_valid
FROM question_scores qs
LEFT JOIN answers a ON qs.team_id = a.team_id 
  AND qs.game_session_id = a.game_session_id
WHERE qs.team_id = $1 AND qs.game_session_id = $2
ORDER BY qs.question_index ASC;
```

### Get Validation Statistics
```sql
SELECT 
  a.validation_error_code,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM answers a
WHERE a.game_session_id = $1 AND a.is_valid = FALSE
GROUP BY a.validation_error_code
ORDER BY count DESC;
```

---

## Performance Considerations

1. **Indexing**: All foreign keys and frequently queried fields are indexed
2. **Denormalization**: Leaderboard table stores pre-calculated standings for fast retrieval
3. **Partitioning**: Consider partitioning by `game_session_id` for large datasets
4. **Archival**: Implement data retention policy for old game sessions

---

## Backup & Recovery

### Backup Strategy
```bash
# Full backup
pg_dump cyber_etymology > backup_full.sql

# Compressed backup
pg_dump cyber_etymology | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Recovery
```bash
# From full backup
psql cyber_etymology < backup_full.sql

# From compressed backup
gunzip < backup_20260330.sql.gz | psql cyber_etymology
```

---

## Monitoring Queries

### Check Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Index Usage
```sql
SELECT 
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```
