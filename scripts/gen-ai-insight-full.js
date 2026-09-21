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

// ===== 三、业务流程设计 =====
children.push(heading1('三、业务流程设计'));

children.push(heading2('3.1 总体流程'));
children.push(para('选择发起方式 → 定义报告范围 → 数据准备 → 生成报告初稿 → 追问深化 → 审核定稿 → 导出'));

children.push(heading2('3.2 发起方式与对应流程'));
children.push(createTable(
  ['发起方式', '入口', '数据来源', '模板来源', '后续流程'],
  [
    ['从模板创建', '导航→AI洞察报告→选择模板', '平台指标+上传文件', '选定的模板', '上传数据→匹配确认→生成'],
    ['对话发起', '浮动AI助手→输入需求', '平台指标为主', 'AI自动生成大纲', '确认大纲→补充数据→生成'],
    ['追问已有报告', '报告中心→打开报告', '报告已有数据', '不涉及', '追问→结果嵌入→重新审核']
  ]
));

children.push(heading2('3.3 入口设计'));

children.push(heading3('3.3.1 全局浮动AI助手'));
children.push(para('平台所有页面右下角有一个AI助手浮动按钮，点击展开侧边对话面板。这是AI洞察报告的核心交互入口。'));
children.push(boldPara('浮动助手的能力边界：'));
children.push(createTable(
  ['能做什么', '不做什么'],
  [
    ['快速问答："6月ARPU多少？""乌鲁木齐流量为什么下降？"', '不在侧边栏里展示完整报告'],
    ['发起报告："帮我生成6月经营分析报告"', '不做报告的逐段审核和编辑'],
    ['上下文感知：自动获取用户当前所在页面的指标/区域/时间信息', '不做复杂的数据匹配确认（空间不够）'],
    ['引导跳转：对话进入报告生成流程后，提示"展开到全屏继续"', '']
  ]
));

children.push(boldPara('浮动助手的上下文感知规则：'));
children.push(createTable(
  ['用户当前所在页面', '浮动助手自动获取的上下文'],
  [
    ['首页', '当前选中的区域、时间模式、用户正在查看的指标模块'],
    ['指标树详情页', '当前指标树名称、业务场景、树中包含的指标清单'],
    ['流量运营等业务页面', '当前选中的区域、时间、当前Tab视角'],
    ['分析面板', '当前分析的指标、区域、时间、已有的排名对比数据'],
    ['报告中心', '当前查看的报告概要']
  ]
));

children.push(para('当用户在浮动助手中输入时，系统自动把上下文注入，用户不需要重复说明。如果用户已经在流量运营页面且选中了乌鲁木齐，直接说"帮我生成报告"即可。'));

children.push(heading3('3.3.2 导航菜单直接入口'));
children.push(para('平台导航栏中增加"AI洞察报告"菜单项，点击直接进入AI洞察报告专属页面（左右分栏的完整对话+预览界面）。适合用户有明确意图"我要写报告"的场景。'));

children.push(heading3('3.3.3 不在各业务模块中单独放入口'));
children.push(para('之前考虑在指标树、首页、分析面板等各处都放"生成洞察报告"按钮，经分析后放弃此方案。原因：'));
children.push(bulletItem('入口零散，用户记不住从哪进'));
children.push(bulletItem('每个入口交互还不一样，体验割裂'));
children.push(bulletItem('把AI能力硬塞到各业务模块里，破坏了业务模块本身的专注性'));
children.push(bulletItem('浮动助手的上下文感知已经替代了"手动传参跳转"的方案'));

children.push(heading2('3.4 关键流程节点规则'));

children.push(heading3('节点一：数据准备完成判定'));
children.push(bulletItem('平台指标数据：系统自动校验所选指标在指定时间范围和区域范围内是否有数据，缺数据则明确提示'));
children.push(bulletItem('上传文件：系统自动识别文件中的数据列和行，与模板/大纲中的数据引用点做匹配'));
children.push(bulletItem('数据准备完成条件：模板/大纲中所有必需数据引用点均已有对应数据源，可选数据点允许缺失'));
children.push(bulletItem('数据不完整时：用户可选择"跳过缺失数据继续生成"（报告中缺失部分标注"数据不足，待补充"），或"补充数据后再生成"'));

children.push(heading3('节点二：报告生成'));
children.push(bulletItem('生成过程中，对话区实时展示生成进度（"正在分析整体趋势…""正在归因重点指标…""正在生成叙述段落…"）'));
children.push(bulletItem('生成过程中用户可以随时追问（如"重点关注ARPU"），AI会调整生成侧重'));
children.push(bulletItem('生成耗时预估：普通报告3-5分钟，含深度归因的报告8-12分钟'));

children.push(heading3('节点三：追问深化'));
children.push(bulletItem('追问分为两类：澄清型追问（"这个数据口径是什么"）和深化型追问（"为什么下降"）'));
children.push(bulletItem('澄清型追问：直接在对话中回答，不影响报告正文'));
children.push(bulletItem('深化型追问：AI执行归因分析，结果可选择嵌入报告正文或作为附注'));
children.push(bulletItem('追问结果嵌入方式：用户选择"替换原文"（替换AI生成的原段落）或"追加为补充说明"（在原段落后追加）'));
children.push(bulletItem('同一位置反复追问时，系统保留追问历史，用户可回退到任一版本'));

children.push(heading3('节点四：审核定稿'));
children.push(bulletItem('报告中AI生成的段落标注来源（"AI生成-已校验""AI生成-待确认""人工编辑"）'));
children.push(bulletItem('审核操作：确认（标记为"已确认"）、编辑（修改文字，标记为"人工编辑"）、删除（整段删除）'));
children.push(bulletItem('定稿条件：报告中所有段落均为"已确认"或"人工编辑"状态，无"待确认"状态'));
children.push(bulletItem('定稿后报告锁定，不可再追问修改（如需修改需"创建新版本"）'));

console.log('Part 2 done, children count:', children.length);

// ===== 四、功能模块设计 =====
children.push(heading1('四、功能模块设计'));

// 模块一
children.push(heading2('模块一：对话式报告生成（核心模块）'));
children.push(para('功能定位：用户与AI的交互界面，所有报告生成操作均通过对话完成。'));

children.push(heading3('4.1.1 对话交互区域结构'));
children.push(para('AI洞察报告专属页面分为左右两栏：'));
children.push(bulletItem('左栏（约60%宽度）：报告预览区，实时展示生成的报告内容'));
children.push(bulletItem('右栏（约40%宽度）：对话区，包含对话历史、输入框、快捷指令'));

children.push(heading3('4.1.2 对话状态机'));
children.push(para('报告生成过程分为6个状态，状态之间有明确的转换条件和守卫规则：'));

children.push(boldPara('状态1：需求收集'));
children.push(bulletItem('触发：用户选择任意发起方式进入'));
children.push(bulletItem('系统行为：根据发起方式，主动询问缺失信息'));
children.push(bulletItem('  从模板创建：确认报告周期、区域范围，提示上传数据', 1));
children.push(bulletItem('  对话发起：确认分析深度、时间范围、是否需要对比基期', 1));
children.push(bulletItem('转换到下一状态条件：报告主题明确 + 时间范围确定 + 区域范围确定'));

children.push(boldPara('状态2：数据准备'));
children.push(bulletItem('触发：需求收集完成'));
children.push(bulletItem('系统行为：自动从平台指标体系匹配所需指标数据；如需外部数据，提示用户上传；展示数据匹配结果和覆盖情况'));
children.push(bulletItem('转换到下一状态条件：必需数据覆盖率达100%（或用户选择跳过缺失数据）'));

children.push(boldPara('状态3：大纲确认'));
children.push(bulletItem('触发：数据准备完成'));
children.push(bulletItem('系统行为：生成报告大纲（章节结构+每章预计分析内容），展示在对话区'));
children.push(bulletItem('用户操作：确认大纲，或提出修改意见'));
children.push(bulletItem('转换到下一状态条件：用户明确确认大纲'));

children.push(boldPara('状态4：报告生成'));
children.push(bulletItem('触发：大纲确认完成'));
children.push(bulletItem('系统行为：按大纲逐章生成报告，每完成一章在预览区实时展示'));
children.push(bulletItem('转换到下一状态条件：所有章节生成完毕'));

children.push(boldPara('状态5：追问深化'));
children.push(bulletItem('触发：报告初稿生成完毕'));
children.push(bulletItem('系统行为：等待用户追问，或在预览区点击某段结论发起追问'));
children.push(bulletItem('可反复追问，每次追问结果选择嵌入方式'));
children.push(bulletItem('转换到下一状态条件：用户主动点击"进入审核"或超时无操作（超时阈值：30分钟）'));

children.push(boldPara('状态6：审核定稿'));
children.push(bulletItem('触发：用户点击"进入审核"或超时'));
children.push(bulletItem('系统行为：标记所有AI生成段落的校验状态，等待用户逐段审核'));
children.push(bulletItem('转换到终态条件：全部段落审核完毕 → 定稿'));

children.push(boldPara('状态回退规则：'));
children.push(bulletItem('审核定稿 → 追问深化：允许，点击"继续追问"回退'));
children.push(bulletItem('报告生成 → 大纲确认：不允许（已生成内容不因大纲调整而丢弃，需"重新生成"）'));
children.push(bulletItem('追问深化 → 数据准备：允许，用户追加新数据源时回退'));

children.push(heading3('4.1.3 快捷指令'));
children.push(para('在对话输入框上方提供快捷指令按钮，点击即触发预定义的对话：'));
children.push(createTable(
  ['快捷指令', '等同于输入', '系统行为'],
  [
    ['生成大纲', '请根据当前需求生成报告大纲', '进入大纲确认状态'],
    ['重点分析', '请重点分析以下指标的异动原因：[当前选中指标]', '触发归因引擎深度分析'],
    ['对比上月', '请与上月数据进行对比分析', '调取上月数据做对比'],
    ['全疆排名', '请展示全疆16地市排名', '生成区域对比表格'],
    ['补充归因', '请对当前结论做更深层的归因分析', '归因引擎向下钻一层'],
    ['导出报告', '请导出当前报告', '进入导出流程']
  ]
));

children.push(heading3('4.1.4 结构化组件'));
children.push(para('对话过程中，系统不仅返回文字，还会返回结构化的可视化组件，嵌入在对话消息中：'));
children.push(createTable(
  ['组件类型', '触发场景', '展示内容', '可操作'],
  [
    ['关键发现卡片', '每次归因分析完成后', '结论摘要+置信度标识+核心数据变化', '点击"嵌入报告"'],
    ['数据匹配结果表', '数据准备阶段', '左列=模板所需数据项，右列=匹配的数据源，匹配状态色标', '点击修改匹配'],
    ['指标选择面板', '对话发起/大纲确认阶段', '按模块分组的指标清单，支持搜索和多选', '勾选/取消'],
    ['归因路径图', '归因分析返回时', '从异动指标到根因的路径图，每层标注贡献度', '点击节点追问']
  ]
));

children.push(boldPara('置信度标识规则：'));
children.push(bulletItem('高置信度（绿色）：数据充分、归因路径清晰、口径可验证 → 自动嵌入报告'));
children.push(bulletItem('中置信度（黄色）：数据基本充分但归因路径有分支 → 嵌入报告但标注"待确认"'));
children.push(bulletItem('低置信度（红色）：数据不足或归因存在矛盾 → 不自动嵌入，提示用户追问确认'));

children.push(heading3('4.1.5 对话话术设计原则'));
children.push(createTable(
  ['原则', '说明', '示例'],
  [
    ['引导式而非开放式', '每次提问提供选项而非让用户自由输入', '"报告的时间范围是？①本月 ②本季度 ③自定义"'],
    ['渐进式深入', '先确认框架再填充细节', '先确认大纲，再逐章生成'],
    ['结论带依据', '每个结论必须附带数据来源和计算口径', '"ARPU环比下降3.2%（数据来源：大数据平台月度指标，口径：加权平均ARPU）"'],
    ['异常主动提示', '发现数据异常时主动告知', '"注意：乌鲁木齐ARPU环比下降8.7%，降幅显著高于全疆平均水平3.2%"'],
    ['不确定的明确标注', 'AI推断内容标注推断依据和置信度', '"推测原因：5G套餐迁转导致低ARPU用户占比上升（置信度：中等）"']
  ]
));

// 模块二
children.push(heading2('模块二：报告模板管理'));
children.push(para('功能定位：管理报告模板的创建、提取、编辑和使用。模板定义了报告的章节结构和数据需求。'));

children.push(heading3('4.2.1 模板来源'));
children.push(boldPara('方式一：从历史报告提取（推荐）'));
children.push(bulletItem('用户上传一份历史报告文件（Word格式）'));
children.push(bulletItem('AI自动识别报告的章节结构、每段的类型（固定文字/数据引用/动态叙述）、数据引用点'));
children.push(bulletItem('展示识别结果供用户确认，用户可调整章节顺序、修改段落类型、增删章节'));
children.push(bulletItem('确认后保存为模板'));

children.push(boldPara('方式二：从零创建'));
children.push(bulletItem('用户在对话中描述报告需求，AI生成大纲'));
children.push(bulletItem('用户确认大纲后，选择"保存为模板"'));
children.push(bulletItem('模板自动记录章节结构和数据需求'));

children.push(heading3('4.2.2 模板数据结构（业务规则）'));
children.push(boldPara('模板基本信息：'));
children.push(bulletItem('模板名称（如"月度经营分析报告模板"）'));
children.push(bulletItem('适用业务场景（如"月度经营分析""专项分析""季度回顾"）'));
children.push(bulletItem('创建方式（从历史报告提取/从零创建）'));
children.push(bulletItem('创建时间、创建人'));
children.push(bulletItem('版本号（每次编辑后版本号+1）'));

children.push(boldPara('章节结构：'));
children.push(bulletItem('模板由多个章组成，章可嵌套子章节（最多3级嵌套）'));
children.push(bulletItem('每个章节包含：章节标题、排序序号、段落列表'));

children.push(boldPara('段落类型与规则：'));
children.push(createTable(
  ['段落类型', '含义', '生成时行为', '数据需求'],
  [
    ['固定文字', '每次报告都一样的文字', '直接从模板复制', '无'],
    ['数据填充', '固定格式的数据展示', '从数据源取值填入模板定义的格式', '必需，需指定指标和口径'],
    ['动态叙述', 'AI根据数据生成的分析文字', 'AI基于数据和叙述风格要求生成', '必需，需指定分析的指标范围'],
    ['图表', '可视化图表（趋势图、对比柱状图等）', '根据图表类型和数据源生成', '必需，需指定图表类型和指标']
  ]
));

children.push(boldPara('叙述风格配置（仅"动态叙述"段落需要定义）：'));
children.push(bulletItem('语调：专业严谨/通俗简明/管理层摘要'));
children.push(bulletItem('是否包含策略建议：是/否'));
children.push(bulletItem('是否包含风险提示：是/否'));
children.push(bulletItem('分析侧重：趋势分析/对比分析/归因分析/综合'));

children.push(heading3('4.2.3 模板与报告的版本关系'));
children.push(bulletItem('模板更新后，已生成的报告不受影响（报告绑定的是生成时的模板版本快照）'));
children.push(bulletItem('模板更新时提示："此模板已有N份关联报告，更新后仅影响新生成的报告"'));
children.push(bulletItem('报告详情中可查看"此报告基于模板v2.1生成"'));

children.push(heading3('4.2.4 模板提取的匹配确认规则'));
children.push(para('从历史报告提取模板时，AI识别出数据引用点后，需要用户确认：'));
children.push(bulletItem('高置信度组（绿色）：AI明确识别出对应的平台指标，直接标记为"已匹配"'));
children.push(bulletItem('中置信度组（黄色）：AI推测可能对应某个平台指标，需用户确认或修正'));
children.push(bulletItem('低置信度组（红色）：AI无法匹配，标记为"未匹配"，需用户手动指定数据来源'));
children.push(bulletItem('确认完成后，未匹配的项标记为"上传数据专用"（生成时需用户上传对应数据）'));

console.log('Part 3 done, children count:', children.length);

// 模块三
children.push(heading2('模块三：数据导入与智能匹配'));
children.push(para('功能定位：管理报告生成的数据来源，支持平台内部数据和外部上传数据两种通道。'));

children.push(heading3('4.3.1 双通道数据架构'));
children.push(createTable(
  ['通道', '数据来源', '接入方式', '数据质量保障'],
  [
    ['平台指标数据', '大数据平台指标体系、指标树定义的指标', '系统直连，自动取数', '口径已定义，质量由大数据平台保障'],
    ['外部上传数据', '经分系统导出、CRM导出、手工Excel', '用户上传文件，系统智能识别', '系统做格式校验和逻辑校验，但口径需用户确认']
  ]
));

children.push(heading3('4.3.2 平台指标数据选择'));
children.push(bulletItem('用户可在对话中或通过指标选择面板，选择平台已接入的指标'));
children.push(bulletItem('指标按业务模块分组，支持搜索'));
children.push(bulletItem('选中指标后，系统自动展示该指标的可选时间范围和区域范围'));
children.push(bulletItem('如指标在所选时间/区域范围内无数据，明确提示"该指标在某时间段数据缺失"'));

children.push(heading3('4.3.3 外部文件上传'));
children.push(bulletItem('支持格式：Excel（.xlsx/.xls）、CSV'));
children.push(bulletItem('单文件大小上限：50MB'));
children.push(bulletItem('上传后系统自动行为：'));
children.push(bulletItem('识别文件中的数据列（列名识别+数据类型推断）', 1));
children.push(bulletItem('识别数据行的时间范围（从日期列推断）', 1));
children.push(bulletItem('与模板/大纲中的数据引用点做智能匹配', 1));
children.push(bulletItem('展示匹配结果供确认', 1));

children.push(heading3('4.3.4 智能匹配规则'));
children.push(para('匹配算法按以下优先级执行：'));
children.push(bulletItem('1. 精确匹配：上传文件的列名与模板数据引用点的指标名称完全一致 → 高置信度'));
children.push(bulletItem('2. 语义匹配：列名与指标名称语义相近（如"ARPU值"匹配"人均ARPU"） → 中置信度'));
children.push(bulletItem('3. 口径匹配：列名虽不同但数据口径一致 → 中置信度'));
children.push(bulletItem('4. 未匹配：无法自动匹配 → 低置信度，需人工指定'));

children.push(heading3('4.3.5 数据冲突处理'));
children.push(bulletItem('当同一指标既有平台数据又有上传文件数据时，默认以平台数据为准（口径更权威）'));
children.push(bulletItem('用户可选择覆盖使用上传数据（需确认，系统提示口径可能不一致）'));
children.push(bulletItem('报告中标注数据来源，若使用上传数据则额外标注"数据来源：用户上传，口径未经平台校验"'));

children.push(heading3('4.3.6 数据时效性校验'));
children.push(bulletItem('系统自动检查所选数据的时间范围是否覆盖报告周期'));
children.push(bulletItem('不覆盖时提示具体缺失信息'));
children.push(bulletItem('用户可选择：调整报告周期、补充数据、跳过缺失月份'));

// 模块四
children.push(heading2('模块四：归因分析引擎'));
children.push(para('功能定位：对指标异动进行多层级归因，为报告提供"为什么"的分析支撑。'));

children.push(heading3('4.4.1 五层归因体系'));
children.push(createTable(
  ['层级', '归因方法', '解决的问题', '产出', '置信度规则'],
  [
    ['第一层：分解归因', '按构成维度拆解，定位最大贡献维度', '哪个维度贡献了主要变动？', '维度贡献度排序', '高（基于算术分解，无推断）'],
    ['第二层：对比归因', '与历史同期/同类区域对比', '和去年同期比，哪个维度异常？', '异常维度清单+偏差幅度', '高（基于事实对比）'],
    ['第三层：区域归因', '按区域拆解，定位异动来源区域', '哪个地市拉低了全疆水平？', '区域贡献度排名', '高（基于算术分解）'],
    ['第四层：客群归因', '按客群标签拆解，定位受影响客群', '哪类客户群体是主因？', '客群贡献度+客群特征', '中（依赖客群标签准确性）'],
    ['第五层：因果推断', '结合外部事件和业务动作，推断因果关系', '为什么发生？最可能的原因是什么？', '因果假设+支持证据+置信度', '低到中（存在多解可能）']
  ]
));

children.push(heading3('4.4.2 归因触发规则'));
children.push(boldPara('自动触发条件（报告生成时，以下任一条件满足则自动触发归因）：'));
children.push(bulletItem('指标环比变动幅度超过阈值（默认阈值：±5%，可在模板中配置）'));
children.push(bulletItem('指标同比变动幅度超过阈值（默认阈值：±10%）'));
children.push(bulletItem('指标偏离目标值超过阈值（默认阈值：±8%）'));
children.push(bulletItem('区域排名发生显著变化（排名变动超过3位）'));
children.push(boldPara('手动触发：用户在追问中主动要求'));

children.push(heading3('4.4.3 归因深度控制'));
children.push(bulletItem('报告默认只做前三层归因（分解+对比+区域），结果置信度较高'));
children.push(bulletItem('第四层（客群归因）需客群数据支持，如无相关数据则跳过并提示'));
children.push(bulletItem('第五层（因果推断）仅在用户追问时触发，不自动执行'));
children.push(bulletItem('用户可在追问中逐层深入："继续深入"=向下钻一层；"分析到底"=钻到最深层'));

children.push(heading3('4.4.4 归因结果结构'));
children.push(para('每层归因结果包含：'));
children.push(bulletItem('结论：一句话总结（如"ARPU下降主因是低价值套餐用户占比上升"）'));
children.push(bulletItem('证据链：支撑结论的数据点、计算过程、数据来源'));
children.push(bulletItem('贡献度：该因素对总异动的贡献占比（数值）'));
children.push(bulletItem('置信度：高/中/低（附判定依据）'));
children.push(bulletItem('下钻建议：如继续深入可分析的方向'));

children.push(heading3('4.4.5 归因失败处理'));
children.push(bulletItem('数据不足以支撑归因时：标注"归因分析因数据不足暂停，建议补充XXX数据后继续"'));
children.push(bulletItem('归因超时（单层归因超过60秒）：标注"归因分析超时，已展示部分结果"'));
children.push(bulletItem('因果推断出现多个等概率假设：列出所有假设及各自支持证据，不强行选一个'));
children.push(bulletItem('归因结论与已知事实矛盾：标注矛盾点，提示用户确认数据准确性'));

children.push(heading3('4.4.6 归因与报告的嵌入方式'));
children.push(bulletItem('自动触发的归因（前三层）：结果直接写入报告"归因分析"章节'));
children.push(bulletItem('追问触发的归因（第四五层）：结果以"补充说明"形式嵌入对应段落'));
children.push(bulletItem('归因路径图：在对话区展示，不在报告中展示（报告只展示结论性文字和关键数据）'));
children.push(bulletItem('报告导出时，归因的完整证据链作为附录导出'));

// 模块五
children.push(heading2('模块五：报告输出与导出'));
children.push(para('功能定位：将生成的报告导出为可交付的文件格式。'));

children.push(heading3('4.5.1 报告预览区交互'));
children.push(bulletItem('预览区展示完整的报告内容，与最终导出格式基本一致'));
children.push(bulletItem('AI生成的段落左侧显示状态标识：已确认（绿）/待确认（黄）/人工编辑（蓝）'));
children.push(bulletItem('点击任一段落，右侧对话区自动带入该段落的上下文，便于追问'));
children.push(bulletItem('可直接在预览区编辑文字（编辑后自动标记为"人工编辑"）'));
children.push(bulletItem('可删除整段（删除后该段保留为占位符，标注"已删除"，可恢复）'));

children.push(heading3('4.5.2 导出格式'));
children.push(createTable(
  ['格式', '说明', '适用场景'],
  [
    ['Word', '完整报告，含图表（图表导出为图片嵌入）', '正式报告交付'],
    ['Word（含附录）', '正文+归因证据链附录+数据来源清单', '技术审阅'],
    ['PDF', '排版固定的只读版本', '分发传阅']
  ]
));

children.push(heading3('4.5.3 导出样式'));
children.push(bulletItem('默认样式：公司标准报告样式（字体、字号、配色、页眉页脚）'));
children.push(bulletItem('模板可定义自定义样式覆盖默认样式'));
children.push(bulletItem('图表导出规则：一律导出为图片（确保不同Word版本打开时图表显示一致）'));
children.push(bulletItem('表格导出规则：导出为Word表格，可在Word中编辑'));

children.push(heading3('4.5.4 导出版本管理'));
children.push(bulletItem('每次导出生成一个导出记录（导出时间、导出人、格式、报告版本）'));
children.push(bulletItem('同一报告可多次导出，每次导出互不影响'));
children.push(bulletItem('导出的文件名规则：{报告名称}_{时间范围}_{导出日期}'));

// 模块六
children.push(heading2('模块六：报告中心'));
children.push(para('功能定位：管理所有报告的生命周期，包括查看、搜索、追问、导出。'));

children.push(heading3('4.6.1 报告列表'));
children.push(boldPara('展示内容：'));
children.push(bulletItem('报告标题、报告状态（草稿/待审核/已定稿）、关联模板名称'));
children.push(bulletItem('报告周期（如"2026年6月"）、创建时间、最后编辑时间、创建人'));

children.push(boldPara('筛选条件：'));
children.push(bulletItem('按状态筛选、按报告周期筛选、按模板筛选、按创建人筛选、按关键词搜索'));

children.push(boldPara('排序规则：默认按最后编辑时间倒序'));

children.push(heading3('4.6.2 报告状态与操作'));
children.push(createTable(
  ['状态', '含义', '可执行操作'],
  [
    ['草稿', '报告生成中或追问深化中', '继续对话、追问、重新生成'],
    ['待审核', '追问完成，进入审核阶段', '审核（逐段确认/编辑/删除）、退回草稿继续追问'],
    ['已定稿', '审核完成，报告锁定', '导出、创建新版本、查看历史版本'],
    ['已作废', '主动作废', '仅查看']
  ]
));

children.push(heading3('4.6.3 报告版本管理'));
children.push(bulletItem('定稿后的报告如需修改，需"创建新版本"'));
children.push(bulletItem('新版本继承上一版本的全部内容，可继续追问和编辑'));
children.push(bulletItem('版本之间可对比差异（高亮变更内容）'));
children.push(bulletItem('每个版本独立保存，不覆盖历史版本'));

// 模块七
children.push(heading2('模块七：洞察知识库'));
children.push(para('功能定位：沉淀报告中的洞察发现，为后续报告生成提供参考。'));

children.push(heading3('4.7.1 洞察记录来源'));
children.push(bulletItem('报告中高置信度的归因结论（自动提取）'));
children.push(bulletItem('用户确认的中置信度归因结论（标记后提取）'));
children.push(bulletItem('用户手动记录的洞察'));

children.push(heading3('4.7.2 洞察记录内容'));
children.push(bulletItem('洞察结论（一句话）'));
children.push(bulletItem('关联指标'));
children.push(bulletItem('归因路径'));
children.push(bulletItem('适用场景标签（如"ARPU下降分析""新套餐上市影响"）'));
children.push(bulletItem('数据时间范围'));
children.push(bulletItem('来源报告'));
children.push(bulletItem('被引用次数'));

children.push(heading3('4.7.3 洞察复用规则'));
children.push(bulletItem('生成新报告时，系统自动检索洞察知识库中与当前分析主题相关的洞察'));
children.push(bulletItem('相关性判断：指标重叠度+场景标签匹配+时间接近度'));
children.push(bulletItem('相关洞察作为参考信息提供给AI，但不直接写入报告（避免路径依赖）'));
children.push(bulletItem('在对话中可主动提问："历史上类似情况是怎么分析的？"'));

// 模块八
children.push(heading2('模块八：数据源管理'));
children.push(para('功能定位：管理外部上传数据源的生命周期。'));

children.push(heading3('4.8.1 数据源列表'));
children.push(boldPara('展示内容：'));
children.push(bulletItem('数据源名称（自动从文件名提取，可修改）、上传时间、上传人'));
children.push(bulletItem('数据时间范围（自动识别）、关联报告数量、数据质量状态'));

children.push(heading3('4.8.2 数据源校验规则'));
children.push(para('上传后系统自动执行以下校验：'));
children.push(bulletItem('格式校验：文件格式、编码是否合规'));
children.push(bulletItem('完整性校验：是否有空行空列、数据断档'));
children.push(bulletItem('逻辑校验：数值是否在合理范围、日期是否连续'));
children.push(bulletItem('口径提示：提醒用户确认数据口径是否与平台定义一致'));
children.push(boldPara('校验结果：'));
children.push(bulletItem('通过：标记为"已校验"'));
children.push(bulletItem('警告：标记为"待校验"，列出警告项，用户确认后可使用'));
children.push(bulletItem('异常：标记为"校验异常"，列出异常项，不可用于报告生成'));

children.push(heading3('4.8.3 数据源保留策略'));
children.push(bulletItem('与报告关联的数据源：随报告保留'));
children.push(bulletItem('未关联任何报告的数据源：保留30天后自动清理'));
children.push(bulletItem('手动删除：仅当数据源未关联任何报告时可删除'));

console.log('Part 4 done, children count:', children.length);

// ===== 五、与技术方案的融合 =====
children.push(heading1('五、与技术方案的融合'));

children.push(heading2('5.1 对话状态与Agent编排映射'));
children.push(para('产品定义的6个对话状态，与技术方案的LangGraph Agent编排一一对应：'));
children.push(createTable(
  ['产品对话状态', '对应的技术Agent', 'Agent职责'],
  [
    ['需求收集', '需求理解Agent', '解析用户意图，补全缺失信息'],
    ['数据准备', '数据加载Agent', '从平台取数或解析上传文件，做匹配和校验'],
    ['大纲确认', '报告规划Agent', '根据需求+数据生成报告大纲'],
    ['报告生成', '叙述生成Agent', '按大纲逐章生成内容，调用归因引擎'],
    ['追问深化', '归因分析Agent', '执行归因计算，返回结论和证据链'],
    ['审核定稿', '校验Agent', '核实生成内容的数值准确性、口径一致性']
  ]
));
children.push(para('关键规则：工作流编排的技术细节对用户不可见，用户只感知到对话状态的推进。用户不需要知道"现在是归因Agent在工作"，只需要看到"正在分析原因…"的提示。'));

children.push(heading2('5.2 技术能力取舍'));
children.push(createTable(
  ['技术能力', '是否采用', '决策理由'],
  [
    ['数据加载（平台+文件）', '采用', '双通道数据架构的核心'],
    ['语义识别（模板提取）', '采用', '从历史报告提取模板的核心能力'],
    ['大语言模型（叙述生成）', '采用', '动态叙述段落生成的核心能力'],
    ['向量检索（洞察知识库）', '采用', '历史洞察关联推荐'],
    ['工作流编排（LangGraph）', '采用', '对话状态机+Agent调度，但用户不可见'],
    ['数据血缘追踪', '采用', '归因证据链的基础'],
    ['安全防护（脱敏/权限）', '采用', '客户数据保护'],
    ['数据探查', '不采用', '平台指标体系已有元数据，无需额外探查'],
    ['数据清洗', '不采用', '平台数据已清洗，上传数据只做格式校验'],
    ['数据转换', '不采用', '不做ETL，上传数据直接匹配使用'],
    ['Dashboard可视化', '降级采用', '不做独立仪表盘，仅在报告内嵌入小型图表']
  ]
));

children.push(heading2('5.3 安全约束对齐'));
children.push(boldPara('按模块的安全约束：'));
children.push(createTable(
  ['模块', '安全约束'],
  [
    ['对话式报告生成', '对话历史加密存储；脱敏引擎对返回给LLM的客户数据做脱敏；对话内容不用于模型训练'],
    ['报告模板管理', '模板不包含客户级数据，只有指标级引用；模板操作需权限控制'],
    ['数据导入与匹配', '上传文件临时存储，生成完毕后可配置自动清除；上传数据不离开平台安全域'],
    ['归因分析引擎', '归因过程不输出客户明细，只输出聚合结论；因果推断结论标注"AI推断"'],
    ['报告输出与导出', '导出文件加水印（导出人+时间）；已脱敏数据导出时保持脱敏'],
    ['报告中心', '报告按权限可见（省公司看全疆、地市看本市）；删除操作需二次确认'],
    ['洞察知识库', '洞察记录不包含客户级信息；引用洞察时带来源标注'],
    ['数据源管理', '上传数据与报告关联后不可随意删除；数据源操作审计日志']
  ]
));

children.push(boldPara('LLM调用专项安全约束：'));
children.push(bulletItem('输入侧：客户手机号、身份证号等个人敏感信息在送入LLM前必须脱敏'));
children.push(bulletItem('输出侧：LLM生成的数值必须与原始数据交叉校验，不一致则标记"待确认"'));
children.push(bulletItem('模型选择：境内部署的大模型，数据不出境'));
children.push(bulletItem('调用审计：每次LLM调用记录输入摘要、输出摘要、耗时，用于追溯'));

// ===== 六、页面清单与原型设计 =====
children.push(heading1('六、页面清单与原型设计'));

children.push(heading2('6.1 原型设计清单'));
children.push(createTable(
  ['序号', '页面', '原型深度', '说明'],
  [
    ['1', 'AI洞察报告主页（对话+预览）', 'L3 可交互原型', '核心交互页面，覆盖对话状态机、结构化组件、报告预览'],
    ['2', '报告中心（报告列表）', 'L2 高保真静态', '列表页，结构相对标准'],
    ['3', '模板管理中心', 'L2 高保真静态', '模板列表+模板详情'],
    ['4', '数据源管理', 'L2 高保真静态', '数据源列表+校验状态'],
    ['5', '洞察知识库', 'L2 高保真静态', '洞察记录列表+详情'],
    ['6', '入口交互设计（浮动助手+导航）', 'L1 线框图', '浮动助手展开、导航入口位置']
  ]
));

children.push(heading2('6.2 页面一：AI洞察报告主页'));
children.push(para('页面结构：左右分栏。左栏（约60%）为报告预览区，右栏（约40%）为对话区。'));
children.push(...codeBlock([
  '┌─────────────────────────────────────────────────────────────────────────────┐',
  '│  ← 返回    AI洞察报告                                              用户头像  │',
  '├─────────────────────────────────────────────────────────────────────────────┤',
  '│                                                                             │',
  '│  ┌──────────────────────────────────┐  ┌────────────────────────────────┐  │',
  '│  │  报告：2026年6月经营分析报告      │  │  对话 · 数据准备                │  │',
  '│  │  状态：草稿 ｜ 模板：月度经营分析  │  │                                │  │',
  '│  │  周期：2026年6月 ｜ 全疆          │  │  ┌──────────────────────────┐  │  │',
  '│  │──────────────────────────────────│  │  │ 系统助手                  │  │  │',
  '│  │                                  │  │  │                          │  │  │',
  '│  │  一、整体经营概况                 │  │  │ 已识别以下数据需求：     │  │  │',
  '│  │                                  │  │  │                          │  │  │',
  '│  │  🟢 6月全疆ARPU为56.8元，环比    │  │  │ ┌──────────────────────┐ │  │  │',
  '│  │  下降3.2%...                     │  │  │ │ 数据匹配结果          │ │  │  │',
  '│  │                                  │  │  │ │                      │ │  │  │',
  '│  │  二、重点指标分析                 │  │  │ │ 模板需求    匹配来源   │ │  │  │',
  '│  │                                  │  │  │ │ 🟢 移动ARPU  平台指标  │ │  │  │',
  '│  │  🟡 2.1 流量运营                 │  │  │ │ 🟢 用户数    平台指标  │ │  │  │',
  '│  │  6月DOU达15.6GB...              │  │  │ │ 🟡 DOU       上传文件  │ │  │  │',
  '│  │                                  │  │  │ │ 🔴 套餐迁转  未匹配    │ │  │  │',
  '│  │  🔵 2.2 ARPU分析（人工编辑）      │  │  │ │                      │ │  │  │',
  '│  │  全疆ARPU下降主要受乌鲁木齐和     │  │  │ │ [批量确认] [逐条修改]  │ │  │  │',
  '│  │  喀什两地市影响...               │  │  │ └──────────────────────┘ │  │  │',
  '│  │                                  │  │  │                          │  │  │',
  '│  │  三、归因分析                     │  │  │ 请确认数据匹配结果，     │  │  │',
  '│  │                                  │  │  │ 确认后即可生成报告。     │  │  │',
  '│  │  🟢 ARPU下降归因：               │  │  └──────────────────────────┘  │  │',
  '│  │  [关键发现卡片]                   │  │                                │  │',
  '│  │  ┌────────────────────────────┐  │  │  ┌──────────────────────────┐  │  │',
  '│  │  │ ARPU下降主因               │  │  │  │ 用户                    │  │  │',
  '│  │  │ 置信度：🟢 高              │  │  │  │ DOU这个指标口径我确认下  │  │  │',
  '│  │  │ • 低价值套餐用户占比+2.3pp │  │  │  └──────────────────────────┘  │  │',
  '│  │  │ • 贡献度：62%              │  │  │                                │  │',
  '│  │  │ [嵌入报告] [继续深入]      │  │  │  ┌──────────────────────────┐  │  │',
  '│  │  └────────────────────────────┘  │  │  │ 快捷指令：               │  │  │',
  '│  │                                  │  │  │ [生成大纲] [重点分析]     │  │  │',
  '│  │  四、区域对比                     │  │  │ [对比上月] [全疆排名]     │  │  │',
  '│  │  ...                             │  │  │ [补充归因] [导出报告]     │  │  │',
  '│  │──────────────────────────────────│  │  └──────────────────────────┘  │  │',
  '│  │  [继续追问]  [进入审核]  [导出]   │  │  ┌──────────────────────────┐  │  │',
  '│  └──────────────────────────────────┘  │  │ 输入消息...        📎 发送 │  │  │',
  '│                                        └────────────────────────────────┘  │',
  '└─────────────────────────────────────────────────────────────────────────────┘',
  '',
  '图例：🟢 = 已确认  🟡 = 待确认  🔵 = 人工编辑  🔴 = 未匹配/异常'
]));

children.push(boldPara('关键交互：'));
children.push(bulletItem('点击左栏某段文字 → 右栏对话区自动带入该段上下文'));
children.push(bulletItem('点击"关键发现卡片"的[嵌入报告] → 卡片结论写入左栏对应章节'));
children.push(bulletItem('点击"关键发现卡片"的[继续深入] → 触发归因引擎下一层'));
children.push(bulletItem('点击数据匹配表的[逐条修改] → 弹出匹配修改面板'));
children.push(bulletItem('左栏直接点击文字 → 进入编辑模式，编辑后自动标记为人工编辑'));
children.push(bulletItem('快捷指令点击 → 输入框自动填入文本并发送'));

console.log('Part 5 done, children count:', children.length);

// 页面二：报告中心
children.push(heading2('6.3 页面二：报告中心'));
children.push(...codeBlock([
  '┌─────────────────────────────────────────────────────────────────────────────┐',
  '│  报告中心                                                                    │',
  '├─────────────────────────────────────────────────────────────────────────────┤',
  '│                                                                             │',
  '│  [+ 新建报告]  [从模板创建]                                                 │',
  '│                                                                             │',
  '│  状态：[全部▾]   周期：[全部▾]   模板：[全部▾]   🔍 搜索报告...             │',
  '│                                                                             │',
  '│  ┌─────────────────────────────────────────────────────────────────────────┐│',
  '│  │报告标题       │状态  │关联模板      │周期      │创建时间    │操作      ││',
  '│  ├───────────────┼──────┼──────────────┼──────────┼────────────┼──────────┤│',
  '│  │6月经营分析报告│草稿  │月度经营分析  │2026年6月 │06-28 14:30│继续编辑  ││',
  '│  │5月经营分析报告│已定稿│月度经营分析  │2026年5月 │05-30 16:20│查看 导出 ││',
  '│  │5G渗透率专项   │待审核│专项分析      │2026年Q2  │06-25 10:15│审核      ││',
  '│  │宽带业务分析   │已定稿│专项分析      │2026年H1  │06-20 09:00│查看 导出 ││',
  '│  │4月经营分析报告│已定稿│月度经营分析  │2026年4月 │04-29 17:45│查看 导出 ││',
  '│  └───────────────┴──────┴──────────────┴──────────┴────────────┴──────────┘│',
  '│                                                                             │',
  '│  共12条  ◄ 1 2 3 ►                                                         │',
  '└─────────────────────────────────────────────────────────────────────────────┘',,
  '',
  '状态样式：草稿=黄色底  待审核=橙色底  已定稿=绿色底  已作废=灰色底'
]));

// 页面三：模板管理中心
children.push(heading2('6.4 页面三：模板管理中心'));
children.push(...codeBlock([
  '┌─────────────────────────────────────────────────────────────────────────────┐',
  '│  模板管理                                                                    │',
  '├─────────────────────────────────────────────────────────────────────────────┤',
  '│                                                                             │',
  '│  [+ 新建模板]  [从历史报告提取模板]                                         │',
  '│                                                                             │',
  '│  业务场景：[全部▾]   创建方式：[全部▾]   🔍 搜索模板...                     │',
  '│                                                                             │',
  '│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐       │',
  '│  │月度经营分析报告    │  │专项分析报告        │  │季度回顾报告       │       │',
  '│  │适用：月度经营分析  │  │适用：专项分析      │  │适用：季度回顾     │       │',
  '│  │版本：v2.1         │  │版本：v1.0          │  │版本：v1.3         │       │',
  '│  │关联报告：8份       │  │关联报告：3份       │  │关联报告：2份      │       │',
  '│  │来源：历史报告提取  │  │来源：从零创建      │  │来源：历史报告提取  │       │',
  '│  │[查看详情] [编辑]  │  │[查看详情] [编辑]  │  │[查看详情] [编辑]  │       │',
  '│  └───────────────────┘  └───────────────────┘  └───────────────────┘       │',
  '└─────────────────────────────────────────────────────────────────────────────┘',,
  '',
  '--- 模板详情弹窗 ---',
  '',
  '┌─────────────────────────────────────────────────────────────────────────────┐',
  '│  模板详情：月度经营分析报告 v2.1                                       [×]  │',
  '├─────────────────────────────────────────────────────────────────────────────┤',
  '│  基本信息：适用场景=月度经营分析  创建方式=历史报告提取  关联报告=8份       │',
  '│                                                                             │',
  '│  章节结构：                                                                 │',
  '│  📁 一、整体经营概况                                                        │',
  '│    ├ 📝 固定文字：本章节概述...                                              │',
  '│    ├ 📊 数据填充：核心指标卡片（移动ARPU/用户数/DOU/收入）                    │',
  '│    └ ✍️ 动态叙述：整体趋势分析（语调：专业严谨，含策略建议）                    │',
  '│  📁 二、重点指标分析                                                        │',
  '│    ├ 📁 2.1 流量运营                                                        │',
  '│    │  ├ 📊 数据填充：流量指标                                                │',
  '│    │  └ ✍️ 动态叙述：流量趋势与归因（含归因分析）                              │',
  '│    ├ 📁 2.2 ARPU分析                                                        │',
  '│    │  ├ 📊 数据填充：ARPU指标                                                │',
  '│    │  ├ 📈 图表：ARPU趋势折线图                                              │',
  '│    │  └ ✍️ 动态叙述：ARPU归因分析                                            │',
  '│    └ 📁 2.3 用户发展                                                        │',
  '│  📁 三、区域对比                                                            │',
  '│    ├ 📊 数据填充：16地市排名表                                               │',
  '│    ├ 📈 图表：地市对比柱状图                                                 │',
  '│    └ ✍️ 动态叙述：区域差异分析                                                │',
  '│  📁 四、策略建议                                                            │',
  '│    └ ✍️ 动态叙述：策略建议（语调：管理层摘要，含策略建议+风险提示）             │',
  '│                                                                             │',
  '│  数据需求清单：共需12个指标                                                  │',
  '│  ✅ 已匹配平台指标：9个  ⚠️ 需上传数据：2个  ❌ 未指定来源：1个               │',
  '│                                                                             │',
  '│                                         [编辑模板]  [使用此模板创建报告]    │',
  '└─────────────────────────────────────────────────────────────────────────────┘',,
  '',
  '段落类型图标：📝=固定文字  📊=数据填充  ✍️=动态叙述  📈=图表'
]));

// 页面四：数据源管理
children.push(heading2('6.5 页面四：数据源管理'));
children.push(...codeBlock([
  '┌─────────────────────────────────────────────────────────────────────────────┐',
  '│  数据源管理                                                                  │',
  '├─────────────────────────────────────────────────────────────────────────────┤',
  '│                                                                             │',
  '│  [📤 上传数据]                                                              │',
  '│                                                                             │',
  '│  质量状态：[全部▾]   时间范围：[全部▾]   🔍 搜索数据源...                   │',
  '│                                                                             │',
  '│  ┌──────────────────────────────────────────────────────────────────────────┐│',
  '│  │数据源名称       │上传时间    │上传人│数据时间范围 │关联报告│质量状态│操作││',
  '│  ├─────────────────┼───────────┼──────┼────────────┼───────┼───────┼────┤│',
  '│  │6月经分数据.xlsx │06-27 10:30│张三  │2026.05-06  │2      │✅已校验│详情││',
  '│  │5月CRM导出.csv   │05-29 14:20│李四  │2026.04-05  │1      │✅已校验│详情││',
  '│  │套餐迁转明细.xlsx│06-25 09:15│王五  │2026.06     │0      │⚠️待校验│校验││',
  '│  │竞品数据.xlsx    │06-20 16:00│赵六  │2026.Q2     │0      │❌异常  │详情││',
  '│  └─────────────────┴───────────┴──────┴────────────┴───────┴───────┴────┘│',
  '└─────────────────────────────────────────────────────────────────────────────┘',,
  '',
  '质量状态：✅已校验=绿色  ⚠️待校验=黄色  ❌异常=红色'
]));

// 页面五：洞察知识库
children.push(heading2('6.6 页面五：洞察知识库'));
children.push(...codeBlock([
  '┌─────────────────────────────────────────────────────────────────────────────┐',
  '│  洞察知识库                                                                  │',
  '├─────────────────────────────────────────────────────────────────────────────┤',
  '│                                                                             │',
  '│  [+ 记录洞察]                                                               │',
  '│                                                                             │',
  '│  场景标签：[全部▾]   关联指标：[全部▾]   🔍 搜索洞察...                     │',
  '│                                                                             │',
  '│  ┌─────────────────────────────────────────────────────────────────────────┐│',
  '│  │ 🔍 ARPU下降主因：低价值套餐用户占比上升                                  ││',
  '│  │ 关联指标：移动ARPU、套餐迁转率     场景：ARPU下降分析                    ││',
  '│  │ 数据范围：2026年5-6月              来源：6月经营分析报告                  ││',
  '│  │ 被引用：3次                        归因层级：分解归因（L1）               ││',
  '│  │ [展开详情]                                                             ││',
  '│  ├─────────────────────────────────────────────────────────────────────────┤│',
  '│  │ 🔍 乌鲁木齐ARPU降幅异常源于大客户流失                                    ││',
  '│  │ 关联指标：移动ARPU、大客户保有率   场景：区域异动分析                    ││',
  '│  │ 数据范围：2026年4-6月              来源：5月经营分析报告                  ││',
  '│  │ 被引用：1次                        归因层级：区域归因（L3）               ││',
  '│  │ [展开详情]                                                             ││',
  '│  ├─────────────────────────────────────────────────────────────────────────┤│',
  '│  │ 🔍 5G套餐用户DOU显著高于4G用户，迁转后DOU提升明显                        ││',
  '│  │ 关联指标：DOU、5G渗透率            场景：流量增长分析                    ││',
  '│  │ 数据范围：2026年1-6月              来源：流量运营专项分析                 ││',
  '│  │ 被引用：5次                        归因层级：对比归因（L2）               ││',
  '│  │ [展开详情]                                                             ││',
  '│  └─────────────────────────────────────────────────────────────────────────┘│',
  '└─────────────────────────────────────────────────────────────────────────────┘',,
  '',
  '--- 展开详情 ---',
  '',
  '┌─────────────────────────────────────────────────────────────────────────────┐',
  '│  🔍 ARPU下降主因：低价值套餐用户占比上升                              [收起] │',
  '├─────────────────────────────────────────────────────────────────────────────┤',
  '│  洞察结论：低价值套餐（月租39元以下）用户占比环比上升2.3个百分点，            │',
  '│  对ARPU下降的贡献度为62%。主要驱动因素为5G基础套餐拉新带来大量低价值用户。     │',
  '│                                                                             │',
  '│  归因路径：                                                                 │',
  '│  ARPU环比下降3.2% → 低价值套餐用户占比+2.3pp（贡献62%）                      │',
  '│                   → 中高价值套餐ARPU微降0.8%（贡献18%）                      │',
  '│                   → 其他因素（贡献20%）                                      │',
  '│                                                                             │',
  '│  证据链：数据来源=大数据平台月度指标+套餐分布数据；口径=ARPU=出账收入/出账用户│',
  '│  置信度：高（基于算术分解，无推断）                                          │',
  '│  来源报告：6月经营分析报告（2026-06-28生成）                                 │',
  '└─────────────────────────────────────────────────────────────────────────────┘',
]));

// 页面六：入口交互设计
children.push(heading2('6.7 页面六：入口交互设计'));
children.push(para('入口设计采用"全局浮动AI助手 + 导航菜单直接入口"的统一方案，不在各业务模块中单独放入口。'));

children.push(heading3('6.7.1 全局浮动AI助手'));
children.push(...codeBlock([
  '=== 收起状态 ===',
  '',
  '┌─────────────────────────────────────────────────────┐',
  '│                                                     │',
  '│  （当前页面内容，不受影响）                            │',
  '│                                                     │',
  '│                                          ┌─────┐   │',
  '│                                          │ 🤖  │   │ ← 右下角浮动按钮',
  '│                                          └─────┘   │',
  '└─────────────────────────────────────────────────────┘',
  '',
  '=== 展开状态 ===',
  '',
  '┌──────────────────────────────────┬──────────────────┐',
  '│                                  │  🤖 AI洞察助手   │',
  '│  （当前页面内容，宽度收缩）        │                  │',
  '│                                  │  对话区...       │',
  '│                                  │                  │',
  '│                                  │  ──────────────  │',
  '│                                  │  输入消息...  发送│',
  '└──────────────────────────────────┴──────────────────┘',
  '',
  '=== 深度操作引导 ===',
  '',
  '当对话进入报告生成流程后，助手底部提示：',
  '┌──────────────────────────────────┐',
  '│  🤖 报告正在生成中...            │',
  '│  [展开到全屏继续] ←             │',
  '└──────────────────────────────────┘',
  '点击后跳转至AI洞察报告专属页面（左右分栏）'
]));

children.push(heading3('6.7.2 导航菜单入口'));
children.push(...codeBlock([
  '┌──────────────────────────────────────────────────────────────┐',
  '│  平台导航                                                     │',
  '│  首页 │ 运营门户 │ 工作台 │ AI洞察报告 ←  ← 导航中的直接入口  │',
  '└──────────────────────────────────────────────────────────────┘',
  '',
  '点击后直接进入AI洞察报告专属页面'
]));

console.log('Part 6 done, children count:', children.length);

// ===== 七、异常场景处理 =====
children.push(heading1('七、异常场景处理'));
children.push(createTable(
  ['异常场景', '处理策略'],
  [
    ['LLM生成超时（单段落超过120秒）', '标注"该段落生成超时，已展示部分内容"，用户可选择重试或手动编辑'],
    ['LLM输出数值与原始数据不一致', '标注"待确认"，提示具体差异（如"AI生成值为3.2%，原始数据为3.5%"），不自动修正'],
    ['大文件上传中断', '支持断点续传；无法续传时提示重新上传，已匹配的数据保留'],
    ['数据源不可用（平台接口故障）', '提示"平台数据暂不可用，可通过上传文件提供数据"，自动切换到文件上传通道'],
    ['模板提取质量差（高置信度匹配低于30%）', '提示"该报告结构识别困难，建议手动创建模板或简化报告后重新提取"'],
    ['追问时归因引擎无结果', '明确告知"当前数据不足以支撑更深层的归因分析"，建议补充哪些数据'],
    ['同一报告并发操作', '乐观锁机制，后提交者收到冲突提示，选择覆盖或合并'],
    ['报告导出时数据已变更', '导出时锁定报告数据快照，导出的内容与预览一致，不受后续数据变更影响']
  ]
));

// ===== 八、非功能需求 =====
children.push(heading1('八、非功能需求'));
children.push(createTable(
  ['维度', '要求'],
  [
    ['数据安全', '客户级数据脱敏后才能送入LLM；导出文件加水印；操作审计日志'],
    ['权限控制', '省公司角色看全疆数据，地市角色看本市数据；模板和数据源按创建人权限管理'],
    ['性能基线', '普通报告生成3-5分钟；含深度归因的报告8-12分钟；对话响应首字延迟<3秒'],
    ['并发支持', '支持10个用户同时生成报告'],
    ['兼容性', 'Chrome 90+、Edge 90+；暂无移动端需求'],
    ['数据一致性', '平台数据与上传数据的口径差异必须明确标注，由用户确认选择']
  ]
));

// ===== 九、实施建议 =====
children.push(heading1('九、实施建议'));

children.push(heading2('9.1 分期路线'));
children.push(boldPara('一期（核心可用）：'));
children.push(bulletItem('全局浮动AI助手（上下文感知+快速问答+引导跳转）'));
children.push(bulletItem('对话式报告生成（需求收集→数据准备→大纲确认→报告生成→审核定稿）'));
children.push(bulletItem('模板管理（从零创建+从历史报告提取）'));
children.push(bulletItem('双通道数据（平台指标直连+文件上传+智能匹配）'));
children.push(bulletItem('报告导出（Word格式）'));
children.push(bulletItem('报告中心（列表+状态管理）'));

children.push(boldPara('二期（深化能力）：'));
children.push(bulletItem('归因分析引擎（五层归因完整实现）'));
children.push(bulletItem('追问深化（对话中逐层下钻+结果嵌入）'));
children.push(bulletItem('洞察知识库（自动提取+关联推荐）'));
children.push(bulletItem('结构化组件（关键发现卡片/归因路径图/数据匹配表）'));
children.push(bulletItem('导出增强（含附录导出+PDF格式）'));

children.push(boldPara('三期（持续运营）：'));
children.push(bulletItem('数据源管理（校验+保留策略+质量监控）'));
children.push(bulletItem('报告版本管理（版本对比+历史追溯）'));
children.push(bulletItem('洞察知识库增强（相似场景推荐+归因模式挖掘）'));
children.push(bulletItem('多人协作（报告共享+评论批注）'));

children.push(heading2('9.2 技术风险'));
children.push(createTable(
  ['风险', '影响', '缓解措施'],
  [
    ['LLM生成内容与数据不一致', '报告准确性受损', '校验Agent自动交叉核对，不一致段落强制人工确认'],
    ['归因深度受数据限制', '第五层因果推断可能无结果', '明确预期：第四五层为可选增强，非必须交付'],
    ['模板提取质量不稳定', '识别准确率受报告格式影响', '提供手动调整能力，不依赖100%自动识别'],
    ['大文件上传性能', '50MB文件解析可能较慢', '异步处理+进度展示，不阻塞对话']
  ]
));

// ===== 最终生成文档 =====
console.log('Total children:', children.length);

const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const outputPath = path.join('/workspace/projects/docs/需求设计方案', 'AI洞察报告产品设计方案.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('Document generated at:', outputPath);
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
});
