---
author: Bootstrap_System
date: 2026-07-23
version: 1.0.0
status: Accepted
master_plan_ref: Section 17
---

# ADR-005: Observability Strategy

## Context

The platform needs monitoring beyond the codelab's AI-driven pipeline. Production systems require conventional alerting alongside LLM-based analysis so incident detection doesn't depend solely on AI judgment.

## Decision

### Logging (v1.2+)
- **Structured JSON logs** correlated by request ID
- Log levels: ERROR, WARN, INFO, DEBUG
- Payment-sensitive data (tokens, PANs) NEVER logged
- Request/response logging at API boundary (sanitized)

### Metrics
- Transaction success/failure rate
- Checkout latency (p50, p95, p99)
- MCP call success rate and latency
- Error rate by type (validation, payment declined, internal)

### AI Monitoring Pipeline (v1.0)
- LLM-driven analysis of integration health via MCP
- Anomaly detection on transaction patterns
- AI-generated incident summaries (human-reviewed before action)

### Conventional Alerting (v1.2+)
- Threshold-based alerts on error rates and latency
- Not dependent on LLM availability
- Complements AI pipeline — not replaced by it

### Health Endpoints (v1.2+)
- `/health` — basic liveness check
- `/health/ready` — readiness check (database connected, MCP reachable)

### Tracing (v3+)
- Distributed tracing when multiple services exist
- Deferred until request spans more than one process

## Consequences

### Positive
- Dual monitoring (AI + conventional) provides redundancy
- Structured logs enable automated analysis
- Health endpoints enable container orchestration

### Negative
- Dual monitoring systems have maintenance overhead
- AI monitoring pipeline requires MCP availability
- Full tracing deferred means limited visibility in v1.2

## References

- Master Plan Section 17 (Observability Strategy)
