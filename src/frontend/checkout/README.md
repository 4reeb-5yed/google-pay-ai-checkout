# Frontend — Checkout v1.0

> **Master Plan Reference**: Section 2 (v1.0 Scope), Section 22 (Repository Structure)  
> **Roadmap Version**: v1.0  
> **Environment**: TEST only

## Purpose

This directory contains the complete Google Pay v1.0 checkout implementation built using Vanilla HTML5, CSS3, and JavaScript (no framework, no build step required). It satisfies all requirements of the Google Pay API Codelab and extension features.

## Implemented Components & File Structure

```
src/frontend/checkout/
├── index.html          # Main web application page with responsive tab navigation
├── styles.css          # Modern dark-mode styling, glassmorphism UI, & responsive layout
├── google-pay.js       # Google Pay JS API wrapper (isReadyToPay, PaymentDataRequest, callbacks)
├── checkout.js         # Cart state manager & Dynamic Pricing engine (cardFundingSource rules)
├── mit.js              # Merchant-Initiated Transactions (billing agreements & idempotency keys)
├── ai-monitoring.js    # AI Monitoring Pipeline (MCP metrics telemetry & anomaly alerting)
└── README.md           # Documentation
```

## Feature Breakdown

### 1. Google Pay Button & Payment Sheet (`google-pay.js`)
- Button rendering gated by `isReadyToPay()` resolution.
- Allowed payment methods: `CARD` (`PAN_ONLY`, `CRYPTOGRAM_3DS`).
- Allowed networks: `VISA`, `MASTERCARD`, `AMEX`, `DISCOVER`.
- `PaymentDataRequest` constructed dynamically from active cart items.
- `onPaymentAuthorized` callback handles payment token logging and extracts `cardFundingSource`.

### 2. Express Guest Checkout (`checkout.js` & `index.html`)
- Zero account creation required.
- Streamlined 1-click payment flow from cart to payment sheet.

### 3. Merchant-Initiated Transactions (MIT) (`mit.js`)
- UI & logic to create recurring billing agreements.
- Generates cryptographically unique idempotency keys (`mit_ik_<timestamp>_<rand>`).
- Prevents duplicate charge execution when an idempotency key is reused.
- Allows canceling active agreements and tracks in-memory charge history.

### 4. Dynamic Pricing Engine (`checkout.js`)
- Evaluates `cardFundingSource` (`CREDIT`, `DEBIT`, `PREPAID`).
- Applied rules:
  - `CREDIT`: +2.5% surcharge
  - `DEBIT`: -1.5% discount
  - `PREPAID`: -1.0% discount
- Displays clear itemized breakdown before final payment authorization.

### 5. AI Monitoring Pipeline (`ai-monitoring.js`)
- Periodically queries Google Pay MCP server telemetry tools (`list_google_pay_integrations`, `query_merchant_performance`, `query_merchant_error_metrics`).
- Evaluates anomaly detection rules (error rate > 5%, p95 latency > 3000ms, unverified status).
- Logs actionable human-review alerts into the live UI console.

## How to Run

Because this application uses Vanilla HTML5 and standard web standards, no build step or package manager compilation is needed:

1. **Option A (Static HTTP Server)**:
   ```bash
   npx http-server src/frontend/checkout -p 8080
   ```
   Open `http://localhost:8080` in Chrome/Safari/Edge.

2. **Option B (Direct Browser Open)**:
   Open `src/frontend/checkout/index.html` directly in your browser.
