# EVENT SUBSCRIPTION & WEBHOOK PROTOCOLS

This document outlines the asynchronous event streaming model and webhook registration protocols.

---

## 1. Kafka Event Delegation

The SCM platform broadcasts transaction events over Apache Kafka. Clients subscribe to events via standardized webhooks:

```
  [ Sourcing Event ] ──► [ Kafka Topic ] ──► [ Router ] ──► [ Verified Webhooks ]
```

---

## 2. Event Payload Schema

All transaction event notifications adhere to a structured schema:

```json
{
  "eventId": "evt_9a8f7c...",
  "eventType": "REQUISITION_CREATED",
  "timestamp": "2026-06-28T18:20:00Z",
  "data": {
    "id": "req_551",
    "region": "Rift Valley"
  }
}
```
