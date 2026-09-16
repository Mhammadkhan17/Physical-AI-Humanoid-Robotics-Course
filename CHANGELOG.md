# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed

- **Backend startup crash**: `langchain-google-genai==0.0.1` was importing `langchain_core.pydantic_v1`, removed in `langchain-core>=1.0`. Upgraded to `4.4.0`.
- **Version pinning conflict**: `langchain-core==1.1.1` pinned in `requirements.txt` was incompatible with unpinned `langchain-google-genai`. Removed all version pins to let pip resolve compatible versions together.
- **Tailwind CSS v4 setup**: Replaced v3 `@tailwind` directives with v4 `@import "tailwindcss"` syntax. Removed obsolete `tailwind.config.js` (v4 uses CSS-based config). Tailwind now generates utility classes correctly.
- **Chakra UI CSS reset conflict**: Removed `@chakra-ui/react` and `@emotion/react` — Chakra's `@layer reset` was overriding Tailwind utilities. Replaced Chakra `Button` components with Tailwind-styled `<button>` elements.

### Changed

- **Password hashing**: Replaced unmaintained `passlib` (last release: Oct 2020, broken on Python 3.13+) with actively maintained `pwdlib[argon2]`. Updated `app.py` and `app.txt` to use `PasswordHash.recommended()` instead of `CryptContext`.
- **JWT library**: Replaced `python-jose[cryptography]` (known CVEs: CVE-2024-33663, CVE-2025-61152) with `PyJWT[crypto]`. Updated imports from `jose.JWTError` to `jwt.exceptions.InvalidTokenError`.
- **Dependency cleanup**: Removed redundant `argon2-cffi` (now included in `pwdlib[argon2]`). Fixed `langchain_openai` → `langchain-openai` (underscore to hyphen for consistency).
- **Backend auth removal**: Removed all JWT/password/auth code from `app.py` — removed imports, env vars, setup, DBUser model, Pydantic models, helper functions, auth endpoints, auth dependencies from protected endpoints. All API endpoints are now public.
- **Frontend auth removal**: Deleted `AuthContext.tsx`, `login.tsx`, `signup.tsx`. Removed `AuthProvider` from `Root.tsx`. Removed all `useAuth`/`isAuthenticated`/`token` references from components. Chatbot always visible. Personalize/translate buttons always shown. Quiz uses default `user_id`.
- **Custom CSS cleanup**: Stripped `custom.css` to 22 lines — Tailwind directives, Google Fonts imports, and Infima color overrides only. Removed all custom utility classes (`chatbot-spinner`, `urdu-translation-content`, `button:focus-visible`).
- **Homepage redesign**: Complete redesign with dark gradient hero, feature cards (RAG, Personalize, Translate), 2x2 module grid, green CTA banner. Removed HomepageFeatures component (modules inline in index.tsx).
- **Navbar logo removed**: Removed SVG logo from navbar config — text title only.
- **Homepage copy refined**: Removed unnecessary badge label, subtitle paragraphs, and arrow icon per frontend-design skill guidance.

### Added

- **AGENTS.md**: Project instructions file for AI coding agents. Includes project overview, commands, project layout, safety rules (Always/Ask/Never tiers), code conventions, and skills usage reference for all 13 installed skills.
- **Skills installation**: Installed 13 agent skills — `brainstorming`, `writing-plans`, `vercel-react-best-practices`, `frontend-design`, `web-design-guidelines`, `fastapi`, `langchain-rag`, `systematic-debugging`, `code-review`, `improve-codebase-architecture`, `deploy-to-vercel`, `find-skills`, `docx`.
- **Tailwind CSS v4**: Installed `tailwindcss@4.3.3` and `@tailwindcss/postcss` for utility-first styling.
- **PostCSS config**: Created `postcss.config.js` with `@tailwindcss/postcss` plugin.

### Removed

- **Chakra UI**: Removed `@chakra-ui/react` and `@emotion/react` packages. No longer needed — all components use Tailwind.
- **Auth UI pages**: Deleted `login.tsx` and `signup.tsx`.
- **CSS modules**: Deleted `HomepageFeatures/styles.module.css`, `RAGChatbot.module.css`, `index.module.css`. All styles now use Tailwind utilities.
- **Auth context**: Deleted `AuthContext.tsx`. No authentication in the app.

## [0.1.0] - 2026-09-16

### Initial Release

- Docusaurus 3 frontend with RAG chatbot, content personalization, Urdu translation
- FastAPI backend with LangChain + Qdrant + Google Gemini RAG pipeline
- JWT authentication with user profiles and quiz system
- Vercel deployment (frontend static + backend serverless)
