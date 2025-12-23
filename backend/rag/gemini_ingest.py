# import os
# import time
# from langchain_community.document_loaders import DirectoryLoader, TextLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from qdrant_client import QdrantClient, models
# from dotenv import load_dotenv
# from pathlib import Path
# from typing import List

# # --- Custom Gemini Embeddings ---
# import google.generativeai as genai
# from langchain_core.embeddings import Embeddings
# from langchain_qdrant import QdrantVectorStore


# load_dotenv()
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# class GeminiEmbeddings(Embeddings):
#     def __init__(self, model: str = "gemini-embedding-001", output_dimensionality: int = 1024):
#         self.model = model
#         self.output_dimensionality = output_dimensionality
#         if GEMINI_API_KEY:
#             genai.configure(api_key=GEMINI_API_KEY)
#         else:
#             raise ValueError("GEMINI_API_KEY not found in environment variables.")

#     def _embed(self, texts: List[str], task_type: str) -> List[List[float]]:
#         """A helper method to call the Gemini embedding API with retries."""
#         retries = 3
#         delay = 120  # seconds, increased based on user feedback
#         for attempt in range(retries):
#             try:
#                 result = genai.embed_content(
#                     model=self.model,
#                     content=texts,
#                     task_type=task_type,
#                     output_dimensionality=self.output_dimensionality
#                 )
#                 return result['embedding']  # Success
#             except Exception as e:
#                 print(f"Attempt {attempt + 1}/{retries} failed with error: {e}")
#                 if attempt < retries - 1:
#                     print(f"Retrying in {delay} seconds...")
#                     time.sleep(delay)
#                 else:
#                     print("All retry attempts failed.")
#                     raise e # Re-raise the last exception

#     def embed_documents(self, texts: List[str]) -> List[List[float]]:
#         """Embed a list of documents for storage."""
#         return self._embed(texts, "retrieval_document")

#     def embed_query(self, text: str) -> List[float]:
#         """Embed a single query for retrieval."""
#         return self._embed([text], "retrieval_query")[0]

# # --- Ingestion Logic ---
# QDRANT_HOST = os.getenv("QDRANT_HOST")
# QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
# NEW_COLLECTION_NAME = "Physical_AI_Textbook_v2"

# def ingest_with_gemini():
#     """
#     Ingests documents into a new Qdrant collection using Gemini embeddings.
#     """
#     print(f"--- Starting Ingestion with Gemini into collection: '{NEW_COLLECTION_NAME}' ---")

#     if not all([QDRANT_HOST, QDRANT_API_KEY, GEMINI_API_KEY]):
#         print("Error: Please ensure QDRANT_HOST, QDRANT_API_KEY, and GEMINI_API_KEY are set in your .env file.")
#         return

#     # 1. Initialize client and embeddings
#     client = QdrantClient(host=QDRANT_HOST, api_key=QDRANT_API_KEY)
#     embedding = GeminiEmbeddings()
#     print("Initialized Qdrant client and Gemini embeddings.")

#     # 2. Create new collection
#     try:
#         # ADD THIS: Delete if exists to prevent duplicate/mismatched IDs
#         if client.collection_exists(collection_name=NEW_COLLECTION_NAME):
#             print(f"Deleting existing collection '{NEW_COLLECTION_NAME}' for a fresh start...")
#             client.delete_collection(collection_name=NEW_COLLECTION_NAME)
        
#         print(f"Creating new collection: '{NEW_COLLECTION_NAME}'")
#         client.create_collection(
#             collection_name=NEW_COLLECTION_NAME,
#             vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE),
#         )
        
#         print(f"Creating payload index for chapter_id...")
#         client.create_payload_index(
#             collection_name=NEW_COLLECTION_NAME,
#             field_name="metadata.chapter_id",
#             field_schema=models.PayloadSchemaType.KEYWORD,
#         )
#         print("Collection created successfully.")
#     except Exception as e:
#         print(f"Error during collection creation/reset: {e}")
#         return

#     # 3. Load and split documents
#     content_path = Path(__file__).parent.parent.parent / "website" / "docs"
#     print(f"Loading documents from: {content_path}")
#     loader = DirectoryLoader(
#         path=str(content_path),
#         glob="**/*.mdx",
#         loader_cls=TextLoader,
#         loader_kwargs={"autodetect_encoding": True}
#     )
#     documents = loader.load()

#     text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
#     texts = text_splitter.split_documents(documents)
    
#     for chunk in texts:
#     # Get path relative to the 'docs' directory to include the folder name
#         file_path = Path(chunk.metadata['source'])
#         relative_path = file_path.relative_to(content_path)
        
#         formatted_id = str(relative_path.with_suffix('')).replace('\\', '/')
#         chunk.metadata['chapter_id'] = formatted_id
    
#     print(f"Split documents into {len(texts)} chunks with Full Path IDs.")

#     # 4. Instantiate the vector store and add documents in batches
#     try:
#         print("Initializing QdrantVectorStore...")
#         qdrant_vector_store = QdrantVectorStore(
#             client=client,
#             collection_name=NEW_COLLECTION_NAME,
#             embedding=embedding,
#         )
        
#         batch_size = 64
#         print(f"Starting ingestion in batches of {batch_size}...")
#         for i in range(0, len(texts), batch_size):
#             batch_documents = texts[i:i + batch_size]
#             print(f"Uploading batch {i // batch_size + 1}/{(len(texts) + batch_size - 1) // batch_size} ({len(batch_documents)} documents)...")
#             qdrant_vector_store.add_documents(batch_documents)
#             print(f"Batch {i // batch_size + 1} uploaded successfully.")

#         print(f"Ingestion complete. All document chunks uploaded to '{NEW_COLLECTION_NAME}'.")
#     except Exception as e:
#         print(f"Error during document ingestion: {e}")


# if __name__ == "__main__":
#     ingest_with_gemini()
