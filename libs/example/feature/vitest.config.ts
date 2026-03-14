import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, './src/test-setup.ts')],
    passWithNoTests: true,
    include: [
      resolve(
        __dirname,
        './src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ),
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: resolve(
        __dirname,
        '../../../coverage/libs/example/feature',
      ),
    },
  },
  resolve: {
    alias: {
      '@libs-example-util': resolve(__dirname, '../util/src/index.ts'),
      '@libs-example-ui': resolve(__dirname, '../ui/src/index.ts'),
      '@libs-example-data-access': resolve(
        __dirname,
        '../data-access/src/index.ts',
      ),
    },
  },
});
