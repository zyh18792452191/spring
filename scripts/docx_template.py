#!/usr/bin/env python3
"""
Word文档生成模板 (.docx)
基于 python-docx 库，提供封面、目录、标题、段落、表格、分页等能力。

使用方式：
1. 复制本脚本到 /tmp/ 目录
2. 修改文档内容（封面信息、章节内容、表格数据）
3. 执行: python3 generate_docx.py
4. 输出文件到 docs/ 对应子目录
"""

from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml


# ============================================================
# 工具函数
# ============================================================

def set_cell_shading(cell, color):
    """设置单元格背景色"""
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)


def set_run_font(run, font_name='Microsoft YaHei', font_size=Pt(10.5), bold=False, color=None):
    """统一设置run的字体样式"""
    run.font.name = font_name
    run.font.size = font_size
    run.bold = bold
    run.element.rPr.rFonts.set(qn('w:eastAsia'), font_name)
    if color:
        run.font.color.rgb = color


def add_table(doc, headers, rows, col_widths=None, header_color="1F4E79", stripe_color="EBF5FB"):
    """
    添加格式化表格
    - headers: 表头列表
    - rows: 数据行列表（每行为列表）
    - col_widths: 列宽列表（cm）
    - header_color: 表头背景色
    - stripe_color: 交替行底色
    """
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # 表头
    hdr_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        hdr_cells[i].text = header
        for paragraph in hdr_cells[i].paragraphs:
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in paragraph.runs:
                set_run_font(run, font_size=Pt(9), bold=True, color=RGBColor(255, 255, 255))
        set_cell_shading(hdr_cells[i], header_color)

    # 数据行
    for row_idx, row_data in enumerate(rows):
        row_cells = table.rows[row_idx + 1].cells
        for col_idx, cell_text in enumerate(row_data):
            row_cells[col_idx].text = str(cell_text)
            for paragraph in row_cells[col_idx].paragraphs:
                for run in paragraph.runs:
                    set_run_font(run, font_size=Pt(9))
        # 交替行颜色
        if row_idx % 2 == 1:
            for cell in row_cells:
                set_cell_shading(cell, stripe_color)

    # 设置列宽
    if col_widths:
        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = Cm(width)

    return table


def add_heading(doc, text, level=1):
    """添加标题"""
    heading = doc.add_heading(text, level=level)
    for run in heading.runs:
        set_run_font(run, bold=True)
    return heading


def add_paragraph(doc, text, bold=False, font_size=Pt(10.5), alignment=None):
    """添加段落"""
    p = doc.add_paragraph()
    if alignment:
        p.alignment = alignment
    run = p.add_run(text)
    set_run_font(run, font_size=font_size, bold=bold)
    return p


def add_bullet(doc, text, bold_prefix=None):
    """添加列表项"""
    p = doc.add_paragraph(style='List Bullet')
    if bold_prefix:
        run = p.add_run(bold_prefix)
        set_run_font(run, bold=True)
        run2 = p.add_run(text)
        set_run_font(run2)
    else:
        run = p.add_run(text)
        set_run_font(run)
    return p


def add_cover_page(doc, title, subtitle, info_items):
    """
    添加封面页
    - title: 文档主标题
    - subtitle: 文档副标题
    - info_items: 封面信息 [(key, value), ...]
    """
    for _ in range(6):
        doc.add_paragraph()

    # 主标题
    title_para = doc.add_paragraph()
    title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title_para.add_run(title)
    set_run_font(run, font_size=Pt(28), bold=True, color=RGBColor(31, 78, 121))

    # 副标题
    subtitle_para = doc.add_paragraph()
    subtitle_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle_para.add_run(subtitle)
    set_run_font(run, font_size=Pt(22), bold=True, color=RGBColor(31, 78, 121))

    doc.add_paragraph()

    # 信息表
    info_table = doc.add_table(rows=len(info_items), cols=2)
    info_table.style = 'Table Grid'
    info_table.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for i, (key, val) in enumerate(info_items):
        info_table.rows[i].cells[0].text = key
        info_table.rows[i].cells[1].text = val
        for cell in info_table.rows[i].cells:
            for para in cell.paragraphs:
                para.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in para.runs:
                    set_run_font(run, font_size=Pt(11))
        info_table.rows[i].cells[0].width = Cm(4)
        info_table.rows[i].cells[1].width = Cm(8)
        set_cell_shading(info_table.rows[i].cells[0], "D6E4F0")

    doc.add_page_break()


def add_toc_page(doc, items):
    """
    添加目录页
    - items: 目录条目列表，缩进用空格表示层级
    """
    add_heading(doc, '目录', level=1)
    for item in items:
        p = doc.add_paragraph(item)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.3
        for run in p.runs:
            set_run_font(run, font_size=Pt(11))

    doc.add_page_break()


# ============================================================
# 主流程：示例文档
# ============================================================

def generate_sample_doc(output_path):
    doc = Document()

    # 全局样式
    style = doc.styles['Normal']
    style.font.name = 'Microsoft YaHei'
    style.font.size = Pt(10.5)
    style.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
    style.paragraph_format.line_spacing = 1.5
    style.paragraph_format.space_after = Pt(4)

    # 页边距
    for section in doc.sections:
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(2.8)
        section.right_margin = Cm(2.8)

    # 封面
    add_cover_page(doc,
        title='项目名称',
        subtitle='文档类型 文档标题',
        info_items=[
            ('文档版本', 'V1.0'),
            ('提报部门', '市场部'),
            ('提报人', '[姓名]'),
            ('提报日期', '2026年6月'),
        ]
    )

    # 目录
    add_toc_page(doc, [
        '一、需求概述',
        '    1.1 业务背景',
        '    1.2 需求目标',
        '二、功能需求',
        '三、数据需求',
        '四、非功能需求',
    ])

    # 正文
    add_heading(doc, '一、需求概述', level=1)
    add_heading(doc, '1.1 业务背景', level=2)
    add_paragraph(doc, '在此填写业务背景描述...')

    add_heading(doc, '1.2 需求目标', level=2)
    add_bullet(doc, '目标1描述', bold_prefix='目标1：')
    add_bullet(doc, '目标2描述', bold_prefix='目标2：')

    add_heading(doc, '二、功能需求', level=1)
    add_table(doc,
        ['需求编号', '需求项', '需求描述'],
        [
            ['F-01', '功能1', '功能1的详细描述'],
            ['F-02', '功能2', '功能2的详细描述'],
        ],
        col_widths=[2, 3, 11]
    )

    doc.save(output_path)
    print(f'Word文档已生成: {output_path}')


if __name__ == '__main__':
    generate_sample_doc('/tmp/sample_doc.docx')
