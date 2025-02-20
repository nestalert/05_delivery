module.exports = {
    testEnvironment: 'node', // For backend tests
    testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'], // Optional setup file
    collectCoverageFrom: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/**/*.d.ts',
    ],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // for css module mocking.
    },
  };