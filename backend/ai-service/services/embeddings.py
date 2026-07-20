# pyrefly: ignore [missing-import]
from langchain_huggingface import HuggingFaceEmbeddings

class EmbeddingsService:
    def __init__(self):
        # We use a small, fast local model for embeddings
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    def embed_text(self, text: str) -> list[float]:
        return self.embeddings.embed_query(text)

embeddings_service = EmbeddingsService()
