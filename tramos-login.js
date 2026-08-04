const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,  // Buka browser window
    args: ['--window-size=1440,900']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  console.log('🚀 Membuka TRAMOS login page...');
  await page.goto('https://tramos.systems/iv/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  console.log('✅ Halaman login terbuka!');
  console.log('⏳ Menunggu kamu login manual...');
  console.log('');
  console.log('📋 Instruksi:');
  console.log('1. Browser sudah terbuka');
  console.log('2. Login dengan credentials kamu');
  console.log('3. Setelah login, tekan Enter di terminal ini');
  console.log('4. Saya akan mengambil screenshot halaman');
  console.log('');

  // Tunggu user tekan Enter
  await new Promise(resolve => {
    process.stdin.resume();
    process.stdin.once('data', resolve);
  });

  console.log('');
  console.log('📸 Mengambil screenshot...');

  // Ambil screenshot
  await page.screenshot({
    path: '/Users/vdr/Documents/GPS/tramos-screenshot.png',
    fullPage: true
  });

  console.log('✅ Screenshot saved ke: /Users/vdr/Documents/GPS/tramos-screenshot.png');

  // Get page title and URL
  const title = await page.title();
  const url = page.url();
  console.log(`📄 Page title: ${title}`);
  console.log(`🔗 Current URL: ${url}`);

  // Get visible text content
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log('');
  console.log('📝 Page content preview:');
  console.log('---');
  console.log(bodyText);
  console.log('---');

  await browser.close();
  console.log('');
  console.log('✅ Selesai!');
})();
