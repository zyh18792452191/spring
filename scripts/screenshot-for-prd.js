/**
 * PRD原型截图脚本
 * 用法: node scripts/screenshot-for-prd.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:5000';
const OUT_DIR = path.join(__dirname, '..', 'docs', 'PRD文档', 'screenshots');

// 确保输出目录存在
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2, // 2x清晰度
  });

  // ===== 截图1: 区域攻坚主页面 =====
  console.log('📸 截图1: 区域攻坚主页面...');
  const page1 = await context.newPage();
  await page1.goto(`${BASE}/portal/traffic-operations`, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);
  // 点击"区域攻坚"tab
  const assaultTab = await page1.locator('text=区域攻坚').first();
  if (await assaultTab.isVisible()) {
    await assaultTab.click();
    await sleep(3000); // 等待百度地图加载
  }
  // 整体截图
  await page1.screenshot({ path: path.join(OUT_DIR, '01-region-assault-main.png'), fullPage: false });
  console.log('  ✅ 01-region-assault-main.png');

  // ===== 截图2: 作战指挥驾驶舱 =====
  console.log('📸 截图2: 作战指挥驾驶舱...');
  // 驾驶舱在左侧，尝试截取
  const cockpit = await page1.locator('[class*="battle"]').first();
  if (await cockpit.isVisible().catch(() => false)) {
    await cockpit.screenshot({ path: path.join(OUT_DIR, '02-battle-cockpit.png') }).catch(() => {});
  }
  // 如果上面没截到，截取左侧区域
  if (!fs.existsSync(path.join(OUT_DIR, '02-battle-cockpit.png')) || fs.statSync(path.join(OUT_DIR, '02-battle-cockpit.png')).size < 1000) {
    await page1.screenshot({ path: path.join(OUT_DIR, '02-battle-cockpit.png'), clip: { x: 0, y: 100, width: 400, height: 800 } }).catch(() => {});
  }
  console.log('  ✅ 02-battle-cockpit.png');

  // ===== 截图3: 运营作业面板 =====
  console.log('📸 截图3: 运营作业面板...');
  await page1.screenshot({ path: path.join(OUT_DIR, '03-operation-panel.png'), clip: { x: 1520, y: 100, width: 400, height: 800 } }).catch(() => {});
  console.log('  ✅ 03-operation-panel.png');

  await page1.close();

  // ===== 截图4: 派单页面 =====
  console.log('📸 截图4: 派单页面...');
  const page2 = await context.newPage();
  await page2.goto(`${BASE}/portal/traffic-operations/dispatch`, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);
  await page2.screenshot({ path: path.join(OUT_DIR, '04-dispatch-page.png'), fullPage: true });
  console.log('  ✅ 04-dispatch-page.png');

  // 派单页面各折叠面板截图
  // 小区标签区域
  const communityLabel = await page2.locator('text=小区标签').first();
  if (await communityLabel.isVisible().catch(() => false)) {
    const box = await communityLabel.boundingBox();
    if (box) {
      await page2.screenshot({ path: path.join(OUT_DIR, '05-community-labels.png'), clip: { x: box.x - 20, y: box.y - 10, width: 600, height: 200 } });
      console.log('  ✅ 05-community-labels.png');
    }
  }

  // 客户筛选标签区域
  const customerLabel = await page2.locator('text=客户筛选标签').first();
  if (await customerLabel.isVisible().catch(() => false)) {
    const box = await customerLabel.boundingBox();
    if (box) {
      await page2.screenshot({ path: path.join(OUT_DIR, '06-customer-labels.png'), clip: { x: box.x - 20, y: box.y - 10, width: 700, height: 500 } });
      console.log('  ✅ 06-customer-labels.png');
    }
  }

  // 触客策略区域
  const touchStrategy = await page2.locator('text=触客策略').first();
  if (await touchStrategy.isVisible().catch(() => false)) {
    const box = await touchStrategy.boundingBox();
    if (box) {
      await page2.screenshot({ path: path.join(OUT_DIR, '07-touch-strategy.png'), clip: { x: box.x - 20, y: box.y - 10, width: 700, height: 350 } });
      console.log('  ✅ 07-touch-strategy.png');
    }
  }

  // 已选小区列表 - 安全裁剪
  const communityList = await page2.locator('text=已选小区列表').first();
  try {
    if (await communityList.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await communityList.boundingBox();
      if (box) {
        const clipY = Math.max(0, box.y - 10);
        const clipH = Math.min(400, 1080 - clipY);
        if (clipH > 0) {
          await page2.screenshot({ path: path.join(OUT_DIR, '08-community-list.png'), clip: { x: 50, y: clipY, width: 800, height: clipH } });
          console.log('  ✅ 08-community-list.png');
        }
      }
    }
  } catch(e) { console.log('  ⚠️ 08 skipped:', e.message); }

  // 派发信息
  const dispatchInfo = await page2.locator('text=网格通').first();
  try {
    if (await dispatchInfo.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await dispatchInfo.boundingBox();
      if (box) {
        const clipY = Math.max(0, box.y - 50);
        const clipH = Math.min(250, 1080 - clipY);
        const clipX = Math.max(0, box.x - 100);
        const clipW = Math.min(600, 1920 - clipX);
        if (clipH > 0 && clipW > 0) {
          await page2.screenshot({ path: path.join(OUT_DIR, '09-dispatch-info.png'), clip: { x: clipX, y: clipY, width: clipW, height: clipH } });
          console.log('  ✅ 09-dispatch-info.png');
        }
      }
    }
  } catch(e) { console.log('  ⚠️ 09 skipped:', e.message); }

  await page2.close();

  // ===== 截图5: 工单详情页面 =====
  console.log('📸 截图5: 工单详情页面...');
  const page3 = await context.newPage();
  await page3.goto(`${BASE}/workspace/ticket-detail?type=region-assault`, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);
  await page3.screenshot({ path: path.join(OUT_DIR, '10-ticket-detail.png'), fullPage: true });
  console.log('  ✅ 10-ticket-detail.png');

  await page3.close();
  await browser.close();
  console.log('\n🎉 所有截图完成！输出目录:', OUT_DIR);
}

main().catch(e => { console.error(e); process.exit(1); });
