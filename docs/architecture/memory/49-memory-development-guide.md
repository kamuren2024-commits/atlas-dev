# 49. Memory Development Guide
## Salience Atlas v5

This guide provides clean, production-ready code examples demonstrating how to use the Enterprise Memory Fabric APIs in your components.

### 1. Registering the Singleton Runtime
```typescript
import { MemoryRuntime } from './src/core/memory';

const runtime = MemoryRuntime.getInstance();
```

### 2. Setting and Getting Memory Blocks
```typescript
const context = {
  tenantId: 'TENANT-ALPHA',
  correlationId: 'corr-101',
  permissions: [{ resource: 'user-profile', action: 'WRITE', authorized: true }]
};

// Write
const entry = await runtime.set('WORKING', 'user-profile', { name: 'Procurement Officer' }, context);

// Read
const retrieved = await runtime.get('WORKING', 'user-profile', context);
console.log(retrieved?.value.name); // 'Procurement Officer'
```

### 3. Executing a Search Query
```typescript
const query = {
  tags: ['compliance'],
  timeRange: { start: Date.now() - 3600000, end: Date.now() }
};

const searchResults = await runtime.search('WORKFLOW', query, context);
console.log(`Matched ${searchResults.entries.length} items`);
```

### 4. Running Historical Rollbacks
```typescript
// Roll back user-profile memory state to original version 1
const rollbacked = await runtime.rollback('WORKING', 'user-profile', 1, context);
```
