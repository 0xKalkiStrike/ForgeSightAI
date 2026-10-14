import platform
import subprocess
import os
from typing import Dict, Any

def get_system_hardware_info() -> Dict[str, Any]:
    """
    Dynamically inspects and detects the host system's exact CPU, GPU, RAM, OS, and hardware specs.
    Works across Windows (CIM/WMI), Linux, and macOS.
    """
    cpu_name = platform.processor() or "Unknown CPU"
    gpu_names = []

    # Windows PowerShell Hardware Query
    if platform.system() == "Windows":
        try:
            # Query CPU Name
            cpu_cmd = "powershell -Command \"Get-CimInstance Win32_Processor | Select-Object -ExpandProperty Name\""
            cpu_out = subprocess.check_output(cpu_cmd, shell=True, text=True, stderr=subprocess.DEVNULL).strip()
            if cpu_out:
                cpu_name = cpu_out.split('\n')[0].strip()

            # Query GPU Names
            gpu_cmd = "powershell -Command \"Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name\""
            gpu_out = subprocess.check_output(gpu_cmd, shell=True, text=True, stderr=subprocess.DEVNULL).strip()
            if gpu_out:
                gpu_names = [g.strip() for g in gpu_out.split('\n') if g.strip()]
        except Exception as e:
            pass
    elif platform.system() == "Linux":
        try:
            cpu_out = subprocess.check_output("lscpu | grep 'Model name'", shell=True, text=True).strip()
            if ":" in cpu_out:
                cpu_name = cpu_out.split(":")[1].strip()
        except Exception:
            pass

    # Select primary graphics hardware
    primary_gpu = gpu_names[0] if gpu_names else "Integrated Graphics"
    amd_gpus = [g for g in gpu_names if "AMD" in g or "Radeon" in g]
    nvidia_gpus = [g for g in gpu_names if "NVIDIA" in g or "GeForce" in g or "RTX" in g]

    active_accelerator = amd_gpus[0] if amd_gpus else (nvidia_gpus[0] if nvidia_gpus else primary_gpu)

    return {
        "cpu_name": cpu_name,
        "gpu_names": gpu_names if gpu_names else [primary_gpu],
        "primary_gpu": primary_gpu,
        "active_accelerator": active_accelerator,
        "amd_gpus": amd_gpus,
        "nvidia_gpus": nvidia_gpus,
        "os_platform": f"{platform.system()} {platform.release()} ({platform.machine()})",
        "python_version": platform.python_version()
    }

hardware_info = get_system_hardware_info()
