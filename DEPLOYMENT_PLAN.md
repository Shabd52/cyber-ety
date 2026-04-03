# Cyber Etymology - Deployment Plan

## Overview
- **Frontend**: Vercel (Next.js)
- **Backend**: Render (Express.js)
- **Database**: PostgreSQL (Neon) - Already configured
- **Real-time**: Socket.IO (Render supports WebSocket)

---

## Part 1: Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. **Update backend `package.json`** - ensure start script exists:
```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "ts-node src/index.ts"
}
```

2. **Create `.env.production` file** with production variables:
```
PORT=10000
NODE_ENV=production
DATABASE_URL=postgresql://...@neon.tech/...
JWT_SECRET=your-production-secret-key
SOCKET_CORS=https://your-frontend-domain.vercel.app
```

3. **Verify `dist/` folder is in `.gitignore`** (should build on Render)

### Step 2: Deploy to Render

1. **Connect Git Repository**:
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Select your GitHub repository
   - Choose the `cyberEty` repo

2. **Configure Web Service**:
   - **Name**: `cyber-etymology-backend`
   - **Environment**: `Node`
   - **Region**: `US (Ohio)` or closest to your users
   - **Branch**: `main`
   - **Build Command**: `cd shared && npm install && npm run build && cd ../backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Add Environment Variables**:
     - `PORT`: `10000`
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: (copy from Neon)
     - `JWT_SECRET`: (high entropy random string)
     - `SOCKET_CORS`: (will update after frontend deployment)

3. **Deploy**:
   - Click "Create Web Service"
   - Wait 5-10 minutes for build
   - Note the URL: `https://cyber-etymology-backend.onrender.com`

4. **Update Backend Environment**:
   - Go to Environment tab
   - Update `SOCKET_CORS`: `https://cyber-etymology.vercel.app`

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. **Update environment variables** in `frontend/.env.production`:
```
NEXT_PUBLIC_API_URL=https://cyber-etymology-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://cyber-etymology-backend.onrender.com
```

2. **Ensure `public/` folder has the logo**:
   - `public/spark-logo.png` must exist

3. **Check `next.config.js`** for any required configurations:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // Add any image domains if needed
  },
};

module.exports = nextConfig;
```

### Step 2: Deploy to Vercel

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Select `cyberEty` repo

2. **Configure Project**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend` (important!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Add Environment Variables**:
     - `NEXT_PUBLIC_API_URL`: `https://cyber-etymology-backend.onrender.com`
     - `NEXT_PUBLIC_SOCKET_URL`: `https://cyber-etymology-backend.onrender.com`

3. **Deploy**:
   - Click "Deploy"
   - Wait 3-5 minutes for build
   - Get the URL: `https://cyber-etymology.vercel.app`

4. **Update Render Backend**:
   - Go back to Render
   - Update `SOCKET_CORS`: `https://cyber-etymology.vercel.app`

---

## Part 3: Database Configuration

### Your Database (Neon PostgreSQL)

Your database is already configured. Ensure:

1. **Neon Connection String is set** in both backend services:
```
DATABASE_URL=postgresql://[user]:[password]@[project].neon.tech/[database]?sslmode=require
```

2. **Database initialized** with schema (should be created by your backend migrations)

---

## Part 4: Testing Deployment

### Test Backend
```bash
curl https://cyber-etymology-backend.onrender.com/api/game/start
# Should return 401 (unauthorized) or method not allowed - backend is working
```

### Test Frontend
1. Visit `https://cyber-etymology.vercel.app`
2. Check browser console for any CORS errors
3. Try signing up and logging in
4. Start a game and verify real-time updates work

### Check Socket.IO Connection
1. Open DevTools (F12)
2. Go to Network tab
3. Filter for "socketio"
4. You should see WebSocket connection to backend

---

## Part 5: Environment Variables Summary

### Render Backend
```
PORT=10000
NODE_ENV=production
DATABASE_URL=postgresql://...neon.tech/...
JWT_SECRET=your-secret-key
SOCKET_CORS=https://cyber-etymology.vercel.app
```

### Vercel Frontend
```
NEXT_PUBLIC_API_URL=https://cyber-etymology-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://cyber-etymology-backend.onrender.com
```

---

## Part 6: Post-Deployment Checklist

- [ ] Backend builds successfully on Render
- [ ] Frontend builds successfully on Vercel
- [ ] Database migrations run on startup
- [ ] Socket.IO connections work (check WebSocket in DevTools)
- [ ] Login/Signup pages work
- [ ] Can start a new game
- [ ] Timer persists on page refresh
- [ ] Leaderboard updates in real-time
- [ ] Admin panel controls work
- [ ] SPARK logo displays on all pages

---

## Part 7: Custom Domain (Optional)

### For Vercel Frontend
1. Go to Vercel Project Settings → Domains
2. Add your domain (e.g., `cyber-etymology.com`)
3. Follow DNS configuration instructions

### For Render Backend
1. Go to Render Service Settings → Custom Domains
2. Add your domain (e.g., `api.cyber-etymology.com`)
3. Follow DNS configuration instructions

---

## Part 8: Continuous Deployment

Both Vercel and Render support automatic deployments:

1. **Push to GitHub** → Auto-trigger build
2. **Vercel**: Deploys frontend automatically
3. **Render**: Deploys backend automatically

No manual deployment needed after initial setup!

---

## Part 9: Troubleshooting

### CORS Errors
- Verify `SOCKET_CORS` in Render matches your Vercel frontend URL
- Check browser console for specific CORS errors

### Socket.IO Connection Failed
- Verify backend WebSocket is enabled (default with Express + Socket.IO)
- Check network tab for failed WebSocket upgrade
- Ensure Render instance has WebSocket support enabled

### Database Connection Issues
- Verify `DATABASE_URL` is correct in Render
- Check Neon database is running and accessible
- Ensure SSL mode is set: `?sslmode=require`

### Build Failures
- Check build logs in Vercel/Render dashboards
- Verify all dependencies are in `package.json`
- Ensure TypeScript compiles in both projects

---

## Deployment Timeline

1. **Backend Setup**: 5-10 minutes
2. **Frontend Setup**: 5-10 minutes
3. **Environment Configuration**: 5 minutes
4. **Testing**: 10-15 minutes
5. **Total Estimated Time**: 25-50 minutes

---

## Cost Summary

- **Vercel**: Free tier (generous limits for Next.js)
- **Render**: Free tier ($0.10/hour hobby tier), or $7+/month for production
- **Neon Database**: Free tier with limitations, $50+/month production
- **Total**: Free to ~$100+/month depending on scale

---

## Next Steps

1. Commit all changes to GitHub
2. Follow backend deployment steps on Render
3. Follow frontend deployment steps on Vercel
4. Update `SOCKET_CORS` after both services are deployed
5. Test all functionality
6. Set up custom domains if desired
