import { defineConfig } from 'vitest/config';
import path from 'node:path';

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
  },
  resolve: {
    alias: {
      '@': path.resolve(currentDir, './src'),
    },
  },
});
