# SALIENCE ATLAS V2 — SYSTEM LAYOUT & NAVIGATION STANDARD
### CLASSIFICATION: CLASS III CRITICAL INFRASTRUCTURE // INFRASTRUCTURE CONSTR // NAV STANDARD

This standard defines the interaction rules, keyboard-first focus models, and search index paths for the **Global Command System** and workspace layout in Salience Atlas V2.

---

## 1. KEYBOARD-FIRST SHORTCUT SCHEMAS

The keyboard is the primary input method for SCM operators. The interface implements nineteen non-bypassable keyboard listeners to ensure fast, mouse-free navigation:

```
┌────────────────────────────────────────────────────────┐
│  Ctrl/Cmd + K : Universal Command Palette Gateway       │
├────────────────────────────────────────────────────────┤
│  Alt + 1      : Focus Left Workspace Navigation Rail   │
│  Alt + 2      : Focus Center Operational Surface       │
│  Alt + 3      : Focus Right Context Intelligence Panel │
├────────────────────────────────────────────────────────┤
│  Alt + T      : Instantly route to Tender Workspace    │
│  Alt + P      : Instantly route to Project Workspace   │
│  Alt + S      : Instantly route to Supplier Workspace  │
│  Alt + C      : Instantly route to Contract Workspace  │
│  Alt + E      : Instantly route to Executive Workspace │
├────────────────────────────────────────────────────────┤
│  Esc          : Exit active search and close moduls    │
└────────────────────────────────────────────────────────┘
```

---

## 2. UNIVERSAL SEARCH INDEX SCHEMA

The Command Palette utilizes a unified search indices structure, prioritizing active operational tasks over static system files:

```
┌────────────────────────────────────────────────────────┐
│  1. ROUTING QUERIES   : Map keywords to Workspaces     │
├────────────────────────────────────────────────────────┤
│  2. REQUISITIONS      : Matches active tender IDs      │
├────────────────────────────────────────────────────────┤
│  3. CONTRACTS/ASSETS  : Matches active legal/materials │
├────────────────────────────────────────────────────────┤
│  4. SYSTEM LOGS       : Matches raw auditing codes     │
└────────────────────────────────────────────────────────┘
```

---

## 3. COMMAND PALETTE SEARCH ENGINE BEHAVIOR

-   **High-Performance Matches**: Executes search matches across active local databases in `< 150ms`.
-   **Fuzzy Keyword Fallbacks**: Supports fuzzy-text routing to catch spelling variations (e.g., matching "tendr" to "Tender Workspace").
-   **Action-Routing Shortcuts**: Allows operators to execute live system actions directly from the command panel (e.g., typing "/approve" to open the Approval Center).

---

## 4. COLLAPSIBLE MODULE SIDEBARS & PERSISTENCE

To maximize workspace utility across desktop and mobile displays, sub-modules (such as Tender AI Studio) support a high-performance collapsible sidebar behavior:

### Layout & Responsiveness
-   **Expanded State**: Sidebar occupies a comfortable desktop width (`320px` / `xl:w-80`) with full system labels and badges.
-   **Collapsed State**: Animates down to an icon-only grid (`80px` / `xl:w-20`) on desktop. On mobile/tablet devices, the menu transforms into a horizontal, scrollable navigation bar (`max-h-[72px]`) to maximize vertical workspace height for evaluation tables and charts.
-   **Maximized Workspace**: The main board automatically scales to use 100% of the freed layout space via Tailwind `flex-1 min-w-0` structure, ensuring responsive chart components and tables resize without clipping or overflow.

### Animations & Transitions
-   Smooth CSS ease-in-out transitions (`transition-all duration-300`) animate the panel's width/height adjustments.

### State Persistence
-   The expanded/collapsed state is synchronized to `localStorage` under the key `tender_sidebar_collapsed` to preserve the operator's preference across page reloads.

### Accessibility Standards (ARIA)
-   **ARIA Labels**: The toggle button includes descriptive `aria-label` properties (`Expand Workspace Sidebar` / `Collapse Workspace Sidebar`) and native system tooltips (`title`) indicating state.
-   **Focus Indicators**: Supports standard keyboard navigation focus states (`hover:bg-white/5 cursor-pointer`) and visual indicators (soft primary border glow in active states).

---

This unified navigation standard minimizes operator delay, securing fast system performance during high-stress supply chain disruptions.
