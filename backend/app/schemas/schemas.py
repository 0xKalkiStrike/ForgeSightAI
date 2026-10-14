from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, ConfigDict

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "Operator"
    department: str = "Plant Operations"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

# Machine Schemas
class MachineBase(BaseModel):
    id: str
    name: str
    type: str
    location: str
    production_line: str
    status: str = "Healthy"
    health_score: float = 95.0
    failure_probability: float = 0.05
    risk_level: str = "Low"
    remaining_risk_window: str = "Normal Operation (>100 hrs)"
    operating_hours: float = 1420.0
    current_temperature: float = 68.5
    current_vibration: float = 4.8
    current_pressure: float = 102.0
    current_rpm: float = 1800.0
    current_load: float = 72.0
    current_energy: float = 14.2

class MachineCreate(MachineBase):
    pass

class MachineResponse(MachineBase):
    last_maintenance: Optional[datetime] = None
    next_scheduled_maintenance: Optional[datetime] = None
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Sensor Reading Schemas
class SensorReadingBase(BaseModel):
    machine_id: str
    temperature: float
    vibration: float
    pressure: float
    rpm: float
    load: float = 70.0
    energy: float = 14.0
    runtime: float = 100.0

class SensorReadingCreate(SensorReadingBase):
    pass

class SensorReadingResponse(SensorReadingBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

# Anomaly Schemas
class AnomalyResponse(BaseModel):
    id: int
    machine_id: str
    timestamp: datetime
    sensor: str
    baseline_value: float
    current_value: float
    deviation_pct: float
    severity: str
    confidence: float
    explanation: str
    model_config = ConfigDict(from_attributes=True)

# Alert Schemas
class AlertResponse(BaseModel):
    id: str
    machine_id: str
    alert_type: str
    severity: str
    timestamp: datetime
    sensor_name: str
    current_value: float
    expected_range: str
    ai_explanation: str
    failure_probability: float
    recommended_action: str
    status: str
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class AlertStatusUpdate(BaseModel):
    status: str

# Prediction Schemas
class FactorDetail(BaseModel):
    factor: str
    weight: float
    impact: str

class PredictionResponse(BaseModel):
    id: int
    machine_id: str
    timestamp: datetime
    failure_probability: float
    risk_level: str
    time_to_failure_hours: float
    contributing_factors: List[Any]
    model_name: str
    model_config = ConfigDict(from_attributes=True)

# Maintenance Schemas
class MaintenanceRecordCreate(BaseModel):
    machine_id: str
    technician_name: str
    issue: str
    action_taken: str
    parts_replaced: Optional[str] = None
    downtime_hours: float = 0.0
    cost: float = 0.0
    notes: Optional[str] = None
    maintenance_type: str = "Preventive"

class MaintenanceRecordResponse(MaintenanceRecordCreate):
    id: int
    date: datetime
    model_config = ConfigDict(from_attributes=True)

class MaintenanceRecommendationResponse(BaseModel):
    id: int
    machine_id: str
    title: str
    priority: str
    recommended_time_window: str
    estimated_risk: str
    estimated_avoided_downtime: float
    estimated_avoided_cost: float
    procedure_steps: List[str]
    human_status: str
    approved_by: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Defect Inspection Schemas
class DefectInspectionResponse(BaseModel):
    id: str
    machine_id: Optional[str] = None
    component_name: str
    image_name: str
    status: str
    defect_type: Optional[str] = None
    confidence: float
    severity: str
    recommendation: str
    bounding_boxes: Optional[List[Any]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Knowledge Assistant Schemas
class KnowledgeQuery(BaseModel):
    query: str
    machine_type: Optional[str] = None

class KnowledgeSource(BaseModel):
    title: str
    category: str
    file_name: str
    section_title: Optional[str] = None
    page_number: int
    relevance_score: float

class KnowledgeResponse(BaseModel):
    answer: str
    sources: List[KnowledgeSource]
    confidence: float
    query: str

# AMD Performance Schemas
class AmdBenchmarkResponse(BaseModel):
    id: int
    test_name: str
    workload_type: str
    cpu_latency_ms: float
    amd_gpu_latency_ms: float
    speedup_pct: float
    throughput_ops_sec: float
    device_info: str
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

# Analytics Summary Schema
class AnalyticsSummary(BaseModel):
    factory_health_score: float
    total_machines: int
    machines_online: int
    machines_at_risk: int
    critical_alerts: int
    predicted_failures: int
    prevented_downtime_hours: float
    estimated_cost_saved: float
    mtbf_hours: float
    mttr_hours: float
    prediction_accuracy_pct: float
    maintenance_efficiency_pct: float

# Audit Log Schema
class AuditLogResponse(BaseModel):
    id: int
    user_name: str
    action: str
    machine_id: Optional[str] = None
    alert_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)
