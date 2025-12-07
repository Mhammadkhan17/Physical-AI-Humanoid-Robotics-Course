# Feature Specification: AI-Native Textbook & RAG Chatbot

**Feature Branch**: `001-physical-ai-book`
**Created**: 2025-12-04
**Status**: Draft
**Input**: User description: "# Full Project Specification Tree – Physical AI & Humanoid Robotics AI-Native Textbook

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
```"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Base Textbook & RAG Chatbot (Priority: P1)

Users can access the AI-Native textbook, navigate its modules, and interact with an embedded RAG chatbot to get answers based on the textbook content, including a selected-text mode for focused queries.

**Why this priority**: This forms the core educational offering and primary user value of the project. Without it, other features lack context.

**Independent Test**: Can be fully tested by a user accessing the deployed textbook on GitHub Pages, navigating chapters, and successfully receiving cited answers from the RAG chatbot for general and selected-text queries.

**Acceptance Scenarios**:

1.  **Given** the user navigates to the textbook, **When** they select any chapter, **Then** the chapter content is displayed correctly in MDX format.
2.  **Given** the textbook is deployed, **When** a user accesses the GitHub Pages URL, **Then** the book loads publicly and is accessible.
3.  **Given** a user is viewing any chapter, **When** they type a question into the RAG chatbot, **Then** the chatbot provides an answer using only content from the book, accompanied by citations.
4.  **Given** a user highlights text within a chapter, **When** they click "Ask about this", **Then** the chatbot answers the question using only the highlighted text for context, plus the full textbook content, providing citations.

---

### User Story 2 - Reusable Intelligence (Priority: P2)

Users can leverage specialized AI subagents (Code Generation, Diagram Generation, ROS2 Helper) through the RAG chatbot for advanced queries related to code, diagrams, and ROS2 development.

**Why this priority**: Adds significant advanced functionality and enhances the learning experience for technical users, providing immediate utility beyond basic Q&A.

**Independent Test**: Can be fully tested by prompting the RAG chatbot with specific requests (e.g., "write a ROS2 publisher", "draw URDF tree", "explain this ROS2 error") and verifying the agent skill delivers accurate, working code, correct diagrams, or helpful ROS2 assistance.

**Acceptance Scenarios**:

1.  **Given** a user asks "write a ROS2 publisher", **When** the Code Generation Agent is invoked, **Then** the chatbot provides working ROS2 publisher code.
2.  **Given** a user asks "draw URDF tree for a human arm", **When** the Diagram Agent is invoked, **Then** the chatbot provides a correct Mermaid diagram representing the URDF tree.
3.  **Given** a user presents a ROS2 error message, **When** the ROS2 Helper Agent is invoked, **Then** the chatbot explains the error and suggests potential fixes or debugging steps.

---

### User Story 3 - Better-Auth Signup/Signin with Background Quiz (Priority: P2)

Users can securely register and sign in to the platform via Better-Auth, completing a background quiz during signup to provide information for personalized content.

**Why this priority**: Enables critical personalization and advanced features, laying the groundwork for a more tailored learning experience.

**Independent Test**: Can be fully tested by a new user completing the signup process, including the multi-step background quiz, successfully logging in, and verifying their quiz answers are correctly stored in the Neon Postgres database.

**Acceptance Scenarios**:

1.  **Given** a new user attempts to sign up, **When** they go through the registration process, **Then** Better-Auth is fully integrated and handles user authentication securely.
2.  **Given** a new user is signing up, **When** they reach the multi-step form, **Then** they are prompted to answer questions about their Python experience, ROS experience, GPU availability, and access to physical robots.
3.  **Given** a user completes the signup quiz, **When** their answers are submitted, **Then** their background information is saved in Neon Postgres.

---

### User Story 4 - Personalize Content Button (Priority: P3)

Users can click a "Personalize this chapter" button to dynamically rewrite the entire chapter content based on their stored background quiz results.

**Why this priority**: Enhances the user experience by making content more relevant, but is dependent on user authentication and background data being available.

**Independent Test**: Can be fully tested by a logged-in user with a completed background profile clicking the "Personalize this chapter" button and observing the chapter content being rewritten according to their profile (e.g., beginner sees more analogies, expert sees deeper technical details).

**Acceptance Scenarios**:

1.  **Given** a logged-in user is viewing a chapter, **When** they click "Personalize this chapter", **Then** the LLM rewrites the entire chapter content according to the user's background profile.
2.  **Given** a beginner user personalizes a chapter, **When** the content is rewritten, **Then** it includes more explanations and analogies relevant to beginners.
3.  **Given** an expert user with an RTX GPU and Jetson access personalizes a chapter, **When** the content is rewritten, **Then** it includes deeper Isaac ROS and sim-to-real details.
4.  **Given** a user without a GPU personalizes a chapter, **When** the content is rewritten, **Then** it emphasizes cloud alternatives for hardware.

---

### User Story 5 - Translate to Urdu Button (Priority: P3)

Users can click a "اردو میں پڑھیں / Read in Urdu" button to translate the entire chapter content into Urdu.

**Why this priority**: Provides valuable localization, but is a secondary feature that can be added after the core textbook and personalization are functional.

**Independent Test**: Can be fully tested by a user clicking the "اردو میں پڑھیں / Read in Urdu" button on any chapter and verifying that the entire chapter content is accurately translated into Urdu and that the translation is cached for subsequent views.

**Acceptance Scenarios**:

1.  **Given** a user is viewing a chapter, **When** they click "اردو میں پڑھیں / Read in Urdu", **Then** the entire chapter content is translated via Gemini-1.5-Pro or GPT-4o into Urdu.
2.  **Given** a chapter has been translated to Urdu, **When** the user revisits the chapter, **Then** the cached Urdu translation is displayed instantly.

## Edge Cases

- What happens if the RAG service (backend) is unavailable or returns an error?
- How does the system handle very long user queries in the chatbot, or very long chapters for personalization/translation?
- What if a user tries to personalize or translate content without a complete background profile or an active internet connection?
- What if the LLM fails to translate or personalize content accurately or within an acceptable timeframe?
- How does the system handle concurrent personalization/translation requests for the same user/chapter?
- What are the fallback mechanisms if primary LLMs (Claude 3.5 Sonnet, Gemini-1.5-Pro) are unavailable?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an MDX-based AI-Native textbook covering Physical AI & Humanoid Robotics.
- **FR-002**: System MUST be deployable and publicly accessible on GitHub Pages.
- **FR-003**: System MUST embed a RAG chatbot on every textbook page.
- **FR-004**: RAG Chatbot MUST answer user queries using only the textbook content and provide verifiable citations.
- **FR-005**: RAG Chatbot MUST support a "selected-text" mode where answers are contextualized by highlighted text fragments.
- **FR-006**: System MUST integrate Claude Code Subagents (Code Generation, Diagram Generation, ROS2 Helper) accessible via the RAG chatbot.
- **FR-007**: System MUST integrate Better-Auth for user registration and login.
- **FR-008**: User signup MUST include a multi-step background quiz to collect user expertise and hardware access details.
- **FR-009**: User background quiz answers MUST be persistently stored in Neon Serverless Postgres.
- **FR-010**: System MUST provide a "Personalize this chapter" button on every chapter page.
- **FR-011**: Personalization MUST dynamically rewrite chapter content based on the user's stored background profile using an LLM (Gemini-1.5-Pro or GPT-4o).
- **FR-012**: System MUST provide an "اردو میں پڑھیں / Read in Urdu" button on every chapter page.
- **FR-013**: Translation MUST translate entire chapter content to Urdu using an LLM (Gemini-1.5-Pro or GPT-4o) and cache the translated content.
- **FR-014**: The backend MUST include an ingestion pipeline (`backend/rag/ingest.py`) to load all MDX content into Qdrant automatically on every push to the `main` or `master` branch without errors.

### Key Entities *(include if feature involves data)*

-   **User**: Represents a student interacting with the textbook and chatbot. Attributes include authentication details, Python experience, ROS experience, GPU availability, and access to physical robots (stored in Neon Postgres).
-   **Chapter**: Represents an individual textbook chapter. Attributes include original MDX content, personalized versions (per user), and translated versions (e.g., Urdu) (managed by Docusaurus frontend and RAG backend).
-   **Chat Session**: Stores the ongoing conversation history between a user and the RAG chatbot (managed by RAG Service API and potentially persisted in Data Store).
-   **Content Embedding**: Vectorized representation of textbook content used for RAG (stored in Qdrant).

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: 100% of all MDX textbook chapters (including all 4 modules and hardware section) are successfully deployed and rendered correctly on GitHub Pages within acceptable load times.
-   **SC-002**: At least 95% of RAG chatbot responses provide accurate, relevant answers directly derived from the textbook content, with clearly identified citations.
-   **SC-003**: The "selected-text" chatbot mode correctly identifies context and generates relevant answers for 90% of user queries without hallucinating.
-   **SC-004**: The Code Generation, Diagram, and ROS2 Helper Agent Skills (Bonus 1) generate functional code, accurate diagrams, and helpful ROS2 advice for 80% of relevant user prompts.
-   **SC-005**: User signup via Better-Auth, including the multi-step background quiz, is completed successfully by 100% of users attempting to register.
-   **SC-006**: The "Personalize this chapter" feature (Bonus 3) successfully rewrites 90% of chapter content according to the user's background, leading to a measurable improvement in user engagement or learning outcomes (e.g., higher completion rates, positive user feedback).
-   **SC-007**: The "Translate to Urdu" feature (Bonus 4) accurately translates 90% of chapter content into grammatically correct and contextually appropriate Urdu.
-   **SC-008**: The ingestion pipeline (`backend/rag/ingest.py`) successfully processes and upserts 100% of MDX content into Qdrant upon every push to the `main` or `master` branch without errors.
