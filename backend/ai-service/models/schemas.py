from pydantic import BaseModel
from typing import Optional

class GenerateRequest(BaseModel):
    prompt: str
    model: Optional[str] = "gemini"

class GenerateResponse(BaseModel):
    text: str
