# Salience Atlas V5 — Technical Debt Register

---

This register identifies every major technical debt item preventing Salience Atlas V5 from achieving full enterprise production-readiness and government regulatory compliance.

---

### Central Debt Items

| Unique ID | Category | Severity | Location | Estimated Effort |
| :--- | :--- | :--- | :--- | :--- |
| **DB-01** | Persistence | **Critical** | `/backend/evaluation/evaluation-engine.ts`, `/src/core/memory/providers/` | 80 Hours |
| **SEC-01** | Cryptography | **Critical** | `/src/core/memory/security/index.ts` | 16 Hours |
| **SEC-02** | Auth & Identity | **High** | `/server.ts`, `/src/context/` | 40 Hours |
| **EV-01** | Architecture | **High** | `/backend/agents/instances.ts`, `/src/core/memory/events/` | 32 Hours |
| **RAG-01** | AI Platform | **High** | `/server.ts`, `/backend/ai-federation/providers/gemini.ts` | 40 Hours |
| **AUD-01** | Compliance | **High** | `/backend/evaluation/evaluation-engine.ts` (lines 1134-1142) | 24 Hours |
| **OBS-01** | Observability | **Medium** | `/backend/agents/instances.ts` (lines 50-66) | 24 Hours |
| **IAC-01** | DevSecOps | **Medium** | Root directory | 24 Hours |

---

### Detailed Debt Profiles

#### 1. DB-01 — Lack of Durable Database Persistence
* **Description**: The system relies on local arrays and JS `Map` instances to store bidder records, compliance evaluations, workflow steps, and workspace histories. 
* **Location**: `/backend/evaluation/evaluation-engine.ts` (class `EvaluationDatabase`), `/src/core/memory/providers/index.ts` (class `BaseMemoryProvider`).
* **Production Impact**: A single container restart or autoscaling scale-to-zero event destroys the entire platform history. Active procurement workflows fail, and data integrity cannot be guaranteed.
* **Government Impact**: Fails basic record keeping and public archives acts. It makes audits of historic bids impossible.
* **Risk**: High risk of data loss, state corruption, and operational disruption.
* **Recommended Resolution**: Provision a Cloud SQL (PostgreSQL) database. Integrate `pgvector` for memory search. Migrate all state write/read methods to use transaction-safe repository queries via Drizzle ORM.
* **Dependencies**: None.

---

#### 2. SEC-01 — Simulated Encryption with Base64
* **Description**: Payloads flagged for encryption are base64-encoded and prefixed with `enc-`, rather than secured using standard cryptographic algorithms.
* **Location**: `/src/core/memory/security/index.ts` (lines 58-62).
* **Production Impact**: Sensitive bidder financials and pricing variables are stored as plain text disguised as code. A malicious actor with filesystem access can instantly decode all "encrypted" fields.
* **Government Impact**: Direct violation of national encryption guidelines and corporate confidentiality mandates.
* **Risk**: High risk of data leaks, espionage, and statutory penalties.
* **Recommended Resolution**: Re-implement `MemorySecurityGuard.encrypt()` and `decrypt()` using Node’s native `crypto` module with `aes-256-gcm`. Retrieve the master key dynamically from process environment variables.
* **Dependencies**: SEC-02 (to secure secret configuration loading).

---

#### 3. SEC-02 — Mock Authentication & Privilege Spoofing
* **Description**: Authentication is simulated. Express routes accept identity configurations in incoming request bodies rather than verifying signed JSON Web Tokens (JWT).
* **Location**: `/server.ts` (multiple endpoints), `/src/context/` (client session contexts).
* **Production Impact**: Any API operator can modify request parameters via tools or browser consoles to assume the roles of different officers, bypass tenant boundaries, and modify tender scores.
* **Government Impact**: Total failure of accountability. Destroys legal "Segregation of Duties" required in tender evaluations.
* **Risk**: High risk of unauthorized overrides, fraud, and data manipulation.
* **Recommended Resolution**: Set up Firebase Authentication or an OIDC-compliant Identity Provider. Guard all backend routes with an Express authorization middleware that decodes and verifies JWT signatures.
* **Dependencies**: None.

---

#### 4. EV-01 — Synchronous In-Memory Message Bus
* **Description**: Events and agent communications are processed synchronously in-memory using local event arrays and subscriber registers.
* **Location**: `/backend/agents/instances.ts` (class `AgentMessageBus`), `/src/core/memory/events/` (class `MemoryEventPublisher`).
* **Production Impact**: Fails under high concurrent loads. A single failed agent subscriber can block the entire execution pipeline, and unhandled exceptions can crash the entire Node process.
* **Government Impact**: Fails to meet business continuity and high-availability criteria required for continuous public utilities.
* **Risk**: High risk of pipeline blockages, process crashes, and message drops.
* **Recommended Resolution**: Replace the internal JS callback publishers with an AMQP-compliant broker like RabbitMQ or Cloud Pub/Sub, ensuring message retry guarantees.
* **Dependencies**: DB-01 (to persist failed messages to a dead-letter database queue).

---

#### 5. RAG-01 — Simulated Embeddings and Array-Based RAG Search
* **Description**: The RAG knowledge retriever is a RAM-resident array using simple substring matching. If Gemini's embedding service fails, the system returns a simple sinus-based mock array.
* **Location**: `/backend/ai-federation/providers/gemini.ts` (lines 132-143).
* **Production Impact**: Document search does not support true semantic retrieval, leading to high hallucination rates when processing long procurement files. Memory footprint grows rapidly, risking process crashes.
* **Government Impact**: Low evaluation accuracy, resulting in invalid statutory non-responsiveness classifications.
* **Risk**: High risk of OOM crashes on heavy files and poor accuracy.
* **Recommended Resolution**: Connect `EnterpriseKnowledgeRetrieval` to pgvector database tables, querying actual cosine similarities for text embeddings.
* **Dependencies**: DB-01 (for pgvector database storage).

---

#### 6. AUD-01 — Non-Cryptographic Mock Audit Signatures
* **Description**: Digital signatures linked to audit logs are generated using dynamic JS mathematical strings and `Math.random()`.
* **Location**: `/backend/evaluation/evaluation-engine.ts` (lines 1134-1142).
* **Production Impact**: The signatures cannot be verified externally. Anyone with write access to the mock database variable can insert, alter, or delete logs without breaking signature verification.
* **Government Impact**: Violates national electronic records acts (e.g. Kenya's KICA). Audit logs are legally inadmissible in court during bidding challenges.
* **Risk**: Medium-High risk of legal non-admissibility, fraud, and internal tampering.
* **Recommended Resolution**: Implement a cryptographic audit logger using standard SHA-256 hash chains (where each block's signature depends on the signature of the previous block) signed using a certificate stored in Cloud KMS.
* **Dependencies**: DB-01.

---

### Phase 2 Resolutions & Updates (Enterprise Redis Platform)

| Subsystem / Issue | Status | Resolution | Verification |
| :--- | :--- | :--- | :--- |
| **Redis Cache & Session Pools (Missing)** | **RESOLVED** | Implemented `RedisService` with specialized client connection pools supporting direct, Pub, and Sub traffic. | Passed all 20 connection and failover tests. |
| **EV-01 — Synchronous In-Memory Message Bus** | **RESOLVED** | Refactored application message dispatchers to use Redis-backed queues and Pub/Sub streams with concurrency limits and fallback paths. | Verified in Priority Queue and DLQ automated tests. |
| **In-Memory Request Cache** | **RESOLVED** | Migrated `FederationCache` to perform async writes/reads to Redis regional partitions with SHA-256 key hashing and TTL invalidations. | Verified in `FederationCache` async integration tests. |
| **Race Conditions in OCR & Auditing** | **RESOLVED** | Secured all execution stages (Tender OCR, AI Routing, Agent dispatch, Compliance scoring) using Redis distributed locks. | Verified in Concurrent Lock Exclusion tests. |

