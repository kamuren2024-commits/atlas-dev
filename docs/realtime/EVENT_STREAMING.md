# EVENT STREAMING ARCHITECTURE

This document establishes the event-driven backbone of KETRACO SCM services, managing high-throughput message buses.

---

## 1. Unified Event Bus Topology

The event bus handles asynchronous communication across containerized microservices, ensuring loose coupling and high resilience:

```
 [ Ingest Event (Telemetry/Bid) ] ──► [ Kafka Topic Partition ] ──► [ Consumer Group ]
                                                                             │
                                                                   [ Elastic/DB Indexes ]
```

---

## 2. Dynamic Streaming Topics

* **Topic `scm.telemetry.grid`**: Real-time transformer and substation load-factor streams.
* **Topic `scm.audit.bids`**: Bid submissions, scoring updates, and compliance audit events.
* **Topic `scm.alerts.operations`**: Operational warnings, outages, and threshold violations.
