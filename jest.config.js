/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/pages/',
    '/lib/middleware.js$'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/pages/api/',
    '/node_modules/'
  ],
  verbose: true,
};