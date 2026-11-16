<div align="center">

# White Label UI Kit

**Your product. Your brand. A stronger starting point.**

A React UI foundation that runs in **Next.js App Router** and **Vite** from one shared core. Dashboards, website sections, themes, and RTL you own — not a component library you rent.

[![CI](https://github.com/motyailyass/white-label-ui-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/motyailyass/white-label-ui-kit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-202521?style=flat-square)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-202521?style=flat-square)](https://react.dev)
[![RTL ready](https://img.shields.io/badge/RTL-supported-202521?style=flat-square)](docs/standards/RTL_AND_I18N.md)

**[Live gallery](https://motyailyass.github.io/white-label-ui-kit/gallery/)** · **[Documentation](https://motyailyass.github.io/white-label-ui-kit/docs.html)** · **[CLI](https://motyailyass.github.io/white-label-ui-kit/cli.html)** · **[Issues](https://github.com/motyailyass/white-label-ui-kit/issues)**

**Early development.** The gallery is live and the CLI runs from GitHub. The npm package and premium offerings are not released.

</div>

---

## One foundation. Two hosts.

Pick the host your team already ships with. The primitives, tokens, providers, and layouts are identical — only the app shell differs.

| | **Next.js starter** | **Vite starter** |
| --- | --- | --- |
| **Host** | Next.js App Router, React 19 | Vite, React 19 |
| **Best for** | A full product: server rendering, routing, dashboard and website together | Fast local dev, SPA tools, embedded admin panels |
| **Ships with** | 4 dashboard layouts, 55 primitives, 51 galleries, Tokyo website template | The same core in a single dashboard overview |
| **Copy this folder** | `typescript/nextjs/starterkit/dashboard` | `typescript/vite/starterkit/dashboard` |

The connection is the **shared core**, not a runtime dependency: the same `components/ui`, `components/icons`, `providers`, `i18n`, and `styles/tokens` exist in both starters. Build a screen in Next.js and the Vite app has the same building blocks, with the same RTL rules and the same control sizing.

That core is **copied, not imported**. Each starter owns its files, its `package.json`, and its build. Nothing here imports a sibling folder or a private package — copy one starter and it runs at your path.

## Start in Next.js

Node.js 22+ and pnpm 12. This gives you a normal Next.js app in your own directory:

```bash
corepack enable
git clone https://github.com/motyailyass/white-label-ui-kit.git
cp -R white-label-ui-kit/typescript/nextjs/starterkit/dashboard ~/code/acme-dashboard
cd ~/code/acme-dashboard
pnpm install
pnpm dev        # http://localhost:3001
```

From here it is your project: rename it, delete the demo screens, change the tokens. The repository you cloned is no longer involved.

Want the marketing site starter instead? Copy `typescript/nextjs/starterkit/website` the same way — it runs at [localhost:3000](http://localhost:3000) and has the Tokyo landing template.

## Start in Vite

Same core, Vite toolchain, one dashboard overview to build from:

```bash
corepack enable
git clone https://github.com/motyailyass/white-label-ui-kit.git
cp -R white-label-ui-kit/typescript/vite/starterkit/dashboard ~/code/acme-admin
cd ~/code/acme-admin
pnpm install
pnpm dev
```

Both starters install and build on their own. No monorepo, no workspace file, no link back to this repository.

## Add one component to your app

Already have a React project? Add a primitive with one command:

```bash
npx github:motyailyass/white-label-ui-kit list
npx github:motyailyass/white-label-ui-kit add button
```

It copies plain files into your `src/`: the component, anything it imports, the icon registry, the `cn` helper, `control-sizing.ts`, and the token stylesheet if you do not have it yet. Then it tells you the two things a file copy cannot do for you — the token `@import` line and any missing packages (`@hugeicons/...`).

```bash
add <primitive> --cwd <dir>   # target another project
add <primitive> --dry-run     # show what would be copied
add <primitive> --force       # overwrite existing files
```

Your `@/*` alias is detected and imports are rewritten to match. There is no runtime dependency and no generated wrapper: what lands in your project is what you edit.

**Scope today:** primitives. A dashboard layout or a connected pattern needs the app shell, providers, and translations — those still come from copying a starter. Doing it by hand works too: copy the folder plus the same dependencies, or start from a starter and delete what you do not need.

> **CLI — available from GitHub, npm pending.** `npx github:motyailyass/white-label-ui-kit` pulls this repository directly, so there is nothing to publish yet. A package name and a guided `init` for whole starters come after the free core is stable. [CLI guide →](https://motyailyass.github.io/white-label-ui-kit/cli.html)

## Why teams pick it

- **Launch-looking UI on day one.** Dashboard shells, tables, charts, dialogs, and forms that already look designed — then you change the tokens and it looks like you.
- **RTL is not a retrofit.** Arabic is a first-class locale: logical CSS everywhere, mirrored directional icons, bidi-isolated numbers and IDs, Arabic typography with the line height diacritics need. Switch the language in the live gallery and watch it hold.
- **Nothing to license at runtime.** No Radix, Tailwind, or CSS-in-JS in the core. No kit badge, no telemetry, no account. The files you copy are the product.
- **One design language, many products.** Semantic tokens per product preset: the dashboard stays compact and shadow-free, the website goes comfortable and editorial. Both from the same primitives.
- **Accessibility as a rule, not a checklist.** Heading order, honest landmarks, focus traps, 48px touch targets, and reduced-motion fallbacks are enforced by tests and review.

## What you get today

| | |
| --- | --- |
| **55 UI primitives** | Buttons, inputs, selects, dialogs, menus, tables, charts, and more — authored in-house |
| **51 component galleries** | Every primitive mounted with variants, states, and controls you can operate |
| **4 dashboard layouts** | Classic, dual-sidebar, three-column inspector, and a layout playground |
| **1 website template** | Tokyo landing template composed from the same primitives |
| **English · French · Arabic** | Typed translations, locale-aware formatting, and derived RTL |

Roadmap totals of 100+ components and 10+ layouts describe the whole product, not the free tier.

## See it, not a screenshot

The gallery is the real kit: 51 mounted pages with working keyboard behavior, theme switching, and English, French, and Arabic UI.

**[Open the live gallery →](https://motyailyass.github.io/white-label-ui-kit/gallery/)**

## Inside the repository

You only need this map if you are reading or contributing to the source. Once you copy a starter, this structure is not part of your app.

```text
typescript/
├── nextjs/starterkit/
│   ├── dashboard/src    # canonical core + dashboard layouts + gallery
│   └── website/src      # website starter, shared core mirrored in
└── vite/starterkit/
    └── dashboard/src    # Vite host of the same core
cli/                     # add command: copies primitives into an existing app
site/                    # landing, docs, CLI pages
scripts/                 # shared-core sync, policy checks, Pages build
docs/standards/          # architecture, RTL, commercial standards
```

Updating the core is a maintainer job, not a user step. Shared files are edited once in `dashboard/src` and mirrored:

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

Pricing, seat rules, and support commitments are not announced.

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
