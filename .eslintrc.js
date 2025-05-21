module.exports = {
  extends: ['next/core-web-vitals'],
  root: true,
  ignorePatterns: ['eslint.config.mjs'],
  rules: {
    // Add your specific rules here
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': ['warn', { 
      vars: 'all', 
      varsIgnorePattern: '^_', 
      args: 'after-used', 
      argsIgnorePattern: '^_' 
    }]
  },
  plugins: ['unused-imports']
};
