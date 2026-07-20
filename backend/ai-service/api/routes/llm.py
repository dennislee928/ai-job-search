from fastapi import APIRouter
from models.schemas import GenerateRequest, GenerateResponse
from services.orchestrator import generate_text

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    result = generate_text(req.prompt, req.model)
    return GenerateResponse(text=result)
