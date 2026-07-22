# Tests — Integration

> **Master Plan Reference**: Section 14
> **Tooling**: pytest + httpx (Python)
> **Roadmap Version**: v1.2+

## Purpose

Integration tests that verify component interactions with real (but local) dependencies.

## What Will Be Tested

- API endpoint contracts (FastAPI + test client)
- Database operations (file-based SQLite)
- MCP server communication (mock MCP server)
- Payment flow end-to-end within backend

## Guidelines

- Use file-based SQLite (not in-memory) for realistic I/O
- Mock external APIs (Google Pay, MCP) with local stubs
- Tests should complete in < 30 seconds total
