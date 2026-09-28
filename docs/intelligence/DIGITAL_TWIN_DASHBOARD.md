# DIGITAL TWIN DYNAMIC VISUALIZATION

This document details the visual rendering, component mappings, and rendering engines used for the Digital Twin.

---

## 1. Geographic Rendering Engine

The digital twin visualizes transmission lines, warehouses, and shipping vehicles using Mapbox GL or Google Maps Web APIs:

```
  [ Spatial Geometries ] ──► [ Map Rendering Pipeline ] ──► [ Substation Pins & Line Vectors ]
```

---

## 2. Dynamic Component Overlays

* **Active Thermal Overlays**: Colors substations dynamically based on oil-temperature telemetry feeds.
* **Supplier Flow Overlays**: Renders geographic arcs mapping raw material movements from global ports to regional warehouses.
