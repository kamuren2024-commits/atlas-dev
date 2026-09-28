# COMPLEX EVENT CORRELATION (CEP) ENGINE

This document details the complex event correlation logic utilized to detect fraudulent bidder groups and critical grid cascading failures.

---

## 1. Multi-Event Correlation Patterns

The CEP engine continuously correlates separate streams to identify patterns:

```
  Event A (Bid SCM Submission from IP X)
  + Event B (Bid SCM Submission from IP X within 120s by different Company)
  ==> Emit "CollusionWarning" (Confidence 0.94)
```

---

## 2. Temporal Analysis

* **Tumbling Correlators**: Groups events within static, non-overlapping 1-hour boundaries to analyze regional bid frequencies.
* **Session Trackers**: Monitors supplier interaction patterns on the portal to alert security on anomalous scraping activity.
