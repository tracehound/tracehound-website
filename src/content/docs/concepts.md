---
title: 'Concepts'
description: 'Core concepts and design principles'
category: 'guides'
order: 1
---

# Concepts

Understanding Tracehound's core concepts helps you use it effectively.

---

## Fail-Open Semantics

> **Tracehound never blocks legitimate traffic.**

### What This Means

If Tracehound crashes, encounters an error, or runs out of resources:

```typescript
// This NEVER throws
const result = agent.intercept(scent)

// Worst case: returns { status: 'clean' }
// Traffic passes through, logs are emitted
```

### Why This Matters

Security tools that fail-closed become denial-of-service vectors:

| Fail-Closed                         | Fail-Open (Tracehound)         |
| ----------------------------------- | ------------------------------ |
| Agent crash → 500 errors            | Agent crash → traffic passes   |
| Memory full → requests blocked      | Memory full → evidence evicted |
| License expired → features disabled | No license enforcement in core |

### Implementation

Tracehound uses a `FailSafe` wrapper around all operations:

```typescript
// Internal implementation
try {
  return quarantine.add(evidence)
} catch (error) {
  failSafe.record(error)
  return { status: 'clean' } // Fail-open
}
```

---

## Local State Semantics

> **Each Tracehound instance owns its own state.**

### What This Means

```
Instance A: IP "1.2.3.4" blocked
Instance B: IP "1.2.3.4" NOT blocked
```

There is:

- No global blocklist
- No cross-instance coordination
- No shared quarantine

### Why This Matters

Local state provides:

1. **Simplicity** — No distributed systems complexity
2. **Performance** — No network round-trips
3. **Reliability** — No Redis/network dependencies
4. **Isolation** — Instance failure doesn't cascade

### When You Need Multi-Instance

For cross-instance coordination, use [Horizon](/docs/packages/horizon):

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

---

## Audit Chain

> **Tamper-proof evidence integrity.**

### What It Is

AuditChain is a Merkle-chain structure where each evidence entry contains the hash of the previous entry:

```
Evidence 1: { data, hash: SHA256(data) }
Evidence 2: { data, hash: SHA256(data + prev_hash) }
Evidence 3: { data, hash: SHA256(data + prev_hash) }
```

### Why This Matters

If any entry is modified, the chain breaks:

```typescript
// Verification
const isValid = auditChain.verify()

// If someone tampered with evidence #2:
// - Evidence #3's hash won't match
// - verify() returns false
// - You know tampering occurred
```

### Forensic Value

In court or incident response:

- Chain intact → Evidence is trustworthy
- Chain broken → Tampering detected

---

## Evidence Lifecycle

> **Evidence flows from hot memory to cold storage.**

### The Flow

![Evidence Lifecycle](/diagrams/evidence-lifecycle.svg)

### Priority-Based Eviction

When quarantine is full, evidence is evicted by priority:

| Priority | Eviction Order | Example                |
| -------- | -------------- | ---------------------- |
| low      | First          | Rate-limited requests  |
| medium   | Second         | Suspicious activity    |
| high     | Third          | Confirmed attacks      |
| critical | Never          | Active breach evidence |

### Cold Storage

Before eviction, high-priority evidence can be exported:

```typescript
import { createColdStorageAdapter } from '@tracehound/cold-s3'

const coldStorage = createColdStorageAdapter({
  bucket: 'evidence-archive',
  region: 'us-east-1',
})

// Evidence flows to S3 before eviction
```

---

## Decision-Free Architecture

> **Tracehound does not make security decisions.**

### What This Means

Tracehound is a **buffer**, not a **detector**:

| Detection (External)     | Buffer (Tracehound)      |
| ------------------------ | ------------------------ |
| WAF, ML, rules           | Quarantine               |
| "Is this a threat?"      | "Store this threat"      |
| Heuristics               | Deterministic            |
| May have false positives | Records what you tell it |

### Why This Matters

Security decisions are policy. Tracehound is infrastructure.

Your WAF, ML model, or custom detector decides what's a threat. Tracehound:

- Isolates it
- Records it
- Preserves evidence

This separation means Tracehound works with any detection system.

---

## Next Steps

- [Advanced](/docs/advanced) — Multi-instance, cold storage, performance
- [API Reference](/docs/api) — Full API documentation
