'use strict';

const BasePage = require('./BasePage');

// ParaBank uses Spring MVC dot-notation for field names (customer.firstName etc.)
// The dots in CSS IDs must be escaped with backslashes — took a minute to figure out.

class RegistrationPage extends BasePage {

  constructor(page) {
    super(page);

    this.firstNameInput  = '#customer\\.firstName';
    this.lastNameInput   = '#customer\\.lastName';
    this.streetInput     = '#customer\\.address\\.street';
    this.cityInput       = '#customer\\.address\\.city';
    this.stateInput      = '#customer\\.address\\.state';
    this.zipInput        = '#customer\\.address\\.zipCode';
    this.phoneInput      = '#customer\\.phoneNumber';
    this.ssnInput        = '#customer\\.ssn';
    this.usernameInput   = '#customer\\.username';
    this.passwordInput   = '#customer\\.password';
    this.confirmPassword = '#repeatedPassword';
    this.submitBtn       = 'input[value="Register"]';

    this.successHeading  = '#rightPanel h1.title';
    this.validationError = '.error';
  }

  async fillForm(user) {
    await this.typeInto(this.firstNameInput,  user.firstName);
    await this.typeInto(this.lastNameInput,   user.lastName);
    await this.typeInto(this.streetInput,     user.street);
    await this.typeInto(this.cityInput,       user.city);
    await this.typeInto(this.stateInput,      user.state);
    await this.typeInto(this.zipInput,        user.zip);
    await this.typeInto(this.phoneInput,      user.phone);
    await this.typeInto(this.ssnInput,        user.ssn);
    await this.typeInto(this.usernameInput,   user.username);
    await this.typeInto(this.passwordInput,   user.password);
    await this.typeInto(this.confirmPassword, user.password);
  }

  // Used to test partial submission — only first name, rest left blank
  async fillFirstNameOnly(firstName) {
    await this.typeInto(this.firstNameInput, firstName);
  }

  // Fill every field with spaces to check if server-side validation trims input
  async fillWithWhitespace() {
    const spaces = '   ';
    const fields = [
      this.firstNameInput, this.lastNameInput, this.streetInput,
      this.cityInput, this.stateInput, this.zipInput,
      this.phoneInput, this.ssnInput, this.usernameInput,
      this.passwordInput, this.confirmPassword,
    ];
    for (const f of fields) {
      await this.typeInto(f, spaces);
    }
  }

  // Valid data everywhere except confirm-password doesn't match
  async fillWithMismatchedPasswords(user) {
    await this.typeInto(this.firstNameInput,  user.firstName);
    await this.typeInto(this.lastNameInput,   user.lastName);
    await this.typeInto(this.streetInput,     user.street);
    await this.typeInto(this.cityInput,       user.city);
    await this.typeInto(this.stateInput,      user.state);
    await this.typeInto(this.zipInput,        user.zip);
    await this.typeInto(this.phoneInput,      user.phone);
    await this.typeInto(this.ssnInput,        user.ssn);
    await this.typeInto(this.usernameInput,   user.username);
    await this.typeInto(this.passwordInput,   user.password);
    await this.typeInto(this.confirmPassword, 'TotallyDifferent99!');
  }

  // Valid data but swap in an already-registered username to trigger the duplicate error
  async fillWithExistingUsername(user, existingUsername) {
    await this.fillForm({ ...user, username: existingUsername });
  }

  async submit() {
    // Start waiting before the click to avoid the race where navigation
    // completes before waitForLoadState is registered.
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      this.clickOn(this.submitBtn),
    ]);
  }

  async registrationSucceeded() {
    try {
      // After success the heading changes from "Signing up is easy!" to "Welcome [username]"
      await this.page.waitForFunction(
        (sel) => {
          const el = document.querySelector(sel);
          return el && el.textContent.toLowerCase().includes('welcome');
        },
        this.successHeading,
        { timeout: 10000 }
      );
      return true;
    } catch {
      return false;
    }
  }

  async getSuccessHeadingText() {
    return this.readText(this.successHeading);
  }

  async getValidationErrors() {
    // Poll the DOM directly (not visibility) so hidden-but-present spans are caught.
    const sel = this.validationError;
    try {
      await this.page.waitForFunction(
        (s) => document.querySelectorAll(s).length > 0,
        sel,
        { timeout: 5000 }
      );
    } catch {
      // No error elements appeared within the timeout
    }
    return this.page.$$eval(sel, nodes =>
      nodes.map(n => n.textContent.trim()).filter(t => t.length > 0)
    );
  }

  async hasValidationErrors() {
    const errs = await this.getValidationErrors();
    return errs.length > 0;
  }

  async hasErrorContaining(text) {
    const errs = await this.getValidationErrors();
    return errs.some(e => e.toLowerCase().includes(text.toLowerCase()));
  }
}

module.exports = RegistrationPage;
