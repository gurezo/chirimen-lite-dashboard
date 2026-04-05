import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  plugins: [nxViteTsPaths()],
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
      reportsDirectory: resolve(__dirname, '../../../coverage/libs/file-manager/data-access'),
    },
  },
});
