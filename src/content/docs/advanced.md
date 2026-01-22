---
title: 'Advanced'
description: 'Multi-instance deployment, cold storage, and performance tuning'
category: 'guides'
order: 2
---

# Advanced

Advanced configuration for production deployments.

---

## Multi-Instance Deployment

By default, each Tracehound instance is independent. For cross-instance coordination, use [Horizon](/docs/packages/horizon).

### Architecture

![Multi-Instance Architecture](/diagrams/multi-instance.svg)

### Configuration

```typescript
import '@tracehound/horizon'
import { Agent } from '@tracehound/core'

const agent = new Agent({
  horizon: {
    coordination: {
      driver: 'redis', // or 'keydb'
      url: process.env.REDIS_URL,
      sync: ['blocklist', 'rateLimit'],
    },
  },
})
```

### Coordinated Features

| Feature      | Description                         |
| ------------ | ----------------------------------- |
| `blocklist`  | Block a source across all instances |
| `rateLimit`  | Unified token bucket across cluster |
| `quarantine` | Shared quarantine visibility        |

---

## Cold Storage

Archive evidence to external storage before eviction.

### Supported Adapters

| Adapter              | Package                | Status    |
| -------------------- | ---------------------- | --------- |
| Amazon S3            | `@tracehound/cold-s3`  | Available |
| Cloudflare R2        | `@tracehound/cold-r2`  | Q2 2026   |
| Google Cloud Storage | `@tracehound/cold-gcs` | Q2 2026   |

### S3 Configuration

```typescript
import { createColdStorageAdapter } from '@tracehound/cold-s3'

const coldStorage = createColdStorageAdapter({
  bucket: 'my-evidence-bucket',
  region: 'us-east-1',
  prefix: 'tracehound/', // optional
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const agent = new Agent({
  quarantine: createQuarantine({
    maxCount: 10000,
    coldStorage, // Evidence flows to S3 before eviction
  }),
})
```

### Eviction Flow

![Eviction Flow](/diagrams/eviction-flow.svg)

---

## Performance Tuning

### Memory Limits

```typescript
const quarantine = createQuarantine({
  maxCount: 10000, // Max evidence count
  maxBytes: 100000000, // 100MB max memory
})
```

### Eviction Policies

```typescript
const quarantine = createQuarantine({
  evictionPolicy: 'priority', // or 'fifo', 'lru'
})
```

| Policy     | Behavior                           |
| ---------- | ---------------------------------- |
| `priority` | Evict low-priority first (default) |
| `fifo`     | Evict oldest first                 |
| `lru`      | Evict least-recently-accessed      |

### HoundPool Sizing

HoundPool provides process-based isolation for heavy analysis:

```typescript
const pool = createHoundPool({
  maxWorkers: 8, // Core default (unlimited with Horizon)
  memoryLimit: '512MB', // Per-worker limit
  timeout: 30000, // 30s timeout
})
```

---

## Security Hardening

### mTLS (Requires Horizon)

Enable mutual TLS for IPC:

```typescript
import '@tracehound/horizon'

const agent = new Agent({
  horizon: {
    mtls: {
      enabled: true,
      cert: '/path/to/client.crt',
      key: '/path/to/client.key',
      ca: '/path/to/ca.crt',
    },
  },
})
```

### Payload Size Limits

Prevent memory exhaustion from large payloads:

```typescript
const agent = new Agent({
  maxPayloadSize: 100000, // 100KB max
  onPayloadTooLarge: (scent) => {
    // Log and reject
  },
})
```

### Evidence Encryption

Encrypt evidence at rest:

```typescript
const quarantine = createQuarantine({
  encryption: {
    algorithm: 'aes-256-gcm',
    key: process.env.EVIDENCE_KEY,
  },
})
```

---

## Monitoring

### Metrics

Tracehound emits metrics via the notification API:

```typescript
agent.on('metrics', (m) => {
  console.log({
    quarantineSize: m.quarantine.count,
    evictionRate: m.evictions.perSecond,
    chainLength: m.auditChain.length,
  })
})
```

### Health Checks

```typescript
app.get('/health/tracehound', (req, res) => {
  const health = agent.healthCheck()
  res.status(health.ok ? 200 : 503).json(health)
})
```

---

## Next Steps

- [Examples](/docs/examples) — Real-world integration examples
- [API Reference](/docs/api) — Full API documentation
