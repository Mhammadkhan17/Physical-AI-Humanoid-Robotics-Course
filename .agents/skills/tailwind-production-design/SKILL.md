---
name: tailwind-production-design
description: Use this skill for ANY Tailwind CSS UI work — building a new interface, restyling an existing one, setting up a design system/color tokens, creating or updating a DESIGN.md/design-spec file, or when the user says the UI "looks AI-generated," "looks like a template," "looks generic," or asks to make something "look production-grade," "look real," or "look like a real product." Also trigger on requests to pick a color palette, set up dark mode, design a landing page/dashboard/app shell, or define semantic/brand/admonition colors in Tailwind. Enforces a research-first process (understand the project → study real references → reason through color tokens → persist as DESIGN.md → implement) to avoid generic "AI slop" design (purple/violet gradients, glassmorphism-everywhere, uniform rounded-2xl, emoji icons, identical soft shadows everywhere). Don't skip this skill just because the request seems small — even one component benefits from correct token usage.
---

# Tailwind Production-Grade Design

## Philosophy

Default LLM-generated Tailwind UI has a recognizable "tell": indigo-to-purple gradients, `rounded-2xl` on everything, soft uniform shadows, glassmorphism cards, emoji as icons, centered hero with a gradient blob, and text that's all `text-gray-500` regardless of hierarchy. This isn't "clean" — it's generic, and it reads as generic to anyone who's used a real product.

Real production interfaces (Linear, Stripe, Vercel, GitHub, Arc, Notion, Airbnb) are opinionated: a narrow, deliberate palette; sharp hierarchy; restrained radius and shadow used only where they mean something; type and spacing doing most of the work instead of color and effects. The goal of this skill is to make the agent behave like a product designer with taste and constraints, not a template generator.

**Never skip straight to code.** Follow the five phases below in order. Phase 3 (token reasoning) and Phase 4 (persisting it as `DESIGN.md`) are the core of this skill — do not shortcut either by grabbing a default Tailwind palette or by writing components first and describing them afterward.

---

## Phase 1 — Understand the project

Before touching color or components, gather context:

1. **Read what exists.** Check `tailwind.config.*` (or `@theme` in a `.css` file for Tailwind v4), any existing components, `globals.css`, and the framework (Next.js, Vite, plain HTML). **Also check specifically for an existing `DESIGN.md` (or equivalent token spec) at the project root or `/docs`.** If one exists, it is the source of truth — read it fully before anything else, extend it rather than forking a second competing spec, and match its existing token-reference syntax (e.g. `{colors.brand}`) even if it differs from this skill's own default syntax. If a partial system exists in code but no `DESIGN.md`, treat the code as the source of truth for Phase 3 and still produce a `DESIGN.md` in Phase 4 to formalize it going forward.
2. **Identify the product type and its conventions**, because conventions differ by category:
   - Developer tool / infra → dense, dark-mode-first, monospace accents, low chroma
   - B2B SaaS / dashboard → data-dense, neutral base, one confident accent, clear semantic states
   - Consumer / marketing site → higher contrast hero moments, more expressive type, still restrained color
   - Fintech / admin → conservative, high trust signals, muted palette, precise alignment
3. **Identify the audience and tone** the user describes (playful vs serious, premium vs utilitarian).
4. **Determine brand direction — never pick a hue by free-form guess.**
   - If a brand color, logo, or reference product is given or discoverable (existing code, a linked site, an uploaded asset) → derive the palette from that source, don't invent a new hue.
   - If none of that exists AND you have a way to ask the user (an interactive question, a chat turn) → ask one focused question: "any brand color or reference product to match, or should I pick a direction based on the product type?" Wait for the answer before generating tokens.
   - If none of that exists AND you have no way to ask (e.g. a non-interactive agent run, or the user has said "just build it") → you MUST use the deterministic **"No-brand default procedure"** in `references/color-tokens.md` (§ No-brand default procedure) to select a hue. This is a lookup against stated product type / mood keywords, not a free assumption — if you cannot map the request to a row in that table either, fall back explicitly to the table's stated default (cool neutral slate + restrained blue accent) and say in your output that this was the fallback default, so the user knows to override it.
   - In every case, state which of the three paths above you took. Never silently invent a hue with no traceable reason.

---

## Phase 2 — Research before deciding

Ground decisions in real references instead of inventing from nothing:

- If web search is available, look at 1–3 real products in the same category as the one being built (e.g., building a dev-tool dashboard → glance at Linear/Vercel/Retool patterns) to calibrate palette restraint, density, and radius conventions. This is for calibration of *taste*, not for copying layouts or text.
- Read `references/anti-patterns.md` in this skill for the specific tells to avoid.
- Read `references/exemplars.md` for a description of how well-regarded products handle each token category — use it as a mental model, not a template to paste.

Do not reproduce any specific product's copyrighted code, copy, or exact visual assets. The goal is pattern literacy (how do good products *think* about elevation, accents, density), not replication.

---

## Phase 3 — Reason through the token system

This is the core deliverable. Don't reach for `blue-500`/`gray-100` defaults. For each category below, reason explicitly (in your response or code comments) about *why* the choice fits the product, then commit to concrete values. Full guidance with worked examples and value tables is in `references/color-tokens.md` — read it before generating tokens for a new project.

**Two non-negotiable constraints, before you touch any individual token:**

1. **Contrast minimums (WCAG 2.1 AA), enforced, not eyeballed:**
   - Body text (under ~24px / under 19px bold) against its background: **≥ 4.5:1**. This applies to `text-secondary` and `text-muted` too — "muted" controls opacity/weight of *emphasis*, never a license to drop below 4.5:1 if the text conveys real information.
   - Large text (≥24px, or ≥19px bold) and headings: **≥ 3:1**.
   - Non-text UI elements that carry meaning (borders on inputs, focus rings, icon-only buttons, chart lines): **≥ 3:1** against adjacent colors.
   - If you cannot verify a ratio by calculation, choose values with an obvious margin (don't ship a value you calculate at 4.6:1 — leave headroom) rather than assuming it's "probably fine."
2. **Hue budget — cap it explicitly:** one neutral ramp (the base of everything above), one primary brand hue (+ at most one secondary accent hue, only if independently justified per §9), and 4–5 semantic hues (success/warning/danger/info/pending). That is the entire palette. If you find yourself introducing a 3rd+ "accent" color or a one-off hue for a single component, that's the "random accent per card" anti-pattern — stop and map it to an existing token instead.

Categories to define:

| Token category | What it governs | Key question to answer |
|---|---|---|
| **Background (canvas)** | The outermost app/page background | Pure neutral or a faint tint of the brand hue? How far from pure white/black? |
| **Page body** | Default content surface if different from canvas | Does content sit on the canvas directly or on a subtly distinct surface? |
| **Card / panel** | Elevated content containers | One step up from body — by luminance, not just a border |
| **Navbar** | Top/side nav surface | Same as canvas (blends) or distinct (anchors)? Does it need blur/translucency on scroll? |
| **Footer** | Footer surface | Usually recedes — often darker/quieter than body, not a bright accent block |
| **Elevated surfaces (inputs, code blocks)** | Interactive/monospace surfaces | Inset feeling (slightly recessed) vs raised — inputs usually read as *recessed*, cards as *raised* |
| **Borders** | Dividers, outlines | Hairline neutral by default; do NOT use pure black/white borders; separate border tokens for "subtle" vs "strong" |
| **Text** | Hierarchy of readable content | At least 3 levels: primary, secondary, tertiary/muted — never a single gray for everything |
| **Brand palette** | The product's identity color(s) | One confident primary + how it scales (50–950) + when a secondary accent is justified |
| **Semantic colors** | Success / warning / error / info / neutral-pending | Must pass contrast at the weight used; must be distinguishable for common color blindness |
| **Admonition / callout colors** | Note / tip / warning / danger / important blocks in docs or UI | Usually a tinted background + matching border + matching icon/text, at low saturation background with saturated accent |

For every token, decide and record:
- The **light mode** value and the **dark mode** value (dark mode is not just inverted — see reference doc)
- Whether it's expressed as a raw color or as a CSS variable / Tailwind `@theme` token (prefer variables — see Phase 5)
- The **reason** it fits this specific product (one line is enough, but it must be a real reason, not "standard blue")

---

## Phase 4 — Persist the system as `DESIGN.md` before writing components

**Do this before touching component code, not after.** A `DESIGN.md` written after the components exist just narrates whatever got picked in the moment — including anything that slipped past the Phase 3 constraints. Written first, it's the actual gate: Phase 5 must implement *from* this file, not invent alongside it.

- If Phase 1 found an existing `DESIGN.md`/token spec, **update it in place** (add the new tokens/components this task needs, following its existing structure and syntax) rather than creating a second file.
- If none exists, create one using `references/design-md-template.md` as the skeleton. That template mirrors a common, tool-friendly shape (Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts, Responsive Behavior, Iteration Guide, Known Gaps) with a bracketed token-reference convention (`{colors.brand}`, `{typography.body-md}`, `{rounded.lg}`) — adopt this convention unless the project's own tooling expects a different one.
- Populate every color category from Phase 3's table, the contrast/hue-budget decisions, and — once you reach it — the radius/shadow scale from `references/color-tokens.md`. Leave a "Known Gaps" entry for anything Phase 1–3 couldn't determine (e.g. no dark-mode brief was given) rather than silently inventing a value to fill the section.
- **Scope check — don't over-produce for small asks:** if the task is a single small component inside a project that already has a complete `DESIGN.md`, don't regenerate the whole document — just add/update the specific component entry and cite the existing tokens it uses. Full `DESIGN.md` generation is for new projects, new design systems, or requests that span multiple components/pages.
- This file is a deliverable the user can review before implementation — treat it as the point where any wrong assumption gets caught cheaply, before it's baked into a dozen components.

---

## Phase 5 — Implement with proper structure

1. **Use CSS variables as the source of truth**, mapped into Tailwind, rather than hardcoding utility classes like `bg-blue-500` throughout components. This makes theming, dark mode, and future rebranding a one-file change.
   - Tailwind v4: define tokens directly in `@theme` in your CSS entry file, generally using `oklch()`.
   - Tailwind v3: define CSS variables in `:root`/`.dark` holding bare channel values, and map them in `tailwind.config.js` under `theme.extend.colors` wrapped in `hsl(var(...) / <alpha-value>)` (or `oklch(...)`).
   - **Technical requirement, not optional, and version-dependent — get this wrong and opacity modifiers (`bg-brand/50`) silently break:** in v3, the variable must hold *raw channel values only* (e.g. `--brand: 250 70% 55%;`), never a full function call, because the config wraps it manually. In v4's `@theme`, you write the full `oklch(...)` value directly on the custom property and Tailwind handles opacity modifiers itself — don't apply the v3 "bare channels" pattern there, it isn't needed and isn't how `@theme` is consumed. See `references/color-tokens.md` for exact snippets of both.
2. **Name tokens semantically**, not by raw hue: `background`, `surface`, `surface-elevated`, `surface-input`, `surface-code`, `border-subtle`, `border-strong`, `text-primary`, `text-secondary`, `text-muted`, `brand`, `brand-foreground`, `success`, `warning`, `danger`, `info` — never `blue-1`, `blue-2`.
3. **Dark mode is a redesign of luminance, not an inversion.** Backgrounds usually don't go to pure black (`#0a0a0b`–`#111113` range reads better than `#000`); shadows are replaced by borders/subtle lighter surfaces since box-shadow barely reads on dark; saturation on brand/semantic colors typically needs to drop slightly and lightness needs to rise so they don't vibrate against a dark canvas.
4. **Radius and shadow use the fixed named scale in `references/color-tokens.md` (§ Radius & shadow scale)** — do not invent ad hoc values per component. Pick from that scale by element role (control vs. container vs. floating layer), not by eyeballing what "looks nice" for one button. Record the chosen values in `DESIGN.md`'s Shapes section if they aren't already there.
5. **Every component you write should trace back to a `DESIGN.md` entry** — either an existing one you're reusing, or a new one you add to the file in the same change. If you notice mid-implementation that a component needs a color/radius/spacing value not yet in `DESIGN.md`, stop and add it there first (running it through the Phase 3 constraints), then implement — don't invent it inline in the component and leave the doc stale.
6. **Before shipping, run the checklist** at the end of `references/anti-patterns.md`.

---

## Reference files

- `references/color-tokens.md` — deep guidance + concrete example palettes (with actual oklch/hex values) for each token category above, across a few product archetypes (dev tool, SaaS dashboard, consumer/marketing, fintech). Read this before generating a token set.
- `references/anti-patterns.md` — the specific "AI slop" tells to avoid, why they read as generic, and a pre-ship checklist.
- `references/exemplars.md` — how real, well-regarded products approach each token category, described conceptually for calibration (not for literal copying).
- `references/design-md-template.md` — the skeleton for the `DESIGN.md` deliverable in Phase 4: section-by-section structure, the bracketed token-reference convention, and what belongs in each section.