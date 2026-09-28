# PREDICTIVE ANALYTICS ARCHITECTURE

This document details the predictive forecasting models used to estimate SCM capacity limits and spare lead times.

---

## 1. Predictive Forecasting Models

We run historical timeseries models to forecast inventory levels and flag impending supply-chain gridlocks:

```
  [ Historic SAP Data ] ──► [ Timeseries Model ] ──► [ 90-Day Lead-Time Forecast ]
                                                        - Transformer delay: +20 Days
                                                        - Lead-time trend: Increasing
```

---

## 2. Model Accuracy Metrics

Model performance is evaluated daily. If Mean Absolute Percentage Error (MAPE) exceeds 12%, an automated alert triggers a retraining job.
