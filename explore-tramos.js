const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = [];

  async function explorePage(name, url) {
    try {
      console.log(`\n📄 Exploring: ${name}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Get page title
      const title = await page.title();

      // Get all links
      const links = await page.evaluate(() => {
        const anchors = document.querySelectorAll('a[href]');
        return Array.from(anchors).map(a => ({
          text: a.innerText.trim().substring(0, 50),
          href: a.href
        })).filter(a => a.href && a.href.startsWith('http'));
      });

      // Get all buttons
      const buttons = await page.evaluate(() => {
        const btns = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');
        return Array.from(btns).map(b => ({
          text: b.innerText.trim().substring(0, 50) || b.value || b.type || 'button',
          type: b.tagName.toLowerCase()
        }));
      });

      // Get all inputs
      const inputs = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, select, textarea');
        return Array.from(inputs).map(i => ({
          type: i.type || i.tagName.toLowerCase(),
          placeholder: i.placeholder || '',
          name: i.name || ''
        }));
      });

      // Get main content
      const mainContent = await page.evaluate(() => {
        const body = document.body.innerText.substring(0, 3000);
        return body;
      });

      results.push({
        name,
        url,
        title,
        links: links.slice(0, 20),
        buttons: buttons.slice(0, 30),
        inputs: inputs.slice(0, 20),
        contentPreview: mainContent.substring(0, 500)
      });

      console.log(`  ✅ Found ${links.length} links, ${buttons.length} buttons, ${inputs.length} inputs`);

    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }
  }

  // Base URL
  const base = 'https://tramos.systems/iv';

  // Explore all main pages
  await explorePage('Dashboard', `${base}/dashboard`);
  await explorePage('Realtime Monitor', `${base}/realtime`);
  await explorePage('Task Monitor', `${base}/tms`);
  await explorePage('History', `${base}/history`);
  await explorePage('Report', `${base}/report`);
  await explorePage('Camera Snapshot', `${base}/camera-snapshot`);
  await explorePage('Dashcam Monitor', `${base}/dashcam`);
  await explorePage('Geofence', `${base}/geofence`);
  await explorePage('Control Panel', `${base}/control-panel`);
  await explorePage('Vehicle', `${base}/vehicle`);
  await explorePage('Driver', `${base}/driver`);
  await explorePage('User', `${base}/user`);
  await explorePage('Settings', `${base}/settings`);

  // Take screenshot of current page
  await page.screenshot({ path: '/Users/vdr/Documents/GPS/tramos-full-explore.png', fullPage: true });

  // Output results
  console.log('\n\n========================================');
  console.log('TRAMOS FULL EXPLORATION RESULTS');
  console.log('========================================\n');

  for (const r of results) {
    console.log(`\n📌 ${r.name}`);
    console.log(`   URL: ${r.url}`);
    console.log(`   Title: ${r.title}`);
    console.log(`   Links: ${r.links.length}`);
    console.log(`   Buttons: ${r.buttons.length}`);
    console.log(`   Inputs: ${r.inputs.length}`);
    console.log(`   Content Preview:\n${r.contentPreview.substring(0, 300)}`);
    console.log('   ---');
  }

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('/Users/vdr/Documents/GPS/tramos-exploration.json', JSON.stringify(results, null, 2));
  console.log('\n\n✅ Results saved to tramos-exploration.json');

  await browser.close();
})();
