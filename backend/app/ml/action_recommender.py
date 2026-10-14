from typing import Dict, Any, List

class ActionRecommender:
    def generate_recommendation(
        self,
        machine_id: str,
        machine_name: str,
        root_cause_data: Dict[str, Any],
        failure_prob: float
    ) -> Dict[str, Any]:
        likely_issue = root_cause_data.get("likely_issue", "General Inspection")

        if "Bearing" in likely_issue:
            title = f"Inspect and Replace Drive-Side Bearing on {machine_id}"
            priority = "Critical"
            time_window = "Within 8 hours"
            risk = "High"
            avoided_downtime = 6.5 # hours
            avoided_cost = 4800.0 # dollars ($738/hr downtime cost)
            steps = [
                "1. Stop machine during the next safe maintenance window (Line clearance approved).",
                "2. Lockout/Tagout (LOTO) primary 480V electrical power feed and isolate pneumatic pressure.",
                "3. Inspect drive-side bearing housing for thermal heat marks and grease degradation.",
                "4. Check shaft alignment using laser alignment gauge (Tolerance < 0.05 mm).",
                "5. Replace bearing assembly with OEM SKF 6208-2RS double-sealed bearing.",
                "6. Replenish synthetic high-temp grease and run post-maintenance 15-minute vibration test."
            ]
        elif "Lubrication" in likely_issue or "Overheating" in likely_issue:
            title = f"Flush Coolant System & Refill Lubricant Reservoir for {machine_id}"
            priority = "High"
            time_window = "Within 12 hours"
            risk = "Medium"
            avoided_downtime = 4.0
            avoided_cost = 2950.0
            steps = [
                "1. Check coolant reservoir fluid level and optical refractometer concentration percentage.",
                "2. Inspect inline particulate filter mesh for metallic debris buildup.",
                "3. Drain degraded ISO VG 68 hydraulic oil and purge reservoir tank.",
                "4. Install fresh 25-micron filter cartridge and refill with premium Mobil DTE 25 oil.",
                "5. Verify circulation pump flow pressure achieves 100 PSI nominal threshold."
            ]
        elif "Misalignment" in likely_issue or "Cavitation" in likely_issue:
            title = f"Perform Laser Shaft Alignment & Pump Suction Check on {machine_id}"
            priority = "High"
            time_window = "Within 16 hours"
            risk = "High"
            avoided_downtime = 5.5
            avoided_cost = 3900.0
            steps = [
                "1. Perform dial-indicator shaft runout test on primary coupling assembly.",
                "2. Tighten base mounting foot bolts using calibrated torque wrench (180 Nm).",
                "3. Inspect pump inlet suction strainer for cavitation air pockets.",
                "4. Re-balance rotor shaft assembly and perform vibration spectrograph verification."
            ]
        else:
            title = f"Routine Diagnostic Inspection for {machine_id}"
            priority = "Medium"
            time_window = "Within 48 hours"
            risk = "Low"
            avoided_downtime = 2.0
            avoided_cost = 1200.0
            steps = [
                "1. Perform visual inspection of drive belts, wiring, and seals.",
                "2. Verify sensor calibration readings against hand-held thermal camera.",
                "3. Record baseline operating parameters into plant logbook."
            ]

        return {
            "machine_id": machine_id,
            "title": title,
            "priority": priority,
            "recommended_time_window": time_window,
            "estimated_risk": risk,
            "estimated_avoided_downtime": avoided_downtime,
            "estimated_avoided_cost": avoided_cost,
            "procedure_steps": steps,
            "human_status": "Pending"
        }

action_recommender_service = ActionRecommender()
