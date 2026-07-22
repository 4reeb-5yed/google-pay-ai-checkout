# Software Metrics

> **Master Plan Reference**: Section 12

This directory tracks software metrics for the Google Pay AI Checkout Platform, updated weekly.

## Tracked Metrics

| Metric | Description | Frequency |
|--------|-------------|-----------|
| Commits (AI vs hand-written) | Percentage from AI Interaction Log | Weekly |
| Architecture diagrams maintained | Count of current diagrams | Weekly |
| Documents produced | Count in docs/ | Weekly |
| AI prompts logged | Count in docs/ai-log/ | Weekly |
| MCP documentation searches | Count of MCP queries | Weekly |
| Lines of code (by layer) | From src/ tree | Weekly (from v1.2) |
| Features shipped vs planned | Per roadmap version | Per milestone |
| Test cases (count, pass rate, coverage) | From CI reports | Per PR |

## Current Status

Metrics collection begins with v1.0 implementation. This directory currently contains only this README as a placeholder for the metrics tracking infrastructure.

## Automation

Metrics will be collected via:
- Git log analysis (commits)
- CI coverage reports (test metrics)
- Manual count (documentation, AI prompts)
