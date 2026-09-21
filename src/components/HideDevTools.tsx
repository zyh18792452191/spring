'use client';

import { useEffect } from 'react';

export default function HideDevTools() {
  useEffect(() => {
    // 移除 Next.js 开发工具浮动按钮
    const removeDevTools = () => {
      // 尝试多种选择器
      const selectors = [
        '[id^="nextjs-devtools"]',
        '[id*="nextjs"]',
        '.nextjs-devtools',
        '[data-nextjs-devtools]',
        'iframe[id*="nextjs"]',
        'iframe[src*="nextjs"]',
        'div[class*="devtools"]',
        'div[style*="z-index"][style*="fixed"]', // 可能是固定的浮动按钮
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const el = element as HTMLElement;
          // 检查是否是开发工具相关的元素
          if (el.textContent?.includes('Route') ||
              el.textContent?.includes('Bundler') ||
              el.textContent?.includes('Preferences')) {
            el.style.display = 'none';
            el.remove();
          }
        });
      });

      // 查找所有固定定位的按钮（可能是开发工具浮标）
      const allDivs = document.querySelectorAll('div');
      allDivs.forEach(div => {
        const el = div as HTMLElement;
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' &&
            style.zIndex &&
            parseInt(style.zIndex) > 1000 &&
            el.textContent?.includes('Route')) {
          el.style.display = 'none';
          el.remove();
        }
      });
    };

    // 立即执行一次
    removeDevTools();

    // 定时检查（防止动态加载）
    const interval = setInterval(removeDevTools, 1000);

    // 监听 DOM 变化
    const observer = new MutationObserver(() => {
      removeDevTools();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return null;
}
