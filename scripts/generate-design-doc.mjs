import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  TableLayoutType, PageBreak
} from 'docx';
import fs from 'fs';

// 落地阶段标记（全部可落地，标注的是实施阶段）
const PHASE = {
  P0: '[一期]',     // 基础建设：标准前后端开发即可
  P1: '[二期]',     // AI增强：需大模型能力，项目已具备
  P2: '[长期]',     // 持续进化：基于效果数据持续优化
};

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, font: 'Microsoft YaHei', color: '000000' })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, size: 28, font: 'Microsoft YaHei', color: '000000' })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, font: 'Microsoft YaHei', color: '000000' })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 21, font: 'Microsoft YaHei', color: '000000', ...opts })],
  });
}

function boldPara(text) {
  return para(text, { bold: true, color: '000000' });
}

function feasibilityTag(tag) {
  const color = tag.includes('一期') ? '008000' : tag.includes('二期') ? '0066CC' : tag.includes('长期') ? 'CC6600' : '333333';
  return new TextRun({ text: `  【${tag}】`, size: 21, font: 'Microsoft YaHei', bold: true, color });
}

function paraWithTag(text, tag) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [
      new TextRun({ text, size: 21, font: 'Microsoft YaHei', color: '000000' }),
      feasibilityTag(tag),
    ],
  });
}

function bulletItem(text, tag) {
  const children = [new TextRun({ text: `• ${text}`, size: 21, font: 'Microsoft YaHei', color: '000000' })];
  if (tag) children.push(feasibilityTag(tag));
  return new Paragraph({ spacing: { before: 40, after: 40 }, children });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 400 },
    children: [new TextRun({ text, size: 19, font: 'Consolas', color: '000000' })],
  });
}

function separator() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: '━'.repeat(50), size: 16, color: 'CCCCCC' })],
  });
}

// 创建表格
function createTable(headers, rows) {
  const borderStyle = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const borders = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      borders,
      shading: { type: ShadingType.SOLID, color: 'E8F0FE' },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 19, font: 'Microsoft YaHei', color: '000000' })] })],
    })),
  });

  const phaseColorMap = { '[一期]': '008000', '[二期]': '0066CC', '[长期]': 'CC6600', '[一期]+[二期]': '0066CC', '[一期]+[长期]': 'CC6600', '[二期]+[长期]': 'CC6600' };

  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, colIdx) => {
      const cellText = String(cell);
      let runOpts = { text: cellText, size: 19, font: 'Microsoft YaHei' };
      const headerName = headers[colIdx] || '';
      if (headerName === '落地阶段' || phaseColorMap[cellText]) {
        const color = phaseColorMap[cellText] || '008000';
        runOpts.color = color;
        runOpts.bold = true;
      }
      return new TableCell({
        borders,
        children: [new Paragraph({ children: [new TextRun(runOpts)] })],
      });
    }),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [headerRow, ...dataRows],
  });
}

const children = [];

// ========== 封面 ==========
children.push(new Paragraph({ spacing: { before: 2000 }, children: [] }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text: '指标策略知识库管理', size: 52, bold: true, font: 'Microsoft YaHei', color: '000000' })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 400 },
  children: [new TextRun({ text: '完整设计方案', size: 40, bold: true, font: 'Microsoft YaHei', color: '000000' })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
  children: [new TextRun({ text: '市场数智运营平台 · 策略管理模块', size: 24, font: 'Microsoft YaHei', color: '666666' })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
  children: [new TextRun({ text: '版本：V3.0（含第二轮改造修订）', size: 21, font: 'Microsoft YaHei', color: '666666' })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
  children: [new TextRun({ text: '日期：2026年5月', size: 21, font: 'Microsoft YaHei', color: '666666' })],
}));
children.push(new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: '落地阶段标记说明（全部可落地）', size: 22, bold: true, font: 'Microsoft YaHei' })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[一期] 基础建设：标准前后端开发即可完成', size: 21, font: 'Microsoft YaHei', color: '008000', bold: true })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[二期] AI增强：需大模型能力，项目已具备', size: 21, font: 'Microsoft YaHei', color: '0066CC', bold: true })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '[长期] 持续进化：基于效果数据持续优化', size: 21, font: 'Microsoft YaHei', color: 'CC6600', bold: true })] }));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ========== 一、设计总纲 ==========
children.push(heading1('一、设计总纲'));

children.push(heading2('1.1 核心理念'));
children.push(createTable(
  ['理念', '说明', '落地阶段'],
  [
    ['AI融入管理而非替代管理', '根因库、策略库、关联关系的管理框架完整保留，AI作为增强能力融入每个环节', '[一期]'],
    ['人机共创、来源可溯', '每条知识标注来源（专家经验/AI生成），不靠人工审批，靠执行数据验证', '[一期]'],
    ['用效果说话、数据验证', '所有知识的有效性由调度执行效果验证，而非人工审批', '[一期]'],
    ['越用越准、自我进化', '每次调度执行结果反哺知识库，置信度和评分持续更新', '[一期] + [二期]'],
    ['候选库与执行实例两层体系', '根因库和策略库是候选知识库，真正下发的是调度单中的执行实例，两者通过引用关联打通', '[一期]'],
  ]
));

children.push(heading2('1.2 整体架构'));
children.push(paraWithTag('知识库管理层（候选库）：根因库 + 策略库 + 关联关系库，AI增强引擎贯穿', '[一期]'));
children.push(paraWithTag('调度执行层（执行实例）：指标异常→客群圈选→AI推导根因→AI推导策略→生成调度单→效果反馈闭环', '[一期] + [二期]'));
children.push(paraWithTag('AI增强引擎：自动归类、关联推荐、策略生成、话术生成、效果预测、聚类优化', '[二期]'));
children.push(para(''));
children.push(para('关键说明：根因库和策略库本质上是候选知识库，存储的是标准化、可复用的知识条目。真正展示在前端和下发执行的是调度单中的根因和策略实例。两者通过"引用关联"机制打通——调度单中引用了哪些候选根因/策略，执行结果就回算到对应候选条目的置信度和统计指标上。'));

children.push(heading2('1.3 来源标记体系'));
children.push(para('来源仅分两类，简化运营人员理解成本：'));
children.push(createTable(
  ['标记', '含义', '说明', '落地阶段'],
  [
    ['专家经验', '人工录入', '运营专家基于经验创建，初始无置信度', '[一期]'],
    ['AI生成', '大模型产出', 'AI基于数据/知识推导产出（含AI从数据中发现新模式），初始置信度0.6~0.85', '[二期]'],
  ]
));

children.push(heading3('来源标记的动态演化'));
children.push(bulletItem('AI生成的条目，经过5次验证通过 → 标记增加"已验证"', '[一期]'));
children.push(bulletItem('专家经验的条目，连续3次验证失败 → 标记增加"待验证"', '[一期]'));

children.push(heading2('1.4 分类管理机制'));
children.push(paraWithTag('分类不是固定预设，也不是完全开放，而是AI聚类维护 + 人工可干预', '[一期]'));
children.push(createTable(
  ['操作', '触发', 'AI参与', '人参与', '落地阶段'],
  [
    ['新增二级分类', 'AI聚类发现新模式 / 人工补充', 'AI自动归类到一级分类 / AI生成分类名称和定义', '人工可随时新增，AI自动归类', '[一期] + [二期]'],
    ['合并分类', 'AI检测两个分类语义重叠>80%', 'AI给出合并建议', '运营人员确认或忽略', '[二期]'],
    ['拆分分类', 'AI检测单分类下条目聚类为2+组', 'AI给出拆分方案', '运营人员确认或忽略', '[二期]'],
    ['淘汰分类', '某分类90天无使用', 'AI标记为"低活跃"', '30天仍无使用自动停用', '[一期]'],
    ['新增一级分类', 'AI发现无法归入现有一级的新聚类', 'AI建议+定义', '运营人员确认', '[二期]'],
  ]
));

children.push(heading3('标签体系'));
children.push(paraWithTag('标签作为分类的补充，实现跨分类快速检索和AI匹配加权', '[一期] + [二期]'));
children.push(para('分类与标签的区别：'));
children.push(createTable(
  ['维度', '分类', '标签'],
  [
    ['结构', '树形层级（6个一级→多个二级），一个根因只属一个二级分类', '平面结构，一个根因可有多个标签'],
    ['维护', '一级分类管理员维护，二级分类AI归类+人工补充', 'AI自动打标+人工可补充'],
    ['用途', '归属管理、目录导航', '跨分类快速检索、AI匹配加权'],
  ]
));
children.push(bulletItem('标签核心使用场景1：AI匹配加权——系统检测到"携转场景"异常时，优先推荐带"携转相关"标签的根因', '[一期] + [二期]'));
children.push(bulletItem('标签核心使用场景2：快速筛选——按标签过滤比逐级展开分类树更快捷', '[一期]'));
children.push(bulletItem('标签核心使用场景3：跨分类聚合——"价格敏感"标签同时出现在不同一级分类下的根因上', '[一期]'));
children.push(bulletItem('标签以AI自动打标为主，人工不强制填写，几乎零操作成本', '[二期]'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ========== 二、候选库与执行实例两层体系 ==========
children.push(heading1('二、候选库与执行实例两层体系'));

children.push(heading2('2.1 两层体系定义'));
children.push(para('根因库和策略库本质上是候选知识库（第一层），真正下发执行的是调度单中的根因和策略实例（第二层）。统计指标的原始数据来自执行实例层，通过"引用关联"汇总到候选库层。'));
children.push(para(''));

children.push(heading3('第一层：候选库（知识库层）'));
children.push(para('存储标准化、可复用的知识条目，是AI推理时的检索源和匹配源。'));
children.push(para(''));

children.push(heading3('第二层：执行实例层（调度单）'));
children.push(para('每张调度单上记录的根因和策略才是真正下发执行的内容。调度单中引用了哪些候选根因/策略，执行结果就回算到对应候选条目的统计指标上。'));
children.push(para(''));

children.push(heading2('2.2 AI从候选库到执行的三种场景'));
children.push(createTable(
  ['场景', '占比', '说明', '统计追踪方式'],
  [
    ['直接匹配', '约80%', 'AI从候选库检索后直接选中某个候选根因作为推荐', '候选根因=执行根因，使用频次、置信度直接对应'],
    ['组合推导', '约15%', 'AI检索到多个候选后综合推导，输出多个候选的综合表述', '调度单记录引用了哪些候选+各候选权重，统计按权重折算'],
    ['AI全新生成', '约5%', '候选库中无匹配，AI基于领域知识生成新根因/策略', '新根因/策略自动入库（来源标记AI生成），同时作为调度单的执行根因'],
  ]
));

children.push(heading2('2.3 组合推导的统计追踪规则'));
children.push(para('当AI综合推导输出包含多个候选根因时（如主因A+次因B）：'));
children.push(bulletItem('候选A：被引用频次+1，验证结果按主因权重（如0.7）折算'));
children.push(bulletItem('候选B：被引用频次+1，验证结果按次因权重（如0.3）折算'));
children.push(bulletItem('未被引用的候选：不参与本次统计'));

children.push(heading2('2.4 统计指标追踪层级'));
children.push(createTable(
  ['指标', '追踪层级', '计算方式', '说明'],
  [
    ['使用频次', '候选库层', '每次被AI检索引用+1（不管最终是否选中）', '衡量知识条目的活跃度和覆盖度'],
    ['被确认频次', '候选库层', '每次被运营人员确认+1', '衡量知识条目的准确度'],
    ['被引用频次', '候选库层', '每次在调度单中被引用+1', '衡量知识条目实际被使用的情况'],
    ['验证状态', '执行实例层（调度单）', '调度单执行后，根据指标变化方向判断', '验证的是这次执行对不对，不是候选条目对不对'],
    ['置信度', '候选库层（由执行数据汇总）', '=该候选被引用且验证通过次数 / 该候选被引用总次数', '是执行数据的汇总统计，不是候选条目本身的属性'],
    ['实际转化率', '执行实例层（调度单）', '=该调度单办理数 / 触达数', '验证的是这次策略执行的效果'],
  ]
));

children.push(heading2('2.5 候选库列表页统计指标'));
children.push(para('候选库的列表页展示以下统计指标，均来源于执行实例层的汇总：'));
children.push(bulletItem('使用频次：被AI检索命中的次数（含未选中）'));
children.push(bulletItem('被确认频次：被运营人员确认选用的次数'));
children.push(bulletItem('被引用频次：在调度单中被引用的次数'));
children.push(bulletItem('置信度：被引用且验证通过次数 / 被引用总次数（近N个月滚动窗口）'));
children.push(bulletItem('验证状态：未验证/已验证/存疑，基于置信度自动判定'));

children.push(heading2('2.6 调度单中的引用关联'));
children.push(para('调度单详情页中的根因和策略区域需展示：'));
children.push(bulletItem('引用的候选根因ID和名称（可点击跳转到候选库）'));
children.push(bulletItem('AI推导过程说明（为什么选这个根因）'));
children.push(bulletItem('如果是组合推导，展示各候选的权重'));

children.push(heading2('2.7 候选库详情页的推导记录'));
children.push(para('在候选库的详情页中，增加"推导记录"Tab：'));
children.push(bulletItem('展示所有引用过该候选的调度单列表'));
children.push(bulletItem('每条记录包含：调度单号、推导时间、匹配方式（直接/组合/新生成）、验证结果'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ========== 三、根因库管理 ==========
children.push(heading1('三、根因库管理'));

children.push(heading2('3.1 根因分类字典'));
children.push(paraWithTag('以下为初始种子分类，AI运行中可建议新增/合并/拆分', '[一期]'));

const rootCauseCategories = [
  ['价格与竞争因素', ['竞品资费低于本网同档位', '本网套餐性价比感知低', '优惠活动到期未延续', '隐性扣费引发不满', '家庭成员资费不协同', '竞品捆绑销售更有吸引力', '长期在网无优惠感知']],
  ['产品与套餐因素', ['套餐流量容量不足', '套餐语音容量过剩', '5G终端与套餐不匹配', '定向流量包覆盖不足', '宽带速率不满足需求', '增值业务非主动订购', '融合产品渗透不足', '套餐内容与需求错配', '国际/漫游资费偏高']],
  ['网络与服务因素', ['网络覆盖质量下降', '5G网络体验未达预期', '室内覆盖信号弱', '装维服务响应慢', '投诉处理不及时', '营业厅服务体验差', '线上渠道功能不完善', '客服热线等待时间长', '数字渠道自助办理失败率高']],
  ['客户生命周期因素', ['合约到期未续约', '新入网客户早期流失', '学生群体毕业离网', '老年客户自然流失', '异地搬迁导致销户', '家庭结构变化', '收入水平下降', '使用习惯变化（如语音转IM）']],
  ['市场与政策因素', ['携号转网政策便利化', '异地销户政策放开', '实名制清理', '行业资费整体下行', '虚拟运营商低价竞争', 'eSIM政策放开', '校园市场开学季竞争']],
  ['技术与系统因素', ['计费系统异常', '网络升级影响体验', '系统故障导致服务中断', '终端兼容性问题', 'SIM卡/USIM卡故障']],
];

rootCauseCategories.forEach(([cat, subs]) => {
  children.push(boldPara(`\n${cat}`));
  subs.forEach(s => children.push(bulletItem(s)));
});

children.push(heading3('根因标签池（初始种子，自由扩展）'));
children.push(para('携转相关、5G迁移、校园场景、宽带相关、价格敏感、网络质量、服务体验、合约到期、家庭场景、政企相关、国际/漫游、流量相关、增值业务、融合产品、竞品动态、政策影响、技术故障、新入网、老年群体、学生群体'));

children.push(heading2('3.2 根因条目完整字段'));
children.push(para('注：已去掉"有效性评分"字段（与置信度概念重叠，置信度已能充分表达根因可靠性）。'));
children.push(createTable(
  ['字段', '说明', 'AI参与方式', '示例', '落地阶段'],
  [
    ['根因ID', '唯一标识', '--', 'RC-PRICE-001', '[一期]'],
    ['根因名称', '简洁描述', 'AI可生成建议名称', '竞品资费低于本网同档位', '[一期]'],
    ['一级分类', '所属一级分类', 'AI自动归类，人工可调', '价格与竞争因素', '[一期] + [二期]'],
    ['二级分类', '所属二级分类', 'AI自动归类，人工可调', '竞品资费低于本网同档位', '[一期] + [二期]'],
    ['标签', '自由标签，多选', 'AI自动打标', '携转相关、价格敏感', '[一期] + [二期]'],
    ['根因描述', '详细说明', 'AI可生成', '竞品推出同档位更低资费套餐，吸引价格敏感客户转网...', '[一期] + [二期]'],
    ['来源标记', '专家经验/AI生成', '自动标记', 'AI生成', '[一期]'],
    ['状态', '启用/草稿/停用', 'AI置信度>0.85自动启用', '启用', '[一期]'],
    ['创建人', '人名或AI', '自动标记', 'AI / 张三', '[一期]'],
    ['创建时间', '--', '--', '2026-03-15', '[一期]'],
    ['更新时间', '--', '--', '2026-05-13', '[一期]'],
  ]
));

children.push(heading2('3.3 诊断特征（结构化）'));
children.push(paraWithTag('诊断特征是AI自动匹配根因的核心输入，已从纯文本改为结构化特征项列表', '[一期] + [二期]'));
children.push(para(''));
children.push(para('使用场景：当系统检测到指标异常时，AI将当前可观测数据模式与各根因的诊断特征进行比对匹配。'));
children.push(para(''));
children.push(para('示例：系统检测到 携转查询量环比+35% + 竞品X降价20% + 无合约客户占比62%，匹配到根因"竞品资费低于本网同档位"的诊断特征：携转查询量环比>+30% AND 竞品降价 AND 无合约客户占比>60%，匹配度极高。'));
children.push(para(''));
children.push(para('每个特征项包含：'));
children.push(createTable(
  ['字段', '说明', '示例', '落地阶段'],
  [
    ['特征名称', '可观测的数据指标', '携转查询量环比增幅', '[一期]'],
    ['比较运算符', ' > / < / = / >= / <= / 包含 / 不包含', '>', '[一期]'],
    ['阈值', '判断阈值', '30%', '[一期]'],
    ['逻辑关系', '特征项之间的逻辑：AND / OR / 满足N项', 'AND', '[一期]'],
  ]
));
children.push(bulletItem('AI从历史调度数据中自动提取诊断特征，人工可补充和调整', '[二期]'));

children.push(heading2('3.4 关联指标（含适用阈值）'));
children.push(paraWithTag('每个关联指标增加"适用阈值范围"字段，实现精准匹配', '[一期]'));
children.push(para(''));
children.push(para('不同变化幅度对应不同根因是实际业务中的常见场景：'));
children.push(createTable(
  ['指标', '变化幅度', '对应根因', '说明'],
  [
    ['降档客户数', '+1%~3%', '季节性波动/正常波动', '小幅波动属正常范围'],
    ['降档客户数', '+3%~10%', '竞品资费低于本网同档位', '中等幅度，需关注竞品动态'],
    ['降档客户数', '+>10%', '重大竞品事件/系统性问题', '大幅波动，需紧急干预'],
  ]
));
children.push(para(''));
children.push(para('关联指标配置项：'));
children.push(createTable(
  ['配置项', '说明', '示例', '落地阶段'],
  [
    ['指标名称', '从指标库选择', '降档客户数', '[一期]'],
    ['影响方向', '上升/下降', '上升', '[一期]'],
    ['适用阈值范围', '该根因适用的指标变化幅度范围', '3%-10%', '[一期]'],
    ['关联强度', '1-3级，用于AI推荐排序和调度优先级', '3（强）', '[一期]'],
  ]
));
children.push(para(''));
children.push(para('阈值的作用：AI匹配时，结合指标实际变化幅度与根因关联的阈值范围做精准匹配。例如系统检测到"降档客户数+7%"，只会匹配阈值范围包含7%的根因，不会匹配"1%-3%"的根因。'));
children.push(para('关联强度说明：用于AI推荐排序和调度优先级。初期由专家设定（1-3级），后期由AI根据执行数据自动调整。'));

children.push(heading2('3.5 关联客群'));
children.push(createTable(
  ['配置项', '说明', '示例', '落地阶段'],
  [
    ['客群名称', '从客群库选择', '价格敏感无合约客户', '[一期]'],
    ['客群特征', '该客群的核心特征描述', '月消费<50元+无合约+携转查询记录', '[一期]'],
    ['关联强度', '1-3级，用于AI推荐排序', '3（高易感）', '[一期]'],
  ]
));

children.push(heading2('3.6 根因库列表页'));
children.push(paraWithTag('筛选区+概览卡片+横向可滚动表格', '[一期]'));
children.push(heading3('筛选区'));
children.push(para('一级分类（下拉）、二级分类（联动下拉）、标签（多选标签池）、来源标记（专家经验/AI生成）、验证状态（已验证/未验证/存疑）、状态（启用/草稿/停用）、关键词搜索'));

children.push(heading3('概览卡片'));
children.push(createTable(
  ['卡片', '示例数据', '落地阶段'],
  [
    ['根因总数', '186', '[一期]'],
    ['AI生成占比', '62%（115条）', '[一期]'],
    ['已验证占比', '78%（145条）', '[一期]'],
    ['本月新增', '8条（6专家+2AI）', '[一期]'],
  ]
));

children.push(heading3('表格列'));
children.push(createTable(
  ['列', '说明', '落地阶段'],
  [
    ['根因名称', '固定左侧，可点击进入详情', '[一期]'],
    ['来源标记', '专家经验/AI生成', '[一期]'],
    ['一级分类', '', '[一期]'],
    ['二级分类', '', '[一期]'],
    ['标签', '标签胶囊', '[一期]'],
    ['关联指标数', '数字，可点击展开', '[一期]'],
    ['关联客群数', '数字，可点击展开', '[一期]'],
    ['诊断特征', '截断显示，hover全量', '[一期]'],
    ['置信度', '进度条+数值+tooltip说明（验证通过N次/验证M次，近3个月）', '[一期]'],
    ['验证状态', '未验证/已验证/存疑 图标', '[一期]'],
    ['使用频次', '被AI检索命中次数', '[一期]'],
    ['被确认频次', '被运营人员确认选用次数', '[一期]'],
    ['状态', '状态标签', '[一期]'],
    ['操作', '固定右侧：查看详情/编辑/停用/删除', '[一期]'],
  ]
));
children.push(para('注：已去掉"有效性评分"列，置信度已能充分表达根因可靠性。'));

children.push(heading2('3.7 根因库新增/编辑页'));
children.push(paraWithTag('4层结构+AI辅助填充', '[一期]'));
children.push(heading3('第1层：基础信息'));
children.push(bulletItem('根因名称（输入后AI可自动补全建议）', '[二期]'));
children.push(bulletItem('来源标记（专家经验/AI生成，自动标记）', '[一期]'));
children.push(bulletItem('一级分类（下拉，AI根据名称自动预选）', '[二期]'));
children.push(bulletItem('二级分类（联动下拉，AI自动预选，可手动新增）', '[二期]'));
children.push(bulletItem('标签（多选标签池 + 自由输入，AI推荐标签）', '[二期]'));
children.push(bulletItem('根因描述（文本域，AI可一键生成建议描述）', '[二期]'));

children.push(heading3('第2层：诊断特征（结构化）'));
children.push(bulletItem('特征项列表：特征名称 + 比较运算符 + 阈值', '[一期]'));
children.push(bulletItem('特征项之间的逻辑关系：AND / OR / 满足N项', '[一期]'));
children.push(bulletItem('AI建议按钮："基于当前根因名称，分析历史指标数据，提取诊断特征"', '[二期]'));

children.push(heading3('第3层：关联指标'));
children.push(bulletItem('多选指标列表，每条标注：影响方向（上升/下降）+ 适用阈值范围（如"3%-10%"）+ 关联强度（1-3级）', '[一期]'));
children.push(bulletItem('关联强度说明："用于AI推荐排序和调度优先级，初期人工设定，后期AI根据执行数据自动调整"', '[一期]'));
children.push(bulletItem('AI推荐："基于根因语义，推荐以下关联指标" 一键添加', '[二期]'));

children.push(heading3('第4层：关联客群'));
children.push(bulletItem('多选客群列表，每条标注：客群特征 + 关联强度（1-3级）', '[一期]'));
children.push(bulletItem('AI推荐："基于根因+诊断特征，推荐以下关联客群" 一键添加', '[二期]'));

children.push(heading2('3.8 根因库详情页'));
children.push(paraWithTag('只读展示全部信息', '[一期]'));
children.push(bulletItem('基础信息：名称、来源、一级/二级分类、描述、标签、状态', '[一期]'));
children.push(bulletItem('诊断特征：结构化特征项列表', '[一期]'));
children.push(bulletItem('关联指标：指标名称、影响方向、适用阈值范围、关联强度', '[一期]'));
children.push(bulletItem('关联客群：客群名称、客群特征、关联强度', '[一期]'));
children.push(bulletItem('置信度说明：当前置信度值、验证通过次数/验证总次数、计算周期', '[一期]'));
children.push(bulletItem('使用记录/推导记录：被引用的调度单列表（最近N条），含调度单号、推导时间、匹配方式、验证结果', '[一期]'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ========== 四、策略库管理 ==========
children.push(heading1('四、策略库管理'));

children.push(heading2('4.1 策略分类字典'));
children.push(paraWithTag('以下为初始种子分类，AI运行中可建议新增/合并/拆分', '[一期]'));

const strategyCategories = [
  ['价值提升策略', ['套餐升档推荐', '5G套餐迁移', '增值业务叠加', '宽带提速升级', '融合产品推荐', '第二卡槽拓展', '国际业务推荐', '数字产品推荐', '权益产品推荐']],
  ['维系保有效略', ['合约续约锁定', '专属优惠维系', '会员权益赠送', '家庭关系绑定', '服务升级维系', '体验活动邀请', '网龄回馈计划', '沉默客户激活']],
  ['挽留策略', ['降档挽留方案', '携转挽留方案', '离网预警干预', '流失客户召回', '投诉客户修复', '销户挽留方案', '异议客户化解']],
  ['流量运营策略', ['流量超套疏导', '定向流量推荐', '流量共享方案', '零流量激活', '高流量客户深耕', '流量加餐包推荐']],
  ['宽带运营策略', ['宽带新装拓展', '宽带提速推荐', '宽带续约维系', '竞品宽带抢回', '全屋WiFi推荐', '宽带+电视融合']],
  ['政企集团策略', ['集团成员拓展', '集团成员维系', '集团增值业务', '集团专线升级', '集团云服务推荐']],
];

strategyCategories.forEach(([cat, subs]) => {
  children.push(boldPara(`\n${cat}`));
  subs.forEach(s => children.push(bulletItem(s)));
});

children.push(heading3('策略标签池（初始种子，自由扩展）'));
children.push(para('高价值客户适用、需审批产品、限时活动、低成本执行、高转化率、5G相关、宽带相关、融合相关、家庭场景、校园场景、老年群体、政企场景、国际/漫游、流量相关、增值业务、携转挽留、投诉处理、新入网、沉默激活、VIP专属、首月体验、合约锁定'));

children.push(heading2('4.2 策略条目完整字段（7层结构）'));
children.push(para('注：原6层结构增加"关联配置"层，变为7层。策略必须关联根因、指标、客群三类实体，以支撑AI推理的多路径访问。'));

children.push(heading3('第1层：基础信息'));
children.push(createTable(
  ['字段', '说明', 'AI参与', '示例', '落地阶段'],
  [
    ['策略ID', '唯一标识', '--', 'ST-VAL-001', '[一期]'],
    ['策略名称', '简洁描述', 'AI可生成', '套餐升档推荐-5G畅享199元档', '[一期] + [二期]'],
    ['一级分类', '所属一级', 'AI自动归类', '价值提升策略', '[一期] + [二期]'],
    ['二级分类', '所属二级', 'AI自动归类', '套餐升档推荐', '[一期] + [二期]'],
    ['标签', '自由标签', 'AI自动打标', '高价值适用、5G迁移、ARPU提升', '[一期] + [二期]'],
    ['策略描述', '详细说明', 'AI可生成', '针对4G高流量客户推荐5G畅享套餐...', '[一期] + [二期]'],
    ['适用场景', '场景标签', 'AI推荐', '流量超套、4G升5G、ARPU提升', '[一期] + [二期]'],
    ['策略目标', '量化目标', 'AI可预测', 'ARPU提升>=15元、流量超套率下降>=10pp', '[一期] + [二期]'],
    ['来源标记', '专家经验/AI生成', '自动标记', '专家经验', '[一期]'],
    ['状态', '启用/草稿/停用', '--', '启用', '[一期]'],
    ['创建人', '人名或AI', '自动标记', '张三 / AI', '[一期]'],
    ['创建时间', '--', '--', '2026-03-15', '[一期]'],
    ['更新时间', '--', '--', '2026-05-13', '[一期]'],
  ]
));

children.push(heading3('第2层：关联配置（新增）'));
children.push(para('策略需关联三类实体，支撑AI推理的多路径访问：'));
children.push(createTable(
  ['关联类型', '含义', '示例', '为什么策略也需要', '落地阶段'],
  [
    ['关联根因', '该策略解决哪些根因', '"套餐升迁推荐"解决"套餐流量容量不足"', '经根因推导的策略匹配路径', '[一期]'],
    ['关联指标', '该策略直接影响哪些指标', '"套餐升迁推荐"影响"ARPU上升"、"降档客户数下降"', '有些策略可直接针对指标，不需先确定根因', '[一期]'],
    ['关联客群', '该策略适用于哪些客群', '"套餐升迁推荐"适用于"高流量低资费客户"', '有些策略直接针对客群', '[一期]'],
  ]
));
children.push(para(''));
children.push(para('关联指标配置项（与根因库一致）：指标名称 + 作用方向（改善/恶化）+ 适用阈值范围 + 关联强度'));
children.push(para('关联客群配置项：客群名称 + 客群特征 + 适配度（高/中/低）+ 关联强度'));

children.push(heading3('第3层：推荐产品/方案'));
children.push(paraWithTag('产品从产品目录选择，非手工输入。产品目录由产商品中心/CRM系统接入', '[一期]'));
children.push(createTable(
  ['字段', '说明', 'AI参与', '示例', '落地阶段'],
  [
    ['主推产品', '首选推荐，从产品目录搜索选择', 'AI从产品目录匹配', '5G畅享199元档', '[一期] + [二期]'],
    ['主推产品编码', '选择后自动回填', '--', 'PROD-5G-199', '[一期]'],
    ['主推产品描述', '选择后自动回填，可修改', '--', '含60GB流量+1000分钟通话', '[一期]'],
    ['备选产品1', '次选，从产品目录搜索选择', 'AI匹配', '5G畅享159元档', '[一期] + [二期]'],
    ['备选产品1编码', '自动回填', '--', 'PROD-5G-159', '[一期]'],
    ['备选产品2', '第三选择', 'AI匹配', '5G畅享239元档', '[一期] + [二期]'],
    ['备选产品2编码', '自动回填', '--', 'PROD-5G-239', '[一期]'],
    ['优惠方案', '配套优惠', 'AI从优惠库匹配', '升档首月半价、合约12月享8折', '[一期] + [二期]'],
    ['优惠编码', '优惠编码', '--', 'PROMO-UPG-80PCT', '[一期]'],
    ['产品话术要点', '推销要点关键词', 'AI生成', '流量翻倍、5G网络更快、同价位更多权益', '[二期]'],
  ]
));

children.push(heading3('产品选择器交互'));
children.push(bulletItem('搜索框：输入产品名称/编码模糊搜索', '[一期]'));
children.push(bulletItem('产品列表（下拉）：展示产品编码 + 产品名称 + 产品类型', '[一期]'));
children.push(bulletItem('选择后自动回填：产品编码 + 产品名称 + 产品描述', '[一期]'));
children.push(bulletItem('支持搜索、支持多选（主推+备选）', '[一期]'));

children.push(heading3('第4层：营销话术'));
children.push(paraWithTag('全套话术可由AI生成，人工微调', '[二期]'));
children.push(createTable(
  ['字段', '说明', 'AI参与', '示例', '落地阶段'],
  [
    ['开场白', '破冰/问候', 'AI生成', '"您好，感谢您一直以来对中国移动的信赖！"', '[二期]'],
    ['痛点切入', '引出需求', 'AI生成', '"我注意到您最近流量使用较多，每月都有超套情况..."', '[二期]'],
    ['产品介绍', '核心推荐', 'AI生成', '"我们现在有个5G畅享199元套餐，60GB流量+1000分钟..."', '[二期]'],
    ['异议处理-价格', '价格敏感应对', 'AI生成', '"确实每月多了X元，但您之前超套费用每月也有Y元..."', '[二期]'],
    ['异议处理-不需要', '需求不足应对', 'AI生成', '"您先不急，我们提供首月免费体验..."', '[二期]'],
    ['异议处理-考虑下', '犹豫应对', 'AI生成', '"这个优惠月底就截止了，我先帮您登记..."', '[二期]'],
    ['促单/挽留', '促成交易', 'AI生成', '"那我现在帮您办理，首月半价优惠立刻生效..."', '[二期]'],
    ['关怀版话术', '非营销场景', 'AI生成', '"提醒您本月流量已使用80%，建议关注..."', '[二期]'],
    ['话术版本', '版本管理', '--', 'v2.1（2026年5月更新）', '[一期]'],
  ]
));

children.push(heading3('话术编辑器特殊设计'));
children.push(bulletItem('每条话术旁有"AI生成"按钮，点击后AI基于客群画像+产品卖点+历史高转化话术重新生成', '[二期]'));
children.push(bulletItem('"AI优化"按钮：保留现有话术结构，AI优化措辞和表达', '[二期]'));

children.push(heading3('第5层：渠道适配'));
children.push(paraWithTag('6种渠道，每种可启用/禁用，配置优先级/话术变体/素材要求', '[一期]'));
children.push(para('渠道优先级说明："优先级用于调度执行时的渠道选择顺序和资源分配，P1为最高优先级。调度单创建时按优先级顺序分配渠道，高优先级渠道先执行，未成功降级到下一优先级渠道。"'));
children.push(createTable(
  ['渠道', '优先级', '执行方式示例', '话术变体示例', '素材要求示例', '落地阶段'],
  [
    ['外呼', 'P1', '专职外呼团队，15分钟/通', '完整话术流程', '客户画像卡、产品对比表', '[一期]'],
    ['企微', 'P2', '一对一图文消息', '精简版+图文链接', '产品海报、H5落地页', '[一期]'],
    ['短信', 'P3', '优惠通知短信', '短信文案70字内', '短链接+落地页', '[一期]'],
    ['APP推送', 'P4', 'PUSH通知+弹窗', '标题+副标题文案', '弹窗Banner图', '[一期]'],
    ['营业厅', 'P5', '面对面推荐', '面谈话术要点', '宣传单页、体验终端', '[一期]'],
    ['在线客服', 'P6', '文字对话引导', 'IM话术+快捷回复', '产品卡片、FAQ链接', '[一期]'],
  ]
));
children.push(paraWithTag('AI自动推荐渠道组合和权重，AI自动生成各渠道话术变体', '[二期]'));

children.push(heading3('第6层：执行规范'));
children.push(para('执行规范说明："以下内容在自动生成调度单时作为模板参数填入，运营人员可在调度单中调整。"'));
children.push(createTable(
  ['字段', '说明', '调度单中的用途', 'AI参与', '示例', '落地阶段'],
  [
    ['触达时机', '何时触达', '调度单的触发条件', 'AI基于历史数据推荐最佳时机', '合约到期前30天', '[一期] + [二期]'],
    ['触达频次', '频次控制', '调度单的频次限制', 'AI基于客户容忍度推荐', '同一客户30天内最多3次', '[一期] + [二期]'],
    ['触达时段', '时段限制', '调度单的时段约束', '--', '外呼9:00-21:00', '[一期]'],
    ['前置条件', '必须满足', '系统自动判断是否符合才允许创建工单', 'AI补充', '在网>=6月、非黑名单', '[一期] + [二期]'],
    ['禁忌条件', '不可执行', '调度单的执行约束', 'AI补充', '已有更高档套餐、投诉未解决', '[一期] + [二期]'],
    ['升级规则', '未成交处理', '调度单的后续动作', 'AI推荐', '首次未成交→7天后换渠道', '[一期] + [二期]'],
    ['SLA要求', '时效要求', '调度单的到期时间', '--', '接通后24h内录入结果', '[一期]'],
  ]
));

children.push(heading3('第7层：效果评估'));
children.push(createTable(
  ['字段', '说明', 'AI参与', '示例', '落地阶段'],
  [
    ['核心评估指标', '主指标', 'AI推荐', '升档转化率', '[一期] + [二期]'],
    ['辅助评估指标', '副指标', 'AI推荐', 'ARPU提升幅度、流量超套率变化', '[一期] + [二期]'],
    ['目标转化率', '预期效果', 'AI基于历史预测', '>=8%', '[二期]'],
    ['目标转化率设定依据', '为什么定这个值', '--', '历史同类策略实际转化率12%+行业基准10%-18%+业务考核要求不低于13%', '[一期]'],
    ['统计周期', '转化率计算周期', '--', '3个月（滚动窗口，默认）', '[一期]'],
    ['评估周期', '单次评估周期', '--', '触达后30天', '[一期]'],
    ['转化漏斗', '漏斗定义', 'AI推荐', '触达→接通→意向→办理→生效→留存', '[一期] + [二期]'],
    ['历史最佳效果', '历史最优', '自动统计', '新疆区2026年3月：转化率12.3%', '[一期]'],
    ['使用频次', '被调用次数', '自动统计', '89次', '[一期]'],
    ['被确认频次', '被运营确认次数', '自动统计', '72次', '[一期]'],
    ['平均转化率', '近N个月滚动均值', '自动统计', '9.6%', '[一期]'],
  ]
));

children.push(heading3('统计周期说明'));
children.push(para('不采用一直累计的方式，而是使用滚动窗口计算：'));
children.push(bulletItem('一直累计的问题：2年前的执行数据对当前无参考价值；市场环境变化使旧数据失真；累计转化率趋近均值丧失区分度'));
children.push(bulletItem('统计周期配置：1个月 / 3个月（默认） / 6个月 / 12个月'));
children.push(bulletItem('计算方式：近N个月内该策略所有执行的实际转化率'));
children.push(bulletItem('最小样本量：执行次数<10次时置信度不计算（避免小样本偏差）'));
children.push(bulletItem('置信度同步按此周期计算：置信度 = 近N个月内验证通过次数 / 近N个月内验证总次数'));

children.push(heading2('4.3 策略库列表页'));
children.push(paraWithTag('筛选+概览+横向可滚动表格', '[一期]'));
children.push(heading3('概览卡片'));
children.push(createTable(
  ['卡片', '示例数据', '落地阶段'],
  [
    ['策略总数', '243', '[一期]'],
    ['AI生成占比', '54%（131条）', '[一期]'],
    ['已验证占比', '71%（173条）', '[一期]'],
    ['本月新增', '12条（9专家+3AI）', '[一期]'],
    ['平均转化率', '8.7%', '[一期]'],
  ]
));

children.push(heading3('表格列'));
children.push(createTable(
  ['列', '说明', '落地阶段'],
  [
    ['策略名称', '固定左侧', '[一期]'],
    ['来源标记', '专家经验/AI生成', '[一期]'],
    ['一级分类', '', '[一期]'],
    ['二级分类', '', '[一期]'],
    ['主推产品', '', '[一期]'],
    ['关联指标数', '数字，可点击展开', '[一期]'],
    ['关联客群数', '数字，可点击展开', '[一期]'],
    ['关联根因数', '数字，可点击展开', '[一期]'],
    ['渠道覆盖', '外呼/企微/短信/...', '[一期]'],
    ['使用频次', '被AI检索命中次数', '[一期]'],
    ['被确认频次', '被运营确认次数', '[一期]'],
    ['平均转化率', '百分比+趋势箭头（近3个月滚动）', '[一期]'],
    ['置信度', '进度条+数值+tooltip说明', '[一期]'],
    ['验证状态', '未验证/已验证/存疑', '[一期]'],
    ['状态', '状态标签', '[一期]'],
    ['操作', '固定右侧：查看详情/编辑/复制/停用/删除', '[一期]'],
  ]
));
children.push(para('注：已去掉"有效性评分"列，增加"关联指标数"和"关联客群数"列。'));

children.push(heading2('4.4 策略库新增/编辑页'));
children.push(heading3('方式选择'));
children.push(bulletItem('手动创建：从空白开始逐步填写7层内容', '[一期]'));
children.push(bulletItem('AI生成：选择根因+客群，AI一键生成7层完整策略，微调后保存', '[二期]'));

children.push(heading3('AI生成流程'));
children.push(para('Step 1：选择触发条件 — 选择关联根因（单选或AI推荐Top5）+ 选择适用客群（多选或AI推荐）'));
children.push(para('Step 2：AI一键生成 — AI基于根因+客群画像+产品目录+历史Top策略，自动生成7层完整内容'));
children.push(para('Step 3：人工微调 — 每层内容都可以编辑修改，每条话术都有"AI重新生成"按钮'));
children.push(para('Step 4：合规校验 — AI自动检查话术合规性+产品可用性+策略冲突，校验通过后保存'));

children.push(heading2('4.5 策略库详情页'));
children.push(paraWithTag('只读展示7层完整信息', '[一期]'));
children.push(bulletItem('基础信息Tab：7层内容只读展示 + 编辑入口', '[一期]'));
children.push(bulletItem('效果分析Tab：转化漏斗图+各渠道转化率对比+转化率趋势图+历次调度执行列表', '[一期]'));
children.push(bulletItem('话术版本Tab：话术版本历史+各版本转化率对比', '[一期]'));
children.push(bulletItem('推导记录Tab：所有引用过该策略的调度单列表，含调度单号、推导时间、匹配方式、验证结果', '[一期]'));
children.push(bulletItem('AI优化建议Tab：话术优化建议+渠道调整建议+时机优化建议+一键应用', '[二期]'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ========== 五、关联关系查询 ==========
children.push(heading1('五、关联关系查询'));
children.push(para('定位：关联关系查询是跨根因库和策略库的全局只读视图，职责是"查看"而非"编辑"。所有编辑操作统一在根因编辑页和策略编辑页完成。独立菜单项便于运营人员快速查看全局关系。'));

children.push(heading2('5.1 五类关联关系（全部只读）'));
children.push(para('注：已去掉"指标↔客群"关联，因该关系在客群管理模块中维护（建客群或修改时选择关联指标，支持导入关系，可配置关联标签和特征值）。关联关系查询中的指标↔根因、客群↔根因为只读视图，数据来源于根因库的关联配置。指标↔策略、客群↔策略、根因↔策略也为只读视图，数据来源于策略库的关联配置。'));

const relationTypes = [
  {
    name: '指标↔根因关联（只读）',
    extraFields: '影响方向（上升/下降）、适用阈值范围、关联强度（1-3级）、诊断特征',
    example: '降档客户数(↑3%-10%) ↔ 竞品资费低于本网同档位（关联强度3）',
    editable: '否，数据来源于根因库关联指标配置',
  },
  {
    name: '客群↔根因关联（只读）',
    extraFields: '客群特征、关联强度（1-3级）',
    example: '价格敏感无合约客户 ↔ 竞品资费低于本网同档位（关联强度3）',
    editable: '否，数据来源于根因库关联客群配置',
  },
  {
    name: '指标↔策略关联（只读）',
    extraFields: '作用方向（改善/恶化）、适用阈值范围、预期效果',
    example: '降档客户数 ↔ 套餐升档推荐-5G畅享199元档（改善，预计降低降档率2~3pp）',
    editable: '否，数据来源于策略库关联指标配置',
  },
  {
    name: '客群↔策略关联（只读）',
    extraFields: '适配度（高/中/低）、关联强度（1-3级）、历史转化率',
    example: '价格敏感无合约客户 ↔ 合约续约锁定-12月享8折（高适配，关联强度3，历史转化率11.2%）',
    editable: '否，数据来源于策略库关联客群配置',
  },
  {
    name: '根因↔策略关联（只读）',
    extraFields: '对应逻辑、关联强度（1-3级）',
    example: '竞品资费低于本网同档位 ↔ 专属续约优惠-合约12月享7折（以更优惠价格锁定客户，抵消竞品价格优势，强）',
    editable: '否，数据来源于策略库关联根因配置',
  },
];

relationTypes.forEach(rt => {
  children.push(heading3(rt.name));
  children.push(para(`特有字段：${rt.extraFields}`));
  children.push(para(`示例：${rt.example}`));
  children.push(para(`可编辑：${rt.editable}`));
});

children.push(heading3('通用字段（5类关联共用）'));
children.push(createTable(
  ['字段', '说明', '落地阶段'],
  [
    ['关联ID', '唯一标识', '[一期]'],
    ['关联类型', '5种之一', '[一期]'],
    ['源实体/目标实体', '关联两端实体名称和ID', '[一期]'],
    ['关联强度', '1-3级，用于AI推荐排序。初期人工设定，后期AI调整', '[一期]'],
    ['业务依据', '建立依据', '[一期]'],
    ['来源标记', '专家经验/AI生成', '[一期]'],
    ['状态', '启用/待确认/停用', '[一期]'],
    ['创建人/创建时间', '自动标记', '[一期]'],
  ]
));
children.push(para('注：已去掉关系级别的"置信度"字段。关系级别只保留关联强度，实体级别的置信度（根因置信度、策略置信度）已能充分表达可靠性。AI推荐时的综合权重 = 实体置信度 x 关联强度。'));

children.push(heading2('5.2 关联关系列表页'));
children.push(paraWithTag('5类Tab切换+筛选+表格+只读/可编辑区分', '[一期]'));
children.push(heading3('Tab说明'));
children.push(createTable(
  ['Tab', '可编辑', '说明', '落地阶段'],
  [
    ['指标↔根因', '否（只读）', '数据来源于根因库的关联指标配置，此处不可新增/编辑', '[一期]'],
    ['客群↔根因', '否（只读）', '数据来源于根因库的关联客群配置，此处不可新增/编辑', '[一期]'],
    ['根因↔策略', '是', '可在本页或策略编辑页中编辑，两处互通', '[一期]'],
    ['指标↔策略', '是', '可在本页或策略编辑页中编辑，两处互通', '[一期]'],
    ['客群↔策略', '是', '可在本页或策略编辑页中编辑，两处互通', '[一期]'],
  ]
));

children.push(heading2('5.3 关联关系网络图'));
children.push(paraWithTag('列表/网络图视图切换', '[一期]'));
children.push(bulletItem('节点4类：指标（蓝色）、根因（红色）、客群（绿色）、策略（橙色）', '[一期]'));
children.push(bulletItem('连线5类：对应5种关联类型，不同颜色区分', '[一期]'));
children.push(bulletItem('指标↔客群关系在网络图中只读展示（数据来源于客群管理），展示完整推理路径', '[一期]'));
children.push(bulletItem('连线粗细=关联强度，节点大小=使用频次', '[一期]'));
children.push(bulletItem('支持拖拽、缩放、点击节点展开局部关系', '[一期]'));
children.push(bulletItem('高亮显示低置信度实体和孤立节点', '[一期]'));

children.push(heading2('5.4 AI推理路径可视化'));
children.push(paraWithTag('在网络图上高亮展示完整的AI推导路径', '[一期]'));
children.push(para('4条推导路径：'));
children.push(bulletItem('路径1（直接关联）：指标→根因→策略（经根因推导）'));
children.push(bulletItem('路径2（经客群推导）：指标→客群→根因→策略'));
children.push(bulletItem('路径3（策略直连指标）：指标→策略（不经根因）'));
children.push(bulletItem('路径4（策略直连客群）：指标→客群→策略（不经根因）'));
children.push(para(''));
children.push(para('大模型的作用：在以上候选根因和候选策略中，结合当前指标变化幅度、客群规模、市场环境等上下文，推导出最合适的根因和策略，排序后在前端展示推荐结果。运营人员确认后可下派调度单。'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ========== 六、AI推导调度流程 ==========
children.push(heading1('六、AI推导调度流程'));

children.push(heading2('6.1 完整推导链路'));
const steps = [
  ['Step 1：客群定位', '异常指标+区域+时间 → 指标↔客群关联 → 按贡献度排序 → AI补充发现的客群', '[一期] + [二期]'],
  ['Step 2：根因推导', '异常指标+受影响客群 → 指标↔根因+客群↔根因交叉匹配 → AI匹配诊断特征+阈值精准匹配 → 根因概率排序 → 匹配度均<0.6则AI生成新根因草稿', '[一期] + [二期]'],
  ['Step 3：策略推导', '根因列表+客群列表 → 根因↔策略+客群↔策略+指标↔策略交叉匹配 → AI选择最优策略 → 匹配度均<0.6则AI生成新策略（7层完整）', '[一期] + [二期]'],
  ['Step 4：调度单生成', '汇总所有客群策略方案 → 智能去重（同一客户只分配一个策略）→ 渠道协同编排 → 生成调度单（记录引用的候选根因/策略ID）', '[一期] + [二期]'],
  ['Step 5：执行与反馈', '调度单下发执行 → 自动采集转化数据 → 运营人员标注根因是否正确 → 效果数据自动回填', '[一期]'],
  ['Step 6：知识库反哺', '更新候选根因/策略的置信度 → 更新关联关系的关联强度 → 低效策略AI建议优化 → 新模式AI建议入库 → 分类聚类优化', '[一期] + [二期]'],
];

steps.forEach(([step, desc, feas]) => {
  children.push(paraWithTag(step, feas));
  children.push(para(`  ${desc}`));
});

children.push(heading2('6.2 AI推导输出示例'));
children.push(para('调度单 #DIS-20260515-001'));
children.push(para('异常指标：降档客户数同比+12%（乌鲁木齐市）'));
children.push(para(''));
children.push(boldPara('【客群A】价格敏感无合约客户（约8.2万户，贡献度38%）'));
children.push(para('  ├ 根因：竞品资费低于本网同档位（置信度0.92 高可靠）'));
children.push(para('  │   引用候选：RC-PRICE-001'));
children.push(para('  │   依据：携转查询环比↑45% + 竞品3月降价 + 无合约客户占比72%'));
children.push(para('  │   匹配方式：直接匹配（诊断特征匹配度0.91）'));
children.push(para('  ├ 策略：合约续约锁定-12月享7折（平均转化率11.2% 已验证）'));
children.push(para('  │   引用候选：ST-RET-003'));
children.push(para('  │   ├ 主推产品：5G畅享159元档（PROD-5G-159）'));
children.push(para('  │   ├ 优惠方案：合约12月享7折 = 月省47元'));
children.push(para('  │   ├ 营销话术：开场→切入→产品→异议处理→促单'));
children.push(para('  │   ├ 渠道：外呼P1 → 企微跟进P2'));
children.push(para('  │   └ 时机：即刻（竞品活动期间）'));
children.push(para('  └ 备选策略：阶梯折扣方案（平均转化率8.5%）'));
children.push(para(''));
children.push(boldPara('【客群B】4G高流量低适配客户（约6.5万户，贡献度35%）'));
children.push(para('  ├ 根因：套餐流量容量不足（置信度0.85 已验证）'));
children.push(para('  │   引用候选：RC-PROD-002'));
children.push(para('  ├ 策略：套餐升档推荐-5G畅享199元档（平均转化率9.6% 已验证）'));
children.push(para('  │   引用候选：ST-VAL-001'));

children.push(heading2('6.3 指标没有直接关联根因时的推导'));
children.push(para('当指标没有直接关联根因，只关联了客群时，AI通过客群作为中间桥梁推导根因：'));
children.push(para(''));
children.push(codeBlock('指标X(异常) → 关联客群G1,G2 → G1关联根因A,B → G2关联根因C'));
children.push(codeBlock('→ AI结合当前数据上下文，推导出最合适根因 → 根因关联策略 → 推荐策略'));
children.push(para(''));
children.push(para('同理，策略也有同样的推导路径：如果指标只关联了客群没有关联策略，AI通过客群→策略的关联关系推导出适用策略。'));
children.push(para(''));
children.push(para('这正是策略必须关联指标和客群的原因：如果策略只关联根因，那么指标→策略直连和指标→客群→策略的推理链路就不通，AI推理路径会断裂。'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ========== 七、效果反馈闭环 ==========
children.push(heading1('七、效果反馈闭环'));

children.push(heading2('7.1 反馈数据采集'));
children.push(paraWithTag('数据来源说明', '[一期]'));
children.push(para('验证数据不依赖人工标注，全部由系统数据客观计算：'));
children.push(para(''));
children.push(createTable(
  ['数据项', '数据来源系统', '计算逻辑', '落地阶段'],
  [
    ['触达记录', '外呼系统/企微平台/短信平台', '每条触达自动记录手机号+策略ID+触达时间+渠道', '[一期]'],
    ['办理记录', 'CRM/BSS业务支撑系统', '每笔订购自动记录手机号+产品编码+办理时间', '[一期]'],
    ['实际转化率', '触达日志 + 订购记录关联', '7天内办理推荐产品客户数 / 触达客户数', '[一期]'],
    ['策略有效性', '实际转化率 vs 目标转化率', '实际转化率>=目标值 → 有效', '[一期]'],
    ['根因正确性', '策略执行后指标变化', '指标如预期方向变化 → 根因正确', '[一期]'],
    ['各渠道转化率', '按渠道分组的触达+订购关联', '各渠道转化率对比', '[一期]'],
    ['置信度', '自动计算', '验证通过次数 / 验证总次数（近N个月滚动窗口）', '[一期]'],
    ['AI验证增强', '大模型多维交叉分析', 'AI分析多因素叠加的根因权重', '[二期]'],
  ]
));

children.push(heading2('7.2 过渡期方案：手动回填'));
children.push(paraWithTag('问题：系统对接需要时间，短期内可能接收不到触达记录和办理记录，导致转化率和置信度无法自动计算', '[一期]'));
children.push(para(''));
children.push(paraWithTag('解决方案：运营人员执行完调度后，手动回填关键执行数据，系统基于回填数据计算转化率和置信度', '[一期]'));
children.push(para(''));
children.push(paraWithTag('过渡期 vs 对接完成后的对比', '[一期]'));
children.push(createTable(
  ['阶段', '转化率来源', '置信度来源', '运营人员操作'],
  [
    ['过渡期（当前）', '手动回填', '基于回填数据自动计算', '执行调度后录入触达数、办理数等关键数据'],
    ['对接完成后', '系统自动采集', '基于系统数据自动计算', '无需操作'],
  ]
));
children.push(para(''));
children.push(paraWithTag('手动回填的交互设计', '[一期]'));
children.push(para('调度单执行后，运营人员在"调度执行结果回填"页面录入：'));
children.push(createTable(
  ['回填项', '说明', '是否必填'],
  [
    ['触达人数', '实际触达客户数', '是'],
    ['接通人数', '外呼接通/企微已读/短信送达', '否'],
    ['意向人数', '表达意向的客户数', '否'],
    ['办理人数', '实际办理推荐产品的客户数', '是'],
    ['根因是否正确', '指标是否如预期方向变化（是/否/不确定）', '是'],
    ['备注', '补充说明', '否'],
  ]
));
children.push(para(''));
children.push(paraWithTag('系统自动计算（基于回填数据）', '[一期]'));
children.push(bulletItem('转化率 = 办理人数 / 触达人数', '[一期]'));
children.push(bulletItem('转化率 >= 目标值 → 策略有效', '[一期]'));
children.push(bulletItem('根因正确 + 策略有效 → 验证通过', '[一期]'));
children.push(bulletItem('置信度 = 验证通过次数 / 验证总次数', '[一期]'));

children.push(heading2('7.3 自动优化动作'));
children.push(createTable(
  ['触发条件', '自动动作', '落地阶段'],
  [
    ['策略转化率连续3次低于均值50%', 'AI建议优化话术或停用策略', '[一期] + [二期]'],
    ['根因验证通过率<50%', '标记"存疑"，AI建议修订或停用', '[一期] + [二期]'],
    ['关联强度持续下降', 'AI建议调整关联强度或停用关联', '[一期] + [二期]'],
    ['某根因90天无使用', 'AI评估是否停用', '[一期] + [二期]'],
    ['某策略30天无使用', 'AI评估是否需要推广或停用', '[一期] + [二期]'],
    ['新产品上线', 'AI自动生成配套策略草稿', '[二期]'],
    ['竞品动态变化', 'AI自动更新受影响的根因和策略', '[二期]'],
    ['分类下条目语义分化', 'AI建议拆分分类', '[二期]'],
    ['两个分类语义重叠', 'AI建议合并分类', '[二期]'],
  ]
));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ========== 八、页面改造方案汇总 ==========
children.push(heading1('八、页面改造方案汇总'));

children.push(heading2('8.1 左侧导航结构'));
children.push(para('策略管理'));
children.push(para('  ├── 根因库管理      /workspace/strategy/root-cause'));
children.push(para('  ├── 策略库管理      /workspace/strategy/library'));
children.push(para('  └── 关联关系查询    /workspace/strategy/relation'));
children.push(para(''));
children.push(para('注：关联关系查询为独立菜单项，全部只读展示。编辑操作在根因库编辑页（关联指标/客群）和策略库编辑页（关联根因/指标/客群）中完成。'));

children.push(heading2('8.2 各页面清单'));
children.push(createTable(
  ['页面', '路径', '核心功能', '落地阶段'],
  [
    ['根因库列表', '/workspace/strategy/root-cause', '筛选+概览+表格（含置信度tooltip、无有效性列、来源2种、无AI推荐按钮）', '[一期]'],
    ['根因库新增/编辑', '/workspace/strategy/root-cause/edit', '7层结构（基础+结构化诊断特征+关联指标含阈值+关联客群+业务场景+标签初始字典）', '[一期] + [二期]'],
    ['根因库详情', '/workspace/strategy/root-cause/[id]', '只读展示+推导记录Tab', '[一期] + [二期]'],
    ['策略库列表', '/workspace/strategy/library', '筛选+概览+表格（含关联指标/客群列、业务场景列、来源2种、无AI推荐按钮）', '[一期]'],
    ['策略库新增/编辑', '/workspace/strategy/library/edit', '7层结构（+关联配置+业务场景+产品选择器+统计周期+设定依据）', '[一期] + [二期]'],
    ['策略库详情', '/workspace/strategy/library/[id]', '只读展示7层+推导记录Tab', '[一期] + [二期]'],
    ['关联关系查询', '/workspace/strategy/relation', '5类Tab只读展示+阈值展示+网络图（独立菜单，所有关联数据来源于根因库和策略库）', '[一期] + [二期]'],
  ]
));

children.push(heading2('8.3 本次改造变更点汇总'));
children.push(createTable(
  ['模块', '变更项', '变更原因'],
  [
    ['根因库', '去掉有效性评分列', '与置信度概念重叠，置信度已能表达可靠性'],
    ['根因库', '来源简化为专家经验/AI生成', 'AI发现和AI生成从使用者角度无区别，减少理解成本'],
    ['根因库', '关联指标增加适用阈值范围', '不同变化幅度对应不同根因，阈值实现精准匹配'],
    ['根因库', '诊断特征改为结构化特征项列表', '纯文本无法做精准结构化匹配，AI需要可比较的特征项'],
    ['根因库', '关联强度增加用途说明', '运营人员需知道关联强度不是仅展示，用于AI推荐排序'],
    ['根因库', '新增详情页', '原有遗漏'],
    ['策略库', '增加关联配置层（关联根因+指标+客群）', '策略必须关联三类实体以支撑AI推理多路径'],
    ['策略库', '产品改为搜索选择器', '手工输入不合理，产品编码/名称应从产品目录选择回填'],
    ['策略库', '增加统计周期配置', '不采用一直累计，使用滚动窗口避免旧数据失真'],
    ['策略库', '目标转化率增加设定依据', '人工定目标需有依据（历史数据/行业基准/考核要求）'],
    ['策略库', '渠道优先级/执行规范增加用途说明', '运营人员需知道这些不是仅展示，是调度单的模板参数'],
    ['策略库', '新增详情页', '原有遗漏'],
    ['关联关系', '去掉指标↔客群Tab', '已在客群管理中维护，不重复'],
    ['关联关系', '指标↔根因、客群↔根因改只读', '编辑统一在根因库，避免数据不一致'],
    ['关联关系', '去掉关系级置信度', '与实体级置信度混淆，只保留关联强度'],
    ['全局', '新增候选库与执行实例两层体系说明', '澄清候选库是知识层，调度单是执行层，统计通过引用关联打通'],
    ['全局', '新增AI推理路径说明', '4条推导路径确保AI推理链路完整不断裂'],
    ['根因库V3', '新增时来源固定为"专家经验"不可选', '人工操作不能自选来源，AI生成由系统自动标记'],
    ['根因库V3', '编辑时来源置灰不可修改', '来源是事实记录不应被篡改'],
    ['根因库V3', 'AI生成的根因被人工修改后来源自动变为"专家经验"', '修改后的内容反映人工判断，不再是纯AI输出'],
    ['根因库V3', '标签增加初始字典（12个维度约50+标签）', '不应一开始一个没有全由人填，AI可自动打标人工确认'],
    ['根因库V3', '增加业务场景字段（7个选项多选）', '业务场景是根因归类和AI匹配的关键维度'],
    ['根因库V3', '关联指标选择改为弹窗选择器', '指标数量可能有数百上千，下拉框不可用'],
    ['根因库V3', '关联指标阈值改为结构化输入（运算符+数字+单位）', '自由文本会乱填，必须结构化约束'],
    ['根因库V3', '关联客群选择改为弹窗选择器', '客群数量多时下拉框不可用'],
    ['根因库V3', '去掉列表页AI推荐根因按钮', '当前无大模型对接，空壳功能先移除'],
    ['策略库V3', '新增时来源固定为"专家经验"不可选', '同根因'],
    ['策略库V3', '编辑时来源置灰不可修改', '同根因'],
    ['策略库V3', 'AI生成的策略被人工修改后来源自动变为"专家经验"', '同根因'],
    ['策略库V3', '关联根因/指标/客群/产品全部改为弹窗选择器', '数据量大时下拉框不可用'],
    ['策略库V3', '关联指标阈值改为结构化输入', '同根因'],
    ['策略库V3', '去掉列表页AI推荐策略按钮', '同根因'],
    ['关联关系V3', '恢复独立菜单项，改名为"关联关系查询"', '跨库全局查询视角，独立菜单比藏在跳转链接更直观，名实相符（全部只读）'],
    ['关联关系V3', '全部改为只读展示，去掉新增/编辑功能', '编辑统一在根因/策略编辑页，避免两处改同一数据'],
    ['关联关系V3', '指标↔根因关系列表增加适用阈值范围列', '同一指标不同阈值对应不同根因，是精准匹配核心信息'],
    ['关联关系V3', '去掉AI推理路径按钮', '当前无大模型对接，空壳功能先移除'],
    ['策略库V3', '列表页增加业务场景列和筛选条件', '与根因库一致，业务场景是策略归类和AI匹配的关键维度'],
    ['策略库V3', '编辑页增加业务场景多选字段', '同根因库，策略需标明适用的业务场景'],
    ['通用V3', '新增4个选择弹窗组件', 'IndicatorSelector/CustomerGroupSelector/RootCauseSelector/ProductSelector'],
  ]
));

children.push(heading2('8.4 落地阶段汇总'));
children.push(createTable(
  ['类别', '占比', '说明'],
  [
    ['[一期]', '约40%', '数据模型定义、页面框架、分类字典、基础CRUD、来源标记、标签体系等'],
    ['[一期]', '约20%', '所有列表页、编辑页、详情页、网络图等页面原型'],
    ['[一期]', '约25%', '效果统计、置信度计算、转化率采集、自动优化动作等'],
    ['[二期]', '约15%', 'AI生成话术、AI推荐关联、AI推导调度、AI聚类分类、合规校验等'],
  ]
));

children.push(para(''));
children.push(para('说明：Coze沙箱负责完成所有[一期]部分，生成可交互的页面原型。[一期]部分的基础数据结构在原型中以Mock数据体现。[二期]部分在原型中以UI占位和交互流程设计体现，具体实现由技术侧完成。'));

// ========== 生成文档 ==========
const doc = new Document({
  sections: [{ children }],
  styles: {
    default: {
      document: {
        run: { font: 'Microsoft YaHei', size: 21 },
      },
    },
  },
});

const buffer = await Packer.toBuffer(doc);
const outputPath = '/workspace/projects/docs/需求设计方案/指标策略知识库管理-完整设计方案.docx';
fs.writeFileSync(outputPath, buffer);
console.log(`Document generated successfully at: ${outputPath}`);
