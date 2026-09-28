# SALIENCE ATLAS V2 — MISSION CONTROL FRONTEND CONSTITUTION
### CLASSIFICATION: CLASS III CRITICAL INFRASTRUCTURE // DESIGN SYSTEM // STANDARD OPERATING REGULATION

This constitution establishes the structural, visual, and operational rules governing the Salience Atlas V2 user interface. Acting as a visual operating system (OS) rather than a flat consumer dashboard, the interface is designed as an interactive, high-density projection of the SCM Agent OS, SCM Digital Twins, and SCM Decision Graph.

---

## 1. STRATEGIC STANDARDS & ARCHITECTURAL INSPIRATION

The layout, information layout, and navigation paradigms are modelled directly on world-class, mission-critical systems:

*   **Palantir Foundry & AIP**: Action-routing, multi-layered data graphs, and context-preserving workspace setups.
*   **Anduril Lattice**: Multi-domain real-time sensor integration, event streams, and tactical alerts.
*   **Bloomberg Terminal**: Maximum data density, keyboard-first navigation paths, and zero decorative spacing waste.
*   **Linear & Vercel**: Fluid transitions, minimal design offsets, high typographic legibility, and refined visual rhythm.
*   **C4ISR Command Systems**: Real-time operational monitoring, situational awareness, and three-panel layouts.

---

## 2. INTEGRAL FRONTEND LAYOUT LAYERS

The application is built across five independent functional layers to manage rendering paths and user workflows:

```
┌────────────────────────────────────────────────────────┐
│  LAYER 1: MISSION SHELL (Global Command, Nav, Inbox)   │
└─────────────────────────────────────┬──────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────┐
│  LAYER 2: WORKSPACE FRAMEWORK (Role-Based Subsystem)   │
└─────────────────────────────────────┬──────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────┐
│  LAYER 3: ENTITY VIEWS (Digital Twin Projections)      │
└─────────────────────────────────────┬──────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────┐
│  LAYER 4: DECISION VIEWS (Audit trail, Evidence, Alt)   │
└─────────────────────────────────────┬──────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────┐
│  LAYER 5: OPERATIONAL VIEWS (Tables, Maps, Timelines)  │
└────────────────────────────────────────────────────────┘
```

---

## 3. THREE-PANEL ARCHITECTURE

To prevent context-switching and keep the operator focused, all Workspaces follow a strict **Three-Panel Layout**:

### 3.1 Left Panel: Mission Navigation & Live Actions
-   *Width*: 64px (Collapsed) to 240px (Expanded).
-   *Purpose*: Houses the persistent application navigation, system mode selectors, and critical node indicators.
-   *Interaction*: Keyboard shortcuts `Alt + 1` to target/toggle focus.

### 3.2 Center Panel: Primary Operational Surface
-   *Width*: Flexible (60% to 70% viewport).
-   *Purpose*: Renders active data lists, geographical maps, project timelines, and node relationships.
-   *Interaction*: Zero-friction vertical scroll with keyboard arrow traversal.

### 3.3 Right Panel: Context Intelligence Panel
-   *Width*: 320px to 420px.
-   *Purpose*: Displays real-time risks, active agent reasoning, related approvals, and audit trails for the selected item in the Center Panel.
-   *Interaction*: Slide-out overlay or side-by-side layout, preventing the user from losing context.

---

## 4. MISSION PRINCIPLES ON EXPLAINABILITY & AUDITS

-   **Zero Dashboard Clutter**: Remove progress bars, visual noise, or unrequested summary charts. Proactively expose actionable, high-density data tables and real-world compliance checklists.
-   **No Silent Actions**: Every approval change must write to the ledger with the user's signature, logging *Who*, *When*, *Why*, and the *Factual Evidence* relied upon.
-   **No Unrequested Theme Option**: Force a high-contrast dark space theme to reduce eye fatigue for operators managing complex capital networks.
-   **Progression-via-Disclosure**: Show the core data first, allowing operators to click or hover to drill down into complex specifications.

This constitution must be adhered to across all future development modules.
