# Module 04 — Project Supply Nexus

Change ID: `ATLAS-PSN-001` (2026-09-06)

Project Supply Nexus is an evidence-backed read layer connecting persisted
project requirements to existing logistics stock, order-item and shipment
evidence. It intentionally reports `UNAVAILABLE` when no requirements are
persisted; it does not manufacture project health, readiness, cost or dates.

Route: `/api/project-supply`.

This is a validated implementation subset, not a production-ready end-to-end
project control system. Procurement, contract, customs, site delivery,
milestone scheduling, workflow execution and AI tools remain partial or
unavailable.
