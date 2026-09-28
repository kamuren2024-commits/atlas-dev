# Salience Atlas V5 — Phased Remediation Roadmap

---

This roadmap outlines the recommended engineering sequence to resolve the identified technical debt items and transition Salience Atlas V5 into a production-ready, government-compliant operating system.

---

### Phase 1 — Security Hardening & Durable State
**Target Schedule**: Weeks 1–3  
**Focus**: Replace transient, simulated components with secure, durable, and authenticated enterprise standards.

* **Objectives**:
  1. Transition all transient in-memory stores to permanent cloud-hosted persistence (Cloud SQL + Firestore).
  2. Implement industry-standard OAuth2/OIDC user authentication with JWT validation.
  3. Swap simulated Base64 encryption with real AES-256-GCM cryptography.
* **Technical Debt Resolved**:
  * **DB-01**: In-memory database persistence.
  * **SEC-01**: Simulated encryption.
  * **SEC-02**: Mock authentication.
* **Files & Modules Affected**:
  * `/backend/evaluation/evaluation-engine.ts` (migrate `EvaluationDatabase` methods).
  * `/src/core/memory/security/index.ts` (re-implement `encrypt` and `decrypt`).
  * `/server.ts` (mount express JWT middleware and database clients).
* **Dependencies**: Secure API credentials in `.env` (JWT Secret, Database URL).
* **Risks**: High chance of interface breakages while transitioning from synchronous inline array mutations to asynchronous database queries.
* **Acceptance Criteria**:
  * Server starts and connects successfully to a Cloud SQL instance.
  * Attempting to call `/api/scm/orchestrate` without an `Authorization: Bearer <JWT>` header returns a `401 Unauthorized` status.
  * Memory entries flagged with `encryptionRequired: true` store hex-encoded ciphertexts in the database that are impossible to decode without the environment’s master key.
* **Production-Readiness Gate**: Core encryption audits pass, and a live user session persists database entries across server restarts.

---

### Phase 2 — AI Resiliency & Distributed Messaging
**Target Schedule**: Weeks 4–6  
**Focus**: Elevate the cognitive and messaging fabric to support scale and high-concurrency workloads.

* **Objectives**:
  1. Migrate RAG context retrieval to pgvector semantic similarity queries, fetching live embeddings.
  2. Replace in-process message buses with a distributed message queue (RabbitMQ or GCP Pub/Sub).
  3. Deploy centralized structured logging and telemetry endpoints.
* **Technical Debt Resolved**:
  * **EV-01**: Synchronous in-memory event buses.
  * **RAG-01**: RAM-based text-matching and simulated embedding arrays.
  * **OBS-01**: Volatile in-memory logs.
* **Files & Modules Affected**:
  * `/backend/ai-federation/providers/gemini.ts` (implement real embeddings fallback).
  * `/backend/agents/instances.ts` (integrate `AgentMessageBus` with AMQP client).
  * `/src/core/memory/events/` (integrate event publishing with queue).
* **Dependencies**: Phase 1 completed successfully; message queue broker accessible.
* **Risks**: Message latency during agent execution cascades if queue parameters or prefetch limits are configured poorly.
* **Acceptance Criteria**:
  * Ingested documents are successfully vectorized via `text-embedding-004` and queried using cosine distance metrics.
  * Agents publish messages to queue topics, and multiple subscribers consume them in parallel without message loss or execution lockups.
  * Metrics are exposed in OpenMetrics formatting on `/metrics` for scraping.
* **Production-Readiness Gate**: Semantic similarity queries return accurate context structures, and the system survives a high-stress simulated payload bottleneck test without dropping agent messages.

---

### Phase 3 — Government Compliance & DevSecOps Automation
**Target Schedule**: Weeks 7–8  
**Focus**: Secure continuous verification, infrastructure replication, and legal digital signature sealing.

* **Objectives**:
  1. Implement cryptographic append-only audit hash-chains, signing blocks with a KMS-stored key.
  2. Write multi-stage Dockerfiles and Terraform IaC definitions to support automated cluster provisioning.
  3. Setup CI/CD build gates to automate vulnerability checks, lints, and unit tests.
* **Technical Debt Resolved**:
  * **AUD-01**: Math.random simulated audit signatures.
  * **IAC-01**: Missing container and deployment files.
* **Files & Modules Affected**:
  * `/backend/evaluation/evaluation-engine.ts` (re-engineer signature linking).
  * Root workspace directory (add `Dockerfile`, `/terraform/`, `.github/workflows/`).
* **Dependencies**: Phase 1 & Phase 2 completed successfully.
* **Risks**: High complexity in configuring secure cloud KMS execution boundaries.
* **Acceptance Criteria**:
  * Every audit entry contains a cryptographically signed signature that is verifiable against a public key certificate.
  * Modifying any historical log column directly in the database invalidates the downstream hash-chain.
  * Running `docker build` succeeds, generating a light slimmed production container of the application.
* **Production-Readiness Gate**: Signed audits pass legal validation test cases, and a fully automated build compiles, lints, tests, and packages the platform inside a secure pipeline.
