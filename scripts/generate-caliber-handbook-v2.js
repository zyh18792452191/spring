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

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: '999999' };
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

// ─── 场景数据（完全匹配V2.0文档） ───

const scenarios = [
  {
    id: 1, name: '新疆派单到地市',
    desc: '新疆省公司创建一张父单，生成2张子单分别派发给乌鲁木齐和克拉玛依执行。这是最基础的"省→地市"一级派单。',
    regions: ['新疆', '乌鲁木齐', '天山区', '沙区', '克拉玛依'],
    subOrders: [
      { id: 'S1-1', from: '新疆', to: '乌鲁木齐', status: 'completed', target: 500, reached: 450, success: 45, isSplit: false },
      { id: 'S1-2', from: '新疆', to: '克拉玛依', status: 'pending',   target: 300, reached: 0,   success: 0,  isSplit: false },
    ],
    dispatchOwn: [
      { region: '新疆', dispatched: 2, pending: 1, processed: 1, target: 800, reached: 450, success: 45, rate: '50%' },
      { region: '乌鲁木齐', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '天山区', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '沙区', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '克拉玛依', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
    ],
    dispatchFull: [
      { region: '新疆', dispatched: 2, pending: 1, processed: 1, target: 800, reached: 450, success: 45, rate: '50%' },
      { region: '乌鲁木齐', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '天山区', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '沙区', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '克拉玛依', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    dispatchOwnDerivation: '新疆本级派发了S1-1和S1-2共2张；乌鲁木齐、天山区、沙区、克拉玛依均未派单',
    dispatchFullDerivation: '新疆全口径=本级(2)+乌鲁木齐全口径(0)+克拉玛依全口径(0)=2；下级全无派单行为。本场景无拆单，覆盖量=行为量汇总结果一致',
    receiveOwn: [
      { region: '新疆', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', received: 1, pending: 0, processed: 1, target: 500, reached: 450, success: 45, rate: '100%' },
      { region: '天山区', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '沙区', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '克拉玛依', received: 1, pending: 1, processed: 0, target: 300, reached: 0, success: 0, rate: '0%' },
    ],
    receiveFull: [
      { region: '新疆', received: 2, pending: 1, processed: 1, target: 800, reached: 450, success: 45, rate: '50%' },
      { region: '乌鲁木齐', received: 1, pending: 0, processed: 1, target: 500, reached: 450, success: 45, rate: '100%' },
      { region: '天山区', received: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '沙区', received: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '克拉玛依', received: 1, pending: 1, processed: 0, target: 300, reached: 0, success: 0, rate: '0%' },
    ],
    receiveOwnDerivation: 'S1-1由乌鲁木齐接单（已完成），S1-2由克拉玛依接单（待处理）',
    receiveFullDerivation: '乌鲁木齐全口径接单=本级(1)+天山区全口径(0)+沙区全口径(0)=1',
    validations: [
      { item: '新疆全口径派单=新疆全口径接单', left: '2', right: '2', result: '✓' },
    ],
    observations: [
      '乌鲁木齐和克拉玛依在派单视角下全部为0——他们没有派单行为，只是接单方',
      '乌鲁木齐和克拉玛依在接单视角下各自只有本级数据——他们是终端执行者，下级无再接单',
      '本场景无拆单，行为量和覆盖量的全口径结果完全一致',
    ]
  },
  {
    id: 2, name: '新疆直接派单到网格（跨级派单）',
    desc: '新疆省公司跳过乌鲁木齐和天山区，直接派3张子单给天山区的网格A。这是"跨级派单"的典型场景——中间层级乌鲁木齐和天山区既不是派单方也不是接单方。',
    regions: ['新疆', '乌鲁木齐', '天山区', '网格A'],
    subOrders: [
      { id: 'S2-1', from: '新疆', to: '网格A', status: 'completed', target: 200, reached: 180, success: 18, isSplit: false },
      { id: 'S2-2', from: '新疆', to: '网格A', status: 'completed', target: 150, reached: 140, success: 21, isSplit: false },
      { id: 'S2-3', from: '新疆', to: '网格A', status: 'pending',   target: 100, reached: 0,   success: 0,  isSplit: false },
    ],
    dispatchOwn: [
      { region: '新疆', dispatched: 3, pending: 1, processed: 2, target: 450, reached: 320, success: 39, rate: '67%' },
      { region: '乌鲁木齐', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '天山区', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '网格A', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
    ],
    dispatchFull: [
      { region: '新疆', dispatched: 3, pending: 1, processed: 2, target: 450, reached: 320, success: 39, rate: '67%' },
      { region: '乌鲁木齐', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '天山区', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '网格A', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    dispatchOwnDerivation: '只有新疆本级派单了3张（S2-1/2/3），其余区域均无派单行为',
    dispatchFullDerivation: '全口径派单=本级+下级全口径，但下级全无派单行为→全口径全为0',
    receiveOwn: [
      { region: '新疆', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '天山区', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '网格A', received: 3, pending: 1, processed: 2, target: 450, reached: 320, success: 39, rate: '67%' },
    ],
    receiveFull: [
      { region: '新疆', received: 3, pending: 1, processed: 2, target: 450, reached: 320, success: 39, rate: '67%' },
      { region: '乌鲁木齐', received: 3, pending: 1, processed: 2, target: 450, reached: 320, success: 39, rate: '67%' },
      { region: '天山区', received: 3, pending: 1, processed: 2, target: 450, reached: 320, success: 39, rate: '67%' },
      { region: '网格A', received: 3, pending: 1, processed: 2, target: 450, reached: 320, success: 39, rate: '67%' },
    ],
    receiveOwnDerivation: '只有网格A是接单方（S2-1/2/3），中间层级乌鲁木齐、天山区不是接单方',
    receiveFullDerivation: '网格A全口径=本级(3)=3；天山区全口径=本级(0)+网格A(3)+网格B(0)=3；乌鲁木齐全口径=本级(0)+天山区全口径(3)+沙区全口径(0)=3；新疆全口径=本级(0)+乌鲁木齐全口径(3)+克拉玛依全口径(0)=3',
    validations: [
      { item: '新疆全口径派单=新疆全口径接单', left: '3', right: '3', result: '✓' },
    ],
    observations: [
      '跨级派单的核心特征：乌鲁木齐和天山区在派单视角下全部为0，但在接单视角下全口径=3。因为派单全口径看的是"辖区内谁派了单"，而接单全口径看的是"辖区内谁在执行单"',
      '乌鲁木齐全口径派单(0)≠乌鲁木齐全口径接单(3)，差值=3，正好是新疆直派到辖区网格的3张子单',
      '本场景无拆单，行为量和覆盖量的全口径结果完全一致',
    ]
  },
  {
    id: 3, name: '地市派单到区县',
    desc: '乌鲁木齐创建父单，派2张子单分别给天山区和沙区。这是"地市→区县"一级派单，省公司不参与。',
    regions: ['新疆', '乌鲁木齐', '天山区', '沙区'],
    subOrders: [
      { id: 'S3-1', from: '乌鲁木齐', to: '天山区', status: 'completed', target: 400, reached: 360, success: 36, isSplit: false },
      { id: 'S3-2', from: '乌鲁木齐', to: '沙区',     status: 'pending',   target: 350, reached: 0,   success: 0,  isSplit: false },
    ],
    dispatchOwn: [
      { region: '新疆', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', dispatched: 2, pending: 1, processed: 1, target: 750, reached: 360, success: 36, rate: '50%' },
      { region: '天山区', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '沙区', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
    ],
    dispatchFull: [
      { region: '新疆', dispatched: 2, pending: 1, processed: 1, target: 750, reached: 360, success: 36, rate: '50%' },
      { region: '乌鲁木齐', dispatched: 2, pending: 1, processed: 1, target: 750, reached: 360, success: 36, rate: '50%' },
      { region: '天山区', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '沙区', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    dispatchOwnDerivation: '乌鲁木齐本级派发S3-1和S3-2共2张子单',
    dispatchFullDerivation: '天山区全口径派单=本级(0)=0；乌鲁木齐全口径派单=本级(2)+天山区(0)+沙区(0)=2；新疆全口径派单=本级(0)+乌鲁木齐(2)+克拉玛依(0)=2',
    receiveOwn: [
      { region: '新疆', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '天山区', received: 1, pending: 0, processed: 1, target: 400, reached: 360, success: 36, rate: '100%' },
      { region: '沙区', received: 1, pending: 1, processed: 0, target: 350, reached: 0, success: 0, rate: '0%' },
    ],
    receiveFull: [
      { region: '新疆', received: 2, pending: 1, processed: 1, target: 750, reached: 360, success: 36, rate: '50%' },
      { region: '乌鲁木齐', received: 2, pending: 1, processed: 1, target: 750, reached: 360, success: 36, rate: '50%' },
      { region: '天山区', received: 1, pending: 0, processed: 1, target: 400, reached: 360, success: 36, rate: '100%' },
      { region: '沙区', received: 1, pending: 1, processed: 0, target: 350, reached: 0, success: 0, rate: '0%' },
    ],
    receiveOwnDerivation: 'S3-1由天山区接单（已完成），S3-2由沙区接单（待处理）',
    receiveFullDerivation: '乌鲁木齐全口径接单=本级(0)+天山区(1)+沙区(1)=2；新疆全口径接单=本级(0)+乌鲁木齐(2)+克拉玛依(0)=2',
    validations: [
      { item: '新疆全口径派单=新疆全口径接单', left: '2', right: '2', result: '✓' },
    ],
    observations: [
      '乌鲁木齐全口径派单=2=乌鲁木齐全口径接单=2，因为乌鲁木齐既是唯一的派单方，又是天山区和沙区的上级组织',
      '天山区本级派单=0但本级接单=1；沙区本级派单=0但本级接单=1——只接单不派单',
      '本场景无拆单，行为量和覆盖量的全口径结果完全一致',
    ]
  },
  {
    id: 4, name: '地市直接派单到网格（跨级派单）',
    desc: '乌鲁木齐跳过天山区，直接派2张子单给网格A。与场景2对称，但派单方从省公司变成地市。',
    regions: ['新疆', '乌鲁木齐', '天山区', '网格A'],
    subOrders: [
      { id: 'S4-1', from: '乌鲁木齐', to: '网格A', status: 'completed', target: 300, reached: 270, success: 27, isSplit: false },
      { id: 'S4-2', from: '乌鲁木齐', to: '网格A', status: 'pending',   target: 250, reached: 0,   success: 0,  isSplit: false },
    ],
    dispatchOwn: [
      { region: '新疆', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', dispatched: 2, pending: 1, processed: 1, target: 550, reached: 270, success: 27, rate: '50%' },
      { region: '天山区', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '网格A', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
    ],
    dispatchFull: [
      { region: '新疆', dispatched: 2, pending: 1, processed: 1, target: 550, reached: 270, success: 27, rate: '50%' },
      { region: '乌鲁木齐', dispatched: 2, pending: 1, processed: 1, target: 550, reached: 270, success: 27, rate: '50%' },
      { region: '天山区', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '网格A', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    dispatchOwnDerivation: '乌鲁木齐本级派发S4-1和S4-2共2张子单',
    dispatchFullDerivation: '天山区、网格A均无派单行为；乌鲁木齐全口径=本级(2)；新疆全口径=乌鲁木齐全口径(2)',
    receiveOwn: [
      { region: '新疆', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '天山区', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '网格A', received: 2, pending: 1, processed: 1, target: 550, reached: 270, success: 27, rate: '50%' },
    ],
    receiveFull: [
      { region: '新疆', received: 2, pending: 1, processed: 1, target: 550, reached: 270, success: 27, rate: '50%' },
      { region: '乌鲁木齐', received: 2, pending: 1, processed: 1, target: 550, reached: 270, success: 27, rate: '50%' },
      { region: '天山区', received: 2, pending: 1, processed: 1, target: 550, reached: 270, success: 27, rate: '50%' },
      { region: '网格A', received: 2, pending: 1, processed: 1, target: 550, reached: 270, success: 27, rate: '50%' },
    ],
    receiveOwnDerivation: '只有网格A是接单方（S4-1/2），中间层级不是接单方',
    receiveFullDerivation: '网格A全口径=本级(2)；天山区全口径=本级(0)+网格A(2)+网格B(0)=2；乌鲁木齐全口径=本级(0)+天山区(2)+沙区(0)=2；新疆全口径=本级(0)+乌鲁木齐(2)+克拉玛依(0)=2',
    validations: [
      { item: '新疆全口径派单=新疆全口径接单', left: '2', right: '2', result: '✓' },
      { item: '乌鲁木齐全口径派单=乌鲁木齐全口径接单', left: '2', right: '2', result: '✓' },
      { item: '天山区全口径派单 vs 天山区全口径接单', left: '0', right: '2', result: '派单<接单' },
    ],
    observations: [
      '天山区本级派单=0但全口径接单=2——乌鲁木齐跨级派单到天山区管辖的网格A，天山区在接单全口径下"看到"了这2张子单',
      '乌鲁木齐全口径派单=2=乌鲁木齐全口径接单=2——乌鲁木齐既是派单方，又是网格A的组织上级，恰好相等',
      '本场景无拆单，行为量和覆盖量的全口径结果完全一致',
    ]
  },
  {
    id: 5, name: '区县派单到网格',
    desc: '天山区创建父单，派2张子单分别给网格A和网格B执行。全部已完成。',
    regions: ['新疆', '乌鲁木齐', '天山区', '网格A', '网格B'],
    subOrders: [
      { id: 'S5-1', from: '天山区', to: '网格A', status: 'completed', target: 400, reached: 360, success: 36, isSplit: false },
      { id: 'S5-2', from: '天山区', to: '网格B', status: 'completed', target: 300, reached: 285, success: 43, isSplit: false },
    ],
    dispatchOwn: [
      { region: '新疆', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '天山区', dispatched: 2, pending: 0, processed: 2, target: 700, reached: 645, success: 79, rate: '100%' },
      { region: '网格A', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '网格B', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
    ],
    dispatchFull: [
      { region: '新疆', dispatched: 2, pending: 0, processed: 2, target: 700, reached: 645, success: 79, rate: '100%' },
      { region: '乌鲁木齐', dispatched: 2, pending: 0, processed: 2, target: 700, reached: 645, success: 79, rate: '100%' },
      { region: '天山区', dispatched: 2, pending: 0, processed: 2, target: 700, reached: 645, success: 79, rate: '100%' },
      { region: '网格A', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '网格B', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    dispatchOwnDerivation: '天山区本级派发S5-1和S5-2共2张，全部已完成',
    dispatchFullDerivation: '天山区全口径=本级(2)+网格A(0)+网格B(0)=2；向上递归',
    receiveOwn: [
      { region: '新疆', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '天山区', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '网格A', received: 1, pending: 0, processed: 1, target: 400, reached: 360, success: 36, rate: '100%' },
      { region: '网格B', received: 1, pending: 0, processed: 1, target: 300, reached: 285, success: 43, rate: '100%' },
    ],
    receiveFull: [
      { region: '新疆', received: 2, pending: 0, processed: 2, target: 700, reached: 645, success: 79, rate: '100%' },
      { region: '乌鲁木齐', received: 2, pending: 0, processed: 2, target: 700, reached: 645, success: 79, rate: '100%' },
      { region: '天山区', received: 2, pending: 0, processed: 2, target: 700, reached: 645, success: 79, rate: '100%' },
      { region: '网格A', received: 1, pending: 0, processed: 1, target: 400, reached: 360, success: 36, rate: '100%' },
      { region: '网格B', received: 1, pending: 0, processed: 1, target: 300, reached: 285, success: 43, rate: '100%' },
    ],
    receiveOwnDerivation: 'S5-1由网格A接单，S5-2由网格B接单，全部已完成',
    receiveFullDerivation: '网格A全口径=本级(1)；网格B全口径=本级(1)；天山区全口径接单=本级(0)+网格A(1)+网格B(1)=2；向上递归',
    validations: [
      { item: '新疆全口径派单=新疆全口径接单', left: '2', right: '2', result: '✓' },
      { item: '乌鲁木齐全口径派单=乌鲁木齐全口径接单', left: '2', right: '2', result: '✓' },
      { item: '天山区全口径派单=天山区全口径接单', left: '2', right: '2', result: '✓' },
    ],
    observations: [
      '天山区本级派单=2但本级接单=0；天山区全口径派单=2=全口径接单=2',
      '本场景中天山区是派单方且下辖的网格是接单方，全口径派单和接单恰好相等',
      '天山区本级接单=0——天山区不接单，只派单给网格执行',
      '本场景无拆单，行为量和覆盖量的全口径结果完全一致',
    ]
  },
  {
    id: 6, name: '三次派单链（含1→2拆单）',
    desc: '新疆派1张子单给乌鲁木齐；乌鲁木齐二次拆为2张给天山区和沙区；天山区又二次拆为2张给网格A和网格B。这是最复杂的多级拆单链场景。全部执行完毕。',
    regions: ['新疆', '乌鲁木齐', '天山区', '沙区', '网格A', '网格B'],
    subOrders: [
      { id: 'S6-1', from: '新疆',     to: '乌鲁木齐', status: 'completed', target: 800, reached: 600, success: 72, isSplit: true },
      { id: 'S6-2', from: '乌鲁木齐', to: '天山区',   status: 'completed', target: 500, reached: 380, success: 46, isSplit: true },
      { id: 'S6-3', from: '乌鲁木齐', to: '沙区',     status: 'completed', target: 300, reached: 220, success: 26, isSplit: false },
      { id: 'S6-4', from: '天山区',   to: '网格A',   status: 'completed', target: 300, reached: 230, success: 28, isSplit: false },
      { id: 'S6-5', from: '天山区',   to: '网格B',   status: 'completed', target: 200, reached: 150, success: 18, isSplit: false },
    ],
    dispatchOwn: [
      { region: '新疆', dispatched: 1, pending: 0, processed: 1, target: 800, reached: 600, success: 72, rate: '100%' },
      { region: '乌鲁木齐', dispatched: 2, pending: 0, processed: 2, target: 800, reached: 600, success: 72, rate: '100%' },
      { region: '天山区', dispatched: 2, pending: 0, processed: 2, target: 500, reached: 380, success: 46, rate: '100%' },
      { region: '沙区', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '网格A', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '网格B', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
    ],
    dispatchFull: [
      { region: '新疆', dispatched: 5, pending: 0, processed: 5, target: 800, reached: 600, success: 72, rate: '100%' },
      { region: '乌鲁木齐', dispatched: 4, pending: 0, processed: 4, target: 800, reached: 600, success: 72, rate: '100%' },
      { region: '天山区', dispatched: 2, pending: 0, processed: 2, target: 500, reached: 380, success: 46, rate: '100%' },
      { region: '沙区', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '网格A', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '网格B', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    dispatchOwnDerivation: '新疆本级：派S6-1共1张；乌鲁木齐本级：派S6-2+S6-3共2张；天山区本级：派S6-4+S6-5共2张。S6-2+S6-3的目标=500+300=800，触达=380+220=600，成功=46+26=72；S6-4+S6-5的目标=300+200=500，触达=230+150=380，成功=28+18=46',
    dispatchFullDerivation: '【行为量】天山区全口径派单=本级(2)+网格A(0)+网格B(0)=2；乌鲁木齐全口径=本级(2)+天山区全口径(2)+沙区全口径(0)=4；新疆全口径=本级(1)+乌鲁木齐全口径(4)+克拉玛依全口径(0)=5\n【覆盖量】叶子子单=S6-3(300)+S6-4(300)+S6-5(200)=800。天山区叶子=S6-4+S6-5=500；乌鲁木齐叶子=S6-3+S6-4+S6-5=800；新疆叶子=S6-3+S6-4+S6-5=800',
    receiveOwn: [
      { region: '新疆', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', received: 1, pending: 0, processed: 1, target: 800, reached: 600, success: 72, rate: '100%' },
      { region: '天山区', received: 1, pending: 0, processed: 1, target: 500, reached: 380, success: 46, rate: '100%' },
      { region: '沙区', received: 1, pending: 0, processed: 1, target: 300, reached: 220, success: 26, rate: '100%' },
      { region: '网格A', received: 1, pending: 0, processed: 1, target: 300, reached: 230, success: 28, rate: '100%' },
      { region: '网格B', received: 1, pending: 0, processed: 1, target: 200, reached: 150, success: 18, rate: '100%' },
    ],
    receiveFull: [
      { region: '新疆', received: 5, pending: 0, processed: 5, target: 800, reached: 600, success: 72, rate: '100%' },
      { region: '乌鲁木齐', received: 5, pending: 0, processed: 5, target: 800, reached: 600, success: 72, rate: '100%' },
      { region: '天山区', received: 3, pending: 0, processed: 3, target: 800, reached: 600, success: 72, rate: '100%' },
      { region: '沙区', received: 1, pending: 0, processed: 1, target: 300, reached: 220, success: 26, rate: '100%' },
      { region: '网格A', received: 1, pending: 0, processed: 1, target: 300, reached: 230, success: 28, rate: '100%' },
      { region: '网格B', received: 1, pending: 0, processed: 1, target: 200, reached: 150, success: 18, rate: '100%' },
    ],
    receiveOwnDerivation: 'S6-1：乌鲁木齐接单；S6-2：天山区接单；S6-3：沙区接单；S6-4：网格A接单；S6-5：网格B接单',
    receiveFullDerivation: '【行为量】网格A/B全口径=本级(1)；天山区全口径=本级(1)+网格A(1)+网格B(1)=3；乌鲁木齐全口径=本级(1)+天山区全口径(3)+沙区全口径(1)=5；新疆全口径=本级(0)+乌鲁木齐(5)+克拉玛依(0)=5\n【覆盖量】叶子子单汇总：天山区管辖下叶子=S6-4(300)+S6-5(200)=500→但接单视角天山区管辖范围还含本级接单的S6-2(S6-2是中间子单isSplit=true，其覆盖量=叶子汇总=300+200=500)。所以天山区全口径覆盖量=500(叶子)=S6-4+S6-5。乌鲁木齐管辖下叶子=S6-3+S6-4+S6-5=800。新疆管辖下叶子=S6-3+S6-4+S6-5=800',
    validations: [
      { item: '新疆全口径派单 vs 新疆全口径接单', left: '5', right: '5', result: '✓ 相等' },
      { item: '乌鲁木齐全口径派单 vs 乌鲁木齐全口径接单', left: '4', right: '5', result: '派单<接单(-1)' },
      { item: '天山区全口径派单 vs 天山区全口径接单', left: '2', right: '3', result: '派单<接单(-1)' },
      { item: '沙区全口径派单 vs 沙区全口径接单', left: '0', right: '1', result: '派单<接单(-1)' },
    ],
    observations: [
      '【V2.0核心验证】新疆派800人，经乌鲁木齐→天山区→网格A/B三级拆单，全口径目标客户数=叶子子单汇总(S6-3+S6-4+S6-5)=300+300+200=800，未重复计数。旧算法(V1.0)递归汇总=800+500+300+300+200=2100，重复计数1300人',
      '乌鲁木齐差值分析：乌鲁木齐全口径派单=4（S6-2+S6-3=2，加天山区全口径2=4），但乌鲁木齐全口径接单=5（本级接S6-1=1，加天山区全口径3和沙区1=5）。差值=1，即S6-1——这张子单的派单方是新疆，不在乌鲁木齐的派单全口径树内',
      '天山区差值分析：天山区全口径派单=2（S6-4+S6-5），全口径接单=3（本级S6-2+网格A接S6-4+网格B接S6-5）',
      '根节点自洽：新疆全口径派单=5=新疆全口径接单=5 ✓',
    ]
  },
  {
    id: 7, name: '二次派单链',
    desc: '乌鲁木齐派1张子单给天山区；天山区二次拆为2张给网格A和网格B。与场景6类似但少了省→地市这一层，且少了沙区。全部已完成。',
    regions: ['新疆', '乌鲁木齐', '天山区', '网格A', '网格B'],
    subOrders: [
      { id: 'S7-1', from: '乌鲁木齐', to: '天山区', status: 'completed', target: 600, reached: 480, success: 54, isSplit: true },
      { id: 'S7-2', from: '天山区',   to: '网格A', status: 'completed', target: 350, reached: 280, success: 35, isSplit: false },
      { id: 'S7-3', from: '天山区',   to: '网格B', status: 'completed', target: 250, reached: 200, success: 19, isSplit: false },
    ],
    dispatchOwn: [
      { region: '新疆', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', dispatched: 1, pending: 0, processed: 1, target: 600, reached: 480, success: 54, rate: '100%' },
      { region: '天山区', dispatched: 2, pending: 0, processed: 2, target: 600, reached: 480, success: 54, rate: '100%' },
      { region: '网格A', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '网格B', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
    ],
    dispatchFull: [
      { region: '新疆', dispatched: 3, pending: 0, processed: 3, target: 600, reached: 480, success: 54, rate: '100%' },
      { region: '乌鲁木齐', dispatched: 3, pending: 0, processed: 3, target: 600, reached: 480, success: 54, rate: '100%' },
      { region: '天山区', dispatched: 2, pending: 0, processed: 2, target: 600, reached: 480, success: 54, rate: '100%' },
      { region: '网格A', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '网格B', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    dispatchOwnDerivation: 'S7-2+S7-3的目标=350+250=600，触达=280+200=480，成功=35+19=54',
    dispatchFullDerivation: '【行为量】天山区全口径派单=本级(2)+网格A(0)+网格B(0)=2；乌鲁木齐全口径=本级(1)+天山区全口径(2)+沙区全口径(0)=3；新疆全口径=本级(0)+乌鲁木齐全口径(3)=3\n【覆盖量】叶子子单=S7-2(350)+S7-3(250)=600。天山区全口径覆盖量=600；乌鲁木齐全口径覆盖量=600；新疆全口径覆盖量=600',
    receiveOwn: [
      { region: '新疆', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '天山区', received: 1, pending: 0, processed: 1, target: 600, reached: 480, success: 54, rate: '100%' },
      { region: '网格A', received: 1, pending: 0, processed: 1, target: 350, reached: 280, success: 35, rate: '100%' },
      { region: '网格B', received: 1, pending: 0, processed: 1, target: 250, reached: 200, success: 19, rate: '100%' },
    ],
    receiveFull: [
      { region: '新疆', received: 3, pending: 0, processed: 3, target: 600, reached: 480, success: 54, rate: '100%' },
      { region: '乌鲁木齐', received: 3, pending: 0, processed: 3, target: 600, reached: 480, success: 54, rate: '100%' },
      { region: '天山区', received: 3, pending: 0, processed: 3, target: 600, reached: 480, success: 54, rate: '100%' },
      { region: '网格A', received: 1, pending: 0, processed: 1, target: 350, reached: 280, success: 35, rate: '100%' },
      { region: '网格B', received: 1, pending: 0, processed: 1, target: 250, reached: 200, success: 19, rate: '100%' },
    ],
    receiveOwnDerivation: 'S7-1：天山区接单；S7-2：网格A接单；S7-3：网格B接单',
    receiveFullDerivation: '【行为量】网格A/B全口径=本级(1)；天山区全口径=本级(1)+网格A(1)+网格B(1)=3；乌鲁木齐全口径=本级(0)+天山区全口径(3)+沙区(0)=3；新疆全口径=本级(0)+乌鲁木齐全口径(3)=3\n【覆盖量】叶子子单汇总：天山区管辖下叶子=S7-2(350)+S7-3(250)=600；乌鲁木齐管辖下=600；新疆管辖下=600',
    validations: [
      { item: '新疆全口径派单 vs 新疆全口径接单', left: '3', right: '3', result: '✓ 相等' },
      { item: '乌鲁木齐全口径派单 vs 乌鲁木齐全口径接单', left: '3', right: '3', result: '✓ 相等' },
      { item: '天山区全口径派单 vs 天山区全口径接单', left: '2', right: '3', result: '派单<接单(-1)' },
    ],
    observations: [
      '【V2.0核心验证】乌鲁木齐派600人→天山区拆成350+250→全口径目标客户数=叶子子单汇总(S7-2+S7-3)=600，未重复计数。旧算法(V1.0)递归汇总=600+350+250=1200，重复计数600人',
      '天山区全口径派单=2≠天山区全口径接单=3，差值=1即S7-1（乌鲁木齐派给天山区的子单，在天山区派单视角中不可见）',
      '乌鲁木齐全口径派单=3=乌鲁木齐全口径接单=3——乌鲁木齐既是S7-1的派单方（1张），又是天山区全口径接单(3)的组织上级',
    ]
  },
  {
    id: 9, name: '上级自执行',
    desc: '新疆省公司自己创建3张工单自己执行。派单方和接单方都是新疆，两个视角的数据完全相同。',
    regions: ['新疆', '乌鲁木齐'],
    subOrders: [
      { id: 'S9-1', from: '新疆', to: '新疆', status: 'completed', target: 100, reached: 90,  success: 12, isSplit: false },
      { id: 'S9-2', from: '新疆', to: '新疆', status: 'completed', target: 80,  reached: 72,  success: 8,  isSplit: false },
      { id: 'S9-3', from: '新疆', to: '新疆', status: 'pending',   target: 60,  reached: 0,   success: 0,  isSplit: false },
    ],
    dispatchOwn: [
      { region: '新疆', dispatched: 3, pending: 1, processed: 2, target: 240, reached: 162, success: 20, rate: '67%' },
      { region: '乌鲁木齐', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
    ],
    dispatchFull: [
      { region: '新疆', dispatched: 3, pending: 1, processed: 2, target: 240, reached: 162, success: 20, rate: '67%' },
      { region: '乌鲁木齐', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    dispatchOwnDerivation: '新疆本级派发了3张子单（S9-1/2/3），全部由新疆自己执行',
    dispatchFullDerivation: '新疆全口径=本级(3)+乌鲁木齐全口径(0)=3；下级无派单行为',
    receiveOwn: [
      { region: '新疆', received: 3, pending: 1, processed: 2, target: 240, reached: 162, success: 20, rate: '67%' },
      { region: '乌鲁木齐', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
    ],
    receiveFull: [
      { region: '新疆', received: 3, pending: 1, processed: 2, target: 240, reached: 162, success: 20, rate: '67%' },
      { region: '乌鲁木齐', received: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    receiveOwnDerivation: '新疆自己接收并执行S9-1/2/3',
    receiveFullDerivation: '新疆全口径=本级(3)+乌鲁木齐全口径(0)=3',
    validations: [
      { item: '新疆全口径派单=新疆全口径接单', left: '3', right: '3', result: '✓' },
    ],
    observations: [
      '派单视角和接单视角完全相同——因为新疆既当派单方又当接单方',
      '乌鲁木齐在本场景中完全无关，所有数据为0',
      '这是最简单的场景，但也是省公司自建自营的真实业务场景',
    ]
  },
  {
    id: 10, name: '撤单',
    desc: '新疆派1张子单给乌鲁木齐，但乌鲁木齐在执行前撤单。这是唯一会导致全口径派单≠接单的场景。',
    regions: ['新疆', '乌鲁木齐'],
    subOrders: [
      { id: 'S10-1', from: '新疆', to: '乌鲁木齐', status: 'cancelled', target: 400, reached: 0, success: 0, isSplit: false },
    ],
    dispatchOwn: [
      { region: '新疆', dispatched: 1, pending: 0, processed: 0, target: 400, reached: 0, success: 0, rate: '0%' },
      { region: '乌鲁木齐', dispatched: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
    ],
    dispatchFull: [
      { region: '新疆', dispatched: 1, pending: 0, processed: 0, target: 400, reached: 0, success: 0, rate: '0%' },
      { region: '乌鲁木齐', dispatched: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    dispatchOwnDerivation: '派单量=1（照计，派发动作已发生），待处理=0（已撤单不算待处理），已处理=0（已撤单不算已处理）',
    dispatchFullDerivation: '新疆全口径=本级(1)+乌鲁木齐全口径(0)=1',
    receiveOwn: [
      { region: '新疆', received: 0, pending: '-', processed: '-', target: '-', reached: '-', success: '-', rate: '-' },
      { region: '乌鲁木齐', received: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    receiveFull: [
      { region: '新疆', received: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
      { region: '乌鲁木齐', received: 0, pending: 0, processed: 0, target: 0, reached: 0, success: 0, rate: '—' },
    ],
    receiveOwnDerivation: '撤单不计入接单量——乌鲁木齐没有"接"这张单',
    receiveFullDerivation: '接单视角下撤单子单完全不计数',
    validations: [
      { item: '新疆全口径派单 vs 新疆全口径接单', left: '1', right: '0', result: '✗ 不等(+1)' },
    ],
    observations: [
      '撤单是唯一打破"全口径派单=接单"等式的因素',
      '派单视角：派单量=1（派发行为已发生，不可撤销），但待处理=0、已处理=0',
      '接单视角：接单量=0（撤单等同于未接收）',
      '差值含义：1张撤单=派单方认了"我派过"，但接单方不认"我接过"',
    ]
  },
];

// ─── 表格生成函数 ───

function subOrderDetailTable(subOrders) {
  const hRow = new TableRow({ tableHeader: true, children: [
    headerCell('子单ID', 12), headerCell('派单方', 12), headerCell('接单方', 12),
    headerCell('状态', 10), headerCell('目标客户', 11), headerCell('触达客户', 11),
    headerCell('营销成功', 11), headerCell('是否被拆', 11)
  ]});
  const dRows = subOrders.map(so => new TableRow({ children: [
    dataCell(so.id, 12), dataCell(so.from, 12), dataCell(so.to, 12),
    dataCell(so.status === 'completed' ? '已完成' : so.status === 'pending' ? '待处理' : '已撤单', 10,
      { color: so.status === 'cancelled' ? 'CC0000' : so.status === 'pending' ? 'CC8800' : '008800' }),
    dataCell(so.target, 11), dataCell(so.reached, 11), dataCell(so.success, 11),
    dataCell(so.isSplit ? '是' : '否(叶子)', 11, { color: so.isSplit ? 'CC8800' : '008800' }),
  ]}));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [hRow, ...dRows] });
}

function dispatchStatTable(rows, isFullScope) {
  const cols = isFullScope
    ? ['区域','派单量','待处理','已处理','目标客户','触达客户','营销成功','处理率']
    : ['区域','派单量','待处理','已处理','目标客户','触达客户','营销成功','处理率'];
  const w = [14, 11, 11, 11, 13, 13, 13, 14];
  const hRow = new TableRow({ tableHeader: true, children: cols.map((c, i) => headerCell(c, w[i])) });
  const dRows = rows.map(r => new TableRow({ children: [
    dataCellLeft(r.region, w[0], { bold: true }),
    dataCell(r.dispatched, w[1]),
    dataCell(r.pending, w[2]),
    dataCell(r.processed, w[3]),
    dataCell(r.target, w[4], isFullScope ? { shading: 'E2EFDA', bold: true } : {}),
    dataCell(r.reached, w[5], isFullScope ? { shading: 'E2EFDA' } : {}),
    dataCell(r.success, w[6], isFullScope ? { shading: 'E2EFDA' } : {}),
    dataCell(r.rate, w[7]),
  ]}));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [hRow, ...dRows] });
}

function receiveStatTable(rows, isFullScope) {
  const cols = ['区域','接单量','待处理','已处理','目标客户','触达客户','营销成功','处理率'];
  const w = [14, 11, 11, 11, 13, 13, 13, 14];
  const hRow = new TableRow({ tableHeader: true, children: cols.map((c, i) => headerCell(c, w[i])) });
  const dRows = rows.map(r => new TableRow({ children: [
    dataCellLeft(r.region, w[0], { bold: true }),
    dataCell(r.received, w[1]),
    dataCell(r.pending, w[2]),
    dataCell(r.processed, w[3]),
    dataCell(r.target, w[4], isFullScope ? { shading: 'E2EFDA', bold: true } : {}),
    dataCell(r.reached, w[5], isFullScope ? { shading: 'E2EFDA' } : {}),
    dataCell(r.success, w[6], isFullScope ? { shading: 'E2EFDA' } : {}),
    dataCell(r.rate, w[7]),
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
  new TextRun({ text: '工单分析口径体系', bold: true, size: 40, font: 'Microsoft YaHei', color: '1F4E79' })
]}));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [
  new TextRun({ text: '场景穿越验证手册', bold: true, size: 36, font: 'Microsoft YaHei', color: '1F4E79' })
]}));
children.push(para('版本：V2.0（更新覆盖量指标全口径算法——叶子子单汇总）'));
children.push(para('更新日期：2026-07'));
children.push(para(''));

// ─── 第一章 ───
children.push(heading1('一、口径体系总览'));

children.push(heading2('1.1 三维度交叉定义'));
children.push(para('工单分析口径体系由三个维度交叉产生8种口径组合：'));

const dim8Table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('维度一：视角', 16), headerCell('维度二：范围', 16), headerCell('维度三：时间', 16), headerCell('口径名称', 26), headerCell('示例', 26)] }),
  new TableRow({ children: [dataCell('派单', 16), dataCell('本级', 16), dataCell('当月', 16), dataCellLeft('派单-本级-当月', 26), dataCellLeft('新疆6月本级派发了多少单', 26)] }),
  new TableRow({ children: [dataCell('派单', 16), dataCell('本级', 16), dataCell('累计', 16), dataCellLeft('派单-本级-累计', 26), dataCellLeft('新疆1~6月本级累计派发了多少单', 26)] }),
  new TableRow({ children: [dataCell('派单', 16), dataCell('全口径', 16), dataCell('当月', 16), dataCellLeft('派单-全口径-当月', 26), dataCellLeft('新疆6月含下级共派发了多少单', 26)] }),
  new TableRow({ children: [dataCell('派单', 16), dataCell('全口径', 16), dataCell('累计', 16), dataCellLeft('派单-全口径-累计', 26), dataCellLeft('新疆1~6月含下级共派发了多少单', 26)] }),
  new TableRow({ children: [dataCell('接单', 16), dataCell('本级', 16), dataCell('当月', 16), dataCellLeft('接单-本级-当月', 26), dataCellLeft('乌鲁木齐6月本级接收执行了多少单', 26)] }),
  new TableRow({ children: [dataCell('接单', 16), dataCell('本级', 16), dataCell('累计', 16), dataCellLeft('接单-本级-累计', 26), dataCellLeft('乌鲁木齐1~6月本级累计接收执行了多少单', 26)] }),
  new TableRow({ children: [dataCell('接单', 16), dataCell('全口径', 16), dataCell('当月', 16), dataCellLeft('接单-全口径-当月', 26), dataCellLeft('乌鲁木齐6月含下级共接收执行了多少单', 26)] }),
  new TableRow({ children: [dataCell('接单', 16), dataCell('全口径', 16), dataCell('累计', 16), dataCellLeft('接单-全口径-累计', 26), dataCellLeft('乌鲁木齐1~6月含下级共接收执行了多少单', 26)] }),
]});
children.push(dim8Table);

children.push(heading2('1.2 组织架构树（全场景共用）'));
children.push(para('新疆（L1，根节点）'));
children.push(para('├── 乌鲁木齐（L2，地市）'));
children.push(para('│   ├── 天山区（L3，区县）'));
children.push(para('│   │   ├── 网格A（L4，叶子节点）'));
children.push(para('│   │   └── 网格B（L4，叶子节点）'));
children.push(para('│   └── 沙区（L3，区县）'));
children.push(para('│       └── 网格C（L4，叶子节点）'));
children.push(para('└── 克拉玛依（L2，地市）'));
children.push(para('    └── 独山子区（L3，区县）'));
children.push(para('        └── 网格D（L4，叶子节点）'));
children.push(para('统计月份：2026-06'));

children.push(heading2('1.3 指标分类与全口径算法（V2.0核心变更）'));
children.push(para('工单分析的指标按业务本质分为两类，两类指标在全口径下使用不同的汇总算法：'));

const metricTypeTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('指标类型', 10), headerCell('代表指标', 18), headerCell('业务含义', 22), headerCell('全口径算法', 25), headerCell('原因', 25)] }),
  new TableRow({ children: [
    dataCell('行为量', 10, { bold: true, color: '0066AA' }),
    dataCellLeft('派单量、接单量、待处理、已处理、撤单', 18),
    dataCellLeft('统计的是"动作次数"', 22),
    dataCellLeft('递归汇总：本区域+所有下级区域的子单数量之和', 25),
    dataCellLeft('每次派发都是独立行为，1拆5就是5次，不重复', 25),
  ] }),
  new TableRow({ children: [
    dataCell('覆盖量', 10, { bold: true, color: 'CC8800' }),
    dataCellLeft('目标客户数、触达客户数、营销成功量', 18),
    dataCellLeft('统计的是"真实的人"', 22),
    dataCellLeft('叶子子单汇总：仅汇总未被二次拆单的叶子子单的覆盖量之和', 25),
    dataCellLeft('同一批客户被多级拆单时只算1次，递归汇总会重复计数', 25),
  ] }),
]});
children.push(metricTypeTable);

children.push(para(''));
children.push(boldPara('反面示例（V1.0的bug）：', '新疆派800人给乌鲁木齐，乌鲁木齐拆成500+300给天山区和沙区。'));
children.push(bulletPara('行为量（递归汇总）：新疆全口径派单量=1+2=3 ✓（3次独立派发行为）'));
children.push(bulletPara('覆盖量（递归汇总，旧算法）：新疆全口径目标客户=800+500+300=1600 ✗（同一批客户被重复计数）'));
children.push(bulletPara('覆盖量（叶子子单汇总，新算法）：新疆全口径目标客户=500+300=800 ✓（同一批客户只算1次）'));

children.push(heading2('1.4 拆单链与叶子子单定义'));
children.push(para('拆单是指接单方收到子单后，将子单进一步拆分为多张子子单派发给更下级区域。拆单形成链路：'));

const splitTypeTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('子单类型', 15), headerCell('定义', 45), headerCell('是否参与覆盖量全口径汇总', 40)] }),
  new TableRow({ children: [dataCell('根子单', 15, { bold: true }), dataCellLeft('由主单直接派发的子单（parentSubTicketId=null）', 45), dataCellLeft('若被拆（isSplit=true）则不参与；若未被拆（isSplit=false）则参与', 40)] }),
  new TableRow({ children: [dataCell('中间子单', 15, { bold: true, color: 'CC8800' }), dataCellLeft('被接单方二次拆单的子单（isSplit=true）', 45), dataCellLeft('不参与——其覆盖量数据已由其叶子子单代表', 40)] }),
  new TableRow({ children: [dataCell('叶子子单', 15, { bold: true, color: '008800' }), dataCellLeft('未被二次拆单的子单（isSplit=false）', 45), dataCellLeft('参与——代表真正执行到底的客户覆盖', 40)] }),
]});
children.push(splitTypeTable);

children.push(para(''));
children.push(para('示例：S6-1: 新疆→乌鲁木齐(800人, isSplit=true)'));
children.push(para('├── S6-2: 乌鲁木齐→天山区(500人, isSplit=true)'));
children.push(para('│   ├── S6-4: 天山区→网格A(300人, isSplit=false ✓叶子)'));
children.push(para('│   └── S6-5: 天山区→网格B(200人, isSplit=false ✓叶子)'));
children.push(para('└── S6-3: 乌鲁木齐→沙区(300人, isSplit=false ✓叶子)'));
children.push(boldPara('全口径目标客户数 = ', '叶子子单汇总 = 300+200+300 = 800'));
children.push(boldPara('递归汇总（旧算法）= ', '800+500+300+300+200 = 2100 ← 重复计数，错误'));

children.push(heading2('1.5 核心口径规则清单'));

const rules = [
  ['R1', '全口径递归至最末级', '行为量：全口径=本级+直接下级全口径（递归至网格级）；覆盖量：全口径=本区域+所有下级区域内叶子子单的覆盖量之和'],
  ['R2', '年初累计', '累计值=1月至当月的月度值之和，跨年清零重置'],
  ['R3', '当月归集', '当月口径仅统计派发时间/接收时间在当月的子单，不含历史月份创建但跨月完成的数据'],
  ['R4', '二次派单不算已处理', '每级只算直属一级子单；二次拆单后，原始子单的派单方视为"已处理"但不算终端执行完毕，只有末端网格执行完毕才算'],
  ['R5', '撤单规则', '撤单的子单：派单视角照计派单量（派发动作已发生），但不计入待处理量和已处理量；接单视角不计入接单量、待处理量、已处理量'],
  ['R6', '派单视角看派发行为', '某区域"派单"指该区域作为派单方发出的子单，与该区域是否在组织树上无关'],
  ['R7', '接单视角看执行责任', '某区域"接单"指该区域作为接单方接收的子单，全口径递归时按组织树汇总'],
  ['R8', '覆盖量去重（V2.0新增）', '覆盖量指标全口径仅汇总叶子子单（isSplit=false），避免拆单链上中间子单的同一批客户被重复计数'],
];
const rulesTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('编号', 8), headerCell('规则', 22), headerCell('详细说明', 70)] }),
  ...rules.map(r => new TableRow({ children: [
    dataCell(r[0], 8, { bold: true }), dataCellLeft(r[1], 22, { bold: true }), dataCellLeft(r[2], 70)
  ]}))
]});
children.push(rulesTable);

// ─── 第二章：逐场景穿越验证 ───
children.push(heading1('二、逐场景穿越验证'));

for (const sc of scenarios) {
  children.push(heading2(`场景${sc.id}：${sc.name}`));
  children.push(para(sc.desc));

  children.push(heading3('子单明细'));
  children.push(subOrderDetailTable(sc.subOrders));

  children.push(heading3('派单视角'));
  children.push(boldPara('本级统计：', ''));
  children.push(dispatchStatTable(sc.dispatchOwn, false));
  children.push(para(''));
  children.push(para(`推导：${sc.dispatchOwnDerivation}`));
  children.push(para(''));
  children.push(boldPara('全口径统计：', ''));
  children.push(dispatchStatTable(sc.dispatchFull, true));
  children.push(para(''));
  children.push(para(`推导：${sc.dispatchFullDerivation}`));

  children.push(heading3('接单视角'));
  children.push(boldPara('本级统计：', ''));
  children.push(receiveStatTable(sc.receiveOwn, false));
  children.push(para(''));
  children.push(para(`推导：${sc.receiveOwnDerivation}`));
  children.push(para(''));
  children.push(boldPara('全口径统计：', ''));
  children.push(receiveStatTable(sc.receiveFull, true));
  children.push(para(''));
  children.push(para(`推导：${sc.receiveFullDerivation}`));

  children.push(heading3('场景校验'));
  children.push(validationTable(sc.validations));

  children.push(heading3('关键观察'));
  for (const obs of sc.observations) {
    children.push(bulletPara(obs));
  }
}

// ─── 第三章：全量汇总场景 ───
children.push(heading1('三、全量汇总场景'));
children.push(para('将9个场景的23张子单全部汇总到同一组织架构树下，验证全量数据的口径一致性。'));

// 3.1 子单总清单
children.push(heading2('3.1 子单总清单'));

const allSubTickets = [
  ['S1-1','新疆','乌鲁木齐','已完成','500','450','45','否(叶子)','1'],
  ['S1-2','新疆','克拉玛依','待处理','300','0','0','否(叶子)','1'],
  ['S2-1','新疆','网格A','已完成','200','180','18','否(叶子)','2'],
  ['S2-2','新疆','网格A','已完成','150','140','21','否(叶子)','2'],
  ['S2-3','新疆','网格A','待处理','100','0','0','否(叶子)','2'],
  ['S3-1','乌鲁木齐','天山区','已完成','400','360','36','否(叶子)','3'],
  ['S3-2','乌鲁木齐','沙区','待处理','350','0','0','否(叶子)','3'],
  ['S4-1','乌鲁木齐','网格A','已完成','300','270','27','否(叶子)','4'],
  ['S4-2','乌鲁木齐','网格A','待处理','250','0','0','否(叶子)','4'],
  ['S5-1','天山区','网格A','已完成','400','360','36','否(叶子)','5'],
  ['S5-2','天山区','网格B','已完成','300','285','43','否(叶子)','5'],
  ['S6-1','新疆','乌鲁木齐','已完成','800','600','72','是(isSplit)','6'],
  ['S6-2','乌鲁木齐','天山区','已完成','500','380','46','是(isSplit)','6'],
  ['S6-3','乌鲁木齐','沙区','已完成','300','220','26','否(叶子)','6'],
  ['S6-4','天山区','网格A','已完成','300','230','28','否(叶子)','6'],
  ['S6-5','天山区','网格B','已完成','200','150','18','否(叶子)','6'],
  ['S7-1','乌鲁木齐','天山区','已完成','600','480','54','是(isSplit)','7'],
  ['S7-2','天山区','网格A','已完成','350','280','35','否(叶子)','7'],
  ['S7-3','天山区','网格B','已完成','250','200','19','否(叶子)','7'],
  ['S9-1','新疆','新疆','已完成','100','90','12','否(叶子)','9'],
  ['S9-2','新疆','新疆','已完成','80','72','8','否(叶子)','9'],
  ['S9-3','新疆','新疆','待处理','60','0','0','否(叶子)','9'],
  ['S10-1','新疆','乌鲁木齐','已撤单','400','0','0','否(叶子)','10'],
];

const allSubTicketRows = allSubTickets.map(r => new TableRow({ children: [
  dataCell(r[0],8), dataCell(r[1],10), dataCell(r[2],10), dataCell(r[3],8),
  dataCell(r[4],9), dataCell(r[5],9), dataCell(r[6],9), dataCell(r[7],10), dataCell(r[8],7)
]}));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [
    headerCell('子单ID',8), headerCell('派单方',10), headerCell('接单方',10), headerCell('状态',8),
    headerCell('目标客户',9), headerCell('触达客户',9), headerCell('营销成功',9), headerCell('是否被拆',10), headerCell('场景',7)
  ]}),
  ...allSubTicketRows
]}));

children.push(bulletPara('总计23张子单，其中叶子子单20张（isSplit=false）、中间子单3张（S6-1/S6-2/S7-1，isSplit=true）、已撤单1张（S10-1）'));

// 3.2 派单视角本级统计
children.push(heading2('3.2 派单视角本级统计'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('区域',10),headerCell('派单量',10),headerCell('待处理',10),headerCell('已处理',10),headerCell('撤单',10),headerCell('目标客户',12),headerCell('触达客户',12),headerCell('营销成功',13),headerCell('处理率',13)] }),
  new TableRow({ children: [dataCell('新疆',10),dataCell('10',10),dataCell('3',10),dataCell('6',10),dataCell('1',10),dataCell('2690',12),dataCell('1532',12),dataCell('176',13),dataCell('60%',13)] }),
  new TableRow({ children: [dataCell('乌鲁木齐',10),dataCell('7',10),dataCell('2',10),dataCell('5',10),dataCell('0',10),dataCell('2700',12),dataCell('1710',12),dataCell('189',13),dataCell('71%',13)] }),
  new TableRow({ children: [dataCell('天山区',10),dataCell('6',10),dataCell('0',10),dataCell('6',10),dataCell('0',10),dataCell('1800',12),dataCell('1505',12),dataCell('179',13),dataCell('100%',13)] }),
  new TableRow({ children: [dataCell('沙区',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('克拉玛依',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('独山子区',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('网格A',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('网格B',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('网格C',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('网格D',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
]}));

children.push(bulletPara('新疆本级派单10张：S1-1+S1-2+S2-1+S2-2+S2-3+S6-1+S9-1+S9-2+S9-3+S10-1；已完成6张，待处理3张，撤单1张'));
children.push(bulletPara('乌鲁木齐本级派单7张：S3-1+S3-2+S4-1+S4-2+S6-2+S6-3+S7-1；已完成5张，待处理2张'));
children.push(bulletPara('天山区本级派单6张：S5-1+S5-2+S6-4+S6-5+S7-2+S7-3；全部已完成'));

// 3.3 派单视角全口径统计
children.push(heading2('3.3 派单视角全口径统计'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('区域',10),headerCell('派单量',10),headerCell('待处理',10),headerCell('已处理',10),headerCell('撤单',10),headerCell('目标客户',12),headerCell('触达客户',12),headerCell('营销成功',13),headerCell('处理率',13)] }),
  new TableRow({ children: [dataCell('新疆',10),dataCell('23',10),dataCell('5',10),dataCell('17',10),dataCell('1',10),dataCell('5290',12),dataCell('3287',12),dataCell('372',13),dataCell('73.9%',13)] }),
  new TableRow({ children: [dataCell('乌鲁木齐',10),dataCell('13',10),dataCell('2',10),dataCell('11',10),dataCell('0',10),dataCell('3400',12),dataCell('2355',12),dataCell('268',13),dataCell('84.6%',13)] }),
  new TableRow({ children: [dataCell('天山区',10),dataCell('6',10),dataCell('0',10),dataCell('6',10),dataCell('0',10),dataCell('1800',12),dataCell('1505',12),dataCell('179',13),dataCell('100%',13)] }),
  new TableRow({ children: [dataCell('沙区',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('克拉玛依',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('独山子区',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('网格A',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('网格B',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('网格C',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
  new TableRow({ children: [dataCell('网格D',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',10),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('—',13)] }),
]}));

children.push(bulletPara('行为量（递归汇总）：天山区全口径=本级(6)+网格A(0)+网格B(0)=6；乌鲁木齐=本级(7)+天山区(6)+沙区(0)=13；新疆=本级(10)+乌鲁木齐(13)+克拉玛依(0)=23'));
children.push(bulletPara('覆盖量（叶子子单汇总）：天山区tree叶子=[S5-1(400)+S5-2(300)+S6-4(300)+S6-5(200)+S7-2(350)+S7-3(250)]=1800；乌鲁木齐本级leaf=[S3-1(400)+S3-2(350)+S4-1(300)+S4-2(250)+S6-3(300)]=1600（S6-2和S7-1 isSplit=true不参与）；乌鲁木齐全口径=本级leaf(1600)+天山区treeleaf(1800)=3400；新疆本级leaf=[S1-1(500)+S1-2(300)+S2-1(200)+S2-2(150)+S2-3(100)+S9-1(100)+S9-2(80)+S9-3(60)+S10-1(400)]=1890（S6-1 isSplit=true不参与）；新疆全口径=本级leaf(1890)+乌鲁木齐treeleaf(3400)=5290'));
children.push(bulletPara('V1.0→V2.0对比：新疆全口径派单目标从7190→5290（差值1900=S6-1(800)+S6-2(500)+S7-1(600)即3张isSplit=true中间子单的覆盖量不再重复计数）'));

// 3.4 接单视角本级统计
children.push(heading2('3.4 接单视角本级统计'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('区域',10),headerCell('接单量',12),headerCell('待处理',12),headerCell('已处理',12),headerCell('目标客户',13),headerCell('触达客户',13),headerCell('营销成功',14),headerCell('处理率',14)] }),
  new TableRow({ children: [dataCell('新疆',10),dataCell('3',12),dataCell('1',12),dataCell('2',12),dataCell('240',13),dataCell('162',13),dataCell('20',14),dataCell('67%',14)] }),
  new TableRow({ children: [dataCell('乌鲁木齐',10),dataCell('2',12),dataCell('0',12),dataCell('2',12),dataCell('1300',13),dataCell('1050',13),dataCell('117',14),dataCell('100%',14)] }),
  new TableRow({ children: [dataCell('天山区',10),dataCell('3',12),dataCell('0',12),dataCell('3',12),dataCell('1500',13),dataCell('1220',13),dataCell('136',14),dataCell('100%',14)] }),
  new TableRow({ children: [dataCell('沙区',10),dataCell('2',12),dataCell('1',12),dataCell('1',12),dataCell('650',13),dataCell('220',13),dataCell('26',14),dataCell('50%',14)] }),
  new TableRow({ children: [dataCell('克拉玛依',10),dataCell('1',12),dataCell('1',12),dataCell('0',12),dataCell('300',13),dataCell('0',13),dataCell('0',14),dataCell('0%',14)] }),
  new TableRow({ children: [dataCell('独山子区',10),dataCell('0',12),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('0',13),dataCell('0',14),dataCell('—',14)] }),
  new TableRow({ children: [dataCell('网格A',10),dataCell('8',12),dataCell('2',12),dataCell('6',12),dataCell('2050',13),dataCell('1460',13),dataCell('165',14),dataCell('75%',14)] }),
  new TableRow({ children: [dataCell('网格B',10),dataCell('3',12),dataCell('0',12),dataCell('3',12),dataCell('750',13),dataCell('635',13),dataCell('80',14),dataCell('100%',14)] }),
  new TableRow({ children: [dataCell('网格C',10),dataCell('0',12),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('0',13),dataCell('0',14),dataCell('—',14)] }),
  new TableRow({ children: [dataCell('网格D',10),dataCell('0',12),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('0',13),dataCell('0',14),dataCell('—',14)] }),
]}));

children.push(bulletPara('新疆本级接单3张：S9-1+S9-2+S9-3（自执行）'));
children.push(bulletPara('乌鲁木齐本级接单2张：S1-1+S6-1（S10-1已撤单不计入接单量）'));
children.push(bulletPara('天山区本级接单3张：S3-1+S6-2+S7-1'));
children.push(bulletPara('沙区本级接单2张：S3-2+S6-3'));
children.push(bulletPara('克拉玛依本级接单1张：S1-2（待处理）'));
children.push(bulletPara('网格A本级接单8张：S2-1+S2-2+S2-3+S4-1+S4-2+S5-1+S6-4+S7-2；已完成6张，待处理2张'));
children.push(bulletPara('网格B本级接单3张：S5-2+S6-5+S7-3；全部已完成'));

// 3.5 接单视角全口径统计
children.push(heading2('3.5 接单视角全口径统计'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('区域',10),headerCell('接单量',12),headerCell('待处理',12),headerCell('已处理',12),headerCell('目标客户',13),headerCell('触达客户',13),headerCell('营销成功',14),headerCell('处理率',14)] }),
  new TableRow({ children: [dataCell('新疆',10),dataCell('22',12),dataCell('5',12),dataCell('17',12),dataCell('4890',13),dataCell('3287',13),dataCell('372',14),dataCell('77.3%',14)] }),
  new TableRow({ children: [dataCell('乌鲁木齐',10),dataCell('18',12),dataCell('3',12),dataCell('15',12),dataCell('4350',13),dataCell('3125',13),dataCell('352',14),dataCell('83.3%',14)] }),
  new TableRow({ children: [dataCell('天山区',10),dataCell('14',12),dataCell('2',12),dataCell('12',12),dataCell('3200',13),dataCell('2455',13),dataCell('281',14),dataCell('85.7%',14)] }),
  new TableRow({ children: [dataCell('沙区',10),dataCell('2',12),dataCell('1',12),dataCell('1',12),dataCell('650',13),dataCell('220',13),dataCell('26',14),dataCell('50%',14)] }),
  new TableRow({ children: [dataCell('克拉玛依',10),dataCell('1',12),dataCell('1',12),dataCell('0',12),dataCell('300',13),dataCell('0',13),dataCell('0',14),dataCell('0%',14)] }),
  new TableRow({ children: [dataCell('独山子区',10),dataCell('0',12),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('0',13),dataCell('0',14),dataCell('—',14)] }),
  new TableRow({ children: [dataCell('网格A',10),dataCell('8',12),dataCell('2',12),dataCell('6',12),dataCell('2050',13),dataCell('1460',13),dataCell('165',14),dataCell('75%',14)] }),
  new TableRow({ children: [dataCell('网格B',10),dataCell('3',12),dataCell('0',12),dataCell('3',12),dataCell('750',13),dataCell('635',13),dataCell('80',14),dataCell('100%',14)] }),
  new TableRow({ children: [dataCell('网格C',10),dataCell('0',12),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('0',13),dataCell('0',14),dataCell('—',14)] }),
  new TableRow({ children: [dataCell('网格D',10),dataCell('0',12),dataCell('0',12),dataCell('0',12),dataCell('0',13),dataCell('0',13),dataCell('0',14),dataCell('—',14)] }),
]}));

children.push(bulletPara('行为量（递归汇总）：网格A全口径=本级(8)；网格B=本级(3)；天山区=本级(3)+网格A(8)+网格B(3)=14；沙区=本级(2)；乌鲁木齐=本级(2)+天山区(14)+沙区(2)=18；克拉玛依=本级(1)；新疆=本级(3)+乌鲁木齐(18)+克拉玛依(1)=22'));
children.push(bulletPara('覆盖量（叶子子单汇总，排除撤单）：网格A本级leaf=[S2-1(200)+S2-2(150)+S2-3(100)+S4-1(300)+S4-2(250)+S5-1(400)+S6-4(300)+S7-2(350)]=2050；网格B本级leaf=[S5-2(300)+S6-5(200)+S7-3(250)]=750；天山区本级leaf=[S3-1(400)]（S6-2和S7-1 isSplit=true不参与）；天山区全口径=本级leaf(400)+网格A(2050)+网格B(750)=3200；乌鲁木齐本级leaf=[S1-1(500)]（S6-1 isSplit=true不参与，S10-1撤单不计入接单视角）；乌鲁木齐全口径=本级leaf(500)+天山区(3200)+沙区(650)=4350；新疆全口径=本级leaf(240)+乌鲁木齐(4350)+克拉玛依(300)=4890'));
children.push(bulletPara('V1.0→V2.0对比：新疆全口径接单目标从6790→4890（差值1900，同派单视角差值一致）'));

// 3.6 派单全口径 vs 接单全口径 差异对比
children.push(heading2('3.6 派单全口径 vs 接单全口径 逐区域差异对比'));

children.push(heading3('行为量差异'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('区域',12),headerCell('派单全口径',18),headerCell('接单全口径',18),headerCell('差值',12),headerCell('差值原因',40)] }),
  new TableRow({ children: [dataCell('新疆',12),dataCell('23',18),dataCell('22',18),dataCell('+1',12),dataCellLeft('撤单S10-1（派单照计、接单不计）',40)] }),
  new TableRow({ children: [dataCell('乌鲁木齐',12),dataCell('13',18),dataCell('18',18),dataCell('-5',12),dataCellLeft('5张上级穿入（S1-1+S6-1由新疆派来）',40)] }),
  new TableRow({ children: [dataCell('天山区',12),dataCell('6',18),dataCell('14',18),dataCell('-8',12),dataCellLeft('上级穿入+下级接单',40)] }),
  new TableRow({ children: [dataCell('沙区',12),dataCell('0',18),dataCell('2',18),dataCell('-2',12),dataCellLeft('乌鲁木齐派来的2张',40)] }),
  new TableRow({ children: [dataCell('克拉玛依',12),dataCell('0',18),dataCell('1',18),dataCell('-1',12),dataCellLeft('新疆派来的1张',40)] }),
  new TableRow({ children: [dataCell('网格A',12),dataCell('0',18),dataCell('8',18),dataCell('-8',12),dataCellLeft('只接不派',40)] }),
  new TableRow({ children: [dataCell('网格B',12),dataCell('0',18),dataCell('3',18),dataCell('-3',12),dataCellLeft('只接不派',40)] }),
]}));

children.push(heading3('覆盖量差异'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('区域',12),headerCell('派单全口径target',20),headerCell('接单全口径target',20),headerCell('差值',12),headerCell('差值原因',36)] }),
  new TableRow({ children: [dataCell('新疆',12),dataCell('5290',20),dataCell('4890',20),dataCell('+400',12),dataCellLeft('撤单S10-1目标400在派单视角照计、接单视角不计',36)] }),
  new TableRow({ children: [dataCell('乌鲁木齐',12),dataCell('3400',20),dataCell('4350',20),dataCell('-950',12),dataCellLeft('接单视角多出上级穿入的叶子子单覆盖量',36)] }),
  new TableRow({ children: [dataCell('天山区',12),dataCell('1800',20),dataCell('3200',20),dataCell('-1400',12),dataCellLeft('接单视角多出上级穿入的叶子子单覆盖量',36)] }),
  new TableRow({ children: [dataCell('沙区',12),dataCell('0',20),dataCell('650',20),dataCell('-650',12),dataCellLeft('乌鲁木齐派来的叶子子单',36)] }),
  new TableRow({ children: [dataCell('克拉玛依',12),dataCell('0',20),dataCell('300',20),dataCell('-300',12),dataCellLeft('新疆派来的叶子子单',36)] }),
  new TableRow({ children: [dataCell('网格A',12),dataCell('0',20),dataCell('2050',20),dataCell('-2050',12),dataCellLeft('只接不派',36)] }),
  new TableRow({ children: [dataCell('网格B',12),dataCell('0',20),dataCell('750',20),dataCell('-750',12),dataCellLeft('只接不派',36)] }),
]}));

children.push(bulletPara('关键发现：覆盖量差异中，只有新疆的差值(+400)来自撤单，其余区域的差值均来自"穿入"——派单视角只看本区域派了什么，接单视角看辖区接收了什么。V2.0算法下，覆盖量差异更直观——每一条差值都能精确追溯到具体的叶子子单。'));

// 3.7 全量校验
children.push(heading2('3.7 全量校验'));

children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('编号',8),headerCell('校验项',30),headerCell('计算',42),headerCell('结果',20)] }),
  new TableRow({ children: [dataCell('V1',8),dataCellLeft('根节点全口径派单量=各区域本级派单量之和',30),dataCellLeft('23=10+7+6+0×7',42),dataCell('✓',20)] }),
  new TableRow({ children: [dataCell('V2',8),dataCellLeft('根节点全口径接单量=各区域本级接单量之和',30),dataCellLeft('22=3+2+3+2+1+0+8+3+0+0',42),dataCell('✓',20)] }),
  new TableRow({ children: [dataCell('V3',8),dataCellLeft('派单总量-接单总量=撤单量',30),dataCellLeft('23-22=1(S10-1)',42),dataCell('✓',20)] }),
  new TableRow({ children: [dataCell('V4',8),dataCellLeft('新疆本级：已处理+待处理+撤单=派单量',30),dataCellLeft('6+3+1=10',42),dataCell('✓',20)] }),
  new TableRow({ children: [dataCell('V5',8),dataCellLeft('派单全口径覆盖量-接单全口径覆盖量=撤单子单覆盖量',30),dataCellLeft('5290-4890=400(S10-1目标)',42),dataCell('✓',20)] }),
]}));

// ─── 第四章：口径规则速查表 ───
children.push(heading1('四、口径规则速查表'));

children.push(heading2('4.1 按场景类型总结派单/接单全口径的相等/不等规律'));

const sceneTypeTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('场景类型', 20), headerCell('根节点全口径派单vs接单', 27), headerCell('中间层级全口径派单vs接单', 27), headerCell('叶子节点全口径派单vs接单', 26)] }),
  new TableRow({ children: [dataCellLeft('一级直派（省→地市/区县/网格）', 20), dataCellLeft('相等', 27), dataCellLeft('派单≤接单（跨级穿入）', 27), dataCellLeft('派单=0，接单≥0', 26)] }),
  new TableRow({ children: [dataCellLeft('多级链式派单', 20), dataCellLeft('相等', 27), dataCellLeft('派单<接单（上级穿入子单）', 27), dataCellLeft('派单=0，接单≥0', 26)] }),
  new TableRow({ children: [dataCellLeft('上级自执行', 20), dataCellLeft('相等', 27), dataCellLeft('—', 27), dataCellLeft('—', 26)] }),
  new TableRow({ children: [dataCellLeft('撤单', 20), dataCellLeft('派单>接单', 27), dataCellLeft('—', 27), dataCellLeft('—', 26)] }),
]});
children.push(sceneTypeTable);

children.push(heading2('4.2 撤单对各项指标的影响规则'));

const cancelTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('指标', 20), headerCell('派单视角', 40), headerCell('接单视角', 40)] }),
  new TableRow({ children: [dataCellLeft('派单量/接单量', 20, { bold: true }), dataCellLeft('照计（+1）', 40), dataCellLeft('不计（+0）', 40)] }),
  new TableRow({ children: [dataCellLeft('待处理量', 20, { bold: true }), dataCellLeft('不计（撤单≠待处理）', 40), dataCellLeft('不计', 40)] }),
  new TableRow({ children: [dataCellLeft('已处理量', 20, { bold: true }), dataCellLeft('不计（撤单≠已处理）', 40), dataCellLeft('不计', 40)] }),
  new TableRow({ children: [dataCellLeft('目标客户', 20, { bold: true }), dataCellLeft('照计', 40), dataCellLeft('不计', 40)] }),
  new TableRow({ children: [dataCellLeft('触达客户', 20, { bold: true }), dataCellLeft('照计（通常=0）', 40), dataCellLeft('不计', 40)] }),
  new TableRow({ children: [dataCellLeft('营销成功', 20, { bold: true }), dataCellLeft('照计（通常=0）', 40), dataCellLeft('不计', 40)] }),
  new TableRow({ children: [dataCellLeft('处理率', 20, { bold: true }), dataCellLeft('已处理/派单量（分母含撤单）', 40), dataCellLeft('—', 40)] }),
]});
children.push(cancelTable);

children.push(heading2('4.3 指标口径速查'));

const caliberRows = [
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
  ['处理率', '率值', '已处理÷派单量（或接单量）', '全口径已处理÷全口径派单量（或接单量）'],
];
const caliberTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [
  new TableRow({ children: [headerCell('指标名', 12), headerCell('指标类型', 10), headerCell('本级口径', 39), headerCell('全口径口径', 39)] }),
  ...caliberRows.map(r => new TableRow({ children: [
    dataCellLeft(r[0], 12, { bold: true }),
    dataCell(r[1], 10, { color: r[1] === '覆盖量' ? 'CC8800' : '333333' }),
    dataCellLeft(r[2], 39),
    dataCellLeft(r[3], 39),
  ]}))
]});
children.push(caliberTable);

children.push(para(''));
children.push(boldPara('版本更新说明：', 'V2.0版本核心变更——覆盖量指标（目标客户数/触达客户数/营销成功量）的全口径算法从"递归汇总"改为"叶子子单汇总"，解决多级拆单链路中同一批客户被重复计数的问题。行为量指标（派单量/待处理/已处理/撤单）的全口径算法保持"递归汇总"不变。'));

// ─── 生成文档 ───

const doc = new Document({
  sections: [{ properties: { page: { margin: { top: convertInchesToTwip(0.8), bottom: convertInchesToTwip(0.8), left: convertInchesToTwip(0.6), right: convertInchesToTwip(0.6) } } }, children }]
});

(async () => {
  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'docs', '需求设计方案', '工单分析口径体系-场景穿越验证手册-V2.0.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Word文档已生成: ' + outPath);
})();
