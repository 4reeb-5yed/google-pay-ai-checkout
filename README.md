# Google Pay AI Checkout Platform

An AI-native checkout platform integrating Google Pay for web-based payment processing, built using Context Engineering and Model Context Protocol (MCP) for grounded AI-assisted development.

## Vision

A production-grade, AI-native checkout system that demonstrates how modern AI tools — grounded in live, authoritative documentation via MCP — can accelerate payment integration development without compromising security or correctness.

## Technology Stack

| Layer | Technology | Version Introduced |
|-------|-----------|-------------------|
| Frontend | HTML5, CSS3, JavaScript | v1.0 |
| Backend | FastAPI (Python) | v1.2 |
| Database | SQLite → PostgreSQL | v1.2 → v2 |
| AI Tools | Antigravity, Kiro, OpenHands | v1.0 |
| MCP | Google Pay MCP Server | v1.0 |
| Testing | Hypothesis, fast-check | v1.0 |
| Infrastructure | Docker, GitHub Actions | v1.2 |

## Repository Structure

```
├── docs/                    # Engineering documentation
│   ├── architecture/        # HLD, ADRs, strategies
│   ├── requirements/        # Vision, PRD, SRS
│   ├── guides/              # Development workflow guides
│   ├── templates/           # Document templates
│   ├── governance/          # Standards and policies
│   └── planning/            # Roadmap, risk register
├── src/
│   ├── frontend/checkout/   # Google Pay button + checkout UI (v1.0)
│   └── backend/             # FastAPI service layer (v1.2+)
├── tests/                   # Test suites
│   ├── unit/                # Unit tests by module
│   ├── integration/         # Integration tests
│   ├── e2e/                 # End-to-end tests (v2+)
│   └── property/            # Property-based tests
├── assets/                  # Static resources
├── infrastructure/          # Docker, CI/CD configs
├── config/                  # Tool and environment configuration
└── scripts/                 # Development utility scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ (frontend development)
- Python 3.11+ (backend development, v1.2+)
- Git 2.30+

### Setup

```bash
make setup
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development workflow.

## Current Status

**Version**: v1.1 (Production Foundation)
**Environment**: TEST only (no real transactions)

## Documentation

- [Vision](docs/requirements/vision.md)
- [Product Requirements](docs/requirements/prd.md)
- [Software Requirements](docs/requirements/srs.md)
- [Architecture (HLD)](docs/architecture/hld.md)
- [Testing Strategy](docs/architecture/testing-strategy.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Roadmap](docs/planning/roadmap.md)

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## Governance

This project follows Documentation-First Development with mandatory Human-in-the-Loop review for all AI-generated code. See [Governance](docs/governance/governance.md) for full policies.
