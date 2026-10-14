# ForgeSight AI — AI / ML Intelligence Pipeline

## 1. Intelligence Loop

ForgeSight AI implements a strict 7-phase intelligence chain:

```text
Detect → Explain → Predict → Recommend → Act → Measure → Learn
```

---

## 2. Anomaly Detection Engine

- **Model:** `IsolationForest` (Scikit-Learn) + Statistical Rolling Z-Score Baseline.
- **Input Channels:** Vibration (mm/s), Temperature (°C), Pressure (PSI), RPM, Load (%), Energy (kW).
- **Output:** Anomaly Severity (`Critical` / `Warning`), deviation percentage, and confidence score.

---

## 3. Predictive Failure Engine

- **Model:** Multivariate Failure Risk Ensemble.
- **Features Evaluated:**
  - Mechanical Vibration drift vs threshold (5.5 mm/s)
  - Thermal stress delta vs normal baseline (68°C)
  - Runtime hours since last maintenance overhaul
  - System pressure instability
- **Output:**
  - Failure Probability (0.00 – 1.00)
  - Risk Category (`Low`, `Medium`, `High`, `Critical`)
  - Estimated Time-to-Failure (TTF hours)
  - Ranked Contributing Factors

---

## 4. Evidence-Based Root Cause Engine (RCA)

- Synthesizes sensor drift signatures, operating hours, and cross-channel correlations.
- Generates grounded, evidence-backed diagnostic explanations (e.g. *Drive-Side Bearing Degradation*, *Lubrication Breakdown*, *Shaft Misalignment*).

---

## 5. RAG Technical Knowledge Assistant

- **Architecture:** TF-IDF Vector Space + Cosine Similarity Retrieval over technical SOPs, OEM service manuals, and historical maintenance logs.
- **Citation Requirement:** Every answer is grounded and explicitly cites document title, section, and page number.

---

## 6. Computer Vision Defect Detection

- Evaluates visual surface feature matrices for surface micro-cracks, weld porosity, and tooth pitting with confidence scores and bounding box coordinates.
