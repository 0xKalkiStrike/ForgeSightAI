from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Anomaly
from app.schemas.schemas import AnomalyResponse

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

@router.get("", response_model=List[AnomalyResponse])
def list_anomalies(
    machine_id: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Anomaly)
    if machine_id:
        query = query.filter(Anomaly.machine_id == machine_id)
    if severity:
        query = query.filter(Anomaly.severity == severity)
    return query.order_by(Anomaly.timestamp.desc()).limit(limit).all()
