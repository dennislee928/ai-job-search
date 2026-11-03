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
    kind: str
    level: str
    field: str
    annual_budget: float
    expected_starting_salary: float
    forgone_annual_income: float
    tuition: float
    living_cost_per_year: float
    duration_years: Optional[float] = None
    scholarship_amount_per_year: float = 0
    scholarship_covers: str = "both"

class ProgramScoreResponse(BaseModel):
    cp_ratio: Optional[float] = None
    payback_years: Optional[float] = None
    fully_covered: bool
    over_budget: bool
    duration_years: float
    ai_replacement: HorizonValues
    career_outlook: HorizonValues
    model_note: str
