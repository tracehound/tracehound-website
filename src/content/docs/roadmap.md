---
title: Roadmap
description: What's coming next for Tracehound.
---

# Roadmap

See what we're building and when to expect it.

---

## Current Release

### v1.0.0 — Stable Release ✅

The production-ready foundation.

- Core Agent, Quarantine, and Rate Limiter
- Express and Fastify adapters
- CLI with TUI dashboard
- Priority-based eviction
- Merkle-chained audit trail

---

## Coming Soon

### v1.1.0 — Production Hardening

_Expected: Q1 2026_

Bullet-proof your production deployment.

- **Notification API** — Push events to your SIEM, SOC, or webhooks
- **Cold Storage Adapters** — S3, R2, GCS out of the box
- **Async Codec** — Streaming compression for large evidence
- **License Validation** — Runtime license checks for commercial tiers

---

### v1.2.0 — Forensics & Compliance

_Expected: Q2 2026_

Enterprise compliance features.

- **Snapshot Export** — Deterministic exports for offline analysis
- **GDPR Erasure API** — Evidence deletion capability
- **Compliance Reports** — SOC2, HIPAA, ISO evidence mapping

---

### v2.0.0 — Enterprise Scale

_Expected: H2 2026_

Multi-instance and enterprise integrations.

- **Redis Coordination** — Distributed state across instances
- **SIEM Exporters** — Splunk, Elastic, Datadog native
- **Helm Chart** — Official Kubernetes deployment

---

## Ecosystem Products

### Argos — The Observer

_In Development_

Standalone runtime behavioral observer for Node.js applications. Detects event loop starvation, memory anomalies, and behavioral drift.

[Learn more →](/argos)

---

### Muninn — The Memory

_Expected: Q2 2026_

Threat metadata substrate for research, ML training, and pattern correlation. Three-layer storage (Hot/Cold/Archive) with bounded memory.

[Learn more →](/muninn)

---

### Huginn — The Scout

_Expected: Q2 2026_

External threat intelligence integration. IP reputation lookup (AbuseIPDB, Project Honeypot), MITRE ATT&CK mapping, and campaign association.

[Learn more →](/huginn)

---

### Talos — The Enforcer

_Expected: Q2 2026_

External policy-driven response engine. Block sources, throttle traffic, inject challenges — all controlled by your external policies.

[Learn more →](/talos)

---

## Principles

Tracehound will always be:

- **Decision-free** — We never guess what's a threat
- **Payload-less** — Evidence is metadata, not content
- **Deterministic** — Same input, same output, always

---

## Feature Requests

Have a feature request? [Open an issue on GitHub](https://github.com/laphilosophia/tracehound/issues) or reach out to us directly.
