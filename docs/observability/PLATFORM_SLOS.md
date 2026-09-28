# SERVICE LEVEL OBJECTIVES (SLO) SPECIFICATION

This document details the Service Level Indicators (SLIs), SLO calculations, and error budget models.

---

## 1. SLO Calculation Framework

We calculate SLO compliance over a **30-day rolling window** using standard formulas:

$$\text{Compliance Rate} = \frac{\text{Successful Requests meeting SLI thresholds}}{\text{Total Valid Requests received}} \times 100$$

---

## 2. Error Budget Allotments

An error budget represents the permissible rate of failure for a service:

* **SLA Target: 99.9%** (Equivalent to **43 minutes** of unplanned downtime per month).
* **Budget Consumption Monitoring**: SRE teams review monthly error budget burn rates. If more than **50%** of a service's error budget is consumed within a 7-day period, feature rollouts are paused, and development teams shift focus to stability improvements.
