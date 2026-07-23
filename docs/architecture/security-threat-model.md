---
author: Areeb Syed
date: 2026-07-23
version: 1.0.0
status: Draft
master_plan_ref: Section 18
---

# Security Threat Model — Google Pay AI Checkout Platform

## Table of Contents

1. [Assets](#1-assets)
2. [Trust Boundaries](#2-trust-boundaries)
3. [Threat Actors](#3-threat-actors)
4. [Attack Vectors](#4-attack-vectors)
5. [Mitigations](#5-mitigations)
6. [PCI Compliance](#6-pci-compliance)
7. [Secure Development Practices](#7-secure-development-practices)
8. [References](#references)

---

## 1. Assets

The following assets require protection. Compromise of any asset constitutes a security incident.

| Asset | Classification | Available From |
|-------|---------------|----------------|
| Payment tokens in transit | Critical | v1.0 |
| OAuth credentials | Critical | v1.0 |
| Merchant configuration | High | v1.0 |
| Customer account data | High | v3+ |
| AI tool access credentials | High | v1.0 |

### 1.1 Payment Tokens in Transit
- Google Pay encrypted payment tokens passed from client to server
- Contain card network token and cryptogram
- Must never be persisted; processed transiently only

### 1.2 OAuth Credentials
- Google API OAuth 2.0 client secrets and refresh tokens
- Used for Google Pay API authentication
- Stored in secrets management, never in code repository

### 1.3 Merchant Configuration
- Pricing rules, product catalog, MIT frequency limits
- Compromise could allow unauthorized price manipulation
- Access controlled via role-based permissions

### 1.4 Customer Account Data (v3+)
- Email, saved preferences, transaction history
- Subject to data protection regulations (GDPR, CCPA)
- Encrypted at rest and in transit

### 1.5 AI Tool Access Credentials
- MCP server authentication tokens
- API keys for AI services (Anthropic, etc.)
- Must be scoped to minimum required permissions

---

## 2. Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET (Untrusted)                     │
│                                                                  │
│  ┌──────────┐         ┌─────────────────┐                      │
│  │  Browser  │◄───────►│  Google Pay API  │                      │
│  │ (Client)  │         │  (Google Trust)  │                      │
│  └─────┬─────┘         └─────────────────┘                      │
│        │                                                         │
├────────┼─────────────────────────────────────────────────────────┤
│        │              BOUNDARY: Client ↔ Server                  │
├────────┼─────────────────────────────────────────────────────────┤
│        ▼                                                         │
│  ┌──────────────┐                                                │
│  │  Our Frontend │  (Server-rendered or static)                  │
│  │   + API       │                                               │
│  └──────┬───────┘                                                │
│         │                                                        │
├─────────┼────────────────────────────────────────────────────────┤
│         │             BOUNDARY: App ↔ Data                       │
├─────────┼────────────────────────────────────────────────────────┤
│         ▼                                                        │
│  ┌──────────┐         ┌────────────┐                            │
│  │ Database  │         │ MCP Server │                            │
│  │ (SQLite)  │         │ (AI Tools) │                            │
│  └──────────┘         └────────────┘                            │
│                                                                  │
│                    INTERNAL (Trusted Zone)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Boundary: Browser ↔ Google Pay API
- **Description**: Client-side JavaScript communicates with Google Pay servers to generate payment tokens
- **Security Controls**: Google's SDK handles encryption; we never see raw card data; HTTPS enforced by Google

### Boundary: Browser ↔ Our Frontend/API
- **Description**: Client sends payment tokens and cart data to our backend for processing
- **Security Controls**: HTTPS (TLS 1.2+), CORS restrictions, input validation, rate limiting

### Boundary: Backend ↔ Database
- **Description**: Application writes/reads transaction records and configuration
- **Security Controls**: Parameterized queries (no SQL injection), file permissions on SQLite, encryption at rest (v2+)

### Boundary: Backend ↔ MCP Server
- **Description**: Backend communicates with AI tool orchestration layer for dynamic pricing and recommendations
- **Security Controls**: Authenticated connections, scoped permissions, no production credentials passed to AI tools

---

## 3. Threat Actors

### 3.1 Opportunistic Attackers
- **Profile**: Automated scanners and casual attackers probing public checkout page
- **Capability**: Low-medium; using known exploits, fuzzing, injection attempts
- **Motivation**: Financial gain through payment manipulation or data theft
- **Available From**: v1.0 (as soon as checkout page is public)

### 3.2 Competitors / Scrapers (v2+)
- **Profile**: Competitors targeting merchant pricing data and product catalog
- **Capability**: Medium; sophisticated scraping, reverse engineering
- **Motivation**: Competitive intelligence, price undercutting
- **Available From**: v2+ (when merchant data becomes valuable)

### 3.3 Adversarial AI Inputs (v5)
- **Profile**: Malicious inputs crafted to exploit AI-powered purchasing flows
- **Capability**: Medium-high; prompt injection, adversarial examples
- **Motivation**: Unauthorized purchases, price manipulation via AI agent
- **Available From**: v5 (agentic purchasing features)

### 3.4 Insider Threat
- **Profile**: Compromised developer credentials or malicious insider
- **Capability**: High; access to source code, deployment pipelines, secrets
- **Motivation**: Financial gain, sabotage
- **Available From**: v1.0 (always relevant)

---

## 4. Attack Vectors

| Vector | Impact | Likelihood | Mitigation |
|--------|--------|------------|------------|
| Injected/tampered payment amounts | High | Medium | Server-side validation — never trust client-provided prices |
| Replayed MIT charge requests | High | Medium | Idempotency keys on all charge operations |
| Leaked OAuth secrets | Critical | Low | Secrets management with rotation policy |
| XSS on checkout page | High | Medium | CSP headers, input sanitization, output encoding |
| Token interception | Critical | Low | HTTPS everywhere, token transience (never persist) |
| AI-generated code with embedded secrets | High | Medium | Pre-commit scanning, two-reviewer rule |

### 4.1 Injected/Tampered Payment Amounts
- **Attack**: Attacker modifies client-side price before submission
- **Impact**: Merchant charged less than intended; revenue loss
- **Likelihood**: Medium — common attack on e-commerce platforms
- **Mitigation**: Server-side price calculation; client price is display-only

### 4.2 Replayed MIT Charge Requests
- **Attack**: Captured charge request replayed to cause duplicate charges
- **Impact**: Customer overcharged; compliance violation; chargebacks
- **Likelihood**: Medium — network-level replay is feasible
- **Mitigation**: Idempotency keys; deduplication at persistence layer

### 4.3 Leaked OAuth Secrets
- **Attack**: OAuth credentials exposed in logs, code, or error messages
- **Impact**: Critical — full API access impersonating our application
- **Likelihood**: Low — mitigated by secrets management practices
- **Mitigation**: Environment variables only; automated secret scanning; 90-day rotation

### 4.4 XSS on Checkout Page
- **Attack**: Injected script steals payment tokens or session cookies
- **Impact**: High — token theft enables unauthorized payments
- **Likelihood**: Medium — checkout pages are high-value targets
- **Mitigation**: Strict CSP headers; input sanitization; output encoding; no inline scripts

### 4.5 Token Interception
- **Attack**: Man-in-the-middle captures payment token in transit
- **Impact**: Critical — captured token could be used for unauthorized payment
- **Likelihood**: Low — requires TLS compromise or local network access
- **Mitigation**: HTTPS everywhere; HSTS; token is single-use and time-limited

### 4.6 AI-Generated Code with Secrets
- **Attack**: AI assistant inadvertently includes real credentials in generated code
- **Impact**: High — secrets committed to repository become permanently exposed
- **Likelihood**: Medium — AI tools may use context containing credentials
- **Mitigation**: Pre-commit secret scanning; no production credentials in AI context; two-reviewer rule

---

## 5. Mitigations

### 5.1 Server-Side Amount Validation
- **Principle**: Never trust client-provided prices
- **Implementation**: All prices calculated server-side from product catalog; client-submitted totals are verified against server calculation; any mismatch rejects the transaction
- **Priority**: v1.0 (Day 1 requirement)

### 5.2 Idempotency Keys on All Mutations
- **Principle**: Every state-changing operation must be safely repeatable
- **Implementation**: Client generates UUID idempotency key; server deduplicates within 24-hour window; repeated requests return original response
- **Priority**: v1.0

### 5.3 Secrets Management
- **Principle**: Secrets never in repository, never in logs, never in AI context
- **Implementation**: Environment variables for runtime; CI/CD secrets for deployment; 90-day rotation policy; automated scanning with pre-commit hooks
- **Priority**: v1.0

### 5.4 CSP Headers on Checkout
- **Principle**: Prevent XSS and unauthorized script execution
- **Implementation**: `Content-Security-Policy: default-src 'self'; script-src 'self' https://pay.google.com; frame-src https://pay.google.com`
- **Priority**: v1.0

### 5.5 HTTPS Everywhere
- **Principle**: All data in transit is encrypted
- **Implementation**: TLS 1.2+ required; HSTS enabled; HTTP redirects to HTTPS; no mixed content
- **Priority**: v1.0

### 5.6 Token Transience
- **Principle**: Process payment tokens immediately, never persist them
- **Implementation**: Token received → processed → discarded in single request lifecycle; no database storage of raw tokens; tokens are single-use
- **Priority**: v1.0

### 5.7 Two-Reviewer Rule for Auth/Payment Changes
- **Principle**: Security-sensitive code requires additional human oversight
- **Implementation**: CODEOWNERS enforces two approvals for `src/backend/services/payment*`, `src/backend/services/auth*`, and security configuration files
- **Priority**: v1.0

### 5.8 No AI Tool Receives Production Credentials
- **Principle**: AI assistants operate in sandboxed environments only
- **Implementation**: MCP server configuration explicitly excludes production secrets; AI tools use TEST credentials only; production deployment requires human approval
- **Priority**: v1.0

---

## 6. PCI Compliance

### Scope: SAQ-A (Self-Assessment Questionnaire A)

Our platform qualifies for the simplest PCI DSS compliance level because:

1. **No raw card data**: We never see, process, or store raw card numbers (PAN)
2. **Google Pay tokenization**: All card tokenization happens client-side within Google's secure iframe/SDK
3. **Encrypted tokens only**: Our servers receive only encrypted payment tokens that are:
   - Encrypted by Google's infrastructure
   - Single-use (cannot be replayed)
   - Time-limited (expire after short window)
4. **Tokens never stored**: Payment tokens are processed transiently and immediately discarded after the payment processor acknowledges the charge

### Implications

- No need for network segmentation of cardholder data environment (CDE)
- No PCI-scoped infrastructure to maintain
- Annual SAQ-A self-assessment is sufficient
- Must still protect the integrity of our checkout page (prevent script injection that could redirect to phishing)

---

## 7. Secure Development Practices

### 7.1 AI-Generated Code Security Review
- All AI-generated code touching security-sensitive paths requires **two human reviewers**
- Security-sensitive paths include: authentication, authorization, payment processing, token handling, cryptographic operations
- Reviewers must verify: no hardcoded secrets, proper input validation, correct error handling (no information leakage)

### 7.2 Automated Secret Scanning
- Pre-commit hooks scan for patterns matching API keys, tokens, passwords
- CI pipeline runs secret detection as first step (before any code executes)
- Tools: git-secrets, truffleHog, or equivalent
- False positives documented and allowlisted with justification

### 7.3 Dependency Vulnerability Scanning
- Dependabot enabled for all dependency types (npm, pip)
- Critical/High vulnerabilities must be patched within 7 days
- Medium vulnerabilities patched within 30 days
- Automated PRs for security updates

### 7.4 Security Review Gate
- No deployment to non-TEST environments without security review
- Security review checklist:
  - [ ] No new secrets introduced without secrets management
  - [ ] Input validation on all new endpoints
  - [ ] Authentication/authorization checks present
  - [ ] Error messages don't leak internal details
  - [ ] Dependencies scanned and clean

---

## References

- **ADR-004**: Security Approach architectural decision
- **Master Plan Section 18**: Security requirements and threat modeling
- **Production Readiness Checklist**: Pre-deployment security verification
