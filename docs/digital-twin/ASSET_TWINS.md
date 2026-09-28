# ASSET TWIN SPECIFICATIONS

This document details the configuration properties, health profiles, and real-time state metrics tracked for SCM grid infrastructure assets.

---

## 1. Asset Twin Template

Every tracked asset is represented by a standardized JSON schema modeling its operating parameters:

```json
{
  "asset_id": "ast-transformer-01",
  "asset_type": "Transformer",
  "voltage_rating_kv": 400,
  "telemetry": {
    "temperature_celsius": 68.5,
    "oil_level_percentage": 94.2,
    "load_factor": 0.78
  },
  "metadata": {
    "manufacturer": "Siemens Energy",
    "install_date": "2021-04-12"
  }
}
```

---

## 2. Dynamic Health Scoring

The Asset Twin runs localized anomaly detection to calculate health indices. A health index dropping below 0.6 triggers automated maintenance order requests.
