# MISSION CONTROL SPECIFICATION

This document details layout wireframes, live DAG charts, and telemetry controls of the Mission Control Console.

---

## 1. Visual Layout & Component Mapping

The Mission Control dashboard provides SREs with structural views of active task Directed Acyclic Graphs:

```
  ┌─────────────────────────────────────────────────────────┐
  │                   MISSION DAG CONSOLE                   │
  ├─────────────────────────────────────────────────────────┤
  │ [Fetch Spares: Green] ──► [Score Bids: Progress (64%)]  │
  │                              └──► [Verify: Pending]     │
  └─────────────────────────────────────────────────────────┘
```

---

## 2. Key Dashboard Components

* **Interactive DAG Board**: Visualizes task nodes with color-coded states (Pending, Running, Succeeded, Failed).
* **Live Logs Feed**: Displays real-time streaming execution telemetry directly from GKE container stdout.
* **Manual Mitigation Drawer**: Enables operators to select failed tasks and force retries or execute overrides.
