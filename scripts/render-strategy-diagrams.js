/**
 * 策略中心架构图渲染脚本
 * 用法: node scripts/render-strategy-diagrams.js
 * 输入: scripts/strategy-*.html（架构图 / 演进图 / 现状图 / 对比图 / 阶段计划图）
 * 输出: docs/需求设计方案/策略中心功能架构图-三色标注.png
 *       docs/需求设计方案/策略中心智慧运营演进图-三色标注.png
 *       docs/需求设计方案/策略中心现状关系架构图-AsIs.png
 *       docs/需求设计方案/策略中心现状与优化架构对比图.png
 *       docs/需求设计方案/策略中心阶段实现计划图.png
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs', '需求设计方案');

const TASKS = [
  { html: 'scripts/strategy-arch-diagram.html', png: '策略中心功能架构图-三色标注.png' },
  { html: 'scripts/strategy-evolution-diagram.html', png: '策略中心智慧运营演进图-三色标注.png' },
  { html: 'scripts/strategy-asis-diagram.html', png: '策略中心现状关系架构图-AsIs.png' },
  { html: 'scripts/strategy-compare-diagram.html', png: '策略中心现状与优化架构对比图.png' },
  { html: 'scripts/strategy-phase-plan-diagram.html', png: '策略中心阶段实现计划图.png' },
];

const EXECUTABLE_CANDIDATES = [
  process.env.CHROMIUM_EXECUTABLE,
  '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome',
  '/root/.cache/ms-playwright/chromium-1161/chrome-linux/chrome',
].filter(Boolean);

function resolveExecutable() {
  for (const p of EXECUTABLE_CANDIDATES) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const executablePath = resolveExecutable();
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  });
  const context = await browser.newContext({ viewport: { width: 2400, height: 1400 }, deviceScaleFactor: 2 });

  for (const t of TASKS) {
    const page = await context.newPage();
    const url = 'file://' + path.join(ROOT, t.html);
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    // 先把视口压到最小，量出内容真实高度，再按内容高度截图，避免底部空白
    await page.setViewportSize({ width: 2400, height: 200 });
    await page.waitForTimeout(150);
    const contentHeight = await page.evaluate(() =>
      Math.ceil(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight))
    );
    await page.setViewportSize({ width: 2400, height: contentHeight });
    await page.waitForTimeout(200);
    const out = path.join(OUT_DIR, t.png);
    await page.screenshot({ path: out, fullPage: true });
    const size = fs.statSync(out).size;
    console.log(`✅ ${t.png}  ${(size / 1024).toFixed(1)} KB  (2400×${contentHeight})`);
    await page.close();
  }

  await browser.close();
}

main().catch((e) => {
  console.error('❌ 渲染失败:', e);
  process.exit(1);
});
