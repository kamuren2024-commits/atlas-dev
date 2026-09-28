# METRIC CATALOG REGISTER

This is the unified directory of all telemetry, financial, and AI metric definitions.

---

## 1. Catalog Definition Rules

To prevent metrics inflation, every tracked KPI must register an entry in this catalog:

| Metric Name | Domain | Formula / Definition | Target Threshold |
| :--- | :--- | :--- | :---: |
| `scm_grid_capacity_mw` | Grid Engineering | Active power flow output capacity | $> 350$ MW |
| `scm_tender_audit_avg_days` | Procurement | Avg days to complete bid audit | $\le 10$ Days |
| `finops_prompt_cache_hit_ratio`| FinOps | Redis prompt cache hits / total hits | $\ge 80\%$ |
| `ai_inference_avg_latency_ms` | Platform Operations | Avg API inference time | $\le 450$ ms |

---

## 2. Metadata Tagging

All cataloged metrics are tagged with environmental markers to enable slicing across Dev, Staging, and Production setups.
