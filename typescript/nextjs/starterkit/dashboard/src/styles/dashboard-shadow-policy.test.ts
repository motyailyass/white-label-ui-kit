import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function stripComments(content: string): string {
  let clean = content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    return '\n'.repeat((match.match(/\n/g) || []).length);
  });
  clean = clean.replace(/\/\/.*$/gm, '');
  return clean;
}

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

describe('Dashboard Shadow Prohibition Policy', () => {
  it('ensures dashboard source is completely shadow-free', () => {
    const srcDir = path.resolve(__dirname, '..');
    const violations: Array<{ file: string; line: number; rule: string; snippet: string }> = [];

    function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          if (entry.name.includes('shadow-policy.test')) {
            continue;
          }
          const ext = path.extname(entry.name);
          if (['.css', '.ts', '.tsx', '.js', '.mjs'].includes(ext)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const clean = stripComments(content);
            const lines = clean.split('\n');

            lines.forEach((line, index) => {
              for (const rule of FORBIDDEN_RULES) {
                if (rule.regex.test(line)) {
                  violations.push({
                    file: path.relative(srcDir, fullPath),
                    line: index + 1,
                    rule: rule.name,
                    snippet: line.trim(),
                  });
                }
              }
            });
          }
        }
      }
    }

    walk(srcDir);

    expect(
      violations,
      `Expected zero shadow violations in Dashboard, found ${violations.length}:\n${violations
        .map((v) => `  ${v.file}:${v.line} [${v.rule}] -> ${v.snippet}`)
        .join('\n')}`,
    ).toEqual([]);
  });
});
