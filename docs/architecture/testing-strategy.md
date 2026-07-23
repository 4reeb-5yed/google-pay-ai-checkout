---
author: Areeb Syed
date: 2026-07-23
version: 1.0.0
status: Draft
master_plan_ref: Section 14
---

# Testing Strategy — Google Pay AI Checkout Platform

## Table of Contents

1. [Testing Philosophy](#1-testing-philosophy)
2. [Test Types](#2-test-types)
3. [Correctness Properties](#3-correctness-properties)
4. [Coverage Targets](#4-coverage-targets)
5. [Test Environment Configuration](#5-test-environment-configuration)
6. [CI/CD Integration](#6-cicd-integration)
7. [AI-Generated Test Review](#7-ai-generated-test-review)
8. [References](#references)

---

## 1. Testing Philosophy

- **Dual approach**: Property-based testing + example-based testing used in combination
- **Payment logic requires formal correctness guarantees** — financial calculations cannot rely solely on example-based tests; universal invariants must hold across all inputs
- **AI-generated tests are subject to the same human review as implementation code** — no test enters the suite without a human verifying it actually tests what it claims
- **Progressive testing maturity**:
  - v1.0: Manual test execution, core property tests
  - v1.1+: Automated CI execution, expanded coverage
  - v1.2+: Full test suite with integration and property tests in CI

---

## 2. Test Types

| Type | Scope | Tools | Available From |
|------|-------|-------|----------------|
| Unit Tests | Individual functions/methods | pytest, vitest | v1.0+ |
| Property-Based | Universal correctness invariants | Hypothesis, fast-check | v1.0+ |
| Integration | API endpoints, database, MCP | pytest + httpx | v1.2+ |
| E2E | Full checkout flows in browser | Playwright (TBD) | v2+ |
| Security | Auth bypass, replay attacks | Manual + automated | v2+ |

---

## 3. Correctness Properties

The following correctness properties are derived from the design document and must hold
universally across all valid inputs. Each property is tested using property-based testing
with a minimum of 100 iterations per property.

### 3.1 Cart Total Integrity

- **Description**: The total amount charged must always equal the sum of individual item prices multiplied by their quantities, plus applicable taxes and fees, minus any discounts.
- **Test Approach**: Property-based with 100 iterations minimum. Generate random cart configurations (varying items, quantities, prices) and assert that `total == sum(item.price * item.quantity) + taxes + fees - discounts` for every generated case.

### 3.2 Mutation Idempotency

- **Description**: Applying the same mutation operation multiple times must produce the same result as applying it once. Duplicate requests must not cause duplicate charges or state corruption.
- **Test Approach**: Property-based with 100 iterations minimum. Generate random mutation operations, apply each twice, and assert final state is identical to single-application state.

### 3.3 Dynamic Pricing Correctness

- **Description**: Dynamically calculated prices must always fall within configured bounds and must be deterministic for the same input parameters within the same pricing epoch.
- **Test Approach**: Property-based with 100 iterations minimum. Generate random pricing inputs, verify output is within `[min_price, max_price]` bounds, and verify same inputs produce same output within an epoch.

### 3.4 MIT Lifecycle Enforcement

- **Description**: Merchant-Initiated Transactions must follow the correct lifecycle: authorization → capture → (optional) void/refund. No state transition may skip a required step or enter an invalid state.
- **Test Approach**: Property-based with 100 iterations minimum. Generate random sequences of lifecycle operations and verify that only valid transitions are accepted, and invalid transitions are rejected with appropriate errors.

### 3.5 Invalid Cart Item Rejection

- **Description**: Cart items with invalid data (negative prices, zero quantities, missing required fields, non-existent product IDs) must be rejected at validation time and never reach the payment processing layer.
- **Test Approach**: Property-based with 100 iterations minimum. Generate random invalid cart items (negative price, zero/negative quantity, empty name, etc.) and assert all are rejected with validation errors before reaching downstream services.

### 3.6 Transaction Persistence Round-Trip

- **Description**: Any transaction written to the persistence layer must be retrievable with identical data. No data loss or corruption may occur during write/read cycles.
- **Test Approach**: Property-based with 100 iterations minimum. Generate random valid transaction objects, persist them, retrieve them, and assert byte-for-byte equality on all fields.

### 3.7 MIT Charge Frequency Enforcement

- **Description**: Merchant-Initiated Transaction charges must not exceed the frequency limits agreed upon during authorization. If a merchant attempts to charge more frequently than allowed, the charge must be rejected.
- **Test Approach**: Property-based with 100 iterations minimum. Generate random charge sequences with varying timestamps and frequency limits, and verify that charges exceeding the frequency cap are rejected.

---

## 4. Coverage Targets

| Layer | Target Coverage | Rationale |
|-------|----------------|-----------|
| Pricing | 90% | Financial calculations are critical; errors directly impact revenue and trust |
| Validation | 85% | Input validation is the first defense against invalid data reaching the system |
| MIT (Merchant-Initiated Transactions) | 85% | Payment lifecycle correctness is essential for compliance |
| Persistence | 80% | Data integrity must be guaranteed for financial records |
| Idempotency | 80% | Duplicate prevention is critical for payment reliability |
| API | 75% | Endpoint behavior must be predictable and well-tested |
| Frontend | 70% | UI correctness matters but is supplemented by E2E tests |

---

## 5. Test Environment Configuration

### Unit / Property Tests
- **Environment**: In-memory, fully mocked dependencies
- **Database**: None (mocked repositories)
- **External Services**: All mocked/stubbed
- **Speed**: < 1 second per test file

### Integration Tests
- **Environment**: File-based SQLite database
- **External Services**: Mock MCP server (local process)
- **Google Pay**: Mock payment token generator
- **Speed**: < 30 seconds for full suite

### E2E Tests
- **Environment**: Full TEST environment deployment
- **External Services**: Real Google Pay TEST environment
- **Browser**: Chromium via Playwright
- **Speed**: < 5 minutes for full suite

### CI Execution
- All tests except E2E run on every pull request
- E2E tests run on merge to main and nightly
- Property tests use 100 iterations in PR, 1000 in nightly builds

---

## 6. CI/CD Integration

### Execution Order

```
lint → type check → unit → property (100 iter) → integration → e2e → coverage report
```

### Configuration

- **Property test iterations**:
  - Pull request CI: 100 iterations per property
  - Nightly build: 1000 iterations per property
  - Local development: 10 iterations (fast feedback)

- **Merge blocking rules**:
  - A failing property test **blocks merge** — no exceptions
  - A failing unit test blocks merge
  - Coverage drop below target blocks merge (configurable per layer)
  - Integration test failure blocks merge

- **Reporting**:
  - Coverage report generated and posted to PR as comment
  - Property test failure includes shrunk counterexample in CI output
  - Test timing reported to detect performance regressions

---

## 7. AI-Generated Test Review

### Principles

1. **AI-generated tests require human review** — they are treated identically to AI-generated implementation code
2. **A test that always passes is worse than no test** — it provides false confidence while testing nothing
3. **Verify the test actually exercises the behavior it claims to test**:
   - Does the test fail when the behavior is broken?
   - Does the test cover meaningful edge cases?
   - Is the property actually universal, or just an example dressed up as a property?

### Review Checklist for AI-Generated Tests

- [ ] Test fails when expected behavior is intentionally broken (mutation testing principle)
- [ ] Property-based tests generate meaningful input diversity
- [ ] Assertions are specific enough to catch real bugs
- [ ] Test does not duplicate existing coverage without adding value
- [ ] Test is readable and maintainable by a human developer

---

## References

- **ADR-002**: Testing Strategy architectural decision
- **Master Plan Section 14**: Testing and quality assurance requirements
- **Design Doc**: Correctness properties (Section 5)
