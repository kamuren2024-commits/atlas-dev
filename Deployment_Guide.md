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
The server listens on the platform-provided `PORT` and `HOST` values, defaulting to `3000` and `0.0.0.0` for local/container deployments. The health endpoint returns HTTP 503 while startup is incomplete or the database is degraded, and HTTP 200 only after the database and system report healthy.

## 4. Netlify Frontend and API

Netlify serves the built frontend and routes `/api/*` through the `atlas-api` function to the existing Atlas API. Configure `ATLAS_API_ORIGIN` as the HTTPS origin of the running Atlas backend; do not include a path. Netlify needs only this API origin. Configure `DEV_ADMIN_PASSPHRASE`, `DEV_ADMIN_TENANT_ID`, and `NODE_ENV=development` only on the backend development runtime. Never configure the passphrase with a `VITE_` prefix. If direct cross-origin API access is required, configure `ATLAS_ALLOWED_ORIGINS` on the backend as a comma-separated list of exact HTTPS origins.

Point deploy previews at that development backend. Production backends must retain `NODE_ENV=production`, which keeps the existing identity policy rejecting DEV_ADMIN.
