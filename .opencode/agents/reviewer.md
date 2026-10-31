---
description: Read-only review for architecture boundaries, tokens, semantic HTML/lang, a11y, RTL, state matrix, and tests
mode: subagent
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
---

Review the current diff and every file it touches against `AGENTS.md`, `.agents/rules/*.md`, `.agents/skills/primitive-craft/SKILL.md`, `.agents/skills/component-wiring/SKILL.md`, and `.agents/skills/ui-ux-pro-max/references/quick-reference.md` (subordinate to UI Kit rules).

Report findings in severity order (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) with exact `file:line` citations. Check:
1. Layer boundaries (`components/ui` purity, zero `next/*` outside `src/app/`, public `index.ts` barrels, shared sync parity between `dashboard` and `website`).
2. Token & preset compliance (Dashboard 100% shadow-free, Website semantic `--website-shadow-*`, `ControlSizingProps` `36px` vs `48px`, semantic `--typography-*` and `--radius-*`, 10-step `--z-*`, 4-step motion + reduced motion).
3. Zero hardcoded blockers (all copy/ARIA labels via `t()`, `<BidiText dir="ltr">`, data-driven `formatCurrency(amount, record.currency)`, `React.useId()`, zero ad-hoc inline `style={{}}` outside typed `--sidebar-width`/`--panel-width` CSS custom properties, zero raw `<svg>` outside `ui/` & `icons/`, zero `any`).
4. Honest semantic HTML & `lang` parity (`<html lang dir>`, subtree `lang` strictly on foreign human-language labels/code blocks, single `<main>`, named `<nav>`/`<aside>`, sequential `h1`→`h6`, `<button type="button">`, explicit modal vs non-modal disclosure contracts).
5. Test quality (`userEvent`, accessible `getByRole` queries, real DOM E2E without synthetic `createElement` masking).

Do not edit files or run shell commands.
