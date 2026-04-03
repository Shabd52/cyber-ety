# Quick Deployment Checklist

## Pre-Deployment (Do These First)

- [ ] Commit all code to GitHub
- [ ] Verify `package.json` has correct build and start scripts in both `backend/` and `frontend/`
- [ ] Copy logo to `frontend/public/spark-logo.png`
- [ ] Test locally with `npm run dev` - everything should work
- [ ] Create `.env.production` files with production values

## Backend Deployment (Render)

- [ ] Go to render.com and sign up with GitHub
- [ ] Create new Web Service
- [ ] Connect to `cyberEty` repository
- [ ] Configure:
  - [ ] Name: `cyber-etymology-backend`
  - [ ] Environment: Node
  - [ ] Build Command: `cd backend && npm install && npm run build`
  - [ ] Start Command: `cd backend && npm start`
  - [ ] Add all environment variables
- [ ] Wait for deployment to complete
- [ ] Note the backend URL: `https://cyber-etymology-backend.onrender.com`

## Frontend Deployment (Vercel)

- [ ] Go to vercel.com and sign up with GitHub
- [ ] Create new project from `cyberEty` repository
- [ ] Configure:
  - [ ] Root Directory: `frontend`
  - [ ] Framework: Next.js (auto-detected)
  - [ ] Set `NEXT_PUBLIC_API_URL` env var
  - [ ] Set `NEXT_PUBLIC_SOCKET_URL` env var
- [ ] Wait for deployment to complete
- [ ] Note the frontend URL: `https://cyber-etymology.vercel.app`

## Post-Deployment Testing

- [ ] Visit `https://cyber-etymology.vercel.app`
- [ ] Check console for errors (F12)
- [ ] Sign up as new team
- [ ] Login with team credentials
- [ ] Start a game on admin page
- [ ] Verify admin page loads (check leaderboard location)
- [ ] Open game page in another window
- [ ] Verify question appears in game page
- [ ] Test timer persists on page refresh
- [ ] Test submit answer works
- [ ] Test skip button works
- [ ] Verify real-time updates (check Network tab for WebSocket)
- [ ] Complete full game (5 questions) and verify round-over page
- [ ] Check SPARK logo appears on all pages

## Environment Variables Checklist

### Render Backend Service
```
PORT=10000
NODE_ENV=production
DATABASE_URL=(from Neon)
JWT_SECRET=(strong random string)
SOCKET_CORS=https://cyber-etymology.vercel.app
```

### Vercel Frontend Project
```
NEXT_PUBLIC_API_URL=https://cyber-etymology-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://cyber-etymology-backend.onrender.com
```

## If Anything Goes Wrong

1. **Check build logs** in Render/Vercel dashboard
2. **Verify all environment variables** are set correctly
3. **Restart service** (Render: go to settings → restart)
4. **Check browser console** for CORS or network errors
5. **Verify Firebase/Neon database** is running
6. **Test with curl**: `curl https://cyber-etymology-backend.onrender.com`

## Live URLs After Deployment

- **Frontend**: `https://cyber-etymology.vercel.app`
- **Backend API**: `https://cyber-etymology-backend.onrender.com`
- **WebSocket**: `https://cyber-etymology-backend.onrender.com` (Socket.IO)

## Important Notes

- ⚠️ Render free tier sleeps after 15 minutes of inactivity (add paid plan for production)
- ⚠️ First request to Render after sleep takes 10-30 seconds to wake up
- ⚠️ Vercel auto-deploys on every GitHub push to main branch
- ⚠️ Render auto-deploys on every GitHub push to main branch
- ✅ No manual deploy steps needed after initial setup
