# Decision Traceability

`DecisionTrace` records criteria, legal, and policy versions; input and evidence hashes; deterministic results; advisory AI recommendations; human actions; approvals; final decision; and a trace hash.

`PostgresDecisionTraceRepository` persists immutable traces in `decision_traces`. Duplicate decision IDs are ignored, while hash mismatches fail closed.

AI recommendations remain visibly `ADVISORY` until independently verified. A decision trace is not a replacement for the existing audit chain; it is the reconstruction record that links legal controls, evidence, policy, and human governance.
