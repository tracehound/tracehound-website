---
title: 'API Reference'
description: 'Complete API documentation for @tracehound/core.'
category: 'reference'
order: 2
---

# API Reference

Complete reference for the `@tracehound/core` package.

---

## Quick Reference

| Function              | Purpose                               |
| --------------------- | ------------------------------------- |
| `createTracehound()`  | Recommended entry point, creates full runtime |
| `createAgent()`       | Low-level agent (requires quarantine, rateLimiter, evidenceFactory) |
| `createQuarantine()`  | N/A — use `new Quarantine(config, auditChain)` or `createTracehound` |
| `createRateLimiter()` | Per-source rate limiting              |
| `createWatcher()`     | Pull-based observability              |
| `createS3ColdStorage()` | S3-compatible cold storage (v1.1.0+) |
| `generateSecureId()`  | UUIDv7 generation                     |

---

## Agent

The main entry point for intercepting requests.

### Recommended: `createTracehound(options)`

```typescript
import { createTracehound } from '@tracehound/core'

const th = createTracehound({
  quarantine: { maxCount: 1000, maxBytes: 100_000_000 },
  rateLimit: { windowMs: 60_000, maxRequests: 100 },
  maxPayloadSize: 1_000_000,
})

const result = th.agent.intercept(scent)
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

Evidence storage with bounded memory and priority-based eviction. Created via `createTracehound()` or `new Quarantine(config, auditChain)`.

### Access via createTracehound

```typescript
const th = createTracehound()
const quarantine = th.quarantine
```

### Methods

| Method                   | Description                    |
| ------------------------ | ------------------------------ |
| `quarantine.count`       | Current evidence count         |
| `quarantine.bytes`       | Current memory usage           |
| `quarantine.get(signature)` | Retrieve evidence by signature |
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

Pull-based observability for threat statistics. Access via `createTracehound().watcher`.

```typescript
const th = createTracehound()
const snapshot = th.watcher.getSnapshot()
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

### Async Codec & S3 Cold Storage (v1.1.0+)

```typescript
import { createS3ColdStorage, encodeWithIntegrityAsync, decodeWithIntegrityAsync } from '@tracehound/core'

const coldStorage = createS3ColdStorage({ client, bucket, prefix })
const encoded = await encodeWithIntegrityAsync(data)
await coldStorage.write('ev-001', encoded)
```

---

## Adapters

Separate packages: `@tracehound/express`, `@tracehound/fastify`

### Express Example

```typescript
import { tracehound } from '@tracehound/express'
import { createTracehound, generateSecureId } from '@tracehound/core'

const th = createTracehound()

app.use(
  tracehound({
    agent: th.agent,
    extractScent: (req) => ({
      id: generateSecureId(),
      timestamp: Date.now(),
      source: req.ip || 'unknown',
      payload: { method: req.method, path: req.path },
      threat: myWafCheck(req),
    }),
  }),
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
