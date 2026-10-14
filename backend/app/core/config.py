import os
from typing import Optional

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    class Settings(BaseSettings):
        model_config = SettingsConfigDict(case_sensitive=True)
        PROJECT_NAME: str = "ForgeSight AI"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api"
        SECRET_KEY: str = os.getenv("SECRET_KEY", "forgesight_amd_hackathon_super_secret_key_2026")
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
        
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./factoryguard.db")
        
        AMD_GPU_ENABLED: bool = True
        ROCM_ENABLED: bool = True
        AMD_DEVICE_NAME: str = os.getenv("AMD_DEVICE_NAME", "AMD Radeon(TM) Graphics")
        
        SIMULATION_INTERVAL_SEC: float = 3.0
    settings = Settings()
except Exception:
    class SettingsFallback:
        PROJECT_NAME: str = "ForgeSight AI"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api"
        SECRET_KEY: str = os.getenv("SECRET_KEY", "forgesight_amd_hackathon_super_secret_key_2026")
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./factoryguard.db")
        AMD_GPU_ENABLED: bool = True
        ROCM_ENABLED: bool = True
        AMD_DEVICE_NAME: str = os.getenv("AMD_DEVICE_NAME", "AMD Radeon(TM) Graphics")
        SIMULATION_INTERVAL_SEC: float = 3.0
    settings = SettingsFallback()
