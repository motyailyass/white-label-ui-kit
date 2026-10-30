#!/usr/bin/env node

/**
 * scripts/sync-shared.mjs
 *
 * Keeps shared white-label primitives, providers, i18n, and icons synchronized
 * between the reference dashboard starter kit and website starter kit.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const SOURCE_DIR = path.join(rootDir, 'typescript/nextjs/starterkit/dashboard/src');
const TARGET_DIR = path.join(rootDir, 'typescript/nextjs/starterkit/website/src');

const SHARED_DIRECTORIES = [
  'components/icons',
  'components/patterns',
  'components/ui',
  'providers',
  'i18n',
  'lib',
];

const EXCLUDED_PATTERNS = [
  'components/patterns/dashboard-header', // Dashboard layout specific
  'styles/tokens/controls.css',           // Dashboard (36px) vs Website (48px) default height
];

function copyRecursive(src, dest, relativePrefix = '') {
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      const relPath = path.join(relativePrefix, entry).replace(/\\/g, '/');

      if (EXCLUDED_PATTERNS.some((pattern) => relPath.startsWith(pattern) || relPath === pattern)) {
        continue;
      }

      copyRecursive(srcPath, destPath, relPath);
    }
  } else {
    // If copying components/patterns/index.ts to website, strip dashboard-only pattern exports
    if (relativePrefix === 'components/patterns/index.ts') {
      const content = fs.readFileSync(src, 'utf8');
      const filtered = content
        .split('\n')
        .filter((line) => !line.includes('dashboard-header'))
        .join('\n');
      fs.writeFileSync(dest, filtered, 'utf8');
      return;
    }

    fs.copyFileSync(src, dest);
  }
}

console.log('🔄 Synchronizing shared white-label components & core from dashboard -> website...');

for (const dir of SHARED_DIRECTORIES) {
  const src = path.join(SOURCE_DIR, dir);
  const dest = path.join(TARGET_DIR, dir);
  copyRecursive(src, dest, dir);
}

console.log('✅ Synchronization complete.');
