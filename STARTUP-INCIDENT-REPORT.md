# Startup Incident Report

## Summary

Salience Atlas appeared blank because the development server did not bind port 3000 until heavyweight backend initialization completed. The browser received an HTML shell with an empty `#root`, but application JavaScript could not execute while the server was unavailable.

## Evidence

- The supplied workspace is not a Git working tree; the previous commit and exact optimization diff cannot be recovered locally.
- `npm run build` succeeds, but Vite production compilation took approximately 15 minutes and produced a 4.1 MB JavaScript chunk.
- `npx tsc --noEmit` succeeds.
- `npm run dev` delayed server binding while it performed SQLite connection, migrations, Event Fabric initialization, Digital Twin bootstrap, canonical-model initialization, and Knowledge Graph initialization.
- Before initialization completed, requests to `http://127.0.0.1:3000/` failed with `ERR_CONNECTION_REFUSED`.
- After initialization completed, `/` returned the expected HTML document with an empty `#root`; no browser React exception was observed.

## Root cause

`server.ts` performs database connection and migrations, followed by Event Fabric initialization, before calling `app.listen`. Optional intelligence initialization therefore blocks liveness and the first browser request. This is the measured startup bottleneck and is independent of the React render tree.

## Recovery

- Added a production-grade React error boundary around the Atlas shell. Child render failures now expose a non-sensitive error identifier, timestamp, retry action, and Command Center navigation.
- Added an explicit root-element guard in `main.tsx`.
- No fake health state, timeout, mocked response, service bypass, module deletion, or artificial loading completion was introduced.

## Remaining work

The backend lifecycle should be split into:

1. construct routes and bind the HTTP listener;
2. expose cheap liveness at `/api/health`;
3. initialize database migrations and optional intelligence services in an explicit background lifecycle;
4. expose dependency state through separate readiness and diagnostics endpoints.

That change requires validating every router's dependency assumptions in a separate build/run/measure loop.
