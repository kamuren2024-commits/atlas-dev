# Salience Atlas V2 - Cognitive Observability & Audit Telemetry

Salience Atlas V2 logs comprehensive runtime telemetry and maintains an immutable compliance ledger for SCM governance.

## Observable Performance Telemetry

The system continuously tracks active provider health status:
- **Availability Scores**: Tracks request success rates on an exponential moving average (EMA) scale.
- **Latency Matrices**: Dynamic average response times tracked in milliseconds.
- **Quota Tallying**: Logs HTTP 429 rate limit counts to trigger preemptive routing path redirects.
- **Token Metrics**: Maps real-time prompt and completion token counts per query, module, and agent.

## Compliance Auditing (PPADA Enforced)

Every intelligence-driven operation writes an immutable trace to the `AuditLedger`. This is required for procurement compliance reviews and audits under Part XII of the Kenya Public Procurement and Asset Disposal Act (PPADA).

Each audit log captures:
- **Request ID / Hash**: For content verification and cryptographic deduplication checks.
- **Responding Provider & Model**: Exact network node that generated the text.
- **Latency & Cost**: Financial footprint mapping.
- **Origin Metadata**: Ingesting User ID, Module, and active SCM Workflow tag.
- **Resilience Flags**: Identifies if emergency fallbacks or cache lookups were triggered.
