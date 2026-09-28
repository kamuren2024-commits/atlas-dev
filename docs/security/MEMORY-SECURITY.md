# Memory security baseline

## Current state

The runtime includes memory subsystems, but the repository does not yet implement the required trust boundary to treat external memory as untrusted by default. The Phase II requirements call for classification, provenance, access control, and poisoning defenses.

## Observed concerns

- external memory sources are not consistently treated as untrusted
- provenance is not guaranteed before memory becomes operational context
- retrieval does not appear to enforce an explicit policy, tenant, and ACL check at every access
- prompt memory poisoning is a recognized risk and not fully gated here

## Required controls

- classify source
- validate provenance
- enforce tenant filters
- enforce ACL filters
- validity and relevance filtering
- prevent untrusted memory from becoming authoritative instruction

## Verdict

Memory trust separation remains incomplete and should be treated as an active security gap.
