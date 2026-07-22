# Tests — Property-Based

> **Master Plan Reference**: Section 14, ADR-002
> **Tooling**: Hypothesis (Python), fast-check (JavaScript)

## Purpose

Property-based tests that verify universal correctness invariants across randomly generated inputs. These tests complement unit tests by exploring the input space more thoroughly.

## Correctness Properties Tested

1. Cart total integrity
2. Mutation idempotency
3. Dynamic pricing correctness
4. MIT lifecycle enforcement
5. Invalid cart item rejection
6. Transaction persistence round-trip
7. MIT charge frequency enforcement

## Configuration

- Minimum 100 iterations per property in CI
- 1000 iterations in nightly builds
- 10 iterations for local development (fast feedback)
- Failing property test blocks merge — no exceptions
