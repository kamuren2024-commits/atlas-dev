# GLOBAL SHELL BASELINE (LOOP 01 — AUDIT)

> Enactment: **CONTROLLED GLOBAL SHELL UPGRADE** — v5.1.0
> Date: 2026-08-31
> Status: AUDIT COMPLETE — baseline recorded before any UI change.

## Current Header

Inline `<header>` inside `src/App.tsx` (`AppInner`, lines ~787–1015).

- `sticky top-0 z-45`, `bg-[#162136]/80 backdrop-blur-md`, `border-b border-cyan-500/18`.
- Left: Compass brand block + `SALIENCE ATLAS` + version + tenant badge.
- Center: AI universal search input (keyword → module redirect via `handleNavSearch`), `/` command-palette button.
- Right: tenant dropdown, user access-matrix dropdown, notifications bell.
- **Note:** This header already carries search + command palette + tenant + user. No global footer exists.

## Current Header Features

- Brand + version chip
- Tenant badge
- Search input (keywords → module navigation)
- `/` + `Ctrl/Cmd+K` command palette
- Tenant switcher dropdown
- User privileges / access matrix dropdown (logout + telemetry handshake)
- Notifications bell + overlay

## Current Sidebar

Inline `<nav id="left-sidebar-rail">` inside `src/App.tsx` (`AppInner`, lines ~1019–1087).

- Single flat list of `menuItems` (11+ items) with `icon + label + desc`.
- Collapsible rail (`railCollapsed` toggles `w-18` vs `w-64`).
- Active state: `bg-[#101827] border-cyan-500/30 text-[#00D9FF]`.
- Bottom: "Shut Down Terminal" control.
- Section header "SCM Domains" when expanded.
- **No section grouping** — one long flat list.

## Current Sidebar Features

- Collapse/expand toggle
- Flat menu of enabled modules (filtered by tenant `currentTenant.modules`)
- Active route highlight
- Bottom shutdown control

## Current Footer

**NONE.** The global application shell has no global footer.

(An unrelated `<footer>` exists inside a module: `src/components/ketraco/tender/enterprise-evaluation/EnterpriseEvaluationEngine.tsx`. This is module-scoped and **FROZEN / DO NOT MODIFY**.)

## Current Hero / Page Header

**NONE.** There is no global page hero layer.

Each module renders its own internal `<h1>` page title inside the main board (examples):
- `OverviewController` → `CommandCenterShell` (has own `GridHeader` / Command Center UI)
- `DroneIntelligenceModule` → `<h1>Autonomous Grid Inspection</h1>`
- `AiOperationsCenter` → `<h1>AI Operations & Federation Center</h1>`
- `InventoryHub` → `<h1>Inventory Intelligence Hub</h1>`
- `ScmContractIntelligence` → `<h1>Autonomous Contract Intelligence Network</h1>`

> **LOOP 04 constraint:** Because modules already carry their own internal page titles, the global `MinimalPageHero` MUST NOT render a duplicate title. It will act strictly as a thin contextual identity/breadcrumb layer.

## Shared Layout (Shell Composition)

All shell + module rendering lives inside a single `AppInner` in `src/App.tsx`:

```
TenantProvider
└── AppInner
    ├── [Intro gate] (12s splash)
    ├── [Auth gate]  (login)
    ├── min-h-screen flex flex-col
    │   ├── Ambient background (blobs + AmbientParticleCanvas)
    │   ├── <header>   ← GLOBAL HEADER (replace)
    │   ├── <div id="shell-container" flex-1 flex overflow-hidden>
    │   │   ├── <nav id="left-sidebar-rail">         ← GLOBAL SIDEBAR (replace)
    │   │   └── <main id="workspace-main-board">      ← EXISTING MODULES (FROZEN)
    │   │       ├── AnimatePresence → per-module motion.div render
    │   │       └── <ScmCopilot> drawer
    │   └── <AnimatePresence> command palette modal
```

## Affected Routes

Routing is **client-side state** (`activeModule`) not path-based router. `AppInner` maps `activeModule` → URL via `window.history.replaceState` and renders the matching module.

Existing `activeModule` ids (must all remain reachable / unchanged):

`overview` (Command Center) · `tender` · `project` · `inventory` · `supplier` · `logistics` · `risk` · `decision` · `acin` · `drone-intelligence` · `procurement-graph` · `intelligence` · `twin` · `sourcing` · `executive` · `agents` · `ai-ops` · `ai-runtime` · `admin`

URLs: `/<activeModule>` (plus `/drone-intelligence/...` prefix).

## Reusable Components

- `src/context/TenantContext.tsx` — `useTenant()` (currentTenant, switchTenant, userProfile).
- `src/utils/ai.ts` — `checkSystemHealth()` → real `/api/health` telemetry (`status`, `database`, `gemini_configured`, `version`).
- `src/components/ui/EnterpriseComponents.tsx` — `TenantBadge`, `PermissionBadge`.
- `motion` (`motion/react`) and `lucide-react` already in use.
- Design tokens: `src/design-system/tokens/*` (`colors`, `spacing`, `radius`, `shadows`, `motion`, `typography`).

## Design Tokens

Tailwind v4 via `@theme` in `src/index.css`: slate scale, cyan (`#00E1FF`, `#00D9FF`), emerald, rose, plus `--font-sans/display/mono`.

Design-token modules: `colors` (`bg.deep/surface/panel`, `intelligence.active #00D9FF`, `text`, `border`), `spacing`, `radius`, `shadows`, `motionTokens`, `typography`.

Shell-scoped tokens to be introduced under **`atlas-shell-*`** so the upgrade does not cascade into frozen modules.

## Dependencies

- `react` ^19, `react-dom` ^19, `motion` ^12 (Framer Motion), `lucide-react` ^0.546, `gsap` ^3.15, tailwind v4.
- Build: `vite build`. Validate: `npm run lint` (`tsc --noEmit`).

## FREEZE RULE — DO NOT MODIFY

Explicitly frozen module interfaces (no layout/cards/charts/tables/workflows/forms/graph/maps/hierarchy/logic/API/data-model/style changes):

- **Command Center** (`CommandCenterShell`, `GridHeader`, all `command-center/*`)
- National Grid Intelligence · Logistics Intelligence · Procurement Intelligence · Asset Intelligence · Drone Intelligence
- Finance · Projects · Risk · Inventory · Evaluation OS · Digital Twin · Knowledge Graph · AI Operations
- All `src/components/ketraco/*`, `src/components/intelligence/*`, `src/components/ai-runtime/*`, `src/components/graph/*`, `src/components/twin/*`, `src/components/AgentStudio*`, `AtlasChat*`, `ModelOrchestration*`, `VisionIntelligence*`, `DocumentIntelligence*`, `DeepResearch*`, `KnowledgeCortex*`, `AnalyticsIntelligence*`, `ExecutiveCommand*`, `WorkflowDesigner*`
- All backend/API/database behavior
- No business logic, backend, DB, or API changes

Only the four global shell surfaces (header / sidebar / minimal hero / transparent footer) + their required scoped tokens + responsive shell behavior may change.
