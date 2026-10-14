# ForgeSight AI — System Architecture

**Tagline:** Detect. Explain. Predict. Prevent.  
**Track:** AMD Developer Hackathon ACT III — Intelligent Industry

---

## Architecture Overview

ForgeSight AI is structured as a decoupled, micro-service capable industrial intelligence application.

```mermaid
graph TD
    A[Industrial SCADA / Telemetry Data] -->|WebSocket / HTTP REST| B[FastAPI Ingestion Engine]
    B --> C[(PostgreSQL / SQLite Storage)]
    B --> D[Telemetry Simulator & Feature Vector Engine]
    
    D --> E[AMD Accelerated AI Pipeline]
    
    subgraph "AMD AI / ML Engine"
        E --> F[Isolation Forest Anomaly Detector]
        E --> G[Multivariate Failure Risk Ensemble]
        E --> H[Evidence-Based Root Cause AI]
        E --> I[TF-IDF RAG Knowledge Assistant]
        E --> J[Defect CV Feature Convolutions]
    end

    E --> K[Alert & Recommendation Dispatcher]
    K --> L[Human-in-the-Loop Operator Portal]
    L -->|Approve Action| M[Work Order & Maintenance Feedback Loop]
    M -->|Reset Risk / Post-Service Baseline| D
```

---

## Core Components

1. **Frontend (Next.js 15 App Router + React + Tailwind CSS)**:
   - High information density SaaS dashboard for Plant Managers, Engineers, and Machine Operators.
   - Interactive live telemetry charts (Recharts) and real-time WebSocket state streaming.

2. **Backend Engine (FastAPI 0.142 + Pydantic v2 + SQLAlchemy 2.0)**:
   - Async REST API endpoints with role-based authentication.
   - Automated background simulation and real-time data ingestion.

3. **AMD Hardware Benchmarker & Compute Abstraction**:
   - `AmdBenchmarker` abstraction evaluating vector matrix operations, convolution tensors, and TF-IDF document embeddings across host CPU and AMD GPU / ROCm accelerators.

4. **Storage Engine**:
   - SQLAlchemy ORM database containing machines, telemetry frames, anomalies, risk predictions, recommendations, RAG chunks, and audit logs.
