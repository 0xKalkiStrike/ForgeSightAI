from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AmdBenchmarkResult
from app.schemas.schemas import AmdBenchmarkResponse
from app.ml.amd_benchmarker import amd_benchmarker_service
from app.core.hardware import get_system_hardware_info
from app.core.config import settings

router = APIRouter(prefix="/amd-performance", tags=["AMD Acceleration"])

@router.get("", response_model=List[AmdBenchmarkResponse])
def get_benchmark_results(db: Session = Depends(get_db)):
    results = db.query(AmdBenchmarkResult).order_by(AmdBenchmarkResult.timestamp.desc()).all()
    if not results:
        # Run benchmarks live
        bench_data = amd_benchmarker_service.run_benchmark("all")
        for b in bench_data:
            res = AmdBenchmarkResult(
                test_name=b["test_name"],
                workload_type=b["workload_type"],
                cpu_latency_ms=b["cpu_latency_ms"],
                amd_gpu_latency_ms=b["amd_gpu_latency_ms"],
                speedup_pct=b["speedup_pct"],
                throughput_ops_sec=b["throughput_ops_sec"],
                device_info=b["device_info"]
            )
            db.add(res)
        db.commit()
        results = db.query(AmdBenchmarkResult).order_by(AmdBenchmarkResult.timestamp.desc()).all()
    return results

@router.post("/run-benchmark", response_model=List[AmdBenchmarkResponse])
def run_live_benchmark(db: Session = Depends(get_db)):
    # Clear old results to force fresh live benchmark execution on host hardware
    db.query(AmdBenchmarkResult).delete()
    db.commit()

    bench_data = amd_benchmarker_service.run_benchmark("all")
    new_results = []
    for b in bench_data:
        res = AmdBenchmarkResult(
            test_name=b["test_name"],
            workload_type=b["workload_type"],
            cpu_latency_ms=b["cpu_latency_ms"],
            amd_gpu_latency_ms=b["amd_gpu_latency_ms"],
            speedup_pct=b["speedup_pct"],
            throughput_ops_sec=b["throughput_ops_sec"],
            device_info=b["device_info"]
        )
        db.add(res)
        new_results.append(res)
    db.commit()
    return new_results

@router.get("/system-health")
def get_system_health():
    hw = get_system_hardware_info()
    return {
        "cpu_name": hw["cpu_name"],
        "gpu_names": hw["gpu_names"],
        "active_accelerator": hw["active_accelerator"],
        "os_platform": hw["os_platform"],
        "python_version": hw["python_version"],
        "rocm_enabled": settings.ROCM_ENABLED,
        "amd_gpu_enabled": settings.AMD_GPU_ENABLED,
        "backend_status": "ONLINE",
        "database_status": "ONLINE",
        "ai_services": {
            "anomaly_detector": f"ONLINE ({hw['cpu_name']} SIMD Vector)",
            "predictive_engine": f"ONLINE ({hw['cpu_name']} Ensemble)",
            "root_cause_engine": "ONLINE (Diagnostics Engine)",
            "rag_assistant": "ONLINE (Vector TF-IDF Engine)",
            "defect_inspector": f"ONLINE ({hw['active_accelerator']} Vision Tensor)"
        }
    }
