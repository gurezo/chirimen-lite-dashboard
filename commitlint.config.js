/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'console',
        'page-not-found',
        'web-serial',
        'example',
        'wifi',
        'dialogs',
        'unsupported-browser',
        'editor',
        'terminal',
        'chirimen-panel',
        'shared-ui',
        'shared-guards',
        'i2cdetect',
        'workspace',
        'setup',
      ],
    ],
  },
};
