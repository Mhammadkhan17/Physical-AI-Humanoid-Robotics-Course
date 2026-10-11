# Physical AI & Humanoid Robotics

![License: MIT](https://img.shields.io/badge/license-MIT-blue)
![Docusaurus 3.9](https://img.shields.io/badge/Docusaurus-3.9-2E8555?logo=docusaurus&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![FastAPI 0.141](https://img.shields.io/badge/FastAPI-0.141-009688?logo=fastapi&logoColor=white)
![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)

**Live site:** [physical-ai-humanoid-robotics-cours-zeta.vercel.app](https://physical-ai-humanoid-robotics-cours-zeta.vercel.app/)

An AI-native textbook on physical AI and humanoid robotics with a built-in RAG tutor: highlight any passage in a chapter, ask the chatbot about it, and get an answer grounded in the book's own content — streamed back as it is generated.

This README documents how the codebase is implemented, for anyone reading, reviewing, or contributing to it.

## Features

- **Selection-aware RAG tutor** — questions can carry the reader's highlighted text and the current `chapter_id`, so retrieval is scoped to the chapter being read.
- **Fully local retrieval** — embeddings run in-process (ONNX `all-MiniLM-L6-v2`, 384-dim) and vectors live in a local Qdrant; the only remote call in the answer path is the LLM through OpenRouter.
- **Offline incremental ingestion** — content hashes per MDX file mean unchanged chapters are skipped, edits are re-indexed, and deleted files are cleaned up.
- **Streaming answers** — `/api/chat` returns a `text/plain` stream that the chatbot appends to token by token.
- **Personalization and Urdu translation** — a quiz builds a learner profile that drives chapter rewrites; the translate action renders the chapter in Urdu (RTL) and leaves fenced code blocks untouched.

## Table of contents

- [Quick start](#quick-start)
- [Usage](#usage)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Frontend implementation](#frontend-implementation)
- [Backend implementation](#backend-implementation)
- [Environment variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Quick start

**Prerequisites:** Node.js ≥ 20 (Yarn or npm), Python 3.11+, Docker.

Each step below starts from the repository root.

**1. Start Qdrant**

```bash
docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
```

**2. Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` (see [Environment variables](#environment-variables)):

```env
DATABASE_URL=sqlite:///./local.db
OPENROUTER_API_KEY=your-openrouter-api-key
```

```bash
uvicorn app:app --reload          # http://127.0.0.1:8000
```

**3. Ingest the textbook** (first run only)

```bash
cd backend && python local_ingest.py
```

**4. Frontend**

```bash
cd website
yarn install
yarn start                         # http://localhost:3000, proxies /api → :8000
```

Open `http://localhost:3000`, open any chapter, highlight a passage, and use the **Ask AI about this** button.

## Usage

What a reader can do once both servers are running:

- **Ask about a selection** — highlight text in a chapter → **Ask AI about this** → the chatbot answers using the retrieved chapter context plus your selection.
- **Ask generally** — open the chat from its toggle icon and type a question; retrieval falls back to the whole book.
- **Personalize a chapter** — the chapter action rewrites the text for the experience level recorded by the quiz (`/quiz` page).
- **Translate a chapter to Urdu** — same action bar; the UI sends `target_language: 'Urdu'` and renders the result right-to-left, with fenced code blocks left untouched. The backend endpoint itself accepts any target language.

The chat endpoint can also be exercised directly:

```bash
curl -N -X POST http://127.0.0.1:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is a ROS 2 node?"}'
```

The response streams plain text as tokens are generated (`-N` keeps curl from buffering). Add `"selected_text"` and `"chapter_id"` to scope the answer, e.g. `{"message": "...", "selected_text": "...", "chapter_id": "module-1-robotic-nervous-system/ros-nodes-topics-services"}`.

Chapter ids are Docusaurus doc ids (number prefixes stripped, e.g. `01-ros-nodes-topics-services.mdx` → `ros-nodes-topics-services`) — the same value `derive_chapter_id()` writes into the Qdrant payload during ingestion, so the `metadata.chapter_id` filter matches.

## Architecture

Two processes, one origin:

- **`website/`** — Docusaurus 3 static site (React 19 + TypeScript). Serves the textbook and all UI.
- **`backend/`** — FastAPI service exposing the `/api/*` routes: RAG chat, personalization, translation, quiz profile.

In development the Docusaurus dev server proxies `/api` to the backend (`api-proxy` plugin in `website/docusaurus.config.ts` → `http://127.0.0.1:8000`), so the browser only ever talks to one origin. In production, `vercel.json` routes requests the same way.

```
Browser (Docusaurus)
   │  POST /api/chat  {message, selected_text?, chapter_id?}
   ▼
FastAPI (backend/app.py)
   │  create_rag_chain(...)            ← backend/chain.py
   ▼
Qdrant (localhost:6333, collection "Physical_AI_Textbook_Local")
   │  top-k=5 chunks, optional chapter_id filter
   │  embedded by local ONNX all-MiniLM-L6-v2 (384-dim)
   ▼
LLM (OpenRouter — nvidia/nemotron-3-ultra-550b-a55b:free)
   │  tutor prompt = retrieved context + user's highlighted text
   ▼
StreamingResponse (text/plain)  →  RAGChatbot reads response.body reader
```

The retrieval side is fully local: embeddings run in-process via ONNX Runtime and vectors live in a local Qdrant instance. The only remote dependency is the LLM call through OpenRouter.

## Repository layout

```
website/                      Docusaurus site (the textbook + all UI)
  docusaurus.config.ts        Site config, cosmos theme, /api dev proxy
  sidebars.ts                 Docs sidebar
  docs/                       12 MDX chapters in 4 modules (content)
  blog/                       Classic-preset blog (Docusaurus sample posts, served at /blog)
  src/
    pages/                    index.tsx (landing), quiz.tsx, markdown-page.md
    components/               RAGChatbot, ChapterProgress, FeatureCard, InfoBox
    features/ask-ai/          "Ask about this" selection feature (deep module)
    theme/                    Swizzled Docusaurus components
      DocItem/                Chapter page wrapper: ask-ai capture, personalize, translate
      MDXComponents.tsx       Registers FeatureCard / InfoBox for use in MDX
      Footer/  Layout/  Navbar/  Root.tsx
    css/custom.css            Global styles and design tokens
    **/__tests__/             vitest suites (ask-ai, RAGChatbot)

backend/                      FastAPI service
  app.py                      App, CORS, DB models, the 4 /api routes
  chain.py                    RAG answer module (chain factory + lazy singletons)
  local_embeddings.py         ONNX all-MiniLM-L6-v2 embedding model
  local_ingest.py             Incremental MDX → Qdrant ingestion (offline)
  agents/                     3 standalone agent routers (see note below)
  models/                     Cached embedding model weights
  tests/                      pytest suite

.github/workflows/            ingestion.yml (placeholder CI job)
vercel.json                   Production build + routing config
```

Legacy leftovers at the repository root — `docs/`, `sidebars.js`, `course.txt`, `history/` — are from the original course material and are **not referenced** by the site; live content lives in `website/docs/`.

## Frontend implementation

### Stack

Docusaurus 3.9, React 19, TypeScript ~5.6, Tailwind CSS 4 (via `@tailwindcss/postcss`), `cosmos-docusaurus-theme`. Markdown rendering uses `react-markdown` with `remark-gfm` and `rehype-raw` (both in chat history and in DocItem's personalized/translated output).

### Content

`website/docs/` holds 12 MDX chapters in four modules:

| Module | Folder | Chapters |
|---|---|---|
| 1. Robotic Nervous System | `module-1-robotic-nervous-system` | ROS nodes/topics/services, Python `rclpy` bridge, URDF for humanoids |
| 2. Digital Twin | `module-2-digital-twin` | Physics in Gazebo, Unity rendering, sensor simulation |
| 3. AI Robot Brain | `module-3-ai-robot-brain` | Isaac Sim, Isaac ROS VSLAM, Nav2 path planning |
| 4. Vision-Language-Action | `module-4-vision-language-action` | Whisper voice-to-action, LLM cognitive planning, capstone project |

### The Ask AI feature

`website/src/features/ask-ai/` — one deep module owns the whole selection lifetime; other components only consume its public surface (`index.ts`):

- **`context.tsx`** — `AskAiProvider` holding `{selection: {text, chapterId}, isOpen, anchor}` with transitions `select / ask / open / close / clear`. `ask()` opens the chat and clears the OS text selection.
- **`useAskAiCapture.ts`** — a hook listening for `document` `mouseup`. It ignores events inside surfaces tagged `data-ask-ai-surface` (that tag marks the chat panel as excluded), then accepts the selection only when its anchor sits in a markdown container (`.markdown`, `.theme-doc-markdown`, `.theme-doc-markdown-container`, `article`), calling `select(text, chapterId, anchor)`. `DocItem` calls it once per page with the doc's metadata id, which becomes the `chapterId` riding along with the selection.
- **`AskAiButton.tsx`** — floating **"Ask AI about this"** button rendered through `createPortal` to `document.body` (so it escapes overflow clipping), positioned at the selection anchor; clicking it calls `ask()`.
- **`RAGChatbot`** reads the selection through `useAskAi()` and clears it after a response finishes, with a snapshot guard so a *new* selection made while streaming survives completion.

Why it is shaped this way: one module with explicit transitions keeps the selection rules testable in isolation. (Git history shows this state previously split across two pass-through context providers, which leaked `chapterId` and timers across navigation.)

### Chat streaming

`src/components/RAGChatbot.tsx` POSTs `{message, selected_text?, chapter_id?}` to `/api/chat` and reads the body incrementally:

```ts
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  // append decoder.decode(value) to the last bot message
}
```

It renders history with `ReactMarkdown` (`remark-gfm` + `rehype-raw`), shows a streaming indicator, and surfaces non-2xx responses via the FastAPI `detail` payload.

### Chapter page wrapper

`website/src/theme/DocItem/index.tsx` decorates every chapter with:

- `useAskAiCapture(props.content.metadata.id)` — wires selection capture to the current doc.
- **Personalize** — grabs the chapter's `innerText` and POSTs it to `/api/personalize`; the rewritten text replaces the rendered content (rendered with `rehype-raw`).
- **Translate to Urdu** — same pattern against `/api/translate` with `target_language: 'Urdu'`; renders right-to-left. It translates the personalized text when one is displayed, otherwise the chapter's `innerText`.
- **`ChapterProgress`** — a fixed top bar (`h-1`, 4px) whose width tracks scroll percentage.

Both personalized and translated results are local component state; navigating away discards them.

### Other pages

- `src/pages/index.tsx` — landing page (hero, feature cards, module grid).
- `src/pages/quiz.tsx` — onboarding quiz (Python/ROS experience, GPU, Jetson, robot access) POSTing to `/api/profile/quiz`.

## Backend implementation

### Routes

`backend/app.py`:

| Method & path | What it does |
|---|---|
| `POST /api/chat` | Builds a RAG chain via `create_rag_chain()` and returns a `StreamingResponse` (`text/plain`). Chain-build failures raise `HTTPException(500, detail=...)`; stream failures log and emit an error chunk. |
| `POST /api/profile/quiz` | Saves quiz answers to the `profiles` row (`user_id` is hardcoded to `1` — there is no auth). |
| `POST /api/personalize` | Rewrites chapter text for the learner's stored experience level. Reads the profile; if none exists, returns the original text unchanged. |
| `POST /api/translate` | Translates text into `target_language`, instructed to leave fenced code blocks untouched. The endpoint accepts any language; the frontend always sends `Urdu`. |
| `GET /` | Health/hello JSON. |

`personalize` and `translate` each construct their own `ChatOpenAI` (temperature `0.7` and `0.2` respectively) and chain `prompt | llm | StrOutputParser()`.

App setup notes: CORS allows `http://localhost:3000` and the production Vercel origin; SQLAlchemy runs `Base.metadata.create_all` at import time (schema is created, not migrated); the app **fails fast at import** if `DATABASE_URL` is unset.

### The answer module

`backend/chain.py` — single deep module for the chat answer path:

- **Lazy process-wide singletons** — `_client` (Qdrant), `_embedder` (ONNX), `_store` (vector store) are built once on first use, not per request.
- **`create_rag_chain(selected_text, chapter_id, retriever=None, embedder=None, llm=None)`** — the seam. An injected `retriever` wins outright; `embedder`/`llm` shape the default path. This lets tests pass an in-memory retriever and a fake LLM with no monkeypatching.
- **Key check first** — `_make_llm()` raises if `OPENROUTER_API_KEY` is missing *before* any ONNX/Qdrant work happens, so a keyless call fails fast and cheap.
- **Retrieval** — `_search_kwargs()` returns `{k: 5}` and adds a Qdrant filter on `metadata.chapter_id` when a `chapter_id` is supplied and isn't `"General Textbook"`.
- **Prompt** — a tutor prompt with the retrieved context and the user's highlighted text as separate blocks, plus rules: quote the textbook when the context covers the question, fall back to general knowledge (announced as such) when it doesn't, keep short questions short.

`python chain.py` runs a standalone demo invoke.

### Embeddings

`backend/local_embeddings.py` wraps the local `all-MiniLM-L6-v2` tokenizer + ONNX model under `backend/models/`: tokenizes, runs the ONNX session, mean-pools token embeddings with the attention mask → a 384-dim vector. No API call, no network. (The `.onnx` weights are gitignored and expected to be present locally.)

### Ingestion

`backend/local_ingest.py` — offline, incremental indexing of the MDX content:

- Source: `website/docs/`; collection: `Physical_AI_Textbook_Local` at `http://localhost:6333`, cosine, 384 dims, with a keyword payload index on `metadata.chapter_id`.
- Splits with `RecursiveCharacterTextSplitter`, embeds with `LocalEmbeddings`.
- Tracks a content hash per source file in the payload: unchanged files are skipped, changed files are re-indexed, and points whose source file disappeared are deleted.

```bash
python local_ingest.py          # incremental (default)
python local_ingest.py --full  # re-ingest everything
```

### Agents

`backend/agents/` — three self-contained FastAPI `APIRouter`s:

| File | Route | Purpose |
|---|---|---|
| `ros2_code_generator.py` | `POST /generate_ros2_code` | Generate ROS 2 code from a description |
| `mermaid_diagram_generator.py` | `POST /generate_mermaid_diagram` | Produce Mermaid diagrams (e.g. URDF trees) |
| `ros2_doctor.py` | `POST /diagnose_ros2_error` | Explain/diagnose ROS 2 error output |

**Note:** nothing in `app.py` imports or mounts these routers today — they are standalone modules you can mount with `app.include_router(...)` if you wire them up.

### Data model

Single table, `profiles` (`backend/app.py`):

| Column | Type | Meaning |
|---|---|---|
| `id` | int PK | |
| `user_id` | int, unique | Currently always `1` |
| `python_experience` / `ros_experience` | int 0–5 | Quiz self-rating, drives `personalize` prompts |
| `has_gpu` / `has_jetson` / `has_robot_access` | bool | Hardware answers |

Pydantic schemas: `QuizAnswers`, `ProfileResponse`, `ChatRequest {message, selected_text?, chapter_id?}`, `PersonalizeRequest {chapter_original_text, user_id}`, `TranslateRequest {text, target_language}`.

## Environment variables

Loaded with `python-dotenv` from a `backend/.env` file (a repo-root `.env` also works). Example:

```env
DATABASE_URL=sqlite:///./local.db   # production: postgresql://...
OPENROUTER_API_KEY=your-openrouter-api-key
```

| Variable | Required | Used for |
|---|---|---|
| `DATABASE_URL` | **Yes** — app raises at import without it | SQLAlchemy connection string (Postgres in production; SQLite locally; `sqlite:///:memory:` in tests) |
| `OPENROUTER_API_KEY` | Yes for chat/personalize/translate | OpenRouter LLM calls |

Qdrant (`http://localhost:6333`) and the embedding model path are currently constants in `chain.py` / `local_ingest.py`, not environment variables. Never commit `.env`.

## Testing

| Suite | Where | Run with | Covers |
|---|---|---|---|
| Backend (pytest, 7 tests) | `backend/tests/` | `cd backend && python -m pytest` | Chain wiring, chapter-filter structure, in-memory adapter (`tests/in_memory.py`), missing-key guard, `/api/chat` 500 path, empty-selection default |
| Frontend (vitest + jsdom) | `website/src/**/__tests__` | `cd website && yarn test` | Ask-AI state transitions, capture rules, button visibility, chatbot consumer |

Both suites force required env vars **before** importing the modules under test, so they run without real credentials or a live Qdrant.

## Deployment

`vercel.json` defines two builds and the rewrites between them:

- `website/package.json` → `@vercel/static-build` (`distDir: build`) serves the site.
- `backend/app.py` → `@vercel/python` serves the API.
- Rewrites: `/api/(.*)` → `backend/app.py`; everything else → `/website/$1`.

The CORS allow-list in `app.py` must include the deployed origin. `.github/workflows/ingestion.yml` runs on pushes to `main` but is currently a placeholder (`echo`) — actual ingestion is run manually via `local_ingest.py`.

## Contributing

Conventions already established in the code:

- **One HTTP operation per route function**; request/response shapes are Pydantic models in `app.py`.
- **Deep modules over scattered state** — chat answer logic lives in `chain.py`, selection logic in `src/features/ask-ai/`. New behavior belongs in the module that owns it, exposed through a small surface.
- **Test seams over monkeypatching** — inject dependencies (`create_rag_chain(..., retriever=, llm=)`) so tests stay readable.
- **Frontend** uses React function components, CSS Modules / Tailwind for styling, and `clsx` for conditional class names.
- Verify with `yarn typecheck` + `yarn test` (frontend) and `python -m pytest` (backend) before opening a PR.
- Commit messages follow the conventional format: `type(scope): description`.

## License

MIT — see [LICENSE](./LICENSE).
