# SUPPLY CHAIN SECURITY & SBOM

This document records Software Bill of Materials (SBOM) standards and package integrity checks.

---

## 1. SBOM Generation

Our build pipeline generates a complete dependency SBOM on every production build:
* **Format**: CycloneDX JSON/XML standard format.
* **Signature**: Built images are signed using cryptographic signatures matching repository commits.

---

## 2. Package Vulnerability Scanners

We run automated vulnerability checks to block third-party security slips:
* **Daily SCA Run**: Scans package declarations for outdated or deprecated libraries.
* **Upgrade Rules**: Any dependency containing a vulnerability with a CVSS score greater than `7.0` blocks builds.
