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

### Step 1: Create the Agent

```typescript
import { createAgent, createQuarantine } from '@tracehound/core'

const quarantine = createQuarantine({ maxCount: 1000 })
const agent = createAgent({ quarantine })
```

That's it. You now have a working Tracehound instance.

### Step 2: Intercept Requests

```typescript
app.use((req, res, next) => {
  // Create a "scent" from the incoming request
  const scent = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    source: req.ip,
    payload: { method: req.method, path: req.path },
    threat: detectThreat(req), // Your WAF/detector logic
  }

  const result = agent.intercept(scent)

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

## Framework Shortcuts

Don't want to write middleware yourself? Use our adapters:

### Express

```typescript
import { createTracehoundMiddleware } from '@tracehound/express'

app.use(
  createTracehoundMiddleware({
    detector: (req) => myWafCheck(req),
  }),
)
```

### Fastify

```typescript
import { tracehoundPlugin } from '@tracehound/fastify'

fastify.register(tracehoundPlugin, {
  detector: (req) => myWafCheck(req),
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
import { createRateLimiter } from '@tracehound/core'

const rateLimiter = createRateLimiter({
  windowMs: 60_000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  blockDurationMs: 300_000, // 5 minute block
})

const agent = createAgent({ quarantine, rateLimiter })
```

### Pattern 3: Cold Storage Export

Automatically archive evidence to S3:

```typescript
import { createColdStorageAdapter } from '@tracehound/cold-s3'

const coldStorage = createColdStorageAdapter({
  bucket: 'my-evidence-bucket',
  region: 'us-east-1',
})

// Evidence flows to S3 automatically when quarantine fills up
```

---

## Troubleshooting

### "Quarantine is full" warnings

Your quarantine has reached `maxCount`. Options:

1. **Increase limit**: `createQuarantine({ maxCount: 5000 })`
2. **Enable cold storage**: Evidence exports automatically
3. **Change eviction policy**: `evictionPolicy: 'priority'` keeps high-severity threats

### High memory usage

Tracehound uses bounded memory by design. If you're seeing high usage:

1. Reduce `maxBytes`: `createQuarantine({ maxBytes: 50_000_000 })` (50MB)
2. Enable streaming codec for large payloads
3. Check for payload size limits: `createAgent({ maxPayloadSize: 100_000 })`

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
