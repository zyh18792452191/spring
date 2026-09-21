#!/usr/bin/env python3
"""
Excel生成模板 (.xlsx)
基于 openpyxl 库，提供格式化表格、条件格式、冻结、筛选等能力。

使用方式：
1. 复制本脚本到 /tmp/ 目录
2. 修改Excel内容（表头、数据行、格式配置）
3. 执行: python3 generate_xlsx.py
4. 输出文件到 docs/ 对应子目录
"""

from openpyxl import Workbook
from openpyxl.styles import (
    Font, PatternFill, Alignment, Border, Side,
    numbers
)
from openpyxl.utils import get_column_letter


# ============================================================
# 样式定义
# ============================================================

# 字体
FONT_HEADER = Font(name='Microsoft YaHei', size=11, bold=True, color='FFFFFF')
FONT_NORMAL = Font(name='Microsoft YaHei', size=10, color='333333')
FONT_BOLD = Font(name='Microsoft YaHei', size=10, bold=True, color='333333')
FONT_LINK = Font(name='Microsoft YaHei', size=10, color='0563C1', underline='single')

# 填充
FILL_HEADER = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')
FILL_STRIPE = PatternFill(start_color='EBF5FB', end_color='EBF5FB', fill_type='solid')
FILL_SUCCESS = PatternFill(start_color='E2EFDA', end_color='E2EFDA', fill_type='solid')
FILL_WARNING = PatternFill(start_color='FFF2CC', end_color='FFF2CC', fill_type='solid')
FILL_DANGER = PatternFill(start_color='FCE4EC', end_color='FCE4EC', fill_type='solid')

# 对齐
ALIGN_CENTER = Alignment(horizontal='center', vertical='center', wrap_text=True)
ALIGN_LEFT = Alignment(horizontal='left', vertical='center', wrap_text=True)
ALIGN_RIGHT = Alignment(horizontal='right', vertical='center', wrap_text=True)

# 边框
BORDER_THIN = Border(
    left=Side(style='thin', color='B4C6E7'),
    right=Side(style='thin', color='B4C6E7'),
    top=Side(style='thin', color='B4C6E7'),
    bottom=Side(style='thin', color='B4C6E7'),
)


# ============================================================
# 工具函数
# ============================================================

def create_workbook(title_row_height=30, data_row_height=22):
    """创建工作簿"""
    wb = Workbook()
    return wb


def add_sheet(wb, sheet_name, headers, rows, col_widths=None, freeze_row=1,
              stripe=True, auto_filter=True):
    """
    添加格式化工作表
    - wb: Workbook对象
    - sheet_name: 工作表名称
    - headers: 表头列表
    - rows: 数据行列表（每行为列表）
    - col_widths: 列宽列表（字符数）
    - freeze_row: 冻结到第几行
    - stripe: 是否交替行底色
    - auto_filter: 是否自动筛选
    """
    ws = wb.create_sheet(title=sheet_name)
    # 删除默认Sheet
    if 'Sheet' in wb.sheetnames and len(wb.sheetnames) > 1:
        del wb['Sheet']

    # 表头
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        cell.font = FONT_HEADER
        cell.fill = FILL_HEADER
        cell.alignment = ALIGN_CENTER
        cell.border = BORDER_THIN

    # 数据行
    for row_idx, row_data in enumerate(rows, 2):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            cell.font = FONT_NORMAL
            cell.border = BORDER_THIN

            # 自动判断对齐方式
            if isinstance(value, (int, float)):
                cell.alignment = ALIGN_RIGHT
            else:
                cell.alignment = ALIGN_LEFT

            # 交替行底色
            if stripe and row_idx % 2 == 0:
                cell.fill = FILL_STRIPE

    # 列宽
    if col_widths:
        for col_idx, width in enumerate(col_widths, 1):
            ws.column_dimensions[get_column_letter(col_idx)].width = width
    else:
        # 自适应列宽（基于表头长度）
        for col_idx, header in enumerate(headers, 1):
            ws.column_dimensions[get_column_letter(col_idx)].width = max(len(str(header)) * 2 + 4, 12)

    # 冻结行
    if freeze_row:
        ws.freeze_panes = f'A{freeze_row + 1}'

    # 自动筛选
    if auto_filter:
        ws.auto_filter.ref = f'A1:{get_column_letter(len(headers))}{len(rows) + 1}'

    # 行高
    ws.row_dimensions[1].height = 30
    for row_idx in range(2, len(rows) + 2):
        ws.row_dimensions[row_idx].height = 22

    return ws


def add_conditional_format(ws, col_letter, start_row, end_row, rules):
    """
    添加条件格式
    - rules: [(条件, 填充色), ...]
      条件示例: '>0', '<0', '>=98', '<90'
    """
    from openpyxl.formatting.rule import CellIsRule
    for condition, fill in rules:
        ws.conditional_formatting.add(
            f'{col_letter}{start_row}:{col_letter}{end_row}',
            CellIsRule(operator=condition[0], formula=[condition[1]], fill=fill)
        )


def set_cell_value(ws, row, col, value, font=None, fill=None, alignment=None):
    """设置单元格值和样式"""
    cell = ws.cell(row=row, column=col, value=value)
    if font:
        cell.font = font
    if fill:
        cell.fill = fill
    if alignment:
        cell.alignment = alignment
    cell.border = BORDER_THIN
    return cell


# ============================================================
# 主流程：示例Excel
# ============================================================

def generate_sample_xlsx(output_path):
    wb = create_workbook()

    # 指标清单表
    add_sheet(wb, '指标清单',
        ['序号', '模块', '指标名称', '单位', '时间口径', '数据来源', '子指标数'],
        [
            [1, '大市场关键指标', '当月CHN收入同比增幅', '%', 'both', '经分系统BSS侧', 2],
            [2, '大市场关键指标', '全球通当月离网客户数', '户', 'both', '经分系统CRM侧', 2],
            [3, '大市场重点指标', '当日新增客户数', '户', 'daily', '经分系统CRM侧', 3],
            [4, '流量运营重点指标', '流量同比增幅', '%', 'monthly', '经分系统流量话单', 1],
        ],
        col_widths=[6, 18, 25, 8, 12, 20, 10]
    )

    # 功能需求表
    add_sheet(wb, '功能需求',
        ['需求编号', '需求项', '需求描述', '优先级', '状态'],
        [
            ['F-01', '区域选择器', '支持全疆→地市→网格三级选择', 'P0', '已完成'],
            ['F-02', '日/月切换', '支持日维度和月维度切换', 'P0', '已完成'],
            ['F-03', '指标详情弹窗', '子指标+区域交叉表+5级下钻', 'P1', '已完成'],
            ['F-04', '领单确认', 'IOP接收人领单后同步', 'P0', '待开发'],
        ],
        col_widths=[10, 18, 35, 8, 10]
    )

    wb.save(output_path)
    print(f'Excel已生成: {output_path}')


if __name__ == '__main__':
    generate_sample_xlsx('/tmp/sample_xlsx.xlsx')
