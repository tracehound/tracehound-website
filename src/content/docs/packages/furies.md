---
title: 'Furies'
description: 'Adversarial validation and stress testing'
category: 'packages'
order: 8
---

# Furies

> 🟠 **Advanced Package** — $99/mo
> **Status:** Coming Soon

Chaos engineering for security infrastructure.

---

## What is Furies?

Furies stress-tests your Tracehound deployment to validate resilience:

- **Controlled Chaos** — Inject failures in safe, controlled ways
- **Security Stress** — Simulate attack patterns at scale
- **Failure Mode Testing** — Verify fail-open behavior works
- **Capacity Planning** — Find your limits before attackers do

---

## Use Cases

### Load Testing

```typescript
import { createFuries } from '@tracehound/furies'

const furies = createFuries()

// Simulate 10,000 requests/second
const result = await furies.stress({
  target: 'http://localhost:3000',
  rps: 10000,
  duration: '5m',
  pattern: 'burst',
})

console.log(result.metrics)
// { p50: 2ms, p99: 15ms, errors: 0 }
```

### Chaos Injection

```typescript
// Inject failures to test resilience
await furies.inject({
  type: 'quarantine-full',
  duration: '1m',
})

// Verify fail-open behavior
const health = await fetch('/health')
// Should return 200, not 500
```

---

## Coming Soon

Furies is currently in development. [Contact us](/contact) for early access.

---

## Related

- [Norns](/docs/packages/norns) — Readiness validation
- [Core](/docs/packages/core) — Main package
