#!/usr/bin/env node

/**
 * cli/index.mjs
 *
 * Copies primitives from the kit into an existing React project.
 * Plain file copy: no runtime dependency, no generated wrapper, no lock-in.
 *
 * Usage (from GitHub, no npm release needed):
 *   npx github:motyailyass/white-label-ui-kit list
 *   npx github:motyailyass/white-label-ui-kit add button
 *
 * Or from a clone:
 *   node cli/index.mjs add dialog --cwd ~/code/my-app
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kitSrc = path.join(repoRoot, 'typescript/nextjs/starterkit/dashboard/src');
const uiDir = path.join(kitSrc, 'components/ui');

const argv = process.argv.slice(2);
const command = argv.shift();

let cwd = process.cwd();
const cwdFlag = argv.indexOf('--cwd');
if (cwdFlag >= 0) {
  cwd = path.resolve(argv[cwdFlag + 1] ?? '.');
  argv.splice(cwdFlag, 2);
}
const force = argv.includes('--force');
const dryRun = argv.includes('--dry-run');
const name = argv.find((arg) => !arg.startsWith('--'));

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

function primitives() {
  return fs
    .readdirSync(uiDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function help() {
  console.log(`
  White Label UI Kit CLI

  Commands
    list                       Show available primitives
    add <primitive>            Copy a primitive into your project

  Options
    --cwd <dir>                Target project (default: current directory)
    --force                    Overwrite files that already exist
    --dry-run                  Print what would be copied, write nothing

  Examples
    npx github:motyailyass/white-label-ui-kit add button
    node cli/index.mjs add dialog --cwd ~/code/my-app
`);
}

if (!command || command === 'help' || command === '--help') {
  help();
  process.exit(0);
}

if (command === 'list') {
  console.log(primitives().join('\n'));
  process.exit(0);
}

if (command !== 'add') {
  fail(`Unknown command "${command}". Run with --help.`);
}

if (!name) {
  fail('Name a primitive: add <primitive>. Run "list" to see them.');
}

if (!fs.existsSync(uiDir)) {
  fail(`Primitive sources not found at ${uiDir}. Run the CLI from the repository checkout.`);
}

if (fs.existsSync(path.join(kitSrc, 'layouts', name))) {
  fail(
    `"${name}" is a dashboard layout, not a primitive. A layout needs the app shell, providers, and translations — copy a starter instead:\n\n    cp -R <repo>/typescript/nextjs/starterkit/dashboard ~/code/my-app`,
  );
}

if (fs.existsSync(path.join(kitSrc, 'components/patterns', name))) {
  fail(
    `"${name}" is a connected pattern, not a primitive. Patterns need the i18n and theme providers; copy a starter or extract it from the gallery.`,
  );
}

const entryDir = path.join(uiDir, name);
if (!fs.existsSync(entryDir) || !fs.statSync(entryDir).isDirectory()) {
  const distance = (a, b) => {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const current = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
        previous = current;
      }
    }
    return row[b.length];
  };
  const close = primitives()
    .map((item) => [item, distance(item, name)])
    .filter(([, score]) => score <= 2)
    .sort((a, b) => a[1] - b[1])
    .map(([item]) => item)
    .slice(0, 5);
  fail(
    `Unknown primitive "${name}".${close.length ? ` Did you mean: ${close.join(', ')}?` : ''}\n  Run "list" to see all ${primitives().length}.`,
  );
}

const projectPkgPath = path.join(cwd, 'package.json');
if (!fs.existsSync(projectPkgPath)) {
  fail(`No package.json in ${cwd}. Run this inside a React project, or pass --cwd.`);
}
const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath, 'utf8'));
const installed = new Set([
  ...Object.keys(projectPkg.dependencies ?? {}),
  ...Object.keys(projectPkg.devDependencies ?? {}),
]);

const srcRoot = fs.existsSync(path.join(cwd, 'src')) ? path.join(cwd, 'src') : cwd;

function readJsonc(file) {
  const text = fs
    .readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(text);
}

function detectAlias() {
  for (const file of ['tsconfig.json', 'jsconfig.json']) {
    const target = path.join(cwd, file);
    if (!fs.existsSync(target)) continue;
    const paths = readJsonc(target).compilerOptions?.paths ?? {};
    const keys = Object.keys(paths).filter((key) => key.endsWith('/*'));
    const picked = keys.find((key) => key.startsWith('@/')) ?? keys[0];
    if (picked) return picked.slice(0, -1);
  }
  return null;
}

const alias = detectAlias();

function packageName(spec) {
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

const SKIP_FILE = /\.test\.(ts|tsx)$/;

function filesIn(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return filesIn(full);
    return SKIP_FILE.test(entry.name) ? [] : [full];
  });
}

function importsIn(file) {
  if (!/\.(ts|tsx)$/.test(file)) return [];
  const source = fs.readFileSync(file, 'utf8');
  const specs = [];
  for (const match of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)) {
    specs.push(match[1]);
  }
  return specs;
}

// Resolve the closure the primitive actually needs, by reading its imports.
const neededUi = new Set([name]);
const neededLib = new Set();
const external = new Set();
const unsupported = new Set();
let needsIcons = false;

const queue = [name];
while (queue.length > 0) {
  const current = queue.shift();
  for (const file of filesIn(path.join(uiDir, current))) {
    for (const spec of importsIn(file)) {
      if (spec.startsWith('@/')) {
        const rest = spec.slice(2);
        if (rest.startsWith('components/ui/')) {
          const dep = rest.split('/')[2];
          if (dep && dep !== 'control-sizing' && !neededUi.has(dep)) queue.push(dep);
        } else if (rest.startsWith('components/icons')) {
          needsIcons = true;
        } else if (rest.startsWith('lib/')) {
          neededLib.add(rest.replace(/^lib\//, '').split('/')[0]);
        } else {
          unsupported.add(spec);
        }
      } else if (spec.startsWith('../')) {
        const dep = spec.slice(3).split('/')[0];
        if (fs.existsSync(path.join(uiDir, dep)) && !neededUi.has(dep)) queue.push(dep);
      } else if (!spec.startsWith('.')) {
        external.add(packageName(spec));
      }
    }
  }
}

if (unsupported.size > 0) {
  fail(
    `This primitive imports ${[...unsupported].join(', ')}, which needs providers this CLI does not install. Copy a starter instead.`,
  );
}

const plan = []; // { from, to, group }
const pushDir = (dir, target, group) => {
  if (!fs.existsSync(dir)) return;
  for (const file of filesIn(dir)) {
    plan.push({ from: file, to: path.join(target, path.relative(dir, file)), group });
  }
};

for (const current of neededUi) {
  pushDir(
    path.join(uiDir, current),
    path.join(srcRoot, 'components/ui', current),
    `components/ui/${current}`,
  );
}
plan.push({
  from: path.join(uiDir, 'control-sizing.ts'),
  to: path.join(srcRoot, 'components/ui/control-sizing.ts'),
  group: 'components/ui',
});
if (needsIcons) {
  pushDir(path.join(kitSrc, 'components/icons'), path.join(srcRoot, 'components/icons'), 'components/icons');
  external.add('@hugeicons/core-free-icons');
  external.add('@hugeicons/react');
}
for (const lib of neededLib) {
  const file = path.join(kitSrc, 'lib', `${lib}.ts`);
  if (fs.existsSync(file)) {
    plan.push({ from: file, to: path.join(srcRoot, 'lib', `${lib}.ts`), group: 'lib' });
  }
}
const tokensTarget = path.join(srcRoot, 'styles/tokens');
if (!fs.existsSync(tokensTarget)) {
  pushDir(path.join(kitSrc, 'styles/tokens'), tokensTarget, 'styles/tokens');
}

function relative(file) {
  return path.relative(cwd, file);
}

let written = 0;
const stats = new Map(); // group -> { copied, kept }
const bump = (group, key) => {
  const current = stats.get(group) ?? { copied: 0, kept: 0 };
  current[key] += 1;
  stats.set(group, current);
};
for (const item of plan) {
  const exists = fs.existsSync(item.to);
  // Tokens are a shared stylesheet users customize once; never clobber them.
  const isTokens = item.group === 'styles/tokens';
  if (exists && (isTokens || !force)) {
    bump(item.group, 'kept');
    continue;
  }
  bump(item.group, 'copied');
  written += 1;
  if (dryRun) continue;

  fs.mkdirSync(path.dirname(item.to), { recursive: true });
  let content = fs.readFileSync(item.from);
  if (alias && /\.(ts|tsx)$/.test(item.from)) {
    content = content
      .toString('utf8')
      .replaceAll("'@/", `'${alias}`)
      .replaceAll('"@/', `"${alias}`);
  }
  fs.writeFileSync(item.to, content);
}

const missing = [...external].filter((pkg) => !installed.has(pkg));
const action = dryRun ? 'Would copy' : 'Copied';

console.log(`\n  ${action} ${written} file${written === 1 ? '' : 's'} from "${name}" to ${srcRoot}\n`);
for (const [group, counts] of stats) {
  if (counts.copied === 0) {
    console.log(`    ${group}/  kept: already present`);
    continue;
  }
  const kept = counts.kept > 0 ? `, ${counts.kept} kept` : '';
  console.log(`    ${group}/  (${counts.copied} file${counts.copied === 1 ? '' : 's'}${kept})`);
}

const next = [];
next.push(
  'Import the tokens once from your global stylesheet (adjust the relative path):\n      @import "./styles/tokens/index.css";',
);
if (missing.length > 0) {
  const manager = fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))
    ? 'pnpm add'
    : fs.existsSync(path.join(cwd, 'yarn.lock'))
      ? 'yarn add'
      : fs.existsSync(path.join(cwd, 'bun.lockb'))
        ? 'bun add'
        : 'npm install';
  next.push(`Install the packages this primitive imports:\n      ${manager} ${missing.join(' ')}`);
}
if (!alias) {
  next.push(
    'No "@/*" alias found in tsconfig.json, so imports stay as written. Add this to compilerOptions:\n      "paths": { "@/*": ["./src/*"] }',
  );
}
if (next.length > 0) {
  console.log('\n  Next:');
  for (const line of next) console.log(`    • ${line}`);
}
console.log('');
