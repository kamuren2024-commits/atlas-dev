# DEPLOYMENT GUIDE — KETRACO SCM Intelligence Nexus

This deployment manual details the deployment gates, environmental parameters, container strategies, and validation scripts for the KETRACO platform.

---

## 1. Automated Preflight Build

The build script compiles both presentation assets and backend server code sequentially:

```bash
# Compile and bundle code
npm run build
```

The server is bundled via `esbuild` to a single CommonJS file (`dist/server.cjs`), eliminating ES Module path resolution errors on production systems.

---

## 2. Containerization Strategy

Our production container utilizes lightweight Alpine builders to minimize the attack surface:

```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

---

## 3. Cloud Run Deployments (SOP)

To deploy the compiled application to Google Cloud Run:

```bash
gcloud run deploy ketraco-scm-nexus \
  --image gcr.io/ketraco-scm/nexus-app:latest \
  --platform managed \
  --region europe-west2 \
  --port 3000 \
  --update-env-vars NODE_ENV=production
```

On successful deployment, verify server health by hitting the API status endpoint:
`https://<your-cloud-run-url>/api/health`
This must return a 100% green status payload.
