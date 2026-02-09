---
title: 'Quickstart'
description: 'Install and configure Tracehound in under 5 minutes.'
category: 'quickstart'
order: 2
---

# Quickstart

Get Tracehound running in your Node.js application in under 5 minutes.

## Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

---

## Installation

```bash
npm install @tracehound/core
```

---

## Quick Start

### Step 1: Create Tracehound

```typescript
import { createTracehound, generateSecureId } from '@tracehound/core'

const th = createTracehound({
  quarantine: { maxCount: 1000 },
})
```

That's it. You now have a working Tracehound instance.

### Step 2: Intercept Requests

```typescript
app.use((req, res, next) => {
  const scent = {
    id: generateSecureId(),
    timestamp: Date.now(),
    source: req.ip,
    payload: { method: req.method, path: req.path },
    threat: detectThreat(req), // Your WAF/detector logic
  }

  const result = th.agent.intercept(scent)

  if (result.status === 'quarantined') {
    return res.status(403).json({ error: 'Blocked' })
  }

  next()
})
```

### Step 3: Handle Results

| Status         | Meaning            | Action                            |
| -------------- | ------------------ | --------------------------------- |
| `clean`        | No threat detected | Proceed normally                  |
| `quarantined`  | Threat isolated    | Block request, evidence preserved |
| `rate_limited` | Too many requests  | Return 429 with `retryAfter`      |
| `ignored`      | Duplicate threat   | Already quarantined, block        |

---

## Framework Adapters

Use the Express or Fastify adapters (separate packages):

### Express

```bash
npm install @tracehound/core @tracehound/express
```

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

### Fastify

```bash
npm install @tracehound/core @tracehound/fastify
```

```typescript
import { tracehoundPlugin } from '@tracehound/fastify'
import { createTracehound, generateSecureId } from '@tracehound/core'

const th = createTracehound()

fastify.register(tracehoundPlugin, {
  agent: th.agent,
  extractScent: (req) => ({
    id: generateSecureId(),
    timestamp: Date.now(),
    source: req.ip || 'unknown',
    payload: { method: req.method, path: req.url },
    threat: myWafCheck(req),
  }),
})
```

---

## Common Patterns

### Pattern 1: WAF Integration

Connect your existing WAF (Cloudflare, AWS WAF) to Tracehound:

```typescript
const detectThreat = (req) => {
  // Check WAF headers set by your edge provider
  if (req.headers['cf-threat-score'] > 50) {
    return { category: 'suspicious', severity: 'medium' }
  }
  return undefined // Clean request
}
```

### Pattern 2: Custom Rate Limiting

Add rate limiting per source IP:

```typescript
const th = createTracehound({
  quarantine: { maxCount: 1000 },
  rateLimit: {
    windowMs: 60_000,
    maxRequests: 100,
    blockDurationMs: 300_000,
  },
})
```

### Pattern 3: Cold Storage Export (v1.1.0+)

Archive evidence to S3-compatible storage (AWS S3, Cloudflare R2, GCS, MinIO):

```typescript
import { createS3ColdStorage } from '@tracehound/core'

const coldStorage = createS3ColdStorage({
  client: myS3Client, // S3LikeClient interface
  bucket: 'my-evidence-bucket',
  prefix: 'prod/evidence/',
})

// Integrate with Quarantine evacuate for archival
```

---

## Troubleshooting

### "Quarantine is full" warnings

Your quarantine has reached `maxCount`. Options:

1. **Increase limit**: `createTracehound({ quarantine: { maxCount: 5000 } })`
2. **Enable cold storage**: Use `createS3ColdStorage` for archival
3. **Eviction**: Default `priority` policy keeps high-severity threats

### High memory usage

Tracehound uses bounded memory by design. If you're seeing high usage:

1. Reduce `maxBytes`: `createTracehound({ quarantine: { maxBytes: 50_000_000 } })` (50MB)
2. Use async codec for cold storage I/O
3. Check payload limits: `createTracehound({ maxPayloadSize: 100_000 })`

### Requests are slow

`agent.intercept()` is synchronous and should be <1ms. If slow:

1. Move heavy detection logic outside Tracehound
2. Use `@tracehound/express` adapter (optimized)
3. Check if you're doing async work inside the intercept call

---

## Next Steps

- [Configuration](/docs/configuration) — Tune quarantine, rate limiting, and fail-safe settings
- [API Reference](/docs/api) — Full API documentation
- [Core Package](/docs/packages/core) — Explore adapters and components
- [Concepts](/docs/concepts) — Understanding Tracehound internals
