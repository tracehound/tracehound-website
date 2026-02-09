---
title: 'Introduction'
description: 'What is Tracehound and why it exists'
category: 'quickstart'
order: 1
---

# Introduction

## What is Tracehound?

Tracehound is a **deterministic security buffer** for Node.js applications.

When your WAF or detection system identifies a threat, Tracehound:

1. **Isolates** the threat in a quarantine buffer
2. **Records** tamper-proof forensic evidence
3. **Fails safely** without blocking legitimate traffic

Think of it as the black box recorder for your security infrastructure.

---

## Why Tracehound?

### The Problem

Modern security stacks have a gap. What happens between threat detection and incident response? Usually:

- Logs get lost or rotated
- Evidence is scattered across systems
- Replay attacks can't be proven
- Memory fills up with no eviction strategy

### The Solution

Tracehound fills this gap:

![Problem vs Solution](/diagrams/problem-solution.svg)

| Without Tracehound | With Tracehound     |
| ------------------ | ------------------- |
| Scattered logs     | Unified evidence    |
| Mutable records    | Tamper-proof chain  |
| Memory leaks       | Bounded buffers     |
| Silent failures    | Fail-open semantics |

---

## How It Works

![Tracehound Architecture](/diagrams/architecture.svg)

### Core Flow

1. **Intercept**: `agent.intercept(scent)` receives threat data
2. **Quarantine**: Threat is isolated with priority
3. **Chain**: Evidence is appended to tamper-proof audit chain
4. **Evict**: When full, low-priority evidence is evicted first
5. **Export**: Evidence can flow to S3/R2/GCS cold storage (v1.1.0+)

---

## Who Is It For?

### Security-Conscious Teams

If you need to prove what happened during an incident, Tracehound provides court-grade evidence.

### Compliance Requirements

GDPR, SOC2, PCI-DSS all require evidence retention. Tracehound's audit chain is designed for compliance.

### High-Traffic Services

Tracehound uses bounded memory with deterministic eviction. No memory leaks, no OOM crashes.

### Fintech & Healthcare

When a breach costs millions, forensic evidence is non-negotiable.

---

## Core Principles

### 1. Fail-Open

Tracehound **never blocks legitimate traffic**. If the agent crashes, traffic passes through.

### 2. Decision-Free

Tracehound **does not make security decisions**. Your WAF/detector decides what's a threat. Tracehound quarantines and records.

### 3. Deterministic

Same input → same output. No ML, no heuristics, no surprises.

### 4. Open Core

Core security features are **free and open source**. Commercial packages extend capability, not safety.

---

## Next Steps

<div class="grid grid-cols-2 gap-4 mt-6">

**[Quickstart →](/docs/quickstart)**
Get running in 5 minutes.

**[Core Package →](/docs/packages/core)**
Explore the main package.

</div>
