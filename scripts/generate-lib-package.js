#!/usr/bin/env node
/**
 * Generates ng-package.json and package.json in a lib root for build.
 * Run before @nx/angular:package or @nx/angular:ng-packagr-lite.
 * Package name is derived from projectRoot; peerDependencies from root
 * package.json dependencies + devDependencies.
 * Usage: node scripts/generate-lib-package.js <projectRoot>
 */

const fs = require('fs');
const path = require('path');

const workspaceRoot = process.cwd();
const projectRoot = process.argv[2];
if (!projectRoot) {
  console.error('Usage: node scripts/generate-lib-package.js <projectRoot>');
  process.exit(1);
}

const rootPackagePath = path.join(workspaceRoot, 'package.json');
const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));

const nameByRoot = {
  'libs/shared/guards': '@console/guards',
  'libs/shared/ui': '@libs-ui',
};
const packageName =
  nameByRoot[projectRoot] ||
  '@libs-' + projectRoot.replace(/^libs\//, '').replace(/\//g, '-');

const peerDependencies = {
  ...(rootPackage.dependencies || {}),
  ...(rootPackage.devDependencies || {}),
};

const packageMeta = {
  name: packageName,
  version: rootPackage.version || '0.0.1',
  peerDependencies,
  sideEffects: false,
};

const libRoot = path.join(workspaceRoot, projectRoot);
const depth = projectRoot.split(path.sep).length;
const distRelative = path.join(...Array(depth).fill('..'), 'dist', projectRoot);
const destForward = distRelative.split(path.sep).join('/');

fs.writeFileSync(
  path.join(libRoot, 'package.json'),
  JSON.stringify(packageMeta, null, 2) + '\n',
  'utf8'
);

const ngPackage = {
  dest: destForward,
  lib: {
    entryFile: 'src/index.ts',
  },
};

fs.writeFileSync(
  path.join(libRoot, 'ng-package.json'),
  JSON.stringify(ngPackage, null, 2) + '\n',
  'utf8'
);
