# MTLS ENCRYPTED COMMUNICATION CHARTER

This document specifies the cryptographic baselines, handshake procedures, and cipher configurations used for inter-service security.

---

## 1. Handshake and TLS Profiles

All sidecars must negotiate connections using **TLS v1.3** exclusively. The allowed cipher suites are restricted to high-strength algorithms:

* **TLS_AES_256_GCM_SHA384** (Default)
* **TLS_CHACHA20_POLY1305_SHA256** (Auxiliary for mobile edge nodes)

---

## 2. SPIFFE Trust Domains

We operate within a single trust domain: `cluster.local`.
* **Verification**: Envoy proxy validates the peer's SPIFFE identity present in the Subject Alternative Name (SAN) of the certificate.
* **Deny on Mismatch**: Handshakes are immediately terminated if the SAN does not match authorized patterns (e.g. `spiffe://cluster.local/ns/scm-prod/sa/*`).

---

## 3. Ephemeral Keys Lifecycle

* **Rotation**: Certificates are automatically rotated every **12 hours** to limit the impact of potential key compromise.
* **Storage**: Ephemeral certificates reside solely in the pod's in-memory memory space (`tmpfs`) and are never written to disk.
