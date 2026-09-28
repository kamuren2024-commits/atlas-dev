# Production Deployment Manual

This guide describes the steps and configurations required to deploy the KETRACO SCM Intelligence Nexus to production environments.

---

## 1. Build Verification

Before attempting deployment, the codebase must compile cleanly under production configurations:

```bash
# Clean lock files and cache if required
npm cache clean --force

# Run typescript strict linter
npm run lint

# Build production frontend and bundle server.ts to dist/server.cjs
npm run build
```

The build command compiles React assets using Vite to `dist/`, and bundles `server.ts` using `esbuild` to `dist/server.cjs` with standard dependencies.

---

## 2. Containerization

The production Dockerfile is configured to run the bundled server output:

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

## 3. Deployment Command (Cloud Run)

To deploy the containerized platform to Google Cloud Run:

```bash
gcloud run deploy ketraco-scm-nexus \
  --image gcr.io/ketraco-scm/nexus-app:latest \
  --platform managed \
  --region europe-west2 \
  --port 3000 \
  --update-env-vars NODE_ENV=production \
  --allow-unauthenticated
```
