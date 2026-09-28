# SRE Runbook: AI Provider Outage & Failover Mitigation

This operational runbook describes the steps for diagnosing and mitigating a complete AI provider outage or performance degradation.

---

## 1. Automated Detection Symptoms

The platform's unified federation router handles minor, transient outages automatically. SRE teams should look for:
* Logs containing `[AI_FAILOVER_TRIGGERED]`.
* Repeated `rotateKey()` operations inside `KeysVault`.
* Sudden spike in fallback API usage (e.g., Gemini $\rightarrow$ Groq $\rightarrow$ OpenAI).

---

## 2. Playbook: Investigating Provider Failures

If an outage persists or cascades to multiple fallback providers, execute the following steps:

### Step 1: Check Provider Health Statuses
Check the public status pages of the active providers:
* Google Cloud Status: `https://status.cloud.google.com/`
* Groq Status: `https://status.groq.com/`
* OpenAI Status: `https://status.openai.com/`

### Step 2: Query Active Registries
To check which models are currently registered and active in the local container, grep the startup logs for:
```bash
grep -E "Registered provider" logs/server.log
```

### Step 3: Rotate or Provide Auxiliary Keys
If the primary provider is healthy but returning HTTP 429 (Rate Limited) or 401 (Unauthorized), update the credentials in Google Secret Manager or your local `.env.local` configuration, and restart the dev server to clear caches:
```bash
# Restart server to load new configurations
npm run restart
```
