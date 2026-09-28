# SEMANTIC REASONING & INFERENCE ENGINE

This document details the semantic inference rules and logical operators used to traverse SCM data.

---

## 1. Rule-Based Reasoning Engine

The inference engine runs logic rules to deduce hidden relationships from existing graph assertions:

```
   IF SupplierA is AFFILIATED_WITH SupplierB
   AND SupplierB SUBMITS_BID for TenderX
   AND SupplierA SUBMITS_BID for TenderX
   THEN CollusionRisk is HIGH
```

---

## 2. Reasoning Protocols

* **Transitivities**: Propagates infrastructure dependencies through asset strings (e.g., SubstationA depends on LineB, which depends on SubstationC).
* **Logical Consistency Checks**: Identifies conflicting assertions (e.g., an asset marked as both active and decommissioned simultaneously) and flags them for human review.
