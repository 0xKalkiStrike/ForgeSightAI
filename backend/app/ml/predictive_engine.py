from typing import Dict, Any, List
import math

class PredictiveEngine:
    def calculate_failure_risk(
        self,
        machine_type: str,
        current_telemetry: Dict[str, float],
        anomalies: List[Dict[str, Any]],
        operating_hours: float,
        last_maint_hours: float = 1200.0
    ) -> Dict[str, Any]:
        """
        Multi-factor predictive maintenance risk model.
        Combines sensor drift, anomaly severities, runtime stress, and component fatigue.
        """
        base_risk = 0.04 # 4% default nominal risk
        factors = []

        # 1. Vibration factor (highest weight for mechanical failure)
        vibration = current_telemetry.get("vibration", 4.5)
        if vibration > 5.5:
            vib_increase = (vibration - 4.5) / 4.5
            vib_impact = min(0.45, vib_increase * 0.35)
            base_risk += vib_impact
            factors.append({
                "factor": "Abnormal Mechanical Vibration",
                "weight": round(vib_impact, 2),
                "impact": f"+{int(vib_impact * 100)}% risk (Current: {vibration:.1f} mm/s)"
            })

        # 2. Temperature thermal stress factor
        temp = current_telemetry.get("temperature", 68.0)
        if temp > 75.0:
            temp_increase = (temp - 68.0) / 68.0
            temp_impact = min(0.30, temp_increase * 0.40)
            base_risk += temp_impact
            factors.append({
                "factor": "Elevated Thermal Operating Temp",
                "weight": round(temp_impact, 2),
                "impact": f"+{int(temp_impact * 100)}% risk (Current: {temp:.1f}°C)"
            })

        # 3. Operating hours since last maintenance
        hours_since_maint = operating_hours - last_maint_hours
        if hours_since_maint > 500:
            maint_impact = min(0.20, (hours_since_maint - 500) / 2500.0)
            base_risk += maint_impact
            factors.append({
                "factor": "Extended Maintenance Interval",
                "weight": round(maint_impact, 2),
                "impact": f"+{int(maint_impact * 100)}% risk ({int(hours_since_maint)} hrs since service)"
            })

        # 4. Pressure/Load instability
        pressure = current_telemetry.get("pressure", 100.0)
        if pressure < 85.0 or pressure > 130.0:
            press_impact = 0.12
            base_risk += press_impact
            factors.append({
                "factor": "Hydraulic / System Pressure Deviation",
                "weight": round(press_impact, 2),
                "impact": f"+{int(press_impact * 100)}% risk (Current: {pressure:.1f} PSI)"
            })

        # 5. Critical Anomaly Multiplier
        crit_anomalies = [a for a in anomalies if a.get("severity") == "Critical"]
        if crit_anomalies:
            base_risk *= 1.25

        # Cap probability between 0.02 and 0.98
        failure_prob = min(0.98, max(0.02, base_risk))
        failure_prob_pct = round(failure_prob * 100, 1)

        # Determine Risk Level & Estimated Time to Failure
        if failure_prob >= 0.75:
            risk_level = "Critical"
            ttf_hours = round(max(2.0, (1.0 - failure_prob) * 40.0), 1)
            window_str = f"Estimated {ttf_hours}–{ttf_hours+4.0:.1f} hours"
        elif failure_prob >= 0.50:
            risk_level = "High"
            ttf_hours = round(max(12.0, (1.0 - failure_prob) * 75.0), 1)
            window_str = f"Estimated {ttf_hours}–{ttf_hours+12.0:.1f} hours"
        elif failure_prob >= 0.25:
            risk_level = "Medium"
            ttf_hours = round(max(36.0, (1.0 - failure_prob) * 120.0), 1)
            window_str = f"Estimated {ttf_hours}–{ttf_hours+24.0:.1f} hours"
        else:
            risk_level = "Low"
            ttf_hours = 168.0 # 7 days
            window_str = "Normal Operation (>100 hrs)"

        return {
            "failure_probability": round(failure_prob, 2),
            "failure_probability_pct": failure_prob_pct,
            "risk_level": risk_level,
            "time_to_failure_hours": ttf_hours,
            "remaining_risk_window": window_str,
            "contributing_factors": factors
        }

predictive_engine_service = PredictiveEngine()
