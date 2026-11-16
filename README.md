<div align="center">

# White Label UI Kit

**Your product. Your brand. A stronger starting point.**

A white-label React UI foundation for dashboards and websites. One shared core, Next.js and Vite hosts, first-class RTL, and no required kit badge.

[![CI](https://github.com/motyailyass/white-label-ui-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/motyailyass/white-label-ui-kit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-202521?style=flat-square)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-202521?style=flat-square)](https://react.dev)
[![RTL ready](https://img.shields.io/badge/RTL-supported-202521?style=flat-square)](docs/standards/RTL_AND_I18N.md)

**[Live gallery](https://motyailyass.github.io/white-label-ui-kit/gallery/)** · **[Documentation](https://motyailyass.github.io/white-label-ui-kit/docs.html)** · **[CLI status](https://motyailyass.github.io/white-label-ui-kit/cli.html)** · **[Issues](https://github.com/motyailyass/white-label-ui-kit/issues)**

**Early development.** The gallery is live; the CLI, npm package, and premium offerings are not released.

</div>

---

## See it, not a screenshot

The gallery runs the real kit: 51 mounted component pages with working keyboard behavior, theme switching, and English, French, and Arabic UI. Change direction to RTL and watch the layout, icons, and typography respond.

**[Open the live gallery →](https://motyailyass.github.io/white-label-ui-kit/gallery/)**

## What you get today

| | |
| --- | --- |
| **55 UI primitives** | Buttons, inputs, selects, dialogs, menus, tables, charts, and more — authored in-house, no headless dependency |
| **51 component galleries** | Every primitive mounted with variants, states, and controls you can operate |
| **4 dashboard layouts** | Classic, dual-sidebar, three-column inspector, and a layout playground |
| **1 website template** | Tokyo landing template composed from the same primitives |
| **Next.js + Vite** | One shared core, canonical in Next.js and mirrored to Vite |
| **English · French · Arabic** | Typed translations, locale-aware formatting, and derived RTL |

## Why this kit

- **Brand first, not brand locked.** Semantic tokens for color, type, spacing, radius, and motion. No visible kit badge is required.
- **Owned UI.** No Radix, Tailwind, or CSS-in-JS in the core. Markup, behavior, and CSS Modules live in this repository.
- **Clean boundaries.** Primitives take props and emit events. Routing, data fetching, forms, and i18n bindings stay outside them.
- **RTL as a foundation.** Logical CSS properties, bidi-isolated tokens, mirrored directional icons, and Arabic typography rules.
- **Accessible by contract.** Sequential headings, honest landmarks, focus traps, 48px touch targets, and reduced-motion support are engineering rules, not extras.

## Quick start

Requires **Node.js 22+** and **pnpm 12**. There is no CLI and no npm package yet — clone the repository and use a starter directly.

```bash
corepack enable
git clone https://github.com/motyailyass/white-label-ui-kit.git
cd white-label-ui-kit
pnpm install
```

Run the dashboard (canonical shared source) at [localhost:3001](http://localhost:3001):

```bash
cd typescript/nextjs/starterkit/dashboard
pnpm dev
```

Or the website at [localhost:3000](http://localhost:3000):

```bash
cd typescript/nextjs/starterkit/website
pnpm dev
```

To start a product, copy the starter directory into your repository and keep what you need. The code is MIT licensed and has no runtime dependency on this repository.

## Inside the repository

```text
typescript/
├── nextjs/starterkit/
│   ├── dashboard/src    # Canonical shared source + dashboard layouts + gallery
│   └── website/src      # Website starter (shared core mirrored in)
└── vite/starterkit/
    └── dashboard/src    # Vite mirror of the same core
site/                    # Public site: landing, docs, CLI status
scripts/                 # Shared-code sync, policy checks, Pages build
docs/standards/          # Architecture, RTL, and commercial standards
```

Shared files are edited in `dashboard/src` and mirrored outward:

```bash
pnpm run sync:shared          # mirror into website + Vite
pnpm run sync:shared:check    # fail on drift
```

## Documentation

| Document | Contents |
| --- | --- |
| **[Documentation site](https://motyailyass.github.io/white-label-ui-kit/docs.html)** | Quick start, repository map, tokens, RTL, testing, publishing |
| [Technical standards](docs/standards/TECH_STACK.md) | Stack, layers, boundaries, and quality rules |
| [RTL & i18n architecture](docs/standards/RTL_AND_I18N.md) | Locale, direction, bidi, and Arabic typography |
| [Commercial catalog](docs/standards/COMMERCIAL_AND_PRO_CATALOG.md) | Free/Pro/Enterprise tiers and packaging |
| [Contributing](CONTRIBUTING.md) | Issue-first workflow, checks, and DCO sign-off |

## Free core, paid depth

The free core is **MIT licensed** and stays that way. Paid tiers add depth for teams that need it — not permission to use the free tier.

| Offering | Scope | Status |
| --- | --- | --- |
| **Free** | Primitives, layouts, tokens, RTL, gallery, Next.js + Vite | **MIT — available now** |
| **Pro** | Advanced components, more layouts, application blocks | Planned |
| **Enterprise & agencies** | Client redistribution, multi-brand tooling, SLA and support | Planned |

Pricing, seat rules, and support commitments are not announced. The 100+ component and 10+ layout totals are whole-product roadmap targets, not counts of the free tier.

## Quality gates

Every change runs through:

```bash
pnpm lint          # per app
pnpm type-check    # per app
pnpm test          # per app: Vitest + React Testing Library
pnpm test:e2e      # dashboard and website: Playwright

pnpm run sync:shared:check   # zero drift
pnpm run check:shadows       # dashboard stays shadow-free
pnpm run check:client        # client boundaries
pnpm run format:check
```

Bug fixes ship with a regression test. Overlays and layout behavior get Playwright coverage.

## License

- [LICENSE](LICENSE) — MIT. Use, modify, and redistribute commercially; keep the notices.
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) — bundled Geist and Noto Sans Arabic fonts, Hugeicons free set.
- [TRADEMARK.md](TRADEMARK.md) — the code is MIT; the name and logo are not.
- Pro and Enterprise offerings are licensed separately under commercial terms.

## Follow the project

Star or watch the repository for releases. Have a use case, accessibility concern, or layout request? [Open an issue](https://github.com/motyailyass/white-label-ui-kit/issues).

---

**A foundation for your brand — not a brand you have to work around.**
