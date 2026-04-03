# API Examples & cURL Commands

Complete examples of all API endpoints with real requests and responses.

---

## Authentication Endpoints

### 1. Team Signup

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "Code Warriors",
    "collegeId": "COLLEGE001",
    "members": [
      {
        "name": "Alice Johnson",
        "collegeId": "STU001"
      },
      {
        "name": "Bob Smith",
        "collegeId": "STU002"
      },
      {
        "name": "Charlie Brown",
        "collegeId": "STU003"
      }
    ],
    "password": "SecurePass123!"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Team registered successfully",
  "data": {
    "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "teamName": "Code Warriors",
    "collegeId": "COLLEGE001",
    "members": [
      {
        "memberId": "m1",
        "name": "Alice Johnson",
        "collegeId": "STU001"
      },
      {
        "memberId": "m2",
        "name": "Bob Smith",
        "collegeId": "STU002"
      },
      {
        "memberId": "m3",
        "name": "Charlie Brown",
        "collegeId": "STU003"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Team Login

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "collegeId": "COLLEGE001",
    "password": "SecurePass123!"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "teamName": "Code Warriors",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

### 3. Team Logout

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Team Endpoints

### 4. Get Team Info

**Request:**
```bash
curl -X GET http://localhost:5000/api/team/info \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "teamName": "Code Warriors",
    "collegeId": "COLLEGE001",
    "isActive": true,
    "isDisqualified": false,
    "members": [
      {
        "memberId": "m1",
        "name": "Alice Johnson",
        "collegeId": "STU001"
      },
      {
        "memberId": "m2",
        "name": "Bob Smith",
        "collegeId": "STU002"
      },
      {
        "memberId": "m3",
        "name": "Charlie Brown",
        "collegeId": "STU003"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Get All Teams (Admin)

**Request:**
```bash
curl -X GET "http://localhost:5000/api/team/all?page=1&limit=20&sort=score" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "teamName": "Code Warriors",
        "collegeId": "COLLEGE001",
        "totalScore": 450,
        "isActive": true,
        "isDisqualified": false,
        "memberCount": 3,
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "teamId": "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8",
        "teamName": "Debug Ninjas",
        "collegeId": "COLLEGE002",
        "totalScore": 380,
        "isActive": true,
        "isDisqualified": false,
        "memberCount": 3,
        "createdAt": "2024-01-15T11:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 6. Disqualify Team (Admin)

**Request:**
```bash
curl -X POST http://localhost:5000/api/team/disqualify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "reason": "Cheating detected - refresh exploit"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Team disqualified successfully",
  "data": {
    "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "teamName": "Code Warriors",
    "isDisqualified": true,
    "disqualificationReason": "Cheating detected - refresh exploit",
    "disqualifiedAt": "2024-01-15T12:45:00Z"
  }
}
```

---

## Game Endpoints

### 7. Start Game Session

**Request:**
```bash
curl -X POST http://localhost:5000/api/game/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "round": "preliminary",
    "totalQuestions": 5,
    "questionTypes": ["START", "START", "CONTAIN", "CONTAIN", "START"],
    "questionCharacters": [
      ["A"],
      ["B"],
      ["D", "E"],
      ["R", "S"],
      ["T"]
    ],
    "timeLimits": [30, 30, 60, 60, 30]
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Game session started",
  "data": {
    "gameId": "game-2024-01-15-001",
    "round": "preliminary",
    "status": "in-progress",
    "totalQuestions": 5,
    "currentQuestionIndex": 0,
    "startedAt": "2024-01-15T14:00:00Z",
    "teamCount": 45
  }
}
```

### 8. Pause Game

**Request:**
```bash
curl -X POST http://localhost:5000/api/game/pause \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "gameId": "game-2024-01-15-001"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Game paused",
  "data": {
    "gameId": "game-2024-01-15-001",
    "status": "paused",
    "pausedAt": "2024-01-15T14:15:00Z",
    "currentQuestionIndex": 1
  }
}
```

### 9. Resume Game

**Request:**
```bash
curl -X POST http://localhost:5000/api/game/resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "gameId": "game-2024-01-15-001"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Game resumed",
  "data": {
    "gameId": "game-2024-01-15-001",
    "status": "in-progress",
    "resumedAt": "2024-01-15T14:20:00Z"
  }
}
```

### 10. Stop Game

**Request:**
```bash
curl -X POST http://localhost:5000/api/game/stop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "gameId": "game-2024-01-15-001"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Game ended",
  "data": {
    "gameId": "game-2024-01-15-001",
    "status": "completed",
    "endedAt": "2024-01-15T14:45:00Z",
    "totalDuration": "45 minutes",
    "totalSubmissions": 225,
    "validSubmissions": 198
  }
}
```

### 11. Next Question

**Request:**
```bash
curl -X POST http://localhost:5000/api/game/next-question \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "gameId": "game-2024-01-15-001"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Moved to next question",
  "data": {
    "gameId": "game-2024-01-15-001",
    "currentQuestionIndex": 2,
    "question": {
      "questionId": "q3",
      "index": 3,
      "type": "CONTAIN",
      "characters": ["D", "E"],
      "timeLimit": 60,
      "timeRemainingMs": 60000
    }
  }
}
```

---

## Submission Endpoints

### 12. Submit Answer

**Request:**
```bash
curl -X POST http://localhost:5000/api/submission/answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "gameId": "game-2024-01-15-001",
    "questionIndex": 1,
    "word": "algorithm",
    "timeSpent": 25
  }'
```

**Response (200 OK - Valid Word):**
```json
{
  "success": true,
  "message": "Answer submitted and validated",
  "data": {
    "answerId": "ans-001",
    "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "teamName": "Code Warriors",
    "word": "algorithm",
    "isValid": true,
    "score": 26,
    "scoreBreakdown": {
      "a": 1,
      "l": 4,
      "g": 5,
      "o": 2,
      "r": 3,
      "i": 1,
      "t": 5,
      "h": 4,
      "m": 1
    },
    "validationMessage": "Word is valid.",
    "submittedAt": "2024-01-15T14:05:00Z"
  }
}
```

**Response (200 OK - Invalid Word):**
```json
{
  "success": true,
  "message": "Answer submitted but validation failed",
  "data": {
    "answerId": "ans-002",
    "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "teamName": "Code Warriors",
    "word": "running",
    "isValid": false,
    "score": 0,
    "validationMessage": "Words ending with 'ing' are not allowed",
    "errorCode": "ENDS_WITH_ING",
    "submittedAt": "2024-01-15T14:06:00Z"
  }
}
```

### 13. Skip Question

**Request:**
```bash
curl -X POST http://localhost:5000/api/submission/skip \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "gameId": "game-2024-01-15-001",
    "questionIndex": 2
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Question skipped",
  "data": {
    "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "questionIndex": 2,
    "skippedAt": "2024-01-15T14:10:00Z"
  }
}
```

### 14. Get Team Answers

**Request:**
```bash
curl -X GET "http://localhost:5000/api/submission/answers?gameId=game-2024-01-15-001&teamId=f47ac10b-58cc-4372-a567-0e02b2c3d479" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "gameId": "game-2024-01-15-001",
    "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "teamName": "Code Warriors",
    "answers": [
      {
        "questionIndex": 1,
        "word": "algorithm",
        "isValid": true,
        "score": 26,
        "validationMessage": "Word is valid.",
        "submittedAt": "2024-01-15T14:05:00Z"
      },
      {
        "questionIndex": 2,
        "word": "running",
        "isValid": false,
        "score": 0,
        "validationMessage": "Words ending with 'ing' are not allowed",
        "submittedAt": "2024-01-15T14:06:00Z"
      },
      {
        "questionIndex": 3,
        "word": "database",
        "isValid": true,
        "score": 19,
        "validationMessage": "Word is valid.",
        "submittedAt": "2024-01-15T14:30:00Z"
      }
    ],
    "totalScore": 45,
    "validAnswers": 2,
    "invalidAnswers": 1
  }
}
```

---

## Leaderboard Endpoints

### 15. Get Current Leaderboard

**Request:**
```bash
curl -X GET "http://localhost:5000/api/leaderboard/current?gameId=game-2024-01-15-001&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "gameId": "game-2024-01-15-001",
    "round": "preliminary",
    "gameStatus": "in-progress",
    "leaderboard": [
      {
        "rank": 1,
        "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "teamName": "Code Warriors",
        "score": 450,
        "validAnswers": 4,
        "invalidAnswers": 1,
        "avgTime": 28,
        "lastUpdated": "2024-01-15T14:35:00Z"
      },
      {
        "rank": 2,
        "teamId": "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8",
        "teamName": "Debug Ninjas",
        "score": 420,
        "validAnswers": 4,
        "invalidAnswers": 1,
        "avgTime": 35,
        "lastUpdated": "2024-01-15T14:33:00Z"
      },
      {
        "rank": 3,
        "teamId": "x9y8z7w6-v5u4-3210-t1s2-r3q4p5o6n7m8",
        "teamName": "Bytewise",
        "score": 380,
        "validAnswers": 3,
        "invalidAnswers": 2,
        "avgTime": 40,
        "lastUpdated": "2024-01-15T14:32:00Z"
      }
    ],
    "totalTeams": 45,
    "timestamp": "2024-01-15T14:35:30Z"
  }
}
```

### 16. Get Finals Leaderboard

**Request:**
```bash
curl -X GET "http://localhost:5000/api/leaderboard/finals" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "round": "finals",
    "leaderboard": [
      {
        "rank": 1,
        "teamId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "teamName": "Code Warriors",
        "prelimScore": 450,
        "finalsScore": 480,
        "totalScore": 930,
        "qualifiedFrom": "preliminary"
      },
      {
        "rank": 2,
        "teamId": "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8",
        "teamName": "Debug Ninjas",
        "prelimScore": 420,
        "finalsScore": 465,
        "totalScore": 885,
        "qualifiedFrom": "preliminary"
      }
    ],
    "timestamp": "2024-01-15T16:00:00Z"
  }
}
```

---

## Admin Endpoints

### 17. Admin Dashboard

**Request:**
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "currentGame": {
      "gameId": "game-2024-01-15-001",
      "round": "preliminary",
      "status": "in-progress",
      "startedAt": "2024-01-15T14:00:00Z",
      "currentQuestionIndex": 3,
      "totalQuestions": 5,
      "elapsedTime": "45 minutes"
    },
    "statistics": {
      "totalTeams": 45,
      "activeTeams": 43,
      "disqualifiedTeams": 2,
      "totalSubmissions": 187,
      "validSubmissions": 156,
      "invalidSubmissions": 31,
      "averageScore": 385.2,
      "averageValidWords": 3.2
    },
    "recentSubmissions": [
      {
        "teamName": "Code Warriors",
        "word": "algorithm",
        "isValid": true,
        "score": 26,
        "submittedAt": "2024-01-15T14:35:00Z"
      },
      {
        "teamName": "Debug Ninjas",
        "word": "database",
        "isValid": true,
        "score": 19,
        "submittedAt": "2024-01-15T14:34:55Z"
      }
    ],
    "topTeams": [
      {
        "rank": 1,
        "teamName": "Code Warriors",
        "score": 450
      },
      {
        "rank": 2,
        "teamName": "Debug Ninjas",
        "score": 420
      }
    ]
  }
}
```

### 18. Export Results

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/export?gameId=game-2024-01-15-001&format=csv" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -o results.csv
```

**Response (200 OK - CSV File):**
```
teamId,teamName,rank,score,validAnswers,invalidAnswers,avgTime
f47ac10b-58cc-4372-a567-0e02b2c3d479,Code Warriors,1,450,4,1,28
a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7g8,Debug Ninjas,2,420,4,1,35
...
```

### 19. Get Analytics

**Request:**
```bash
curl -X GET "http://localhost:5000/api/admin/analytics?gameId=game-2024-01-15-001" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "gameId": "game-2024-01-15-001",
    "gameStatistics": {
      "totalTeams": 45,
      "avgScore": 385.2,
      "medianScore": 380,
      "minScore": 120,
      "maxScore": 480,
      "standardDeviation": 95.3
    },
    "submissionAnalytics": {
      "totalSubmissions": 187,
      "validSubmissions": 156,
      "validRate": 83.4,
      "invalidSubmissions": 31,
      "skippedQuestions": 25
    },
    "wordAnalytics": {
      "uniqueWords": 142,
      "mostFrequentWord": "algorithm",
      "mostFrequentWordCount": 12,
      "avgWordLength": 8.3
    },
    "timeAnalytics": {
      "avgTimePerQuestion": 32.5,
      "avgTimeQuestion1": 28,
      "avgTimeQuestion2": 30,
      "avgTimeQuestion3": 35,
      "avgTimeQuestion4": 40,
      "avgTimeQuestion5": 25
    },
    "validationErrors": {
      "PLURAL_WORD": 8,
      "ENDS_WITH_ING": 5,
      "ENDS_WITH_ED": 4,
      "NOT_TECH_RELATED": 7,
      "PROGRAMMING_LANGUAGE": 3,
      "ACRONYM": 2,
      "PROPER_NOUN": 2
    }
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid input",
  "message": "collegeId is required",
  "statusCode": 400
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "statusCode": 401
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You do not have permission to perform this action",
  "statusCode": 403
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Game session not found",
  "statusCode": 404
}
```

### 409 Conflict

```json
{
  "success": false,
  "error": "Conflict",
  "message": "Team name already exists",
  "statusCode": 409
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "statusCode": 500
}
```

---

## Rate Limiting

All endpoints are rate-limited:
- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 20 requests per 15 minutes
- **Submission endpoints**: 200 requests per 15 minutes

Rate limit info in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705334400
```

When rate limit exceeded (429):
```json
{
  "success": false,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again after 5 minutes.",
  "statusCode": 429
}
```

---

## Testing Endpoints with Postman

1. Create collection: "Cyber Etymology"
2. Create environments: development, production
3. Add variables:
   - `base_url`: http://localhost:5000
   - `team_token`: (set after login)
   - `admin_token`: (set after admin login)
4. Import requests from this document
5. Run collection with environment variables

**Pre-request Script (for auth endpoints):**
```javascript
pm.environment.set("team_token", pm.response.json().data.token);
```
