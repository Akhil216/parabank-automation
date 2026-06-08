'use strict';

// Every page object extends this. Keeps the common Playwright calls in one
// place so individual pages stay focused on their own selectors and logic.

class BasePage {
  constructor(page) {
    this.page    = page;
    this.baseUrl = 'https://parabank.parasoft.com/parabank';
  }

  async goto(path = '') {
    await this.page.goto(`${this.baseUrl}${path}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // waitForSelector wraps the built-in so callers don't have to keep
  // passing the timeout option everywhere
  async waitFor(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async clickOn(selector) {
    await this.page.click(selector);
  }

  async typeInto(selector, text) {
    await this.page.fill(selector, text);
  }

  async readText(selector) {
    return this.page.textContent(selector);
  }

  async elementExists(selector) {
    return this.page.isVisible(selector);
  }
}

module.exports = BasePage;
