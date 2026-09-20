"""Incremental ingestion of MDX docs into local Qdrant. Fully offline."""

import hashlib
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from local_embeddings import LocalEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    MatchValue,
    PayloadSchemaType,
    PointIdsList,
    VectorParams,
)

DOCS_DIR = Path(__file__).parent.parent / "website" / "docs"
COLLECTION_NAME = "Physical_AI_Textbook_Local"
QDRANT_URL = "http://localhost:6333"
VECTOR_DIMENSIONS = 384


def get_client():
    return QdrantClient(url=QDRANT_URL)


def ensure_collection(client: QdrantClient):
    collections = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in collections:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_DIMENSIONS, distance=Distance.COSINE),
        )
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="metadata.chapter_id",
            field_schema=PayloadSchemaType.KEYWORD,
        )
        print(f"Created collection: {COLLECTION_NAME} with chapter_id index")
    else:
        collection = client.get_collection(COLLECTION_NAME)
        actual_dim = collection.config.params.vectors.size
        if actual_dim != VECTOR_DIMENSIONS:
            raise ValueError(
                f"Collection exists with {actual_dim} dimensions but model produces {VECTOR_DIMENSIONS}. "
                f"Delete the collection first."
            )
        print(f"Collection {COLLECTION_NAME} already exists ({actual_dim}d)")


def file_hash(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def get_existing_file_hashes(client: QdrantClient) -> dict:
    file_map = {}
    offset = None
    while True:
        results = client.scroll(
            collection_name=COLLECTION_NAME,
            with_payload=True,
            with_vectors=False,
            limit=100,
            offset=offset,
        )
        for point in results[0]:
            payload = point.payload
            if payload and "metadata" in payload:
                meta = payload["metadata"]
                src = meta.get("source_path", "")
                if src:
                    if src not in file_map:
                        file_map[src] = {"hash": meta.get("content_hash"), "point_ids": []}
                    file_map[src]["point_ids"].append(point.id)
        offset = results[1]
        if offset is None:
            break
    return file_map


def delete_orphaned_points(client: QdrantClient, current_sources: set, existing_file_map: dict):
    orphans = set(existing_file_map.keys()) - current_sources
    for source in orphans:
        point_ids = existing_file_map[source]["point_ids"]
        if point_ids:
            client.delete(
                collection_name=COLLECTION_NAME,
                points_selector=PointIdsList(points=point_ids),
            )
            print(f"Deleted {len(point_ids)} orphaned chunks from: {source}")


def derive_chapter_id(source_path: str) -> str:
    file_path = Path(source_path)
    relative_path = file_path.relative_to(DOCS_DIR)
    parts = list(relative_path.parts)
    if parts:
        parts[-1] = re.sub(r"^\d+-", "", parts[-1])
    return str(Path(*parts).with_suffix("")).replace("\\", "/")


def load_documents() -> list:
    loader = DirectoryLoader(
        str(DOCS_DIR),
        glob="**/*.mdx",
        loader_cls=TextLoader,
        loader_kwargs={"autodetect_encoding": True},
    )
    return loader.load()


def ingest(incremental: bool = True):
    embeddings = LocalEmbeddings()
    client = get_client()
    ensure_collection(client)

    vectorstore = QdrantVectorStore(
        client=client,
        collection_name=COLLECTION_NAME,
        embedding=embeddings,
    )

    docs = load_documents()
    print(f"Loaded {len(docs)} documents")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    splits = splitter.split_documents(docs)
    print(f"Split into {len(splits)} chunks")

    for chunk in splits:
        source = chunk.metadata.get("source", "")
        chunk.metadata["chapter_id"] = derive_chapter_id(source)
        chunk.metadata["source_path"] = source
        chunk.metadata["content_hash"] = file_hash(Path(source)) if source else "unknown"

    if incremental:
        existing_file_map = get_existing_file_hashes(client)
        current_sources = {chunk.metadata["source_path"] for chunk in splits}
        delete_orphaned_points(client, current_sources, existing_file_map)

        new_splits = []
        for split in splits:
            src = split.metadata["source_path"]
            if src not in existing_file_map or existing_file_map[src]["hash"] != split.metadata["content_hash"]:
                new_splits.append(split)
        print(f"Incremental: {len(new_splits)} new/updated chunks to ingest")
        splits = new_splits
    else:
        client.delete_collection(COLLECTION_NAME)
        ensure_collection(client)
        vectorstore = QdrantVectorStore(
            client=client,
            collection_name=COLLECTION_NAME,
            embedding=embeddings,
        )

    if not splits:
        print("Nothing to ingest")
        return

    batch_size = 64
    for i in range(0, len(splits), batch_size):
        batch = splits[i : i + batch_size]
        vectorstore.add_documents(batch)
        print(f"Ingested batch {i // batch_size + 1}: {len(batch)} chunks")

    total = client.count(collection_name=COLLECTION_NAME).count
    print(f"Ingestion complete. Total points in collection: {total}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Ingest MDX docs into local Qdrant")
    parser.add_argument("--full", action="store_true", help="Re-ingest all documents")
    args = parser.parse_args()

    ingest(incremental=not args.full)
