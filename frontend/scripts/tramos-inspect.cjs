const { chromium } = require("playwright");

(async () => {
  const context = await chromium.launchPersistentContext("/tmp/tramos-profile-copy", {
    headless: true,
    executablePath:
      "/Users/vdr/Library/Caches/ms-playwright/chromium-1200/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    viewport: { width: 1440, height: 1000 },
  });
  const page = context.pages()[0] || await context.newPage();
  await page.goto("https://tramos.systems/iv/dashboard", {
    waitUntil: "networkidle",
    timeout: 45000,
  });
  await page.screenshot({ path: "/tmp/vanguard-tramos/dashboard.png", fullPage: true });

  const info = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a[href]")).map((a) => ({
      text: (a.innerText || a.textContent || "").trim().replace(/\s+/g, " "),
      href: a.href,
    })).filter((item) => item.text || item.href.includes("/iv/"));

    const buttons = Array.from(document.querySelectorAll("button, [role='button'], input[type='button'], input[type='submit']")).map((b) => ({
      text: (b.innerText || b.value || b.getAttribute("aria-label") || "").trim().replace(/\s+/g, " "),
      title: b.getAttribute("title") || "",
    })).filter((item) => item.text || item.title);

    return {
      url: location.href,
      title: document.title,
      text: document.body.innerText.slice(0, 9000),
      links,
      buttons,
    };
  });

  console.log(JSON.stringify(info, null, 2));
  await context.close();
})();
