import os
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_classic.text_splitter import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from qdrant_client.http.exceptions import UnexpectedResponse, ResponseHandlingException
from langchain_community.vectorstores import Qdrant
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
from pathlib import Path
import time

# Load environment variables
script_dir = Path(__file__).parent
dotenv_path = script_dir.parent / '.env'
load_dotenv(dotenv_path=dotenv_path)

QDRANT_HOST = os.getenv("QDRANT_HOST")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "physical_ai_textbook"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") # Ensure this is read for embeddings

# --- Step 1: Verify Qdrant Connection ---
def verify_qdrant_connection(client: QdrantClient):
    print(f"\nStep 1: Verifying connection to Qdrant at: {QDRANT_HOST}")
    try:
        collections = client.get_collections()
        print("Successfully connected to Qdrant.")
        print("Existing collections (from connection check):")
        for collection in collections.collections:
            print(f"- {collection.name}")
        return True
    except UnexpectedResponse as e:
        print(f"Error: Qdrant returned an unexpected response during connection verification.")
        print(f"Status Code: {e.status_code}")
        print(f"Content: {e.content}")
        print("Please check your QDRANT_HOST and QDRANT_API_KEY in backend/.env.")
        return False
    except ResponseHandlingException as e:
        print(f"Error: ResponseHandlingException during Qdrant connection verification: {e}")
        print("This often indicates a network issue or an invalid QDRANT_HOST/API_KEY combination.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred during Qdrant connection verification: {e}")
        return False

# --- Step 2: Ensure Collection Exists ---
def ensure_qdrant_collection(client: QdrantClient):
    print(f"\nStep 2: Ensuring Qdrant collection '{COLLECTION_NAME}' exists.")
    try:
        if not client.collection_exists(collection_name=COLLECTION_NAME):
            print(f"Collection '{COLLECTION_NAME}' not found. Creating new collection...")
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=3072, distance=Distance.COSINE),
            )
            print(f"Collection '{COLLECTION_NAME}' created.")
        else:
            print(f"Collection '{COLLECTION_NAME}' already exists.")
        return True
    except UnexpectedResponse as e:
        print(f"Error: Qdrant returned an unexpected response during collection check/creation.")
        print(f"Status Code: {e.status_code}")
        print(f"Content: {e.content}")
        print("This could be due to insufficient permissions for collection creation or a server-side issue.")
        return False
    except ResponseHandlingException as e:
        print(f"Error: ResponseHandlingException during Qdrant collection check/creation: {e}")
        print("Please verify your Qdrant API key has necessary write permissions.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred during Qdrant collection check/creation: {e}")
        return False

# --- Main Ingestion Logic ---
def ingest_documents(content_path: str = "website/docs"):
    print(f"Starting ingestion process from {content_path}...")

    # Validate Qdrant config
    if not QDRANT_HOST:
        print("Error: QDRANT_HOST environment variable not set in backend/.env file. Exiting.")
        return
    if not QDRANT_API_KEY and "localhost" not in QDRANT_HOST: # API Key generally required for cloud
        print("Warning: QDRANT_API_KEY environment variable not set in backend/.env file, but QDRANT_HOST is not localhost. This may cause authentication issues.")
        # return # Don't exit yet, let client decide.

    # 1. Initialize Qdrant Client
    print("\nInitializing Qdrant client...")
    try:
        client = QdrantClient(
            host=QDRANT_HOST,
            api_key=QDRANT_API_KEY if QDRANT_API_KEY else None,
            timeout=30 # Increased timeout
        )
    except Exception as e:
        print(f"Failed to initialize QdrantClient: {e}. Exiting.")
        return

    # 2. Verify Qdrant Connection
    if not verify_qdrant_connection(client):
        print("Qdrant connection failed verification. Exiting.")
        return
    
    # 3. Ensure Collection Exists or Create It
    if not ensure_qdrant_collection(client):
        print("Qdrant collection setup failed. Exiting.")
        return

    # 4. Load and Split Documents
    print("\nStep 4: Loading and splitting documents...")
    loader = DirectoryLoader(
        path=content_path,
        glob="**/*.mdx",
        loader_cls=TextLoader,
        loader_kwargs={"autodetect_encoding": True}
    )
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    texts = text_splitter.split_documents(documents)
    print(f"Split into {len(texts)} chunks.")

    # 5. Initializing GoogleGenerativeAIEmbeddings
    print("\nStep 5: Initializing GoogleGenerativeAIEmbeddings...")
    if not GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY environment variable not set in backend/.env file. Exiting.")
        return
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GEMINI_API_KEY)
        # # Debugging: Get dimension of the embedding model
        # dummy_embedding = embeddings.embed_query("test")
        # actual_dimension = len(dummy_embedding)
        # print(f"DEBUG: GoogleGenerativeAIEmbeddings(models/embedding-001) produces vectors of dimension: {actual_dimension}")
        # if actual_dimension != 768: # Or whatever the expected Qdrant dim is
        #      print(f"WARNING: Dimension mismatch detected between Qdrant config (768) and actual embedding model ({actual_dimension}).")
        #      print("You may need to update the VectorParams size in ingest.py or use a different embedding model.")

    except Exception as e:
        print(f"Failed to initialize GoogleGenerativeAIEmbeddings: {e}. Ensure GEMINI_API_KEY is correct. Exiting.")
        return

    # Upload documents to Qdrant
    print(f"\nStep 6: Creating embeddings and upserting {len(texts)} documents to Qdrant collection '{COLLECTION_NAME}'...")
    try:
        # Initialize Qdrant vectorstore with existing client
        qdrant_vectorstore = Qdrant(
            client=client,
            collection_name=COLLECTION_NAME,
            embeddings=embeddings,
        )
        # Add documents to the collection
        qdrant_vectorstore.add_documents(texts)
        print(f"Ingestion complete. {len(texts)} documents uploaded to Qdrant collection '{COLLECTION_NAME}'.")
    except ResponseHandlingException as e:
        print(f"Error: ResponseHandlingException during document upsert: {e}")
        print("This could be due to insufficient permissions for upsert or a server-side issue.")
    except Exception as e:
        print(f"An unexpected error occurred during document upsert: {e}")


if __name__ == "__main__":
    ingest_documents()