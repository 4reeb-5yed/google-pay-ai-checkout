---
author: Bootstrap_System
date: 2026-07-23
version: 1.0.0
status: Accepted
master_plan_ref: Section 4, Section 5
---

# ADR-003: AI Tool Orchestration

## Context

This project uses multiple AI tools, each with different strengths. Using one tool for everything means using the wrong tool for most tasks. A coordination strategy prevents tool conflicts and ensures human oversight.

## Decision

### Tool-to-Responsibility Matrix

| Tool | Responsibility | Why |
|------|---------------|-----|
| Antigravity | Google Pay MCP integration, codelab implementation | First-party MCP wiring for Google Pay API |
| Kiro | Architecture, planning, documentation, design | Strong structural context for whole-repo reasoning |
| OpenHands | Backend implementation, autonomous coding | Multi-step coding with test-run feedback loops |
| ChatGPT | Research, reviews, design critique | External second opinion, not repo-connected |
| GitHub Copilot | In-line completions | Low-friction boilerplate only |

### Governance Rules

1. **No AI tool has merge rights** — all merges require human approval
2. **Arbitration Protocol** — when Kiro and ChatGPT disagree on architecture, the disagreement is logged, and the human decides
3. **Two-reviewer rule** — any AI-generated code touching auth, payments, or secrets requires a second human reviewer
4. **No production credentials** — AI tools never receive real API keys or customer data
5. **AI Interaction Log** — every non-trivial AI-generated change is logged in `docs/ai-log/`

### Verification Process

Every AI-generated output is verified against:
1. Does it match the written spec/prompt objective?
2. Does it pass tests?
3. Does it introduce unspecified dependencies or endpoints?
4. Is it consistent with existing architecture?

## Consequences

### Positive
- Each tool used for its strengths
- Disagreements are surfaced, not silently resolved
- Human always has final decision authority
- Audit trail exists for all AI-assisted work

### Negative
- Multi-tool workflow has higher coordination overhead
- Developers must know which tool to use for which task
- AI Interaction Log adds documentation burden

## References

- Master Plan Section 4 (AI Tool Responsibility Matrix)
- Master Plan Section 5 (Prompt Engineering Workflow)
- Master Plan Section 3 (AI-Assisted Software Engineering Workflow)
