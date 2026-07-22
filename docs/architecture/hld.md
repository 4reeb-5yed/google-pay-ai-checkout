---
author: Bootstrap_System
date: 2026-07-23
version: 1.0.0
status: Draft
master_plan_ref:
  - Section 19
  - Section 21
---

# High-Level Design (HLD) — Google Pay AI Checkout Platform

## Table of Contents

- [1. System Architecture Overview](#1-system-architecture-overview)
- [2. Component Diagram](#2-component-diagram)
- [3. Data Flow](#3-data-flow)
- [4. Technology Stack Decisions](#4-technology-stack-decisions)
- [5. Deployment Architecture](#5-deployment-architecture)
- [6. Security Architecture](#6-security-architecture)
- [7. Design Patterns Applied](#7-design-patterns-applied)
- [References](#references)

---

## 1. System Architecture Overview

The Google Pay AI Checkout Platform follows a **layered architecture** pattern (as defined in ADR-008):

```
API Layer → Business Layer → Repository Layer
```

**Key architectural decisions:**

- **v1.0 is frontend-only**: The initial release delivers a complete checkout experience
  using only client-side HTML5/CSS3/JavaScript. No backend server is required.
- **Backend introduced in v1.2**: FastAPI-based backend adds server-side validation,
  persistent storage, and MIT (Merchant Initiated Transaction) scheduling.
- **AI pipeline runs alongside checkout**: The AI monitoring pipeline observes and
  analyzes checkout health in real-time but does **not** block the payment flow.
  It operates in a monitoring-only capacity, generating alerts for human review.

---

## 2. Component Diagram

The following components comprise the system architecture:

### v1.0 Components (Frontend-Only Release)

| Component | Responsibility |
|-----------|---------------|
| **Checkout Frontend** | Google Pay button integration, payment sheet rendering, cart UI |
| **MIT Module** | Agreement management, recurring charge scheduling |
| **Dynamic Pricing Module** | `cardFundingSource`-based pricing via Strategy Pattern (ADR-009) |
| **AI Monitoring Pipeline** | MCP-based health monitoring, anomaly detection |

### v1.2 Components (Backend Introduction)

| Component | Responsibility |
|-----------|---------------|
| **Backend API Layer** | FastAPI endpoints, request validation, OpenAPI documentation |
| **Business Services** | CheckoutService facade, PricingService, MITScheduler |
| **Repository Layer** | TransactionRepo, AgreementRepo, AuditRepo |
| **Database** | SQLite initially; Postgres planned for v2+ |

### Component Interaction (Text Description)

```
┌─────────────────────────────────────────────────────────┐
│                   Checkout Frontend                       │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ GPay Btn │  │ Payment Sheet│  │     Cart UI      │  │
│  └──────────┘  └──────────────┘  └──────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ (v1.2+)
┌───────────────────────▼─────────────────────────────────┐
│                  Backend API Layer                        │
│              (FastAPI + OpenAPI + Validation)             │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  Business Services                        │
│  ┌────────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │CheckoutService │ │PricingService│ │MITScheduler  │  │
│  │   (Facade)     │ │  (Strategy)  │ │              │  │
│  └────────────────┘ └──────────────┘ └──────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  Repository Layer                         │
│  ┌───────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │TransactionRepo│ │AgreementRepo │ │  AuditRepo   │   │
│  └───────────────┘ └──────────────┘ └──────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              Database (SQLite → Postgres)                 │
└─────────────────────────────────────────────────────────┘

        ┌─────────────────────────────────────┐
        │      AI Monitoring Pipeline          │
        │  MCP Server → LLM → Anomaly Detect  │
        │       (parallel, non-blocking)       │
        └─────────────────────────────────────┘
```

---

## 3. Data Flow

### Flow 1: Standard Checkout

```
Customer
  │
  ▼
Google Pay Button (click)
  │
  ▼
isReadyToPay() check
  │ (success)
  ▼
Payment Sheet displayed
  │
  ▼
Customer authorizes payment
  │
  ▼
onPaymentAuthorized callback fires
  │
  ▼
Payment Token received
  │
  ├── v1.0: Token logged for testing (no backend)
  │
  └── v1.2+: Token forwarded to backend for processing
```

### Flow 2: MIT (Merchant Initiated Transaction) Charge

```
Merchant System
  │
  ▼
MIT charge request (with idempotency key)
  │
  ▼
Validate agreement is active
  │
  ▼
Apply pricing rules (Dynamic Pricing Module)
  │
  ▼
Execute charge
  │
  ▼
Store transaction (Repository Layer)
  │
  ▼
Return result to merchant
```

### Flow 3: AI Monitoring

```
Scheduled trigger (cron/interval)
  │
  ▼
MCP Server query (integration status check)
  │
  ▼
LLM analysis of response
  │
  ▼
Anomaly detection evaluation
  │
  ▼
Alert generation (if anomaly detected)
  │
  ▼
Human review required (no automated remediation)
```

---

## 4. Technology Stack Decisions

> Full rationale documented in [ADR-001: Technology Stack](decisions/ADR-001-technology-stack.md)

| Layer | Technology | Version Introduced |
|-------|-----------|-------------------|
| Frontend | HTML5 / CSS3 / JavaScript (no framework) | v1.0 |
| Backend | FastAPI (Python) | v1.2+ |
| Database | SQLite → PostgreSQL | v1.2 → v2 |
| AI | Antigravity + MCP Server | v1.0 |
| Testing | Hypothesis (Python) + fast-check (JS) | v1.0 |
| CI/CD | GitHub Actions | v1.0 |
| Infrastructure | Docker | v1.2+ |

---

## 5. Deployment Architecture

### Environment Progression

| Environment | Version | Configuration |
|-------------|---------|---------------|
| **Development** | v1.0+ | Local machine, TEST Google Pay environment |
| **Staging** | v1.2+ | Docker container, TEST Google Pay environment |
| **Production** | v2+ | Containerized behind reverse proxy, real merchant environment |

### Configuration Management

- All environments use **environment variables** for configuration
- Credentials and secrets are **never hardcoded** in source
- Environment-specific settings are isolated per deployment target
- Configuration follows 12-factor app principles

---

## 6. Security Architecture

### Trust Boundaries

Four trust boundaries are defined (per [ADR-004: Security Approach](decisions/ADR-004-security-approach.md)):

1. **Browser ↔ Google Pay API** — Google-controlled iframe/popup
2. **Browser ↔ Backend API** — HTTPS with validation
3. **Backend ↔ Payment Processor** — Server-to-server, authenticated
4. **Backend ↔ Database** — Internal network, parameterized queries

### PCI Compliance

- Scope: **PCI SAQ-A** (no direct card data handling)
- Payment tokens are **transient** — never persisted or logged
- All card data remains within Google's PCI-certified infrastructure

### Security Controls

| Control | Implementation |
|---------|---------------|
| Token handling | Transient only; never persisted or logged |
| Input validation | Server-side amount verification (v1.2+) |
| Error sanitization | No stack traces exposed to client |
| Authentication | Token-based API access (v1.2+) |
| Audit trail | All transactions logged to AuditRepo |

> **Reference**: See full [Security Threat Model](../governance/security-threat-model.md) document.

---

## 7. Design Patterns Applied

| Pattern | Where Applied | ADR Reference |
|---------|--------------|---------------|
| Layered Architecture | API → Business → Repository | [ADR-008](decisions/ADR-008-payment-architecture.md) |
| Strategy | Pricing calculation (cardFundingSource routing) | [ADR-009](decisions/ADR-009-dynamic-pricing.md) |
| Adapter | MCP client wrapping | [ADR-010](decisions/ADR-010-mcp-integration.md) |
| Facade | CheckoutService (unified checkout entry point) | [ADR-008](decisions/ADR-008-payment-architecture.md) |
| Factory | Payment request object construction | [ADR-008](decisions/ADR-008-payment-architecture.md) |
| Dependency Injection | All service layers (testability) | [ADR-008](decisions/ADR-008-payment-architecture.md) |
| Configuration | Environment-specific settings management | [ADR-001](decisions/ADR-001-technology-stack.md) |

---

## References

- [Architecture Decision Records (ADRs) Index](decisions/README.md)
- [Software Requirements Specification (SRS)](../requirements/srs.md)
- [Master Plan — Section 19: System Architecture](../planning/master-plan.md#section-19)
- [Master Plan — Section 21: Deployment Strategy](../planning/master-plan.md#section-21)
- [Security Threat Model](../governance/security-threat-model.md)
