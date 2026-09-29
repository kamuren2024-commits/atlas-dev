# Evaluation Replay

**Status: DIAGNOSTICS ONLY / NO AUTHORITATIVE REPLAY**

`EvaluationReplayService.diagnose` accepts a caller-supplied manifest and artifact array, detects missing IDs and SHA-256 mismatches, and hashes the manifest. It does not load historical tender/bid/criteria/evidence/verification/score/decision versions from the database, recompute the evaluation, compare exact outputs, or persist a replay audit event.

There is no active Evaluation OS replay API or user workflow. Production replay must be read-only, load immutable artifacts as they existed at the relevant time, disclose missing inputs, report exact stored-versus-replayed divergence, and leave state unchanged. The diagnostic helper is not evidence that a procurement evaluation can currently be replayed.
