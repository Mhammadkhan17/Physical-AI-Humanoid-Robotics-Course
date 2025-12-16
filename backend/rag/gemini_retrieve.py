import os
from dotenv import load_dotenv
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from typing import List

# --- Custom Gemini Embeddings (shared with gemini_ingest.py) ---
import google.generativeai as genai
from langchain_core.embeddings import Embeddings

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class GeminiEmbeddings(Embeddings):
    def __init__(self, model: str = "gemini-embedding-001", output_dimensionality: int = 1024):
        self.model = model
        self.output_dimensionality = output_dimensionality
        if GEMINI_API_KEY:
            genai.configure(api_key=GEMINI_API_KEY)
        else:
            raise ValueError("GEMINI_API_KEY not found in environment variables.")

    def _embed(self, texts: List[str], task_type: str) -> List[List[float]]:
        # This simplified version does not include retries, as retrieval is less likely
        # to hit batch limits and should be fast. The ingest retry is more critical.
        try:
            result = genai.embed_content(
                model=self.model,
                content=texts,
                task_type=task_type,
                output_dimensionality=self.output_dimensionality
            )
            return result['embedding']
        except Exception as e:
            print(f"Error embedding content with Gemini: {e}")
            raise e

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self._embed(texts, "retrieval_document")

    def embed_query(self, text: str) -> List[float]:
        return self._embed([text], "retrieval_query")[0]

# --- Retrieval Logic ---
QDRANT_HOST = os.getenv("QDRANT_HOST")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
NEW_COLLECTION_NAME = "Physical AI & Humanoid Robotics"

def get_retriever():
    """
    Initializes and returns a Qdrant retriever configured for Gemini embeddings.
    """
    if not all([QDRANT_HOST, QDRANT_API_KEY, GEMINI_API_KEY]):
        raise ValueError("QDRANT_HOST, QDRANT_API_KEY, and GEMINI_API_KEY must be set in your .env file.")

    client = QdrantClient(host=QDRANT_HOST, api_key=QDRANT_API_KEY)
    embedding = GeminiEmbeddings()

    vector_store = QdrantVectorStore(
        client=client, 
        collection_name=NEW_COLLECTION_NAME, 
        embedding=embedding
    )
    
    return vector_store.as_retriever()
