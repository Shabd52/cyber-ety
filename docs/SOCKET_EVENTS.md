# WebSocket Events - Cyber Etymology

## Connection

### Client → Server: `join-team`
Join game as a team

**Payload:**
```json
{
  "userId": "uuid",
  "teamId": "uuid",
  "teamName": "string",
  "gameId": "uuid"
}
```

**Server Response:**
```json
{
  "status": "joined",
  "message": "Welcome to Cyber Etymology"
}
```

---

## Game Control

### Server → Client: `question-released`
A new question has been released to all teams

**Payload:**
```json
{
  "questionId": "uuid",
  "questionIndex": 1,
  "characters": "A",
  "type": "START",
  "timeLimit": 30,
  "releasedAt": "ISO 8601 timestamp"
}
```

---

### Server → Client: `timer-start`
Timer has started for current question

**Payload:**
```json
{
  "timeLimit": 30,
  "startedAt": "ISO 8601 timestamp"
}
```

---

### Server → Client: `timer-update`
Timer tick update (emitted every second)

**Payload:**
```json
{
  "remainingTime": 25,
  "updatedAt": "ISO 8601 timestamp"
}
```

---

### Client → Server: `submit-answer`
Submit answer for current question

**Payload:**
```json
{
  "questionId": "uuid",
  "word": "algorithm",
  "score": 15,
  "isValid": true,
  "timeTaken": 5
}
```

---

### Server → Client: `answer-validated`
Answer has been validated

**Payload:**
```json
{
  "teamId": "uuid",
  "teamName": "string",
  "word": "algorithm",
  "isValid": true,
  "score": 15,
  "message": "Valid word!",
  "validatedAt": "ISO 8601 timestamp"
}
```

---

### Client → Server: `skip-question`
Skip current question

**Payload:**
```json
{
  "questionId": "uuid"
}
```

---

## Leaderboard

### Server → Client: `leaderboard-update`
Leaderboard standings have been updated

**Payload:**
```json
{
  "standings": [
    {
      "rank": 1,
      "teamId": "uuid",
      "teamName": "Team Alpha",
      "score": 250,
      "timeTaken": 1200
    }
  ],
  "updatedAt": "ISO 8601 timestamp"
}
```

---

## Game State

### Server → Client: `game-status`
Game status has changed

**Payload:**
```json
{
  "status": "in-progress | paused | stopped",
  "round": "preliminary | finals",
  "updatedAt": "ISO 8601 timestamp"
}
```

---

### Server → Client: `round-complete`
Current round has completed

**Payload:**
```json
{
  "roundNumber": 1,
  "finalScores": [
    {
      "teamId": "uuid",
      "teamName": "Team Alpha",
      "score": 250,
      "rank": 1
    }
  ],
  "nextRound": "finals | none",
  "completedAt": "ISO 8601 timestamp"
}
```

---

### Server → Client: `finals-announced`
Finals teams have been announced

**Payload:**
```json
{
  "finalistTeams": [
    {
      "teamId": "uuid",
      "teamName": "Team Alpha",
      "preliminaryScore": 250,
      "rank": 1
    }
  ],
  "announcedAt": "ISO 8601 timestamp"
}
```

---

### Server → Client: `game-complete`
Game has completed

**Payload:**
```json
{
  "winners": [
    {
      "rank": 1,
      "teamId": "uuid",
      "teamName": "Team Alpha",
      "finalScore": 500
    }
  ],
  "completedAt": "ISO 8601 timestamp"
}
```

---

## Team Events

### Server → Client: `team-joined`
Another team has joined the game

**Payload:**
```json
{
  "teamName": "string",
  "userId": "uuid",
  "joinedAt": "ISO 8601 timestamp"
}
```

---

### Server → Client: `team-disconnected`
A team has disconnected

**Payload:**
```json
{
  "teamName": "string",
  "disconnectedAt": "ISO 8601 timestamp"
}
```

---

### Client → Server: `leave-game`
Leave the current game

---

## Error Handling

### Server → Client: `error`
An error has occurred

**Payload:**
```json
{
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {}
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - User not authenticated
- `INVALID_GAME_STATE` - Action not allowed in current game state
- `QUESTION_NOT_ACTIVE` - No active question
- `ALREADY_SUBMITTED` - Answer already submitted
- `TIME_EXPIRED` - Time limit exceeded
- `INVALID_WORD` - Word failed validation
- `SERVER_ERROR` - Internal server error

---

## Disconnect

### Server → Client: `disconnect`
Connection has been closed

**Reasons:**
- `io.server.disconnect()` - Server disconnected
- Network error
- Client disconnect

---

## Admin Events

### Client → Server: `admin:release-question`
Release a new question to all teams (Admin only)

**Payload:**
```json
{
  "questionIndex": 1,
  "characters": "A",
  "type": "START",
  "timeLimit": 30
}
```

---

### Client → Server: `admin:start-timer`
Start the timer for current question (Admin only)

---

### Client → Server: `admin:timer-update`
Broadcast timer update (Admin only)

**Payload:**
```json
{
  "remainingTime": 25
}
```

---

### Client → Server: `admin:update-leaderboard`
Update leaderboard standings (Admin only)

**Payload:**
```json
{
  "standings": [...]
}
```

---

### Client → Server: `admin:game-status`
Update game status (Admin only)

**Payload:**
```json
{
  "status": "in-progress | paused | stopped"
}
```

---

## Best Practices

1. **Reconnection**: Implement exponential backoff for reconnection attempts
2. **Heartbeat**: Send periodic heartbeat to detect stale connections
3. **Error Handling**: Always handle error events gracefully
4. **State Sync**: Re-sync state on reconnection
5. **Message Ordering**: Ensure messages are processed in order
6. **Timeout**: Set timeout for critical operations (e.g., answer submission)

---

## Example: Complete Gameplay Flow

```
1. Client connects
   → socket.connect()
   
2. Client joins team
   → client emits: join-team
   
3. Server broadcasts team joined
   → server emits: team-joined
   
4. Admin starts game
   → server emits: game-status (status: "in-progress")
   
5. Admin releases question
   → server emits: question-released
   
6. Server starts timer
   → server emits: timer-start
   → server emits: timer-update (every 1 second)
   
7. Team submits answer
   → client emits: submit-answer
   
8. Server validates answer
   → server emits: answer-validated
   → server emits: leaderboard-update
   
9. All questions answered
   → server emits: round-complete
   
10. Finals announced (if applicable)
    → server emits: finals-announced
    
11. Game complete
    → server emits: game-complete
    
12. Client disconnects
    → client emits: leave-game
    → server emits: team-disconnected
```

---

## Payload Examples

### Live Monitoring (Admin View)
```json
{
  "event": "answer-submitted",
  "data": {
    "teamName": "Team Alpha",
    "word": "algorithm",
    "isValid": true,
    "score": 15,
    "timeTaken": 5,
    "timestamp": "2026-03-30T10:30:45Z"
  }
}
```

### Team Submission Flow
```json
// Step 1: Question Released
{
  "event": "question-released",
  "data": {
    "characters": "A",
    "type": "START",
    "timeLimit": 30
  }
}

// Step 2: Team Submits
{
  "event": "submit-answer",
  "data": {
    "word": "algorithm",
    "timeTaken": 5
  }
}

// Step 3: Validation Response
{
  "event": "answer-validated",
  "data": {
    "word": "algorithm",
    "isValid": true,
    "score": 15
  }
}
```
