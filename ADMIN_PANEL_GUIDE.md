# ADMIN PANEL & FRONTEND IMPLEMENTATION GUIDE

Complete guide for implementing the admin dashboard and all frontend features.

---

## 🎯 ADMIN PANEL OVERVIEW

**Location**: `frontend/src/pages/admin.tsx` + `frontend/src/components/AdminDashboard.tsx`

The admin panel has **4 main tabs**:
1. **Game Control** - Start, pause, stop games
2. **Team Monitoring** - Manage teams, disqualify
3. **Live Leaderboard** - Real-time rankings
4. **Analytics** - Statistics & export

---

## 📋 TAB 1: GAME CONTROL

### Features to Implement

#### A. Start Game Button
**When clicked:**
- Show dialog to configure game
- Options:
  - Round selection (preliminary/finals)
  - Total questions: 5 (fixed)
  - Question types: SELECT START or CONTAIN for each
  - Characters: Type letters for each question
  - Time limits: 30s for START, 60s for CONTAIN

**Example configuration:**
```
Q1: START with letter "A" (30s)
Q2: START with letter "B" (30s)
Q3: CONTAIN letters "D", "E" (60s)
Q4: CONTAIN letters "R", "S" (60s)
Q5: START with letter "T" (30s)
```

**API to call:**
```typescript
POST /api/game/start
{
  "round": "preliminary",
  "totalQuestions": 5,
  "questionTypes": ["START", "START", "CONTAIN", "CONTAIN", "START"],
  "questionCharacters": [["A"], ["B"], ["D", "E"], ["R", "S"], ["T"]],
  "timeLimits": [30, 30, 60, 60, 30]
}
```

**UI Component needed:**
- Dialog/Modal with form
- Question builder (repeat 5 times)
  - Question type dropdown
  - Character input
  - Time limit display

---

#### B. Pause Game Button
**When clicked:**
- Show confirmation: "Pause game?"
- Call API: `POST /api/game/pause`
- Button changes to "Resume"
- Show status: "PAUSED" in red

**API:**
```typescript
POST /api/game/pause
{
  "gameId": "uuid"
}
```

---

#### C. Resume Game Button
**When paused, show this button instead of Pause**
- Call API: `POST /api/game/resume`
- Button changes back to "Pause"
- Status changes to "IN-PROGRESS" in green

**API:**
```typescript
POST /api/game/resume
{
  "gameId": "uuid"
}
```

---

#### D. Stop Game Button
**When clicked:**
- Show confirmation: "End game? Cannot undo."
- Call API: `POST /api/game/stop`
- Show final leaderboard
- Show message: "Game completed"

**API:**
```typescript
POST /api/game/stop
{
  "gameId": "uuid"
}
```

---

#### E. Current Game Status Display
**Always visible at top:**
```
┌─────────────────────────────────┐
│ Current Game: Game123           │
│ Round: Preliminary              │
│ Status: IN-PROGRESS (green)     │
│ Question: 2 of 5                │
│ Elapsed: 15:32                  │
│ Teams: 43 active                │
└─────────────────────────────────┘
```

**Data from API:**
```typescript
GET /api/admin/dashboard
// Returns currentGame object
```

---

#### F. Next Question Button (Optional but useful)
**Admin can manually advance to next question**
- Call API: `POST /api/game/next-question`
- Update question counter
- Broadcast to all teams

---

## 📋 TAB 2: TEAM MONITORING

### Features to Implement

#### A. Team List Display
**Show all teams with:**
- Team rank
- Team name
- College ID
- Member count (always 3)
- Current score
- Submissions made
- Validation success rate
- Status (ACTIVE / DISQUALIFIED)
- Actions: Disqualify, View details

**Example table:**
```
Rank | Team Name         | Score | Submissions | Success | Status
-----|-------------------|-------|-------------|---------|----------
1    | Code Warriors     | 450   | 5/5         | 100%    | ACTIVE
2    | Debug Ninjas      | 420   | 5/5         | 100%    | ACTIVE
3    | Bytewise          | 380   | 5/5         | 80%     | ACTIVE
X    | Cheating Team     | 100   | 3/5         | 60%     | DISQUALIFIED
```

**API to get data:**
```typescript
GET /api/team/all?page=1&limit=50&sort=score

Response:
{
  "teams": [
    {
      "teamId": "uuid",
      "teamName": "Code Warriors",
      "score": 450,
      "submissions": 5,
      "validSubmissions": 5,
      "isDisqualified": false,
      "rank": 1
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 43 }
}
```

---

#### B. Search & Filter
**Implement:**
- Search by team name
- Filter by status (Active/Disqualified)
- Sort by: Score, Name, Date joined
- Pagination: Show 20/50/100 per page

**Frontend code:**
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [filterStatus, setFilterStatus] = useState('all');
const [sortBy, setSortBy] = useState('score');

// API call with filters
const response = await api.get('/api/team/all', {
  params: {
    search: searchTerm,
    status: filterStatus,
    sort: sortBy,
    page: 1,
    limit: 50
  }
});
```

---

#### C. Disqualify Team Action
**When clicking "Disqualify" button:**
1. Show confirmation dialog
2. Ask for reason (dropdown):
   - Cheating detected
   - Refresh exploit
   - Invalid submissions
   - Multiple accounts
   - Other (text input)
3. Call API: `POST /api/team/disqualify`
4. Refresh team list
5. Show success toast

**API:**
```typescript
POST /api/team/disqualify
{
  "teamId": "uuid",
  "reason": "Cheating detected - refresh exploit"
}

Response:
{
  "success": true,
  "message": "Team disqualified successfully"
}
```

---

#### D. View Team Details
**Optional: Click on team row to see:**
- Team members (3 names)
- All submissions for current game
- Each submission: word, validity, score, time taken
- Team's join date

---

#### E. Recent Submissions Widget
**Show last 10 submissions with:**
- Team name
- Word submitted
- Valid? (✓/✗)
- Score
- Time submitted

**Updates in real-time via WebSocket:**
```javascript
socket.on('answer-validated', (data) => {
  // Add to recent submissions list
  setRecentSubmissions([data, ...recentSubmissions.slice(0, 9)]);
});
```

---

## 📋 TAB 3: LIVE LEADERBOARD

### Features to Implement

#### A. Leaderboard Table
**Display current game leaderboard:**

```
Rank | Team Name        | Questions | Valid | Score | Avg Time
-----|------------------|-----------|-------|-------|----------
1    | Code Warriors    | 5/5       | 5     | 450   | 28s
2    | Debug Ninjas     | 5/5       | 4     | 420   | 35s
3    | Bytewise         | 5/5       | 3     | 380   | 40s
4    | Tech Titans      | 4/5       | 3     | 320   | 42s
5    | Code Breakers    | 5/5       | 4     | 315   | 45s
...
```

**Data from API:**
```typescript
GET /api/leaderboard/current?gameId=uuid&limit=50

Response:
{
  "leaderboard": [
    {
      "rank": 1,
      "teamId": "uuid",
      "teamName": "Code Warriors",
      "score": 450,
      "validAnswers": 5,
      "totalAnswers": 5,
      "avgTime": 28,
      "lastUpdated": "2024-01-15T14:35:00Z"
    }
  ]
}
```

---

#### B. Real-time Updates
**Update leaderboard automatically when:**
- New submission validated
- Team disqualified (appears at bottom)
- Question skipped

**Connect via Socket.IO:**
```javascript
socket.on('leaderboard-update', (data) => {
  // Update leaderboard array
  setLeaderboard(data.leaderboard);
  
  // Highlight changed team
  highlightTeam(data.teamId, 500); // 500ms animation
});
```

---

#### C. Leaderboard Animations
- **New rank**: Slide in with highlight
- **Score update**: Pulse animation
- **Rank change**: Swap with smooth transition
- **Disqualified**: Move to bottom with red background

---

#### D. Finals Leaderboard Button
**Show button to view finals leaderboard (after game ends):**
```typescript
GET /api/leaderboard/finals

Response:
{
  "leaderboard": [
    {
      "rank": 1,
      "teamName": "Code Warriors",
      "prelimScore": 450,
      "finalsScore": 480,
      "totalScore": 930
    }
  ]
}
```

---

## 📋 TAB 4: ANALYTICS

### Features to Implement

#### A. Statistics Cards
**Display 6 cards:**

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Total Teams     │   │ Active Teams    │   │ Disqualified    │
│       45        │   │       43        │   │        2        │
└─────────────────┘   └─────────────────┘   └─────────────────┘

┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Total Subs      │   │ Valid Subs      │   │ Invalid Subs    │
│      225        │   │      189        │   │       36        │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

**Data from API:**
```typescript
GET /api/admin/analytics?gameId=uuid

Response:
{
  "gameStatistics": {
    "totalTeams": 45,
    "avgScore": 385.2,
    "medianScore": 380,
    "minScore": 120,
    "maxScore": 480,
    "standardDeviation": 95.3
  },
  "submissionAnalytics": {
    "totalSubmissions": 225,
    "validSubmissions": 189,
    "validRate": 84,
    "invalidSubmissions": 36,
    "skippedQuestions": 25
  }
}
```

---

#### B. Score Distribution Chart
**Show histogram/bar chart:**
- X-axis: Score ranges (0-100, 100-200, etc.)
- Y-axis: Number of teams
- Use library: Chart.js or Recharts

**Example:**
```
Teams by Score Range
200 │
    │     ▓▓▓
150 │     ▓▓▓
    │ ▓▓▓ ▓▓▓ ▓▓▓
100 │ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓
 50 │ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓
  0 └─┴─┴─┴─┴─┴─┴─┴─┴─
    0   100 200 300 400 500
```

---

#### C. Validation Error Breakdown
**Show which validation rules failed most:**

```
Validation Error Types:
┌──────────────────────────┬───────┐
│ Not Tech-Related         │   12  │
│ Proper Noun              │    8  │
│ Programming Language     │    7  │
│ Ends with -ING           │    5  │
│ Plural (ends in S)       │    3  │
│ Acronym                  │    1  │
└──────────────────────────┴───────┘
```

**Data:**
```typescript
"validationErrors": {
  "NOT_TECH_RELATED": 12,
  "PROPER_NOUN": 8,
  "PROGRAMMING_LANGUAGE": 7,
  "ENDS_WITH_ING": 5,
  "PLURAL_WORD": 3,
  "ACRONYM": 1
}
```

---

#### D. Time Analytics
**Show average time per question:**

```
Average Time Per Question:
Q1 (START): 28s  ████████████████████░░░░
Q2 (START): 30s  ██████████████████████░░░░░
Q3 (CONTAIN): 38s  ████████████████████████████░░░░░░░░░░
Q4 (CONTAIN): 42s  ██████████████████████████████░░░░░░░░░░░░░░░░
Q5 (START): 25s  ████████████████░░░░░░
```

**Data:**
```typescript
"timeAnalytics": {
  "avgTimePerQuestion": 32.5,
  "avgTimeQuestion1": 28,
  "avgTimeQuestion2": 30,
  "avgTimeQuestion3": 38,
  "avgTimeQuestion4": 42,
  "avgTimeQuestion5": 25
}
```

---

#### E. Export Results Button
**Two export options:**

**1. CSV Export**
- Click button → Download CSV file
- Include: Team name, rank, score, answers, timestamps

**API:**
```typescript
GET /api/admin/export?gameId=uuid&format=csv
// Returns file download
```

**CSV content:**
```
Team Name,Rank,Score,Valid Answers,Invalid Answers,Avg Time
Code Warriors,1,450,5,0,28
Debug Ninjas,2,420,4,1,35
Bytewise,3,380,3,2,40
```

**2. PDF Export**
- Click button → Download PDF report
- Include: Cover page, leaderboard, analytics
- Chart visualizations

**API:**
```typescript
GET /api/admin/export?gameId=uuid&format=pdf
// Returns PDF file download
```

---

## 🎮 GAME SCREEN IMPLEMENTATION

**Location**: `frontend/src/pages/game.tsx` + `frontend/src/components/GameScreen.tsx`

### Features to Implement

#### A. Question & Timer Display
```
┌──────────────────────────────────────┐
│ Question 2 of 5                      │
├──────────────────────────────────────┤
│                                      │
│ Find a word that STARTS with 'B'     │
│                                      │
│              58 seconds remaining    │
│              00:58 (animated)        │
│                                      │
└──────────────────────────────────────┘
```

**Timer implementation:**
```typescript
const [timeRemaining, setTimeRemaining] = useState(30);

useEffect(() => {
  if (timeRemaining <= 0) {
    handleTimeUp();
    return;
  }
  
  const interval = setInterval(() => {
    setTimeRemaining(t => t - 1);
  }, 1000);
  
  return () => clearInterval(interval);
}, [timeRemaining]);
```

---

#### B. Word Input
```
┌─────────────────────────────────────┐
│ Enter your word:                    │
├─────────────────────────────────────┤
│ [_________________________]          │
│  (only alphabetic characters)       │
├─────────────────────────────────────┤
│  [ Submit ]  [ Skip ]               │
└─────────────────────────────────────┘
```

**Input handling:**
```typescript
const [word, setWord] = useState('');

const handleKeyPress = (e) => {
  // BLOCK Enter key - must use Submit button
  if (e.key === 'Enter') {
    e.preventDefault();
    return;
  }
  
  // Allow only alphabetic
  if (!/[a-zA-Z]/.test(e.key)) {
    e.preventDefault();
  }
};
```

---

#### C. Submit Button
**When clicked:**
- Send word to backend via API
- Show loading state
- Wait for validation response
- Show result (✓ VALID or ✗ INVALID)
- Show score (if valid)
- Move to next question (auto)

**API call:**
```typescript
POST /api/submission/answer
{
  "gameId": "uuid",
  "questionIndex": 1,
  "word": "byte",
  "timeSpent": 25
}

Response:
{
  "success": true,
  "data": {
    "isValid": true,
    "word": "byte",
    "score": 11,
    "scoreBreakdown": { "b": 3, "y": 8 }
  }
}
```

---

#### D. Skip Button
**When clicked:**
- Skip current question (no score)
- Move to next question
- API call:
```typescript
POST /api/submission/skip
{
  "gameId": "uuid",
  "questionIndex": 1
}
```

---

#### E. Score Display
**Show cumulative score:**
```
Your Score: 87 points

Questions answered: 3 of 5
├─ Q1: 26 points ✓
├─ Q2: 0 points  ✗
└─ Q3: 58 points ✓
```

**Update on each valid submission:**
```javascript
socket.on('answer-validated', (data) => {
  setTotalScore(data.totalScore);
  setAnswers([...answers, data]);
});
```

---

#### F. Live Leaderboard Widget
**Show top 5 teams in sidebar:**
```
LIVE LEADERBOARD
┌────────────────────────┐
│ 🥇 Code Warriors  450  │
│ 🥈 Debug Ninjas   420  │
│ 🥉 Bytewise       380  │
│ 4. Tech Titans    320  │
│ 5. Code Breakers  315  │
└────────────────────────┘

Your Team Rank: 3
```

**Real-time updates:**
```javascript
socket.on('leaderboard-update', (data) => {
  setLeaderboard(data.leaderboard);
});
```

---

#### G. Fullscreen Enforcement
**Auto-fullscreen on game start:**
```typescript
useEffect(() => {
  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.log('Fullscreen request failed');
    }
  };
  
  enterFullscreen();
  
  return () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };
}, []);
```

---

#### H. Validation Result Display
**After clicking Submit:**

**If VALID:**
```
┌─────────────────────────────────┐
│ ✓ VALID!                        │
│ Word: "byte"                    │
│ Score: 11 points                │
│ b=3 + y=8                       │
│                                 │
│ Total Score: 87                 │
└─────────────────────────────────┘
(Auto-advance to next Q in 2s)
```

**If INVALID:**
```
┌─────────────────────────────────┐
│ ✗ INVALID                       │
│ Word: "running"                 │
│ Reason: "Words ending with ING  │
│         are not allowed"        │
│                                 │
│ Try another word...             │
└─────────────────────────────────┘
(Input clears, focus returns)
```

---

## 🎨 STYLING & THEME

Already implemented in: `frontend/src/styles/globals.css`

**Colors used:**
- Background: #0a0e27 (dark blue-black)
- Primary: #00d4ff (cyan blue)
- Success: #00ff41 (lime green)
- Accent: #b300ff (purple)
- Highlight: #ff006e (pink)

**Apply to components:**
```jsx
// Button
<button className="bg-cyber-blue hover:bg-cyber-blue/80">
  Submit
</button>

// Input
<input className="bg-cyber-dark border-2 border-cyber-blue />

// Score display
<div className="text-cyber-green font-bold">
  Score: 450
</div>
```

---

## 🔗 API CONNECTIONS CHECKLIST

### Admin Dashboard
- [ ] `/api/admin/dashboard` - GET (load initial data)
- [ ] `/api/game/start` - POST (start game)
- [ ] `/api/game/pause` - POST
- [ ] `/api/game/resume` - POST
- [ ] `/api/game/stop` - POST
- [ ] `/api/team/all` - GET (team list)
- [ ] `/api/team/disqualify` - POST
- [ ] `/api/admin/analytics` - GET
- [ ] `/api/admin/export` - GET
- [ ] `/api/leaderboard/current` - GET
- [ ] `/api/leaderboard/finals` - GET

### Game Screen
- [ ] `/api/submission/answer` - POST
- [ ] `/api/submission/skip` - POST
- [ ] `/api/leaderboard/current` - GET
- [ ] WebSocket: `question-released`
- [ ] WebSocket: `timer-update`
- [ ] WebSocket: `answer-validated`
- [ ] WebSocket: `leaderboard-update`
- [ ] WebSocket: `game-status`

### Login/Signup Pages
- [ ] `/api/auth/signup` - POST
- [ ] `/api/auth/login` - POST
- [ ] `/api/auth/logout` - POST

---

## 📚 Reference Files

- **Admin Component**: `frontend/src/components/AdminDashboard.tsx` (stub)
- **Game Component**: `frontend/src/components/GameScreen.tsx` (stub)
- **Admin Page**: `frontend/src/pages/admin.tsx`
- **Game Page**: `frontend/src/pages/game.tsx`
- **Global Styles**: `frontend/src/styles/globals.css` (theme ready)
- **API Examples**: `docs/API_EXAMPLES.md` (40+ curl examples)
- **Database**: `docs/DATABASE.md` (schema reference)

---

## 🧪 Testing Components

### Test Admin Start Game
1. Click "Start Game" button
2. Fill in configuration
3. Click "Start"
4. Verify game appears in dashboard
5. Check question displays on game screen

### Test Player Gameplay
1. Login as team
2. See question & timer
3. Enter word
4. Click Submit
5. See validation result
6. Check score updated
7. Check leaderboard updated

### Test Real-time Updates
1. Open 2 browser windows (admin + player)
2. Admin: Start game
3. Player: Should see question appear
4. Player: Submit answer
5. Admin: Should see recent submission
6. Admin + Player: Both should see updated leaderboard

---

**Start implementing these components and features one by one. Reference `docs/API_EXAMPLES.md` for all API request/response examples.**
