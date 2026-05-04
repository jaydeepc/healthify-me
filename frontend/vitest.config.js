import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      reportsDirectory: '../coverage/frontend',
      exclude: [
        '**/node_modules/**',
        '**/__tests__/**',
        '**/*.test.{js,jsx}',
        '**/*config*.{js,mjs}',
        '**/dist/**',
        '**/public/**'
      ]
    }
  },
});
