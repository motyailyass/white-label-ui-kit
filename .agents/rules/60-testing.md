---
trigger: glob
globs: "**/*.test.*, **/*.spec.*, **/e2e/**"
description: Dual-tier testing guidelines, accessible queries, real DOM E2E assertions, userEvent, and RTL parity.
---

# 60-testing: Unit, Accessibility & Regression Testing

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. Dual-Tier Testing Strategy
- **Unit & Component (Vitest + React Testing Library)**: Every UI primitive, icon, provider, and pattern requires a behavioral test covering default/variant rendering, keyboard activation (`Enter`, `Space`, Arrow keys, `Escape`), disabled click suppression, `ref` forwarding, ARIA contracts, and zero `any` types.
- **End-to-End (Playwright)**: Test real rendered application routes and overlays across **both** Dashboard and Website starters—including focus trapping, nested overlay stacking, Escape dismissal, coarse-pointer 48×48px touch targets, `prefers-reduced-motion: reduce`, and full locale switching (`en` ↔ `ar` RTL).

## 2. Testing Library & Playwright Discipline
- **Accessible query priority**: Query elements as a user would:
  1. `getByRole` (with `name`, `pressed`, `checked`, `expanded`, `current`).
  2. `getByLabelText`.
  3. `getByText`.
  4. Avoid `getByTestId` or `[class*="..."]` CSS module substring selectors unless testing low-level CSS token contracts where no role exists.
- **Realistic user interactions**: Always use `@testing-library/user-event` over raw `fireEvent` for clicks, typing, and keyboard navigation.
- **Zero synthetic DOM masking in E2E**: Playwright specs must assert against **real mounted UI components and routes**—never pass E2E typography, `lang`, or z-index checks by injecting fake `document.createElement(...)` nodes into the page, and never wrap assertions in `if (await locator.isVisible())` guards that silently pass when elements disappear.

## 3. Regression, RTL & `lang` Coverage
- **One test per bug fix**: Every bug fix must ship with an automated regression test.
- **RTL, Bidi & `lang` assertions**: Assert that `<html lang="ar" dir="rtl">` updates rendered text via `t()`, directional `<Icon>` glyphs emit `data-mirror-rtl="true"`, `<BidiText>` renders `<bdi data-bidi="isolate">`, and foreign/Latin tokens carry explicit `lang` attributes.

