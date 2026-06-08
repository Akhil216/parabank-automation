'use strict';

const BasePage = require('./BasePage');

// This is the page you land on after a successful login.
// The accounts table takes a second to load (XHR), so there's an explicit
// wait on the table before any balance reads.

class AccountsOverviewPage extends BasePage {

  constructor(page) {
    super(page);

    this.accountsTable   = '#accountTable';
    this.firstRowBalance = '#accountTable tbody tr:first-child td:nth-child(2)';
    // ParaBank places the Total row as the last <tr> inside <tbody>, not in <tfoot>.
    // The actual <tfoot> only holds a footnote with colspan="3".
    this.totalBalance    = '#accountTable tbody tr:last-child td:nth-child(2)';
    this.logoutLink      = 'a[href*="logout"]';
  }

  async waitForTable() {
    await this.page.waitForSelector(this.accountsTable, { timeout: 15000 });
  }

  async isLoaded() {
    try {
      await this.waitForTable();
      return true;
    } catch {
      return false;
    }
  }

  async getFirstAccountBalance() {
    // The balance cells load via XHR after the table container appears,
    // so wait for the specific cell rather than just the table wrapper.
    await this.page.waitForSelector(this.firstRowBalance, { timeout: 15000 });
    const raw = await this.page.textContent(this.firstRowBalance);
    return raw ? raw.trim() : null;
  }

  async getTotalBalance() {
    await this.page.waitForSelector(this.totalBalance, { timeout: 15000 });
    const raw = await this.readText(this.totalBalance);
    return raw ? raw.trim() : null;
  }

  // The task specifically asks to log/print the balance after login.
  // Doing both individual and total so it's clear either way.
  async printBalances() {
    const accountBalance = await this.getFirstAccountBalance();
    const total          = await this.getTotalBalance();

    console.log('');
    console.log('--- Account Balance (post-login) ---');
    console.log(`Account Balance : ${accountBalance}`);
    console.log(`Total           : ${total}`);
    console.log('------------------------------------');
    console.log('');

    return { accountBalance, total };
  }

  async logout() {
    await this.clickOn(this.logoutLink);
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = AccountsOverviewPage;
