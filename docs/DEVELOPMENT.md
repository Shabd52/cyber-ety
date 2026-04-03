# Development Guide

## Project Overview

Cyber Etymology is a full-stack web application built with:
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **Authentication**: JWT

---

## Development Workflow

### 1. Setting Up Local Environment

```bash
# Clone and install
git clone <repo>
cd cyberEty
npm install

# Setup environment
cp .env.example .env

# Start PostgreSQL
docker run -d \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=cyber_etymology \
  -p 5432:5432 \
  postgres:14

# Initialize database
npm run db:migrate --workspace=backend
npm run db:seed --workspace=backend

# Start servers
npm run dev
```

### 2. File Structure

```
src/
├── backend/
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation
│   │   ├── utils/          # Helpers (validation, scoring)
│   │   ├── db/             # Database connection & migrations
│   │   ├── server.ts       # Express app
│   │   └── socket.ts       # Socket.IO setup
│   └── dist/               # Compiled output
│
├── frontend/
│   ├── src/
│   │   ├── pages/          # Next.js pages
│   │   ├── components/     # React components
│   │   ├── styles/         # Global styles
│   │   └── utils/          # Frontend helpers
│   └── public/             # Static assets
│
└── shared/
    └── src/
        ├── types.ts        # TypeScript interfaces
        └── constants.ts    # Shared constants
```

---

## Backend Development

### Adding a New API Endpoint

1. **Define Types** (shared/src/types.ts)
```typescript
export interface NewRequest {
  id: string;
  name: string;
}
```

2. **Create Route** (backend/src/routes/new.ts)
```typescript
import { Router, Request, Response } from 'express';
import { verifyTeamAuth } from '../middleware/auth';

const router = Router();

router.get('/endpoint', verifyTeamAuth, async (req, res) => {
  // Handler logic
});

export default router;
```

3. **Register Route** (backend/src/server.ts)
```typescript
import newRoutes from './routes/new';
app.use('/api/new', newRoutes);
```

4. **Test**
```bash
curl -X GET http://localhost:5000/api/new/endpoint \
  -H "Authorization: Bearer <token>"
```

### Database Queries

```typescript
// backend/src/db/queries.ts
import { query } from './connection';

export async function getTeamById(teamId: string) {
  const result = await query(
    'SELECT * FROM teams WHERE id = $1',
    [teamId]
  );
  return result.rows[0];
}

export async function updateTeamScore(teamId: string, score: number) {
  const result = await query(
    'UPDATE teams SET score = $1 WHERE id = $2 RETURNING *',
    [score, teamId]
  );
  return result.rows[0];
}
```

### Validation

```typescript
// backend/src/services/validationService.ts
import { validateWord, calculateScore } from '../utils/validation';

export function processSubmission(word: string, questionType: string, characters: string[]) {
  const validation = validateWord(word, questionType as 'START' | 'CONTAIN', characters);
  
  if (!validation.isValid) {
    return { isValid: false, message: validation.message };
  }

  const score = calculateScore(word);
  return { isValid: true, word, score };
}
```

---

## Frontend Development

### Creating a New Component

```typescript
// frontend/src/components/NewComponent.tsx
'use client';

import { useState, useEffect } from 'react';

interface Props {
  title: string;
  onSubmit?: (data: any) => void;
}

export default function NewComponent({ title, onSubmit }: Props) {
  const [state, setState] = useState('');

  return (
    <div className="bg-cyber-dark border-2 border-cyber-blue p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-cyber-blue mb-4">{title}</h2>
      {/* Component JSX */}
    </div>
  );
}
```

### Using API Calls

```typescript
// frontend/src/utils/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage in component
const response = await api.get('/api/team/info');
```

### Socket.IO Integration

```typescript
// frontend/src/utils/socket.ts
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token'),
  },
});

socket.on('question-released', (data) => {
  console.log('New question:', data);
});

socket.emit('submit-answer', {
  questionId: 'q1',
  word: 'algorithm',
});

export default socket;
```

---

## Testing

### Unit Tests

```bash
# Backend
npm test --workspace=backend

# Frontend
npm test --workspace=frontend
```

### Integration Tests

```typescript
// backend/src/__tests__/api.test.ts
import request from 'supertest';
import app from '../server';

describe('Auth API', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        collegeId: 'COLLEGE001',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### E2E Tests

```bash
npm run test:e2e --workspace=frontend
```

---

## Debugging

### Backend Debugging

```bash
# With Chrome DevTools
node --inspect-brk dist/server.js

# Then open chrome://inspect
```

### Frontend Debugging

```bash
# Enable React DevTools in browser
# Use Next.js debugging in VS Code
```

### Socket.IO Debugging

```typescript
// Enable Socket.IO logging
import debug from 'debug';
debug.enable('socket.io*');
```

---

## Common Tasks

### Add Validation Rule

1. Update `TECH_GLOSSARY` in [shared/src/constants.ts](shared/src/constants.ts)
2. Update validation logic in [backend/src/utils/validation.ts](backend/src/utils/validation.ts)
3. Add error message to `ERROR_MESSAGES`
4. Test with `npm test`

### Add New Question Type

1. Update `QUESTION_TYPES` constant
2. Update `Question` interface in types.ts
3. Implement validation logic
4. Update frontend UI
5. Add Socket.IO event handling

### Add Admin Feature

1. Create route with `verifyAdminAuth` middleware
2. Add Socket.IO admin event handler
3. Create admin component
4. Update admin dashboard
5. Add corresponding API test

---

## Performance Optimization

### Backend
- Use connection pooling
- Add database indices
- Cache frequently accessed data (Redis)
- Use pagination for large queries

### Frontend
- Code splitting with Next.js
- Image optimization
- Lazy loading components
- Minimize bundle size

### Database
- Query optimization
- Index usage monitoring
- Regular VACUUM & ANALYZE
- Connection pooling

---

## Contributing Guidelines

1. Create feature branch: `git checkout -b feature/name`
2. Make changes with descriptive commits
3. Write tests for new features
4. Update documentation
5. Create pull request with description
6. Address review comments
7. Merge after approval

---

## Useful Commands

```bash
# Development
npm run dev                                # Start all services
npm run dev --workspace=backend            # Start backend only
npm run dev --workspace=frontend           # Start frontend only

# Building
npm run build                              # Build all
npm run build --workspace=backend          # Build backend

# Testing
npm test                                   # Run all tests
npm test --workspace=backend --watch       # Watch mode

# Database
npm run db:migrate --workspace=backend     # Run migrations
npm run db:seed --workspace=backend        # Seed database
npm run db:reset --workspace=backend       # Reset database

# Linting
npm run lint                               # Lint all

# Production
npm start --workspace=backend              # Start backend production
npm start --workspace=frontend             # Start frontend production
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
