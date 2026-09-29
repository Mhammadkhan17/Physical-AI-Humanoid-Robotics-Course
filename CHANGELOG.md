# Changelog

All notable changes to the Physical AI & Humanoid Robotics project.

## [Unreleased] - 2026-09-28

### Changed

- **Ask AI selection lifetime owned by one module** (`website/src/features/ask-ai/`)
  - New deep module: `context.tsx` (state + transitions), `useAskAiCapture.ts` (document mouseup adapter), `AskAiButton.tsx` (portal button), `index.ts` (public surface)
  - `DocItem` now only calls `useAskAiCapture(id)`; `RAGChatbot` reads and clears through `useAskAi()`
  - Chat-aware selection rules: surface guard (`data-ask-ai-surface`), markdown ladder, snapshot-guarded send clear
  - First test suite in the repo: 20 vitest tests (transitions, capture rules, button visibility, chatbot consumer)
- **Answer path collapsed into one deep module** (`backend/chain.py`)
  - Qdrant client, ONNX embeddings and vector store now built lazily once per process instead of per request (fold of `local_retrieve.py`)
  - New seam: `create_rag_chain(..., retriever=None, embedder=None, llm=None)` — tests inject an in-memory retriever and fake LLM with zero monkeypatching
  - `/api/chat` build failures now return 500 JSON `{detail}` (matches `api-contracts.yaml`) instead of leaking `"Error: …"` into a 200 stream; streaming failures log and emit a final error chunk
  - First backend test suite: 7 pytest tests (chain wiring, chapter-filter structure, adapter, key guard, route 500, empty-selection default)

### Removed

- `website/src/contexts/SelectedTextContext.tsx` and `website/src/contexts/ChatbotVisibilityContext.tsx`
  - Replaced by `src/features/ask-ai` (55 lines of pass-through state deleted)
- `backend/local_retrieve.py` (38 lines folded into `chain.py`; chapter filter now lives at one shared constant)

### Fixed

- Ask AI button timer leak (uncleared `setTimeout` on unmount, old `DocItem:37`)
- Orphaned `chapterId` after clearing the selection (old `RAGChatbot:176`)
- Stale chip after dismissing the button then opening the chat via the icon
- Selection no longer survives client-side navigation with a stale `chapterId`
- A fresh selection made while a response streams now survives completion (snapshot guard)

---

## [Unreleased] - 2026-09-23

### Fixed

- **Footer Icon-to-Text Spacing** (`website/src/css/custom.css`)
  - Cosmos theme was overriding `.footer__link-item` with `display: block !important`
  - This broke the `gap` property (only works on flex/grid containers)
  - Fixed by forcing `display: inline-flex !important` to restore icon-text spacing

- **Ask AI Floating Button** (`website/src/theme/DocItem/index.tsx`)
  - Button now renders via React Portal to `document.body` (avoids overflow clipping)
  - Selection detection uses `.closest('.markdown, .theme-doc-markdown, article')` instead of `contentRef`
  - Fixed button position: removed `scrollX/scrollY` from fixed-position coordinates
  - Added 10ms delay to mouseup handler so selection is finalized before detection
  - Added `isMounted` guard for SSR safety

### Changed

- **Updated `.gitignore`**
  - Added `.agents/` (local agent skills)
  - Added `docs/superpowers/` (local planning docs)

---

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
  - Migrated from `ChatGoogleGenerativeAI` to `ChatOpenAI` (OpenRouter compatible)
  - Added OpenRouter attribution headers (`HTTP-Referer`, `X-Title`)
  - Improved prompt template: direct quoting from textbook, concise answers for simple questions

- **Updated `backend/app.py`**
  - Replaced all `ChatGoogleGenerativeAI` instances with `ChatOpenAI`
  - Added `OPENROUTER_API_KEY` validation in personalize/translate endpoints
  - Added OpenRouter attribution headers to all LLM endpoints
  - Fixed chapter_id handling: no longer strips full path (passes as-is to retriever)

- **Updated `backend/requirements.txt`**
  - Added `onnxruntime`, `tokenizers`, `numpy` for local embeddings
  - Added `langchain-community`, `langchain-text-splitters`
  - Migrated from `langchain-google-genai` to `langchain-openai`
  - Pinned all package versions
  - Organized by category with comments

### Removed

- **Deleted `backend/main.py`**
  - Original placeholder stub with hardcoded responses
  - `app.py` is the only FastAPI entry point

- **Commented out legacy Gemini files**
  - `backend/gemini_retrieve.py` - Cloud Qdrant + Gemini embeddings (deprecated)
  - `backend/rag/gemini_ingest.py` - Cloud ingestion script (already commented out)

- **Removed Gemini/Google Packages**
  - `langchain-google-genai` - Replaced by `langchain-openai`
  - `google-generativeai` - No longer needed
  - `google-ai-generativelanguage` - No longer needed
  - `google-auth`, `google-api-core`, `google-api-python-client` - No longer needed
  - `proto-plus`, `protobuf`, `grpcio`, `grpcio-status` - No longer needed

- **Unused Packages**
  - `fastembed` - Replaced by custom ONNX embeddings
  - `pillow`, `loguru`, `mmh3`, `py_rust_stemmers`, `regex`, `jiter` - Not required

### Fixed

- **Chapter ID Mismatch** (`backend/local_ingest.py`)
  - `derive_chapter_id` now strips numeric prefixes (`02-`, `01-`) from filenames
  - Matches Docusaurus page ID format (e.g., `module-2-digital-twin/rendering-in-unity`)
  - Re-ingested all 114 chunks with corrected chapter_ids

- **Chapter ID Stripping** (`backend/app.py`)
  - Removed `.split('/')[-1]` that was stripping the full chapter path
  - Now passes full chapter_id to retriever (e.g., `module-3-ai-robot-brain/isaac-ros-vslam`)

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

### From Gemini to OpenRouter

**Before:**
- Gemini API direct (`ChatGoogleGenerativeAI`)
- Required: `GEMINI_API_KEY`

**After:**
- OpenRouter API (`ChatOpenAI` with OpenAI-compatible endpoint)
- Required: `OPENROUTER_API_KEY` (get yours at https://openrouter.ai/settings/keys)
- Model: `google/gemini-2.5-flash` via OpenRouter

### From Cloud to Local (Embeddings)

**Before:**
- Qdrant Cloud (remote) + Gemini Embeddings (API)
- Required: `QDRANT_HOST`, `QDRANT_API_KEY`, `GEMINI_API_KEY` for embeddings

**After:**
- Qdrant Docker (local) + ONNX Embeddings (local)
- Required: Only `OPENROUTER_API_KEY` for LLM chat responses
- Embeddings are fully offline

### Quick Start

```bash
# Start Qdrant
docker start qdrant-local

# Ingest documents
cd backend && python local_ingest.py

# Run API (needs OpenRouter API key)
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
