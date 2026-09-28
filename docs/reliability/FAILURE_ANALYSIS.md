# FAILURE MODE & EFFECTS ANALYSIS (FMEA)

This document maps potential system failures, their downstream operational impacts, and automated remediation playbooks.

---

## 1. FMEA Risk Matrix

| Component | Failure Mode | Severity | Mitigation | Recovery Action |
| :--- | :--- | :---: | :--- | :--- |
| **API Server** | Node crash | High | Auto-healing GKE pods | Automated pod restart |
| **Database** | Primary node fail | Critical | Multi-zone replica cluster | Auto-failover promotion |
| **LLM Service** | Rate limits | Medium | Backup API provider route | Fallback endpoint swap |
| **Redis Cache**| Memory exhaust | Medium | LRU eviction policies | Cache refresh & reload |

---

## 2. Escapes and Triggers

Any transition of severity indicators from Medium to High alerts the SRE On-Call Engineer instantly via PagerDuty.
