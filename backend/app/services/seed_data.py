import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.models import (
    User, Machine, SensorReading, Anomaly, Alert, Prediction,
    MaintenanceRecord, MaintenanceRecommendation, DefectInspection,
    Document, DocumentChunk, AuditLog, AmdBenchmarkResult
)
from app.core.security import get_password_hash
from app.ml.amd_benchmarker import amd_benchmarker_service
from app.ml.rag_assistant import KNOWLEDGE_BASE

def seed_database(db: Session):
    # Check if database already seeded
    if db.query(Machine).first():
        return

    print("Seeding FactoryGuard AI initial data...")

    # 1. Seed Demo Users (Password: "password123")
    hashed_pwd = get_password_hash("password123")
    users = [
        User(email="admin@factoryguard.ai", hashed_password=hashed_pwd, full_name="Sarah Connor", role="Admin", department="Executive Plant Ops"),
        User(email="manager@factoryguard.ai", hashed_password=hashed_pwd, full_name="Marcus Vance", role="Manager", department="Plant Operations"),
        User(email="engineer@factoryguard.ai", hashed_password=hashed_pwd, full_name="Rahul Sharma", role="Engineer", department="Reliability & Maintenance"),
        User(email="operator@factoryguard.ai", hashed_password=hashed_pwd, full_name="Alex Rivera", role="Operator", department="Line 1 Machining")
    ]
    db.add_all(users)
    db.commit()

    # 2. Seed 12 Industrial Machines across 3 Production Lines
    machines = [
        Machine(
            id="M-104",
            name="CNC Milling Machine 4",
            type="CNC Machine",
            location="Plant A - Sector 3",
            production_line="Line 1 - Machining",
            status="Healthy",
            health_score=94.0,
            failure_probability=0.06,
            risk_level="Low",
            remaining_risk_window="Normal Operation (>100 hrs)",
            operating_hours=1860.0,
            current_temperature=68.5,
            current_vibration=4.8,
            current_pressure=102.0,
            current_rpm=1800.0,
            current_load=72.0,
            current_energy=14.2,
            last_maintenance=datetime.now(timezone.utc) - timedelta(days=45),
            next_scheduled_maintenance=datetime.now(timezone.utc) + timedelta(days=15)
        ),
        Machine(
            id="M-101",
            name="CNC High-Speed Lathe 1",
            type="CNC Machine",
            location="Plant A - Sector 1",
            production_line="Line 1 - Machining",
            status="Healthy",
            health_score=97.0,
            failure_probability=0.03,
            risk_level="Low",
            remaining_risk_window="Normal Operation (>100 hrs)",
            operating_hours=920.0,
            current_temperature=66.0,
            current_vibration=4.2,
            current_pressure=100.0,
            current_rpm=1850.0,
            current_load=68.0,
            current_energy=13.8,
            last_maintenance=datetime.now(timezone.utc) - timedelta(days=12),
            next_scheduled_maintenance=datetime.now(timezone.utc) + timedelta(days=48)
        ),
        Machine(
            id="H-201",
            name="200T Hydraulic Press",
            type="Hydraulic Press",
            location="Plant B - Stamping",
            production_line="Line 2 - Stamping & Hydraulics",
            status="Healthy",
            health_score=91.0,
            failure_probability=0.09,
            risk_level="Low",
            remaining_risk_window="Normal Operation (>100 hrs)",
            operating_hours=2450.0,
            current_temperature=71.2,
            current_vibration=3.9,
            current_pressure=218.0,
            current_rpm=1450.0,
            current_load=81.0,
            current_energy=22.4,
            last_maintenance=datetime.now(timezone.utc) - timedelta(days=60),
            next_scheduled_maintenance=datetime.now(timezone.utc) + timedelta(days=30)
        ),
        Machine(
            id="H-205",
            name="Heavy Hydraulic Stamping Press 5",
            type="Hydraulic Press",
            location="Plant B - Stamping",
            production_line="Line 2 - Stamping & Hydraulics",
            status="Warning",
            health_score=78.0,
            failure_probability=0.28,
            risk_level="Medium",
            remaining_risk_window="Estimated 48–72 hours",
            operating_hours=3120.0,
            current_temperature=76.8,
            current_vibration=4.9,
            current_pressure=188.0,
            current_rpm=1420.0,
            current_load=86.0,
            current_energy=24.5,
            last_maintenance=datetime.now(timezone.utc) - timedelta(days=90),
            next_scheduled_maintenance=datetime.now(timezone.utc) + timedelta(days=5)
        ),
        Machine(
            id="P-302",
            name="Coolant Recirculation Pump",
            type="Industrial Pump",
            location="Plant A - Utilities",
            production_line="Line 1 - Machining",
            status="Healthy",
            health_score=96.0,
            failure_probability=0.04,
            risk_level="Low",
            remaining_risk_window="Normal Operation (>100 hrs)",
            operating_hours=1100.0,
            current_temperature=61.8,
            current_vibration=5.0,
            current_pressure=86.0,
            current_rpm=2400.0,
            current_load=64.0,
            current_energy=11.2,
            last_maintenance=datetime.now(timezone.utc) - timedelta(days=20),
            next_scheduled_maintenance=datetime.now(timezone.utc) + timedelta(days=70)
        ),
        Machine(
            id="C-405",
            name="Main Assembly Line Conveyor Motor",
            type="Conveyor Motor",
            location="Plant C - Assembly",
            production_line="Line 3 - Assembly",
            status="Healthy",
            health_score=95.0,
            failure_probability=0.05,
            risk_level="Low",
            remaining_risk_window="Normal Operation (>100 hrs)",
            operating_hours=1750.0,
            current_temperature=57.5,
            current_vibration=4.1,
            current_pressure=60.0,
            current_rpm=1200.0,
            current_load=56.0,
            current_energy=8.4,
            last_maintenance=datetime.now(timezone.utc) - timedelta(days=35),
            next_scheduled_maintenance=datetime.now(timezone.utc) + timedelta(days=25)
        ),
        Machine(
            id="K-501",
            name="Rotary Screw Air Compressor 1",
            type="Compressor",
            location="Plant A - Power Room",
            production_line="Line 1 - Machining",
            status="Warning",
            health_score=76.0,
            failure_probability=0.32,
            risk_level="Medium",
            remaining_risk_window="Estimated 36–60 hours",
            operating_hours=2890.0,
            current_temperature=79.2,
            current_vibration=5.8,
            current_pressure=142.0,
            current_rpm=2120.0,
            current_load=78.0,
            current_energy=19.2,
            last_maintenance=datetime.now(timezone.utc) - timedelta(days=80),
            next_scheduled_maintenance=datetime.now(timezone.utc) + timedelta(days=10)
        ),
        Machine(
            id="R-602",
            name="6-Axis Welding Robotic Arm",
            type="Robotic Arm",
            location="Plant C - Assembly",
            production_line="Line 3 - Assembly",
            status="Healthy",
            health_score=98.0,
            failure_probability=0.02,
            risk_level="Low",
            remaining_risk_window="Normal Operation (>100 hrs)",
            operating_hours=650.0,
            current_temperature=53.8,
            current_vibration=3.1,
            current_pressure=90.0,
            current_rpm=900.0,
            current_load=58.0,
            current_energy=6.7,
            last_maintenance=datetime.now(timezone.utc) - timedelta(days=15),
            next_scheduled_maintenance=datetime.now(timezone.utc) + timedelta(days=75)
        )
    ]
    db.add_all(machines)
    db.commit()

    # 3. Historical Telemetry for Machine M-104 (for time-series charts)
    now = datetime.now(timezone.utc)
    readings = []
    for i in range(24, 0, -1):
        t = now - timedelta(hours=i)
        readings.append(SensorReading(
            machine_id="M-104",
            timestamp=t,
            temperature=67.5 + (random.uniform(-0.5, 0.5)),
            vibration=4.6 + (random.uniform(-0.2, 0.2)),
            pressure=101.5 + (random.uniform(-1.0, 1.0)),
            rpm=1800.0 + (random.uniform(-10, 10)),
            load=71.0,
            energy=14.1,
            runtime=1860.0 - i
        ))
    db.add_all(readings)

    # 4. Technical Documentation (RAG indexing)
    for doc_item in KNOWLEDGE_BASE:
        doc = Document(
            title=doc_item["title"],
            category=doc_item["category"],
            file_name=doc_item["file_name"],
            machine_type=doc_item["machine_type"],
            content="\n".join([c["content"] for c in doc_item["chunks"]])
        )
        db.add(doc)
        db.flush()

        for idx, chunk_item in enumerate(doc_item["chunks"]):
            chk = DocumentChunk(
                document_id=doc.id,
                chunk_index=idx,
                section_title=chunk_item["section_title"],
                page_number=chunk_item["page_number"],
                content=chunk_item["content"]
            )
            db.add(chk)

    # 5. Completed Maintenance Record
    maint_rec = MaintenanceRecord(
        machine_id="M-104",
        technician_name="Rahul Sharma",
        issue="Scheduled 1500-hour Spindle Lubrication & Filter Replacement",
        action_taken="Flushed oil lines, lubricated bearing housing, replaced air intake filter.",
        parts_replaced="Filter Element #F-104, Synthetic Grease SHC 220",
        downtime_hours=2.5,
        cost=320.0,
        notes="All parameters nominal after post-test cycle.",
        date=now - timedelta(days=45),
        maintenance_type="Preventive"
    )
    db.add(maint_rec)

    # 6. Sample Defect Inspection
    insp = DefectInspection(
        id="INSP-1042",
        machine_id="M-104",
        component_name="Component A-218 (CNC Spindle Flange)",
        image_name="spindle_flange_crack.png",
        status="DEFECT DETECTED",
        defect_type="Surface Micro-Crack",
        confidence=0.94,
        severity="High",
        recommendation="Remove component from production batch immediately. Perform non-destructive dye-penetrant test.",
        bounding_boxes=[{"x": 38, "y": 42, "width": 24, "height": 18, "label": "Surface Crack (0.94)"}],
        created_at=now - timedelta(hours=3)
    )
    db.add(insp)

    # 7. Initial Audit Log
    logs = [
        AuditLog(user_name="System Administrator", action="SYSTEM_INITIALIZATION", details="FactoryGuard AI platform initialized with AMD GPU/ROCm acceleration engine."),
        AuditLog(user_name="Rahul Sharma", action="PREVENTIVE_MAINTENANCE_COMPLETED", machine_id="M-104", details="Completed scheduled 1500-hour service.")
    ]
    db.add_all(logs)

    # 8. AMD Benchmarks initial run
    bench_results = amd_benchmarker_service.run_benchmark("all")
    for b in bench_results:
        db.add(AmdBenchmarkResult(
            test_name=b["test_name"],
            workload_type=b["workload_type"],
            cpu_latency_ms=b["cpu_latency_ms"],
            amd_gpu_latency_ms=b["amd_gpu_latency_ms"],
            speedup_pct=b["speedup_pct"],
            throughput_ops_sec=b["throughput_ops_sec"],
            device_info=b["device_info"]
        ))

    db.commit()
    print("Database successfully seeded!")
