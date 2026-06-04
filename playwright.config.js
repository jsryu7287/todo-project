const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testMatch: '**/*.test.js',
  use: {
    headless: true,
  },
  reporter: [['list']],
});