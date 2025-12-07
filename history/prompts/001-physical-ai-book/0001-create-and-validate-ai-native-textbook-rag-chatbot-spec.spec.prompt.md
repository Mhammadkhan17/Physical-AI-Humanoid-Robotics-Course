---
id: 0001
title: Create and validate AI-Native Textbook & RAG Chatbot spec
stage: spec
date: 2025-12-04
surface: agent
model: claude-haiku-4-5-20251001
feature: 001-physical-ai-book
branch: master
user: unknown
command: /sp.specify
labels: ["spec", "feature-development", "validation"]
links:
  spec: specs/001-physical-ai-book/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-physical-ai-book/spec.md
  - specs/001-physical-ai-book/checklists/requirements.md
tests:
  - none
---

## Prompt

# Full Project Specification Tree – Physical AI & Humanoid Robotics AI-Native Textbook

## 1. Repository Structure (Docusaurus + Custom Backend)

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
│   │   └── 04-unity-digital-twin.mdx
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
├── backend/                      # FastAPI RAG service (separate folder, deployed anywhere)
│   ├── main.py
│   ├── rag/
│   │   ├── ingest.py            # Loads all MDX → Qdrant
│   │   ├── retrieve.py
│   │   └── chain.py
│   ├── agents/
│   │   ├── code_agent.py        # Claude Code Subagent skill
│   │   ├── diagram_agent.py
│   │   └── ros2_helper_agent.py
│   ├── models/
│   │   └── schemas.py
│   └── utils/
│       └── auth.py
├── static/
│   └── og-image.jpg
├── docusaurus.config.js
├── sidebars.js
├── package.json
└── .specify/
    # Spec-Kit Plus memory (do not touch)

## 2. Core Features & Acceptance Criteria

### 2.1 Base Requirements (100 points)
- [ ] Full textbook written in MDX covering all 4 modules + hardware section
- [ ] Book deployed and publicly accessible on GitHub Pages
- [ ] RAG chatbot embedded on every page
- [ ] Chatbot answers using only book content + citations
- [ ] Selected-text mode: user highlights text → “Ask about this” → answer uses only that fragment + full context

### 2.2 Bonus 1 – Reusable Intelligence via Claude Code Subagents (+50 pts)
- [ ] Code Generation Agent Skill (user asks “write a ROS2 publisher” → working code)
- [ ] Diagram Agent Skill (user asks “draw URDF tree” → Mermaid diagram)
- [ ] ROS2 Helper Agent (explains errors, fixes launch files, etc.)

### 2.3 Bonus 2 – Better-Auth Signup/Signin with Background Quiz (+50 pts)
- [ ] Better-Auth fully integrated
- [ ] At signup → multi-step form asking:
   - Years of Python experience
   - ROS1/ROS2 experience level
   - GPU available (RTX 30xx/40xx?)
   - Access to Jetson / physical robot?
- [ ] Answers saved in Neon Postgres (users table)

### 2.4 Bonus 3 – Personalize Content Button (+50 pts)
- [ ] Button “Personalize this chapter” at top of every chapter
- [ ] On click → LLM rewrites entire chapter according to user background:
   - Beginner → more explanations, analogies
   - Expert + RTX + Jetson → deeper Isaac ROS & sim-to-real details
   - No GPU → cloud alternatives emphasized

### 2.5 Bonus 4 – Translate to Urdu Button (+50 pts)
- [ ] Button “اردو میں پڑھیں / Read in Urdu” at top of every chapter
- [ ] On click → entire chapter content translated via Gemini-1.5-Pro or GPT-4o and cached

## 3. Tech Stack (locked – exactly as required by hackathon)
- Frontend: Docusaurus 3 + MDX v3 + Tailwind
- RAG Backend: FastAPI + LangChain + Qdrant Cloud (free tier)
- Embeddings: GoogleGenerativeAIEmbeddings (free) or text-embedding-3-large
- LLM for answers: Claude 3.5 Sonnet (primary) → fallback GPT-4o-mini
- LLM for personalization & Urdu: Gemini-1.5-Pro (best Urdu support) or GPT-4o
- Database: Neon Serverless Postgres
- Auth: Better-Auth (https://www.better-auth.com)
- Deployment: GitHub Pages (frontend) + Render / Fly.io / Railway (backend)

## 4. Ingestion Pipeline (must run automatically on push)
```bash
cd backend
python -m rag.ingest   # uses DocusaurusLoader → splits → upserts into Qdrant
```

## Response snapshot

The AI-Native Textbook & RAG Chatbot specification has been created and validated against quality criteria. It includes user stories, functional requirements, key entities, and measurable success criteria.

## Outcome

- ✅ Impact: The project now has a comprehensive specification document for the AI-Native Textbook and RAG Chatbot system, including core features and bonus functionalities.
- 🧪 Tests: No automated tests were run as part of spec creation, but a quality checklist was used for validation.
- 📁 Files: Modified `specs/001-physical-ai-book/spec.md` and `specs/001-physical-ai-book/checklists/requirements.md`.
- 🔁 Next prompts: The next step is to proceed with implementation planning using the `/sp.plan` command.
- 🧠 Reflection: The initial failure to create the PHR due to an incorrect feature name highlights the importance of precise parameter handling and validation in scripting.

## Evaluation notes (flywheel)

- Failure modes observed: The `create-phr.sh` script failed with "Error: Feature directory not found: D:/book_hackathon/book/specs/physical-ai-book" because the `--feature` argument provided was `physical-ai-book` instead of `001-physical-ai-book`.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Modify `create-phr.sh` or the calling agent to automatically infer the correct feature slug from the current branch name or a broader search in the `specs/` directory to prevent similar errors.
