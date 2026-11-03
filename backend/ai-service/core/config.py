import os

class Settings:
    PROJECT_NAME: str = "AI Job Search Service"
    API_V1_STR: str = "/api/v1"
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "qdrant")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", 6333))
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")

settings = Settings()
