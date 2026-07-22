# Tests — End-to-End

> **Master Plan Reference**: Section 14
> **Tooling**: Playwright (TBD)
> **Roadmap Version**: v2+

## Purpose

Full checkout flow tests running in a real browser against the TEST environment.

## What Will Be Tested

- Complete checkout flow (button → payment sheet → authorization)
- MIT agreement creation and charge flow
- Dynamic pricing UI display
- Error handling UX
- Accessibility compliance

## Guidelines

- Run against real Google Pay TEST environment
- Browser: Chromium via Playwright
- Not run on every PR (nightly + merge to main only)
