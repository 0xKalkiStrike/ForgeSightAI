# ForgeSight AI — Deployment & Docker Containerization

## 1. Quick Local Execution (Batch Script)

On Windows host:
```cmd
run.bat
```
This automatically initializes Python `venv`, installs backend dependencies, verifies `frontend/node_modules`, starts FastAPI (Port 8000), starts Next.js (Port 3000), and opens the web application.

---

## 2. Docker Compose Deployment

Ensure Docker Engine and Docker Compose are installed.

```bash
docker-compose up --build -d
```

### Services Started:
- **Backend Service:** FastAPI container exposed on port 8000.
- **Frontend Service:** Next.js container exposed on port 3000.
- **Database:** PostgreSQL container on port 5432.
- **Redis:** Redis cache & queue worker on port 6379.

---

## 3. Environment Variables (`.env`)

```ini
DATABASE_URL=sqlite:///./factoryguard.db
SECRET_KEY=forgesight_amd_hackathon_super_secret_key_2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
AMD_GPU_ENABLED=True
ROCM_ENABLED=True
AMD_DEVICE_NAME=AMD Radeon(TM) Graphics
SIMULATION_INTERVAL_SEC=3.0
```
