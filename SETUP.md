# Agentic Workflow Builder - Setup Guide

Complete setup instructions for running the Agentic Workflow Builder project.

---

## 📋 Required Software

### Core Requirements
- **Node.js:** v20.x or higher
- **npm:** v10.x or higher (comes with Node.js)
- **PostgreSQL:** v15.x or higher
- **Redis:** v7.x or higher

### Optional Tools
- **Git:** For version control
- **Postman/Thunder Client:** For API testing
- **pgAdmin/Prisma Studio:** For database management

---

## 🔧 Software Installation

### Windows Installation

#### 1. **Node.js**
```powershell
# Download from official website
https://nodejs.org/en/download/

# Or using Chocolatey
choco install nodejs-lts

# Verify installation
node --version
npm --version
```

#### 2. **PostgreSQL**
```powershell
# Download from official website
https://www.postgresql.org/download/windows/

# Or using Chocolatey
choco install postgresql15

# Verify installation
psql --version

# Default credentials (set during installation):
# Username: postgres
# Port: 5432
```

#### 3. **Redis**
```powershell
# Download Redis for Windows (Memurai or Redis for Windows)
https://github.com/microsoftarchive/redis/releases

# Or use WSL2 with Redis
wsl --install
wsl
sudo apt update
sudo apt install redis-server

# Start Redis in WSL
sudo service redis-server start

# Verify
redis-cli ping
# Should return: PONG
```

---

## 📦 Project Installation

### 1. Clone/Extract Project
```powershell
cd "C:\Users\Koushik V S\.gemini\antigravity\scratch\agentic-workflow-builder"
```

### 2. Install Backend Dependencies
```powershell
cd backend
npm install
```

### 3. Install Frontend Dependencies
```powershell
cd ../frontend
npm install
```

---

## 🗄️ Database Setup

### 1. Create Database
```powershell
# Connect to PostgreSQL
psql -U postgres

# Run in PostgreSQL shell
CREATE DATABASE agentic_workflow;
\q

# Or execute the SQL file
psql -U postgres -f database_creation.sql
```

### 2. Configure Database Connection
Edit `backend/.env` file (see ENV File Example below)

### 3. Run Migrations
```powershell
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Seed Database (Optional)
```powershell
npm run seed
```

---

## 🔐 Environment Configuration

### Backend `.env` File

Create `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/agentic_workflow?schema=public"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Unbound API Configuration
UNBOUND_API_KEY="your_unbound_api_key_here"
UNBOUND_API_URL="https://api.unbound.ai/v1"

# CORS Configuration
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# JWT Secret (for future auth)
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"

# Logging
LOG_LEVEL="debug"

# Execution Configuration
MAX_CONCURRENT_EXECUTIONS=5
DEFAULT_RETRY_LIMIT=3
DEFAULT_TIMEOUT_MS=300000

# Cost Limits
DEFAULT_WORKFLOW_COST_BUDGET=10.00
DEFAULT_STEP_COST_BUDGET=5.00

# WebSocket
WS_PORT=5001
```

### Frontend `.env` File

Create `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5001

# App Configuration
VITE_APP_NAME="Agentic Workflow Builder"
VITE_APP_VERSION="1.0.0"

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_PARALLEL_EXECUTION=true
```

---

## ▶️ Running the Project

### Start All Services (Recommended)

#### Terminal 1: Redis (if using WSL)
```powershell
wsl
sudo service redis-server start
redis-cli ping  # Verify it returns PONG
```

#### Terminal 2: Backend Server
```powershell
cd backend
npm run dev
```

Expected output:
```
[INFO] Server running on http://localhost:5000
[INFO] WebSocket server running on http://localhost:5001
[INFO] Database connected
[INFO] Redis connected
```

#### Terminal 3: Frontend Dev Server
```powershell
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Alternative: Using PM2 (Production-like)

```powershell
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start npm --name "workflow-backend" -- run dev

# Start frontend
cd ../frontend
pm2 start npm --name "workflow-frontend" -- run dev

# View logs
pm2 logs

# Stop all
pm2 stop all
```

---

## 🔄 Start Redis Worker (Background Jobs)

The Redis worker is integrated into the backend server. When you run `npm run dev` in the backend, it automatically starts:
- Express API server
- WebSocket server
- Bull queue worker for background job processing

If you want to run workers separately:

```powershell
cd backend
npm run worker
```

---

## 🧪 Verify Installation

### 1. Check Backend Health
```powershell
# Test API endpoint
curl http://localhost:5000/api/health

# Or open in browser
http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-05T04:12:15.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### 2. Check Frontend
Open browser: `http://localhost:5173/`

You should see the Agentic Workflow Builder UI.

### 3. Check WebSocket
```javascript
// Open browser console on http://localhost:5173/
// WebSocket connection should be established automatically
// You'll see: "WebSocket connected" in network tab
```

---

## 🚨 Common Errors & Fixes

### Error 1: `Port 5000 already in use`
**Solution:**
```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Error 2: `PostgreSQL connection refused`
**Solution:**
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Start PostgreSQL service
Start-Service postgresql-x64-15

# Verify connection
psql -U postgres -c "SELECT version();"

# Check DATABASE_URL in .env matches your credentials
```

### Error 3: `Redis connection failed`
**Solution:**
```powershell
# If using WSL
wsl
sudo service redis-server start
sudo service redis-server status

# If using Windows Redis
# Check Redis service in Services app
# Or restart Redis service

# Verify Redis is accessible
redis-cli ping
```

### Error 4: `Prisma Client not generated`
**Solution:**
```powershell
cd backend
npx prisma generate
```

### Error 5: `Module not found` errors
**Solution:**
```powershell
# Delete node_modules and reinstall
cd backend
Remove-Item -Recurse -Force node_modules
npm install

cd ../frontend
Remove-Item -Recurse -Force node_modules
npm install
```

### Error 6: `UNBOUND_API_KEY not found`
**Solution:**
```env
# Add your Unbound API key to backend/.env
UNBOUND_API_KEY="your_actual_api_key_here"
```

### Error 7: `CORS error` in frontend
**Solution:**
```env
# Ensure backend/.env has correct origins
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

### Error 8: Migration fails
**Solution:**
```powershell
# Reset database
cd backend
npx prisma migrate reset

# Run migrations fresh
npx prisma migrate dev --name init
```

### Error 9: TypeScript errors
**Solution:**
```powershell
# Rebuild TypeScript
cd backend
npm run build

cd ../frontend
npm run build
```

---

## 📚 Useful Commands

### Backend Commands
```powershell
cd backend

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Database commands
npx prisma studio          # Open Prisma Studio GUI
npx prisma migrate dev     # Create new migration
npx prisma migrate reset   # Reset database
npx prisma db seed         # Seed database

# Linting
npm run lint
npm run lint:fix
```

### Frontend Commands
```powershell
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
```

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js v20+
- [ ] Install PostgreSQL v15+
- [ ] Install Redis v7+
- [ ] Create `agentic_workflow` database
- [ ] Configure `backend/.env` file
- [ ] Configure `frontend/.env` file
- [ ] Run `npm install` in backend
- [ ] Run `npm install` in frontend
- [ ] Run `npx prisma migrate dev` in backend
- [ ] Start Redis server
- [ ] Start backend: `npm run dev`
- [ ] Start frontend: `npm run dev`
- [ ] Open `http://localhost:5173/` in browser
- [ ] Verify all services are running

---

## 🔍 Testing the System

### Create Your First Workflow

1. Open `http://localhost:5173/`
2. Click "Create New Workflow"
3. Add a step:
   - Name: "Hello World"
   - Model: "gpt-3.5-turbo"
   - Prompt: "Say hello and introduce yourself"
   - Criteria: Contains "hello"
4. Save workflow
5. Click "Run Workflow"
6. Watch real-time execution in the dashboard

---

## 📞 Need Help?

If you encounter issues not covered here:

1. Check the logs:
   - Backend: Console output from `npm run dev`
   - Frontend: Browser console (F12)
   - Database: `npx prisma studio`

2. Verify all services:
   ```powershell
   # PostgreSQL
   psql -U postgres -c "SELECT 1"
   
   # Redis
   redis-cli ping
   
   # Backend
   curl http://localhost:5000/api/health
   ```

3. Common fixes:
   - Clear browser cache
   - Restart all services
   - Delete `node_modules` and reinstall
   - Reset database with `npx prisma migrate reset`

---

## 🚀 Production Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production database URL
- Set up Redis cluster
- Configure CORS for production domain

### Build Commands
```powershell
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve the 'dist' folder with nginx/Apache
```

### Recommended Hosting
- **Backend:** Railway, Render, DigitalOcean
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Database:** DigitalOcean Managed PostgreSQL, Supabase
- **Redis:** Redis Cloud, Upstash

---

**You're all set! 🎉**

Start building amazing AI workflows with the Agentic Workflow Builder!
