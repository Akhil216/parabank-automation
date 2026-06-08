# parabank-e2e

Playwright + Cucumber automation for the ParaBank demo site, covering the
registration and login flows. Written in JavaScript with a BDD feature file
and page objects per page.

**App under test:** https://parabank.parasoft.com/parabank/index.htm?ConnType=JDBC

---

## Stack

- **Playwright** for browser automation
- **Cucumber.js** for BDD (Gherkin feature files)
- **Page Object Model** — one class per page under `pages/`
- Node.js 18+

---

## Setup

```bash
npm install
npx playwright install chromium
```

---

## Running the tests

```bash
# All scenarios
npm test

# Smoke tests only
npm run test:smoke

# Full signup-to-login round trip
npm run test:e2e

# See the browser while it runs
npm run test:headed
```

HTML report is written to `reports/test-report.html` after each run.

---

## Project layout

```
features/
  signup-login.feature     Gherkin scenarios

pages/
  BasePage.js              Shared Playwright helpers
  HomePage.js              Login form + register link
  RegistrationPage.js      New account form
  AccountsOverviewPage.js  Post-login dashboard

step-definitions/
  signupLoginSteps.js      Step implementations

support/
  hooks.js                 Browser setup, teardown, screenshot on failure

test-data/
  userDataGenerator.js     Builds a unique user object per test run
```

---

## Notes

- Usernames are timestamped to avoid duplicate-account errors on the demo server
- The accounts table loads via XHR so the page object waits on it explicitly before reading balances
- Failed scenarios automatically attach a full-page screenshot to the HTML report
- The `HEADLESS=false` env var switches to headed mode without touching any config file

---

## Scenarios covered

| Tag | What it tests |
|-----|---------------|
| `@smoke @registration` | Happy-path registration |
| `@smoke @login` | Login with pre-registered account, balance logged |
| `@end-to-end` | Register → logout → login in one test |
| `@negative` | Empty form submission (validation errors) |
| `@negative` | Login with credentials that don't exist |
