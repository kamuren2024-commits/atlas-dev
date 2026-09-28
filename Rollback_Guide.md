# ROLLBACK PLAN & GUIDE — KETRACO SCM Intelligence Nexus

This guide defines the procedures, indicators, and execution steps to roll back a production release in the event of post-deploy failure.

---

## 1. Rollback Indicators (When to Roll Back)

SRE teams must initiate emergency rollback procedures if any of the following occur within 1 hour post-deployment:

* **Inability to Boot**: Server crashes during container bootstrap (exits with code $\ge 1$).
* **API Failure Spikes**: Ratio of HTTP 5xx errors on `/api/` endpoints exceeds **1%**.
* **Integrity Lockdowns**: Background environment monitor triggers persistent `SECURITY_ALERT` flags.
* **Cost Runaway**: AI API cost indicators spike past $10 USD within a 15-minute window.

---

## 2. SOP: Executing Cloud Run Rollback

If rollback triggers are met, execute the recovery steps:

### Step 1: Query Previous Release Revisions
List the active and historical revisions of the Cloud Run cluster:
```bash
gcloud run revisions list --service ketraco-scm-nexus --region europe-west2
```

### Step 2: Route Traffic to Prior Sterile Revision
Instantly shift 100% of client traffic back to the prior stable candidate (e.g. `v2-0-0-candidate` revision):
```bash
gcloud run services update-traffic ketraco-scm-nexus \
  --to-revisions=ketraco-scm-nexus-v2-0-0=100 \
  --region europe-west2
```

### Step 3: Verify Recovery Health
Query the health check endpoint of the rolled-back deployment to confirm operational green statuses:
```bash
curl -f https://<your-cloud-run-url>/api/health
```
This must confirm normal authentications.
