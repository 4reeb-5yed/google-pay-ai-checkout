---
author: Bootstrap_System
date: 2026-07-23
version: 1.0.0
status: Accepted
master_plan_ref: Section 18, ADR-010
---

# ADR-004: Security Approach

## Context

The platform processes payment tokens from Google Pay. Security architecture must prevent token leakage, amount tampering, and unauthorized MIT charges while maintaining PCI compliance with minimal scope.

## Decision

### PCI Scope: SAQ-A

Google Pay tokenizes card data client-side. Our servers **never** store, process, or transmit raw PANs (Primary Account Numbers). This qualifies us for PCI SAQ-A — the lightest compliance tier.

### Token Handling

- Payment tokens are **transient** — processed immediately, never persisted
- Tokens are NEVER included in logs, error responses, or debug output
- Expired or invalid tokens produce generic error messages (no details leaked)

### Trust Boundaries

1. **Browser ↔ Google Pay API** — trusted by design (Google's infrastructure)
2. **Browser ↔ Our Frontend** — CSP headers, input sanitization
3. **Our Backend ↔ Database** — parameterized queries, no raw SQL
4. **Our Backend ↔ MCP Server** — authenticated, scoped access

### Input Validation

- Server-side validation of ALL payment amounts (never trust client-supplied price)
- Cart total = sum of (quantity × unit price) — verified server-side
- Idempotency keys required on all mutation endpoints

### Error Response Sanitization

- No stack traces in client-facing errors
- Generic messages for security-sensitive failures
- Correlation IDs for internal debugging

### AI-Generated Code Security

- Two-reviewer rule for auth/payment/secrets changes
- No AI tool receives production credentials
- Generated code is checked for accidental secret inclusion before commit

## Consequences

### Positive
- SAQ-A minimizes compliance overhead
- Token transience eliminates data-at-rest risk
- Server-side validation prevents amount tampering
- Generic errors prevent information leakage

### Negative
- Cannot offer "save card for later" without introducing SAQ-A-EP scope (deferred to v3)
- Server-side validation adds latency to checkout flow

## References

- Master Plan Section 18 (Security Threat Model)
- Master Plan ADR-010 (Why PCI SAQ-A)
