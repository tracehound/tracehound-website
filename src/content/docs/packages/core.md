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
| `HoundPool`       | Process-based isolation (4 processes default, unlimited with Horizon) |
| `Scheduler`       | Jittered background task execution                               |
| `FailSafe`        | Panic handling and fail-open semantics                          |
| `EvidenceFactory` | Evidence creation and serialization                             |
| `SecurityState`   | Unified metrics and snapshot                                    |
| `NotificationEmitter` | Universal event subscription (threat.detected, etc.)       |

### Cold Storage (v1.1.0+)

| Component            | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `S3ColdStorage`      | S3-compatible adapter (AWS S3, R2, GCS, MinIO)      |
| `createS3ColdStorage`| Factory for S3-like cold storage                      |
| `AsyncGzipCodec`      | Non-blocking encode/decode for cold storage I/O      |

### Framework Adapters

Express and Fastify are **separate packages**:

- `@tracehound/express` — Express middleware
- `@tracehound/fastify` — Fastify plugin

---

## Express Adapter

```bash
npm install @tracehound/core @tracehound/express
```

```typescript
import express from 'express'
import { tracehound } from '@tracehound/express'
import { createTracehound, generateSecureId } from '@tracehound/core'

const th = createTracehound({
  quarantine: { maxCount: 5000, maxBytes: 50_000_000 },
  rateLimit: { windowMs: 60_000, maxRequests: 100 },
})

const app = express()

app.use(
  tracehound({
    agent: th.agent,
    extractScent: (req) => ({
      id: generateSecureId(),
      timestamp: Date.now(),
      source: req.ip || 'unknown',
      payload: { method: req.method, path: req.path },
      threat: isSuspicious(req) ? { category: 'suspicious', severity: 'medium' } : undefined,
    }),
  }),
)

app.listen(3000)
```

---

## Fastify Adapter

```bash
npm install @tracehound/core @tracehound/fastify
```

```typescript
import Fastify from 'fastify'
import { tracehoundPlugin } from '@tracehound/fastify'
import { createTracehound } from '@tracehound/core'

const th = createTracehound()
const fastify = Fastify()

fastify.register(tracehoundPlugin, {
  agent: th.agent,
  extractScent: (req) => ({
    id: generateSecureId(),
    timestamp: Date.now(),
    source: req.ip,
    payload: { method: req.method, path: req.url },
    threat: myDetector(req),
  }),
})

fastify.listen({ port: 3000 })
```

---

## CLI Tools

Install the CLI package:

```bash
npm install @tracehound/cli
# or
pnpm add @tracehound/cli
```

```bash
# System health and uptime
tracehound status

# Threat statistics by severity
tracehound stats

# Inspect quarantine contents
tracehound inspect
tracehound inspect --signature <sig> --limit 10

# Live TUI dashboard
tracehound watch
```

---

## Quick Start

### Recommended: createTracehound

```typescript
import { createTracehound, generateSecureId } from '@tracehound/core'

const th = createTracehound({
  quarantine: { maxCount: 10000, maxBytes: 100_000_000 },
  rateLimit: { windowMs: 60_000, maxRequests: 100 },
})

// Intercept
const result = th.agent.intercept({
  id: generateSecureId(),
  timestamp: Date.now(),
  source: req.ip,
  payload: { method: req.method, path: req.path },
  threat: detectThreat(req),
})

// Subscribe to events
th.notifications.on('threat.detected', (e) => console.log(e.payload.category))
```

---

## Configuration

### createTracehound Options

```typescript
const th = createTracehound({
  maxPayloadSize: 1_000_000,
  quarantine: { maxCount: 10000, maxBytes: 100_000_000 },
  rateLimit: { windowMs: 60_000, maxRequests: 100, blockDurationMs: 300_000 },
  watcher: { maxAlertsPerWindow: 10, alertWindowMs: 60_000 },
  houndPool: { poolSize: 4, timeout: 30_000 },
})
```

### S3 Cold Storage (v1.1.0+)

```typescript
import { createS3ColdStorage } from '@tracehound/core'

const coldStorage = createS3ColdStorage({
  client: myS3Client, // S3LikeClient interface
  bucket: 'tracehound-evidence',
  prefix: 'prod/evidence/',
})
```

---

## Events

```typescript
// Notification emitter (createTracehound().notifications)
th.notifications.on('threat.detected', (e) => {
  console.log('Threat:', e.payload.category)
})

th.notifications.on('evidence.quarantined', (e) => {
  console.log('Quarantined:', e.payload.handle.signature)
})

th.notifications.on('rate_limit.exceeded', (e) => {
  console.log('Rate limited:', e.payload.source)
})
```

---

## Scaling Up

Core has sensible defaults for most workloads:

| Limit               | Default | With Horizon   |
| ------------------- | ------- | -------------- |
| HoundPool processes | 4       | Unlimited      |
| Multi-instance      | ❌      | ✅ Redis/KeyDB |
| mTLS                | ❌      | ✅             |

For scale-out, add [Horizon](/docs/packages/horizon) ($9 perpetual).

---

## Kubernetes

v1.1.0+ includes a K8s Deployment Guide in the core repo with resource sizing, ConfigMaps, health probes, and Prometheus metrics.

---

## Related

- [Quickstart](/docs/quickstart) — Get running in 5 minutes
- [Configuration](/docs/configuration) — Full configuration reference
- [API Reference](/docs/api) — Detailed API documentation
