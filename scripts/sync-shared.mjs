#!/usr/bin/env node

/**
 * scripts/sync-shared.mjs
 *
 * Keeps shared white-label primitives, providers, i18n, tokens, and icons synchronized
 * between the reference dashboard starter kit and website starter kit.
 *
 * Usage:
 *   node scripts/sync-shared.mjs          # Synchronizes files from dashboard to website
 *   node scripts/sync-shared.mjs --check  # Verifies sync state in CI (exits with code 1 on drift)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const isCheckMode = process.argv.includes('--check');

const SOURCE_DIR = path.join(rootDir, 'typescript/nextjs/starterkit/dashboard/src');
const TARGET_DIR = path.join(rootDir, 'typescript/nextjs/starterkit/website/src');

/**
 * Managed Directory Ownership Contract:
 * - dashboard/src is the authoritative canonical source for the shared white-label foundation.
 * - The directories listed in SHARED_DIRECTORIES are mirrored into website/src.
 * - Application-specific code must live in app/, wireframes/, or fixtures/, which are
 *   never touched or pruned by sync-shared.
 * - Intentional token overrides/presets (such as controls.css) must be registered in
 *   EXCLUDED_PATTERNS to prevent them from being overwritten.
 */
const SHARED_DIRECTORIES = [
  'components/icons',
  'components/patterns',
  'components/ui',
  'providers',
  'i18n',
  'lib',
  'styles/tokens',
];

const EXCLUDED_PATTERNS = [
  'components/patterns/dashboard-header', // Dashboard layout specific
  'styles/tokens/controls.css',           // Dashboard (36px) vs Website (48px) intentional token presets
];

let driftDetected = false;
let syncedCount = 0;
let removedCount = 0;

function isExcluded(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  return EXCLUDED_PATTERNS.some((pattern) => normalized === pattern || normalized.startsWith(`${pattern}/`));
}

function getExpectedContent(srcPath, relPath) {
  let content = fs.readFileSync(srcPath);

  // If copying components/patterns/index.ts to website, strip dashboard-only pattern exports
  if (relPath.replace(/\\/g, '/') === 'components/patterns/index.ts') {
    const text = content.toString('utf8');
    const filtered = text
      .split('\n')
      .filter((line) => !line.includes('dashboard-header'))
      .join('\n');
    return Buffer.from(filtered, 'utf8');
  }

  return content;
}

function syncDirectory(srcDir, destDir, relDir) {
  if (!fs.existsSync(srcDir)) return;

  if (!fs.existsSync(destDir)) {
    if (isCheckMode) {
      console.error(`[DRIFT] Missing directory in website: ${relDir}`);
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

    if (isExcluded(relPath)) {
      continue;
    }

    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      syncDirectory(srcPath, destPath, relPath);
    } else {
      const expected = getExpectedContent(srcPath, relPath);

      if (!fs.existsSync(destPath)) {
        if (isCheckMode) {
          console.error(`[DRIFT] Missing file in website: ${relPath}`);
          driftDetected = true;
        } else {
          fs.writeFileSync(destPath, expected);
          syncedCount++;
        }
      } else {
        const current = fs.readFileSync(destPath);
        if (!current.equals(expected)) {
          if (isCheckMode) {
            console.error(`[DRIFT] File content mismatch: ${relPath}`);
            driftDetected = true;
          } else {
            fs.writeFileSync(destPath, expected);
            syncedCount++;
          }
        }
      }
    }
  }

  // Remove obsolete/deleted managed files in target directory
  if (fs.existsSync(destDir)) {
    const destEntries = fs.readdirSync(destDir);
    for (const entry of destEntries) {
      const destPath = path.join(destDir, entry);
      const relPath = path.join(relDir, entry).replace(/\\/g, '/');

      if (isExcluded(relPath)) {
        continue;
      }

      if (!srcEntrySet.has(entry)) {
        if (isCheckMode) {
          console.error(`[DRIFT] Obsolete file in website (deleted from dashboard): ${relPath}`);
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
  console.log('🔍 Checking shared code drift between dashboard and website...');
} else {
  console.log('🔄 Synchronizing shared white-label core from dashboard -> website...');
}

for (const dir of SHARED_DIRECTORIES) {
  const src = path.join(SOURCE_DIR, dir);
  const dest = path.join(TARGET_DIR, dir);
  syncDirectory(src, dest, dir);
}

if (isCheckMode) {
  if (driftDetected) {
    console.error('❌ Drift detected between dashboard and website shared files. Run `pnpm run sync:shared` to resolve.');
    process.exit(1);
  } else {
    console.log('✅ Shared files are perfectly synchronized. Zero drift detected.');
  }
} else {
  console.log(`✅ Synchronization complete. (${syncedCount} files synced, ${removedCount} obsolete files removed)`);
}
