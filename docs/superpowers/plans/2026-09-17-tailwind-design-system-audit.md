# Tailwind Design System Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit existing Tailwind usage across 6 components, create a DESIGN.md token system, and refactor all components to use consistent design tokens instead of hardcoded Tailwind color classes.

**Architecture:** Create a centralized DESIGN.md with OKLCH color tokens, update `custom.css` `@theme` block with semantic tokens, then refactor each component to consume tokens instead of ad-hoc Tailwind utilities. Convert `quiz.tsx` from inline styles to Tailwind.

**Tech Stack:** Tailwind v4, Docusaurus 3, React 19, TypeScript

**Spec:** `/home/user/projects/Physical-AI-Humanoid-Robotics-Course/tailwind-prompt.md`

## Global Constraints

- Tailwind v4 with `@import "tailwindcss"` in `custom.css` — tokens defined in `@theme` block
- Infima CSS variables (`--ifm-color-primary` etc.) must stay in sync with Tailwind tokens
- No new `npm install` needed — Tailwind v4 already installed
- `postcss.config.js` already works — no changes needed there
- Docusaurus/Infima-native elements (navbar, footer, sidebar, code blocks) styled via Infima variables, not Tailwind classes
- All text must pass WCAG 2.1 AA contrast (≥4.5:1 body, ≥3:1 large)
- Hue budget: 1 neutral ramp + 1 brand hue + 4 semantic hues (success/warning/danger/info)

---

## File Structure

| File | Action | Purpose |
|---|---|---|
| `DESIGN.md` | Create | Token system, component specs, do's/don'ts |
| `website/src/css/custom.css` | Modify | Add semantic tokens to `@theme`, update Infima variables |
| `website/src/components/ChapterProgress.tsx` | Modify | Refactor to use design tokens |
| `website/src/components/FeatureCard.tsx` | Modify | Refactor to use design tokens |
| `website/src/components/InfoBox.tsx` | Modify | Refactor to use semantic tokens |
| `website/src/components/RAGChatbot.tsx` | Modify | Refactor to use design tokens |
| `website/src/pages/index.tsx` | Modify | Refactor to use design tokens |
| `website/src/pages/quiz.tsx` | Modify | Convert inline styles to Tailwind |
| `website/src/theme/DocItem/index.tsx` | Modify | Refactor to use design tokens |

---

### Task 1: Create DESIGN.md

**Files:**
- Create: `DESIGN.md` at project root

**Interfaces:**
- Consumes: Phase 1 inventory findings (existing Tailwind patterns, Infima variables)
- Produces: Token definitions referenced by all subsequent tasks

- [ ] **Step 1: Write the DESIGN.md**

```markdown
# Design System — Physical AI & Humanoid Robotics

## Overview

Developer-tool-adjacent educational platform (docs-heavy, RAG chatbot, auth flows, quizzes). Visual character: restrained, professional, dark-mode-capable with a single confident indigo-blue brand accent reserved for CTAs and active states. Dense information hierarchy with clear separation between content, navigation, and interactive surfaces.

**Key characteristics:**
- Brand accent (`#465fff` light / `#7592ff` dark) reserved for primary actions, active states, focus rings — never on large surfaces
- Neutral scale tinted slightly cool (blue-gray) for cohesion
- Radius scale: `radius-sm` (6px) for controls, `radius-md` (10px) for cards/panels, `radius-lg` (16px) for large containers
- Shadows reserved for floating layers only (chatbot, modals); static elements use luminance + border
- Three text levels: primary (headings), secondary (body), muted (metadata)
- Semantic colors tuned as a coherent family at consistent lightness

## Colors

### Brand & Accent

| Token | Light | Dark | Use |
|---|---|---|---|
| `{colors.brand}` | `oklch(62% 0.19 265)` ≈ `#465fff` | `oklch(72% 0.15 265)` ≈ `#7592ff` | Primary buttons, links, active nav, focus rings |
| `{colors.brand-hover}` | `oklch(55% 0.20 265)` ≈ `#3641f5` | `oklch(65% 0.16 265)` ≈ `#5c71ff` | Hover state for brand elements |
| `{colors.brand-pressed}` | `oklch(48% 0.20 265)` ≈ `#2d35e0` | `oklch(58% 0.17 265)` ≈ `#465fff` | Active/pressed state |
| `{colors.brand-foreground}` | `oklch(100% 0 0)` | `oklch(100% 0 0)` | Text on brand-colored backgrounds |
| `{colors.brand-subtle}` | `oklch(96% 0.04 265)` | `oklch(25% 0.06 265)` | Tinted backgrounds (badge bg, hover bg) |

### Surface

| Token | Light | Dark | Use |
|---|---|---|---|
| `{colors.background}` | `oklch(98.5% 0.002 260)` | `oklch(13% 0.005 260)` | Page canvas |
| `{colors.surface}` | `oklch(100% 0 0)` | `oklch(18% 0.006 260)` | Cards, panels (elevated above canvas) |
| `{colors.surface-elevated}` | `oklch(100% 0 0)` | `oklch(22% 0.006 260)` | Nested cards, dropdowns |
| `{colors.surface-input}` | `oklch(97% 0.002 260)` | `oklch(12% 0.006 260)` | Input fields (recessed) |
| `{colors.surface-code}` | `oklch(18% 0.006 260)` | `oklch(18% 0.006 260)` | Code blocks (always dark) |
| `{colors.navbar}` | `oklch(100% 0 0)` | `oklch(15% 0.005 260)` | Navbar (blends with canvas) |
| `{colors.footer-background}` | `oklch(13% 0.005 260)` | `oklch(13% 0.005 260)` | Footer (dark receding zone) |
| `{colors.surface-secondary}` | `oklch(97.5% 0.003 260)` | `oklch(16% 0.005 260)` | Alternate section bg (gray-50/dark:gray-900 equivalent) |

### Borders

| Token | Light | Dark | Use |
|---|---|---|---|
| `{colors.border-subtle}` | `oklch(91% 0.003 260)` | `oklch(26% 0.006 260)` | Card outlines, dividers |
| `{colors.border-strong}` | `oklch(82% 0.005 260)` | `oklch(34% 0.008 260)` | Focus outlines, active borders |

### Text

| Token | Light | Dark | Use |
|---|---|---|---|
| `{colors.text-primary}` | `oklch(18% 0.01 260)` | `oklch(95% 0.005 260)` | Headings, body copy |
| `{colors.text-secondary}` | `oklch(42% 0.01 260)` | `oklch(72% 0.008 260)` | Supporting copy, descriptions |
| `{colors.text-muted}` | `oklch(58% 0.008 260)` | `oklch(55% 0.008 260)` | Timestamps, placeholders, metadata |
| `{colors.on-dark}` | `oklch(95% 0.005 260)` | `oklch(95% 0.005 260)` | Text on dark surfaces (footer) |
| `{colors.on-dark-muted}` | `oklch(72% 0.008 260)` | `oklch(72% 0.008 260)` | Secondary text on dark surfaces |

### Semantic

| Token | Light bg | Light border | Light text | Dark bg | Dark border | Dark text |
|---|---|---|---|---|---|---|
| `{colors.success}` | `oklch(96% 0.04 145)` | `oklch(88% 0.08 145)` | `oklch(35% 0.12 145)` | `oklch(22% 0.04 145)` | `oklch(30% 0.08 145)` | `oklch(75% 0.10 145)` |
| `{colors.warning}` | `oklch(96% 0.05 75)` | `oklch(88% 0.10 75)` | `oklch(40% 0.12 75)` | `oklch(24% 0.05 75)` | `oklch(32% 0.10 75)` | `oklch(78% 0.10 75)` |
| `{colors.danger}` | `oklch(96% 0.04 25)` | `oklch(88% 0.08 25)` | `oklch(38% 0.14 25)` | `oklch(22% 0.04 25)` | `oklch(30% 0.08 25)` | `oklch(75% 0.12 25)` |
| `{colors.info}` | `oklch(96% 0.04 250)` | `oklch(88% 0.08 250)` | `oklch(38% 0.12 250)` | `oklch(22% 0.04 250)` | `oklch(30% 0.08 250)` | `oklch(75% 0.10 250)` |

### Admonition Mapping

| Admonition type | Maps to |
|---|---|
| Note / info | `{colors.info}` |
| Tip / success | `{colors.success}` |
| Warning / caution | `{colors.warning}` |
| Danger / error | `{colors.danger}` |
| Important | `{colors.warning}` |

## Typography

- **Font family:** `'Poppins', sans-serif` (UI), `'Noto Nastaliq Urdu', serif` (Urdu content)
- **No monospace font added** — code blocks use Docusaurus/Prism defaults

### Hierarchy

| Token | Size | Weight | Line height | Use |
|---|---|---|---|---|
| `display` | 3rem (48px) | 700 | 1.1 | Hero headline |
| `h1` | 2.25rem (36px) | 700 | 1.2 | Page title |
| `h2` | 1.875rem (30px) | 700 | 1.3 | Section heading |
| `h3` | 1.25rem (20px) | 600 | 1.4 | Card heading, subsection |
| `body` | 1rem (16px) | 400 | 1.6 | Body copy |
| `body-medium` | 1rem (16px) | 500 | 1.6 | Emphasis, labels |
| `caption` | 0.875rem (14px) | 400 | 1.5 | Metadata, timestamps |
| `small` | 0.75rem (12px) | 400 | 1.5 | Badges, fine print |

### Principles
- Negative letter-spacing decreases as size decreases (tighter for small text, neutral for headings)
- Body copy never drops below 1.5 line-height
- Urdu text uses `lineHeight: '3em'` for Nastaliq script readability

## Layout

- **Spacing system:** Tailwind default (4px base), using `p-*`, `gap-*`, `mb-*` etc.
- **Container:** Docusaurus `container` class (max-width responsive), `py-16` section padding
- **Whitespace philosophy:** Generous section padding (`py-16`), tighter component padding (`p-4` to `p-6`)

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | No shadow, `border-subtle` | Cards in normal flow |
| 1 (raised) | `shadow-sm` or luminance step up | Rarely used |
| 2 (floating) | `shadow-lg` / `shadow-2xl` | Chatbot window, modals |
| 3 (overlay) | `shadow-2xl` + backdrop | Dropdowns, tooltips |

Static elements (cards, panels) use luminance + border, not shadow. Shadow reserved for truly floating layers.

## Shapes

| Token | Value | Apply to |
|---|---|---|
| `radius-sm` | `0.375rem` (6px) | Buttons, inputs, badges |
| `radius-md` | `0.625rem` (10px) | Cards, panels, chat messages |
| `radius-lg` | `1rem` (16px) | Chat window, large containers |
| `radius-full` | `9999px` | Toggle button, avatar, pill inputs |

## Components

### ChapterProgress
- Background: gradient from `{colors.brand}` to `{colors.brand-hover}`
- Height: `h-1` (4px), fixed top, z-index 9999

### FeatureCard
- Background: `{colors.surface}`, border: `{border-subtle}`
- Hover: translate-y-1 + `shadow-sm` (not `shadow-lg` — keep restrained)
- Icon container: `{brand-subtle}` bg, `{brand}` text
- Title: `{text-primary}`, h3 weight
- Description: `{text-secondary}`, body size

### InfoBox (admonition)
- Maps to semantic tokens per admonition table above
- Structure: tinted bg + border + icon + text

### Chatbot
- Toggle: `{brand}` bg, `{brand-foreground}` text, `radius-full`
- Window: `{surface}` bg, `radius-lg`, `shadow-2xl`, `border-subtle`
- Messages (user): `{brand}` bg, `{brand-foreground}` text, `radius-md`
- Messages (bot): `{surface-secondary}` bg, `{text-primary}` text, `border-subtle`
- Input: `{surface-input}` bg, `border-subtle`, focus: `ring-brand/20`

### Homepage
- Hero: dark gradient (not pure black — use `{footer-background}` range)
- Features section: `{surface-secondary}` bg
- Module cards: `{surface}` bg, `border-subtle`, hover: `shadow-sm` + `border-brand/30`
- CTA: brand gradient

### Quiz
- Convert from inline styles to Tailwind using design tokens

### DocItem
- Action buttons: primary = `{brand}` bg, outline = `{brand}` border
- Error banners: `{danger}` semantic tokens
- Info banners: `{info}` semantic tokens

## Do's and Don'ts

**Do:**
- Use `{colors.brand}` only for high-intent elements (buttons, active states, links)
- Use `radius-sm` for controls, `radius-md` for cards, `radius-lg` for large containers
- Use luminance + border for static elevation, shadow only for floating layers
- Use semantic tokens for all status/admonition colors
- Check contrast: body text ≥4.5:1, large text ≥3:1

**Don't:**
- Use brand color on large background surfaces
- Mix `rounded-xl` and `rounded-2xl` without reason — stick to the radius scale
- Use `shadow-md` on static cards — use luminance step + border
- Invent one-off colors — map to existing tokens
- Use emoji as functional icons (InfoBox icons are acceptable as decorative)

## Responsive Behavior

- **Breakpoints:** Standard Tailwind (sm:640, md:768, lg:1024, xl:1280)
- **Mobile:** Single column, chat window full-width on small screens
- **Hero:** Text scales from `text-4xl` to `text-6xl` via `md:` / `lg:` prefixes
- **Feature grid:** 1 col → 3 col at `md:`

## Iteration Guide

1. Reference tokens by name (`{colors.brand}`, `{text-primary}`) — don't paraphrase
2. New states are separate component entries, not edits to base
3. Hue budget: 1 neutral + 1 brand + 4 semantic. No exceptions.
4. DESIGN.md is authoritative — `@theme` in `custom.css` is the code mirror

## Known Gaps

- Quiz page had no dark mode support — addressed in this audit
- No animation timing tokens beyond what's in `@theme` — the existing duration/easing tokens are sufficient
- HomepageFeatures directory is empty (FeatureCard lives in components/) — no action needed
```

- [ ] **Step 2: Verify DESIGN.md covers all components**

Checklist:
- [x] ChapterProgress
- [x] FeatureCard
- [x] InfoBox
- [x] RAGChatbot
- [x] Homepage (index.tsx)
- [x] Quiz
- [x] DocItem

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md
git commit -m "docs: add DESIGN.md token system for Tailwind audit"
```

---

### Task 2: Update custom.css with Semantic Tokens

**Files:**
- Modify: `website/src/css/custom.css`

**Interfaces:**
- Consumes: DESIGN.md token values
- Produces: Semantic tokens available as Tailwind utilities (`bg-background`, `text-text-primary`, etc.)

- [ ] **Step 1: Add semantic tokens to @theme block**

Add the following to the existing `@theme` block in `custom.css`:

```css
@theme {
  /* Existing font/duration/easing tokens stay */

  /* Brand */
  --color-brand: oklch(62% 0.19 265);
  --color-brand-hover: oklch(55% 0.20 265);
  --color-brand-pressed: oklch(48% 0.20 265);
  --color-brand-foreground: oklch(100% 0 0);
  --color-brand-subtle: oklch(96% 0.04 265);

  /* Surface */
  --color-background: oklch(98.5% 0.002 260);
  --color-surface: oklch(100% 0 0);
  --color-surface-elevated: oklch(100% 0 0);
  --color-surface-input: oklch(97% 0.002 260);
  --color-surface-code: oklch(18% 0.006 260);
  --color-surface-secondary: oklch(97.5% 0.003 260);
  --color-navbar: oklch(100% 0 0);
  --color-footer-background: oklch(13% 0.005 260);

  /* Borders */
  --color-border-subtle: oklch(91% 0.003 260);
  --color-border-strong: oklch(82% 0.005 260);

  /* Text */
  --color-text-primary: oklch(18% 0.01 260);
  --color-text-secondary: oklch(42% 0.01 260);
  --color-text-muted: oklch(58% 0.008 260);
  --color-on-dark: oklch(95% 0.005 260);
  --color-on-dark-muted: oklch(72% 0.008 260);

  /* Semantic - Success */
  --color-success-bg: oklch(96% 0.04 145);
  --color-success-border: oklch(88% 0.08 145);
  --color-success-text: oklch(35% 0.12 145);
  --color-success-dark-bg: oklch(22% 0.04 145);
  --color-success-dark-border: oklch(30% 0.08 145);
  --color-success-dark-text: oklch(75% 0.10 145);

  /* Semantic - Warning */
  --color-warning-bg: oklch(96% 0.05 75);
  --color-warning-border: oklch(88% 0.10 75);
  --color-warning-text: oklch(40% 0.12 75);
  --color-warning-dark-bg: oklch(24% 0.05 75);
  --color-warning-dark-border: oklch(32% 0.10 75);
  --color-warning-dark-text: oklch(78% 0.10 75);

  /* Semantic - Danger */
  --color-danger-bg: oklch(96% 0.04 25);
  --color-danger-border: oklch(88% 0.08 25);
  --color-danger-text: oklch(38% 0.14 25);
  --color-danger-dark-bg: oklch(22% 0.04 25);
  --color-danger-dark-border: oklch(30% 0.08 25);
  --color-danger-dark-text: oklch(75% 0.12 25);

  /* Semantic - Info */
  --color-info-bg: oklch(96% 0.04 250);
  --color-info-border: oklch(88% 0.08 250);
  --color-info-text: oklch(38% 0.12 250);
  --color-info-dark-bg: oklch(22% 0.04 250);
  --color-info-dark-border: oklch(30% 0.08 250);
  --color-info-dark-text: oklch(75% 0.10 250);
}
```

- [ ] **Step 2: Update Infima variables to match**

Update the `:root` and `[data-theme='dark']` blocks to reference the same values:

```css
:root {
  --ifm-color-primary: oklch(62% 0.19 265);
  --ifm-color-primary-dark: oklch(55% 0.20 265);
  --ifm-color-primary-darker: oklch(48% 0.20 265);
  --ifm-color-primary-darkest: oklch(38% 0.20 265);
  --ifm-color-primary-light: oklch(68% 0.17 265);
  --ifm-color-primary-lighter: oklch(72% 0.15 265);
  --ifm-color-primary-lightest: oklch(82% 0.10 265);
  --ifm-code-font-size: 95%;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] {
  --ifm-color-primary: oklch(72% 0.15 265);
  --ifm-color-primary-dark: oklch(65% 0.16 265);
  --ifm-color-primary-darker: oklch(58% 0.17 265);
  --ifm-color-primary-darkest: oklch(48% 0.20 265);
  --ifm-color-primary-light: oklch(78% 0.12 265);
  --ifm-color-primary-lighter: oklch(82% 0.10 265);
  --ifm-color-primary-lightest: oklch(90% 0.05 265);
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.3);
}
```

- [ ] **Step 3: Verify Tailwind can use the new tokens**

Run: `cd website && yarn build`
Expected: Build succeeds, tokens available as `bg-background`, `text-text-primary`, etc.

- [ ] **Step 4: Commit**

```bash
git add website/src/css/custom.css
git commit -m "feat: add semantic design tokens to @theme in custom.css"
```

---

### Task 3: Refactor ChapterProgress.tsx

**Files:**
- Modify: `website/src/components/ChapterProgress.tsx`

**Interfaces:**
- Consumes: `{colors.brand}`, `{colors.brand-hover}` from DESIGN.md
- Produces: Token-refactored progress bar component

- [ ] **Step 1: Replace hardcoded gradient with token-based classes**

Current:
```tsx
className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-primary-light z-[9999] transition-all duration-150 ease-out"
```

Replace with:
```tsx
className="fixed top-0 left-0 h-1 bg-gradient-to-r from-brand to-brand-hover z-[9999] transition-all duration-150 ease-out"
```

- [ ] **Step 2: Verify build**

Run: `cd website && yarn typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add website/src/components/ChapterProgress.tsx
git commit -m "refactor: use design tokens in ChapterProgress"
```

---

### Task 4: Refactor FeatureCard.tsx

**Files:**
- Modify: `website/src/components/FeatureCard.tsx`

**Interfaces:**
- Consumes: `{surface}`, `{border-subtle}`, `{brand-subtle}`, `{brand}`, `{text-primary}`, `{text-secondary}` from DESIGN.md
- Produces: Token-refactored card component

- [ ] **Step 1: Replace hardcoded colors with tokens**

Current card div:
```tsx
className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
```

Replace with:
```tsx
className="p-6 bg-surface rounded-md border border-border-subtle hover:-translate-y-1 hover:shadow-sm transition-all duration-200"
```

Icon container:
```tsx
className="w-12 h-12 flex items-center justify-center rounded-lg bg-brand-subtle text-brand mb-4"
```

Description:
```tsx
className="text-text-secondary text-sm leading-relaxed"
```

- [ ] **Step 2: Verify build**

Run: `cd website && yarn typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add website/src/components/FeatureCard.tsx
git commit -m "refactor: use design tokens in FeatureCard"
```

---

### Task 5: Refactor InfoBox.tsx

**Files:**
- Modify: `website/src/components/InfoBox.tsx`

**Interfaces:**
- Consumes: Semantic tokens from DESIGN.md
- Produces: Token-refactored admonition component

- [ ] **Step 1: Replace hardcoded semantic colors with token map**

Replace the `styles` record:

```tsx
const styles: Record<InfoBoxType, string> = {
  info: 'bg-info-bg border-info-border text-info-text dark:bg-info-dark-bg dark:border-info-dark-border dark:text-info-dark-text',
  warning: 'bg-warning-bg border-warning-border text-warning-text dark:bg-warning-dark-bg dark:border-warning-dark-border dark:text-warning-dark-text',
  success: 'bg-success-bg border-success-border text-success-text dark:bg-success-dark-bg dark:border-success-dark-border dark:text-success-dark-text',
  danger: 'bg-danger-bg border-danger-border text-danger-text dark:bg-danger-dark-bg dark:border-danger-dark-border dark:text-danger-dark-text',
};
```

- [ ] **Step 2: Verify build**

Run: `cd website && yarn typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add website/src/components/InfoBox.tsx
git commit -m "refactor: use semantic tokens in InfoBox"
```

---

### Task 6: Refactor RAGChatbot.tsx

**Files:**
- Modify: `website/src/components/RAGChatbot.tsx`

**Interfaces:**
- Consumes: All design tokens from DESIGN.md
- Produces: Token-refactored chat widget

- [ ] **Step 1: Refactor toggle button**

```tsx
className="w-14 h-14 rounded-full bg-brand text-brand-foreground border-none cursor-pointer shadow-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:bg-brand-hover hover:shadow-xl hover:scale-105 active:scale-95"
```

- [ ] **Step 2: Refactor chat window**

```tsx
className="absolute bottom-20 right-0 w-[380px] h-[520px] max-h-[80vh] bg-surface rounded-lg shadow-2xl flex flex-col overflow-hidden border border-border-subtle"
```

- [ ] **Step 3: Refactor header**

```tsx
className="px-4 py-3 border-b border-border-subtle flex justify-between items-center bg-surface-secondary"
```

- [ ] **Step 4: Refactor close button**

```tsx
className="w-7 h-7 rounded-full bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center text-lg hover:bg-surface-secondary transition-colors"
```

- [ ] **Step 5: Refactor user messages**

```tsx
'bg-brand text-brand-foreground self-end rounded-md rounded-br-sm'
```

- [ ] **Step 6: Refactor bot messages**

```tsx
'bg-surface-secondary text-text-primary self-start rounded-md rounded-bl-sm border border-border-subtle'
```

- [ ] **Step 7: Refactor input**

```tsx
className="flex-1 bg-surface-input border border-border-subtle rounded-full py-2.5 px-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
```

- [ ] **Step 8: Refactor send button**

```tsx
className="bg-brand text-brand-foreground border-none rounded-full w-10 h-10 cursor-pointer flex items-center justify-center font-semibold hover:bg-brand-hover disabled:bg-surface-secondary disabled:cursor-not-allowed transition-colors"
```

- [ ] **Step 9: Refactor selected text context**

```tsx
className="bg-info-bg border border-info-border rounded-md p-3 text-xs text-info-text relative"
// inner text box:
className="m-0 max-h-20 overflow-y-auto whitespace-pre-wrap break-words bg-surface p-2 rounded border border-border-subtle"
```

- [ ] **Step 10: Refactor clear button**

```tsx
className="absolute top-2 right-2 bg-transparent border-none text-danger-text cursor-pointer text-xs px-2 py-1 rounded hover:bg-danger-bg transition-colors"
```

- [ ] **Step 11: Verify build**

Run: `cd website && yarn typecheck`
Expected: PASS

- [ ] **Step 12: Commit**

```bash
git add website/src/components/RAGChatbot.tsx
git commit -m "refactor: use design tokens in RAGChatbot"
```

---

### Task 7: Refactor pages/index.tsx (Homepage)

**Files:**
- Modify: `website/src/pages/index.tsx`

**Interfaces:**
- Consumes: All design tokens from DESIGN.md
- Produces: Token-refactored homepage

- [ ] **Step 1: Refactor HeroSection**

Replace gradient background:
```tsx
className="relative overflow-hidden bg-gradient-to-br from-footer-background via-gray-800 to-footer-background text-on-dark"
```

Tagline text:
```tsx
className="text-lg md:text-xl text-on-dark-muted mb-8 max-w-2xl leading-relaxed ..."
```

CTA buttons — primary:
```tsx
className="inline-flex items-center px-6 py-3 bg-brand text-brand-foreground font-medium rounded-md hover:bg-brand-hover transition-colors"
```

CTA buttons — secondary:
```tsx
className="inline-flex items-center px-6 py-3 bg-white/10 text-on-dark font-medium rounded-md hover:bg-white/20 transition-colors border border-white/20"
```

- [ ] **Step 2: Refactor FeaturesSection**

Section bg:
```tsx
className="py-16 bg-surface-secondary"
```

Feature cards (inline in index.tsx):
```tsx
className="p-6 bg-surface rounded-md border border-border-subtle animate-[slideUp_0.35s_var(--ease-out)_both] hover:-translate-y-1 hover:shadow-sm transition-all duration-200"
```

Icon container:
```tsx
className="w-12 h-12 flex items-center justify-center rounded-lg bg-brand-subtle text-brand mb-4"
```

Description:
```tsx
className="text-text-secondary text-sm leading-relaxed"
```

- [ ] **Step 3: Refactor ModulesSection**

Module cards:
```tsx
className="h-full p-6 bg-surface rounded-md border border-border-subtle transition-all duration-200 hover:shadow-sm hover:border-brand/30 dark:hover:border-brand/50 hover:-translate-y-1 ..."
```

Module number:
```tsx
className="text-3xl font-bold text-brand/20 dark:text-brand/30"
```

Subtitle badge:
```tsx
className="text-xs font-medium text-brand bg-brand-subtle px-2 py-0.5 rounded"
```

Module title (on hover):
```tsx
className="text-lg font-semibold text-text-primary group-hover:text-brand transition-colors"
```

Description:
```tsx
className="text-text-secondary text-sm leading-relaxed m-0"
```

- [ ] **Step 4: Refactor CTASection**

```tsx
className="py-16 bg-gradient-to-r from-brand to-brand-dark"
```

Text:
```tsx
className="text-2xl md:text-3xl font-bold mb-3 text-brand-foreground ..."
className="text-brand-foreground/80 mb-8 ..."
```

Buttons:
```tsx
className="inline-flex items-center px-6 py-3 bg-white text-brand font-medium rounded-md hover:bg-gray-100 transition-colors"
className="inline-flex items-center px-6 py-3 bg-white/10 text-brand-foreground font-medium rounded-md hover:bg-white/20 transition-colors border border-white/30"
```

- [ ] **Step 5: Verify build**

Run: `cd website && yarn typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add website/src/pages/index.tsx
git commit -m "refactor: use design tokens in homepage"
```

---

### Task 8: Convert quiz.tsx to Tailwind

**Files:**
- Modify: `website/src/pages/quiz.tsx`

**Interfaces:**
- Consumes: All design tokens from DESIGN.md
- Produces: Tailwind-styled quiz page (no more inline styles)

- [ ] **Step 1: Replace inline styles with Tailwind classes**

Main:
```tsx
<main className="p-5 max-w-2xl mx-auto">
```

Form groups:
```tsx
<div className="mb-4">
```

Labels:
```tsx
<label htmlFor="pythonExp" className="block text-text-primary text-sm font-medium mb-1">
```

Inputs (number):
```tsx
className="w-full bg-surface-input border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
```

Checkboxes:
```tsx
className="mr-2 accent-brand"
```

Checkbox labels:
```tsx
className="flex items-center gap-2 text-text-primary text-sm mb-4 cursor-pointer"
```

Submit button:
```tsx
className="px-5 py-2.5 bg-brand text-brand-foreground border-none rounded-sm cursor-pointer font-medium hover:bg-brand-hover transition-colors"
```

Message:
```tsx
className="mt-4 text-text-secondary text-sm"
```

- [ ] **Step 2: Verify build**

Run: `cd website && yarn typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add website/src/pages/quiz.tsx
git commit -m "refactor: convert quiz.tsx from inline styles to Tailwind tokens"
```

---

### Task 9: Refactor DocItem/index.tsx

**Files:**
- Modify: `website/src/theme/DocItem/index.tsx`

**Interfaces:**
- Consumes: Design tokens from DESIGN.md
- Produces: Token-refactored doc wrapper

- [ ] **Step 1: Refactor action buttons**

Primary button:
```tsx
className="px-4 py-2 bg-brand text-brand-foreground font-medium rounded-md hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
```

Outline button:
```tsx
className="px-4 py-2 border-2 border-brand text-brand font-medium rounded-md hover:bg-brand-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
```

- [ ] **Step 2: Refactor error banners**

```tsx
className="bg-danger-bg border border-danger-border text-danger-text px-4 py-3 rounded-md mb-4 text-sm dark:bg-danger-dark-bg dark:border-danger-dark-border dark:text-danger-dark-text"
```

- [ ] **Step 3: Refactor info banner**

```tsx
className="bg-info-bg border border-info-border text-info-text px-4 py-3 rounded-md mb-5 text-sm dark:bg-info-dark-bg dark:border-info-dark-border dark:text-info-dark-text"
```

- [ ] **Step 4: Refactor floating Ask AI button**

```tsx
className="fixed z-[1001] px-4 py-2 bg-brand text-brand-foreground text-sm font-medium rounded-md shadow-lg hover:bg-brand-hover transition-colors"
```

- [ ] **Step 5: Verify build**

Run: `cd website && yarn typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add website/src/theme/DocItem/index.tsx
git commit -m "refactor: use design tokens in DocItem wrapper"
```

---

### Task 10: Final Cleanup and Verification

**Files:**
- Verify: all modified files

**Interfaces:**
- Consumes: All previous tasks
- Produces: Passing build, no stray hardcoded colors

- [ ] **Step 1: Search for remaining hardcoded gray/color classes**

Run: `rg "bg-gray-|text-gray-|border-gray-|bg-blue-|bg-red-|bg-green-|bg-amber-" website/src/`
Expected: No matches (all should be replaced with tokens)

- [ ] **Step 2: Run typecheck**

Run: `cd website && yarn typecheck`
Expected: PASS

- [ ] **Step 3: Run build**

Run: `cd website && yarn build`
Expected: PASS

- [ ] **Step 4: Load code-review skill and review diff**

Review for:
- Stray hardcoded colors bypassing DESIGN.md tokens
- Inconsistent radius/shadow usage
- Missing dark mode variants
- Contrast issues

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address code review findings from design system audit"
```
