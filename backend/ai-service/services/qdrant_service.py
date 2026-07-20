# pyrefly: ignore [missing-import]
from qdrant_client import QdrantClient
# pyrefly: ignore [missing-import]
from qdrant_client.http.models import PointStruct, VectorParams, Distance
from core.config import settings
from services.embeddings import embeddings_service
import uuid

class QdrantService:
    def __init__(self):
        self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)

    def insert_resume(self, text: str, metadata: dict = None):
        vector = embeddings_service.embed_text(text)
        point_id = str(uuid.uuid4())
        self.client.upsert(
            collection_name="resumes",
            points=[
                PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={"text": text, **(metadata or {})}
                )
            ]
        )
        return point_id

    def search_jobs(self, query: str, limit: int = 5):
        vector = embeddings_service.embed_text(query)
        results = self.client.search(
            collection_name="job_descriptions",
            query_vector=vector,
            limit=limit
        )
        return [{"score": res.score, "payload": res.payload} for res in results]
        
    def match_resume_to_jobs(self, resume_text: str, limit: int = 5):
        vector = embeddings_service.embed_text(resume_text)
        results = self.client.search(
            collection_name="job_descriptions",
            query_vector=vector,
            limit=limit
        )
        return [{"score": res.score, "payload": res.payload} for res in results]

    def match_job_to_resumes(self, job_text: str, limit: int = 5):
        vector = embeddings_service.embed_text(job_text)
        results = self.client.search(
            collection_name="resumes",
            query_vector=vector,
            limit=limit
        )
        return [{"score": res.score, "payload": res.payload} for res in results]

qdrant_service = QdrantService()
