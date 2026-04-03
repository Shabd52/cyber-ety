# Cyber Etymology - Full-Stack Game Application

A competitive word-building game focused on computer science and technology terminology. Teams compete in real-time to form valid tech-related words from given letter combinations with intelligent validation and instant scoring.

**Live Features:**
- 🎮 Real-time multiplayer gameplay via WebSockets
- 🛡️ Advanced word validation with 8+ rules
- 🏆 Live leaderboard updates
- 📊 Comprehensive admin dashboard with analytics
- 🔐 JWT-based authentication with team sessions
- 💻 Cyber/neon dark theme UI

## Quick Start (5 minutes)

```bash
# 1. Clone & install
git clone <repository-url>
cd cyberEty
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Initialize database
npm run db:migrate --workspace=backend
npm run db:seed --workspace=backend

# 4. Start all services (use separate terminals)
npm run dev --workspace=backend  # Terminal 1
npm run dev --workspace=frontend # Terminal 2
```

**Access Application:**
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:5000

## Features

### Participant Features ✅
- Team-based authentication (3 members per team)
- Real-time multiplayer gameplay
- 8-rule word validation system
- Instant scoring (Scrabble-like letter values)
- Live timer (30s/60s per question)
- Submit/Skip buttons (no Enter key submission)
- Real-time leaderboard
- Fullscreen mode enforcement
- Progress indicator
- Session persistence

### Admin Features ✅
- Game control (Start/Pause/Stop)
- Question progression management
- Live team monitoring
- Real-time leaderboard
- Team disqualification
- Analytics dashboard
- Result export (CSV/PDF)
- Audit logging

## Game Rules

### Question Types
1. **START (Q1-3)**: Word starts with given letter (30 sec)
2. **CONTAIN (Q4-5)**: Word contains all given letters (60 sec)

### Validation Rules (8 checks)
- ❌ No plurals (ending in 's')
- ❌ No -ing endings
- ❌ No -ed endings
- ❌ No acronyms (ALL CAPS)
- ❌ Must be tech-related (from 300+ word glossary)
- ❌ No programming languages
- ❌ No proper nouns
- ❌ Only alphabetic characters

### Scoring
- Letter-based values (Scrabble-inspired): A=1 to Z=9
- Invalid answers: 0 points
- Ranking: Highest score wins, ties broken by fastest time

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with React 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom cyber theme (#0a0e27, #00d4ff, #00ff41)
- **Real-time**: Socket.IO client
- **HTTP**: Axios
- **State Management**: Zustand

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Real-time**: Socket.IO
- **Database**: PostgreSQL 14+
- **Authentication**: JWT + bcryptjs
- **Validation**: Custom 8-rule engine

### DevOps
- **Containerization**: Docker & Docker Compose
- **Process Manager**: PM2 (production)
- **Testing**: Jest, Supertest, Playwright
- **CI/CD**: GitHub Actions

## Project Structure

```
cyber-etymology/
├── backend/                    # Node.js/Express server
│   ├── src/
│   │   ├── server.ts          # Express app setup
│   │   ├── socket.ts          # Socket.IO initialization
│   │   ├── routes/            # API endpoints
│   │   ├── controllers/        # Business logic
│   │   ├── services/           # Core services
│   │   ├── middleware/         # Auth, validation, etc.
│   │   ├── utils/              # Helpers (validation, scoring)
│   │   └── db/                 # Database connection & migrations
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js client
│   ├── src/
│   │   ├── pages/              # Next.js pages
│   │   ├── components/         # React components
│   │   ├── styles/             # Global styles
│   │   └── utils/              # Frontend helpers
│   ├── public/                 # Static assets
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                     # Shared types & constants
│   ├── src/
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── constants.ts        # Shared constants
│   └── package.json
│
├── config/                     # Configuration files
│   ├── docker-compose.yml
│   └── nginx.conf (optional)
│
├── docs/                       # Documentation
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── package.json                # Root workspace config
└── .env.example                # Environment template

```

## Full Documentation

| Document | Purpose |
|----------|---------|
| [API.md](docs/API.md) | 17 REST API endpoints with detailed specs |
| [API_EXAMPLES.md](docs/API_EXAMPLES.md) | cURL examples for all endpoints |
| [SOCKET_EVENTS.md](docs/SOCKET_EVENTS.md) | WebSocket event documentation |
| [DATABASE.md](docs/DATABASE.md) | 12-table schema with relationships |
| [UI_DESIGN.md](docs/UI_DESIGN.md) | Design system and mockups |
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | Development workflow guide |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [TESTING.md](docs/TESTING.md) | Testing strategy and examples |

## API Overview

### Authentication (3 endpoints)
- `POST /api/auth/signup` - Team registration with 3 members
- `POST /api/auth/login` - Team authentication
- `POST /api/auth/logout` - Session termination

### Team Management (3 endpoints)
- `GET /api/team/info` - Fetch team details
- `GET /api/team/all` - List all teams (Admin)
- `POST /api/team/disqualify` - Disqualify team (Admin)

### Game Control (4 endpoints)
- `POST /api/game/start` - Start game session
- `POST /api/game/pause` - Pause game
- `POST /api/game/resume` - Resume game
- `POST /api/game/stop` - End game

### Submissions (2 endpoints)
- `POST /api/submission/answer` - Submit word answer
- `GET /api/submission/answers` - Fetch team answers

### Leaderboard (2 endpoints)
- `GET /api/leaderboard/current` - Current standings
- `GET /api/leaderboard/finals` - Finals standings

### Admin (3 endpoints)
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/export` - Export results (CSV/PDF)

**Full documentation**: See [docs/API.md](docs/API.md)

## WebSocket Events

### Participant Events
- `question-released` → New question broadcast to all teams
- `timer-update` → Time remaining countdown
- `answer-validated` → Validation result with score
- `leaderboard-update` → Updated rankings
- `game-status` → Pause/Resume/End notification

### Admin Events
- `team-joined` → Team connected to game
- `submission-received` → New answer submitted
- `team-disqualified` → Team removed from game

**Full events**: See [docs/SOCKET_EVENTS.md](docs/SOCKET_EVENTS.md)

## Validation System

### 8 Validation Rules
1. **Alphabetic Only** - No numbers/symbols
2. **No Plurals** - Words ending in 's' rejected
3. **No -ing Endings** - Running, making, etc. rejected
4. **No -ed Endings** - Compiled, created, etc. rejected
5. **No Acronyms** - All uppercase words rejected
6. **Tech-Related** - Must match 300+ word glossary
7. **No Programming Languages** - Python, Java, etc. rejected
8. **No Proper Nouns** - Linux, Windows, etc. rejected

### Tech Glossary (300+ words)

**Examples by category:**
- Networking: algorithm, API, bandwidth, byte, cache, DNS, firewall
- Database: database, query, schema, index, transaction, constraint
- Security: encryption, authentication, authorization, firewall, malware
- Web: HTTP, HTML, CSS, REST, GraphQL, framework, middleware
- Languages: (Listed separately as blacklist)

## Scoring System

### Letter Values
```
A-F:  1-3 points each
G-L:  4-5 points each
M-R:  1-3 points each
S-Z:  4-9 points each

Example: "algorithm" = 1+4+5+1+3+1+5+4+1 = 26 points
```

### Ranking Algorithm
1. Sort by highest score first
2. For ties: Fastest submission time wins
3. Disqualified teams ranked at bottom

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Git

### Step-by-Step Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd cyberEty

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Configure environment variables
# Edit .env with your PostgreSQL credentials:
# DB_HOST=localhost
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=cyber_etymology

# 5. Initialize database
npm run db:migrate --workspace=backend
npm run db:seed --workspace=backend

# 6. Start development servers (in separate terminals)

# Terminal 1: Backend
npm run dev --workspace=backend

# Terminal 2: Frontend
npm run dev --workspace=frontend

# 7. Access application
# Frontend: http://localhost:3000
# Admin: http://localhost:3000/admin
# API: http://localhost:5000
```

## Development Commands

```bash
# Start all services
npm run dev

# Start specific service
npm run dev --workspace=backend
npm run dev --workspace=frontend

# Build for production
npm run build

# Run tests
npm test
npm test -- --watch

# Run linter
npm run lint

# Database commands
npm run db:migrate --workspace=backend
npm run db:seed --workspace=backend
npm run db:reset --workspace=backend
```

## Docker Deployment

```bash
# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- backend

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# E2E tests
npm run test:e2e
```

**Full testing guide**: See [docs/TESTING.md](docs/TESTING.md)

## Deployment

### Production Build

```bash
# Build backend
npm run build --workspace=backend

# Build frontend
npm run build --workspace=frontend

# Start production
npm start --workspace=backend
npm start --workspace=frontend
```

### Cloud Deployment

**Supported platforms:**
- AWS (EC2 + RDS)
- Google Cloud (App Engine + Cloud SQL)
- Azure (App Service + Azure Database)
- Heroku (containers)
- DigitalOcean (droplets)

**Full deployment guide**: See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL
psql -h localhost -U postgres

# Verify connection settings in .env
```

### Port Already in Use
```bash
# Find process on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### WebSocket Not Connecting
```bash
# Check Socket.IO is running
curl http://localhost:5000/socket.io/?transport=polling

# Enable debug logging
DEBUG=socket.io* npm run dev --workspace=backend
```

## Key Features Breakdown

### Real-time Synchronization
- WebSocket connection per team
- Room-based team grouping
- Instant leaderboard updates
- Live question delivery

### Security Features
- JWT authentication with expiration
- Password hashing (bcrypt)
- CORS validation
- Rate limiting (100 req/15min)
- SQL injection prevention
- XSS protection (Helmet.js)

### Performance Optimization
- Database connection pooling
- Query optimization with indices
- Leaderboard caching (JSONB)
- Gzip compression
- Code splitting (frontend)

### Analytics & Monitoring
- Audit logging
- Error tracking
- Performance monitoring
- Word frequency analysis
- Validation error statistics

## Contributing

1. Create feature branch: `git checkout -b feature/description`
2. Make changes with tests
3. Update documentation
4. Create pull request
5. Address review feedback
6. Merge after approval

## Support

- 📖 [Full Documentation](docs/)
- 🐛 [Report Issues](issues)
- 💬 [Discussions](discussions)
- 📧 Email: support@cyber-etymology.dev

## License

MIT License - see LICENSE file

---

**Built with ❤️ for competitive word-building gaming**
    ↓
Normalize (lowercase)
    ↓
Rule Validation (alphabets, plurals, suffixes, acronyms)
    ↓
Dictionary Check (tech-related words)
    ↓
Question Constraint Validation (START/CONTAIN)
    ↓
Score Calculation
    ↓
Store Result + Timestamp
```

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Using Docker
```bash
docker-compose -f config/docker-compose.yml up -d
```

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm test -- --integration

# E2E tests
npm run test:e2e --workspace=frontend
```

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Commit: `git commit -m "description"`
3. Push: `git push origin feature/name`
4. Open PR

## License

MIT

## Support

For issues or questions, please open an issue on the repository.

---

**Status**: 🚀 Development in Progress
**Last Updated**: March 30, 2026
