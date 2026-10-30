---
trigger: always_on
description: Architectural layers, dependency flow, public export boundaries, and white-label purity.
---

# 10-architecture: Layer Boundaries & Purity

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. The Three Architectural Tiers
Dependency flows strictly downwards:
```
Features / App Routes (Next.js app/, layouts/)
       ↓ consumes via clean props
Core UI Primitives (components/ui/*, components/shell/*, components/icons/*)
       ↓ consumes via CSS variables
Tokens & Foundation (styles/tokens/*, i18n/*, providers/*)
```

## 2. Inviolable Boundary Rules
- **Pure Core UI**: Code inside `components/ui/` must NEVER import from `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, or application context.
- **Framework neutrality**: Never import Next.js-specific modules (`next/navigation`, `next/link`, `next/image`) inside reusable UI, layout, or icon primitives. Use host-agnostic slots (`as`, `imageComponent`).
- **Public index.ts contracts**: Components and modules must expose their public API via an `index.ts`. Deep imports bypassing the component root (e.g., `components/ui/button/button.module.css` from outside the button folder) are forbidden.
- **No silent fallbacks**: Core logic must fail loudly when required dependencies, configurations, or translations are missing, rather than masking bugs behind invisible or corrupted fallbacks.

## 3. White-Label Purity & Dependencies
- **No speculative dependencies**: Check whether native Web APIs (`Intl`, Popover, CSS Logical Properties) solve the problem before adding dependencies. Zero third-party headless UI (no Radix, no MUI, no Chakra, no Tailwind). Hugeicons is the one approved third-party exception.
- **No hardcoded demo data**: Reusable layouts (`ClassicLayout`) and primitives must accept data via props. Never embed hardcoded mock users, mock emails, or demo company names as fallback defaults.
