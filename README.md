<div align="center">

# White Label UI Kit

### Your product. Your brand. A stronger starting point.

A React UI foundation for dashboards and websites—built around brand freedom, native RTL, and a shared core for Next.js and Vite.

**React + TypeScript · CSS Modules · Semantic tokens · RTL-first**

[Explore the vision](#one-foundation-multiple-starting-points) · [Roadmap](#building-in-the-open) · [Free & premium](#free-foundation-premium-depth)

**Early development — not a stable release.**

</div>

---

## Build your product, not someone else's identity

Start with a neutral foundation and make it unmistakably yours. White Label UI Kit is being built for developers shipping their own products, agencies delivering client work, and teams building larger applications.

The goal: less time rebuilding interfaces, more time building what makes your product different.

- **Your visual identity.** Semantic design tokens for color, typography, spacing, density, radii, and elevation.
- **Your application architecture.** Pure React primitives, separate from routing, business logic, forms, and server state.
- **Your audience.** Arabic, English, and French are the initial localization targets, with RTL considered from the beginning.
- **Your starting point.** Dashboard, website, or both; Next.js or Vite.

No required visible kit badge is intended. Applicable license and third-party notices must still be preserved.

## One foundation. Multiple starting points.

| Choose your host | Choose your project | Make it yours |
| --- | --- | --- |
| Next.js | Dashboard | Brand tokens and theme |
| Vite | Website | Layout and navigation |
| Either framework | Dashboard + website | Locale and direction |

**Planned CLI experience:** one command opens a setup flow to select a framework, project type, and starting layout. The CLI is not released; there is no public installer command yet.

Reusable UI is intended to share one React foundation across both hosts. Framework-specific integration belongs at the application boundary—not inside reusable primitives.

## A catalog built to grow

The full product roadmap targets:

- **100+ UI components:** a broad catalog spanning foundational controls and advanced interfaces.
- **10+ dashboard layouts:** multiple starting structures for different application needs.
- **Website starters and templates:** ready-to-adapt foundations for product and business websites.
- **Free and premium collections:** a useful public foundation, with additional depth for professional teams.

**These are roadmap targets, not a claim of shipped inventory.** A directory or scaffold does not mean a component is complete, tested, or release-ready.

## Architecture with intention

| Principle | Approach |
| --- | --- |
| Owned UI | Internally authored React markup, styles, and behavior; no third-party UI/headless runtime in core primitives |
| Native styling | CSS Modules and native custom properties; no Tailwind or CSS-in-JS runtime |
| Brand freedom | Semantic token contract rather than brand-specific styling baked into components |
| Clean boundaries | Core primitives accept props; application patterns handle providers and feature integrations |
| Framework portability | No Next.js imports in reusable UI; host-specific wiring stays at the edge |
| Bidirectional by design | Logical CSS, bidi isolation, directional icon handling, and native Intl formatting |
| Quality gates | Vitest/Testing Library and Playwright are the intended component and browser testing layers |

These are engineering standards and release goals, not certification of current accessibility or test coverage.

Read the [technical standards](docs/standards/TECH_STACK.md) and [RTL & internationalization architecture](docs/standards/RTL_AND_I18N.md).

## Free foundation. Premium depth.

The intended model is **a free open-source core with paid premium offerings**, not a blanket charge simply because a user is a business.

| Offering | Intended scope | Status |
| --- | --- | --- |
| Free | Useful core UI and starter foundations | Scope and license being defined |
| Pro | Additional components, layouts, and templates | Planned |
| Companies & agencies | Premium offerings with terms suited to teams, client delivery, and larger organizations | Planned |

The exact free/premium split, pricing, support commitments, seat rules, and client redistribution rights are not finalized. The 100+ component and 10+ dashboard targets refer to the overall roadmap, not the free tier alone.

### License status

**A project license has not yet been published in this repository.** The intended open-source model does not itself grant permission to use, modify, or redistribute this code. Do not assume MIT, commercial-use, or redistribution rights until the applicable license is published. Premium terms will be documented separately.

## Building in the open

| Area | Current public-repository position |
| --- | --- |
| Next.js starters | Dashboard and website source directories are present |
| Dashboard foundations | Shell, layouts, providers, and i18n source are present; readiness is not certified |
| Component catalog | Early implementation; full catalog is not released |
| Vite starters | Product target; parity and release readiness are not verified in this public snapshot |
| One-command setup | Planned; no released CLI |
| Free/premium catalog and licensing | Being defined |

Local development may be ahead of the public repository. Published releases—not screenshots or folder counts—will establish supported functionality.

### Delivery priorities

1. Establish the token, component, localization, and host-integration contracts.
2. Build and verify the component catalog and representative dashboard/website flows.
3. Validate Next.js and Vite starters against the shared foundation.
4. Deliver the CLI, documentation, gallery, and release process.
5. Publish the free/premium feature matrix and license terms.

## Explore the source

```text
typescript/
└── nextjs/starterkit/
    ├── dashboard/      # Dashboard reference application
    └── website/        # Website reference application
docs/standards/         # Engineering and localization standards
site/                   # Standalone GitHub Pages landing page
```

For local exploration, see each application's `package.json` and repository standards. The documented workflow uses `pnpm dev`, `pnpm lint`, `pnpm type-check`, `pnpm test`, and `pnpm build` from an application directory. A successful clean install/build has not been verified by this documentation update.

## Follow the project

Star or watch this repository for progress and releases. Have a use case, accessibility concern, or layout request? [Open an issue](https://github.com/motyailyass/white-label-ui-kit/issues).

Please discuss substantial changes before implementing them. Contribution and licensing policies will be formalized before wider external contribution.

---

**A foundation for your brand—not a brand you have to work around.**

Maintainers: see [GitHub Pages setup](docs/GITHUB_PAGES.md) to publish the landing site and later connect a custom domain.
