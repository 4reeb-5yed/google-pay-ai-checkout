# Frontend — Checkout

> **Master Plan Reference**: Section 2 (v1.0 Scope), Section 22 (Repository Structure)
> **Roadmap Version**: v1.0

## Purpose

This directory contains the Google Pay button integration and checkout UI. It is the primary deliverable for the v1.0 internship assignment (Google Pay API Codelab).

## What Will Be Implemented Here

- Google Pay button component (`isReadyToPay`, button rendering)
- Payment sheet configuration (`PaymentDataRequest`)
- Payment authorization callback handling (`onPaymentAuthorized`)
- Cart/product display UI
- Dynamic pricing display (based on `cardFundingSource`)
- Express guest checkout flow
- MIT (Merchant-Initiated Transaction) UI components

## Technology

- HTML5, CSS3, Vanilla JavaScript (no framework for v1.0)
- Google Pay API `pay.js` library
- No build step required

## Implementation Notes

This directory is currently empty (placeholder structure). Implementation begins after the engineering foundation (v1.1) is complete, using Antigravity connected to the Google Pay MCP Server.
