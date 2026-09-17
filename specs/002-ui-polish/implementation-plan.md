# Implementation Plan: Tailwind-First + Cosmos Indigo

**Date:** 2026-09-17
**Status:** Ready to Implement

## Overview

Replace custom CSS utility classes with Tailwind-first approach, adopt Cosmos Indigo color palette, add MDX components, add sidebar icons.

## Implementation Order

### Step 1: Simplify custom.css + New Colors

**File:** `website/src/css/custom.css`

Keep:
- `@import "tailwindcss"` and `@theme` block (fonts, motion tokens, keyframes)
- CSS variables for Cosmos Indigo palette
- `@keyframes` (fadeIn, slideUp, slideDown, scaleIn, shimmer)
- `@media (prefers-reduced-motion: reduce)` accessibility
- Sidebar icon CSS (new)

Remove:
- All `.animate-*` utility classes
- All `.hover-*` utility classes
- `.focus-ring` class
- `.stagger-*` classes
- Responsive duration overrides (move to @theme)

**Color Values:**

```css
:root {
  /* Cosmos Indigo Light */
  --ifm-color-primary: #465fff;
  --ifm-color-primary-dark: #3641f5;
  --ifm-color-primary-darker: #2d35e0;
  --ifm-color-primary-darkest: #1a22b8;
  --ifm-color-primary-light: #5c71ff;
  --ifm-color-primary-lighter: #6579ff;
  --ifm-color-lightest: #8da0ff;
  /* Backgrounds */
  --ifm-background-color: #f9fafb;
  --ifm-background-surface-color: #ffffff;
}

[data-theme='dark'] {
  /* Cosmos Indigo Dark */
  --ifm-color-primary: #7592ff;
  --ifm-color-primary-dark: #5c71ff;
  --ifm-color-primary-darker: #465fff;
  --ifm-color-primary-darkest: #2d35e0;
  --ifm-color-primary-light: #8da0ff;
  --ifm-color-primary-lighter: #9cb9ff;
  --ifm-color-lightest: #c3d4ff;
  /* Backgrounds */
  --ifm-background-color: #030712;
  --ifm-background-surface-color: #111827;
}
```

### Step 2: Sidebar Icons CSS

Add to `custom.css`:

```css
/* Sidebar category icons */
.sidebar-cat-server::before { content: '⚙️'; }
.sidebar-cat-monitor::before { content: '🖥️'; }
.sidebar-cat-layers::before { content: '🧠'; }
.sidebar-cat-puzzle::before { content: '🧩'; }
```

### Step 3: Update sidebars.ts

**File:** `website/sidebars.ts`

Add `className` to each category:

```typescript
{
  type: 'category',
  label: 'Module 1: The Robotic Nervous System (ROS 2)',
  className: 'sidebar-cat-server',
  items: [...],
},
{
  type: 'category',
  label: 'Module 2: The Digital Twin (Gazebo & Unity)',
  className: 'sidebar-cat-monitor',
  items: [...],
},
{
  type: 'category',
  label: 'Module 3: The AI-Robot Brain (NVIDIA Isaac™)',
  className: 'sidebar-cat-layers',
  items: [...],
},
{
  type: 'category',
  label: 'Module 4: Vision-Language-Action (VLA)',
  className: 'sidebar-cat-puzzle',
  items: [...],
},
```

### Step 4: Create MDX Components

#### 4a. `website/src/components/FeatureCard.tsx`

```tsx
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed dark:text-gray-400">{description}</p>
    </div>
  );
}
```

#### 4b. `website/src/components/InfoBox.tsx`

```tsx
interface InfoBoxProps {
  type?: 'info' | 'warning' | 'success' | 'danger';
  title?: string;
  children: React.ReactNode;
}

const styles = {
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300',
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300',
  danger: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300',
};

export default function InfoBox({ type = 'info', title, children }: InfoBoxProps) {
  return (
    <div className={`p-4 rounded-lg border ${styles[type]}`}>
      {title && <p className="font-semibold mb-2">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  );
}
```

#### 4c. `website/src/theme/MDXComponents.tsx`

```tsx
import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import FeatureCard from '@site/src/components/FeatureCard';
import InfoBox from '@site/src/components/InfoBox';

export default {
  ...MDXComponents,
  FeatureCard,
  InfoBox,
};
```

### Step 5: Update Homepage

**File:** `website/src/pages/index.tsx`

Replace custom classes with Tailwind:

| Old | New |
|-----|-----|
| `animate-slide-up` | `animate-[slideUp_0.35s_var(--ease-out)_both]` |
| `stagger-1` | `[animation-delay:0ms]` |
| `stagger-2` | `[animation-delay:50ms]` |
| `stagger-3` | `[animation-delay:100ms]` |
| `hover-lift` | `hover:-translate-y-1 hover:shadow-lg transition-all duration-200` |
| `animate-fade-in` | `animate-[fadeIn_0.35s_var(--ease-out)_both]` |
| `animate-scale-in` | `animate-[scaleIn_0.2s_var(--ease-out)_both]` |

### Step 6: Verify

1. Run `npm run build` in `website/`
2. Check homepage animations work
3. Verify sidebar icons appear
4. Test dark mode color switch
5. Check MDX components render in docs

## Files Summary

| File | Action |
|------|--------|
| `website/src/css/custom.css` | Rewrite — colors, keyframes, sidebar icons only |
| `website/sidebars.ts` | Modify — add className to categories |
| `website/src/theme/MDXComponents.tsx` | Create — global MDX component registration |
| `website/src/components/FeatureCard.tsx` | Create — feature card component |
| `website/src/components/InfoBox.tsx` | Create — info box component |
| `website/src/pages/index.tsx` | Modify — use Tailwind utilities |
