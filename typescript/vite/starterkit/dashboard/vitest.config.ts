import path from 'node:path';
import { defineConfig } from 'vitest/config';

const currentDir = import.meta.dirname;

export default defineConfig({
  root: currentDir,
  server: {
    fs: {
      strict: true,
      allow: [currentDir],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(currentDir, './src'),
    },
  },
});
