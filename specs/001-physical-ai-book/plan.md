# Implementation Plan: AI-Native Textbook & RAG Chatbot

**Branch**: `001-physical-ai-book` | **Date**: 2025-12-04 | **Spec**: ./spec.md
**Input**: Feature specification from `/specs/001-physical-ai-book/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Full textbook written in MDX covering all 4 modules + hardware section. Book deployed and publicly accessible on GitHub Pages. RAG chatbot embedded on every page. Chatbot answers using only book content + citations. Selected-text mode: user highlights text → “Ask about this” → answer uses only that fragment + full context.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Python 3.11 (Backend), JavaScript/TypeScript (Frontend - Docusaurus 3, MDX v3)
**Primary Dependencies**: FastAPI, LangChain, Qdrant Cloud, GoogleGenerativeAIEmbeddings, Claude 3.5 Sonnet, Gemini-1.5-Pro, GPT-4o, Neon Serverless Postgres, Better-Auth, React, Tailwind CSS
**Storage**: Qdrant Cloud (vector database), Neon Serverless Postgres (user and session data)
**Testing**: NEEDS CLARIFICATION (No specific frameworks mentioned, only "Independent Test" scenarios)
**Target Platform**: GitHub Pages (Frontend), Render / Fly.io / Railway (Backend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**:
- SC-001: 100% of all MDX textbook chapters successfully deployed and rendered correctly on GitHub Pages within acceptable load times.
- SC-002: At least 95% of RAG chatbot responses provide accurate, relevant answers directly derived from the textbook content, with clearly identified citations.
- SC-003: The "selected-text" chatbot mode correctly identifies context and generates relevant answers for 90% of user queries without hallucinating.
- SC-006: The "Personalize this chapter" feature successfully rewrites 90% of chapter content according to the user's background.
- SC-007: The "Translate to Urdu" feature accurately translates 90% of chapter content into grammatically correct and contextually appropriate Urdu.
**Constraints**: Qdrant Cloud (free tier), Railway/Render (free tier), GitHub Pages (frontend deployment)
**Scale/Scope**: Full AI-Native Textbook covering Physical AI & Humanoid Robotics (4 modules + hardware), RAG Chatbot with selected-text mode, Better-Auth with background quiz, Personalization, Urdu Translation, Claude Code Subagents (Code Generation, Diagram Generation, ROS2 Helper)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Primary Goal**: Ensure plan aligns with developing a Docusaurus-based AI-Native Textbook for 'Physical AI & Humanoid Robotics' integrated with a robust RAG Chatbot for interactive learning.
- **Deployment Target**: Confirm plan is suitable for GitHub Pages deployment.
- **Primary Language For Code**: Adhere to JavaScript/TypeScript (Frontend) and Python (Backend) for new code.
- **Primary Language For Content**: Content creation and localization efforts must align with English (with Urdu Localization Bonus).
- **Spec Kit Role**: Ensure plan clearly defines project structure, technology stacks, and component interactions as per Spec Kit.

## Project Structure

### Documentation (this feature)

```text
specs/001-physical-ai-book/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/                      # FastAPI RAG service (separate folder, deployed anywhere)
├── main.py
├── rag/
│   ├── ingest.py            # Loads all MDX → Qdrant
│   ├── retrieve.py
│   └── chain.py
├── agents/
│   ├── code_agent.py        # Claude Code Subagent skill
│   ├── diagram_agent.py
│   └── ros2_helper_agent.py
├── models/
│   └── schemas.py
└── utils/
    └── auth.py

frontend/ (repository root)
├── docs/                          # All textbook chapters (MDX)
│   ├── intro.md
│   ├── module-01-ros2/
│   │   ├── 01-ros2-concepts.mdx
│   │   ├── 02-nodes-topics-services.mdx
│   │   ├── 03-urdf-humanoids.mdx
│   │   └── 04-python-rclpy-bridge.mdx
│   ├── module-02-simulation/
│   │   ├── 01-gazebo-fundamentals.mdx
│   │   ├── 02-urdf-vs-sdf.mdx
│   │   ├── 03-sensor-simulation.mdx
│   │   ├── 04-unity-digital-twin.mdx
│   ├── module-03-isaac/
│   │   ├── 01-isaac-sim-overview.mdx
│   │   ├── 02-synthetic-data-generation.mdx
│   │   ├── 03-isaac-ros-vslam.mdx
│   │   └── 04-nav2-bipedal.mdx
│   ├── module-04-vla/
│   │   ├── 01-whisper-voice-to-action.mdx
│   │   ├── 02-llm-task-planning.mdx
│   │   ├── 03-vision-language-action.mdx
│   │   └── 04-capstone-autonomous-humanoid.mdx
│   └── hardware-requirements.mdx
├── src/
│   ├── components/
│   │   ├── RagChatbot.tsx
│   │   ├── SelectedTextProvider.tsx
│   │   ├── PersonalizeButton.tsx
│   │   ├── TranslateUrduButton.tsx
│   │   └── ChapterHeaderActions.tsx
│   ├── pages/
│   │   └── api/chat.ts          # Proxy endpoint (optional, for Vercel/GitHub Pages safety)
│   └── theme/
│       └── MDXComponents.tsx
├── static/
│   └── og-image.jpg
├── docusaurus.config.js
├── sidebars.js
├── package.json
└── .specify/
```

**Structure Decision**: The project will follow a web application structure with a dedicated `backend/` for the FastAPI RAG service and a `frontend/` (repository root) for the Docusaurus application. The Docusaurus `docs/` directory will house all MDX content.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
