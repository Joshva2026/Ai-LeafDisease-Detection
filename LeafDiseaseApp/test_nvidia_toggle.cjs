const puppeteer = require('puppeteer');

async function runTests() {
  console.log("Starting NVIDIA toggle flow UI test...");
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`BROWSER [${msg.type()}]: ${msg.text()}`));

  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5173');
  
  await page.evaluate(() => {
    localStorage.setItem("user", JSON.stringify({ username: "TestFarmer" }));
    localStorage.setItem("onboardingCompleted", "true");
  });
  
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Navigate to scan page
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button, div'));
    const scanLink = links.find(el => el.textContent && (el.textContent.includes('Scan') || el.textContent.includes('ஸ்கேன்')));
    if (scanLink) scanLink.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));

  // Upload leaf
  await page.waitForSelector('input[type="file"]', { timeout: 10000 });
  const fileInput = await page.$('input[type="file"]');
  await fileInput.uploadFile('D:\\MINI PROJECT\\LeafDiseaseAPI\\dataset\\test\\Apple___Apple_scab\\002c6f35db42612d.jpg');
  
  await new Promise(r => setTimeout(r, 1000));
  
  const analyzeBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('ANALYZE') || el.textContent.includes('பகுப்பாய்வு'));
  });
  await analyzeBtn.click();

  try {
    await page.waitForSelector('.disease-reveal-container', { timeout: 20000 });
    console.log("Diagnosis page rendered.");
  } catch (e) {
    console.log("ERROR: Diagnosis page did not render.");
    await browser.close();
    return;
  }

  // Wait to ensure rendering
  await new Promise(r => setTimeout(r, 2000));
  
  // Verify basic info
  const metaText = await page.evaluate(() => {
    const el = document.querySelector('.reveal-meta-row');
    return el ? el.textContent : null;
  });
  console.log(`Meta Row Info: ${metaText}`);
  
  // Check if AI report button is visible
  const reportBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Need Full AI'));
  });
  
  if (reportBtn) {
    console.log("AI Report Button Found.");
    await page.screenshot({ path: 'D:\\MINI PROJECT\\LeafDiseaseApp\\before_ai_report.png' });
    console.log("Screenshot before_ai_report.png saved.");
    
    // Click it
    await reportBtn.click();
    console.log("Clicked AI Report Button.");
    
    await new Promise(r => setTimeout(r, 1000));
    
    const reportHeaderVisible = await page.evaluate(() => {
      const el = document.querySelector('.report-header-banner');
      return el !== null;
    });
    console.log(`Report Header visible after click: ${reportHeaderVisible}`);
    
    await page.screenshot({ path: 'D:\\MINI PROJECT\\LeafDiseaseApp\\after_ai_report.png' });
    console.log("Screenshot after_ai_report.png saved.");
    
  } else {
    console.log("ERROR: AI Report Button NOT Found.");
  }

  await browser.close();
}

runTests().catch(console.error);
