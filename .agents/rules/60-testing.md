---
trigger: glob
globs: "**/*.test.*, **/*.spec.*, **/e2e/**"
description: Dual-tier testing guidelines, accessible query selection, userEvent, and regression coverage.
---

# 60-testing: Unit, Accessibility & Regression Testing

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. Dual-Tier Testing Strategy
- **Unit & Component (Vitest + React Testing Library)**: Test behavioral contracts, keyboard navigation, public API props, and ARIA attributes in a JSDOM environment.
- **End-to-End (Playwright)**: Test full browser workflows, real overlay rendering, focus trapping, and visual regression under both LTR and RTL.

## 2. Testing Library Best Practices
- **Accessible query priority**: Query elements as a user would:
  1. `getByRole` (with `name`, `pressed`, `checked`, `current`).
  2. `getByLabelText` / `getByPlaceholderText`.
  3. `getByText`.
  4. Avoid `getByTestId` unless no accessible role or label exists.
- **User interactions**: Prefer `@testing-library/user-event` over raw `fireEvent` for realistic event firing sequences.

## 3. Regression Coverage Discipline
- **One test per bug fix**: Any bug fixed during maintenance must have an accompanying automated test verifying that the issue cannot regress.
- **RTL & Bidi assertions**: When adding or updating components, test that direction attributes (`dir="rtl"`, `data-mirror-rtl="true"`, `data-bidi="isolate"`) render and function correctly.

