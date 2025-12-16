from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    gemini_api_key: Optional[str] = None
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    allow_guest_access: bool = True

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()