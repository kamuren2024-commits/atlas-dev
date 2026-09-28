# 10 — Security, Zero-Trust & Identity Governance

**Target System:** Salience Atlas Security Architecture, Identity & Access Management (IAM), Zero-Trust Controls  
**Scope:** Authentication Router, `IdentityService`, Token Cryptography, RBAC / Clearance Levels, Audit Trails  
**Auditor:** Principal Enterprise Security Architect & Cyber-Defense Specialist  
**Date:** Q3 2026  
**Status:** COMPLETE — EMPIRICAL RECONNAISSANCE BASELINE  

---

## 1. Executive Summary

In critical national infrastructure (power transmission and statutory treasury disbursements), security must adhere to strict **Zero-Trust principles**: mutual authentication, least-privilege role-based access control (RBAC), tamper-evident audit logging, and cryptographic verification of all state transitions.

Salience Atlas features a comprehensive **Identity & Role model** on paper (Clearance Levels 1–4, multi-tenant separation, audit signatures). However, an empirical inspection of `backend/security/` exposes **critical security vulnerabilities and demo shortcuts**:
- Hardcoded static user accounts (`ENTERPRISE_USERS`) with default passwords (`password123`).
- Custom naive JWT encoding (`Buffer.from(...).toString('base64')`) without cryptographic HMAC/RSA verification.
- Tokens stored in-memory without persistent revocation lists.
- Production credentials and secret keys defaulting to hardcoded dev fallbacks.

---

## 2. Authentication & Identity Store (`backend/security/auth-router.ts`)

### 2.1 Hardcoded Enterprise Accounts
Line 18 of `backend/security/auth-router.ts` defines static in-memory user records:
```ts
const ENTERPRISE_USERS = [
  {
    id: 'usr-admin-01',
    username: 'admin@ketraco.co.ke',
    password: 'password123',
    role: 'SYSTEM_ADMIN',
    clearanceLevel: 'LEVEL_4_CRITICAL_INFRASTRUCTURE',
    tenantId: 'ketraco-national'
  },
  {
    id: 'usr-ops-01',
    username: 'dispatcher@ketraco.co.ke',
    password: 'password123',
    role: 'GRID_DISPATCHER',
    clearanceLevel: 'LEVEL_3_OPERATIONS',
    tenantId: 'ketraco-national'
  },
  {
    id: 'usr-auditor-01',
    username: 'auditor@ppoa.go.ke',
    password: 'password123',
    role: 'STATUTORY_AUDITOR',
    clearanceLevel: 'LEVEL_2_COMPLIANCE',
    tenantId: 'ppoa-regulatory'
  }
];
```
**Risk Assessment:** **CRITICAL**. Plaintext passwords stored in source code; default credentials can authenticate to any endpoint.

---

## 3. Cryptographic Token Generation (`IdentityService.ts`)

In `backend/security/identity-service.ts`, JWT creation is implemented as:
```ts
function generateToken(user: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.id,
    role: user.role,
    clearance: user.clearanceLevel,
    tenantId: user.tenantId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400
  };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'atlas-dev-secret-key-32-chars-long!')
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
```

### Vulnerability Analysis:
1. **Weak Secret Fallback:** Uses `'atlas-dev-secret-key-32-chars-long!'` when `process.env.JWT_SECRET` is unset. Any attacker knowing this default string can forge arbitrary `SYSTEM_ADMIN` tokens.
2. **Missing Token Revocation (Blacklist):** Revocation endpoints store blacklisted tokens in an in-memory `Set<string>`. A container restart clears the blacklist, re-enabling revoked tokens.
3. **No Refresh Token Flow:** Tokens have a fixed 24-hour lifetime with no refresh token rotation or hardware key binding.

---

## 4. Clearance Levels & Role-Based Access Control (RBAC)

The system defines four hierarchical clearance tiers:
- **LEVEL 1 (PUBLIC / VENDOR):** Read-only tender documents; submit sealed bids.
- **LEVEL 2 (STATUTORY AUDITOR):** Full read access to evaluation scoring ledgers, audit trails, and PPADA Section 71 compliance matrices.
- **LEVEL 3 (GRID / SCM DISPATCHER):** Operational write access: fleet dispatch, mission authorization, purchase order creation.
- **LEVEL 4 (CRITICAL INFRASTRUCTURE / EXECUTIVE):** Grid topology switching, emergency breaker override, multi-billion KES treasury disbursement authorization.

**Enforcement Reality:**
While middleware `requireClearance('LEVEL_3_OPERATIONS')` is applied to several logistics and dispatch routes, many core database routes (`/api/finance`, `/api/evaluations`, `/api/digital-twin`) currently lack clearance checks, allowing any caller to execute data queries.

---

## 5. Audit Logging & Non-Repudiation (`audit_logs`)

### 5.1 SQLite `audit_logs` Schema:
In `DatabaseCore.ts`, table `audit_logs` records:
- `id` (UUID v4)
- `timestamp` (ISO UTC)
- `user` (Operator username / Agent ID)
- `action` (e.g. `BREAKER_TRIP_ACKNOWLEDGED`, `BIDDER_DISQUALIFIED`)
- `document_id` / `document_name`
- `details` (JSON payload)
- `signature` (SHA-256 HMAC)

### 5.2 Tamper-Evidence Audit:
The `signature` column is designed to prevent audit log manipulation. However, signatures are currently computed with the shared secret `process.env.AUDIT_KEY || 'audit-secret'`, without asymmetric public-key infrastructure (PKI) or external append-only ledger anchoring.

---

## 6. Security Hardening Roadmap

| Priority | Vulnerability / Debt | Target Security Fix |
|---|---|---|
| **P0 (Immediate)** | Hardcoded passwords in `auth-router.ts` | Hash passwords with bcrypt/argon2; store user credentials in SQLite `users` table. |
| **P0 (Immediate)** | Fallback JWT secret | Enforce strict startup check: throw fatal exception if `JWT_SECRET` is unset in production. |
| **P1 (High)** | In-memory token blacklist | Store revoked tokens in SQLite table `revoked_tokens` with expiration indices. |
| **P1 (High)** | Unprotected API endpoints | Mount `authenticateToken` middleware globally across all `/api/*` routes with explicit public exemptions (`/api/auth/login`, `/api/health`). |
| **P2 (Medium)** | Asymmetric audit signatures | Upgrade audit log signatures to Ed25519 digital signatures using a private platform key. |
