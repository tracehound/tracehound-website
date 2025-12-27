---
title: Configuration
description: Complete configuration options for Tracehound components.
---

# Configuration

All configuration options for Tracehound components with recommended defaults.

---

## Recommended Defaults

Copy-paste ready configuration for common use cases:

### Development / Testing

```typescript
const quarantine = createQuarantine({ maxCount: 100 })
const agent = createAgent({ quarantine })
```

### Production (Single Instance)

```typescript
const quarantine = createQuarantine({
  maxCount: 5000,
  maxBytes: 200_000_000, // 200MB
  evictionPolicy: 'priority',
})

const rateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 100,
  blockDurationMs: 300_000,
})

const agent = createAgent({
  quarantine,
  rateLimiter,
  maxPayloadSize: 1_000_000,
})
```

### High-Traffic / Enterprise

```typescript
const quarantine = createQuarantine({
  maxCount: 10000,
  maxBytes: 500_000_000, // 500MB
  evictionPolicy: 'priority',
})

const rateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 500,
  blockDurationMs: 600_000,
})

const failSafe = createFailSafe({
  memory: { warning: 0.7, critical: 0.85, emergency: 0.95 },
})

failSafe.on('emergency', () => quarantine.flush())
```

---

## Agent

```typescript
interface AgentConfig {
  quarantine: Quarantine // Required
  rateLimiter?: RateLimiter // Optional
  maxPayloadSize?: number // Default: 1_000_000 (1MB)
}
```

| Option           | Type          | Default     | Description                 |
| ---------------- | ------------- | ----------- | --------------------------- |
| `quarantine`     | `Quarantine`  | —           | Evidence storage (required) |
| `rateLimiter`    | `RateLimiter` | `undefined` | Per-source rate limiting    |
| `maxPayloadSize` | `number`      | `1_000_000` | Max payload size in bytes   |

---

## Quarantine

```typescript
interface QuarantineConfig {
  maxCount: number // Max evidence entries
  maxBytes?: number // Max total bytes
  evictionPolicy?: EvictionPolicy
}

type EvictionPolicy = 'priority' | 'lru' | 'fifo'
```

| Option           | Type     | Default       | Description                       |
| ---------------- | -------- | ------------- | --------------------------------- |
| `maxCount`       | `number` | —             | Maximum evidence count (required) |
| `maxBytes`       | `number` | `100_000_000` | Maximum memory usage (100MB)      |
| `evictionPolicy` | `string` | `'priority'`  | How to evict when full            |

### Eviction Policies

| Policy     | Behavior                      | When to Use                  |
| ---------- | ----------------------------- | ---------------------------- |
| `priority` | Evict lowest severity first   | **Recommended** for security |
| `lru`      | Evict least recently accessed | When recency matters         |
| `fifo`     | Evict oldest first            | Simple, predictable          |

---

## Rate Limiter

```typescript
interface RateLimiterConfig {
  windowMs: number // Time window
  maxRequests: number // Requests per window
  blockDurationMs?: number // Block duration when exceeded
}
```

| Option            | Type     | Default   | Description                        |
| ----------------- | -------- | --------- | ---------------------------------- |
| `windowMs`        | `number` | —         | Time window in ms (required)       |
| `maxRequests`     | `number` | —         | Max requests per window (required) |
| `blockDurationMs` | `number` | `300_000` | Block duration (5 min)             |

### Common Configurations

```typescript
// Strict: 60 req/min, 10 min block
{ windowMs: 60_000, maxRequests: 60, blockDurationMs: 600_000 }

// Lenient: 200 req/min, 1 min block
{ windowMs: 60_000, maxRequests: 200, blockDurationMs: 60_000 }

// API Gateway: 1000 req/min, 5 min block
{ windowMs: 60_000, maxRequests: 1000, blockDurationMs: 300_000 }
```

---

## Fail-Safe

Automatic protection against resource exhaustion.

```typescript
interface FailSafeConfig {
  memory?: ThresholdConfig
  quarantine?: ThresholdConfig
  errorRate?: ThresholdConfig
}

interface ThresholdConfig {
  warning: number // Trigger warning event
  critical: number // Trigger critical event
  emergency: number // Trigger emergency event
}
```

### Defaults

```typescript
{
  memory: { warning: 0.7, critical: 0.85, emergency: 0.95 },
  quarantine: { warning: 0.7, critical: 0.85, emergency: 0.95 },
  errorRate: { warning: 10, critical: 50, emergency: 100 }, // per minute
}
```

### Usage

```typescript
import { createFailSafe } from '@tracehound/core'

const failSafe = createFailSafe()

failSafe.on('warning', (event) => {
  console.warn('Capacity warning:', event.type, event.value)
})

failSafe.on('critical', (event) => {
  // Alert your monitoring system
  alerting.send('Tracehound critical threshold', event)
})

failSafe.on('emergency', (event) => {
  // Take drastic action
  quarantine.flush()
})
```

---

## Hound Pool

Isolated process pool for heavy analysis tasks.

```typescript
interface HoundPoolConfig {
  poolSize?: number // Pre-spawned processes
  timeoutMs?: number // Operation timeout
  exhaustedAction?: ExhaustedAction
  constraints?: ProcessConstraints
}

type ExhaustedAction = 'drop' | 'escalate' | 'defer'

interface ProcessConstraints {
  maxMemory?: number // Per-process memory limit
  maxCpuTime?: number // Per-process CPU time limit
}
```

| Option            | Default  | Description                  |
| ----------------- | -------- | ---------------------------- |
| `poolSize`        | `4`      | Number of worker processes   |
| `timeoutMs`       | `5000`   | Operation timeout (5s)       |
| `exhaustedAction` | `'drop'` | What to do when pool is full |

---

## Environment Variables

Override configuration via environment:

| Variable                 | Description              | Default   |
| ------------------------ | ------------------------ | --------- |
| `TRACEHOUND_MAX_PAYLOAD` | Max payload size (bytes) | `1000000` |
| `TRACEHOUND_LOG_LEVEL`   | Log level                | `info`    |
| `TRACEHOUND_POOL_SIZE`   | Hound pool size          | `4`       |

```bash
TRACEHOUND_MAX_PAYLOAD=5000000 node app.js
```

---

## Complete Production Example

```typescript
import {
  createAgent,
  createQuarantine,
  createRateLimiter,
  createFailSafe,
  AuditChain,
} from '@tracehound/core'

// Audit chain for Merkle-linked evidence
const auditChain = new AuditChain()

// Quarantine with priority eviction
const quarantine = createQuarantine(
  {
    maxCount: 5000,
    maxBytes: 200_000_000,
    evictionPolicy: 'priority',
  },
  auditChain
)

// Rate limiting per source
const rateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 100,
  blockDurationMs: 300_000,
})

// Fail-safe monitoring
const failSafe = createFailSafe()
failSafe.on('emergency', () => {
  console.error('[TRACEHOUND] Emergency flush triggered')
  quarantine.flush()
})

// Create agent
const agent = createAgent({
  quarantine,
  rateLimiter,
  maxPayloadSize: 1_000_000,
})

export { agent, quarantine, watcher }
```

---

## See Also

- [Getting Started](/docs/getting-started)
- [API Reference](/docs/api)
- [Roadmap](/docs/roadmap)
