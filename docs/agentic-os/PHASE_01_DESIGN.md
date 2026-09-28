# PHASE 01: AGENT IDENTITY + REGISTRY
**Salience Atlas Agentic OS | Distributed Agent Registry Engineering**

---

## OBJECTIVE

Implement a **distributed, persistent, multi-region agent registry** to replace the in-memory `AgentManager` and close **GAP-001** (blocking all subsequent phases).

**Success Criteria:**
- ✅ Distributed registry backed by PostgreSQL + etcd/Raft
- ✅ Support 500+ agents across multiple regions
- ✅ Heartbeat/liveness detection every 5-30 seconds
- ✅ Multi-region failover with quorum consensus
- ✅ Agent versioning and health tracking
- ✅ Authorization and audit logging per agent lifecycle event
- ✅ Full test coverage (unit + integration + chaos)

**Duration:** 2 weeks (70 hours)

---

## CURRENT STATE

### In-Memory Registry (fabric.ts)
```typescript
export class AgentManager {
  private static registeredAgents = new Map<string, Agent>();
  
  static registerAgent(agent: Agent) {
    this.registeredAgents.set(agent.id, agent);
  }
  
  static getAgent(id: string): Agent | undefined {
    return this.registeredAgents.get(id);
  }
  
  static getAllAgents(): Agent[] {
    return Array.from(this.registeredAgents.values());
  }
}
```

**Limitations:**
- Lost on restart
- Single-process only
- ~1,000 agent limit before GC pressure
- No health checking
- No multi-region support
- No versioning

---

## TARGET ARCHITECTURE

### Component Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT GATEWAY                            │
│                  (Express.js routes)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────▼─────┐  ┌─────▼──────┐  ┌─────▼──────┐
│ Registry  │  │ Heartbeat  │  │  Discovery │
│  Service  │  │  Monitor   │  │   Service  │
└────┬─────┘  └──────┬──────┘  └─────┬──────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
          ┌──────────▼───────────┐
          │  Distributed State   │
          │   (etcd + Raft)      │
          └──────────┬───────────┘
                     │
          ┌──────────▼───────────┐
          │   Persistent Layer   │
          │   (PostgreSQL)       │
          └──────────────────────┘
```

### Data Flow
```
1. Agent Lifecycle (Registration)
   Agent Start → Register(id, domain, owner) → Store in Postgres
            → Lease in etcd → Return handler
            
2. Health Monitoring
   Heartbeat Timer (5-30s) → Check status → Update etcd TTL
                          → Update health field in Postgres
                          
3. Discovery
   Query Agent(id) → etcd cache hit? → Return (fast path)
                  → etcd miss? → Query Postgres → Cache in etcd
                  
4. Multi-Region Failover
   Region A fails → Regional quorum detects → etcd raft election
                 → Region B takes over → Clients redirect
                 
5. Agent Lifecycle (Termination)
   Agent shutdown → Release lease in etcd
               → Mark as offline in Postgres
               → Trigger orchestrator rebalancing
```

---

## TASK BREAKDOWN

### 1. Schema Design (4 hrs)
**Objective:** Add agent registry tables to Prisma schema

**Table: Agent (agent_registry table)**
```sql
CREATE TABLE agents (
  -- Identity
  agent_id                VARCHAR(255) PRIMARY KEY,
  agent_name              VARCHAR(255) NOT NULL,
  agent_domain            VARCHAR(255) NOT NULL,
  
  -- Version & Status
  version                 VARCHAR(32) NOT NULL,
  status                  ENUM('registered', 'active', 'idle', 'offline', 'failed'),
  health_status           ENUM('healthy', 'degraded', 'unhealthy'),
  
  -- Ownership & Governance
  owner_id                VARCHAR(255),
  tenant_id               VARCHAR(255),
  
  -- Lifecycle
  last_heartbeat          TIMESTAMP,
  heartbeat_interval_secs INT DEFAULT 30,
  health_check_window_secs INT DEFAULT 90,
  
  -- Metadata
  capabilities            JSON,
  memory_types            JSON,
  tool_ids                JSON,
  
  -- Audit Trail
  created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by              VARCHAR(255),
  updated_at              TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by              VARCHAR(255),
  deleted_at              TIMESTAMP,
  
  -- Enterprise
  region                  VARCHAR(64),
  cost_estimate_per_hour  DECIMAL(10,2),
  
  INDEX idx_domain_status (agent_domain, status),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_last_heartbeat (last_heartbeat),
  INDEX idx_region (region)
);
```

**Table: AgentRegistryEvent (audit log)**
```sql
CREATE TABLE agent_registry_events (
  event_id              VARCHAR(255) PRIMARY KEY,
  agent_id              VARCHAR(255),
  event_type            ENUM('register', 'heartbeat', 'status_change', 'health_change', 'deregister', 'failover'),
  previous_state        JSON,
  new_state             JSON,
  triggered_by          VARCHAR(255),
  region                VARCHAR(64),
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
  INDEX idx_agent_id (agent_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
);
```

**Deliverables:**
- [ ] `prisma/schema.prisma` updated with Agent model
- [ ] `prisma/schema.prisma` updated with AgentRegistryEvent model
- [ ] Indexes added for performance
- [ ] Audit fields included (tenantId, createdBy, updatedBy, deletedAt, version)

---

### 2. AgentRegistry Service (20 hrs)
**Objective:** Implement distributed registry service

**File:** `backend/agents/registry.ts`

**Interface:**
```typescript
export interface IAgentRegistry {
  // Lifecycle
  register(agent: Agent, leaseSeconds?: number): Promise<LeaseHandle>;
  deregister(agentId: string): Promise<void>;
  
  // Query
  getAgent(agentId: string): Promise<Agent | null>;
  queryAgents(filter: AgentQueryFilter): Promise<Agent[]>;
  getAgentsByDomain(domain: string): Promise<Agent[]>;
  
  // Status Management
  updateStatus(agentId: string, status: AgentStatus): Promise<void>;
  updateHealthStatus(agentId: string, health: HealthStatus): Promise<void>;
  recordHeartbeat(agentId: string, metrics: HeartbeatMetrics): Promise<void>;
  
  // Multi-Region
  getRegionalAgents(region: string): Promise<Agent[]>;
  failoverAgent(agentId: string, fromRegion: string, toRegion: string): Promise<void>;
  
  // Audit
  getRegistryEvents(agentId: string, limit?: number): Promise<AgentRegistryEvent[]>;
}
```

**Implementation Steps:**
1. Create connection manager (PostgreSQL + etcd)
2. Implement CRUD operations (create, read, update, delete)
3. Add caching layer (etcd as cache, PostgreSQL as source of truth)
4. Implement lease management (etcd TTL for active agents)
5. Add query builder for flexible filtering
6. Add audit logging on all mutations
7. Add authorization checks per operation
8. Add metrics/observability hooks

**Deliverables:**
- [ ] `backend/agents/registry.ts` — AgentRegistry class
- [ ] `backend/agents/registry-types.ts` — TypeScript interfaces
- [ ] Error handling strategy document
- [ ] Performance benchmarks (latency, throughput)

---

### 3. Heartbeat + Liveness Monitor (15 hrs)
**Objective:** Implement distributed health monitoring

**File:** `backend/agents/heartbeat-monitor.ts`

**Mechanism:**
1. Agent registers → Gets `LeaseHandle` with TTL (e.g., 30 seconds)
2. Every 10 seconds → Agent calls `heartbeat()` → Lease renewed in etcd
3. Registry observes etcd TTL expiry → Marks agent as offline
4. Orchestrator detects offline → Rebalances workload
5. Agent recovers → Re-registers with registry

**Implementation:**
```typescript
export class HeartbeatMonitor {
  private intervalHandles: Map<string, NodeJS.Timeout> = new Map();
  
  async startMonitoring(agentId: string, intervalMs: number = 10000) {
    const handle = setInterval(async () => {
      try {
        await this.sendHeartbeat(agentId);
      } catch (err) {
        logger.error(`Heartbeat failed for ${agentId}: ${err}`);
        await this.markAgentUnhealthy(agentId);
      }
    }, intervalMs);
    
    this.intervalHandles.set(agentId, handle);
  }
  
  async stopMonitoring(agentId: string) {
    const handle = this.intervalHandles.get(agentId);
    if (handle) {
      clearInterval(handle);
      this.intervalHandles.delete(agentId);
    }
  }
  
  private async sendHeartbeat(agentId: string) {
    const metrics = await this.collectMetrics(agentId);
    await this.registry.recordHeartbeat(agentId, metrics);
    await this.etcdClient.renewLease(agentId, 90); // 90 second TTL
  }
}
```

**Deliverables:**
- [ ] `backend/agents/heartbeat-monitor.ts`
- [ ] Liveness detection tests
- [ ] TTL expiry handler
- [ ] Recovery mechanism tests

---

### 4. Multi-Region + Distributed Coordination (15 hrs)
**Objective:** Enable multi-region registry with consensus

**Architecture:**
```
Region A                Region B                Region C
┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│ Registry Peer  │   │ Registry Peer  │   │ Registry Peer  │
│  + etcd node   │   │  + etcd node   │   │  + etcd node   │
└────────┬───────┘   └────────┬───────┘   └────────┬───────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                         Raft Leader
                       (Consensus)
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                PostgreSQL PostgreSQL PostgreSQL
             (Region A)  (Region B) (Region C)
```

**Implementation:**
1. Deploy etcd cluster across 3 regions
2. Configure Raft quorum (2 of 3 required)
3. Implement region-aware agent assignment
4. Add failover logic when region becomes unreachable
5. Implement cross-region discovery caching

**Deliverables:**
- [ ] etcd cluster deployment configuration
- [ ] Raft consensus logic
- [ ] Regional failover handler
- [ ] Cross-region sync tests

---

### 5. Integration with Existing Agents (10 hrs)
**Objective:** Replace in-memory registry with distributed one

**Changes:**
1. Update `fabric.ts` AgentManager → Use AgentRegistry service
2. Update `instances.ts` agent factories → Register with distributed registry
3. Update `orchestrator.ts` → Use registry queries
4. Add initialization sequence (connect to etcd/PostgreSQL on startup)
5. Add graceful shutdown (deregister agents, close connections)

**Deliverables:**
- [ ] `backend/agents/fabric.ts` — Updated AgentManager
- [ ] `backend/agents/instances.ts` — Registry integration
- [ ] `backend/agents/orchestrator.ts` — Registry queries
- [ ] Initialization/shutdown sequence

---

### 6. Testing + Quality (10 hrs)
**Objective:** Full test coverage for production readiness

**Test Categories:**

1. **Unit Tests (backend/agents/__tests__/registry.test.ts)**
   - [ ] Register single agent
   - [ ] Register 500+ agents (capacity test)
   - [ ] Query by domain/status
   - [ ] Update agent status
   - [ ] Heartbeat renewal
   - [ ] Deregister agent
   - [ ] Audit log recording

2. **Integration Tests (backend/agents/__tests__/registry-integration.test.ts)**
   - [ ] PostgreSQL persistence
   - [ ] etcd lease management
   - [ ] Cache invalidation
   - [ ] Multi-process registry access
   - [ ] Failover scenario

3. **Chaos Tests (backend/agents/__tests__/registry-chaos.test.ts)**
   - [ ] PostgreSQL connection loss → recovery
   - [ ] etcd node failure → failover
   - [ ] Heartbeat timeout → liveness detection
   - [ ] Network partition → quorum split

**Deliverables:**
- [ ] Unit test suite (>90% coverage)
- [ ] Integration test suite (all scenarios)
- [ ] Chaos test suite
- [ ] Performance benchmarks
- [ ] Load test results (500+ agents)

---

## DEPENDENCIES

### Infrastructure
- ✅ PostgreSQL (ready)
- ⚠️ etcd cluster (requires deployment)
- ⚠️ Redis (optional, for caching)

### Code Dependencies
- `@prisma/client` (already installed)
- `etcd3` (npm install required)
- `@grpc/grpc-js` (npm install required)

### Decisions Pending
1. **Heartbeat Cadence:** 5s? 10s? 30s?
   - Recommended: 10-30s (balance between responsiveness and load)
2. **TTL Window:** 30s? 60s? 90s?
   - Recommended: 3x heartbeat interval (90s for 30s heartbeat)
3. **Agent Capacity:** 500? 1000? 5000+?
   - Recommended: Start with 500, test to 1000+
4. **Regional Topology:** 3 regions? More?
   - Recommended: Start with 3 (quorum friendly)

---

## PHASE 01 COMPLETION GATE

All of the following must be DONE + TESTED + VERIFIED:

✅ **Schema**
- [ ] Agent table created
- [ ] AgentRegistryEvent table created
- [ ] All indexes created
- [ ] Prisma migrations applied

✅ **Service**
- [ ] AgentRegistry class implemented
- [ ] All CRUD operations working
- [ ] Error handling comprehensive
- [ ] Authorization checks in place

✅ **Health Monitoring**
- [ ] HeartbeatMonitor working
- [ ] Liveness detection working
- [ ] TTL expiry triggers state change

✅ **Multi-Region**
- [ ] etcd cluster operational
- [ ] Failover tested
- [ ] Regional queries working

✅ **Integration**
- [ ] fabric.ts updated
- [ ] instances.ts updated
- [ ] orchestrator.ts updated
- [ ] Agents starting up with registry

✅ **Testing**
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Chaos tests passing
- [ ] Load test results documented (500+ agents)

✅ **Documentation**
- [ ] API documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] Operations runbook

✅ **Master MD**
- [ ] AGENTIC_OS_MASTER.md updated with Phase 01 completion evidence
- [ ] Acceptance criteria signed off
- [ ] Next phase (Phase 02) ready to start

---

## RISK REGISTER

| Risk | Impact | Mitigation |
|------|--------|-----------|
| etcd cluster deployment delays | HIGH | Pre-provision in parallel |
| PostgreSQL migration fails | HIGH | Test migrations in staging first |
| Heartbeat timeout causes cascading failures | MEDIUM | Implement exponential backoff |
| Multi-region network partition | MEDIUM | Test split-brain scenario |
| Agent registration bottleneck at scale | MEDIUM | Add async batch registration |

---

## BUDGET & TIMELINE

**Total Effort:** 70 hours

| Task | Hours | Days | Timeline |
|------|-------|------|----------|
| Schema Design | 4 | 0.5 | Mon-Tue |
| Registry Service | 20 | 2.5 | Tue-Fri |
| Heartbeat Monitor | 15 | 2 | Fri-Mon |
| Multi-Region | 15 | 2 | Mon-Wed |
| Integration | 10 | 1.5 | Wed-Thu |
| Testing | 10 | 1.5 | Thu-Fri |
| **TOTAL** | **70** | **~2 weeks** | |

---

## NEXT PHASE BLOCKERS

Phase 02 (Agent Capability Model) cannot start until Phase 01 gate is passed:
- [ ] Registry distributed and working
- [ ] 500+ agent load test successful
- [ ] Multi-region failover verified
- [ ] Zero critical bugs

Phase 03 (Tool Registry) has hard dependency on Phase 01.

Phase 04+ all depend on Phase 01 completion.

---

## ACCEPTANCE PROTOCOL

**Phase 01 must transition to "COMPLETE" only when:**

1. ✅ All code changes merged and deployed to staging
2. ✅ All tests passing in CI/CD
3. ✅ Load test: 500+ agents registered and monitored
4. ✅ Chaos test: All failure scenarios passed
5. ✅ Performance: <10ms for getAgent() queries
6. ✅ Audit logging: All events captured
7. ✅ No critical security issues
8. ✅ Operations team signed off on runbook
9. ✅ AGENTIC_OS_MASTER.md updated with evidence
10. ✅ Phase 02 ready to start

**Sign-off:** CTO / Architecture Board / Operations Lead

---

**Phase Status:** 🔄 IN DESIGN (ready to implement)

**Next Action:** Begin Task 1 (Schema Design) once approved
