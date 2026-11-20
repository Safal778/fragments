const path = require('path');
const envFile = path.join(__dirname, 'env.jest');

require('dotenv').config({ path: envFile });

module.exports = {
  verbose: true,
  testTimeout: 5000,
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!src/server.js'],
  coverageThreshold: {
    global: {
      lines: 85,
      statements: 85,
      functions: 85,
      branches: 85,
    },
  },
};
