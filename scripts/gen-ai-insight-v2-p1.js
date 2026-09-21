const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, ShadingType, TableLayoutType } = require('docx');
const fs = require('fs');

// ===== 工具函数 =====
const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, size: 32, font: 'Microsoft YaHei' })] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun({ text, bold: true, size: 28, font: 'Microsoft YaHei' })] });
const h3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200 }, children: [new TextRun({ text, bold: true, size: 24, font: 'Microsoft YaHei' })] });
const p = (text, opts = {}) => new Paragraph({ spacing: { after: 120 }, ...opts, children: [new TextRun({ text, size: 21, font: 'Microsoft YaHei', ...opts })] });
const pBold = (label, text) => new Paragraph({ spacing: { after: 120 }, children: [
  new TextRun({ text: label, bold: true, size: 21, font: 'Microsoft YaHei' }),
  new TextRun({ text, size: 21, font: 'Microsoft YaHei' })
]});
const bullet = (text) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text, size: 21, font: 'Microsoft YaHei' })] });
const bulletBold = (label, text) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [
  new TextRun({ text: label, bold: true, size: 21, font: 'Microsoft YaHei' }),
  new TextRun({ text, size: 21, font: 'Microsoft YaHei' })
]});

// 表格工具
const borderNone = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };
const borderThin = { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } };

function makeTable(headers, rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      shading: { fill: 'E8EDF3', type: ShadingType.CLEAR },
      borders: borderThin,
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: 'Microsoft YaHei' })] })]
    }))
  });
  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      borders: borderThin,
      children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 20, font: 'Microsoft YaHei' })] })]
    }))
  }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, rows: [headerRow, ...dataRows] });
}

const codeBlock = (lines) => lines.map(line => new Paragraph({
  spacing: { after: 0 },
  children: [new TextRun({ text: line, size: 18, font: 'Courier New' })]
}));

const children = [];

// ===== 一、产品定位 =====
children.push(h1('一、产品定位'));

children.push(h2('1.1 一句话定义'));
children.push(p('AI洞察报告是市场数智运营平台的智能分析写作能力，让运营人员通过对话方式，结合平台指标数据和外部数据，自动生成带归因分析的结构化洞察报告。它不仅仅是效率工具——将"手工写报告"升级为"AI写报告、人审校"，更是一种能力增强——让不具备深度分析能力的一线人员也能产出带归因的分析报告，同时实现从被动响应到主动发现的升级。'));

children.push(h2('1.2 不是什么'));
children.push(bullet('不是独立的报告编辑器（如Word在线编辑）'));
children.push(bullet('不是单纯的数据可视化仪表盘'));
children.push(bullet('不是聊天机器人（最终产出是结构化报告，不是闲聊）'));
children.push(bullet('不是一次性的查询应答工具（有模板、有历史、有迭代）'));

children.push(h2('1.3 核心价值主张'));
children.push(makeTable(
  ['维度', '现状痛点', 'AI洞察报告解决什么'],
  [
    ['效率提升', '每月手工写报告，耗时3-5天', '对话确认后一键生成初稿，从天级缩到小时级'],
    ['能力增强', '只有省公司分析师能做归因分析，一线人员只能写事实描述', '让不具备深度分析能力的一线人员也能产出带归因的分析报告'],
    ['主动发现', '指标体系庞大，运营人员不可能每天盯着所有指标，异动经常滞后发现', 'AI主动扫描指标异动，推送至对应角色，从被动响应升级为主动发现'],
    ['归因分析', '指标异动靠经验判断，归因浅、没证据链', '五层归因引擎自动下钻，每条结论附带证据链和置信度'],
    ['模板复用', '每次从零开始写，或照抄上月改数字', '上传历史报告自动提取模板，确认后反复使用'],
    ['数据整合', '经分/CRM/大数据平台各自导出，人工拼表', '双通道数据架构，平台指标直连+外部文件上传均可'],
    ['策略联动', '归因分析止步于"为什么"，没人接"怎么办"', '归因结论自动匹配策略库，从"发现问题"到"给出对策"闭环'],
  ]
));

children.push(h2('1.4 目标用户'));
children.push(makeTable(
  ['角色', '典型场景', '使用频率'],
  [
    ['省公司市场部分析师', '撰写月度经营分析报告', '每月1-2次'],
    ['省公司市场部经理', '审阅报告、追问关键指标异动', '每月2-3次'],
    ['地市分公司运营人员', '撰写本地市经营分析报告', '每月1次'],
    ['专业中心分析师', '撰写专项分析报告（流量/宽带/政企等）', '每两周1次'],
  ]
));

console.log('Part 1 done: 产品定位');
