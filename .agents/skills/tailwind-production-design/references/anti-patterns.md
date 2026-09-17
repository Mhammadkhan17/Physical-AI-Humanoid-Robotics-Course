# Anti-Patterns: The "AI Slop" Tells

These are the specific patterns that make a Tailwind UI immediately recognizable as unconsidered/generated rather than designed. Avoid defaulting to any of these unless there's a deliberate reason.

## Color

- **Indigo/violet/purple as the default brand hue**, especially in a `from-indigo-500 to-purple-600` gradient. This is the single most common tell. If the product has no stated brand color, pick almost anything else before defaulting here — or if a purple/violet is genuinely right for the brand, use it deliberately at controlled saturation, not as a decorative gradient smeared across buttons, headers, and blobs.
- **Gradient text and gradient buttons applied everywhere** "for polish." Gradients should do a specific job (one hero moment, a chart) — not appear on every CTA, badge, and icon background.
- **A single gray scale used for everything** — background, border, and muted text all pulling from the same `gray-*` ramp with no distinction between "this is a border" and "this is muted text."
- **Full-saturation semantic colors as huge backgrounds** (a whole card in solid `bg-red-500`) instead of a tinted background + strong accent.
- **Random unrelated accent colors per card** in a grid ("card 1 is blue, card 2 is green, card 3 is purple") with no semantic reason — reads as placeholder/demo data styling, not a real product.

## Surface & elevation

- **Glassmorphism on every panel** (`backdrop-blur` + translucent white background + border) used as a default aesthetic rather than for an actual overlay/floating context (like a nav over a hero image or a modal).
- **Soft, identical box-shadow on every element** — cards, buttons, inputs, nav, all sharing one generic `shadow-md`. Real UIs use shadow sparingly (usually just for things actually floating above content: dropdowns, modals, tooltips) and rely on borders/luminance for static elevation.
- **Uniform `rounded-2xl`/`rounded-3xl` on literally everything** — buttons, cards, inputs, avatars, badges — with no smaller radius scale for smaller elements. Radius should roughly scale with element size (small radius for small controls, larger for big cards).

## Layout & content

- **Centered hero + gradient blob + 3 feature cards with emoji icons** as the default landing page shape, regardless of what the product does.
- **Emoji used as functional icons** (🚀 for "fast," 💡 for "ideas," ✨ for "AI") instead of a real icon set (Lucide, Heroicons, custom SVG). Emoji render inconsistently across platforms and read as placeholder content in production UI.
- **Lorem-ipsum-shaped copy patterns**: "Powerful. Simple. Fast." three-word taglines and generic feature-card triads that could describe any product.
- **Overuse of `text-center` on everything**, including body paragraphs and dashboards, regardless of reading pattern.

## Motion & interaction

- **A hover scale/lift on every card** (`hover:scale-105`) applied uniformly whether or not the card is actually clickable — misleads users about what's interactive.
- **Animate-everything on load** (staggered fade-ins on every element on every page load) rather than reserving motion for meaningful state changes.

## Typography

- **A single default sans-serif with no type scale discipline** — headings and body text differing only in size, not in weight/tracking/line-height, so hierarchy feels flat.
- **Overly tight or overly loose line-height applied uniformly** rather than tuned per text role (tight for large headings, comfortable 1.5–1.7 for body copy).

---

## Pre-ship checklist

Before considering a Tailwind UI done, check:

- [ ] Background, card, and border tokens are distinguishable from each other by more than a hex-code rounding error, in both light and dark mode, and elevated surfaces are always lighter than what they sit on (never darker — see color-tokens.md §3).
- [ ] At least 3 distinct text-color levels are actually used with intent (not just declared and ignored), and every level (including `text-muted`) hits ≥4.5:1 for body-size text against its actual background token.
- [ ] Total hue count is within budget: 1 neutral ramp + 1 brand hue (+ at most 1 justified secondary accent) + 4–5 semantic hues. No stray one-off colors.
- [ ] Brand color appears concentrated on high-intent elements (primary actions, active states, key accents) — not smeared across large background areas.
- [ ] Semantic colors (success/warning/danger/info) are visually distinct from each other at a glance, including for red-green color blindness (check lightness difference, not just hue).
- [ ] Every admonition/callout type maps to one of the semantic tokens (color-tokens.md §11) — no invented one-off admonition hues.
- [ ] No emoji standing in for functional icons.
- [ ] Radius uses only `radius-sm/md/lg/full` and shadow uses only `shadow-sm/md/lg` from color-tokens.md's fixed scale, applied by element role — nothing invented per component.
- [ ] Shadows are reserved for floating layers (dropdowns, modals, tooltips); static in-flow cards use the luminance+border pattern instead, especially in dark mode where shadows barely render.
- [ ] Dark mode was designed (own luminance/chroma decisions), not generated by blindly inverting light-mode values.
- [ ] If a gradient is used, it's doing a specific job and isn't the default treatment for every button/card/heading.
- [ ] CSS color variables store raw channel values (not a wrapped `hsl(...)`/`oklch(...)` string) if opacity modifiers like `/50` are used anywhere — verified, not assumed.
- [ ] If no brand source existed, the hue was chosen via the deterministic table in color-tokens.md (§ No-brand default procedure), not a free guess — and that was disclosed to the user.
- [ ] A `DESIGN.md` (new or updated) exists and was written *before* the components it describes — not reverse-engineered from finished code — and every component traces back to an entry in it.