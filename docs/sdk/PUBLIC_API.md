# PUBLIC API DEFINITIONS

This document details the public REST API endpoints exposed to authorized client libraries and external integrations.

---

## 1. Versioning Protocol

* **Gateway URL**: All calls must query `/api/v1/*`.
* **Deprecation Policy**: Breaking contract updates trigger a major version bump, with a minimum 90-day deprecation notice period.

---

## 2. Certified REST Endpoints

### Requisition Query
* **Method**: `GET`
* **Path**: `/api/v1/requisition/:id`
* **Response**: `200 OK` with JSON matching the strict `RequisitionPayload` contract.

### Tender Formulation
* **Method**: `POST`
* **Path**: `/api/v1/tender`
* **Payload**: Formulates automated bidding templates under PPADA guidelines.
