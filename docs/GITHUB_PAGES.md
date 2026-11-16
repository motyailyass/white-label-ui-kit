# Publish the site and gallery

The public site has two sources:

- `site/` — hand-written landing, documentation, and CLI pages. No framework, no analytics, no external fonts.
- `typescript/nextjs/starterkit/dashboard` — statically exported to publish the real mounted component gallery and the dashboard layouts.

Both are assembled into `_pages/` by one script:

```sh
node scripts/build-gallery-site.mjs
```

The script builds the dashboard with `output: 'export'`, drops the app root so the landing page keeps `/`, excludes test-only fixtures, and adds `.nojekyll` so Pages serves the `_next` asset directory. The gallery layout injects `next/link` through `GalleryLinkProvider`, so studio navigation keeps client-side routing with the correct base path.

## One-time GitHub setup

1. Open the repository's **Settings → Pages**:
   https://github.com/motyailyass/white-label-ui-kit/settings/pages
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. In **Actions → Deploy site**, select **Run workflow** on `main`. The first push may have run before Pages was enabled; rerun it after enabling Pages.
4. Confirm the deployment succeeds. Use the URL reported by the workflow's `github-pages` environment.

The expected project-site address is:

https://motyailyass.github.io/white-label-ui-kit/

Changes to `site/`, the Pages build script, or the dashboard app on `main` deploy automatically through `.github/workflows/pages.yml`.

## Local preview

The exported app is built for the `/white-label-ui-kit` base path, so serve `_pages` under that name:

```sh
node scripts/build-gallery-site.mjs
mkdir -p .preview
ln -sfn "$PWD/_pages" .preview/white-label-ui-kit
python3 -m http.server 8080 --directory .preview
```

Open http://localhost:8080/white-label-ui-kit/. Check the landing page, the docs and CLI pages, `/gallery/`, and a nested gallery page such as `/gallery/button/`. Test narrow and wide viewports, system dark mode, keyboard navigation, language switching, and RTL.

Delete `.preview/` when finished; it is ignored through `_pages/` and should not be committed.

## Add a custom domain later

When a domain is available:

1. Configure it under **Settings → Pages → Custom domain**.
2. Follow GitHub's current DNS instructions for the chosen apex domain or subdomain.
3. Verify domain ownership where supported and enable **Enforce HTTPS** when available.
4. Once the site moves to a domain root, set `NEXT_EXPORT_BASE_PATH` to an empty value in `scripts/build-gallery-site.mjs` so the export no longer uses `/white-label-ui-kit`.
5. Add a canonical URL and `og:url`, update public links, and verify DNS, TLS, and asset paths before announcing the domain.

Do not commit a placeholder `CNAME` or configure DNS for a domain you do not own. The hand-written pages use relative URLs so they work under the project path or a custom domain.

## Content and release integrity

- The gallery is the real exported application — not screenshots. Keep it that way; do not replace it with mockups.
- Counts of 100+ components and 10+ dashboard layouts are roadmap targets, not shipped inventory.
- The `add` CLI is covered by `cli/index.test.mjs`. Keep the README and CLI page aligned with the flags the tests cover, and keep saying that layouts and patterns still come from a starter.
- Free core is MIT; Pro and Enterprise terms are not announced. Do not advertise pricing, customer logos, or an SLA before they exist.
- When the license, tiers, or gallery change, update `README.md`, `site/index.html`, `site/docs.html`, and `site/cli.html` together.
