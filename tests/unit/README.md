# Tests — Unit

> **Master Plan Reference**: Section 14
> **Tooling**: pytest (Python), vitest (JavaScript)

## Purpose

Unit tests for individual functions and methods. Each subdirectory corresponds to a source module.

## Structure

- `pricing/` — Dynamic pricing calculation tests
- `validation/` — Input validation tests
- `mit/` — MIT agreement lifecycle tests
- `checkout/` — Checkout orchestration tests

## Guidelines

- Tests run in isolation (no external dependencies)
- Property-based tests live in `tests/property/` not here
- AI-generated tests require human review
- Target: 80%+ coverage on payment logic
