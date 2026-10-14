import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_full_api_suite():
    with TestClient(app) as client:
        # 1. Root check
        res_root = client.get("/")
        assert res_root.status_code == 200
        assert res_root.json()["app"] == "ForgeSight AI"

        # 2. List Machines
        res_m = client.get("/api/machines")
        assert res_m.status_code == 200
        machines = res_m.json()
        assert len(machines) >= 8

        # 3. Machine Detail
        res_m104 = client.get("/api/machines/M-104")
        assert res_m104.status_code == 200
        assert res_m104.json()["id"] == "M-104"

        # 4. Analytics Summary
        res_ana = client.get("/api/analytics/summary")
        assert res_ana.status_code == 200
        assert res_ana.json()["factory_health_score"] > 0

        # 5. AMD Performance
        res_amd = client.get("/api/amd-performance")
        assert res_amd.status_code == 200
        assert len(res_amd.json()) > 0

        # 6. RAG Knowledge Assistant
        res_rag = client.post("/api/knowledge/query", json={"query": "How to inspect bearing on M-104?"})
        assert res_rag.status_code == 200
        assert "answer" in res_rag.json()

        # 7. Simulation Trigger & Reset
        res_trig = client.post("/api/simulation/trigger-failure/M-104")
        assert res_trig.status_code == 200

        res_reset = client.post("/api/simulation/reset/M-104")
        assert res_reset.status_code == 200
        assert client.get("/api/machines/M-104").json()["status"] == "Healthy"
