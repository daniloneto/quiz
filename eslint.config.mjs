import globals from 'globals';
import pluginJs from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2020,
      globals: globals.node,
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-console': 'off',
      'no-unused-vars': ['warn', { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }],
      'prefer-const': 'error',
      'space-before-function-paren': ['error', 'always'],
      'import/order': ['error', { 'groups': [['builtin', 'external', 'internal']] }],
      'import/no-unresolved': 'error',
      'import/newline-after-import': 'error',
    },
  },
  pluginJs.configs.recommended,
];