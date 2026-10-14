from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Alert, AuditLog, User
from app.schemas.schemas import AlertResponse, AlertStatusUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def list_alerts(
    status: Optional[str] = None, # New, Acknowledged, Investigating, Resolved, False Positive
    severity: Optional[str] = None,
    machine_id: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status and status != "All":
        query = query.filter(Alert.status == status)
    if severity and severity != "All":
        query = query.filter(Alert.severity == severity)
    if machine_id:
        query = query.filter(Alert.machine_id == machine_id)
    return query.order_by(Alert.timestamp.desc()).limit(limit).all()

@router.patch("/{alert_id}/status", response_model=AlertResponse)
def update_alert_status(
    alert_id: str,
    payload: AlertStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    old_status = alert.status
    alert.status = payload.status
    alert.acknowledged_by = current_user.full_name
    alert.acknowledged_at = datetime.now(timezone.utc)

    # Log audit event
    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action=f"ALERT_STATUS_CHANGED",
        machine_id=alert.machine_id,
        alert_id=alert.id,
        details=f"Alert status updated from '{old_status}' to '{payload.status}' by {current_user.full_name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)
    return alert
