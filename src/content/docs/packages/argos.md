---
title: 'Argos'
description: 'Runtime behavioral observation'
category: 'packages'
order: 3
---

# Argos

> 🟣 **Satellite Package** — $49/mo
> **Status:** In Development

Runtime behavioral observation for threat detection.

---

## What is Argos?

Argos observes your application's runtime behavior to detect anomalies that traditional rule-based systems miss:

- **Event loop starvation** — Detect CPU exhaustion attacks
- **Memory pattern analysis** — Identify memory-based exploits
- **Burst detection** — Catch sudden traffic spikes
- **Behavioral fingerprinting** — Profile normal vs. abnormal activity

---

## How It Works

Argos runs in a dedicated worker thread, observing the main thread without blocking:

![Argos Worker Architecture](/diagrams/argos-worker.svg)

---

## Installation

```bash
# Get access via private npm
npm login --registry=https://npm.tracehound.co

# Install
npm install @tracehound/argos
```

---

## Quick Start

```typescript
import { createAgent } from '@tracehound/core'
import { createArgos } from '@tracehound/argos'

const argos = createArgos({
  sampleRate: 100, // Sample every 100ms
  windowSize: 60_000, // 1 minute analysis window
})

const agent = createAgent({
  quarantine,
  observers: [argos],
})

// Argos now watches for behavioral anomalies
// and feeds signals to the agent
```

---

## Detection Capabilities

| Capability          | Description                              |
| ------------------- | ---------------------------------------- |
| Event Loop Lag      | Detects when event loop is blocked >50ms |
| Memory Pressure     | Identifies unusual heap growth patterns  |
| Request Burst       | Catches >10x normal request rate         |
| Resource Exhaustion | Monitors file handles, connections       |

---

## Configuration

```typescript
const argos = createArgos({
  sampleRate: 100, // Sampling interval (ms)
  windowSize: 60_000, // Analysis window (ms)
  thresholds: {
    eventLoopLag: 50, // ms
    memoryGrowth: 0.2, // 20% growth rate
    burstMultiplier: 10, // 10x normal rate
  },
  onAnomaly: (signal) => {
    // Custom handler
  },
})
```

---

## Signals

Argos emits signals that can trigger quarantine:

```typescript
agent.on('argos:signal', (signal) => {
  console.log({
    type: signal.type, // 'eventLoopLag' | 'memoryPressure' | 'burst'
    severity: signal.severity,
    timestamp: signal.timestamp,
    data: signal.data,
  })
})
```

---

## Related

- [Core](/docs/packages/core) — Main package
- [Concepts](/docs/concepts) — Understanding Tracehound
- [Examples](/docs/examples) — Integration examples
