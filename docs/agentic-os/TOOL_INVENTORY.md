# TOOL INVENTORY — PHASE 00 SNAPSHOT
**Salience Atlas v5.1.0 | 2026-09-01**

---

## TOOL REGISTRY STATUS

**Current State:** ❌ NO CENTRAL REGISTRY
- Tools hardcoded into agent constructors
- ~40 tools scattered across agents
- No tool discovery API
- No tool versioning
- No tool authorization

**Target State (Phase 03):** Centralized tool registry with discovery, authorization, and versioning

---

## TOOLS BY AGENT

### Procurement Agent Tools

| Tool | Description | Input Schema | Output Schema | Risk | Idempotent | Audit |
|------|-------------|-------------|---------------|------|-----------|-------|
| Tender Analyzer | Extracts and parses submitted bids to test compliance matrices | ❌ None defined | `{ score: number, flags: string[] }` | MEDIUM | ❌ | ❌ |
| Cost Benchmark Engine | Compares tender estimates against past global prices | ❌ None defined | `{ averageDeviation: string, recommendedPricePct: number }` | LOW | ✅ | ❌ |

### Contract Intelligence Agent Tools

| Tool | Description | Input Schema | Output Schema | Risk | Idempotent | Audit |
|------|-------------|-------------|---------------|------|-----------|-------|
| Clause Parser | Extracts and interprets contract clauses | ❌ None defined | `{ clauses: object[], risks: string[] }` | MEDIUM | ✅ | ❌ |
| Penalty Calculator | Calculates penalty obligations under contract terms | ❌ None defined | `{ penalties: number, basis: string }` | HIGH | ✅ | ❌ |

### Supplier Agent Tools

| Tool | Description | Input Schema | Output Schema | Risk | Idempotent | Audit |
|------|-------------|-------------|---------------|------|-----------|-------|
| SLA Monitor | Tracks supplier SLA compliance and performance | ❌ None defined | `{ status: string, score: number }` | LOW | ✅ | ❌ |
| Risk Scorer | Evaluates supplier risk profile | ❌ None defined | `{ riskLevel: string, score: number }` | MEDIUM | ✅ | ❌ |

### Inventory Agent Tools

| Tool | Description | Input Schema | Output Schema | Risk | Idempotent | Audit |
|------|-------------|-------------|---------------|------|-----------|-------|
| Inventory Counter | Counts available stock levels | ❌ None defined | `{ total: number, byLocation: object }` | LOW | ✅ | ❌ |
| Stock Forecaster | Predicts future inventory levels | ❌ None defined | `{ forecast: number[], trend: string }` | MEDIUM | ✅ | ❌ |

### Logistics Agent Tools

| Tool | Description | Input Schema | Output Schema | Risk | Idempotent | Audit |
|------|-------------|-------------|---------------|------|-----------|-------|
| Route Optimizer | Finds optimal shipping routes | ❌ None defined | `{ route: string, cost: number, eta: string }` | MEDIUM | ✅ | ❌ |
| Delay Predictor | Predicts shipment delivery delays | ❌ None defined | `{ delayDays: number, probability: number }` | MEDIUM | ✅ | ❌ |

### Project Agent Tools

| Tool | Description | Input Schema | Output Schema | Risk | Idempotent | Audit |
|------|-------------|-------------|---------------|------|-----------|-------|
| Project Timeline Analyzer | Analyzes project milestones and progress | ❌ None defined | `{ status: string, completed: number, remaining: number }` | LOW | ✅ | ❌ |
| Milestone Predictor | Predicts project milestone completion | ❌ None defined | `{ eta: string, riskLevel: string }` | MEDIUM | ✅ | ❌ |

### Compliance Agent Tools

| Tool | Description | Input Schema | Output Schema | Risk | Idempotent | Audit |
|------|-------------|-------------|---------------|------|-----------|-------|
| Rules Checker | Verifies compliance against regulatory rules | ❌ None defined | `{ compliant: boolean, violations: string[] }` | HIGH | ✅ | ❌ |
| Threshold Inspector | Checks if values exceed regulatory thresholds | ❌ None defined | `{ withinThreshold: boolean, margin: number }` | HIGH | ✅ | ❌ |

### Sourcing Agent Tools

| Tool | Description | Input Schema | Output Schema | Risk | Idempotent | Audit |
|------|-------------|-------------|---------------|------|-----------|-------|
| Category Analyzer | Analyzes spending by category | ❌ None defined | `{ categories: object, totalSpend: number }` | LOW | ✅ | ❌ |
| Savings Calculator | Calculates potential cost savings | ❌ None defined | `{ savings: number, percentage: number }` | MEDIUM | ✅ | ❌ |

### Digital Twin Agent Tools

| Tool | Description | Input Schema | Output Schema | Risk | Idempotent | Audit |
|------|-------------|-------------|---------------|------|-----------|-------|
| Scenario Simulator | Simulates what-if scenarios | ❌ None defined | `{ outcomes: object[], impacts: object }` | HIGH | ✅ | ❌ |
| Impact Calculator | Calculates impact of changes | ❌ None defined | `{ impacts: object, severity: string }` | HIGH | ✅ | ❌ |

### Executive Agent Tools

| Tool | Description | Input Schema | Output Schema | Risk | Idempotent | Audit |
|------|-------------|-------------|---------------|------|-----------|-------|
| Result Aggregator | Aggregates findings from multiple agents | ❌ None defined | `{ summary: string, findings: object[] }` | LOW | ✅ | ❌ |

---

## TOOL STATISTICS

- **Total Tools:** ~20 (2 per agent × 10 agents)
- **With Input Schema:** 0
- **With Output Schema:** 20
- **With Authorization:** 0
- **With Audit Logging:** 0
- **Idempotent:** ~15
- **Risk HIGH:** 5
- **Risk MEDIUM:** 8
- **Risk LOW:** 7

---

## TOOL GAPS

| Gap | Impact | Phase |
|-----|--------|-------|
| No centralized tool registry | Tools unmanageable at scale | Phase 03 |
| No input/output validation | Invalid inputs cause cascading failures | Phase 03 |
| No authorization checks | Agents can invoke unauthorized tools | Phase 03 |
| No versioning | Cannot manage tool migrations | Phase 03 |
| No retry policies | Transient failures cause aborts | Phase 03 |
| No rate limiting | Tool abuse possible | Phase 03 |
| No cost attribution | Cannot track tool usage costs | Phase 03 |
| No audit trails | Cannot reconstruct tool invocations | Phase 03 |
| No timeout enforcement | Long-running tools hang agent | Phase 03 |
| No error handling | Tool errors cascade unhandled | Phase 03 |

---

## TOOL DISTRIBUTION

```
Agent Instances (backend/agents/instances.ts)
├─ Procurement Agent
│  ├─ Tender Analyzer
│  └─ Cost Benchmark Engine
├─ Contract Intelligence Agent
│  ├─ Clause Parser
│  └─ Penalty Calculator
├─ Supplier Agent
│  ├─ SLA Monitor
│  └─ Risk Scorer
├─ Inventory Agent
│  ├─ Inventory Counter
│  └─ Stock Forecaster
├─ Logistics Agent
│  ├─ Route Optimizer
│  └─ Delay Predictor
├─ Project Agent
│  ├─ Project Timeline Analyzer
│  └─ Milestone Predictor
├─ Compliance Agent
│  ├─ Rules Checker
│  └─ Threshold Inspector
├─ Sourcing Agent
│  ├─ Category Analyzer
│  └─ Savings Calculator
├─ Digital Twin Agent
│  ├─ Scenario Simulator
│  └─ Impact Calculator
└─ Executive Agent
   └─ Result Aggregator
```

---

## MISSING TOOL TYPES

| Tool Type | Purpose | Phase |
|-----------|---------|-------|
| External API Adapters | ERP, SAP, Finance APIs | Phase 04 (MCP) |
| Database Query Tools | Direct SQL/Graph queries | Phase 04 (MCP) |
| Document Tools | PDF extraction, parsing | Phase 04 (MCP) |
| Email Tools | Sending notifications, reports | Phase 04 (MCP) |
| Approval Tools | Human approval workflows | Phase 13 |
| Simulation Tools | Digital twin scenarios | Phase 16 |
| Scheduling Tools | Cron job management | Phase 24 |

---

## TOOL IMPLEMENTATION ROADMAP

### Phase 03 (Tool Fabric)
1. Create ToolRegistry service
2. Implement tool discovery API
3. Add authorization checks
4. Add input/output validation
5. Add versioning support
6. Add audit logging
7. Add timeout enforcement
8. Add retry policies

### Phase 04 (MCP Fabric)
1. Integrate MCP tool adapters
2. Implement ERP tools
3. Implement SAP tools
4. Implement Finance tools
5. Implement GIS tools
6. Implement Grid tools
7. Implement Drone tools

### Phase 24 (Scheduling)
1. Add schedule creation tools
2. Add cron parser tools
3. Add job status tools

---

## TOOL TESTING STRATEGY

Each tool requires:
- ✅ Unit tests (input/output validation)
- ✅ Integration tests (end-to-end)
- ✅ Error handling tests (timeout, failure)
- ✅ Authorization tests (policy enforcement)
- ✅ Performance tests (latency SLA)
- ✅ Idempotency tests (safe retry)

---

## NEXT STEPS

Phase 03 will:
1. Extract tools from agent constructors
2. Create centralized ToolRegistry
3. Implement tool discovery
4. Implement tool authorization
5. Support ~500 tools across system
