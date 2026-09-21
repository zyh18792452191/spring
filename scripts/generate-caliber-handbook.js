const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  TableLayoutType, VerticalAlign, convertInchesToTwip
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── 工具函数 ───

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [new TextRun({ text, bold: true, size: 32, font: 'Microsoft YaHei' })] });
}
function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, bold: true, size: 28, font: 'Microsoft YaHei' })] });
}
function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [new TextRun({ text, bold: true, size: 24, font: 'Microsoft YaHei' })] });
}
function para(text) {
  return new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text, size: 21, font: 'Microsoft YaHei' })] });
}
function boldPara(label, text) {
  return new Paragraph({ spacing: { after: 80 }, children: [
    new TextRun({ text: label, bold: true, size: 21, font: 'Microsoft YaHei' }),
    new TextRun({ text, size: 21, font: 'Microsoft YaHei' })
  ]});
}
function bulletPara(text) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, size: 21, font: 'Microsoft YaHei' })] });
}
function bulletPara2(text) {
  return new Paragraph({ bullet: { level: 1 }, spacing: { after: 60 }, children: [new TextRun({ text, size: 21, font: 'Microsoft YaHei' })] });
}

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: '999999' };
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.SOLID, color: '1F4E79', fill: '1F4E79' },
    verticalAlign: VerticalAlign.CENTER,
    borders,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, size: 18, font: 'Microsoft YaHei', color: 'FFFFFF' })] })]
  });
}
function dataCell(text, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: opts.shading ? { type: ShadingType.SOLID, color: opts.shading, fill: opts.shading } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    borders,
    children: [new Paragraph({ alignment: opts.align || AlignmentType.CENTER, children: [new TextRun({ text: String(text), size: 18, font: 'Microsoft YaHei', bold: !!opts.bold, color: opts.color || '333333' })] })]
  });
}
function dataCellLeft(text, width, opts = {}) {
  return dataCell(text, width, { ...opts, align: AlignmentType.LEFT });
}

// ─── 场景数据 ───

const scenarios = [
  {
    id: 1,
    name: '新疆直接派单给地市',
    desc: '新疆创建1张子单，派给乌鲁木齐（目标500人），全部执行完毕。',
    subOrders: [
      { id: 'ST-001', from: '新疆', to: '乌鲁木齐', target: 500, reached: 450, success: 120, status: 'completed', isSplit: false }
    ]
  },
  {
    id: 2,
    name: '1→N拆单',
    desc: '新疆创建1张子单给乌鲁木齐（目标800人），乌鲁木齐二次拆为2张子单给天山区（500人）和沙区（300人），全部执行完毕。',
    subOrders: [
      { id: 'ST-001', from: '新疆', to: '乌鲁木齐', target: 800, reached: 0, success: 0, status: 'completed', isSplit: true },
      { id: 'ST-002', from: '乌鲁木齐', to: '天山区', target: 500, reached: 420, success: 105, status: 'completed', isSplit: false },
      { id: 'ST-003', from: '乌鲁木齐', to: '沙区', target: 300, reached: 270, success: 68, status: 'completed', isSplit: false }
    ]
  },
  {
    id: 3,
    name: '跨级派单',
    desc: '新疆直接派1张子单给天山区（目标300人），不经乌鲁木齐中转，全部执行完毕。',
    subOrders: [
      { id: 'ST-001', from: '新疆', to: '天山区', target: 300, reached: 255, success: 64, status: 'completed', isSplit: false }
    ]
  },
  {
    id: 4,
    name: '上级自执行',
    desc: '新疆创建1张子单，派单方和接单方都是新疆自己（目标200人），自己执行完毕。',
    subOrders: [
      { id: 'ST-001', from: '新疆', to: '新疆', target: 200, reached: 180, success: 45, status: 'completed', isSplit: false }
    ]
  },
  {
    id: 5,
    name: '含撤单',
    desc: '新疆派2张子单给乌鲁木齐和克拉玛依，克拉玛依的子单被撤回，乌鲁木齐的执行完毕。',
    subOrders: [
      { id: 'ST-001', from: '新疆', to: '乌鲁木齐', target: 500, reached: 450, success: 120, status: 'completed', isSplit: false },
      { id: 'ST-002', from: '新疆', to: '克拉玛依', target: 300, reached: 0, success: 0, status: 'cancelled', isSplit: false }
    ]
  },
  {
    id: 6,
    name: '三次派单链（含1→2拆单）',
    desc: '新疆派1张子单给乌鲁木齐（目标800人）；乌鲁木齐二次拆为2张给天山区（500人）和沙区（300人）；天山区又二次拆为2张给网格A（250人）和网格B（250人）。全部执行完毕。',
    subOrders: [
      { id: 'ST-001', from: '新疆', to: '乌鲁木齐', target: 800, reached: 0, success: 0, status: 'completed', isSplit: true },
      { id: 'ST-002', from: '乌鲁木齐', to: '天山区', target: 500, reached: 0, success: 0, status: 'completed', isSplit: true },
      { id: 'ST-003', from: '天山区', to: '网格A', target: 250, reached: 220, success: 55, status: 'completed', isSplit: false },
      { id: 'ST-004', from: '天山区', to: '网格B', target: 250, reached: 210, success: 53, status: 'completed', isSplit: false },
      { id: 'ST-005', from: '乌鲁木齐', to: '沙区', target: 300, reached: 270, success: 68, status: 'completed', isSplit: false }
    ]
  },
  {
    id: 7,
    name: '含待处理',
    desc: '新疆派2张子单给乌鲁木齐（已完成）和克拉玛依（待处理）。',
    subOrders: [
      { id: 'ST-001', from: '新疆', to: '乌鲁木齐', target: 500, reached: 450, success: 120, status: 'completed', isSplit: false },
      { id: 'ST-002', from: '新疆', to: '克拉玛依', target: 300, reached: 0, success: 0, status: 'pending', isSplit: false }
    ]
  },
  {
    id: 9,
    name: '多次派单累计',
    desc: '新疆分别派2张子单给乌鲁木齐（1月和2月各1张），看累计口径。',
    subOrders: [
      { id: 'ST-001', from: '新疆', to: '乌鲁木齐', target: 500, reached: 450, success: 120, status: 'completed', isSplit: false, month: '2026-01' },
      { id: 'ST-002', from: '新疆', to: '乌鲁木齐', target: 400, reached: 360, success: 90, status: 'completed', isSplit: false, month: '2026-02' }
    ]
  },
  {
    id: 10,
    name: '上级派单+下级自派并存',
    desc: '新疆派1张子单给乌鲁木齐（目标500人），同时乌鲁木齐自己也创建1张子单（目标300人）给自己的天山区。两批独立执行。',
    subOrders: [
      { id: 'ST-001', from: '新疆', to: '乌鲁木齐', target: 500, reached: 450, success: 120, status: 'completed', isSplit: false },
      { id: 'ST-002', from: '乌鲁木齐', to: '天山区', target: 300, reached: 255, success: 64, status: 'completed', isSplit: false }
    ]
  }
];

// ─── 计算函数 ───

const regionTree = {
  '新疆': { children: ['乌鲁木齐', '克拉玛依', '天山区(parent)', '沙区(parent)'] },
  '乌鲁木齐': { children: ['天山区', '沙区'] },
  '天山区': { children: ['网格A', '网格B'] },
  '沙区': { children: [] },
  '克拉玛依': { children: [] },
  '网格A': { children: [] },
  '网格B': { children: [] }
};

function getAllDescendants(region) {
  const children = regionTree[region]?.children?.filter(c => !c.includes('(parent)')) || [];
  let result = [...children];
  for (const child of children) {
    result = result.concat(getAllDescendants(child));
  }
  return result;
}

function computeDispatchPerspective(subOrders, scenarioId) {
  const regions = ['新疆', '乌鲁木齐', '克拉玛依', '天山区', '沙区', '网格A', '网格B'];
  const rows = [];

  for (const region of regions) {
    const ownSubOrders = subOrders.filter(so => so.from === region);
    const allRegions = [region, ...getAllDescendants(region)];
    const fullSubOrders = subOrders.filter(so => allRegions.includes(so.from));

    // 行为量
    const ownDispatched = ownSubOrders.length;
    const ownPending = ownSubOrders.filter(so => so.status === 'pending').length;
    const ownProcessed = ownSubOrders.filter(so => so.status === 'completed').length;
    const ownCancelled = ownSubOrders.filter(so => so.status === 'cancelled').length;

    const fullDispatched = fullSubOrders.length;
    const fullPending = fullSubOrders.filter(so => so.status === 'pending').length;
    const fullProcessed = fullSubOrders.filter(so => so.status === 'completed').length;
    const fullCancelled = fullSubOrders.filter(so => so.status === 'cancelled').length;

    // 覆盖量 — 本级：所有子单（含isSplit）
    const ownTarget = ownSubOrders.reduce((s, so) => s + so.target, 0);
    const ownReached = ownSubOrders.reduce((s, so) => s + so.reached, 0);
    const ownSuccess = ownSubOrders.reduce((s, so) => s + so.success, 0);

    // 覆盖量 — 全口径：仅叶子子单（isSplit=false）
    const fullLeafOrders = fullSubOrders.filter(so => !so.isSplit);
    const fullTarget = fullLeafOrders.reduce((s, so) => s + so.target, 0);
    const fullReached = fullLeafOrders.reduce((s, so) => s + so.reached, 0);
    const fullSuccess = fullLeafOrders.reduce((s, so) => s + so.success, 0);

    if (ownDispatched === 0 && fullDispatched === 0) continue;

    rows.push({
      region,
      ownDispatched, ownPending, ownProcessed, ownCancelled,
      ownTarget, ownReached, ownSuccess,
      fullDispatched, fullPending, fullProcessed, fullCancelled,
      fullTarget, fullReached, fullSuccess
    });
  }
  return rows;
}

function computeReceivePerspective(subOrders, scenarioId) {
  const regions = ['新疆', '乌鲁木齐', '克拉玛依', '天山区', '沙区', '网格A', '网格B'];
  const rows = [];

  for (const region of regions) {
    const ownSubOrders = subOrders.filter(so => so.to === region);
    const allRegions = [region, ...getAllDescendants(region)];
    const fullSubOrders = subOrders.filter(so => allRegions.includes(so.to));

    // 接单视角：撤单子单不计入接单量
    const ownReceived = ownSubOrders.filter(so => so.status !== 'cancelled').length;
    const ownPending = ownSubOrders.filter(so => so.status === 'pending').length;
    const ownProcessed = ownSubOrders.filter(so => so.status === 'completed').length;

    const fullReceived = fullSubOrders.filter(so => so.status !== 'cancelled').length;
    const fullPending = fullSubOrders.filter(so => so.status === 'pending').length;
    const fullProcessed = fullSubOrders.filter(so => so.status === 'completed').length;

    // 覆盖量 — 本级
    const ownActive = ownSubOrders.filter(so => so.status !== 'cancelled');
    const ownTarget = ownActive.reduce((s, so) => s + so.target, 0);
    const ownReached = ownActive.reduce((s, so) => s + so.reached, 0);
    const ownSuccess = ownActive.reduce((s, so) => s + so.success, 0);

    // 覆盖量 — 全口径：仅叶子子单（isSplit=false）且非撤单
    const fullLeafOrders = fullSubOrders.filter(so => !so.isSplit && so.status !== 'cancelled');
    const fullTarget = fullLeafOrders.reduce((s, so) => s + so.target, 0);
    const fullReached = fullLeafOrders.reduce((s, so) => s + so.reached, 0);
    const fullSuccess = fullLeafOrders.reduce((s, so) => s + so.success, 0);

    if (ownReceived === 0 && fullReceived === 0) continue;

    rows.push({
      region,
      ownReceived, ownPending, ownProcessed,
      ownTarget, ownReached, ownSuccess,
      fullReceived, fullPending, fullProcessed,
      fullTarget, fullReached, fullSuccess
    });
  }
  return rows;
}

// ─── 表格生成 ───

function dispatchTable(rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('区域', 10),
      headerCell('派单量', 7), headerCell('待处理', 7), headerCell('已处理', 7), headerCell('撤单', 7),
      headerCell('目标客户', 8), headerCell('触达客户', 8), headerCell('营销成功', 8),
      headerCell('派单量', 7), headerCell('待处理', 7), headerCell('已处理', 7), headerCell('撤单', 7),
      headerCell('目标客户', 8), headerCell('触达客户', 8), headerCell('营销成功', 8),
    ]
  });

  const subHeaderRow = new TableRow({
    children: [
      dataCell('', 10, { shading: 'D6E4F0' }),
      ...['本级口径'].flatMap(() => [dataCell('', 7, { shading: 'D6E4F0' })]),
      dataCell('', 8, { shading: 'D6E4F0' }), dataCell('', 8, { shading: 'D6E4F0' }), dataCell('', 8, { shading: 'D6E4F0' }),
      ...['全口径'].flatMap(() => [dataCell('', 7, { shading: 'E2EFDA' })]),
      dataCell('', 8, { shading: 'E2EFDA' }), dataCell('', 8, { shading: 'E2EFDA' }), dataCell('', 8, { shading: 'E2EFDA' }),
    ]
  });

  const dataRows = rows.map(r => new TableRow({
    children: [
      dataCellLeft(r.region, 10, { bold: true }),
      // 本级 — 行为量
      dataCell(r.ownDispatched, 7),
      dataCell(r.ownPending, 7),
      dataCell(r.ownProcessed, 7),
      dataCell(r.ownCancelled, 7),
      // 本级 — 覆盖量
      dataCell(r.ownTarget, 8),
      dataCell(r.ownReached, 8),
      dataCell(r.ownSuccess, 8),
      // 全口径 — 行为量
      dataCell(r.fullDispatched, 7, { bold: true, shading: 'E2EFDA' }),
      dataCell(r.fullPending, 7, { shading: 'E2EFDA' }),
      dataCell(r.fullProcessed, 7, { shading: 'E2EFDA' }),
      dataCell(r.fullCancelled, 7, { shading: 'E2EFDA' }),
      // 全口径 — 覆盖量（叶子子单汇总）
      dataCell(r.fullTarget, 8, { bold: true, shading: 'E2EFDA' }),
      dataCell(r.fullReached, 8, { shading: 'E2EFDA' }),
      dataCell(r.fullSuccess, 8, { shading: 'E2EFDA' }),
    ]
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [headerRow, dataRows.length > 0 ? dataRows[0] : headerRow, ...dataRows.slice(1)]
  });
}

function receiveTable(rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('区域', 10),
      headerCell('接单量', 8), headerCell('待处理', 8), headerCell('已处理', 8),
      headerCell('目标客户', 9), headerCell('触达客户', 9), headerCell('营销成功', 9),
      headerCell('接单量', 8), headerCell('待处理', 8), headerCell('已处理', 8),
      headerCell('目标客户', 9), headerCell('触达客户', 9), headerCell('营销成功', 9),
    ]
  });

  const dataRows = rows.map(r => new TableRow({
    children: [
      dataCellLeft(r.region, 10, { bold: true }),
      // 本级
      dataCell(r.ownReceived, 8),
      dataCell(r.ownPending, 8),
      dataCell(r.ownProcessed, 8),
      dataCell(r.ownTarget, 9),
      dataCell(r.ownReached, 9),
      dataCell(r.ownSuccess, 9),
      // 全口径
      dataCell(r.fullReceived, 8, { bold: true, shading: 'E2EFDA' }),
      dataCell(r.fullPending, 8, { shading: 'E2EFDA' }),
      dataCell(r.fullProcessed, 8, { shading: 'E2EFDA' }),
      dataCell(r.fullTarget, 9, { bold: true, shading: 'E2EFDA' }),
      dataCell(r.fullReached, 9, { shading: 'E2EFDA' }),
      dataCell(r.fullSuccess, 9, { shading: 'E2EFDA' }),
    ]
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [headerRow, ...dataRows]
  });
}

// ─── 文档构建 ───

const children = [];

// 标题
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
  new TextRun({ text: '工单分析口径体系', bold: true, size: 40, font: 'Microsoft YaHei', color: '1F4E79' })
]}));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [
  new TextRun({ text: '场景穿越验证手册', bold: true, size: 36, font: 'Microsoft YaHei', color: '1F4E79' })
]}));
children.push(para('版本：V2.0（更新覆盖量指标全口径算法）'));
children.push(para('更新日期：2026-07'));
children.push(para(''));

// ─── 第一章：口径体系总览 ───
children.push(heading1('一、口径体系总览'));

children.push(heading2('1.1 核心概念'));
children.push(para('工单分析口径体系定义了"从不同视角、不同统计范围看同一组工单数据时，每个指标该如何统计"的规则。核心维度包括：'));
children.push(bulletPara('统计视角：派单视角（调度决策方）vs 接单视角（执行方）'));
children.push(bulletPara('统计范围：本级口径（仅自身）vs 全口径（含所有下级，递归至最末级）'));
children.push(bulletPara('时间维度：当月值 vs 年初累计值'));
children.push(bulletPara('指标类型：行为量（派单量等动作次数）vs 覆盖量（目标客户数等去重量）'));

children.push(heading2('1.2 指标分类与全口径算法'));

children.push(heading3('1.2.1 行为量指标（递归汇总）'));
children.push(para('行为量指标统计的是"动作次数"，每次派发都是独立行为，递归汇总不会重复计数。'));
children.push(bulletPara('派单量 / 接单量：每次派发=1次独立行为，1拆5就是5次'));
children.push(bulletPara('待处理 / 已处理 / 撤单：统计子单张数，各子单独立计数'));
children.push(boldPara('全口径算法：', '本区域 + 所有下级区域（递归至最末级）的子单数量之和'));

children.push(heading3('1.2.2 覆盖量指标（叶子子单汇总）'));
children.push(para('覆盖量指标统计的是"真实的人/客户"，同一批客户被多级拆单时只算1次。全口径必须避免拆单链上的中间子单重复计数。'));
children.push(bulletPara('目标客户数：被圈选的客群总人数'));
children.push(bulletPara('触达客户数：实际触达到的客户数'));
children.push(bulletPara('营销成功量：成功转化的客户数'));
children.push(boldPara('全口径算法：', '仅汇总"未被二次拆单的叶子子单"（isSplit=false）的覆盖量之和'));
children.push(para(''));
children.push(boldPara('关键说明：', '拆单链路上的中间子单（isSplit=true）不参与覆盖量汇总。例如新疆派800人给乌鲁木齐，乌鲁木齐拆成500+300给天山区和沙区，全口径目标客户数=500+300=800（叶子子单汇总），而非800+500+300=1600（递归汇总会重复计数）。'));

children.push(heading2('1.3 派单视角 vs 接单视角'));

const povTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  layout: TableLayoutType.FIXED,
  rows: [
    new TableRow({ children: [headerCell('维度', 20), headerCell('派单视角', 40), headerCell('接单视角', 40)] }),
    new TableRow({ children: [dataCellLeft('核心关注', 20, { bold: true }), dataCellLeft('调度决策方：我派了多少单、执行效率如何', 40), dataCellLeft('执行方：我接了多少单、执行效果如何', 40)] }),
    new TableRow({ children: [dataCellLeft('派单量/接单量', 20, { bold: true }), dataCellLeft('本区域创建并派发的子单数量', 40), dataCellLeft('本区域接收到的子单数量（撤单不计入）', 40)] }),
    new TableRow({ children: [dataCellLeft('待处理', 20, { bold: true }), dataCellLeft('本区域派发的子单中status=pending的数量', 40), dataCellLeft('本区域接收的子单中status=pending的数量', 40)] }),
    new TableRow({ children: [dataCellLeft('已处理', 20, { bold: true }), dataCellLeft('本区域派发的子单中status=completed的数量', 40), dataCellLeft('本区域接收的子单中status=completed的数量', 40)] }),
    new TableRow({ children: [dataCellLeft('撤单处理', 20, { bold: true }), dataCellLeft('照计派单量，但不计入待处理/已处理', 40), dataCellLeft('不计入接单量（视为未接收）', 40)] }),
    new TableRow({ children: [dataCellLeft('覆盖量全口径', 20, { bold: true }), dataCellLeft('叶子子单汇总（避免拆单重复计数）', 40), dataCellLeft('叶子子单汇总（撤单子单排除）', 40)] }),
  ]
});
children.push(povTable);

children.push(heading2('1.4 本级口径 vs 全口径'));

const scopeTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  layout: TableLayoutType.FIXED,
  rows: [
    new TableRow({ children: [headerCell('口径', 15), headerCell('行为量算法', 42), headerCell('覆盖量算法', 43)] }),
    new TableRow({ children: [dataCellLeft('本级口径', 15, { bold: true }), dataCellLeft('仅统计本区域自身创建/接收的子单', 42), dataCellLeft('仅统计本区域自身创建/接收的子单（含isSplit子单）', 43)] }),
    new TableRow({ children: [dataCellLeft('全口径', 15, { bold: true }), dataCellLeft('本区域+所有下级区域（递归至最末级）的子单数量之和', 42), dataCellLeft('本区域+所有下级区域内"叶子子单"（isSplit=false）的覆盖量之和', 43)] }),
  ]
});
children.push(scopeTable);

children.push(heading2('1.5 拆单链与叶子子单定义'));
children.push(para('拆单是指接单方收到子单后，将子单进一步拆分为多张子子单派发给更下级区域。拆单形成链路：'));
children.push(bulletPara('根子单：由主单直接派发的子单（parentSubTicketId=null）'));
children.push(bulletPara('中间子单：被接单方二次拆单的子单（isSplit=true），其覆盖量数据不参与全口径汇总'));
children.push(bulletPara('叶子子单：未被二次拆单的子单（isSplit=false），其覆盖量数据参与全口径汇总'));
children.push(para(''));
children.push(para('示例：新疆→乌鲁木齐(800人,isSplit=true)→天山区(500人)+沙区(300人)，全口径目标客户数=500+300=800（仅叶子子单汇总）'));

// ─── 第二章：逐场景穿越验证 ───
children.push(heading1('二、逐场景穿越验证'));

for (const scenario of scenarios) {
  children.push(heading2(`场景${scenario.id}：${scenario.name}`));
  children.push(para(scenario.desc));

  children.push(heading3('子单清单'));
  const soHeaderRow = new TableRow({
    children: [headerCell('子单ID', 12), headerCell('派单方', 12), headerCell('接单方', 12), headerCell('目标客户', 12), headerCell('触达客户', 12), headerCell('营销成功', 12), headerCell('状态', 12), headerCell('是否被拆', 12)]
  });
  const soDataRows = scenario.subOrders.map(so => new TableRow({
    children: [
      dataCell(so.id, 12),
      dataCell(so.from, 12),
      dataCell(so.to, 12),
      dataCell(so.target, 12),
      dataCell(so.reached, 12),
      dataCell(so.success, 12),
      dataCell(so.status === 'completed' ? '已完成' : so.status === 'pending' ? '待处理' : '已撤回', 12, { color: so.status === 'cancelled' ? 'CC0000' : so.status === 'pending' ? 'CC8800' : '008800' }),
      dataCell(so.isSplit ? '是(isSplit)' : '否(叶子)', 12, { color: so.isSplit ? 'CC8800' : '008800' }),
    ]
  }));
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [soHeaderRow, ...soDataRows] }));

  // 派单视角
  children.push(heading3('派单视角'));
  const dispatchRows = computeDispatchPerspective(scenario.subOrders, scenario.id);
  children.push(para('行为量指标：递归汇总；覆盖量指标：叶子子单汇总（全口径列中绿色底色的目标/触达/成功为叶子子单汇总值）'));
  children.push(dispatchTable(dispatchRows));

  // 接单视角
  children.push(heading3('接单视角'));
  const receiveRows = computeReceivePerspective(scenario.subOrders, scenario.id);
  children.push(para('接单视角：撤单子单不计入接单量；覆盖量指标全口径仅汇总叶子子单'));
  children.push(receiveTable(receiveRows));

  // 特殊推导说明
  if (scenario.id === 2) {
    children.push(para(''));
    children.push(boldPara('关键推导：', '乌鲁木齐接到的子单目标800人，拆成天山区500+沙区300。'));
    children.push(bulletPara('派单视角全口径目标客户数 = 叶子子单汇总 = 500+300 = 800（与新疆派出的800一致，不重复计数）'));
    children.push(bulletPara('行为量全口径派单量 = 递归汇总 = 1(新疆)+2(乌鲁木齐) = 3次（每次派发都是独立行为）'));
  }
  if (scenario.id === 6) {
    children.push(para(''));
    children.push(boldPara('关键推导（最复杂场景）：', '三级拆单链，验证覆盖量全口径叶子子单汇总的正确性。'));
    children.push(bulletPara('天山区全口径：本级派2单(天山区→网格A/B)，覆盖量=250+250=500（叶子汇总）'));
    children.push(bulletPara('乌鲁木齐全口径：行为量=1(本级)+2(天山区)=3次派发；覆盖量=叶子汇总(250+250+300)=800'));
    children.push(bulletPara('新疆全口径：行为量=1(本级)+3(乌鲁木齐)=4次派发；覆盖量=叶子汇总(250+250+300)=800'));
    children.push(boldPara('验证通过：', '新疆派800人，经多级拆单后全口径目标客户数仍为800，未重复计数。'));
  }
  if (scenario.id === 5) {
    children.push(para(''));
    children.push(boldPara('撤单口径验证：', ''));
    children.push(bulletPara('派单视角：克拉玛依子单已撤回，派单量照计(=2)，但不计入待处理/已处理'));
    children.push(bulletPara('接单视角：克拉玛依子单已撤回，不计入接单量(=1)，视为未接收'));
  }
}

// ─── 第三章：全量汇总 ───
children.push(heading1('三、全量汇总（所有场景子单汇总）'));

const allSubOrders = scenarios.flatMap(s => s.subOrders);
children.push(heading2('派单视角全量汇总'));
const allDispatchRows = computeDispatchPerspective(allSubOrders, 99);
children.push(dispatchTable(allDispatchRows));

children.push(heading2('接单视角全量汇总'));
const allReceiveRows = computeReceivePerspective(allSubOrders, 99);
children.push(receiveTable(allReceiveRows));

// ─── 第四章：口径规则速查表 ───
children.push(heading1('四、口径规则速查表'));

const ruleRows = [
  ['派单量', '行为量', '本区域派发的子单数量', '本区域+所有下级子单数量之和（递归汇总）'],
  ['接单量', '行为量', '本区域接收的非撤单子单数量', '本区域+所有下级非撤单子单数量之和（递归汇总）'],
  ['待处理', '行为量', '本区域pending子单数量', '全口径pending子单数量之和（递归汇总）'],
  ['已处理', '行为量', '本区域completed子单数量', '全口径completed子单数量之和（递归汇总）'],
  ['撤单', '行为量', '本区域cancelled子单数量', '全口径cancelled子单数量之和（递归汇总）'],
  ['目标客户数', '覆盖量', '本区域子单圈定客群总人数', '叶子子单(isSplit=false)圈定客群总人数之和'],
  ['触达客户数', '覆盖量', '本区域子单实际触达客户数', '叶子子单实际触达客户数之和'],
  ['营销成功量', '覆盖量', '本区域子单成功转化客户数', '叶子子单成功转化客户数之和'],
  ['触达率', '率值', '触达客户数÷目标客户数', '叶子触达÷叶子目标'],
  ['成功率', '率值', '营销成功量÷触达客户数', '叶子成功÷叶子触达'],
  ['处理率', '率值', '已处理÷(已处理+待处理)', '全口径已处理÷(全口径已处理+全口径待处理)'],
  ['及时率', '率值', '及时完成数÷已处理数', '全口径及时完成数÷全口径已处理数'],
  ['归档率', '率值', '已归档数÷已处理数', '全口径已归档数÷全口径已处理数'],
];

const ruleTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  layout: TableLayoutType.FIXED,
  rows: [
    new TableRow({ children: [headerCell('指标名', 12), headerCell('指标类型', 10), headerCell('本级口径', 39), headerCell('全口径口径', 39)] }),
    ...ruleRows.map(r => new TableRow({ children: [
      dataCellLeft(r[0], 12, { bold: true }),
      dataCell(r[1], 10, { color: r[1] === '覆盖量' ? 'CC8800' : '333333' }),
      dataCellLeft(r[2], 39),
      dataCellLeft(r[3], 39),
    ]}))
  ]
});
children.push(ruleTable);

children.push(para(''));
children.push(boldPara('版本更新说明：', 'V2.0版本核心变更——覆盖量指标（目标客户数/触达客户数/营销成功量）的全口径算法从"递归汇总"改为"叶子子单汇总"，解决多级拆单链路中同一批客户被重复计数的问题。行为量指标（派单量/待处理/已处理/撤单）的全口径算法保持"递归汇总"不变。'));

// ─── 生成文档 ───

const doc = new Document({
  sections: [{ properties: { page: { margin: { top: convertInchesToTwip(0.8), bottom: convertInchesToTwip(0.8), left: convertInchesToTwip(0.6), right: convertInchesToTwip(0.6) } } }, children }]
});

(async () => {
  const buffer = await Packer.toBuffer(doc);
  const outDir = '/workspace/projects/docs/需求设计方案';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, '工单分析口径体系-场景穿越验证手册.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Document generated: ' + outPath);
})();
