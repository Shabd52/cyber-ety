# Deployment Commands Reference

## Verifying Your Project is Ready

### Check Backend
```bash
cd backend
npm run build  # Should complete without errors
```

### Check Frontend  
```bash
cd frontend
npm run build  # Should complete without errors
```

### Verify Environment Files
```bash
# Backend should have proper start script
cat backend/package.json | grep -A 5 '"scripts"'

# Frontend should have public assets
ls -la frontend/public/
```

## Setting Up Git for Deployment

```bash
# Make sure you're on main branch
git status

# Commit all changes
git add .
git commit -m "Prepare for Vercel and Render deployment"

# Push to GitHub
git push origin main
```

## Environment Variable Templates

### For Render Backend (.env.production)

```
PORT=10000
NODE_ENV=production
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
JWT_SECRET=your-super-secret-random-string-here
SOCKET_CORS=https://cyber-etymology.vercel.app
```

Generate JWT_SECRET:
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString())) 
```

### For Vercel Frontend (.env.production)

```
NEXT_PUBLIC_API_URL=https://cyber-etymology-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://cyber-etymology-backend.onrender.com
```

## Build Command Verification

### Backend Build (Render uses this)
```bash
cd backend && npm install && npm run build
```

**Should output**: `dist/` folder with compiled JavaScript

### Frontend Build (Vercel uses this)
```bash
cd frontend && npm install && npm run build
```

**Should output**: `.next` folder with optimized Next.js build

## Testing Backend After Deployment

```bash
# Replace with your actual Render URL
BACKEND_URL="https://cyber-etymology-backend.onrender.com"

# Test backend is responding
curl $BACKEND_URL/health || echo "Health check endpoint may not exist"

# Test with actual game endpoint (will fail with 401 without auth token, but proves backend works)
curl -X GET $BACKEND_URL/api/game/current \
  -H "Authorization: Bearer invalid" \
  -H "Content-Type: application/json"

# Should return 401 or error showing backend is running
```

## Testing Frontend After Deployment

```bash
# Simply visit in browser
https://cyber-etymology.vercel.app

# Or use curl to check page loads
curl -I https://cyber-etymology.vercel.app
# Should return 200
```

## Debugging Deployment Issues

### Check Render Build Logs
```
1. Go to render.com
2. Click on cyber-etymology-backend service
3. Click "Logs" tab
4. Look for build errors in output
```

### Check Vercel Build Logs
```
1. Go to vercel.com
2. Click on cyber-etymology project
3. Click "Deployments" tab
4. Click on failed deployment
5. Scroll to "Build" section for errors
```

### Local Testing Before Deploy

```bash
# Build all packages
npm run build

# Or individually
cd backend && npm run build
cd ../frontend && npm run build

# If build fails locally, it will fail on Vercel/Render too
```

## Render-Specific Commands

### View service status
```
1. Go to render.com dashboard
2. Click cyber-etymology-backend
3. Check "Instance" section for status (Should be "Live")
```

### Restart service (if needed)
```
1. Go to service settings
2. Click "Environment"
3. Update any var (or just toggle)
4. Service auto-restarts
```

### Check service logs
```
Services > cyber-etymology-backend > Logs
```

## Vercel-Specific Commands

### View deployment status
```
1. Go to vercel.com > Projects
2. Click cyber-etymology
3. Check latest deployment status
```

### Rollback to previous deployment
```
1. Go to Deployments tab
2. Find previous working deployment
3. Click "Redeploy"
```

### View function logs (if using serverless)
```
1. Go to Deployments tab
2. Click deployment
3. Click "Functions" for logs
```

## Cost Monitoring

### Vercel
- Free tier includes: 100GB bandwidth/month, unlimited deployments
- Check usage: Account Settings > Usage

### Render
- Free tier: $0/month (with limitations)
- Hobby tier: $7/month for always-on
- Check usage: Account > Billing

### Neon PostgreSQL
- Free tier: 3 branches, 10 GB storage
- Check usage: Project Settings > Billing

## Success Indicators

✅ Backend deployed when:
- Render dashboard shows "Live" status
- No errors in Render service logs
- Service URL is accessible

✅ Frontend deployed when:
- Vercel dashboard shows "Ready"
- No build errors
- Site URL is accessible

✅ Both working together when:
- Frontend loads without CORS errors (F12 console)
- Can successfully sign up and login
- Real-time updates work (Socket.IO connected)
- Database records are created and retrieved

## Performance Optimization Post-Deploy

1. **Enable Vercel edge functions** (optional premium feature)
2. **Configure Neon connection pooling** if high traffic
3. **Set up monitoring** on Render for uptime tracking
4. **Configure auto-scaling** on Render (paid feature)
