module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  transformIgnorePatterns: ['node_modules/(?!(jose|jwks-rsa|firebase-admin)/)'],
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
