# Contributing to Google Pay AI Checkout Platform

Thank you for considering contributing to this project. This document outlines the development workflow, standards, and processes.

> **Reference**: Master Plan Section 13 (Repository Governance)

## Development Workflow

### Prerequisites

- Node.js 18+
- Python 3.11+ (for backend development, v1.2+)
- Git 2.30+
- Make (for task runner)

### Setup

```bash
git clone <repository-url>
cd google-pay-ai-checkout
make setup
```

### Daily Development

1. Create a feature branch from `main`
2. Make changes following the coding standards below
3. Run `make lint` and `make format` before committing
4. Commit using Conventional Commits format
5. Open a Pull Request targeting `main`

## Branch Strategy

| Pattern | Purpose | Example |
|---------|---------|---------|
| `feature/<description>` | New features | `feature/dynamic-pricing` |
| `fix/<description>` | Bug fixes | `fix/cart-total-validation` |
| `docs/<description>` | Documentation changes | `docs/update-hld` |
| `infra/<description>` | Infrastructure changes | `infra/docker-setup` |
| `refactor/<description>` | Code refactoring | `refactor/pricing-module` |

**Rules:**
- No direct commits to `main`
- Branch names use kebab-case
- Delete branches after merge

## Commit Conventions

This project follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | `feat(checkout): add Google Pay button` |
| `fix` | Bug fix | `fix(pricing): correct rounding error` |
| `docs` | Documentation | `docs(adr): add ADR-011 caching strategy` |
| `refactor` | Refactoring | `refactor(services): extract pricing logic` |
| `test` | Adding tests | `test(mit): add frequency property test` |
| `infra` | Infrastructure | `infra(ci): add coverage reporting` |
| `chore` | Maintenance | `chore(deps): update eslint` |

## Pull Request Process

1. Fill out the PR template completely
2. Ensure CI passes (lint, test, docs validation)
3. Request review from appropriate team (see CODEOWNERS)
4. Address review feedback
5. Squash merge after approval

### AI-Generated Code

If your PR contains AI-generated code:
1. Complete the AI Generation Disclosure section in the PR template
2. Log the interaction in `docs/ai-log/`
3. Ensure a second AI tool has reviewed the output (Arbitration Protocol)
4. Human reviewer must understand *why* the code works, not just *that* it works

## Coding Standards

### JavaScript/TypeScript
- ESLint for linting
- Prettier for formatting
- 2-space indentation
- Single quotes
- Trailing commas

### Python (v1.2+)
- Ruff for linting and formatting
- 4-space indentation
- Type hints required
- Docstrings for public functions

### Documentation
- Markdown for all docs
- Metadata header (author, date, version, status) on formal documents
- Table of contents for documents > 3 sections
- Cross-reference related documents

## Testing Requirements

- All new features require tests
- Property-based tests for payment logic (Hypothesis/fast-check)
- Unit tests for business logic
- Integration tests for API endpoints
- AI-generated tests require human review

## Security

- Never commit secrets, API keys, or credentials
- Use environment variables for sensitive configuration
- Payment tokens are transient — never log or persist them
- Changes to auth/payment logic require two reviewers

## Questions?

Open a [GitHub Discussion](../../discussions) or file an issue using the appropriate template.
