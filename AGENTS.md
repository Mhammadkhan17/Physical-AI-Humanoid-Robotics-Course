# AGENTS.md — Physical AI & Humanoid Robotics AI-Native Textbook

## Project Overview

Full-stack AI-native educational platform combining a Docusaurus 3 frontend with a Python FastAPI backend. Features a RAG chatbot (LangChain + Qdrant + Google Gemini), JWT authentication, content personalization, and Urdu translation. Deployed on Vercel.

## Commands

```bash
# Frontend (website/)
cd website && yarn install          # Install dependencies
cd website && yarn start            # Dev server (port 3000, proxies /api to localhost:8000)
cd website && yarn build            # Production build
cd website && yarn typecheck        # TypeScript type checking

# Backend (backend/)
pip install -r backend/requirements.txt   # Install Python deps
cd backend && uvicorn app:app --reload   # Dev server (port 8000)

# Deployment
npx vercel --prod                    # Deploy to production (requires Vercel auth)
```

## Project Layout

```
├── website/              # Docusaurus 3 frontend (React 19, TypeScript)
│   ├── src/components/   # RAGChatbot, ChapterProgress, HomepageFeatures
│   ├── src/contexts/     # AuthContext, SelectedTextContext, ChatbotVisibilityContext
│   ├── src/pages/        # index, login, signup, quiz
│   ├── src/theme/        # Root, DocItem, Layout overrides
│   └── docs/             # Course MDX content (modules 1-4)
├── backend/              # Python FastAPI API
│   ├── app.py            # Main Vercel-deployed app (auth, RAG, personalize, translate)
│   ├── chain.py          # LangChain RAG chain (Gemini + Qdrant)
│   ├── gemini_retrieve.py # Qdrant vector store retrieval
│   ├── agents/           # AI agent routers (diagram gen, ROS2 code gen, ROS2 doctor)
│   ├── models/schemas.py # Pydantic request/response schemas
│   └── rag/              # Ingestion and retrieval utilities
├── specs/                # Feature specs and API contracts
├── docs/                 # Original course content (legacy)
└── vercel.json           # Vercel deployment config (frontend + backend)
```

## Safety Rules

### Always Do
- Read files and explore codebase freely
- Run `yarn typecheck` in `website/` after TypeScript changes
- Run `yarn build` in `website/` to verify frontend builds
- Use virtual environment for Python dependencies
- Commit with conventional format: `type(scope): description`

### Ask First
- Run any `pip install` or `npm install` for new dependencies
- Modify database schema or migration files
- Change API contracts (`specs/001-physical-ai-book/contracts/api-contracts.yaml`)
- Modify `vercel.json` deployment configuration
- Change authentication flow or JWT handling
- Run destructive git commands (`git reset`, `git rebase`, `git push --force`)

### Never Do
- Read or display `.env` files (contain API keys, database URLs, secrets)
- Commit secrets, API keys, or credentials to git
- Run `rm -rf` on project directories
- Modify `.gitignore` without asking
- Delete or overwrite existing course content in `website/docs/` without confirmation
- Bypass authentication checks in backend code

## Code Conventions

### Frontend (TypeScript/React)
- React 19 with functional components and hooks
- Docusaurus 3 patterns for page/layout/theme overrides
- CSS Modules for component styling (`*.module.css`)
- `clsx` for conditional classnames
- `react-markdown` + `remark-gfm` for markdown rendering in chatbot

### Backend (Python)
- FastAPI with Pydantic models for request/response schemas
- Sync functions (`def`) by default; async only when truly needed
- `Annotated` style for dependency injection
- LangChain for RAG pipeline orchestration
- SQLAlchemy ORM for database models
- One HTTP operation per route function

### General
- Prefer editing existing files over creating new ones
- No comments unless explicitly requested
- Follow existing code patterns in neighboring files
- Keep changes minimal and focused

## Installed Skills

Load these skills BEFORE working on the corresponding task. Use the `skill` tool to inject them.

| Skill | Source | When to Load |
|-------|--------|-------------|
| `brainstorming` | obra/superpowers | Before ANY new feature, component, or behavior change. Explores intent and design before code. |
| `writing-plans` | obra/superpowers | Before multi-step implementation tasks. Creates detailed plans with file structure and TDD cycles. |
| `vercel-react-best-practices` | vercel-labs/agent-skills | When writing, reviewing, or refactoring React components. Covers perf, bundle size, re-renders. |
| `frontend-design` | anthropics/skills | When building new UI or reshaping existing design. Provides aesthetic direction and typography guidance. |
| `tailwind-production-design` | custom (project-local) | When writing or restyling any Tailwind CSS UI — color tokens, dark mode, a design-system pass, or a `DESIGN.md`. Forces a research-first process (understand → research → reason through color tokens → persist as `DESIGN.md` → implement) to avoid generic "AI-generated" styling. Only applies to Tailwind-based surfaces; the Docusaurus site's CSS Modules components are out of scope unless the project migrates a surface to Tailwind. |
| `web-design-guidelines` | vercel-labs/agent-skills | When reviewing UI for accessibility, responsive design, and UX best practices. |
| `fastapi` | fastapi/fastapi | When working with FastAPI routes, Pydantic models, dependencies, or SSE streaming. |
| `langchain-rag` | langchain-ai/langchain-skills | When modifying the RAG pipeline — document loading, splitting, embeddings, vector store, or retrieval. |
| `systematic-debugging` | obra/superpowers | When encountering ANY bug, test failure, or unexpected behavior. Root cause before fixes. |
| `code-review` | mattpocock/skills | When reviewing branches, PRs, or work-in-progress changes for standards and spec compliance. |
| `improve-codebase-architecture` | mattpocock/skills | When looking to refactor, identify shallow modules, or improve architectural patterns. |
| `deploy-to-vercel` | vercel-labs/agent-skills | When deploying the app. Gathers project state and handles Vercel CLI authentication. |
| `find-skills` | vercel-labs/skills | When looking for new skills or extending agent capabilities. Searches skills.sh ecosystem. |
| `docx` | anthropics/skills | When creating, reading, or editing Word documents (.docx) or templates (.dotx). |

### Skill Usage Rules

1. **brainstorming** and **writing-plans** MUST be loaded before starting any new feature or significant change. No code without design approval.
2. **systematic-debugging** MUST be loaded before proposing any fix. No fixes without root cause investigation.
3. **vercel-react-best-practices** SHOULD be loaded when touching any React component in `website/src/`.
4. **tailwind-production-design** MUST be loaded before writing or editing any Tailwind class or Tailwind color/token config — no ad hoc utility classes or invented colors without going through its token-reasoning and `DESIGN.md` steps first. Load alongside `frontend-design` (aesthetic direction) and `web-design-guidelines` (accessibility/responsive review) rather than instead of them — they check different things.
5. **fastapi** SHOULD be loaded when touching any route or model in `backend/`.
6. **langchain-rag** SHOULD be loaded when modifying `backend/chain.py`, `backend/gemini_retrieve.py`, or `backend/rag/`.
7. **code-review** SHOULD be loaded before finalizing changes or creating PRs.
8. **deploy-to-vercel** MUST be loaded before running any deployment commands.

## Environment Variables (Required, Never Log These)

Backend requires these at runtime (configured in Vercel, not in repo):
- `DATABASE_URL` — Neon PostgreSQL connection string
- `GEMINI_API_KEY` — Google Gemini API key
- `QDRANT_HOST` — Qdrant Cloud cluster URL
- `QDRANT_API_KEY` — Qdrant Cloud API key
- `SECRET_KEY` — JWT signing secret

Frontend dev proxy forwards `/api` to `http://127.0.0.1:8000` automatically.