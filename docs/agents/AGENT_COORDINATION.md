# AGENT COORDINATION & DISPATCH

This document details task delegation, message queues, and consensus mechanisms of the SCM Multi-Agent Runtime.

---

## 1. Event Bus Communication

Agents coordinate asynchronously using dedicated event-stream topics built on Apache Kafka:

```
  [ Agent A: Emit Action ] ──► [ Kafka Topic: agent.events ] ──► [ Agent B: Process ]
```

---

## 2. Capability Registry & Dispatching

* **Agent Registry**: Tracks active agent profiles, metadata, and skill classes.
* **Dynamic Routing**: Dispatches tasks to available, best-performing agents using historical success rates.
* **Consensus Agreements**: Employs Paxos-derived voting protocols to resolve multi-agent planning conflicts.
