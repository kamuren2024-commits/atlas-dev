# Release Management Process

This document defines the release lifecycle, versioning guidelines, and deployment gates for the KETRACO SCM Intelligence Nexus.

---

## 1. Versioning Protocol

We adhere strictly to Semantic Versioning (SemVer) with custom project qualifiers:
* **MAJOR (`x.0.0`)**: Large structural changes, framework upgrades, or significant API changes (e.g., migrating to Salience Atlas V2).
* **MINOR (`0.y.0`)**: Addition of complete business features, SCM modules, or new agent persona models.
* **PATCH (`0.0.z`)**: Operational bug fixes, dependency updates, and documentation refinements.

---

## 2. Release Gate-Checks & Approvals

To promote a candidate build to production, the release branch must pass the following validation gates:

1. **Preflight Build Checklist**:
   - [x] Linter (`npm run lint`) returns zero errors or warnings.
   - [x] Compiles cleanly (`npm run build`).
   - [x] Pre-boot SecretScanner passes with 100% security hygiene score.
2. **Review & Sign-Off**:
   - Requires PR approvals from at least one SRE Lead and one SCM Systems Director.
   - Requires dynamic testing run-through approval by the QA Release Engineer.
3. **Audit Update**:
   - `CHANGELOG.md` updated with release notes and migration guidelines.
   - `AUDIT_LOG.md` updated with the transition details.
