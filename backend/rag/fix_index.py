import os
from qdrant_client import QdrantClient, models
from dotenv import load_dotenv

load_dotenv()

QDRANT_HOST = os.getenv("QDRANT_HOST")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
NEW_COLLECTION_NAME = "Physical_AI_Textbook_v2"

def create_missing_index():
    client = QdrantClient(host=QDRANT_HOST, api_key=QDRANT_API_KEY)
    
    print(f"Creating keyword index for 'metadata.chapter_id' in {NEW_COLLECTION_NAME}...")
    
    client.create_payload_index(
        collection_name=NEW_COLLECTION_NAME,
        field_name="metadata.chapter_id",
        field_schema=models.PayloadSchemaType.KEYWORD,
    )
    
    print("Success! You can now use the chapter_id filter.")

if __name__ == "__main__":
    create_missing_index()