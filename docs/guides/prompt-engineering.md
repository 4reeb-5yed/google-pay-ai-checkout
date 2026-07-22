---
author: Bootstrap_System
date: 2026-07-23
version: 1.0.0
status: Draft
master_plan_ref: Section 5
---

# Prompt Engineering Guide

## 1. Philosophy

Prompts are **engineering artifacts**, not throwaway messages.

- They are written **before** generation, not reverse-engineered after.
- They are versioned, reviewed, and stored alongside the code they produce.
- A well-crafted prompt with poor context will underperform a mediocre prompt with excellent context (see AI Development Workflow Guide for context-first philosophy).

Prompts encode intent. The AI Interaction Log preserves them for reproducibility and learning.

## 2. Definition of Ready

A task is ready for AI-assisted generation when:

- [ ] Objective is stated in one sentence
- [ ] Acceptance criteria are listed explicitly
- [ ] Relevant ADRs are linked
- [ ] MCP documentation has been retrieved (for API work)
- [ ] Existing code in the affected area has been reviewed
- [ ] Constraints and anti-patterns are documented

If any item is missing, gather context before engaging the AI tool.

## 3. Definition of Done

AI-generated work is considered done when:

- [ ] All automated tests pass
- [ ] Human review is complete
- [ ] AI Interaction Log entry exists with all required fields
- [ ] Manual edits are documented with reasons
- [ ] Lessons learned are recorded for future prompt improvement
- [ ] Code meets project style and security standards

## 4. Prompt Structure Template

Use this template when constructing prompts for any AI tool:

```markdown
## Objective
[One sentence describing what to build]

## Context
- Relevant ADRs: [links]
- Existing code: [file paths]
- MCP docs retrieved: [topics]

## Constraints
- [Technology constraints]
- [Security constraints]
- [Scope boundaries]

## Acceptance Criteria
1. [Criterion 1]
2. [Criterion 2]

## Anti-patterns to Avoid
- [Common AI failure mode for this task]
```

### Template Usage Notes

- **Objective:** Keep it to one sentence. If you need more, the task is too large — split it.
- **Context:** More context = better output. Include file paths, not just descriptions.
- **Constraints:** Be explicit about what the AI should NOT do.
- **Acceptance Criteria:** These become your test cases.
- **Anti-patterns:** Learn from past AI failures and encode them here.

## 5. Common Patterns

### Checkout UI Generation

```markdown
## Objective
Generate the Google Pay button component with dynamic pricing display.

## Context
- ADR-008 (Payment Architecture), ADR-009 (Dynamic Pricing)
- MCP docs: PaymentRequest schema, ButtonOptions
- Existing: src/frontend/checkout/

## Constraints
- Must use Google Pay API v2.0
- No third-party payment libraries
- Accessible (WCAG 2.1 AA)

## Acceptance Criteria
1. Button renders in supported browsers
2. Price updates reflect dynamic pricing engine output
3. PaymentRequest uses correct merchant configuration
```

### API Endpoint Creation

```markdown
## Objective
Create the POST /api/orders endpoint for order submission.

## Context
- ADR-001 (Technology Stack — FastAPI)
- Existing: src/backend/api/, src/backend/models/
- MCP docs: Transaction processing flow

## Constraints
- FastAPI with Pydantic validation
- SQLite persistence (v1.2 scope)
- Input sanitization required

## Acceptance Criteria
1. Validates request body against Order schema
2. Persists order record
3. Returns 201 with order ID
4. Returns 422 for invalid input
```

### Test Generation

```markdown
## Objective
Generate unit tests for the dynamic pricing calculation module.

## Context
- ADR-002 (Testing Strategy)
- Existing: src/backend/services/pricing.py
- Test patterns: tests/unit/pricing/

## Constraints
- pytest framework
- Property-based tests for calculation boundaries
- No external API calls (mock MCP responses)

## Acceptance Criteria
1. Covers normal, boundary, and error cases
2. Property tests verify pricing invariants
3. All tests pass in CI
```

### Documentation Generation

```markdown
## Objective
Generate API documentation for the order management endpoints.

## Context
- ADR-007 (Documentation First)
- Existing endpoints in src/backend/api/
- OpenAPI schema from FastAPI auto-generation

## Constraints
- Markdown format for docs/ directory
- Include request/response examples
- Reference relevant ADRs

## Acceptance Criteria
1. All endpoints documented with method, path, params
2. Example requests and responses included
3. Error codes and their meanings listed
```

## 6. Anti-Patterns

### Don't: Use Prompts Without Context

**Bad:** "Write a Google Pay integration"
**Good:** "Generate the PaymentRequest configuration using the attached MCP schema for Google Pay API v2.0, following ADR-008 constraints."

### Don't: Accept Output Without Review

Every AI-generated artifact must be reviewed by a human. AI tools can:
- Hallucinate API endpoints that don't exist
- Use deprecated methods from training data
- Introduce subtle security vulnerabilities
- Add unrequested features that expand scope

### Don't: Let AI Add Unrequested Features

If the AI generates code beyond the stated objective, remove it. Scope creep from AI is still scope creep. Document what was removed and why in the AI Interaction Log.

### Don't: Skip MCP Grounding for API Work

Any code that touches Google Pay APIs must be grounded in MCP-retrieved documentation. Never trust the AI's "memory" of an API surface — it may be outdated or fabricated.

---

## References

- Master Plan: Section 5
- [AI Development Workflow Guide](./ai-development-workflow.md)
- [AI Interaction Log Format](./ai-development-workflow.md#5-ai-interaction-log-format)
