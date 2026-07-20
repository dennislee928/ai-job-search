from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class GenerateRequest(BaseModel):
    prompt: str
    model: Optional[str] = "gemini"

class GenerateResponse(BaseModel):
    text: str

class JobSearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5

class JobMatchResponse(BaseModel):
    score: float
    payload: Dict[str, Any]

class CoverLetterRequest(BaseModel):
    job_description: str
    user_id: str
