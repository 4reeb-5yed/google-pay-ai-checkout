---
author: Areeb Syed
date: 2026-07-23
version: 1.0.0
status: Accepted
master_plan_ref: Section 14
---

# ADR-002: Testing Strategy

## Context

Payment processing systems have strict correctness requirements — cart total miscalculations, duplicate charges, or pricing errors have direct financial impact. Traditional example-based testing alone cannot provide confidence across the full input space. The Master Plan Section 14 mandates a progressive testing strategy from manual testing (v1.0) through property-based testing (v1.2+).

## Decision

Adopt a dual testing approach combining **property-based testing** for universal correctness and **example-based testing** for specific scenarios:

| Approach | Library | Purpose |
|----------|---------|---------|
| Property-Based (Python) | Hypothesis | Backend payment logic (amounts, idempotency, pricing) |
| Property-Based (JS) | fast-check | Frontend validation logic |
| Unit Tests (Python) | pytest | Service layer, business rules |
| Unit Tests (JS) | vitest (TBD) | Frontend utilities |
| Integration Tests | pytest + httpx | API endpoint contracts |
| E2E Tests (v2+) | Playwright (TBD) | Full checkout flows |

### Correctness Properties

Seven formal properties govern payment correctness:
1. Cart total integrity (sum of items = declared total)
2. Mutation idempotency (same key = same result)
3. Dynamic pricing correctness (rule application)
4. MIT lifecycle enforcement (cancelled = rejected)
5. Invalid input rejection (non-positive quantities)
6. Persistence round-trip (store = retrieve)
7. MIT frequency enforcement (interval compliance)

### Coverage Targets

| Layer | Unit | Property |
|-------|------|----------|
| Pricing | 90% | 100 iterations × 3 funding sources |
| Validation | 85% | Properties 1, 5 |
| MIT Logic | 85% | Properties 4, 7 |
| API Layer | 75% | Via integration |

## Consequences

### Positive
- Payment math is verified across thousands of random inputs
- Idempotency bugs caught before production
- Explicit properties serve as living specification
- CI catches regressions automatically

### Negative
- Property tests add CI execution time (~30s per suite)
- Hypothesis/fast-check require team learning investment
- Some properties may need refinement as implementation reveals edge cases

## References

- Master Plan Section 14 (Testing & QA Strategy)
- Design Document: Correctness Properties section
