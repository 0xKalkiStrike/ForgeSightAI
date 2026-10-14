# ForgeSight AI — Production Deployment Guide

## 1. Quick Local Execution
On Windows:
```cmd
run.bat
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend**: [http://localhost:8001](http://localhost:8001)
- **Interactive API Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

---

## 2. Deploying Frontend to Vercel

The Next.js 16 frontend is production-ready and fully optimized for Vercel. 
It features a **resilient zero-downtime fallback layer** — even if the Python backend is still being provisioned, the entire web interface, simulations, KPI charts, and computer vision inspection flows will work live in the visitor's browser!

### Method A: Via GitHub & Vercel Dashboard (Recommended)
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: production responsive UI"
   git push origin main
   ```
2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your `ForgeSightAI` repository.
3. **Configure Project Settings**:
   - **Root Directory**: Click **Edit** and set it to: `frontend`
   - **Framework Preset**: Auto-detected as **Next.js**.
   - **Build Command**: `next build` (default).
   - **Output Directory**: `.next` (default).
4. **Environment Variables** (Optional, if backend is deployed):
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-url.onrender.com/api`
   - `NEXT_PUBLIC_WS_URL`: `wss://your-backend-url.onrender.com/ws/telemetry`
5. Click **Deploy**. Your app will be live globally in under 60 seconds!

### Method B: Via Vercel CLI
```bash
cd frontend
npx vercel
# Follow prompts (Root directory: ./, Framework: Next.js)
# For production deployment:
npx vercel --prod
```

---

## 3. Deploying the Python FastAPI Backend

Since FastAPI uses a persistent SQLite database, background simulation loops, and long-lived WebSockets (`/ws/telemetry`), it requires a persistent container service rather than serverless functions.

### Free Cloud Deployment Options:
- **Render.com** (Free Web Service):
  - New **Web Service** -> Connect GitHub repo.
  - **Root Directory**: `backend`
  - **Runtime**: `Python 3`
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Railway.app** or **Fly.io**:
  - Automatically builds from `backend/Dockerfile` or `backend/requirements.txt`.

Once your backend URL is live (e.g. `https://forgesight-api.onrender.com`), add `NEXT_PUBLIC_API_URL=https://forgesight-api.onrender.com/api` into your Vercel Project Settings under **Environment Variables**, and redeploy!

---

## 4. Docker Compose Deployment (Self-Hosted / VPS)

Ensure Docker Engine and Docker Compose are installed:
```bash
docker-compose up --build -d
```
Services started:
- **Backend**: Port 8001
- **Frontend**: Port 3000

