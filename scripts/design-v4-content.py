#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成指标策略知识库管理完整设计方案 V4.0 Word文档"""

from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
import os

doc = Document()

# ============================================================
# 样式设置
# ============================================================
style = doc.styles['Normal']
style.font.name = 'Microsoft YaHei'
style.font.size = Pt(10.5)
style.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')

# 页面设置
for section in doc.sections:
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)

def add_heading(text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.name = 'Microsoft YaHei'
        run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
    return h

def add_para(text, bold=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    run.font.name = 'Microsoft YaHei'
    run.font.size = Pt(10.5)
    run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
    return p

def add_bullet(text, level=0):
    p = doc.add_paragraph(text, style='List Bullet')
    for run in p.runs:
        run.font.name = 'Microsoft YaHei'
        run.font.size = Pt(10.5)
        run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
    return p

def add_table(headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    # Header
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = h
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.bold = True
                run.font.size = Pt(9)
                run.font.name = 'Microsoft YaHei'
                run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
    # Data rows
    for r_idx, row_data in enumerate(rows):
        for c_idx, val in enumerate(row_data):
            cell = table.rows[r_idx + 1].cells[c_idx]
            cell.text = str(val)
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(9)
                    run.font.name = 'Microsoft YaHei'
                    run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')
    return table

# ============================================================
# 封面
# ============================================================
doc.add_paragraph()
doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('指标策略知识库管理')
run.bold = True
run.font.size = Pt(26)
run.font.name = 'Microsoft YaHei'
run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('完整设计方案 V4.0')
run.bold = True
run.font.size = Pt(20)
run.font.name = 'Microsoft YaHei'
run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')

doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('（基于多轮设计迭代 + 技术侧对标后的最新版本）')
run.font.size = Pt(12)
run.font.name = 'Microsoft YaHei'
run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')

doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run('2025年6月')
run.font.size = Pt(14)

doc.add_page_break()

# ============================================================
# 版本记录
# ============================================================
add_heading('版本记录', level=1)
add_table(
    ['版本', '日期', '变更内容', '变更人'],
    [
        ['V1.0', '2025-05', '初始设计方案', '产品组'],
        ['V2.0', '2025-05', '增加关联关系管理、标签字典、市场事件', '产品组'],
        ['V3.0', '2025-06', '合并根因库+策略库+关联关系为统一设计方案，增加工单体系', '产品组'],
        ['V4.0', '2025-06', '基于多轮设计评审和技术侧对标，精简过度设计，对齐技术架构，补充数据来源定义', '产品组'],
    ]
)

doc.add_page_break()

# ============================================================
# 目录（手动）
# ============================================================
add_heading('目录', level=1)
toc_items = [
    '1. 设计总纲',
    '  1.1 项目背景',
    '  1.2 设计原则',
    '  1.3 V4.0 核心变更摘要',
    '  1.4 术语表',
    '2. 体系架构设计',
    '  2.1 三层架构定义',
    '  2.2 各层职责与数据流转',
    '  2.3 运行态串联键设计',
    '3. 根因库设计',
    '  3.1 根因库定位',
    '  3.2 字段定义与数据来源',
    '  3.3 诊断条件设计',
    '  3.4 关联指标设计',
    '  3.5 关联客群设计',
    '  3.6 运行数据设计',
    '  3.7 页面设计',
    '4. 策略库设计',
    '  4.1 策略库定位',
    '  4.2 字段定义与数据来源',
    '  4.3 关联配置设计',
    '  4.4 关联产品设计',
    '  4.5 营销话术设计',
    '  4.6 渠道适配设计',
    '  4.7 适用约束设计',
    '  4.8 效果评估设计',
    '  4.9 运行数据设计',
    '  4.10 页面设计',
    '5. 关联关系管理',
    '  5.1 关系类型定义',
    '  5.2 关联强度设计',
    '  5.3 AI推理路径',
    '  5.4 页面设计',
    '6. 工单调度体系',
    '  6.1 六种调度类型',
    '  6.2 共享组件设计',
    '  6.3 商机管理设计',
    '7. 数据来源与下游消费总表',
    '8. 约束与异常处理',
    '9. 分期实施计划',
]
for item in toc_items:
    p = doc.add_paragraph()
    run = p.add_run(item)
    run.font.size = Pt(10.5)
    run.font.name = 'Microsoft YaHei'
    run.element.rPr.rFonts.set(qn('w:eastAsia'), 'Microsoft YaHei')

doc.add_page_break()

# ============================================================
# 第1章 设计总纲
# ============================================================
add_heading('1. 设计总纲', level=1)

add_heading('1.1 项目背景', level=2)
add_para('本方案为电信运营商市场数智运营平台的核心知识管理模块，覆盖根因库、策略库、关联关系管理三大子模块，并向上衔接指标分析、客群圈选、策略推荐等AI推理链路，向下衔接工单调度执行体系。')

add_para('V4.0版本的核心目标是：基于多轮设计评审和技术侧对标分析，将V3.0中过度设计的部分精简，将与技术架构不匹配的部分对齐，确保每个字段都有明确的数据来源和下游消费方，方案可直接指导系统功能开发。')

add_heading('1.2 设计原则', level=2)

add_table(
    ['原则', '定义', '反面示例', '正面示例'],
    [
        ['数据来源可追溯', '每个字段必须定义谁写入、什么时候写入、写入逻辑是什么', '置信度标注为系统计算但未定义计算公式和数据源', '置信度 = 异常强度分\u00d70.30 + 贡献度分\u00d70.35 + 业务权重分\u00d70.20 + 可信度分\u00d70.15，由portal-srv在分析完成后计算写入'],
        ['下游消费可定位', '每个字段必须定义谁读取、在什么场景下使用、怎么使用', '关联强度1-5填写后无任何系统逻辑使用', '加权转化率供运营人员在策略列表页排序和筛选使用'],
        ['人工填写有依据', '人工填写的字段必须有客观标准或业务规则支撑', '目标转化率人工填写但无客观基准', '策略风险等级由运营人员根据降价幅度/影响客户数/审批要求判断'],
        ['职责边界清晰', '知识库只存知识索引，不承接其他系统的核心职责', '策略库存产品名称和描述（产商品中心职责）', '策略库只存产品编码，产品名称和描述从产商品中心查询'],
        ['配置与运行分离', '候选库存静态配置，运行态数据实时查询或批量回写，不混存', '候选库中存客群规模静态快照会过期', '客群规模展示时实时查询customer_segment_info'],
    ]
)

add_heading('1.3 V4.0 核心变更摘要', level=2)
add_para('相比V3.0，V4.0做了以下精简和对齐：')

add_table(
    ['变更类型', '变更项', 'V3.0设计', 'V4.0设计', '变更原因'],
    [
        ['去掉', '根因标签(tags)', '多标签选择+自定义标签', '去掉', '人工填写无客观依据，分类字段已能覆盖筛选需求'],
        ['去掉', '策略标签(tags)', '标签字典+多标签选择+自定义标签', '去掉', '同根因标签，分类字段已覆盖'],
        ['去掉', '渠道约束', '调度时检查所选渠道是否在允许列表', '去掉', '与渠道适配重复，渠道约束在调度引擎运行时校验'],
        ['去掉', '目标转化率+达标状态+目标基准', '人工填写目标转化率，系统判断是否达标', '去掉', '人工填写无客观基准，达标判定阈值人定不可靠'],
        ['去掉', '策略目标(量化目标)', '填写目标指标和目标值', '去掉', '与效果评估的运行态统计值功能重叠'],
        ['去掉', '所有关联关系上的人工关联强度', '1-5人工打分', '去掉', '人工填写无客观依据无下游消费，运行态match_score替代'],
        ['去掉', '渠道优先级和时段', '配置最佳触达时段和优先级', '去掉', '渠道状态是运行时信息，优先级和时段由调度引擎动态决定'],
        ['去掉', '效果评估配置项', '统计周期和最小样本量人工配置', '去掉', '改为查询参数和展示逻辑，不作为配置存储'],
        ['修改', '来源枚举', 'expert / ai_generated 2种', 'MODEL / AGENT / STRATEGY / MANUAL 4种', '4种来源各有不同权重和置信度计算方式，不能简单二分'],
        ['修改', '业务场景', '多选', '主场景单值 + 副场景JSON', '兼顾匹配精度（单值）和业务灵活性（多值）'],
        ['修改', '置信度定义', '验证通过次数/验证总次数', '综合评分公式：异常强度\u00d70.30+贡献度\u00d70.35+业务权重\u00d70.20+可信度\u00d70.15', '置信度\u2260通过率，对齐行业AIOps标准定义'],
        ['修改', '验证状态', '二元判断(已验证/未验证)', '反馈摘要：近3个月采纳/拒绝/修正次数分布', '二元判断丢失信息，采纳3次拒绝1次修正2次不应简单标记为已验证'],
        ['修改', '诊断条件', '客户属性+业务维度+市场事件3类', '关联指标区间 + 市场事件标注', '客户属性与约束重复、业务维度与关联指标重叠、市场事件无数据源降为标注'],
        ['修改', '推荐产品', '产品编码+名称+描述全存策略库', '只引用产品编码，名称描述实时查询CRM', '产品主数据不属于策略库职责'],
        ['修改', '营销话术', '话术内容存策略库', '一期暂存(过渡)，二期迁到话术管理平台', '话术管理不是策略库核心职责'],
        ['新增', '策略动作类型(actionType)', '无', '升迁/挽留/提醒/推荐/优化/拓展', '技术侧已有字段，策略分类和调度校验的必要维度'],
        ['新增', '策略风险等级(riskLevel)', '无', '低/中/高', '技术侧已有字段，高等级策略调度时需要审批'],
        ['新增', '三层体系架构', '两层(候选库+执行实例)', '三层(候选库+运行态+执行态)', '对齐技术侧架构，明确运行态数据回写机制'],
    ]
)

add_heading('1.4 术语表', level=2)
add_table(
    ['术语', '定义'],
    [
        ['候选库', '知识模板的CRUD管理层，存储专家经验和配置信息，由strategy-srv承载'],
        ['运行态', '分析结果的聚合展示层，存储AI分析产出的根因/客群/策略推荐，由portal-srv承载'],
        ['执行态', '工单调度和客户明细执行层，由dispatch-srv承载'],
        ['root_cause_key', '运行态稳定根因键，支持agent/model根因，格式如AGENT:IND001:hash(desc)'],
        ['root_cause_id', '专家库正式根因ID，仅匹配到strategy-srv根因时才有值'],
        ['match_score', '运行态匹配分，由匹配引擎动态计算，替代人工关联强度'],
        ['pattern', '兜底模式库，当算法归因证据不足时按模式匹配召回候选根因'],
        ['problem_score', '问题节点评分 = 异常强度\u00d70.30 + 贡献度\u00d70.35 + 业务权重\u00d70.20 + 可信度\u00d70.15'],
    ]
)

doc.add_page_break()

# ============================================================
# 第2章 体系架构设计
# ============================================================
add_heading('2. 体系架构设计', level=1)

add_heading('2.1 三层架构定义', level=2)
add_para('V4.0将V3.0的两层架构（候选库+执行实例）扩展为三层架构，对齐技术侧实际部署：')

add_table(
    ['层级', '职责', '承载服务', '核心表/接口', '操作者'],
    [
        ['候选库层', '知识模板CRUD管理，存储专家经验和配置信息', 'strategy-srv', 'mcd_strategy_cause_info\nmcd_strategy_cause_pattern\nmcd_strategy_info', '运营人员通过产品侧前端操作'],
        ['运行态层', 'AI分析结果聚合展示，根因融合、客群推荐、策略匹配', 'portal-srv', 'feature_analysis_results*\nfeature_analysis_feedback', '系统自动产出，运营人员查看和反馈'],
        ['执行态层', '工单调度、客户明细生成、执行反馈', 'dispatch-srv', '工单表\n客户明细表', '运营人员触发，系统执行'],
    ]
)

add_heading('2.2 各层职责与数据流转', level=2)
add_para('完整数据流转链路：')
add_bullet('1. 运营人员在候选库层配置根因/策略知识（CRUD操作写入strategy-srv）')
add_bullet('2. 指标异常触发分析，portal-srv调用ai-agent-srv执行全树分析')
add_bullet('3. ai-agent-srv产出根因/客群/策略推荐，portal-srv融合候选库配置根因')
add_bullet('4. portal-srv计算problem_score，标识Top5问题节点')
add_bullet('5. 运行态结果在portal-web展示，运营人员可做采纳/拒绝/修正反馈')
add_bullet('6. 运营人员确认后发起调度，dispatch-srv创建工单执行')
add_bullet('7. 执行完成后dispatch-srv回写状态，portal-srv聚合反馈数据')
add_bullet('8. portal-srv定期(T+1)将聚合数据回写strategy-srv候选库（命中次数、准确率、转化率等）')

add_heading('2.3 运行态串联键设计', level=2)
add_para('运行态统一按以下主键串联，确保链路可追溯：')

add_table(
    ['对象', '主键组成', '说明'],
    [
        ['指标结果', 'analysis_results_id + analysis_results_indicator_id', '一次分析批次+一个指标节点'],
        ['根因结果', 'analysis_results_indicator_id + root_cause_key', '一个指标节点+一个根因'],
        ['客群结果', 'analysis_results_indicator_id + root_cause_key + analysis_results_segment_id', '一个根因+一个客群'],
        ['策略结果', 'analysis_results_segment_id + root_cause_key + analysis_results_strategy_id', '一个客群+一个策略'],
    ]
)

add_para('关键规则：')
add_bullet('root_cause_key是运行态稳定键，支持agent/model根因。格式：STRATEGY:{root_cause_id} 或 AGENT:{indicatorCode}:{hash(desc)} 或 MODEL:{indicatorCode}:{hash(desc)}')
add_bullet('root_cause_id是专家库正式根因ID，仅匹配到strategy-srv根因时才有值')
add_bullet('前端和工单侧一律用root_cause_key追链，避免因无正式根因ID导致链路断裂')

doc.add_page_break()

# ============================================================
# 第3章 根因库设计
# ============================================================
add_heading('3. 根因库设计', level=1)

add_heading('3.1 根因库定位', level=2)
add_para('根因库是专家经验的结构化存储，回答"为什么发生"。核心职责：')
add_bullet('承接运营人员配置的专家根因（STRATEGY来源）')
add_bullet('承接人工补充的根因（MANUAL来源）')
add_bullet('作为运行态根因融合的候选来源，按指标编码+变化区间+场景匹配')
add_bullet('积累命中次数和准确率，支撑后续根因质量评估')

add_para('根因库不承载：运行态的实时分析结果（由portal-srv运行态表承载）、客群推荐逻辑（由ai-agent-srv执行）。')

add_heading('3.2 字段定义与数据来源', level=2)
add_table(
    ['字段', '类型', '必填', '定义与业务含义', '写入者/写入时机', '下游消费方/消费场景'],
    [
        ['root_cause_id', 'varchar(64)', '是', '根因唯一标识，系统自动生成', 'strategy-srv新增根因时自动生成', '运行态融合时匹配；工单引用'],
        ['name', 'varchar(256)', '是', '根因名称，简洁描述根因内容。如"合约到期集中离网"、"竞品降价导致降档"', '运营人员填写', '列表展示；搜索匹配；运行态融合展示'],
        ['root_cause_source', 'varchar(32)', '是', '根因来源。枚举：MODEL(模型归因)/AGENT(LLM产出)/STRATEGY(策略库配置)/MANUAL(人工补充)', '候选库CRUD时由系统自动标记STRATEGY或MANUAL；运行态由portal-srv标记MODEL或AGENT', '融合时决定来源优先级(MANUAL>STRATEGY>MODEL>AGENT)；展示时区分根因可信度'],
        ['category_code', 'varchar(32)', '是', '一级分类编码。枚举：RISK_WARNING(风险预警类)/VALUE_UPGRADE(价值提升类)/LIFECYCLE(生命周期类)/COMPETITION(竞争应对类)/QUALITY(服务质量类)/POLICY(政策影响类)', '运营人员选择', '列表筛选；统计报表；匹配召回时按分类过滤'],
        ['sub_category_code', 'varchar(32)', '是', '二级分类编码。每个一级分类下3个子分类。如RISK_WARNING下：TRAFFIC_OVERFLOW(流量达量预警)/SPECIFIC_CONTENT(特定内容高频访问)/ZERO_USAGE(零流量使用预警)', '运营人员选择', '列表筛选；匹配召回时精细过滤'],
        ['business_scene_code', 'varchar(32)', '是', '主业务场景编码（单值）。枚举：CHURN_RETENTION(离网维系)/INCREMENTAL(增量运营)/TRAFFIC(流量运营)/FAMILY(家庭运营)/MID_HIGH(中高端客户)/INTERNATIONAL(国际业务)/COMPETITION(竞争应对)', '运营人员选择', '匹配召回时按场景过滤；策略推荐时按场景匹配'],
        ['secondary_scene_codes', 'JSON数组', '否', '副业务场景编码列表（多值）。当根因同时影响多个场景时填写。如"竞品降价"同时影响离网维系和增量运营', '运营人员选择', '列表筛选（多场景过滤）；展示时标注跨场景适用性。注意：匹配召回只用主场景'],
        ['description', 'text', '是', '根因详细描述。说明该根因的成因机制、典型表现、影响范围', '运营人员填写', '详情页展示；运行态融合时辅助LLM理解根因语义'],
        ['status', 'varchar(32)', '是', '根因状态。枚举：DRAFT(草稿)/ENABLED(启用)/DISABLED(停用)', '运营人员操作', '列表筛选；匹配召回时只取ENABLED状态'],
        ['direction', 'varchar(16)', '否', '异动方向。枚举：UP(上升)/DOWN(下降)。表示该根因对应的指标变化方向', '运营人员选择', '匹配时按方向过滤（指标下降只匹配DOWN方向的根因）'],
    ]
)

add_heading('3.3 诊断条件设计', level=2)

add_para('V4.0诊断条件设计原则：只保留可自动匹配或可标注的条件类型，去掉无法自动执行的结构化条件。')

add_heading('3.3.1 诊断条件类型', level=3)
add_table(
    ['条件类型', 'V4.0设计', '承载方式', '匹配逻辑', 'V3.0对比'],
    [
        ['关联指标区间', '保留并强化', 'mcd_strategy_cause_pattern: indicator_code + anomaly_direction + change_min + change_max', '系统检测到指标异常时，按指标编码+方向+变化区间匹配候选根因', 'V3.0中为关联指标+阈值，V4.0统一为变化区间表达'],
        ['市场事件标注', '降级为标注性字段', 'mcd_strategy_cause_pattern: note_json，格式：[{"eventType":"COMPETITION_PRICE_CUT","note":"竞品降价时该根因概率显著升高"}]', '不参与自动匹配，仅在人工查看时展示标注信息', 'V3.0中为结构化匹配条件，V4.0因无市场事件数据源降级为标注'],
        ['客户属性条件', '去掉', '\u2014', '\u2014', 'V3.0中有，V4.0去掉，原因：与策略适用约束的客户约束在结构上完全相同（维度+运算符+值），合并到策略约束中统一维护'],
        ['业务维度条件', '去掉', '\u2014', '\u2014', 'V3.0中有，V4.0去掉，原因：业务维度（渠道类型/区域特征等）本质上是指标的维度下钻，通过关联指标的维度拆解已能表达'],
    ]
)

add_heading('3.3.2 关联指标区间详细设计', level=3)
add_para('每个根因可关联多个指标，每个指标关联包含以下信息：')
add_table(
    ['字段', '类型', '定义', '匹配逻辑'],
    [
        ['indicator_code', 'varchar(64)', '指标编码，关联到指标树中的具体指标', '当该指标出现异常时，检查是否命中此根因的pattern'],
        ['anomaly_direction', 'varchar(16)', '异动方向：UP/DOWN', '只匹配同方向的异常'],
        ['change_min', 'decimal(10,4)', '变化区间下限（百分比）。如-0.3表示下降30%以上', '指标变化率 \u2265 change_min'],
        ['change_max', 'decimal(10,4)', '变化区间上限（百分比）。如-0.1表示下降10%以下', '指标变化率 \u2264 change_max'],
        ['is_primary', 'tinyint', '是否主指标。1=是，0=否。每个根因至少1个主指标', '主指标不命中则整个根因不匹配'],
    ]
)

add_para('匹配示例：根因"流量达量预警导致降档"，关联指标=流量使用率，direction=UP，change_min=0.9（使用率>90%），change_max=null（无上限）。当系统检测到流量使用率指标异常上升且值>90%时，该根因pattern被命中。')

add_heading('3.3.3 市场事件标注详细设计', level=3)
add_para('市场事件标注不参与自动匹配，仅作为运营人员参考信息：')
add_table(
    ['字段', '类型', '定义'],
    [
        ['eventType', 'varchar(64)', '事件类型编码。预置：COMPETITION_PRICE_CUT(竞品降价)/POLICY_CHANGE(政策调整)/NATURAL_DISASTER(自然灾害)/SCHOOL_SEASON(校园开学季)/HOLIDAY(节假日)/INDUSTRY_EVENT(行业事件)'],
        ['note', 'varchar(512)', '标注说明。如"校园开学季期间新增客户流失率上升，该根因概率显著升高"'],
    ]
)

add_para('数据来源：运营人员人工标注。不设自动匹配逻辑的原因：当前无市场事件数据源持续维护，配置了自动匹配条件也无法执行。')

add_heading('3.4 关联指标设计', level=2)
add_table(
    ['字段', '类型', '定义', '数据来源'],
    [
        ['indicator_code', 'varchar(64)', '指标编码', '运营人员从指标树选择'],
        ['indicator_name', 'varchar(128)', '指标名称（展示用，实时查询）', '从指标库查询，不冗余存储'],
        ['direction', 'varchar(16)', '异动方向：UP/DOWN', '运营人员选择'],
        ['change_min', 'decimal(10,4)', '变化区间下限', '运营人员填写'],
        ['change_max', 'decimal(10,4)', '变化区间上限', '运营人员填写'],
        ['is_primary', 'tinyint', '是否主指标', '运营人员标记，每个根因至少1个主指标'],
    ]
)

add_heading('3.5 关联客群设计', level=2)
add_table(
    ['字段', '类型', '定义', '数据来源'],
    [
        ['segment_code', 'varchar(64)', '客群编码', '运营人员从客群库选择'],
        ['segment_name', 'varchar(128)', '客群名称（展示用，实时查询）', '从customer_segment_info查询，不冗余存储'],
        ['segment_scale', 'bigint', '客群规模（展示用，实时查询）', '从customer_segment_info实时查询，不在候选库存储。原因：静态快照会过期'],
    ]
)

add_para('重要：V4.0去掉了候选库层面的"关联强度"字段。根因与客群的关联强度在运行态由match_score动态计算，不由人工预设。理由：人工填写的1-5分无客观依据，填完之后无系统逻辑使用。')

add_heading('3.6 运行数据设计', level=2)
add_para('运行数据不属于候选库配置字段，而是运行态统计值在详情页展示。数据来源和展示方式如下：')

add_table(
    ['展示字段', '定义', '数据来源', '查询方式', '展示位置'],
    [
        ['配置置信度', '专家初始赋值或模式匹配赋值', 'mcd_strategy_cause_info.confidence_score，运营人员在编辑页填写（0-1之间）', '直接查strategy-srv', '根因详情页-运行数据Tab'],
        ['运行时置信度', '当前分析批次的综合置信度评分', 'feature_analysis_results_indicator.confidence_score，由portal-srv按公式计算：异常强度\u00d70.30+贡献度\u00d70.35+业务权重\u00d70.20+可信度\u00d70.15', '查询portal-srv运行态表', '根因详情页-运行数据Tab'],
        ['命中次数', '该根因pattern被召回的总次数', 'mcd_strategy_cause_pattern.hit_count，每次pattern匹配成功时累加', '直接查strategy-srv', '根因列表页、详情页'],
        ['准确率', '命中后反馈为ACCEPT的比例', 'mcd_strategy_cause_pattern.accuracy_rate = ACCEPT次数/hit_count', '直接查strategy-srv', '根因详情页-运行数据Tab'],
        ['反馈摘要', '近3个月该根因在分析中被采纳/拒绝/修正的次数分布', '从feature_analysis_feedback聚合：按root_cause_key分组统计feedback_action', '查询portal-srv反馈表后聚合', '根因详情页-运行数据Tab'],
        ['断言强度', '根因判断的可靠程度', 'feature_analysis_root_cause_detail.assertion_level：DESCRIPTIVE(描述性)/ASSOCIATIVE(关联性)/INFERENTIAL(推断性)', '查询portal-srv运行态表', '根因详情页-运行数据Tab'],
    ]
)

add_para('回写机制：portal-srv每日凌晨(T+1)从运行态表聚合反馈数据，调用strategy-srv接口回写hit_count和accuracy_rate。配置置信度不需要回写，由运营人员初始填写。运行时置信度和反馈摘要在前端展示时实时查询portal-srv。')

add_heading('3.7 页面设计', level=2)

add_heading('3.7.1 根因列表页', level=3)
add_para('路径：/workspace/strategy/root-cause')
add_table(
    ['列', '宽度', '说明'],
    [
        ['根因ID', '80px', 'root_cause_id，支持搜索'],
        ['根因名称', '200px', 'name，支持搜索'],
        ['来源', '80px', 'root_cause_source，4种枚举筛选'],
        ['一级分类', '100px', 'category_code，下拉筛选'],
        ['二级分类', '100px', 'sub_category_code，联动一级分类筛选'],
        ['主业务场景', '120px', 'business_scene_code，下拉筛选'],
        ['异动方向', '80px', 'direction，UP/DOWN'],
        ['命中次数', '80px', 'hit_count，数值排序'],
        ['准确率', '80px', 'accuracy_rate，百分比展示'],
        ['状态', '80px', 'status，下拉筛选'],
        ['操作', '120px', '编辑/详情/启停'],
    ]
)

add_heading('3.7.2 根因编辑页', level=3)
add_para('路径：/workspace/strategy/root-cause/edit')
add_para('页面分为4个区块：')

add_para('区块一：基础信息', bold=True)
add_table(
    ['字段', '控件', '必填', '校验规则'],
    [
        ['根因名称', 'Input', '是', '1-256字符，不允许重复'],
        ['来源', 'Select(MODEL/AGENT/STRATEGY/MANUAL)', '是', '候选库新增时默认STRATEGY；人工补充时选MANUAL'],
        ['一级分类', 'Select(6种)', '是', '\u2014'],
        ['二级分类', 'Select(联动一级分类)', '是', '\u2014'],
        ['主业务场景', 'Select(7种)', '是', '\u2014'],
        ['副业务场景', 'MultiSelect(7种，排除已选主场景)', '否', '\u2014'],
        ['异动方向', 'Radio(UP/DOWN)', '否', '\u2014'],
        ['描述', 'TextArea', '是', '10-2000字符'],
        ['配置置信度', 'Slider(0-1，步长0.05)', '是', '默认0.5'],
        ['状态', 'Select(DRAFT/ENABLED/DISABLED)', '是', '新增默认DRAFT'],
    ]
)

add_para('区块二：关联指标', bold=True)
add_para('可添加多组关联指标，每组包含：指标选择 + 异动方向 + 变化区间(下限~上限) + 是否主指标。至少1组且至少1个主指标。')

add_para('区块三：关联客群', bold=True)
add_para('可添加多个关联客群，从客群库选择。客群名称和规模实时查询展示，不在候选库存储。')

add_para('区块四：市场事件标注', bold=True)
add_para('可添加多条标注，每条包含：事件类型(下拉) + 标注说明(文本)。仅作为运营人员参考信息，不参与自动匹配。')

add_heading('3.7.3 根因详情页', level=3)
add_para('路径：/workspace/strategy/root-cause/[id]')
add_para('6个Tab：')
add_table(
    ['Tab', '内容'],
    [
        ['基础信息', '名称/来源/分类/场景/方向/描述/状态/配置置信度'],
        ['运行数据', '运行时置信度/命中次数/准确率/反馈摘要(采纳N次/拒绝N次/修正N次)/断言强度'],
        ['关联指标', '指标列表(编码/名称/方向/变化区间/是否主指标)'],
        ['关联客群', '客群列表(编码/名称/规模\u2014实时查询)'],
        ['市场事件标注', '标注列表(事件类型/说明)'],
        ['使用记录', '该根因在运行态被引用的分析批次列表(批次号/时间/指标/匹配分/反馈状态)'],
    ]
)

doc.add_page_break()

# ============================================================
# 第4章 策略库设计
# ============================================================
add_heading('4. 策略库设计', level=1)

add_heading('4.1 策略库定位', level=2)
add_para('经过多轮设计迭代，明确策略库的核心定位是"匹配召回索引"\u2014\u2014给定根因+客群，推荐什么策略。')
add_para('策略库不是策略全生命周期管理平台，不承载产品详情维护、话术版本管理、渠道状态管理等职责。')
add_para('各职能边界：')
add_bullet('策略库：分类/场景/关联配置/效果统计\u2014\u2014解决"推荐什么"')
add_bullet('产商品中心/CRM：产品编码/名称/描述\u2014\u2014解决"卖什么"')
add_bullet('话术管理平台(二期)：话术内容/版本/A/B测试\u2014\u2014解决"怎么说"')
add_bullet('调度引擎：渠道选择/优先级/时段\u2014\u2014解决"怎么触达"')

add_heading('4.2 字段定义与数据来源', level=2)
add_table(
    ['字段', '类型', '必填', '定义与业务含义', '写入者/写入时机', '下游消费方/消费场景'],
    [
        ['strategy_id', 'varchar(64)', '是', '策略唯一标识，系统自动生成', 'strategy-srv新增策略时自动生成', '工单引用；运行态策略匹配'],
        ['strategy_name', 'varchar(256)', '是', '策略名称。如"合约到期客户续约挽留"、"高流量用户升档推荐"', '运营人员填写', '列表展示；搜索匹配；运行态策略推荐展示'],
        ['strategy_source', 'varchar(32)', '是', '策略来源。枚举：AGENT(LLM产出)/STRATEGY(策略库配置)/MANUAL(人工补充)', '候选库CRUD时由系统自动标记STRATEGY或MANUAL', '匹配时决定来源权重(STRATEGY=1.0, MANUAL=1.0, AGENT=0.75)'],
        ['category_code', 'varchar(32)', '是', '一级分类编码。枚举同根因库6种', '运营人员选择', '列表筛选；统计报表；匹配召回时按分类过滤'],
        ['sub_category_code', 'varchar(32)', '是', '二级分类编码。枚举同根因库', '运营人员选择', '列表筛选；匹配召回时精细过滤'],
        ['business_scene_code', 'varchar(32)', '是', '主业务场景编码（单值）。枚举同根因库7种', '运营人员选择', '匹配召回时按场景过滤'],
        ['secondary_scene_codes', 'JSON数组', '否', '副业务场景编码列表（多值）', '运营人员选择', '列表筛选；展示跨场景适用性'],
        ['description', 'text', '是', '策略详细描述。说明策略的适用条件、预期效果、注意事项', '运营人员填写', '详情页展示；运行态策略推荐展示'],
        ['status', 'varchar(32)', '是', '策略状态。枚举：DRAFT/ENABLED/DISABLED', '运营人员操作', '匹配召回时只取ENABLED状态'],
        ['action_type', 'varchar(32)', '是', '策略动作类型。枚举：UPGRADE(升迁)/RETAIN(挽留)/REMIND(提醒)/RECOMMEND(推荐)/OPTIMIZE(优化)/EXPAND(拓展)', '运营人员选择', '调度时按动作类型匹配执行模板；统计分类'],
        ['risk_level', 'varchar(16)', '是', '策略风险等级。枚举：LOW/MEDIUM/HIGH', '运营人员判断。判断依据：降价幅度>20%或影响客户>10万或需要省公司审批=HIGH', '调度时高风险策略需审批；列表标红展示'],
        ['effective_start_date', 'date', '否', '有效期开始日期。如开学季策略从8月1日开始', '运营人员填写', '匹配召回时过滤：当前日期<effective_start_date的策略不推荐'],
        ['effective_end_date', 'date', '否', '有效期结束日期。过期后策略自动不推荐（状态不变，查询时日期过滤）', '运营人员填写', '匹配召回时过滤：当前日期>effective_end_date的策略不推荐'],
    ]
)

add_heading('4.3 关联配置设计', level=2)
add_para('策略的关联配置是匹配召回的核心\u2014\u2014"给定什么条件，推荐这个策略"。')

add_heading('4.3.1 关联根因', level=3)
add_para('策略可关联多个根因（1:N），表示该策略适用于这些根因场景。')
add_table(
    ['字段', '类型', '定义', '数据来源'],
    [
        ['root_cause_id', 'varchar(64)', '根因ID', '运营人员从根因库选择'],
        ['root_cause_name', 'varchar(256)', '根因名称（展示用，实时查询）', '从strategy-srv查询，不冗余存储'],
    ]
)

add_heading('4.3.2 关联指标（降级路径）', level=3)
add_para('当无匹配根因时，策略可按指标直接推荐（降级路径）。正常路径是"指标\u2192根因\u2192策略"，降级路径是"指标\u2192策略"。')
add_table(
    ['字段', '类型', '定义', '数据来源'],
    [
        ['indicator_code', 'varchar(64)', '指标编码', '运营人员从指标树选择'],
        ['indicator_name', 'varchar(128)', '指标名称（实时查询）', '从指标库查询'],
        ['fallback_only', 'tinyint', '是否仅降级使用。1=只在无根因匹配时推荐，0=始终推荐', '运营人员标记，默认1'],
    ]
)

add_para('匹配逻辑：策略匹配引擎先按根因匹配，当根因匹配的match_score低于阈值时，按指标编码查不绑定根因的降级策略。')

add_heading('4.3.3 关联客群', level=3)
add_para('策略可关联多个客群（1:N），表示该策略偏向适用的客群。')
add_table(
    ['字段', '类型', '定义', '数据来源'],
    [
        ['segment_code', 'varchar(64)', '客群编码', '运营人员从客群库选择'],
        ['segment_name', 'varchar(128)', '客群名称（实时查询）', '从customer_segment_info查询'],
        ['segment_scale', 'bigint', '客群规模（实时查询）', '实时查询，不在候选库存储'],
    ]
)

add_para('重要：V4.0去掉了所有关联关系上的人工关联强度(strength)字段。运行态的match_score由匹配引擎动态计算，公式：match_score = root_cause_match_score\u00d70.35 + segment_match_score\u00d70.30 + source_weight\u00d70.20 + history_score\u00d70.15。')

add_heading('4.4 关联产品设计', level=2)
add_para('V4.0设计：策略库只引用产品编码，不存产品名称和描述。产品详情从产商品中心/CRM查询。')

add_table(
    ['字段', '类型', '定义', '数据来源'],
    [
        ['product_codes', 'JSON数组', '关联产品编码列表。如["PROD_5G_UPGRADE","PROD_BUNDLE_PLUS"]', '运营人员从产品目录选择'],
        ['product_name(展示)', 'varchar(128)', '产品名称，只读展示', '根据product_codes实时查询CRM产品接口'],
        ['product_desc(展示)', 'text', '产品描述，只读展示', '根据product_codes实时查询CRM产品接口'],
    ]
)

add_para('V3.0对比：V3.0在策略库中存了productCode+productName+productDescription，V4.0只存编码，名称和描述改为实时查询。原因：产品主数据由产商品中心维护，策略库冗余存储会导致数据不一致。')

add_heading('4.5 营销话术设计', level=2)
add_para('V4.0设计：一期话术暂存策略库（过渡方案），二期迁到话术管理平台。')

add_para('一期方案（当前）：', bold=True)
add_table(
    ['字段', '类型', '定义', '数据来源'],
    [
        ['scripts', 'JSON数组', '话术列表。每项：{name:话术名称, channel:适用渠道, content:话术内容}', '运营人员填写'],
    ]
)

add_para('二期方案（话术管理平台就绪后）：', bold=True)
add_bullet('策略库只标注"适用渠道类型"（与渠道适配合并）')
add_bullet('话术内容迁到话术管理平台，策略库改为引用话术编码')
add_bullet('创建调度单时从话术管理平台选择话术')

add_heading('4.6 渠道适配设计', level=2)
add_para('V4.0设计：候选库只存"适用渠道列表"，不存优先级和时段。优先级和时段由调度引擎根据运行时状态动态决定。')

add_table(
    ['字段', '类型', '定义', '数据来源'],
    [
        ['applicable_channels', 'JSON数组', '适用渠道列表。枚举：OUTBOUND_CALL(外呼)/SMS(短信)/APP_PUSH(APP弹窗)/WECHAT(微信)/STORE(营业厅)/IVR(智能语音)', '运营人员选择'],
    ]
)

add_para('V3.0对比：V3.0在渠道适配中存了channel+priority+timeSlot，V4.0去掉priority和timeSlot。原因：渠道优先级应根据渠道当前负载、座席空闲率动态排序；最佳触达时段应根据客户画像中的偏好时段动态确定。静态配置的优先级和时段在实际执行时可能完全不可用。')

add_heading('4.7 适用约束设计', level=2)

add_heading('4.7.1 时效约束', level=3)
add_table(
    ['字段', '类型', '定义', '匹配逻辑'],
    [
        ['effective_start_date', 'date', '有效期开始日期', '当前日期 < 开始日期时，策略不推荐'],
        ['effective_end_date', 'date', '有效期结束日期', '当前日期 > 结束日期时，策略不推荐。注意：过期不改变策略状态，仅查询时日期过滤'],
    ]
)

add_para('示例："开学季专属策略" effective_start_date=2025-08-01, effective_end_date=2025-09-30。非此日期范围时策略不出现在推荐列表中。')

add_heading('4.7.2 客户约束', level=3)
add_para('客户约束定义策略适用的客户条件。与V3.0诊断条件中的"客户属性条件"合并\u2014\u2014只在策略约束中维护一份，不在根因诊断条件中重复。')
add_table(
    ['字段', '类型', '定义', '匹配逻辑'],
    [
        ['customer_constraint_json', 'JSON', '客户约束条件列表。每项：{dimension:维度编码, operator:运算符(GT/LT/EQ/GTE/LTE/NE/IN), value:值}', '调度时查询CDP客户标签，校验当前客户是否满足所有约束条件。所有条件AND逻辑'],
    ]
)

add_para('约束维度编码示例：')
add_table(
    ['维度编码', '维度名称', '运算符', '值示例', '数据来源'],
    [
        ['CUST_ARPU_LEVEL', 'ARPU等级', 'GTE', '80', 'CDP客户标签'],
        ['CUST_CONTRACT_STATUS', '合约状态', 'EQ', 'NO_CONTRACT', 'BSS/CRM'],
        ['CUST_TENURE_MONTHS', '在网月数', 'GTE', '6', 'BSS/CRM'],
        ['CUST_LOYALTY_SCORE', '忠诚度评分', 'LT', '3', 'CDP客户标签'],
    ]
)

add_heading('4.8 效果评估设计', level=2)
add_para('V4.0设计：效果评估只展示运行态统计值，不存配置参数。')

add_table(
    ['展示字段', '定义', '计算公式', '数据来源', '展示规则'],
    [
        ['加权转化率', '策略实际执行后的加权平均转化率', '\u03a3(单次触达转化率 \u00d7 触达成功客户数) / \u03a1触达成功客户数', 'dispatch-srv执行数据聚合，portal-srv T+1回写strategy-srv', '最近3个月数据，可切换查询区间'],
        ['执行调度单数', '该策略被调度执行的工单总数', 'COUNT(工单 WHERE strategy_id=当前策略 AND status IN (DISPATCHED,FINISHED))', 'dispatch-srv工单表', '\u2014'],
        ['数据充足标识', '统计样本是否充足的标识', '执行调度单数 \u2265 3时为"充足"，否则为"数据不足"', '计算值', '数据不足时展示黄色警告标识'],
    ]
)

add_para('V3.0对比：V3.0中有统计周期配置(默认3个月)和最小样本量配置(默认10)，V4.0去掉。原因：统计周期改为查询参数（前端可切换3个月/6个月/12个月），最小样本量改为固定的"调度单数\u22653"判断逻辑，不需要人工配置。')

add_heading('4.9 运行数据设计', level=2)
add_table(
    ['展示字段', '定义', '数据来源', '展示位置'],
    [
        ['匹配分(match_score)', '运行态策略推荐时的匹配评分', 'feature_analysis_results_strategy.match_score，公式：root_cause_match\u00d70.35+segment_match\u00d70.30+source_weight\u00d70.20+history_score\u00d70.15', '策略详情页-运行数据Tab'],
        ['反馈摘要', '近3个月该策略在推荐中被采纳/拒绝/反馈无效的次数分布', '从feature_analysis_feedback聚合', '策略详情页-运行数据Tab'],
        ['来源权重', '策略来源对应的匹配权重', 'STRATEGY=1.0, MANUAL=1.0, AGENT=0.75', '策略详情页-运行数据Tab'],
        ['历史评分(history_score)', '基于历史执行效果的策略评分', 'feature_analysis_results_strategy中计算，一期默认0.5', '策略详情页-运行数据Tab'],
    ]
)

add_heading('4.10 页面设计', level=2)

add_heading('4.10.1 策略列表页', level=3)
add_para('路径：/workspace/strategy/library')
add_table(
    ['列', '宽度', '说明'],
    [
        ['策略ID', '80px', 'strategy_id，支持搜索'],
        ['策略名称', '200px', 'strategy_name，支持搜索'],
        ['来源', '80px', 'strategy_source，3种枚举筛选'],
        ['一级分类', '100px', 'category_code，下拉筛选'],
        ['动作类型', '80px', 'action_type，下拉筛选'],
        ['风险等级', '80px', 'risk_level，颜色标识(低绿/中黄/高红)'],
        ['适用渠道', '120px', 'applicable_channels，Tag展示'],
        ['关联根因数', '60px', '数值，点击展开根因列表'],
        ['加权转化率', '80px', '最近3个月，数值排序'],
        ['状态', '80px', 'status，下拉筛选'],
        ['操作', '120px', '编辑/详情/启停'],
    ]
)

add_heading('4.10.2 策略编辑页', level=3)
add_para('路径：/workspace/strategy/library/edit')
add_para('页面分为6个Tab：')

add_table(
    ['Tab序号', 'Tab名称', '内容'],
    [
        ['1', '基础信息', '策略名称/来源/分类(一级+二级)/主业务场景/副业务场景/描述/动作类型/风险等级/状态'],
        ['2', '关联配置', '关联根因(多选)/关联指标(降级路径，多选+fallback_only标记)/关联客群(多选)'],
        ['3', '产品\u00b7方案', '关联产品编码(多选)+产品名称描述(只读实时查询)'],
        ['4', '营销话术', '话术列表(名称+适用渠道+内容)，一期暂存策略库'],
        ['5', '渠道适配', '适用渠道列表(多选，无优先级无时段)'],
        ['6', '适用约束\u00b7效果评估', '时效约束(起止日期)/客户约束(维度+运算符+值)/效果评估展示(加权转化率+调度单数+数据充足标识)'],
    ]
)

add_heading('4.10.3 策略详情页', level=3)
add_para('路径：/workspace/strategy/library/[id]')
add_para('7个Tab：')

add_table(
    ['Tab序号', 'Tab名称', '内容'],
    [
        ['1', '基础信息', '名称/来源/分类/场景/描述/动作类型/风险等级/状态/有效期'],
        ['2', '关联配置', '关联根因列表/关联指标列表(含降级标记)/关联客群列表(含实时规模)'],
        ['3', '适用约束', '时效约束/客户约束详情'],
        ['4', '产品\u00b7方案', '产品列表(编码+名称+描述，实时查询)'],
        ['5', '营销话术', '话术列表'],
        ['6', '渠道适配', '适用渠道列表'],
        ['7', '效果评估与运行数据', '加权转化率/执行调度单数/数据充足标识/匹配分/反馈摘要/来源权重/历史评分'],
    ]
)

doc.add_page_break()

# ============================================================
# 第5章 关联关系管理
# ============================================================
add_heading('5. 关联关系管理', level=1)

add_heading('5.1 关系类型定义', level=2)
add_para('V4.0定义的关系类型与V3.0对比：')

add_table(
    ['关系类型', 'V4.0定位', '承载方式', '匹配召回中的作用', 'V3.0对比'],
    [
        ['根因\u2192指标', '主关系（强关系）', 'mcd_strategy_cause_pattern: indicator_code + direction + change_min/max', '指标异常时按pattern匹配召回候选根因', 'V3.0有人工强度，V4.0去掉'],
        ['根因\u2192策略', '主关系（强关系）', 'mcd_strategy_info: root_cause_id', '根因确定后查询关联策略推荐', 'V3.0有人工强度，V4.0去掉'],
        ['根因\u2192客群', '弱关系', 'mcd_strategy_cause_pattern: segment_codes_json', '根因确定后查询推荐客群', 'V3.0有人工强度，V4.0去掉'],
        ['策略\u2192指标', '降级路径（弱关系）', '策略编辑页fallback标记的指标关联', '根因匹配不足时按指标直连策略', 'V3.0为主要关系+人工强度，V4.0降级为弱关系'],
        ['策略\u2192客群', '弱关系', 'mcd_strategy_info: customer_id，V4.0扩展为多客群', '策略推荐时标注偏向适用客群', 'V3.0有人工强度，V4.0去掉'],
        ['指标\u2192客群', '弱关系', 'customer_segment_indicator_rel（已有表）', '候选客群召回来源', 'V3.0有人工强度+阈值，V4.0只读展示不独立维护'],
    ]
)

add_heading('5.2 关联强度设计', level=2)
add_para('V4.0核心变更：去掉所有关联关系上的人工关联强度(strength 1-5)。')
add_para('去掉原因：')
add_bullet('人工填写的1-5分无客观标准\u2014\u2014谁来填？填1还是5？没有可操作的评判依据')
add_bullet('填完之后无下游消费\u2014\u2014匹配排序不参考此值，推荐权重不参考此值')
add_bullet('与运行态冲突\u2014\u2014技术侧的match_score（动态计算）才是真正有意义的关联强度')
add_bullet('与已去掉的字段同类\u2014\u2014策略标签、目标转化率已被去掉，原因相同')

add_para('替代方案：运行态由匹配引擎动态计算match_score。公式：')
add_para('match_score = root_cause_match_score\u00d70.35 + segment_match_score\u00d70.30 + source_weight\u00d70.20 + history_score\u00d70.15')
add_para('来源权重：STRATEGY=1.0, MANUAL=1.0, AGENT=0.75')
add_para('一期history_score默认0.5（历史数据不足）。')

add_heading('5.3 AI推理路径', level=2)
add_para('V4.0定义的AI推理路径：')

add_table(
    ['路径', '定义', '触发条件', '使用场景'],
    [
        ['路径1（正常）', '指标\u2192根因\u2192客群\u2192策略', '指标异常触发分析，根因匹配置信度充足', '标准AIOps因果推理链路'],
        ['路径2（正常子集）', '根因\u2192客群\u2192策略', '已知根因，推荐客群和策略', '运营人员从根因库发起推荐'],
        ['路径3（降级）', '指标\u2192策略（直连）', '根因匹配的match_score低于阈值时降级', '根因不明确时按经验推荐通用策略'],
        ['路径4（降级）', '客群\u2192策略（直连）', '客群无关联根因时降级', '从客群维度直接推荐策略'],
    ]
)

add_para('关键规则：路径3和4是降级路径，不应作为主要关系维护。当根因匹配的match_score \u2265 阈值时，只走路径1/2；低于阈值时自动降级到路径3/4。阈值由系统配置，建议初始值0.6。')

add_heading('5.4 页面设计', level=2)
add_para('路径：/workspace/strategy/relation')
add_para('6个Tab对应6类关系类型，每个Tab内：')
add_bullet('列表视图：表格展示当前关系类型下的所有关系对，列包括：源对象/目标对象/match_score(运行态)/操作')
add_bullet('网络图视图：可视化展示关系网络，节点大小按运行态match_score缩放，无人工强度')
add_bullet('筛选：按关系类型/来源/场景/match_score区间筛选')

doc.add_page_break()

# ============================================================
# 第6章 工单调度体系
# ============================================================
add_heading('6. 工单调度体系', level=1)

add_heading('6.1 六种调度类型', level=2)
add_table(
    ['调度类型', '工单前缀', '数据洞察入口', '调度触发方式', '子单生成逻辑'],
    [
        ['指标调度', 'IND', '指标树\u2192分析面板', '指标异常触发分析后，运营确认发起', '按区域拆分子单'],
        ['策略调度', 'STR', '策略中心\u2192匹配推荐', '策略推荐后，运营确认发起', '按客群拆分子单'],
        ['客群调度', 'CG-OP', '客群分析\u2192圈选', '客群圈选后，运营确认发起', '按区域拆分子单'],
        ['客户商机调度', 'COD', '商机池\u2192批量勾选', '批量勾选客户后发起', '每个客户一个子单'],
        ['客群商机调度', 'GOD', '模型预测\u2192客群圈选', '客群预测后发起', '按客群拆分子单'],
        ['区域攻坚调度', 'RAS', '区域攻坚\u2192地图圈选', '地图圈选区域后发起', '按小区/网格拆分子单'],
    ]
)

add_heading('6.2 共享组件设计', level=2)
add_para('客户商机调度和客群商机调度共用以下组件，通过条件渲染差异字段：')
add_table(
    ['组件', '功能', '客户商机调度差异', '客群商机调度差异'],
    [
        ['OpportunityRelatedInfo', '关联商机/客群信息', '展示客户商机详情(客户/电话/分类)', '展示客群商机详情(客群编码/规模/预测准确率)'],
        ['OpportunityDispatchConfig', '调度配置', '调度方式：逐单派发', '调度方式：批量派发'],
        ['OpportunityExecutionProgress', '执行进度总览', '触达\u2192转化漏斗(客户粒度)', '触达\u2192转化漏斗(客群粒度)'],
        ['OpportunitySubTicketList', '子单列表', '子单列含客户姓名/电话', '子单列含客群编码/规模'],
        ['OpportunityEffectEvaluation', '效果评估', '单客户转化结果', '客群整体转化率'],
        ['SubTicketExecutionDetail', '子单执行明细', '客户+动作合一列表', '客群+动作合一列表'],
    ]
)

add_heading('6.3 商机管理设计', level=2)
add_para('6个管理页面：')

add_table(
    ['页面', '路径', '核心功能'],
    [
        ['商机分类管理', '/workspace/business-opportunity/category', '3级分类树(一级3个/二级6个/三级4个预置)，悬浮操作按钮'],
        ['商机源管理', '/workspace/business-opportunity/source', '按状态(待审批/已上架/已下架)显示不同操作按钮'],
        ['客户商机', '/workspace/business-opportunity/customer', '预测数据采集池，4种状态(已采集/清洗中/已入模/已预测)，详情弹窗3Tab(基本信息/执行情况/转化结果)'],
        ['客群商机', '/workspace/business-opportunity/group', '业务处理主体，4种状态(待调度/调度中/已完成/已废弃)，待调度支持调度和废弃操作'],
        ['清洗规则配置', '/workspace/business-opportunity/cleaning-rules', '6种固定规则类型(黑名单过滤/去重/在途工单校验/频率控制/低价值过滤/已超时过滤)，入模策略3选1(不入模型/降权入模/合并入模)'],
        ['预警规则配置', '/workspace/business-opportunity/warning-rules', '双域预警：预测域(采集异常/剔除率突增/准确率下降)+执行域(积压/逾期/转化率过低)'],
    ]
)

doc.add_page_break()

# ============================================================
# 第7章 数据来源与下游消费总表
# ============================================================
add_heading('7. 数据来源与下游消费总表', level=1)
add_para('本章汇总所有字段的数据来源和下游消费，确保每个字段可追溯。')

add_heading('7.1 候选库写入来源', level=2)
add_table(
    ['写入场景', '写入者', '写入时机', '涉及字段'],
    [
        ['运营人员新增根因', 'strategy-srv', '前端提交新增表单', 'root_cause_id/name/source/category/sub_category/business_scene/description/direction/status/confidence_score'],
        ['运营人员编辑根因', 'strategy-srv', '前端提交编辑表单', '同上可编辑字段 + pattern表的indicator_code/direction/change_min/change_max/segment_codes/note_json'],
        ['运营人员启停根因', 'strategy-srv', '前端点击启停按钮', 'status'],
        ['运营人员新增策略', 'strategy-srv', '前端提交新增表单', 'strategy_id/name/source/category/sub_category/business_scene/description/status/action_type/risk_level/effective_dates/channels/constraints/product_codes/scripts'],
        ['运营人员编辑策略', 'strategy-srv', '前端提交编辑表单', '同上可编辑字段'],
        ['运行态回写', 'portal-srv', 'T+1每日凌晨批量回写', 'hit_count/accuracy_rate/weighted_conversion_rate'],
    ]
)

add_heading('7.2 运行态数据来源', level=2)
add_table(
    ['数据', '生产者', '生产时机', '存储位置', '消费方式'],
    [
        ['运行时置信度', 'portal-srv', '分析完成后计算', 'feature_analysis_results_indicator.confidence_score', '根因详情页-运行数据Tab实时查询'],
        ['problem_score', 'portal-srv', '分析完成后计算', 'feature_analysis_results_indicator.problem_score', '问题指标树排序'],
        ['match_score', 'portal-srv/ai-agent-srv', '策略匹配时计算', 'feature_analysis_results_strategy.match_score', '策略推荐排序；关联关系网络图展示'],
        ['feedback_status', '运营人员操作', '运营人员点击采纳/拒绝/修正', 'feature_analysis_feedback', '反馈摘要聚合；history_score计算'],
        ['加权转化率', 'portal-srv聚合', 'dispatch-srv执行完成后聚合', '回写strategy-srv', '策略列表排序；效果评估展示'],
    ]
)

add_heading('7.3 执行态数据来源', level=2)
add_table(
    ['数据', '生产者', '生产时机', '消费方式'],
    [
        ['工单状态', 'dispatch-srv', '工单创建/审批/分配/执行/完成', '工单列表展示；调度总览统计'],
        ['触达结果', 'dispatch-srv', '渠道执行回调', '执行进度漏斗；转化率计算'],
        ['转化结果', 'dispatch-srv', '后续账期数据回刷', '效果评估；加权转化率计算'],
        ['客户明细', 'CRC外部调用', 'dispatch-srv触发CRC圈选', '子工单分配；客户画像'],
    ]
)

doc.add_page_break()

# ============================================================
# 第8章 约束与异常处理
# ============================================================
add_heading('8. 约束与异常处理', level=1)

add_table(
    ['场景', '处理规则', '涉及模块'],
    [
        ['根因匹配无结果', '仅展示agent/model根因，标注"无专家根因匹配"', '根因融合'],
        ['策略匹配无结果', '降级到指标直连策略；仍无结果则返回"建议人工跟进"占位策略', '策略推荐'],
        ['客群圈选无结果', '查询配置客群；仍无结果则提示需配置', '客群圈选'],
        ['产品编码查询CRM失败', '策略详情页产品名称位置展示"查询失败"，保留产品编码', '产品展示'],
        ['客群规模实时查询失败', '展示"暂无数据"，不影响其他功能', '客群展示'],
        ['回写strategy-srv失败', 'portal-srv记录回写失败日志，下次T+1重试', '回写机制'],
        ['策略有效期过期', '不出现在推荐列表，状态不变，运营人员仍可在列表页查看', '策略匹配'],
        ['高风险策略调度', '需审批后才能创建工单', '调度引擎'],
        ['CRC客户明细生成失败', '工单状态标记为FAILED，保留错误信息', 'dispatch-srv'],
        ['ai-train SHAP分析失败', '降级为规则/相关性/LLM解释，analysis_status=PARTIAL', '分析引擎'],
    ]
)

doc.add_page_break()

# ============================================================
# 第9章 分期实施计划
# ============================================================
add_heading('9. 分期实施计划', level=1)

add_heading('9.1 一期：候选库CRUD + 基础展示', level=2)
add_para('目标：根因库和策略库可CRUD操作，运行态数据通过portal-srv直接查询展示。')
add_table(
    ['功能项', '说明', '优先级'],
    [
        ['根因库CRUD', 'strategy-srv新增根因增删改接口，前端列表/编辑/详情页', 'P0'],
        ['策略库CRUD', 'strategy-srv新增策略增删改接口，前端列表/编辑/详情页', 'P0'],
        ['strategy-srv字段扩展', '根因增加name/category/sub_category/status；策略增加name/category/sub_category/desc/status/action_type/risk_level/effective_dates/channels/constraints/product_codes', 'P0'],
        ['关联配置维护', '根因-指标/根因-客群/策略-根因/策略-客群的关联维护接口', 'P0'],
        ['运行数据展示', '根因/策略详情页的运行数据Tab，直接查询portal-srv运行态表', 'P1'],
        ['效果评估展示', '策略效果评估，查询dispatch-srv执行数据', 'P1'],
        ['关联关系管理页', '6类关系Tab + 列表/网络图视图', 'P1'],
        ['工单调度体系', '6种调度类型的完整工单流程', 'P1'],
        ['商机管理', '6个商机管理页面', 'P1'],
    ]
)

add_heading('9.2 二期：回写链路 + 匹配引擎升级', level=2)
add_table(
    ['功能项', '说明', '优先级'],
    [
        ['运行态\u2192候选库回写', 'portal-srv每日T+1批量回写hit_count/accuracy_rate/weighted_conversion_rate到strategy-srv', 'P0'],
        ['匹配引擎升级', 'dimension_tags_json扩展为结构化格式，支持运算符匹配', 'P1'],
        ['降级路径实现', '策略匹配引擎增加指标直连策略的降级逻辑', 'P1'],
        ['话术管理平台', '策略库话术迁出到独立话术管理平台', 'P2'],
        ['产品详情查询', '对接产商品中心/CRM产品查询接口', 'P2'],
    ]
)

add_heading('9.3 三期：策略闭环 + 高级能力', level=2)
add_table(
    ['功能项', '说明', '优先级'],
    [
        ['策略ROI评估', '策略投入产出比计算', 'P2'],
        ['策略冷却期', '同一客户短期内不重复推荐相同策略', 'P2'],
        ['A/B实验', '策略效果对比实验', 'P3'],
        ['决策树规则发现', '客群圈选方法C', 'P2'],
        ['实时画像', 'bitmap索引 + 流式标签增量', 'P3'],
    ]
)

# ============================================================
# 保存文件
# ============================================================
output_dir = '/workspace/projects/docs/\u9700\u6c42\u8bbe\u8ba1\u65b9\u6848'
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, '\u6307\u6807\u7b56\u7565\u77e5\u8bc6\u5e93\u7ba1\u7406-\u5b8c\u6574\u8bbe\u8ba1\u65b9\u6848.docx')
doc.save(output_path)
print(f'Document saved to: {output_path}')
