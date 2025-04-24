/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.config.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  
  // Add transformers for JavaScript files
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          }
        }]
      ]
    }]
  },
  
  // Configure which node_modules should be transformed
  transformIgnorePatterns: [
    '/node_modules/(?!(argon2|jsonwebtoken|mongodb|mailersend|winston|winston-mongodb)/)'
  ],
  
  // Supported file extensions
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],

  // Ignore coverage paths
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ]
};