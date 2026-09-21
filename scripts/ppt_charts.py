#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""为PPT V2.0生成高质量matplotlib图表"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
import os

OUT = '/workspace/projects/ppt_images'
os.makedirs(OUT, exist_ok=True)
plt.rcParams['font.sans-serif'] = ['WenQuanYi Micro Hei', 'WenQuanYi Zen Hei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

# 配色
BLUE = '#006BD5'
BLUE_D = '#004E9A'
BLUE_L = '#D1E8FF'
GREEN = '#00A870'
GREEN_L = '#E8F5E9'
ORANGE = '#E86C00'
ORANGE_L = '#FFF3E0'
RED = '#C00000'
RED_L = '#FFEBEE'
PURPLE = '#7B1FA2'
PURPLE_L = '#F3E5F5'
TEAL = '#00696B'
WHITE = '#FFFFFF'
DARK = '#333333'
MID = '#666666'
LIGHT = '#CCCCCC'

def fig16x9(dpi=200):
    """16:9 宽屏 figure"""
    return plt.figure(figsize=(16, 9), dpi=dpi, facecolor=WHITE)

def save(fig, name):
    path = os.path.join(OUT, f'{name}.png')
    fig.savefig(path, bbox_inches='tight', dpi=fig.dpi, facecolor=WHITE, edgecolor='none', pad_inches=0.1)
    plt.close(fig)
    print(f'  saved: {path}')

def draw_box(ax, x, y, w, h, text, fc, ec='none', tc=WHITE, fs=12, fw='bold', alpha=1.0, lw=1, radius=0.15):
    box = FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad={radius}", 
                          facecolor=fc, edgecolor=ec, linewidth=lw, alpha=alpha)
    ax.add_patch(box)
    ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=fs, 
            fontweight=fw, color=tc, wrap=True)

def draw_arrow(ax, x1, y1, x2, y2, color=BLUE, lw=2):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=lw))

# ============================================================
# Chart 1: P1 背景目标 - 现状 vs 目标对比图
# ============================================================
def chart_background():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    # 现状（左侧）
    ax.text(4, 8.2, '现状', ha='center', fontsize=22, fontweight='bold', color=RED)
    # 两个独立方块
    draw_box(ax, 1.5, 5.5, 2.5, 1.5, '运营平台', BLUE, tc=WHITE, fs=16)
    draw_box(ax, 4.5, 5.5, 2.5, 1.5, '精益平台', ORANGE, tc=WHITE, fs=16)
    # 红色虚线
    ax.plot([4.0, 4.5], [6.25, 6.25], color=RED, linestyle='--', lw=3)
    ax.text(4.25, 5.3, '入口分离\n数据不通', ha='center', fontsize=11, color=RED, fontstyle='italic')
    
    # 三个痛点
    pains = ['操作效率低\n两套系统两次登录', '流程割裂大\n指标运营/预警精益/效果回不来', '学习成本高\n两套操作逻辑']
    for i, p in enumerate(pains):
        draw_box(ax, 0.5 + i*2.7, 2.5, 2.4, 1.8, f'✗ {p}', RED_L, ec=RED, tc=DARK, fs=10, fw='normal')
    
    # 目标（右侧）
    ax.text(12, 8.2, '目标', ha='center', fontsize=22, fontweight='bold', color=GREEN)
    # 一个大方块
    draw_box(ax, 9.5, 4.8, 5.0, 2.8, '', BLUE_D, alpha=0.9, radius=0.2)
    sub = ['指标洞察', '预警调度', '执行派单', '效果评估']
    sub_c = [BLUE, ORANGE, GREEN, PURPLE]
    for i, (s, c) in enumerate(zip(sub, sub_c)):
        draw_box(ax, 9.7 + i*1.2, 5.0, 1.0, 1.0, s, c, tc=WHITE, fs=11)
    ax.text(12, 4.5, '统一入口 · 流程闭环', ha='center', fontsize=13, color=GREEN, fontweight='bold')
    
    # 中间大箭头
    ax.annotate('', xy=(9.3, 6.2), xytext=(7.2, 6.2),
                arrowprops=dict(arrowstyle='->', color=BLUE_D, lw=4))
    ax.text(8.25, 6.6, '融合', ha='center', fontsize=16, fontweight='bold', color=BLUE_D)
    
    # 底部6原因
    reasons = ['业务连续性', '代码差异大', '4A前置', '46个接口', '数据迁移', '用户习惯']
    ax.text(8, 1.8, '不能一步到位的原因', ha='center', fontsize=13, fontweight='bold', color=MID)
    for i, r in enumerate(reasons):
        draw_box(ax, 1.0 + i*2.3, 0.3, 2.0, 1.1, r, '#F5F5F5', ec=LIGHT, tc=MID, fs=10, fw='normal')
    
    save(fig, '01_background')

# ============================================================
# Chart 2: P3 9大场景气泡图
# ============================================================
def chart_scenarios():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '9大预警场景（按触发频率分组）', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # 三组
    groups = [
        ('实时触发', ['携转挽留', '全球通投诉', '热线商机'], RED, 8.0),
        ('日预警', ['离网原因追溯', '停机赢回', '铁通赢回'], ORANGE, 5.0),
        ('月预警', ['宽带离网', '全球通离网', '异动客户修复'], BLUE, 2.0),
    ]
    for gname, items, color, y_base in groups:
        draw_box(ax, 0.5, y_base, 2.0, 1.2, gname, color, tc=WHITE, fs=14)
        for i, item in enumerate(items):
            # 气泡
            cx = 4.0 + i*3.8
            cy = y_base + 0.6
            circle = plt.Circle((cx, cy), 1.1, color=color, alpha=0.15)
            ax.add_patch(circle)
            circle2 = plt.Circle((cx, cy), 0.85, color=color, alpha=0.25)
            ax.add_patch(circle2)
            ax.text(cx, cy, item, ha='center', va='center', fontsize=12, fontweight='bold', color=color)
    
    save(fig, '03_scenarios')

# ============================================================
# Chart 3: P3 两套核心流程
# ============================================================
def chart_flows():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    # 流程1
    ax.text(8, 8.2, '流程1：预警驱动', ha='center', fontsize=18, fontweight='bold', color=BLUE)
    steps1 = ['创建预警\n任务', '三级主任\n审批', '预警\n触发', '生成\n工单', '按看管\n派发', '网格通\n执行', '反馈', '效果\n评估']
    for i, s in enumerate(steps1):
        x = 0.8 + i*1.9
        draw_box(ax, x, 6.2, 1.5, 1.2, s, BLUE, tc=WHITE, fs=10)
        if i < len(steps1)-1:
            draw_arrow(ax, x+1.5, 6.8, x+1.9, 6.8, BLUE, 2)
    
    # 流程2
    ax.text(8, 4.5, '流程2：营销任务', ha='center', fontsize=18, fontweight='bold', color=ORANGE)
    steps2 = ['精准营销\n建客群', '精益手工\n工单', '审批', '派发', '跳转IOP', '执行', '反馈', '效果\n评估']
    for i, s in enumerate(steps2):
        x = 0.8 + i*1.9
        draw_box(ax, x, 2.5, 1.5, 1.2, s, ORANGE, tc=WHITE, fs=10)
        if i < len(steps2)-1:
            draw_arrow(ax, x+1.5, 3.1, x+1.9, 3.1, ORANGE, 2)
    
    # 差异标注
    draw_box(ax, 3.5, 0.3, 9.0, 1.2, '核心差异：流程1按看管关系自动派单 | 流程2手动创建+跳转IOP闭环', 
             '#F5F5F5', ec=LIGHT, tc=DARK, fs=12, fw='normal')
    
    save(fig, '03_flows')

# ============================================================
# Chart 4: P6 外部接口中心辐射图
# ============================================================
def chart_interfaces():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '6大系统 · 46个接口', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # 中心
    center_x, center_y = 8, 4.5
    circle = plt.Circle((center_x, center_y), 1.5, color=BLUE_D, alpha=0.9)
    ax.add_patch(circle)
    ax.text(center_x, center_y+0.3, '精益平台', ha='center', fontsize=14, fontweight='bold', color=WHITE)
    ax.text(center_x, center_y-0.3, '46个接口', ha='center', fontsize=11, color=BLUE_L)
    
    # 辐射节点
    nodes = [
        ('网格通\n7+4FTP', 0), ('IOP\n2', 45), ('精准营销\n3', 90),
        ('在线平台\n2', 135), ('CRM\n2', 180), ('大数据平台\n9+5FTP', 225), ('4A\n1', 270),
    ]
    colors = [BLUE, ORANGE, GREEN, RED, PURPLE, TEAL, MID]
    r = 3.8
    for i, (name, angle_deg) in enumerate(nodes):
        angle = np.radians(angle_deg + 15)
        nx = center_x + r * np.cos(angle)
        ny = center_y + r * np.sin(angle)
        c = colors[i % len(colors)]
        # 连线
        ax.plot([center_x, nx], [center_y, ny], color=LIGHT, lw=2, zorder=0)
        # 节点
        circle_n = plt.Circle((nx, ny), 0.9, color=c, alpha=0.85)
        ax.add_patch(circle_n)
        ax.text(nx, ny, name, ha='center', va='center', fontsize=9, fontweight='bold', color=WHITE)
    
    # 底部5条下游通路
    ax.text(8, 0.3, '下游派发通路复用：网格通 / IOP / 在线平台 / CRM / 装维APP → 运营平台直连',
            ha='center', fontsize=12, color=BLUE_D, fontweight='bold')
    
    save(fig, '06_interfaces')

# ============================================================
# Chart 5: P5 能力差异左右对比
# ============================================================
def chart_diff():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '两平台能力差异', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # 左侧：运营平台已有（绿色）
    draw_box(ax, 0.5, 7.0, 6.5, 0.8, '✅ 运营平台已有', GREEN, tc=WHITE, fs=14)
    ops_items = [
        '6种调度类型（指标/策略/客群/商机/区域攻坚/客群商机）',
        '主单+子单双层结构',
        '规则引擎（可配置，零代码扩展）',
        '指标体系 / 策略中心 / 商机管理',
    ]
    for i, item in enumerate(ops_items):
        draw_box(ax, 0.8, 5.5 - i*1.2, 5.9, 0.9, item, GREEN_L, ec=GREEN, tc=DARK, fs=11, fw='normal')
    
    # 右侧：精益平台成熟（橙色）
    draw_box(ax, 9.0, 7.0, 6.5, 0.8, '⚠️ 精益平台成熟', ORANGE, tc=WHITE, fs=14)
    lean_items = [
        '9大预警场景（3实时+3日+3月）',
        '5类工单（单层结构）',
        '分包看管（硬编码，改需发版）',
        '6大系统46接口已打通',
    ]
    for i, item in enumerate(lean_items):
        draw_box(ax, 9.3, 5.5 - i*1.2, 5.9, 0.9, item, ORANGE_L, ec=ORANGE, tc=DARK, fs=11, fw='normal')
    
    # 中间融合方向
    draw_box(ax, 4.5, 0.3, 7.0, 1.2, '融合方向 → 以运营平台为底座，扩展2种调度类型（ALT/CUR）\n派单从硬编码重构为规则引擎', 
             BLUE, tc=WHITE, fs=12)
    
    save(fig, '05_diff')

# ============================================================
# Chart 6: P8 4A票据透传泳道图
# ============================================================
def chart_4a_swimlane():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '4A票据透传流程（泳道图）', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # 4个泳道
    lanes = [('用户', 7.0, BLUE_L), ('运营平台', 5.2, '#E3F0FF'), ('4A系统', 3.4, '#FFF3E0'), ('精益平台', 1.6, GREEN_L)]
    for name, y, color in lanes:
        ax.axhspan(y, y+1.4, color=color, alpha=0.5)
        ax.text(0.3, y+0.7, name, ha='center', va='center', fontsize=10, fontweight='bold', color=MID)
    
    # 步骤
    steps = [
        (2.5, 7.7, '点击精益菜单', BLUE, WHITE),
        (5.0, 5.9, 'CreateAiuap\nTokenSoap', BLUE_D, WHITE),
        (7.5, 3.9, '验证ACCT/PWD\n返回TOKEN', ORANGE, WHITE),
        (10.0, 5.9, 'iframe拼接\nURL?token=...', BLUE_D, WHITE),
        (12.5, 2.3, 'CheckAiuap\nTokenSoap', GREEN, WHITE),
        (14.5, 2.3, '验证通过\n隐藏导航', GREEN_L, DARK),
    ]
    for x, y, text, fc, tc in steps:
        draw_box(ax, x-0.8, y-0.4, 1.6, 0.8, text, fc, tc=tc, fs=9)
    
    # 箭头连接
    arrows = [(2.5,7.3, 5.0,6.3), (5.0,5.5, 7.5,4.3), (7.5,4.3, 10.0,5.5),
              (10.0,5.5, 12.5,2.7), (12.5,2.3, 14.5,2.3)]
    for x1,y1,x2,y2 in arrows:
        draw_arrow(ax, x1, y1, x2, y2, MID, 2)
    
    # 技术要点侧边
    notes = ['Token时效几分钟', '3DES加密', 'SOAP协议', 'XML解析RSP/TOKEN', '错误RSP≠0友好提示', '审计日志上报4A']
    ax.text(15.2, 8.0, '技术要点', fontsize=10, fontweight='bold', color=BLUE_D)
    for i, n in enumerate(notes):
        ax.text(14.5, 7.4-i*0.4, f'• {n}', fontsize=8, color=MID)
    
    save(fig, '08_4a_swimlane')

# ============================================================
# Chart 7: P15 中期融合甘特图
# ============================================================
def chart_gantt():
    fig = fig16x9()
    ax = fig.add_axes([0.05, 0.1, 0.9, 0.8])
    
    tasks = [
        ('报表迁入+适配数据源', 0, 4, BLUE),
        ('规则引擎开发', 0, 3, BLUE),
        ('调度类型扩展(ALT/CUR)', 0, 2, BLUE),
        ('9大场景规则提取', 0.5, 3, BLUE),
        ('看管规则配置', 1, 3, GREEN),
        ('执行监控迁入', 1, 2.5, GREEN),
        ('效果评估迁入', 1.5, 3, GREEN),
        ('工单前端重构', 1, 2, GREEN),
        ('下游接口直连', 2, 2.5, ORANGE),
        ('前端原生替换', 2.5, 2, ORANGE),
        ('报表数据验证', 2, 1.5, ORANGE),
        ('端到端验证', 3, 1, RED),
        ('双轨并行切换', 3, 1, RED),
        ('数据割接', 3.25, 0.75, RED),
        ('iframe页面下线', 3.5, 0.5, RED),
    ]
    
    y_pos = list(range(len(tasks)-1, -1, -1))
    for i, (name, start, duration, color) in enumerate(tasks):
        ax.barh(y_pos[i], duration, left=start, height=0.6, color=color, alpha=0.8, edgecolor='white')
        ax.text(start + duration/2, y_pos[i], name, ha='center', va='center', fontsize=8, fontweight='bold', color=WHITE)
    
    ax.set_xlim(-0.2, 4.2)
    ax.set_xticks([0, 1, 2, 3, 4])
    ax.set_xticklabels(['9月', '10月', '11月', '12月', '1月'], fontsize=12)
    ax.set_yticks([])
    ax.set_title('9-12月方案1.5任务分解（甘特图）', fontsize=18, fontweight='bold', color=BLUE_D, pad=15)
    
    # 风险提示
    ax.text(2, -2, '⚠️ 运营平台数据模型不稳定会导致报表反复调整 → 提前冻结数据模型版本', 
            ha='center', fontsize=11, color=RED)
    
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)
    
    save(fig, '15_gantt')

# ============================================================
# Chart 8: P16 双轨并行时间轴
# ============================================================
def chart_dualtrack():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '双轨并行策略', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # 时间轴
    phases = [
        ('设定\n切换日期', 1.0, BLUE_D), ('新增预警→\n只走运营平台', 4.0, GREEN),
        ('在途工单→\n精益自然收尾', 7.0, ORANGE), ('双轨并行\n2-4周', 10.0, PURPLE),
        ('精益\n只读模式', 13.0, RED),
    ]
    # 时间轴线
    ax.plot([0.5, 15.5], [5.0, 5.0], color=LIGHT, lw=4, zorder=0)
    for name, x, color in phases:
        ax.plot(x+0.8, 5.0, 'o', color=color, markersize=18, zorder=1)
        draw_box(ax, x, 5.5, 1.8, 1.2, name, color, tc=WHITE, fs=10)
        draw_arrow(ax, x+1.8, 5.0, x+2.0, 5.0, color, 2)
    
    # 规则卡片
    rules = ['新增预警只走运营平台', '在途工单不迁移', '两边状态不同步', '并行期2-4周']
    for i, r in enumerate(rules):
        draw_box(ax, 0.5 + i*3.8, 2.5, 3.5, 1.0, r, '#F5F5F5', ec=LIGHT, tc=DARK, fs=11, fw='normal')
    
    # 数据校验
    checks = ['行数一致', '关键字段非空', '关联关系完整', '在途状态一致']
    ax.text(8, 1.5, '数据校验', ha='center', fontsize=13, fontweight='bold', color=BLUE_D)
    for i, c in enumerate(checks):
        draw_box(ax, 1.0 + i*3.7, 0.3, 3.4, 0.8, c, BLUE_L, ec=BLUE, tc=BLUE_D, fs=10, fw='normal')
    
    save(fig, '16_dualtrack')

# ============================================================
# Chart 9: P17 三层漏斗回退图
# ============================================================
def chart_rollback():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '分阶段回退方案', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    layers = [
        ('短期回退', '隐藏"精益运营"菜单 → 用户直连精益平台', '零影响', 6.0, BLUE),
        ('中期回退', '单场景切回精益 → 其他场景保留', '最小影响', 3.5, ORANGE),
        ('全面回退', '全部预警切回精益 → 精益保持在线', '可控影响', 1.0, RED),
    ]
    for name, desc, impact, y, color in layers:
        w = 10 + (6.0 - y) * 1.5
        x = 8 - w/2
        draw_box(ax, x, y, w, 1.8, f'{name}\n{desc}\n影响: {impact}', color, tc=WHITE, fs=12)
    
    # 底部
    ax.text(8, 0.3, '精益平台在中期结束前保持可运行 → 天然回退保障', 
            ha='center', fontsize=13, color=GREEN, fontweight='bold')
    
    save(fig, '17_rollback')

# ============================================================
# Chart 10: P18 报表优先级气泡图
# ============================================================
def chart_reports_bubble():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '11个报表分优先级迁移', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # P0
    p0 = ['一线任务\n执行监控', '集运任务\n执行盯控', '携转预警\n分析', '宽带离网\n预警分析', '全球通离网\n预警分析']
    ax.text(8, 7.2, 'P0（大圆 = 必须首批迁移）', ha='center', fontsize=14, fontweight='bold', color=RED)
    for i, name in enumerate(p0):
        cx = 1.5 + i*2.8
        cy = 5.5
        circle = plt.Circle((cx, cy), 1.0, color=RED, alpha=0.15)
        ax.add_patch(circle)
        circle2 = plt.Circle((cx, cy), 0.8, color=RED, alpha=0.25)
        ax.add_patch(circle2)
        ax.text(cx, cy, name, ha='center', va='center', fontsize=9, fontweight='bold', color=RED)
    
    # P1
    p1 = ['投诉工单\n预警分析', '热线商机\n预警分析', '异动客户\n预警分析', '离网追溯\n反馈分析', '停机赢回\n预警分析']
    ax.text(8, 3.8, 'P1（中圆 = 第二批迁移）', ha='center', fontsize=14, fontweight='bold', color=ORANGE)
    for i, name in enumerate(p1):
        cx = 1.5 + i*2.8
        cy = 2.2
        circle = plt.Circle((cx, cy), 0.8, color=ORANGE, alpha=0.15)
        ax.add_patch(circle)
        circle2 = plt.Circle((cx, cy), 0.6, color=ORANGE, alpha=0.25)
        ax.add_patch(circle2)
        ax.text(cx, cy, name, ha='center', va='center', fontsize=8, fontweight='bold', color=ORANGE)
    
    # P2
    ax.text(14, 2.2, 'P2\n铁通赢回\n预警分析', ha='center', va='center', fontsize=9, fontweight='bold', color=BLUE)
    circle = plt.Circle((14, 2.2), 0.5, color=BLUE, alpha=0.15)
    ax.add_patch(circle)
    
    save(fig, '18_reports_bubble')

# ============================================================
# Chart 11: P20 派单逻辑对比
# ============================================================
def chart_dispatch_compare():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '派单逻辑：硬编码 → 规则引擎', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # 左侧：硬编码
    draw_box(ax, 0.5, 7.0, 6.5, 0.8, '精益原逻辑（硬编码）', RED, tc=WHITE, fs=14)
    steps_left = ['触发', '按客户属性\nif/else', '匹配看管关系\n代码写死', '派发\n改需发版']
    for i, s in enumerate(steps_left):
        draw_box(ax, 0.8 + i*1.65, 4.8, 1.4, 1.5, s, RED_L, ec=RED, tc=DARK, fs=10, fw='normal')
        if i < len(steps_left)-1:
            draw_arrow(ax, 0.8+(i+1)*1.65-0.05, 5.5, 0.8+(i+1)*1.65+0.05, 5.5, RED, 2)
    
    # 右侧：规则引擎
    draw_box(ax, 9.0, 7.0, 6.5, 0.8, '运营平台规则引擎', GREEN, tc=WHITE, fs=14)
    steps_right = ['触发', '规则组\n条件匹配', '动作执行\n转派/升级', '派发\n零代码扩展']
    for i, s in enumerate(steps_right):
        draw_box(ax, 9.3 + i*1.65, 4.8, 1.4, 1.5, s, GREEN_L, ec=GREEN, tc=DARK, fs=10, fw='normal')
        if i < len(steps_right)-1:
            draw_arrow(ax, 9.3+(i+1)*1.65-0.05, 5.5, 9.3+(i+1)*1.65+0.05, 5.5, GREEN, 2)
    
    # 中间重构箭头
    ax.annotate('', xy=(9.0, 5.5), xytext=(7.0, 5.5),
                arrowprops=dict(arrowstyle='->', color=BLUE_D, lw=4))
    ax.text(8, 6.0, '重构', ha='center', fontsize=16, fontweight='bold', color=BLUE_D)
    
    # 底部设计原则
    principles = ['配置化', '规则组', '条件+动作', '可扩展']
    for i, p in enumerate(principles):
        draw_box(ax, 2.0 + i*3.2, 2.0, 2.8, 0.9, p, BLUE, tc=WHITE, fs=12)
    
    save(fig, '20_dispatch_compare')

# ============================================================
# Chart 12: P22 风险矩阵
# ============================================================
def chart_risk_matrix():
    fig = fig16x9()
    ax = fig.add_axes([0.1, 0.1, 0.8, 0.8])
    
    risks = [
        ('规则提取遗漏', 0.5, 0.8, RED, 0.08),
        ('4A/网络延迟', 0.5, 0.5, ORANGE, 0.06),
        ('接口对接延期', 0.5, 0.5, ORANGE, 0.06),
        ('用户抵触', 0.5, 0.2, BLUE, 0.04),
        ('数据割接不完整', 0.2, 0.8, PURPLE, 0.06),
    ]
    
    for name, prob, impact, color, size in risks:
        ax.scatter(prob, impact, s=size*5000, c=color, alpha=0.6, edgecolors=color, linewidths=2)
        ax.text(prob, impact, name, ha='center', va='center', fontsize=10, fontweight='bold', color=DARK)
    
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.set_xlabel('发生概率', fontsize=14, fontweight='bold')
    ax.set_ylabel('影响程度', fontsize=14, fontweight='bold')
    ax.set_title('五大关键风险矩阵', fontsize=18, fontweight='bold', color=BLUE_D)
    ax.set_xticks([0.2, 0.5, 0.8]); ax.set_xticklabels(['低', '中', '高'], fontsize=12)
    ax.set_yticks([0.2, 0.5, 0.8]); ax.set_yticklabels(['低', '中', '高'], fontsize=12)
    
    # 区域着色
    ax.axhspan(0.5, 1.0, xmin=0.3, xmax=1.0, color=RED, alpha=0.05)
    ax.axhspan(0.0, 0.5, xmin=0.0, xmax=0.3, color=GREEN, alpha=0.05)
    
    ax.text(0.9, 0.05, '精益平台保持在线\n随时可切回', ha='center', fontsize=11, color=GREEN, fontweight='bold')
    
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    save(fig, '22_risk_matrix')

# ============================================================
# Chart 13: P25 能力环图
# ============================================================
def chart_capability_ring():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '长期新能力建设（集团规范）', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # 中心
    center_x, center_y = 8, 4.2
    circle = plt.Circle((center_x, center_y), 1.8, color=BLUE_D, alpha=0.9)
    ax.add_patch(circle)
    ax.text(center_x, center_y+0.3, '运营平台', ha='center', fontsize=16, fontweight='bold', color=WHITE)
    ax.text(center_x, center_y-0.3, '数智运营', ha='center', fontsize=12, color=BLUE_L)
    
    # 环绕5能力
    capabilities = [
        ('AI注智\n智能调度/根因分析', BLUE),
        ('家庭融合运营', GREEN),
        ('细分市场\n银发/校园/国际', ORANGE),
        ('营销画布', PURPLE),
        ('一级平台对接', TEAL),
    ]
    r = 4.2
    for i, (name, color) in enumerate(capabilities):
        angle = np.radians(90 + i*72)
        nx = center_x + r * np.cos(angle)
        ny = center_y + r * np.sin(angle)
        # 连线
        ax.plot([center_x, nx], [center_y, ny], color=LIGHT, lw=2, zorder=0)
        circle_n = plt.Circle((nx, ny), 1.2, color=color, alpha=0.85)
        ax.add_patch(circle_n)
        ax.text(nx, ny, name, ha='center', va='center', fontsize=10, fontweight='bold', color=WHITE)
    
    # 底部
    ax.text(8, 0.3, '精益平台独有能力（督办/投屏/收入预测等）同步收编', 
            ha='center', fontsize=12, color=MID, fontstyle='italic')
    
    save(fig, '25_capability_ring')

# ============================================================
# Chart 14: P26 价值四象限
# ============================================================
def chart_value_quadrant():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '融合价值四象限', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # 四象限
    quadrants = [
        (1.5, 4.8, '一个平台', '统一入口\n统一体验', BLUE),
        (8.5, 4.8, '流程闭环', '指标→预警→执行→评估', GREEN),
        (1.5, 1.5, '降本增效', '精益下线\n减少运维', ORANGE),
        (8.5, 1.5, '集团合规', '满足规范\n通过验收', PURPLE),
    ]
    for x, y, title, desc, color in quadrants:
        draw_box(ax, x, y, 6.0, 2.5, '', color, alpha=0.1, radius=0.15)
        draw_box(ax, x+0.3, y+1.5, 5.4, 0.8, title, color, tc=WHITE, fs=16)
        ax.text(x+3.0, y+0.7, desc, ha='center', va='center', fontsize=13, color=DARK)
    
    # 中心
    circle = plt.Circle((8, 4.2), 0.6, color=BLUE_D, alpha=0.9)
    ax.add_patch(circle)
    ax.text(8, 4.2, '价值', ha='center', va='center', fontsize=12, fontweight='bold', color=WHITE)
    
    save(fig, '26_value_quadrant')

# ============================================================
# Chart 15: P4 树形结构图
# ============================================================
def chart_tree():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '精益平台21个常用页面', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # 根节点
    draw_box(ax, 6.5, 7.2, 3.0, 0.7, '精益平台', BLUE_D, tc=WHITE, fs=14)
    
    # 一级分支
    branches = [
        ('运营驾驶舱', 0.3, [('运营驾驶舱', '1')]),
        ('事前预警', 2.4, [('预警任务管理', ''), ('预警任务审批', ''), ('保有预警工单', ''), ('保有工单审批', ''), ('看管关系监控', '')]),
        ('任务工作台', 5.5, [('我的保有任务', ''), ('我的督办任务', '')]),
        ('事中监控', 7.6, [('一线任务执行监控', ''), ('集运任务执行盯控', '')]),
        ('效果评估', 9.2, [('9个预警分析报表', '9')]),
        ('任务督办', 12.3, [('督办管理', '')]),
        ('系统管理', 13.8, [('投屏管理', '')]),
    ]
    
    for name, x, children in branches:
        draw_box(ax, x, 5.8, 1.8, 0.7, name, BLUE, tc=WHITE, fs=9)
        # 连线到根
        ax.plot([x+0.9, 8.0], [6.5, 7.2], color=LIGHT, lw=1.5, zorder=0)
        # 子节点
        for j, (child, count) in enumerate(children):
            cy = 4.5 - j*0.55
            draw_box(ax, x+0.1, cy, 1.6, 0.45, child, BLUE_L, ec=BLUE, tc=BLUE_D, fs=7, fw='normal')
            ax.plot([x+0.9, x+0.9], [5.8, cy+0.45], color=LIGHT, lw=1, zorder=0)
    
    # 底部
    ax.text(8, 0.3, '系统管理其他页面（用户/角色/菜单/场景/指标管理）低频，长期补齐', 
            ha='center', fontsize=11, color=MID, fontstyle='italic')
    
    save(fig, '04_tree')

# ============================================================
# Chart 16: P19 调度类型扩展架构图
# ============================================================
def chart_dispatch_expand():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '新增2种调度类型 & ALT工单结构', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # 现有6种
    existing = ['IND\n指标调度', 'STR\n策略调度', 'CG-OP\n客群调度', 'COD\n客户商机', 'GOD\n客群商机', 'RAS\n区域攻坚']
    for i, name in enumerate(existing):
        draw_box(ax, 0.3 + i*2.0, 6.8, 1.8, 0.9, name, BLUE, tc=WHITE, fs=9)
    
    # +2
    ax.text(8, 6.0, '+', fontsize=30, fontweight='bold', color=ORANGE, ha='center')
    
    new_types = ['ALT ★\n预警调度', 'CUR ★\n看管调度']
    for i, name in enumerate(new_types):
        draw_box(ax, 5.5 + i*3.0, 4.8, 2.5, 0.9, name, ORANGE, tc=WHITE, fs=12)
    
    # 映射
    mappings = [
        ('营销/提醒/到期类 → ALT', 5.0, 3.5, GREEN),
        ('分包看管派单 → CUR', 5.0, 2.5, GREEN),
        ('效果类 → 不产生工单', 5.0, 1.5, MID),
    ]
    for text, x, y, color in mappings:
        draw_box(ax, x, y, 5.5, 0.7, text, '#F5F5F5', ec=color, tc=color, fs=11, fw='normal')
    
    # ALT工单结构
    ax.text(12.5, 4.0, 'ALT工单结构', ha='center', fontsize=12, fontweight='bold', color=ORANGE)
    struct = [
        ('基础信息\n调度类型/场景/时间/客户数', 2.8),
        ('调度配置\n派单规则/超时升级/渠道', 2.0),
        ('执行进度\n触达率/响应率/转化率', 1.2),
    ]
    for text, y in struct:
        draw_box(ax, 10.0, y, 5.0, 0.7, text, ORANGE_L, ec=ORANGE, tc=DARK, fs=9, fw='normal')
    
    save(fig, '19_dispatch_expand')

# ============================================================
# Chart 17: P21 V型测试图
# ============================================================
def chart_v_test():
    fig = fig16x9()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16); ax.set_ylim(0, 9)
    ax.axis('off')
    
    ax.text(8, 8.5, '五阶段测试验证（V型）', ha='center', fontsize=20, fontweight='bold', color=BLUE_D)
    
    # V型左侧（测试阶段）
    left = [
        ('短期8月', '4A票据+页面可访问', BLUE, 7.0),
        ('中期10月', '预警+规则引擎', GREEN, 5.5),
        ('中期11月', '报表比对', ORANGE, 4.0),
        ('中期12月', '端到端验证', RED, 2.5),
    ]
    for name, content, color, y in left:
        draw_box(ax, 1.0, y, 3.5, 0.8, f'{name}\n{content}', color, tc=WHITE, fs=10)
    
    # V型右侧（验收标准）
    right = [
        ('无二次登录', BLUE, 7.0),
        ('规则可配置\n工单可派发', GREEN, 5.5),
        ('数据一致', ORANGE, 4.0),
        ('全链路跑通\n接口调通', RED, 2.5),
    ]
    for content, color, y in right:
        draw_box(ax, 5.5, y, 3.5, 0.8, content, '#F5F5F5', ec=color, tc=color, fs=10, fw='normal')
    
    # 双轨并行
    draw_box(ax, 10.0, 4.0, 5.5, 3.5, '', '#F5F5F5', radius=0.15)
    ax.text(12.75, 7.0, '双轨并行验证', fontsize=14, fontweight='bold', color=BLUE_D, ha='center')
    rules = ['两边同场景同客群', '工单结果一致', '报表数据一致', '异常case逐一排查']
    for i, r in enumerate(rules):
        ax.text(10.3, 6.0-i*0.6, f'✓ {r}', fontsize=10, color=DARK)
    
    # 环境说明
    draw_box(ax, 10.0, 0.5, 5.5, 1.5, '测试环境\n运营平台测试环境部署精益业务模块\n使用脱敏生产数据', 
             BLUE_L, ec=BLUE, tc=BLUE_D, fs=10, fw='normal')
    
    save(fig, '21_v_test')

# ============================================================
# 主执行
# ============================================================
if __name__ == '__main__':
    print('生成PPT图表...')
    chart_background()       # P1 背景
    chart_tree()             # P2 树形
    chart_scenarios()        # P3 气泡
    chart_flows()            # P3 流程
    chart_interfaces()       # P4 接口辐射
    chart_diff()             # P5 差异对比
    chart_4a_swimlane()      # P8 泳道
    chart_gantt()            # P13 甘特
    chart_dualtrack()        # P14 双轨
    chart_rollback()         # P15 回退
    chart_reports_bubble()   # P16 报表气泡
    chart_dispatch_expand()  # P17 调度扩展
    chart_dispatch_compare() # P18 派单对比
    chart_v_test()           # P19 V型测试
    chart_risk_matrix()      # P20 风险矩阵
    chart_capability_ring()  # P21 能力环
    chart_value_quadrant()   # P22 价值象限
    print(f'\n全部图表已保存到 {OUT}')
