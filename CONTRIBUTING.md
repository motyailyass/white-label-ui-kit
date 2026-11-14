# Contributing

Thanks for helping. This repository ships a white-label UI kit used across
multiple brands, so changes are judged on consistency and longevity, not only on
whether they work once.

## Before you build

- Open an issue before anything larger than a bug fix.
- Read [AGENTS.md](AGENTS.md) and `docs/standards/` before touching shared code.
- `typescript/nextjs/starterkit/dashboard/src` is the canonical shared source.
  Shared files are mirrored with `pnpm run sync:shared`; never edit only the
  mirrored copy in `website/src` or `typescript/vite/starterkit/dashboard/src`.
- Never commit secrets, tokens, or `.env` files.

## Local checks

Run the smallest check first, from the application directory:

```bash
pnpm lint
pnpm type-check
pnpm test
```

Before opening a pull request, run the full gate from the repository root:

```bash
pnpm run sync:shared:check
pnpm run check:shadows
pnpm run check:client
pnpm run format:check
```

The complete command list and quality rules live in [AGENTS.md](AGENTS.md).

## Tests

Every bug fix ships with a regression test. Primitives need a Vitest/React
Testing Library test; overlays and layout behavior need a Playwright test.
Accessible queries only — no `data-testid` unless no role exists.

## Sign-off (DCO)

This project uses the [Developer Certificate of Origin 1.1](https://developercertificate.org).
Sign every commit:

```bash
git commit -s
```

That appends:

```text
Signed-off-by: Your Name <you@example.com>
```

The sign-off certifies that you wrote the contribution or otherwise have the
right to submit it under this project's license.

## License of contributions

Inbound contributions are licensed under the MIT License (see [LICENSE](LICENSE)).
By signing off you agree to that inbound-equals-outbound model.

## Pro code

Premium and Pro components are not in this repository and are governed by
separate commercial terms. Do not open pull requests containing Pro code.

## Conduct

Be direct about code and generous about people. Reviews discuss the change, not
the author.
