# Testing Guide - Cyber Etymology

## Overview

Testing strategy includes:
- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: API endpoints with database
- **E2E Tests**: Complete game workflows
- **Load Tests**: Performance under concurrent players

---

## Unit Testing

### Backend Unit Tests

#### Word Validation Tests

```typescript
// backend/src/__tests__/validation.test.ts
import { validateWord, calculateScore } from '../utils/validation';

describe('Word Validation', () => {
  describe('validateWord', () => {
    it('should validate correct tech words', () => {
      const result = validateWord('algorithm', 'START', ['A']);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Word is valid.');
    });

    it('should reject plural words ending in S', () => {
      const result = validateWord('algorithms', 'START', ['A']);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('PLURAL_WORD');
    });

    it('should reject words ending in ING', () => {
      const result = validateWord('running', 'START', ['R']);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('ENDS_WITH_ING');
    });

    it('should reject words ending in ED', () => {
      const result = validateWord('compiled', 'START', ['C']);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('ENDS_WITH_ED');
    });

    it('should reject acronyms', () => {
      const result = validateWord('HTTP', 'START', ['H']);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('ACRONYM');
    });

    it('should reject non-tech words', () => {
      const result = validateWord('elephant', 'START', ['E']);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('NOT_TECH_RELATED');
    });

    it('should reject non-matching START words', () => {
      const result = validateWord('byte', 'START', ['C']);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('LETTER_MISMATCH');
    });

    it('should validate CONTAIN words with all letters', () => {
      const result = validateWord('algorithm', 'CONTAIN', ['A', 'R']);
      expect(result.isValid).toBe(true);
    });

    it('should reject CONTAIN words missing required letters', () => {
      const result = validateWord('algorithm', 'CONTAIN', ['X', 'Y']);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('LETTER_MISMATCH');
    });

    it('should reject programming languages', () => {
      const result = validateWord('Python', 'START', ['P']);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('PROGRAMMING_LANGUAGE');
    });

    it('should reject proper nouns', () => {
      const result = validateWord('Linux', 'START', ['L']);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('PROPER_NOUN');
    });
  });

  describe('calculateScore', () => {
    it('should calculate letter values correctly', () => {
      const score = calculateScore('algorithm');
      // a(1) + l(4) + g(5) + o(2) + r(3) + i(1) + t(5) + h(4) + m(1) = 26
      expect(score).toBe(26);
    });

    it('should handle case-insensitive scoring', () => {
      const score1 = calculateScore('Algorithm');
      const score2 = calculateScore('ALGORITHM');
      const score3 = calculateScore('algorithm');
      expect(score1).toBe(score2);
      expect(score2).toBe(score3);
    });

    it('should return 0 for empty word', () => {
      const score = calculateScore('');
      expect(score).toBe(0);
    });

    it('should calculate high-value words correctly', () => {
      // z(9) + y(8) + x(9) = 26
      const score = calculateScore('xyz');
      expect(score).toBe(26);
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple words correctly', () => {
      const words = ['algorithm', 'byte', 'cache'];
      const results = words.map(w => validateWord(w, 'START', [w[0].toUpperCase()]));
      
      expect(results[0].isValid).toBe(true); // algorithm
      expect(results[1].isValid).toBe(true); // byte
      expect(results[2].isValid).toBe(true); // cache
    });
  });
});
```

#### Scoring Tests

```typescript
// backend/src/__tests__/scoring.test.ts
import { rankTeams } from '../utils/scoring';

describe('Team Ranking', () => {
  it('should rank teams by highest score first', () => {
    const teams = [
      { teamId: '1', score: 50, timeTaken: 100 },
      { teamId: '2', score: 100, timeTaken: 100 },
      { teamId: '3', score: 75, timeTaken: 100 }
    ];

    const ranked = rankTeams(teams);
    
    expect(ranked[0].teamId).toBe('2'); // 100 points
    expect(ranked[1].teamId).toBe('3'); // 75 points
    expect(ranked[2].teamId).toBe('1'); // 50 points
  });

  it('should use time as tiebreaker', () => {
    const teams = [
      { teamId: '1', score: 100, timeTaken: 500 },
      { teamId: '2', score: 100, timeTaken: 300 },
      { teamId: '3', score: 100, timeTaken: 400 }
    ];

    const ranked = rankTeams(teams);
    
    expect(ranked[0].teamId).toBe('2'); // Fastest
    expect(ranked[1].teamId).toBe('3');
    expect(ranked[2].teamId).toBe('1'); // Slowest
  });
});
```

### Run Unit Tests

```bash
# Backend
npm test --workspace=backend

# With coverage
npm test --workspace=backend -- --coverage

# Watch mode
npm test --workspace=backend -- --watch

# Specific test file
npm test --workspace=backend -- validation.test.ts
```

---

## Integration Testing

### API Tests

```typescript
// backend/src/__tests__/api.integration.test.ts
import request from 'supertest';
import app from '../server';
import { query } from '../db/connection';

describe('Auth API Integration', () => {
  beforeAll(async () => {
    // Setup test database
    await query('TRUNCATE TABLE teams, users CASCADE');
  });

  describe('POST /api/auth/signup', () => {
    it('should create new team with 3 members', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          teamName: 'Test Team',
          collegeId: 'COLLEGE001',
          members: [
            { name: 'Alice', collegeId: 'STU001' },
            { name: 'Bob', collegeId: 'STU002' },
            { name: 'Charlie', collegeId: 'STU003' }
          ],
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.teamId).toBeDefined();
      expect(response.body.data.members).toHaveLength(3);
    });

    it('should reject duplicate team name', async () => {
      // First signup
      await request(app)
        .post('/api/auth/signup')
        .send({
          teamName: 'Unique Team',
          collegeId: 'COLLEGE001',
          members: [{ name: 'Alice', collegeId: 'STU001' }],
          password: 'Pass123!'
        });

      // Duplicate attempt
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          teamName: 'Unique Team',
          collegeId: 'COLLEGE002',
          members: [{ name: 'Bob', collegeId: 'STU002' }],
          password: 'Pass123!'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Team name already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          teamName: 'Test Team'
          // Missing collegeId, members, password
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create team first
      await request(app)
        .post('/api/auth/signup')
        .send({
          teamName: 'Login Test',
          collegeId: 'COLLEGE001',
          members: [{ name: 'User', collegeId: 'STU001' }],
          password: 'TestPass123!'
        });

      // Login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          collegeId: 'COLLEGE001',
          password: 'TestPass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.teamId).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          collegeId: 'COLLEGE001',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and invalidate token', async () => {
      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          collegeId: 'COLLEGE001',
          password: 'TestPass123!'
        });

      const token = loginResponse.body.data.token;

      // Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutResponse.status).toBe(200);

      // Verify token is invalid
      const teamResponse = await request(app)
        .get('/api/team/info')
        .set('Authorization', `Bearer ${token}`);

      expect(teamResponse.status).toBe(401);
    });
  });
});

describe('Game API Integration', () => {
  let gameId: string;
  let adminToken: string;
  let teamToken: string;

  beforeAll(async () => {
    // Setup admin and team
    // Get tokens
  });

  describe('POST /api/game/start', () => {
    it('should start new game session', async () => {
      const response = await request(app)
        .post('/api/game/start')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          round: 'preliminary',
          totalQuestions: 5,
          questionTypes: ['START', 'START', 'CONTAIN', 'CONTAIN', 'START']
        });

      expect(response.status).toBe(201);
      expect(response.body.data.gameId).toBeDefined();
      expect(response.body.data.status).toBe('in-progress');
      gameId = response.body.data.gameId;
    });
  });

  describe('POST /api/submission/answer', () => {
    it('should accept and validate submitted answer', async () => {
      const response = await request(app)
        .post('/api/submission/answer')
        .set('Authorization', `Bearer ${teamToken}`)
        .send({
          gameId,
          questionIndex: 1,
          word: 'algorithm',
          timeSpent: 25 // seconds
        });

      expect(response.status).toBe(200);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.score).toBeDefined();
    });

    it('should reject invalid answer', async () => {
      const response = await request(app)
        .post('/api/submission/answer')
        .set('Authorization', `Bearer ${teamToken}`)
        .send({
          gameId,
          questionIndex: 2,
          word: 'elephant', // Not tech-related
          timeSpent: 30
        });

      expect(response.status).toBe(200);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.message).toBeDefined();
    });
  });

  describe('GET /api/leaderboard/current', () => {
    it('should return current game leaderboard', async () => {
      const response = await request(app)
        .get(`/api/leaderboard/current?gameId=${gameId}`)
        .set('Authorization', `Bearer ${teamToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.leaderboard).toBeInstanceOf(Array);
      expect(response.body.data.leaderboard[0]).toHaveProperty('rank');
      expect(response.body.data.leaderboard[0]).toHaveProperty('teamName');
      expect(response.body.data.leaderboard[0]).toHaveProperty('score');
    });
  });
});
```

---

## E2E Testing

### Complete Game Flow

```typescript
// e2e/game-flow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Game Flow', () => {
  test('should allow team to signup, login, and play game', async ({ page }) => {
    // Navigate to signup
    await page.goto('http://localhost:3000');
    await page.click('text=Sign Up');

    // Fill signup form
    await page.fill('input[name="teamName"]', 'E2E Test Team');
    await page.fill('input[name="collegeId"]', 'COLLEGE001');
    await page.fill('input[name="member1"]', 'Alice');
    await page.fill('input[name="member2"]', 'Bob');
    await page.fill('input[name="member3"]', 'Charlie');
    await page.fill('input[name="password"]', 'SecurePass123!');

    // Submit
    await page.click('button:has-text("Sign Up")');

    // Wait for redirect to login
    await expect(page).toHaveURL('**/login');

    // Login
    await page.fill('input[name="collegeId"]', 'COLLEGE001');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button:has-text("Login")');

    // Wait for game screen
    await expect(page).toHaveURL('**/game');
    
    // Verify game elements
    await expect(page.locator('text=Question 1 of 5')).toBeVisible();
    await expect(page.locator('input[name="word"]')).toBeVisible();
    await expect(page.locator('button:has-text("Submit")')).toBeVisible();

    // Submit answer
    await page.fill('input[name="word"]', 'algorithm');
    await page.click('button:has-text("Submit")');

    // Verify score updates
    await expect(page.locator('text=Points:')).toBeVisible();
  });

  test('should show real-time leaderboard updates', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Team 1 login
    await page1.goto('http://localhost:3000/login');
    await page1.fill('input[name="collegeId"]', 'TEAM1');
    await page1.fill('input[name="password"]', 'pass1');
    await page1.click('button:has-text("Login")');

    // Team 2 login
    await page2.goto('http://localhost:3000/login');
    await page2.fill('input[name="collegeId"]', 'TEAM2');
    await page2.fill('input[name="password"]', 'pass2');
    await page2.click('button:has-text("Login")');

    // Both on game screen
    await expect(page1).toHaveURL('**/game');
    await expect(page2).toHaveURL('**/game');

    // Team 1 submits answer
    await page1.fill('input[name="word"]', 'byte');
    await page1.click('button:has-text("Submit")');

    // Wait for leaderboard update
    await page1.waitForTimeout(1000);

    // Verify both see updated leaderboard
    const leaderboard1 = page1.locator('[data-testid="leaderboard"]');
    const leaderboard2 = page2.locator('[data-testid="leaderboard"]');

    await expect(leaderboard1).toContainText('Team 1');
    await expect(leaderboard2).toContainText('Team 1');

    await context1.close();
    await context2.close();
  });

  test('should enforce fullscreen mode', async ({ page }) => {
    await page.goto('http://localhost:3000/game');

    // Check fullscreen is requested
    const isFullscreen = await page.evaluate(() => {
      return document.fullscreenElement !== null;
    });

    expect(isFullscreen).toBe(true);
  });

  test('should disable Enter key submission', async ({ page }) => {
    await page.goto('http://localhost:3000/game');

    const input = page.locator('input[name="word"]');
    
    // Fill with answer
    await input.fill('algorithm');

    // Press Enter
    await input.press('Enter');

    // Form should not submit (submit button still visible)
    await expect(page.locator('button:has-text("Submit")')).toBeVisible();
  });
});
```

---

## Load Testing

### Performance Tests

```typescript
// backend/src/__tests__/load.test.ts
import k6 from 'k6';
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '5m', // 5 minute test
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests under 500ms
    http_req_failed: ['rate<0.1'], // Less than 10% failure rate
  },
};

export default function () {
  // Signup
  let signupRes = http.post('http://localhost:5000/api/auth/signup', {
    teamName: `Team-${__VU}-${__ITER}`,
    collegeId: `COL-${__VU}`,
    members: [
      { name: 'Alice', collegeId: `STU-${__VU}-1` },
      { name: 'Bob', collegeId: `STU-${__VU}-2` },
      { name: 'Charlie', collegeId: `STU-${__VU}-3` }
    ],
    password: 'Test123!'
  });

  check(signupRes, {
    'signup status 201': (r) => r.status === 201,
  });

  // Login
  let loginRes = http.post('http://localhost:5000/api/auth/login', {
    collegeId: `COL-${__VU}`,
    password: 'Test123!'
  });

  check(loginRes, {
    'login status 200': (r) => r.status === 200,
  });

  let token = loginRes.json('data.token');

  // Get team info
  let teamRes = http.get('http://localhost:5000/api/team/info', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  check(teamRes, {
    'team info status 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

### Run Load Test

```bash
# Install k6
https://k6.io/docs/getting-started/installation/

# Run test
k6 run backend/src/__tests__/load.test.ts

# With thresholds
k6 run -e ENV=test backend/src/__tests__/load.test.ts
```

---

## Running All Tests

```bash
# Run all tests
npm test

# With coverage report
npm test -- --coverage

# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html

# Run specific test suite
npm test -- --testPathPattern=validation

# Watch mode
npm test -- --watch

# Update snapshots
npm test -- -u
```

---

## CI/CD Testing

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2
      
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      
      - run: npm run db:migrate
      
      - run: npm test
      
      - run: npm run test:e2e
```

---

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **E2E Tests**: Critical user paths (signup, login, gameplay)
- **Load Tests**: 95th percentile response time < 500ms, < 10% failure rate
