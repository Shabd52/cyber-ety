# Deployment Guide - Cyber Etymology

## Table of Contents
1. [Development Setup](#development-setup)
2. [Production Deployment](#production-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Security Checklist](#security-checklist)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)

---

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Git

### Local Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd cyberEty
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Initialize Database**
   ```bash
   npm run db:migrate --workspace=backend
   npm run db:seed --workspace=backend
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   npm run dev --workspace=backend
   
   # Terminal 2: Frontend
   npm run dev --workspace=frontend
   ```

6. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin: http://localhost:3000/admin

---

## Production Deployment

### Build Artifacts

1. **Build Backend**
   ```bash
   npm run build --workspace=backend
   # Output: backend/dist/
   ```

2. **Build Frontend**
   ```bash
   npm run build --workspace=frontend
   # Output: frontend/.next/
   ```

3. **Create Production Package**
   ```bash
   # Compress dist files
   tar -czf cyber-etymology-prod.tar.gz \
     backend/dist/ \
     backend/package.json \
     frontend/.next/ \
     frontend/package.json
   ```

### Environment Variables

Create `.env.production`:
```bash
NODE_ENV=production
PORT=5000
API_URL=https://api.cyber-etymology.com
NEXT_PUBLIC_API_URL=https://api.cyber-etymology.com
NEXT_PUBLIC_SOCKET_URL=https://api.cyber-etymology.com

# Database
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_USER=cyber_user
DB_PASSWORD=<SECURE_PASSWORD>
DB_NAME=cyber_etymology

# JWT
JWT_SECRET=<LONG_RANDOM_STRING>
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://cyber-etymology.com

# SSL
SSL_CERT_PATH=/etc/ssl/certs/server.crt
SSL_KEY_PATH=/etc/ssl/private/server.key

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/cyber-etymology/app.log
```

### Deployment Steps

#### Option 1: Cloud Platform (AWS/Heroku/Vercel)

**AWS EC2 + RDS:**
1. Launch EC2 instance (Ubuntu 20.04 LTS)
2. Setup RDS PostgreSQL instance
3. SSH into EC2
4. Install Node.js and PM2
5. Clone repository
6. Install dependencies
7. Start with PM2

```bash
# On EC2
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

npm install -g pm2
pm2 startup
pm2 start npm --name "cyber-etymology-backend" -- start --workspace=backend
pm2 save
```

**Vercel (Frontend Only):**
1. Push code to GitHub
2. Connect Vercel to GitHub
3. Set environment variables in Vercel dashboard
4. Deploy automatically

#### Option 2: Traditional VPS

```bash
# SSH into server
ssh ubuntu@your-server.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Clone application
git clone <repo> /opt/cyber-etymology
cd /opt/cyber-etymology

# Install dependencies
npm install --production

# Build
npm run build

# Setup PM2
npm install -g pm2
pm2 start npm --name "cyber-backend" -- start
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt-get install -y nginx
# Configure nginx.conf (see nginx section below)
```

---

## Docker Deployment

### Dockerfile (Backend)

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
COPY shared/ ../shared/

# Install dependencies
RUN npm install

# Copy source
COPY backend/src ./src

# Compile TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
CMD ["npm", "start"]
```

### Dockerfile (Frontend)

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./
COPY shared/ ../shared/

RUN npm install

COPY frontend/ .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install --production

COPY --from=builder /app/.next ./.next
COPY frontend/public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: cyber-etymology-db
    environment:
      POSTGRES_USER: cyber_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: cyber_etymology
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cyber_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: cyber-etymology-backend
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: cyber_user
      DB_PASSWORD: secure_password
      DB_NAME: cyber_etymology
      JWT_SECRET: your_jwt_secret
      CORS_ORIGIN: http://localhost:3000
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
    command: npm run dev

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    container_name: cyber-etymology-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000
      NEXT_PUBLIC_SOCKET_URL: http://localhost:5000
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src

volumes:
  postgres_data:
```

### Run Docker

```bash
# Development
docker-compose up -d

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop
docker-compose down

# Production with specific image tags
docker-compose -f docker-compose.prod.yml up -d
```

---

## Environment Configuration

### .env Template (Production)

```bash
# Server
NODE_ENV=production
PORT=5000

# URLs
API_URL=https://api.cyber-etymology.com
NEXT_PUBLIC_API_URL=https://api.cyber-etymology.com
NEXT_PUBLIC_SOCKET_URL=https://api.cyber-etymology.com

# Database
DB_HOST=prod-db.rds.amazonaws.com
DB_PORT=5432
DB_USER=cyber_user
DB_PASSWORD=CHANGE_ME_SECURE_PASSWORD
DB_NAME=cyber_etymology

# Authentication
JWT_SECRET=CHANGE_ME_LONG_RANDOM_STRING_MIN_32_CHARS
JWT_EXPIRE=7d

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=CHANGE_ME_SECURE_PASSWORD
ADMIN_SECRET=CHANGE_ME_SECRET_KEY

# CORS
CORS_ORIGIN=https://cyber-etymology.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/cyber-etymology/app.log

# Mail (optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx

# Analytics (optional)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### AWS Environment Variables

```bash
# For AWS deployment, use AWS Systems Manager Parameter Store
aws ssm put-parameter --name /cyber-etymology/db-host --value "prod-db.rds.amazonaws.com" --type String
aws ssm put-parameter --name /cyber-etymology/jwt-secret --value "..." --type SecureString
```

---

## Security Checklist

### Pre-Production

- [ ] Change all default passwords
- [ ] Set strong JWT secret (minimum 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Setup CORS whitelist
- [ ] Configure rate limiting
- [ ] Setup firewall rules
- [ ] Enable database encryption
- [ ] Setup automated backups
- [ ] Configure logging
- [ ] Setup monitoring & alerts
- [ ] Run security scan (`npm audit`)
- [ ] Review API endpoints for exposed data
- [ ] Setup anti-CSRF tokens
- [ ] Configure HSTS headers

### Application Security

```javascript
// middleware/security.js
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS
app.use(express.limit('10mb')); // Body size limit
app.use(rateLimit()); // Rate limiting
app.use(mongoSanitize()); // Data sanitization
```

### Database Security

```sql
-- Create restricted user
CREATE USER cyber_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE cyber_etymology TO cyber_app;
GRANT USAGE ON SCHEMA public TO cyber_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO cyber_app;

-- Enable encryption
ALTER DATABASE cyber_etymology SET password_encryption = 'scram-sha-256';

-- Setup SSL
postgresql.conf: ssl = on
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# Install PM2 Plus
pm2 install pm2-auto-pull
pm2 link <secret_key> <public_key>

# Monitor
pm2 monit
pm2 logs
pm2 describe cyber-etymology-backend
```

### Structured Logging

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
```

### Error Tracking (Sentry)

```javascript
// backend/src/server.ts
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.errorHandler());
```

---

## Nginx Configuration

```nginx
# /etc/nginx/sites-available/cyber-etymology
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name cyber-etymology.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cyber-etymology.com;
    
    ssl_certificate /etc/letsencrypt/live/cyber-etymology.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cyber-etymology.com/privkey.pem;
    
    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## Troubleshooting

### Issue: Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -h localhost -U cyber_user -d cyber_etymology

# View logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

### Issue: Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Issue: WebSocket Connection Failed

```bash
# Check Socket.IO server
curl -i http://localhost:5000/socket.io/?transport=polling

# Check CORS configuration
# Ensure CORS_ORIGIN matches frontend URL
```

### Performance Issues

```bash
# Check memory usage
free -h
top

# Check disk space
df -h

# Check database
psql -U cyber_user -d cyber_etymology
SELECT pg_size_pretty(pg_database_size('cyber_etymology'));
```

---

## Backup Strategy

### Automated Daily Backup

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups/cyber-etymology"
DB_NAME="cyber_etymology"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U cyber_user $DB_NAME | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Keep last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$TIMESTAMP.sql.gz s3://cyber-etymology-backups/
```

```bash
# Add to crontab
crontab -e
# 0 2 * * * /usr/local/bin/backup.sh
```

---

## Scaling Considerations

1. **Load Balancing**: Use multiple backend instances behind load balancer
2. **Database Replication**: Setup PostgreSQL replication
3. **Caching**: Implement Redis for session/leaderboard caching
4. **CDN**: Use CloudFront for static assets
5. **Horizontal Scaling**: Run multiple Socket.IO instances with Redis adapter
