import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  cacheDir: resolve(process.cwd(), 'node_modules/.vite'),
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    include: [
      resolve(__dirname, './src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'),
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: resolve(__dirname, '../../../coverage/libs/remote/util'),
    },
  },
});
