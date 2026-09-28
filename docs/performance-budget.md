# SALIENCE ATLAS V2 — SYSTEM PERFORMANCE BUDGET
### CLASSIFICATION: CLASS III CRITICAL INFRASTRUCTURE // INFRASTRUCTURE CONSTR // PERFORMANCE BUDGET

This specification details the response budget limits, asset payload restrictions, and transaction latency boundaries designed for Salience Atlas V2.

---

## 1. TRANSACTION LATENCY BUDGET LIMITS

To prevent system delays during high-stress operational changes, the platform must comply with six transaction latency limits:

```
┌────────────────────────────────────────────────────────┐
│  FIRST MODULE BOOT  : < 2.0 Seconds (Cold Launch)      │
├────────────────────────────────────────────────────────┤
│  WORKSPACE SWITCH   : < 500ms (Transitions)            │
├────────────────────────────────────────────────────────┤
│  COMMAND PALETTE    : < 200ms (Fuzzy search)           │
├────────────────────────────────────────────────────────┤
│  DIGITAL TWIN BOOT  : < 300ms (Entity details)         │
├────────────────────────────────────────────────────────┤
│  DECISION OVERLAYS  : < 150ms (Alternative comparisons)│
├────────────────────────────────────────────────────────┤
│  APPROVAL ACTION    : < 100ms (Signature write ops)    │
└────────────────────────────────────────────────────────┘
```

---

## 2. PAYLOAD STORAGE RESTRICTIONS

To maintain fast load-times across remote field devices, build assets are subject to strict size caps:

-   **Compressed App Bundle Size**: The compiled index JavaScript bundle must remain below `350 KB` compressed.
-   **Static Image Allocations**: Flat image files are forbidden. All interface icons must be lightweight vectors.
-   **Database Cache Footprint**: Locally cached workspace records must remain below `15 MB` in browser localStorage/IndexedDB.

---

## 3. CORE RENDERING CRITERIA

-   **Avoid Unnecessary Re-renders**: Protect useEffect parameters and child renders to ensure the main interface maintains a smooth 60fps frame rate.
-   **Deferred Resource Loading**: Lazily load secondary module assets (such as GIS maps or network models) after the core Mission Shell loads, ensuring the operator interface remains functional.

By enforcing these performance budgets, Salience Atlas V2 guarantees that critical supply-chain operations are never delayed by slow software components.
