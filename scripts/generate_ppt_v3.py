#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
运营平台与精益平台融合方案 PPT v3
参考中国移动内部方案风格：精简(≤15页)、图文表并茂、流程图、架构图
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from lxml import etree
import os

TEMPLATE_PATH = '/workspace/projects/assets/PPT模板.pptx'
OUTPUT_PATH = '/workspace/projects/docs/需求设计方案/运营平台与精益平台融合方案.pptx'

# ============ 设计Token ============
# 主色：中国移动蓝系
PRIMARY = RGBColor(0x00, 0x6B, 0xD5)      # 中国移动蓝
PRIMARY_DARK = RGBColor(0x00, 0x4E, 0x9A)  # 深蓝
PRIMARY_LIGHT = RGBColor(0xD1, 0xE8, 0xFF) # 浅蓝底
ACCENT = RGBColor(0x00, 0xA8, 0x70)        # 绿色-正面
WARN = RGBColor(0xE8, 0x6C, 0x00)          # 橙色-警示
DANGER = RGBColor(0xC0, 0x00, 0x00)        # 红色-风险
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x1A, 0x1A, 0x1A)
DARK = RGBColor(0x33, 0x33, 0x33)
MID = RGBColor(0x66, 0x66, 0x66)
LIGHT = RGBColor(0xCC, 0xCC, 0xCC)
BG_LIGHT = RGBColor(0xF0, 0xF7, 0xFB)     # 浅蓝背景条

FONT = '微软雅黑'

# 布局
SW = Inches(13.33)
SH = Inches(7.5)

# 内容区布局参数
TITLE_H = Inches(0.65)
DESC_H = Inches(0.7)
CONTENT_TOP = Inches(1.5)
CONTENT_LEFT = Inches(0.3)

# ============ 工具函数 ============

def add_title(slide, text, small=False):
    """页面标题（蓝色粗体）"""
    txBox = slide.shapes.add_textbox(Inches(0.3), Inches(0.15), Inches(12.7), TITLE_H)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(20 if not small else 16)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_DARK
    p.font.name = FONT

def add_desc(slide, text):
    """描述栏（浅蓝底条）"""
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0.75), SW, DESC_H)
    shape.fill.solid()
    shape.fill.fore_color.rgb = BG_LIGHT
    shape.line.fill.background()
    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.08)
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(10)
    p.font.color.rgb = DARK
    p.font.name = FONT

def box(slide, text, left, top, width, height, bg=PRIMARY, fg=WHITE, size=10, bold=True, radius=True):
    """圆角方块"""
    st = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    shape = slide.shapes.add_shape(st, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg
    shape.line.fill.background()
    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.05)
    tf.margin_right = Inches(0.05)
    tf.margin_top = Inches(0.02)
    tf.margin_bottom = Inches(0.02)
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = fg
    p.font.name = FONT
    p.alignment = PP_ALIGN.CENTER
    return shape

def arrow_r(slide, left, top, w=Inches(0.3), h=Inches(0.18), color=PRIMARY):
    """右箭头"""
    shape = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, left, top, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()

def arrow_d(slide, left, top, w=Inches(0.18), h=Inches(0.3), color=PRIMARY):
    """下箭头"""
    shape = slide.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, left, top, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()

def label(slide, text, left, top, width, height, size=9, color=DARK, bold=False, align=PP_ALIGN.LEFT):
    """文本标签"""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.05)
    tf.margin_right = Inches(0.05)
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.font.name = FONT
    p.alignment = align
    return txBox

def multi_label(slide, lines, left, top, width, height, size=9, color=DARK, bullet=False, para_align=None):
    """多行文本"""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.08)
    for i, line in enumerate(lines):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = ("• " if bullet else "") + line
        p.font.size = Pt(size)
        p.font.color.rgb = color
        p.font.name = FONT
        p.space_after = Pt(2)
        if para_align:
            p.alignment = para_align
    return txBox

def table(slide, headers, rows, left, top, width, height, hdr_bg=PRIMARY, hdr_fg=WHITE):
    """表格"""
    nr = len(rows) + 1
    nc = len(headers)
    ts = slide.shapes.add_table(nr, nc, left, top, width, height)
    tbl = ts.table
    
    for i, h in enumerate(headers):
        c = tbl.cell(0, i)
        c.text = h
        c.fill.solid()
        c.fill.fore_color.rgb = hdr_bg
        for p in c.text_frame.paragraphs:
            p.font.size = Pt(8)
            p.font.bold = True
            p.font.color.rgb = hdr_fg
            p.font.name = FONT
            p.alignment = PP_ALIGN.CENTER
    
    for ri, row in enumerate(rows):
        for ci, val in enumerate(row):
            c = tbl.cell(ri+1, ci)
            c.text = str(val)
            if ri % 2 == 1:
                c.fill.solid()
                c.fill.fore_color.rgb = BG_LIGHT
            for p in c.text_frame.paragraphs:
                p.font.size = Pt(7.5)
                p.font.color.rgb = DARK
                p.font.name = FONT
                p.alignment = PP_ALIGN.CENTER
    return ts

def connector_line(slide, x1, y1, x2, y2, color=LIGHT, width=Pt(1)):
    """连接线"""
    from pptx.oxml.ns import qn
    cxnSp = slide.shapes._spTree.makeelement(qn('p:cxnSp'), {})
    nvCxnSpPr = cxnSp.makeelement(qn('p:nvCxnSpPr'), {})
    cNvPr = nvCxnSpPr.makeelement(qn('p:cNvPr'), {'id': '0', 'name': ''})
    nvCxnSpPr.append(cNvPr)
    cxnSp.append(nvCxnSpPr)
    # Simplified - use shape line instead
    pass

# ============ PPT生成 ============

def generate():
    prs = Presentation(TEMPLATE_PATH)
    
    # 获取版式
    blank_layout = None
    for layout in prs.slide_layouts:
        if layout.name == '2_空白':
            blank_layout = layout
            break
    if not blank_layout:
        blank_layout = prs.slide_layouts[3]
    
    def new_slide():
        return prs.slides.add_slide(blank_layout)
    
    # ============ P1: 封面 ============
    slide1 = prs.slides[0]
    for shape in slide1.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                for run in para.runs:
                    if 'XXXX' in run.text:
                        run.text = run.text.replace('XXXX方案', '运营平台与精益平台融合方案').replace('XXXX', '运营平台与精益平台融合方案')
                    if run.text.strip() == 'XXX':
                        run.text = '新疆移动市场运营部'
    # Fix duplicate
    for shape in slide1.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                runs = list(para.runs)
                for r in runs[1:]:
                    if r.text == '运营平台与精益平台融合方案':
                        r._r.getparent().remove(r._r)

    # ============ P2: 目录 ============
    s = new_slide()
    add_title(s, '汇报目录')
    add_desc(s, '围绕"为什么融、融什么、怎么融、风险怎么控"四个问题展开')
    
    toc = [
        ('01', '融合背景与目标', '为什么融：业务痛点+政策驱动+核心目标', PRIMARY_DARK),
        ('02', '现状分析与差异', '融什么：21个常用页面+9大场景+2套流程+6大外部系统', PRIMARY),
        ('03', '融合策略与路线', '怎么融：3种技术路线+4A票据透传+人员角色迁移', ACCENT),
        ('04', '实施路径与里程碑', '什么时候融：8月统一入口→12月能力融合→27Q2全面融合', WARN),
        ('05', '关键挑战与风险', '风险怎么控：11报表+流程整合+双轨并行+回退预案', DANGER),
        ('06', '总结与建议', '方案选择建议', PRIMARY_DARK),
    ]
    
    y = Inches(1.8)
    for num, title, desc, color in toc:
        box(s, num, Inches(0.5), y, Inches(0.65), Inches(0.5), bg=color, size=16)
        label(s, title, Inches(1.35), y, Inches(4), Inches(0.35), size=16, bold=True, color=DARK)
        label(s, desc, Inches(1.35), y+Inches(0.35), Inches(11), Inches(0.25), size=9, color=MID)
        y += Inches(0.88)
    
    # ============ P3: 融合背景与目标 ============
    s = new_slide()
    add_title(s, '一、融合背景与目标')
    add_desc(s, '核心目标：将运营平台与精益平台融合，统一用户界面和使用体验。王主任要求方案体现阶段性成果，分步实施需说明原因')
    
    # 左侧：痛点(红色系)
    box(s, '业务痛点', Inches(0.3), Inches(1.6), Inches(4.1), Inches(0.45), bg=DANGER, size=13)
    pains = [
        ('双系统切换', '指标在运营平台看\n工单在精益平台看'),
        ('数据不互通', '两套系统数据孤岛\n无法形成闭环'),
        ('界面不统一', '风格差异大\n新员工学习成本高'),
    ]
    x = Inches(0.3)
    for title, desc in pains:
        box(s, title, x, Inches(2.2), Inches(1.25), Inches(0.45), bg=RGBColor(0xFF, 0xEB, 0xEE), fg=DANGER, size=9)
        multi_label(s, desc.split('\n'), x+Inches(0.05), Inches(2.75), Inches(1.15), Inches(0.6), size=8, color=MID)
        x += Inches(1.4)
    
    # 右侧：政策(蓝色系)
    box(s, '政策驱动', Inches(4.7), Inches(1.6), Inches(4.1), Inches(0.45), bg=PRIMARY, size=13)
    policies = [
        ('集团规范', '统一部署标准版本\n菜单/命名需对齐'),
        ('精益不一致', '与集团规范命名\n不一致需改造'),
        ('运营平台是载体', '运营平台是集团\n规范落地载体'),
    ]
    x = Inches(4.7)
    for title, desc in policies:
        box(s, title, x, Inches(2.2), Inches(1.25), Inches(0.45), bg=PRIMARY_LIGHT, fg=PRIMARY, size=9)
        multi_label(s, desc.split('\n'), x+Inches(0.05), Inches(2.75), Inches(1.15), Inches(0.6), size=8, color=MID)
        x += Inches(1.4)
    
    # 底部：4个核心目标
    label(s, '核心目标', Inches(0.3), Inches(3.6), Inches(2), Inches(0.3), size=12, bold=True, color=PRIMARY_DARK)
    
    goals = [
        ('统一界面体验', '一个平台一次登录\n完成全部操作', PRIMARY),
        ('统一调度体系', '扩展调度中心\n覆盖预警+看管场景', PRIMARY_DARK),
        ('统一数据通路', '运营平台直连外部系统\n不经精益平台中转', ACCENT),
        ('对齐集团规范', '融合后按集团规范\n验收不迁就精益平台', WARN),
    ]
    x = Inches(0.3)
    for title, desc, color in goals:
        box(s, title, x, Inches(4.0), Inches(3.05), Inches(0.5), bg=color, size=12)
        multi_label(s, desc.split('\n'), x+Inches(0.1), Inches(4.6), Inches(2.85), Inches(0.5), size=9, color=MID, para_align=PP_ALIGN.CENTER)
        x += Inches(3.25)
    
    # 分步实施必要性
    label(s, '分步实施必要性', Inches(0.3), Inches(5.3), Inches(3), Inches(0.3), size=12, bold=True, color=PRIMARY_DARK)
    reasons = ['业务连续性要求（在途工单不能断）', '两套平台需整合（依赖/认证/配置差异）',
               '4A对接需跨部门协调', '6大外部系统46接口需逐一对接验证',
               '存量数据需按运营平台表结构迁移校验', '一线人员需分阶段适应']
    multi_label(s, reasons, Inches(0.3), Inches(5.65), Inches(12.7), Inches(1.5), size=8, color=MID, bullet=True)

    # ============ P4: 精益平台现状全貌 ============
    s = new_slide()
    add_title(s, '二、精益平台现状全貌')
    add_desc(s, '面向新疆移动"存量客户预警+营销闭环管控"系统，支撑9大预警场景，对接6大外部系统46个接口')
    
    # 核心架构图：事前→事中→事后
    box(s, '事前预警', Inches(0.3), Inches(1.55), Inches(4.0), Inches(0.5), bg=PRIMARY, size=13)
    box(s, '事中监控', Inches(4.7), Inches(1.55), Inches(4.0), Inches(0.5), bg=PRIMARY_DARK, size=13)
    box(s, '事后评估', Inches(9.1), Inches(1.55), Inches(4.0), Inches(0.5), bg=ACCENT, size=13)
    arrow_r(s, Inches(4.35), Inches(1.65), Inches(0.3), Inches(0.2))
    arrow_r(s, Inches(8.75), Inches(1.65), Inches(0.3), Inches(0.2))
    
    # 事前预警内容
    pre_items = ['预警任务管理/审批', '预警工单管理', '全量用户看管关系监控', '任务工单管理(5类)']
    y = Inches(2.2)
    for item in pre_items:
        box(s, item, Inches(0.4), y, Inches(3.8), Inches(0.35), bg=PRIMARY_LIGHT, fg=PRIMARY_DARK, size=8, bold=False)
        y += Inches(0.4)
    
    # 事中监控内容
    mid_items = ['一线任务执行监控', '集运任务执行盯控', '合约到期/预警/营销任务监控', '收入预测/新入网监控']
    y = Inches(2.2)
    for item in mid_items:
        box(s, item, Inches(4.8), y, Inches(3.8), Inches(0.35), bg=RGBColor(0xE3, 0xF0, 0xFF), fg=PRIMARY_DARK, size=8, bold=False)
        y += Inches(0.4)
    
    # 事后评估内容
    post_items = ['9大场景预警分析报表', '一事一案分析', '营销任务执行效果', '驾驶舱']
    y = Inches(2.2)
    for item in post_items:
        box(s, item, Inches(9.2), y, Inches(3.8), Inches(0.35), bg=RGBColor(0xE8, 0xF5, 0xE9), fg=RGBColor(0x1B, 0x5E, 0x20), size=8, bold=False)
        y += Inches(0.4)
    
    # 9大场景标签
    label(s, '9大预警场景', Inches(0.3), Inches(3.9), Inches(3), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    scenes = ['携转挽留', '宽带离网', '全球通离网', '全球通投诉', '异动客户修复', '热线商机', '离网追溯', '停机赢回', '铁通赢回']
    x = Inches(0.3)
    for sc in scenes:
        box(s, sc, x, Inches(4.25), Inches(1.35), Inches(0.35), bg=PRIMARY_LIGHT, fg=PRIMARY, size=8, bold=False)
        x += Inches(1.45)
    
    # 关键数字 + 外部系统
    label(s, '6大外部系统', Inches(0.3), Inches(4.85), Inches(3), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    systems = [
        ('网格通(新大陆)', PRIMARY), ('IOP', PRIMARY_DARK), ('精准营销', ACCENT),
        ('在线平台(10086/88)', WARN), ('CRM', RGBColor(0x7B, 0x1F, 0xA2)), ('大数据平台', RGBColor(0x00, 0x69, 0x6B)),
    ]
    x = Inches(0.3)
    for name, color in systems:
        box(s, name, x, Inches(5.2), Inches(2.0), Inches(0.4), bg=color, size=8)
        x += Inches(2.15)
    
    # 底部关键数字
    box(s, '21个常用页面', Inches(0.3), Inches(5.9), Inches(3.05), Inches(0.5), bg=PRIMARY_LIGHT, fg=PRIMARY, size=11)
    box(s, '9大预警场景', Inches(3.55), Inches(5.9), Inches(3.05), Inches(0.5), bg=PRIMARY_LIGHT, fg=PRIMARY, size=11)
    box(s, '2套核心流程', Inches(6.8), Inches(5.9), Inches(3.05), Inches(0.5), bg=PRIMARY_LIGHT, fg=PRIMARY, size=11)
    box(s, '46个外部接口', Inches(10.05), Inches(5.9), Inches(3.05), Inches(0.5), bg=PRIMARY_LIGHT, fg=PRIMARY, size=11)

    # ============ P5: 两套核心流程 + 21个常用页面 ============
    s = new_slide()
    add_title(s, '二、两套核心流程与21个常用页面')
    add_desc(s, '流程1为预警驱动（事前→事中→事后），流程2为营销任务（手动+IOP闭环），派单采用分包看管模式')
    
    # 流程1
    label(s, '流程1：预警驱动', Inches(0.3), Inches(1.55), Inches(3), Inches(0.3), size=12, bold=True, color=PRIMARY)
    flow1 = ['创建预警\n任务', '提交\n审批', '审批\n通过', '预警\n触发', '生成\n工单', '派发\n执行', '效果\n评估']
    x = Inches(0.3)
    for step in flow1:
        box(s, step, x, Inches(1.95), Inches(1.65), Inches(0.55), bg=PRIMARY, size=8)
        if step != flow1[-1]:
            arrow_r(s, x+Inches(1.7), Inches(2.1), Inches(0.2), Inches(0.12))
        x += Inches(1.87)
    
    # 流程2
    label(s, '流程2：营销任务', Inches(0.3), Inches(2.7), Inches(3), Inches(0.3), size=12, bold=True, color=PRIMARY_DARK)
    flow2 = ['精准营销\n创建客群', '精益创建\n手工工单', '审批\n派发', '跳转\nIOP', '活动\n审批执行', '网格通\n执行', '效果\n评估']
    x = Inches(0.3)
    for step in flow2:
        box(s, step, x, Inches(3.1), Inches(1.65), Inches(0.55), bg=PRIMARY_DARK, size=8)
        if step != flow2[-1]:
            arrow_r(s, x+Inches(1.7), Inches(3.25), Inches(0.2), Inches(0.12))
        x += Inches(1.87)
    
    # 21个常用页面表格
    label(s, '21个常用页面清单', Inches(0.3), Inches(3.85), Inches(4), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    headers = ['序号', '一级模块', '二级菜单', '三级菜单', '优先级']
    rows = [
        ['1', '运营驾驶舱', '—', '—', 'P0'],
        ['2-3', '事前预警', '预警任务管理/审批', '—', 'P0'],
        ['4-5', '事前预警', '预警工单管理', '保有预警工单/保有工单审批', 'P0'],
        ['6', '事前预警', '全量用户看管关系监控', '—', 'P1'],
        ['7-8', '任务工作台', '我的保有任务/我的督办任务', '—', 'P0'],
        ['9-10', '事中监控', '一线任务执行监控/集运盯控', '—', 'P0'],
        ['11-19', '效果评估', '9大场景预警分析报表', '—', 'P0/P1'],
        ['20', '任务督办', '督办管理', '—', 'P1'],
        ['21', '系统管理', '投屏管理', '—', 'P1'],
    ]
    table(s, headers, rows, Inches(0.3), Inches(4.2), Inches(12.7), Inches(3.0))

    # ============ P6: 三种技术路线 ============
    s = new_slide()
    add_title(s, '三、三种技术路线对比')
    add_desc(s, '核心分歧：精益平台代码迁不迁、迁哪些。方案一全迁（两套引擎），方案1.5部分迁（只迁报表视图，一套引擎），方案二不迁（一套引擎）')
    
    # 三个大卡片并排
    plans = [
        ('方案一\n全迁代码', 
         ['精益全部业务代码迁入', '两套调度引擎并存', '存量流程原引擎跑', '新增需求新引擎跑', '报表随代码迁入复用'],
         ['两套引擎长期并存⚠️', '数据模型分裂', '二次融合不可避免', '长期总成本最高'],
         DANGER, RGBColor(0xFF, 0xEB, 0xEE)),
        ('方案1.5\n部分迁代码(推荐)', 
         ['只迁报表/视图/评估代码', '调度/工单/派单不迁', '新引擎重新配置规则', '一套调度引擎统一', '报表迁入复用省开发量'],
         ['业务规则提取有遗漏风险', '报表需适配数据源', '需双轨并行验证'],
         PRIMARY, PRIMARY_LIGHT),
        ('方案二\n不迁代码', 
         ['全部重新开发', '规则提取+新引擎配置', '报表按运营平台重写', '一套调度引擎统一', '对齐集团规范路径最短'],
         ['报表/视图全重写工作量大', '规则提取遗漏风险', '前期投入最高'],
         WARN, RGBColor(0xFF, 0xF3, 0xE0)),
    ]
    
    x = Inches(0.3)
    for title, pros, cons, color, bg_color in plans:
        # 标题
        box(s, title, x, Inches(1.55), Inches(4.05), Inches(0.7), bg=color, size=12)
        
        # 改造内容
        label(s, '改造内容', x+Inches(0.1), Inches(2.35), Inches(2), Inches(0.25), size=9, bold=True, color=color)
        multi_label(s, pros, x+Inches(0.1), Inches(2.6), Inches(3.85), Inches(1.5), size=8, color=DARK, bullet=True)
        
        # 利弊
        label(s, '利', x+Inches(0.1), Inches(4.1), Inches(0.3), Inches(0.2), size=9, bold=True, color=ACCENT)
        label(s, '弊', x+Inches(2.0), Inches(4.1), Inches(0.3), Inches(0.2), size=9, bold=True, color=DANGER)
        
        # 利
        for i, pro in enumerate(pros[:2]):
            label(s, f"✓ {pro}", x+Inches(0.1), Inches(4.35+i*0.2), Inches(1.8), Inches(0.2), size=7, color=ACCENT)
        
        # 弊
        for i, con in enumerate(cons[:3]):
            label(s, f"✗ {con}", x+Inches(2.0), Inches(4.35+i*0.2), Inches(2.0), Inches(0.2), size=7, color=DANGER)
        
        # 成本
        if '1.5' in title:
            cost = '前期中等 | 长期较低 | 无二次融合'
        elif '全迁' in title:
            cost = '前期最低 | 长期最高 | 有二次融合'
        else:
            cost = '前期最高 | 长期较低 | 无二次融合'
        
        box(s, cost, x, Inches(5.15), Inches(4.05), Inches(0.4), bg=bg_color, fg=color, size=8, bold=False)
        
        x += Inches(4.35)
    
    # 底部核心差异对比表
    label(s, '核心差异', Inches(0.3), Inches(5.75), Inches(3), Inches(0.25), size=10, bold=True, color=PRIMARY_DARK)
    headers2 = ['维度', '方案一(全迁)', '方案1.5(部分迁)★', '方案二(不迁)']
    rows2 = [
        ['调度引擎', '两套并存⚠️', '一套统一✅', '一套统一✅'],
        ['报表/视图', '迁入复用', '迁入复用✅', '重新开发'],
        ['数据模型', '初期两套⚠️', '一套统一✅', '一套统一✅'],
        ['二次融合', '有⚠️', '无✅', '无✅'],
        ['长期成本', '最高', '较低✅', '较低'],
    ]
    table(s, headers2, rows2, Inches(0.3), Inches(6.05), Inches(12.7), Inches(1.3))

    # ============ P7: 方案1.5详细 - 代码拆解 ============
    s = new_slide()
    add_title(s, '三、方案1.5代码拆解——哪些迁哪些不迁')
    add_desc(s, '判断依据：代码与调度引擎的耦合度。无耦合的（报表/视图/评估）适合迁入，高耦合的（调度/工单/派单）不迁用新引擎')
    
    # 左侧：适合迁（绿色）
    box(s, '✓ 适合迁入（与调度无耦合）', Inches(0.3), Inches(1.55), Inches(6.2), Inches(0.45), bg=ACCENT, size=11)
    
    fit_items = [
        ('11个报表查询代码', 'SQL+数据聚合+图表渲染\n迁入后适配数据源即可运行', ACCENT),
        ('指标视图代码', '运营驾驶舱/存量视图/事中监控\n统计指标计算逻辑', ACCENT),
        ('效果评估代码', '一事一案/营销任务执行效果\n分析统计逻辑', ACCENT),
        ('大数据接口调用代码', 'FTP数据获取/CRM查询等\n查询类接口逻辑', ACCENT),
    ]
    y = Inches(2.15)
    for title, desc, color in fit_items:
        box(s, title, Inches(0.4), y, Inches(2.8), Inches(0.35), bg=RGBColor(0xE8, 0xF5, 0xE9), fg=RGBColor(0x1B, 0x5E, 0x20), size=9, bold=False)
        label(s, desc, Inches(3.3), y, Inches(3.1), Inches(0.55), size=8, color=MID)
        y += Inches(0.6)
    
    # 右侧：不适合迁（红色）
    box(s, '✗ 不迁入（与调度高耦合，用新引擎）', Inches(6.8), Inches(1.55), Inches(6.2), Inches(0.45), bg=DANGER, size=11)
    
    unfit_items = [
        ('调度引擎+流程代码', '预警/营销任务流程引擎\n工单派发逻辑', DANGER),
        ('看管派单逻辑', '分包看管模式的\n客户→执行人匹配', DANGER),
        ('工单管理代码', '创建/接收/转派/完成\n状态流转由引擎驱动', DANGER),
        ('督办管理代码', '大屏调度/去调度\n依赖工单体系', DANGER),
    ]
    y = Inches(2.15)
    for title, desc, color in unfit_items:
        box(s, title, Inches(6.9), y, Inches(2.8), Inches(0.35), bg=RGBColor(0xFF, 0xEB, 0xEE), fg=DANGER, size=9, bold=False)
        label(s, desc, Inches(9.8), y, Inches(3.1), Inches(0.55), size=8, color=MID)
        y += Inches(0.6)
    
    # 底部：方案1.5关键前提
    box(s, '方案1.5关键前提', Inches(0.3), Inches(4.7), Inches(12.7), Inches(0.4), bg=PRIMARY_LIGHT, fg=PRIMARY_DARK, size=10, bold=False)
    multi_label(s, [
        '1. 迁入的报表/视图代码需适配运营平台数据源（改表名/字段名）',
        '2. 运营平台数据模型的稳定速度直接影响报表迁入效果',
        '3. 调度层面的9大场景规则需从精益平台提取，在新引擎中重新配置',
        '4. 需与精益平台开发团队配合梳理规则，业务方联合评审确认',
    ], Inches(0.5), Inches(5.2), Inches(12.5), Inches(1.5), size=9, color=DARK, bullet=False)

    # ============ P8: 4A票据透传 + 人员角色 ============
    s = new_slide()
    add_title(s, '三、短期页面集成方案与人员角色迁移')
    add_desc(s, '短期采用4A票据透传+iframe嵌入，21个常用页面集成到运营平台"精益运营"菜单下，不允许跳转新标签页')
    
    # 上半区：4A流程图
    label(s, '4A票据透传流程', Inches(0.3), Inches(1.55), Inches(4), Inches(0.3), size=12, bold=True, color=PRIMARY_DARK)
    
    steps = [
        ('用户登录\n运营平台', ACCENT),
        ('点击\n"精益运营"', PRIMARY),
        ('后端调用\n4A申请Token', PRIMARY_DARK),
        ('4A返回\nTOKEN', WARN),
        ('iframe加载\n精益URL+Token', PRIMARY),
        ('精益验证\nToken', PRIMARY_DARK),
        ('免登\n展示页面', ACCENT),
    ]
    x = Inches(0.3)
    for text, color in steps:
        box(s, text, x, Inches(1.95), Inches(1.6), Inches(0.55), bg=color, size=8)
        if text != steps[-1][0]:
            arrow_r(s, x+Inches(1.65), Inches(2.1), Inches(0.15), Inches(0.1))
        x += Inches(1.85)
    
    # 前置工作
    label(s, '前置工作（7项）', Inches(0.3), Inches(2.7), Inches(3), Inches(0.25), size=10, bold=True, color=PRIMARY_DARK)
    prereqs = [
        '①运营平台4A注册(获取ACCT/PWD)', '②确认精益4A的SERVICEID',
        '③确认用户账号映射关系', '④精益提供SSO入口URL',
        '⑤精益壳剥离(检测iframe隐藏导航)', '⑥网络策略开通(运营↔4A,精益↔4A)',
        '⑦运营后端集成4A WebService(SOAP)',
    ]
    multi_label(s, prereqs, Inches(0.3), Inches(2.95), Inches(6.2), Inches(1.5), size=8, color=DARK, bullet=False)
    
    # 右侧：人员角色迁移
    label(s, '人员与角色迁移', Inches(6.8), Inches(1.55), Inches(4), Inches(0.3), size=12, bold=True, color=PRIMARY_DARK)
    
    label(s, '人员：无需迁移（4A统一认证）', Inches(6.8), Inches(1.9), Inches(6), Inches(0.25), size=9, bold=True, color=ACCENT)
    label(s, '需迁移：人员-角色绑定关系', Inches(6.8), Inches(2.15), Inches(6), Inches(0.25), size=9, color=DARK)
    
    label(s, '角色（7类需在运营平台新增）', Inches(6.8), Inches(2.5), Inches(6), Inches(0.25), size=9, bold=True, color=PRIMARY_DARK)
    roles = ['区公司业务人员', '审批人', '分公司业务人员', '网格经理', '地市集运', '被督办人', '督办人']
    x = Inches(6.8)
    for role in roles:
        box(s, role, x, Inches(2.8), Inches(1.75), Inches(0.32), bg=PRIMARY_LIGHT, fg=PRIMARY, size=7, bold=False)
        x += Inches(1.85)
    
    # 迁移4步
    label(s, '迁移步骤', Inches(6.8), Inches(3.3), Inches(3), Inches(0.25), size=9, bold=True, color=PRIMARY_DARK)
    mig_steps = ['①角色定义→②菜单权限→③数据权限→④人员角色导入']
    label(s, mig_steps[0], Inches(6.8), Inches(3.55), Inches(6), Inches(0.25), size=8, color=DARK)

    # 底部：短期改造任务清单
    label(s, '短期改造任务清单', Inches(0.3), Inches(4.2), Inches(4), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    headers = ['改造项', '责任方', '交付物']
    rows = [
        ['后端4A票据申请接口', '运营平台开发', '/api/sso/lean-token API'],
        ['前端"精益运营"菜单+路由', '运营平台开发', 'Header菜单+路由配置'],
        ['前端iframe容器组件', '运营平台开发', '通用iframe+Token获取'],
        ['精益SSO入口URL', '精益平台开发', 'SSO登录页URL'],
        ['精益壳剥离', '精益平台开发', '检测iframe隐藏导航'],
        ['4A应用注册+凭据', '4A管理员', 'ACCT/PWD+SERVICEID'],
        ['网络策略开通', '网络管理员', '运营↔4A/精益↔4A连通'],
        ['新增精益业务角色权限', '运营平台开发', '7类角色+菜单+数据权限'],
    ]
    table(s, headers, rows, Inches(0.3), Inches(4.55), Inches(12.7), Inches(2.7))

    # ============ P9: 实施路径总览 ============
    s = new_slide()
    add_title(s, '四、实施路径总览')
    add_desc(s, '三阶段推进：短期8月统一入口→中期9-12月能力融合→长期2027Q1+全面融合，每步有交付物和价值体现')
    
    # 三阶段大流程图
    phases = [
        ('短期\n8月', '统一入口\n页面集成', PRIMARY),
        ('中期\n9-12月', '能力融合\n流程报表数据', PRIMARY_DARK),
        ('长期\n27Q1+', '全面融合\n精益下线', ACCENT),
    ]
    x = Inches(0.3)
    for period, content, color in phases:
        box(s, period, x, Inches(1.55), Inches(2.0), Inches(0.55), bg=color, size=11)
        box(s, content, x, Inches(2.2), Inches(2.0), Inches(0.5), bg=RGBColor(0xE3, 0xF0, 0xFF) if color != ACCENT else RGBColor(0xE8, 0xF5, 0xE9), fg=color, size=10, bold=False)
        if content != phases[-1][1]:
            arrow_r(s, x+Inches(2.1), Inches(1.85), Inches(0.4), Inches(0.2), color=color)
        x += Inches(4.35)
    
    # 短期详情
    box(s, '短期（8月）', Inches(0.3), Inches(2.9), Inches(4.05), Inches(0.4), bg=PRIMARY, size=10)
    short_items = ['4A票据透传SSO对接', '21个常用页面iframe嵌入', '精益壳剥离改造', '运营平台"精益运营"专区', '7类角色+权限配置']
    multi_label(s, short_items, Inches(0.4), Inches(3.4), Inches(3.9), Inches(1.5), size=8, color=DARK, bullet=True)
    box(s, '价值：统一入口免登录', Inches(0.3), Inches(5.0), Inches(4.05), Inches(0.35), bg=PRIMARY_LIGHT, fg=PRIMARY, size=9, bold=False)
    
    # 中期详情
    box(s, '中期（9-12月）', Inches(4.65), Inches(2.9), Inches(4.05), Inches(0.4), bg=PRIMARY_DARK, size=10)
    mid_items = ['预警中心+规则引擎开发', '调度类型扩展(ALT+CUR)', '9大场景规则配置+验证', '11个报表实现(迁入/重写)', '下游接口运营平台直连', '存量数据割接']
    multi_label(s, mid_items, Inches(4.75), Inches(3.4), Inches(3.9), Inches(1.5), size=8, color=DARK, bullet=True)
    box(s, '价值：数据互通流程闭环', Inches(4.65), Inches(5.0), Inches(4.05), Inches(0.35), bg=RGBColor(0xE3, 0xF0, 0xFF), fg=PRIMARY_DARK, size=9, bold=False)
    
    # 长期详情
    box(s, '长期（2027Q1+）', Inches(9.0), Inches(2.9), Inches(4.05), Inches(0.4), bg=ACCENT, size=10)
    long_items = ['补齐独有能力(督办/投屏等)', '集团规范新能力建设', '方案一需二次融合', '精益只读→归档→下线']
    multi_label(s, long_items, Inches(9.1), Inches(3.4), Inches(3.9), Inches(1.5), size=8, color=DARK, bullet=True)
    box(s, '价值：一平台闭环运维降本', Inches(9.0), Inches(5.0), Inches(4.05), Inches(0.35), bg=RGBColor(0xE8, 0xF5, 0xE9), fg=RGBColor(0x1B, 0x5E, 0x20), size=9, bold=False)
    
    # 时间轴
    label(s, '时间轴', Inches(0.3), Inches(5.55), Inches(3), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    milestones = [
        ('6月中', '启动', PRIMARY_LIGHT, PRIMARY),
        ('7月', '4A联调', PRIMARY_LIGHT, PRIMARY),
        ('8月★', '短期上线', ACCENT, WHITE),
        ('9月', '预警中心', PRIMARY_LIGHT, PRIMARY),
        ('10月', '看管+监控', PRIMARY_LIGHT, PRIMARY),
        ('11月', '报表+接口', PRIMARY_LIGHT, PRIMARY),
        ('12月★', '中期上线', ACCENT, WHITE),
        ('27Q1', '双轨并行', RGBColor(0xF3, 0xE5, 0xF5), RGBColor(0x7B, 0x1F, 0xA2)),
        ('27Q2★', '全面融合', ACCENT, WHITE),
    ]
    x = Inches(0.3)
    for time, title, bg, fg in milestones:
        is_star = '★' in time
        box(s, f"{time}\n{title}", x, Inches(5.9), Inches(1.35), Inches(0.5), bg=bg, fg=fg, size=7, bold=is_star)
        x += Inches(1.43)

    # ============ P10: 调度类型扩展 + 9大场景映射 ============
    s = new_slide()
    add_title(s, '五、调度类型扩展与9大场景映射')
    add_desc(s, '精益5类工单无法直接映射运营平台6种调度类型，新增预警调度(ALT)+看管调度(CUR)，9大场景统一使用ALT')
    
    # 映射关系图
    label(s, '精益5类工单 → 运营平台8种调度类型', Inches(0.3), Inches(1.55), Inches(6), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    
    mappings = [
        ('营销类', '→ 预警调度(ALT)★', WARN),
        ('提醒类', '→ 预警调度(ALT)★', WARN),
        ('到期类', '→ 预警调度(ALT)★', WARN),
        ('任务类', '→ 已有类型覆盖', ACCENT),
        ('效果类', '→ 不需要调度', MID),
    ]
    y = Inches(1.95)
    for lean, ops, color in mappings:
        box(s, lean, Inches(0.5), y, Inches(1.5), Inches(0.35), bg=RGBColor(0xFF, 0xF3, 0xE0), fg=WARN, size=9, bold=False)
        arrow_r(s, Inches(2.1), y+Inches(0.08), Inches(0.3), Inches(0.15), color=LIGHT)
        box(s, ops, Inches(2.5), y, Inches(2.8), Inches(0.35), bg=PRIMARY if 'ALT' in ops else (RGBColor(0xE8,0xF5,0xE9) if '已有' in ops else RGBColor(0xF5,0xF5,0xF5)),
            fg=WHITE if 'ALT' in ops else (ACCENT if '已有' in ops else MID), size=9)
        y += Inches(0.4)
    
    # 8种调度类型
    label(s, '扩展后8种调度类型', Inches(5.8), Inches(1.55), Inches(5), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    types = [
        ('指标调度IND', PRIMARY_LIGHT, PRIMARY), ('策略调度STR', PRIMARY_LIGHT, PRIMARY),
        ('客群调度CG-OP', PRIMARY_LIGHT, PRIMARY), ('客户商机COD', PRIMARY_LIGHT, PRIMARY),
        ('客群商机GOD', PRIMARY_LIGHT, PRIMARY), ('区域攻坚RAS', PRIMARY_LIGHT, PRIMARY),
        ('预警调度ALT★', WARN, WHITE), ('看管调度CUR★', WARN, WHITE),
    ]
    x = Inches(5.8)
    for i, (name, bg, fg) in enumerate(types):
        row = i // 4
        col = i % 4
        box(s, name, Inches(5.8) + Inches(col*1.8), Inches(1.95) + Inches(row*0.45), Inches(1.7), Inches(0.38), bg=bg, fg=fg, size=8, bold=('★' in name))
    
    # 9大场景映射表
    label(s, '9大场景映射', Inches(0.3), Inches(4.2), Inches(3), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    headers = ['场景', '调度类型', '预警类型', '触发频率', '客户类型']
    rows = [
        ['携转挽留', '预警调度(ALT)', '被动预警', '实时', '全量'],
        ['宽带离网', '预警调度(ALT)', '主动预警', '月度', '全量'],
        ['全球通离网', '预警调度(ALT)', '主动预警', '月度', '全球通'],
        ['全球通投诉', '预警调度(ALT)', '被动预警', '实时', '全球通'],
        ['异动客户修复', '预警调度(ALT)', '主动预警', '月度', '全量'],
        ['热线商机', '预警调度(ALT)', '被动预警', '实时', '全量'],
        ['离网追溯', '预警调度(ALT)', '被动预警', '日度', '全球通'],
        ['停机赢回', '预警调度(ALT)', '主动预警', '日度', '全球通'],
        ['铁通赢回', '预警调度(ALT)', '主动预警', '日度', '全球通'],
    ]
    table(s, headers, rows, Inches(0.3), Inches(4.55), Inches(12.7), Inches(2.7))
    
    # 停机赢回说明
    label(s, '"停机赢回"场景：预警触发创建ALT工单，调度配置中引用看管规则，不需要同时创建两个工单',
          Inches(0.3), Inches(7.2), Inches(12.7), Inches(0.25), size=8, color=MID)

    # ============ P11: 11个报表 + 流程整合 + 数据迁移 ============
    s = new_slide()
    add_title(s, '五、关键挑战：报表迁移·流程整合·数据迁移')
    add_desc(s, '11个报表中7个依赖预警引擎数据需等预警模块就绪；流程基于运营平台调度中心重开发下游接口复用；数据按运营平台表结构迁移')
    
    # 左半区：11个报表
    label(s, '11个报表迁移', Inches(0.3), Inches(1.55), Inches(3), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    headers = ['报表', '数据来源', '优先级', '计划']
    rows = [
        ['一线任务执行监控', '工单+网格通反馈', 'P0', '10月'],
        ['集运任务执行盯控', '工单+效果评估', 'P0', '10月'],
        ['携转预警分析-新', '大数据→预警→工单', 'P0', '11月'],
        ['宽带离网预警分析-新', '大数据→预警→工单', 'P0', '11月'],
        ['全球通离网预警分析-新', '大数据→预警→工单', 'P0', '11月'],
        ['投诉工单预警分析-新', 'CRM投诉→预警→工单', 'P1', '11月'],
        ['热线商机预警分析', '在线平台→预警→工单', 'P1', '12月'],
        ['异动客户预警分析', '大数据→预警→工单', 'P1', '12月'],
        ['离网追溯反馈分析', '网格通反馈→工单', 'P1', '12月'],
        ['停机赢回预警分析', '大数据→预警→工单', 'P1', '12月'],
        ['铁通赢回预警分析', '大数据+CRM→工单', 'P2', '12月'],
    ]
    table(s, headers, rows, Inches(0.3), Inches(1.9), Inches(6.5), Inches(3.8))
    
    # 右半区上：流程整合
    label(s, '流程整合', Inches(7.1), Inches(1.55), Inches(3), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    
    flow_items = [
        '基于运营平台调度中心重开发',
        '下游派单接口复用精益协议',
        '由运营平台重新对接派单',
        '新增ALT/CUR两种调度类型',
        '9大场景规则提取→规则引擎配置',
        '派单规则可配置(非硬编码)',
    ]
    multi_label(s, flow_items, Inches(7.1), Inches(1.9), Inches(5.9), Inches(1.5), size=8, color=DARK, bullet=True)
    
    # 右半区下：数据迁移
    label(s, '数据迁移', Inches(7.1), Inches(3.7), Inches(3), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    
    data_items = [
        ('已关闭历史工单', '批量迁移，作为历史数据查询'),
        ('进行中工单', '精益平台内处理完毕，不迁移中间状态'),
        ('预警规则配置', '全量迁移，运营平台预警中心重新配置生效'),
        ('看管规则配置', '全量迁移，运营平台调度中心重新配置生效'),
    ]
    y = Inches(4.05)
    for data_type, strategy in data_items:
        box(s, data_type, Inches(7.2), y, Inches(2.2), Inches(0.32), bg=PRIMARY_LIGHT, fg=PRIMARY, size=7, bold=False)
        label(s, strategy, Inches(9.5), y, Inches(3.5), Inches(0.3), size=7, color=DARK)
        y += Inches(0.38)
    
    # 底部：双轨并行+回退
    label(s, '双轨并行与回退', Inches(0.3), Inches(6.0), Inches(4), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    box(s, '双轨策略', Inches(0.3), Inches(6.35), Inches(6.2), Inches(0.35), bg=RGBColor(0xFE,0xF9,0xE7), fg=WARN, size=8, bold=False)
    label(s, '设定切换点，切换点后新预警只推运营平台，精益不再产生新工单；在途工单在精益内自然结束',
          Inches(0.4), Inches(6.7), Inches(6.0), Inches(0.5), size=8, color=DARK)
    
    box(s, '回退方案', Inches(6.8), Inches(6.35), Inches(6.2), Inches(0.35), bg=RGBColor(0xFC,0xE4,0xEC), fg=DANGER, size=8, bold=False)
    label(s, '短期：精益运营菜单一键下线即可回退 | 中期：双轨期精益仍在运行，将预警触发切回精益即可 | 每步独立回退',
          Inches(6.9), Inches(6.7), Inches(6.0), Inches(0.5), size=8, color=DARK)

    # ============ P12: 风险管理 ============
    s = new_slide()
    add_title(s, '六、风险管理')
    add_desc(s, '8项关键风险及应对措施，最大风险：方案一的两套引擎边界模糊，方案1.5/二的业务规则提取遗漏')
    
    headers = ['风险', '影响', '概率', '应对措施']
    rows = [
        ['精益平台配合资源不到位', '4A对接和壳剥离延迟', '中', '提前2周锁定精益开发资源'],
        ['4A注册/网络策略审批延迟', '8月上线风险', '中', '6月中旬启动后立即申请'],
        ['业务规则提取遗漏', '新系统行为不一致', '中', '双轨并行验证对比+业务方确认'],
        ['两套引擎边界模糊(方案一)', '维护成本递增', '高', '老引擎只修Bug不做新增'],
        ['网格通/IOP接口对接延期', '调度类型无法上线', '中', '9月第一周启动对接'],
        ['大数据FTP数据口径不一致', '报表数据对不上', '高', '提前做数据比对'],
        ['用户抵触新平台', '仍习惯精益平台', '中', '提前培训+新功能仅运营平台开放'],
        ['存量数据割接不完整', '历史工单数据丢失', '低', '割接前全量备份+逐一校验'],
    ]
    table(s, headers, rows, Inches(0.3), Inches(1.5), Inches(12.7), Inches(3.0))
    
    # 精益平台下线条件
    label(s, '精益平台下线条件（4条硬性条件全部满足）', Inches(0.3), Inches(4.7), Inches(8), Inches(0.3), size=11, bold=True, color=PRIMARY_DARK)
    conditions = [
        ('条件1', '9大场景在运营平台稳定运行≥3个月，无重大业务问题', ACCENT),
        ('条件2', '11个报表数据与精益平台历史数据比对无差异', ACCENT),
        ('条件3', '所有外部系统已切换调用运营平台接口', ACCENT),
        ('条件4', '历史数据已完整归档并可查询', ACCENT),
    ]
    y = Inches(5.1)
    for name, desc, color in conditions:
        box(s, name, Inches(0.4), y, Inches(1.0), Inches(0.35), bg=color, size=8)
        label(s, desc, Inches(1.5), y, Inches(11.5), Inches(0.3), size=9, color=DARK)
        y += Inches(0.42)
    
    # 测试+培训
    label(s, '测试验证', Inches(0.3), Inches(6.85), Inches(2), Inches(0.25), size=10, bold=True, color=PRIMARY_DARK)
    label(s, '环境：运营平台测试环境 | 数据：脱敏生产数据 | 执行：IT方功能测试+业务方UAT | 验收：9大场景跑通+11报表准确+双轨比对一致',
          Inches(0.3), Inches(7.1), Inches(12.7), Inches(0.3), size=8, color=DARK)
    
    # ============ P13: 总结 ============
    s = new_slide()
    add_title(s, '七、总结')
    add_desc(s, '核心逻辑：短期统一入口→中期能力融合→长期全面融合。三种技术路线各有利弊，推荐方案1.5')
    
    # 核心逻辑流程图
    logic = [
        ('短期8月\n统一入口', PRIMARY),
        ('中期9-12月\n能力融合', PRIMARY_DARK),
        ('长期27Q1+\n全面融合', ACCENT),
    ]
    x = Inches(1.0)
    for text, color in logic:
        box(s, text, x, Inches(1.55), Inches(3.3), Inches(0.6), bg=color, size=13)
        if text != logic[-1][0]:
            arrow_r(s, x+Inches(3.4), Inches(1.7), Inches(0.5), Inches(0.2), color=color)
        x += Inches(3.95)
    
    # 三方案卡片
    plan_summaries = [
        ('方案一：全迁代码', 
         '前期投入最低 | 长期成本最高',
         '✗ 两套引擎并存 ✗ 二次融合不可避免 ✗ 数据模型分裂',
         DANGER, RGBColor(0xFF, 0xEB, 0xEE)),
        ('方案1.5：部分迁代码 ★推荐', 
         '前期中等 | 长期较低 | 无二次融合',
         '✓ 一套引擎统一 ✓ 报表迁入复用 ✓ 数据模型统一 ✓ 无需二次融合',
         PRIMARY, PRIMARY_LIGHT),
        ('方案二：不迁代码', 
         '前期最高 | 长期较低 | 无二次融合',
         '✓ 一套引擎统一 ✓ 数据模型统一 ✗ 报表全部重新开发',
         WARN, RGBColor(0xFF, 0xF3, 0xE0)),
    ]
    
    x = Inches(0.3)
    for title, cost, key_points, color, bg in plan_summaries:
        box(s, title, x, Inches(2.4), Inches(4.05), Inches(0.5), bg=color, size=12)
        box(s, cost, x, Inches(2.95), Inches(4.05), Inches(0.35), bg=bg, fg=color, size=9, bold=False)
        multi_label(s, key_points.split(' '), x+Inches(0.1), Inches(3.4), Inches(3.85), Inches(1.2), size=9, color=DARK)
        x += Inches(4.35)
    
    # 每步有明确交付物
    box(s, '每一步都有明确的交付物和价值体现，每一步都以前一步为基础，不存在"空中楼阁"式规划',
        Inches(0.3), Inches(4.8), Inches(12.7), Inches(0.45), bg=PRIMARY_LIGHT, fg=PRIMARY_DARK, size=11, bold=False)
    
    # 下一步
    label(s, '需领导决策', Inches(0.3), Inches(5.5), Inches(3), Inches(0.3), size=13, bold=True, color=PRIMARY_DARK)
    decisions = [
        '1. 选择哪种技术路线？（方案一 / 方案1.5 / 方案二）',
        '2. 短期8月上线目标是否确认？',
        '3. 精益平台开发团队配合资源能否锁定？',
        '4. 4A系统注册和网络策略审批何时启动？',
    ]
    multi_label(s, decisions, Inches(0.3), Inches(5.9), Inches(12.7), Inches(1.2), size=10, color=DARK)
    
    # ============ P14: 结束页 ============
    s = new_slide()
    # 大字居中
    box(s, '汇报完毕\n请提出宝贵意见', Inches(1.5), Inches(2.5), Inches(10.33), Inches(2.0), bg=WHITE, fg=PRIMARY_DARK, size=36, bold=True)
    
    # ============ 保存 ============
    # 删除模板原有示例页(第2-5页)
    for idx in sorted([1, 2, 3, 4], reverse=True):
        rId = prs.slides._sldIdLst[idx].get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
        prs.part.drop_rel(rId)
        del prs.slides._sldIdLst[idx]
    
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    prs.save(OUTPUT_PATH)
    print(f"PPT已生成: {OUTPUT_PATH}")
    print(f"总页数: {len(prs.slides)}")

if __name__ == '__main__':
    generate()
