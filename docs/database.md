# ForgeSight AI — Database Schema

Supported RDBMS: PostgreSQL 14+ / SQLite 3.x (Development)

---

## Entity Schema Overview

- `users`: User profiles, hashed passwords, roles (`Admin`, `Manager`, `Engineer`, `Operator`), and departments.
- `machines`: Machine metadata, production line, location, status (`Healthy`, `Warning`, `Critical`), health score, failure probability, and telemetry cache.
- `sensor_readings`: High-frequency sensor time-series records (temperature, vibration, pressure, rpm, load, energy).
- `anomalies`: Detected statistical and isolation forest telemetry anomalies.
- `predictions`: Failure risk calculations, risk levels, TTF hours, and contributing factor JSON arrays.
- `alerts`: Industrial alert notifications with severity, AI root-cause explanation, and lifecycle status.
- `maintenance_recommendations`: Recommended maintenance procedures with estimated avoided downtime (hrs) and cost ($).
- `maintenance_records`: Historical work order logs and part replacements.
- `defect_inspections`: Visual defect inspection records with bounding boxes.
- `documents` & `document_chunks`: Knowledge base manuals and parsed RAG vector chunks.
- `audit_logs`: Enterprise audit log tracking human actions and AI engine alerts.
- `amd_benchmark_results`: Stored execution benchmarks for CPU vs AMD hardware acceleration.
