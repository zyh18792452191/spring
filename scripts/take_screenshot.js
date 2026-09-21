const { chromium } = require('playwright');

async function generateScreenshots() {
  console.log('启动浏览器...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    console.log('访问首页...');
    await page.goto('http://localhost:5000/portal/market/overview', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('等待页面加载...');
    await page.waitForTimeout(5000);

    // 检查页面是否加载
    const title = await page.title();
    console.log('页面标题:', title);

    console.log('截取首页...');
    await page.screenshot({ path: '/tmp/homepage_full.png', fullPage: true });

    console.log('截取首屏...');
    await page.screenshot({ path: '/tmp/homepage_hero.png', fullPage: false });

    console.log('✅ 截图成功');
    console.log('首页完整:', '/tmp/homepage_full.png');
    console.log('首页首屏:', '/tmp/homepage_hero.png');
  } catch (error) {
    console.error('❌ 截图失败:', error);
  }

  await browser.close();
}

generateScreenshots().catch(console.error);
