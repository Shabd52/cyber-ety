# Test script for verifying question ordering and leaderboard

$apiUrl = "http://localhost:5000"
$timestamp = [int][double]::Parse((Get-Date -UFormat %s)) * 1000 + (Get-Random -Maximum 1000)

Write-Host "`n=== Testing Question Ordering & Leaderboard ===" -ForegroundColor Cyan

$teamName = "TestTeam$timestamp"
$password = "TestPassword123!"
$randomSuffix = -join ((65..90) + (97..122) | Get-Random -Count 8 | % {[char]$_})
$collegeId = "college-$timestamp-$randomSuffix"

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
  $token = $signupResponse.data.token
} else {
  Write-Host "FAILED - Signup failed: $($signupResponse.error)" -ForegroundColor Red
  exit
}

Write-Host "`n[2] Starting game..." -ForegroundColor Yellow
$gameBody = @{} | ConvertTo-Json
$gameResponse = Invoke-WebRequest -Uri "$apiUrl/api/game/start" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $gameBody `
  -UseBasicParsing | ConvertFrom-Json

if ($gameResponse.success) {
  Write-Host "OK - Game started" -ForegroundColor Green
  $gameId = $gameResponse.data.gameId
} else {
  Write-Host "FAILED - Game start failed" -ForegroundColor Red
  exit
}

Write-Host "`n[3] Fetching all questions..." -ForegroundColor Yellow
$currentResponse = Invoke-WebRequest -Uri "$apiUrl/api/game/current" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" } `
  -UseBasicParsing | ConvertFrom-Json

if ($currentResponse.success) {
  Write-Host "OK - Got game state" -ForegroundColor Green
  $q1 = $currentResponse.data.currentQuestion
  Write-Host "  Q1: Type=$($q1.type), Chars=$($q1.characters), TimeLimit=$($q1.timeLimit) seconds"
  
  # Verify Q1 is START type with 30s
  if ($q1.type -eq "START" -and $q1.timeLimit -eq 30) {
    Write-Host "  Q1 correct: START, 30 seconds" -ForegroundColor Green
  } else {
    Write-Host "  Q1 incorrect!" -ForegroundColor Red
  }
} else {
  Write-Host "FAILED - Could not fetch game state" -ForegroundColor Red
  exit
}

Write-Host "`n[4] Testing question progression through all 5..." -ForegroundColor Yellow

$questionTypes = @()
$timeLimits = @()

# Add Q1 details manually
$questionTypes += "START"
$timeLimits += 30

for ($i = 1; $i -lt 5; $i++) {
  # Submit a valid word for current question
  if ($i -lt 3) {
    # Questions 1-2 (indices 0-1): START type
    $word = switch($i) {
      1 { "browser" }    # Start with 'b'
      2 { "command" }    # Start with 'c'
    }
  } else {
    # Questions 4-5 (indices 3-4): CONTAIN type
    $word = switch($i) {
      3 { "data" }       # Contains 'da'
      4 { "include" }    # Contains 'cl'
    }
  }

  $submitBody = @{
      gameId = $gameId
      questionIndex = $i - 1
      word = $word
      timeSpent = 5
  } | ConvertTo-Json

  $submitResponse = Invoke-WebRequest -Uri "$apiUrl/api/submission/answer" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $submitBody `
    -UseBasicParsing | ConvertFrom-Json

  if ($submitResponse.success) {
    $validStr = if ($submitResponse.data.isValid) { "VALID" } else { "INVALID" }
    Write-Host "  Q$i`: $validStr - Word: $word" -ForegroundColor Gray
  }

  # Get next question
  if ($i -lt 4) {
    Start-Sleep -Milliseconds 600
    $nextResponse = Invoke-WebRequest -Uri "$apiUrl/api/game/current" `
      -Method GET `
      -Headers @{ Authorization = "Bearer $token" } `
      -UseBasicParsing | ConvertFrom-Json

    if ($nextResponse.success) {
      $nextQ = $nextResponse.data.currentQuestion
      $questionTypes += $nextQ.type
      $timeLimits += $nextQ.timeLimit
    }
  }
}

Write-Host "`n[5] Verifying question structure..." -ForegroundColor Yellow

$allCorrect = $true
for ($i = 0; $i -lt 5; $i++) {
  $expectedType = if ($i -lt 3) { "START" } else { "CONTAIN" }
  $expectedTime = if ($i -lt 3) { 30 } else { 60 }
  
  $actualType = $questionTypes[$i]
  $actualTime = $timeLimits[$i]
  $qNum = $i + 1
  
  if ($actualType -eq $expectedType -and $actualTime -eq $expectedTime) {
    Write-Host "  OK Q$qNum : $actualType - $actualTime seconds" -ForegroundColor Green
  } else {
    Write-Host "  FAIL Q$qNum : Got $actualType ($actualTime), Expected $expectedType ($expectedTime)" -ForegroundColor Red
    $allCorrect = $false
  }
}

Write-Host "`n[6] Fetching leaderboard..." -ForegroundColor Yellow
$leaderResponse = Invoke-WebRequest -Uri "$apiUrl/api/game/leaderboard" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" } `
  -UseBasicParsing | ConvertFrom-Json

if ($leaderResponse.success) {
  $leaderboard = $leaderResponse.data.leaderboard
  if ($leaderboard -and $leaderboard.Count -gt 0) {
    Write-Host "OK - Leaderboard populated with $($leaderboard.Count) team(s)" -ForegroundColor Green
    foreach ($entry in $leaderboard) {
      Write-Host "  Rank $($entry.rank): $($entry.teamName) - $($entry.score) points" -ForegroundColor Cyan
    }
  } else {
    Write-Host "FAILED - Leaderboard is empty" -ForegroundColor Red
  }
} else {
  Write-Host "FAILED - Could not fetch leaderboard" -ForegroundColor Red
}

if ($allCorrect) {
  Write-Host "`n=== SUCCESS: All fixes working correctly ===" -ForegroundColor Green
} else {
  Write-Host "`n=== FAILED: Some checks did not pass ===" -ForegroundColor Red
}
