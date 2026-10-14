import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List, Optional
from datetime import datetime

# Standard Baselines per Machine Type
BASELINES = {
    "CNC Machine": {"temperature": 68.0, "vibration": 4.5, "pressure": 100.0, "rpm": 1800.0, "load": 70.0, "energy": 14.0},
    "Hydraulic Press": {"temperature": 72.0, "vibration": 3.8, "pressure": 220.0, "rpm": 1450.0, "load": 80.0, "energy": 22.0},
    "Industrial Pump": {"temperature": 62.0, "vibration": 5.1, "pressure": 85.0, "rpm": 2400.0, "load": 65.0, "energy": 11.5},
    "Conveyor Motor": {"temperature": 58.0, "vibration": 4.0, "pressure": 60.0, "rpm": 1200.0, "load": 55.0, "energy": 8.5},
    "Compressor": {"temperature": 75.0, "vibration": 5.5, "pressure": 150.0, "rpm": 2100.0, "load": 75.0, "energy": 18.0},
    "Robotic Arm": {"temperature": 54.0, "vibration": 3.2, "pressure": 90.0, "rpm": 900.0, "load": 60.0, "energy": 6.8}
}

TOLERANCES = {
    "temperature": {"warn_pct": 15.0, "crit_pct": 30.0, "unit": "°C"},
    "vibration": {"warn_pct": 25.0, "crit_pct": 50.0, "unit": "mm/s"},
    "pressure": {"warn_pct": 18.0, "crit_pct": 35.0, "unit": "PSI"},
    "rpm": {"warn_pct": 15.0, "crit_pct": 30.0, "unit": "RPM"},
    "load": {"warn_pct": 20.0, "crit_pct": 40.0, "unit": "%"},
    "energy": {"warn_pct": 20.0, "crit_pct": 40.0, "unit": "kW"}
}

class AnomalyDetector:
    def __init__(self):
        # Initialize IsolationForest model trained on synthetic normal telemetry
        self.iso_forest = IsolationForest(contamination=0.08, random_state=42)
        normal_samples = []
        for _ in range(500):
            # Generate normal range sample
            temp = np.random.normal(68, 4)
            vib = np.random.normal(4.5, 0.5)
            press = np.random.normal(100, 5)
            rpm = np.random.normal(1800, 30)
            normal_samples.append([temp, vib, press, rpm])
        self.iso_forest.fit(normal_samples)

    def detect_anomalies(self, machine_type: str, current_reading: Dict[str, float]) -> List[Dict[str, Any]]:
        anomalies = []
        baseline = BASELINES.get(machine_type, BASELINES["CNC Machine"])

        # 1. Feature statistical evaluation
        for sensor, curr_val in current_reading.items():
            if sensor not in baseline:
                continue
            
            base_val = baseline[sensor]
            tol = TOLERANCES.get(sensor, {"warn_pct": 20.0, "crit_pct": 40.0, "unit": ""})
            
            diff = curr_val - base_val
            pct_change = (diff / base_val) * 100.0
            abs_pct = abs(pct_change)

            if abs_pct >= tol["warn_pct"]:
                severity = "Critical" if abs_pct >= tol["crit_pct"] else "Warning"
                direction = "increased" if diff > 0 else "decreased"
                unit = tol["unit"]
                
                # Calculate confidence score based on magnitude of deviation
                confidence = min(0.99, 0.75 + (abs_pct / 200.0))
                
                explanation = (
                    f"{sensor.capitalize()} anomaly detected on {machine_type}. "
                    f"Current value: {curr_val:.1f} {unit} (Baseline: {base_val:.1f} {unit}, "
                    f"Deviation: {pct_change:+.1f}%). "
                    f"Pattern indicates abnormal operating conditions."
                )

                anomalies.append({
                    "sensor": sensor,
                    "baseline_value": base_val,
                    "current_value": curr_val,
                    "deviation_pct": round(pct_change, 1),
                    "severity": severity,
                    "confidence": round(confidence, 2),
                    "explanation": explanation
                })

        return anomalies

anomaly_detector_service = AnomalyDetector()
