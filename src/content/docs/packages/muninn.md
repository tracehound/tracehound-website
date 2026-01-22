---
title: 'Muninn'
description: 'Historical ledger and aggregation'
category: 'packages'
order: 6
---

# Muninn

> 🟣 **Satellite Package** — $49/mo
> **Status:** Q2 2026

Historical ledger and time-series aggregation.

---

## What is Muninn?

Muninn provides long-term storage and analysis of security evidence:

- **Time-Series Storage** — Efficient storage for historical data
- **Pattern Analysis** — Detect trends and recurring threats
- **Forensic Queries** — Search across historical evidence
- **Aggregation** — Roll up data for dashboards and reports

---

## How It Works

![Muninn Flow](/diagrams/muninn-flow.svg)

---

## Installation

```bash
npm login --registry=https://npm.tracehound.co
npm install @tracehound/muninn
```

---

## Quick Start

```typescript
import { createAgent } from '@tracehound/core'
import { createMuninn } from '@tracehound/muninn'

const muninn = createMuninn({
  storage: {
    type: 'postgresql', // or 'timescaledb', 'clickhouse'
    connectionString: process.env.DATABASE_URL,
  },
  retention: {
    hot: '7d', // 7 days in fast storage
    warm: '30d', // 30 days in standard storage
    cold: '1y', // 1 year in archive
  },
})

const agent = createAgent({
  quarantine,
  ledger: muninn,
})
```

---

## Query API

```typescript
// Search historical evidence
const results = await muninn.query({
  source: '1.2.3.4',
  timeRange: { from: '2026-01-01', to: '2026-01-31' },
  category: 'injection',
})

// Aggregate by day
const stats = await muninn.aggregate({
  groupBy: 'day',
  metrics: ['count', 'uniqueSources'],
})
```

---

## Supported Backends

| Backend     | Status  |
| ----------- | ------- |
| PostgreSQL  | Q2 2026 |
| TimescaleDB | Q2 2026 |
| ClickHouse  | Planned |

---

## Coming Soon

Muninn is currently in development. [Contact us](/contact) for early access.

---

## Related

- [Huginn](/docs/packages/huginn) — Threat intel (pairs with Muninn)
- [Core](/docs/packages/core) — Main package
