import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = path.join(path.dirname(fileURLToPath(import.meta.url)), 'index.mjs');

function makeProject({ alias = '@/' } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wlui-test-'));
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'acme', dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' } }),
  );
  fs.mkdirSync(path.join(dir, 'src'));
  if (alias) {
    fs.writeFileSync(
      path.join(dir, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { [`${alias}*`]: ['./src/*'] } } }),
    );
  }
  return dir;
}

function run(dir, ...args) {
  return spawnSync(process.execPath, [cli, ...args, '--cwd', dir], { encoding: 'utf8' });
}

test('add copies the primitive and everything it imports', () => {
  const dir = makeProject();
  const result = run(dir, 'add', 'button');
  assert.equal(result.status, 0, result.stderr);
  for (const file of [
    'components/ui/button/button.tsx',
    'components/ui/button/button.module.css',
    'components/ui/button/index.ts',
    'components/ui/control-sizing.ts',
    'components/icons/icon.tsx',
    'lib/cn.ts',
    'styles/tokens/index.css',
  ]) {
    assert.ok(fs.existsSync(path.join(dir, 'src', file)), `missing ${file}`);
  }
  assert.ok(!fs.existsSync(path.join(dir, 'src/components/ui/button/button.test.tsx')));
  assert.match(result.stdout, /@hugeicons\/core-free-icons/);
});

test('rewrites imports to the project alias', () => {
  const dir = makeProject({ alias: '~/' });
  assert.equal(run(dir, 'add', 'button').status, 0);
  const source = fs.readFileSync(path.join(dir, 'src/components/ui/button/button.tsx'), 'utf8');
  assert.match(source, /from '~\/components\/icons'/);
  assert.doesNotMatch(source, /from '@\//);
});

test('warns when the project has no path alias', () => {
  const dir = makeProject({ alias: null });
  const result = run(dir, 'add', 'button');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /No "@\/\*" alias found/);
});

test('dry run writes nothing', () => {
  const dir = makeProject();
  const result = run(dir, 'add', 'button', '--dry-run');
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!fs.existsSync(path.join(dir, 'src/components')));
  assert.match(result.stdout, /Would copy/);
});

test('rejects unknown primitives', () => {
  const dir = makeProject();
  const result = run(dir, 'add', 'buton');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown primitive/);
  assert.match(result.stderr, /button/);
});

test('explains that layouts need the starter', () => {
  const dir = makeProject();
  const result = run(dir, 'add', 'classic');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /copy a starter/i);
});

test('keeps existing files unless --force is passed', () => {
  const dir = makeProject();
  assert.equal(run(dir, 'add', 'button').status, 0);
  const target = path.join(dir, 'src/components/ui/button/button.tsx');
  fs.writeFileSync(target, '// customized\n');
  assert.equal(run(dir, 'add', 'button').status, 0);
  assert.equal(fs.readFileSync(target, 'utf8'), '// customized\n');
  assert.equal(run(dir, 'add', 'button', '--force').status, 0);
  assert.notEqual(fs.readFileSync(target, 'utf8'), '// customized\n');
});
