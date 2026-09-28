# Connector Provenance Model

Status: `PARTIALLY_IMPLEMENTED`

Connector results carry connector/provider identity, authorization context,
retrieval time, classification, source record, and response hash. Before
becoming evidence, responses require schema validation, integrity validation, and
explicit verification state. Raw external content is untrusted data and must not
be inserted into an LLM system prompt.
