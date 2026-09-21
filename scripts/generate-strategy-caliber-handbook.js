/**
 * 策略分析口径体系——场景穿越验证手册 Word 生成脚本
 * 
 * 核心差异（vs 工单分析）：
 * 1. 只有派发视角，无接单视角
 * 2. 行为量按主工单计数（策略派发数量=主工单数，非子单数）
 * 3. 覆盖量按叶子子单汇总（与工单分析一致）
 * 4. 统计范围：strategyId非空 且 ticketType非IND 的工单
 */

const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, HeadingLevel, BorderStyle, ShadingType, TableLayoutType } = require('docx');

// ─── 样式工具函数 ───

const FONT = 'Microsoft YaHei';
const COLOR_TITLE = '1F4E79';
const COLOR_STRATEGY = '6B3FA0';

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 80 },
    ...opts,
    children: [new TextRun({ text, font: FONT, size: 21, ...opts.runOpts })]
  });
}

function boldPara(label, value) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: label, font: FONT, size: 21, bold: true }),
      new TextRun({ text: value, font: FONT, size: 21 }),
    ]
  });
}

function bulletPara(text) {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 600 },
    children: [
      new TextRun({ text: '• ', font: FONT, size: 21 }),
      new TextRun({ text, font: FONT, size: 21 }),
    ]
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, font: FONT, size: 32, bold: true, color: COLOR_TITLE })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, font: FONT, size: 28, bold: true, color: COLOR_TITLE })]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 150, after: 80 },
    children: [new TextRun({ text, font: FONT, size: 24, bold: true, color: COLOR_STRATEGY })]
  });
}

// ─── 表格工具函数 ───

function headerCell(text, widthPct, opts = {}) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { fill: '1F4E79', type: ShadingType.CLEAR },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, font: FONT, size: 18, color: 'FFFFFF' })]
    })]
  });
}

function dataCell(text, widthPct, opts = {}) {
  const color = opts.color || '000000';
  const bold = opts.bold || false;
  const shading = opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined;
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: String(text), font: FONT, size: 18, color, bold })]
    })]
  });
}

function dataCellLeft(text, widthPct, opts = {}) {
  const color = opts.color || '000000';
  const bold = opts.bold || false;
  const shading = opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined;
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading,
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { left: 100 },
      children: [new TextRun({ text: String(text), font: FONT, size: 18, color, bold })]
    })]
  });
}

// ─── 场景数据 ───

const scenarios = [
  {
    id: 1,
    name: '省公司策略直派地市（不拆单）',
    desc: '新疆省公司决定执行策略S1001，创建主工单W1，直接派给乌鲁木齐和克拉玛依，各1个子单直派到位，无拆单。主工单W1=1次策略派发决策。',
    regions: ['新疆', '乌鲁木齐', '克拉玛依'],
    mainOrders: [
      { id: 'W1', dispatcher: '新疆', strategyId: 'S1001', strategySource: 'AI推荐', ticketType: 'STR', status: '已完成' },
    ],
    subOrders: [
      { id: 'S1-1', mainOrder: 'W1', from: '新疆', to: '乌鲁木齐', ticketType: 'STR', status: 'completed', target: 500, reached: 420, success: 42, isSplit: false },
      { id: 'S1-2', mainOrder: 'W1', from: '新疆', to: '克拉玛依', ticketType: 'STR', status: 'completed', target: 300, reached: 255, success: 26, isSplit: false },
    ],
    ownLevel: [
      { region: '新疆', dispatchCount: 1, completedCount: 1, target: 800, reached: 675, success: 68, reachRate: '84.4%', successRate: '10.1%', completionRate: '100%' },
      { region: '乌鲁木齐', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '克拉玛依', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    fullScope: [
      { region: '新疆', dispatchCount: 1, completedCount: 1, target: 800, reached: 675, success: 68, reachRate: '84.4%', successRate: '10.1%', completionRate: '100%' },
      { region: '乌鲁木齐', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '克拉玛依', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    ownDerivation: '新疆本级策略派发数量=1（主工单W1）；目标客户量=S1-1(500)+S1-2(300)=800；触达=420+255=675；成功=42+26=68',
    fullDerivation: '【行为量】新疆全口径策略派发数量=本级(1)+乌鲁木齐(0)+克拉玛依(0)=1\n【覆盖量】叶子子单汇总=S1-1(500)+S1-2(300)=800，与本级一致（无拆单、下级无派发）',
    validations: [
      { item: '策略派发数量=主工单数，不是子单数', left: '1(W1)', right: '≠2(S1-1+S1-2)', result: '✓ 按主工单计数' },
      { item: '全口径策略派发数量=本级（下级无派发）', left: '1', right: '1', result: '✓ 相等' },
      { item: '覆盖量本级=全口径（无拆单无差异）', left: '800', right: '800', result: '✓ 相等' },
    ],
    observations: [
      '【核心验证】策略派发数量按主工单计数=1，不是按子单计数=2。1条主工单=1次策略派发决策，派给2个地市是执行分发，不是2次决策。',
      '无拆单场景：行为量与覆盖量的本级/全口径完全一致，无差异。',
    ]
  },
  {
    id: 2,
    name: '同一策略被多条主工单复用',
    desc: '策略S1001又在主工单W2中使用，派给阿克苏和喀什。此时S1001在2条主工单中共使用。同一策略被N条主工单使用=策略派发N次，不去重。',
    regions: ['新疆', '阿克苏', '喀什'],
    mainOrders: [
      { id: 'W1', dispatcher: '新疆', strategyId: 'S1001', strategySource: 'AI推荐', ticketType: 'STR', status: '已完成' },
      { id: 'W2', dispatcher: '新疆', strategyId: 'S1001', strategySource: 'AI推荐', ticketType: 'STR', status: '已完成' },
    ],
    subOrders: [
      { id: 'S1-1', mainOrder: 'W1', from: '新疆', to: '乌鲁木齐', ticketType: 'STR', status: 'completed', target: 500, reached: 420, success: 42, isSplit: false },
      { id: 'S1-2', mainOrder: 'W1', from: '新疆', to: '克拉玛依', ticketType: 'STR', status: 'completed', target: 300, reached: 255, success: 26, isSplit: false },
      { id: 'S2-1', mainOrder: 'W2', from: '新疆', to: '阿克苏', ticketType: 'STR', status: 'completed', target: 600, reached: 510, success: 51, isSplit: false },
      { id: 'S2-2', mainOrder: 'W2', from: '新疆', to: '喀什', ticketType: 'STR', status: 'completed', target: 400, reached: 340, success: 34, isSplit: false },
    ],
    ownLevel: [
      { region: '新疆', dispatchCount: 2, completedCount: 2, target: 1800, reached: 1525, success: 153, reachRate: '84.7%', successRate: '10.0%', completionRate: '100%' },
    ],
    fullScope: [
      { region: '新疆', dispatchCount: 2, completedCount: 2, target: 1800, reached: 1525, success: 153, reachRate: '84.7%', successRate: '10.0%', completionRate: '100%' },
    ],
    ownDerivation: '新疆本级策略派发数量=2（主工单W1+W2，同一策略S1001被2条主工单使用，不去重）；目标客户量=800(W1)+1000(W2)=1800',
    fullDerivation: '【行为量】新疆全口径=本级(2)+下级(0)=2\n【覆盖量】叶子子单汇总=S1-1(500)+S1-2(300)+S2-1(600)+S2-2(400)=1800',
    validations: [
      { item: '策略不去重：S1001在W1和W2中使用→策略派发数量=2', left: '2', right: '≠1(去重)', result: '✓ 不去重' },
      { item: '目标客户量=各主工单目标之和', left: '800+1000', right: '1800', result: '✓ 相等' },
    ],
    observations: [
      '【策略不去重规则验证】同一策略S1001在2条主工单中使用，策略派发数量=2，不是去重后的1。这2次策略派发是2个独立决策。',
      '策略本身没有"目标客户量"属性，目标客户量在工单中定义。不同工单使用同一策略时，圈选的目标客户不同（如W1圈选的是乌鲁木齐+克拉玛依的流量达量用户，W2圈选的是阿克苏+喀什的流量达量用户），不会重叠。',
    ]
  },
  {
    id: 3,
    name: '省公司策略经地市拆单（一级拆单）',
    desc: '新疆创建主工单W3执行策略S1002，初始拆1个子单S3-1给乌鲁木齐（isSplit=true，已被拆单），乌鲁木齐接收后再拆成S3-2(天山区)和S3-3(沙区)。策略派发数量=1（1条主工单），目标客户量全口径用叶子子单汇总。',
    regions: ['新疆', '乌鲁木齐', '天山区', '沙区'],
    mainOrders: [
      { id: 'W3', dispatcher: '新疆', strategyId: 'S1002', strategySource: '人工创建', ticketType: 'STR', status: '已完成' },
    ],
    subOrders: [
      { id: 'S3-1', mainOrder: 'W3', from: '新疆', to: '乌鲁木齐', ticketType: 'STR', status: 'completed', target: 1000, reached: 800, success: 80, isSplit: true },
      { id: 'S3-2', mainOrder: 'W3', from: '乌鲁木齐', to: '天山区', ticketType: 'STR', status: 'completed', target: 600, reached: 480, success: 48, isSplit: false },
      { id: 'S3-3', mainOrder: 'W3', from: '乌鲁木齐', to: '沙区', ticketType: 'STR', status: 'completed', target: 400, reached: 320, success: 32, isSplit: false },
    ],
    ownLevel: [
      { region: '新疆', dispatchCount: 1, completedCount: 1, target: 1000, reached: 800, success: 80, reachRate: '80.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '乌鲁木齐', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '天山区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '沙区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    fullScope: [
      { region: '新疆', dispatchCount: 1, completedCount: 1, target: 1000, reached: 800, success: 80, reachRate: '80.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '乌鲁木齐', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '天山区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '沙区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    ownDerivation: '新疆本级策略派发数量=1（主工单W3）；目标客户量=S3-1的值=1000；触达/成功=S3-1从叶子汇总=480+320=800 / 48+32=80',
    fullDerivation: '【行为量】新疆全口径=本级(1)+乌鲁木齐(0)+下级(0)=1\n【覆盖量】叶子子单汇总=S3-2(600)+S3-3(400)=1000（S3-1 isSplit=true跳过）。注意：本级目标1000=全口径叶子汇总1000，拆单前后总量守恒',
    validations: [
      { item: '策略派发数量=1（主工单），不是3（子单数）', left: '1(W3)', right: '≠3(S3-1+S3-2+S3-3)', result: '✓ 按主工单计数' },
      { item: '全口径覆盖量叶子汇总≠递归汇总', left: 'S3-2+S3-3=1000', right: '≠S3-1+S3-2+S3-3=2000', result: '✓ 叶子去重正确' },
      { item: '拆单前后覆盖量守恒', left: 'S3-1(1000)', right: 'S3-2(600)+S3-3(400)=1000', result: '✓ 守恒' },
    ],
    observations: [
      '【拆单场景核心验证】策略派发数量=1（1条主工单W3=1次策略派发决策），不是3（1个中间子单+2个叶子子单）。拆单是执行分发，不是多次决策。',
      'isSplit=true的中间子单S3-1不参与全口径覆盖量汇总，避免重复计数。全口径目标客户量=1000（叶子汇总），不是2000（递归汇总）。',
      '乌鲁木齐执行了拆单动作，但不是W3的派单方，所以乌鲁木齐本级策略派发数量=0。',
    ]
  },
  {
    id: 4,
    name: '非策略调度类型关联策略（客群调度CG-OP）',
    desc: '乌鲁木齐执行客群调度，主工单W4关联策略S1003，派给天山区。ticketType=CG-OP但strategyId非空，纳入策略分析统计。验证"策略跟着工单走"规则。',
    regions: ['新疆', '乌鲁木齐', '天山区'],
    mainOrders: [
      { id: 'W4', dispatcher: '乌鲁木齐', strategyId: 'S1003', strategySource: 'AI推荐', ticketType: 'CG-OP', status: '已完成' },
    ],
    subOrders: [
      { id: 'S4-1', mainOrder: 'W4', from: '乌鲁木齐', to: '天山区', ticketType: 'CG-OP', status: 'completed', target: 350, reached: 280, success: 28, isSplit: false },
    ],
    ownLevel: [
      { region: '乌鲁木齐', dispatchCount: 1, completedCount: 1, target: 350, reached: 280, success: 28, reachRate: '80.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '天山区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    fullScope: [
      { region: '乌鲁木齐', dispatchCount: 1, completedCount: 1, target: 350, reached: 280, success: 28, reachRate: '80.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '天山区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    ownDerivation: '乌鲁木齐本级策略派发数量=1（主工单W4，CG-OP类型但strategyId=S1003非空→纳入策略分析）；目标客户量=S4-1(350)',
    fullDerivation: '【行为量】乌鲁木齐全口径=本级(1)+天山区(0)=1\n【覆盖量】叶子子单汇总=S4-1(350)=350',
    validations: [
      { item: 'CG-OP类型+strategyId非空→纳入策略分析', left: '纳入', right: 'CG-OP≠STR', result: '✓ 策略跟着工单走' },
      { item: '策略派发数量=主工单数', left: '1(W4)', right: '=1', result: '✓' },
    ],
    observations: [
      '【非STR类型纳入规则验证】客群调度(CG-OP)类型的工单W4因为关联了策略S1003，被纳入策略分析统计范围。',
      '如果W4的strategyId为空，则不纳入策略分析（但仍在工单分析中统计）。',
      '策略分析统计范围="所有strategyId非空且ticketType非IND的工单"，不是"只看STR类型"。',
    ]
  },
  {
    id: 5,
    name: '地市策略经区县二次拆单（二级拆单链）',
    desc: '乌鲁木齐创建主工单W5执行策略S1004，拆1个子单S5-1给天山区（isSplit=true），天山区再拆成S5-2(网格A)和S5-3(网格B)。形成"乌鲁木齐→天山区→网格"的二级拆单链。策略派发数量=1（1条主工单）。',
    regions: ['乌鲁木齐', '天山区', '网格A', '网格B'],
    mainOrders: [
      { id: 'W5', dispatcher: '乌鲁木齐', strategyId: 'S1004', strategySource: '人工创建', ticketType: 'STR', status: '已完成' },
    ],
    subOrders: [
      { id: 'S5-1', mainOrder: 'W5', from: '乌鲁木齐', to: '天山区', ticketType: 'STR', status: 'completed', target: 500, reached: 400, success: 40, isSplit: true },
      { id: 'S5-2', mainOrder: 'W5', from: '天山区', to: '网格A', ticketType: 'STR', status: 'completed', target: 300, reached: 240, success: 24, isSplit: false },
      { id: 'S5-3', mainOrder: 'W5', from: '天山区', to: '网格B', ticketType: 'STR', status: 'completed', target: 200, reached: 160, success: 16, isSplit: false },
    ],
    ownLevel: [
      { region: '乌鲁木齐', dispatchCount: 1, completedCount: 1, target: 500, reached: 400, success: 40, reachRate: '80.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '天山区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '网格A', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '网格B', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    fullScope: [
      { region: '乌鲁木齐', dispatchCount: 1, completedCount: 1, target: 500, reached: 400, success: 40, reachRate: '80.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '天山区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '网格A', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '网格B', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    ownDerivation: '乌鲁木齐本级策略派发数量=1（主工单W5）；目标=S5-1(500)；触达=从叶子汇总=240+160=400；成功=24+16=40',
    fullDerivation: '【行为量】乌鲁木齐全口径=本级(1)+天山区(0)+下级(0)=1\n【覆盖量】叶子子单汇总=S5-2(300)+S5-3(200)=500（S5-1 isSplit=true跳过）。拆单前后总量守恒：500=300+200',
    validations: [
      { item: '策略派发数量=1（主工单），不是3（子单）', left: '1(W5)', right: '≠3', result: '✓ 按主工单计数' },
      { item: '二级拆单链覆盖量叶子汇总正确', left: 'S5-2+S5-3=500', right: '≠S5-1+S5-2+S5-3=1000', result: '✓ 去重正确' },
    ],
    observations: [
      '【二级拆单链验证】天山区执行了拆单但不是W5的派单方→天山区本级策略派发数量=0。策略派发归属只看主工单的派单方。',
      '覆盖量叶子汇总跨二级拆单链：S5-1(isSplit=true，跳过)→S5-2(300)+S5-3(200)=500。全口径目标=500，不是递归汇总的1000。',
    ]
  },
  {
    id: 6,
    name: '区域攻坚跨级直达网格 + 客户商机调度关联策略',
    desc: '主工单W6(RAS类型)：新疆执行区域攻坚调度，关联策略S1005，跨级直达天山区网格A。主工单W8(COD类型)：乌鲁木齐执行客户商机调度，关联策略S1007，派给沙区，状态待处理。',
    regions: ['新疆', '乌鲁木齐', '天山区', '沙区', '网格A'],
    mainOrders: [
      { id: 'W6', dispatcher: '新疆', strategyId: 'S1005', strategySource: 'AI推荐', ticketType: 'RAS', status: '已完成' },
      { id: 'W8', dispatcher: '乌鲁木齐', strategyId: 'S1007', strategySource: '人工创建', ticketType: 'COD', status: '待处理' },
    ],
    subOrders: [
      { id: 'S6-1', mainOrder: 'W6', from: '新疆', to: '网格A', ticketType: 'RAS', status: 'completed', target: 200, reached: 160, success: 16, isSplit: false },
      { id: 'S8-1', mainOrder: 'W8', from: '乌鲁木齐', to: '沙区', ticketType: 'COD', status: 'pending', target: 250, reached: 0, success: 0, isSplit: false },
    ],
    ownLevel: [
      { region: '新疆', dispatchCount: 1, completedCount: 1, target: 200, reached: 160, success: 16, reachRate: '80.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '乌鲁木齐', dispatchCount: 1, completedCount: 0, target: 250, reached: 0, success: 0, reachRate: '0%', successRate: '—', completionRate: '0%' },
      { region: '天山区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '沙区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '网格A', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    fullScope: [
      { region: '新疆', dispatchCount: 1, completedCount: 1, target: 200, reached: 160, success: 16, reachRate: '80.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '乌鲁木齐', dispatchCount: 1, completedCount: 0, target: 250, reached: 0, success: 0, reachRate: '0%', successRate: '—', completionRate: '0%' },
      { region: '天山区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '沙区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '网格A', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    ownDerivation: '新疆本级：W6(RAS类型+策略S1005)策略派发数量=1，目标=S6-1(200)；乌鲁木齐本级：W8(COD类型+策略S1007)策略派发数量=1，待处理，目标=S8-1(250)，触达=0',
    fullDerivation: '【行为量】新疆全口径=1+乌鲁木齐(1)+其他(0)=2；乌鲁木齐全口径=1+0=1\n【覆盖量】新疆全口径叶子=S6-1(200)+S8-1(250)=450；乌鲁木齐叶子=S8-1(250)=250',
    validations: [
      { item: 'RAS类型+strategyId非空→纳入策略分析', left: '纳入', right: 'RAS≠STR', result: '✓ 策略跟着工单走' },
      { item: 'COD类型+strategyId非空→纳入策略分析', left: '纳入', right: 'COD≠STR', result: '✓ 策略跟着工单走' },
      { item: '待处理工单：目标照计，触达=0', left: '250', right: '触达=0', result: '✓ 待处理未执行' },
    ],
    observations: [
      '【多类型工单关联策略验证】RAS(区域攻坚)和COD(客户商机调度)都因为关联了策略而被纳入策略分析，验证"策略跟着工单走"规则。',
      '【待处理工单覆盖量规则】W8状态=待处理，目标客户量=250照常计入（已确定圈选），触达=0（尚未执行），成功率显示"—"（触达为0时不可计算）。',
      '【跨级直达验证】W6的S6-1派单方=新疆，接单方=网格A，跳过了乌鲁木齐和天山区。策略派发数量归新疆本级，乌鲁木齐和天山区本级均为0。',
    ]
  },
  {
    id: 7,
    name: '省公司自执行策略',
    desc: '新疆创建主工单W7执行策略S1006，自己执行不往下派。派单方=接单方=新疆。策略派发数量=1（1条主工单）。',
    regions: ['新疆', '乌鲁木齐'],
    mainOrders: [
      { id: 'W7', dispatcher: '新疆', strategyId: 'S1006', strategySource: '人工创建', ticketType: 'STR', status: '已完成' },
    ],
    subOrders: [
      { id: 'S7-1', mainOrder: 'W7', from: '新疆', to: '新疆', ticketType: 'STR', status: 'completed', target: 150, reached: 120, success: 12, isSplit: false },
    ],
    ownLevel: [
      { region: '新疆', dispatchCount: 1, completedCount: 1, target: 150, reached: 120, success: 12, reachRate: '80.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '乌鲁木齐', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    fullScope: [
      { region: '新疆', dispatchCount: 1, completedCount: 1, target: 150, reached: 120, success: 12, reachRate: '80.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '乌鲁木齐', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    ownDerivation: '新疆本级策略派发数量=1（主工单W7）；目标=S7-1(150)；触达=120；成功=12',
    fullDerivation: '【行为量】新疆全口径=本级(1)+乌鲁木齐(0)=1\n【覆盖量】叶子子单汇总=S7-1(150)=150',
    validations: [
      { item: '自执行：策略派发数量归派单方（新疆）', left: '1', right: '乌鲁木齐=0', result: '✓ 派单方归属' },
      { item: '本级=全口径（无下级派发）', left: '1', right: '1', result: '✓' },
    ],
    observations: [
      '派单方=接单方=新疆 → 策略派发数量归新疆本级。乌鲁木齐在本场景中完全无关。',
      '这是省公司自建自营的真实业务场景，如省公司自己执行品牌推广策略。',
    ]
  },
  {
    id: 8,
    name: '用户举例场景：策略S1001在4条主工单中使用',
    desc: '策略S1001在4条主工单中使用：2条新疆派的（W1给乌鲁木齐、W2给克拉玛依），2条乌鲁木齐派的（W3给天山区、W4给沙区）。每条工单目标1000客户。验证：新疆本级策略派发数量=2，目标=2000；新疆全口径=4，目标=4000；乌鲁木齐本级=2，目标=2000；乌鲁木齐全口径=2，目标=2000。',
    regions: ['新疆', '乌鲁木齐', '天山区', '沙区', '克拉玛依'],
    mainOrders: [
      { id: 'W1', dispatcher: '新疆', strategyId: 'S1001', strategySource: 'AI推荐', ticketType: 'STR', status: '已完成' },
      { id: 'W2', dispatcher: '新疆', strategyId: 'S1001', strategySource: 'AI推荐', ticketType: 'STR', status: '已完成' },
      { id: 'W3', dispatcher: '乌鲁木齐', strategyId: 'S1001', strategySource: 'AI推荐', ticketType: 'STR', status: '已完成' },
      { id: 'W4', dispatcher: '乌鲁木齐', strategyId: 'S1001', strategySource: 'AI推荐', ticketType: 'STR', status: '已完成' },
    ],
    subOrders: [
      { id: 'S8-1', mainOrder: 'W1', from: '新疆', to: '乌鲁木齐', ticketType: 'STR', status: 'completed', target: 1000, reached: 850, success: 85, isSplit: false },
      { id: 'S8-2', mainOrder: 'W2', from: '新疆', to: '克拉玛依', ticketType: 'STR', status: 'completed', target: 1000, reached: 850, success: 85, isSplit: false },
      { id: 'S8-3', mainOrder: 'W3', from: '乌鲁木齐', to: '天山区', ticketType: 'STR', status: 'completed', target: 1000, reached: 850, success: 85, isSplit: false },
      { id: 'S8-4', mainOrder: 'W4', from: '乌鲁木齐', to: '沙区', ticketType: 'STR', status: 'completed', target: 1000, reached: 850, success: 85, isSplit: false },
    ],
    ownLevel: [
      { region: '新疆', dispatchCount: 2, completedCount: 2, target: 2000, reached: 1700, success: 170, reachRate: '85.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '乌鲁木齐', dispatchCount: 2, completedCount: 2, target: 2000, reached: 1700, success: 170, reachRate: '85.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '天山区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '沙区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '克拉玛依', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    fullScope: [
      { region: '新疆', dispatchCount: 4, completedCount: 4, target: 4000, reached: 3400, success: 340, reachRate: '85.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '乌鲁木齐', dispatchCount: 2, completedCount: 2, target: 2000, reached: 1700, success: 170, reachRate: '85.0%', successRate: '10.0%', completionRate: '100%' },
      { region: '天山区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '沙区', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
      { region: '克拉玛依', dispatchCount: 0, completedCount: 0, target: 0, reached: 0, success: 0, reachRate: '—', successRate: '—', completionRate: '—' },
    ],
    ownDerivation: '新疆本级策略派发数量=2（W1+W2，都是新疆作为派单方）；目标=1000+1000=2000；乌鲁木齐本级策略派发数量=2（W3+W4，都是乌鲁木齐作为派单方）；目标=1000+1000=2000',
    fullDerivation: '【行为量】新疆全口径=本级(2)+乌鲁木齐全口径(2)+克拉玛依(0)=4；乌鲁木齐全口径=本级(2)+天山区(0)+沙区(0)=2\n【覆盖量】新疆全口径叶子=S8-1(1000)+S8-2(1000)+S8-3(1000)+S8-4(1000)=4000；乌鲁木齐叶子=S8-3(1000)+S8-4(1000)=2000',
    validations: [
      { item: '新疆本级策略派发数量=2', left: 'W1+W2=2', right: '目标=2000', result: '✓ 与用户举例一致' },
      { item: '新疆全口径策略派发数量=4', left: '2+2=4', right: '目标=4000', result: '✓ 与用户举例一致' },
      { item: '乌鲁木齐本级策略派发数量=2', left: 'W3+W4=2', right: '目标=2000', result: '✓ 与用户举例一致' },
      { item: '乌鲁木齐全口径策略派发数量=2', left: '2+0=2', right: '目标=2000', result: '✓ 与用户举例一致' },
      { item: '策略不去重：S1001在4条主工单中使用', left: '策略派发数量=4', right: '≠1(去重)', result: '✓ 不去重' },
    ],
    observations: [
      '【用户举例场景验证】这是用户给出的标准测试用例，所有口径数据与用户描述完全一致。',
      '新疆全口径策略派发数量=4=新疆本级(2)+乌鲁木齐全口径(2)。新疆自己派了2条(W1+W2)，乌鲁木齐又派了2条(W3+W4)也用了S1001。',
      '乌鲁木齐全口径=2+0=2。乌鲁木齐自己派了2条，天山区和沙区没有再派发，所以全口径=本级。',
      '策略S1001不去重：虽然4条主工单都用了S1001，但策略派发数量=4次，不是去重后的1次。4次策略派发=4个独立决策。',
    ]
  },
];

// ─── 表格生成函数 ───

function mainOrderDetailTable(mainOrders) {
  const hRow = new TableRow({ tableHeader: true, children: [
    headerCell('主工单ID', 10), headerCell('派单方', 10), headerCell('策略编号', 10),
    headerCell('策略来源', 10), headerCell('工单类型', 10), headerCell('状态', 10),
  ]});
  const dRows = mainOrders.map(mo => new TableRow({ children: [
    dataCell(mo.id, 10), dataCell(mo.dispatcher, 10), dataCell(mo.strategyId, 10),
    dataCell(mo.strategySource, 10, { color: mo.strategySource === 'AI推荐' ? '0066AA' : '008800' }),
    dataCell(mo.ticketType, 10, { color: mo.ticketType !== 'STR' ? 'CC8800' : '000000', bold: mo.ticketType !== 'STR' }),
    dataCell(mo.status === '已完成' ? '已完成' : '待处理', 10,
      { color: mo.status === '待处理' ? 'CC8800' : '008800' }),
  ]}));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [hRow, ...dRows] });
}

function subOrderDetailTable(subOrders) {
  const hRow = new TableRow({ tableHeader: true, children: [
    headerCell('子单ID', 8), headerCell('主工单', 8), headerCell('派单方', 9), headerCell('接单方', 9),
    headerCell('工单类型', 8), headerCell('状态', 8), headerCell('目标客户', 9),
    headerCell('触达客户', 9), headerCell('营销成功', 9), headerCell('是否被拆单', 11),
    headerCell('业务含义', 12)
  ]});
  const dRows = subOrders.map(so => {
    const splitMeaning = so.isSplit
      ? '中间子单：被接收方二次拆分，不参与全口径覆盖量汇总'
      : '叶子子单：未被拆分，是实际执行单元，参与全口径覆盖量汇总';
    return new TableRow({ children: [
      dataCell(so.id, 8), dataCell(so.mainOrder, 8), dataCell(so.from, 9), dataCell(so.to, 9),
      dataCell(so.ticketType, 8, { color: so.ticketType !== 'STR' ? 'CC8800' : '000000', bold: so.ticketType !== 'STR' }),
      dataCell(so.status === 'completed' ? '已完成' : '待处理', 8,
        { color: so.status === 'pending' ? 'CC8800' : '008800' }),
      dataCell(so.target, 9), dataCell(so.reached, 9), dataCell(so.success, 9),
      dataCell(so.isSplit ? '是(isSplit=true)' : '否(isSplit=false)', 11,
        { color: so.isSplit ? 'CC8800' : '008800' }),
      dataCellLeft(splitMeaning, 12, { color: so.isSplit ? 'CC8800' : '008800' }),
    ]});
  });
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [hRow, ...dRows] });
}

function statTable(rows, isFullScope) {
  const cols = ['区域','策略派发数量','已完成数量','目标客户量','触达客户数','营销成功量','触达率','成功率','完成率'];
  const w = [12, 11, 11, 10, 10, 10, 10, 10, 10];
  const hRow = new TableRow({ tableHeader: true, children: cols.map((c, i) => headerCell(c, w[i])) });
  const dRows = rows.map(r => new TableRow({ children: [
    dataCellLeft(r.region, w[0], { bold: true }),
    dataCell(r.dispatchCount, w[1], isFullScope ? { bold: true } : {}),
    dataCell(r.completedCount, w[2]),
    dataCell(r.target, w[3], isFullScope ? { shading: 'E2EFDA', bold: true } : {}),
    dataCell(r.reached, w[4], isFullScope ? { shading: 'E2EFDA' } : {}),
    dataCell(r.success, w[5], isFullScope ? { shading: 'E2EFDA' } : {}),
    dataCell(r.reachRate, w[6]),
    dataCell(r.successRate, w[7]),
    dataCell(r.completionRate, w[8]),
  ]}));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [hRow, ...dRows] });
}

function validationTable(validations) {
  const hRow = new TableRow({ tableHeader: true, children: [
    headerCell('校验项', 35), headerCell('左值', 15), headerCell('右值', 15), headerCell('结果', 15)
  ]});
  const dRows = validations.map(v => new TableRow({ children: [
    dataCellLeft(v.item, 35), dataCell(v.left, 15), dataCell(v.right, 15),
    dataCell(v.result, 15, { color: v.result.includes('✓') ? '008800' : 'CC0000' }),
  ]}));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [hRow, ...dRows] });
}

// ─── 文档构建 ───

const children = [];

// 标题页
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
  new TextRun({ text: '策略分析口径体系', bold: true, size: 40, font: FONT, color: COLOR_TITLE })
]}));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [
  new TextRun({ text: '场景穿越验证手册', bold: true, size: 36, font: FONT, color: COLOR_TITLE })
]}));
children.push(para('版本：V1.0'));
children.push(para('更新日期：2026-07'));
children.push(para(''));

// ─── 第一章：口径体系总览 ───
children.push(heading1('一、口径体系总览'));

children.push(heading2('1.1 策略分析的业务定位'));
children.push(para('策略分析是评估中心下的策略派发效果评估页面，统计所有关联了策略的工单（排除指标调度IND）的派发行为和执行效果。核心问题：策略派发了多少？覆盖了多少客户？效果如何？'));
children.push(para(''));
children.push(para('策略分析与工单分析的核心差异：'));
children.push(bulletPara('工单分析：关注工单的完整流转（派单+接单双视角），统计单元是子单'));
children.push(bulletPara('策略分析：只关注策略派发效果（仅派发视角），行为量统计单元是主工单，覆盖量统计单元是叶子子单'));

children.push(heading2('1.2 口径维度定义（2维度×4种口径）'));
children.push(para('策略分析只有2个口径维度（无视角维度），共4种口径组合：'));

const dim4Table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('维度一：范围', 20), headerCell('维度二：时间', 20), headerCell('口径名称', 30), headerCell('示例', 30)] }),
  new TableRow({ children: [dataCell('本级', 20), dataCell('当月', 20), dataCellLeft('策略派发 - 本级 - 当月', 30), dataCellLeft('新疆6月本级派发了多少策略', 30)] }),
  new TableRow({ children: [dataCell('本级', 20), dataCell('累计', 20), dataCellLeft('策略派发 - 本级 - 累计', 30), dataCellLeft('新疆1~6月本级累计派发了多少策略', 30)] }),
  new TableRow({ children: [dataCell('全口径', 20), dataCell('当月', 20), dataCellLeft('策略派发 - 全口径 - 当月', 30), dataCellLeft('新疆6月含下级共派发了多少策略', 30)] }),
  new TableRow({ children: [dataCell('全口径', 20), dataCell('累计', 20), dataCellLeft('策略派发 - 全口径 - 累计', 30), dataCellLeft('新疆1~6月含下级共派发了多少策略', 30)] }),
]});
children.push(dim4Table);

children.push(para(''));
children.push(boldPara('为什么不设接单视角？', ''));
children.push(bulletPara('策略分析的用户是策略运营者，核心关注"我派发的策略效果如何"，这是派发侧效果评估问题'));
children.push(bulletPara('接单侧数据（"我辖区接了多少策略工单"）由工单分析页面覆盖，无需重复建设'));
children.push(bulletPara('减少口径组合从8种到4种，降低认知负担'));

children.push(heading2('1.3 统计范围'));
children.push(para('策略分析的统计范围 = 所有 strategyId 不为空的工单，排除指标调度(IND)：'));

const scopeTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('工单类型', 15), headerCell('前缀', 10), headerCell('是否可能关联策略', 20), headerCell('策略分析是否统计', 20), headerCell('说明', 35)] }),
  new TableRow({ children: [dataCell('指标调度', 15), dataCell('IND', 10), dataCell('不可能', 20), dataCell('排除', 20, { color: 'CC0000' }), dataCellLeft('指标调度不涉及策略关联', 35)] }),
  new TableRow({ children: [dataCell('策略调度', 15), dataCell('STR', 10), dataCell('必然关联', 20), dataCell('全部纳入', 20, { color: '008800' }), dataCellLeft('策略调度的主载体', 35)] }),
  new TableRow({ children: [dataCell('客群调度', 15), dataCell('CG-OP', 10), dataCell('可能关联', 20), dataCell('strategyId非空时纳入', 20, { color: 'CC8800' }), dataCellLeft('策略跟着工单走：客群调度也可能引用策略', 35)] }),
  new TableRow({ children: [dataCell('客户商机调度', 15), dataCell('COD', 10), dataCell('可能关联', 20), dataCell('strategyId非空时纳入', 20, { color: 'CC8800' }), dataCellLeft('客户商机调度也可能引用策略', 35)] }),
  new TableRow({ children: [dataCell('客群商机调度', 15), dataCell('GOD', 10), dataCell('可能关联', 20), dataCell('strategyId非空时纳入', 20, { color: 'CC8800' }), dataCellLeft('客群商机调度也可能引用策略', 35)] }),
  new TableRow({ children: [dataCell('区域攻坚调度', 15), dataCell('RAS', 10), dataCell('可能关联', 20), dataCell('strategyId非空时纳入', 20, { color: 'CC8800' }), dataCellLeft('区域攻坚调度也可能引用策略', 35)] }),
]});
children.push(scopeTable);

children.push(heading2('1.4 核心概念与英文字段业务含义'));
children.push(para('以下为本口径体系中使用的核心英文字段及其业务含义，确保所有技术人员和业务人员理解一致：'));

const conceptTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('英文字段', 15), headerCell('中文名称', 12), headerCell('业务含义', 35), headerCell('取值与规则', 38)] }),
  new TableRow({ children: [
    dataCell('strategyId', 15, { bold: true, color: COLOR_STRATEGY }),
    dataCell('策略编号', 12),
    dataCellLeft('策略在数据库中的唯一标识。策略是独立实体，有自己的编号，无论是否由AI推荐，都有可能被客群调度、策略调度、区域攻坚调度等工单引用', 35),
    dataCellLeft('非空字符串（如S1001）。同一条策略可能在N条主工单中被引用，策略派发时不去重——引用N次就算N次策略派发', 38),
  ] }),
  new TableRow({ children: [
    dataCell('strategySource', 15, { bold: true, color: COLOR_STRATEGY }),
    dataCell('策略来源', 12),
    dataCellLeft('该策略是由AI系统自动推荐，还是由运营人员人工创建', 35),
    dataCellLeft('"AI推荐"或"人工创建"。影响AI推荐策略数和AI推荐采纳率两个指标的计算', 38),
  ] }),
  new TableRow({ children: [
    dataCell('ticketType', 15, { bold: true }),
    dataCell('工单类型', 12),
    dataCellLeft('工单的调度类型，标识这条工单属于哪种调度场景', 35),
    dataCellLeft('STR(策略调度)、CG-OP(客群调度)、COD(客户商机调度)、GOD(客群商机调度)、RAS(区域攻坚调度)、IND(指标调度)。策略分析排除IND', 38),
  ] }),
  new TableRow({ children: [
    dataCell('isSplit', 15, { bold: true, color: 'CC8800' }),
    dataCell('是否被拆单', 12),
    dataCellLeft('该子单是否被接收方二次拆分。拆单=接收方收到子单后，将客户群体进一步细分，拆成多个更小的子单派给更下级区域执行', 35),
    dataCellLeft('true=中间子单（已被拆分，不是最终执行单元，不参与全口径覆盖量汇总）；false=叶子子单（未被拆分，是实际执行单元，参与全口径覆盖量汇总）。例如：新疆派800人给乌鲁木齐，乌鲁木齐拆成500+300给天山区和沙区，则新疆→乌鲁木齐的子单isSplit=true，天山区和沙区接到的子单isSplit=false', 38),
  ] }),
  new TableRow({ children: [
    dataCell('targetCustomerCount', 15, { bold: true, color: '008800' }),
    dataCell('目标客户量', 12),
    dataCellLeft('该子单圈选的待触达客户总量。这是策略运营的核心覆盖指标——策略影响了多少客户', 35),
    dataCellLeft('正整数。全口径汇总时仅统计isSplit=false的叶子子单，避免拆单链上中间子单的同一批客户被重复计数。待处理工单的目标客户量照常计入（已确定圈选），触达=0', 38),
  ] }),
  new TableRow({ children: [
    dataCell('reachedCustomerCount', 15, { bold: true, color: '008800' }),
    dataCell('触达客户数', 12),
    dataCellLeft('该子单实际触达（成功联系上）的客户数。只有已完成的子单才有触达数据', 35),
    dataCellLeft('非负整数，待处理子单=0。全口径汇总时仅统计isSplit=false的叶子子单', 38),
  ] }),
  new TableRow({ children: [
    dataCell('marketingSuccessCount', 15, { bold: true, color: '008800' }),
    dataCell('营销成功量', 12),
    dataCellLeft('触达客户中最终营销成功（如成功升级套餐、成功办理业务）的客户数', 35),
    dataCellLeft('非负整数，待处理子单=0。全口径汇总时仅统计isSplit=false的叶子子单。营销成功量≤触达客户数', 38),
  ] }),
  new TableRow({ children: [
    dataCell('dispatcher', 15, { bold: true }),
    dataCell('派单方', 12),
    dataCellLeft('发出工单的区域。策略分析只看派单视角，因此派单方是统计归属的核心依据', 35),
    dataCellLeft('区域编码（如650000=新疆）。某区域的"策略派发数量"=该区域作为派单方的主工单数', 38),
  ] }),
  new TableRow({ children: [
    dataCell('receiver', 15, { bold: true }),
    dataCell('接单方', 12),
    dataCellLeft('接收并执行工单的区域。在策略分析中不作为统计依据，仅用于拆单链路追踪', 35),
    dataCellLeft('区域编码。当dispatcher=receiver时为自执行工单', 38),
  ] }),
  new TableRow({ children: [
    dataCell('status', 15, { bold: true }),
    dataCell('子单状态', 12),
    dataCellLeft('子单的执行状态', 35),
    dataCellLeft('completed=已完成、pending=待处理、cancelled=已撤单。策略场景撤单率极低', 38),
  ] }),
]});
children.push(conceptTable);

children.push(heading2('1.5 指标分类与双轨算法'));
children.push(para('策略分析的指标按业务本质分为两类，两类指标在统计单元和全口径算法上完全不同：'));

const metricTypeTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('指标类型', 10), headerCell('代表指标', 16), headerCell('统计单元', 12), headerCell('业务含义', 20), headerCell('全口径算法', 22), headerCell('原因', 20)] }),
  new TableRow({ children: [
    dataCell('行为量', 10, { bold: true, color: '0066AA' }),
    dataCellLeft('策略派发数量、已完成数量', 16),
    dataCell('主工单', 12, { bold: true, color: 'CC0000' }),
    dataCellLeft('统计的是"决策次数"', 20),
    dataCellLeft('递归汇总：本级+所有下级区域的主工单数之和', 22),
    dataCellLeft('1条主工单=1次策略派发决策，拆成16个子单仍是1次决策', 20),
  ] }),
  new TableRow({ children: [
    dataCell('覆盖量', 10, { bold: true, color: 'CC8800' }),
    dataCellLeft('目标客户量、触达客户数、营销成功量', 16),
    dataCell('叶子子单', 12, { bold: true, color: 'CC0000' }),
    dataCellLeft('统计的是"真实的人"', 20),
    dataCellLeft('叶子子单汇总：仅汇总isSplit=false的叶子子单的覆盖量之和', 22),
    dataCellLeft('同一批客户被多级拆单时只算1次，递归汇总会重复计数', 20),
  ] }),
]});
children.push(metricTypeTable);

children.push(para(''));
children.push(boldPara('反面示例：', '新疆派1条主工单W3，拆成16个子单派给16个地市，目标客户16000人。'));
children.push(bulletPara('行为量（主工单计数）：策略派发数量=1 ✓（1次策略派发决策）'));
children.push(bulletPara('行为量（如果按子单计数）：策略派发数量=16 ✗（1次决策被计为16次，语义失真）'));
children.push(bulletPara('覆盖量（叶子子单汇总）：目标客户量=16000 ✓（16个叶子子单汇总）'));
children.push(bulletPara('覆盖量（递归汇总，旧算法）：目标客户量=16000×2=32000 ✗（中间子单和叶子子单重复计数）'));

children.push(heading2('1.6 拆单链与isSplit字段详解'));
children.push(para('isSplit是子单上的布尔标记，表示该子单是否被接收方二次拆分。这是覆盖量去重的关键字段。'));

const splitTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('isSplit值', 10), headerCell('中文术语', 10), headerCell('业务含义', 35), headerCell('是否参与全口径覆盖量汇总', 25), headerCell('原因', 20)] }),
  new TableRow({ children: [
    dataCell('true', 10, { bold: true, color: 'CC8800' }),
    dataCell('中间子单', 10, { bold: true, color: 'CC8800' }),
    dataCellLeft('该子单被接收方二次拆分了。例如：新疆派800人给乌鲁木齐(isSplit=true)，乌鲁木齐接收后拆成500+300给天山区和沙区', 35),
    dataCell('不参与', 25, { color: 'CC0000' }),
    dataCellLeft('其覆盖量已由拆单后的叶子子单代表，再算就重复了', 20),
  ] }),
  new TableRow({ children: [
    dataCell('false', 10, { bold: true, color: '008800' }),
    dataCell('叶子子单', 10, { bold: true, color: '008800' }),
    dataCellLeft('该子单未被二次拆分，是实际执行到底的单元。例如：天山区接到的500人子单(isSplit=false)，天山区直接执行，不再往下拆', 35),
    dataCell('参与', 25, { color: '008800' }),
    dataCellLeft('代表真正执行到底的客户覆盖，无重复', 20),
  ] }),
]});
children.push(splitTable);

children.push(para(''));
children.push(boldPara('拆单链示例：', ''));
children.push(para('S3-1: 新疆→乌鲁木齐(1000人, isSplit=true=中间子单，已被拆)'));
children.push(para('├── S3-2: 乌鲁木齐→天山区(600人, isSplit=false=叶子子单，未再拆)'));
children.push(para('└── S3-3: 乌鲁木齐→沙区(400人, isSplit=false=叶子子单，未再拆)'));
children.push(boldPara('全口径目标客户量 = ', '叶子子单汇总 = 600+400 = 1000（正确，无重复）'));
children.push(boldPara('递归汇总（旧算法） = ', '1000+600+400 = 2000（错误，S3-1的1000已包含S3-2和S3-3，重复计数）'));

children.push(heading2('1.7 组织架构树（全场景共用）'));
children.push(para('新疆（L1，根节点）'));
children.push(para('├── 乌鲁木齐（L2，地市）'));
children.push(para('│   ├── 天山区（L3，区县）'));
children.push(para('│   │   ├── 网格A（L4，叶子节点）'));
children.push(para('│   │   └── 网格B（L4，叶子节点）'));
children.push(para('│   └── 沙区（L3，区县）'));
children.push(para('├── 克拉玛依（L2，地市）'));
children.push(para('├── 阿克苏（L2，地市）'));
children.push(para('└── 喀什（L2，地市）'));
children.push(para('统计月份：2026-06'));

children.push(heading2('1.8 核心口径规则清单'));

const rules = [
  ['R1', '行为量按主工单计数', '策略派发数量、已完成数量以主工单为统计单元。1条主工单=1次策略派发决策，无论拆成多少子单。反面：新疆派1条主工单拆16个子单→按子单计=16次策略派发（语义失真），按主工单计=1次（正确）'],
  ['R2', '覆盖量按叶子子单汇总', '目标客户量、触达客户数、营销成功量以isSplit=false的叶子子单为汇总单元。isSplit=true的中间子单不参与，避免拆单链上同一批客户被重复计数'],
  ['R3', 'isSplit=true子单触达/成功从叶子汇总', '中间子单(isSplit=true)的触达客户数和营销成功量不是自身填报的，而是从其拆单后的叶子子单汇总上来的。例如：S3-1触达(800)=S3-2(480)+S3-3(320)'],
  ['R4', '策略不去重', '同一策略在N条主工单中使用=策略派发N次，不去重为1。N次策略派发=N个独立决策。策略本身没有"目标客户量"属性，目标客户量在工单中定义'],
  ['R5', '非STR类型纳入', 'strategyId非空且ticketType非IND的工单均纳入策略分析统计。策略跟着工单走：客群调度(CG-OP)、客户商机调度(COD)、客群商机调度(GOD)、区域攻坚调度(RAS)都可能关联策略'],
  ['R6', '派生指标同口径计算', '触达率=同口径触达/同口径目标；成功率=同口径成功/同口径触达；完成率=同口径已完成/同口径派发。不可跨口径（如分子全口径/分母本级→比率>100%荒谬）'],
  ['R7', '仅派发视角', '策略分析只看派发侧，不设接单视角。策略运营关注"策略派发效果"，接单侧数据由工单分析页面覆盖'],
  ['R8', '全口径覆盖量用叶子汇总', '全口径目标=组织树下isSplit=false叶子子单之和，不等于本级+Σ下级全口径（简单递归相加会导致拆单中间子单与叶子子单重复计数）'],
  ['R9', '待处理工单覆盖量照计', '待处理工单的目标客户量照常计入（已确定圈选），触达=0，成功=0。成功率显示"—"（触达为0时不可计算）'],
  ['R10', '自执行工单归派单方', '派单方=接单方=同一区域时，策略派发数量归该区域本级。如新疆自己执行策略，策略派发数量归新疆'],
];
const rulesTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('编号', 6), headerCell('规则', 16), headerCell('详细说明', 78)] }),
  ...rules.map(r => new TableRow({ children: [
    dataCell(r[0], 6, { bold: true }), dataCellLeft(r[1], 16, { bold: true }), dataCellLeft(r[2], 78)
  ]}))
]});
children.push(rulesTable);

// ─── 第二章：逐场景穿越验证 ───
children.push(heading1('二、逐场景穿越验证'));

for (const sc of scenarios) {
  children.push(heading2(`场景${sc.id}：${sc.name}`));
  children.push(para(sc.desc));

  children.push(heading3('主工单明细'));
  children.push(mainOrderDetailTable(sc.mainOrders));

  children.push(heading3('子单明细'));
  children.push(subOrderDetailTable(sc.subOrders));

  children.push(heading3('本级统计'));
  children.push(statTable(sc.ownLevel, false));
  children.push(para(''));
  children.push(para(`推导：${sc.ownDerivation}`));

  children.push(heading3('全口径统计'));
  children.push(statTable(sc.fullScope, true));
  children.push(para(''));
  children.push(para(`推导：${sc.fullDerivation}`));

  children.push(heading3('场景校验'));
  children.push(validationTable(sc.validations));

  children.push(heading3('关键观察'));
  for (const obs of sc.observations) {
    children.push(bulletPara(obs));
  }
}

// ─── 第三章：全量汇总场景 ───
children.push(heading1('三、全量汇总场景'));
children.push(para('将8个场景的8条主工单、14条子单全部汇总到同一组织架构树下，验证全量数据的口径一致性。'));

// 3.1 主工单总清单
children.push(heading2('3.1 主工单总清单'));

const allMainOrders = [
  ['W1','新疆','S1001','AI推荐','STR','已完成','1'],
  ['W2','新疆','S1001','AI推荐','STR','已完成','2'],
  ['W3','新疆','S1002','人工创建','STR','已完成','3'],
  ['W4','乌鲁木齐','S1003','AI推荐','CG-OP','已完成','4'],
  ['W5','乌鲁木齐','S1004','人工创建','STR','已完成','5'],
  ['W6','新疆','S1005','AI推荐','RAS','已完成','6'],
  ['W7','新疆','S1006','人工创建','STR','已完成','7'],
  ['W8','乌鲁木齐','S1007','人工创建','COD','待处理','6'],
];

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [
    headerCell('主工单ID',10), headerCell('派单方',12), headerCell('策略编号',10),
    headerCell('策略来源',10), headerCell('工单类型',10), headerCell('状态',8), headerCell('场景',8)
  ]}),
  ...allMainOrders.map(r => new TableRow({ children: [
    dataCell(r[0],10), dataCell(r[1],12), dataCell(r[2],10),
    dataCell(r[3],10, { color: r[3]==='AI推荐' ? '0066AA' : '008800' }),
    dataCell(r[4],10, { color: r[4]!=='STR' ? 'CC8800' : '000000', bold: r[4]!=='STR' }),
    dataCell(r[5],8, { color: r[5]==='待处理' ? 'CC8800' : '008800' }),
    dataCell(r[6],8),
  ]}))
]}));

children.push(bulletPara('总计8条主工单，其中：新疆派发5条(W1~W3,W6,W7)、乌鲁木齐派发3条(W4,W5,W8)'));
children.push(bulletPara('非STR类型2条：W4(CG-OP)+W8(COD)，因strategyId非空纳入策略分析'));
children.push(bulletPara('待处理1条：W8(COD)，目标客户量照计，触达=0'));

// 3.2 子单总清单
children.push(heading2('3.2 子单总清单'));

const allSubOrders = [
  ['S1-1','W1','新疆','乌鲁木齐','STR','已完成','500','420','42','否(叶子)','1'],
  ['S1-2','W1','新疆','克拉玛依','STR','已完成','300','255','26','否(叶子)','1'],
  ['S2-1','W2','新疆','阿克苏','STR','已完成','600','510','51','否(叶子)','2'],
  ['S2-2','W2','新疆','喀什','STR','已完成','400','340','34','否(叶子)','2'],
  ['S3-1','W3','新疆','乌鲁木齐','STR','已完成','1000','800','80','是(isSplit=true)','3'],
  ['S3-2','W3','乌鲁木齐','天山区','STR','已完成','600','480','48','否(叶子)','3'],
  ['S3-3','W3','乌鲁木齐','沙区','STR','已完成','400','320','32','否(叶子)','3'],
  ['S4-1','W4','乌鲁木齐','天山区','CG-OP','已完成','350','280','28','否(叶子)','4'],
  ['S5-1','W5','乌鲁木齐','天山区','STR','已完成','500','400','40','是(isSplit=true)','5'],
  ['S5-2','W5','天山区','网格A','STR','已完成','300','240','24','否(叶子)','5'],
  ['S5-3','W5','天山区','网格B','STR','已完成','200','160','16','否(叶子)','5'],
  ['S6-1','W6','新疆','网格A','RAS','已完成','200','160','16','否(叶子)','6'],
  ['S7-1','W7','新疆','新疆','STR','已完成','150','120','12','否(叶子)','7'],
  ['S8-1','W8','乌鲁木齐','沙区','COD','待处理','250','0','0','否(叶子)','6'],
];

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [
    headerCell('子单ID',7), headerCell('主工单',7), headerCell('派单方',9), headerCell('接单方',9),
    headerCell('类型',7), headerCell('状态',7), headerCell('目标',7), headerCell('触达',7), headerCell('成功',7),
    headerCell('是否被拆单',14), headerCell('场景',5)
  ]}),
  ...allSubOrders.map(r => new TableRow({ children: [
    dataCell(r[0],7), dataCell(r[1],7), dataCell(r[2],9), dataCell(r[3],9),
    dataCell(r[4],7, { color: r[4]!=='STR' ? 'CC8800' : '000000', bold: r[4]!=='STR' }),
    dataCell(r[5],7, { color: r[5]==='待处理' ? 'CC8800' : '008800' }),
    dataCell(r[6],7), dataCell(r[7],7), dataCell(r[8],7),
    dataCell(r[9],14, { color: r[9].includes('true') ? 'CC8800' : '008800' }),
    dataCell(r[10],5),
  ]}))
]}));

children.push(bulletPara('总计14条子单，其中叶子子单12条(isSplit=false)、中间子单2条(S3-1/S5-1，isSplit=true)、待处理1条(S8-1)'));
children.push(bulletPara('isSplit=true的中间子单说明：S3-1(新疆→乌鲁木齐)被乌鲁木齐拆成S3-2+S3-3；S5-1(乌鲁木齐→天山区)被天山区拆成S5-2+S5-3'));
children.push(bulletPara('非STR类型子单3条：S4-1(CG-OP)、S6-1(RAS)、S8-1(COD)——都因strategyId非空被纳入策略分析'));

// 3.3 本级统计
children.push(heading2('3.3 本级统计'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('区域',10),headerCell('策略派发数量',12),headerCell('已完成数量',12),headerCell('目标客户量',11),headerCell('触达客户数',11),headerCell('营销成功量',11),headerCell('触达率',9),headerCell('成功率',9),headerCell('完成率',9)] }),
  new TableRow({ children: [dataCell('新疆',10),dataCell('5',12),dataCell('5',12),dataCell('3150',11),dataCell('2605',11),dataCell('261',11),dataCell('82.7%',9),dataCell('10.0%',9),dataCell('100%',9)] }),
  new TableRow({ children: [dataCell('乌鲁木齐',10),dataCell('3',12),dataCell('2',12),dataCell('2100',11),dataCell('1480',11),dataCell('148',11),dataCell('70.5%',9),dataCell('10.0%',9),dataCell('66.7%',9)] }),
  new TableRow({ children: [dataCell('天山区',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('沙区',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('克拉玛依',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('阿克苏',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('喀什',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('网格A',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('网格B',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
]}));

children.push(bulletPara('新疆本级策略派发数量=5（主工单W1~W3+W6+W7）；已完成5条；目标客户量=S1-1(500)+S1-2(300)+S2-1(600)+S2-2(400)+S3-1(1000)+S6-1(200)+S7-1(150)=3150'));
children.push(bulletPara('乌鲁木齐本级策略派发数量=3（主工单W4+W5+W8）；已完成2条(W4+W5)，W8待处理；目标客户量=S3-2(600)+S3-3(400)+S4-1(350)+S5-1(500)+S8-1(250)=2100'));
children.push(bulletPara('天山区/沙区/克拉玛依/阿克苏/喀什/网格A/网格B本级策略派发数量=0（不是任何主工单的派单方）'));

// 3.4 全口径统计
children.push(heading2('3.4 全口径统计'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('区域',10),headerCell('策略派发数量',12),headerCell('已完成数量',12),headerCell('目标客户量',11),headerCell('触达客户数',11),headerCell('营销成功量',11),headerCell('触达率',9),headerCell('成功率',9),headerCell('完成率',9)] }),
  new TableRow({ children: [dataCell('新疆',10),dataCell('8',12, {bold:true}),dataCell('7',12),dataCell('4250',11,{shading:'E2EFDA',bold:true}),dataCell('3285',11,{shading:'E2EFDA'}),dataCell('329',11,{shading:'E2EFDA'}),dataCell('77.3%',9),dataCell('10.0%',9),dataCell('87.5%',9)] }),
  new TableRow({ children: [dataCell('乌鲁木齐',10),dataCell('3',12,{bold:true}),dataCell('2',12),dataCell('2100',11,{shading:'E2EFDA',bold:true}),dataCell('1480',11,{shading:'E2EFDA'}),dataCell('148',11,{shading:'E2EFDA'}),dataCell('70.5%',9),dataCell('10.0%',9),dataCell('66.7%',9)] }),
  new TableRow({ children: [dataCell('天山区',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('沙区',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('克拉玛依',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('阿克苏',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('喀什',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('网格A',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
  new TableRow({ children: [dataCell('网格B',10),dataCell('0',12),dataCell('0',12),dataCell('0',11),dataCell('0',11),dataCell('0',11),dataCell('—',9),dataCell('—',9),dataCell('—',9)] }),
]}));

children.push(bulletPara('行为量（主工单递归汇总）：新疆全口径=本级(5)+乌鲁木齐全口径(3)+其他地市(0)=8；乌鲁木齐全口径=本级(3)+天山区(0)+沙区(0)=3'));
children.push(bulletPara('覆盖量（叶子子单汇总）：新疆全口径叶子=S1-1(500)+S1-2(300)+S2-1(600)+S2-2(400)+S3-2(600)+S3-3(400)+S4-1(350)+S5-2(300)+S5-3(200)+S6-1(200)+S7-1(150)+S8-1(250)=4250（S3-1和S5-1 isSplit=true跳过）'));
children.push(bulletPara('覆盖量（叶子子单汇总）：乌鲁木齐全口径叶子=S3-2(600)+S3-3(400)+S4-1(350)+S5-2(300)+S5-3(200)+S8-1(250)=2100'));

// 3.5 本级vs全口径差异分析
children.push(heading2('3.5 本级 vs 全口径 差异分析'));

children.push(heading3('行为量差异'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('区域',12),headerCell('本级策略派发数量',18),headerCell('全口径策略派发数量',18),headerCell('差值',10),headerCell('差值原因',42)] }),
  new TableRow({ children: [dataCell('新疆',12),dataCell('5',18),dataCell('8',18),dataCell('+3',10),dataCellLeft('乌鲁木齐派发的3条主工单(W4+W5+W8)也在新疆全口径树内',42)] }),
  new TableRow({ children: [dataCell('乌鲁木齐',12),dataCell('3',18),dataCell('3',18),dataCell('0',10),dataCellLeft('天山区和沙区不是任何主工单的派单方，无增量',42)] }),
]}));

children.push(heading3('覆盖量差异'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('区域',12),headerCell('本级目标客户量',16),headerCell('全口径目标客户量',16),headerCell('差值',10),headerCell('差值原因',46)] }),
  new TableRow({ children: [dataCell('新疆',12),dataCell('3150',16),dataCell('4250',16),dataCell('+1100',10),dataCellLeft('乌鲁木齐全口径叶子=S3-2(600)+S3-3(400)+S4-1(350)+S5-2(300)+S5-3(200)+S8-1(250)=2100，但新疆本级已包含S3-1(1000)和S5-1(500)的覆盖量。差值=乌鲁木齐全口径叶子(2100)-新疆本级中乌鲁木齐派发的覆盖量(1000)=1100',46)] }),
  new TableRow({ children: [dataCell('乌鲁木齐',12),dataCell('2100',16),dataCell('2100',16),dataCell('0',10),dataCellLeft('天山区/沙区不是派单方，全口径=本级',46)] }),
]}));

children.push(bulletPara('关键发现：覆盖量差异的根源在于"拆单中间子单"——新疆本级的S3-1目标1000和S5-1目标500，在叶子子单汇总时被替换为S3-2+S3-3=1000和S5-2+S5-3=500。拆单前后总量守恒，但归集路径不同。'));

// 3.6 全量校验
children.push(heading2('3.6 全量校验'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('编号',6),headerCell('校验项',30),headerCell('计算',40),headerCell('结果',24)] }),
  new TableRow({ children: [dataCell('V1',6),dataCellLeft('全口径策略派发数量=各区域本级策略派发数量之和',30),dataCellLeft('8=5(新疆)+3(乌鲁木齐)+0×7',40),dataCell('✓',24)] }),
  new TableRow({ children: [dataCell('V2',6),dataCellLeft('策略派发数量=已完成数量+执行中数量',30),dataCellLeft('新疆全口径：8=7+1(W8待处理)',40),dataCell('✓',24)] }),
  new TableRow({ children: [dataCell('V3',6),dataCellLeft('全口径覆盖量=叶子子单汇总≠递归汇总',30),dataCellLeft('新疆：叶子4250≠递归3150+2100=5250',40),dataCell('✓ 叶子去重正确',24)] }),
  new TableRow({ children: [dataCell('V4',6),dataCellLeft('拆单前后覆盖量守恒',30),dataCellLeft('S3-1(1000)=S3-2(600)+S3-3(400)；S5-1(500)=S5-2(300)+S5-3(200)',40),dataCell('✓ 守恒',24)] }),
  new TableRow({ children: [dataCell('V5',6),dataCellLeft('派生指标同口径',30),dataCellLeft('新疆全口径触达率=3285/4250=77.3%（非3285/3150=104.3%荒谬）',40),dataCell('✓ 同口径',24)] }),
  new TableRow({ children: [dataCell('V6',6),dataCellLeft('策略不去重验证',30),dataCellLeft('S1001在W1+W2中使用→策略派发数量=2，不是去重后的1',40),dataCell('✓ 不去重',24)] }),
  new TableRow({ children: [dataCell('V7',6),dataCellLeft('触达率≥成功率',30),dataCellLeft('新疆全口径触达率(77.3%)≥成功率(10.0%)',40),dataCell('✓',24)] }),
  new TableRow({ children: [dataCell('V8',6),dataCellLeft('待处理工单覆盖量照计',30),dataCellLeft('W8待处理：目标250计入，触达=0，成功率显示"—"',40),dataCell('✓',24)] }),
]}));

// ─── 第四章：与工单分析的口径差异对照 ───
children.push(heading1('四、与工单分析的口径差异对照'));

const diffTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('维度', 15), headerCell('工单分析', 35), headerCell('策略分析', 35), headerCell('差异原因', 15)] }),
  new TableRow({ children: [dataCell('视角', 15), dataCellLeft('派单+接单(2种)', 35), dataCellLeft('仅派发(1种)', 35), dataCellLeft('业务差异', 15)] }),
  new TableRow({ children: [dataCell('行为量统计单元', 15), dataCellLeft('子单（派单量=子单数）', 35), dataCellLeft('主工单（策略派发数量=主工单数）', 35), dataCellLeft('语义差异', 15)] }),
  new TableRow({ children: [dataCell('覆盖量统计单元', 15), dataCellLeft('叶子子单（isSplit=false）', 35), dataCellLeft('叶子子单（isSplit=false，相同）', 35), dataCellLeft('一致', 15)] }),
  new TableRow({ children: [dataCell('数据筛选范围', 15), dataCellLeft('全部6种工单类型', 35), dataCellLeft('strategyId非空且ticketType非IND', 35), dataCellLeft('范围差异', 15)] }),
  new TableRow({ children: [dataCell('策略去重', 15), dataCellLeft('不涉及策略维度', 35), dataCellLeft('不去重：同策略在N条主工单中使用=N次策略派发', 35), dataCellLeft('新增规则', 15)] }),
  new TableRow({ children: [dataCell('口径组合数', 15), dataCellLeft('2×2×2=8种', 35), dataCellLeft('1×2×2=4种', 35), dataCellLeft('简化', 15)] }),
]});
children.push(diffTable);

// ─── 生成文档 ───

const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1080, bottom: 1440, left: 1080 },
      }
    },
    children
  }]
});

const OUTPUT_DIR = '/workspace/projects/docs/需求设计方案';
const OUTPUT_FILENAME = '策略分析口径体系-场景穿越验证手册-V1.0';

(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const buffer = await Packer.toBuffer(doc);
  const docxPath = `${OUTPUT_DIR}/${OUTPUT_FILENAME}.docx`;
  fs.writeFileSync(docxPath, buffer);
  console.log(`Word document generated: ${docxPath}`);

  // Also generate markdown
  const mdLines = [];
  mdLines.push('# 策略分析口径体系——场景穿越验证手册 V1.0');
  mdLines.push('');
  mdLines.push('> 本文档由脚本自动生成，与Word文档内容一致');
  mdLines.push('');

  // Chapter 1 summary
  mdLines.push('## 一、口径体系总览');
  mdLines.push('');
  mdLines.push('### 1.1 策略分析的业务定位');
  mdLines.push('策略分析是评估中心下的策略派发效果评估页面，统计所有关联了策略的工单（排除指标调度IND）的派发行为和执行效果。');
  mdLines.push('');
  mdLines.push('### 1.2 口径维度定义（2维度×4种口径）');
  mdLines.push('- 范围：本级 / 全口径');
  mdLines.push('- 时间：当月 / 累计');
  mdLines.push('- 无视角维度（策略分析只有派发视角，不设接单视角）');
  mdLines.push('');
  mdLines.push('### 1.3 统计范围');
  mdLines.push('所有strategyId非空且ticketType非IND的工单。排除指标调度(IND)。');
  mdLines.push('');
  mdLines.push('### 1.4 核心概念与英文字段业务含义');
  mdLines.push('| 英文字段 | 中文名称 | 业务含义 |');
  mdLines.push('|---------|---------|---------|');
  mdLines.push('| strategyId | 策略编号 | 策略在数据库中的唯一标识，同一策略可能在N条主工单中被引用 |');
  mdLines.push('| isSplit | 是否被拆单 | 子单是否被接收方二次拆分。true=中间子单(不参与全口径覆盖量汇总)；false=叶子子单(参与) |');
  mdLines.push('| targetCustomerCount | 目标客户量 | 子单圈选的待触达客户总量 |');
  mdLines.push('| reachedCustomerCount | 触达客户数 | 实际触达的客户数，仅已完成子单有值 |');
  mdLines.push('| marketingSuccessCount | 营销成功量 | 触达客户中营销成功的客户数 |');
  mdLines.push('| dispatcher | 派单方 | 发出工单的区域，策略分析统计归属的核心依据 |');
  mdLines.push('| ticketType | 工单类型 | STR/CG-OP/COD/GOD/RAS/IND，策略分析排除IND |');
  mdLines.push('');
  mdLines.push('### 1.5 指标分类与双轨算法');
  mdLines.push('- **行为量**（策略派发数量、已完成数量）：按**主工单**计数，全口径递归汇总');
  mdLines.push('- **覆盖量**（目标客户量、触达客户数、营销成功量）：按**叶子子单(isSplit=false)**汇总，全口径叶子子单汇总');
  mdLines.push('');
  mdLines.push('### 1.6 核心口径规则（10条）');
  mdLines.push('R1~R10，详见Word文档');
  mdLines.push('');
  mdLines.push('## 二、逐场景穿越验证');
  mdLines.push('');
  for (const sc of scenarios) {
    mdLines.push(`### 场景${sc.id}：${sc.name}`);
    mdLines.push(sc.desc);
    mdLines.push('');
  }
  mdLines.push('## 三、全量汇总场景');
  mdLines.push('- 8条主工单、14条子单');
  mdLines.push('- 新疆全口径策略派发数量=8，目标客户量=4250');
  mdLines.push('- 乌鲁木齐全口径策略派发数量=3，目标客户量=2100');
  mdLines.push('');
  mdLines.push('## 四、与工单分析的口径差异对照');
  mdLines.push('- 行为量统计单元：工单分析=子单，策略分析=主工单');
  mdLines.push('- 视角：工单分析=派单+接单，策略分析=仅派发');
  mdLines.push('- 口径组合：工单分析=8种，策略分析=4种');

  const mdPath = `${OUTPUT_DIR}/${OUTPUT_FILENAME}.md`;
  fs.writeFileSync(mdPath, mdLines.join('\n'));
  console.log(`Markdown document generated: ${mdPath}`);
})();
