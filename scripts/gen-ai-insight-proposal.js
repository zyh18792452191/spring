const docx = require('docx');
const fs = require('fs');
const path = require('path');

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, TableBorders,
  ShadingType, PageBreak
} = docx;

// 辅助函数
function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, size: 32, font: '微软雅黑' })] });
}
function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun({ text, bold: true, size: 28, font: '微软雅黑' })] });
}
function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200 }, children: [new TextRun({ text, bold: true, size: 24, font: '微软雅黑' })] });
}
function para(text, opts = {}) {
  return new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text, size: 21, font: '微软雅黑', ...opts })] });
}
function boldPara(text) {
  return para(text, { bold: true });
}
function bulletItem(text, level = 0) {
  return new Paragraph({ bullet: { level }, spacing: { after: 60 }, children: [new TextRun({ text, size: 21, font: '微软雅黑' })] });
}

// 表格创建
function createTable(headers, rows) {
  const borderStyle = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const borders = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      borders,
      shading: { type: ShadingType.SOLID, color: 'F0F0F0' },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: '微软雅黑' })] })]
    }))
  });
  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      borders,
      children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: '微软雅黑' })] })]
    }))
  }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] });
}

// 代码块/示意图
function codeBlock(lines) {
  return lines.map(line => new Paragraph({
    spacing: { after: 0 },
    children: [new TextRun({ text: line, size: 18, font: 'Consolas' })]
  }));
}

const children = [];

// ===== 修订历史 =====
children.push(heading1('修订历史'));
children.push(createTable(
  ['版本', '日期', '修订人', '修订内容'],
  [['V1.0', '2026-07-04', 'AI助手', '初版：完整产品设计方案']]
));

// ===== 一、产品定位 =====
children.push(heading1('一、产品定位'));

children.push(heading2('1.1 一句话定义'));
children.push(para('AI洞察报告是市场数智运营平台的智能分析写作能力，让运营人员通过对话方式，结合平台指标数据和外部数据，自动生成带归因分析的结构化洞察报告，将"手工写报告"升级为"AI写报告、人审校"。'));

children.push(heading2('1.2 不是什么'));
children.push(bulletItem('不是独立的报告编辑器（如Word在线编辑）'));
children.push(bulletItem('不是单纯的数据可视化仪表盘'));
children.push(bulletItem('不是聊天机器人（最终产出是结构化报告，不是闲聊）'));
children.push(bulletItem('不是一次性的查询应答工具（有模板、有历史、有迭代）'));

children.push(heading2('1.3 核心价值主张'));
children.push(createTable(
  ['维度', '现状痛点', 'AI洞察报告解决什么'],
  [
    ['报告生成', '每月手工写报告，耗时3-5天', '对话确认后一键生成初稿，从天级缩到小时级'],
    ['归因分析', '指标异动靠经验判断，归因浅、没证据链', '五层归因引擎自动下钻，每条结论附带证据链和置信度'],
    ['模板复用', '每次从零开始写，或照抄上月改数字', '上传历史报告自动提取模板，确认后反复使用'],
    ['数据整合', '经分/CRM/大数据平台各自导出，人工拼表', '双通道数据架构，平台指标直连+外部文件上传均可'],
    ['分析深度', '只能看到数据"是什么"，说不清"为什么"', '归因引擎从分解归因到因果推断逐层深入']
  ]
));

children.push(heading2('1.4 目标用户'));
children.push(createTable(
  ['角色', '典型场景', '使用频率'],
  [
    ['省公司市场部分析师', '撰写月度经营分析报告', '每月1-2次'],
    ['省公司市场部经理', '审阅报告、追问关键指标异动', '每月2-3次'],
    ['地市分公司运营人员', '撰写本地市经营分析报告', '每月1次'],
    ['专业中心分析师', '撰写专项分析报告（流量/宽带/政企等）', '每两周1次']
  ]
));

// ===== 二、使用场景全景 =====
children.push(heading1('二、使用场景全景'));

children.push(heading2('2.1 场景一：月度经营分析报告（最核心场景）'));
children.push(para('背景：市场部每月需撰写经营分析报告，手上有本月从经分/CRM导出的数据，以及上月写过的报告。'));
children.push(boldPara('用户操作流程：'));
children.push(bulletItem('进入AI洞察报告，选择"从模板创建"'));
children.push(bulletItem('选择上月报告对应的模板（模板已在首次使用时提取保存）'));
children.push(bulletItem('上传本月数据文件（Excel），系统自动匹配模板中的数据引用点'));
children.push(bulletItem('系统展示匹配结果，用户确认（高置信度自动通过，低置信度需人工确认）'));
children.push(bulletItem('点击"生成报告"，AI按模板结构+本月数据生成完整报告'));
children.push(bulletItem('预览报告，对关键发现追问深化（"ARPU下降主要原因是什么？"）'));
children.push(bulletItem('追问结果自动嵌入报告对应章节'));
children.push(bulletItem('审核、微调文字、导出定稿'));

children.push(heading2('2.2 场景二：从指标异动发起即时分析'));
children.push(para('背景：在日常查看指标时，发现某指标明显异动，需要快速出一份分析报告。'));
children.push(boldPara('用户操作流程：'));
children.push(bulletItem('在浮动AI助手中输入："帮我分析一下ARPU的异动"'));
children.push(bulletItem('助手自动感知用户当前所在页面（如首页/指标树/运营页面），获取当前区域和时间上下文'));
children.push(bulletItem('助手询问报告范围（分析深度、是否需要对比基期）'));
children.push(bulletItem('用户确认后，助手提示"展开全屏编辑"跳转专属页面'));
children.push(bulletItem('AI自动生成围绕该指标异动的分析报告'));
children.push(bulletItem('用户追问归因（"为什么乌鲁木齐下降这么多？"）'));
children.push(bulletItem('归因结果嵌入报告，导出定稿'));

children.push(heading2('2.3 场景三：从零创建专项分析报告'));
children.push(para('背景：领导临时要求出一份专项分析报告（如"5G套餐渗透率提升分析"），没有现成模板。'));
children.push(boldPara('用户操作流程：'));
children.push(bulletItem('在浮动AI助手中描述需求："帮我生成一份5G套餐渗透率提升分析报告，覆盖全疆16地市，时间范围2026年1-6月"'));
children.push(bulletItem('系统理解需求后，列出建议的报告大纲，用户确认或调整'));
children.push(bulletItem('系统自动从平台指标体系中匹配所需指标，展示匹配清单'));
children.push(bulletItem('如有平台覆盖不到的数据需求，提示用户上传补充数据'));
children.push(bulletItem('数据就绪后生成报告，后续流程同场景一'));

children.push(heading2('2.4 场景四：审阅追问已有报告'));
children.push(para('背景：报告已生成，经理审阅时对某个结论存疑，需要追问。'));
children.push(boldPara('用户操作流程：'));
children.push(bulletItem('在报告中心打开已生成的报告'));
children.push(bulletItem('点击报告正文中的某段结论，右侧对话区自动带入上下文'));
children.push(bulletItem('追问："这个结论的依据是什么？"'));
children.push(bulletItem('AI展示证据链（数据来源、计算口径、归因路径）'));
children.push(bulletItem('追问："如果把奎屯排除掉，结论是否还成立？"'));
children.push(bulletItem('AI重新计算，给出更新后的结论和置信度'));
children.push(bulletItem('用户选择"替换原文"或"追加为补充说明"'));

console.log('Part 1 done, children count:', children.length);
