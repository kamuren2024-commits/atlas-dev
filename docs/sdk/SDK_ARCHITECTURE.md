# SDK ARCHITECTURE AND CORE DATA STRUCTURES

This document defines the core architecture, data structures, and type definitions of the KETRACO SDK.

---

## 1. Type-Safe Core Boundaries

All interaction payloads are strictly compiled using unified TypeScript interfaces to ensure backward compatibility and prevent integration compile failures.

```
  [ Client Extension ] ──► (Type-Safe Interface) ──► [ KETRACO SDK Layer ]
```

---

## 2. Shared Core Interfaces

```typescript
export interface SDKRequestHeader {
  extensionId: string;
  signature: string;
  timestamp: string;
}

export interface RequisitionPayload {
  requisitionId: string;
  budgetCeiling: number;
  originatorRegion: string;
  itemsList: string[];
}
```
