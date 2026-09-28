# CLOUD NETWORK & ENVIRONMENT LAYOUT

This document details the VPC layouts, IP allocation ranges, and subnets for all active environments.

---

## 1. VPC Topography

We operate within a single private virtual private cloud (`ketraco-vpc-prod`) segmented across multiple regions:

* **Primary Hub Region**: `europe-west2` (London)
* **Secondary Disaster Region**: `europe-west3` (Frankfurt)

---

## 2. IP Subnet Allocations

To prevent routing conflicts with external systems (e.g. SAP ERP systems), subnets are allocated cleanly:

| Environment | Subnet Name | Region | IP Range | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Global** | `bastion-subnet` | `europe-west2` | `10.100.0.0/24` | Administrative jumpboxes |
| **Dev** | `gke-dev-subnet` | `europe-west2` | `10.101.0.0/16` | GKE node subnet |
| **Staging** | `gke-stg-subnet` | `europe-west2` | `10.102.0.0/16` | GKE node subnet |
| **Production**| `gke-prod-subnet`| `europe-west2` | `10.103.0.0/16` | GKE node subnet |
| **DR** | `gke-dr-subnet` | `europe-west3` | `10.104.0.0/16` | Backup node subnet |

---

## 3. Private Service Connect (PSC)

All database connections use Private Service Connect, mapping local internal IPs directly to Cloud SQL, eliminating internet egress paths for DB traffic.
