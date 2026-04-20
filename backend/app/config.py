from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    gemini_api_key: Optional[str] = None
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    allow_guest_access: bool = True

    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"

    db_pool_size: int = 10
    db_max_overflow: int = 20

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
