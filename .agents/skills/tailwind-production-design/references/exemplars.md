# Exemplars: How Real Products Think About Tokens

This file describes *patterns of reasoning* observed across well-regarded production interfaces, for calibration purposes only. It is a conceptual summary, not a specification of any specific company's exact values, code, or copy — do not attempt to pixel-match or reproduce any specific product's actual design system, code, or brand assets. Use these as a mental model for the kind of restraint and intentionality to apply, then derive original values suited to the project at hand.

## General patterns across well-regarded products

- **Narrow palettes, precisely tuned.** The strongest interfaces tend to use very few hues overall — a near-neutral system plus one confident brand accent plus a disciplined semantic set — rather than many hues. Restraint is what reads as "expensive"/considered.
- **Neutrals are rarely pure gray.** Most mature design systems tint their neutral scale very slightly toward one hue (cool blue-gray, warm stone, etc.) so the whole UI feels cohesive rather than sterile.
- **Dark mode is treated as a separate design pass**, not an automatic inversion — surfaces get their own elevation logic (lighter = higher in the stack), shadows are largely replaced by borders/subtle surface-lightness steps, and saturated colors get adjusted (usually slightly desaturated, slightly lightened) so they don't vibrate against dark backgrounds.
- **Elevation is communicated primarily through subtle luminance steps and hairline borders**, with shadow reserved for things that are actually floating above the content plane (menus, dialogs, tooltips, dragged items) rather than static cards.
- **Radius and shadow follow a small, deliberate scale** tied to element size and role (small tight radius for controls/badges, larger and softer for big containers/marketing sections), rather than one radius value everywhere.
- **Brand color is spent deliberately** — concentrated in a small number of high-intent places (primary buttons, active nav/tab indicators, links, focus rings, small brand marks) rather than large surfaces.
- **Semantic and status colors are tuned as a coherent family** — consistent lightness/chroma banding across success/warning/danger/info so a row of badges or a chart legend feels unified, with enough lightness separation between hues that they remain distinguishable under common color-vision deficiencies.
- **Type hierarchy carries a lot of the weight** that a less confident design might try to achieve with color: size, weight, and letter-spacing differences do the work of separating a page title from a section header from a caption, so the color palette can stay restrained.
- **Motion is purposeful and fast** — used to communicate state change (something opened, something was added) rather than as decorative flourish on every element.

## What tends to differ by category

- **Developer tools / infra** lean dark-mode-first, denser layouts, monospace used deliberately (not just in code blocks but sometimes in metadata/labels for a technical feel), and a notably restrained, often cooler-toned neutral scale.
- **B2B SaaS dashboards** lean toward a very quiet neutral base so dense data and charts can carry visual weight, with the one brand accent reserved almost entirely for primary actions and active navigation state.
- **Consumer/marketing sites** allow more expressive, higher-contrast moments (a bold hero, a distinctive display typeface, occasionally a considered gradient or illustration) but typically return to a restrained neutral system for the bulk of the page — the expressiveness is concentrated at a few key moments, not spread evenly.
- **Fintech/admin tools** tend toward the most conservative neutral systems of all, with semantic/status color doing comparatively more work than brand color, since correctness and legibility of state outrank personality.

## How to use this file

Read it to calibrate *how much restraint and intentionality* a production interface typically has, then go do the actual Phase 3 reasoning in `color-tokens.md` for the specific project — deriving original hue/chroma/lightness values that fit that project's brand and content, rather than trying to recall or match any specific real product's exact palette.