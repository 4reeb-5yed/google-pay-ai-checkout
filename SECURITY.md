# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| v1.x    | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email the security team at: 4reeb-5yed@users.noreply.github.com
3. Include a detailed description of the vulnerability
4. Include steps to reproduce if possible

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Resolution**: Depends on severity

## Security Practices

This project follows these security practices:
- No production credentials in source control
- Payment tokens are never persisted (transient only)
- PCI SAQ-A compliance scope (no raw card data)
- Mandatory security review for auth/payment changes
- See [Security Threat Model](docs/architecture/security-threat-model.md)

## Scope

This security policy applies to:
- The Google Pay AI Checkout codebase
- Configuration templates (not deployed credentials)
- Documentation containing architectural decisions

Out of scope:
- Google Pay API infrastructure (report to Google)
- Third-party dependencies (report to upstream)
