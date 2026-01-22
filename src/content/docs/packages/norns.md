---
title: 'Norns'
description: 'Deterministic readiness synthesis'
category: 'packages'
order: 7
---

# Norns

> 🟠 **Advanced Package** — $99/mo
> **Status:** Coming Soon

Pre-deployment security posture validation.

---

## What is Norns?

Norns validates your security configuration before deployment:

- **Posture Snapshots** — Capture security state at a point in time
- **Compliance Checks** — Verify against security standards
- **Readiness Gates** — Block deployment if security is insufficient
- **Diff Reports** — Compare security posture across versions

---

## Use Cases

### CI/CD Integration

```yaml
# GitHub Actions
- name: Security Readiness Check
  run: npx @tracehound/norns validate
  env:
    NORNS_TOKEN: ${{ secrets.NORNS_TOKEN }}
```

### Pre-Production Gate

```typescript
import { createNorns } from '@tracehound/norns'

const norns = createNorns()
const result = await norns.validate({
  config: './tracehound.config.js',
  baseline: 'production',
})

if (!result.ready) {
  console.error('Security posture degraded:', result.issues)
  process.exit(1)
}
```

---

## Coming Soon

Norns is currently in development. [Contact us](/contact) for early access.

---

## Related

- [Furies](/docs/packages/furies) — Adversarial testing
- [Core](/docs/packages/core) — Main package
