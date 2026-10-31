#!/usr/bin/env node

/**
 * scripts/sync-shared.mjs
 *
 * Keeps shared white-label primitives, providers, i18n engine, tokens, and icons synchronized
 * from the canonical Next.js dashboard starter kit to the website starter kit and the Vite
 * dashboard reference starter.
 *
 * Usage:
 *   node scripts/sync-shared.mjs          # Synchronizes shared files from canonical dashboard
 *   node scripts/sync-shared.mjs --check  # Verifies sync state in CI (exits with code 1 on drift)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const isCheckMode = process.argv.includes('--check');

const SOURCE_DIR = path.join(rootDir, 'typescript/nextjs/starterkit/dashboard/src');

const SHARED_DIRECTORIES = [
  'components/icons',
  'components/patterns',
  'components/ui',
  'providers',
  'i18n',
  'lib',
  'styles/tokens',
];

const TARGETS = [
  {
    name: 'nextjs/website',
    dir: path.join(rootDir, 'typescript/nextjs/starterkit/website/src'),
    excludedPatterns: [
      'components/patterns/dashboard-header', // Dashboard layout specific
      'styles/tokens/controls.css',           // Dashboard (36px) vs Website (48px) intentional token presets
      'i18n/messages/index.ts',               // Starter-specific message registration
      'i18n/messages/messages.test.ts',       // Starter-specific dictionary tests
      'i18n/messages/en/dashboard.ts',        // Dashboard-owned namespace
      'i18n/messages/fr/dashboard.ts',
      'i18n/messages/ar/dashboard.ts',
      'i18n/messages/en/settings.ts',         // Dashboard-owned namespace
      'i18n/messages/fr/settings.ts',
      'i18n/messages/ar/settings.ts',
      'i18n/messages/en/website.ts',          // Website-owned namespace (preserved from pruning)
      'i18n/messages/fr/website.ts',
      'i18n/messages/ar/website.ts',
    ],
    stripDashboardHeaderExport: true,
  },
  {
    name: 'vite/dashboard',
    dir: path.join(rootDir, 'typescript/vite/starterkit/dashboard/src'),
    excludedPatterns: [
      'components/patterns/dashboard-header', // Minimal Vite reference omits shell layouts
    ],
    stripDashboardHeaderExport: true,
  },
];

let driftDetected = false;
let syncedCount = 0;
let removedCount = 0;

function isExcluded(relPath, excludedPatterns) {
  const normalized = relPath.replace(/\\/g, '/');
  return excludedPatterns.some(
    (pattern) => normalized === pattern || normalized.startsWith(`${pattern}/`),
  );
}

function getExpectedContent(srcPath, relPath, stripDashboardHeaderExport) {
  const content = fs.readFileSync(srcPath);

  if (stripDashboardHeaderExport && relPath.replace(/\\/g, '/') === 'components/patterns/index.ts') {
    const text = content.toString('utf8');
    const filtered = text
      .split('\n')
      .filter((line) => !line.includes('dashboard-header'))
      .join('\n');
    return Buffer.from(filtered, 'utf8');
  }

  return content;
}

function syncDirectory(srcDir, destDir, relDir, target) {
  if (!fs.existsSync(srcDir)) return;

  if (!fs.existsSync(destDir)) {
    if (isCheckMode) {
      console.error(`[DRIFT:${target.name}] Missing directory: ${relDir}`);
      driftDetected = true;
    } else {
      fs.mkdirSync(destDir, { recursive: true });
    }
  }

  const srcEntries = fs.readdirSync(srcDir);
  const srcEntrySet = new Set(srcEntries);

  for (const entry of srcEntries) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    const relPath = path.join(relDir, entry).replace(/\\/g, '/');

    if (isExcluded(relPath, target.excludedPatterns)) {
      continue;
    }

    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      syncDirectory(srcPath, destPath, relPath, target);
    } else {
      const expected = getExpectedContent(srcPath, relPath, target.stripDashboardHeaderExport);

      if (!fs.existsSync(destPath)) {
        if (isCheckMode) {
          console.error(`[DRIFT:${target.name}] Missing file: ${relPath}`);
          driftDetected = true;
        } else {
          fs.writeFileSync(destPath, expected);
          syncedCount++;
        }
      } else {
        const current = fs.readFileSync(destPath);
        if (!current.equals(expected)) {
          if (isCheckMode) {
            console.error(`[DRIFT:${target.name}] File content mismatch: ${relPath}`);
            driftDetected = true;
          } else {
            fs.writeFileSync(destPath, expected);
            syncedCount++;
          }
        }
      }
    }
  }

  if (fs.existsSync(destDir)) {
    const destEntries = fs.readdirSync(destDir);
    for (const entry of destEntries) {
      const destPath = path.join(destDir, entry);
      const relPath = path.join(relDir, entry).replace(/\\/g, '/');

      if (isExcluded(relPath, target.excludedPatterns)) {
        continue;
      }

      if (!srcEntrySet.has(entry)) {
        if (isCheckMode) {
          console.error(`[DRIFT:${target.name}] Obsolete file (deleted from dashboard): ${relPath}`);
          driftDetected = true;
        } else {
          fs.rmSync(destPath, { recursive: true, force: true });
          removedCount++;
        }
      }
    }
  }
}

if (isCheckMode) {
  console.log('🔍 Checking shared code drift across starters...');
} else {
  console.log('🔄 Synchronizing shared white-label core from canonical dashboard...');
}

for (const target of TARGETS) {
  if (!fs.existsSync(target.dir)) continue;
  for (const dir of SHARED_DIRECTORIES) {
    const src = path.join(SOURCE_DIR, dir);
    const dest = path.join(target.dir, dir);
    syncDirectory(src, dest, dir, target);
  }
}

if (isCheckMode) {
  if (driftDetected) {
    console.error(
      '❌ Drift detected across shared starter files. Run `pnpm run sync:shared` to resolve.',
    );
    process.exit(1);
  } else {
    console.log('✅ Shared files are perfectly synchronized. Zero drift detected.');
  }
} else {
  console.log(
    `✅ Synchronization complete. (${syncedCount} files synced, ${removedCount} obsolete files removed)`,
  );
}
