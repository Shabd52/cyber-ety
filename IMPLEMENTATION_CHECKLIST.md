# IMPLEMENTATION GUIDE - APIs & Admin Panel Checklist

Complete checklist of all APIs and admin features that need to be implemented and configured.

---

## 📋 PART 1: AUTHENTICATION APIS (3 endpoints)

### ✅ 1. auth/signup - POST
**Location**: `backend/src/routes/auth.ts`

**What to implement:**
- Accept team name, 3 member names, college ID, password
- Hash password with bcrypt
- Create user & team in database
- Generate JWT token
- Return token & team info

**Database tables to use:**
- `users` (college_id, password_hash)
- `teams` (user_id, team_name)
- `team_members` (team_id, member_name)

**Request example:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "Code Warriors",
    "collegeId": "COLLEGE001",
    "members": [
      {"name": "Alice"},
      {"name": "Bob"},
      {"name": "Charlie"}
    ],
    "password": "SecurePass123!"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "teamId": "uuid",
    "token": "jwt_token",
    "expiresIn": "7d"
  }
}
```

---

### ✅ 2. auth/login - POST
**Location**: `backend/src/routes/auth.ts`

**What to implement:**
- Accept college ID & password
- Verify password against hash
- Generate JWT token
- Return token & team info

**Key functions to use:**
- `verifyPassword()` from bcrypt
- `generateTeamToken()` from middleware/auth.ts

**Request example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "collegeId": "COLLEGE001",
    "password": "SecurePass123!"
  }'
```

---

### ✅ 3. auth/logout - POST
**Location**: `backend/src/routes/auth.ts`

**What to implement:**
- Invalidate the JWT token
- Remove session from database
- Return success response

**Database table:**
- `sessions` (invalidate by setting expires_at to now)

---

## 📋 PART 2: TEAM MANAGEMENT APIS (3 endpoints)

### ✅ 4. team/info - GET
**Location**: `backend/src/routes/team.ts`

**What to implement:**
- Get current team info (from JWT token)
- Return team name, members, college ID
- Return team status (active/disqualified)

**Required middleware:**
- `verifyTeamAuth` - Check JWT token

**Response example:**
```json
{
  "success": true,
  "data": {
    "teamId": "uuid",
    "teamName": "Code Warriors",
    "collegeId": "COLLEGE001",
    "members": [{"name": "Alice"}, {"name": "Bob"}, {"name": "Charlie"}],
    "isActive": true,
    "isDisqualified": false
  }
}
```

---

### ✅ 5. team/all - GET (ADMIN ONLY)
**Location**: `backend/src/routes/team.ts`

**What to implement:**
- List all teams with pagination
- Support sorting (by score, name, date)
- Show team stats (total score, member count)
- Admin authentication required

**Required middleware:**
- `verifyAdminAuth` - Check if user is admin

**Query parameters:**
```
?page=1&limit=20&sort=score
```

**Response example:**
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "teamId": "uuid",
        "teamName": "Code Warriors",
        "score": 450,
        "memberCount": 3,
        "isDisqualified": false
      }
    ],
    "pagination": {"page": 1, "limit": 20, "total": 45}
  }
}
```

---

### ✅ 6. team/disqualify - POST (ADMIN ONLY)
**Location**: `backend/src/routes/team.ts`

**What to implement:**
- Disqualify a team (prevent from playing)
- Mark in database as disqualified
- Log the action

**Body:**
```json
{
  "teamId": "uuid",
  "reason": "Cheating detected"
}
```

**Database update:**
```sql
UPDATE teams SET is_disqualified = true WHERE id = $1
```

---

## 📋 PART 3: GAME MANAGEMENT APIS (4 endpoints)

### ✅ 7. game/start - POST (ADMIN ONLY)
**Location**: `backend/src/routes/game.ts`

**What to implement:**
- Create new game session
- Set game status to "in-progress"
- Import questions
- Broadcast to all teams via Socket.IO

**Body:**
```json
{
  "round": "preliminary",
  "totalQuestions": 5,
  "questionTypes": ["START", "START", "CONTAIN", "CONTAIN", "START"],
  "questionCharacters": [["A"], ["B"], ["D", "E"], ["R", "S"], ["T"]],
  "timeLimits": [30, 30, 60, 60, 30]
}
```

**Database:**
- Insert into `game_sessions` table
- Insert 5 records into `questions` table

**WebSocket broadcast:**
```javascript
io.emit('game-started', {
  gameId: 'uuid',
  questions: [...]
})
```

---

### ✅ 8. game/pause - POST (ADMIN ONLY)
**Location**: `backend/src/routes/game.ts`

**What to implement:**
- Pause current game
- Update game_sessions status to "paused"
- Broadcast pause event

**WebSocket broadcast:**
```javascript
io.emit('game-paused', { gameId: 'uuid' })
```

---

### ✅ 9. game/resume - POST (ADMIN ONLY)
**Location**: `backend/src/routes/game.ts`

**What to implement:**
- Resume paused game
- Update status to "in-progress"
- Broadcast resume event

---

### ✅ 10. game/stop - POST (ADMIN ONLY)
**Location**: `backend/src/routes/game.ts`

**What to implement:**
- End game session
- Calculate final scores
- Update game_sessions status to "completed"
- Return final leaderboard

---

## 📋 PART 4: SUBMISSION APIS (2 endpoints)

### ✅ 11. submission/answer - POST (PLAYER)
**Location**: `backend/src/routes/submission.ts`

**What to implement:**
- Accept word submission
- Validate word using `validateWord()` from utils/validation.ts
- Calculate score using `calculateScore()` from utils/scoring.ts
- Store submission in database
- Broadcast to admin & update leaderboard
- Return validation result

**Body:**
```json
{
  "gameId": "uuid",
  "questionIndex": 1,
  "word": "algorithm",
  "timeSpent": 25
}
```

**Key function calls:**
```typescript
import { validateWord, calculateScore } from '../utils/validation';

const validation = validateWord(word, questionType, characters);
const score = calculateScore(word);
```

**Database:**
```sql
INSERT INTO answers (question_id, team_id, word, score, is_valid)
VALUES ($1, $2, $3, $4, $5)
```

**WebSocket broadcast:**
```javascript
io.emit('answer-validated', {
  teamName: 'Code Warriors',
  word: 'algorithm',
  isValid: true,
  score: 26
})
```

---

### ✅ 12. submission/skip - POST (PLAYER)
**Location**: `backend/src/routes/submission.ts`

**What to implement:**
- Mark question as skipped
- No score for this question
- Move to next question

---

## 📋 PART 5: LEADERBOARD APIS (2 endpoints)

### ✅ 13. leaderboard/current - GET
**Location**: `backend/src/routes/leaderboard.ts`

**What to implement:**
- Get live leaderboard for current game
- Rank teams by score (highest first)
- Use tiebreaker: fastest submission time
- Cache in JSONB leaderboard table

**Query parameters:**
```
?gameId=uuid&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {"rank": 1, "teamName": "Code Warriors", "score": 450},
      {"rank": 2, "teamName": "Debug Ninjas", "score": 420}
    ]
  }
}
```

---

### ✅ 14. leaderboard/finals - GET
**Location**: `backend/src/routes/leaderboard.ts`

**What to implement:**
- Get final standings after all rounds
- Combine preliminary + finals scores
- Return final rankings

---

## 📋 PART 6: ADMIN PANEL APIS (3 endpoints)

### ✅ 15. admin/dashboard - GET (ADMIN ONLY)
**Location**: `backend/src/routes/admin.ts`

**What to implement:**
- Get admin dashboard data
- Current game status
- Team statistics (total count, disqualified, etc.)
- Recent submissions
- Top teams

**Response:**
```json
{
  "success": true,
  "data": {
    "currentGame": {
      "gameId": "uuid",
      "status": "in-progress",
      "currentQuestion": 2,
      "totalQuestions": 5
    },
    "statistics": {
      "totalTeams": 45,
      "activeTeams": 43,
      "disqualifiedTeams": 2,
      "totalSubmissions": 187,
      "validSubmissions": 156,
      "averageScore": 385.2
    },
    "topTeams": [
      {"rank": 1, "teamName": "Code Warriors", "score": 450}
    ]
  }
}
```

---

### ✅ 16. admin/analytics - GET (ADMIN ONLY)
**Location**: `backend/src/routes/admin.ts`

**What to implement:**
- Game analytics
- Word frequency analysis
- Validation error statistics
- Time analytics per question
- Score distribution

---

### ✅ 17. admin/export - GET (ADMIN ONLY)
**Location**: `backend/src/routes/admin.ts`

**What to implement:**
- Export game results
- Support formats: CSV, PDF
- Include all team scores, answers, timestamps

**Query parameters:**
```
?gameId=uuid&format=csv
```

---

## 🎮 SOCKET.IO EVENTS (Real-time Features)

### Client → Server Events

**1. join-team**
```javascript
socket.emit('join-team', {
  teamId: 'uuid',
  teamName: 'Code Warriors'
})
```

**2. submit-answer**
```javascript
socket.emit('submit-answer', {
  questionId: 'uuid',
  word: 'algorithm',
  score: 26
})
```

**3. skip-question**
```javascript
socket.emit('skip-question', {
  questionId: 'uuid'
})
```

### Server → Client Events

**1. question-released**
```javascript
socket.on('question-released', (data) => {
  // Display new question to all teams
  console.log(data.question, data.timeLimit)
})
```

**2. timer-update**
```javascript
socket.on('timer-update', (data) => {
  // Update countdown timer
  console.log(data.timeRemaining)
})
```

**3. answer-validated**
```javascript
socket.on('answer-validated', (data) => {
  // Show validation result to team
  console.log(data.isValid, data.score)
})
```

**4. leaderboard-update**
```javascript
socket.on('leaderboard-update', (data) => {
  // Update leaderboard with new rankings
  console.log(data.leaderboard)
})
```

**5. game-status**
```javascript
socket.on('game-status', (data) => {
  // Game paused/resumed/ended
  console.log(data.status)
})
```

---

## 🎨 ADMIN PANEL COMPONENTS (Frontend)

### Location: `frontend/src/components/AdminDashboard.tsx`

**Features to implement:**

### Tab 1: Game Control
- **Start Game** Button
  - Select round (preliminary/finals)
  - Configure 5 questions
  - Set time limits
  - Add characters for each question

- **Pause/Resume** Button
  - Pause current game
  - Resume from pause

- **Stop Game** Button
  - End game session
  - Confirm action
  - Show final leaderboard

### Tab 2: Team Monitoring
- **Team List** with search/filter
  - Show all teams
  - Current scores
  - Submission count
  - Status (active/disqualified)

- **Disqualify Button** for each team
  - Reason selection
  - Confirmation dialog

### Tab 3: Live Leaderboard
- **Real-time leaderboard**
  - Rank, Team name, Score
  - Update every submission
  - Highlight changes

### Tab 4: Analytics
- **Statistics Dashboard**
  - Total teams, submissions, valid/invalid ratio
  - Word frequency chart
  - Score distribution
  - Validation error breakdown

- **Export Button**
  - CSV format
  - PDF format

---

## 🎮 GAME SCREEN (Frontend)

### Location: `frontend/src/components/GameScreen.tsx`

**Features to implement:**

### Display
- Current question (1-5)
- Question type (START or CONTAIN)
- Letter prompt(s)
- Live timer (counting down)
- Score display

### Input
- Text input for word
- Disable Enter key (use button only)
- Character validation

### Actions
- **Submit Button** - Submit answer
- **Skip Button** - Skip question

### Real-time
- Listen to Socket.IO events
- Update leaderboard
- Show validation result
- Play animations on score

### Fullscreen
- Enforce fullscreen mode
- Prevent leaving fullscreen
- Show exit button

---

## 📊 Frontend Pages to Complete

### Page 1: Login (`frontend/src/pages/login.tsx`)
- ✅ Form with college ID & password
- ✅ Error handling
- ✅ Redirect to game on success
- **TODO**: Connect to `/api/auth/login`

### Page 2: Signup (`frontend/src/pages/signup.tsx`)
- ✅ Form with team name, 3 members, college ID, password
- ✅ Validation
- **TODO**: Connect to `/api/auth/signup`

### Page 3: Game (`frontend/src/pages/game.tsx`)
- **TODO**: Import GameScreen component
- **TODO**: Connect to Socket.IO
- **TODO**: Listen for real-time updates
- **TODO**: Handle authentication

### Page 4: Admin (`frontend/src/pages/admin.tsx`)
- **TODO**: Import AdminDashboard component
- **TODO**: Connect to admin APIs
- **TODO**: Implement admin authentication

---

## 🔧 Backend Configuration Required

### 1. Environment Variables (`.env`)
```bash
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=cyber_etymology
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### 2. Database Setup
```bash
# Create database
createdb cyber_etymology

# Run migrations
npm run db:migrate --workspace=backend

# Seed sample data (OPTIONAL)
npm run db:seed --workspace=backend
```

### 3. Socket.IO Configuration
Location: `backend/src/socket.ts`
- Configure CORS
- Setup connection handlers
- Setup room management
- Setup event handlers

### 4. Middleware Setup
Location: `backend/src/server.ts`
- CORS middleware
- helmet (security headers)
- body parser
- request logging
- error handling

---

## 🚀 Implementation Order (Recommended)

### Week 1:
1. ✅ Setup database & migrations
2. ✅ Configure environment variables
3. **auth/signup** - Implementation
4. **auth/login** - Implementation
5. **auth/logout** - Implementation

### Week 2:
6. **team/info** - Get current team
7. **team/all** - List all teams (admin)
8. **team/disqualify** - Disqualify team (admin)
9. **game/start** - Create game session
10. **game/pause/resume/stop** - Game controls

### Week 3:
11. **submission/answer** - Core gameplay
12. **submission/skip** - Skip functionality
13. **leaderboard/current** - Live rankings
14. **leaderboard/finals** - Final rankings

### Week 4:
15. **admin/dashboard** - Admin stats
16. **admin/analytics** - Analytics data
17. **admin/export** - Export results

### Week 5:
18. Frontend: Connect login page
19. Frontend: Connect signup page
20. Frontend: Connect game screen
21. Frontend: Connect admin dashboard

### Week 6:
22. Socket.IO integration
23. Real-time updates
24. Testing & debugging
25. Production deployment

---

## 🧪 Testing Each API

### Example: Test signup endpoint
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "Test Team",
    "collegeId": "COL001",
    "members": [
      {"name": "Alice"},
      {"name": "Bob"},
      {"name": "Charlie"}
    ],
    "password": "Pass123!"
  }'
```

See [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md) for all 40+ examples.

---

## 📚 Reference Documents

- **API Details**: [docs/API.md](docs/API.md)
- **API Examples**: [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md)
- **Database Schema**: [docs/DATABASE.md](docs/DATABASE.md)
- **Development Guide**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **Socket Events**: [docs/SOCKET_EVENTS.md](docs/SOCKET_EVENTS.md)
- **UI Design**: [docs/UI_DESIGN.md](docs/UI_DESIGN.md)

---

## ⚠️ Important Notes

1. **Authentication**: All protected endpoints require JWT token in header
2. **Admin Only**: dashboard, analytics, export, all game controls
3. **WebSocket**: Use Socket.IO for real-time updates
4. **Validation**: Use `validateWord()` from backend/src/utils/validation.ts
5. **Scoring**: Use `calculateScore()` from backend/src/utils/scoring.ts

---

**Start with authentication APIs first, then move to game management.**

For any questions, refer to the documentation in `/docs` folder.
