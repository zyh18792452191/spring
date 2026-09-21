const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer',
      '--disable-gpu'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log('正在访问首页...');
    await page.goto('http://localhost:5000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('等待页面加载完成...');
    await page.waitForTimeout(3000);

    console.log('截取首页完整页面...');
    await page.screenshot({
      path: '/tmp/homepage_full.png',
      fullPage: true
    });

    console.log('截取首页首屏...');
    await page.screenshot({
      path: '/tmp/homepage_first.png',
      fullPage: false
    });

    console.log('截图完成！');
    console.log('首页完整截图: /tmp/homepage_full.png');
    console.log('首页首屏截图: /tmp/homepage_first.png');
  } catch (error) {
    console.error('截图失败:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
