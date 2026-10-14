from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.simulator import simulator_service
from app.models.models import AuditLog, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/simulation", tags=["Factory Simulator"])

@router.post("/trigger-failure/{machine_id}")
def trigger_failure(
    machine_id: str = "M-104",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers controlled operational stress test on specified machine (e.g. M-104).
    Step 1: Telemetry drift (Vibration & Temperature).
    Step 2: Anomaly detection trigger.
    Step 3: Predictive failure risk calculation.
    Step 4: Real-time alert and maintenance recommendation generation.
    """
    simulator_service.trigger_failure_simulation(machine_id, db)

    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="OPERATIONAL_STRESS_TEST_TRIGGERED",
        machine_id=machine_id,
        details=f"User initiated operational stress test on {machine_id}. Telemetry drift active."
    )
    db.add(audit)
    db.commit()

    return {
        "status": "Success",
        "machine_id": machine_id,
        "message": f"Operational stress test initiated for {machine_id}. Real-time telemetry drift active."
    }

@router.post("/reset/{machine_id}")
def reset_simulation(
    machine_id: str = "M-104",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resets machine telemetry back to nominal operating baseline."""
    simulator_service.reset_simulation(machine_id, db)

    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="TELEMETRY_BASELINE_RESET",
        machine_id=machine_id,
        details=f"User reset machine {machine_id} back to nominal operational state."
    )
    db.add(audit)
    db.commit()

    return {
        "status": "Success",
        "machine_id": machine_id,
        "message": f"Machine {machine_id} restored to nominal operating baseline."
    }
