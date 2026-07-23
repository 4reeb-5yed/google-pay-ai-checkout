---
author: Areeb Syed
date: 2026-07-23
version: 1.0.0
status: Draft
master_plan_ref: Section 7
---

# Project Roadmap

This roadmap defines the version progression for the GooglePay-AI-Checkout project, derived from Master Plan Section 7. Each version has a clear scope and exit criteria.

## Version Plan

| Version | Name | Scope | Exit Criteria |
|---------|------|-------|---------------|
| v1.0 | Internship Assignment | Codelab: Google Pay button, MIT, dynamic pricing, AI monitoring, TEST env | Codelab requirements met and graded |
| v1.1 | Production Foundation | ADRs, governance, testing strategy, threat model, documentation | This document merged and referenced |
| v1.2 | Backend | FastAPI, SQLite, real order/transaction records | Backend passes integration tests |
| v2 | Merchant Platform | Multi-merchant, admin dashboard, webhooks | Second merchant onboards without code changes |
| v3 | Customer Accounts | Auth, saved payment methods, order history | Returning customer checks out without re-entering info |
| v4 | Enterprise | Multi-region, SLA monitoring, RBAC, audit logging | Full Production Readiness Checklist |
| v5 | Agentic Commerce | AI-initiated purchasing, policy-governed spend | Agent transaction completes under spend policy |

## Current Status

**v1.1 (Production Foundation)** — in progress.

### v1.1 Deliverables Checklist

- [x] Repository structure established
- [x] ADRs documented (ADR-001 through ADR-010)
- [x] Governance document
- [x] Security threat model
- [ ] Testing strategy implementation
- [ ] All guides and planning documents complete
- [ ] Production readiness checklist finalized
- [ ] CI/CD pipeline configured

## Version Progression Rules

1. **No version is skipped.** Each version builds on the prior version's foundation.
2. **Exit criteria are gates, not suggestions.** A version is not complete until all exit criteria are met.
3. **Scope is fixed per version.** Feature requests that don't fit the current version scope are deferred to the appropriate future version.

---

## References

- Master Plan: Section 7
- [Product Requirements Document](../requirements/prd.md)
- [Vision Document](../requirements/vision.md)
