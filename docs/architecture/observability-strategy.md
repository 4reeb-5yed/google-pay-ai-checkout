---
author: Bootstrap_System
date: 2026-07-23
version: 1.0.0
status: Draft
master_plan_ref: Section 17
---

# Observability Strategy — Google Pay AI Checkout Platform

## Table of Contents

- [1. Overview](#1-overview)
- [2. Logging (v1.2+)](#2-logging-v12)
- [3. Metrics](#3-metrics)
- [4. AI Monitoring Pipeline (v1.0)](#4-ai-monitoring-pipeline-v10)
- [5. Conventional Alerting (v1.2+)](#5-conventional-alerting-v12)
- [6. Health Endpoints (v1.2+)](#6-health-endpoints-v12)
- [7. Tracing (v3+)](#7-tracing-v3)
- [References](#references)

---

## 1. Overview

The Google Pay AI Checkout Platform employs a **dual monitoring approach**:

- **AI Monitoring Pipeline (v1.0):** LLM-driven observability via MCP server integration,
  providing intelligent anomaly detection and incident summarization from day one.
- **Conventional Alerting (v1.2+):** Threshold-based monitoring and alerting that operates
  independently of LLM availability.

**Neither approach replaces the other.** The AI pipeline provides intelligent pattern
recognition and contextual summaries, while conventional alerting ensures deterministic,
reliable notification even when the AI layer is unavailable. Both systems operate in
parallel once conventional alerting is introduced in v1.2.

---

## 2. Logging (v1.2+)

### Format

All application logs MUST use **structured JSON format** for machine parseability:

```json
{
  "timestamp": "2026-07-23T14:30:00.000Z",
  "level": "INFO",
  "requestId": "req_abc123",
  "service": "checkout-api",
  "message": "Payment initiated",
  "metadata": {}
}
```

### Request ID Correlation

Every inbound request is assigned a unique `requestId` at the API boundary. This ID
is propagated through all internal calls and included in every log entry, enabling
end-to-end request tracing within a single service.

### Log Levels

| Level | Usage |
|-------|-------|
| **ERROR** | Unrecoverable failures, payment failures, security events |
| **WARN** | Degraded performance, retry scenarios, approaching limits |
| **INFO** | Normal operations, transaction lifecycle events |
| **DEBUG** | Detailed diagnostic information (disabled in production) |

### Security Constraints

- **NEVER** log payment tokens, card numbers, CVVs, or full PANs.
- **NEVER** log user passwords or authentication secrets.
- Request/response bodies are logged at the API boundary in **sanitized** form only.
- Sensitive fields are replaced with `[REDACTED]` before logging.
- PII (email, phone, address) is masked in logs: `j***@example.com`.

---

## 3. Metrics

### Core Metrics

The following metrics are collected and exported to the monitoring dashboard:

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Transaction success rate | Percentage of completed payments | < 95% |
| Transaction failure rate | Percentage of failed payments | > 5% |
| Checkout latency (p50) | Median checkout duration | TBD |
| Checkout latency (p95) | 95th percentile duration | TBD |
| Checkout latency (p99) | 99th percentile duration | TBD |
| MCP call success rate | Successful MCP server interactions | < 90% |
| Error rate by type | Grouped by error category | Varies |

### Export

Metrics are exported to a monitoring dashboard. Tool selection is **TBD** and will
be decided via ADR when conventional monitoring is implemented in v1.2.

Candidate tools (for evaluation):
- Prometheus + Grafana
- Cloud-native monitoring (GCP Cloud Monitoring, AWS CloudWatch)
- DataDog / New Relic

---

## 4. AI Monitoring Pipeline (v1.0)

### Architecture

The AI monitoring pipeline is **LLM-driven via MCP server** and operates from v1.0
as part of the codelab experience.

### Capabilities

- **Polls integration status** — periodically checks health of connected services.
- **Anomaly detection on patterns** — identifies unusual transaction patterns,
  latency spikes, or error clusters using LLM analysis.
- **AI-generated incident summaries** — when anomalies are detected, generates
  human-readable summaries of what happened, potential causes, and suggested actions.

### Guardrails

- **All AI recommendations require human review** before action is taken.
- The AI pipeline is **non-blocking to the checkout flow** — if the monitoring
  LLM is unavailable, checkout continues unaffected.
- AI monitoring operates on **read-only** data; it cannot modify system state.
- False positive rates are tracked and used to tune detection sensitivity.

### Limitations

- Dependent on LLM availability (hence the need for conventional alerting).
- Not suitable as sole alerting mechanism for critical failures.
- Summarization quality depends on context window and model capabilities.

---

## 5. Conventional Alerting (v1.2+)

### Design Principles

- **Threshold-based** — alerts fire when metrics cross defined thresholds.
- **Not dependent on LLM availability** — operates purely on metric data and rules.
- **Deterministic** — same conditions always produce same alert behavior.

### Alert Rules (Initial Set)

| Condition | Severity | Action |
|-----------|----------|--------|
| Error rate > 5% for 5 minutes | Critical | Page on-call |
| Latency p95 > 3s for 5 minutes | Warning | Notify channel |
| MCP unreachable for 2 minutes | Warning | Notify channel |
| Health endpoint failure | Critical | Page on-call |

### Alert Channels

Alert delivery channels are **TBD** and will be configured during v1.2 implementation.
Candidates:
- Slack/Teams integration
- PagerDuty / Opsgenie
- Email escalation

---

## 6. Health Endpoints (v1.2+)

### Liveness: `/health`

Returns `200 OK` if the process is alive and able to serve requests.

```json
{
  "status": "ok",
  "timestamp": "2026-07-23T14:30:00.000Z"
}
```

Does NOT check downstream dependencies. Used by orchestrators for restart decisions.

### Readiness: `/health/ready`

Returns `200 OK` only if the service is ready to handle traffic:

- Database connection is active and responsive.
- MCP server is reachable.
- Required configuration is loaded.

```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "mcp": "ok",
    "config": "ok"
  },
  "timestamp": "2026-07-23T14:30:00.000Z"
}
```

Returns `503 Service Unavailable` if any critical dependency is unhealthy.

---

## 7. Tracing (v3+)

### Rationale for Deferral

Distributed tracing is deferred until **v3** because:

- The current architecture is a **single-service** application.
- Tracing adds value when requests **span multiple processes/services**.
- Adding tracing prematurely creates overhead without proportional benefit.

### Future Implementation

When the platform scales to multiple services (v3+):

- Implement OpenTelemetry-compatible distributed tracing.
- Propagate trace context across service boundaries.
- Integrate with trace visualization tools (Jaeger, Zipkin, or cloud-native).
- Correlate traces with existing request IDs and log entries.

---

## References

- [ADR-005: Observability Strategy](decisions/ADR-005-observability-strategy.md)
- Master Plan — Section 17 (Observability)
- [Production Readiness Checklist](production-readiness-checklist.md)
