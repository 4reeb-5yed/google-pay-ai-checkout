---
author: Bootstrap_System
date: 2026-07-23
version: 1.0.0
status: Accepted
master_plan_ref: Section 2, Section 21
---

# ADR-001: Technology Stack Selection

## Context

The Google Pay AI Checkout Platform requires a technology stack that supports:
- A client-side Google Pay integration (v1.0)
- An async-capable backend API (v1.2+)
- AI-tool code generation compatibility
- Incremental adoption from simple to production-grade

The v1.0 scope is defined by the Google Pay API Codelab, which targets a web-based checkout page. Future versions require a backend capable of server-side validation, persistence, and multi-tenant support.

## Decision

### Frontend (v1.0)
- **HTML5, CSS3, Vanilla JavaScript**: Minimal dependencies for codelab compliance. Google Pay's `pay.js` library requires only a standard browser environment.
- No framework for v1.0 — reduces complexity and avoids premature optimization.

### Backend (v1.2+)
- **FastAPI (Python)**: Async-native, typed, auto-generates OpenAPI schema. Selected because:
  - Self-describing API schema pairs well with AI code generation tools
  - Type hints enable static analysis and IDE support
  - Async support handles concurrent payment processing
  - Master Plan ADR-002 mandates FastAPI

### Database (v1.2+)
- **SQLite initially → PostgreSQL for v2+**: Zero operational overhead for single-merchant v1.2. Explicit migration path documented per Master Plan ADR-003.

### Testing
- **Hypothesis** (Python): Property-based testing for backend logic
- **fast-check** (JavaScript): Property-based testing for frontend logic
- **pytest**: Unit and integration test runner
- Standard test frameworks to be confirmed during v1.0 implementation

### Infrastructure
- **Docker** (v1.2+): Container-based deployment
- **GitHub Actions**: CI/CD pipeline

## Consequences

### Positive
- Vanilla JS means no build step for v1.0 — immediate development start
- FastAPI's auto-OpenAPI feeds AI tools contextually
- SQLite → Postgres path is well-documented and low-risk
- Property-based testing catches edge cases in payment math

### Negative
- Vanilla JS may need framework introduction for v2+ dashboard complexity
- Python backend means two languages in the repo (JS frontend + Python backend)
- SQLite has concurrency limitations (acceptable for single-merchant v1.2)

### Risks
- Framework decision for v2+ dashboard is deferred — may require migration effort
- FastAPI version updates could break auto-generated schemas

## References

- Master Plan Section 2 (Current Scope), Section 21 (Future Backend Architecture)
- Master Plan ADR-002 (Why FastAPI), ADR-003 (Why SQLite)
- Google Pay API Codelab requirements
