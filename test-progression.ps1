# Test script for verifying game question progression

$apiUrl = "http://localhost:5000"
$timestamp = [int][double]::Parse((Get-Date -UFormat %s)) * 1000 + (Get-Random -Maximum 1000)

Write-Host "`n=== Testing Game Question Progression ===" -ForegroundColor Cyan

$teamName = "ProgressionTeam$timestamp"
$password = "TestPassword123!"
# Use a more unique college ID with random characters
$randomSuffix = -join ((65..90) + (97..122) | Get-Random -Count 8 | % {[char]$_})
$collegeId = "college-test-$timestamp-$randomSuffix"

Write-Host "`n[1] Signing up team: $teamName" -ForegroundColor Yellow
$body = @{
    teamName = $teamName
    collegeId = $collegeId
    members = @(
        @{ name = "Member1" }
        @{ name = "Member2" }
        @{ name = "Member3" }
    )
    password = $password
} | ConvertTo-Json

$signupResponse = Invoke-WebRequest -Uri "$apiUrl/api/auth/signup" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -UseBasicParsing | ConvertFrom-Json

if ($signupResponse.success) {
  Write-Host "OK - Team created" -ForegroundColor Green
  $userId = $signupResponse.data.userId
  $teamId = $signupResponse.data.teamId
} else {
  Write-Host "FAILED - Signup error: $($signupResponse.error)" -ForegroundColor Red
  exit
}

Write-Host "`n[2] Logging in..." -ForegroundColor Yellow
$loginBody = @{
    collegeId = $collegeId
    password = $password
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$apiUrl/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody `
  -UseBasicParsing | ConvertFrom-Json

if ($loginResponse.success) {
  Write-Host "OK - Login successful" -ForegroundColor Green
  $token = $loginResponse.data.token
} else {
  Write-Host "FAILED - Login error: $($loginResponse.error)" -ForegroundColor Red
  exit
}

$headers = @{ Authorization = "Bearer $token" }

Write-Host "`n[3] Starting game..." -ForegroundColor Yellow
$gameBody = @{} | ConvertTo-Json
$gameResponse = Invoke-WebRequest -Uri "$apiUrl/api/game/start" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $gameBody `
  -UseBasicParsing | ConvertFrom-Json

if ($gameResponse.success) {
  Write-Host "OK - Game started" -ForegroundColor Green
  $gameId = $gameResponse.data.gameId
  $initialQuestionIndex = $gameResponse.data.currentQuestionIndex
  $initialQuestion = $gameResponse.data.currentQuestion
  Write-Host "  GameID: $gameId"
  Write-Host "  Question Index: $initialQuestionIndex"
  Write-Host "  Question Type: $($initialQuestion.type)"
  Write-Host "  Required Letters: $($initialQuestion.characters)"
} else {
  Write-Host "FAILED - Game start error: $($gameResponse.error)" -ForegroundColor Red
  exit
}

Write-Host "`n[4] Fetching initial game state..." -ForegroundColor Yellow
$currentStateResponse = Invoke-WebRequest -Uri "$apiUrl/api/game/current" `
  -Method GET `
  -Headers $headers `
  -UseBasicParsing | ConvertFrom-Json

if ($currentStateResponse.success) {
  Write-Host "OK - Got game state" -ForegroundColor Green
  Write-Host "  Question Index in DB: $($currentStateResponse.data.currentQuestionIndex)"
} else {
  Write-Host "FAILED - Error: $($currentStateResponse.error)" -ForegroundColor Red
}

Write-Host "`n[5] Submitting answer 'algorithm'..." -ForegroundColor Yellow
$word = "algorithm"
$submitBody = @{
    gameId = $gameId
    questionIndex = $initialQuestionIndex
    word = $word
    timeSpent = 10
} | ConvertTo-Json

$submissionResponse = Invoke-WebRequest -Uri "$apiUrl/api/submission/answer" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $submitBody `
  -UseBasicParsing | ConvertFrom-Json

if ($submissionResponse.success) {
  Write-Host "OK - Answer submitted" -ForegroundColor Green
  Write-Host "  Valid: $($submissionResponse.data.isValid)"
  Write-Host "  Score: $($submissionResponse.data.score)"
  Write-Host "  Reason: $($submissionResponse.data.reason)"
} else {
  Write-Host "FAILED - Error: $($submissionResponse.error)" -ForegroundColor Red
}

Write-Host "`n[6] Fetching game state after answer..." -ForegroundColor Yellow
Start-Sleep -Milliseconds 500
$newStateResponse = Invoke-WebRequest -Uri "$apiUrl/api/game/current" `
  -Method GET `
  -Headers $headers `
  -UseBasicParsing | ConvertFrom-Json

if ($newStateResponse.success) {
  $newQuestionIndex = $newStateResponse.data.currentQuestionIndex
  $newQuestion = $newStateResponse.data.currentQuestion
  
  Write-Host "OK - Got updated state" -ForegroundColor Green
  Write-Host "  New Question Index: $newQuestionIndex"
  Write-Host "  New Question Char: $($newQuestion.characters)"
  
  Write-Host "`n[7] Verifying progression..." -ForegroundColor Yellow
  if ($newQuestionIndex -gt $initialQuestionIndex) {
    Write-Host "SUCCESS - Question progressed from $initialQuestionIndex to $newQuestionIndex" -ForegroundColor Green
    Write-Host "  Previous: $($initialQuestion.characters), Current: $($newQuestion.characters)"
  } else {
    Write-Host "FAILED - Question did not progress (still at $initialQuestionIndex)" -ForegroundColor Red
  }
} else {
  Write-Host "FAILED - Error: $($newStateResponse.error)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
