#!/usr/bin/env node

/**
 * scripts/build-gallery-site.mjs
 *
 * Builds the GitHub Pages site: the hand-written landing/docs pages in `site/`
 * plus the real, mounted component gallery exported from the dashboard app.
 *
 * Output: `_pages/` at the repository root — upload this directory to Pages.
 *
 * The app is exported under `/white-label-ui-kit` because this is a GitHub
 * Pages project site. The landing page keeps `/` and the gallery lives at
 * `/white-label-ui-kit/gallery/`.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dashboardDir = path.join(rootDir, 'typescript/nextjs/starterkit/dashboard');
const exportDir = path.join(dashboardDir, 'out');
const siteDir = path.join(rootDir, 'site');
const pagesDir = path.join(rootDir, '_pages');
const basePath = '/white-label-ui-kit';

const TEXT_EXTENSIONS = new Set(['.html', '.txt', '.js', '.json', '.rsc']);

function prefixStudioLinks(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      prefixStudioLinks(file);
      continue;
    }
    if (!TEXT_EXTENSIONS.has(path.extname(entry.name))) continue;

    const source = fs.readFileSync(file, 'utf8');
    // GalleryStudioLayout renders plain anchors (patterns cannot import
    // next/link), so Next never applies basePath to those hrefs.
    const updated = source
      .replaceAll('"/gallery', `"${basePath}/gallery`)
      .replaceAll("'/gallery", `'${basePath}/gallery`);
    if (updated !== source) fs.writeFileSync(file, updated);
  }
}

console.log(`> Exporting the dashboard gallery under ${basePath}`);
execFileSync('pnpm', ['exec', 'next', 'build'], {
  cwd: dashboardDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_EXPORT: '1',
    NEXT_EXPORT_BASE_PATH: basePath,
    ENABLE_TEST_FIXTURES: 'true',
  },
});

// Test-only fixture; never published.
fs.rmSync(path.join(exportDir, 'sizing-fixture'), { recursive: true, force: true });

fs.rmSync(pagesDir, { recursive: true, force: true });
fs.cpSync(exportDir, pagesDir, { recursive: true });

// The landing page owns `/`; the app root is only a redirect to /classic.
fs.rmSync(path.join(pagesDir, 'index.html'));
fs.rmSync(path.join(pagesDir, 'index.txt'));

prefixStudioLinks(pagesDir);

fs.cpSync(siteDir, pagesDir, { recursive: true });
// Pages runs Jekyll by default, which drops the `_next` asset directory.
fs.writeFileSync(path.join(pagesDir, '.nojekyll'), '');

console.log(`> Wrote ${path.relative(rootDir, pagesDir)}/`);
