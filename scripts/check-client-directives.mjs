#!/usr/bin/env node

/**
 * scripts/check-client-directives.mjs
 *
 * Client Boundary Policy Enforcement
 *
 * Every file in `components/ui` that calls a React client-only API (state, effect, ref,
 * context, id, layout-effect, imperative-handle, memo/callback hooks, createContext) or
 * renders an inline event handler (`onClick={...}`) must start with a `'use client'`
 * directive. Without it, importing the primitive from a Next.js Server Component fails
 * with a cryptic RSC error.
 *
 * Parser-aware: strips comments and skips tests.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const UI_DIRS = [
  'typescript/nextjs/starterkit/dashboard/src/components/ui',
  'typescript/nextjs/starterkit/website/src/components/ui',
  'typescript/vite/starterkit/dashboard/src/components/ui',
].map((rel) => path.join(rootDir, rel));

const CLIENT_API =
  /\b(?:useState|useEffect|useLayoutEffect|useInsertionEffect|useRef|useReducer|useContext|useId|useMemo|useCallback|useImperativeHandle|useSyncExternalStore|useTransition|useDeferredValue|useOptimistic|createContext)\b|\bon[A-Z][A-Za-z0-9]*=\{/;

const DIRECTIVE = /^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/.*\n\s*)*(['"])use client\1;?/;

export function stripComments(content) {
  const noBlock = content.replace(/\/\*[\s\S]*?\*\//g, (match) =>
    '\n'.repeat((match.match(/\n/g) || []).length)
  );
  return noBlock.replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

export function checkClientDirective(content) {
  const usesClientApi = CLIENT_API.test(stripComments(content));
  const hasDirective = DIRECTIVE.test(content);
  return { usesClientApi, hasDirective };
}

export function runClientDirectiveCheck(dirs = UI_DIRS) {
  const violations = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile() || !/\.tsx?$/.test(entry.name)) continue;
      if (/\.(test|spec)\.tsx?$/.test(entry.name)) continue;

      const { usesClientApi, hasDirective } = checkClientDirective(
        fs.readFileSync(fullPath, 'utf8')
      );
      if (usesClientApi && !hasDirective) {
        violations.push(path.relative(rootDir, fullPath));
      }
    }
  }

  for (const dir of dirs) {
    if (fs.existsSync(dir)) walk(dir);
  }
  return violations;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Self-check: a broken detector must fail the gate, never silently pass it.
  const detections = [checkClientDirective('const x = useState(0);'), checkClientDirective('<b onClick={fn} />')];
  if (detections.some((result) => !result.usesClientApi) || checkClientDirective('// useState').usesClientApi) {
    console.error('❌ Policy self-check failed: the client-API detector no longer classifies fixtures correctly.');
    process.exit(1);
  }

  console.log("🔍 Checking 'use client' directives in components/ui...");
  const violations = runClientDirectiveCheck();

  if (violations.length > 0) {
    console.error("❌ Files use client-only React APIs but lack a 'use client' directive:");
    for (const file of violations) console.error(`  ${file}`);
    process.exit(1);
  }
  console.log("✅ Every client-API primitive declares 'use client'.");
}
