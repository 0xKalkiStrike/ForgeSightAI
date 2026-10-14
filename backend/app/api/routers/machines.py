from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Machine, SensorReading
from app.schemas.schemas import MachineResponse, SensorReadingResponse

router = APIRouter(prefix="/machines", tags=["Machines"])

@router.get("", response_model=List[MachineResponse])
def list_machines(
    status: Optional[str] = None, # Healthy, Warning, Critical, Offline
    search: Optional[str] = None, # machine ID, name, production line
    line: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Machine)
    if status and status != "All":
        query = query.filter(Machine.status == status)
    if line:
        query = query.filter(Machine.production_line == line)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Machine.id.ilike(search_term)) |
            (Machine.name.ilike(search_term)) |
            (Machine.production_line.ilike(search_term)) |
            (Machine.type.ilike(search_term))
        )
    return query.order_by(Machine.id).all()

@router.get("/{machine_id}", response_model=MachineResponse)
def get_machine(machine_id: str, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine {machine_id} not found")
    return machine

@router.get("/{machine_id}/telemetry", response_model=List[SensorReadingResponse])
def get_machine_telemetry(
    machine_id: str,
    time_range: str = Query("24h", description="1h, 6h, 24h, 7d, 30d"),
    db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine {machine_id} not found")
    
    limit_map = {"1h": 12, "6h": 36, "24h": 96, "7d": 168, "30d": 300}
    limit = limit_map.get(time_range, 96)

    readings = db.query(SensorReading).filter(
        SensorReading.machine_id == machine_id
    ).order_by(SensorReading.timestamp.desc()).limit(limit).all()

    return list(reversed(readings))
