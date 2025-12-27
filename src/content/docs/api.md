---
title: API Reference
description: Complete API documentation for @tracehound/core.
---

# API Reference

Complete reference for the `@tracehound/core` package.

---

## Quick Reference

| Function              | Purpose                               |
| --------------------- | ------------------------------------- |
| `createAgent()`       | Main entry point, intercepts requests |
| `createQuarantine()`  | Evidence storage with eviction        |
| `createRateLimiter()` | Per-source rate limiting              |
| `createWatcher()`     | Pull-based observability              |
| `generateSecureId()`  | UUIDv7 generation                     |

---

## Agent

The main entry point for intercepting requests.

### `createAgent(config)`

```typescript
import { createAgent, createQuarantine } from '@tracehound/core'

const agent = createAgent({
  quarantine: createQuarantine({ maxCount: 1000 }),
  rateLimiter: createRateLimiter({ windowMs: 60_000, maxRequests: 100 }), // optional
  maxPayloadSize: 1_000_000, // optional, default 1MB
})
```

### `agent.intercept(scent)`

Process a scent through the security pipeline.

```typescript
const result = agent.intercept(scent)
```

**Returns:** `InterceptResult`

| Status              | Properties               | Meaning             |
| ------------------- | ------------------------ | ------------------- |
| `clean`             | —                        | No threat, proceed  |
| `quarantined`       | `handle: EvidenceHandle` | Threat isolated     |
| `rate_limited`      | `retryAfter: number`     | Rate limit exceeded |
| `ignored`           | `signature: string`      | Duplicate threat    |
| `payload_too_large` | `limit: number`          | Exceeds size limit  |
| `error`             | `error: string`          | Processing error    |

---

## Scent

The input to `agent.intercept()`. Represents a captured request.

```typescript
interface Scent {
  id: string // Unique ID (use generateSecureId())
  timestamp: number // Unix timestamp in ms
  source: string // Client IP or identifier
  payload: unknown // Request data (will be serialized)
  threat?: ThreatSignal // From your external detector
}
```

### Example

```typescript
const scent: Scent = {
  id: generateSecureId(),
  timestamp: Date.now(),
  source: req.ip,
  payload: {
    method: req.method,
    path: req.path,
    body: req.body,
  },
  threat: myWafCheck(req), // undefined = clean
}
```

---

## ThreatSignal

Signal from your external detector (WAF, ML model, custom rules).

```typescript
interface ThreatSignal {
  category: 'injection' | 'ddos' | 'flood' | 'spam' | 'malware' | 'unknown'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence?: number // 0-1, optional
  metadata?: Record<string, unknown>
}
```

### Example

```typescript
const threat: ThreatSignal = {
  category: 'injection',
  severity: 'high',
  confidence: 0.95,
  metadata: { rule: 'SQL_INJECTION_001' },
}
```

---

## Quarantine

Evidence storage with bounded memory and priority-based eviction.

### `createQuarantine(config, auditChain?)`

```typescript
import { createQuarantine, AuditChain } from '@tracehound/core'

const auditChain = new AuditChain() // optional, enables Merkle chain
const quarantine = createQuarantine(
  {
    maxCount: 1000,
    maxBytes: 100_000_000, // 100MB
    evictionPolicy: 'priority', // 'priority' | 'lru' | 'fifo'
  },
  auditChain
)
```

### Methods

| Method                   | Description                    |
| ------------------------ | ------------------------------ |
| `quarantine.count`       | Current evidence count         |
| `quarantine.bytes`       | Current memory usage           |
| `quarantine.get(handle)` | Retrieve evidence by handle    |
| `quarantine.flush()`     | Clear all evidence (emergency) |

---

## Rate Limiter

Token bucket rate limiter with per-source blocking.

### `createRateLimiter(config)`

```typescript
import { createRateLimiter } from '@tracehound/core'

const rateLimiter = createRateLimiter({
  windowMs: 60_000, // 1 minute window
  maxRequests: 100, // Requests per window
  blockDurationMs: 300_000, // 5 minute block when exceeded
})
```

---

## Watcher

Pull-based observability for threat statistics. No push, no callbacks.

### `createWatcher(config)`

```typescript
import { createWatcher } from '@tracehound/core'

const watcher = createWatcher({ quarantine, auditChain })

// Get current snapshot
const snapshot = watcher.getSnapshot()
console.log(snapshot.stats)
// { total: 150, bySeverity: { high: 20, medium: 80, low: 50 } }
```

---

## Utilities

### ID Generation

```typescript
import { generateSecureId, isValidSecureId } from '@tracehound/core'

const id = generateSecureId() // UUIDv7, time-sortable
isValidSecureId(id) // true
```

### Hashing

```typescript
import { hash, hashBuffer } from '@tracehound/core'

hash('data') // SHA-256 hex string
hashBuffer(uint8array) // SHA-256 from buffer
```

### Cold Path Codec

For compressing evidence before cold storage:

```typescript
import { createColdPathCodec } from '@tracehound/core'

const codec = createColdPathCodec()
const compressed = codec.encode(buffer) // gzip
const original = codec.decode(compressed)
```

### Integrity Encoding

For tamper-proof cold storage:

```typescript
import { encodeWithIntegrity, verify, decodeWithIntegrity } from '@tracehound/core'

const encoded = encodeWithIntegrity(data)

if (verify(encoded)) {
  const data = decodeWithIntegrity(encoded)
}
```

---

## Adapters

Framework-specific adapters with optimized defaults:

| Package               | Framework             |
| --------------------- | --------------------- |
| `@tracehound/express` | Express.js middleware |
| `@tracehound/fastify` | Fastify plugin        |

### Express Example

```typescript
import { createTracehoundMiddleware } from '@tracehound/express'

app.use(
  createTracehoundMiddleware({
    maxPayloadSize: 1_000_000,
    quarantine: { maxCount: 1000 },
    rateLimit: { windowMs: 60_000, maxRequests: 100 },
    detector: (req) => myWafCheck(req),
  })
)
```

---

## Type Exports

All types are exported for TypeScript users:

```typescript
import type {
  Scent,
  ThreatSignal,
  InterceptResult,
  EvidenceHandle,
  QuarantineConfig,
  RateLimiterConfig,
} from '@tracehound/core'
```
