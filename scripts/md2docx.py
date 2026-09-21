#!/usr/bin/env python3
"""Convert PRD markdown to Word document with proper formatting."""

import re
import os
from docx import Document
from docx.shared import Pt, Inches, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml

doc = Document()

# Page margins
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.8)
    section.right_margin = Cm(2.8)

# Styles
style = doc.styles['Normal']
font = style.font
font.name = 'Microsoft YaHei'
font.size = Pt(10.5)
style.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
style.paragraph_format.space_after = Pt(4)
style.paragraph_format.line_spacing = 1.25

for level in range(1, 4):
    h_style = doc.styles[f'Heading {level}']
    h_font = h_style.font
    h_font.name = 'Microsoft YaHei'
    h_style.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
    h_font.color.rgb = RGBColor(0x1A, 0x1A, 0x2E)
    if level == 1:
        h_font.size = Pt(18)
        h_style.paragraph_format.space_before = Pt(24)
        h_style.paragraph_format.space_after = Pt(12)
    elif level == 2:
        h_font.size = Pt(14)
        h_style.paragraph_format.space_before = Pt(18)
        h_style.paragraph_format.space_after = Pt(8)
    elif level == 3:
        h_font.size = Pt(12)
        h_style.paragraph_format.space_before = Pt(12)
        h_style.paragraph_format.space_after = Pt(6)

def add_table(doc, headers, rows):
    """Add a formatted table."""
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Header row
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ''
        p = cell.paragraphs[0]
        run = p.add_run(h.strip())
        run.bold = True
        run.font.size = Pt(9)
        run.font.name = 'Microsoft YaHei'
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="E8E8F0"/>')
        cell._tc.get_or_add_tcPr().append(shading)
    
    # Data rows
    for r_idx, row in enumerate(rows):
        for c_idx, val in enumerate(row):
            cell = table.rows[r_idx + 1].cells[c_idx]
            cell.text = ''
            p = cell.paragraphs[0]
            run = p.add_run(val.strip())
            run.font.size = Pt(9)
            run.font.name = 'Microsoft YaHei'
    
    doc.add_paragraph('')  # spacing after table

def parse_markdown_table(lines):
    """Parse markdown table lines into headers and rows."""
    if len(lines) < 2:
        return None, None
    headers = [c.strip() for c in lines[0].strip('|').split('|')]
    # Skip separator line
    rows = []
    for line in lines[2:]:
        if line.strip():
            cells = [c.strip() for c in line.strip('|').split('|')]
            rows.append(cells)
    return headers, rows

# Read the markdown file
with open('/workspace/projects/docs/PRD文档/PRD-流量运营区域攻坚.md', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()
    
    # Skip empty lines
    if not stripped:
        i += 1
        continue
    
    # Horizontal rule
    if stripped == '---':
        i += 1
        continue
    
    # Headings
    if stripped.startswith('#'):
        level = len(re.match(r'^#+', stripped).group())
        text = stripped.lstrip('#').strip()
        if level <= 3:
            doc.add_heading(text, level=level)
        i += 1
        continue
    
    # Code block
    if stripped.startswith('```'):
        code_lines = []
        i += 1
        while i < len(lines) and not lines[i].strip().startswith('```'):
            code_lines.append(lines[i])
            i += 1
        i += 1  # skip closing ```
        if code_lines:
            p = doc.add_paragraph()
            run = p.add_run('\n'.join(code_lines))
            run.font.size = Pt(8)
            run.font.name = 'Courier New'
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            # Add background shading
            shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F5F5F5"/>')
            p._p.get_or_add_pPr().append(shading)
        continue
    
    # Table
    if stripped.startswith('|'):
        table_lines = []
        while i < len(lines) and lines[i].strip().startswith('|'):
            table_lines.append(lines[i])
            i += 1
        headers, rows = parse_markdown_table(table_lines)
        if headers and rows:
            # Pad rows to match header count
            max_cols = len(headers)
            for row in rows:
                while len(row) < max_cols:
                    row.append('')
            add_table(doc, headers, rows)
        continue
    
    # Bullet list
    if stripped.startswith('- ') or stripped.startswith('* '):
        text = stripped[2:].strip()
        # Handle bold prefix
        p = doc.add_paragraph(style='List Bullet')
        run = p.add_run(text)
        run.font.size = Pt(10.5)
        run.font.name = 'Microsoft YaHei'
        i += 1
        continue
    
    # Numbered list
    m = re.match(r'^(\d+)\.\s+(.+)', stripped)
    if m:
        text = m.group(2)
        p = doc.add_paragraph(style='List Number')
        run = p.add_run(text)
        run.font.size = Pt(10.5)
        run.font.name = 'Microsoft YaHei'
        i += 1
        continue
    
    # Image: ![alt](path)
    img_match = re.match(r'^!\[([^\]]*)\]\(([^)]+)\)', stripped)
    if img_match:
        alt_text = img_match.group(1)
        img_path = img_match.group(2)
        # Resolve relative path
        if not os.path.isabs(img_path):
            img_path = os.path.join('/workspace/projects/docs/PRD文档', img_path)
        if os.path.exists(img_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run()
            try:
                run.add_picture(img_path, width=Inches(6.0))
            except Exception as e:
                p.add_run(f'[图片加载失败: {img_path}]')
        else:
            p = doc.add_paragraph(f'[图片未找到: {img_path}]')
        i += 1
        continue

    # Bold paragraph (like **text**)
    p = doc.add_paragraph()
    # Split by ** for bold segments
    parts = re.split(r'\*\*(.+?)\*\*', stripped)
    for j, part in enumerate(parts):
        run = p.add_run(part)
        run.font.size = Pt(10.5)
        run.font.name = 'Microsoft YaHei'
        if j % 2 == 1:  # odd indices are bold
            run.bold = True
    
    i += 1

# Save
output_path = '/workspace/projects/docs/PRD文档/PRD-流量运营区域攻坚.docx'
doc.save(output_path)
print(f'Word document saved to: {output_path}')
