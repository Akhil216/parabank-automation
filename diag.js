'use strict';
const { chromium } = require('playwright');

async function testScenario(page, label, fillFn) {
  await page.goto('https://parabank.parasoft.com/parabank/index.htm?ConnType=JDBC');
  await page.waitForLoadState('domcontentloaded');
  await page.click('#loginPanel a[href*="register"]');
  await page.waitForLoadState('domcontentloaded');

  await fillFn(page);

  await page.click('input[value="Register"]');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  const errors = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.error')).map(n => n.textContent.trim())
  );
  const h1 = await page.evaluate(() => {
    const el = document.querySelector('#rightPanel h1.title');
    return el ? el.textContent.trim() : 'NOT FOUND';
  });
  const url = page.url();
  const rightText = await page.evaluate(() => {
    const el = document.querySelector('#rightPanel');
    return el ? el.innerText.substring(0, 300) : '';
  });
  console.log(`\n=== ${label} ===`);
  console.log('URL:', url);
  console.log('h1:', h1);
  console.log('Errors:', JSON.stringify(errors));
  console.log('Right panel text:', rightText.substring(0, 200));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Whitespace test
  await testScenario(page, 'Whitespace', async (p) => {
    const spaces = '   ';
    const fields = [
      '#customer\\.firstName', '#customer\\.lastName', '#customer\\.address\\.street',
      '#customer\\.address\\.city', '#customer\\.address\\.state', '#customer\\.address\\.zipCode',
      '#customer\\.phoneNumber', '#customer\\.ssn', '#customer\\.username',
      '#customer\\.password', '#repeatedPassword',
    ];
    for (const f of fields) await p.fill(f, spaces);
  });

  // Password mismatch test
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 900000000) + 100000000;
  const ssn = `${String(rand).slice(0, 3)}-${String(rand).slice(3, 5)}-${String(rand).slice(5)}`;

  await testScenario(page, 'Password mismatch', async (p) => {
    await p.fill('#customer\\.firstName', 'Jane');
    await p.fill('#customer\\.lastName', 'Tester');
    await p.fill('#customer\\.address\\.street', '45 Elm St');
    await p.fill('#customer\\.address\\.city', 'Austin');
    await p.fill('#customer\\.address\\.state', 'TX');
    await p.fill('#customer\\.address\\.zipCode', '78701');
    await p.fill('#customer\\.phoneNumber', '5125550199');
    await p.fill('#customer\\.ssn', ssn);
    await p.fill('#customer\\.username', `mm_${ts}`);
    await p.fill('#customer\\.password', 'Test@1234');
    await p.fill('#repeatedPassword', 'TotallyDifferent99!');
  });

  await browser.close();
})();
