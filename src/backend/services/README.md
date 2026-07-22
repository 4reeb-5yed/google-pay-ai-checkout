# Backend — Business Services

> **Master Plan Reference**: Section 21 (Future Backend Architecture), Section 19 (Design Patterns)
> **Roadmap Version**: v1.2

## Purpose

This directory will contain the business logic layer — checkout orchestration, pricing strategy execution, and MIT scheduling.

## What Will Be Implemented Here

- `CheckoutService` (Facade pattern) — orchestrates the full checkout flow
- `PricingService` (Strategy pattern) — executes pricing rules per cardFundingSource
- `MITScheduler` — manages recurring charge scheduling
- `TokenHandler` — transient token processing (never persisted)

## Implementation Notes

Not implemented in v1.0. Placeholder for v1.2 backend introduction.
