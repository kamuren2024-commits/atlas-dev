# OBSERVABILITY BASELINE — KETRACO SCM Intelligence Nexus

This observability guide establishes telemetry, health monitoring, error budgeting, and logging guidelines for the KETRACO SCM Intelligence Nexus.

---

## 1. System Logging Architecture

The platform uses a structured, JSON-compatible stdout logger on the server to facilitate parsing by cloud aggregation agents (e.g., Google Cloud Logging, fluentd).

### Standard Log Levels:
* **`DEBUG`**: Diagnostic dumps, internal variable configurations, and preflight checklist reviews.
* **`INFO`**: Normal SCM transaction boundaries, user sessions, simulation triggers, and standard API fetches.
* **`WARN`**: Minor issues like a missing key for an inactive provider, dynamic `.env` regenerations, or high latency.
* **`ERROR`**: Server exceptions, database disconnects, or complete provider timeouts.
* **`SECURITY_ALERT`**: Emitted upon hardcoded credential matches, forbidden reference access, or `.env` modification detections.

---

## 2. Service Level Indicators (SLI) & Service Level Objectives (SLO)

To guarantee enterprise-grade operational uptime:

| System Metric | Service Level Indicator (SLI) | Service Level Objective (SLO) | Error Budget (Monthly) |
| :--- | :--- | :--- | :--- |
| **API Availability** | Percentage of HTTP 200/201 responses from Express routes. | **$\ge 99.9\%$** | 43 minutes of downtime |
| **SCM Twin Latency** | Duration to calculate logistics Monte Carlo simulation paths. | **$\le 1.5$ seconds** (95th percentile) | 5% slow transactions |
| **AI Federation Uptime** | Successful prompt delivery with fallback routing. | **$\ge 99.95\%$** | 21 minutes of AI failure |
| **Data Integrity** | Matches on `.env` SHA-256 integrity checks. | **100%** (Zero altered states) | 0 minutes (Hard halt) |

---

## 3. Alerts & Incident Response Flow

When a Service Level Objective is threatened or a `SECURITY_ALERT` is triggered, the platform initiates the following incident playbook:

```
                  [ Alert Triggered ]
                           │
                           ▼
          [ Incident Categorization & Triage ]
                           │
         ┌─────────────────┴─────────────────┐
  [ Severity 1: SECURITY ]         [ Severity 2: OUTAGE ]
         │                                   │
         ▼                                   ▼
• Terminate compromised keys.        • Rotate keys via KeysVault.
• Reconstruct sterile .env.          • Fall back to secondary provider.
• Page Security SRE Lead.            • Page SCM Operations Lead.
         │                                   │
         └─────────────────┬─────────────────┘
                           ▼
              [ Post-Mortem Logging ]
```

### SLA Targets for SRE Triage:
* **Severity 1 (Security Compromise / Core Server Outage)**: 15-minute response target; 1-hour resolution.
* **Severity 2 (AI Provider Outage / Simulation Degradation)**: 30-minute response target; 2-hour resolution.
* **Severity 3 (Minor Visual glitches / Telemetry delay)**: 24-hour response target.
