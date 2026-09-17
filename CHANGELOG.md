# Changelog

## [Unreleased]

### Design System Audit — Tailwind CSS Migration

#### Added
- `DESIGN.md` — full token system with OKLCH values, component specs, responsive behavior, do's/don'ts, and iteration guide
- `docs/superpowers/plans/2026-09-17-tailwind-design-system-audit.md` — 10-task implementation plan
- 40+ semantic design tokens in `custom.css` `@theme` block:
  - Brand: `brand`, `brand-hover`, `brand-pressed`, `brand-foreground`, `brand-subtle`
  - Surface: `background`, `surface`, `surface-elevated`, `surface-input`, `surface-code`, `surface-secondary`, `navbar`, `footer-background`
  - Border: `border-subtle`, `border-strong`
  - Text: `text-primary`, `text-secondary`, `text-muted`, `on-dark`, `on-dark-muted`
  - Semantic: `success`, `warning`, `danger`, `info` (bg/border/text variants for light + dark)
- Infima CSS variables updated to match OKLCH token values (light + dark mode)
- Scroll-triggered card animations (CSS `animation-timeline: view()`, no JavaScript):
  - 6 new keyframes: `iconPop`, `slideInLeft`, `textReveal`, `tiltIn`, `counterReveal`
  - 15+ animation classes: `scroll-reveal`, `scroll-reveal-tilt`, `scroll-reveal-left`, `scroll-reveal-scale`, `scroll-child-icon`, `scroll-child-text`, `scroll-child-counter`, `scroll-stagger-1` through `scroll-stagger-4`, `scroll-child-delay-1/2/3`, `scroll-parallax`, `scroll-cta-heading`, `scroll-cta-text`, `scroll-cta-buttons`
  - Progressive enhancement via `@supports (animation-timeline: scroll())` guard
  - Accessibility via `@media (prefers-reduced-motion: no-preference)` wrapper
- `InfoBox.tsx` — new component for MDX admonition boxes (info/warning/success/danger variants)

#### Changed
- **All components refactored to use semantic design tokens** instead of hardcoded Tailwind color classes:
  - `ChapterProgress.tsx` — `from-primary` → `from-brand`
  - `FeatureCard.tsx` — `bg-white`/`border-gray-200` → `bg-surface`/`border-border-subtle`; removed hover effects on non-interactive element
  - `RAGChatbot.tsx` — 15+ class replacements (grays → tokens, primary → brand)
  - `pages/index.tsx` — full homepage refactored (hero, features, modules, CTA); CTA changed from brand-saturated gradient to `bg-brand-subtle` tinted background; hero gradient uses `via-surface-code` token instead of hardcoded `via-gray-800`
  - `pages/quiz.tsx` — converted from inline `style={{}}` objects to Tailwind utility classes using design tokens
  - `theme/DocItem/index.tsx` — refactored buttons/banners to tokens; fixed pre-existing TypeScript error (`style` prop on ReactMarkdown)
- Infima variables converted from hex (`#465fff`) to OKLCH (`oklch(62% 0.19 265)`)
- Homepage animations changed from time-based (`animate-[slideUp_0.35s_...]`) to scroll-triggered (`scroll-reveal` classes)
- `AGENTS.md` updated with new skill references and project layout changes

#### Removed
- Zero `*.module.css` files remain (CSS Modules migration confirmed complete)
- Zero hardcoded Tailwind color classes (`bg-gray-*`, `bg-blue-*`, `bg-red-*`, etc.) in components
- Hover effects on non-interactive FeatureCard (anti-pattern fix per `tailwind-production-design` skill)

#### Fixed
- Pre-existing TypeScript error in `theme/DocItem/index.tsx` — `style` prop passed to `ReactMarkdown` (wrapped in div instead)
- CTA section using brand-saturated gradient on large surface (violated "brand on high-intent only" rule)
- Hero using hardcoded `via-gray-800` instead of design token
- FeatureCard hover effects misleading users about clickability (non-interactive element)
