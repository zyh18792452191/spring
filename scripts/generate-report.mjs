import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  TableLayoutType, VerticalAlign, PageBreak
} from 'docx';
import fs from 'fs';

// ============ 工具函数 ============

const FONT = 'Microsoft YaHei';
const FONT_ASCII = 'Calibri';

function t(text, opts = {}) {
  return new TextRun({
    text,
    font: { name: FONT, eastAsia: FONT, ascii: FONT_ASCII, hAnsi: FONT_ASCII },
    size: opts.size || 21,
    bold: opts.bold || false,
    color: opts.color || '000000',
    ...opts,
  });
}

function heading(text, level = 1) {
  const sizes = { 1: 32, 2: 28, 3: 24, 4: 22 };
  return new Paragraph({
    children: [t(text, { size: sizes[level] || 22, bold: true })],
    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4,
    spacing: { before: 240, after: 120 },
  });
}

function para(...runs) {
  return new Paragraph({
    children: runs,
    spacing: { after: 80 },
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [t(text)],
    bullet: { level },
    spacing: { after: 40 },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

const BORDER_STYLE = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: 'BBBBBB',
};
const BORDERS = {
  top: BORDER_STYLE,
  bottom: BORDER_STYLE,
  left: BORDER_STYLE,
  right: BORDER_STYLE,
};

function cell(content, opts = {}) {
  // 所有内容统一转为Paragraph，TableCell的children必须是Paragraph[]
  const text = String(content ?? '');
  return new TableCell({
    children: [
      new Paragraph({
        children: [t(text, { size: 18, bold: opts.bold, color: opts.color })],
        spacing: { after: 0 },
      }),
    ],
    borders: BORDERS,
    shading: opts.header ? { type: ShadingType.SOLID, color: '1F4E79', fill: '1F4E79' } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
  });
}

function headerCell(text, width) {
  return cell(text, { header: true, bold: true, width, color: 'FFFFFF' });
}

function makeTable(headers, rows, widths) {
  return new Table({
    rows: [
      new TableRow({
        children: headers.map((h, i) => headerCell(h, widths?.[i])),
        tableHeader: true,
      }),
      ...rows.map(row =>
        new TableRow({
          children: row.map((c, i) => cell(c, { width: widths?.[i] })),
        })
      ),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });
}

// ============ 文档内容 ============

const sections = [];

// ---------- 封面 ----------
sections.push(
  new Paragraph({ spacing: { before: 2000 } }),
  new Paragraph({
    children: [t('产品侧 vs 技术侧', { size: 44, bold: true, color: '1F4E79' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
  }),
  new Paragraph({
    children: [t('全量对标分析与方案衔接评估报告', { size: 44, bold: true, color: '1F4E79' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }),
  new Paragraph({
    children: [t('市场数智运营平台 · 根因库 / 策略库 / 关联关系', { size: 24, color: '666666' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
  }),
  new Paragraph({
    children: [t('2026年1月', { size: 22, color: '999999' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 2000 },
  }),
  pageBreak(),
);

// ---------- 第一章：分析框架 ----------
sections.push(
  heading('一、分析框架与方法论', 1),

  heading('1.1 分析立场', 2),
  para(t('本报告采取完全中立立场，既不偏袒产品侧，也不偏袒技术侧。判断标准是唯一的三把尺子：')),
  bullet('业务必要性：该字段/功能是否有明确的业务场景和下游消费方？'),
  bullet('技术可落地性：该设计是否能在现有微服务架构下实现？数据从哪来？谁写入？谁读取？'),
  bullet('行业实践参照：电信运营商AIOps/精准营销领域的通行做法是什么？'),

  heading('1.2 对标范围', 2),
  makeTable(
    ['维度', '产品侧来源', '技术侧来源'],
    [
      ['根因库', '列表页/编辑页/详情页代码', 'mcd_strategy_cause_info + mcd_strategy_cause_pattern + 运行态表'],
      ['策略库', '列表页/编辑页/详情页代码', 'mcd_strategy_info（仅5个业务字段）'],
      ['关联关系', '6类Tab+网络图+强度', '主链路（指标→根因→客群→策略）+ 2类弱关系'],
      ['两层体系', '候选库CRUD + 工单调度体系', 'strategy-srv配置库 + portal-srv运行态 + dispatch-srv执行态'],
      ['AI推理路径', '4条路径（含2条直连）', '1条主链路 + 降级规则'],
    ],
    [15, 35, 50],
  ),

  heading('1.3 衔接评估维度', 2),
  para(t('对每一个对标项，除差异分析外，还从以下4个维度评估衔接性：')),
  bullet('数据模型衔接：产品侧字段能否映射到技术侧的数据库表/字段？'),
  bullet('接口衔接：技术侧现有或规划的API能否支撑产品侧的CRUD操作和查询需求？'),
  bullet('流程衔接：产品侧设计的业务流程与技术侧的数据流转是否对齐？'),
  bullet('数据来源衔接：产品侧展示的数据，在技术侧有没有明确的写入者和写入时机？'),
  para(t('衔接结论分为3类：')),
  makeTable(
    ['衔接结论', '含义'],
    [
      ['可直接衔接', '现有技术方案已覆盖或仅需少量扩展即可覆盖'],
      ['需协商后衔接', '双方设计有差异但可以找到妥协方案'],
      ['无法衔接', '产品侧设计的技术实现依赖尚未规划的能力，或设计本身不合理需调整'],
    ],
    [20, 80],
  ),

  pageBreak(),
);

// ---------- 第二章：根因库对标 ----------
sections.push(
  heading('二、根因库——全量对标与衔接评估', 1),

  heading('2.1 基础信息字段', 2),
  makeTable(
    ['字段', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '根因名称',
        'name，人工输入',
        'mcd_strategy_cause_info无name字段，只有root_cause_id',
        '双方合理：产品侧管理专家根因需人工命名，技术侧运行态根因由算法生成描述',
        '候选库层面用人工命名，运行态保留root_cause_desc；技术侧增加name字段',
        '需协商'
      ],
      [
        '来源',
        'source：expert / ai_generated（2种）',
        'root_cause_source：MODEL / AGENT / STRATEGY / MANUAL（4种）',
        '产品侧偏简：只区分"专家经验"和"AI生成"，但技术侧4种来源各有不同权重（STRATEGY权重1.0，AGENT权重0.75）',
        '产品侧调整：来源枚举对齐技术侧4种',
        '需协商'
      ],
      [
        '一级分类',
        'category1：6类',
        '无',
        '技术侧缺失：分类是知识库管理的基础维度',
        '技术侧调整：mcd_strategy_cause_info增加category_code字段',
        '需协商'
      ],
      [
        '二级分类',
        'category2：每类3个子类',
        '无',
        '同上，二级分类是知识细分的必要维度',
        '技术侧调整：增加sub_category_code字段',
        '需协商'
      ],
      [
        '业务场景',
        'businessScenarios：多选（7场景）',
        'business_scene_code：单值',
        '双方各有道理：产品侧理由是一个根因可能影响多个场景；技术侧理由是匹配召回时一个根因只属于一个核心场景',
        '双方协商：改为"主场景+副场景"，business_scene_code单值用于匹配，增加secondary_scene_codes_json多值用于筛选展示',
        '需协商'
      ],
      [
        '描述',
        'description：人工填写',
        'root_cause_desc：算法/人工均可',
        '一致，无冲突',
        '无需调整',
        '可直接衔接'
      ],
      [
        '状态',
        'status：草稿/启用/停用',
        'mcd_strategy_cause_pattern.status：启停；cause_info无status',
        '候选库需要状态管理，但技术侧主表缺status字段',
        '技术侧调整：mcd_strategy_cause_info增加status字段',
        '需协商'
      ],
    ],
    [10, 15, 18, 22, 22, 10],
  ),

  heading('2.2 运行数据字段', 2),
  makeTable(
    ['字段', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '置信度',
        '定义为"验证通过次数/验证总次数"',
        '两个维度：confidence_score（配置/运行时）+ accuracy_rate（模式准确率）',
        '产品侧定义有误：置信度≠通过率。技术侧更准确——confidence_score是可信程度，accuracy_rate才是正确比例',
        '产品侧调整：对齐技术侧口径。候选库展示配置置信度，运行态展示运行时置信度',
        '可直接衔接（口径需对齐）'
      ],
      [
        '验证状态',
        '无独立字段，通过置信度是否为null判断',
        'feedback_status：PENDING/ACCEPTED/REJECTED/MODIFIED（单次粒度）',
        '产品侧设计不足："是否验证"不能简单用null判断。采纳3次、拒绝1次、修正2次的信息丢失',
        '双方协商：增加"反馈摘要"（近3个月采纳/拒绝/修正次数），portal-srv从feedback聚合',
        '需协商'
      ],
      [
        '使用频次',
        'usageCount（列表页展示）',
        'hit_count + accuracy_rate',
        '产品侧口径模糊：usageCount未定义"一次使用"是什么',
        '双方协商：对齐hit_count（模式被召回次数）+ accuracy_rate（召回后采纳比例）',
        '需协商'
      ],
    ],
    [10, 15, 18, 22, 22, 10],
  ),

  heading('2.3 诊断条件', 2),
  makeTable(
    ['诊断条件项', '产品侧设计', '技术侧承载', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '客户属性条件',
        'category=客户属性，维度+运算符+值',
        'dimension_tags_json（扁平标签JSON）',
        '产品侧更结构化但有问题：（1）与策略"适用约束-客户约束"结构完全相同，属于重复设计；（2）匹配引擎无CDP实时标签查询能力；（3）扁平JSON无法承载运算符',
        '产品侧调整：去掉诊断条件中的客户属性类，合并到策略"适用约束-客户约束"中；技术侧dimension_tags_json扩展为结构化格式',
        '无法衔接（匹配引擎无实时标签查询能力）'
      ],
      [
        '业务维度条件',
        'category=业务维度，维度+运算符+值',
        '无对应',
        '产品侧概念不清：与关联指标+阈值在语义上重叠——当指标按渠道/区域拆解时，业务维度条件本质上是指标的维度下钻',
        '产品侧调整：不作为诊断条件独立维护，通过关联指标的维度下钻配置实现',
        '无法衔接（技术侧无此概念且与指标重叠）'
      ],
      [
        '市场事件条件',
        'category=市场事件，条件+存在/不存在',
        '无对应',
        '产品侧设计无法落地：无市场事件数据源，无人维护，配置了也无法自动匹配。但业务上确实有需求',
        '双方协商：保留为标注性字段（类型+说明文案），不参与自动化匹配。技术侧mcd_strategy_cause_pattern增加note_json',
        '无法衔接（无数据源），降为标注性字段后需协商'
      ],
      [
        '逻辑关系(AND/OR)',
        'logicRelation：AND/OR',
        'diagnosis_questions_json（未定义schema）',
        '产品侧合理但技术侧无结构化支撑',
        '技术侧调整：定义结构化JSON schema，一期仅支持AND',
        '需协商'
      ],
      [
        '变化区间',
        'lowerOperator+lowerValue / upperOperator+upperValue',
        'change_min / change_max',
        '产品侧更精确（支持运算符+单位），技术侧更简单（数值区间）',
        '双方协商：一期用技术侧数值区间，产品侧前端做"运算符→区间"转换展示',
        '可直接衔接'
      ],
    ],
    [10, 14, 14, 22, 22, 12],
  ),

  heading('2.4 关联指标', 2),
  makeTable(
    ['维度', '产品侧设计', '技术侧承载', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '关联指标列表',
        '多个指标，每个含indicatorId/Name',
        'indicator_code（单指标）',
        '产品侧更合理：一个根因通常关联多个指标。技术侧单指标不足',
        '技术侧调整：增加indicator_codes_json或关联表',
        '需协商'
      ],
      [
        '方向',
        'direction：up/down',
        'anomaly_direction：UP/DOWN',
        '一致',
        '无需调整',
        '可直接衔接'
      ],
      [
        '关联强度',
        'strength：1-5人工打分',
        '无',
        '双方都有问题：产品侧人工打分无客观依据且无下游消费；技术侧完全没有强度字段',
        '产品侧调整：去掉人工strength，运行态用技术侧match_score',
        '无法衔接（人工强度建议去掉）'
      ],
    ],
    [10, 14, 14, 22, 22, 12],
  ),

  heading('2.5 关联客群', 2),
  makeTable(
    ['维度', '产品侧设计', '技术侧承载', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '关联客群列表',
        '多个客群，含groupId/Name',
        'segment_codes_json（编码列表）',
        '产品侧更丰富（有名称），技术侧只有编码',
        '技术侧调整：编码列表保留，名称从customer_segment_info关联查询',
        '需协商'
      ],
      [
        '客群规模',
        'groupScale：人工录入',
        '运行态从hit_customer_count获取',
        '产品侧有问题：人工录入的客群规模是静态快照，会过期',
        '产品侧调整：不作为候选库字段，展示时实时查询',
        '需协商'
      ],
      [
        '关联强度',
        'strength：1-5',
        '无',
        '同关联指标强度分析',
        '产品侧调整：去掉人工strength',
        '无法衔接'
      ],
    ],
    [10, 14, 14, 22, 22, 12],
  ),

  pageBreak(),
);

// ---------- 第三章：策略库对标 ----------
sections.push(
  heading('三、策略库——全量对标与衔接评估', 1),

  heading('3.1 基础信息字段', 2),
  makeTable(
    ['字段', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '策略名称',
        'name，人工输入',
        '无字段（接口响应有strategyTitle但未落库）',
        '技术侧缺失：知识库管理最基础的字段',
        '技术侧调整：mcd_strategy_info增加strategy_name字段',
        '需协商'
      ],
      [
        '来源',
        'source：expert / ai_generated',
        'strategy_source：AGENT / STRATEGY / MANUAL',
        '同根因来源分析，需要对齐',
        '产品侧调整：对齐技术侧3种来源',
        '需协商'
      ],
      [
        '分类',
        'category1 + category2（6类×3子类）',
        '无',
        '技术侧缺失',
        '技术侧调整：增加category_code + sub_category_code',
        '需协商'
      ],
      [
        '业务场景',
        'businessScenarios：多选',
        'scene_id（单值）',
        '同根因业务场景分析',
        '双方协商：同根因方案，主场景+副场景',
        '需协商'
      ],
      [
        '描述',
        'description',
        '无字段（接口响应有strategyDesc但未落库）',
        '技术侧缺失',
        '技术侧调整：增加strategy_desc字段',
        '需协商'
      ],
      [
        '状态',
        'status：草稿/启用/停用',
        '无',
        '技术侧缺失',
        '技术侧调整：增加status字段',
        '需协商'
      ],
      [
        '动作类型',
        '无',
        'action_type（一期建议增加）',
        '产品侧缺失：动作类型是策略分类的重要维度（升迁/挽留/提醒/推荐等）',
        '产品侧调整：增加actionType字段',
        '可直接衔接（技术侧已有规划）'
      ],
      [
        '风险等级',
        '无',
        'strategy_risk_level（一期建议增加）',
        '产品侧缺失：策略有风险等级区分，调度时需校验',
        '产品侧调整：增加riskLevel字段：低/中/高',
        '可直接衔接（技术侧已有规划）'
      ],
    ],
    [10, 13, 16, 22, 22, 12],
  ),
  para(t('关键结论：技术侧的mcd_strategy_info只有5个业务字段（root_cause_id, strategy_id, customer_id, action_type, strategy_risk_level），严重不足以支撑策略知识库管理。产品侧缺少action_type和risk_level。双方都需要调整。', { bold: true })),

  heading('3.2 关联配置', 2),
  makeTable(
    ['字段', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '关联根因',
        'relatedRootCauses：多个+强度',
        'root_cause_id：单根因',
        '双方都有问题：产品侧多根因合理但人工强度不合理；技术侧单根因限制策略复用',
        '双方协商：技术侧支持多根因关联；去掉人工强度，运行态用match_score',
        '需协商'
      ],
      [
        '关联指标',
        'relatedIndicators：指标+阈值+强度',
        '无直接字段，通过根因间接关联',
        '产品侧需论证：策略直连指标是否必要？技术侧主链路是"策略→根因→指标"',
        '双方协商：作为降级路径——无匹配根因时按指标直接推荐策略',
        '需协商'
      ],
      [
        '关联客群',
        'relatedGroups：客群+规模+强度',
        'customer_id（单客群编码）',
        '双方都有问题：产品侧多客群合理但人工强度不合理；技术侧单客群限制复用',
        '双方协商：技术侧支持多客群关联；去掉人工强度；规模实时获取',
        '需协商'
      ],
    ],
    [10, 14, 14, 22, 22, 12],
  ),

  heading('3.3 推荐产品·方案', 2),
  makeTable(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '产品列表',
        'products：编码+名称+描述',
        '无',
        '产品侧越界但业务有需求：产品主数据不应在策略库重复维护，但策略推荐时需知道"推荐什么产品"',
        '双方协商：策略库只引用产品编码（product_codes_json），名称和描述从产商品中心/CRM实时查询',
        '需协商'
      ],
      [
        '产品描述',
        'productDescription：人工填写',
        '无',
        '产品侧越界：产品描述是产商品中心的职责',
        '产品侧调整：去掉产品描述字段，从产商品中心API获取',
        '无法衔接（不应策略库维护）'
      ],
    ],
    [10, 14, 14, 22, 22, 12],
  ),

  heading('3.4 营销话术', 2),
  makeTable(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '话术列表',
        'scripts：name + channel + content',
        '无',
        '产品侧越界但业务有需求：话术管理不属于策略库，但运营人员确实需要参考话术方向',
        '双方协商：一期暂存策略库（过渡方案），二期迁到话术管理平台。策略库只标注"适用渠道类型"',
        '需协商'
      ],
    ],
    [10, 14, 14, 22, 22, 12],
  ),

  heading('3.5 渠道适配', 2),
  makeTable(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '渠道+优先级+时段',
        'channels：channel+priority+timeSlot',
        '无',
        '产品侧部分合理：策略需标注适用渠道，但优先级和时段是运行时决策——渠道负载、座席空闲率都是动态的',
        '双方协商：候选库只存"适用渠道列表"（applicable_channels_json），无优先级无时段。优先级和时段由调度引擎根据运行时状态动态决定',
        '需协商'
      ],
    ],
    [10, 14, 14, 22, 22, 12],
  ),

  heading('3.6 适用约束', 2),
  makeTable(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '时效约束',
        'startDate + endDate',
        '无',
        '产品侧合理：策略有自然生命周期（如"开学季专属策略"只在8-9月有效）',
        '技术侧调整：mcd_strategy_info增加effective_start_date + effective_end_date',
        '需协商'
      ],
      [
        '客户约束',
        'dimension + operator + value',
        'customer_constraint_json（技术侧一期建议字段）',
        '双方都有设计但定位不同，且与诊断条件中的"客户属性"结构相同',
        '双方协商：统一在策略"适用约束"中维护，根因诊断条件不再维护客户属性类条件',
        '可直接衔接（技术侧已有规划）'
      ],
    ],
    [10, 14, 14, 22, 22, 12],
  ),

  heading('3.7 效果评估', 2),
  makeTable(
    ['维度', '产品侧设计', '技术侧现状', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '统计周期',
        'statisticsPeriod：人工配置（默认3个月）',
        '无',
        '产品侧不合理：统计周期不应人工配置，应根据数据量自适应',
        '产品侧调整：去掉配置项，改为查询参数（默认查最近3个月，可切换）',
        '无法衔接（不应配置化）'
      ],
      [
        '最小样本量',
        'minSampleSize：人工配置（默认10）',
        '无',
        '产品侧不合理：样本量阈值应根据业务量动态调整，不应写死',
        '产品侧调整：去掉配置项。样本不足时直接展示"数据不足"标识',
        '无法衔接（不应配置化）'
      ],
      [
        '实际转化率',
        'actualConversion：加权平均转化率',
        'history_score（策略评分，一期默认0.5）',
        '双方定义不一致：产品侧是具体转化率，技术侧是综合评分。两者不是同一个东西',
        '双方协商：候选库增加weighted_conversion_rate（从dispatch-srv聚合回写）；history_score用于匹配评分，各司其职',
        '需协商'
      ],
    ],
    [10, 14, 14, 22, 22, 12],
  ),

  pageBreak(),
);

// ---------- 第四章：关联关系对标 ----------
sections.push(
  heading('四、关联关系——全量对标与衔接评估', 1),

  heading('4.1 关系类型逐项对标', 2),
  makeTable(
    ['关系类型', '产品侧设计', '技术侧定位', '差异分析', '调整建议', '衔接结论'],
    [
      [
        '根因↔指标',
        '多对多+关联强度',
        'mcd_strategy_cause_pattern.indicator_code（1:N无强度）',
        '产品侧多对多合理（一个根因影响多指标），但人工强度不合理',
        '产品侧调整：去掉强度；技术侧调整：支持多指标关联',
        '需协商'
      ],
      [
        '根因↔策略',
        '多对多+关联强度',
        'mcd_strategy_info.root_cause_id（1:N无强度）',
        '产品侧多对多合理，人工强度不合理',
        '产品侧调整：去掉强度；技术侧已支持1:N',
        '可直接衔接'
      ],
      [
        '根因↔客群',
        '多对多+关联强度',
        'mcd_strategy_cause_pattern.segment_codes_json',
        '产品侧多对多合理，人工强度不合理',
        '产品侧调整：去掉强度；技术侧JSON可承载',
        '需协商'
      ],
      [
        '策略↔指标',
        '多对多+关联强度+阈值',
        '弱关系（通过根因中转）',
        '产品侧越界：策略不应直接关联指标。指标→根因→策略才是标准链路',
        '产品侧调整：仅作为降级路径（无根因匹配时使用），不作为主要关系维护',
        '需协商'
      ],
      [
        '策略↔客群',
        '多对多+关联强度',
        '弱关系（mcd_strategy_info.customer_id）',
        '产品侧多对多合理，人工强度不合理',
        '产品侧调整：去掉强度；技术侧调整：1:N',
        '需协商'
      ],
      [
        '指标↔客群',
        '多对多+关联强度+阈值',
        '弱关系（customer_segment_indicator_rel）',
        '技术侧已有表承载，且是"候选客群召回"用途',
        '双方协商：候选库层面仅展示（从已有表读取），不需要独立维护',
        '可直接衔接'
      ],
    ],
    [10, 14, 16, 22, 22, 12],
  ),

  heading('4.2 关联强度——产品侧设计的核心问题', 2),
  para(t('产品侧在所有关联关系上都设计了strength（1-5），这是产品侧最大的设计缺陷之一：')),
  makeTable(
    ['问题', '具体表现'],
    [
      ['人工填写', '谁来填？填1还是5？标准是什么？没有客观依据'],
      ['无下游消费', '填完之后系统怎么用？匹配时不参考此值，排序也不参考此值'],
      ['与运行态冲突', '技术侧的match_score（动态计算）才是真正有意义的关联强度'],
      ['与已去掉字段同类', '"策略标签""目标转化率"已被去掉，原因相同——人工填写、无客观依据、无下游消费'],
    ],
    [20, 80],
  ),
  para(t('建议：产品侧调整，候选库层面全面去掉人工strength字段。运行态用技术侧的match_score替代。', { bold: true })),

  heading('4.3 直连路径——产品侧需要降级处理', 2),
  para(t('产品侧设计了4条AI推理路径，其中路径3（指标→策略直连）和路径4（客群→策略直连）绕过了根因。')),
  makeTable(
    ['立场', '论点'],
    [
      ['产品侧合理性', '现实中确实存在"来不及深究根因，先按经验给策略"的场景'],
      ['技术侧合理性', '根因分析是AIOps的核心价值，绕过根因等于放弃因果推理'],
      ['行业实践', '中国移动AIOps因果推理平台、电信智慧运营平台都是"先归因、后推荐"链路，但都设计了降级机制'],
    ],
    [15, 85],
  ),
  para(t('建议：双方协商。正常路径：指标→根因→客群→策略（主链路）；降级路径：当根因匹配的match_score < 阈值时，按指标编码查"通用策略"。技术侧不需要新增字段，只需在策略匹配引擎中增加降级判断逻辑。', { bold: true })),

  pageBreak(),
);

// ---------- 第五章：两层体系衔接 ----------
sections.push(
  heading('五、两层体系架构衔接评估', 1),

  heading('5.1 产品侧 vs 技术侧的分层对比', 2),
  makeTable(
    ['层级', '产品侧', '技术侧', '差异'],
    [
      ['候选库层', '知识模板CRUD', 'mcd_strategy_cause_info + mcd_strategy_cause_pattern + mcd_strategy_info', '对齐'],
      ['运行态层', '未独立设计（运行数据混在候选库页面）', 'feature_analysis_results* + feature_analysis_root_cause_detail', '产品侧缺失此层'],
      ['执行态层', '调度工单体系', 'dispatch-srv + 工单表', '对齐'],
    ],
    [15, 30, 35, 20],
  ),

  heading('5.2 核心差异：产品侧缺了"运行态层"', 2),
  para(t('产品侧的"两层"之间缺少技术侧的"运行态层"，导致：')),
  bullet('候选库直接展示运行态数据（置信度/验证状态/命中率），但口径混乱'),
  bullet('运行态的分析结果（agent/model根因、客群推荐、策略匹配分）没有在候选库中体现'),
  para(t('建议：产品侧也需要理解三层架构：')),
  bullet('候选库页面：只展示策略库CRUD字段（名称/分类/场景/描述/状态/关联配置/有效期）'),
  bullet('运行态数据面板：在根因/策略详情页中增加"运行数据"Tab，展示从portal-srv查询的运行态聚合数据'),
  bullet('回写机制：技术侧必须实现——portal-srv定期从feature_analysis_feedback聚合，回写strategy-srv的候选库字段'),

  heading('5.3 数据回写链路评估', 2),
  makeTable(
    ['回写数据', '生产方', '消费方', '技术侧是否定义回写链路', '衔接结论'],
    [
      ['置信度（配置）', 'strategy-srv写入', '根因详情页', '已有', '可直接衔接'],
      ['置信度（运行时）', 'portal-srv计算', '根因详情页运行数据Tab', '定义了计算逻辑，未定义回写', '需协商'],
      ['命中次数', 'pattern匹配时写入', '根因列表/详情', 'hit_count已存在', '需协商（接口需补充返回）'],
      ['准确率', '反馈聚合后写入', '根因详情页', '定义了feedback表，未定义聚合回写', '需协商'],
      ['反馈摘要', 'feature_analysis_feedback聚合', '根因详情页', '未定义回写', '需协商'],
      ['加权转化率', 'dispatch-srv执行数据聚合', '策略效果评估', '未定义回写', '需协商'],
    ],
    [15, 18, 18, 22, 18],
  ),
  para(t('核心问题：技术侧的文档设计了数据的生产（谁写入feature_analysis_*表），但没有完整定义"回写strategy-srv候选库"的链路。只有2条回写是自然的（strategy-srv自己写入的配置置信度、pattern匹配时写入的hit_count），其余4条都需要新增回写逻辑。', { bold: true })),

  heading('5.4 候选库CRUD链路评估', 2),
  makeTable(
    ['操作', '技术侧是否提供接口', '衔接结论'],
    [
      ['根因新增', 'batchQueryRootCause是查询接口，CRUD接口未定义', '需协商：strategy-srv需新增CRUD接口'],
      ['根因编辑', '同上', '需协商'],
      ['根因删除/启停', '同上', '需协商'],
      ['策略新增', 'updateStrategy已存在但不确定是否满足全量CRUD', '需协商：确认接口覆盖范围'],
      ['策略编辑', '同上', '需协商'],
      ['策略删除/启停', '同上', '需协商'],
      ['关联关系维护', '无接口', '需协商：新增关联维护接口'],
    ],
    [20, 45, 35],
  ),
  para(t('核心问题：技术侧当前对strategy-srv的定位是"查询服务"（给portal-srv在分析时调用），不是"管理服务"（给产品侧前端做CRUD）。这个定位差异需要明确——strategy-srv是只提供查询接口，还是要扩展为完整的CRUD服务？', { bold: true })),

  pageBreak(),
);

// ---------- 第六章：AI推理路径衔接 ----------
sections.push(
  heading('六、AI推理路径衔接评估', 1),
  makeTable(
    ['产品侧路径', '技术侧链路', '衔接分析', '衔接结论'],
    [
      ['路径1：指标→根因→客群→策略', '技术侧主链路完全覆盖', '一致', '可直接衔接'],
      ['路径2：根因→客群→策略', '技术侧主链路的子集', '一致', '可直接衔接'],
      ['路径3：指标→策略（直连）', '技术侧定义为弱关系，匹配引擎未实现', '产品侧合理但技术侧无支撑，建议作为降级路径', '需协商'],
      ['路径4：客群→策略（直连）', '技术侧客群→策略通过root_cause_key串联', '当客群无关联根因时如何推荐策略？需定义降级逻辑', '需协商'],
    ],
    [22, 22, 30, 15],
  ),

  pageBreak(),
);

// ---------- 第七章：技术侧独有设计评估 ----------
sections.push(
  heading('七、技术侧"独有设计"评估——产品侧是否需要补充', 1),
  makeTable(
    ['技术侧设计', '产品侧现状', '是否需要产品侧补充', '分析'],
    [
      ['root_cause_key（运行态稳定键）', '无', '需要理解但不需要页面展示', '这是技术侧运行态的串联键，产品侧候选库用root_cause_id即可。融合时技术侧负责root_cause_key→root_cause_id的映射'],
      ['problem_score评分公式', '无', '需要在运行数据Tab展示', '产品侧根因详情页的"运行数据"Tab应展示problem_score及其4个分项（异常强度×0.30+贡献度×0.35+业务权重×0.20+可信度×0.15）'],
      ['根因融合规则（来源优先级MANUAL>STRATEGY>MODEL>AGENT）', '无', '不需要页面配置', '融合规则是算法逻辑，不需要运营人员配置'],
      ['assertion_level（断言强度DESCRIPTIVE/ASSOCIATIVE/INFERENTIAL）', '无', '需要展示', '帮助运营人员理解根因的可靠程度'],
      ['客群3种圈选方法（配置规则/特征画像/决策树规则发现）', '无', '二阶段需要', '一期方法A+B，二期方法C（决策树规则发现）'],
      ['策略评分match_score', '无', '需要在策略推荐时展示', '替代人工关联强度'],
      ['feature_analysis_feedback', '无', '需要反馈操作UI', '根因/客群/策略的采纳/拒绝/修正操作'],
    ],
    [22, 12, 18, 48],
  ),

  pageBreak(),
);

// ---------- 第八章：产品侧独有设计评估 ----------
sections.push(
  heading('八、产品侧"独有设计"评估——技术侧是否需要支撑', 1),
  makeTable(
    ['产品侧设计', '技术侧现状', '是否需要技术侧支撑', '分析'],
    [
      ['分类管理（6+18二级分类）', '无', '需要：strategy-srv增加分类字段', '无分类无法管理知识库'],
      ['诊断条件结构化配置', 'dimension_tags_json（扁平）', '需要：扩展为结构化JSON', '扁平标签无法表达运算符'],
      ['适用约束-时效约束', '无', '需要：增加有效期字段', '策略有生命周期'],
      ['适用约束-客户约束', 'customer_constraint_json（一期建议）', '需要：按技术侧方案实现', '已对齐'],
      ['运行数据展示（置信度/命中数/准确率）', '有数据但无回写', '需要：回写机制', '候选库需要展示运行态数据'],
      ['效果评估-加权转化率', 'history_score（不同概念）', '需要：增加字段', '匹配评分和展示转化率各司其职'],
      ['推荐产品引用', '无', '需要：增加product_codes_json字段+CRM查询接口', '策略库引用产品编码，详情查CRM'],
      ['适用渠道列表', '无', '需要：增加applicable_channels_json字段', '策略需标注适用渠道'],
      ['营销话术（一期过渡）', '无', '需要：增加scripts_json临时字段', '一期过渡方案'],
    ],
    [20, 18, 20, 42],
  ),

  pageBreak(),
);

// ---------- 第九章：双方调整清单 ----------
sections.push(
  heading('九、双方各自需要调整的完整清单', 1),

  heading('9.1 产品侧调整项', 2),
  makeTable(
    ['#', '调整项', '原因', '优先级'],
    [
      ['P-A1', '来源枚举对齐技术侧4种（MODEL/AGENT/STRATEGY/MANUAL）', '各有不同权重，不能简单二分', 'P0'],
      ['P-A2', '去掉所有关联关系上的人工strength', '人工填写无客观依据无下游消费，运行态match_score替代', 'P0'],
      ['P-A3', '业务场景改为"主场景+副场景"', '兼顾匹配精度（单值）和业务灵活性（多值）', 'P0'],
      ['P-A4', '置信度定义对齐技术侧', '不自创"验证通过率"定义，用技术侧的评分公式', 'P0'],
      ['P-A5', '增加策略actionType和riskLevel字段', '技术侧有但产品侧缺失，是策略分类和调度校验的必要维度', 'P1'],
      ['P-A6', '诊断条件精简：去掉客户属性类（与约束重复）、去掉业务维度类（与指标重复）、市场事件降为标注', '消除重复设计，无法自动匹配的字段降级', 'P1'],
      ['P-A7', '推荐产品改为"引用产品编码+实时查询详情"', '产品主数据不属于策略库职责', 'P1'],
      ['P-A8', '营销话术如一期无话术管理平台则暂存，否则改为"适用渠道类型"标注', '话术管理不是策略库核心职责', 'P2'],
      ['P-A9', '渠道适配去掉优先级和时段，只保留"适用渠道列表"', '优先级和时段是运行时决策', 'P1'],
      ['P-A10', '效果评估去掉配置项（统计周期/最小样本量），只展示运行态统计值', '配置项是"人定参数"，不够客观', 'P2'],
      ['P-A11', '策略↔指标直连改为降级路径', '不应作为主要关系，应作为根因匹配不足时的回退', 'P1'],
      ['P-A12', '客群规模改为实时获取', '候选库静态快照会过期', 'P2'],
    ],
    [6, 34, 40, 10],
  ),

  heading('9.2 技术侧调整项', 2),
  makeTable(
    ['#', '调整项', '原因', '优先级'],
    [
      ['T-A1', 'mcd_strategy_cause_info增加category_code + sub_category_code', '知识库无分类无法管理', 'P0'],
      ['T-A2', 'mcd_strategy_info增加strategy_name / category / desc / status / scene等字段', '5个业务字段严重不足', 'P0'],
      ['T-A3', 'mcd_strategy_info支持多根因关联（1:N）', '单根因限制了策略复用', 'P0'],
      ['T-A4', 'mcd_strategy_cause_pattern支持多指标关联', '单指标不足以描述一个根因', 'P0'],
      ['T-A5', '实现运行态→候选库回写机制', '候选库的运行数据必须有数据来源', 'P0'],
      ['T-A6', 'mcd_strategy_info增加effective_start_date + effective_end_date', '策略有自然生命周期', 'P1'],
      ['T-A7', 'dimension_tags_json扩展为结构化格式', '纯标签值无法表达运算符和区间', 'P1'],
      ['T-A8', 'diagnosis_questions_json支持AND/OR逻辑', '诊断条件需要逻辑关系', 'P1'],
      ['T-A9', '策略匹配引擎增加降级路径', '根因匹配不足时按指标直连策略', 'P1'],
      ['T-A10', 'mcd_strategy_info增加weighted_conversion_rate字段', '效果评估的展示需求', 'P2'],
      ['T-A11', 'strategy-srv新增根因/策略CRUD接口', '产品侧前端需要增删改操作', 'P0'],
      ['T-A12', 'batchQueryRootCause / batchQueryStrategy接口响应扩展', '补充分类/名称/命中率等字段', 'P1'],
    ],
    [6, 34, 40, 10],
  ),

  heading('9.3 双方协商项', 2),
  makeTable(
    ['#', '协商项', '产品侧诉求', '技术侧顾虑', '建议方案'],
    [
      ['J-1', '业务场景主/副场景', '多选支持业务灵活性', '单值保证匹配精度', '主场景单值+副场景JSON'],
      ['J-2', '诊断条件-市场事件', '保留标注', '不参与匹配逻辑', '标注性字段，note_json承载'],
      ['J-3', '营销话术归属', '一期暂存策略库', '应属话术管理平台', '一期暂存+明确过渡方案'],
      ['J-4', '策略关联指标', '直连作为主要关系', '只通过根因中转', '降级路径，非主要关系'],
      ['J-5', '效果评估转化率', '加权转化率展示', 'history_score用于匹配', '两个字段各司其职'],
      ['J-6', '运行态数据回写频率', '实时', '批量', 'T+1批量回写，准实时查询走portal-srv'],
    ],
    [6, 14, 18, 18, 30],
  ),

  pageBreak(),
);

// ---------- 第十章：衔接性总结 ----------
sections.push(
  heading('十、衔接性总结', 1),

  heading('10.1 统计', 2),
  makeTable(
    ['衔接结论', '数量', '占比'],
    [
      ['可直接衔接', '10项', '23%'],
      ['需协商后衔接', '26项', '60%'],
      ['无法衔接', '7项', '16%'],
    ],
    [30, 30, 30],
  ),

  heading('10.2 可直接衔接清单（10项）', 2),
  makeTable(
    ['#', '项目', '承载方式'],
    [
      ['1', '根因描述', 'mcd_strategy_cause_info.root_cause_desc'],
      ['2', '根因置信度（配置值）', 'mcd_strategy_cause_info.confidence_score'],
      ['3', '根因方向', 'mcd_strategy_cause_pattern.anomaly_direction'],
      ['4', '根因变化区间', 'mcd_strategy_cause_pattern.change_min/max'],
      ['5', '策略动作类型', 'mcd_strategy_info.action_type（一期建议增加）'],
      ['6', '策略风险等级', 'mcd_strategy_info.strategy_risk_level（一期建议增加）'],
      ['7', '策略客户约束', 'mcd_strategy_info.customer_constraint_json（一期建议增加）'],
      ['8', '根因↔策略多对多', 'mcd_strategy_info.root_cause_id（已支持1:N）'],
      ['9', '指标↔客群关联', 'customer_segment_indicator_rel'],
      ['10', 'AI路径1+2', '技术侧主链路'],
    ],
    [5, 25, 70],
  ),

  heading('10.3 需协商后衔接清单（26项）', 2),
  para(t('协商难度低（技术侧只需加字段/接口扩展，无架构变更）：')),
  makeTable(
    ['#', '项目', '需要技术侧做的'],
    [
      ['1', '根因名称', 'mcd_strategy_cause_info加name字段'],
      ['2', '根因分类', '加category_code/sub_category_code'],
      ['3', '根因状态', '加status字段'],
      ['4', '策略名称', '确认strategyTitle是否落库'],
      ['5', '策略分类/描述/状态', 'mcd_strategy_info扩展'],
      ['6', '来源枚举对齐', '接口返回对齐4种枚举'],
      ['7', '业务场景主+副', '加secondary_scene_codes_json'],
      ['8', '验证状态', 'portal-srv聚合feedback后回写'],
      ['9', '使用频次', '接口响应补充hit_count'],
      ['10', '多指标关联', 'pattern表已有1:N，接口补充'],
      ['11', '多客群关联', 'segment_codes_json已有，接口补充客群详情'],
      ['12', '根因↔客群关联展示', '接口补充客群详情'],
      ['13', '时效约束', 'mcd_strategy_info加effective_start/end_date'],
      ['14', '适用渠道列表', 'mcd_strategy_info加applicable_channels_json'],
      ['15', '实际转化率', '加字段+dispatch-srv回写链路'],
      ['16', '策略↔客群1:N', 'mcd_strategy_info改1:N'],
    ],
    [5, 25, 70],
  ),

  para(t('协商难度中（需要定义新的接口或回写链路）：')),
  makeTable(
    ['#', '项目', '需要做的'],
    [
      ['17', '候选库CRUD接口', 'strategy-srv新增根因/策略增删改接口'],
      ['18', '运行态→候选库回写链路', 'portal-srv聚合后调strategy-srv回写接口'],
      ['19', '诊断条件-逻辑关系', '定义diagnosis_questions_json结构化schema'],
      ['20', '营销话术一期过渡', '策略库增加scripts_json临时字段'],
      ['21', '推荐产品引用', '策略库增加product_codes_json+CRM查询接口'],
      ['22', '关联关系维护接口', 'strategy-srv新增关联维护接口'],
    ],
    [5, 25, 70],
  ),

  para(t('协商难度高（涉及匹配引擎改造或新能力建设）：')),
  makeTable(
    ['#', '项目', '需要做的'],
    [
      ['23', '诊断条件-结构化匹配', 'dimension_tags_json扩展为结构化格式+匹配引擎改造'],
      ['24', '策略↔指标直连（降级路径）', '匹配引擎增加降级逻辑'],
      ['25', '客群→策略直连（降级路径）', '匹配引擎增加降级逻辑'],
      ['26', '客群规模实时查询', '需要CDP/客群库实时规模查询接口'],
    ],
    [5, 25, 70],
  ),

  heading('10.4 无法衔接清单（7项）', 2),
  makeTable(
    ['#', '项目', '无法衔接原因', '建议'],
    [
      ['1', '诊断条件-客户属性条件', '匹配引擎无CDP实时标签查询能力，dimension_tags_json无法承载运算符', '产品侧调整：合并到策略"适用约束-客户约束"'],
      ['2', '诊断条件-业务维度条件', '技术侧无此概念，与关联指标语义重叠', '产品侧调整：合并到关联指标+阈值'],
      ['3', '诊断条件-市场事件条件', '无市场事件数据源，无匹配逻辑', '产品侧调整：降为标注性字段'],
      ['4', '所有关联强度', '技术侧无此字段，人工填写无客观依据', '产品侧调整：去掉人工强度，用match_score'],
      ['5', '渠道优先级', '运行时决策不应静态配置', '产品侧调整：去掉，调度引擎动态决定'],
      ['6', '渠道时段', '同上', '产品侧调整：去掉'],
      ['7', '效果评估配置项(统计周期/最小样本量)', '不应作为配置存储', '产品侧调整：改为查询参数/展示逻辑'],
    ],
    [5, 18, 37, 35],
  ),

  pageBreak(),
);

// ---------- 第十一章：3个最大断点 ----------
sections.push(
  heading('十一、衔接性最大的3个断点', 1),

  heading('断点1：strategy-srv缺少CRUD接口', 2),
  para(t('现状：技术侧文档中strategy-srv只有查询接口（batchQueryRootCause、batchQueryStrategy），没有增删改接口。')),
  para(t('影响：产品侧的根因库/策略库管理页面无法操作——无法新增、编辑、删除、启停根因和策略。')),
  para(t('衔接方案：strategy-srv新增CRUD接口，或在portal-srv增加一层管理接口代理到strategy-srv。一期建议portal-srv代理（减少strategy-srv改造量），二期strategy-srv原生支持。', { bold: true })),

  heading('断点2：运行态→候选库回写链路未定义', 2),
  para(t('现状：技术侧文档定义了运行态数据的生产（谁写入feature_analysis_*表），但没有定义"回写strategy-srv候选库"的完整链路。')),
  para(t('影响：产品侧候选库页面的运行数据（命中次数、准确率、反馈摘要、转化率）没有数据来源。')),
  para(t('衔接方案：portal-srv新增定时回写任务：', { bold: true })),
  bullet('从feature_analysis_feedback聚合反馈摘要 → 调strategy-srv接口回写'),
  bullet('从mcd_strategy_cause_pattern读取hit_count/accuracy_rate → 通过查询接口透出'),
  bullet('从dispatch-srv执行数据聚合转化率 → 调strategy-srv接口回写'),
  bullet('回写频率建议T+1（每日凌晨跑批），准实时查询走portal-srv直接查运行态表'),

  heading('断点3：诊断条件的匹配引擎能力不足', 2),
  para(t('现状：技术侧的匹配引擎是"指标编码+变化区间+扁平标签"的简单比对。产品侧的诊断条件需要"结构化条件+运算符+实时标签查询"。')),
  para(t('影响：产品侧的3类诊断条件中，2类无法自动匹配，1类需要结构化JSON支持。')),
  para(t('衔接方案：', { bold: true })),
  bullet('一期：诊断条件仅做"展示+人工判断"，不参与自动匹配。匹配仍走技术侧的pattern库（指标编码+变化区间）'),
  bullet('二期：dimension_tags_json升级为结构化格式，匹配引擎增加条件比对能力'),

  pageBreak(),
);

// ---------- 第十二章：调整方分布与统计 ----------
sections.push(
  heading('十二、调整方分布与统计', 1),

  heading('12.1 调整方分布', 2),
  makeTable(
    ['调整方', '数量', '说明'],
    [
      ['产品侧调整', '12项', '来源枚举/人工强度/业务场景/置信度口径/缺失字段/诊断条件精简/产品引用/话术过渡/渠道简化/效果评估精简/直连降级/客群规模实时化'],
      ['技术侧调整', '12项', '分类字段/策略字段扩展/多根因关联/多指标关联/回写机制/有效期/结构化标签/条件逻辑/降级路径/转化率字段/CRUD接口/接口响应扩展'],
      ['双方协商', '6项', '主副场景/市场事件标注/话术归属/策略关联指标/转化率定义/回写频率'],
    ],
    [15, 10, 75],
  ),
  para(t('结论：双方调整量基本均衡。产品侧的问题主要是设计过度和口径自创（12项），技术侧的问题主要是模型过简和回写缺失（12项），6项需要双方坐下来协商。不存在"一方全对一方全错"的情况。', { bold: true })),

  heading('12.2 按优先级分布', 2),
  makeTable(
    ['优先级', '产品侧', '技术侧', '合计'],
    [
      ['P0', '4项（P-A1~A4）', '5项（T-A1~A5）', '9项'],
      ['P1', '5项（P-A5~A7,A9,A11）', '5项（T-A6~A9,A12）', '10项'],
      ['P2', '3项（P-A8,A10,A12）', '2项（T-A10,A11调整）', '5项'],
    ],
    [15, 25, 25, 15],
  ),

  pageBreak(),
);

// ---------- 第十三章：分期实施建议 ----------
sections.push(
  heading('十三、分期实施建议', 1),

  heading('13.1 一期：候选库基础能力', 2),
  para(t('目标：打通候选库CRUD + 基础字段 + 查询展示，运行数据通过portal-srv直接查运行态表（不回写）。')),
  makeTable(
    ['工作项', '负责方', '说明'],
    [
      ['strategy-srv增加CRUD接口（或portal-srv代理）', '技术侧', '根因/策略的增删改接口'],
      ['mcd_strategy_cause_info扩展（name/category/status/scene）', '技术侧', '知识库管理基础字段'],
      ['mcd_strategy_info扩展（name/category/desc/status/scene/risk/action/channels/effective/constraint）', '技术侧', '策略库管理基础字段'],
      ['产品侧页面精简（去掉人工强度/诊断条件精简/渠道简化/效果评估精简）', '产品侧', '消除无法衔接的设计'],
      ['产品侧页面补充（actionType/riskLevel/assertion_level展示）', '产品侧', '对齐技术侧已有字段'],
      ['运行数据Tab：从portal-srv查询运行态表展示', '双方', '候选库不存运行数据，展示时实时查'],
      ['诊断条件：仅做展示+人工判断，不参与自动匹配', '双方', '一期匹配仍走pattern库'],
    ],
    [30, 10, 60],
  ),

  heading('13.2 二期：回写链路+匹配引擎升级', 2),
  para(t('目标：打通运行态→候选库回写链路，匹配引擎升级支持结构化条件。')),
  makeTable(
    ['工作项', '负责方', '说明'],
    [
      ['portal-srv定时回写任务', '技术侧', '聚合feedback/hit_count/accuracy_rate/转化率回写strategy-srv'],
      ['dimension_tags_json升级为结构化格式', '技术侧', '支持运算符和区间'],
      ['匹配引擎支持结构化条件比对', '技术侧', '诊断条件参与自动匹配'],
      ['策略匹配引擎增加降级路径', '技术侧', '根因匹配不足时按指标直连策略'],
      ['话术迁出到话术管理平台', '双方', '策略库去掉scripts_json'],
      ['产品主数据关联到产商品中心', '双方', '策略库去掉product_codes_json，改为API查询'],
      ['决策树规则发现（方法C）', '技术侧', '客群圈选三方法完整闭环'],
    ],
    [30, 10, 60],
  ),

  heading('13.3 三期：策略闭环', 2),
  para(t('目标：策略执行效果回流、A/B实验、高级策略闭环（技术侧文档已定义三期目标）。')),

  pageBreak(),
);

// ---------- 第十四章：会议建议 ----------
sections.push(
  heading('十四、与技术侧同事讨论的姿态建议', 1),

  heading('14.1 主动提出产品侧的精简方案', 2),
  para(t('不是要求技术侧全量支撑产品侧6层Tab，而是承认产品侧有过度设计的地方，已经做了精简：去掉人工强度、精简诊断条件、渠道简化、效果评估精简等。这样姿态更对等。')),

  heading('14.2 明确技术侧必须补齐的P0项', 2),
  para(t('策略库5个字段→至少需要12个字段、候选库需要分类、回写机制必须实现、CRUD接口必须提供——这些不是"产品需求过度"，而是知识库管理的基本能力。用数据说话：当技术侧说"这个字段我们不需要"时，问"那这个数据从哪来？下游谁消费？"——如果回答不上来，说明确实不需要；如果回答得上来，说明技术侧需要支撑。')),

  heading('14.3 对争议项给出妥协方案', 2),
  para(t('业务场景主+副、话术一期暂存、直连作降级路径——都有明确的妥协方向，不是零和博弈。')),

  heading('14.4 3个断点需要优先决策', 2),
  bullet('断点1（CRUD接口）：决定是strategy-srv原生支持还是portal-srv代理——影响技术侧的改造范围和工作量'),
  bullet('断点2（回写链路）：决定回写频率（实时/T+1）和回写方向（portal-srv推/strategy-srv拉）——影响数据一致性'),
  bullet('断点3（匹配引擎）：决定一期诊断条件是否参与自动匹配——影响产品侧的诊断条件设计方案'),
);

// ============ 组装文档 ============
const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, bottom: 1440, left: 1080, right: 1080 },
      },
    },
    children: sections,
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.mkdirSync('/workspace/projects/docs/需求设计方案', { recursive: true });
fs.writeFileSync('/workspace/projects/docs/需求设计方案/产品侧vs技术侧全量对标分析与方案衔接评估报告.docx', buffer);
console.log('Report generated successfully!');
