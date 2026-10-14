import io
import pandas as pd
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import SensorReading, Machine, AuditLog, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/data-sources", tags=["Data Sources"])

REQUIRED_COLUMNS = ["timestamp", "machine_id", "temperature", "vibration", "pressure", "rpm"]

@router.post("/upload-csv")
def upload_sensor_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = file.file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=400,
            detail=f"CSV missing required columns: {', '.join(missing_cols)}"
        )

    records_imported = 0
    invalid_records = 0
    missing_fields_count = 0

    for idx, row in df.iterrows():
        try:
            m_id = str(row["machine_id"])
            machine = db.query(Machine).filter(Machine.id == m_id).first()
            if not machine:
                invalid_records += 1
                continue

            # Check nulls
            if pd.isna(row["temperature"]) or pd.isna(row["vibration"]) or pd.isna(row["pressure"]):
                missing_fields_count += 1
                invalid_records += 1
                continue

            ts = pd.to_datetime(row["timestamp"]) if "timestamp" in row and not pd.isna(row["timestamp"]) else datetime.now(timezone.utc)

            reading = SensorReading(
                machine_id=m_id,
                timestamp=ts,
                temperature=float(row["temperature"]),
                vibration=float(row["vibration"]),
                pressure=float(row["pressure"]),
                rpm=float(row["rpm"]) if "rpm" in row and not pd.isna(row["rpm"]) else 1800.0,
                load=float(row["load"]) if "load" in row and not pd.isna(row["load"]) else 70.0,
                energy=float(row["energy"]) if "energy" in row and not pd.isna(row["energy"]) else 14.0,
                runtime=float(row["runtime"]) if "runtime" in row and not pd.isna(row["runtime"]) else 100.0
            )
            db.add(reading)
            records_imported += 1
        except Exception:
            invalid_records += 1

    audit = AuditLog(
        user_id=current_user.id,
        user_name=current_user.full_name,
        action="CSV_DATASET_IMPORTED",
        details=f"Uploaded CSV '{file.filename}'. Imported: {records_imported}, Invalid: {invalid_records}, Missing fields: {missing_fields_count}"
    )
    db.add(audit)
    db.commit()

    return {
        "file_name": file.filename,
        "records_imported": records_imported,
        "invalid_records": invalid_records,
        "missing_fields": missing_fields_count,
        "status": "Success",
        "message": f"Successfully ingested {records_imported} sensor telemetry frames."
    }
