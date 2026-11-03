from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
from models.schemas import (
    GenerateRequest,
    GenerateResponse,
    JobSearchRequest,
    JobMatchResponse,
    CoverLetterRequest,
    ProgramScoreRequest,
    ProgramScoreResponse,
)
from services.orchestrator import generate_text, generate_cover_letter
from services.qdrant_service import qdrant_service
from services.scoring import ScoreError, score_offer
from services.storage import storage_service

router = APIRouter()

@router.post("/upload/resume")
async def upload_resume(file: UploadFile = File(...)):
    # Upload to MinIO
    object_name = file.filename
    url = storage_service.upload_file_object(file.file, "resumes", object_name)
    return {"url": url, "filename": object_name}

@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    result = generate_text(req.prompt, req.model)
    return GenerateResponse(text=result)

@router.post("/jobs/search", response_model=List[JobMatchResponse])
async def search_jobs(req: JobSearchRequest):
    return await search_programs(req)

@router.post("/programs/search", response_model=List[JobMatchResponse])
async def search_programs(req: JobSearchRequest):
    results = qdrant_service.search_jobs(req.query, limit=req.limit or 5)
    return results

@router.post("/programs/score", response_model=ProgramScoreResponse)
async def score_education_program(req: ProgramScoreRequest):
    try:
        return score_offer(
            req.kind,
            req.level,
            req.field,
            req.annual_budget,
            req.expected_starting_salary,
            req.forgone_annual_income,
            req.tuition,
            req.living_cost_per_year,
            req.duration_years,
            req.scholarship_amount_per_year,
            req.scholarship_covers,
        )
    except ScoreError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@router.post("/generate/cover-letter", response_model=GenerateResponse)
async def create_cover_letter(req: CoverLetterRequest):
    # Generates personalized cover letter via RAG
    result = generate_cover_letter(req.job_description, req.user_id)
    return GenerateResponse(text=result)
