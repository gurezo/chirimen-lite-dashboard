#!/usr/bin/env node
/**
 * Generates ng-package.json and package.json in a lib root for build.
 * Run before @nx/angular:package or @nx/angular:ng-packagr-lite.
 * Usage: node scripts/generate-lib-package.js <projectRoot>
 * Example: node scripts/generate-lib-package.js libs/dialogs
 */

const fs = require('fs');
const path = require('path');

const workspaceRoot = process.cwd();
const projectRoot = process.argv[2];
if (!projectRoot) {
  console.error('Usage: node scripts/generate-lib-package.js <projectRoot>');
  process.exit(1);
}

const manifestPath = path.join(workspaceRoot, projectRoot, 'package.manifest.json');
const projectJsonPath = path.join(workspaceRoot, projectRoot, 'project.json');
let packageMeta;
if (fs.existsSync(manifestPath)) {
  packageMeta = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} else {
  const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
  packageMeta = projectJson.libPackage || projectJson.package;
}
if (!packageMeta) {
  console.error(`Missing package.manifest.json or "libPackage" in ${projectJsonPath}`);
  process.exit(1);
}

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
