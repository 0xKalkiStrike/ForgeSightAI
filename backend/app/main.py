import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
from app.services.simulator import simulator_service

from app.api.routers import (
    auth, machines, anomalies, alerts, predictions,
    maintenance, inspections, knowledge, data_sources,
    analytics, amd_performance, simulation, audit_logs,
    system_health
)

# Background telemetry loop runner
async def telemetry_background_task():
    while True:
        try:
            db = SessionLocal()
            # Step active simulation or normal telemetry for demo machines
            simulator_service.step_machine_telemetry("M-104", db)
            db.close()
        except Exception as e:
            print(f"Background simulator step error: {e}")
        await asyncio.sleep(settings.SIMULATION_INTERVAL_SEC)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    # Seed initial database records
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    # Start background telemetry loop
    task = asyncio.create_task(telemetry_background_task())
    yield
    task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(machines.router, prefix=settings.API_V1_STR)
app.include_router(anomalies.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(maintenance.router, prefix=settings.API_V1_STR)
app.include_router(inspections.router, prefix=settings.API_V1_STR)
app.include_router(knowledge.router, prefix=settings.API_V1_STR)
app.include_router(data_sources.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(amd_performance.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)
app.include_router(audit_logs.router, prefix=settings.API_V1_STR)
app.include_router(system_health.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "amd_hardware": settings.AMD_DEVICE_NAME,
        "docs_url": "/docs"
    }

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    db_status = "HEALTHY"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"UNHEALTHY: {e}"

    return {
        "status": "UP" if "HEALTHY" in db_status else "DEGRADED",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "amd_hardware": settings.AMD_DEVICE_NAME,
        "rocm_enabled": settings.ROCM_ENABLED
    }

# WebSocket for real-time telemetry updates
active_websockets = []

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            await asyncio.sleep(2)
            # Send latest machine states
            db = SessionLocal()
            try:
                query = text("SELECT id, name, status, health_score, failure_probability, current_temperature, current_vibration FROM machines")
                machines_data = db.execute(query).fetchall()
                payload = [
                    {
                        "id": m[0],
                        "name": m[1],
                        "status": m[2],
                        "health_score": m[3],
                        "failure_probability": m[4],
                        "temperature": m[5],
                        "vibration": m[6]
                    } for m in machines_data
                ]
                await websocket.send_json({"type": "TELEMETRY_UPDATE", "data": payload})
            finally:
                db.close()
    except WebSocketDisconnect:
        active_websockets.remove(websocket)
    except Exception:
        if websocket in active_websockets:
            active_websockets.remove(websocket)
