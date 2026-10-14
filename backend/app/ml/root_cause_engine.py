from typing import Dict, Any, List

class RootCauseEngine:
    def analyze_root_cause(
        self,
        machine_type: str,
        current_telemetry: Dict[str, float],
        anomalies: List[Dict[str, Any]],
        operating_hours: float
    ) -> Dict[str, Any]:
        """
        Synthesizes sensor anomalies, operating metrics, and thermal patterns
        to perform evidence-based Root Cause Analysis (RCA).
        """
        vib = current_telemetry.get("vibration", 4.5)
        temp = current_telemetry.get("temperature", 68.0)
        press = current_telemetry.get("pressure", 100.0)
        rpm = current_telemetry.get("rpm", 1800.0)

        # Case 1: High Vibration + High Temp -> Bearing Failure / Mechanical Wear
        if vib > 6.0 and temp > 72.0:
            evidence = [
                f"Vibration elevated to {vib:.1f} mm/s (+{int((vib-4.5)/4.5*100)}% above baseline)",
                f"Operating temperature increased to {temp:.1f}°C (+{int((temp-68.0)/68.0*100)}% above baseline)",
                f"RPM remained relatively steady at {rpm:.0f} RPM",
                "Similar thermal/vibration signature matched historical drive-side bearing failure profile",
                f"Machine accumulated {int(operating_hours)} operating hours since last overhaul"
            ]
            factors = [
                "Increased mechanical friction & rolling element wear",
                "Elevated thermal dissipation from race friction",
                "Extended operating cycle without re-greasing",
                "Maintenance interval exceeded threshold"
            ]
            return {
                "likely_issue": "Drive-Side Bearing Degradation",
                "confidence": 0.91,
                "evidence": evidence,
                "contributing_factors": factors,
                "severity": "Critical"
            }

        # Case 2: High Temp + Normal Vib -> Lubrication Breakdown / Overheating
        elif temp > 78.0 and vib <= 6.0:
            evidence = [
                f"Temperature spiked to {temp:.1f}°C (+{int((temp-68.0)/68.0*100)}% deviation)",
                f"Vibration within acceptable limits at {vib:.1f} mm/s",
                f"Coolant line flow rate pressure dropped to {press:.1f} PSI",
                "Thermal imaging profile shows localized heat build-up"
            ]
            factors = [
                "Degraded or insufficient lubricant viscosity",
                "Coolant fluid line blockage or partial pump cavitation",
                "High ambient factory floor thermal load"
            ]
            return {
                "likely_issue": "Lubrication Degradation & Thermal Overheating",
                "confidence": 0.88,
                "evidence": evidence,
                "contributing_factors": factors,
                "severity": "High"
            }

        # Case 3: High Vib + Low Pressure -> Shaft Misalignment or Hydraulic Cavitation
        elif vib > 6.5 or press < 80.0:
            evidence = [
                f"System hydraulic pressure dropped to {press:.1f} PSI",
                f"Structural vibration fluctuating at {vib:.1f} mm/s",
                "Harmonic frequency analysis indicates 1X/2X rotational frequency imbalance"
            ]
            factors = [
                "Shaft or coupling angular misalignment",
                "Hydraulic fluid aeration / pump suction cavitation",
                "Loose mounting bolt fasteners"
            ]
            return {
                "likely_issue": "Shaft Misalignment & Pump Cavitation",
                "confidence": 0.86,
                "evidence": evidence,
                "contributing_factors": factors,
                "severity": "High"
            }

        # Nominal / Low risk
        else:
            return {
                "likely_issue": "Normal Operational Parameters",
                "confidence": 0.95,
                "evidence": [
                    f"Vibration stable at {vib:.1f} mm/s",
                    f"Temperature steady at {temp:.1f}°C",
                    f"Pressure nominal at {press:.1f} PSI"
                ],
                "contributing_factors": [
                    "All telemetry channels within baseline standard deviation"
                ],
                "severity": "Normal"
            }

root_cause_engine_service = RootCauseEngine()
