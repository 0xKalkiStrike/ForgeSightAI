from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import MaintenanceRecord, MaintenanceRecommendation, Machine, AuditLog, User
from app.schemas.schemas import MaintenanceRecordCreate, MaintenanceRecordResponse, MaintenanceRecommendationResponse
from app.api.deps import get_current_user
from app.services.simulator import simulator_service

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.get("/records", response_model=List[MaintenanceRecordResponse])
def list_maintenance_records(
    machine_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(MaintenanceRecord)
    if machine_id:
        query = query.filter(MaintenanceRecord.machine_id == machine_id)
    return query.order_by(MaintenanceRecord.date.desc()).limit(limit).all()

@router.post("/records", response_model=MaintenanceRecordResponse)
def create_maintenance_record(
    payload: MaintenanceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    machine = db.query(Machine).filter(Machine.id == payload.machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine {payload.machine_id} not found")

    rec = MaintenanceRecord(
        machine_id=payload.machine_id,
        technician_name=payload.technician_name or current_user.full_name,
        issue=payload.issue,
        action_taken=payload.action_taken,
        parts_replaced=payload.parts_replaced,
        downtime_hours=payload.downtime_hours,
        cost=payload.cost,
        notes=payload.notes,
        maintenance_type=payload.maintenance_type,
        date=datetime.now(timezone.utc)
    )
    db.add(rec)

    # Feedback loop: Reset machine risk and set health back to nominal post-service!
    machine.last_maintenance = datetime.now(timezone.utc)
    simulator_service.reset_simulation(machine.id, db)

    # Log audit event
    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="MAINTENANCE_RECORD_CREATED",
        machine_id=machine.id,
        details=f"Maintenance logged by {payload.technician_name}: {payload.issue}. Machine risk reset."
    )
    db.add(audit)
    db.commit()
    db.refresh(rec)
    return rec

@router.get("/recommendations", response_model=List[MaintenanceRecommendationResponse])
def list_recommendations(
    machine_id: Optional[str] = None,
    status: Optional[str] = None, # Pending, Approved, Rejected
    db: Session = Depends(get_db)
):
    query = db.query(MaintenanceRecommendation)
    if machine_id:
        query = query.filter(MaintenanceRecommendation.machine_id == machine_id)
    if status:
        query = query.filter(MaintenanceRecommendation.human_status == status)
    return query.order_by(MaintenanceRecommendation.created_at.desc()).all()

@router.post("/recommendations/{rec_id}/approve", response_model=MaintenanceRecommendationResponse)
def approve_recommendation(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = db.query(MaintenanceRecommendation).filter(MaintenanceRecommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.human_status = "Approved"
    rec.approved_by = current_user.full_name

    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="RECOMMENDATION_APPROVED",
        machine_id=rec.machine_id,
        details=f"Approved action '{rec.title}' for {rec.machine_id} by {current_user.full_name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(rec)
    return rec
