# Security Policy

## Supported Versions

Security fixes are applied to the latest version on the `main` branch of this repository.

| Version | Supported |
| ------- | --------- |
| latest on `main` | yes |
| older tags / forks | best effort |

## Reporting a Vulnerability

**Please do not open public GitHub issues for security vulnerabilities.**

Report security issues privately so they can be addressed before public disclosure.

**Contact:** [contact@arnobmahmud.com](mailto:contact@arnobmahmud.com)

Include as much detail as possible:

- Description of the vulnerability and potential impact
- Steps to reproduce
- Affected routes, components, or configuration
- Proof-of-concept (if available)
- Your suggested fix (optional)

## Response Expectations

- **Acknowledgment:** within 5 business days
- **Initial assessment:** within 10 business days
- **Fix or mitigation plan:** shared when confirmed, depending on severity

## Scope Notes

This project exposes public API routes (`/api/chat`, `/api/history`, `/api/feedback`). The `/api/seed` endpoint requires `SEED_SECRET` (Bearer or `x-seed-secret` header). Report abuse vectors related to open CORS or missing rate limits as well.

Thank you for helping keep this project and its users safe.
