module.exports = {
  default: {
    require: [
      'support/hooks.js',
      'step-definitions/**/*.js',
    ],
    paths: ['features/**/*.feature'],
    format: [
      'progress-bar',
      'html:reports/test-report.html',
      'json:reports/test-report.json',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    timeout: 60000,
  },
};
