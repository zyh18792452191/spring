#!/usr/bin/env python3
"""截取AI洞察报告相关页面截图，用于嵌入PRD文档"""

from playwright.sync_api import sync_playwright
import os
import time

SCREENSHOT_DIR = '/workspace/projects/docs/PRD文档/screenshots'
BASE_URL = 'http://localhost:5000'
WIDTH = 1280

os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def save_screenshot(page, name, selector=None, full_page=False):
    path = os.path.join(SCREENSHOT_DIR, f'{name}.png')
    if selector:
        el = page.query_selector(selector)
        if el:
            el.screenshot(path=path)
        else:
            print(f'  [WARN] selector not found: {selector}')
            page.screenshot(path=path, full_page=full_page)
    else:
        page.screenshot(path=path, full_page=full_page)
    size = os.path.getsize(path)
    print(f'  saved: {name}.png ({size} bytes)')
    return path

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': WIDTH, 'height': 900})
    
    # ========== 1. AI洞察助手主页面 ==========
    print('=== AI洞察助手 ===')
    page = context.new_page()
    page.goto(f'{BASE_URL}/workspace/ai-insight', wait_until='networkidle', timeout=30000)
    time.sleep(3)
    
    # 1.1 主页面（开始页/需求收集阶段）
    save_screenshot(page, 'ai-insight-main', full_page=True)
    
    # 1.2 展开对话列表
    # 点击汉堡图标展开侧栏
    hamburger = page.query_selector('button[aria-label*="对话"], button:has(svg.lucide-menu), button:has(svg.lucide-panel-left)')
    if not hamburger:
        # 尝试更宽泛的选择
        hamburger = page.query_selector('button:first-child')
    if hamburger:
        try:
            hamburger.click()
            time.sleep(1)
            save_screenshot(page, 'ai-insight-conversation-list')
        except:
            save_screenshot(page, 'ai-insight-conversation-list')
    else:
        save_screenshot(page, 'ai-insight-conversation-list')
    
    # 1.3 快捷入口卡片（开始页状态下）
    # 回到新对话状态
    page.goto(f'{BASE_URL}/workspace/ai-insight', wait_until='networkidle', timeout=30000)
    time.sleep(2)
    save_screenshot(page, 'ai-insight-start-page')
    
    # ========== 2. 数据源管理页面 ==========
    print('=== 数据源管理 ===')
    page2 = context.new_page()
    page2.goto(f'{BASE_URL}/workspace/ai-insight/datasources', wait_until='networkidle', timeout=30000)
    time.sleep(3)
    save_screenshot(page2, 'datasource-list', full_page=True)
    
    # 点击详情按钮
    detail_btn = page2.query_selector('button:has-text("详情")')
    if detail_btn:
        try:
            detail_btn.click()
            time.sleep(1)
            save_screenshot(page2, 'datasource-detail-dialog')
        except:
            pass
    
    # ========== 3. 模板管理页面 ==========
    print('=== 模板管理 ===')
    page3 = context.new_page()
    page3.goto(f'{BASE_URL}/workspace/ai-insight/templates', wait_until='networkidle', timeout=30000)
    time.sleep(3)
    save_screenshot(page3, 'template-list', full_page=True)
    
    # ========== 4. AI对话创建模板 ==========
    print('=== AI对话创建模板 ===')
    page4 = context.new_page()
    page4.goto(f'{BASE_URL}/workspace/ai-insight/templates/ai-create', wait_until='networkidle', timeout=30000)
    time.sleep(3)
    save_screenshot(page4, 'template-ai-create', full_page=True)
    
    # ========== 5. 手动创建模板 ==========
    print('=== 手动创建模板 ===')
    page5 = context.new_page()
    page5.goto(f'{BASE_URL}/workspace/ai-insight/templates/edit', wait_until='networkidle', timeout=30000)
    time.sleep(3)
    save_screenshot(page5, 'template-manual-edit', full_page=True)
    
    # ========== 6. 从历史报告提取 ==========
    print('=== 从历史报告提取 ===')
    page6 = context.new_page()
    page6.goto(f'{BASE_URL}/workspace/ai-insight/templates/extract', wait_until='networkidle', timeout=30000)
    time.sleep(3)
    save_screenshot(page6, 'template-extract', full_page=True)
    
    # ========== 7. 下载专区 ==========
    print('=== 下载专区 ===')
    page7 = context.new_page()
    page7.goto(f'{BASE_URL}/portal/capability/download/zone', wait_until='networkidle', timeout=30000)
    time.sleep(3)
    save_screenshot(page7, 'download-zone', full_page=True)
    
    # 切换到AI洞察分析Tab
    ai_tab = page7.query_selector('button:has-text("AI洞察"), [role="tab"]:has-text("AI洞察")')
    if ai_tab:
        try:
            ai_tab.click()
            time.sleep(2)
            save_screenshot(page7, 'download-zone-ai-tab')
        except:
            pass
    
    browser.close()
    print('\n=== 截图完成 ===')
    # 列出所有截图文件及大小
    for f in sorted(os.listdir(SCREENSHOT_DIR)):
        if f.endswith('.png'):
            size = os.path.getsize(os.path.join(SCREENSHOT_DIR, f))
            print(f'  {f}: {size} bytes')
