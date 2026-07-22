---
author: Bootstrap_System
date: 2026-07-23
version: 1.0.0
status: Accepted
master_plan_ref: Section 2
---

# ADR-009: Dynamic Pricing Design

## Context

The Google Pay API exposes `cardFundingSource` (CREDIT, DEBIT, PREPAID) in the payment response. This enables differentiated pricing — for example, offering a debit card discount to reduce interchange costs while maintaining correct authorization amounts.

## Decision

### Strategy Pattern Implementation

```
PricingService
    ├── registers PricingRule per (merchant, fundingSource)
    ├── selects rule based on payment's cardFundingSource
    └── calculates: finalAmount = baseAmount - (baseAmount × discountBps / 10000)
```

### Pricing Rules

| Funding Source | Behavior | Rationale |
|---------------|----------|-----------|
| CREDIT | Base price (0 bps discount) | Standard interchange |
| DEBIT | Configurable discount (e.g., 50 bps) | Lower interchange cost |
| PREPAID | Configurable surcharge (if permitted) | Higher risk, varies by jurisdiction |

### Routing

- Funding source also determines processing route (e.g., debit network vs. credit network)
- Routing configuration is separate from pricing (different strategies)

### Constraints

- Surcharges are jurisdiction-dependent — disabled by default, enabled per merchant config
- All pricing is verified server-side (client cannot self-apply discounts)
- Rounding: final amount rounded to nearest cent using banker's rounding

## Consequences

### Positive
- Interchange optimization reduces merchant costs
- Strategy Pattern allows adding new rules without code changes
- Server-side enforcement prevents client-side manipulation
- Configurable per merchant for v2+ multi-tenant

### Negative
- Requires Google Pay TEST environment to validate cardFundingSource behavior
- Surcharge rules vary by country — requires legal review before production

## References

- Master Plan Section 2 (v1.0 scope — dynamic pricing via cardFundingSource)
- Google Pay API: `cardFundingSource` field documentation
