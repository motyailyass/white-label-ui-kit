---
description: Read-only review for boundaries, a11y, RTL, state matrix, and tests
mode: subagent
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
---

Review the current diff and the files it touches against `.agents/rules/*` and `.agents/skills/primitive-craft/SKILL.md`.
Query `.agents/skills/ui-ux-pro-max/scripts/search.py` (--domain ux and --domain icons only, never --persist) for UX and accessibility edge cases.
Report findings in severity order with file:line. Check layer boundaries, pure UI, inline styles, RTL, keyboard/ARIA, and missing tests. Do not edit or run commands.

