# Color Token Deep Reference

This file gives concrete reasoning patterns and example values for each token category. Values below are starting points to adapt, not a palette to paste unmodified — the actual hue/chroma should come from Phase 1's understanding of the specific product.

Use `oklch()` when the build supports it (Tailwind v4 default, modern browsers) because lightness stays perceptually consistent across hues, which makes generating a coherent scale far easier than with hex/HSL guesswork. Fall back to HSL CSS variables for wider compatibility.

## Non-negotiable rules (apply before generating any token)

- **Contrast:** body text ≥4.5:1, large text/headings ≥3:1, meaningful non-text UI (borders that convey state, focus rings, icon-only controls) ≥3:1. This is stated once here and applies to every section below — it is not repeated per-section as a suggestion, it's a pass/fail gate.
- **Hue budget:** 1 neutral ramp + 1 brand hue (+ optional 1 secondary accent, only per §9's justification test) + 4–5 semantic hues. Nothing else. Every color used anywhere in the UI must map to one of these ramps — no one-off hex values.
- **CSS variable storage format** (technical, gets this wrong silently otherwise — the correct pattern differs by Tailwind version, see both below):
  ```css
  /* HSL pattern */
  :root { --brand: 250 70% 55%; --background: 90 20% 98%; }
  .dark { --brand: 250 60% 65%; --background: 260 8% 16%; }
  ```
  ```css
  /* OKLCH pattern (Tailwind v4 @theme) */
  @theme {
    --color-brand: oklch(62% 0.19 250);
    --color-background: oklch(98.5% 0.002 90);
  }
  /* for light/dark, redefine the same custom property under a class/media selector, e.g.: */
  .dark { --color-background: oklch(16% 0.005 260); }
  ```
  In Tailwind v4, `@theme` variables are consumed directly as `bg-background`, `text-brand`, etc., and opacity modifiers (`bg-brand/50`) work automatically because Tailwind generates the color-mix under the hood — you do not need to manually write `oklch(var(...) / <alpha-value>)` in v4. In Tailwind v3, you map `theme.extend.colors.brand: 'hsl(var(--brand) / <alpha-value>)'` in `tailwind.config.js` and the CSS variable must hold the bare `H S% L%` triplet (no `hsl(...)` wrapper) for the `<alpha-value>` substitution to work. Confirm which of these two setups the project uses before generating tokens — mixing the patterns is the most common reason a generated theme "looks right" until someone uses `/50` and gets a broken or fully-opaque color.

---

## 1. Background (canvas)

The outermost surface. Two decisions: **how far from pure white/black**, and **whether it carries a hue tint**.

- Pure `#ffffff` / `#000000` canvases read as flat and "default." Real products almost always shift slightly:
  - Light mode canvas: `oklch(0.985 0.002 90)` (off-white, barely-there warm or cool tint depending on brand) rather than `#fff`.
  - Dark mode canvas: `oklch(0.16 0.005 260)` (near-black with a whisper of the brand hue) rather than `#000`.
- A neutral product (dev tool, dashboard) keeps chroma near 0 (0.001–0.004). A warmer consumer brand can push chroma to 0.01–0.02 in the canvas tint to feel less sterile.
- Decide once, reuse everywhere — don't let canvas color drift between pages.

## 2. Page body

Often identical to canvas. Split them out only when content needs to visually sit apart from the outer app chrome (e.g., an editor canvas around a document, or a marketing page with a distinct content well). If split, body is usually **one step lighter (light mode) / one step lighter (dark mode)** than canvas — a small luminance step, not a hue change.

## 3. Card / panel (surface)

Cards read as "elevated" primarily through **luminance difference + hairline border**, and only secondarily through shadow.

- **Rule, stated once, no exceptions: elevated surfaces are always lighter (higher L) than the surface beneath them, in both light and dark mode.** "Elevation" is modeled as "closer to the light source," and inverting that (a card darker than its canvas) reads as a hole/recess, not something raised, in either mode.
  - Light mode: canvas `L 0.985` → card `L 1.0` (pure white) or a small step up; pair with a `1px` border at low contrast (`oklch(0.9 0.003 260)`) rather than relying on shadow alone.
  - Dark mode: canvas `L 0.16` → card `L 0.20–0.22` — a step up by the same logic, just starting from a lower base.
- Nested elevation (card inside card) should step again in the same upward direction, not repeat the same value — otherwise nesting is invisible.
- **Exception that proves the rule — recessed surfaces (§6 inputs) are the one deliberate case that goes the other way**, precisely because inputs are meant to read as a recess, not an elevation. Don't apply the "always lighter" rule to §6.

## 4. Navbar

Decide: **blend or anchor.**
- Blend (same as canvas, differentiated only by a bottom hairline border): calm, common in docs/dashboards where nav is persistent chrome, not a focal element.
- Anchor (distinct surface, sometimes with backdrop-blur + translucency once the page scrolls beneath it): common on marketing sites where the nav needs presence over hero imagery. Use `backdrop-blur` + `bg-{canvas}/80` rather than a flat opaque color when floating over content.
- Avoid: a navbar in a totally unrelated hue "because it's the brand color" — this is a classic template tell unless the brand is specifically expressed through a colored nav (some do this intentionally, e.g. dark navbars on light sites — that's a valid, different choice, just make it deliberate).

## 5. Footer

Footers usually **recede** rather than compete, and this is the one deliberate exception to the "elevation" model in §3 — a footer isn't trying to read as raised, it's trying to read as "you've reached the end of the content plane," so it's allowed to sit at a different luminance than the elevation ladder implies.
- **Light mode:** the common, safe pattern is a **dedicated dark block** (a near-black or deep neutral, e.g. `L 0.15–0.20`) that is visually its own zone, not a slightly-darker version of the body. Give it its own `footer-background`/`footer-text` token pair (don't reuse `background`/`text-primary`, since a dark footer on a light page needs its own light-on-dark text tokens).
- **Dark mode:** do NOT make the footer darker than the page canvas — since canvas is already near the bottom of the luminance range, going darker collides with the "hole" problem from §3. Instead, keep the footer at or near canvas luminance and separate it with a `border-subtle` top border, or make it *very slightly lighter* (a whisper above canvas, well below card level) so it still reads as a distinct-but-quiet zone rather than a rendering artifact.
- Either way, avoid making the footer the same bright card-level surface as content — it competes for attention it doesn't need.

## 6. Elevated surfaces: inputs & code

These are functionally different from cards and should look different:
- **Inputs** typically read as *recessed*, not raised: slightly darker than the surface they sit on (light mode) or slightly different luminance with an inset-feeling border, `focus` states get a ring (`ring-2 ring-{brand}/40`) rather than just a border color change so keyboard/mouse users get an unambiguous signal. Concrete anchors: light mode `surface-input` ≈ `L 0.96` against a `L 0.985–1.0` canvas/card (a small step *down*); dark mode `surface-input` ≈ `L 0.12–0.13` against a `L 0.16` canvas (also a small step down — inputs recede below canvas in both modes, unlike cards which rise above it).
- **Code blocks / monospace surfaces** typically get their *own* distinct neutral (often cooler or warmer than the general UI neutral, e.g., a near-black slate for code blocks even on an otherwise warm-neutral UI) because code benefits from a stable, high-contrast, low-distraction surface independent of the rest of the theme. Don't reuse the card token for code — give it its own `surface-code` token. Concrete anchor usable in most themes regardless of brand hue: `surface-code` ≈ `oklch(0.18 0.006 260)` with `oklch(0.92 0.01 260)` text, used identically in light and dark mode (code blocks are one of the few elements that can legitimately stay dark-on-dark even on an otherwise light page, since it's a deliberate distinct zone, not a themed surface).

### Radius & shadow scale (fixed — do not invent per-component values)

Named tokens, applied by element **role**, not by taste per component:

| Token | Value | Apply to |
|---|---|---|
| `radius-sm` | `0.375rem` (6px) | Small controls: buttons, inputs, badges, chips |
| `radius-md` | `0.625rem` (10px) | Cards, panels, modals |
| `radius-lg` | `1rem` (16px) | Large containers: hero sections, large media, full-page panels |
| `radius-full` | `9999px` | Pills, avatars, dots — only for genuinely circular/pill-shaped elements, not a default for cards |

| Token | Value (light mode) | Apply to |
|---|---|---|
| `shadow-sm` | `0 1px 2px oklch(0 0 0 / 0.05)` | Rarely needed; a barely-there lift for slightly-raised static elements |
| `shadow-md` | `0 4px 12px oklch(0 0 0 / 0.08)` | Floating layers: dropdowns, popovers, tooltips |
| `shadow-lg` | `0 12px 32px oklch(0 0 0 / 0.12)` | Modals, dialogs — the highest elevation layer |

**Rule:** static, non-floating elements (cards sitting in normal page flow) should rely on the luminance-step + border pattern from §3, not `shadow-md`/`shadow-lg`. Reserve the shadow scale for things that visually float above the content plane. In dark mode, shadows lose most of their visible effect against a dark canvas — replace `shadow-*` with a `border-strong` outline or an extra luminance step instead of increasing shadow opacity to compensate.

## 7. Borders

Use at least two border tokens:
- `border-subtle` — hairline dividers, card outlines: very low contrast against its surface (light mode ~`oklch(0.9 0.003 260)`, dark mode ~`oklch(0.28 0.006 260)`).
- `border-strong` — focus outlines, active states, or borders that need to actually separate two similar surfaces: noticeably higher contrast, but still neutral unless it's a semantic/focus border (which can use the brand or semantic hue).
- Never use literal black/white borders — they clip harshly against off-white/off-black canvases and look unfinished.

## 8. Text

Minimum three levels, mapped to real usage, not arbitrary gray shades. All three below are body-text roles and must clear **≥4.5:1** against the background token they're actually used on (the non-negotiable rule applies to all three equally — "secondary" and "muted" describe visual weight, not permission to go below the floor):
- `text-primary` — headings, primary body copy. Light mode ~`oklch(0.2 0.01 260)` (not pure black — pure black on off-white can feel harsh at large sizes but is fine at small sizes; many products keep primary text just shy of pure black, e.g. `#111113`-ish). Dark mode ~`oklch(0.95 0.005 260)` (not pure white, to reduce glare).
- `text-secondary` — supporting copy, descriptions. Light mode ~`oklch(0.45 0.01 260)` against a `L 0.985` canvas (comfortably clears 4.5:1 while sitting visibly below primary); dark mode ~`oklch(0.75 0.008 260)` against a `L 0.16` canvas. Verify the actual ratio for the specific hue/canvas pair you land on rather than assuming these anchors transfer unchanged.
- `text-muted` / `text-tertiary` — timestamps, placeholders, disabled state, metadata. Only decorative/non-informational uses (a disabled control's label, for instance) may drop below 4.5:1; if the muted text conveys real information (a secondary data point, a status label), it must still clear 4.5:1 like the other two.
- Never assign text color by memory of "gray-400 looks fine" — check actual contrast ratio against the specific background token in use.

## 9. Brand palette

- Pick **one** primary brand hue and build a full scale (50/100/.../900/950) from it using consistent lightness steps (this is where `oklch` shines — step lightness while holding hue/chroma roughly constant, adjusting chroma down at the extremes to avoid muddy or neon ends).
- A secondary accent is only justified when the product genuinely needs **two independent signals that must never be confused** (e.g., a primary action color vs. a distinct "AI feature" or "premium tier" badge that must be visually unmistakable from a regular action). If you can't name the specific pair of things that would otherwise be confused, you don't have justification — use one brand hue.
- Reserve full-saturation brand color for **small, high-intent surface area**: primary buttons, active nav item, key links, focus rings, small accent icons. Large surfaces (backgrounds, big cards) in full brand saturation read as unrefined — use tints (brand-50/100) for large soft surfaces instead.
- Gradients: only use a gradient when it's doing a specific job (a hero highlight, a chart) and keep it low-contrast/subtle or a genuinely considered two-stop brand gradient — not a default `from-purple-500 to-blue-500` filler on every card and button.

### Generating the 50–950 scale: lightness ladder

Hold hue constant, hold chroma roughly constant through the middle of the range (drop it at the very light and very dark ends to avoid muddy/neon extremes), and step lightness (`L` in OKLCH, 0–1 scale) through these approximate stops:

| Step | L (approx) | Typical use |
|---|---|---|
| 50 | 0.97 | Faint tint backgrounds (admonition/badge backgrounds) |
| 100 | 0.94 | Subtle hover backgrounds |
| 200 | 0.88 | Tint borders, disabled fills |
| 300 | 0.78 | Light-mode secondary accents |
| 400 | 0.68 | **Dark-mode primary brand usage** — lighter than the light-mode base (500) so it doesn't go muddy/low-contrast against a near-black canvas |
| 500 | 0.58 | **Light-mode base brand color** — primary buttons/links (adjust to taste, this is the anchor) |
| 600 | 0.50 | Active/pressed state (light mode), text-on-light-tint usage |
| 700 | 0.42 | High-contrast brand text on light backgrounds |
| 800 | 0.34 | Rarely used directly; mostly a generation anchor |
| 900 | 0.26 | Rarely used directly; mostly a generation anchor |
| 950 | 0.20 | Rarely used directly; mostly a generation anchor |

**Direction check (don't get this backwards):** lower step numbers = lighter = for dark-mode foreground use and light-mode tints; higher step numbers = darker = for light-mode high-contrast text. It's counterintuitive that dark mode pulls from a *lower* step number than light mode's base — that's correct precisely because dark mode needs a lighter tone to read clearly against a dark canvas, not a darker one.

This ladder is a starting anchor, not a law — but generate the scale *from a formula like this*, not by picking 11 values by eye, or steps will be visually uneven.

### No-brand default procedure

Use this **only** when Phase 1 in SKILL.md determined there is no brand source to derive from and no way to ask the user. Match the request's stated product type or mood keywords to a row below; if nothing matches, use the fallback row. State explicitly in your output which row you used.

| Product type / mood keyword in the request | Hue angle (OKLCH, degrees) | Chroma (mid-scale) | Notes |
|---|---|---|---|
| Developer tool / infra / CLI | 230–250 (blue) or 150–160 (green) | 0.15–0.20 | Pick blue unless the request emphasizes "growth/eco/success", then green |
| Fintech / trust / professional / admin | 220–235 (blue) or 190–200 (teal) | 0.10–0.16 | Keep chroma restrained — this category should never feel playful |
| Health / eco / growth / wellness | 140–160 (green) | 0.12–0.18 | — |
| Creative / premium / editorial | 20–35 (warm amber/terracotta) or 190–200 (deep teal) | 0.12–0.18 | Avoid violet/magenta as the default even here — use it only if explicitly requested |
| Consumer / energetic / social | 15–25 (warm red-orange) or 260–280 (blue-violet, muted) | 0.15–0.20 | Keep saturation in check; "energetic" is not license for neon |
| No signal at all (fallback default) | 235 (a restrained blue) | 0.14 | State explicitly that this is the fallback default and should be swapped once the user has a real brand |

Explicitly forbidden as a *default* (not forbidden if the user asks for it by name): pure violet/purple (285–320) and magenta/pink (330–350) as the primary brand hue, since these are the most over-represented "AI-generated" defaults. If the request or brand source genuinely calls for one of these, use it — the rule is about defaults, not a ban.

## 10. Semantic colors

Define four to five: `success`, `warning`, `danger`/`error`, `info`, and optionally a `neutral-pending`/`in-progress` state.

- Each needs a **background tint**, **border**, **text/icon**, and (for solid usage like a badge or button) a **solid fill + foreground text** pair, in both light and dark mode.
- Don't just reuse Tailwind's raw `green-500` / `red-500` / `yellow-500` / `blue-500` — tune each so they sit at a consistent perceived intensity relative to each other (same rough lightness/chroma band), so a row of status badges feels like one system, not four random crayons.
- Check simultaneous contrast: red/green pairs in particular should differ in lightness, not just hue, so they remain distinguishable for red-green color blindness (the most common form). E.g. make danger noticeably darker/more saturated than a mid-tone success rather than two mid-tone hues at equal lightness.

## 11. Admonition / callout colors

Pattern for note/tip/warning/important/danger callout blocks (docs, inline alerts):
- Background: a **very low-saturation tint** of the semantic hue over the current surface (e.g. `color-mix` of the semantic color at ~8–12% over the card/body token, or a fixed low-chroma tint token per mode) — not the full solid semantic color as a background (too loud for a whole block).
- Left border or icon: the **saturated** version of the same hue, giving a clear accent without over-coloring the block.
- Text inside: usually stays the normal `text-primary`/`text-secondary` tokens (readability first) with just the heading/label and icon in the semantic color — avoid coloring the entire paragraph text, which usually fails contrast against a tinted background and looks unbalanced.
- Keep the same structural pattern across all admonition types (only the hue changes) so they read as one family.
- **Do not invent ad hoc admonition hues — map every admonition type onto one of the semantic tokens from §10.** There are only 4–5 semantic hues in the budget (§ non-negotiable rules); admonitions reuse them rather than adding new ones:

| Admonition type (common labels) | Maps to semantic token |
|---|---|
| Note / info / FYI | `info` |
| Tip / success / hint | `success` |
| Warning / caution | `warning` |
| Danger / error / critical | `danger` |
| Important | `warning` if it's a "pay attention" tone, `danger` if it's a "this will break something" tone — pick one deliberately, don't add a 5th/6th hue for it |

---

## Example archetype starting points

These are illustrative anchors, not fixed rules — adapt hue/chroma to the actual brand.

**Developer tool (dark-mode-first, low chroma, monospace accents)**
- Canvas dark: `oklch(0.14 0.004 260)`, card: `oklch(0.19 0.006 260)`, border-subtle: `oklch(0.27 0.006 260)`
- Brand: a single confident hue at moderate chroma (e.g. a electric blue or acid green used sparingly) — avoid indigo/purple as the sole brand hue, it's the most overused "AI tool" default.
- Code surface: distinct near-black slate, monospace font, subtle inner border.

**B2B SaaS dashboard (neutral base, one confident accent)**
- Canvas light: `oklch(0.98 0.002 250)`, card: `oklch(1 0 0)` with `border-subtle`, navbar blends with canvas.
- One brand accent used only for primary actions/active states; semantic colors carry the rest of the color budget (status badges, chart series).

**Consumer / marketing**
- Higher-contrast hero moments allowed (bold type, maybe one full-bleed brand-tinted section) but the rest of the page returns to a restrained neutral system — the expressiveness is concentrated, not smeared across every card and button.

**Fintech / admin**
- Conservative neutrals, muted brand chroma, semantic colors more saturated than the rest of the UI (since correctness/status signaling matters more than personality here), generous borders over shadows for a "precise" feel.