module.exports = {
  preset: 'jest-preset-angular',

  setupFilesAfterEnv: [
    '<rootDir>/setup-jest.ts'
  ],

  testEnvironment: 'jsdom',

  testMatch: [
    '<rootDir>/src/**/*.spec.ts'
  ],

  moduleFileExtensions: [
    'ts',
    'html',
    'js',
    'json'
  ],

  collectCoverage: true,

  collectCoverageFrom: [
    'src/app/**/*.ts',

    '!src/app/**/*.spec.ts',
    '!src/app/**/*.module.ts',

    '!src/main.ts',
    '!src/polyfills.ts',

    '!src/app/**/*.model.ts',
    '!src/app/constants/**/*.ts'
  ],

  coverageDirectory: '<rootDir>/coverage',

  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],

  clearMocks: true
};