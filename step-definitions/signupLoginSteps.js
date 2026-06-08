'use strict';

const { Given, When, Then } = require('@cucumber/cucumber');
const { expect }            = require('@playwright/test');

const HomePage             = require('../pages/HomePage');
const RegistrationPage     = require('../pages/RegistrationPage');
const AccountsOverviewPage = require('../pages/AccountsOverviewPage');
const { newUser }          = require('../test-data/userDataGenerator');

// ---------------------------------------------------------------------------
// GIVEN
// ---------------------------------------------------------------------------

Given('the ParaBank home page is open', async function () {
  this.home = new HomePage(this.page);
  await this.home.open();
});

Given('I have already registered an account', async function () {
  this.user = newUser();

  const reg = new RegistrationPage(this.page);
  await this.home.goToRegistration();
  await reg.fillForm(this.user);
  await reg.submit();

  const ok = await reg.registrationSucceeded();
  expect(ok, 'Pre-condition failed: background account creation did not succeed').toBe(true);

  // Registration auto-logs the user in — log out first so subsequent steps
  // that interact with the login panel find it in the expected state.
  const overview = new AccountsOverviewPage(this.page);
  await overview.logout();
  await this.home.open();
});

// ---------------------------------------------------------------------------
// WHEN — Registration
// ---------------------------------------------------------------------------

When('I click the Register link', async function () {
  this.reg = new RegistrationPage(this.page);
  await this.home.goToRegistration();
});

When('I complete the registration form with valid details', async function () {
  this.user = newUser();
  await this.reg.fillForm(this.user);
});

When('I submit the form', async function () {
  await this.reg.submit();
});

When('I submit the form without entering anything', async function () {
  this.reg = new RegistrationPage(this.page);
  await this.home.goToRegistration();
  await this.reg.submit();
});

When('I fill in only the first name and submit', async function () {
  await this.reg.fillFirstNameOnly('Jane');
  await this.reg.submit();
});

When('I fill the registration form with whitespace in every field', async function () {
  await this.reg.fillWithWhitespace();
});

When('I fill the form with valid details but mismatched passwords', async function () {
  this.user = newUser();
  await this.reg.fillWithMismatchedPasswords(this.user);
});

When('I fill the form with the same username that was just registered', async function () {
  // this.user was set during the Given step — reuse that username
  const freshUser = newUser();
  await this.reg.fillWithExistingUsername(freshUser, this.user.username);
});

// ---------------------------------------------------------------------------
// WHEN — Login
// ---------------------------------------------------------------------------

When('I log in with those credentials', async function () {
  expect(this.user, 'No user in context — did the Given step run?').toBeDefined();
  await this.home.loginWith(this.user.username, this.user.password);
});

When('I try to log in with a username that was never registered', async function () {
  await this.home.loginWith('nobody_xyz_99', 'Wr0ngPassw0rd!');
});

When('I try to log in with the correct username but the wrong password', async function () {
  expect(this.user).toBeDefined();
  await this.home.loginWith(this.user.username, 'AbsolutelyWrongPass!99');
});

When('I submit the login form with only a password and no username', async function () {
  await this.home.loginWithPasswordOnly('Test@1234');
});

When('I submit the login form with only a username and no password', async function () {
  await this.home.loginWithUsernameOnly('jane_someuser');
});

When('I submit the login form with both fields empty', async function () {
  await this.home.submitEmptyLoginForm();
});

When('I try to log in with the username in the wrong case', async function () {
  expect(this.user).toBeDefined();
  // Flip the case — if 'jane_123' was registered, try 'JANE_123'
  const wrongCase = this.user.username.toUpperCase();
  await this.home.loginWith(wrongCase, this.user.password);
});

When('I log out', async function () {
  const overview = new AccountsOverviewPage(this.page);
  await overview.logout();
  this.home = new HomePage(this.page);
});

// ---------------------------------------------------------------------------
// THEN — Registration
// ---------------------------------------------------------------------------

Then('the registration should succeed', async function () {
  const succeeded = await this.reg.registrationSucceeded();
  expect(succeeded, 'Expected registration success heading but it was not found').toBe(true);
});

Then('the success page should greet me by name', async function () {
  // ParaBank shows "Welcome [username]" on the success heading
  const heading = await this.reg.getSuccessHeadingText();
  expect(heading).toContain(this.user.username);
});

Then('I should see field-level validation errors', async function () {
  const errors = await this.reg.getValidationErrors();
  expect(
    errors.length,
    `Expected validation errors but the page returned: ${JSON.stringify(errors)}`
  ).toBeGreaterThan(0);
});

Then('I should see a password mismatch error', async function () {
  const hasIt = await this.reg.hasErrorContaining('password');
  const errors = await this.reg.getValidationErrors();
  expect(
    hasIt,
    `Expected a password-related error. Actual errors: ${JSON.stringify(errors)}`
  ).toBe(true);
});

Then('I should see a username-already-exists error', async function () {
  // ParaBank returns "This username already exists." for duplicates
  const hasIt = await this.reg.hasErrorContaining('username already');
  const errors = await this.reg.getValidationErrors();
  expect(
    hasIt,
    `Expected a duplicate-username error. Actual errors on page: ${JSON.stringify(errors)}`
  ).toBe(true);
});

// ---------------------------------------------------------------------------
// THEN — Login
// ---------------------------------------------------------------------------

Then('I should land on the accounts overview', async function () {
  this.overview = new AccountsOverviewPage(this.page);
  const loaded = await this.overview.isLoaded();
  expect(loaded, 'Accounts overview table was not visible after login').toBe(true);
});

Then('the account balance should be visible on screen', async function () {
  const balance = await this.overview.getTotalBalance();
  expect(balance, 'Expected a balance value in the accounts table').toBeTruthy();
});

Then('the balance figure should be printed to the console', async function () {
  const result = await this.overview.printBalances();
  // Not asserting on the dollar amount — it will differ per account.
  // Just confirming something came back.
  expect(result.accountBalance).toBeTruthy();
});

Then('the page should show a login error', async function () {
  const errorShown = await this.home.anyLoginErrorIsShown();
  expect(errorShown, 'Expected a login error message but none was found').toBe(true);
});
