from fastapi import FastAPI
from api.routes import llm
from core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, description="Handles orchestration of LLMs and embeddings")

@app.get("/health")
async def health_check():
    return {"status": "UP", "service": "ai-service"}

app.include_router(llm.router, prefix=f"{settings.API_V1_STR}/llm", tags=["LLM"])
