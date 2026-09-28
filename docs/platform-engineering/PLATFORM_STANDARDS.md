# PLATFORM STANDARDS & CONVENTIONS

This document defines the engineering standards, protocol requirements, and design policies governing KETRACO SCM platform components.

---

## 1. Programming Languages & Runtimes

To maintain operational excellence, the platform supports a curated set of runtimes:

* **TypeScript / Node.js (v20+)**: Default for API gateway, BFF (Backend for Frontend), and web interface layers.
* **Python (v3.11+)**: Default for data science pipelines, ML integrations, and advanced mathematical optimizations.
* **Go (v1.21+)**: Used strictly for high-throughput, low-latency network routers and shared system daemons.

---

## 2. API Communication Standards

* **REST JSON (OpenAPI v3.0)**: Used for client-to-gateway interfaces. Must include standard pagination, structured error envelopes, and rate-limiting headers.
* **gRPC (HTTP/2 with Protobuf)**: Used for inter-service communication inside the mesh. Enforces compile-time schema verification and binary efficiency.
* **Events (CloudEvents v1.0)**: Used for asynchronous event-driven states (e.g. "supply disruption detected"). Payload envelope must include timestamp, trace ID, and publisher identity.

---

## 3. Container Standards

All container images must adhere to the following security and operational baselines:
* **Base Images**: Use scratch, distroless, or Alpine images to limit CVE surfaces.
* **User Permission**: Must run as a non-root user (`UID 10001` or similar). `USER root` is strictly prohibited.
* **Probes**: Implement active `/healthz/live` (liveness) and `/healthz/ready` (readiness) HTTP endpoints.
