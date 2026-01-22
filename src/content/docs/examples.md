---
title: 'Examples'
description: 'Real-world integration examples'
category: 'guides'
order: 3
---

# Examples

Real-world examples of Tracehound integration.

---

## Express.js + Cloudflare WAF

Integrate Tracehound with Express and Cloudflare's threat detection headers.

```typescript
import express from 'express'
import { createAgent, createQuarantine } from '@tracehound/core'

const app = express()

// Initialize Tracehound
const quarantine = createQuarantine({ maxCount: 5000 })
const agent = createAgent({ quarantine })

// Middleware to integrate with Cloudflare WAF
app.use((req, res, next) => {
  // Cloudflare sets these headers
  const threatScore = parseInt(req.headers['cf-threat-score'] || '0')
  const country = req.headers['cf-ipcountry']
  const ray = req.headers['cf-ray']

  // Only intercept if threat detected
  if (threatScore > 30) {
    const scent = {
      id: ray || crypto.randomUUID(),
      timestamp: Date.now(),
      source: req.ip,
      payload: {
        method: req.method,
        path: req.path,
        headers: req.headers,
        threatScore,
        country,
      },
      priority: threatScore > 70 ? 'high' : 'medium',
    }

    const result = agent.intercept(scent)

    if (result.status === 'quarantined') {
      return res.status(403).json({
        error: 'Request blocked',
        reference: result.evidenceId,
      })
    }
  }

  next()
})

app.listen(3000)
```

---

## Fastify + Custom Rate Limiting

Combine Tracehound's quarantine with custom rate limiting logic.

```typescript
import Fastify from 'fastify'
import { createAgent, createQuarantine, createRateLimiter } from '@tracehound/core'

const fastify = Fastify()

// Initialize with rate limiting
const rateLimiter = createRateLimiter({
  windowMs: 60_000, // 1 minute window
  maxRequests: 100, // 100 requests per minute
  blockDurationMs: 300_000, // 5 minute block
})

const quarantine = createQuarantine({ maxCount: 10000 })
const agent = createAgent({ quarantine, rateLimiter })

// Prehandler hook
fastify.addHook('preHandler', async (request, reply) => {
  const scent = {
    id: request.id,
    timestamp: Date.now(),
    source: request.ip,
    payload: {
      method: request.method,
      url: request.url,
    },
  }

  const result = agent.intercept(scent)

  switch (result.status) {
    case 'rate_limited':
      reply.code(429).header('Retry-After', result.retryAfter)
      return reply.send({ error: 'Too many requests' })

    case 'quarantined':
      reply.code(403)
      return reply.send({ error: 'Blocked', ref: result.evidenceId })
  }
})

fastify.listen({ port: 3000 })
```

---

## Multi-Instance with Redis

Scale Tracehound across multiple instances with shared state.

```typescript
import '@tracehound/horizon'
import { createAgent, createQuarantine } from '@tracehound/core'
import cluster from 'cluster'
import os from 'os'

if (cluster.isPrimary) {
  // Fork workers
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork()
  }
} else {
  // Worker process
  const agent = createAgent({
    quarantine: createQuarantine({ maxCount: 5000 }),
    horizon: {
      coordination: {
        driver: 'redis',
        url: process.env.REDIS_URL,
        sync: ['blocklist', 'rateLimit'],
      },
    },
  })

  // Now all workers share:
  // - Blocklist (IP blocked on worker 1 → blocked on all workers)
  // - Rate limits (global count across cluster)
}
```

---

## Cold Storage to S3

Archive forensic evidence to S3 for long-term retention.

```typescript
import { createAgent, createQuarantine } from '@tracehound/core'
import { createColdStorageAdapter } from '@tracehound/cold-s3'

// Configure S3 adapter
const coldStorage = createColdStorageAdapter({
  bucket: 'company-security-evidence',
  region: 'us-east-1',
  prefix: `tracehound/${process.env.NODE_ENV}/`,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// Quarantine with cold storage
const quarantine = createQuarantine({
  maxCount: 10000,
  maxBytes: 100_000_000, // 100MB
  coldStorage,
  coldStorageThreshold: 0.8, // Export when 80% full
})

const agent = createAgent({ quarantine })

// Evidence lifecycle:
// 1. Threat detected → Quarantine (hot)
// 2. Quarantine 80% full → Export to S3
// 3. Quarantine 100% full → Evict low-priority, keep high in memory
```

---

## Webhook Notifications

Send alerts when critical threats are detected.

```typescript
import { createAgent, createQuarantine } from '@tracehound/core'

const agent = createAgent({
  quarantine: createQuarantine({ maxCount: 5000 }),
})

// Listen for quarantine events
agent.on('quarantine', async (event) => {
  if (event.priority === 'critical') {
    // Send to Slack
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Critical threat detected`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Source:* ${event.source}\n*Evidence ID:* ${event.evidenceId}`,
            },
          },
        ],
      }),
    })
  }
})
```

---

## Next Steps

- [API Reference](/docs/api) — Full API documentation
- [Concepts](/docs/concepts) — Understanding Tracehound internals
