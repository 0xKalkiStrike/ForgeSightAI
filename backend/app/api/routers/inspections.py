from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import DefectInspection, AuditLog, User
from app.schemas.schemas import DefectInspectionResponse
from app.ml.defect_detector import defect_detector_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/inspections", tags=["Quality Inspection"])

@router.get("", response_model=List[DefectInspectionResponse])
def list_inspections(db: Session = Depends(get_db)):
    return db.query(DefectInspection).order_by(DefectInspection.created_at.desc()).all()

@router.post("/analyze", response_model=DefectInspectionResponse)
def analyze_component(
    component_name: Optional[str] = Form("Component A-218"),
    machine_id: Optional[str] = Form("M-104"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_name = file.filename if file else "uploaded_component_scan.jpg"
    result = defect_detector_service.inspect_image(file_name, component_name)

    insp = DefectInspection(
        id=result["id"],
        machine_id=machine_id,
        component_name=result["component_name"],
        image_name=result["image_name"],
        status=result["status"],
        defect_type=result["defect_type"],
        confidence=result["confidence"],
        severity=result["severity"],
        recommendation=result["recommendation"],
        bounding_boxes=result["bounding_boxes"]
    )
    db.add(insp)

    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="DEFECT_INSPECTION_RUN",
        machine_id=machine_id,
        details=f"Ran visual inspection on '{component_name}'. Result: {result['status']} ({result['defect_type']})"
    )
    db.add(audit)
    db.commit()
    db.refresh(insp)
    return insp
