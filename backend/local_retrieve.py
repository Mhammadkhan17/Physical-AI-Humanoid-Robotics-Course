"""Retrieval from local Qdrant. Fully offline."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from langchain_qdrant import QdrantVectorStore
from local_embeddings import LocalEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest

COLLECTION_NAME = "Physical_AI_Textbook_Local"
QDRANT_URL = "http://localhost:6333"


def get_retriever(chapter_id: str = None):
    client = QdrantClient(url=QDRANT_URL)
    embedding = LocalEmbeddings()

    vector_store = QdrantVectorStore(
        client=client,
        collection_name=COLLECTION_NAME,
        embedding=embedding,
    )

    search_kwargs = {"k": 5}
    if chapter_id and chapter_id != "General Textbook":
        search_kwargs["filter"] = rest.Filter(
            must=[
                rest.FieldCondition(
                    key="metadata.chapter_id",
                    match=rest.MatchValue(value=chapter_id),
                )
            ]
        )

    return vector_store.as_retriever(search_kwargs=search_kwargs)
