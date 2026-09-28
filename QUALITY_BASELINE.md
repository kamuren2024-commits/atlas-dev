# QUALITY BASELINE & POLICY — KETRACO SCM Intelligence Nexus

This document defines the coding, design, structural, and performance baselines expected of all software modules in the KETRACO SCM Intelligence Nexus.

---

## 1. Code Quality Policies

### Zero-Warning Rule
All source files added to the repository must produce zero warnings during static analysis. No loose types, missing imports, or unused parameters are permitted in staging branches.

### Modular Code Isolation
Large, monolithic code blocks are strictly forbidden:
* React components must not exceed **400 lines of code**. Large components must be split into functional sub-components under `src/components/`.
* Shared type definitions must reside in `/src/types.ts` rather than individual presenter files.

---

## 2. Dynamic Performance Baselines

* **Client Load Times**: Core visual bundles must load in $\le 1.0$ seconds on standard connection environments.
* **Interactive Canvas Latency**: Grid map and simulation actions must process calculations at $\ge 60$ FPS with negligible delay.
* **API Ingress Response**: Standard monitoring routes (e.g., `/api/health`) must return health indexes in $\le 5$ milliseconds.

---

## 3. UX & Styling Baseline

* **Design Framework**: Enforce **Tailwind CSS** with consistent spacing tokens. Direct inline style overrides are prohibited.
* **Icons**: All interactive glyphs must use `lucide-react` icons exclusively. Custom raw SVGs or unstandardized graphics packages are disallowed.
* **Accessibility**: Contrast ratios of all text elements against backgrounds must meet WCAG 2.1 AA benchmarks.
