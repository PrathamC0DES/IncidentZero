import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "IncidentZero"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database: Default to local async SQLite for zero-friction setup, 
    # but seamless async PostgreSQL (asyncpg) compatible
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./incidentzero.db")
    
    # LLM Provider Configuration
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini/gemini-1.5-flash")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # GitHub Integration
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    GITHUB_REPO_DEFAULT: str = os.getenv("GITHUB_REPO_DEFAULT", "")
    
    # Agent Guardrails
    MAX_HEALING_ITERATIONS: int = 5
    MAX_TOKENS_PER_INCIDENT: int = 25000
    EXECUTION_TIMEOUT_SECONDS: int = 45

settings = Settings()
