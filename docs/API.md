# API Documentation - Cyber Etymology

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication Endpoints

### 1. **POST** `/auth/signup`
Register a new team

**Request Body:**
```json
{
  "teamName": "string (unique, required)",
  "members": [
    { "name": "string" },
    { "name": "string" },
    { "name": "string" }
  ],
  "collegeId": "string (unique, required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "teamId": "uuid",
    "token": "jwt_token",
    "expiresIn": "7d"
  }
}
```

**Error Responses:**
- `400` - Missing required fields or validation error
- `409` - Team name or College ID already exists

---

### 2. **POST** `/auth/login`
Login team member

**Request Body:**
```json
{
  "collegeId": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "teamId": "uuid",
    "teamName": "string",
    "token": "jwt_token",
    "expiresIn": "7d"
  }
}
```

---

### 3. **POST** `/auth/logout`
Logout team (invalidate token)

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Game Endpoints

### 4. **POST** `/game/start`
Start a new game session (Admin only)

**Headers:** Authorization required (Admin)

**Request Body:**
```json
{
  "round": "preliminary | finals"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameId": "uuid",
    "round": "preliminary",
    "status": "in-progress",
    "startedAt": "ISO 8601 timestamp"
  }
}
```

---

### 5. **POST** `/game/pause`
Pause current game (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Game paused"
}
```

---

### 6. **POST** `/game/stop`
Stop current game (Admin only)

**Response:**
```json
{
  "success": true,
  "message": "Game stopped",
  "data": {
    "gameId": "uuid",
    "finalScores": [...]
  }
}
```

---

### 7. **POST** `/game/next-question`
Advance to next question (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "questionIndex": 2,
    "character": "A",
    "type": "START",
    "timeLimit": 30
  }
}
```

---

## Submission Endpoints

### 8. **POST** `/submission/answer`
Submit answer for current question

**Headers:** Authorization required (Team)

**Request Body:**
```json
{
  "questionId": "uuid",
  "word": "string",
  "timeTaken": "number (seconds)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "word": "algorithm",
    "score": 15,
    "message": "Word is valid!",
    "breakdown": {
      "letters": [
        { "letter": "a", "value": 1 },
        { "letter": "l", "value": 2 }
        // ... more letters
      ],
      "totalScore": 15
    }
  }
}
```

**Error Response (Invalid Word):**
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "word": "running",
    "score": 0,
    "message": "Words ending with 'ing' are not allowed",
    "errorCode": "ENDS_WITH_ING"
  }
}
```

---

### 9. **GET** `/submission/answers/:questionId`
Get all answers for a question (Admin only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "teamId": "uuid",
      "teamName": "Team Alpha",
      "word": "algorithm",
      "score": 15,
      "isValid": true,
      "submittedAt": "ISO 8601 timestamp"
    }
  ]
}
```

---

## Team Endpoints

### 10. **GET** `/team/info`
Get current team information

**Headers:** Authorization required (Team)

**Response:**
```json
{
  "success": true,
  "data": {
    "teamId": "uuid",
    "teamName": "Team Alpha",
    "collegeId": "COLLEGE001",
    "members": [
      { "name": "John", "id": "uuid" },
      { "name": "Jane", "id": "uuid" },
      { "name": "Jack", "id": "uuid" }
    ],
    "createdAt": "ISO 8601 timestamp"
  }
}
```

---

### 11. **GET** `/team/all`
Get all teams (Admin only)

**Headers:** Authorization required (Admin)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Results per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "teamId": "uuid",
      "teamName": "Team Alpha",
      "memberCount": 3,
      "totalScore": 250,
      "rank": 1,
      "isActive": true,
      "isDisqualified": false
    }
  ]
}
```

---

### 12. **PUT** `/team/disqualify/:teamId`
Disqualify a team (Admin only)

**Headers:** Authorization required (Admin)

**Request Body:**
```json
{
  "reason": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Team disqualified",
  "data": {
    "teamId": "uuid",
    "disqualifiedAt": "ISO 8601 timestamp",
    "reason": "string"
  }
}
```

---

## Leaderboard Endpoints

### 13. **GET** `/leaderboard/current`
Get current leaderboard standings

**Response:**
```json
{
  "success": true,
  "data": {
    "standings": [
      {
        "rank": 1,
        "teamId": "uuid",
        "teamName": "Team Alpha",
        "score": 250,
        "timeTaken": 1200,
        "questionScores": [50, 60, 40, 50, 50]
      }
    ],
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

---

### 14. **GET** `/leaderboard/finals`
Get final round leaderboard

**Response:**
```json
{
  "success": true,
  "data": {
    "round": "finals",
    "standings": [
      {
        "rank": 1,
        "teamId": "uuid",
        "teamName": "Team Alpha",
        "score": 500,
        "timeTaken": 2400
      }
    ],
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

---

## Admin Endpoints

### 15. **GET** `/admin/dashboard`
Get admin dashboard data

**Headers:** Authorization required (Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "teamsCount": 50,
    "activeGame": {
      "gameId": "uuid",
      "status": "in-progress",
      "round": "preliminary",
      "currentQuestion": 2,
      "startedAt": "ISO 8601 timestamp"
    },
    "recentResults": [],
    "stats": {
      "totalQuestionsAnswered": 250,
      "validAnswersPercentage": 85.5
    }
  }
}
```

---

### 16. **GET** `/admin/analytics`
Get detailed analytics

**Headers:** Authorization required (Admin)

**Query Parameters:**
- `gameId` (optional): Filter by specific game
- `teamId` (optional): Filter by specific team

**Response:**
```json
{
  "success": true,
  "data": {
    "totalGames": 10,
    "totalTeams": 50,
    "averageScore": 200,
    "questionAnalytics": [
      {
        "questionIndex": 1,
        "character": "A",
        "type": "START",
        "totalAttempts": 50,
        "validAnswers": 42,
        "averageScore": 45
      }
    ]
  }
}
```

---

### 17. **POST** `/admin/export-results`
Export game results

**Headers:** Authorization required (Admin)

**Request Body:**
```json
{
  "format": "csv | pdf",
  "gameId": "uuid (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileUrl": "https://...",
    "fileName": "results_2026-03-30.csv",
    "size": "245 KB"
  }
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_CREDENTIALS` | 401 | College ID or password incorrect |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `UNAUTHORIZED` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_ENTRY` | 409 | Team or College ID already exists |
| `GAME_NOT_ACTIVE` | 400 | No active game session |
| `QUESTION_NOT_FOUND` | 404 | Question not found |
| `ALREADY_SUBMITTED` | 400 | Answer already submitted for question |
| `TIME_EXPIRED` | 400 | Time limit exceeded |
| `INVALID_WORD` | 400 | Word failed validation |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting
- 100 requests per minute per IP
- 50 submissions per minute per team

---

## WebSocket Events

See [SOCKET_EVENTS.md](./SOCKET_EVENTS.md) for real-time event documentation.
