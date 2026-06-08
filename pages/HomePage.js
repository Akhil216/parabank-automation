'use strict';

const BasePage = require('./BasePage');

// The home page is mostly a login form + a link to register.
// Selectors are worth pinning because ParaBank uses an old JSP layout
// and the IDs aren't always obvious.

class HomePage extends BasePage {

  constructor(page) {
    super(page);

    this.usernameField = '#loginPanel input[name="username"]';
    this.passwordField = '#loginPanel input[name="password"]';
    this.loginBtn      = '#loginPanel input[type="submit"]';
    this.registerLink  = '#loginPanel a[href*="register"]';

    // Error paragraph only appears when login fails.
    // It's a <p> with class "error", not a div — tripped me up at first.
    this.loginErrorMsg = 'p.error';
  }

  async open() {
    await this.goto('/index.htm?ConnType=JDBC');
  }

  async goToRegistration() {
    await this.clickOn(this.registerLink);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async loginWith(username, password) {
    await this.typeInto(this.usernameField, username);
    await this.typeInto(this.passwordField, password);
    await this.clickOn(this.loginBtn);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Partial login helpers for edge case scenarios
  async loginWithUsernameOnly(username) {
    await this.typeInto(this.usernameField, username);
    // leave password blank
    await this.clickOn(this.loginBtn);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async loginWithPasswordOnly(password) {
    // leave username blank
    await this.typeInto(this.passwordField, password);
    await this.clickOn(this.loginBtn);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async submitEmptyLoginForm() {
    await this.clickOn(this.loginBtn);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getLoginError() {
    await this.waitFor(this.loginErrorMsg, 5000);
    return this.readText(this.loginErrorMsg);
  }

  async loginErrorIsShown() {
    return this.elementExists(this.loginErrorMsg);
  }

  // ParaBank sometimes surfaces errors in #rightPanel instead of p.error
  // This covers both spots
  async anyLoginErrorIsShown() {
    const pErr = await this.elementExists(this.loginErrorMsg);
    if (pErr) return true;

    try {
      const panel = await this.page.textContent('#rightPanel');
      return panel.toLowerCase().includes('error') ||
             panel.toLowerCase().includes('invalid');
    } catch {
      return false;
    }
  }
}

module.exports = HomePage;
