from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="Operator") # Admin, Manager, Engineer, Operator
    department = Column(String, default="Plant Operations")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    audit_logs = relationship("AuditLog", back_populates="user")

class Machine(Base):
    __tablename__ = "machines"

    id = Column(String, primary_key=True, index=True) # e.g., M-104, H-201
    name = Column(String, nullable=False) # e.g. CNC Milling Machine 4
    type = Column(String, nullable=False) # CNC Machine, Hydraulic Press, Conveyor Motor, Industrial Pump, Compressor, Robotic Arm
    location = Column(String, nullable=False) # Plant A - Sector 3
    production_line = Column(String, nullable=False) # Line 1, Line 2, Assembly A
    status = Column(String, default="Healthy") # Healthy, Warning, Critical, Offline
    health_score = Column(Float, default=95.0) # 0 to 100
    failure_probability = Column(Float, default=0.05) # 0.0 to 1.0
    risk_level = Column(String, default="Low") # Low, Medium, High, Critical
    remaining_risk_window = Column(String, default="Normal Operation (>100 hrs)")
    operating_hours = Column(Float, default=1420.0)
    
    # Live / Latest Telemetry cache
    current_temperature = Column(Float, default=68.5)
    current_vibration = Column(Float, default=4.8)
    current_pressure = Column(Float, default=102.0)
    current_rpm = Column(Float, default=1800.0)
    current_load = Column(Float, default=72.0)
    current_energy = Column(Float, default=14.2) # kW
    
    last_maintenance = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    next_scheduled_maintenance = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    sensor_readings = relationship("SensorReading", back_populates="machine", cascade="all, delete-orphan")
    anomalies = relationship("Anomaly", back_populates="machine", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="machine", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="machine", cascade="all, delete-orphan")
    maintenance_records = relationship("MaintenanceRecord", back_populates="machine", cascade="all, delete-orphan")
    recommendations = relationship("MaintenanceRecommendation", back_populates="machine", cascade="all, delete-orphan")
    inspections = relationship("DefectInspection", back_populates="machine", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    temperature = Column(Float, nullable=False) # Celsius
    vibration = Column(Float, nullable=False) # mm/s RMS
    pressure = Column(Float, nullable=False) # PSI
    rpm = Column(Float, nullable=False) # RPM
    load = Column(Float, default=70.0) # %
    energy = Column(Float, default=14.0) # kW
    runtime = Column(Float, default=100.0) # hours

    machine = relationship("Machine", back_populates="sensor_readings")

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    sensor = Column(String, nullable=False) # e.g. Vibration, Temperature
    baseline_value = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    deviation_pct = Column(Float, nullable=False) # +42%
    severity = Column(String, nullable=False) # Warning, Critical
    confidence = Column(Float, default=0.92)
    explanation = Column(Text, nullable=False)

    machine = relationship("Machine", back_populates="anomalies")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True) # e.g., ALT-104-01
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False, index=True)
    alert_type = Column(String, nullable=False) # Vibration Anomaly, Overheating, Pressure Drop
    severity = Column(String, nullable=False) # Warning, Critical
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    sensor_name = Column(String, nullable=False)
    current_value = Column(Float, nullable=False)
    expected_range = Column(String, nullable=False) # 4.0 - 6.0 mm/s
    ai_explanation = Column(Text, nullable=False)
    failure_probability = Column(Float, nullable=False) # 0.87
    recommended_action = Column(Text, nullable=False)
    status = Column(String, default="New") # New, Acknowledged, Investigating, Resolved, False Positive
    acknowledged_by = Column(String, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)

    machine = relationship("Machine", back_populates="alerts")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    failure_probability = Column(Float, nullable=False) # 0.87
    risk_level = Column(String, nullable=False) # Low, Medium, High, Critical
    time_to_failure_hours = Column(Float, nullable=False) # 10.5
    contributing_factors = Column(JSON, nullable=False) # List of factor objects
    model_name = Column(String, default="AMD-Predictive-Ensemble-v2")

    machine = relationship("Machine", back_populates="predictions")

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False, index=True)
    technician_name = Column(String, nullable=False)
    issue = Column(String, nullable=False)
    action_taken = Column(Text, nullable=False)
    parts_replaced = Column(String, nullable=True)
    downtime_hours = Column(Float, default=0.0)
    cost = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    maintenance_type = Column(String, default="Preventive") # Preventive, Emergency, Predictive

    machine = relationship("Machine", back_populates="maintenance_records")

class MaintenanceRecommendation(Base):
    __tablename__ = "maintenance_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    priority = Column(String, default="Critical") # Low, Medium, High, Critical
    recommended_time_window = Column(String, nullable=False) # e.g. "Within 8 hours"
    estimated_risk = Column(String, default="High")
    estimated_avoided_downtime = Column(Float, default=6.5) # hours
    estimated_avoided_cost = Column(Float, default=4800.0) # $
    procedure_steps = Column(JSON, nullable=False) # list of string steps
    human_status = Column(String, default="Pending") # Pending, Approved, Rejected
    approved_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    machine = relationship("Machine", back_populates="recommendations")

class DefectInspection(Base):
    __tablename__ = "defect_inspections"

    id = Column(String, primary_key=True, index=True)
    machine_id = Column(String, ForeignKey("machines.id"), nullable=True)
    component_name = Column(String, nullable=False) # Component A-218
    image_name = Column(String, nullable=False)
    status = Column(String, nullable=False) # DEFECT DETECTED, PASS
    defect_type = Column(String, nullable=True) # Surface Crack, Weld Porosity, Alignment Offset
    confidence = Column(Float, nullable=False) # 0.94
    severity = Column(String, default="High")
    recommendation = Column(Text, nullable=False)
    bounding_boxes = Column(JSON, nullable=True) # list of {x, y, width, height, label}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    machine = relationship("Machine", back_populates="inspections")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # SOP, Manual, Spec, Maintenance Log
    machine_type = Column(String, nullable=True) # CNC Machine, Bearing, etc.
    file_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    section_title = Column(String, nullable=True)
    page_number = Column(Integer, default=1)
    content = Column(Text, nullable=False)

    document = relationship("Document", back_populates="chunks")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String, nullable=False)
    action = Column(String, nullable=False) # Alert Acknowledged, Recommendation Approved, Simulation Failure Triggered
    machine_id = Column(String, nullable=True)
    alert_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="audit_logs")

class AmdBenchmarkResult(Base):
    __tablename__ = "amd_benchmark_results"

    id = Column(Integer, primary_key=True, index=True)
    test_name = Column(String, nullable=False) # Anomaly Isolation Forest, Tensor Matrix Multiplication, Vision Feature Extraction
    workload_type = Column(String, nullable=False) # Telemetry ML, Image Defect CV, RAG Embedding
    cpu_latency_ms = Column(Float, nullable=False)
    amd_gpu_latency_ms = Column(Float, nullable=False)
    speedup_pct = Column(Float, nullable=False)
    throughput_ops_sec = Column(Float, nullable=False)
    device_info = Column(String, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
