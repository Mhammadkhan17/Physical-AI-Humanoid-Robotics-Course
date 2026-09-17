# Task: Full Migration from CSS Modules to Tailwind CSS

## Goal

This Docusaurus 3 site currently mixes Tailwind CSS with custom CSS Modules (`*.module.css`). Migrate it to **Tailwind CSS entirely** — every custom component restyled in Tailwind utility classes, every `*.module.css` file removed, and the build tooling (`docusaurus.config.ts`, `postcss.config.js`, `tsconfig.json`) updated to match a Tailwind-only setup. `sidebars.ts` needs to be audited as part of this and updated if it depends on anything CSS-Modules-specific.

This is a full redesign pass, not a mechanical find-replace — use it as the occasion to fix any "AI-generated" styling debt (inconsistent colors, ad hoc shadows/radii, no real token system) at the same time, via the `tailwind-production-design` skill.

**Do not start writing component code before Phase 2 (Audit) and Phase 3 (Design system) are complete.** This mirrors the project's own skill rules — no code without a plan, and no Tailwind styling without going through the token/`DESIGN.md` process first.

---

## Skills to load, and when

Per this repo's `AGENTS.md`:

| Skill | Load at |
|---|---|
| `brainstorming` | Before Phase 3 (design system decisions) — this is a significant design change, not a bug fix. |
| `writing-plans` | Immediately after Phase 2 (audit), to turn the component inventory into an ordered implementation plan before touching code. |
| `tailwind-production-design` | For all of Phase 3 (token reasoning + `DESIGN.md`) and every component conversion in Phase 5. This is a MUST per the repo's skill rules — no Tailwind class or color decision without it. |
| `frontend-design` | Alongside `tailwind-production-design` during Phase 3/5 for aesthetic direction — they check different things, load both. |
| `web-design-guidelines` | During Phase 5, per component, for accessibility/responsive review before moving to the next component. |
| `vercel-react-best-practices` | During Phase 5 for every component in `website/src/` — this migration touches all of them. |
| `systematic-debugging` | If `yarn build`/`yarn typecheck` breaks at any phase and the cause isn't immediately obvious. |
| `code-review` | Before treating the migration as done, per repo rules. |

---

## Phase 0 — Confirm scope and ask-first items

Per `AGENTS.md`'s "Ask First" list, the following require explicit confirmation before proceeding, even though they're part of this task:
- Any `npm install`/`yarn add` needed for Tailwind, PostCSS, or Autoprefixer if they aren't already present (check `package.json` first — this project is described as *already* a mix, so Tailwind tooling may already be installed).
- Any change to `vercel.json` — only touch it if the build output path or build command actually changes as a result of this migration (it usually won't, but confirm before assuming).

Do not ask about editing `docusaurus.config.ts`, `postcss.config.js`, `tsconfig.json`, `sidebars.ts`, or any component/CSS file — those are the explicit subject of this task.

## Phase 1 — Inventory (report back before changing anything)

Produce a report covering:

1. **Every `*.module.css` file** in `website/src/`, which component imports each one, and roughly what it styles (layout, color, spacing, states like hover/focus).
2. **Current Tailwind setup**: is there a `tailwind.config.js`/`.ts`? What Tailwind version (check `package.json`)? Is Tailwind wired in via a `configurePostCss` plugin function inside `docusaurus.config.ts`, via a root `postcss.config.js`, or both (a conflict if so)? What does `src/css/custom.css` (or equivalent global stylesheet) currently import/contain?
3. **`postcss.config.js` contents** (if it exists) — is it doing anything beyond registering Tailwind + Autoprefixer? Anything else in it needs to be preserved wherever Tailwind ends up being configured.
4. **`tsconfig.json` contents** — specifically: does it reference `@docusaurus/module-type-aliases` or any custom `.d.ts` declaring `*.module.css`? Any path aliases (`baseUrl`/`paths`) currently in use or that would help Tailwind tooling/IDE support?
5. **`sidebars.ts` contents** — does any sidebar item use a `className` pointing at a CSS Modules class, or any custom-rendered sidebar item component that imports a `.module.css` file?
6. **Which components already use Tailwind classes** (so their existing color/spacing choices can inform or get folded into the new token system, rather than treating this as two unrelated palettes to reconcile later).
7. **Which pieces are Docusaurus/Infima-native and out of component-level reach**: admonitions, default code blocks, tabs, pagination, search UI, default navbar/footer (unless already swizzled). List these separately — they get re-themed via Infima CSS variables in Phase 4, not rewritten in Tailwind classes, unless they're already swizzled into `website/src/theme/`.

Do not proceed past this point until the inventory is complete — the plan in Phase 2 depends on knowing the real current state, not an assumed one.

## Phase 2 — Plan

Using `writing-plans`, turn the Phase 1 inventory into an ordered task list. Order matters: theme-level overrides and shared/global styles first (since everything else depends on them), then shared components, then page-level components, then cleanup. Flag any component whose current CSS Module does something Tailwind utilities can't cleanly express (complex keyframe animations, deeply nested selectors) so it can be discussed rather than silently approximated.

## Phase 3 — Design system (via `tailwind-production-design`)

Follow that skill's phases in full:
1. **Understand the project** — this is a developer-tool-adjacent educational platform (docs-heavy, RAG chatbot, auth flows, quizzes) — closer to a "developer tool / docs product" archetype than consumer marketing. Factor in the existing Tailwind-styled components from the Phase 1 inventory as a signal for brand direction (don't invent a new hue if one is already in consistent use).
2. **Research** — glance at other Tailwind-based documentation platforms for calibration (density, code-block treatment, sidebar conventions) if web search is available.
3. **Reason through the full token set** — background, page body, card/panel, navbar, footer, elevated surfaces (inputs, code blocks — this project has real code blocks and a chat UI, so this category matters a lot), borders, text, brand palette, semantic colors, admonition colors. Respect the contrast floor and hue budget from the skill.
4. **Explicit decision to make and record in `DESIGN.md`: how Infima variables map to the new token system.** For every Infima custom property currently in play (`--ifm-color-primary`, `--ifm-background-color`, `--ifm-navbar-background-color`, `--ifm-font-color-base`, etc.), set it to reference the same OKLCH/HSL values as the corresponding Tailwind token, so built-in Docusaurus UI matches the custom components pixel-for-pixel in hue even though it isn't written in Tailwind classes. This mapping is itself a required section of `DESIGN.md` for this project — don't skip it.
5. **Persist `DESIGN.md`** at the project root before any component is touched, including the components list for: `RAGChatbot`, `ChapterProgress`, `HomepageFeatures`, auth pages (login/signup), `quiz`, and the swizzled `Root`/`DocItem`/`Layout` theme overrides.

## Phase 4 — Wire up the build tooling

1. **`docusaurus.config.ts`**: ensure Tailwind is registered via a `configurePostCss` plugin function (create one if it doesn't exist), preserving any existing PostCSS plugins found in Phase 1 rather than dropping them. Add/verify the Tailwind content globs (or, on Tailwind v4, `@source` directives in the CSS entry file) cover `website/src/**/*.{ts,tsx}` **and** `website/docs/**/*.mdx` **and** `docs/**/*.mdx` (the legacy content directory) — MDX files use Tailwind classes too and are easy to miss.
2. **`postcss.config.js`**: if Tailwind ends up registered through `docusaurus.config.ts`'s `configurePostCss` hook (the standard, conflict-free approach for Docusaurus), **delete this file** rather than trying to maintain a parallel, likely-unused or conflicting PostCSS pipeline — but only after confirming in Phase 1 that nothing else in it needs to survive. If for some reason the project's Docusaurus version or setup actually requires the root-level file (verify, don't assume), update its contents to the current Tailwind version's PostCSS plugin (`tailwindcss` + `autoprefixer` for v3, `@tailwindcss/postcss` alone for v4) instead of deleting it.
3. **`tsconfig.json`**: remove any now-dead `*.module.css` type declarations or references once every CSS Module file is deleted (Phase 6) — but don't remove `@docusaurus/module-type-aliases` itself if Docusaurus's own generated types depend on it for non-CSS reasons (verify before removing). Add a `baseUrl`/`paths` alias (e.g. `"@/*": ["./src/*"]`) only if it's not already there and would meaningfully clean up imports — this is a nice-to-have, not required for Tailwind to function.
4. **`sidebars.ts`**: if Phase 1 found CSS-Modules-dependent classnames or components here, replace them with either a Tailwind-classed custom sidebar item component (colocated in `src/theme/`) or a global class defined in the Tailwind entry stylesheet — `sidebars.ts` itself can't import a `.module.css` file, so whatever is there today is either already a global class or an import that needs to be traced to its source component.
5. Run `yarn typecheck` after this phase, before touching any component, to confirm the tooling change alone didn't break anything.

## Phase 5 — Convert components (in the Phase 2 order)

For each component:
1. Load `tailwind-production-design` (if not already active) + `frontend-design`.
2. Replace the `*.module.css` import and its class references with Tailwind utility classes, using only tokens defined in `DESIGN.md` — no new one-off colors, radii, or shadows invented mid-component (per that skill's rules).
3. Preserve all existing behavior, props, and DOM structure unless the CSS Module was doing something structurally that Tailwind requires a markup change for (e.g. a `:has()`-dependent layout) — flag those cases rather than silently restructuring.
4. Run `web-design-guidelines` and `vercel-react-best-practices` checks on the converted component before moving to the next one.
5. Delete the component's `*.module.css` file only once its replacement is verified working (don't batch-delete all CSS Module files upfront — see Phase 6 for the final sweep in case anything was missed).

## Phase 6 — Cleanup and verification

1. Search the repo for any remaining `*.module.css` file or `.module.css` import; there should be none. Delete anything left over.
2. Confirm no component still imports from a deleted CSS Module (this would be a build break, not a silent failure, so `yarn build` will catch it).
3. Run `yarn typecheck` and `yarn build` in `website/`. If either fails, load `systematic-debugging` before attempting a fix.
4. Re-check `.gitignore` — do NOT modify it without asking first (per `AGENTS.md`), even if you notice something like a now-unneeded CSS Modules-related ignore pattern; just flag it.
5. Load `code-review` and review the full diff for: stray hardcoded colors that bypass `DESIGN.md` tokens, any component that didn't get the accessibility pass, and consistency between Infima-variable-themed built-ins and Tailwind-themed custom components (spot-check a docs page next to a custom page like the homepage or quiz).
6. Do not run `deploy-to-vercel` or any deployment command as part of this task unless explicitly asked — this task ends at a verified local build.

## Deliverables at the end

- Updated `docusaurus.config.ts`, `tsconfig.json`, `sidebars.ts`, and either an updated or removed `postcss.config.js`, each with a one-line rationale for what changed and why (especially the postcss.config.js decision).
- A committed `DESIGN.md` at the project root, including the Infima-variable mapping table.
- Zero remaining `*.module.css` files.
- A passing `yarn typecheck` and `yarn build`.
- A short summary of any component that couldn't be cleanly converted 1:1 and what was done instead.