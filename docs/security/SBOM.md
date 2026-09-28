# SOFTWARE BILL OF MATERIALS (SBOM) STANDARD

This document specifies the CycloneDX and SPDX SBOM guidelines enforced on KETRACO SCM platform components.

---

## 1. Automated SBOM Generation

To maintain 100% visibility into transitive libraries and dependency license footprints, we generate a Software Bill of Materials (SBOM) for every release:

* **Format**: CycloneDX JSON format (`cyclonedx-bom.json`).
* **CI Generation Tool**: Syft or CycloneDX-Node.
* **Pipeline Command**:
```bash
syft dir:. -o cyclonedx-json > bom.json
```

---

## 2. Dependency License Audits

SBOM files are parsed by automated policy engines (e.g., Dependency-Track) to ensure compliance with our licensing guidelines:

* **Approved Licenses**: MIT, Apache 2.0, BSD-3-Clause, ISC.
* **Prohibited Licenses**: GPL v3, AGPL (due to copyleft clauses that could affect proprietary KETRACO grid optimization IP).
