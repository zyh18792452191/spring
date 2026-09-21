/**
 * 架构图 HTML 溢出检查：检测横向溢出/文本被裁切的元素
 * 用法: node scripts/check-diagram-overflow.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const FILES = [
  'scripts/strategy-arch-diagram.html',
  'scripts/strategy-evolution-diagram.html',
  'scripts/strategy-asis-diagram.html',
  'scripts/strategy-compare-diagram.html',
  'scripts/strategy-phase-plan-diagram.html',
];
const EXEC = ['/root/.cache/ms-playwright/chromium-1161/chrome-linux/chrome'].find((p) => fs.existsSync(p));

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: EXEC, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 2400, height: 1400 } });

  for (const f of FILES) {
    await page.goto('file://' + path.join(ROOT, f), { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const issues = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('*').forEach((el) => {
        const cs = getComputedStyle(el);
        const overflowX = el.scrollWidth - el.clientWidth;
        const overflowY = el.scrollHeight - el.clientHeight;
        if ((overflowX > 2 || overflowY > 2) && cs.overflow !== 'visible') {
          out.push({
            tag: el.tagName,
            cls: el.className,
            text: (el.textContent || '').trim().slice(0, 40),
            overflowX,
            overflowY,
          });
        }
      });
      return { issues: out, docWidth: document.documentElement.scrollWidth, bodyWidth: document.body.clientWidth };
    });
    console.log(`\n=== ${f} ===`);
    console.log('document scrollWidth:', issues.docWidth, '| body clientWidth:', issues.bodyWidth);
    if (!issues.issues.length) console.log('✅ 无溢出元素');
    issues.issues.forEach((i) => console.log(`  溢出入: <${i.tag} class="${i.cls}"> X+${i.overflowX} Y+${i.overflowY} :: ${i.text}`));
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
