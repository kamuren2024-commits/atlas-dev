# Phase 03 Test Matrix

Status: `NOT_EXECUTED`

Required deployment-backed tests include Redpanda/Kafka publishing, consumer
deduplication, dead-letter replay, durable workflow restart, OPA authorization,
MCP SSRF/DNS/redirect defenses, rate limits, connector response validation,
tenant isolation, prompt-injection handling, and human approval pauses.

The existing `npm.cmd test` suite does not prove these deployment properties.
