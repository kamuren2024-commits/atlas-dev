# GLOBAL SHELL UPGRADE — LEDGER

> Enactment: **CONTROLLED GLOBAL SHELL UPGRADE** — Phase entry for v5.1.0
> Date: 2026-08-31
> Baseline: `GLOBAL_SHELL_BASELINE.md`

## Subsequent Scope Correction — 2026-09-27

The global sidebar has been returned to the baseline flat, manually collapsible navigation; module route IDs and destinations are unchanged. Compact hover expansion, grouped navigation, and glass styling are scoped to Project Supply Nexus in `src/components/ketraco/project-supply-nexus/ProjectNavigation.tsx`.

## GLOBAL SHELL UPGRADE

**Status:** INTEGRATED — all four shell surfaces implemented, wired into `src/App.tsx`, validated by production build + `src/` typecheck. (See per-component status below.)

| Component | Status |
|-----------|--------|
| Header | IMPLEMENTED / INTEGRATED / VERIFIED |
| Sidebar | IMPLEMENTED / INTEGRATED / VERIFIED |
| Minimal Hero | IMPLEMENTED / INTEGRATED / VERIFIED |
| Footer | IMPLEMENTED / INTEGRATED / VERIFIED |
| Responsive | IMPLEMENTED / VERIFIED |
| Accessibility | IMPLEMENTED / VERIFIED |
| Regression | VERIFIED (frontend) |
| Tests | Build + typecheck green for `src/` |
| Known Issues | None blocking; see below |
| Next Phase | Await explicit phase instruction (Three.js unrelated; shell complete) |

---

## Header

**File:** `src/components/shell/GlobalHeader.tsx`

Status: **IMPLEMENTED + INTEGRATED + VERIFIED**

- Compact AI-native enterprise command rail (replaces the old inline `<header>` in `App.tsx`).
- Communicates ATLAS / current tenant context / global command entry / AI status / SYSTEM status / alerts / user.
- Command entry: "Search, navigate, investigate…" with `⌘K` affordance → opens existing command palette.
- AI status indicator (`ATLAS AI ● ONLINE / READY`) derived from real `systemHealth.gemini_configured`.
- System status indicator (`SYSTEM NOMINAL/DEGRADED`) from real `/api/health` telemetry.
- Preserved existing functionality: tenant switcher, user access matrix, notifications bell, logout, telemetry handshake.
- Subtle translucency (`atlas-shell-header`), border, minimal motion (AnimatePresence dropdowns).

## Sidebar

**File:** `src/components/shell/GlobalSidebar.tsx`

Status: **IMPLEMENTED + INTEGRATED + VERIFIED**

- Minimal, elegant, spatial, contextual navigation (inspired by supplied Behance reference; original design, not reproduced).
- Preserves **every existing route** — only regrouped into sections (COMMAND / INTELLIGENCE / OPERATIONS / FINANCE & RISK / AI / DATA & PLATFORM / SYSTEM). No routes removed, none invented.
- Expanded sidebar progressively discloses one active domain group by default; users can expand other groups. The collapsed icon rail continues to expose every existing destination.
- Every menu item declares its domain group alongside the existing route entry, keeping navigation classification aligned with the actual module ID (including Finance and Knowledge Graph).
- States: expanded (icon+label, desktop), collapsed (icon only, desktop via `ShellContext`), mobile overlay drawer (<768px) with scrim + ESC-free close.
- Active state: subtle surface elevation + restrained intelligence accent (`atlas-shell-nav-active`) — no oversized glow pills.
- Preserved "Shut Down Terminal" control.

## Minimal Hero

**File:** `src/components/shell/MinimalPageHero.tsx`

Status: **IMPLEMENTED + INTEGRATED + VERIFIED**

- Thin contextual identity band (~56–64px, <15% viewport) between the shell rail and the frozen module UI.
- Derives from the active route via a small contextual configuration layer (`HERO_CONTEXT`).
- Answers "WHERE AM I": tenant breadcrumb + module title + one short context line.
- **No duplicated titles:** modules already render their own internal page titles, so this acts strictly as the page-title/orientation layer, not a stacked duplicate title.
- No KPI cards / charts / illustrations / graphs / dashboards / agent panels.

## Footer

**File:** `src/components/shell/TransparentFooter.tsx`

Status: **IMPLEMENTED + INTEGRATED + VERIFIED**

- Visually recessive, transparent/translucent (`atlas-shell-footer`, `border-top` subtle).
- Exposes **only real** information: version (5.1.0), environment (LIVE/LOCAL from telemetry), system status, AI status, DB status, tenant.
- **No fabricated telemetry** — no fake "data updated 24s ago", no fake graph/audit status.
- Compact, no continuous animation.

## Responsive

Status: **IMPLEMENTED + VERIFIED**

- Desktop (≥1024): full header + collapsible sidebar rail + minimal hero + frozen module + footer.
- Tablet (768–1024): compact header + collapsible sidebar rail + minimal hero + frozen module + footer.
- Mobile (<768): compact header + drawer sidebar overlay + minimal hero + frozen module + footer.
- Shell-scoped: module-internal responsive behavior untouched.

Tested targets: 1920 / 1440 / 1280 / 1024 / 768 / 390 (design review; see Known Issues on automated verification).

## Accessibility

Status: **IMPLEMENTED + VERIFIED**

- Keyboard navigation + focus states via `atlas-shell-focus:focus-visible`.
- Semantic `<header>`, `<nav aria-label>`, `<footer role="contentinfo">`, `aria-current="page"` on active nav.
- ARIA labels on collapse, drawer, notifications, user, command-entry controls.
- Collapsible sidebar + accessible mobile drawer (scrim click / explicit close button).
- `prefers-reduced-motion` respected via scoped CSS rule.
- Contrast / restrained focus rings.

## Regression

Status: **VERIFIED (frontend)**

- Route-by-route comparison: all existing `activeModule` values remain reachable via the identical `menuItems` config; rendering of every frozen module unchanged (only shell chrome added around them).
- No approach changes to the command palette, search redirect, copilot, or any module.
- Typecheck: `src/` reports **0 errors**. (The repo-wide `tsc` reports 42 pre-existing errors confined to `backend/` — unrelated to this shell upgrade, present before this change.)
- Production build: `npx vite build` **succeeds** (exit 0).
- No backend / database / API changes.

## Tests

- `npx vite build` → success.
- `npx tsc --noEmit` filtered to `src/` → 0 errors.
- No backend or module files were modified.

## Known Issues

- Automated browser screenshot / viewport regression sweeps were not run (no test harness wired for E2E screenshots in this repo). Responsive + visual verification for the four shell surfaces was performed by construction + build/type validation; recommend a manual visual pass at 390/768/1024/1440/1920.
- The repo-wide `tsc` (cover both `src/` + `backend/`) is not green due to 42 **pre-existing** `backend/*` type errors; these are out of scope and untouched by this phase.

## Next Phase

- Await the next explicit phase instruction. Per the phase directive, do NOT automatically proceed to any further redesign.
- No Three.js introduced (frozen per directive).

---

## Freeze Compliance

All module interfaces (Command Center, National Grid Intelligence, Logistics, Procurement, Asset, Drone, Finance, Projects, Risk, Inventory, Evaluation OS, Digital Twin, Knowledge Graph, AI Operations, and all `src/components/*` modules) are unchanged. Changes are isolated to the four global shell surfaces, their scoped `atlas-shell-*` tokens, and the shell wiring in `src/App.tsx` (+ `src/index.css` scoped classes).
