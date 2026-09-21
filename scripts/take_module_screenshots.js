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

    // 截取首页完整页面
    console.log('截取首页完整页面...');
    await page.screenshot({
      path: '/tmp/homepage_full.png',
      fullPage: true
    });

    // 截取指标总览部分
    console.log('截取指标总览部分...');
    const metricsSection = await page.locator('section').filter({ hasText: '指标总览' }).first();
    await metricsSection.screenshot({ path: '/tmp/metrics_overview.png' });

    // 截取市场模块部分
    console.log('截取市场模块部分...');
    const marketSection = await page.locator('').filter({ hasText: '市场份额' }).first();
    try {
      await marketSection.screenshot({ path: '/tmp/market_module.png' });
    } catch (e) {
      console.log('市场模块截图失败，尝试截取页面上半部分...');
      await page.screenshot({
        path: '/tmp/market_module.png',
        clip: { x: 0, y: 200, width: 1920, height: 800 }
      });
    }

    // 截取客户模块部分
    console.log('截取客户模块部分...');
    await page.screenshot({
      path: '/tmp/customer_module.png',
      clip: { x: 0, y: 800, width: 1920, height: 600 }
    });

    // 截取渠道模块部分
    console.log('截取渠道模块部分...');
    await page.screenshot({
      path: '/tmp/channel_module.png',
      clip: { x: 1200, y: 200, width: 700, height: 600 }
    });

    // 截取产品TOP3部分
    console.log('截取产品TOP3部分...');
    await page.screenshot({
      path: '/tmp/product_top3.png',
      clip: { x: 0, y: 1200, width: 1920, height: 400 }
    });

    console.log('截图完成！');
    console.log('首页完整截图: /tmp/homepage_full.png');
    console.log('指标总览: /tmp/metrics_overview.png');
    console.log('市场模块: /tmp/market_module.png');
    console.log('客户模块: /tmp/customer_module.png');
    console.log('渠道模块: /tmp/channel_module.png');
    console.log('产品TOP3: /tmp/product_top3.png');
  } catch (error) {
    console.error('截图失败:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
