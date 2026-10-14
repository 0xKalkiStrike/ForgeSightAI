# ForgeSight AI — 3-Minute Live Hackathon Demo Walkthrough

---

## Demo Timeline Script

### 0:00 – 0:25 | The Problem & Platform Overview
1. Open the **ForgeSight AI** Dashboard.
2. Point out:
   - Factory Health Score: **91 / 100**
   - 8 Production Line Machines Active across 3 Sectors
   - Avoided Downtime ($) & Cost Avoided KPIs

---

### 0:25 – 1:15 | Failure Simulation Trigger (The "Live Demo Button")
1. Click the red **SIMULATE FAILURE (M-104)** button in the header.
2. Watch telemetry step dynamically:
   - Vibration rises from 4.8 mm/s → 9.3 mm/s
   - Temperature increases from 68.5°C → 82.5°C
3. Point to the **Anomalies** and **Alerts**:
   - Status updates to **Critical**
   - Health score drops to **24/100**
   - Failure probability climbs to **87%**

---

### 1:15 – 2:00 | AI Explanation & Root Cause Analysis
1. Navigate to **Machine Detail: CNC-M104** or **Alert Center**.
2. Review the **Root Cause Explanation**:
   - *Likely Issue:* Drive-Side Bearing Degradation (Confidence 91%)
   - *Evidence:* Vibration +42%, Temperature +8%, operating hours threshold exceeded.
3. Review **Avoided Business Impact**:
   - **6.5 Hours** estimated downtime avoided
   - **$4,800** estimated financial loss prevented

---

### 2:00 – 2:30 | Human-in-the-Loop Recommendation & Action
1. Show the **Maintenance Recommendation**:
   - Inspect & Replace SKF 6208-2RS Bearing.
2. Click **Approve Maintenance**.
3. Log a **Maintenance Action Work Order**:
   - Replaces bearing and resets machine risk state back to nominal 95% health.

---

### 2:30 – 3:00 | AMD Hardware Acceleration Benchmark
1. Navigate to **AMD Performance**.
2. Click **Run AMD Hardware Benchmark**.
3. Show measured latencies and speedup ratios (~6.4x speedup on telemetry feature extraction, ~6.7x on RAG document embedding similarity).
4. Conclude with why AMD ROCm powers high-reliability industrial intelligence.
