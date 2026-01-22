---
title: 'Horizon'
description: 'Config extender for scale-out scenarios'
category: 'packages'
order: 2
---

# Horizon

> 🟢 **Substrate Extension** — $9 Perpetual
> **Status:** In Development

---

## What is Horizon?

Horizon is a **config extender** for the Tracehound substrate. It unlocks scale-out capabilities for teams that need to go beyond core defaults.

**Core substrate is free and fully featured.** Horizon simply extends the configuration limits for high-scale deployments.

---

## What Horizon Unlocks

| Capability                | Core Default | + Horizon |
| ------------------------- | ------------ | --------- |
| HoundPool processes       | 8 max        | Unlimited |
| Multi-instance (Redis)    | ❌           | ✅        |
| mTLS enforcement          | ❌           | ✅        |
| Policy broker integration | ❌           | ✅        |

---

## Why $9 Perpetual?

- **One-time purchase** — No monthly fees
- **Use forever** — Perpetual license, no expiration
- **Low barrier** — Scale when you need it
- **No runtime enforcement** — Config injection, not license check

---

## Installation

```bash
# First, get access via private npm
npm login --registry=https://npm.tracehound.co

# Then install
npm install @tracehound/horizon
```

---

## Usage

Horizon uses a **magic import pattern**. Import it before `@tracehound/core` to inject extended configuration:

```typescript
// Horizon MUST be imported first
import '@tracehound/horizon'
import { Agent } from '@tracehound/core'

// Core now operates with extended limits
const agent = new Agent({
  // HoundPool now supports unlimited processes
  pool: {
    maxWorkers: 64, // Was capped at 8 without Horizon
    memoryLimit: '4GB',
  },
})
```

---

## Multi-Instance Coordination

With Horizon, you can coordinate state across multiple Tracehound instances using Redis or KeyDB:

```typescript
import '@tracehound/horizon'
import { Agent } from '@tracehound/core'

const agent = new Agent({
  horizon: {
    coordination: {
      driver: 'redis',
      url: 'redis://cluster:6379',
      sync: ['blocklist', 'rateLimit'],
    },
  },
})
```

### Coordinated Features

- **Shared blocklist** — Block a source across all instances
- **Global rate limiting** — Unified token buckets
- **Real-time sync** — Sub-millisecond propagation

---

## mTLS Enforcement

Enable zero-trust networking for IPC communication:

```typescript
import '@tracehound/horizon'
import { Agent } from '@tracehound/core'

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

---

## Policy Broker Integration

Connect to external policy engines:

```typescript
import '@tracehound/horizon'
import { Agent } from '@tracehound/core'

const agent = new Agent({
  horizon: {
    policyBroker: {
      endpoint: 'http://opa:8181/v1/data/tracehound/allow',
      timeout: 100,
      fallback: 'allow', // Fail-open semantics preserved
    },
  },
})
```

---

## FAQ

### Does core stop working without Horizon?

**No.** Core substrate is fully functional with sensible defaults. Horizon only extends limits.

### Is there runtime license enforcement?

**No.** Horizon is config injection, not DRM. Once installed, it works forever.

### What happens if I exceed core limits without Horizon?

Core will operate at its defaults (8 HoundPool processes, local state only). No errors, no degradation.

### Can I try Horizon before buying?

Development previews are available. Contact us for access.

---

## Related

- [Getting Started](/docs/getting-started) — Core setup guide
- [Configuration](/docs/configuration) — Full configuration reference
- [Packages](/docs/packages) — All Tracehound packages
