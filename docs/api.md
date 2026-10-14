# ForgeSight AI — API Reference

Base Endpoint: `http://localhost:8000/api`

---

## Authentication
- `POST /api/auth/login` — Authenticate user and issue JWT token.
- `GET /api/auth/me` — Retrieve current authenticated profile & role.

---

## Machines & Telemetry
- `GET /api/machines` — List all factory machines with status, health score, and risk probability.
- `GET /api/machines/{id}` — Detailed machine view.
- `GET /api/machines/{id}/telemetry` — Retrieve historical telemetry series for visualization.

---

## Anomaly & Risk Analytics
- `GET /api/anomalies` — List detected telemetry anomalies.
- `GET /api/predictions` — List failure probability predictions & risk factors.
- `GET /api/alerts` — Retrieve active industrial alerts.
- `PATCH /api/alerts/{id}/status` — Update alert status (`Acknowledged`, `Investigating`, `Resolved`).

---

## Maintenance & Human Approval
- `GET /api/maintenance/recommendations` — List AI maintenance recommendations.
- `POST /api/maintenance/recommendations/{id}/approve` — Approve maintenance action.
- `POST /api/maintenance/records` — Create maintenance work order log (resets machine risk).

---

## Knowledge & Defect Inspection
- `POST /api/knowledge/query` — RAG semantic query over technical manuals.
- `GET /api/inspections` — List visual defect inspection logs.
- `POST /api/inspections/analyze` — Trigger computer vision defect analysis.

---

## AMD Performance & Simulation
- `GET /api/amd-performance` — Get AMD hardware benchmarks.
- `POST /api/amd-performance/run-benchmark` — Execute benchmark runner.
- `POST /api/simulation/trigger-failure/{machine_id}` — Live demo failure simulation trigger.
- `POST /api/simulation/reset/{machine_id}` — Reset demo machine to normal baseline.
- `GET /api/system-health` — Real-time infrastructure & worker health diagnostics.
