# EXTENSION LIFECYCLE MANAGEMENT

This document outlines the lifecycle stages, promotion gates, and certification rules for platform extensions.

---

## 1. Lifecycle Phases

The lifecycle of an extension consists of five clear phases:

```
  [ Draft / Dev ] ──► [ Certify & Sign ] ──► [ Promoted ] ──► [ Active ] ──► [ Deprecate ]
```

---

## 2. Certification Gateways

To be promoted to `Active` status, extensions must clear these automated gates:
* **Static Analysis**: 100% check against ESLint rules with zero exceptions.
* **SCA Scan**: 100% check for CVE vulnerabilities (zero Highs allowed).
* **Load Baseline**: Demonstrates less than 50ms processing overhead under baseline stress testing.
