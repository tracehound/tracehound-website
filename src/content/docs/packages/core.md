---
title: 'Core'
description: 'The main Tracehound package with adapters'
category: 'packages'
order: 1
---

# Core

> 🟢 **Substrate Package** — Free & Open Source

The main Tracehound package. Includes everything you need to quarantine threats and preserve evidence.

---

## Installation

```bash
npm install @tracehound/core
```

---

## What's Included

### Core Components

| Component         | Purpose                                                         |
| ----------------- | --------------------------------------------------------------- |
| `Agent`           | Main entry point, coordinates all operations                    |
| `Quarantine`      | Evidence buffer with priority-based eviction                    |
| `AuditChain`      | Tamper-proof Merkle chain for integrity                         |
| `RateLimiter`     | Token bucket rate limiting                                      |
| `HoundPool`       | Process-based isolation (8 workers max, unlimited with Horizon) |
| `FailSafe`        | Panic handling and fail-open semantics                          |
| `EvidenceFactory` | Evidence creation and serialization                             |

### Framework Adapters

Core includes adapters for popular frameworks. These are **not separate packages** — they come bundled with `@tracehound/core`.

---

## Express Adapter

```typescript
import express from 'express'
import { createTracehoundMiddleware } from '@tracehound/core/express'

const app = express()

app.use(
  createTracehoundMiddleware({
    detector: (req) => {
      // Your threat detection logic
      if (isSuspicious(req)) {
        return { category: 'suspicious', severity: 'medium' }
      }
      return undefined // Clean request
    },

    // Optional configuration
    quarantine: {
      maxCount: 5000,
      maxBytes: 50_000_000,
    },

    rateLimiter: {
      windowMs: 60_000,
      maxRequests: 100,
    },
  }),
)

app.listen(3000)
```

---

## Fastify Adapter

```typescript
import Fastify from 'fastify'
import { tracehoundPlugin } from '@tracehound/core/fastify'

const fastify = Fastify()

fastify.register(tracehoundPlugin, {
  detector: (req) => {
    if (isSuspicious(req)) {
      return { category: 'suspicious', severity: 'medium' }
    }
  },
})

fastify.listen({ port: 3000 })
```

---

## CLI Tools

The `@tracehound/cli` commands are included:

```bash
# Check Tracehound status
npx tracehound status

# Inspect quarantine
npx tracehound quarantine list
npx tracehound quarantine get <evidenceId>

# Verify audit chain
npx tracehound chain verify

# Export evidence
npx tracehound export --format json --output evidence.json
```

Install globally for convenience:

```bash
npm install -g @tracehound/core
tracehound --help
```

---

## Quick Start

### Manual Integration

```typescript
import { createAgent, createQuarantine } from '@tracehound/core'

// 1. Create quarantine
const quarantine = createQuarantine({
  maxCount: 10000,
  maxBytes: 100_000_000,
})

// 2. Create agent
const agent = createAgent({ quarantine })

// 3. Intercept threats
app.use((req, res, next) => {
  const threat = detectThreat(req)

  if (threat) {
    const result = agent.intercept({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      source: req.ip,
      payload: { method: req.method, path: req.path },
      threat,
    })

    if (result.status === 'quarantined') {
      return res.status(403).json({ blocked: true })
    }
  }

  next()
})
```

---

## Configuration

### Agent Options

```typescript
const agent = createAgent({
  quarantine, // Required
  rateLimiter, // Optional
  houndPool, // Optional: process isolation
  maxPayloadSize: 100000, // Optional: 100KB limit
  failSafe: {
    enabled: true,
    logErrors: true,
  },
})
```

### Quarantine Options

```typescript
const quarantine = createQuarantine({
  maxCount: 10000, // Max evidence count
  maxBytes: 100_000_000, // 100MB memory limit
  evictionPolicy: 'priority', // 'priority' | 'fifo' | 'lru'
  coldStorage: adapter, // Optional: S3/R2/GCS adapter
  onEviction: (evidence) => {}, // Optional: eviction callback
})
```

### Rate Limiter Options

```typescript
const rateLimiter = createRateLimiter({
  windowMs: 60_000, // 1 minute window
  maxRequests: 100, // 100 requests per window
  blockDurationMs: 300_000, // 5 minute block
  keyGenerator: (scent) => scent.source, // Default: source IP
})
```

---

## Events

```typescript
// Quarantine event
agent.on('quarantine', (event) => {
  console.log('Threat quarantined:', event.evidenceId)
})

// Rate limit event
agent.on('rateLimit', (event) => {
  console.log('Source rate limited:', event.source)
})

// Eviction event
agent.on('eviction', (event) => {
  console.log('Evidence evicted:', event.evidenceId)
})

// Error event (fail-safe triggered)
agent.on('error', (error) => {
  console.error('Tracehound error:', error)
})
```

---

## Scaling Up

Core has sensible defaults for most workloads:

| Limit             | Default | With Horizon   |
| ----------------- | ------- | -------------- |
| HoundPool workers | 8       | Unlimited      |
| Multi-instance    | ❌      | ✅ Redis/KeyDB |
| mTLS              | ❌      | ✅             |

For scale-out, add [Horizon](/docs/packages/horizon) ($9 perpetual).

---

## Related

- [Quickstart](/docs/quickstart) — Get running in 5 minutes
- [Configuration](/docs/configuration) — Full configuration reference
- [API Reference](/docs/api) — Detailed API documentation
