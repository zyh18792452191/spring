#!/usr/bin/env python3
"""
PPT生成模板 (.pptx)
基于 python-pptx 库，提供封面、目录、内容页、图表页、表格页等能力。

使用方式：
1. 复制本脚本到 /tmp/ 目录
2. 修改PPT内容（标题、章节、页面内容）
3. 执行: python3 generate_pptx.py
4. 输出文件到 docs/ 对应子目录
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu, Cm
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE


# ============================================================
# 配色方案
# ============================================================
COLORS = {
    'primary': RGBColor(31, 78, 121),       # 深蓝 #1F4E79
    'secondary': RGBColor(91, 155, 213),     # 浅蓝 #5B9BD5
    'accent': RGBColor(237, 125, 49),        # 橙色 #ED7D31
    'success': RGBColor(112, 173, 71),       # 绿色 #70AD47
    'danger': RGBColor(192, 0, 0),           # 红色 #C00000
    'warning': RGBColor(255, 192, 0),        # 黄色 #FFC000
    'white': RGBColor(255, 255, 255),
    'black': RGBColor(0, 0, 0),
    'dark_gray': RGBColor(64, 64, 64),
    'light_gray': RGBColor(217, 217, 217),
    'bg_light': RGBColor(240, 245, 250),     # 浅蓝背景
}

FONT_NAME = 'Microsoft YaHei'


# ============================================================
# 工具函数
# ============================================================

def set_text(textframe, text, font_size=Pt(18), bold=False, color=COLORS['black'], alignment=PP_ALIGN.LEFT):
    """设置文本框内容"""
    textframe.clear()
    p = textframe.paragraphs[0]
    p.alignment = alignment
    run = p.add_run()
    run.text = text
    run.font.name = FONT_NAME
    run.font.size = font_size
    run.font.bold = bold
    run.font.color.rgb = color
    return p


def add_text_box(slide, left, top, width, height, text, font_size=Pt(18), bold=False,
                 color=COLORS['black'], alignment=PP_ALIGN.LEFT, bg_color=None):
    """添加文本框"""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    set_text(tf, text, font_size, bold, color, alignment)
    if bg_color:
        fill = txBox.fill
        fill.solid()
        fill.fore_color.rgb = bg_color
    return txBox


def add_shape_rect(slide, left, top, width, height, fill_color, line_color=None):
    """添加矩形色块"""
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if line_color:
        shape.line.fill.solid()
        shape.line.fill.fore_color.rgb = line_color
    else:
        shape.line.fill.background()
    return shape


def add_bullet_list(slide, left, top, width, height, items, font_size=Pt(16), color=COLORS['dark_gray']):
    """添加项目列表"""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.space_after = Pt(8)
        if isinstance(item, tuple):
            # (bold_prefix, normal_text)
            run1 = p.add_run()
            run1.text = item[0]
            run1.font.name = FONT_NAME
            run1.font.size = font_size
            run1.font.bold = True
            run1.font.color.rgb = COLORS['primary']
            run2 = p.add_run()
            run2.text = item[1]
            run2.font.name = FONT_NAME
            run2.font.size = font_size
            run2.font.color.rgb = color
        else:
            run = p.add_run()
            run.text = f'• {item}'
            run.font.name = FONT_NAME
            run.font.size = font_size
            run.font.color.rgb = color
    return txBox


def add_table(slide, left, top, width, height, headers, rows):
    """添加表格"""
    table_shape = slide.shapes.add_table(len(rows) + 1, len(headers), left, top, width, height)
    table = table_shape.table

    # 表头
    for i, header in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = header
        for paragraph in cell.text_frame.paragraphs:
            paragraph.alignment = PP_ALIGN.CENTER
            for run in paragraph.runs:
                run.font.name = FONT_NAME
                run.font.size = Pt(12)
                run.font.bold = True
                run.font.color.rgb = COLORS['white']
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLORS['primary']

    # 数据行
    for row_idx, row_data in enumerate(rows):
        for col_idx, cell_text in enumerate(row_data):
            cell = table.cell(row_idx + 1, col_idx)
            cell.text = str(cell_text)
            for paragraph in cell.text_frame.paragraphs:
                for run in paragraph.runs:
                    run.font.name = FONT_NAME
                    run.font.size = Pt(11)
                    run.font.color.rgb = COLORS['dark_gray']
            if row_idx % 2 == 1:
                cell.fill.solid()
                cell.fill.fore_color.rgb = COLORS['bg_light']

    return table_shape


# ============================================================
# 页面模板
# ============================================================

def add_cover_slide(prs, title, subtitle, author='', date=''):
    """封面页"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # 空白版式

    # 深蓝背景条
    add_shape_rect(slide, Cm(0), Cm(0), Cm(33.87), Cm(9), COLORS['primary'])

    # 主标题
    add_text_box(slide, Cm(2), Cm(2), Cm(30), Cm(3), title,
                 font_size=Pt(36), bold=True, color=COLORS['white'], alignment=PP_ALIGN.LEFT)

    # 副标题
    add_text_box(slide, Cm(2), Cm(5.5), Cm(30), Cm(2), subtitle,
                 font_size=Pt(24), color=RGBColor(180, 210, 240), alignment=PP_ALIGN.LEFT)

    # 分割线
    add_shape_rect(slide, Cm(2), Cm(8), Cm(6), Cm(0.1), COLORS['accent'])

    # 作者和日期
    if author:
        add_text_box(slide, Cm(2), Cm(10), Cm(15), Cm(1.5), f'汇报人：{author}',
                     font_size=Pt(14), color=COLORS['dark_gray'])
    if date:
        add_text_box(slide, Cm(2), Cm(11.5), Cm(15), Cm(1.5), f'日期：{date}',
                     font_size=Pt(14), color=COLORS['dark_gray'])

    return slide


def add_toc_slide(prs, chapters):
    """目录页"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # 左侧深蓝色块
    add_shape_rect(slide, Cm(0), Cm(0), Cm(10), Cm(19.05), COLORS['primary'])

    # 目录标题
    add_text_box(slide, Cm(1.5), Cm(4), Cm(7), Cm(2), '目录',
                 font_size=Pt(36), bold=True, color=COLORS['white'])

    # 分割线
    add_shape_rect(slide, Cm(1.5), Cm(6.5), Cm(4), Cm(0.08), COLORS['accent'])

    # 右侧章节列表
    items = []
    for i, chapter in enumerate(chapters):
        items.append((f'0{i+1}  ', chapter))
    add_bullet_list(slide, Cm(11), Cm(3), Cm(20), Cm(14), items,
                    font_size=Pt(20), color=COLORS['dark_gray'])

    return slide


def add_section_slide(prs, section_number, section_title):
    """章节分隔页"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # 全屏深蓝背景
    add_shape_rect(slide, Cm(0), Cm(0), Cm(33.87), Cm(19.05), COLORS['primary'])

    # 章节编号
    add_text_box(slide, Cm(3), Cm(5), Cm(10), Cm(2), f'0{section_number}',
                 font_size=Pt(60), bold=True, color=COLORS['accent'])

    # 分割线
    add_shape_rect(slide, Cm(3), Cm(8.5), Cm(5), Cm(0.08), COLORS['accent'])

    # 章节标题
    add_text_box(slide, Cm(3), Cm(9.5), Cm(28), Cm(3), section_title,
                 font_size=Pt(32), bold=True, color=COLORS['white'])

    return slide


def add_content_slide(prs, title, content_items, note_text=''):
    """内容页：标题+要点列表"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # 顶部蓝色条
    add_shape_rect(slide, Cm(0), Cm(0), Cm(33.87), Cm(1.2), COLORS['primary'])

    # 页面标题
    add_text_box(slide, Cm(1.5), Cm(0.15), Cm(30), Cm(1), title,
                 font_size=Pt(24), bold=True, color=COLORS['white'])

    # 分割线
    add_shape_rect(slide, Cm(1.5), Cm(1.8), Cm(30.87), Cm(0.04), COLORS['light_gray'])

    # 要点列表
    add_bullet_list(slide, Cm(1.5), Cm(2.5), Cm(30), Cm(14), content_items,
                    font_size=Pt(18), color=COLORS['dark_gray'])

    # 底部备注
    if note_text:
        add_text_box(slide, Cm(1.5), Cm(17), Cm(30), Cm(1.5), note_text,
                     font_size=Pt(12), color=RGBColor(150, 150, 150))

    return slide


def add_table_slide(prs, title, headers, rows, note_text=''):
    """表格页：标题+表格"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # 顶部蓝色条
    add_shape_rect(slide, Cm(0), Cm(0), Cm(33.87), Cm(1.2), COLORS['primary'])

    # 页面标题
    add_text_box(slide, Cm(1.5), Cm(0.15), Cm(30), Cm(1), title,
                 font_size=Pt(24), bold=True, color=COLORS['white'])

    # 表格
    add_table(slide, Cm(1.5), Cm(2), Cm(30.87), Cm(14), headers, rows)

    # 底部备注
    if note_text:
        add_text_box(slide, Cm(1.5), Cm(17), Cm(30), Cm(1.5), note_text,
                     font_size=Pt(12), color=RGBColor(150, 150, 150))

    return slide


def add_two_column_slide(prs, title, left_title, left_items, right_title, right_items):
    """双栏页：左右对比"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # 顶部蓝色条
    add_shape_rect(slide, Cm(0), Cm(0), Cm(33.87), Cm(1.2), COLORS['primary'])

    # 页面标题
    add_text_box(slide, Cm(1.5), Cm(0.15), Cm(30), Cm(1), title,
                 font_size=Pt(24), bold=True, color=COLORS['white'])

    # 左栏标题
    add_shape_rect(slide, Cm(1.5), Cm(2), Cm(15), Cm(1.5), COLORS['primary'])
    add_text_box(slide, Cm(2), Cm(2.1), Cm(14), Cm(1.2), left_title,
                 font_size=Pt(16), bold=True, color=COLORS['white'])

    # 左栏内容
    add_bullet_list(slide, Cm(1.5), Cm(4), Cm(15), Cm(12), left_items,
                    font_size=Pt(14), color=COLORS['dark_gray'])

    # 右栏标题
    add_shape_rect(slide, Cm(17.87), Cm(2), Cm(15), Cm(1.5), COLORS['secondary'])
    add_text_box(slide, Cm(18.37), Cm(2.1), Cm(14), Cm(1.2), right_title,
                 font_size=Pt(16), bold=True, color=COLORS['white'])

    # 右栏内容
    add_bullet_list(slide, Cm(17.87), Cm(4), Cm(15), Cm(12), right_items,
                    font_size=Pt(14), color=COLORS['dark_gray'])

    return slide


def add_summary_slide(prs, summary_text=''):
    """总结页"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # 深蓝背景
    add_shape_rect(slide, Cm(0), Cm(0), Cm(33.87), Cm(19.05), COLORS['primary'])

    # 谢谢
    add_text_box(slide, Cm(3), Cm(6), Cm(28), Cm(4), '谢谢',
                 font_size=Pt(48), bold=True, color=COLORS['white'], alignment=PP_ALIGN.CENTER)

    # 分割线
    add_shape_rect(slide, Cm(13), Cm(10.5), Cm(8), Cm(0.08), COLORS['accent'])

    # 补充文字
    if summary_text:
        add_text_box(slide, Cm(3), Cm(11.5), Cm(28), Cm(3), summary_text,
                     font_size=Pt(18), color=RGBColor(180, 210, 240), alignment=PP_ALIGN.CENTER)

    return slide


# ============================================================
# 主流程：示例PPT
# ============================================================

def generate_sample_ppt(output_path):
    prs = Presentation()
    prs.slide_width = Cm(33.87)   # 16:9
    prs.slide_height = Cm(19.05)

    # 封面
    add_cover_slide(prs, '市场数智运营平台', '需求汇报', author='市场部', date='2026年6月')

    # 目录
    add_toc_slide(prs, ['需求背景', '功能需求', '数据需求', '实施计划'])

    # 章节1
    add_section_slide(prs, 1, '需求背景')
    add_content_slide(prs, '业务痛点', [
        ('痛点1：', '指标分散，缺乏统一视图'),
        ('痛点2：', '区域下钻能力不足'),
        ('痛点3：', '日/月维度切换不便'),
        ('痛点4：', '调度执行情况缺乏跟踪'),
    ])

    # 章节2
    add_section_slide(prs, 2, '功能需求')
    add_table_slide(prs, '核心功能清单',
        ['编号', '功能', '描述'],
        [
            ['F-01', '区域选择器', '支持全疆→地市→网格三级选择'],
            ['F-02', '日/月切换', '支持日维度和月维度切换'],
            ['F-03', '指标详情弹窗', '子指标+区域交叉表+5级下钻'],
        ]
    )

    # 双栏对比
    add_two_column_slide(prs, '两种调度模式对比',
        '本级调度', [
            '同级区域人员统一接收',
            '1个主接收人',
            '1个总客户清单文件',
            '适用：集中式营销',
        ],
        '下级调度', [
            '按下级区域分别指定接收人',
            '每个区域1个主接收人',
            '每个区域独立客户清单',
            '适用：差异化营销',
        ]
    )

    # 总结
    add_summary_slide(prs, '期待与各位领导同事交流讨论')

    prs.save(output_path)
    print(f'PPT已生成: {output_path}')


if __name__ == '__main__':
    generate_sample_ppt('/tmp/sample_ppt.pptx')
