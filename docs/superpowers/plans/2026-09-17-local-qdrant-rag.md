# Local Qdrant RAG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace cloud Qdrant + Gemini embeddings with a local Docker Qdrant instance and free HuggingFace embeddings for the RAG system.

**Architecture:** Run Qdrant in Docker with persistent storage. Use `all-MiniLM-L6-v2` (384 dimensions) via `langchain-huggingface` for local embeddings. Create incremental ingestion script that detects new/changed docs and upserts only those. Update the RAG chain to retrieve from local Qdrant.

**Tech Stack:** Qdrant (Docker), sentence-transformers, langchain-huggingface, langchain-qdrant, FastAPI

**Spec:** N/A — user request

## Global Constraints

- Collection name: `Physical_AI_Textbook_Local`
- Vector dimensions: 384 (all-MiniLM-L6-v2)
- Distance metric: COSINE
- Qdrant REST API: `localhost:6333`
- Qdrant storage: `./qdrant_storage` (mounted volume)
- Embedding model: `all-MiniLM-L6-v2` via HuggingFace
- Documents: `website/docs/**/*.mdx`
- Chunk size: 1000, overlap: 200 (matching existing config)
- LLM remains Gemini (cloud) — only vector DB goes local

## File Structure

| File | Responsibility |
|------|---------------|
| `backend/local_ingest.py` | Incremental ingestion of MDX docs into local Qdrant |
| `backend/local_retrieve.py` | Retrieval from local Qdrant with HuggingFace embeddings |
| `backend/chain.py` | **Modify** — swap `get_retriever` import to use local module |
| `backend/requirements.txt` | **Modify** — add `langchain-huggingface`, `sentence-transformers` |

---

### Task 1: Start Qdrant Docker Container

**Files:**
- None (Docker command only)

**Interfaces:**
- Consumes: `qdrant/qdrant` Docker image (already pulled)
- Produces: Qdrant REST API at `localhost:6333`, Web UI at `localhost:6333/dashboard`

- [ ] **Step 1: Run Qdrant container with persistent storage and auto-restart**

```bash
docker run -d \
  --name qdrant-local \
  --restart=unless-stopped \
  -p 6333:6333 \
  -p 6334:6334 \
  -v "$(pwd)/qdrant_storage:/qdrant/storage:z" \
  qdrant/qdrant
```

- [ ] **Step 2: Verify Qdrant is running**

```bash
curl http://localhost:6333/healthz
```

Expected: `{"status":"ok"}`

- [ ] **Step 3: Verify Web UI is accessible**

Open `http://localhost:6333/dashboard` in browser — should show Qdrant dashboard.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/2026-09-17-local-qdrant-rag.md
git commit -m "docs: add local Qdrant RAG implementation plan"
```

---

### Task 2: Install Dependencies

**Files:**
- Modify: `backend/requirements.txt`

**Interfaces:**
- Consumes: None
- Produces: Updated requirements with HuggingFace packages

**Note:** `sentence-transformers` pulls in `torch` (~2GB). First run downloads the model (~80MB) from HuggingFace Hub. Subsequent runs use the cached model.

- [ ] **Step 1: Add new dependencies to requirements.txt**

Append to `backend/requirements.txt`:

```
langchain-huggingface
sentence-transformers
```

- [ ] **Step 2: Install dependencies**

Run: `pip install -r backend/requirements.txt`

- [ ] **Step 3: Verify imports work**

```python
python -c "from langchain_huggingface import HuggingFaceEmbeddings; print('OK')"
```

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add backend/requirements.txt
git commit -m "deps: add langchain-huggingface and sentence-transformers"
```

---

### Task 3: Create Incremental Ingestion Script

**Files:**
- Create: `backend/local_ingest.py`

**Interfaces:**
- Consumes: MDX files from `website/docs/`, running Qdrant at `localhost:6333`
- Produces: Collection `Physical_AI_Textbook_Local` with embedded document chunks and indexed `metadata.chapter_id`

**Critical details from stress test:**
- Must derive `chapter_id` from file path relative to `website/docs/` (matching existing pattern from `gemini_ingest.py:116-122`)
- Must create KEYWORD payload index on `metadata.chapter_id` for filtered search performance
- Must validate collection vector dimensions if collection already exists
- Orphan cleanup: delete points from renamed/removed files before ingesting

- [ ] **Step 1: Create the ingestion script**

```python
"""Incremental ingestion of MDX docs into local Qdrant."""

import hashlib
from pathlib import Path

from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PayloadSchemaType, PointIdsList, Filter, FieldCondition, MatchValue

DOCS_DIR = Path(__file__).parent.parent / "website" / "docs"
COLLECTION_NAME = "Physical_AI_Textbook_Local"
QDRANT_URL = "http://localhost:6333"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
VECTOR_DIMENSIONS = 384


def get_embeddings():
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)


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
                f"Delete the collection first: client.delete_collection('{COLLECTION_NAME}')"
            )
        print(f"Collection {COLLECTION_NAME} already exists ({actual_dim}d)")


def file_hash(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def get_existing_file_hashes(client: QdrantClient) -> dict:
    """Scroll through collection and build a map of source_path -> (hash, point_ids)."""
    file_map = {}
    offset = None
    while True:
        results = client.scroll(
            collection_name=COLLECTION_NAME,
            with_payload=["source_path", "content_hash"],
            with_vectors=False,
            limit=100,
            offset=offset,
        )
        for point in results[0]:
            payload = point.payload
            if payload and "source_path" in payload:
                src = payload["source_path"]
                if src not in file_map:
                    file_map[src] = {"hash": payload.get("content_hash"), "point_ids": []}
                file_map[src]["point_ids"].append(point.id)
        offset = results[1]
        if offset is None:
            break
    return file_map


def delete_orphaned_points(client: QdrantClient, current_sources: set, existing_file_map: dict):
    """Delete points from files that no longer exist."""
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
    """Derive chapter_id from file path relative to docs directory."""
    file_path = Path(source_path)
    relative_path = file_path.relative_to(DOCS_DIR)
    return str(relative_path.with_suffix("")).replace("\\", "/")


def load_documents() -> list:
    loader = DirectoryLoader(
        str(DOCS_DIR),
        glob="**/*.mdx",
        loader_cls=TextLoader,
        loader_kwargs={"autodetect_encoding": True},
    )
    return loader.load()


def ingest(incremental: bool = True):
    embeddings = get_embeddings()
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

    # Derive chapter_id for all splits (matching gemini_ingest.py pattern)
    for chunk in splits:
        source = chunk.metadata.get("source", "")
        chunk.metadata["chapter_id"] = derive_chapter_id(source)
        chunk.metadata["source_path"] = source
        chunk.metadata["content_hash"] = file_hash(Path(source)) if source else "unknown"

    if incremental:
        existing_file_map = get_existing_file_hashes(client)
        current_sources = {chunk.metadata["source_path"] for chunk in splits}

        # Remove orphaned points from deleted/renamed files
        delete_orphaned_points(client, current_sources, existing_file_map)

        # Filter to only new/changed files
        new_splits = []
        for split in splits:
            src = split.metadata["source_path"]
            if src not in existing_file_map or existing_file_map[src]["hash"] != split.metadata["content_hash"]:
                new_splits.append(split)
        print(f"Incremental: {len(new_splits)} new/updated chunks to ingest")
        splits = new_splits
    else:
        # Full re-ingest: clear collection first
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
    parser.add_argument("--full", action="store_true", help="Re-ingest all documents (clears collection)")
    args = parser.parse_args()

    ingest(incremental=not args.full)
```

- [ ] **Step 2: Test ingestion runs**

Run: `cd backend && python local_ingest.py`

Expected: Creates collection with index, loads 12 MDX files, derives chapter_ids, splits into chunks, ingests them.

- [ ] **Step 3: Verify collection in Qdrant dashboard**

Open `http://localhost:6333/dashboard` → Collections → `Physical_AI_Textbook_Local` should show vectors count > 0 and payload index on `metadata.chapter_id`.

- [ ] **Step 4: Test incremental mode (no changes)**

Run: `cd backend && python local_ingest.py`

Expected: "Nothing to ingest" (no docs changed).

- [ ] **Step 5: Test orphan cleanup**

Rename one MDX file, run ingestion, verify old chunks are removed. Rename back.

- [ ] **Step 6: Commit**

```bash
git add backend/local_ingest.py
git commit -m "feat: add incremental local Qdrant ingestion with orphan cleanup"
```

---

### Task 4: Create Local Retrieval Module

**Files:**
- Create: `backend/local_retrieve.py`

**Interfaces:**
- Consumes: Collection `Physical_AI_Textbook_Local` at `localhost:6333`
- Produces: `get_retriever(chapter_id=None)` function matching `gemini_retrieve.get_retriever` signature — returns a LangChain `Retriever` object

**Critical detail:** Must match the exact interface of `gemini_retrieve.get_retriever` (line 49-79) — accepts `chapter_id`, returns `vector_store.as_retriever(search_kwargs=...)`.

- [ ] **Step 1: Create the retrieval module**

```python
"""Retrieval from local Qdrant with HuggingFace embeddings."""

import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest

COLLECTION_NAME = "Physical_AI_Textbook_Local"
QDRANT_URL = os.getenv("LOCAL_QDRANT_URL", "http://localhost:6333")
EMBEDDING_MODEL = "all-MiniLM-L6-v2"


def get_retriever(chapter_id: str = None):
    """
    Initializes and returns a Qdrant retriever configured for HuggingFace embeddings.
    Matches the interface of gemini_retrieve.get_retriever.
    """
    client = QdrantClient(url=QDRANT_URL)
    embedding = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

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
```

- [ ] **Step 2: Test retrieval**

```bash
cd backend && python -c "
from local_retrieve import get_retriever
retriever = get_retriever()
results = retriever.invoke('What is ROS?')
for i, doc in enumerate(results):
    print(f'--- Result {i+1} ---')
    print(doc.page_content[:200])
    print()
"
```

Expected: Returns relevant document chunks about ROS.

- [ ] **Step 3: Test filtered retrieval**

```bash
cd backend && python -c "
from local_retrieve import get_retriever
retriever = get_retriever(chapter_id='module-1-robotic-nervous-system/03-urdf-for-humanoids')
results = retriever.invoke('What is URDF?')
print(f'Got {len(results)} results')
for doc in results:
    print(doc.page_content[:100])
"
```

Expected: Returns chunks filtered to the URDF chapter.

- [ ] **Step 4: Commit**

```bash
git add backend/local_retrieve.py
git commit -m "feat: add local Qdrant retrieval module matching gemini_retrieve interface"
```

---

### Task 5: Update RAG Chain for Local Qdrant

**Files:**
- Modify: `backend/chain.py:6`

**Interfaces:**
- Consumes: `local_retrieve.get_retriever` (same signature as `gemini_retrieve.get_retriever`)
- Produces: Updated RAG chain using local retriever

- [ ] **Step 1: Change the import in chain.py**

In `backend/chain.py`, line 6, change:

```python
from gemini_retrieve import get_retriever
```

To:

```python
from local_retrieve import get_retriever
```

- [ ] **Step 2: Remove Gemini API key requirement for retriever (LLM still needs it)**

The `get_retriever` call on line 21 will now use local embeddings (no API key needed). The LLM on line 27 still uses `GEMINI_API_KEY` — this is correct, only the vector DB is local.

- [ ] **Step 3: Verify the chain builds correctly**

```bash
cd backend && python -c "
from chain import create_rag_chain
chain = create_rag_chain()
print('RAG chain loaded successfully')
"
```

Expected: No import errors. May print debug messages about global search.

- [ ] **Step 4: Commit**

```bash
git add backend/chain.py
git commit -m "feat: switch RAG chain to local Qdrant retrieval"
```

---

### Task 6: End-to-End Test

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: Running Qdrant container, ingested documents, updated chain
- Produces: Verified end-to-end RAG pipeline

- [ ] **Step 1: Verify Qdrant is running**

Run: `curl http://localhost:6333/healthz`

Expected: `{"status":"ok"}`

- [ ] **Step 2: Verify ingestion is complete**

Run: `cd backend && python -c "from qdrant_client import QdrantClient; c = QdrantClient(url='http://localhost:6333'); print(c.count('Physical_AI_Textbook_Local').count)"`

Expected: Number > 0 (should be ~50-100 chunks for 12 MDX files).

- [ ] **Step 3: Run the FastAPI server**

Run: `cd backend && uvicorn app:app --reload`

- [ ] **Step 4: Test the chat endpoint (global search)**

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is ROS?", "chapter_id": "General Textbook"}'
```

Expected: Streaming response with relevant content about ROS.

- [ ] **Step 5: Test with chapter filter**

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I create a node?", "chapter_id": "module-1-robotic-nervous-system/01-ros-nodes-topics-services"}'
```

Expected: Response focused on ROS nodes from Module 1.

- [ ] **Step 6: Verify Qdrant container survives reboot (optional)**

Reboot machine, check `docker ps` shows `qdrant-local` running.

---

## Future Updates

When you add or modify MDX files in `website/docs/`:

```bash
cd backend && python local_ingest.py
```

The script:
- Hashes each file and compares to stored hash
- Only re-ingests changed files
- Deletes orphaned chunks from renamed/deleted files
- Derives `chapter_id` automatically from path

Use `--full` to force a complete re-ingest:

```bash
cd backend && python local_ingest.py --full
```

## Troubleshooting

**Model download is slow on first run:**
The `all-MiniLM-L6-v2` model (~80MB) downloads from HuggingFace Hub. Subsequent runs use `~/.cache/huggingface/hub/`.

**Collection dimension mismatch error:**
If you previously used a different embedding model, delete the collection:
```python
from qdrant_client import QdrantClient
client = QdrantClient(url="http://localhost:6333")
client.delete_collection("Physical_AI_Textbook_Local")
```
Then re-run ingestion.

**Qdrant container not running:**
```bash
docker start qdrant-local
```
