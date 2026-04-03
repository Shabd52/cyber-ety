# Git Configuration for Deployment

## 1. Initialize Git Repository (if not already done)

```bash
cd d:\VSProjects\cyberEty
git init
git add .
git commit -m "Initial commit: Cyber Etymology game - ready for deployment"
```

## 2. Connect to GitHub Repository

```bash
# For new repository, get URL from GitHub
git remote add origin https://github.com/YOUR_USERNAME/cyberEty.git
git branch -M main
git push -u origin main
```

## 3. Verify Git Configuration

```bash
git config --list
git remote -v  # Should show GitHub URL
git log        # Should show commits
```

## 4. Important Git Rules for Deployment

### ✅ DO Commit These Files
```
✅ frontend/src/
✅ backend/src/
✅ shared/
✅ package.json (all)
✅ tsconfig.json (all)
✅ .gitignore
✅ .env.example (NO SECRETS!)
✅ backend/.env.example
✅ frontend/.env.example
✅ vercel.json
✅ render-build.sh
✅ All documentation (.md files)
✅ public/spark-logo.png
```

### ❌ DO NOT Commit These Files
```
❌ .env (development - has secrets)
❌ .env.production (has production secrets)
❌ node_modules/
❌ dist/ (backend build - auto-built on Render)
❌ .next/ (frontend build - auto-built on Vercel)
❌ *.log files
❌ .DS_Store
❌ Thumbs.db
❌ .vscode/settings.json (local IDE config)
```

## 5. Final Pre-Deployment Git Check

```bash
# See what will be committed
git status

# Verify .env files are NOT included
git ls-files | grep -E "\.env($|\.)" 
# Should return nothing (if it shows .env files, they're not properly gitignored!)

# See all files that would be deployed
git ls-files | head -20
```

## 6. Push to Deployment

```bash
# Make sure you're on main branch
git branch

# Push to GitHub
git push origin main

# Verify GitHub has all files
# Visit: https://github.com/YOUR_USERNAME/cyberEty
```

## 7. Connect Services to GitHub

### Render
1. Go to render.com
2. Click "New +" → "Web Service"
3. Select "Connect to GitHub"
4. Choose cyberEty repository
5. Configure as backend service

### Vercel  
1. Go to vercel.com
2. Click "New Project"
3. Import from GitHub
4. Select cyberEty repository
5. Configure root directory as "frontend"

## ✅ Pre-Deployment Checklist

- [ ] All builds complete successfully locally
- [ ] No errors in `npm run build` output
- [ ] dist/ directory exists in backend
- [ ] .next/ directory exists in frontend
- [ ] .env files are in .gitignore (verify with: git ls-files | grep .env)
- [ ] .env.example files created and have no secrets
- [ ] All source files committed to git
- [ ] GitHub repository is public (or shared with Render/Vercel)
- [ ] Main branch is up to date
- [ ] No uncommitted changes (git status should be clean)
