---
title: 'Talos'
description: 'External policy execution'
category: 'packages'
order: 4
---

# Talos

> 🟣 **Satellite Package** — $49/mo
> **Status:** Q2 2026

External policy execution and decision routing.

---

## What is Talos?

Talos connects Tracehound to external policy engines, enabling centralized security decision-making:

- **OPA Integration** — Connect to Open Policy Agent
- **Custom Engines** — Support for any HTTP-based policy service
- **Decision Caching** — Reduce latency with smart caching
- **Fallback Policies** — Fail-open when policy engine is unavailable

---

## How It Works

![Talos Flow](/diagrams/talos-flow.svg)

---

## Installation

```bash
npm login --registry=https://npm.tracehound.co
npm install @tracehound/talos
```

---

## Quick Start

```typescript
import { createAgent } from '@tracehound/core'
import { createTalos } from '@tracehound/talos'

const talos = createTalos({
  engine: 'opa',
  endpoint: 'http://opa:8181/v1/data/tracehound/allow',
  timeout: 100,
  cache: {
    ttl: 60_000, // Cache decisions for 1 minute
  },
})

const agent = createAgent({
  quarantine,
  policyEngine: talos,
})
```

---

## Supported Engines

| Engine                  | Status  |
| ----------------------- | ------- |
| Open Policy Agent (OPA) | Q2 2026 |
| Custom HTTP             | Q2 2026 |
| AWS IAM                 | Planned |

---

## Coming Soon

Talos is currently in development. [Contact us](/contact) for early access.

---

## Related

- [Horizon](/docs/packages/horizon) — For policy broker integration
- [Core](/docs/packages/core) — Main package
