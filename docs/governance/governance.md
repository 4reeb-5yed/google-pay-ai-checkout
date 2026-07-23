---
author: Areeb Syed
date: 2026-07-23
version: 1.0.0
status: Draft
master_plan_ref: Section 3, Section 13
---

# Governance Standards — Google Pay AI Checkout Platform

## Table of Contents

- [1. Code Review Standards](#1-code-review-standards)
- [2. Human-in-the-Loop Gates](#2-human-in-the-loop-gates)
- [3. AI Tool Usage Policies](#3-ai-tool-usage-policies)
- [4. Approval Workflows](#4-approval-workflows)
- [5. Repository Rules](#5-repository-rules)
- [References](#references)

---

## 1. Code Review Standards

### Minimum Review Requirements

- **All code** requires at minimum **one human reviewer** before merge.
- **Auth, payment, and secrets changes** require **two human reviewers**.
- **AI-generated code** receives the same scrutiny as hand-written code — no exceptions.

### Reviewer Expectations

- The reviewer MUST understand **WHY** the code works, not just that it runs.
- Reviewers should verify logic correctness, security implications, and adherence
  to project conventions.
- "It passes tests" is necessary but NOT sufficient for approval.

---

## 2. Human-in-the-Loop Gates

### Non-Negotiable Rules

- No AI-generated diff is merged without **human line-by-line review**.
- No AI tool has **merge rights** — only humans can approve and merge.
- **Feature owners are accountable humans**, not AI tools.
- Every AI suggestion touching **auth/payments/secrets** needs a **second human
  reviewer** (in addition to the primary reviewer).

### Accountability

- AI tools are **instruments**, not decision-makers.
- If an AI-generated change causes an incident, the human who approved the merge
  is accountable.

---

## 3. AI Tool Usage Policies

### Approved Tools

AI tools are used in accordance with **ADR-003 Responsibility Matrix**. Each tool
has defined boundaries for what it may and may not do autonomously.

### Arbitration Protocol

When AI tools **disagree** with each other or with human judgment:

1. **Log the disagreement** — capture both recommendations and reasoning.
2. **Human decides** — the final call always rests with a human.
3. **Document rationale** — record why the human chose a particular path.

### AI Interaction Log

- An **AI Interaction Log** entry is required for all non-trivial AI contributions.
- The log captures: tool used, prompt/context given, output received, human decision.
- Logs are stored in `docs/ai-log/`.

### Credential Restrictions

- **No production credentials** are ever given to AI tools.
- AI tools operate in sandboxed/test environments only.
- API keys for AI services are managed via secrets management (see Production Readiness Checklist).

---

## 4. Approval Workflows

### Pull Request Requirements

Every PR requires:

1. **Passing CI** — all tests, linting, and build checks must pass.
2. **Human review** per `CODEOWNERS` rules.
3. **AI Interaction Log entry** — if the PR contains AI-generated code.

### Elevated Approval

- **Security-sensitive changes** (auth, payments, secrets, infrastructure) require
  **two approvals** from qualified reviewers.
- **ADR changes** require **architecture team approval** before merge.

### Merge Policy

- Squash merge to `main` for feature branches.
- Merge commit for release branches.
- No force-pushes to `main`.

---

## 5. Repository Rules

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Always deployable to TEST environment |
| `feature/*` | Feature development branches |
| `fix/*` | Bug fix branches |
| `release/*` | Release preparation (when needed) |

### Commit Conventions

All commits follow **Conventional Commits** specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

### Direct Commit Policy

- **No direct commits to `main`** — all changes go through pull requests.
- Emergency hotfixes still require at least one reviewer (expedited process).

### Releases and Versioning

- **Tagged releases** at roadmap version boundaries (v1.0, v1.1, v1.2, etc.).
- **SemVer versioning** (MAJOR.MINOR.PATCH):
  - MAJOR: Breaking changes to public APIs or payment flows.
  - MINOR: New features, non-breaking additions.
  - PATCH: Bug fixes, documentation updates.

---

## References

- [ADR-003: AI Tool Orchestration](../architecture/decisions/ADR-003-ai-tool-orchestration.md)
- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- Master Plan — Section 3 (Governance)
- Master Plan — Section 13 (Repository Strategy)
