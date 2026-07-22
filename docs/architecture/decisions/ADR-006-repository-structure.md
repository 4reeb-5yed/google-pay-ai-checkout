---
author: Bootstrap_System
date: 2026-07-23
version: 1.0.0
status: Accepted
master_plan_ref: Section 22
---

# ADR-006: Repository Structure

## Context

The project requires a directory structure that supports incremental growth from a codelab demo (v1.0) to a multi-service platform (v4+), while being immediately usable by multiple AI development tools.

## Decision

Adopt a monorepo structure with clear separation:

```
├── docs/           # All engineering documentation
├── src/            # Application source code
│   ├── frontend/   # Client-side code (v1.0)
│   └── backend/    # Server-side code (v1.2+)
├── tests/          # All test suites
├── assets/         # Static resources
├── infrastructure/ # Deployment configs (v1.2+)
├── config/         # Tool and environment configs
└── scripts/        # Development utilities
```

### Key Design Decisions

1. **`src/` prefix**: Source code lives under `src/` to separate it from documentation, tests, and tooling. This is a deviation from the Master Plan Section 22 which uses `frontend/` and `backend/` at root level — the `src/` grouping is adopted for cleaner AI-tool context boundaries.

2. **Documentation by purpose**: `docs/` is organized by function (architecture, requirements, guides, governance, planning) rather than by document type, enabling focused context loading by AI tools.

3. **Tests parallel source**: Test directory structure mirrors source structure for discoverability.

4. **Config isolation**: Tool configurations (MCP, Antigravity, editor) live in `config/` rather than scattered across root.

## Consequences

### Positive
- Clear context boundaries for AI tools (load `docs/architecture/` for design work)
- Incremental growth path (add `src/backend/` when ready without restructuring)
- Tests discoverable by convention (source at `src/X/`, tests at `tests/unit/X/`)

### Negative
- Deviates slightly from Master Plan Section 22 flat structure (documented here as rationale)
- Root directory has more entries than minimal

## References

- Master Plan Section 22 (Future Repository Structure)
