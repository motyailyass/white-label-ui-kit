---
trigger: always_on
description: Core workflow, diff hygiene, execution discipline, and handoff standards.
---

# 00-workflow: Execution Discipline & Handoff

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. Before You Touch Code
- **Read before edit**: Read the target file and its callers to understand the call graph and boundaries.
- **Plan before acting**: Any change spanning more than two files or altering a public export requires a structured plan before execution. Never guess at dependencies or side effects.
- **One agent per file**: Do not edit files concurrently touched by another agent. Abort immediately if you detect unexpected edits.

## 2. Diff Hygiene, Canonical Sync & Surgical Precision
- **Surgical diffs**: Change only what is strictly required to satisfy the goal. Do not reformat unrelated code, touch untouched files, or change style preferences.
- **Root-cause focus & canonical shared ownership**: `typescript/nextjs/starterkit/dashboard/src` is the canonical source for shared directories (`components/ui`, `components/icons`, `providers`, `lib`, `styles/tokens`, shared `i18n` core, and shared `components/patterns`). Author shared fixes once in `dashboard/src` and run `node scripts/sync-shared.mjs` (`pnpm run sync:shared`) to mirror cleanly to `website/src`. Never edit mirrored files exclusively in `website/src` (sync will overwrite or prune them), and never leak dashboard-only namespaces or components into `website/src`.
- **Documentation integrity**: Maintain existing comments and docstrings unless explicitly instructed otherwise.

## 3. Verification & Disclosure
- **Run the smallest check first**: Run type-check (`tsc --noEmit`) and lint (`oxlint`) before running full test suites (`vitest run`), shared sync verification (`node scripts/sync-shared.mjs --check`), and shadow policy check (`node scripts/check-dashboard-shadows.mjs`).
- **Verify or disclose**: Never claim a check you did not run. Only report commands that actually executed and exited with code 0. If a check was skipped or blocked, state it clearly.
- **No unapproved push**: Never execute `git push` without explicit user permission.
- **Handoff note**: Every task completion must state:
  1. Changed files list.
  2. Verification commands run and results.
  3. Any skipped checks or residual risks.
