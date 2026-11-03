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

class HorizonValues(BaseModel):
    years_10: float
    years_20: float
    years_30: float

class ProgramScoreRequest(BaseModel):
    tuition: float
    living_cost_per_year: float
    duration_years: float
    opportunity_cost_per_year: float
    expected_annual_premium: float
    horizon_years: float
    routine: float
    social: float
    physical: float
    licensed: bool
    current_automation: float

class ProgramScoreResponse(BaseModel):
    cp_ratio: float
    payback_years: Optional[float] = None
    ai_replacement: HorizonValues
    career_outlook: HorizonValues
    model_note: str
