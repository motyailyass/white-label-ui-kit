# Publish the landing page

The static landing site lives in `site/`. It has no package install, framework build, external font, analytics, or third-party script dependency. It is separate from the UI-kit applications and does not claim to be their component gallery.

## One-time GitHub setup

1. Open the repository's **Settings → Pages**:
   https://github.com/motyailyass/white-label-ui-kit/settings/pages
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. In **Actions → Deploy landing page**, select **Run workflow** on `main`. The first push may have run before Pages was enabled; rerun it after enabling Pages.
4. Confirm the deployment succeeds. Use the URL reported by the workflow's `github-pages` environment.

The expected default project-site address is:

https://motyailyass.github.io/white-label-ui-kit/

This address is not confirmed live until a successful Pages deployment. The connected repository tools can commit the site but do not expose a Pages settings operation; the setting above may require the repository owner.

Future changes to `site/` on `main` automatically deploy through `.github/workflows/pages.yml`. Only the `site/` folder is published—not application source or the whole repository.

## Local preview

From the repository root:

```sh
python3 -m http.server 8080 --directory site
```

Then open http://localhost:8080. Test narrow and wide viewports, system dark mode, keyboard navigation, accent choices, and RTL preview. The RTL switch changes the illustrative workspace direction; it does not translate the English landing-page copy.

## Add a custom domain later

When a domain is available:

1. Configure it under **Settings → Pages → Custom domain**.
2. Follow GitHub's current DNS instructions for the chosen apex domain or subdomain.
3. Verify domain ownership where supported and enable **Enforce HTTPS** when available.
4. Add a canonical URL and `og:url` to `site/index.html` once the permanent address is known.
5. Update public links and verify DNS, TLS, and asset paths before announcing the domain.

Do not commit a placeholder `CNAME` or configure DNS for a domain you do not own. The site uses relative asset URLs so it can work under the GitHub project path or a custom domain.

## Content and release integrity

- Counts of 100+ components and 10+ dashboard layouts are roadmap targets.
- The brand preview is hand-authored illustrative HTML, not proof of released React components.
- Do not add an installer command until the CLI exists and has been verified.
- Do not advertise a license, pricing, customer logos, support SLA, or feature entitlement before it is established.
- When a license is published, update the status in both `README.md` and `site/index.html`.
