#!/usr/bin/env node

/**
 * scripts/check-dashboard-shadows.mjs
 *
 * Automated Dashboard-Only Shadow Policy Enforcement
 *
 * Verifies that the Dashboard starter kit contains ZERO shadow styling:
 * - No custom-property shadow definitions or references (--shadow*, --website-shadow*)
 * - No legacy --focus-ring token (while allowing --focus-ring-width and --focus-ring-offset)
 * - No CSS box-shadow or text-shadow declarations
 * - No drop-shadow() filters
 * - No SVG feDropShadow
 * - No React boxShadow or textShadow inline style properties
 *
 * Parser-aware: strips comments and excludes test assertions.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const DASHBOARD_SRC = path.join(rootDir, 'typescript/nextjs/starterkit/dashboard/src');
const VITE_DASHBOARD_SRC = path.join(rootDir, 'typescript/vite/starterkit/dashboard/src');

export function stripComments(content, ext) {
  // Strip block comments /* ... */
  let clean = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    // Preserve newlines to maintain accurate line numbering
    return '\n'.repeat((match.match(/\n/g) || []).length);
  });

  // For JS/TS/CSS, strip single-line comments // ...
  clean = clean.replace(/\/\/.*$/gm, '');

  return clean;
}

export function checkDashboardFile(filePath, content) {
  const ext = path.extname(filePath);
  const clean = stripComments(content, ext);
  const lines = clean.split('\n');
  const violations = [];

  const FORBIDDEN_RULES = [
    {
      name: 'Shadow custom property reference or definition',
      regex: /--(?:website-)?shadow[-\w]*/,
    },
    {
      name: 'Legacy shadow-valued --focus-ring (use --focus-ring-width/offset)',
      regex: /--focus-ring\b(?!-width|-offset)/,
    },
    {
      name: 'CSS box-shadow property',
      regex: /\bbox-shadow\s*:/,
    },
    {
      name: 'CSS text-shadow property',
      regex: /\btext-shadow\s*:/,
    },
    {
      name: 'Filter drop-shadow function',
      regex: /\bdrop-shadow\s*\(/,
    },
    {
      name: 'SVG feDropShadow element/attribute',
      regex: /\bfeDropShadow\b/,
    },
    {
      name: 'React boxShadow style property',
      regex: /\bboxShadow\s*:/,
    },
    {
      name: 'React textShadow style property',
      regex: /\btextShadow\s*:/,
    },
  ];

  lines.forEach((line, index) => {
    for (const rule of FORBIDDEN_RULES) {
      if (rule.regex.test(line)) {
        violations.push({
          line: index + 1,
          rule: rule.name,
          snippet: line.trim(),
        });
      }
    }
  });

  return violations;
}

export function runDashboardShadowCheck(srcDir = DASHBOARD_SRC) {
  if (!fs.existsSync(srcDir)) {
    console.error(`Error: Directory not found: ${srcDir}`);
    process.exit(1);
  }

  const allViolations = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        // Skip shadow policy test file itself
        if (entry.name.includes('shadow-policy.test')) {
          continue;
        }

        const ext = path.extname(entry.name);
        if (['.css', '.ts', '.tsx', '.js', '.mjs'].includes(ext)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const fileViolations = checkDashboardFile(fullPath, content);
          if (fileViolations.length > 0) {
            allViolations.push({
              file: path.relative(rootDir, fullPath),
              violations: fileViolations,
            });
          }
        }
      }
    }
  }

  walk(srcDir);
  return allViolations;
}

// Direct CLI execution
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('🛡️  Checking Dashboard shadow prohibition policy...');
  const violations = [
    ...runDashboardShadowCheck(DASHBOARD_SRC),
    ...(fs.existsSync(VITE_DASHBOARD_SRC) ? runDashboardShadowCheck(VITE_DASHBOARD_SRC) : []),
  ];

  if (violations.length > 0) {
    console.error('❌ Shadow policy violations found in dashboard:');
    for (const item of violations) {
      console.error(`\n  File: ${item.file}`);
      for (const v of item.violations) {
        console.error(`    Line ${v.line}: [${v.rule}] -> ${v.snippet}`);
      }
    }
    process.exit(1);
  } else {
    console.log('✅ Dashboard is 100% shadow-free. All checks passed.');
    process.exit(0);
  }
}
