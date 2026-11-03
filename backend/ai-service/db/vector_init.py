import os
from qdrant_client import QdrantClient
from qdrant_client.http import models

def init_qdrant():
    qdrant_host = os.environ.get("QDRANT_HOST", "qdrant")
    qdrant_port = int(os.environ.get("QDRANT_PORT", 6333))
    
    print(f"Connecting to Qdrant at {qdrant_host}:{qdrant_port}...")
    client = QdrantClient(host=qdrant_host, port=qdrant_port)
    
    collections = [
        {"name": "job_descriptions", "size": 1536}, # e.g. for OpenAI embeddings
        {"name": "resumes", "size": 1536}
    ]
    
    for coll in collections:
        try:
            client.get_collection(collection_name=coll["name"])
            print(f"Collection '{coll['name']}' already exists.")
        except Exception:
            print(f"Creating collection '{coll['name']}' with dimension {coll['size']}...")
            client.create_collection(
                collection_name=coll["name"],
                vectors_config=models.VectorParams(size=coll["size"], distance=models.Distance.COSINE),
            )
            print(f"Created collection '{coll['name']}'.")

if __name__ == "__main__":
    init_qdrant()
