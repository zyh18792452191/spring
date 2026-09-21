const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    channel: 'chromium-headless-shell',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log('正在访问首页...');
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });

    console.log('等待页面加载完成...');
    await page.waitForTimeout(2000);

    console.log('点击市场份额卡片...');
    // 点击第一个卡片（市场份额）
    const firstCard = await page.locator('.metric-card').first();
    await firstCard.click();
    await page.waitForTimeout(1000);

    console.log('截取市场份额详情...');
    // 找到市场份额详情模块
    const detailModule = await page.locator('.metric-detail').first();
    if (await detailModule.isVisible()) {
      await detailModule.screenshot({ path: '/tmp/market_share_detail.png', type: 'png' });
      console.log('市场份额详情截图: /tmp/market_share_detail.png');
    } else {
      console.log('未找到市场份额详情模块');
    }

  } catch (error) {
    console.error('截图失败:', error);
  } finally {
    await browser.close();
  }
})();
