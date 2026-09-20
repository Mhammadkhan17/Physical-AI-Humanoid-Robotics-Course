# Changelog

All notable changes to the Physical AI & Humanoid Robotics project.

## [Unreleased] - 2026-09-20

### Added

- **Local Qdrant Docker Setup**
  - Created Qdrant Docker container (`qdrant-local`) with persistent storage
  - Configured auto-restart policy (`--restart=unless-stopped`)
  - REST API at `localhost:6333`, Web UI at `localhost:6333/dashboard`

- **Fully Offline Embeddings** (`backend/local_embeddings.py`)
  - Custom `LocalEmbeddings` class using ONNX Runtime
  - Loads `all-MiniLM-L6-v2` model from local files (no HuggingFace Hub calls)
  - 384-dimensional embeddings with L2 normalization
  - Proper mean pooling implementation

- **Incremental Ingestion Script** (`backend/local_ingest.py`)
  - Loads MDX files from `website/docs/`
  - Derives `chapter_id` from file path (matches existing pattern)
  - File hashing for incremental updates (only re-ingests changed files)
  - Orphan cleanup (removes chunks from deleted/renamed files)
  - Creates KEYWORD payload index on `metadata.chapter_id`
  - Supports `--full` flag for complete re-ingestion

- **Local Retrieval Module** (`backend/local_retrieve.py`)
  - `get_retriever(chapter_id=None)` function
  - Matches existing `gemini_retrieve.get_retriever` interface
  - Supports chapter-filtered search

- **Local Model Storage** (`backend/models/all-MiniLM-L6-v2/`)
  - Downloaded ONNX model files for offline use
  - Config, tokenizer, and model weights stored locally

### Changed

- **Updated `backend/chain.py`**
  - Switched import from `gemini_retrieve` to `local_retrieve`
  - Retrieval is now fully local (no cloud Qdrant dependency)

- **Updated `backend/requirements.txt`**
  - Added `onnxruntime`, `tokenizers`, `numpy` for local embeddings
  - Added `langchain-community`, `langchain-text-splitters`
  - Pinned all package versions
  - Organized by category with comments

### Removed

- **Unused Packages**
  - `fastembed` - Replaced by custom ONNX embeddings
  - `langchain-openai` - Not used in codebase
  - `openai` - Not used in codebase
  - `tiktoken` - Not used in codebase
  - `grpcio-status` - Transitive dependency (re-added as needed)
  - `pillow` - Not required
  - `loguru` - Not required
  - `mmh3` - Not required
  - `py_rust_stemmers` - Not required
  - `regex` - Not required
  - `jiter` - Not required

### Fixed

- **Mean Pooling Bug** (`backend/local_embeddings.py`)
  - Fixed mask expansion shape (was `(-1, 1)`, now `(seq_len, 1)`)
  - Added L2 normalization for consistent embeddings
  - Verified similarity scores: same text = 1.0, similar = 0.96, different = 0.04

- **Orphan Detection Bug** (`backend/local_ingest.py`)
  - Fixed `get_existing_file_hashes` to look for `source_path` inside `metadata` (not top-level payload)

### Verified

- Chapter-filtered retrieval works for all 4 modules
- Global search returns relevant results
- Edge cases: empty text, long text, special characters, Unicode
- Incremental ingestion detects new/changed files
- Orphan cleanup removes chunks from deleted files
- All imports work together without conflicts

---

## Migration Notes

### From Cloud to Local

**Before:**
- Qdrant Cloud (remote) + Gemini Embeddings (API)
- Required: `QDRANT_HOST`, `QDRANT_API_KEY`, `GEMINI_API_KEY` for embeddings

**After:**
- Qdrant Docker (local) + ONNX Embeddings (local)
- Required: Only `GEMINI_API_KEY` for LLM chat responses
- Embeddings are fully offline

### Quick Start

```bash
# Start Qdrant
docker start qdrant-local

# Ingest documents
cd backend && python local_ingest.py

# Run API (still needs Gemini for LLM)
uvicorn app:app --reload
```

### Adding New Documents

```bash
# Add/update MDX files in website/docs/
cd backend && python local_ingest.py
```

### Force Full Re-ingestion

```bash
cd backend && python local_ingest.py --full
```
