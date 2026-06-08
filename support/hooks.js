'use strict';

const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

// ParaBank can be slow on initial page loads, so giving a generous timeout
setDefaultTimeout(90000);

Before(async function () {
  this.browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false',
    slowMo: 30,
  });

  this.context = await this.browser.newContext({
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  });

  this.page = await this.context.newPage();
});

After(async function (scenario) {
  if (scenario.result.status === 'FAILED') {
    // Attach a screenshot so the report is actually useful when something breaks
    const shot = await this.page.screenshot({ fullPage: true });
    this.attach(shot, 'image/png');
  }

  await this.page.close();
  await this.context.close();
  await this.browser.close();
});
