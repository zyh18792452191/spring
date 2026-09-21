#!/usr/bin/env python3
"""生成 产品侧vs技术侧全量对标分析与方案衔接评估报告.docx
基于技术侧原始文档：
1. 根因分析客群策略推荐一体化详细设计
2. 指标底座与全树根因分析能力改造详细设计
"""

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
import os

doc = Document()

style = doc.styles['Normal']
style.font.name = '微软雅黑'
style.font.size = Pt(10.5)
style.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
style.paragraph_format.space_after = Pt(4)
style.paragraph_format.line_spacing = 1.25

for level in range(1, 5):
    hs = doc.styles[f'Heading {level}']
    hs.font.name = '微软雅黑'
    hs.font.color.rgb = RGBColor(0x1A, 0x1A, 0x2E)
    hs.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')

def add_table(headers, rows, col_widths=None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers), style='Table Grid')
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        for p in hdr_cells[i].paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.bold = True
                r.font.size = Pt(9)
    for ri, row in enumerate(rows):
        cells = table.rows[ri + 1].cells
        for ci, val in enumerate(row):
            cells[ci].text = str(val)
            for p in cells[ci].paragraphs:
                for r in p.runs:
                    r.font.size = Pt(9)
    if col_widths:
        for ri, row in enumerate(table.rows):
            for ci, w in enumerate(col_widths):
                row.cells[ci].width = Cm(w)
    doc.add_paragraph()
    return table

def add_para(text, bold=False, size=10.5, align=None):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    run.font.size = Pt(size)
    run.font.name = '微软雅黑'
    run.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    if align:
        p.alignment = align
    return p

# ══════════════════════════════════════════════
# 封面
# ══════════════════════════════════════════════
for _ in range(6):
    doc.add_paragraph()
add_para('产品侧vs技术侧全量对标分析', bold=True, size=24, align=WD_ALIGN_PARAGRAPH.CENTER)
add_para('与方案衔接评估报告', bold=True, size=22, align=WD_ALIGN_PARAGRAPH.CENTER)
doc.add_paragraph()
add_para('新疆移动市场数智运营平台', size=14, align=WD_ALIGN_PARAGRAPH.CENTER)
doc.add_paragraph()
add_para('2026年6月', size=12, align=WD_ALIGN_PARAGRAPH.CENTER)
doc.add_page_break()

# 目录
doc.add_heading('目录', level=1)
toc_items = [
    '1. 报告概述',
    '  1.1 对标范围与目的',
    '  1.2 技术侧文档来源',
    '2. 根因库管理对标',
    '  2.1 数据模型对标',
    '  2.2 核心字段对标',
    '  2.3 关联指标配置对标',
    '  2.4 运行数据指标对标',
    '  2.5 来源权重对标',
    '3. 策略库管理对标',
    '  3.1 数据模型对标',
    '  3.2 核心字段对标',
    '  3.3 策略层级结构对标',
    '  3.4 运行数据指标对标',
    '4. 推荐引擎对标',
    '  4.1 根因召回逻辑对标',
    '  4.2 策略推荐逻辑对标',
    '5. 关联关系管理对标',
    '6. 关键差异与决策项',
    '  6.1 来源类型差异（4种 vs 2种）',
    '  6.2 命中率计算口径差异',
    '  6.3 策略层级结构差异',
    '7. 方案衔接评估',
    '  7.1 可直接衔接项',
    '  7.2 需对齐衔接项',
    '  7.3 需决策衔接项',
]
for item in toc_items:
    add_para(item, size=10.5)
doc.add_page_break()

# ══════════════════════════════════════════════
# 1. 报告概述
# ══════════════════════════════════════════════
doc.add_heading('1. 报告概述', level=1)

doc.add_heading('1.1 对标范围与目的', level=2)
add_para('本报告对产品侧设计方案（指标策略知识库管理V1.0）与技术侧详细设计方案进行全量对标，目的在于：')
add_para('1. 确认产品侧需求在技术侧是否有对应的实现设计')
add_para('2. 识别技术侧有但产品侧未涉及的能力，评估是否需要在产品侧补充')
add_para('3. 发现双方口径不一致的地方，明确衔接方案')
add_para('4. 标记需要决策的关键差异项')

doc.add_heading('1.2 技术侧文档来源', level=2)
add_para('本报告对标的技术侧文档为：')
add_para('1. 《根因分析客群策略推荐一体化详细设计》——定义了根因分析、客群圈选、策略推荐的一体化流程和技术实现')
add_para('2. 《指标底座与全树根因分析能力改造详细设计》——定义了指标底座的数据模型、根因分析的指标匹配算法')

# ══════════════════════════════════════════════
# 2. 根因库管理对标
# ══════════════════════════════════════════════
doc.add_heading('2. 根因库管理对标', level=1)

doc.add_heading('2.1 数据模型对标', level=2)
add_para('技术侧定义的根因数据模型核心字段：root_cause_id, name, source, source_weight, category, description, status, created_at, updated_at。')
add_para('产品侧定义的根因数据模型核心字段：根因ID, 名称, 一级分类, 二级分类, 来源, 描述, 状态, 更新时间。')
add_table(
    ['维度', '技术侧', '产品侧', '对标结论'],
    [
        ['主键', 'root_cause_id', '根因ID', '一致'],
        ['名称', 'name', '根因名称', '一致'],
        ['分类', 'category（单一字段）', '一级分类+二级分类（两级联动）', '产品侧更细，技术侧需扩展'],
        ['来源', 'source（枚举：MANUAL/STRATEGY/MODEL/AGENT）', '来源（枚举：专家经验/AI生成）', '口径不一致，见6.1节'],
        ['来源权重', 'source_weight（4种：1.0/0.8/0.75/0.6）', '来源权重（2种：1.0/0.75）', '口径不一致，见6.1节'],
        ['描述', 'description', '描述', '一致'],
        ['状态', 'status', '状态', '一致'],
    ]
)

doc.add_heading('2.2 核心字段对标', level=2)
add_table(
    ['字段', '产品侧定义', '技术侧是否有对应', '差异说明'],
    [
        ['根因ID', '唯一标识', '有（root_cause_id）', '一致'],
        ['根因名称', '人工录入/AI生成', '有（name）', '一致'],
        ['一级分类', '风险预警类/价值提升类/生命周期类', '有（category，但为单级）', '产品侧为两级分类，技术侧为单级'],
        ['二级分类', '依赖一级分类联动', '无', '技术侧需新增二级分类支持'],
        ['来源', '专家经验/AI生成', '有（source，4种枚举）', '枚举范围不一致，见6.1节'],
        ['描述', '人工录入', '有（description）', '一致'],
        ['状态', '草稿/启用/停用', '有（status）', '一致'],
    ]
)

doc.add_heading('2.3 关联指标配置对标', level=2)
add_para('技术侧定义的关联指标模型：root_cause_indicator关联表，包含indicator_id, direction, change_min, change_max, strength等字段。')
add_para('产品侧定义的关联指标配置与之一致：')
add_table(
    ['字段', '产品侧', '技术侧', '对标结论'],
    [
        ['指标ID', 'indicatorId', 'indicator_id', '一致'],
        ['异常方向', 'direction（上升/下降）', 'direction（up/down）', '一致，值域映射'],
        ['下限值', 'change_min', 'change_min', '一致'],
        ['上限值', 'change_max', 'change_max', '一致'],
        ['运算符', 'lowerOperator/upperOperator', '技术侧用change_min/change_max直接表示', '产品侧更灵活，支持>=/>/</<=等多种运算符组合'],
        ['关联强度', 'strength（1-5级）', 'strength（1-5级）', '一致'],
    ]
)
add_para('产品侧的运算符设计更灵活：技术侧用change_min/change_max两个数值直接表示区间，产品侧增加了运算符选择（>=/>/</<=），允许表达开区间和闭区间。技术侧需确认是否支持此灵活性，或产品侧改用技术侧的简化模式。')

doc.add_heading('2.4 运行数据指标对标', level=2)

add_para('2.4.1 引用率', bold=True)
add_table(
    ['维度', '产品侧', '技术侧', '对标结论'],
    [
        ['公式', '调度单引用次数/召回次数', 'dispatch_ref_count / recall_count', '一致'],
        ['召回次数定义', '从根因库召回该根因的次数（能够用于调度的问题指标原因）', 'recall_count（指标异常触发召回的次数）', '一致'],
        ['统计周期', '近3个月滚动窗口', '未明确定义统计周期', '产品侧需补充，技术侧需对齐'],
    ]
)

add_para('2.4.2 命中率', bold=True)
add_table(
    ['维度', '产品侧', '技术侧', '对标结论'],
    [
        ['公式', 'Σ(匹配指标数/总关联指标数)/召回次数', '技术侧定义为"全部指标匹配次数/推荐展示次数"', '口径不一致，见6.2节'],
        ['匹配条件', '方向一致 且 change_min≤实际环比≤change_max', 'direction一致 且 change_min≤actual_change≤change_max', '匹配条件一致'],
        ['计算粒度', '每次召回计算匹配比例（0~1之间）', '每次召回二元判断（全部匹配=1或不匹配=0）', '口径不一致，见6.2节'],
        ['统计周期', '近3个月滚动窗口', '未明确定义', '需对齐'],
    ]
)

add_para('2.4.3 置信度', bold=True)
add_table(
    ['维度', '产品侧', '技术侧', '对标结论'],
    [
        ['公式', '命中率×0.60+引用率×0.25+来源权重×0.15', 'hit_rate×0.60+ref_rate×0.25+source_weight×0.15', '结构一致，命中率口径有差异'],
    ]
)

doc.add_heading('2.5 来源权重对标', level=2)
add_table(
    ['维度', '产品侧', '技术侧', '对标结论'],
    [
        ['来源类型', '2种：专家经验/AI生成', '4种：MANUAL/STRATEGY/MODEL/AGENT', '不一致，见6.1节'],
        ['权重值', '专家经验=1.0, AI生成=0.75', 'MANUAL=1.0, STRATEGY=0.8, MODEL=0.75, AGENT=0.6', '不一致'],
        ['取值方式', '从"来源"字段自动获取', '从source字段自动获取', '机制一致，值域不同'],
    ]
)

# ══════════════════════════════════════════════
# 3. 策略库管理对标
# ══════════════════════════════════════════════
doc.add_heading('3. 策略库管理对标', level=1)

doc.add_heading('3.1 数据模型对标', level=2)
add_table(
    ['维度', '技术侧', '产品侧', '对标结论'],
    [
        ['主键', 'strategy_id', '策略ID', '一致'],
        ['名称', 'name', '策略名称', '一致'],
        ['分类', 'category（单级）', '一级分类+二级分类（两级）', '同根因库，产品侧更细'],
        ['来源', 'source（4种枚举）', '来源（2种）', '同根因库，不一致'],
        ['描述', 'description', '描述', '一致'],
        ['状态', 'status', '状态', '一致'],
    ]
)

doc.add_heading('3.2 核心字段对标', level=2)
add_table(
    ['字段', '产品侧定义', '技术侧是否有对应', '差异说明'],
    [
        ['业务场景', '人工多选（流量运营/中高端客户运营等）', '无对应字段', '产品侧新增，技术侧需补充'],
        ['关联根因', '从根因库选择', '有（root_cause_id关联）', '一致'],
        ['关联指标', '从指标库选择，含变化区间', '有（indicator关联）', '一致'],
        ['关联客群', '从客群库选择', '有（group_id关联）', '一致'],
        ['推荐产品', '从产品目录选择', '有（product关联）', '一致'],
        ['渠道适配', '渠道+优先级+时间窗口', '有（channel配置）', '一致'],
        ['营销话术', '话术名称+适用渠道+话术内容', '有（script关联）', '一致'],
    ]
)

doc.add_heading('3.3 策略层级结构对标', level=2)
add_para('产品侧策略采用6个Tab的结构：基础信息 → 关联配置 → 推荐产品 → 渠道适配 → 营销话术 → 运行数据')
add_para('技术侧策略定义了7层结构（含"适用约束"和"效果评估"），产品侧已删除这两个Tab：')
add_table(
    ['层级', '技术侧定义', '产品侧状态', '删除理由'],
    [
        ['适用约束', '定义策略的适用条件（时间/区域/客群约束）', '已删除', '配了不校验，与渠道适配层内容重叠，不驱动系统行为'],
        ['效果评估', '统计周期配置+引用调度单数+最近一次转化率+加权转化率', '已删除', '统计周期固定3个月不需要配置；引用调度单数与引用率重复；最近一次转化率单次波动无参考价值；加权转化率与运行数据完全重复'],
    ]
)
add_para('详见6.3节。')

doc.add_heading('3.4 运行数据指标对标', level=2)

add_para('3.4.1 引用率', bold=True)
add_table(
    ['维度', '产品侧', '技术侧', '对标结论'],
    [
        ['公式', '调度单引用次数/召回次数', 'dispatch_ref_count / recall_count', '一致'],
        ['调度单范围', '所有调度单（含进行中/已完成）', '所有调度单', '一致'],
        ['统计周期', '近3个月', '未明确', '需对齐'],
    ]
)

add_para('3.4.2 转化率', bold=True)
add_table(
    ['维度', '产品侧', '技术侧', '对标结论'],
    [
        ['公式', 'Σ(单条转化率×触达数)/Σ(触达数)', 'weighted_conversion_rate', '一致，技术侧用加权平均'],
        ['参与范围', '仅已完成的调度单', '所有已完成的调度单', '一致'],
        ['分子', '业务办理成功客户数', 'conversion_count', '一致'],
        ['分母', '触达客户数', 'reach_count', '一致'],
        ['统计周期', '近3个月', '未明确', '需对齐'],
    ]
)

add_para('3.4.3 置信度', bold=True)
add_table(
    ['维度', '产品侧', '技术侧', '对标结论'],
    [
        ['公式', '转化率×0.70+引用率×0.15+来源权重×0.15', 'conversion_rate×0.70+ref_rate×0.15+source_weight×0.15', '结构一致'],
    ]
)

# ══════════════════════════════════════════════
# 4. 推荐引擎对标
# ══════════════════════════════════════════════
doc.add_heading('4. 推荐引擎对标', level=1)

doc.add_heading('4.1 根因召回逻辑对标', level=2)
add_table(
    ['维度', '产品侧', '技术侧', '对标结论'],
    [
        ['触发条件', '指标监测引擎检测到某区域某指标异常', '指标异常触发（threshold breach）', '一致'],
        ['召回方式', '根据关联指标匹配召回根因', '根据indicator-root_cause关联表匹配', '一致'],
        ['排序依据', '置信度评分', 'confidence_score', '一致'],
        ['匹配算法', '方向一致+幅度在区间内', 'direction_match + range_match', '一致'],
    ]
)

doc.add_heading('4.2 策略推荐逻辑对标', level=2)
add_table(
    ['维度', '产品侧', '技术侧', '对标结论'],
    [
        ['触发条件', '根因确定后推荐关联策略', 'root_cause确定后推荐关联strategy', '一致'],
        ['召回方式', '根据根因-策略关联关系召回', 'root_cause-strategy关联表匹配', '一致'],
        ['排序依据', '置信度评分', 'confidence_score', '一致'],
    ]
)

# ══════════════════════════════════════════════
# 5. 关联关系管理对标
# ══════════════════════════════════════════════
doc.add_heading('5. 关联关系管理对标', level=1)
add_table(
    ['关系类型', '产品侧', '技术侧', '对标结论'],
    [
        ['指标-根因', '有', '有（indicator-root_cause关联表）', '一致'],
        ['根因-策略', '有', '有（root_cause-strategy关联表）', '一致'],
        ['根因-客群', '有', '有（root_cause-group关联表）', '一致'],
        ['策略-客群', '有', '有（strategy-group关联表）', '一致'],
        ['指标-客群', '有', '有（indicator-group关联表）', '一致'],
        ['策略-指标', '有', '有（strategy-indicator关联表）', '一致'],
    ]
)

# ══════════════════════════════════════════════
# 6. 关键差异与决策项
# ══════════════════════════════════════════════
doc.add_heading('6. 关键差异与决策项', level=1)

doc.add_heading('6.1 来源类型差异（4种 vs 2种）', level=2)
add_para('这是最关键的对标差异，需优先决策。')
add_para('技术侧定义了4种来源及对应权重：')
add_table(
    ['技术侧枚举', '技术侧含义', '技术侧权重', '产品侧对应', '产品侧权重'],
    [
        ['MANUAL', '人工录入', '1.0', '专家经验', '1.0'],
        ['STRATEGY', '策略库配置生成', '0.8', '—', '—'],
        ['MODEL', '模型归因产出', '0.75', 'AI生成', '0.75'],
        ['AGENT', 'AI智能体产出', '0.6', '—', '—'],
    ]
)

add_para('差异分析：', bold=True)
add_para('产品侧当前只有2种来源（专家经验/AI生成），但技术侧区分了4种。差异的本质是：技术侧把"AI生成"拆成了3种来源（策略库配置生成/模型归因产出/AI智能体产出），并为每种设定了不同的权重。')
add_para('这种拆分有业务意义：策略库根据规则自动生成的根因（STRATEGY，0.8）比AI智能体自主推理产出的根因（AGENT，0.6）更可靠，应给予更高权重。如果产品侧只分2种，那"AI生成"内部的质量差异无法区分。')

add_para('决策选项：', bold=True)
add_para('方案A：产品侧保持2种来源，技术侧4种映射到2种')
add_para('  • STRATEGY + MODEL + AGENT → AI生成（权重取0.75）')
add_para('  • 优点：产品侧概念简单，运营人员易理解')
add_para('  • 缺点：无法区分AI内部不同来源的质量差异')

add_para('方案B：产品侧对齐技术侧4种来源')
add_para('  • 新增"策略配置生成"和"模型归因产出"两种来源')
add_para('  • 优点：权重更精细，置信度计算更准确')
add_para('  • 缺点：运营人员需理解4种来源的区别')

add_para('建议：采用方案A作为V1.0版本，V2.0根据运营反馈决定是否拆分。理由：当前系统刚上线，AI生成内部的质量差异尚无数据验证，过早拆分增加理解成本且没有实际区分价值。', bold=True)

doc.add_heading('6.2 命中率计算口径差异', level=2)
add_para('技术侧定义：命中率 = 全部指标匹配次数 / 推荐展示次数（二元判断，全匹配=1，否则=0）')
add_para('产品侧定义：命中率 = Σ(匹配指标数/总关联指标数) / 召回次数（比例判断，0~1连续值）')

add_para('差异本质：', bold=True)
add_para('技术侧采用"全有或全无"的二元判断——只有所有关联指标全部匹配才计1次匹配，否则计0次。这种口径下，关联指标越多命中率天然越低（5个指标的根因几乎不可能5个全匹配），无法真实反映指标配置质量。')
add_para('产品侧采用比例计算——每次召回计算匹配指标数占比（如2/3=0.667），然后求平均。这种口径下，部分匹配也有贡献，不受指标数量的影响。')

add_para('推荐方案：采用产品侧口径（比例判断）。理由：', bold=True)
add_para('1. 二元判断导致关联指标越多命中率越低，不公平且无区分度')
add_para('2. 比例判断度量的是指标配置的整体覆盖程度，业务含义更准确')
add_para('3. 运营人员可以根据命中率趋势定位"哪个指标拖了后腿"，驱动持续优化')
add_para('4. 技术侧需将命中率的计算逻辑从二元判断改为比例计算')

doc.add_heading('6.3 策略层级结构差异', level=2)
add_para('技术侧定义了7层策略结构（含"适用约束"和"效果评估"），产品侧已删除这两层：')

add_para('6.3.1 适用约束（已删除）', bold=True)
add_para('删除理由：')
add_para('1. 适用约束配置了时间/区域/客群约束，但系统不做自动校验——配了不等于执行了')
add_para('2. 渠道适配层已包含时间窗口配置，内容重叠')
add_para('3. 如果后续需要约束校验能力，应在渠道适配层扩展，而非单独设Tab')

add_para('6.3.2 效果评估（已删除）', bold=True)
add_para('删除理由：')
add_para('1. 统计周期配置：已统一固定为近3个月滚动窗口，不需要人工配置')
add_para('2. 引用调度单数：与运行数据Tab的引用率分母重复')
add_para('3. 最近一次转化率：单次执行的转化率波动大，无参考价值')
add_para('4. 加权转化率：与运行数据Tab的转化率完全重复')

add_para('技术侧影响：技术侧的strategy表中的constraint和evaluation相关字段可保留但V1.0不使用，后续如需恢复可快速启用。')

# ══════════════════════════════════════════════
# 7. 方案衔接评估
# ══════════════════════════════════════════════
doc.add_heading('7. 方案衔接评估', level=1)

doc.add_heading('7.1 可直接衔接项', level=2)
add_para('以下内容产品侧与技术侧一致，可直接衔接开发：')
add_table(
    ['序号', '衔接项', '说明'],
    [
        ['1', '根因基础信息CRUD', '字段名和含义一致，接口可直接对接'],
        ['2', '关联指标配置', '字段一致，产品侧运算符更灵活，技术侧需确认支持'],
        ['3', '关联客群配置', '字段一致'],
        ['4', '策略基础信息CRUD', '字段名和含义一致'],
        ['5', '推荐产品配置', '字段一致'],
        ['6', '渠道适配配置', '字段一致'],
        ['7', '营销话术配置', '字段一致'],
        ['8', '关联关系管理', '6类关联关系一致'],
        ['9', '根因召回逻辑', '触发条件、匹配算法一致'],
        ['10', '策略推荐逻辑', '触发条件、关联召回一致'],
        ['11', '置信度公式结构', '权重结构一致（命中率/转化率×主权重+引用率×0.25+来源权重×0.15）'],
    ]
)

doc.add_heading('7.2 需对齐衔接项', level=2)
add_para('以下内容产品侧与技术侧存在口径差异，需对齐后开发：')
add_table(
    ['序号', '对齐项', '产品侧口径', '技术侧口径', '对齐方案'],
    [
        ['1', '命中率计算口径', '比例判断（0~1连续值）', '二元判断（0或1）', '采用产品侧比例判断，技术侧需修改计算逻辑'],
        ['2', '分类结构', '两级分类（一级+二级联动）', '单级分类（category）', '技术侧需新增二级分类字段'],
        ['3', '统计周期', '固定近3个月滚动窗口', '未明确定义', '技术侧统一对齐为近3个月'],
        ['4', '引用率分母术语', '召回次数', 'recall_count', '统一为"召回次数"，技术侧字段名不变'],
        ['5', '运算符灵活性', '支持>=/>/</<=等多种组合', 'change_min/change_max直接表示', '技术侧需确认是否支持运算符灵活性'],
    ]
)

doc.add_heading('7.3 需决策衔接项', level=2)
add_para('以下内容需要产品经理和技术经理共同决策后才能推进开发：')
add_table(
    ['序号', '决策项', '选项A', '选项B', '建议'],
    [
        ['1', '来源类型', '产品侧2种（专家经验/AI生成）', '对齐技术侧4种', 'V1.0采用2种，V2.0按需拆分'],
        ['2', '适用约束Tab', '保持删除', '恢复', '保持删除，在渠道适配层扩展'],
        ['3', '效果评估Tab', '保持删除', '恢复', '保持删除，运行数据已覆盖'],
    ]
)

doc.add_paragraph()
add_para('—— 报告结束 ——', align=WD_ALIGN_PARAGRAPH.CENTER)

# ── 保存 ──
output_dir = '/workspace/projects/docs/对标分析'
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, '产品侧vs技术侧全量对标分析与方案衔接评估报告.docx')
doc.save(output_path)
print(f'报告已生成: {output_path}')
