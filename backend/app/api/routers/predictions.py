from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Prediction
from app.schemas.schemas import PredictionResponse

router = APIRouter(prefix="/predictions", tags=["Predictive Maintenance"])

@router.get("", response_model=List[PredictionResponse])
def list_predictions(
    machine_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Prediction)
    if machine_id:
        query = query.filter(Prediction.machine_id == machine_id)
    return query.order_by(Prediction.timestamp.desc()).limit(limit).all()
