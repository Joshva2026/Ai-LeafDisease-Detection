const puppeteer = require('puppeteer');

async function runTests() {
  console.log("Starting ErrorBoundary UI test...");
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
  
  // Intercept network requests to force a malformed NVIDIA response
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('/api/ai/farmer-report')) {
      console.log("Intercepted NVIDIA request. Returning malformed data.");
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          structured_report: {
            diagnosis: "Test Diagnosis",
            immediate_actions: "This is a string, not an array!", // Will cause crash without Array.isArray
            symptoms: null,
            causes: undefined,
            treatment: {},
            prevention: 123
          }
        })
      });
    } else {
      request.continue();
    }
  });

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

  // Wait for report section to resolve
  await new Promise(r => setTimeout(r, 3000));
  
  // Verify if Hero section is still visible
  const heroVisible = await page.evaluate(() => {
    const title = document.querySelector('.reveal-disease-title');
    return title && title.textContent.length > 0;
  });
  
  console.log(`Hero section (Prediction) visible: ${heroVisible}`);

  // Check if Error Boundary is showing
  const errorBoundaryText = await page.evaluate(() => {
    const el = document.querySelector('.report-content-body');
    return el ? el.textContent : null;
  });
  
  console.log(`Report Area Content: ${errorBoundaryText}`);
  
  await page.screenshot({ path: 'D:\\MINI PROJECT\\LeafDiseaseApp\\error_boundary_test.png', fullPage: true });
  console.log("Screenshot saved.");

  await browser.close();
}

runTests().catch(console.error);
