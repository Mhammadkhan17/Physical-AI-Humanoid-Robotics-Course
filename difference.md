# Spec vs Implementation Report

**Date**: 2026-09-16
**Feature Branch**: `001-physical-ai-book`
**Sources**: `.specify/memory/constitution.md`, `specs/001-physical-ai-book/spec.md`, `specs/001-physical-ai-book/plan.md`, `specs/001-physical-ai-book/data-model.md`, `specs/001-physical-ai-book/contracts/api-contracts.yaml`

---

## 1. Technology Stack

### 1.1 Frontend Framework

| Aspect | Specified | Implemented | Status |
|---|---|---|---|
| Framework | Docusaurus 3 | Docusaurus 3.9.2 | Match |
| Content Format | MDX v3 | MDX v3 | Match |
| React Version | Not specified | React 19 | — |
| Styling | **Tailwind CSS** | **CSS Modules** + `clsx` | Deviation |
| Additional UI | Chakra UI / Material UI mentioned as options | Not used | Omitted |

**Reference**: `constitution.md:60` lists "Tailwind CSS, Chakra UI/Material UI" as styling technologies. `spec.md:101` locks "Docusaurus 3 + MDX v3 + Tailwind" as the tech stack. The implementation uses CSS Modules with `*.module.css` files throughout (`RAGChatbot.module.css`, etc.) and a global `custom.css` file. No Tailwind CSS is installed or configured.

### 1.2 Backend Framework

| Aspect | Specified | Implemented | Status |
|---|---|---|---|
| Framework | FastAPI | FastAPI | Match |
| Language | Python 3.11 | Python (version not pinned in runtime) | Match |
| RAG Orchestration | LangChain | LangChain | Match |
| API Style | REST | REST | Match |

**Reference**: `plan.md:20` specifies "Python 3.11 (Backend)". `constitution.md:76-77` specifies "Python (FastAPI)" and "LangChain" for the RAG Service API component.

### 1.3 Vector Database

| Aspect | Specified | Implemented | Status |
|---|---|---|---|
| Service | Qdrant Cloud (free tier) | Qdrant Cloud | Match |
| Alternative | Pinecone | Not used | Omitted |
| Embedding Model | GoogleGenerativeAIEmbeddings | Custom `GeminiEmbeddings` class | Partial |

**Reference**: `constitution.md:94-96` specifies "Qdrant Cloud Free Tier" with "Pinecone (Alternative)" and "GoogleGenerativeAIEmbeddings, OpenAI, Cohere" as embedding options. The implementation uses a custom `GeminiEmbeddings` class in `backend/gemini_retrieve.py:15-42` that wraps `google.generativeai` directly instead of using LangChain's `GoogleGenerativeAIEmbeddings` wrapper.

### 1.4 Large Language Models

| Use Case | Specified | Implemented | Status |
|---|---|---|---|
| RAG Answers | **Claude 3.5 Sonnet** (primary), GPT-4o-mini (fallback) | **Gemini 2.5 Flash** | Deviation |
| Personalization | Gemini-1.5-Pro or GPT-4o | Gemini 2.5 Flash | Partial |
| Urdu Translation | Gemini-1.5-Pro or GPT-4o | Gemini 2.5 Flash | Partial |
| Embeddings | GoogleGenerativeAIEmbeddings | Google Gemini Embedding 001 | Match |

**Reference**: `spec.md:104-105` explicitly states:
- "LLM for answers: Claude 3.5 Sonnet (primary) → fallback GPT-4o-mini"
- "LLM for personalization & Urdu: Gemini-1.5-Pro (best Urdu support) or GPT-4o"

The implementation uses `ChatGoogleGenerativeAI(model="gemini-2.5-flash")` for all three use cases (RAG, personalization, translation) in `backend/chain.py:27-31`, `backend/app.py:268-272`, and `backend/app.py:299-303`. There is no Claude integration, no GPT-4o integration, and no fallback chain configured.

### 1.5 Database

| Aspect | Specified | Implemented | Status |
|---|---|---|---|
| Service | Neon Serverless Postgres | Neon Serverless Postgres | Match |
| ORM | Not specified | SQLAlchemy | — |
| Schema | 6 entities (User, Chapter, ChapterPersonalization, ChapterTranslation, ChatSession, ContentEmbedding) | 2 tables (users, profiles) | Partial |

**Reference**: `data-model.md` defines 6 entities with full attribute specifications. Only 2 are implemented.

### 1.6 Authentication

| Aspect | Specified | Implemented | Status |
|---|---|---|---|
| Library | **Better-Auth** (https://www.better-auth.com) | **Custom JWT** (PyJWT + pwdlib) | Deviation |
| Password Hashing | Managed by Better-Auth | `pwdlib.PasswordHash` (formerly `passlib.CryptContext`) | Deviation |
| JWT Handling | Managed by Better-Auth | `jwt.encode()` / `jwt.decode()` | Deviation |
| User Model | Better-Auth's built-in model | Custom `DBUser` SQLAlchemy model | Deviation |
| Session Management | Better-Auth handles it | Custom `create_access_token()` with 30min expiry | Deviation |

**Reference**: 
- `constitution.md:124`: "Technologies: Better-Auth.com"
- `spec.md:107`: "Auth: Better-Auth (https://www.better-auth.com)"
- `spec.md:216`: "FR-007: System MUST integrate Better-Auth for user registration and login."
- `spec.md:151`: "User Story 3 - Better-Auth Signup/Signin with Background Quiz"
- `plan.md:21`: "Primary Dependencies: ... Better-Auth"
- `data-model.md:11-12`: "email (for Better-Auth)", "password_hash (managed by Better-Auth)"

The implementation in `backend/app.py:20-22,57-59,153-164,166-182` uses a fully custom authentication system with PyJWT for token handling and pwdlib for password hashing. The `app.txt:57` file even contains a stale comment: `"Link to better-auth user ID"` — a remnant of the original plan.

### 1.7 Deployment

| Aspect | Specified | Implemented | Status |
|---|---|---|---|
| Frontend | **GitHub Pages** | **Vercel** | Deviation |
| Backend | **Render / Fly.io / Railway** | **Vercel** (serverless Python function) | Deviation |

**Reference**:
- `constitution.md:35`: "Deployment Target: GitHub Pages"
- `spec.md:108`: "Deployment: GitHub Pages (frontend) + Render / Fly.io / Railway (backend)"
- `plan.md:24`: "Target Platform: GitHub Pages (Frontend), Render / Fly.io / Railway (Backend)"

The implementation deploys both frontend and backend on Vercel as configured in `vercel.json`. The frontend builds as a static site via `@vercel/static-build`, and the backend runs as a Python serverless function via `@vercel/python`. The `docusaurus.config.ts` does contain GitHub Pages config (`organizationName`, `deploymentBranch`) but this appears to be leftover from the original plan.

---

## 2. Feature Implementation Status

### 2.1 Base Requirements (P1)

| Requirement | ID | Status | Notes |
|---|---|---|---|
| MDX textbook covering all 4 modules + hardware | FR-001 | Partial | Content exists in `website/docs/` but not all chapters are complete |
| Deployed and publicly accessible | FR-002 | Partial | Deployed on Vercel, not GitHub Pages as specified |
| RAG chatbot on every page | FR-003 | Implemented | `RAGChatbot.tsx` injected via custom Layout |
| Chatbot answers from book only + citations | FR-004 | Implemented | LangChain RAG chain with Qdrant retrieval |
| Selected-text mode | FR-005 | Implemented | `SelectedTextContext` + "Ask AI about this" button |

### 2.2 Bonus 1 — Reusable Intelligence (P2)

| Requirement | ID | Status | Notes |
|---|---|---|---|
| Code Generation Agent | FR-006 | Placeholder | `backend/agents/ros2_code_generator.py` exists but is a stub router |
| Diagram Generation Agent | FR-006 | Placeholder | `backend/agents/mermaid_diagram_generator.py` exists but is a stub router |
| ROS2 Helper Agent | FR-006 | Placeholder | `backend/agents/ros2_doctor.py` exists but is a stub router |

**Reference**: `spec.md:75-78` defines three agent skills. The files exist in `backend/agents/` but contain only FastAPI router scaffolding without actual LLM integration or agent logic.

### 2.3 Bonus 2 — Authentication + Background Quiz (P2)

| Requirement | ID | Status | Notes |
|---|---|---|---|
| Better-Auth fully integrated | FR-007 | **Not implemented** | Custom JWT used instead |
| Multi-step background quiz at signup | FR-008 | Implemented | Quiz page exists at `src/pages/quiz.tsx` |
| Quiz answers saved in Neon Postgres | FR-009 | Implemented | `Profile` table stores quiz data |

### 2.4 Bonus 3 — Personalize Content (P3)

| Requirement | ID | Status | Notes |
|---|---|---|---|
| "Personalize this chapter" button | FR-010 | Implemented | Button in custom `DocItem` theme override |
| LLM rewrites chapter by user profile | FR-011 | Implemented | Uses Gemini 2.5 Flash (not Gemini-1.5-Pro as specified) |
| Caching of personalized content | Not specified but implied | **Not implemented** | Content regenerated on every request |

### 2.5 Bonus 4 — Translate to Urdu (P3)

| Requirement | ID | Status | Notes |
|---|---|---|---|
| "Read in Urdu" button | FR-012 | Implemented | Button in custom `DocItem` theme override |
| LLM translates to Urdu | FR-013 | Implemented | Uses Gemini 2.5 Flash (not Gemini-1.5-Pro as specified) |
| Translation caching | SC-007 mentions cached translation | **Not implemented** | Translated content regenerated on every request |

### 2.6 Ingestion Pipeline

| Requirement | ID | Status | Notes |
|---|---|---|---|
| Auto-ingestion on push to main | FR-014 | **Not implemented** | `backend/rag/gemini_ingest.py` is entirely commented out |
| CI/CD workflow | Not in spec | Exists | `.github/workflows/ingestion.yml` exists but is a placeholder |

**Reference**: `spec.md:110-114` specifies the ingestion pipeline should run automatically on push. The `.github/workflows/ingestion.yml` workflow exists but the actual ingestion script logic is commented out in the codebase.

---

## 3. Data Model Comparison

### 3.1 User Entity

**Specified** (`data-model.md:5-28`):

| Attribute | Type | Specified | Implemented |
|---|---|---|---|
| `user_id` | Primary Key, string | Yes | `id` (Integer, auto-increment) |
| `email` | string, unique | Yes | Yes |
| `password_hash` | string | Yes | `hashed_password` (String) |
| `google_id` | string, optional | Yes | **Not implemented** |
| `python_experience` | string (e.g., "Beginner") | Yes | `python_experience` (Integer) |
| `ros_experience` | string (e.g., "ROS2") | Yes | `ros_experience` (Integer) |
| `gpu_available` | boolean | Yes | `has_gpu` (Boolean) — in Profile, not User |
| `jetson_access` | boolean | Yes | `has_jetson` (Boolean) — in Profile, not User |
| `robot_access` | boolean | Yes | `has_robot_access` (Boolean) — in Profile, not User |
| `created_at` | timestamp | Yes | **Not implemented** |
| `updated_at` | timestamp | Yes | **Not implemented** |

**Key Differences**:
- User ID is `Integer` (auto-increment) instead of `string` (UUID)
- Password hash column renamed from `password_hash` to `hashed_password`
- `google_id` for OAuth not implemented (no Google sign-in)
- Experience levels stored as `Integer` instead of `String` (enum-like)
- Hardware access attributes moved to separate `Profile` table
- No `created_at` or `updated_at` timestamps

### 3.2 Profile Entity (Not in Spec)

The implementation introduces a `Profile` table (`backend/app.py:80-88`) that does not exist in the spec. The spec stores all user attributes (including quiz data) in a single `User` entity. The implementation splits quiz data into a separate table linked by `user_id`.

```python
class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True)
    python_experience = Column(Integer)
    ros_experience = Column(Integer)
    has_gpu = Column(Boolean)
    has_jetson = Column(Boolean, default=False)
    has_robot_access = Column(Boolean, default=False)
```

### 3.3 Chapter Entity

**Specified** (`data-model.md:30-46`):

| Attribute | Type | Specified | Implemented |
|---|---|---|---|
| `chapter_id` | Primary Key, string | Yes | **Not implemented as DB entity** |
| `original_mdx_content` | text | Yes | Managed by Docusaurus filesystem |
| `title` | string | Yes | Managed by Docusaurus filesystem |
| `slug` | string, unique | Yes | Managed by Docusaurus filesystem |
| `module` | string | Yes | Managed by Docusaurus filesystem |
| `order` | integer | Yes | Managed by Docusaurus filesystem |
| `last_ingested_at` | timestamp | Yes | **Not implemented** |

**Status**: Not implemented as a database table. Chapter content is managed entirely by Docusaurus's filesystem-based routing (`website/docs/`). There is no database representation of chapters.

### 3.4 ChapterPersonalization Entity

**Specified** (`data-model.md:48-62`):

| Attribute | Type | Specified | Implemented |
|---|---|---|---|
| `personalization_id` | Primary Key, string | Yes | **Not implemented** |
| `user_id` | Foreign Key, string | Yes | Not linked |
| `chapter_id` | Foreign Key, string | Yes | Not linked |
| `personalized_content` | text | Yes | Generated on-the-fly, not stored |
| `llm_model_used` | string | Yes | Not tracked |
| `generated_at` | timestamp | Yes | Not tracked |

**Status**: Not implemented. Personalized content is generated fresh on every request via the `/api/personalize` endpoint and returned directly to the client without any caching or persistence.

### 3.5 ChapterTranslation Entity

**Specified** (`data-model.md:64-77`):

| Attribute | Type | Specified | Implemented |
|---|---|---|---|
| `translation_id` | Primary Key, string | Yes | **Not implemented** |
| `chapter_id` | Foreign Key, string | Yes | Not linked |
| `language` | string | Yes | Not tracked |
| `translated_content` | text | Yes | Generated on-the-fly, not stored |
| `llm_model_used` | string | Yes | Not tracked |
| `generated_at` | timestamp | Yes | Not tracked |

**Status**: Not implemented. Same as personalization — translations are generated fresh on every request via `/api/translate` without caching.

### 3.6 ChatSession Entity

**Specified** (`data-model.md:79-91`):

| Attribute | Type | Specified | Implemented |
|---|---|---|---|
| `session_id` | Primary Key, string | Yes | **Not implemented** |
| `user_id` | Foreign Key, string, optional | Yes | Not tracked |
| `start_time` | timestamp | Yes | Not tracked |
| `end_time` | timestamp, optional | Yes | Not tracked |
| `chat_history` | JSON (conversation turns) | Yes | Not persisted |

**Status**: Not implemented. Chat is stateless — each request to `/api/chat` is independent with no session tracking or history persistence.

### 3.7 ContentEmbedding Entity

**Specified** (`data-model.md:93-107`):

| Attribute | Type | Specified | Implemented |
|---|---|---|---|
| `embedding_id` | Primary Key, string | Yes | Managed by Qdrant internally |
| `chapter_id` | Foreign Key, string | Yes | **Not linked** |
| `chunk_id` | string | Yes | Not tracked |
| `vector` | array of floats | Yes | Managed by Qdrant |
| `text_content` | text | Yes | Stored as Qdrant payload |
| `source_metadata` | JSON | Yes | Partially (metadata stored in Qdrant payload) |
| `created_at` | timestamp | Yes | **Not implemented** |

**Status**: Partially implemented. Qdrant stores vectors and text content as payloads, but there is no `chapter_id` foreign key relationship to a `Chapter` entity (since that entity doesn't exist in the DB).

---

## 4. API Contract Comparison

### 4.1 Specified Endpoints (`api-contracts.yaml`)

| Endpoint | Method | Specified | Implemented | Status |
|---|---|---|---|---|
| `/ingest` | POST | Yes | **Not implemented** | Ingestion pipeline commented out |
| `/chat` | POST | Yes | `/api/chat` | Implemented with route prefix |

### 4.2 Implemented Endpoints (Not in Spec)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | Login and token generation |
| `/api/users/me` | GET | Get current user profile |
| `/api/profile/quiz` | POST | Submit background quiz answers |
| `/api/personalize` | POST | Personalize chapter content |
| `/api/translate` | POST | Translate content to Urdu |
| `/` | GET | Health check |

**Reference**: The spec's `api-contracts.yaml` only defines `/ingest` and `/chat` endpoints, with placeholder schemas for `UserProfile`, `PersonalizationRequest`, and `TranslationRequest` marked as "future phases". The implementation has all these endpoints functional but with different request/response shapes than the spec's schemas.

---

## 5. Ingestion Pipeline

**Specified** (`spec.md:110-114`):
```bash
cd backend
python -m rag.ingest   # uses DocusaurusLoader → splits → upserts into Qdrant
```

**Specified** (`spec.md:123`):
- "FR-014: The backend MUST include an ingestion pipeline (`backend/rag/ingest.py`) to load all MDX content into Qdrant automatically on every push to the `main` or `master` branch without errors."

**Implemented**:
- `backend/rag/gemini_ingest.py` exists but is **entirely commented out**
- `.github/workflows/ingestion.yml` exists as a placeholder but the actual script logic is not connected
- The ingestion pipeline is non-functional

---

## 6. Project Structure Comparison

### 6.1 Specified Structure (`plan.md:67-124`)

```
backend/
├── main.py
├── rag/
│   ├── ingest.py
│   ├── retrieve.py
│   └── chain.py
├── agents/
│   ├── code_agent.py
│   ├── diagram_agent.py
│   └── ros2_helper_agent.py
├── models/
│   └── schemas.py
└── utils/
    └── auth.py

frontend/ (repository root)
├── docs/          # MDX chapters
├── src/
│   ├── components/
│   │   ├── RagChatbot.tsx
│   │   ├── SelectedTextProvider.tsx
│   │   ├── PersonalizeButton.tsx
│   │   ├── TranslateUrduButton.tsx
│   │   └── ChapterHeaderActions.tsx
│   ├── pages/
│   │   └── api/chat.ts
│   └── theme/
│       └── MDXComponents.tsx
```

### 6.2 Implemented Structure

```
backend/
├── app.py              # Main app (spec said main.py)
├── main.py             # Alternative app (placeholder)
├── chain.py            # RAG chain
├── gemini_retrieve.py  # Qdrant retrieval
├── agents/             # Stub routers (not agents)
│   ├── mermaid_diagram_generator.py
│   ├── ros2_code_generator.py
│   └── ros2_doctor.py
├── models/
│   └── schemas.py
└── rag/
    ├── fix_index.py
    ├── gemini_ingest.py    # Commented out
    └── test_retrieval.py

website/                # (spec said frontend/ at root)
├── docs/               # MDX chapters
├── src/
│   ├── components/
│   │   ├── RAGChatbot.tsx
│   │   ├── ChapterProgress.tsx
│   │   └── HomepageFeatures/
│   ├── contexts/       # AuthContext, SelectedTextContext, ChatbotVisibilityContext
│   ├── pages/
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── quiz.tsx
│   ├── theme/
│   │   ├── Root.tsx
│   │   ├── DocItem/
│   │   └── Layout/
│   └── css/
```

**Key Differences**:
- Frontend directory named `website/` instead of `frontend/` at repo root
- `backend/main.py` is a placeholder; actual app is in `backend/app.py`
- Agent files named differently and are stubs, not full agents
- `utils/auth.py` doesn't exist — auth is inline in `app.py`
- No `SelectedTextProvider.tsx` — implemented as `SelectedTextContext.tsx`
- No `PersonalizeButton.tsx` or `TranslateUrduButton.tsx` — buttons are in `DocItem` theme override
- No `api/chat.ts` proxy — frontend calls backend directly via dev proxy
- Additional directories not in spec: `contexts/`, `css/`, `HomepageFeatures/`
- Missing from spec: `ingest.py` (commented out as `gemini_ingest.py`)

---

## 7. Success Criteria Comparison

| Criterion | Specified | Actual | Status |
|---|---|---|---|
| SC-001: 100% chapters deployed on GitHub Pages | Yes | Deployed on Vercel, not all chapters complete | Partial |
| SC-002: 95% RAG accuracy with citations | Yes | Implemented but not measured | Unknown |
| SC-003: 90% selected-text accuracy | Yes | Implemented but not measured | Unknown |
| SC-004: 80% agent skill accuracy | Yes | Agents are stubs | Not met |
| SC-005: 100% signup success via Better-Auth | Yes | Custom auth, not Better-Auth | Deviation |
| SC-006: 90% personalization quality | Yes | Implemented but not measured | Unknown |
| SC-007: 90% Urdu translation quality | Yes | Implemented but not measured | Unknown |
| SC-008: Ingestion pipeline on every push | Yes | **Not implemented** | Not met |

---

## 8. Summary of All Deviations

### 8.1 Major Deviations

1. **Authentication**: Better-Auth replaced with custom JWT (PyJWT + pwdlib)
2. **LLMs**: Claude 3.5 Sonnet planned as primary, not integrated at all; Gemini 2.5 Flash used for everything
3. **Deployment**: GitHub Pages + Render/Fly.io replaced with Vercel for both frontend and backend
4. **Styling**: Tailwind CSS replaced with CSS Modules
5. **Ingestion pipeline**: Spec'd as auto-on-push, currently non-functional (commented out)

### 8.2 Partial Implementations

6. **Data model**: 6 entities specified, 2 implemented (User, Profile); 4 missing (Chapter, ChapterPersonalization, ChapterTranslation, ChatSession)
7. **Agent skills**: 3 agents specified, 3 files exist but all are stubs
8. **Content caching**: Personalization and translation not cached as specified

### 8.3 Minor Deviations

9. **Frontend directory**: Named `website/` instead of `frontend/`
10. **Backend entry point**: `app.py` instead of `main.py`
11. **User ID type**: Integer auto-increment instead of string UUID
12. **Experience types**: Stored as Integer instead of String
13. **User schema**: `google_id`, `created_at`, `updated_at` not implemented
14. **Chat history**: Not persisted (stateless)
15. **OpenAI SDKs**: Not used (spec mentioned "OpenAI Agents/ChatKit SDKs")

### 8.4 Items in Spec But Not Implemented

16. `backend/utils/auth.py` — auth is inline in `app.py`
17. `SelectedTextProvider.tsx` — implemented as context, not provider component
18. `PersonalizeButton.tsx` — buttons embedded in theme override
19. `TranslateUrduButton.tsx` — buttons embedded in theme override
20. `ChapterHeaderActions.tsx` — not a separate component
21. `MDXComponents.tsx` — not implemented as a custom theme component
22. `api/chat.ts` proxy endpoint — frontend calls backend directly
23. Google OAuth (`google_id` attribute) — not implemented
24. Pinecone as alternative vector DB — not evaluated
25. Cohere embeddings — not evaluated
