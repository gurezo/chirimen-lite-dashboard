import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  cacheDir: resolve(process.cwd(), 'node_modules/.vite'),
  plugins: [
    angular({
      tsconfig: resolve(__dirname, 'tsconfig.spec.json'),
    }),
    nxViteTsPaths(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, './src/test-setup.ts')],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: resolve(
        __dirname,
        '../../../coverage/libs/console-shell/ui',
      ),
    },
    include: [
      resolve(
        __dirname,
        './src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ),
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@libs-console-shell-util': resolve(__dirname, '../util/src/index.ts'),
    },
  },
  esbuild: {
    target: 'node22',
  },
});
