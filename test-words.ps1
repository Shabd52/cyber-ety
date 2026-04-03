# Test word submission with valid tech words
$baseUrl = "http://localhost:5000"
$randomId = Get-Random

Write-Host "Testing game submission with valid words..." -ForegroundColor Green

# 1. Sign up
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

$signupResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method Post -Body $signupBody -ContentType "application/json" -ErrorAction Stop
$token = $signupResp.data.token
Write-Host "[OK] Signup successful" -ForegroundColor Green

# 2. Start game
$gameResp = Invoke-RestMethod -Uri "$baseUrl/api/game/start" -Method Post -Body "{}" -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $token" } -ErrorAction Stop
$gameId = $gameResp.data.gameId
Write-Host "[OK] Game started: $gameId" -ForegroundColor Green

# 3. Try different valid words
$testWords = @('algorithm', 'bridge', 'network', 'cluster')

foreach ($word in $testWords) {
    $answerBody = @{
        gameId = $gameId
        questionIndex = 0
        word = $word
        timeSpent = 5
    } | ConvertTo-Json

    try {
        $ansResp = Invoke-RestMethod -Uri "$baseUrl/api/submission/answer" -Method Post -Body $answerBody -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $token" } -ErrorAction Stop
        
        $isValid = $ansResp.data.isValid
        $result = if ($isValid) { "[VALID]" } else { "[INVALID]" }
        $reason = $ansResp.data.reason
        Write-Host "  '$word': $result - $reason" -ForegroundColor Yellow
    } catch {
        Write-Host "  '$word': [ERROR] - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n[DONE] Test complete!" -ForegroundColor Green
