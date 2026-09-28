# RISK SCORING METHODOLOGIES

This document defines risk calculations, penalty thresholds, and hazard classification matrices.

---

## 1. Risk Vector Classifications

We calculate risk quotients using four granular risk categories:

| Risk Class | Key Calculation Metric | High Risk Bound | Remediation Action |
| :--- | :--- | :---: | :--- |
| **Bid Integrity** | Overlapping IP addresses or metadata | Overlap detected | Automatic bid quarantine |
| **Financial Solvency**| Debt-to-equity ratios, tax filings | Ratio $> 2.5$ | Soft flag to audit board |
| **Grid Capacity** | Peak load capacity thresholds | Capacity $> 92\%$ | Trigger spare orders |
| **Geopolitical Delay**| Shipping port congestion levels | Delay $> 10$ Days | Re-route supply chain |

---

## 2. Aggregation Algorithm

The overall risk score is calculated as a weighted geometric mean:

$$R_{\text{total}} = \prod_{i=1}^{n} w_i \cdot R_i$$

This prevents a single critical risk from being masked by lower average risk factors.
