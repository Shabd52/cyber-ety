#!/bin/bash
# Test script using curl for question progression

API_URL="http://localhost:5000"

echo ""
echo "=== Testing Game Question Progression ==="

# Generate a unique timestamp
TIMESTAMP=$(date +%s)
TEAM_NAME="ProgressionTeam$TIMESTAMP"
COLLEGE_ID="college-test-$TIMESTAMP"
PASSWORD="TestPassword123!"

echo ""
echo "[1] Signing up team: $TEAM_NAME"
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"teamName\": \"$TEAM_NAME\",
    \"collegeId\": \"$COLLEGE_ID\",
    \"members\": [
      {\"name\": \"Member1\"},
      {\"name\": \"Member2\"},
      {\"name\": \"Member3\"}
    ],
    \"password\": \"$PASSWORD\"
  }")

if echo "$SIGNUP_RESPONSE" | grep -q "\"success\":true"; then
  echo "OK - Team created"
  TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  GAME_ID=""
else
  echo "FAILED - Signup failed"
  echo "$SIGNUP_RESPONSE"
  exit 1
fi

echo ""
echo "[2] Logging in as $COLLEGE_ID"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"collegeId\": \"$COLLEGE_ID\",
    \"password\": \"$PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "\"success\":true"; then
  echo "OK - Login successful"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
  echo "FAILED - Login failed"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo ""
echo "[3] Starting game..."
GAME_START_RESPONSE=$(curl -s -X POST "$API_URL/api/game/start" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{}")

if echo "$GAME_START_RESPONSE" | grep -q "\"success\":true"; then
  echo "OK - Game started"
  GAME_ID=$(echo "$GAME_START_RESPONSE" | grep -o '"gameId":"[^"]*' | head -1 | cut -d'"' -f4)
  INITIAL_INDEX=$(echo "$GAME_START_RESPONSE" | grep -o '"currentQuestionIndex":[0-9]*' | head -1 | cut -d':' -f2)
  echo "  GameID: $GAME_ID"
  echo "  Initial Question Index: $INITIAL_INDEX"
else
  echo "FAILED - Game start failed"
  echo "$GAME_START_RESPONSE"
  exit 1
fi

echo ""
echo "[4] Fetching initial game state..."
CURRENT_STATE=$(curl -s -X GET "$API_URL/api/game/current" \
  -H "Authorization: Bearer $TOKEN")

if echo "$CURRENT_STATE" | grep -q "\"success\":true"; then
  echo "OK - Got game state"
  DB_INDEX=$(echo "$CURRENT_STATE" | grep -o '"currentQuestionIndex":[0-9]*' | cut -d':' -f2)
  echo "  Question Index in DB: $DB_INDEX"
else
  echo "FAILED - Error getting game state"
  echo "$CURRENT_STATE"
fi

echo ""
echo "[5] Submitting answer 'algorithm'..."
SUBMIT_RESPONSE=$(curl -s -X POST "$API_URL/api/submission/answer" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"gameId\": \"$GAME_ID\",
    \"questionIndex\": 0,
    \"word\": \"algorithm\",
    \"timeSpent\": 10
  }")

if echo "$SUBMIT_RESPONSE" | grep -q "\"success\":true"; then
  IS_VALID=$(echo "$SUBMIT_RESPONSE" | grep -o '"isValid":[a-z]*' | cut -d':' -f2)
  SCORE=$(echo "$SUBMIT_RESPONSE" | grep -o '"score":[0-9]*' | cut -d':' -f2)
  echo "OK - Answer submitted"
  echo "  Valid: $IS_VALID"
  echo "  Score: $SCORE"
else
  echo "FAILED - Answer submission failed"
  echo "$SUBMIT_RESPONSE"
fi

echo ""
echo "[6] Fetching game state after answer..."
sleep 1
NEW_STATE=$(curl -s -X GET "$API_URL/api/game/current" \
  -H "Authorization: Bearer $TOKEN")

if echo "$NEW_STATE" | grep -q "\"success\":true"; then
  NEW_INDEX=$(echo "$NEW_STATE" | grep -o '"currentQuestionIndex":[0-9]*' | cut -d':' -f2)
  echo "OK - Got updated state"
  echo "  New Question Index: $NEW_INDEX"
  
  echo ""
  echo "[7] Verifying progression..."
  if [ "$NEW_INDEX" -gt "$INITIAL_INDEX" ]; then
    echo "SUCCESS - Question progressed from $INITIAL_INDEX to $NEW_INDEX"
  else
    echo "FAILED - Question did not progress (still at $INITIAL_INDEX)"
  fi
else
  echo "FAILED - Error getting updated state"
  echo "$NEW_STATE"
fi

echo ""
echo "=== Test Complete ==="
