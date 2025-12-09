import os
from qdrant_client import QdrantClient
from langchain_community.embeddings import FastEmbedEmbeddings # Changed embedding import
from langchain_qdrant import QdrantVectorStore # Use the correct class
from dotenv import load_dotenv # Add load_dotenv
from pathlib import Path # Add Path

# Load environment variables (same as ingest.py)
script_dir = Path(__file__).parent
dotenv_path = script_dir.parent / '.env'
load_dotenv(dotenv_path=dotenv_path)

QDRANT_HOST = os.getenv("QDRANT_HOST")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
# GEMINI_API_KEY is no longer needed for embeddings, removed its loading.
COLLECTION_NAME = "physical_ai_textbook"

def get_retriever(embedding_model="BAAI/bge-large-en-v1.5"): # Default model name for FastEmbed
    """
    Initializes and returns a Qdrant retriever.
    """
    if not QDRANT_HOST or not QDRANT_API_KEY:
        raise ValueError("QDRANT_HOST and QDRANT_API_KEY must be set in backend/.env file.")
    # GEMINI_API_KEY validation removed as it's not used for FastEmbed

    client = QdrantClient(host=QDRANT_HOST, api_key=QDRANT_API_KEY)
    embeddings = FastEmbedEmbeddings(model_name=embedding_model) # Use FastEmbed

    qdrant = QdrantVectorStore(client=client, collection_name=COLLECTION_NAME, embedding=embeddings)
    return qdrant.as_retriever()

def retrieve_documents(query: str, k: int = 4):
    """
    Retrieves relevant documents from Qdrant based on a query.
    """
    retriever = get_retriever()
    docs = retriever.invoke(query)
    return docs

if __name__ == "__main__":
    # Example usage (ensure QDRANT_HOST and QDRANT_API_KEY are set in your environment)
    # The environment variables are loaded from .env automatically
    query = "What are ROS 2 concepts?"
    documents = retrieve_documents(query)
    for doc in documents:
        print(f"Source: {doc.metadata.get('source')}\nContent: {doc.page_content}\n---")
