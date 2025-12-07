---
id: 0003
title: Review and Execute Phase 1 Plan
stage: plan
date: 2025-12-04
surface: agent
model: claude-haiku-4-5-20251101
feature: 001-physical-ai-book
branch: 001-physical-ai-book
user: user
command: /sp.plan
labels: [plan, phase1]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
- D:\book_hackathon\book\history\prompts\001-physical-ai-book\0003-review-and-execute-phase-1-plan.plan.prompt.md
tests:
null
---

## Prompt


# Execution Plan – Physical AI & Humanoid Robotics AI-Native Textbook

## Phase 0 – Repository & Spec-Kit Bootstrap (already completed)
- Docusaurus repo created and deployed on GitHub Pages
- Spec-Kit Plus initialized
- /sp.constitution applied
- /sp.specify applied

## Phase 1 – Core Textbook + Fully Functional RAG Chatbot (100 base points)
1. Generate complete sidebars.js with all modules and correct nesting
2. Generate all textbook chapters (Intro + Modules 1–4 + Hardware Requirements) as MDX v3 files with proper frontmatter, headings, code blocks, Mermaid diagrams and images
3. Create minimal FastAPI backend with:
   - /ingest endpoint (DocusaurusLoader → Qdrant free tier)
   - /chat endpoint (retrieval + citation + selected-text mode)
4. Add GitHub Actions workflow that runs ingestion on every push to main
5. Embed RAG chatbot component on every page (global + selected-text support)
6. Verify selected-text mode works (context = only highlighted fragment + full book fallback)
7. Deploy backend to Railway/Render (free tier) and hard-coded URL

Phase 1 deliverable → Live book + working RAG chatbot with citations and selected-text mode

## Phase 2 – Better-Auth + User Profile Storage (+50 bonus)
8. Integrate Better-Auth (email-password + Google login)
9. Extend signup flow with 5-question background quiz (Python exp, ROS exp, GPU, Jetson, robot access)
10. Store answers in Neon Serverless Postgres (users + profiles table)
11. Protect all personalization endpoints with session authentication

## Phase 3 – Personalize Content Button (+50 bonus)
12. Add “Personalize this chapter” button at top of every chapter
13. On click → fetch user profile → send full chapter text + profile → Gemini-1.5-Pro or GPT-4o → return rewritten chapter
14. Cache personalized version per user/chapter in Postgres
15. Instantly replace page content with personalized version

## Phase 4 – Urdu Translation Button (+50 bonus)
16. Add “اردو میں پڑھیں / Read in Urdu” toggle button on every chapter
17. On click → translate full chapter using Gemini-1.5-Pro (highest Urdu quality)
18. Cache Urdu version per chapter (or per user if personalized)
19. Instantly switch page language

## Phase 5 – Reusable Intelligence via Claude Code Subagents (+50 bonus)
20. Implement three permanent subagents inside backend/agents/:
    - ROS2 Code Generator (generates correct, runnable nodes, launch files, URDFs)
    - Mermaid Diagram Generator (URDF trees, ROS graph, system architecture)
    - ROS2 Doctor (explains errors and fixes launch/YAML/config files)
21. Expose them as tools/skills inside the main RAG chain
22. When user asks for code or diagram → automatically route to correct subagent → return executable result

## Phase 6 – Final Polish & Consistency
23. Add book cover, custom favicon, dark mode, mobile-responsive fixes
24. Add chapter progress tracker and search highlighting
25. Run final ingestion + test all four bonuses on multiple chapters
26. Output final public URLs:
    • GitHub repository
    • Live book (GitHub Pages)
    • Backend API base URL

Start executing Phase 1 right now.
First concrete task: Generate sidebars.js + the first eight MDX chapters (Introduction through Gazebo simulation) + minimal working FastAPI backend skeleton with ingestion and chat endpoints.


## Response snapshot

Confirmed receipt of the execution plan and initiated Phase 1 tasks, focusing on generating Docusaurus sidebars and initial MDX chapters, and setting up a minimal FastAPI backend.

## Outcome

- ✅ Impact: PHR created and plan execution started.
- 🧪 Tests: No tests run yet.
- 📁 Files: Created PHR file.
- 🔁 Next prompts: Proceeding with Phase 1 tasks.
- 🧠 Reflection: Successfully created and populated PHR for the planning phase and initiated the first set of tasks as per the execution plan.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): None
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): None
