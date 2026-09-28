# SALIENCE ATLAS V2 — COMPREHENSIVE DESIGN SYSTEM STANDARD
### CLASSIFICATION: CLASS III CRITICAL INFRASTRUCTURE // DESIGN SYSTEM // LEVEL 5 SPEC

This document defines the strict styling and aesthetic rules for Salience Atlas V2. Formulated to ensure visual clarity and minimize cognitive drag, this system avoids consumer-oriented decorations in favor of high-density information layouts.

---

## 1. COLOR SPECIFICATION MATRIX

The system uses a highly controlled color palette. Backgrounds are deep and neutral, with vibrant cyan accents pointing to interactive elements:

```
┌────────────────────────────────────────────────────────┐
│  BACKGROUNDS: Slate Deep (#020617 to #0f172a)          │
├────────────────────────────────────────────────────────┤
│  PRIMARY ACCENT: Cyan Blue (#00D9FF)                    │
├────────────────────────────────────────────────────────┤
│  STATUS INDICATORS:                                    │
│  - Success: Emerald Green (#10b981)                    │
│  - Warning: Amber Orange (#f59e0b)                     │
│  - Critical: Rose Red (#f43f5e)                         │
│  - Info: Indigo Blue (#6366f1)                         │
└────────────────────────────────────────────────────────┘
```

-   **No Decorative Gradients**: Visual gradients are forbidden. Color fills must be flat, semi-opaque, or bound to subtle border lines to define layout edges.
-   **No Glassmorphism**: Forbid frosty layers. UI overlays must use dark, high-contrast, fully or semi-opaque Slate backgrounds.
-   **High Contrast Limits**: Ensure all typography complies with WCAG AA requirements, using soft gray or bright white text on dark Slate bases.

---

## 2. TYPOGRAPHIC GUIDELINES & HIERARCHY

All text runs must consume **Inter Variable** or **JetBrains Mono** fonts, maintaining tight spacing and a clean hierarchical sequence:

*   **Display Headings**: Used for critical system statuses, Workspace titles, or main board names.
    -   *Properties*: `font-sans text-lg font-bold tracking-tight text-white uppercase`
*   **System Action Items & Labels**: Used for table headers, metadata descriptors, and navigation prompts.
    -   *Properties*: `font-mono text-[10px] font-semibold text-slate-400 tracking-wider uppercase`
*   **Primary Data Values**: Used for contract amounts, supplier names, or serial IDs.
    -   *Properties*: `font-sans text-xs font-medium text-slate-200`
*   **Code & Log Streams**: Used for raw system logs, API payloads, or agent reasoning runs.
    -   *Properties*: `font-mono text-[9px] text-[#00D9FF] bg-slate-950/40 p-1.5 rounded`

---

## 3. SPACING & GRIDS (8-POINT SYSTEM)

To preserve information density, all paddings, margins, and component dimensions align with an **8-point grid**:

-   **Layout Padding**: Standard container margins must be strictly set to 8px (`p-2`), 12px (`p-3`), or 16px (`p-4`).
-   **Grid Cells**: Align items using close-knit flexbox grids with standard gap constraints of `gap-2` or `gap-3`.
-   **Target Sizes**: Interactive buttons and inputs must have a minimum clickable area of 32px on desktop and 44px on mobile devices, preventing mis-clicks while maintaining layout density.

Using this disciplined design strategy, the UI remains compact and scannable, letting administrators verify hundreds of active infrastructure transactions simultaneously.
