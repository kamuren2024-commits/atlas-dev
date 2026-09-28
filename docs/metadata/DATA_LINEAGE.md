# DATA LINEAGE FLOWS

This document details dataset flows, lineage calculations, and schema propagation chains.

---

## 1. Traceability Pipeline

We map downstream dependencies to evaluate how upstream modifications propagate across SCM workflows:

```
  [ Raw SAP MM Database ] ──► [ Virtualization Layer ] ──► [ Data Product: dp_grid_twin ]
                                                                      │
                                                           [ Downstream Command Center ]
```

---

## 2. Dynamic Lineage Auditing

Lineage flows are represented as Directed Acyclic Graphs (DAGs). Changes in upstream column definitions generate automated warnings to downstream service owners.
