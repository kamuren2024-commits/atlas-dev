# ARCHITECTURE — PHASE 00 BASELINE
**Salience Atlas v5.1.0 | 2026-09-01**

---

## EXECUTIVE SUMMARY

This document describes the current architecture of Salience Atlas's Agentic Operating System and maps the path to enterprise grade.

**Current State:** Agent SDK + event fabric + partial orchestration

**Target State:** Governed, distributed, enterprise-grade agentic OS

---

## CURRENT ARCHITECTURE (AS-IS)

### High-Level Diagram

```
┌─────────────────────────────────────────────────────┐
│        REACT FRONTEND (Scaffolded)                  │
│  (Components exist, agent views not implemented)    │
└────────────────┬────────────────────────────────────┘
                 │ HTTPS REST
                 ▼
┌─────────────────────────────────────────────────────┐
│        EXPRESS API GATEWAY                          │
│  (backend/chrome-extension-api.ts)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │    AGENT ORCHESTRATION LAYER                 │  │
│  │  (backend/agents/)                           │  │
│  │                                              │  │
│  │  ┌─────────────────────────────────────┐   │  │
│  │  │ AgentManager (In-Memory Registry)   │   │  │
│  │  │ - 10 Agents registered              │   │  │
│  │  │ - Max ~1000 agents capacity         │   │  │
│  │  └─────────────────────────────────────┘   │  │
│  │                                              │  │
│  │  ┌─────────────────────────────────────┐   │  │
│  │  │ SCMOrchestrator                     │   │  │
│  │  │ - Keyword routing                   │   │  │
│  │  │ - Sequential agent invocation       │   │  │
│  │  │ - Result synthesis                  │   │  │
│  │  └─────────────────────────────────────┘   │  │
│  │                                              │  │
│  │  ┌─────────────────────────────────────┐   │  │
│  │  │ IntelligentAgentRouter              │   │  │
│  │  │ - Pattern matching                  │   │  │
│  │  │ - Multi-agent selection             │   │  │
│  │  └─────────────────────────────────────┘   │  │
│  │                                              │  │
│  │  ┌─────────────────────────────────────┐   │  │
│  │  │ Agent Message Bus (In-Memory)       │   │  │
│  │  │ - Pub/Sub pattern                   │   │  │
│  │  │ - <5ms latency                      │   │  │
│  │  │ - No persistence                    │   │  │
│  │  └─────────────────────────────────────┘   │  │
│  │                                              │  │
│  │  ┌─────────────────────────────────────┐   │  │
│  │  │ SCMTelemetry (In-Memory Logs)       │   │  │
│  │  │ - Agent execution logs              │   │  │
│  │  │ - Lost on restart                   │   │  │
│  │  └─────────────────────────────────────┘   │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │    EVENT FABRIC LAYER                        │  │
│  │  (backend/event-fabric/)                     │  │
│  │                                              │  │
│  │  - EventBus (In-Memory)                      │  │
│  │  - EventNormalizer                           │  │
│  │  - EventStateStore                           │  │
│  │  - WebSocket/SSE handlers                    │  │
│  │  - EventPersistenceManager (Limited)         │  │
│  │                                              │  │
│  │  ✅ Works for real-time delivery             │  │
│  │  ❌ No Kafka, no event sourcing              │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │    AI FEDERATION LAYER                       │  │
│  │  (backend/ai-federation/)                    │  │
│  │                                              │  │
│  │  - Model Router (Documented, not impl.)      │  │
│  │  - Provider Routing:                         │  │
│  │    • Gemini, OpenAI, Anthropic (Heavy)      │  │
│  │    • Groq, OpenRouter (Fast)                 │  │
│  │    • Ollama (Fallback)                       │  │
│  │                                              │  │
│  │  ✅ Providers available                      │  │
│  │  ❌ No dynamic routing, no failover          │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │    SECURITY LAYER (Stubbed)                  │  │
│  │  (backend/security/)                         │  │
│  │                                              │  │
│  │  - Identity Service                          │  │
│  │  - Authorization Service                     │  │
│  │  - Auth Router                               │  │
│  │  - Secrets Manager                           │  │
│  │  - Cryptography Service                      │  │
│  │  - API Gateway Middleware                    │  │
│  │                                              │  │
│  │  ❌ All no-op implementations                │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │    OBSERVABILITY LAYER (Partial)             │  │
│  │  (backend/observability/)                    │  │
│  │                                              │  │
│  │  - Audit Logger                              │  │
│  │  ✅ Schema ready                             │  │
│  │  ❌ No OpenTelemetry, no tracing             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│        DATA LAYER                                   │
│                                                     │
│  ┌──────────────┬──────────────┬────────────────┐  │
│  │ PostgreSQL   │  In-Memory   │  Redis (n/a)   │  │
│  │  (Configured)│   (Agents)   │  (Installed)   │  │
│  ├──────────────┼──────────────┼────────────────┤  │
│  │ Prisma ORM   │ Agent Memory │  Not Wired     │  │
│  │ 20+ Models   │ • shortTerm  │                │  │
│  │ Multi-tenant │ • longTerm   │                │  │
│  │ Audit Ready  │ • semantic   │                │  │
│  │              │ • domain-    │                │  │
│  │              │   specific   │                │  │
│  └──────────────┴──────────────┴────────────────┘  │
│                                                     │
│  ❌ MISSING:                                       │
│  - Neo4j (Knowledge Graph)                        │
│  - Kafka (Event Streaming)                        │
│  - Temporal (Workflows)                           │
│  - Elasticsearch (Search)                         │
│  - MinIO (Object Storage)                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## COMPONENT DEPENDENCY GRAPH

```
Frontend
  ↓
API Gateway
  ├─→ Agent Orchestrator
  │    ├─→ Agent Registry (In-Memory)
  │    ├─→ Agent Instances (10 domain agents)
  │    │    ├─→ Tools (hardcoded in agents)
  │    │    └─→ In-Process Memory
  │    ├─→ Message Bus (In-Memory)
  │    ├─→ Telemetry (In-Memory)
  │    └─→ Task Planning Engine
  │
  ├─→ Event Fabric
  │    ├─→ Event Bus (In-Memory)
  │    ├─→ WebSocket Handler
  │    ├─→ SSE Handler
  │    └─→ Persistence Manager (Limited)
  │
  ├─→ AI Federation
  │    └─→ Provider Routing (Documented)
  │
  ├─→ Security (Stubbed)
  │
  └─→ Observability
       └─→ Audit Logger

Database Layer
  ├─→ PostgreSQL (Configured)
  ├─→ Redis (Installed, not wired)
  └─→ Missing: Neo4j, Kafka, Temporal, MinIO, Elasticsearch
```

---

## CURRENT INFORMATION FLOW

### Query Processing Flow

```
1. USER QUERY
   │
   ▼
2. API Gateway receives request
   │
   ▼
3. Intelligent Router analyzes keywords
   │
   ├─→ Matches: ["supplier", "risk", "contract"]
   │
   ▼
4. Agent Selection
   │
   ├─→ Selected: [Supplier, Contract, Executive Agents]
   │
   ▼
5. Agent Invocation (Sequential)
   │
   ├─→ Supplier Agent
   │    ├─ SLA Monitor tool
   │    ├─ Risk Scorer tool
   │    └─ Emit message to bus
   │
   ├─→ Contract Agent
   │    ├─ Clause Parser tool
   │    ├─ Penalty Calculator tool
   │    └─ Emit message to bus
   │
   └─→ Executive Agent
        ├─ Aggregate results
        ├─ Synthesize response
        └─ Emit message to bus
   │
   ▼
6. Result Aggregation
   │
   ├─→ Collect agent responses
   ├─→ Format synthesis
   │
   ▼
7. Response to User
   │
   └─→ API returns JSON
```

### Issues with Current Flow

- ❌ **Sequential Only**: Cannot parallelize agents
- ❌ **No Persistence**: All results lost on restart
- ❌ **No Audit Trail**: Cannot reconstruct decisions
- ❌ **No Approval Gates**: Recommendations are direct
- ❌ **No Policy Enforcement**: Tools called without checks
- ❌ **No Error Recovery**: Single agent failure stops pipeline

---

## SCALABILITY ANALYSIS

### Current Limits

| Dimension | Limit | Issue |
|-----------|-------|-------|
| Agents | ~1,000 | In-memory registry GC pressure |
| Message Throughput | ~100 ops/sec | Sequential processing |
| Event Buffer | ~10k events | Memory pressure |
| Workflow Complexity | ~10 steps | Simulated only |
| Tools per Agent | ~5 | Hardcoded |
| Tenant Isolation | ❌ Not enforced | Security risk |
| Multi-Region | ❌ Single region | No HA/DR |

### Scaling Strategy

```
Current (Single Node)
├─ 1 API instance
├─ In-memory registry
├─ In-memory message bus
└─ Sequential processing

Target (Distributed)
├─ N API instances
├─ Distributed registry (etcd/Postgres)
├─ Message broker (Kafka)
└─ Parallel processing with DAG
```

---

## TARGET ARCHITECTURE (TO-BE)

### High-Level Target

```
┌────────────────────────────────────────────────────────────┐
│                   ATLAS COMMAND CENTER                     │
│  (Frontend: Agent Fleet, Decisions, Graph, Audit, Cost)   │
└─────────────────────┬──────────────────────────────────────┘
                      │ REST/GraphQL
                      ▼
┌────────────────────────────────────────────────────────────┐
│              API GATEWAY + LOAD BALANCER                   │
│  (Authorization, Rate Limiting, Request Routing)          │
└─────────────────────┬──────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Instance │  │ Instance │  │ Instance │
  │    1     │  │    2     │  │    N     │
  └──────────┘  └──────────┘  └──────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
   ┌──────────────────────────────────────────┐
   │      AGENT CONTROL PLANE                 │
   │  (Distributed Registry, Policy Engine)   │
   ├──────────────────────────────────────────┤
   │                                          │
   │  Agent Registry (etcd + Postgres)        │
   │  Policy Engine (OPA)                     │
   │  Capability Resolver                     │
   │  Authorization Checks                    │
   │  Rate Limiting                           │
   │  Health Monitoring                       │
   │  Scheduling                              │
   │                                          │
   └──────────────────────────────────────────┘
      │                           │
      ▼                           ▼
   ┌──────────────────────────────────────────┐
   │   AGENT COMMUNICATION BUS                │
   │  (A2A Gateway + Message Broker)          │
   │                                          │
   │  - Kafka for event streaming             │
   │  - Request/response correlation          │
   │  - Policy enforcement per message        │
   │  - Encryption/signing                    │
   │  - Message versioning                    │
   │                                          │
   └──────────────────────────────────────────┘
      │                           │
      ├────────┬──────────┬───────┤
      ▼        ▼          ▼       ▼
   ┌────────────────────────────────────┐
   │   ORCHESTRATION LAYER              │
   │  (Temporal Workflows)              │
   │                                    │
   │  - Workflow persistence            │
   │  - Checkpoint/resume               │
   │  - Compensation logic              │
   │  - Versioning                      │
   │  - Replay                          │
   │                                    │
   └────────────────────────────────────┘
      │
      ▼
   ┌────────────────────────────────────┐
   │   DOMAIN AGENTS (Managed Services) │
   │                                    │
   │  - Procurement Microservice        │
   │  - Contract Microservice           │
   │  - Supplier Microservice           │
   │  - Inventory Microservice          │
   │  - Logistics Microservice          │
   │  - Project Microservice            │
   │  - Compliance Microservice         │
   │  - Sourcing Microservice           │
   │  - DigitalTwin Microservice        │
   │  - Executive Microservice          │
   │                                    │
   │  Each with:                        │
   │  - Health checks                   │
   │  - Memory store                    │
   │  - Audit logging                   │
   │  - Cost tracking                   │
   │  - Performance monitoring          │
   │                                    │
   └────────────────────────────────────┘
      │
      ▼
   ┌────────────────────────────────────┐
   │   TOOL FABRIC                      │
   │  (Managed Tool Execution)          │
   │                                    │
   │  - Tool Registry (Postgres)        │
   │  - Tool Discovery                  │
   │  - Input/Output Validation         │
   │  - Authorization Enforcement       │
   │  - Versioning                      │
   │  - Retry Logic                     │
   │  - Timeout Enforcement             │
   │  - Audit Logging                   │
   │  - Cost Attribution                │
   │                                    │
   └────────────────────────────────────┘
      │
      ├─── External Integrations
      │
      ├─→ MCP Gateway
      │  ├─→ ERP (SAP)
      │  ├─→ Finance Systems
      │  ├─→ GIS/Grid Systems
      │  ├─→ Document Management
      │  └─→ Email/Notifications
      │
      └─→ Direct Adapters
         ├─→ PostgreSQL
         ├─→ Neo4j (Knowledge Graph)
         └─→ MinIO (Object Storage)
      │
      ▼
   ┌────────────────────────────────────┐
   │   KNOWLEDGE FABRIC                 │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Knowledge Graph (Neo4j)      │ │
   │  │  - Ontology                  │ │
   │  │  - Semantic Relationships    │ │
   │  │  - Impact Analysis Queries   │ │
   │  └──────────────────────────────┘ │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Memory Fabric (Postgres)     │ │
   │  │  - Episodic                  │ │
   │  │  - Semantic                  │ │
   │  │  - Procedural                │ │
   │  │  - Organizational            │ │
   │  └──────────────────────────────┘ │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ RAG System                   │ │
   │  │  - Embeddings                │ │
   │  │  - Vector Store              │ │
   │  │  - Retrieval Optimization    │ │
   │  └──────────────────────────────┘ │
   │                                    │
   └────────────────────────────────────┘
      │
      ▼
   ┌────────────────────────────────────┐
   │   DECISION ENGINE                  │
   │                                    │
   │  - Decision Structuring            │
   │  - Evidence Linking               │
   │  - Confidence Calculation         │
   │  - Alternative Generation         │
   │  - Impact Modeling                │
   │  - Approval Workflows             │
   │  - Decision Audit Trail           │
   │                                    │
   └────────────────────────────────────┘
      │
      ▼
   ┌────────────────────────────────────┐
   │   DIGITAL TWIN                     │
   │  (State + Simulation Engine)       │
   │                                    │
   │  - Entity State Store (Postgres)   │
   │  - Constraint Solver               │
   │  - Scenario Simulation             │
   │  - Prediction Models               │
   │  - Impact Analysis                 │
   │                                    │
   └────────────────────────────────────┘
      │
      ▼
   ┌────────────────────────────────────┐
   │   OBSERVABILITY FABRIC             │
   │  (OpenTelemetry Stack)             │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Distributed Tracing          │ │
   │  │  - Jaeger/Tempo Backend      │ │
   │  │  - Trace Query API           │ │
   │  │  - Trajectory Replay         │ │
   │  └──────────────────────────────┘ │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Metrics                      │ │
   │  │  - Prometheus Backend        │ │
   │  │  - Performance Dashboards    │ │
   │  │  - Alert Rules               │ │
   │  └──────────────────────────────┘ │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Logging                      │ │
   │  │  - Elasticsearch Backend     │ │
   │  │  - Log Aggregation           │ │
   │  │  - Full-text Search          │ │
   │  └──────────────────────────────┘ │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Audit Trail                  │ │
   │  │  - Immutable Event Log       │ │
   │  │  - Forensic Analysis         │ │
   │  │  - Regulatory Compliance     │ │
   │  └──────────────────────────────┘ │
   │                                    │
   └────────────────────────────────────┘
      │
      ▼
   ┌────────────────────────────────────┐
   │   SECURITY & GOVERNANCE            │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Authentication (Keycloak)    │ │
   │  │  - OAuth2/OIDC               │ │
   │  │  - JWT Validation            │ │
   │  │  - MFA Support               │ │
   │  └──────────────────────────────┘ │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Authorization (OPA)          │ │
   │  │  - RBAC Policies             │ │
   │  │  - ABAC Policies             │ │
   │  │  - Policy Versioning         │ │
   │  │  - Policy Audit              │ │
   │  └──────────────────────────────┘ │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Secrets Management (Vault)   │ │
   │  │  - Credential Storage        │ │
   │  │  - Rotation                  │ │
   │  │  - Audit Logging             │ │
   │  └──────────────────────────────┘ │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Multi-Tenancy               │ │
   │  │  - Row-Level Security        │ │
   │  │  - Tenant Isolation          │ │
   │  │  - Quota Management          │ │
   │  └──────────────────────────────┘ │
   │                                    │
   └────────────────────────────────────┘
      │
      ▼
   ┌────────────────────────────────────┐
   │   PERSISTENCE & INFRASTRUCTURE     │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Databases                    │ │
   │  │  - PostgreSQL (Primary)      │ │
   │  │  - Neo4j (Knowledge Graph)   │ │
   │  │  - Redis (Cache)             │ │
   │  │  - Elasticsearch (Logs)      │ │
   │  └──────────────────────────────┘ │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Message Brokers              │ │
   │  │  - Kafka (Event Streaming)   │ │
   │  │  - Redis Pub/Sub (Fallback)  │ │
   │  └──────────────────────────────┘ │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Workflow State               │ │
   │  │  - Temporal Server           │ │
   │  │  - Workflow Definitions      │ │
   │  │  - Activity Registry         │ │
   │  └──────────────────────────────┘ │
   │                                    │
   │  ┌──────────────────────────────┐ │
   │  │ Object Storage               │ │
   │  │  - MinIO (S3-compatible)     │ │
   │  │  - Artifact Storage          │ │
   │  │  - Document Management       │ │
   │  └──────────────────────────────┘ │
   │                                    │
   └────────────────────────────────────┘
      │
      ▼
   ┌────────────────────────────────────┐
   │   DEPLOYMENT INFRASTRUCTURE        │
   │                                    │
   │  - Kubernetes Cluster (3+ zones)   │
   │  - Service Mesh (Istio)            │
   │  - Ingress Controller              │
   │  - Network Policies                │
   │  - RBAC                            │
   │  - Pod Disruption Budgets          │
   │  - Multi-Region Setup              │
   │  - High Availability               │
   │  - Disaster Recovery               │
   │                                    │
   └────────────────────────────────────┘
```

---

## ARCHITECTURAL EVOLUTION PATH

### Phase-by-Phase Evolution

**Phase 00-03:** Foundation
- Persistent agent registry (Postgres)
- Central tool registry
- Capability model enforcement
- Authorization checks

**Phase 04-08:** Distribution
- MCP gateway
- A2A communication fabric
- Knowledge graph (Neo4j)
- Memory persistence

**Phase 09-14:** Governance
- Context engine
- Model routing
- Planning & reasoning
- Policy-as-code (OPA)

**Phase 15-20:** Observability & Quality
- Event sourcing (Kafka)
- Durable workflows (Temporal)
- OpenTelemetry integration
- Evaluation framework

**Phase 21-30:** Enterprise Grade
- Security hardening
- Multi-tenancy enforcement
- Computer-use agents
- Long-running autonomous agents
- Executive agent synthesis

**Phase 31-40:** Production
- Kubernetes deployment
- Multi-region support
- Disaster recovery
- Performance optimization
- Cost optimization
- Final certification

---

## CONCLUSION

Current architecture is a **solid foundation** but requires significant infrastructure investment to reach enterprise grade.

The path from Phase 00 → 40 involves:
- 10 critical gap closures
- 8 high-priority integrations
- 6 medium-priority enhancements
- 40 phases of iterative improvement

**Estimated Total Effort:** ~1,630 hrs (~41 weeks)

**Next Phase:** Phase 01 (Agent Identity + Registry) requires distributed registry, persistent state, and authorization checks.
