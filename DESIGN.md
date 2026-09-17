# Design System — Physical AI & Humanoid Robotics

## Overview

Developer-tool-adjacent educational platform (docs-heavy, RAG chatbot, auth flows, quizzes). Visual character: restrained, professional, dark-mode-capable with a single confident indigo-blue brand accent reserved for CTAs and active states. Dense information hierarchy with clear separation between content, navigation, and interactive surfaces.

**Key characteristics:**
- Brand accent (indigo-blue, hue 265) reserved for primary actions, active states, focus rings — never on large surfaces
- Neutral scale tinted slightly cool (blue-gray) for cohesion
- Radius scale: `radius-sm` (6px) for controls, `radius-md` (10px) for cards/panels, `radius-lg` (16px) for large containers
- Shadows reserved for floating layers only (chatbot, modals); static elements use luminance + border
- Three text levels: primary (headings), secondary (body), muted (metadata)
- Semantic colors tuned as a coherent family at consistent lightness

## Colors

### Brand & Accent

| Token | Light | Dark | Use |
|---|---|---|---|
| `{colors.brand}` | `oklch(62% 0.19 265)` | `oklch(72% 0.15 265)` | Primary buttons, links, active nav, focus rings |
| `{colors.brand-hover}` | `oklch(55% 0.20 265)` | `oklch(65% 0.16 265)` | Hover state for brand elements |
| `{colors.brand-pressed}` | `oklch(48% 0.20 265)` | `oklch(58% 0.17 265)` | Active/pressed state |
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
| `{colors.surface-secondary}` | `oklch(97.5% 0.003 260)` | `oklch(16% 0.005 260)` | Alternate section bg |
| `{colors.navbar}` | `oklch(100% 0 0)` | `oklch(15% 0.005 260)` | Navbar (blends with canvas) |
| `{colors.footer-background}` | `oklch(13% 0.005 260)` | `oklch(13% 0.005 260)` | Footer (dark receding zone) |

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
- Negative letter-spacing decreases as size decreases
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

Static elements use luminance + border, not shadow. Shadow reserved for truly floating layers.

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
- Hover: translate-y-1 + `shadow-sm`
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
- Hero: dark gradient (footer-background → surface-code → footer-background)
- Features section: `{surface-secondary}` bg, no hover effects (non-interactive)
- Module cards: `{surface}` bg, `border-subtle`, hover: `shadow-sm` + `border-brand/30` (interactive only)
- CTA: `{brand-subtle}` bg with `{brand}` text — tinted background, not saturated gradient

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
- Check contrast: body text >= 4.5:1, large text >= 3:1

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
- **Feature grid:** 1 col -> 3 col at `md:`

## Iteration Guide

1. Reference tokens by name (`{colors.brand}`, `{text-primary}`) — don't paraphrase
2. New states are separate component entries, not edits to base
3. Hue budget: 1 neutral + 1 brand + 4 semantic. No exceptions.
4. DESIGN.md is authoritative — `@theme` in `custom.css` is the code mirror

## Known Gaps

- Quiz page had no dark mode support — addressed in this audit
- No animation timing tokens beyond what's in `@theme` — existing duration/easing tokens are sufficient
- HomepageFeatures directory is empty (FeatureCard lives in components/) — no action needed
