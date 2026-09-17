# DESIGN.md Template

A `DESIGN.md` is the persisted, reviewable record of every decision made in Phase 3 — written before component code, not extracted from it afterward. It's what makes a multi-session or multi-component build stay consistent instead of drifting: every new component should be checkable against this file rather than against the agent's memory of what it did last time.

Use the bracketed token-reference convention shown below (`{colors.x}`, `{typography.x}`, `{spacing.x}`, `{rounded.x}`) unless the project already has its own convention (check for an existing `DESIGN.md`, a `design-tokens.json`, a Style Dictionary config, or similar first — match what's already there instead of introducing a second convention). The bracket format is deliberate: it's easy to grep, easy to lint for broken references, and makes it obvious in component code which values are tokens versus one-off literals.

Fill in every section below for a new project. For an update to an existing `DESIGN.md`, only touch the sections relevant to the new work, and add new entries rather than rewriting the whole file.

---

## Overview

2–4 sentences: what kind of product this is (per Phase 1's archetype), the overall visual character in plain language, and the one or two things that make the system recognizable (e.g. "a single confident mint accent reserved for high-intent moments," "pill-shaped buttons used universally, never rectangular"). This section is what a new contributor (human or agent) reads first to calibrate before touching anything else.

**Key characteristics:** 4–6 bullets — the load-bearing decisions from Phase 3 stated as facts ("brand accent reserved for CTAs and active states only," "radius scale never softens between sm and md for the same component family," etc.).

## Colors

State which token category (from `SKILL.md` Phase 3) each entry corresponds to, and give both light and dark mode values plus the one-line reason it fits the product (carry these straight over from your Phase 3 notes — don't re-derive them here).

### Brand & Accent
- `{colors.brand}`, `{colors.brand-hover}` / `{colors.brand-pressed}`, `{colors.brand-foreground}` — the single primary hue from §9 and its interaction states.
- `{colors.accent-secondary}` — only if independently justified per §9; state the justification inline or omit the section entirely.

### Surface
- `{colors.background}` (canvas), `{colors.body}` (if split from canvas), `{colors.surface}` (card/panel), `{colors.surface-elevated}` (nested elevation), `{colors.surface-input}`, `{colors.surface-code}`, `{colors.navbar}`, `{colors.footer-background}`.

### Borders
- `{colors.border-subtle}`, `{colors.border-strong}`.

### Text
- `{colors.text-primary}`, `{colors.text-secondary}`, `{colors.text-muted}`, `{colors.on-dark}` / `{colors.on-dark-muted}` (light-on-dark pairs for any dark-surface region like a footer or promo band).

### Semantic
- `{colors.success}`, `{colors.warning}`, `{colors.danger}`, `{colors.info}`, `{colors.pending}` (if used) — each with its background-tint / border / text-icon / solid-fill sub-values per §10.

### Admonition
- Reference the §11 mapping directly: which semantic token each callout type (note/tip/warning/danger/important) resolves to. Don't list separate admonition hues — there shouldn't be any.

## Typography

- **Font family:** primary UI face + fallback stack; monospace face (if used) + fallback stack. State explicitly if no monospace/second face is used — don't add one without a reason.
- **Hierarchy table:** one row per type token, columns: Token / Size / Weight / Line height / Letter spacing / Use. Cover at minimum: a display/hero size, 2–4 heading steps, subtitle, body (regular + medium/emphasis), caption/micro, button label, and code sizes if the product has code surfaces.
- **Principles:** 2–4 bullets on anything systematic (e.g. "negative letter-spacing decreases as size decreases," "body copy never drops below 1.5 line-height").

## Layout

- **Spacing system:** base unit, the token scale built from it, and where larger vs. tighter rhythm applies (marketing sections vs. dense dashboard/docs areas, if both exist).
- **Grid & container:** max-width, gutter, column structure for the main layout types the product actually has (don't describe a 3-column docs grid if there isn't one).
- **Whitespace philosophy:** one short paragraph on how generous vs. tight the system is, and where that changes by section.

## Elevation & Depth

A table: Level / Treatment (exact shadow value or "flat + border") / Use — built directly from the fixed radius & shadow scale in `references/color-tokens.md`. Do not introduce shadow values outside that scale here. Note any deliberate exception (e.g. "hero imagery provides depth on its own, no shadow used there").

## Shapes

- **Border radius scale:** table of the fixed tokens from `references/color-tokens.md` (`radius-sm/md/lg/full`) with the actual pixel values and which element types use each. State the discipline rule explicitly if there is one (e.g. "no in-between softening between sm and md for the same component family").

## Components

One entry per reusable component, in the format: **`component-name`** followed by its token bindings (background, text, border, radius, spacing, typography — as `{token}` references, not raw values) and, where relevant, a short layout/behavior note. Add `-hover`, `-pressed`, `-disabled`, `-focused`, `-active` as separate entries only for states that actually differ from the default (don't pad the file with identical restated states).

Group naturally by area (Buttons, Cards & Containers, Inputs & Forms, Navigation, Badges & Status, and any product-specific groups like Code or Documentation Components) — mirror whatever grouping makes sense for what this product actually has, don't force every group to exist.

## Do's and Don'ts

Short, concrete, and specific to *this* system — not generic design advice. Pull these directly from the constraints already decided in Phase 3 (hue budget, where brand color is/isn't allowed, radius discipline, contrast floor) stated as plain imperatives so a future contributor can self-check without re-reading the reasoning.

## Responsive Behavior

- **Breakpoints:** a table (name / width / key changes) covering however many breakpoints the product actually needs — don't pad to a fixed number.
- **Touch targets:** minimum tap sizes and how they change on mobile, if this differs from desktop.
- **Collapsing strategy:** for each layout pattern that changes at a breakpoint (nav, hero, grids, tables), state what it collapses to.

## Iteration Guide

Instructions aimed at whoever (human or agent) extends this system next:
1. Reference tokens and component names directly (`{colors.brand}`, `button-primary-pressed`) — don't paraphrase them into new names.
2. New states are added as separate `component-name-state` entries, not by editing the base entry's description.
3. Restate the hue budget and contrast floor here as a hard check before adding anything new.
4. Point to where the canonical values live (`DESIGN.md` itself, plus `tailwind.config.*`/`@theme` as the code-level mirror) so there's no ambiguity about which is authoritative if they ever disagree (`DESIGN.md` is — code should be regenerated from it, not the reverse).

## Known Gaps

Anything Phase 1–3 could not determine — an unspecified dark mode, no stated secondary accent use case, no defined animation timing, an incomplete semantic-color set. List these explicitly rather than silently filling them with an invented default; this is where the "no free-form assumption" rule becomes visible in the deliverable itself.