---
name: Material Lab
description: Standalone falling-sand sandbox for exploring pixel materials and physical reactions.
colors:
  primary: "#000000"
  on-primary: "#ffffff"
  canvas: "#ffffff"
  surface-soft: "#f7f7f5"
  hairline: "#e6e6e6"
  hairline-soft: "#f1f1f1"
  block-lime: "#dceeb1"
  block-lilac: "#c5b0f4"
  block-cream: "#f4ecd6"
  block-pink: "#efd4d4"
  block-mint: "#c8e6cd"
  block-coral: "#f3c9b6"
  overlay-scrim: "rgb(0 0 0 / 60%)"
  brand-mark-surface: "#f3e6e6"
  brand-mark-letter: "#687269"
  brand-mark-letter-shadow: "#d7aeb4"
  brand-mark-flower: "#e7a6b1"
  brand-mark-flower-center: "#f3c9b6"
  brand-mark-flower-lilac: "#b8adbd"
  brand-mark-bud: "#c5cf9d"
typography:
  display:
    fontFamily: "Inter Variable, SF Pro Display, system-ui, sans-serif"
    fontSize: "clamp(26px, 1.5vw, 32px)"
    fontWeight: 540
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter Variable, SF Pro Display, system-ui, sans-serif"
    fontSize: "clamp(20px, 1.3vw, 30px)"
    fontWeight: 540
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Inter Variable, SF Pro Display, system-ui, sans-serif"
    fontSize: "clamp(15px, 0.82vw, 17px)"
    fontWeight: 540
    lineHeight: 1.25
  body:
    fontFamily: "Inter Variable, SF Pro Display, system-ui, sans-serif"
    fontSize: "clamp(16px, 0.9vw, 18px)"
    fontWeight: 330
    lineHeight: 1.45
  label:
    fontFamily: "JetBrains Mono, SF Mono, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.04em"
rounded:
  xs: "6px"
  sm: "8px"
  md: "24px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  panel: "clamp(16px, 1.2vw, 24px)"
  stage-gutter: "clamp(16px, 1.4vw, 32px)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "8px 18px 10px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "8px 18px 10px"
    height: "40px"
  button-icon:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    size: "40px"
    height: "40px"
  material-group:
    backgroundColor: "{colors.block-lilac}"
    rounded: "{rounded.md}"
    padding: "16px"
  material-option:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "8px"
    height: "60px"
  inspector-note:
    backgroundColor: "{colors.block-cream}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "13px 14px"
  mobile-dock-button:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    height: "44px"
---

# Design System: Material Lab

## Overview

**Creative North Star: "Canvas-First Material Workbench"**

Material Lab is a quiet instrument for manipulating a living pixel world. The canvas carries the visual drama; the interface stays close to a precise workbench, with a white simulation field, compact black controls, and a material catalog organized into soft color blocks. Every surface should help the user notice cause and effect rather than compete with it.

The visual language is editorial and tactile without becoming ornamental. Inter Variable provides a calm, contemporary interface voice, while JetBrains Mono marks technical metadata and status. Pastel family surfaces create a gentle taxonomy around the native material swatches, and the botanical mark gives the otherwise monochrome chrome a small, hand-drawn signature. Depth comes from hairlines, spacing, and restrained shadows rather than glass-heavy effects.

**Key Characteristics:**
- Canvas-first composition with the simulation as the only visual core.
- Near-black operational chrome on white and soft off-white surfaces.
- Pastel material-family blocks: lilac, mint, coral, pink, and lime.
- Inter Variable for interface hierarchy and JetBrains Mono for labels and codes.
- Pill-shaped actions paired with compact 6–24px corner radii.
- Pixel fidelity preserved through the native material palette and crisp rendering.

## Colors

The palette is ink-first and materially coded: black and white carry operation, while soft pastels group materials without repainting the simulation itself.

### Primary

- **Ink Black** (`#000000`): Primary action, selected state, focus ring, status mark, and the strongest text weight.
- **White Signal** (`#ffffff`): Text on primary actions and the central canvas surface.

### Secondary

- **Wind Lime** (`#dceeb1`): The wind tool's gentle utility surface.
- **Material Lilac** (`#c5b0f4`): Base material family surface.
- **Botanical Mint** (`#c8e6cd`): Life material family surface.
- **Energy Coral** (`#f3c9b6`): Energy material family surface and warm informational emphasis.
- **Special Pink** (`#efd4d4`): Special material family surface.

### Tertiary

- **Research Cream** (`#f4ecd6`): Inspector notes and explanatory callouts.

### Neutral

- **Canvas White** (`#ffffff`): The simulation field and principal panel surface.
- **Soft Laboratory** (`#f7f7f5`): App background, icon controls, metadata badges, and mobile dock backdrop.
- **Hairline** (`#e6e6e6`): One-pixel separators, borders, and canvas framing.
- **Soft Hairline** (`#f1f1f1`): The 32px background grid.
- **Overlay Scrim** (`rgb(0 0 0 / 60%)`): Mobile sheet backdrop when a tool drawer is open.

### Named Rules

**The Ink-First Rule.** Black is reserved for action, selection, focus, and essential reading; it is not used as decorative noise.

**The Material-Block Rule.** Pastel family surfaces organize the catalog, but native material swatches remain the source of truth for material color.

## Typography

**Display Font:** Inter Variable (with SF Pro Display and system-ui fallbacks)
**Body Font:** Inter Variable (with SF Pro Display and system-ui fallbacks)
**Label/Mono Font:** JetBrains Mono (with SF Mono and Menlo fallbacks)

**Character:** The pairing is quiet, technical, and legible. Inter carries the interface as a single, measured voice; JetBrains Mono introduces a small instrument-panel register for labels, codes, counts, and status without turning the whole UI into a terminal.

### Hierarchy

- **Display** (weight 540, `clamp(26px, 1.5vw, 32px)`, line-height 1.15): Material rail and inspector headings.
- **Headline** (weight 540, `clamp(20px, 1.3vw, 30px)`, line-height 1.15): Product wordmark and top-level identity.
- **Title** (weight 540, `clamp(15px, 0.82vw, 17px)`, line-height 1.25): Material names and compact control labels.
- **Body** (weight 330, `clamp(16px, 0.9vw, 18px)`, line-height 1.45): Inspector explanations and reaction results.
- **Label** (JetBrains Mono, weight 400, 10–11px, `0.04em` tracking): Status, panel kickers, family headings, material codes, and counts; uppercase is reserved for technical metadata.

### Named Rules

**The One Interface Voice Rule.** Use Inter for user-facing hierarchy; use JetBrains Mono only when the content is genuinely metadata, status, or a code.

## Layout

Material Lab is a full-viewport workbench. A 56–64px top bar anchors the brand and simulation controls. On desktop, a left material rail occupies `clamp(232px, 16vw, 320px)` and the central stage fills the remaining space; the inspector is a right-side overlay at `clamp(312px, 20vw, 420px)` when opened. At very wide sizes, the rail and inspector expand to keep the material catalog readable and the canvas visually centered.

The stage uses a responsive `clamp(16px, 1.4vw, 32px)` gutter and centers the simulation canvas. A one-pixel framed halo around the canvas creates a quiet boundary without competing with the pixels. The app background uses a low-contrast 32px grid, making the workbench spatially legible while remaining visually recessive.

The catalog is organized into two-column material grids with 8px gaps and 16px internal family-block padding. At 1920px and above, grids expand to three columns. Between 768px and 1199px, rails narrow fluidly. At 767px and below, the layout becomes a canvas plus a 64px bottom dock; material selection and the inspector become bottom sheets with 24px top corners, safe-area padding, and touch targets of at least 44px.

**The Canvas-First Rule.** The central simulation keeps the largest uninterrupted field of attention. Tool surfaces may frame, cover, or temporarily dock around it, but closed panels must not leave a reserved blank column.

## Elevation & Depth

The default system is flat and structural. Opaque white panels, one-pixel hairlines, soft background contrast, and the canvas frame establish most hierarchy. A restrained shadow is reserved for the pixel canvas and mobile sheets; the modal scrim may add a short backdrop blur, but ordinary top bars and rails stay crisp and unblurred.

### Shadow Vocabulary

- **Canvas and sheet lift** (`0 4px 16px rgb(0 0 0 / 6%)`): A quiet separation from the soft laboratory background.
- **Overlay scrim** (`rgb(0 0 0 / 60%)`): A temporary focus layer behind mobile sheets, never a permanent surface treatment.

### Named Rules

**The Flat-by-Default Rule.** Start with surface contrast and hairlines; add a shadow only when an object needs to separate from the canvas or a temporary sheet.

## Shapes

The form language alternates between compact rounded rectangles and full pills. Primary actions, icon buttons, status badges, mobile dock controls, and sheet close controls use a `9999px` pill radius. Material options and inspector notes use an 8px radius. Family blocks and mobile sheets use larger 24px radii, making them read as containers rather than controls. The canvas uses an 8px radius, while its surrounding stage frame uses 24px.

Borders are quiet and mostly one-pixel hairlines. Selected states rely on black or the native material color rather than thick outlines. Focus remains visible as a 2px black outline with a 3px offset.

## Components

### Buttons

- **Shape:** Full pills (`9999px`) for text actions, with a 40px minimum height; icon-only actions are 40px circles.
- **Primary / active:** Ink Black background, white text, `8px 18px 10px` padding, and medium Inter weight.
- **Secondary:** White canvas background, ink text, the same pill silhouette, and a soft-surface hover state.
- **Hover / Focus:** Hover changes surface or fill rather than adding lift. Focus uses a 2px black outline with a 3px offset. Reduced-motion users receive no transition.
- **Mobile:** Dock buttons remain at least 44px high and use the same pill language.

### Cards / Containers

- **Material family blocks:** Pastel backgrounds, 24px corners, 16px padding, and 8px internal grid gaps. They are organizational containers, not promotional cards.
- **Material options:** White surface, one-pixel hairline, 8px corners, 8px padding, and a 60px desktop minimum height. Selected options use the material's own background and foreground values.
- **Inspector note:** Research Cream background, 8px corners, a narrow accent mark, and `13px 14px` padding.

### Navigation

- **Top bar:** White, one-pixel bottom hairline, 56–64px responsive height, botanical brand mark on the left, status in the middle, and pill actions on the right.
- **Material rail:** A fixed desktop catalog with a technical kicker, count badge, wind control, pastel family blocks, and a five-step brush control.
- **Inspector:** A right-side overlay on desktop and a bottom sheet on mobile. It uses a material swatch, selected material name, two tabs, readable facts, and reaction rows.
- **Mobile dock:** Three equal 44px touch controls for material, brush size, and details; active state uses Ink Black.

### Signature Component: Canvas Stage

The canvas stage is the visual core: a centered pixel simulation on a soft laboratory field, enclosed by a one-pixel halo and a modest shadow. It must retain crisp, nearest-neighbor rendering and the native Sandspiel material palette. The surrounding UI exists to help users draw, pause, reset, undo, inspect, and discover reactions without stealing attention from the simulation.

### Signature Component: Botanical Brand Mark

The Material Lab mark is an inline SVG built from a loose letterform, muted sage strokes, and small rose, lilac, coral, and bud-yellow botanical details on a pale rose square. It is a small identity signature, not a general illustration system; keep it local, simple, and quiet.

## Do's and Don'ts

### Do:

- **Do** keep the simulation canvas as the dominant visual object.
- **Do** use Inter Variable for interface hierarchy and JetBrains Mono for technical labels.
- **Do** use pastel family blocks to organize materials while preserving each native material swatch.
- **Do** preserve crisp pixel rendering, local fonts, local assets, and the existing botanical mark.
- **Do** use one-pixel hairlines, compact spacing, and restrained transitions to communicate structure.
- **Do** preserve visible focus states, reduced-motion behavior, safe-area handling, and 44px mobile touch targets.

### Don't:

- **Don't** add remote fonts, remote imagery, or runtime visual dependencies.
- **Don't** repaint or normalize the native material palette to match the UI pastels.
- **Don't** turn the material catalog or inspector into oversized marketing cards.
- **Don't** add heavy shadows, persistent blur, glossy gradients, or decorative motion to ordinary controls.
- **Don't** reserve a blank inspector column when the inspector is closed.
- **Don't** replace the canvas's pixelated rendering with smooth scaling or anti-aliased treatment.
- **Don't** use gradients in the chrome; the special material swatch gradient is an explicit data-driven exception.
