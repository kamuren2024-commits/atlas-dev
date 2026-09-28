# PLATFORM PRODUCTIZATION STRATEGY

For the full detailed sub-specifications, please see:
* [/docs/product/PRODUCT_STRATEGY.md](/docs/product/PRODUCT_STRATEGY.md)
* [/docs/product/CAPABILITY_CATALOG.md](/docs/product/CAPABILITY_CATALOG.md)
* [/docs/product/ROADMAP.md](/docs/product/ROADMAP.md)
* [/docs/product/PLATFORM_PACKAGING.md](/docs/product/PLATFORM_PACKAGING.md)

---

## 1. Modular Pricing & Packaging Editions

We package the SCM platform into clearly defined tiers to facilitate standard and governmental deployments:

```
  ┌───────────────────────────────────────────────────────────────────┐
  │                           SALIENCE ENGINE                         │
  ├───────────────────────┬───────────────────────────┬───────────────┤
  │ Standard Edition      │ Enterprise Edition        │ Govt Sovereign│
  │ • Sourcing Scribes    │ • Multi-Zone Clusters     │ • Offline gVis│
  │ • Basic Web Portal    │ • Active-Active failovers │ • Citations   │
  └───────────────────────┴───────────────────────────┴───────────────┘
```

---

## 2. Capability Catalog & Delivery

* **Licensing Enforcements**: Dynamic features are controlled via secure, cryptographically signed files.
* **Packaging Standards**: Containers compile to Google Distroless minimal profiles, distributed via Helm charts.
* **Roadmap Horizons**: Prioritizes development horizons focusing on GA stability, extended sandboxing, and quantum safety.
