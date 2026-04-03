# Test game flow
$baseUrl = "http://localhost:5000"
$randomId = Get-Random

# 1. Sign up a team
Write-Host "1. Signing up a team..." -ForegroundColor Green
$signupBody = @{
    teamName = "Test Team $randomId"
    members = @(
        @{ name = "Member 1" },
        @{ name = "Member 2" },
        @{ name = "Member 3" }
    )
    collegeId = "COLLEGE$randomId"
    password = "password123"
} | ConvertTo-Json

$signupResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method Post -Body $signupBody -ContentType "application/json"
Write-Host "Signup response: $($signupResponse | ConvertTo-Json)" -ForegroundColor Yellow

$token = $signupResponse.data.token
$gameId = $signupResponse.data.teamId
Write-Host "Token: $token" -ForegroundColor Cyan
Write-Host "Team ID: $gameId" -ForegroundColor Cyan

# 2. Start a game
Write-Host "`n2. Starting a game..." -ForegroundColor Green
$startGameBody = @{} | ConvertTo-Json

$gameResponse = Invoke-RestMethod -Uri "$baseUrl/api/game/start" -Method Post -Body $startGameBody -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $token" }
Write-Host "Game start response: $($gameResponse | ConvertTo-Json)" -ForegroundColor Yellow

$gameId = $gameResponse.data.gameId
Write-Host "Game ID: $gameId" -ForegroundColor Cyan

# 3. Get current game state
Write-Host "`n3. Getting current game state..." -ForegroundColor Green
$gameStateResponse = Invoke-RestMethod -Uri "$baseUrl/api/game/current" -Method Get -Headers @{ "Authorization" = "Bearer $token" }
Write-Host "Game state: $($gameStateResponse | ConvertTo-Json)" -ForegroundColor Yellow

# 4. Submit an answer
Write-Host "`n4. Submitting an answer..." -ForegroundColor Green
$answerBody = @{
    gameId = $gameId
    questionIndex = 0
    word = "algorithm"
    timeSpent = 5
} | ConvertTo-Json

$answerResponse = Invoke-RestMethod -Uri "$baseUrl/api/submission/answer" -Method Post -Body $answerBody -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $token" }
Write-Host "Answer response: $($answerResponse | ConvertTo-Json)" -ForegroundColor Yellow

Write-Host "`n✅ Test completed!" -ForegroundColor Green
