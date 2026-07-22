# Backend — Repository Layer

> **Master Plan Reference**: Section 21, ADR-003 (SQLite initially)
> **Roadmap Version**: v1.2

## Purpose

Data persistence abstraction. Isolates business logic from storage implementation details.

## What Will Be Implemented Here

- `TransactionRepository` — CRUD for transaction records
- `AgreementRepository` — MIT agreement storage
- `AuditRepository` — Audit log persistence
- Database migration utilities (SQLite → Postgres path)

## Implementation Notes

Not implemented in v1.0. SQLite for v1.2, Postgres migration planned for v2.
