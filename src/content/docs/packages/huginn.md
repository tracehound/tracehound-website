---
title: 'Huginn'
description: 'Threat intelligence ingestion'
category: 'packages'
order: 5
---

# Huginn

> 🟣 **Satellite Package** — $49/mo
> **Status:** Q2 2026

Threat intelligence ingestion and correlation.

---

## What is Huginn?

Huginn consumes external threat feeds and correlates them with your local evidence:

- **IP Reputation** — Known malicious IPs, Tor exit nodes, proxies
- **IOC Correlation** — Match indicators of compromise
- **MITRE ATT&CK Mapping** — Classify threats by technique
- **Feed Synchronization** — Auto-update from threat intel sources

---

## How It Works

![Huginn Architecture](/diagrams/huginn-architecture.svg)

---

## Installation

```bash
npm login --registry=https://npm.tracehound.co
npm install @tracehound/huginn
```

---

## Quick Start

```typescript
import { createAgent } from '@tracehound/core'
import { createHuginn } from '@tracehound/huginn'

const huginn = createHuginn({
  feeds: [
    { type: 'abuseipdb', apiKey: process.env.ABUSEIPDB_KEY },
    { type: 'emergingthreats', url: 'https://...' },
  ],
  syncInterval: 3600_000, // Sync every hour
})

const agent = createAgent({
  quarantine,
  threatIntel: huginn,
})
```

---

## Supported Feeds

| Feed              | Status  |
| ----------------- | ------- |
| AbuseIPDB         | Q2 2026 |
| Emerging Threats  | Q2 2026 |
| Custom STIX/TAXII | Planned |

---

## Coming Soon

Huginn is currently in development. [Contact us](/contact) for early access.

---

## Related

- [Muninn](/docs/packages/muninn) — Historical analysis (works with Huginn)
- [Core](/docs/packages/core) — Main package
