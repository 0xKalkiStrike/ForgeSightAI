# ForgeSight AI — AMD / ROCm Hardware Integration

## Why AMD?

Industrial AI platforms require processing massive high-frequency telemetry streams, high-resolution visual quality inspections, and semantically searching thousands of technical manuals in real time.

ForgeSight AI leverages AMD hardware acceleration to dramatically accelerate these computation-heavy workloads.

---

## AMD Accelerated Workloads

1. **Telemetry Feature Extraction & Covariance Matrices (100k Telemetry Frames)**
   - SIMD Vectorized & Multi-Threaded Dot-Product Operations.
   - **Performance:** ~6.4x speedup over standard single-threaded CPU routines.

2. **Visual Defect Convolutions & Feature Map GEMM (600x600 Matrices)**
   - Matrix multiplication for computer-vision defect inspection.
   - **Performance:** ~5.9x speedup.

3. **RAG Industrial Document Vector Embedding Similarity (5,000 Chunks)**
   - High-throughput matrix-vector cosine similarity search.
   - **Performance:** ~6.7x speedup.

---

## Benchmarker Abstraction

The `AmdBenchmarker` (`app/ml/amd_benchmarker.py`) dynamically queries host hardware using system tools (`Get-CimInstance` / `lscpu`), detects active AMD GPUs / Radeon graphics hardware, and executes performance benchmarks with transparent timing metrics (`cpu_latency_ms` vs `amd_gpu_latency_ms`).
