# Simulation Ledger

| Scenario ID | Trigger | Result | Evidence/status |
|---|---|---|---|
| PSN-SIM-001 | Critical material shortage | Calculation returned `SHORTAGE` with projected shortage 40 for requirement 100, stock 40, reserved 10, open PO 30 | Deterministic unit invocation; DERIVED |
| PSN-SIM-002 | No project requirements | API contract returns `UNAVAILABLE`; no readiness claim | Migration has no seed rows; expected |
| PSN-SIM-003 | Shipment delay/customs hold | Not simulated; no validated customs/milestone source | BLOCKED / UNAVAILABLE |
| PSN-SIM-004 | Supplier failure or requirement increase | Not simulated; no write/action contract | BLOCKED / human-gated |

Actual production outcomes are not fabricated.
