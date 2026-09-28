# Event Schema Registry

Status: `IMPLEMENTED` as a validation contract; registry deployment is pending.

Evaluation OS event types are explicitly enumerated and require a producer,
classification, retention, compatibility mode, schema version, and payload
validator. Unknown event types, unsupported versions, missing tenant context, and
payload hash mismatches are rejected.
