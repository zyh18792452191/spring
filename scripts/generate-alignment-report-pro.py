#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成产品侧vs技术侧全量对标分析与方案衔接评估报告（专业版）"""

from docx import Document
from docx.shared import Pt, Cm, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn

doc = Document()

# ─── 样式设置 ───
style = doc.styles['Normal']
style.font.size = Pt(10.5)
style.font.name = '微软雅黑'
style.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
style.paragraph_format.line_spacing = 1.3

for level in range(1, 5):
    hs = doc.styles[f'Heading {level}']
    hs.font.name = '微软雅黑'
    hs.element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')
    hs.font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)

def add_table(headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(headers):
        cell = table.rows[0].cells[j]
        cell.text = h
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.bold = True
                r.font.size = Pt(9)
    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            cell = table.rows[i + 1].cells[j]
            cell.text = str(val)
            for p in cell.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(9)
    return table

def add_bullet(text):
    p = doc.add_paragraph(text, style='List Bullet')
    for r in p.runs:
        r.font.size = Pt(10.5)

def add_para(text):
    doc.add_paragraph(text)

# ═══════════════════════════════════════════════════════════════════
# 封面
# ═══════════════════════════════════════════════════════════════════
for _ in range(5):
    doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('产品侧 vs 技术侧')
r.font.size = Pt(26)
r.bold = True
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('全量对标分析与方案衔接评估报告')
r.font.size = Pt(22)
r.bold = True
doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('市场数智运营平台 · 根因库 / 策略库 / 关联关系')
r.font.size = Pt(14)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('2026年6月 · V1.0（基于最新产品方案）')
r.font.size = Pt(12)

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════
# 一、分析框架与方法论
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('一、分析框架与方法论', level=1)

doc.add_heading('1.1 分析立场', level=2)
add_para('本报告采取完全中立立场，既不偏袒产品侧，也不偏袒技术侧。判断标准是唯一的三把尺子：')
add_bullet('业务必要性：该字段/功能是否有明确的业务场景和下游消费方？')
add_bullet('技术可落地性：该设计是否能在现有微服务架构下实现？数据从哪来？谁写入？谁读取？')
add_bullet('行业实践参照：电信运营商AIOps/精准营销领域的通行做法是什么？')

doc.add_heading('1.2 对标范围', level=2)
add_table(
    ['维度', '产品侧来源', '技术侧来源'],
    [
        ['根因库', '根因库管理页面（列表/新增编辑/详情）、运行数据指标体系', '《指标底座与全树根因分析能力改造详细设计》中的mcd_root_cause_info表、pattern库、匹配引擎'],
        ['策略库', '策略库管理页面（列表/新增编辑/详情）、6个Tab配置', '《根因分析客群策略推荐一体化详细设计》中的mcd_strategy_info表、策略匹配引擎'],
        ['关联关系', '关联关系管理页面（6类关系Tab）', '两份技术文档中的relation表、pattern库、AI推理链路'],
        ['推荐引擎', '召回机制、置信度排序、AI推理路径', '两份技术文档中的portal-srv推荐引擎、feature_analysis系列表'],
        ['运行数据', '引用率/命中率/转化率/置信度指标体系', 'feature_analysis_feedback、mcd_strategy_cause_pattern、dispatch-srv执行数据'],
    ]
)

doc.add_heading('1.3 衔接评估维度', level=2)
add_para('对每一个对标项，除差异分析外，还从以下4个维度评估衔接性：')
add_bullet('数据模型衔接：产品侧字段能否映射到技术侧的数据库表/字段？')
add_bullet('接口衔接：技术侧现有或规划的API能否支撑产品侧的CRUD操作和查询需求？')
add_bullet('流程衔接：产品侧设计的业务流程与技术侧的数据流转是否对齐？')
add_bullet('数据来源衔接：产品侧展示的数据，在技术侧有没有明确的写入者和写入时机？')
add_para('衔接结论分为3类：')
add_table(
    ['衔接结论', '含义'],
    [
        ['可直接衔接', '产品侧设计与技术侧现状完全对齐，或差异可通过简单映射解决，无需调整'],
        ['需协商后衔接', '产品侧与技术侧存在差异，需要一方或双方调整，但调整方案明确可落地'],
        ['无法衔接', '产品侧设计的技术支撑在技术侧完全缺失，需新建能力或根本性改造'],
    ]
)

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════
# 二、根因库——全量对标与衔接评估
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('二、根因库——全量对标与衔接评估', level=1)

doc.add_heading('2.1 基础信息字段', level=2)
add_table(
    ['字段', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['根因ID', 'RC-XXXX，系统自动生成', 'root_cause_id，系统生成UUID', '格式不同但本质一致，RC-XXXX是展示格式', '技术侧root_cause_id保持UUID，产品侧做格式映射展示', '可直接衔接'],
        ['根因名称', '1-100字符，必填，不可重复', 'root_cause_name，无长度约束定义', '技术侧缺少长度和唯一性约束', '技术侧增加name长度限制和唯一索引', '需协商后衔接'],
        ['根因分类', '7类一级分类（价格与竞争/产品与套餐/网络与服务/触点与渠道/市场与政策/终端与适配/其他）', 'category，字符串字段，无枚举约束', '技术侧缺少分类枚举定义', '技术侧增加category枚举约束，与产品侧7类对齐', '需协商后衔接'],
        ['根因描述', '可选，最多500字符', 'description，文本字段', '基本对齐', '技术侧增加长度约束', '可直接衔接'],
        ['来源', '专家经验/AI生成（2种），决定来源权重', 'source_type: MANUAL/STRATEGY/MODEL/AGENT（4种），有source_weight字段', '关键差异：产品侧2种vs技术侧4种。技术侧的STRATEGY和MODEL对应产品侧的AI生成', '见第2.1.1节专项分析', '需协商后衔接'],
        ['来源权重', '专家经验=1.0，AI生成=0.75，从来源字段自动获取', 'source_weight: MANUAL=1.0, STRATEGY=0.7, MODEL=0.8, AGENT=0.9', '关键差异：权重值不同。技术侧4级权重（0.7-1.0），产品侧2级（0.75/1.0）', '见第2.1.2节专项分析', '需协商后衔接'],
        ['置信度', '=命中率×0.60+引用率×0.25+来源权重×0.15，T+1聚合', 'config_confidence，人工配置的初始置信度，0-1浮点数', '关键差异：产品侧是运行态自动计算，技术侧是人工配置初始值。含义完全不同', '技术侧保留config_confidence作为初始值，新增runtime_confidence字段存储T+1计算值', '需协商后衔接'],
        ['创建时间/更新时间', '系统自动记录', 'created_at/updated_at', '完全对齐', '无需调整', '可直接衔接'],
    ]
)

doc.add_heading('2.1.1 来源类型差异专项分析', level=3)
add_table(
    ['技术侧类型', '技术侧权重', '产品侧映射', '产品侧权重', '分析'],
    [
        ['MANUAL', '1.0', '专家经验', '1.0', '完全对齐，运营人员手动配置'],
        ['STRATEGY', '0.7', 'AI生成', '0.75', '技术侧指"由策略推理引擎产出"，产品侧统一归为AI生成'],
        ['MODEL', '0.8', 'AI生成', '0.75', '技术侧指"由机器学习模型产出"，产品侧统一归为AI生成'],
        ['AGENT', '0.9', 'AI生成', '0.75', '技术侧指"由AI智能体产出"，产品侧统一归为AI生成'],
    ]
)
add_para('建议方案：产品侧保持2种来源（专家经验/AI生成），技术侧保留4种source_type但增加source_category字段映射到产品侧的2种分类。source_weight由source_category决定，不再按4种细分。这样技术侧保留了细粒度溯源能力，产品侧简化了运营认知负担。')

doc.add_heading('2.1.2 来源权重差异专项分析', level=3)
add_table(
    ['立场', '论点'],
    [
        ['产品侧（2级权重）', '运营人员不需要区分"这个根因是模型生成的还是智能体生成的"，只需知道"这是人写的还是机器写的"。2级权重简单清晰，避免运营人员纠结权重微调。且AI生成的根因尚未经过充分验证，统一0.75偏低权重是合理的保守策略'],
        ['技术侧（4级权重）', '不同AI产出方式的可靠度确实不同：模型经过训练集验证（0.8），智能体经过多轮推理（0.9），策略引擎只是规则匹配（0.7）。4级权重更精确，有利于推荐排序的区分度'],
    ]
)
add_para('结论：采用上述source_category映射方案，运行态权重按产品侧2级（1.0/0.75）计算置信度，技术侧保留4级source_type用于溯源分析。')

doc.add_heading('2.2 运行数据指标体系', level=2)
add_table(
    ['指标', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['引用率', '调度单引用次数/召回次数，近3个月', '无对应字段。技术侧有hit_count（匹配次数）和dispatch_count（调度次数）但无recall_count', '技术侧缺少"召回次数"概念，无法计算引用率', '技术侧mcd_strategy_cause_pattern新增recall_count字段，每次召回时+1；dispatch_count映射为引用次数', '需协商后衔接'],
        ['命中率', 'Σ(匹配指标数/总关联指标数)/召回次数，关联指标匹配率口径', 'accuracy_rate，含义为"诊断条件验证通过率"，二元判断口径', '关键差异：①口径完全不同（产品侧是比例判断，技术侧是二元判断）；②技术侧基于诊断条件，产品侧已删除诊断条件', '技术侧accuracy_rate重新定义：从"诊断条件验证通过率"改为"关联指标匹配率"，计算口径与产品侧对齐', '需协商后衔接'],
        ['置信度', '命中率×0.60+引用率×0.25+来源权重×0.15', 'config_confidence，人工配置', '完全不同的概念，见2.1字段分析', '技术侧新增runtime_confidence字段，T+1自动计算', '需协商后衔接'],
    ]
)

doc.add_heading('2.2.1 命中率口径差异专项分析', level=3)
add_table(
    ['维度', '产品侧（V1.0最新）', '技术侧（原始）'],
    [
        ['公式', 'Σ(匹配指标数/总关联指标数)/召回次数', 'accuracy_rate = 验证通过次数/总验证次数'],
        ['匹配判断', '比例判断：每次召回算一个匹配比例（如2/3），所有召回求平均', '二元判断：每次要么完全匹配（1），要么不匹配（0）'],
        ['判断依据', '关联指标的变化区间（change_min/change_max）', '诊断条件（dimension_tags_json中的结构化条件）'],
        ['统计粒度', '逐指标匹配：3个指标匹配2个算2/3', '整体判断：所有诊断条件通过算1次，否则算0'],
        ['业务价值', '关联指标越多不天然导致命中率越低，有区分度', '关联指标越多命中率越低（因为要求全部满足），5指标根因命中率天然低于2指标根因'],
    ]
)
add_para('结论：产品侧的比例判断口径更合理，技术侧需要对accuracy_rate的计算逻辑进行重构。这是中等难度的改造——需要修改匹配引擎的判断逻辑，从"全匹配/不匹配"改为"逐指标匹配+比例计算"。')

doc.add_heading('2.3 关联指标', level=2)
add_table(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['承载方式', '根因详情页关联指标Tab，每个指标含change_min/change_max/异常方向/关联强度', 'mcd_strategy_cause_pattern表，含indicator_code/change_min/change_max/dimension_tags_json', '核心结构对齐（indicator_code+change_min+change_max），但产品侧新增了异常方向和关联强度字段', '技术侧pattern表新增anomaly_direction和relation_strength字段', '需协商后衔接'],
        ['变化区间', 'change_min+change_max+运算符(≥/>/</≤)+单位', 'change_min+change_max，数值型，无运算符和单位', '产品侧更精细（支持开闭区间），技术侧只支持闭区间', '技术侧新增min_operator/max_operator/unit字段，默认≥/≤/%', '需协商后衔接'],
        ['关联强度', '1-3级（弱/中/强），人工设定', '无对应字段', '技术侧缺失', '技术侧新增relation_strength字段（1/2/3），用于推荐排序参考', '需协商后衔接'],
    ]
)

doc.add_heading('2.4 关联客群', level=2)
add_table(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['承载方式', '根因详情页关联客群Tab，含客群ID/名称/规模/关联强度', 'mcd_strategy_info.customer_id，单字段关联', '产品侧支持多客群关联+关联强度，技术侧只支持单个客群ID', '技术侧新增root_cause_customer_relation表（root_cause_id, customer_id, strength）', '需协商后衔接'],
        ['关联强度', '1-3级', '无', '技术侧缺失', '同上，relation表增加strength字段', '需协商后衔接'],
    ]
)

doc.add_heading('2.5 使用记录', level=2)
add_table(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['根因使用记录', '调度单流水：调度单ID/名称/日期/状态（进行中/已完成）', '无对应功能', '技术侧缺失使用记录展示能力', 'dispatch-srv提供按root_cause_id查询关联调度单的接口', '需协商后衔接'],
    ]
)
add_para('设计说明：产品侧V1.0不展示匹配结果/匹配明细，因为单条调度单可能只涉及根因的部分关联指标，无法判断"全部/部分匹配"，硬标匹配结果会产生误导。匹配信息已在运行数据的命中率中体现。')

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════
# 三、策略库——全量对标与衔接评估
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('三、策略库——全量对标与衔接评估', level=1)

doc.add_heading('3.1 基础信息字段', level=2)
add_para('关键结论：技术侧的mcd_strategy_info只有5个业务字段（root_cause_id, strategy_id, customer_id, action_type, strategy_risk_level），严重不足以支撑策略知识库管理。产品侧需要的大部分字段在技术侧无对应。')
add_table(
    ['字段', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['策略ID', 'STR-XXXX，系统自动生成', 'strategy_id，UUID', '格式映射问题，与根因ID同理', '同根因ID处理方式', '可直接衔接'],
        ['策略名称', '1-100字符，必填，不可重复', '无对应字段', '技术侧缺少策略名称', '技术侧新增strategy_name字段', '需协商后衔接'],
        ['策略分类', '维系挽留/价值提升/流量经营/5G推广/宽带发展/其他', 'action_type：UPGRADE/DOWNGRADE/RETAIN/OTHER', '分类维度不同：产品侧按业务域分类，技术侧按动作类型分类', '技术侧新增strategy_category字段（与产品侧6类对齐），保留action_type作为执行动作标识', '需协商后衔接'],
        ['业务场景', '降档挽留/携转挽留/ARPU提升/流量升档/宽带渗透/5G迁移/其他', '无对应字段', '技术侧缺失', '技术侧新增business_scenario字段', '需协商后衔接'],
        ['策略描述', '可选，最多500字符', '无对应字段', '技术侧缺失', '技术侧新增strategy_description字段', '需协商后衔接'],
        ['来源', '专家经验/AI生成（2种）', '无对应字段（策略表的来源继承自关联根因）', '产品侧策略独立标注来源，技术侧策略来源依赖根因', '技术侧新增strategy_source_type字段，与根因来源类型独立', '需协商后衔接'],
        ['来源权重', '专家经验=1.0，AI生成=0.75', '无对应字段', '技术侧缺失', '同根因来源权重处理方式', '需协商后衔接'],
        ['置信度', '转化率×0.70+引用率×0.15+来源权重×0.15', '无对应字段', '技术侧缺失', '同根因置信度处理方式，新增runtime_confidence', '需协商后衔接'],
    ]
)

doc.add_heading('3.2 关联配置', level=2)
add_table(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['关联根因', '策略至少关联1个根因，含关联强度1-3级', 'mcd_strategy_info.root_cause_id，单字段关联', '产品侧支持多根因关联+强度，技术侧只支持单个根因ID', '技术侧新增strategy_root_cause_relation表（strategy_id, root_cause_id, strength）', '需协商后衔接'],
        ['关联指标', '策略可关联指标（含变化区间），用于推荐匹配', '通过root_cause_id间接关联指标，无直接策略-指标关联', '产品侧策略可独立关联指标（不依赖根因），技术侧无此能力', '技术侧新增strategy_indicator_relation表，或策略匹配时降级走根因指标', '需协商后衔接'],
        ['关联客群', '策略关联客群+关联强度', 'mcd_strategy_info.customer_id，单字段', '同根因关联客群问题', '同根因关联客群处理方式', '需协商后衔接'],
    ]
)

doc.add_heading('3.3 推荐产品/方案', level=2)
add_table(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['承载方式', '推荐产品Tab：产品ID/名称/类型/优先级/推荐理由', '无对应功能', '技术侧完全缺失推荐产品配置能力', '技术侧新增strategy_product表（strategy_id, product_id, product_type, priority, reason）', '需协商后衔接'],
        ['产品类型', '套餐/流量包/宽带/增值服务/终端/其他', '无', '技术侧缺失', '新增product_type枚举', '需协商后衔接'],
        ['推荐优先级', '1-10，1最高', '无', '技术侧缺失', '新增priority字段', '需协商后衔接'],
    ]
)

doc.add_heading('3.4 营销话术', level=2)
add_table(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['承载方式', '营销话术Tab：适用渠道/话术类型/内容/适用客群', '无对应功能', '技术侧完全缺失', '技术侧新增strategy_script表（strategy_id, channel, script_type, content, target_customer）', '需协商后衔接'],
        ['话术类型', '开场白/核心推荐/异议处理/促成/结束语', '无', '技术侧缺失', '新增script_type枚举', '需协商后衔接'],
        ['变量插入', '支持{客户姓名}/{产品名称}等变量', '无', '技术侧缺失', '话术内容存储时保留变量占位符，执行时由渠道引擎替换', '需协商后衔接'],
    ]
)

doc.add_heading('3.5 渠道适配', level=2)
add_table(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['承载方式', '渠道适配Tab（在营销话术Tab之前）：渠道类型/适用场景/优先级/是否启用', '无对应功能', '技术侧完全缺失', '技术侧新增strategy_channel表（strategy_id, channel_type, scenario, priority, enabled）', '需协商后衔接'],
        ['渠道类型', '外呼/短信/APP推送/微信/营业厅/其他', '无', '技术侧缺失', '新增channel_type枚举', '需协商后衔接'],
        ['与话术的关系', '渠道适配在前，话术依附于渠道', '无', '技术侧缺失', 'strategy_script表通过channel字段关联strategy_channel', '需协商后衔接'],
    ]
)
add_para('产品侧V1.0已删除"适用约束"Tab和"效果评估"Tab。适用约束与诊断条件同理——配了不校验，纯展示无系统行为；效果评估与运行数据Tab内容重复。这简化了与技术侧的对标复杂度。')

doc.add_heading('3.6 运行数据指标体系', level=2)
add_table(
    ['指标', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['引用率', '调度单引用次数/召回次数，近3个月', '无对应字段', '技术侧缺失', '同根因引用率处理方式', '需协商后衔接'],
        ['转化率(加权)', 'Σ(调度单转化率×触达成功客户数)/Σ(触达成功客户数)，仅统计已完成调度单', 'conversion_rate，但无"加权"口径定义，无触达/转化拆分', '产品侧定义了完整的加权口径和分子分母，技术侧只有一个笼统的conversion_rate', '技术侧新增reach_count和convert_count字段，按调度单粒度存储，聚合时按产品侧公式计算', '需协商后衔接'],
        ['置信度', '转化率×0.70+引用率×0.15+来源权重×0.15', '无对应字段', '技术侧缺失', '同根因置信度处理方式', '需协商后衔接'],
    ]
)

doc.add_heading('3.6.1 转化率口径差异专项分析', level=3)
add_table(
    ['维度', '产品侧', '技术侧', '差异'],
    [
        ['公式', 'Σ(调度单转化率×触达成功客户数)/Σ(触达成功客户数)', 'conversion_rate，无明确公式定义'],
        ['统计范围', '仅统计已完成的调度单', '未定义统计范围'],
        ['加权逻辑', '按触达成功客户数加权，触达越多客户数的调度单权重越大', '未定义加权逻辑'],
        ['口径标注', '转化率卡片标注"已执行完成调度单：N个（共M个引用，其中N个已完成）"', '无口径标注'],
        ['引用率vs转化率口径差异', '引用率统计所有调度单（含进行中），转化率仅统计已完成的', '未区分'],
    ]
)
add_para('结论：产品侧的转化率定义更精确。技术侧需要按调度单粒度存储触达和转化数据，聚合时按产品侧公式计算。')

doc.add_heading('3.7 使用记录', level=2)
add_table(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
        ['策略使用记录', '调度单流水+触达客户数+业务办理成功客户数+转化率', '无对应功能', '技术侧缺失', 'dispatch-srv提供按strategy_id查询关联调度单及执行数据的接口', '需协商后衔接'],
    ]
)
add_para('设计说明：策略使用记录的转化率是单条调度单粒度（业务办理成功客户数/触达客户数），与运行数据Tab的加权转化率口径一致——加权转化率就是这些单条转化率的加权平均。进行中的调度单触达/转化数据显示"-"。')

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════
# 四、关联关系——全量对标与衔接评估
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('四、关联关系——全量对标与衔接评估', level=1)

doc.add_heading('4.1 关系类型逐项对标', level=2)
add_table(
    ['关系类型', '产品侧设计', '技术侧定位', '差异分析', '调整建议', '衔接结论'],
    [
        ['指标→根因', '根因库关联指标配置，含变化区间+关联强度1-3级', 'mcd_strategy_cause_pattern表，含indicator_code+change_min+change_max', '核心结构对齐，产品侧新增关联强度字段', 'pattern表新增relation_strength字段', '需协商后衔接'],
        ['根因→策略', '策略库关联根因配置，含关联强度1-3级', 'mcd_strategy_info.root_cause_id，单字段', '产品侧支持多对多+强度，技术侧只支持单字段', '新增strategy_root_cause_relation表', '需协商后衔接'],
        ['根因→客群', '根因库关联客群配置，含关联强度', '无直接关联，通过feature_analysis结果间接关联', '产品侧是候选库配置，技术侧是运行态结果', '候选库增加关联配置，运行态结果作为推荐参考', '需协商后衔接'],
        ['策略→客群', '策略库关联客群配置，含关联强度', 'mcd_strategy_info.customer_id，单字段', '同根因→客群问题', '同根因→客群处理方式', '需协商后衔接'],
        ['指标→策略', '策略库关联指标配置', '无直接关联，通过root_cause_id间接关联', '产品侧支持指标→策略直连（AI推理路径3），技术侧无此能力', '技术侧策略匹配引擎增加降级路径：当根因匹配score<阈值时，按指标编码查通用策略', '需协商后衔接'],
        ['指标→指标', '指标底座配置，传导关系', '指标底座已有指标树结构', '基本对齐', '无需调整', '可直接衔接'],
    ]
)

doc.add_heading('4.2 关联强度——产品侧1-3级 vs 技术侧无', level=2)
add_para('产品侧在所有关联关系上设计了1-3级关联强度（弱/中/强），用于AI推荐排序参考。技术侧无此字段。')
add_para('分析：产品侧V1.0已从早期1-5级简化为1-3级，理由是1-5级缺乏客观评判标准，3级足够区分。这个设计是合理的——初期人工设定，后期可由AI根据运行数据自动调整。')
add_para('建议：技术侧在所有relation表中增加strength字段（1/2/3），默认值=2（中），支持人工修改。后期可由AI根据引用率和命中率/转化率自动调整。')

doc.add_heading('4.3 AI推理路径衔接', level=2)
add_table(
    ['产品侧路径', '技术侧链路', '衔接分析', '衔接结论'],
    [
        ['路径1：指标→根因→策略（主路径）', '指标异常→pattern匹配根因→strategy推荐策略', '核心链路完全对齐', '可直接衔接'],
        ['路径2：指标→根因→客群', '指标异常→pattern匹配根因→feature_analysis关联客群', '技术侧客群关联在运行态，不在候选库', '需协商后衔接'],
        ['路径3：指标→策略（降级路径）', '无直接链路，必须经过根因', '技术侧缺少降级路径', '需协商后衔接，策略匹配引擎增加降级判断逻辑'],
        ['路径4：根因→客群→策略', '根因确认→feature_analysis关联客群→strategy推荐', '技术侧客群→策略无直接链路', '需协商后衔接'],
    ]
)

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════
# 五、两层体系架构衔接评估
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('五、两层体系架构衔接评估', level=1)

doc.add_heading('5.1 产品侧 vs 技术侧的分层对比', level=2)
add_table(
    ['层级', '产品侧（V1.0）', '技术侧', '差异'],
    [
        ['候选库层', '根因/策略的CRUD管理+关联配置+运行数据展示', 'mcd_root_cause_info/mcd_strategy_info + pattern库', '产品侧已将运行数据从候选库字段中分离为独立展示区域（运行数据Tab），技术侧仍在候选库表中混存运行态字段'],
        ['运行态层', '运行数据Tab：引用率/命中率/转化率/置信度，T+1聚合展示', 'feature_analysis系列表 + portal-srv聚合', '产品侧明确了运行数据的展示层和计算口径，技术侧有数据生产但缺回写链路'],
        ['执行态层', '使用记录Tab：调度单流水+触达/转化数据', 'dispatch-srv执行数据', '产品侧明确了展示字段和口径，技术侧需提供查询接口'],
    ]
)

doc.add_heading('5.2 核心差异：产品侧的运行数据与候选库分离', level=2)
add_para('产品侧V1.0将运行数据从候选库字段中分离出来，作为详情页/编辑页的独立Tab展示。这与技术侧的设计有根本差异：')
add_bullet('技术侧：在mcd_strategy_cause_pattern中混存config_confidence（候选库配置）、hit_count/accuracy_rate（运行态数据）')
add_bullet('产品侧：候选库只存CRUD字段（名称/分类/描述/来源/关联配置），运行数据独立Tab展示、T+1聚合计算')
add_para('产品侧的设计更合理——候选库是"配置"，运行数据是"结果"，两者生命周期不同（配置随时可改，结果T+1更新），不应混存。')
add_para('衔接方案：技术侧保留候选库表中的运行态字段（hit_count等），但前端展示走portal-srv聚合查询，不直接读候选库表。候选库表中的运行态字段仅作为回写缓存，避免每次查询都要聚合。')

doc.add_heading('5.3 数据回写链路评估', level=2)
add_table(
    ['回写数据', '生产方', '消费方', '技术侧是否定义回写链路', '衔接结论'],
    [
        ['召回次数', '指标监测引擎', '引用率分母', '未定义。技术侧pattern库有hit_count但无recall_count', '需新增recall_count字段和回写逻辑'],
        ['调度单引用次数', 'dispatch-srv', '引用率分子', '未定义', '需新增dispatch_count字段和回写逻辑'],
        ['匹配指标数/总关联指标数', '指标底座', '命中率计算', '部分定义。accuracy_rate存在但口径不对', '需重构accuracy_rate计算逻辑'],
        ['触达成功客户数', '渠道执行系统', '转化率计算', '未定义。dispatch-srv有执行数据但未回写策略库', '需新增reach_count字段和回写逻辑'],
        ['业务办理成功客户数', '业务办理系统', '转化率计算', '未定义', '需新增convert_count字段和回写逻辑'],
        ['运行态置信度', 'portal-srv聚合', '推荐排序', '未定义。只有config_confidence（人工配置），无runtime_confidence', '需新增runtime_confidence字段和T+1聚合逻辑'],
    ]
)
add_para('核心问题：6项回写数据中，5项技术侧未定义回写链路。建议portal-srv新增定时回写任务，T+1聚合运行态数据回写strategy-srv候选库表。准实时查询走portal-srv直接查运行态表。')

doc.add_heading('5.4 候选库CRUD链路评估', level=2)
add_table(
    ['操作', '技术侧是否提供接口', '衔接结论'],
    [
        ['新增根因', '未提供。strategy-srv只有batchQueryRootCause查询接口', '需新增createRootCause接口'],
        ['编辑根因', '未提供', '需新增updateRootCause接口'],
        ['删除根因', '未提供', '需新增deleteRootCause接口（需校验无引用）'],
        ['新增策略', '未提供。strategy-srv只有batchQueryStrategy查询接口', '需新增createStrategy接口'],
        ['编辑策略', '未提供', '需新增updateStrategy接口'],
        ['删除策略', '未提供', '需新增deleteStrategy接口（需校验无引用）'],
        ['查询关联关系', '部分提供。通过root_cause_id查关联策略', '需扩展为完整的关联关系CRUD接口'],
    ]
)
add_para('核心问题：技术侧strategy-srv定位为"查询服务"，产品侧需要"管理服务"。建议一期portal-srv增加管理接口代理到strategy-srv，二期strategy-srv原生支持CRUD。')

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════
# 六、技术侧"独有设计"评估
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('六、技术侧"独有设计"评估——产品侧是否需要补充', level=1)
add_table(
    ['技术侧设计', '产品侧现状', '是否需要产品侧补充', '分析'],
    [
        ['action_type（策略动作类型：UPGRADE/DOWNGRADE/RETAIN/OTHER）', '产品侧无此字段', '是，但需重新定义', 'action_type描述的是策略的执行动作，与产品侧的"策略分类"不同。建议产品侧在策略基础信息中新增"执行动作"字段，与策略分类独立。执行动作在创建调度单时使用，决定工单模板'],
        ['strategy_risk_level（策略风险等级）', '产品侧无此字段', '否', '风险等级是执行态判断，不属于知识库配置。由调度单创建时根据策略内容自动评估'],
        ['dimension_tags_json（诊断条件标签）', '产品侧V1.0已删除诊断条件', '否', '产品侧已删除诊断条件，匹配走关联指标变化区间。dimension_tags_json可作为技术侧内部字段保留，但产品侧不展示不配置'],
        ['config_confidence（人工配置初始置信度）', '产品侧无此字段', '否', '产品侧置信度完全由运行态计算，不需要人工配置初始值。新增根因/策略时置信度=来源权重×权重系数（根因0.15/策略0.15），自然产生初始值'],
        ['match_score（运行态匹配分数）', '产品侧无此字段', '否，但需了解', 'match_score是推荐引擎内部使用的运行态分数，不需要在产品侧展示。但产品侧的置信度可参考match_score的计算逻辑'],
        ['feature_analysis_feedback（反馈表）', '产品侧无此概念', '需了解', '技术侧的反馈机制支撑运行态数据积累。产品侧不需要直接操作此表，但需确保回写链路正确'],
    ]
)

# ═══════════════════════════════════════════════════════════════════
# 七、产品侧"独有设计"评估
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('七、产品侧"独有设计"评估——技术侧是否需要支撑', level=1)
add_table(
    ['产品侧设计', '技术侧现状', '是否需要技术侧支撑', '分析'],
    [
        ['策略分类（6类）', '技术侧无对应字段', '是', '技术侧需新增strategy_category字段'],
        ['业务场景（7类）', '技术侧无对应字段', '是', '技术侧需新增business_scenario字段'],
        ['推荐产品/方案配置', '技术侧无对应功能', '是', '技术侧需新增strategy_product表'],
        ['渠道适配配置', '技术侧无对应功能', '是', '技术侧需新增strategy_channel表'],
        ['营销话术配置', '技术侧无对应功能', '是', '技术侧需新增strategy_script表'],
        ['关联强度（1-3级）', '技术侧无对应字段', '是', '技术侧所有relation表需新增strength字段'],
        ['异常方向字段', '技术侧无对应字段', '是', '技术侧pattern表需新增anomaly_direction字段'],
        ['变化区间运算符', '技术侧只支持闭区间', '是', '技术侧pattern表需新增min_operator/max_operator字段'],
        ['命中率（比例判断口径）', '技术侧accuracy_rate是二元判断', '是', '技术侧需重构accuracy_rate计算逻辑'],
        ['转化率（加权口径）', '技术侧conversion_rate无加权', '是', '技术侧需按调度单粒度存储触达/转化数据，聚合时按加权公式计算'],
        ['引用率', '技术侧无此指标', '是', '技术侧需新增recall_count和dispatch_count字段'],
        ['召回次数', '技术侧有hit_count但无recall_count', '是', '技术侧需新增recall_count字段，每次召回时+1'],
        ['调度单状态（进行中/已完成）', '技术侧dispatch-srv有调度单状态', '否', '已有，需提供查询接口'],
        ['使用记录Tab', '技术侧无此功能', '是', 'dispatch-srv提供按root_cause_id/strategy_id查询关联调度单的接口'],
    ]
)

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════
# 八、双方各自需要调整的完整清单
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('八、双方各自需要调整的完整清单', level=1)

doc.add_heading('8.1 产品侧调整项', level=2)
add_table(
    ['#', '调整项', '原因', '优先级'],
    [
        ['1', '新增策略"执行动作"字段', '技术侧action_type有业务价值（决定工单模板），产品侧应补充', 'P1'],
        ['2', '来源类型映射方案确认', '技术侧4种→产品侧2种的映射规则需双方确认', 'P0'],
        ['3', '来源权重值确认', '产品侧0.75/1.0 vs 技术侧0.7/0.8/0.9/1.0，需确认最终值', 'P0'],
        ['4', '命中率口径确认', '比例判断口径需技术侧评估改造可行性', 'P0'],
        ['5', '转化率加权口径确认', '加权公式需技术侧评估数据存储改造量', 'P0'],
    ]
)

doc.add_heading('8.2 技术侧调整项', level=2)
add_table(
    ['#', '调整项', '原因', '优先级'],
    [
        ['1', 'strategy-srv新增CRUD接口', '产品侧知识库管理页面需要增删改查能力', 'P0'],
        ['2', 'mcd_strategy_info表扩展', '新增strategy_name/strategy_category/business_scenario/strategy_description/strategy_source_type等字段', 'P0'],
        ['3', '新增strategy_product表', '支撑推荐产品/方案配置', 'P1'],
        ['4', '新增strategy_channel表', '支撑渠道适配配置', 'P1'],
        ['5', '新增strategy_script表', '支撑营销话术配置', 'P1'],
        ['6', '新增strategy_root_cause_relation表', '支撑策略-根因多对多关联+强度', 'P0'],
        ['7', '新增root_cause_customer_relation表', '支撑根因-客群多对多关联+强度', 'P1'],
        ['8', 'pattern表新增字段', '新增anomaly_direction/min_operator/max_operator/unit/relation_strength', 'P1'],
        ['9', '新增recall_count字段', 'pattern表新增，每次召回时+1', 'P0'],
        ['10', '新增dispatch_count字段', 'pattern表新增，调度单引用时+1', 'P0'],
        ['11', '重构accuracy_rate计算逻辑', '从二元判断改为比例判断，与产品侧命中率口径对齐', 'P1'],
        ['12', '新增runtime_confidence字段', 'T+1聚合计算，与config_confidence分离', 'P1'],
        ['13', '新增回写链路', 'portal-srv T+1聚合运行态数据回写strategy-srv', 'P0'],
        ['14', '策略匹配引擎增加降级路径', '当根因匹配score<阈值时，按指标编码查通用策略', 'P2'],
        ['15', 'dispatch-srv新增查询接口', '按root_cause_id/strategy_id查询关联调度单及执行数据', 'P1'],
        ['16', '新增source_category字段', '映射技术侧4种source_type到产品侧2种来源分类', 'P0'],
    ]
)

doc.add_heading('8.3 双方协商项', level=2)
add_table(
    ['#', '协商项', '产品侧诉求', '技术侧顾虑', '建议方案'],
    [
        ['1', '来源类型合并', '2种（专家经验/AI生成），简化运营认知', '4种source_type有溯源价值，不想丢失细粒度', '技术侧保留source_type用于溯源，新增source_category映射到产品侧2种，权重按source_category决定'],
        ['2', '命中率口径重构', '比例判断，关联指标越多不天然导致命中率越低', '需修改匹配引擎核心逻辑，改造量中等', '一期：accuracy_rate按比例判断重构。二期：匹配引擎支持逐指标匹配结果存储'],
        ['3', '转化率加权口径', '按触达客户数加权，更精确', '需按调度单粒度存储触达/转化数据，增加存储量', '调度单粒度存储是必要的（dispatch-srv已有执行数据），只是需回写到策略库'],
        ['4', 'strategy-srv定位', '产品侧需要完整CRUD管理服务', 'strategy-srv当前定位为查询服务，改造量大', '一期portal-srv代理CRUD接口，二期strategy-srv原生支持'],
        ['5', '运行态回写频率', 'T+1聚合回写', '回写逻辑需新增，portal-srv需增加定时任务', 'T+1回写+准实时查询双模式：回写走portal-srv定时任务，实时查询走portal-srv直接查运行态表'],
        ['6', '指标→策略降级路径', 'AI推理路径3需要指标→策略直连', '当前匹配引擎必须经过根因', '当根因匹配score<阈值时降级走指标编码查通用策略，不需要新增表，只需引擎增加降级判断'],
    ]
)

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════
# 九、衔接性总结
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('九、衔接性总结', level=1)

doc.add_heading('9.1 统计', level=2)
add_table(
    ['衔接结论', '数量', '占比'],
    [
        ['可直接衔接', '5', '14%'],
        ['需协商后衔接', '27', '77%'],
        ['无法衔接', '3', '9%'],
    ]
)

doc.add_heading('9.2 可直接衔接清单', level=2)
add_table(
    ['#', '项目', '承载方式'],
    [
        ['1', '根因ID（格式映射展示）', '技术侧UUID → 产品侧RC-XXXX格式化展示'],
        ['2', '根因描述', 'description字段直接映射'],
        ['3', '创建时间/更新时间', 'created_at/updated_at直接映射'],
        ['4', 'AI推理路径1（指标→根因→策略）', '技术侧核心链路已对齐'],
        ['5', '指标→指标传导关系', '指标底座已有'],
    ]
)

doc.add_heading('9.3 需协商后衔接清单', level=2)
add_para('协商难度低（技术侧只需加字段/接口扩展，无架构变更）：')
add_table(
    ['#', '项目', '需要技术侧做的'],
    [
        ['1', '根因名称唯一性约束', '增加name长度限制和唯一索引'],
        ['2', '根因分类枚举', '增加category枚举约束'],
        ['3', '策略基础字段扩展', '新增strategy_name/category/description等字段'],
        ['4', '策略-根因多对多关联', '新增strategy_root_cause_relation表'],
        ['5', '根因-客群多对多关联', '新增root_cause_customer_relation表'],
        ['6', '关联强度字段', '所有relation表新增strength字段'],
        ['7', '异常方向字段', 'pattern表新增anomaly_direction字段'],
        ['8', '变化区间运算符', 'pattern表新增min_operator/max_operator字段'],
        ['9', '推荐产品配置', '新增strategy_product表'],
        ['10', '渠道适配配置', '新增strategy_channel表'],
        ['11', '营销话术配置', '新增strategy_script表'],
        ['12', '召回次数统计', 'pattern表新增recall_count字段'],
        ['13', '引用次数统计', 'pattern表新增dispatch_count字段'],
        ['14', '策略来源独立标注', '新增strategy_source_type字段'],
        ['15', '来源类型映射', '新增source_category字段'],
    ]
)
add_para('协商难度中（需要定义新的接口或回写链路）：')
add_table(
    ['#', '项目', '需要做的'],
    [
        ['1', 'strategy-srv CRUD接口', '新增create/update/delete接口，一期portal-srv代理'],
        ['2', '运行态→候选库回写链路', 'portal-srv T+1定时回写任务'],
        ['3', '命中率口径重构', 'accuracy_rate从二元判断改为比例判断'],
        ['4', '转化率加权口径', '按调度单粒度存储触达/转化数据，聚合时按加权公式计算'],
        ['5', 'runtime_confidence', '新增字段，T+1聚合计算'],
        ['6', '使用记录查询接口', 'dispatch-srv新增按root_cause_id/strategy_id查询接口'],
    ]
)
add_para('协商难度高（涉及匹配引擎改造或新能力建设）：')
add_table(
    ['#', '项目', '需要做的'],
    [
        ['1', '指标→策略降级路径', '策略匹配引擎增加降级判断逻辑'],
        ['2', '根因→客群运行态关联', 'feature_analysis结果→候选库关联配置的映射机制'],
        ['3', '策略→客群运行态关联', '同上'],
    ]
)

doc.add_heading('9.4 无法衔接清单', level=2)
add_para('注：由于产品侧V1.0已删除诊断条件、适用约束、效果评估等概念，原报告中多项无法衔接项已消除。当前无法衔接项为：')
add_table(
    ['#', '项目', '无法衔接原因', '建议'],
    [
        ['1', 'config_confidence（人工配置初始置信度）', '产品侧置信度完全运行态计算，不需要人工配置初始值', '技术侧保留此字段但不要求产品侧展示，新增runtime_confidence对齐'],
        ['2', 'dimension_tags_json（诊断条件标签）', '产品侧已删除诊断条件，不配置不展示', '技术侧保留此字段作为内部使用，产品侧不消费'],
        ['3', 'strategy_risk_level（策略风险等级）', '产品侧认为风险等级是执行态判断，不属于知识库配置', '技术侧保留此字段，但不在知识库管理页面展示'],
    ]
)

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════
# 十、衔接性最大的3个断点
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('十、衔接性最大的3个断点', level=1)

doc.add_heading('断点1：strategy-srv缺少CRUD接口', level=2)
add_para('现状：技术侧文档中strategy-srv只有查询接口（batchQueryRootCause、batchQueryStrategy），没有增删改接口。')
add_para('影响：产品侧的根因库/策略库管理页面无法操作——无法新增、编辑、删除根因和策略。')
add_para('衔接方案：strategy-srv新增CRUD接口，或在portal-srv增加一层管理接口代理到strategy-srv。一期建议portal-srv代理（减少strategy-srv改造量），二期strategy-srv原生支持。')
add_table(
    ['接口', '方法', '参数', '说明'],
    [
        ['createRootCause', 'POST', 'name, category, description, source_type, indicators[], customers[]', '创建根因，返回root_cause_id'],
        ['updateRootCause', 'PUT', 'root_cause_id + 可修改字段', '编辑根因（ID和来源不可修改）'],
        ['deleteRootCause', 'DELETE', 'root_cause_id', '删除根因（需校验无引用）'],
        ['createStrategy', 'POST', 'name, category, scenario, description, source_type + 关联配置', '创建策略'],
        ['updateStrategy', 'PUT', 'strategy_id + 可修改字段', '编辑策略'],
        ['deleteStrategy', 'DELETE', 'strategy_id', '删除策略（需校验无引用）'],
    ]
)

doc.add_heading('断点2：运行态→候选库回写链路未定义', level=2)
add_para('现状：技术侧文档定义了运行态数据的生产（谁写入feature_analysis_*表），但没有定义"回写strategy-srv候选库"的完整链路。')
add_para('影响：产品侧候选库页面的运行数据（引用率、命中率、转化率、置信度）没有数据来源。')
add_para('衔接方案：portal-srv新增定时回写任务：')
add_bullet('从dispatch-srv聚合调度单引用次数 → 计算引用率 → 回写strategy-srv')
add_bullet('从指标底座聚合匹配指标数/总关联指标数 → 计算命中率 → 回写strategy-srv')
add_bullet('从dispatch-srv聚合触达/转化数据 → 计算加权转化率 → 回写strategy-srv')
add_bullet('根据上述指标计算runtime_confidence → 回写strategy-srv')
add_bullet('回写频率建议T+1（每日凌晨跑批），准实时查询走portal-srv直接查运行态表')

doc.add_heading('断点3：命中率口径需重构', level=2)
add_para('现状：技术侧accuracy_rate是二元判断口径（全匹配/不匹配），且基于诊断条件（产品侧已删除）。产品侧命中率是比例判断口径（匹配指标数/总关联指标数），基于关联指标变化区间。')
add_para('影响：如果不对齐，产品侧展示的命中率与技术侧计算的accuracy_rate含义不同，数据不一致。')
add_para('衔接方案：')
add_bullet('一期：accuracy_rate计算逻辑重构——从"诊断条件验证通过率"改为"关联指标匹配率"，计算口径与产品侧对齐')
add_bullet('二期：匹配引擎支持逐指标匹配结果存储，支撑使用记录等更细粒度的展示需求')
add_para('改造评估：中等难度。核心改动在匹配引擎的判断逻辑，从"全匹配/不匹配"改为"逐指标匹配+比例计算"。数据库层只需修改accuracy_rate的计算逻辑，不需要新增表。')

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════
# 十一、调整方分布与统计
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('十一、调整方分布与统计', level=1)

doc.add_heading('11.1 调整方分布', level=2)
add_table(
    ['调整方', '数量', '说明'],
    [
        ['产品侧调整', '5', '主要是新增字段和方案确认，调整量较小'],
        ['技术侧调整', '16', '主要是表结构扩展、接口新增、回写链路建设，调整量较大'],
        ['双方协商', '6', '来源类型/权重/口径等核心决策项'],
    ]
)
add_para('结论：技术侧调整量明显大于产品侧。这是因为技术侧原始设计面向查询和分析场景，产品侧需要的是完整的管理能力。双方调整量不对等是合理的——产品侧已通过删除冗余概念（诊断条件/适用约束/效果评估/验证状态等）大幅简化了设计，技术侧需要补齐管理能力。')

doc.add_heading('11.2 按优先级分布', level=2)
add_table(
    ['优先级', '产品侧', '技术侧', '合计'],
    [
        ['P0（必须一期完成）', '3', '6', '9'],
        ['P1（一期完成或二期初）', '2', '7', '9'],
        ['P2（二期）', '0', '3', '3'],
    ]
)

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════
# 十二、分期实施建议
# ═══════════════════════════════════════════════════════════════════
doc.add_heading('十二、分期实施建议', level=1)

doc.add_heading('12.1 一期：候选库CRUD + 基础字段 + 运行数据展示', level=2)
add_para('目标：打通候选库CRUD + 基础字段 + 查询展示，运行数据通过portal-srv直接查运行态表（不回写）。')
add_table(
    ['工作项', '负责方', '说明'],
    [
        ['strategy-srv CRUD接口', '技术侧', 'portal-srv代理模式，6个接口'],
        ['mcd_strategy_info表扩展', '技术侧', '新增基础字段'],
        ['来源类型映射方案', '双方协商', '新增source_category字段，确定映射规则和权重值'],
        ['策略-根因多对多关联表', '技术侧', 'strategy_root_cause_relation表'],
        ['召回次数/引用次数统计', '技术侧', 'pattern表新增recall_count/dispatch_count'],
        ['运行数据展示', '产品侧', '引用率/命中率/转化率/置信度在详情页展示，portal-srv实时查询运行态表'],
        ['使用记录展示', '产品侧', 'dispatch-srv提供查询接口'],
        ['策略"执行动作"字段', '产品侧', '新增action字段'],
    ]
)

doc.add_heading('12.2 二期：回写链路 + 匹配引擎升级 + 完整关联配置', level=2)
add_para('目标：打通运行态→候选库回写链路，匹配引擎升级，关联配置完整化。')
add_table(
    ['工作项', '负责方', '说明'],
    [
        ['运行态→候选库回写链路', '技术侧', 'portal-srv T+1定时回写任务'],
        ['runtime_confidence', '技术侧', 'T+1聚合计算，与config_confidence分离'],
        ['命中率口径重构', '技术侧', 'accuracy_rate从二元判断改为比例判断'],
        ['转化率加权口径', '技术侧', '按调度单粒度存储触达/转化数据'],
        ['推荐产品/渠道/话术配置表', '技术侧', 'strategy_product/channel/script三张表'],
        ['关联强度字段', '技术侧', '所有relation表新增strength字段'],
        ['变化区间运算符', '技术侧', 'pattern表新增min_operator/max_operator字段'],
        ['指标→策略降级路径', '技术侧', '策略匹配引擎增加降级判断逻辑'],
    ]
)

doc.add_heading('12.3 三期：策略闭环 + 高级能力', level=2)
add_para('目标：策略执行效果回流、A/B实验、高级策略闭环。')
add_table(
    ['工作项', '负责方', '说明'],
    [
        ['命中率/转化率预警', '产品侧', '低于阈值时自动预警'],
        ['根因/策略自动优化建议', '产品侧+技术侧', '基于运行数据给出阈值调整建议'],
        ['A/B测试', '技术侧', '策略效果A/B测试，支撑转化率基准值校准'],
        ['关联强度AI自动调整', '技术侧', '根据运行数据自动调整关联强度1-3级'],
    ]
)

# ─── 保存 ───
output = '/workspace/projects/docs/对标分析/产品侧vs技术侧全量对标分析与方案衔接评估报告.docx'
doc.save(output)

total_cells = 0
empty_cells = 0
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            total_cells += 1
            if not cell.text.strip():
                empty_cells += 1
print(f'生成完成: {output}')
print(f'表格: {len(doc.tables)}')
print(f'段落: {len(doc.paragraphs)}')
print(f'单元格: {total_cells}, 空单元格: {empty_cells}')
