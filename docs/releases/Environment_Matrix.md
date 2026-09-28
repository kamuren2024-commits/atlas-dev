# ENVIRONMENT MATRIX — KETRACO SCM Intelligence Nexus

This document maps environment scopes, credentials configurations, and database connections.

---

## 1. Environment Specifications

| Environment | Scope / Host | Database Url | AI Providers Active | Secrets Engine |
| :--- | :--- | :--- | :--- | :--- |
| **Development** | Localhost (Port 3000) | Local PGVector Instance | Google Gemini, Groq | Local `.env` |
| **Staging** | Staging Cloud Run | Staging Cloud SQL PG | Google Gemini, Groq, OpenRouter | Secret Manager |
| **Production** | Production Cloud Run | Production Cloud SQL PG | Google Gemini, Groq, OpenRouter | Secret Manager |

---

## 2. Parameter Configurations Matrix

* **`PORT`**: Fixed strictly to **`3000`** across all environments.
* **`NODE_ENV`**: Set to `development` locally and `production` on Staging/Production containers.
* **`GEMINI_API_KEY`**: Server-only credential; masked in logs; isolated from frontend.
