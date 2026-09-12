const puppeteer = require('puppeteer');

(async () => { 
  const browser = await puppeteer.launch({headless: 'new'}); 
  const page = await browser.newPage(); 
  await page.goto('http://localhost:5173'); 
  await new Promise(r => setTimeout(r, 2000)); 
  
  const loginBtn = await page.$('.btn-phase0-signin');
  if (loginBtn) {
    await loginBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    const input = await page.$('input');
    await input.type('Test');
    const submit = await page.$('button[type="submit"]');
    await submit.click();
    await new Promise(r => setTimeout(r, 3000));
  }
  
  // click skip onboarding if present
  const skip = await page.$('.btn-skip');
  if (skip) {
    await skip.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  const html = await page.evaluate(() => document.body.innerHTML); 
  console.log(html.substring(0, 1500)); 
  await browser.close(); 
})();
