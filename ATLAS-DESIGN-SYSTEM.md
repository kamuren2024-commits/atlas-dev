# SALIENCE ATLAS — UNIFIED DESIGN SYSTEM
## ATLAS DS v1.0 — Enterprise Intelligence Platform
### Created: 2026-09-02

> **Purpose**: Single source of truth for all UI primitives across Salience Atlas modules.
> **Goal**: Intelligence + Precision + Trust + Scale + Control + Operational Maturity
> **References**: Palantir Foundry quality, Linear information density, Datadog visualization, Stripe typography
> **Protected Boundary**: Command Center may reference tokens but layout/styling decisions are frozen.

---

## 1. DESIGN PRINCIPLES

### 1.1 Core Principles
1. **Intelligence First** — Every surface answers a decision. No decorative components without signal.
2. **Precision Typography** — Hierarchy eliminates ambiguity. Numbers tell stories.
3. **Trust Through Restraint** — Accents selectively (cyan/violet < 5% of pixels). Foundation of deep neutrals.
4. **Density Adaptive** — Comfortable default, compact mode available for data work.
5. **Motion with Meaning** — No continuous animation. Transition only on state change. Respect `prefers-reduced-motion`.
6. **Provenance Visible** — Every metric carries metadata: period, source, status, confidence.

### 1.2 Anti-Patterns (Forbidden)
- Excessive rounded cards (>16px for panels, >10px for controls)
- Gradient abuse (background gradients, card fills)
- Neon/cyberpunk glow overload
- Glassmorphism on content panels (reserved for shell only)
- Gaming aesthetics, decorative 3D, kinetic typography
- Continuous background animation loops
- Color-only status indicators (icon + text + color required per WCAG 2.2)

---

## 2. COLOR SYSTEM

### 2.1 Foundation (Deep Navy → Graphite)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-atlas-bg-deep` | `#05070D` | Page canvas, behind shell |
| `--color-atlas-bg-surface` | `#0B1220` | Shell surface (header/sidebar/footer backdrop) |
| `--color-atlas-bg-panel` | `#101827` | Primary content panels, cards |
| `--color-atlas-bg-elevated` | `#162038` | Hovered cards, modals, popovers |
| `--color-atlas-bg-sunken` | `#070B16` | Inset regions, table header stripes |

### 2.2 Neutral Scale (Slate)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-slate-950` | `#0E1424` | Deep borders, dividers |
| `--color-slate-900` | `#192239` | Standard borders, dividers |
| `--color-slate-850` | `#232F4E` | Subtle borders, focus rings faint |
| `--color-slate-800` | `#2D3B5D` | Field borders, inactive |
| `--color-slate-700` | `#41527A` | Disabled UI |
| `--color-slate-600` | `#687CA3` | Muted metadata text |
| `--color-slate-500` | `#8BA2C9` | Secondary text |
| `--color-slate-400` | `#B5C6E0` | Primary body text |
| `--color-slate-300` | `#DCE4F0` | Headings, emphasized |
| `--color-slate-200` | `#F1F5F9` | Page titles, KPI values |
| `--color-white` | `#FFFFFF` | Pure white sparingly |

### 2.3 Primary Accent — Electric Cyan
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-cyan-600` | `#0284C7` | Focus rings, pressed states |
| `--color-cyan-500` | `#0EA5E9` | Interactive element (link/hover) |
| `--color-cyan-400` | `#00D9FF` | **PRIMARY ACCENT** — status active, selected, highlight |
| `--color-cyan-300` | `#57ECFF` | Glow halo, emphasis (rare) |
| `--color-cyan-glow` | `rgba(0, 217, 255, 0.15)` | Box-shadow glow |
| `--color-cyan-glow-strong` | `rgba(0, 217, 255, 0.25)` | Active element glow |

### 2.4 Secondary Accent — Violet/Purple
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-violet-600` | `#7C3AED` | Pressed states, accent secondary |
| `--color-violet-500` | `#8B5CF6` | AI/insight surfaces, badges |
| `--color-violet-400` | `#A78BFA` | AI glow, insight indicators |
| `--color-violet-glow` | `rgba(139, 92, 246, 0.12)` | AI surface glow |

### 2.5 Feedback / Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success-500` | `#10B981` | Healthy/OK/Pass status |
| `--color-success-glow` | `rgba(16, 185, 129, 0.15)` | Success halo |
| `--color-warning-500` | `#F59E0B` | Warning/Monitor/Review |
| `--color-warning-glow` | `rgba(245, 158, 11, 0.15)` | Warning halo |
| `--color-danger-500` | `#EF4444` | Critical/Fail/Blocker |
| `--color-danger-glow` | `rgba(239, 68, 68, 0.15)` | Danger halo |
| `--color-info-500` | `#3B82F6` | Info/General notice |

### 2.6 Status → Color Mapping (WCAG 2.2 AA — color + icon + text)
| Status | Color | Icon | Text | Usage |
|--------|-------|------|------|-------|
| `HEALTHY` / `ONLINE` / `PASS` | success-500 | CheckCircle | Healthy | Nominal operation |
| `WARNING` / `MONITOR` / `REVIEW` | warning-500 | AlertTriangle | Warning | Degraded, needs attention |
| `CRITICAL` / `OFFLINE` / `FAIL` | danger-500 | AlertOctagon | Critical | Blocked, action required |
| `ACTIVE` / `LIVE` / `CONNECTED` | cyan-400 | Activity | Active | Currently running |
| `PROCESSING` / `INGESTING` | violet-400 | Loader (spin) | Processing | In-flight operation |
| `UNKNOWN` / `UNAVAILABLE` | slate-600 | HelpCircle | Unknown | No data / indeterminate |

### 2.7 Finance-Specific Colors (Extensions to Core — no divergence)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-capex` | `#0EA5E9` | Capital expenditure surfaces |
| `--color-opex` | `#8B5CF6` | Operating expenditure surfaces |
| `--color-budget-active` | `#10B981` | Approved/Active budget |
| `--color-budget-draft` | `#F59E0B` | Draft/Under review budget |
| `--color-cash-positive` | `#10B981` | Inflow, receipts, revenue |
| `--color-cash-negative` | `#EF4444` | Outflow, payments, expenses |

---

## 3. TYPOGRAPHY SYSTEM

### 3.1 Font Trinity
| Role | Family | Fallback Stack | Usage |
|------|--------|----------------|-------|
| `--font-sans` | Inter Variable | ui-sans-serif, system-ui | Body, forms, UI labels |
| `--font-display` | Space Grotesk | system-ui, sans-serif | Titles, KPIs, headings, numbers |
| `--font-mono` | JetBrains Mono | ui-monospace, SFMono-Regular | IDs, hashes, timestamps, code, numeric tables |

### 3.2 Hierarchy Scale
| Tier | Class Spec | Size / Leading | Font | Weight | Use Case |
|------|-----------|----------------|------|--------|----------|
| Display — Large | `text-atlas-display-lg` | 64px / 1.0 | Display | 600 | Rare: executive landing, module hero (max 1 per page) |
| Display — Medium | `text-atlas-display-md` | 48px / 1.0 | Display | 600 | Executive brief hero, major page titles |
| Display — Small | `text-atlas-display-sm` | 36px / 1.1 | Display | 500 | Module hero titles, KPI groups |
| H1 — Page Title | `text-atlas-h1` | 32px / 1.2 | Display | 500 | Primary page header, above the fold |
| H2 — Section | `text-atlas-h2` | 24px / 1.25 | Display | 500 | Section headings, workspace titles |
| H3 — Card Header | `text-atlas-h3` | 18px / 1.3 | Sans | 600 | Panel/card headers, module sub-sections |
| H4 — Sub Header | `text-atlas-h4` | 15px / 1.4 | Sans | 600 | Sub-section, filter groups, table column headers |
| Body — Primary | `text-atlas-body` | 14px / 1.6 | Sans | 400 | Paragraphs, descriptions, cell text |
| Body — Secondary | `text-atlas-body-sm` | 13px / 1.5 | Sans | 400 | Secondary info, dense tables |
| Metadata | `text-atlas-meta` | 12px / 1.4 | Sans | 500 | Timestamps, provenance, auxiliary labels |
| Label / Tag | `text-atlas-label` | 11px / 1.0 | Mono | 700 | Status badges, micro-labels, chip text (uppercase tracking-widest) |
| KPI Value | `text-atlas-kpi` | Varies | Display | 500 | Numeric KPI values with tabular numerals |
| Numeric Table | `tabular-nums` | 13px | Mono | 500 | Data tables — aligned columns, consistent widths |

### 3.3 Numbers & Numeric Presentation
- **KPI values**: Use `font-display` with `tabular-nums` + strong baseline
- **Data tables**: Use `font-mono` for numeric columns, right-aligned
- **Currency**: Symbol on left (e.g., `KSh 12,480,000`), 2 decimals maximum unless exact precision needed
- **Percentages**: 1 decimal (e.g., `12.4%`), delta indicator (▲/▼) with semantic color
- **Large counts**: Compact notation for KPIs (`1.28M` not `1,280,000`), full value in tooltip
- **IDs/Hashes**: `font-mono`, truncated at display with full value in tooltip

---

## 4. SPACING SYSTEM (4px Base Grid)

### 4.1 Scale
| Token | px | Tailwind | Usage |
|-------|----|----------|-------|
| `--space-1` | 4 | `p-1` / `gap-1` | Micro: icon-to-text, form field internals |
| `--space-2` | 8 | `p-2` / `gap-2` | Compact: inline pairs, button internal padding |
| `--space-3` | 12 | `p-3` / `gap-3` | Dense: cell padding, compact card internal |
| `--space-4` | 16 | `p-4` / `gap-4` | Default: card padding, form section gap |
| `--space-5` | 20 | `p-5` / `gap-5` | Generous: KPI card internal, hero inner |
| `--space-6` | 24 | `p-6` / `gap-6` | Section: panel padding, between cards grid |
| `--space-8` | 32 | `p-8` / `gap-8` | Layout: page section spacing, workspace padding |
| `--space-10` | 40 | — | Large: hero vertical, major section dividers |
| `--space-12` | 48 | — | Hero/landing vertical spacing |
| `--space-16` | 64 | — | Executive page vertical rhythm |

### 4.2 Density Modes
| Mode | Root Multiplier | Target User | Use Cases |
|------|-----------------|--------------|-----------|
| **Comfortable** | ×1.0 | Default, exec/review | Landing pages, exec dashboards, forms |
| **Standard** | ×0.75 | Analyst default | Data workspaces, mixed tables + charts |
| **Compact** | ×0.5 | Power users, analysts | Large tables, dense monitoring grids |

---

## 5. RADIUS, BORDERS, ELEVATION

### 5.1 Border Radius (Restrained — Enterprise)
| Token | Radius | Usage |
|-------|--------|-------|
| `--radius-xs` | 4px / `rounded` | Buttons, badges, tags, form fields |
| `--radius-sm` | 6px / `rounded-md` | Small cards, compact panels, chip containers |
| `--radius-md` | 10px / `rounded-lg` | **DEFAULT** — cards, panels, modals |
| `--radius-lg` | 16px / `rounded-2xl` | Module heroes, large containers (rare) |
| `--radius-pill` | 999px / `rounded-full` | Status dots, avatar containers, search pills |

**Rule**: Never exceed `--radius-lg` on data workspaces. Rounded corners hide data.

### 5.2 Borders
| Token | Style | Usage |
|-------|-------|-------|
| `--border-subtle` | `1px solid rgba(0,217,255,0.08)` | Card default, non-interactive divisions |
| `--border-standard` | `1px solid rgba(45,59,93,0.6)` | Panel default, standard divisions |
| `--border-active` | `1px solid rgba(0,217,255,0.35)` | Selected card, focused field, active nav item |
| `--border-divider` | `1px solid rgba(45,59,93,0.35)` | Horizontal rule dividers, list separators |
| `--border-focus-ring` | `2px solid rgba(0,217,255,0.5)` | Keyboard focus (2px weight, outer offset 1px) |

### 5.3 Elevation (Shadows + Z-Index)
| Layer | Shadow | Z-Index | Use Case |
|-------|--------|---------|----------|
| Flat (surface) | None | — | Cards on canvas |
| Elevated | `0 4px 20px rgba(0,0,0,0.15)` | 10 | Hovered cards, dropdowns |
| Floating | `0 8px 32px rgba(0,0,0,0.25)` | 20 | Modals, drawers, command palette |
| Overlay backdrop | — | 40 | Modal/drawer scrim |
| Toast/Notification | `0 12px 40px rgba(0,0,0,0.35)` | 60 | Toast stack, alert banners |
| Shell (header/sidebar) | `0 0 0 1px var(--border-standard)` | 40 | Global header, sidebar |
| Loading overlay | — | 80 | Full-page or panel loading |
| Debug/Top | — | 9999 | Dev tools, crash overlay |

**Cyan Glow (Rare — for primary accent only)**:
- Subtle: `0 0 20px rgba(0, 217, 255, 0.08)` — card hover
- Active: `0 0 30px rgba(0, 217, 255, 0.15)` — selected nav, active modal border
- Strong: `0 0 40px rgba(0, 217, 255, 0.22)` — live/connected status badges only

**Rule**: No purple/cyan glow on normal cards. Reserve glow for status indicators, primary selected states, and live surfaces.

---

## 6. MOTION SYSTEM

### 6.1 Motion Tokens (Framer Motion + CSS)
| Speed | Duration | Easing | Use Case |
|-------|----------|--------|----------|
| **Fast** | 120ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover states, button press, icon swap |
| **Normal** | 220ms | `cubic-bezier(0.4, 0, 0.2, 1)` | **DEFAULT** — panel transitions, drawer open, card elevation |
| **Slow** | 350ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Route change, modal enter, hero reveal |
| **Deliberate** | 500ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Executive intro, cinematic transitions (rare) |

### 6.2 Motion Accessibility
- **`prefers-reduced-motion`**: When enabled, ALL animations disabled (opacity 0→1 only, 0ms). Explicitly check in motion wrappers.
- **Continuous animation**: FORBIDDEN on shell/content. Loading spinners are the exception.
- **Page route transitions**: Fade + Y(8px). No scale/rotate on workspace content.
- **Tab/Accordion**: Height collapse + fade.

### 6.3 Forbidden Motions
- Looping particle/canvas animations in the background (`AmbientParticleCanvas` is a static texture)
- GSAP counters on every KPI (use only when value is changing live)
- Auto-playing carousel/slider content
- Parallax scroll effects

---

## 7. BREAKPOINTS & RESPONSIVE

| Token | Width | Layout Mode | Navigation | Tables |
|-------|-------|-------------|------------|--------|
| `2xl` | ≥1536px | Multi-panel, 4-col KPI | Full sidebar with labels | Full columns visible, no wrap |
| `xl` | ≥1280px | 3-col workspaces | Full sidebar with labels | Full columns, horizontal scroll if >12 cols |
| `lg` | ≥1024px | 2-col workspaces | Collapsible sidebar with icons+labels | Sticky first column, horizontal scroll |
| `md` | ≥768px | 1-col stacked | Slide-in drawer (hamburger) | Card-rows transformation: each row = card |
| `sm` | <768px | 1-col mobile | Slide-in drawer | Card-rows, filter drawer, bottom nav actions |

**Responsive Rules**:
- Never "just shrink" desktop layouts. Recompose:
  - KPI grid: 4-col → 2-col → 1-col stacked
  - Side-by-side chart+table → stack vertically on md/sm
  - Table → card-row list on md breakpoint below
  - Global search → collapses to icon button on md

---

## 8. COMPONENT PRIMITIVE SPECIFICATIONS

### 8.1 AtlasPanel — Universal Card/Panel
- Radius: `--radius-md` (10px)
- Border: `--border-subtle` default, `--border-active` on hover/selected
- Background: `--color-atlas-bg-panel`
- Padding: `--space-5` (20px) default, `--space-4` (16px) compact
- Optional: Left accent bar (2px, full height, semantic color) for status/context
- Hover: 1px Y lift, subtle cyan glow, border → `--border-active`
- Structure: Header (h3 + right actions) → Body → Footer (actions, metadata)

### 8.2 AtlasKPI — Intelligence Metric Surface
Structure (top to bottom):
1. **Micro Label** — `text-atlas-label` uppercase, slate-500, tracking-widest
2. **Value** — `text-atlas-display-sm` or `text-atlas-h2`, white/slate-200, tabular-nums
3. **Delta** — Trend indicator (▲/▼), percentage, semantic color (success/danger), comparison period
4. **Status Badge** — Pill with dot + text (HEALTHY / WARNING / CRITICAL / ACTIVE)
5. **Sparkline** (optional) — 60px tall, no axes, color-matched to status
6. **Provenance Meta** (micro) — Source, Period, Last updated timestamp (1 line, mono)

### 8.3 AtlasTable — Enterprise Data Workspace
Features:
- Sticky header row (`--color-atlas-bg-sunken`)
- Column visibility toggle (gear icon)
- Density selector: Comfortable / Standard / Compact
- Sortable columns (asc/desc indicator)
- Per-column filter popovers (not inline clutter)
- Row hover: subtle bg elevation + left 2px cyan bar
- Row selection (checkbox), multi-select bulk actions bar
- Pagination with page size (25 / 50 / 100) + record count
- Responsive: <md breakpoint converts to expandable card rows
- Numeric columns: right-align + mono font
- Status columns: Pill + dot icon

### 8.4 AtlasButton — Enterprise Control
| Variant | Background | Border | Text | Use Case |
|---------|-----------|--------|------|----------|
| Primary | cyan-500 → cyan-400 gradient border | cyan-400/30 | white | **Primary CTA**: 1 per page max |
| Secondary | atlas-bg-panel | standard | slate-200 | Most actions, nav items |
| Ghost | transparent — hover: atlas-bg-elevated | none | slate-400 → slate-200 | Icon buttons, low-priority links |
| Danger | danger-500 | danger-500/50 | white | Destructive actions (delete, reject) |
| Status (Pill) | matching-50/10 | matching/30 | matching-400 | Badges, inline status labels |

Size scale:
- Sm: h-8 px-3 text-xs radius-xs
- Md: h-9 px-4 text-sm radius-sm (default)
- Lg: h-11 px-6 text-sm radius-md (hero CTAs)

### 8.5 AtlasStatusBadge — Status Indicator (WCAG AA)
Composition (required, never color alone):
1. Solid dot (8px pill) — semantic color + inner 1px white ring
2. Label text — `text-atlas-label` uppercase mono bold matching color
3. Optional: tooltip on hover with definition

### 8.6 AtlasDrawer — Contextual Side Panel
- From right: 480px default, 384px narrow, 640px wide
- Backdrop blur: 4px
- Structure: Header (title + close + actions) → Scrollable body → Footer (sticky actions)
- Preserves user context: never navigate away from parent view

### 8.7 AtlasModal — Dialog / Command
- Width: 512px standard, 640px wide, 384px compact
- Centered with 2xl max-width constraint
- Focus trap, ESC closes
- Structure: Header (title + close) → Body → Footer (right-aligned actions)

### 8.8 AtlasEmptyState — Intentional Empty Surface
Content order (centered):
1. Icon (outlined, slate-500, 48px)
2. Title: h3, slate-300
3. Description: body-sm, slate-500 — explains what's missing + why it matters
4. Primary action button: next step user can take
5. Optional: secondary "learn more" link

### 8.9 AtlasErrorState — Failure Surface
Content order:
1. AlertOctagon icon (danger-500, 48px)
2. Title: "Unable to [operation]" (h3, slate-200)
3. Description: Human-readable cause. NO RAW STACK TRACE.
4. Action row: Retry button + Report issue
5. Last-known good state preserved below if available

### 8.10 AtlasInsight / AtlasAIInsight — Intelligence Surface
For real AI-backed content only (NEVER fabricate):
- Left border (2px, violet-500)
- Header: Sparkles icon + "AI INSIGHT" or "AI RECOMMENDATION" label (mono uppercase violet-400)
- Body: Insight statement (body, slate-200)
- Optional sub-section: Primary driver / root cause
- Metadata row: Confidence (if real), Evidence count (N records), Source
- Actions: [Investigate] [View Evidence] [Dismiss]

---

## 9. MODULE PAGE LAYOUT SPEC

Every module page (except Command Center, PROTECTED) follows this adaptive shell structure:

### 9.1 Structure (Top → Bottom)
1. **Module Header** (fixed under global header)
   - Breadcrumb: ATLAS › [Group] › [Module]
   - Title: h1 display-small
   - Description line: body secondary (1-2 sentence purpose)
   - Status row: Live/Connected status pill + Last updated timestamp
   - Action row: Primary CTA (left) + Secondary actions (right)

2. **Intelligence Summary Strip**
   - 4–6 AtlasKPI cards in responsive grid (4 xl → 3 lg → 2 md → 1 sm)
   - No generic stats — each card has: value, delta, status, period, sparkline (if data)

3. **Primary Workspace**
   - Core content: table, chart+table, workflow canvas
   - Use 2-col layout on ≥lg (1 col chart + 1 col detail / 1 col filters + 1 col table)

4. **Secondary Intelligence** (optional section)
   - Insights timeline, AI recommendations, activity feed, alerts

5. **Action Area** (optional, workflow-heavy modules)
   - Next steps, pending approvals, outstanding tasks

### 9.2 Module Hero (Major Modules Only)
- Full-bleed top section with subtle SVG topology/grid backdrop
- Module identity label (uppercase mono, cyan-400, tracking-widest)
- Large title + subtitle
- Live/Connected pill
- Primary + secondary action buttons
- KPI strip embedded at bottom of hero

---

## 10. DENSITY & ACCESSIBILITY BASELINE

### 10.1 WCAG 2.2 AA Requirements (Enforced)
- Color contrast: ≥4.5:1 for all body text (use `--color-slate-300` on bg-panel minimum)
- Focus indicators: Every interactive element gets `--border-focus-ring` on keyboard focus
- Form labels: Visible always (no placeholder-only labels), `for` attribute matches id
- Alt text: All icons with semantic meaning get `aria-label`; decorative = `aria-hidden="true"`
- Tables: `<th scope="col">`, `<caption>`, column headers sticky
- Reduced motion: All animation must check `prefers-reduced-motion`
- Keyboard: Full tab navigation through modules; skip-to-content link

### 10.2 A11y Audit Checklist Per Module
- [ ] All interactive elements focusable via keyboard
- [ ] Focus ring visible, not hidden with `outline:0`
- [ ] Form fields have labels
- [ ] Status indicators use color + icon + text
- [ ] `aria-live` region for dynamic notifications/errors
- [ ] Tables use semantic `<table>` + `<th scope>`
- [ ] Images/decorative SVG: `aria-hidden` or descriptive `aria-label`

---

## 11. TOKEN CODE IMPLEMENTATION MAP

Consolidation target:
```
src/design-system/
├── index.ts              ← Barrel export: ONE import for ALL tokens
├── colors.ts             ← Extended spec (this doc §2)
├── typography.ts         ← Extended spec (this doc §3)
├── spacing.ts            ← Extended spec (this doc §4)
├── radius.ts             ← Extended spec (this doc §5.1)
├── borders.ts            ← NEW (this doc §5.2)
├── elevation.ts          ← NEW (this doc §5.3 = shadows + z-index)
├── motion.ts             ← Extended spec (this doc §6)
├── breakpoints.ts        ← NEW (this doc §7)
└── tokens/
    └── (legacy individual files to be deprecated via re-export)
```

Tailwind theme integration: `src/index.css` `@theme` block unified. Finance module's isolated `tailwind.css` extends core theme via `@import` rather than redefining tokens.

---

## 12. COMPONENT USAGE RULES FOR MODULE TRANSFORMATION

When transforming modules (Phase 4):
1. Import from `src/design-system/index.ts` — never hardcode hex
2. Use `AtlasPanel` instead of raw divs with arbitrary classes
3. Replace inline stat cards with `AtlasKPI`
4. Replace plain `<table>` with `AtlasTable` primitive
5. Replace all ad-hoc status colors with `AtlasStatusBadge`
6. Add missing empty/loading/error states using `AtlasEmptyState` / `AtlasErrorState` / skeleton
7. Wrap AI content (only when real) in `AtlasAIInsight` — never fabricate confidence/evidence
8. Add module header spec per §9 to every non-Command-Center module

---

**END OF DESIGN SYSTEM SPEC — Phase 1**
Next: PHASE 2 — Shell Upgrade & token implementation
