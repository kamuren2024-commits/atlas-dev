# ARCHITECTURE REVIEW BOARD (ARB) CHARTER

For the full detailed sub-specifications, please see:
* [/docs/governance/ARCHITECTURE_COUNCIL.md](/docs/governance/ARCHITECTURE_COUNCIL.md)
* [/docs/governance/DESIGN_REVIEW.md](/docs/governance/DESIGN_REVIEW.md)
* [/docs/governance/ENGINEERING_STANDARDS.md](/docs/governance/ENGINEERING_STANDARDS.md)
* [/docs/governance/EVOLUTION_GOVERNANCE.md](/docs/governance/EVOLUTION_GOVERNANCE.md)

---

## 1. Design & Evolution Flow

The ARB maintains structural standards, evaluating changes before writing code:

```
  [ Proposal ] ──► [ ARB Assessment ] ──► [ Approved ADR ] ──► [ Implementation ]
```

---

## 2. Core Governance Standards

* **Architecture Council**: Membership consists of SRE, Security, Compliance, and Architecture leaders.
* **Review Checklists**: Validates decoupling, secret isolation, and statutory compliance (PPADA tracing).
* **Engineering Standards**: Enforces strict TypeScript rules, component modularity, and visual excellence.
* **Separation of Concerns**: Dictates that tenant-specific custom logic is added via extensions, keeping the core engine clean.
