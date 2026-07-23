---
author: Areeb Syed
date: 2026-07-23
version: 1.0.0
status: Accepted
master_plan_ref: Section 19, Section 21
---

# ADR-008: Payment Processing Architecture

## Context

Payment processing requires strict correctness (no over-charging, no duplicates), resilience (network failures shouldn't corrupt state), and security (tokens must never leak). The architecture must enforce these properties structurally.

## Decision

### Layered Architecture

```
API Layer (FastAPI) — validation, routing, error formatting
    ↓
Business Layer — checkout orchestration, pricing strategy, MIT scheduling
    ↓
Repository Layer — persistence abstraction, transaction management
```

Each layer has a single responsibility:
- **API**: Validates inputs, enforces idempotency, formats responses
- **Business**: Applies pricing rules, orchestrates checkout flow, manages MIT lifecycle
- **Repository**: Stores/retrieves data, manages transactions

### Design Patterns

| Pattern | Application |
|---------|-------------|
| Facade | `CheckoutService` hides MCP calls, pricing, persistence from API |
| Strategy | Pricing calculation varies by `cardFundingSource` |
| Factory | Payment request objects differ for one-time vs MIT flows |
| Adapter | MCP client wrapped behind our interface for testability |
| DI | Repository and MCP client injected into services |

### Idempotency

- Every mutation endpoint requires a client-supplied `idempotencyKey`
- Same key + same payload → return cached result (no duplicate processing)
- Same key + different payload → reject with 409 Conflict
- Keys expire after 24 hours

### Money Handling

- All monetary values stored as **integer cents** (no floating-point)
- Currency code always explicit (ISO 4217)
- Rounding performed once at final calculation, not at intermediate steps

## Consequences

### Positive
- Layer isolation means pricing bugs can't corrupt persistence
- Idempotency prevents duplicate charges by design
- Integer cents eliminate floating-point rounding errors
- Facades enable testing each layer in isolation

### Negative
- More code than a flat architecture (justified by payment correctness)
- DI setup requires boilerplate (mitigated by FastAPI's dependency system)

## References

- Master Plan Section 19 (Design Patterns)
- Master Plan Section 21 (Future Backend Architecture)
- Master Plan ADR-004 (Layered Architecture rationale)
