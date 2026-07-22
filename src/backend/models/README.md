# Backend — Domain Models

> **Master Plan Reference**: Section 21
> **Roadmap Version**: v1.0 (types), v1.2 (persistence models)

## Purpose

Domain objects and data models shared across layers.

## What Will Be Implemented Here

- `Money` — Integer cents + currency code (no floating-point)
- `PaymentToken` — Transient token structure
- `CheckoutRequest` / `CheckoutResponse`
- `MITAgreement` / `MITTerms` / `MITChargeRequest`
- `PricingRule` / `CardFundingSource`
- `TransactionRecord`
- `HealthReport`

## Implementation Notes

Type definitions may begin in v1.0 for frontend use. Full persistence models added in v1.2.
