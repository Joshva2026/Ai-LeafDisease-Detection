const puppeteer = require('puppeteer');
const fs = require('fs');

async function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

async function runTests() {
  console.log("Starting Puppeteer UI test suite...");
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
    } else {
      console.log(`BROWSER log: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.error('BROWSER UNCAUGHT ERROR:', err.toString());
  });

  // 1. Mobile Viewport test
  await page.setViewport({ width: 390, height: 844 });
  
  console.log("Navigating to local app...");
  await page.goto('http://localhost:5173');
  
  console.log("Setting mock login session...");
  await page.evaluate(() => {
    localStorage.setItem("user", JSON.stringify({ username: "TestFarmer", location: "Coimbatore" }));
    localStorage.setItem("onboardingCompleted", "true");
  });
  
  console.log("Reloading to bypass auth and onboarding...");
  await page.reload({ waitUntil: 'networkidle0' });
  
  console.log("Waiting for React to hydrate...");
  await delay(3000); 

  // Upload leaf
  console.log("Uploading leaf...");
  await page.waitForSelector('input[type="file"]', { timeout: 10000 });
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.uploadFile('D:\\MINI PROJECT\\LeafDiseaseAPI\\dataset\\test\\Apple___Apple_scab\\002c6f35db42612d.jpg');
    console.log("File uploaded.");
  } else {
    console.log("ERROR: Could not find file input.");
    await browser.close();
    return;
  }
  
  await delay(1000);
  
  // Find Analyze button
  const analyzeBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('ANALYZE') || el.textContent.includes('பகுப்பாய்வு'));
  });
  
  if (analyzeBtn) {
    console.log("Clicking Analyze button...");
    await analyzeBtn.click();
  } else {
    console.log("ERROR: Could not find analyze button.");
  }

  // Wait for Diagnosis Page
  console.log("Waiting for /predict completion and Diagnosis rendering...");
  try {
    await page.waitForSelector('.disease-reveal-container', { timeout: 20000 });
    console.log("Diagnosis page rendered immediately.");
  } catch (e) {
    console.log("ERROR: Diagnosis page did not render.");
    await browser.close();
    return;
  }

  // Verify dimensions
  console.log("Verifying image container dimensions...");
  const dimensions = await page.evaluate(() => {
    const wrappers = document.querySelectorAll('.reveal-img-wrapper');
    if (wrappers.length < 2) return null;
    return {
      origWidth: wrappers[0].offsetWidth,
      origHeight: wrappers[0].offsetHeight,
      camWidth: wrappers[1].offsetWidth,
      camHeight: wrappers[1].offsetHeight
    };
  });
  console.log(`Image wrapper dimensions: ${JSON.stringify(dimensions)}`);

  // Wait for NVIDIA report status
  console.log("Monitoring NVIDIA report loading state...");
  let reportState = await page.evaluate(() => {
    if (document.querySelector('.ai-report-loading')) return 'loading';
    if (document.querySelector('.ai-report-error')) return 'error';
    if (document.querySelector('.structured-report') || document.querySelector('.unstructured-report')) return 'success';
    return 'blank';
  });
  console.log(`Initial report state: ${reportState}`);

  // Wait for report to resolve
  try {
    await page.waitForFunction(() => {
      return document.querySelector('.structured-report') || document.querySelector('.unstructured-report') || document.querySelector('.ai-report-error');
    }, { timeout: 20000 });
    
    reportState = await page.evaluate(() => {
      if (document.querySelector('.ai-report-loading')) return 'loading';
      if (document.querySelector('.ai-report-error')) return 'error';
      if (document.querySelector('.structured-report') || document.querySelector('.unstructured-report')) return 'success';
      return 'blank';
    });
    console.log(`Final report state: ${reportState}`);
  } catch (e) {
    console.log("Timeout waiting for NVIDIA report to finish.");
  }

  // Test language toggle
  console.log("Testing language toggle...");
  const langToggle = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('.report-lang-toggle button')).find(el => el.textContent === 'English');
  });
  if (langToggle) {
    await langToggle.click();
    console.log("Switched to English.");
    await delay(3000);
  }

  await page.screenshot({ path: 'D:\\MINI PROJECT\\LeafDiseaseApp\\diagnosis_runtime_test.png', fullPage: true });
  console.log("Screenshot saved to diagnosis_runtime_test.png.");

  console.log("Tests complete. Browser closed.");
  await browser.close();
}

runTests().catch(console.error);
