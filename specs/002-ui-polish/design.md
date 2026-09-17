# Design Spec: UI Polish with Docusaurus + Tailwind

**Date:** 2026-09-17
**Status:** Draft
**Classification:** Bounded

## Goal

Polish the existing UI with animations, spacing, and responsive refinements using Docusaurus design patterns and Tailwind CSS utilities.

## Research Summary

### Docusaurus Design Patterns
- **Theme Class Names** — Stable CSS targets (e.g., `.theme-layout-navbar`, `.theme-doc-sidebar`)
- **Infima CSS Variables** — Primary theming mechanism via `:root` overrides
- **Dark Mode** — Uses `[data-theme='dark']` attribute selector
- **Mobile Breakpoint** — 996px cutoff for mobile vs desktop
- **Swizzling** — For deeper component customization (wrapping preferred over ejecting)
- **prefers-reduced-motion** — Required accessibility fallback for animations

### Tailwind CSS v4 Patterns
- **CSS-first Configuration** — `@theme` directive instead of `tailwind.config.js`
- **Motion Tokens** — Four duration steps:
  - Quick (100ms) — toggles, focus rings
  - Snappy (200ms) — hovers, micro-feedback
  - Smooth (350ms) — modals, drawers, tooltips
  - Deliberate (600ms) — page transitions, hero reveals (max recommended; >600ms feels broken)
- **Mobile Duration** — Reduce durations by 10-15% on mobile (touch latency adds 50-100ms before user perceives motion)
- **Easing Curves**:
  - Standard: `cubic-bezier(0.2, 0.7, 0.2, 1)` — universal "feels right"
  - Enter: `cubic-bezier(0, 0, 0.2, 1)` — elements entering scene
  - Exit: `cubic-bezier(0.4, 0, 1, 1)` — elements exiting scene
- **Accessibility** — `motion-safe:` and `motion-reduce:` variants for WCAG 2.2 compliance
- **Performance** — Stick to `transform` and `opacity` for GPU-accelerated animations; avoid animating `width`, `height`, `top`, `left`

## Design Decisions

### 1. Tailwind v4 Theme Configuration

Define motion tokens in `@theme` block so they generate Tailwind utilities (`duration-snappy`, `ease-standard`, etc.):

```css
@theme {
  /* Motion Tokens — Duration Scale */
  --duration-instant: 0ms;
  --duration-fast: 100ms;      /* toggles, focus rings */
  --duration-snappy: 200ms;    /* hovers, micro-feedback */
  --duration-smooth: 350ms;    /* modals, drawers, tooltips */
  --duration-deliberate: 600ms; /* page transitions, hero reveals — max recommended */

  /* Motion Tokens — Easing Curves */
  --ease-standard: cubic-bezier(0.2, 0.7, 0.2, 1);  /* universal "feels right" */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);            /* elements exiting */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);           /* elements entering */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* playful overshoot */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* physical weight */
}
```

### 2. Extended CSS Variables (Infima-Compatible)

Add custom variables alongside Infima's `--ifm-*` prefix for consistency:

```css
:root {
  /* Spacing Scale (Infima-compatible naming) */
  --ifm-spacing-horizontal: 1rem;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Shadow Scale */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

/* Mobile adjustments — reduce durations by ~10-15% for touch latency */
@media screen and (max-width: 996px) {
  :root {
    --duration-fast: 85ms;
    --duration-snappy: 170ms;
    --duration-smooth: 300ms;
  }
}
```

### 3. Animation Keyframes

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
}
```

### 4. Utility Classes

```css
/* Animation Utilities — use Tailwind's duration-* and ease-* when possible */
.animate-fade-in {
  animation: fadeIn var(--duration-smooth) var(--ease-out) both;
}
.animate-slide-up {
  animation: slideUp var(--duration-smooth) var(--ease-out) both;
}
.animate-slide-down {
  animation: slideDown var(--duration-smooth) var(--ease-out) both;
}
.animate-scale-in {
  animation: scaleIn var(--duration-snappy) var(--ease-out) both;
}
.animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Hover Effects — disabled on mobile (no hover state) */
@media (hover: hover) and (pointer: fine) {
  .hover-lift {
    transition: transform var(--duration-snappy) var(--ease-standard),
                box-shadow var(--duration-snappy) var(--ease-standard);
  }
  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .hover-glow {
    transition: box-shadow var(--duration-snappy) var(--ease-standard);
  }
  .hover-glow:hover {
    box-shadow: 0 0 20px rgb(var(--ifm-color-primary-rgb) / 0.3);
  }
}

/* Focus Ring — always visible for keyboard navigation */
.focus-ring {
  transition: box-shadow var(--duration-fast) var(--ease-standard);
}
.focus-ring:focus-visible {
  outline: 2px solid var(--ifm-color-primary);
  outline-offset: 2px;
}

/* Stagger Animation Delays — use animation-fill-mode: backwards to prevent flash */
.stagger-1 { animation-delay: 0ms; animation-fill-mode: backwards; }
.stagger-2 { animation-delay: 50ms; animation-fill-mode: backwards; }
.stagger-3 { animation-delay: 100ms; animation-fill-mode: backwards; }
.stagger-4 { animation-delay: 150ms; animation-fill-mode: backwards; }
.stagger-5 { animation-delay: 200ms; animation-fill-mode: backwards; }
```

### 5. Accessibility: Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 6. Responsive Utilities

```css
/* Mobile-first responsive typography */
@media screen and (max-width: 996px) {
  :root {
    --space-section: var(--space-8);
    --space-page: var(--space-6);
  }
}

/* Smooth scroll for anchor links */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

## Files to Modify

1. **`website/src/css/custom.css`** — Add `@theme` block, design tokens, keyframes, utility classes, accessibility fallbacks
2. **`website/docusaurus.config.ts`** — Theme config updates (navbar `hideOnScroll`, `respectPrefersColorScheme`)

## Testing Plan

1. Run `yarn start` in `website/` directory
2. Verify hover effects on buttons and links (desktop only)
3. Check animation entrance effects on page load
4. Test dark mode transitions
5. Verify reduced motion preference disables animations
6. Check responsive behavior at mobile breakpoint (996px)
7. Verify hover effects are disabled on touch devices

## Out of Scope

- New React components (can be added later)
- Swizzling existing components
- View Transitions API (experimental, not yet stable)
