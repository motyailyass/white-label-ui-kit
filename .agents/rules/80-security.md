---
trigger: always_on
description: Security rules, zero secrets, XSS prevention, and dependency audit standards.
---

# 80-security: Secure Defaults & Trust Boundaries

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. Zero Secrets in Source
- **No hardcoded credentials**: Never commit API keys, tokens, auth secrets, or internal service endpoints to source files or documentation.
- **Environment isolation**: Secrets must live in `.env.local` (git-ignored) and pass through strict schema validation (e.g., Zod) before runtime consumption.
- **Client exposure guard**: Never prefix secret keys with `NEXT_PUBLIC_` or `VITE_`.

## 2. Injection & XSS Prevention
- **No unsanitized HTML**: Never use `dangerouslySetInnerHTML` with dynamic user input. For rich-text rendering, sanitize through a trusted sanitizer (DOMPurify).
- **Target rel protection**: Any anchor with `target="_blank"` must automatically include `rel="noopener noreferrer"` to prevent tab-napping.
- **Open redirect prevention**: Validate all external URL redirects against an explicit domain whitelist.

## 3. Dependency & Supply Chain Discipline
- **Approved licenses only**: Every added package must carry an OSI-approved permissive license (MIT, Apache-2.0, BSD-3-Clause). Copyleft licenses (GPL, AGPL) are prohibited.
- **Zero unneeded dependencies**: Check whether native Web APIs (`Intl`, Popover, CSS Logical Properties) can solve the problem before adding a dependency.

