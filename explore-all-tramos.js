const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('🚀 Opening TRAMOS...');
  await page.goto('https://tramos.systems/iv/', { waitUntil: 'domcontentloaded', timeout: 60000 });

  console.log('\n⏳ Browser opened! Please login to TRAMOS...');
  console.log('1. Login with your credentials');
  console.log('2. After login, press Enter here to start exploration\n');

  await new Promise(resolve => {
    process.stdin.resume();
    process.stdin.once('data', resolve);
  });

  console.log('\n🔍 Starting exploration...\n');

  const results = [];
  const base = 'https://tramos.systems/iv';

  // Pages to explore
  const pages = [
    '/dashboard',
    '/realtime',
    '/tms',
    '/history',
    '/report',
    '/camera-snapshot',
    '/dashcam',
    '/geofence',
    '/control-panel',
    '/vehicle',
    '/driver',
    '/user',
    '/settings'
  ];

  for (const path of pages) {
    try {
      console.log(`📄 ${path}...`);
      await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);

      const info = await page.evaluate(() => {
        // Get all clickable elements
        const allElements = document.querySelectorAll('*');
        const buttons = [];
        const links = [];
        const inputs = [];
        const dropdowns = [];

        allElements.forEach(el => {
          const tag = el.tagName.toLowerCase();
          const text = el.innerText?.trim() || '';
          const rect = el.getBoundingClientRect();

          // Skip hidden elements
          if (rect.width === 0 || rect.height === 0) return;

          if (tag === 'button' || el.getAttribute('role') === 'button') {
            buttons.push(text.substring(0, 60));
          }
          if (tag === 'a' && el.href) {
            links.push({ text: text.substring(0, 60), href: el.href });
          }
          if (tag === 'input') {
            inputs.push({ type: el.type, placeholder: el.placeholder, name: el.name });
          }
          if (tag === 'select') {
            dropdowns.push(text.substring(0, 60));
          }
        });

        // Get sidebar menu items
        const menuItems = Array.from(document.querySelectorAll('nav a, aside a, .menu a, [class*="menu"] a'))
          .map(a => a.innerText?.trim())
          .filter(t => t && t.length < 50);

        // Get page content
        const content = document.body.innerText.substring(0, 2000);

        return {
          title: document.title,
          buttons: [...new Set(buttons)].slice(0, 20),
          links: links.slice(0, 15),
          inputs: inputs.slice(0, 10),
          menuItems: [...new Set(menuItems)].slice(0, 20),
          content: content.substring(0, 1000)
        };
      });

      results.push({ path, ...info });
      console.log(`   ✅ Found ${info.buttons.length} buttons, ${info.links.length} links`);

    } catch (e) {
      console.log(`   ❌ ${e.message}`);
    }
  }

  // Take final screenshot
  await page.screenshot({ path: '/Users/vdr/Documents/GPS/tramos-final.png', fullPage: true });

  // Save results
  const fs = require('fs');
  fs.writeFileSync('/Users/vdr/Documents/GPS/tramos-full-analysis.json', JSON.stringify(results, null, 2));

  console.log('\n\n========================================');
  console.log('FULL ANALYSIS SAVED');
  console.log('========================================');
  console.log('\n📁 Files created:');
  console.log('   - /Users/vdr/Documents/GPS/tramos-full-analysis.json');
  console.log('   - /Users/vdr/Documents/GPS/tramos-final.png');

  await browser.close();
})();
