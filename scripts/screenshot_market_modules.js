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
    console.log('正在访问市场运营平台首页...');
    await page.goto('http://localhost:5000/portal/market/overview', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('等待页面加载完成...');
    await page.waitForTimeout(3000);

    // 截取完整页面作为参考
    console.log('截取完整页面...');
    await page.screenshot({
      path: '/tmp/market_overview_full.png',
      fullPage: true
    });

    // 1. 截取顶部指标总览（4个卡片）
    console.log('截取顶部指标总览...');
    try {
      const metricsSection = await page.locator('.grid.grid-cols-4').first();
      if (await metricsSection.isVisible()) {
        const box = await metricsSection.boundingBox();
        if (box) {
          await page.screenshot({
            path: '/tmp/metrics_overview.png',
            clip: { x: 0, y: box.y - 20, width: 1920, height: box.height + 40 }
          });
          console.log('✓ 指标总览截图成功');
        }
      }
    } catch (e) {
      console.log('✗ 指标总览截图失败，使用备用方案...');
      await page.screenshot({
        path: '/tmp/metrics_overview.png',
        clip: { x: 0, y: 50, width: 1920, height: 200 }
      });
    }

    // 2. 截取市场模块（左侧）
    console.log('截取市场模块...');
    try {
      const marketSection = await page.locator('.col-span-3').first();
      if (await marketSection.isVisible()) {
        const box = await marketSection.boundingBox();
        if (box) {
          await page.screenshot({
            path: '/tmp/market_module.png',
            clip: { x: box.x, y: box.y - 20, width: box.width + 20, height: box.height + 40 }
          });
          console.log('✓ 市场模块截图成功');
        }
      }
    } catch (e) {
      console.log('✗ 市场模块截图失败，使用备用方案...');
      await page.screenshot({
        path: '/tmp/market_module.png',
        clip: { x: 0, y: 280, width: 480, height: 640 }
      });
    }

    // 3. 截取中国地图模块（中间）
    console.log('截取中国地图模块...');
    try {
      const mapSection = await page.locator('.col-span-6').first();
      if (await mapSection.isVisible()) {
        const box = await mapSection.boundingBox();
        if (box) {
          await page.screenshot({
            path: '/tmp/china_map.png',
            clip: { x: box.x, y: box.y - 20, width: box.width + 20, height: box.height + 40 }
          });
          console.log('✓ 中国地图截图成功');
        }
      }
    } catch (e) {
      console.log('✗ 中国地图截图失败，使用备用方案...');
      await page.screenshot({
        path: '/tmp/china_map.png',
        clip: { x: 500, y: 280, width: 960, height: 640 }
      });
    }

    // 4. 截取产品模块（右侧）
    console.log('截取产品模块...');
    try {
      const productSection = await page.locator('.col-span-3').nth(1);
      if (await productSection.isVisible()) {
        const box = await productSection.boundingBox();
        if (box) {
          await page.screenshot({
            path: '/tmp/product_module.png',
            clip: { x: box.x, y: box.y - 20, width: box.width + 20, height: box.height + 40 }
          });
          console.log('✓ 产品模块截图成功');
        }
      }
    } catch (e) {
      console.log('✗ 产品模块截图失败，使用备用方案...');
      await page.screenshot({
        path: '/tmp/product_module.png',
        clip: { x: 1480, y: 280, width: 440, height: 640 }
      });
    }

    // 5. 截取客户模块（底部左侧）
    console.log('截取客户模块...');
    try {
      const customerSection = await page.locator('.col-span-1').first();
      if (await customerSection.isVisible()) {
        const box = await customerSection.boundingBox();
        if (box) {
          await page.screenshot({
            path: '/tmp/customer_module.png',
            clip: { x: 0, y: box.y - 20, width: box.width + 20, height: box.height + 40 }
          });
          console.log('✓ 客户模块截图成功');
        }
      }
    } catch (e) {
      console.log('✗ 客户模块截图失败，使用备用方案...');
      await page.screenshot({
        path: '/tmp/customer_module.png',
        clip: { x: 0, y: 940, width: 960, height: 400 }
      });
    }

    // 6. 截取渠道模块（底部右侧）
    console.log('截取渠道模块...');
    try {
      const channelSection = await page.locator('.col-span-1').nth(1);
      if (await channelSection.isVisible()) {
        const box = await channelSection.boundingBox();
        if (box) {
          await page.screenshot({
            path: '/tmp/channel_module.png',
            clip: { x: box.x, y: box.y - 20, width: box.width + 20, height: box.height + 40 }
          });
          console.log('✓ 渠道模块截图成功');
        }
      }
    } catch (e) {
      console.log('✗ 渠道模块截图失败，使用备用方案...');
      await page.screenshot({
        path: '/tmp/channel_module.png',
        clip: { x: 980, y: 940, width: 940, height: 400 }
      });
    }

    console.log('\n所有截图已完成！');
    console.log('生成的截图文件：');
    console.log('  ✓ market_overview_full.png (完整页面)');
    console.log('  ✓ metrics_overview.png (顶部指标总览)');
    console.log('  ✓ market_module.png (市场模块)');
    console.log('  ✓ china_map.png (中国地图)');
    console.log('  ✓ product_module.png (产品模块)');
    console.log('  ✓ customer_module.png (客户模块)');
    console.log('  ✓ channel_module.png (渠道模块)');

  } catch (error) {
    console.error('截图失败:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
