import asyncio
import random
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import Machine, SensorReading, Anomaly, Alert, Prediction, MaintenanceRecommendation, AuditLog
from app.ml.anomaly_detector import anomaly_detector_service
from app.ml.predictive_engine import predictive_engine_service
from app.ml.root_cause_engine import root_cause_engine_service
from app.ml.action_recommender import action_recommender_service

# Active simulation overrides for live demo
simulation_state = {
    "M-104": {
        "mode": "normal", # normal, developing_failure, critical
        "step": 0,
        "max_steps": 5
    }
}

class TelemetrySimulator:
    def trigger_failure_simulation(self, machine_id: str, db: Session):
        """Starts controlled step-by-step failure drift on specified machine."""
        simulation_state[machine_id] = {
            "mode": "developing_failure",
            "step": 1,
            "max_steps": 5
        }
        # Immediately step telemetry once
        self.step_machine_telemetry(machine_id, db)

    def reset_simulation(self, machine_id: str, db: Session):
        """Resets machine back to normal baseline state."""
        simulation_state[machine_id] = {
            "mode": "normal",
            "step": 0,
            "max_steps": 5
        }
        m = db.query(Machine).filter(Machine.id == machine_id).first()
        if m:
            m.status = "Healthy"
            m.health_score = 95.0
            m.failure_probability = 0.05
            m.risk_level = "Low"
            m.remaining_risk_window = "Normal Operation (>100 hrs)"
            m.current_temperature = 68.5
            m.current_vibration = 4.8
            m.current_pressure = 102.0
            m.current_rpm = 1800.0
            m.current_load = 72.0
            m.current_energy = 14.2
            
            # Resolve or clear active critical alerts for demo machine
            active_alerts = db.query(Alert).filter(Alert.machine_id == machine_id, Alert.status == "New").all()
            for alt in active_alerts:
                alt.status = "Resolved"
                
            db.commit()

    def step_machine_telemetry(self, machine_id: str, db: Session):
        m = db.query(Machine).filter(Machine.id == machine_id).first()
        if not m:
            return

        state = simulation_state.get(machine_id, {"mode": "normal", "step": 0})
        mode = state["mode"]

        if mode == "developing_failure":
            step = state["step"]
            # Gradually drift telemetry upwards
            m.current_vibration = round(4.8 + (step * 0.9), 1) # 5.7, 6.6, 7.5, 8.4, 9.3 mm/s
            m.current_temperature = round(68.5 + (step * 2.8), 1) # 71.3, 74.1, 76.9, 79.7, 82.5 °C
            m.current_pressure = round(102.0 - (step * 1.5), 1) # 100.5, 99.0, 97.5...
            m.current_energy = round(14.2 + (step * 0.8), 1) # Energy spike
            
            if step < state.get("max_steps", 5):
                state["step"] += 1

        else: # normal mode with realistic micro-jitter
            m.current_vibration = round(max(3.5, min(5.8, m.current_vibration + random.uniform(-0.1, 0.1))), 1)
            m.current_temperature = round(max(60.0, min(73.0, m.current_temperature + random.uniform(-0.2, 0.2))), 1)
            m.current_pressure = round(max(95.0, min(108.0, m.current_pressure + random.uniform(-0.5, 0.5))), 1)
            m.current_rpm = round(max(1780.0, min(1820.0, m.current_rpm + random.uniform(-5.0, 5.0))), 0)

        # 1. Log sensor reading record
        reading = SensorReading(
            machine_id=m.id,
            timestamp=datetime.now(timezone.utc),
            temperature=m.current_temperature,
            vibration=m.current_vibration,
            pressure=m.current_pressure,
            rpm=m.current_rpm,
            load=m.current_load,
            energy=m.current_energy,
            runtime=m.operating_hours
        )
        db.add(reading)

        # 2. Run Anomaly Detection Pipeline
        telemetry_dict = {
            "temperature": m.current_temperature,
            "vibration": m.current_vibration,
            "pressure": m.current_pressure,
            "rpm": m.current_rpm,
            "load": m.current_load,
            "energy": m.current_energy
        }
        anomalies_detected = anomaly_detector_service.detect_anomalies(m.type, telemetry_dict)

        # Save anomaly objects
        for anom in anomalies_detected:
            a_obj = Anomaly(
                machine_id=m.id,
                timestamp=datetime.now(timezone.utc),
                sensor=anom["sensor"],
                baseline_value=anom["baseline_value"],
                current_value=anom["current_value"],
                deviation_pct=anom["deviation_pct"],
                severity=anom["severity"],
                confidence=anom["confidence"],
                explanation=anom["explanation"]
            )
            db.add(a_obj)

        # 3. Run Predictive Maintenance Risk Pipeline
        pred_res = predictive_engine_service.calculate_failure_risk(
            machine_type=m.type,
            current_telemetry=telemetry_dict,
            anomalies=anomalies_detected,
            operating_hours=m.operating_hours
        )

        m.failure_probability = pred_res["failure_probability"]
        m.risk_level = pred_res["risk_level"]
        m.remaining_risk_window = pred_res["remaining_risk_window"]
        
        # Calculate Machine Health Score (0-100)
        # Health score = 100 - (failure_prob * 75) - (anomalies_count * 5)
        m.health_score = round(max(15.0, min(100.0, 100.0 - (m.failure_probability * 70.0) - (len(anomalies_detected) * 4.0))), 0)
        
        if m.health_score < 60.0 or m.risk_level == "Critical":
            m.status = "Critical"
        elif m.health_score < 80.0 or m.risk_level in ["High", "Medium"]:
            m.status = "Warning"
        else:
            m.status = "Healthy"

        # Save Prediction record
        p_obj = Prediction(
            machine_id=m.id,
            timestamp=datetime.now(timezone.utc),
            failure_probability=pred_res["failure_probability"],
            risk_level=pred_res["risk_level"],
            time_to_failure_hours=pred_res["time_to_failure_hours"],
            contributing_factors=pred_res["contributing_factors"]
        )
        db.add(p_obj)

        # 4. If critical or high risk anomaly, generate Alert, Root Cause & Recommendation
        if m.failure_probability >= 0.50 or any(a["severity"] == "Critical" for a in anomalies_detected):
            # Check if active alert already exists
            existing_alert = db.query(Alert).filter(Alert.machine_id == m.id, Alert.status == "New").first()
            if not existing_alert:
                rca = root_cause_engine_service.analyze_root_cause(m.type, telemetry_dict, anomalies_detected, m.operating_hours)
                rec = action_recommender_service.generate_recommendation(m.id, m.name, rca, m.failure_probability)

                alert_id = f"ALT-{m.id}-{random.randint(100, 999)}"
                new_alert = Alert(
                    id=alert_id,
                    machine_id=m.id,
                    alert_type="High Vibration Anomaly" if m.current_vibration > 6.0 else "Thermal Overheating",
                    severity="Critical" if m.failure_probability >= 0.75 else "Warning",
                    timestamp=datetime.now(timezone.utc),
                    sensor_name="Vibration" if m.current_vibration > 6.0 else "Temperature",
                    current_value=m.current_vibration if m.current_vibration > 6.0 else m.current_temperature,
                    expected_range="4.0–5.9 mm/s" if m.current_vibration > 6.0 else "60.0–72.0 °C",
                    ai_explanation=rca["likely_issue"] + ": " + rca["evidence"][0],
                    failure_probability=m.failure_probability,
                    recommended_action=rec["title"],
                    status="New"
                )
                db.add(new_alert)

                rec_obj = MaintenanceRecommendation(
                    machine_id=m.id,
                    title=rec["title"],
                    priority=rec["priority"],
                    recommended_time_window=rec["recommended_time_window"],
                    estimated_risk=rec["estimated_risk"],
                    estimated_avoided_downtime=rec["estimated_avoided_downtime"],
                    estimated_avoided_cost=rec["estimated_avoided_cost"],
                    procedure_steps=rec["procedure_steps"],
                    human_status="Pending"
                )
                db.add(rec_obj)

                audit = AuditLog(
                    user_name="FactoryGuard AI Engine",
                    action="CRITICAL_ANOMALY_DETECTED",
                    machine_id=m.id,
                    alert_id=alert_id,
                    details=f"Failure risk reached {int(m.failure_probability*100)}%. Created alert {alert_id} and recommendation."
                )
                db.add(audit)

        db.commit()

simulator_service = TelemetrySimulator()
