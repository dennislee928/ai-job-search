from fastapi import APIRouter, UploadFile, File
from typing import List
from models.schemas import GenerateRequest, GenerateResponse, JobSearchRequest, JobMatchResponse, CoverLetterRequest
from services.orchestrator import generate_text, generate_cover_letter
from services.qdrant_service import qdrant_service
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
    # Semantic Search via Qdrant
    results = qdrant_service.search_jobs(req.query, limit=req.limit)
    return results

@router.post("/generate/cover-letter", response_model=GenerateResponse)
async def create_cover_letter(req: CoverLetterRequest):
    # Generates personalized cover letter via RAG
    result = generate_cover_letter(req.job_description, req.user_id)
    return GenerateResponse(text=result)
