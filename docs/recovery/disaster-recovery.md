# Disaster Recovery & System Reconstruction Manual

This guide describes the procedures for reconstructing the KETRACO SCM Intelligence Nexus in the event of a catastrophic container, server, or cloud region failure.

---

## 1. System Recovery Objectives (RPO & RTO)

* **Recovery Point Objective (RPO)**: **$\le 1$ hour** (maximum permissible data age lost).
* **Recovery Time Objective (RTO)**: **$\le 4$ hours** (maximum duration to restore full operational services).

---

## 2. Playbook: Full Cluster Reconstruction

In the event of a complete Cloud Run or GCP region failure, execute the following restoration workflow:

### Step 1: Deploy Relational Database
Spin up a new Cloud SQL PostgreSQL instance with PGVector enabled:
```bash
gcloud sql instances create ketraco-pgvector-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-1-3840 \
  --region=europe-west2
```

### Step 2: Bind Credentials in Secret Manager
Re-populate the sensitive environment variables (e.g. Gemini, OpenAI) in Google Cloud Secret Manager.

### Step 3: Trigger Reconstruction Deploy
Build and deploy the application container to Cloud Run:
```bash
gcloud run deploy ketraco-scm-nexus \
  --image gcr.io/ketraco-scm/nexus-app:latest \
  --region europe-west2 \
  --set-secrets="GEMINI_API_KEY=gemini-key:latest,DATABASE_URL=db-url:latest"
```

The server `ConfigService` will automatically boot, validate the environments, scan the codebase for secret leaks, and bring the SCM Intelligence operating system online.
