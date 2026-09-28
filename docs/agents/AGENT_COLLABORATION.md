# AGENT COLLABORATION PATTERNS

This document outlines collaborative patterns, shared blackboards, and data synchronization across KETRACO agents.

---

## 1. Shared Blackboard Architecture

When tackling complex multi-step objectives, agents write intermediate results to a shared, transactional Blackboard state store:

```
  [ Agent A: Write Score ] ──► [ Shared Blackboard Store ] ──► [ Agent B: Read Score ]
```

---

## 2. Collaboration Handshakes

* **Bid Verification Handshake**: Audit Agent scores compliance and passes result to Risk Agent for aggregate calculations.
* **Sourcing Mitigation Handshake**: Logistics Agent detects delays and requests Alternative Sourcing Agent to run simulations.
* **Policy Review Handshake**: Planning Agent designs task graphs and prompts Policy Agent for strict compliance validation.
