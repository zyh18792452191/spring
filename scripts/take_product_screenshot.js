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

    // 截取产品TOP3部分
    console.log('截取产品TOP3部分...');
    await page.screenshot({
      path: '/tmp/product_top3.png',
      clip: { x: 0, y: 1000, width: 1920, height: 500 }
    });

    console.log('截图完成！');
    console.log('产品TOP3: /tmp/product_top3.png');
  } catch (error) {
    console.error('截图失败:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
