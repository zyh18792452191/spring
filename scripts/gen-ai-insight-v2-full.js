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
// ===== 二、使用场景全景 =====
children.push(h1('二、使用场景全景'));

children.push(h2('2.1 场景一：月度经营分析报告（最核心场景）'));
children.push(pBold('背景：', '市场部每月需撰写经营分析报告，手上有本月从经分/CRM导出的数据，以及上月写过的报告。'));
children.push(p('用户操作流程：'));
children.push(bullet('1. 进入AI洞察报告，选择"从模板创建"'));
children.push(bullet('2. 选择上月报告对应的模板（模板已在首次使用时提取保存）'));
children.push(bullet('3. 上传本月数据文件（Excel），系统自动匹配模板中的数据引用点'));
children.push(bullet('4. 系统展示匹配结果，用户确认（高置信度自动通过，低置信度需人工确认）'));
children.push(bullet('5. 点击"生成报告"，AI按模板结构+本月数据生成完整报告'));
children.push(bullet('6. 预览报告，对关键发现追问深化（"ARPU下降主要原因是什么？"）'));
children.push(bullet('7. 追问结果自动嵌入报告对应章节'));
children.push(bullet('8. 审核、微调文字、导出定稿'));

children.push(h2('2.2 场景二：从指标异动发起即时分析'));
children.push(pBold('背景：', '在日常查看指标时，发现某指标明显异动，需要快速出一份分析报告。'));
children.push(p('用户操作流程：'));
children.push(bullet('1. 在首页指标卡片或指标树中，点击"生成洞察报告"'));
children.push(bullet('2. 系统自动将该指标及其关联指标作为分析对象，进入对话界面'));
children.push(bullet('3. 系统询问报告范围（时间范围、区域范围、分析深度）'));
children.push(bullet('4. 用户确认后，AI自动生成围绕该指标异动的分析报告'));
children.push(bullet('5. 用户追问归因（"为什么乌鲁木齐下降这么多？"）'));
children.push(bullet('6. 归因结果嵌入报告，导出定稿'));

children.push(h2('2.3 场景三：从零创建专项分析报告'));
children.push(pBold('背景：', '领导临时要求出一份专项分析报告（如"5G套餐渗透率提升分析"），没有现成模板。'));
children.push(p('用户操作流程：'));
children.push(bullet('1. 进入AI洞察报告，选择"新建报告"'));
children.push(bullet('2. 对话中描述需求："帮我生成一份5G套餐渗透率提升分析报告，覆盖全疆16地市，时间范围2026年1-6月"'));
children.push(bullet('3. 系统理解需求后，列出建议的报告大纲，用户确认或调整'));
children.push(bullet('4. 系统自动从平台指标体系中匹配所需指标，展示匹配清单'));
children.push(bullet('5. 如有平台覆盖不到的数据需求，提示用户上传补充数据'));
children.push(bullet('6. 数据就绪后生成报告，后续流程同场景一'));

children.push(h2('2.4 场景四：审阅追问已有报告'));
children.push(pBold('背景：', '报告已生成，经理审阅时对某个结论存疑，需要追问。'));
children.push(p('用户操作流程：'));
children.push(bullet('1. 在报告中心打开已生成的报告'));
children.push(bullet('2. 点击报告正文中的某段结论，右侧对话区自动带入上下文'));
children.push(bullet('3. 追问："这个结论的依据是什么？"'));
children.push(bullet('4. AI展示证据链（数据来源、计算口径、归因路径）'));
children.push(bullet('5. 追问："如果把奎屯排除掉，结论是否还成立？"'));
children.push(bullet('6. AI重新计算，给出更新后的结论和置信度'));
children.push(bullet('7. 用户选择"替换原文"或"追加为补充说明"'));

children.push(h2('2.5 场景五：AI主动推送触发（新增）'));
children.push(pBold('背景：', '运营人员不需要每天盯所有指标，AI主动扫描发现异动后推送。'));
children.push(p('用户操作流程：'));
children.push(bullet('1. AI检测到ARPU环比下降超过阈值，推送通知至浮动助手'));
children.push(bullet('2. 推送内容："全疆ARPU环比下降3.2%，可能原因：低价值套餐用户占比上升"'));
children.push(bullet('3. 用户点击通知，跳转至AI洞察报告专属页面，AI已预填充上下文'));
children.push(bullet('4. 用户确认后一键生成异动分析报告'));
children.push(bullet('5. 归因完成后，自动匹配策略库，报告包含"建议策略"段落'));

children.push(h2('2.6 场景六：月度报告定期自动生成（新增）'));
children.push(pBold('背景：', '月度经营分析报告是周期性的，每月都要写，流程应该自动化。'));
children.push(p('用户操作流程：'));
children.push(bullet('1. 首次配置：选择模板、设定生成周期（每月5号）、绑定平台指标数据源'));
children.push(bullet('2. 每月5号系统自动取数、匹配模板、生成报告初稿'));
children.push(bullet('3. 推送通知："6月经营分析报告已自动生成，请审核"'));
children.push(bullet('4. 用户打开报告，审核AI生成内容，追问深化关键发现'));
children.push(bullet('5. 审核定稿后导出'));
children.push(p('与手动创建的区别：自动生成仅使用平台指标数据，不涉及上传文件。如需补充外部数据，在审核阶段手动添加。'));

console.log('Part 2 done: 使用场景');
// ===== 三、业务流程设计 =====
children.push(h1('三、业务流程设计'));

children.push(h2('3.1 总体流程'));
children.push(p('选择发起方式 → 定义报告范围 → 数据准备 → 生成报告初稿 → 追问深化 → 审核定稿 → 导出'));

children.push(h2('3.2 发起方式与对应流程'));
children.push(makeTable(
  ['发起方式', '入口', '数据来源', '模板来源', '后续流程'],
  [
    ['从模板创建', '报告中心→选择模板', '平台指标+上传文件', '选定的模板', '上传数据→匹配确认→生成'],
    ['从指标发起', '浮动助手/指标树', '平台指标为主', 'AI自动生成大纲', '确认大纲→补充数据→生成'],
    ['从零新建', '报告中心→新建报告', '对话中逐步确定', 'AI根据需求生成大纲', '确认大纲→匹配指标→生成'],
    ['AI推送触发', '浮动助手通知', '平台指标', '匹配已有模板或AI生成', '确认→直接生成'],
    ['定期自动生成', '定时任务自动执行', '平台指标（自动取数）', '绑定的模板', '生成初稿→推送通知→审核'],
    ['追问已有报告', '报告中心→打开报告', '报告已有数据', '不涉及', '追问→结果嵌入→重新审核'],
  ]
));

children.push(h2('3.3 关键流程节点规则'));

children.push(h3('节点一：数据准备完成判定'));
children.push(bullet('平台指标数据：系统自动校验所选指标在指定时间范围和区域范围内是否有数据，缺数据则明确提示"某指标在某时间段数据缺失"'));
children.push(bullet('上传文件：系统自动识别文件中的数据列和行，与模板/大纲中的数据引用点做匹配'));
children.push(bullet('数据准备完成条件：模板/大纲中所有必需数据引用点均已有对应数据源（平台直连或上传文件均可），可选数据点允许缺失'));
children.push(bullet('数据不完整时：用户可以选择"跳过缺失数据继续生成"（报告中缺失部分标注"数据不足，待补充"），或"补充数据后再生成"'));

children.push(h3('节点二：报告生成'));
children.push(bullet('生成过程中，对话区实时展示生成进度（"正在分析整体趋势…""正在归因重点指标…""正在生成叙述段落…"）'));
children.push(bullet('生成过程中用户可以随时追问（如"重点关注ARPU"），AI会调整生成侧重'));
children.push(bullet('生成耗时预估：普通报告3-5分钟，含深度归因的报告8-12分钟'));

children.push(h3('节点三：追问深化'));
children.push(bullet('追问分为两类：澄清型追问（"这个数据口径是什么"）和深化型追问（"为什么下降"）'));
children.push(bullet('澄清型追问：直接在对话中回答，不影响报告正文'));
children.push(bullet('深化型追问：AI执行归因分析，结果可选择嵌入报告正文或作为附注'));
children.push(bullet('追问结果嵌入方式：用户选择"替换原文"（替换AI生成的原段落）或"追加为补充说明"（在原段落后追加）'));
children.push(bullet('同一位置反复追问时，系统保留追问历史，用户可回退到任一版本'));

children.push(h3('节点四：审核定稿'));
children.push(bullet('报告中AI生成的段落标注来源（"AI生成-已校验""AI生成-待确认""人工编辑"）'));
children.push(bullet('审核操作：确认（标记为"已确认"）、编辑（修改文字，标记为"人工编辑"）、删除（整段删除）'));
children.push(bullet('定稿条件：报告中所有段落均为"已确认"或"人工编辑"状态，无"待确认"状态'));
children.push(bullet('定稿后报告锁定，不可再追问修改（如需修改需"创建新版本"）'));

children.push(h2('3.4 状态回退规则'));
children.push(bullet('审核定稿 → 追问深化：允许，点击"继续追问"回退'));
children.push(bullet('报告生成 → 大纲确认：不允许（已生成内容不因大纲调整而丢弃，需"重新生成"）'));
children.push(bullet('追问深化 → 数据准备：允许，用户追加新数据源时回退'));

console.log('Part 3 done: 业务流程');
// ===== 四、功能模块设计 =====
children.push(h1('四、功能模块设计'));

// === 模块一 ===
children.push(h2('模块一：对话式报告生成（核心模块）'));
children.push(pBold('功能定位：', '用户与AI的交互界面，所有报告生成操作均通过对话完成。'));

children.push(h3('4.1.1 对话状态机'));
children.push(p('报告生成过程分为6个状态，状态之间有明确的转换条件和守卫规则：'));

children.push(pBold('状态1：需求收集', ''));
children.push(bullet('触发：用户选择任意发起方式进入'));
children.push(bullet('系统行为：根据发起方式，主动询问缺失信息'));
children.push(bullet('  - 从模板创建：确认报告周期、区域范围，提示上传数据'));
children.push(bullet('  - 从指标发起：确认分析深度、时间范围、是否需要对比基期'));
children.push(bullet('  - 从零新建：询问报告主题、目标读者、重点方向'));
children.push(bullet('  - AI推送触发：自动带入推送上下文，用户确认即可'));
children.push(bullet('  - 定期自动生成：跳过此状态，直接进入数据准备'));
children.push(bullet('转换到下一状态条件：报告主题明确 + 时间范围确定 + 区域范围确定'));

children.push(pBold('状态2：数据准备', ''));
children.push(bullet('触发：需求收集完成'));
children.push(bullet('系统行为：自动从平台指标体系匹配所需指标数据；如需外部数据，提示用户上传；展示数据匹配结果和覆盖情况'));
children.push(bullet('用户操作：上传文件、确认匹配结果、补充缺失数据'));
children.push(bullet('转换到下一状态条件：必需数据覆盖率达100%（或用户选择跳过缺失数据）'));

children.push(pBold('状态3：大纲确认', ''));
children.push(bullet('触发：数据准备完成'));
children.push(bullet('系统行为：生成报告大纲（章节结构+每章预计分析内容），展示在对话区'));
children.push(bullet('用户操作：确认大纲，或提出修改意见（"增加5G专项分析章节""删除宽带部分"）'));
children.push(bullet('转换到下一状态条件：用户明确确认大纲'));

children.push(pBold('状态4：报告生成', ''));
children.push(bullet('触发：大纲确认完成'));
children.push(bullet('系统行为：按大纲逐章生成报告，每完成一章在预览区实时展示'));
children.push(bullet('用户操作：可随时追问调整侧重，但建议等生成完成后再深度追问'));
children.push(bullet('转换到下一状态条件：所有章节生成完毕'));

children.push(pBold('状态5：追问深化', ''));
children.push(bullet('触发：报告初稿生成完毕'));
children.push(bullet('系统行为：等待用户追问，或在预览区点击某段结论发起追问'));
children.push(bullet('可反复追问，每次追问结果选择嵌入方式'));
children.push(bullet('转换到下一状态条件：用户主动点击"进入审核"或超时无操作（超时阈值：30分钟）'));

children.push(pBold('状态6：审核定稿', ''));
children.push(bullet('触发：用户点击"进入审核"或超时'));
children.push(bullet('系统行为：标记所有AI生成段落的校验状态，等待用户逐段审核'));
children.push(bullet('转换到终态条件：全部段落审核完毕 → 定稿'));

children.push(h3('4.1.2 快捷指令'));
children.push(makeTable(
  ['快捷指令', '等同于输入', '系统行为'],
  [
    ['生成大纲', '请根据当前需求生成报告大纲', '进入大纲确认状态'],
    ['重点分析', '请重点分析以下指标的异动原因：[当前选中指标]', '触发归因引擎深度分析'],
    ['对比上月', '请与上月数据进行对比分析', '调取上月数据做对比'],
    ['全疆排名', '请展示全疆16地市排名', '生成区域对比表格'],
    ['补充归因', '请对当前结论做更深层的归因分析', '归因引擎向下钻一层'],
    ['策略建议', '请基于当前归因结论推荐策略', '匹配策略库，生成建议段落'],
    ['导出报告', '请导出当前报告', '进入导出流程'],
  ]
));

children.push(h3('4.1.3 结构化组件'));
children.push(p('对话过程中，系统不仅返回文字，还会返回结构化的可视化组件，嵌入在对话消息中：'));
children.push(makeTable(
  ['组件类型', '触发场景', '展示内容', '可操作'],
  [
    ['关键发现卡片', '每次归因分析完成后', '结论摘要+置信度标识+核心数据变化', '点击"嵌入报告"'],
    ['数据匹配结果表', '数据准备阶段', '左列=模板所需数据项，右列=匹配的数据源，匹配状态色标', '点击修改匹配'],
    ['指标选择面板', '从指标发起/大纲确认阶段', '按模块分组的指标清单，支持搜索和多选', '勾选/取消'],
    ['归因路径图', '归因分析返回时', '从异动指标到根因的路径图，每层标注贡献度', '点击节点追问'],
    ['策略推荐卡片', '归因结论匹配策略库后', '匹配的策略名称+适用条件+预期效果', '点击"嵌入报告"'],
  ]
));

children.push(p('置信度标识规则：'));
children.push(bullet('高置信度（绿色）：数据充分、归因路径清晰、口径可验证 → 自动嵌入报告'));
children.push(bullet('中置信度（黄色）：数据基本充分但归因路径有分支 → 嵌入报告但标注"待确认"'));
children.push(bullet('低置信度（红色）：数据不足或归因存在矛盾 → 不自动嵌入，提示用户追问确认'));

children.push(h3('4.1.4 对话话术设计原则'));
children.push(makeTable(
  ['原则', '说明', '示例'],
  [
    ['引导式而非开放式', '每次提问提供选项而非让用户自由输入', '"报告的时间范围是？①本月 ②本季度 ③自定义"'],
    ['渐进式深入', '先确认框架再填充细节', '先确认大纲，再逐章生成'],
    ['结论带依据', '每个结论必须附带数据来源和计算口径', '"ARPU环比下降3.2%（数据来源：大数据平台月度指标，口径：加权平均ARPU）"'],
    ['异常主动提示', '发现数据异常时主动告知', '"注意：乌鲁木齐ARPU环比下降8.7%，降幅显著高于全疆平均水平"'],
    ['不确定的明确标注', 'AI推断内容标注推断依据和置信度', '"推测原因：5G套餐迁转导致低ARPU用户占比上升（置信度：中等）"'],
  ]
));

// === 模块二 ===
children.push(h2('模块二：报告模板管理'));
children.push(pBold('功能定位：', '管理报告模板的创建、提取、编辑和使用。模板定义了报告的章节结构、数据需求和变量。'));

children.push(h3('4.2.1 模板来源'));
children.push(pBold('方式一：从历史报告提取（推荐）', ''));
children.push(bullet('用户上传一份历史报告文件（Word格式）'));
children.push(bullet('AI自动识别报告的章节结构、每段的类型（固定文字/数据引用/动态叙述）、数据引用点'));
children.push(bullet('展示识别结果供用户确认，用户可调整章节顺序、修改段落类型、增删章节'));
children.push(bullet('确认后保存为模板'));

children.push(pBold('方式二：从零创建', ''));
children.push(bullet('用户在对话中描述报告需求，AI生成大纲'));
children.push(bullet('用户确认大纲后，选择"保存为模板"'));
children.push(bullet('模板自动记录章节结构和数据需求'));

children.push(h3('4.2.2 模板变量机制（新增）'));
children.push(p('模板中的内容分为"固定结构"和"动态内容"，动态内容通过变量机制管理，减少AI生成的不确定性：'));
children.push(makeTable(
  ['变量类型', '含义', '生成时取值', '示例'],
  [
    ['报告周期', '本次报告的时间范围', '用户在需求收集阶段确认', '"2026年6月"'],
    ['区域范围', '本次报告的区域范围', '用户在需求收集阶段确认', '"全疆"'],
    ['指标数值', '动态取数的指标值', '从数据源自动取值', '"56.8元"'],
    ['对比基期', '对比参照的时间段', '用户确认或模板默认', '"2026年5月"'],
    ['叙述段落', 'AI生成的分析文字', 'AI根据数据+风格生成', '整段文字'],
  ]
));
children.push(p('变量机制让模板的"固定结构"和"动态内容"清晰分离。报告周期、区域范围等变量由用户确认后自动填入，AI不需要"猜测"这些值该填什么，只需专注于叙述段落的生成。'));

children.push(h3('4.2.3 段落类型与规则'));
children.push(makeTable(
  ['段落类型', '含义', '生成时行为', '数据需求'],
  [
    ['固定文字', '每次报告都一样的文字（如"一、整体经营概况"）', '直接从模板复制', '无'],
    ['数据填充', '固定格式的数据展示（如指标数值、排名表）', '从数据源取值填入模板定义的格式', '必需，需指定指标和口径'],
    ['动态叙述', 'AI根据数据生成的分析文字', 'AI基于数据和叙述风格要求生成', '必需，需指定分析的指标范围'],
    ['图表', '可视化图表（趋势图、对比柱状图等）', '根据图表类型和数据源生成', '必需，需指定图表类型和指标'],
  ]
));

children.push(p('叙述风格配置（仅"动态叙述"段落需要定义）：'));
children.push(bullet('语调：专业严谨/通俗简明/管理层摘要'));
children.push(bullet('是否包含策略建议：是/否'));
children.push(bullet('是否包含风险提示：是/否'));
children.push(bullet('分析侧重：趋势分析/对比分析/归因分析/综合'));

children.push(h3('4.2.4 模板与报告的版本关系'));
children.push(bullet('模板更新后，已生成的报告不受影响（报告绑定的是生成时的模板版本快照）'));
children.push(bullet('模板更新时提示："此模板已有N份关联报告，更新后仅影响新生成的报告"'));
children.push(bullet('报告详情中可查看"此报告基于模板v2.1生成"'));

children.push(h3('4.2.5 定期自动生成配置（新增）'));
children.push(p('模板支持"定时生成"配置，适用于月度/季度等周期性报告：'));
children.push(makeTable(
  ['配置项', '说明', '规则'],
  [
    ['生成周期', '每月/每季度/每年', '与报告的发布节奏一致'],
    ['触发时间', '每月N号自动触发', '建议设在大数据平台T+1完成后（如每月5号）'],
    ['数据来源', '绑定平台指标（自动取数）', '定期自动生成仅使用平台指标，不涉及上传文件'],
    ['生成后动作', '自动进入"待审核"状态', '推送通知给创建人审核'],
    ['数据缺失处理', '某指标无数据时', '报告中标注"数据暂缺"，推送中提示"本次自动生成有3个指标数据缺失"'],
  ]
));

children.push(h3('4.2.6 模板提取的匹配确认规则'));
children.push(bullet('高置信度组（绿色）：AI明确识别出对应的平台指标，直接标记为"已匹配"'));
children.push(bullet('中置信度组（黄色）：AI推测可能对应某个平台指标，需用户确认或修正'));
children.push(bullet('低置信度组（红色）：AI无法匹配，标记为"未匹配"，需用户手动指定数据来源'));
children.push(bullet('确认操作：逐条确认匹配、批量确认高置信度项、手动修改匹配'));
children.push(bullet('确认完成后，未匹配的项标记为"上传数据专用"（生成时需用户上传对应数据）'));

console.log('Part 4a done: 模块一二');
// === 模块三 ===
children.push(h2('模块三：数据导入与智能匹配'));
children.push(pBold('功能定位：', '管理报告生成的数据来源，支持平台内部数据和外部上传数据两种通道。'));

children.push(h3('4.3.1 双通道数据架构'));
children.push(makeTable(
  ['通道', '数据来源', '接入方式', '数据质量保障'],
  [
    ['平台指标数据', '大数据平台指标体系、指标树定义的指标', '系统直连，自动取数', '口径已定义，质量由大数据平台保障'],
    ['外部上传数据', '经分系统导出、CRM导出、手工Excel', '用户上传文件，系统智能识别', '系统做格式校验和逻辑校验，口径需用户确认'],
  ]
));

children.push(h3('4.3.2 平台指标数据选择'));
children.push(bullet('用户可在对话中或通过指标选择面板，选择平台已接入的指标'));
children.push(bullet('指标按业务模块分组，支持搜索'));
children.push(bullet('选中指标后，系统自动展示该指标的可选时间范围和区域范围'));
children.push(bullet('如指标在所选时间/区域范围内无数据，明确提示"该指标在某时间段无数据"'));

children.push(h3('4.3.3 外部文件上传'));
children.push(bullet('支持格式：Excel（.xlsx/.xls）、CSV'));
children.push(bullet('单文件大小上限：50MB'));
children.push(bullet('上传后系统自动行为：'));
children.push(bullet('  1. 识别文件中的数据列（列名识别+数据类型推断）'));
children.push(bullet('  2. 识别数据行的时间范围（从日期列推断）'));
children.push(bullet('  3. 识别行维度（地市/月份等）和列维度（指标值）'));
children.push(bullet('  4. 与模板/大纲中的数据引用点做智能匹配'));
children.push(bullet('  5. 展示匹配结果供确认'));

children.push(h3('4.3.4 智能匹配规则'));
children.push(p('匹配算法按以下优先级执行：'));
children.push(bullet('1. 精确匹配：上传文件的列名与模板数据引用点的指标名称完全一致 → 高置信度'));
children.push(bullet('2. 语义匹配：列名与指标名称语义相近（如"ARPU值"匹配"人均ARPU"） → 中置信度'));
children.push(bullet('3. 口径匹配：列名虽不同但数据口径一致 → 中置信度，需标注口径说明'));
children.push(bullet('4. 未匹配：无法自动匹配 → 低置信度，需人工指定'));

children.push(h3('4.3.5 二维结构识别（新增）'));
children.push(p('电信运营的数据通常是二维的——行=地市/时间，列=指标。智能匹配需支持二维结构识别：'));
children.push(bullet('识别行维度：自动检测是否有"地市""月份"等维度列'));
children.push(bullet('识别列维度：哪些列是指标值列'));
children.push(bullet('模板中的数据需求可指定"我需要16地市的ARPU"，匹配时不仅匹配"ARPU"列，还要确认行维度包含16个地市'));
children.push(bullet('识别失败时降级：提示"请选择数据起始行和维度列"'));

children.push(h3('4.3.6 数据冲突处理'));
children.push(bullet('当同一指标既有平台数据又有上传文件数据时：'));
children.push(bullet('  - 默认以平台数据为准（口径更权威）'));
children.push(bullet('  - 用户可选择覆盖使用上传数据（需确认，系统提示口径差异警告）'));
children.push(bullet('  - 报告中标注数据来源，若使用上传数据则额外标注"数据来源：用户上传，口径未经平台校验"'));

children.push(h3('4.3.7 数据时效性校验'));
children.push(bullet('系统自动检查所选数据的时间范围是否覆盖报告周期'));
children.push(bullet('不覆盖时提示具体缺失范围'));
children.push(bullet('用户可选择：调整报告周期、补充数据、跳过缺失月份'));

children.push(h3('4.3.8 口径校验与标注（新增）'));
children.push(p('口径问题不是异常场景，是常态。口径校验贯穿数据匹配的全过程：'));
children.push(makeTable(
  ['阶段', '口径校验行为', '不匹配时处理'],
  [
    ['模板定义', '每个数据引用点标注期望口径', '模板创建时必须填写口径说明'],
    ['数据匹配', '匹配时不仅匹配指标名称，还要匹配口径', '口径不一致时标注警告，用户确认后才可使用'],
    ['报告生成', 'AI生成的叙述段落引用口径说明', '如"ARPU 56.8元（口径：移动出账收入/出账用户数，含宽带收入）"'],
    ['报告导出', '附录中包含口径清单', '标明每个指标的数据来源和口径定义'],
  ]
));

// === 模块四 ===
children.push(h2('模块四：归因分析引擎'));
children.push(pBold('功能定位：', '对指标异动进行多层级归因，为报告提供"为什么"的分析支撑，并与策略库联动给出"怎么办"的建议。'));

children.push(h3('4.4.1 六层归因体系（新增关联归因层）'));
children.push(makeTable(
  ['层级', '归因方法', '解决的问题', '产出', '置信度规则'],
  [
    ['第一层：分解归因', '将异动指标按构成维度拆解，定位最大贡献维度', '"哪个维度贡献了主要变动？"', '维度贡献度排序', '高（基于算术分解）'],
    ['第二层：对比归因', '与历史同期/同类区域对比，识别异常点', '"和去年同期比，哪个维度异常？"', '异常维度清单+偏差幅度', '高（基于事实对比）'],
    ['第三层：区域归因', '按区域拆解，定位异动来源区域', '"哪个地市拉低了全疆水平？"', '区域贡献度排名', '高（基于算术分解）'],
    ['第四层：关联归因（新增）', '当多个指标同时异动时，分析是否存在共同驱动力', '"ARPU下降同时DOU上升，是否是5G迁转导致的结构变化？"', '关联假设+共同驱动因子+关联强度', '中（存在多解可能）'],
    ['第五层：客群归因', '按客群标签拆解，定位受影响客群', '"哪类客户群体是主因？"', '客群贡献度+客群特征', '中（依赖客群标签准确性）'],
    ['第六层：因果推断', '结合外部事件和业务动作，推断因果关系', '"为什么发生？最可能的原因是什么？"', '因果假设+支持证据+置信度', '低到中（存在多解可能）'],
  ]
));

children.push(p('关联归因触发条件：同一报告周期内，有2个及以上指标同时出现异动时自动触发。系统分析这些异动指标之间是否存在共同驱动力，避免每个指标孤立归因得出矛盾结论。'));

children.push(h3('4.4.2 归因触发规则'));
children.push(pBold('自动触发条件', '（报告生成时，以下任一条件满足则自动触发归因）：'));
children.push(bullet('指标环比变动幅度超过阈值（默认阈值：±5%，可在模板中配置）'));
children.push(bullet('指标同比变动幅度超过阈值（默认阈值：±10%）'));
children.push(bullet('指标偏离目标值超过阈值（默认阈值：±8%）'));
children.push(bullet('区域排名发生显著变化（排名变动超过3位）'));
children.push(bullet('多个指标同时异动（触发关联归因）'));
children.push(pBold('手动触发：', '用户在追问中主动要求（"为什么下降""请深入分析原因"）'));

children.push(h3('4.4.3 归因深度控制'));
children.push(bullet('报告默认只做前三层归因（分解+对比+区域），结果置信度较高'));
children.push(bullet('第四层（关联归因）：多指标同时异动时自动触发'));
children.push(bullet('第五层（客群归因）：需客群数据支持，如无相关数据则跳过并提示'));
children.push(bullet('第六层（因果推断）：仅在用户追问时触发，不自动执行'));
children.push(bullet('用户可在追问中逐层深入："继续深入"=向下钻一层；"分析到底"=钻到最深层'));

children.push(h3('4.4.4 归因-策略联动（新增）'));
children.push(p('归因的最终目的是支撑决策，"为什么下降"之后应该是"怎么办"。归因结论自动匹配平台已有的策略库和根因库：'));
children.push(makeTable(
  ['步骤', '行为', '规则'],
  [
    ['归因结论提取', '从归因结果中提取关键词', '如"低价值套餐用户占比上升"'],
    ['根因匹配', '与根因库的诊断标签做语义匹配', '匹配到根因"低价值套餐占比上升"'],
    ['策略关联', '通过根因-策略关联关系，找到对应策略', '关联到3条策略：价值提升方案A/B/C'],
    ['策略推荐', '在报告中生成"建议策略"段落', '标注来源："基于根因库匹配，关联策略3条"'],
    ['策略详情', '用户点击策略推荐卡片，查看策略完整7层信息', '从策略库调取，在弹窗中展示'],
  ]
));
children.push(p('匹配失败时处理：如根因库中无匹配根因，在洞察知识库中记录该归因结论，提示"建议将此归因结论录入根因库，以便后续自动匹配策略"。'));

children.push(h3('4.4.5 归因结果结构'));
children.push(p('每层归因结果包含：'));
children.push(bullet('结论：一句话总结'));
children.push(bullet('证据链：支撑结论的数据点、计算过程、数据来源'));
children.push(bullet('贡献度：该因素对总异动的贡献占比（数值）'));
children.push(bullet('置信度：高/中/低（附判定依据）'));
children.push(bullet('下钻建议：如继续深入可分析的方向'));
children.push(bullet('策略推荐：匹配到的策略清单（如有匹配）'));

children.push(h3('4.4.6 归因失败处理'));
children.push(bullet('数据不足以支撑归因时：标注"归因分析因数据不足暂停，建议补充XXX数据后继续"'));
children.push(bullet('归因超时（单层归因超过60秒）：标注"归因分析超时，已展示部分结果"'));
children.push(bullet('因果推断出现多个等概率假设：列出所有假设及各自支持证据，不强行选一个'));
children.push(bullet('归因结论与已知事实矛盾：标注矛盾点，提示用户确认数据准确性'));

children.push(h3('4.4.7 归因与报告的嵌入方式'));
children.push(bullet('自动触发的归因（前三层）：结果直接写入报告"归因分析"章节'));
children.push(bullet('追问触发的归因（第四至六层）：结果以"补充说明"形式嵌入对应段落'));
children.push(bullet('策略推荐：作为独立段落嵌入"策略建议"章节'));
children.push(bullet('归因路径图：在对话区展示，不在报告中展示（报告只展示结论性文字和关键数据）'));
children.push(bullet('报告导出时，归因的完整证据链作为附录导出'));

console.log('Part 4b done: 模块三四');
// === 模块五 ===
children.push(h2('模块五：报告输出与导出'));
children.push(pBold('功能定位：', '将生成的报告导出为可交付的文件格式，支持在线分享和批注协作。'));

children.push(h3('4.5.1 报告预览区交互'));
children.push(bullet('预览区展示完整的报告内容，与最终导出格式基本一致'));
children.push(bullet('AI生成的段落左侧显示状态标识：已确认（绿）/待确认（黄）/人工编辑（蓝）'));
children.push(bullet('点击任一段落，右侧对话区自动带入该段落的上下文，便于追问'));
children.push(bullet('可直接在预览区编辑文字（编辑后自动标记为"人工编辑"）'));
children.push(bullet('可删除整段（删除后该段保留为占位符，标注"已删除"，可恢复）'));

children.push(h3('4.5.2 导出格式'));
children.push(makeTable(
  ['格式', '说明', '适用场景'],
  [
    ['Word', '完整报告，含图表（图表导出为图片嵌入）', '正式报告交付'],
    ['Word（含附录）', '正文+归因证据链附录+数据来源清单+口径清单', '技术审阅'],
    ['PDF', '排版固定的只读版本', '分发传阅'],
  ]
));

children.push(h3('4.5.3 导出样式'));
children.push(bullet('默认样式：公司标准报告样式（字体、字号、配色、页眉页脚）'));
children.push(bullet('模板可定义自定义样式覆盖默认样式'));
children.push(bullet('图表导出规则：一律导出为图片（确保不同Word版本打开时图表显示一致）'));
children.push(bullet('表格导出规则：导出为Word表格，可在Word中编辑'));

children.push(h3('4.5.4 报告分享与批注（新增）'));
children.push(makeTable(
  ['能力', '说明'],
  [
    ['在线分享', '定稿后生成在线链接，收件人可在浏览器中查看（只读），无需下载Word'],
    ['批注功能', '审阅者在报告任意段落添加批注，批注内容关联到具体段落'],
    ['批注处理', '报告创建人可逐条回复批注，选择"采纳并修改"或"说明不采纳原因"'],
    ['导出含批注', '可选择导出"纯净版"或"含批注版"'],
  ]
));

children.push(h3('4.5.5 导出版本管理'));
children.push(bullet('每次导出生成一个导出记录（导出时间、导出人、格式、报告版本）'));
children.push(bullet('同一报告可多次导出，每次导出互不影响'));
children.push(bullet('导出的文件名规则：{报告名称}_{时间范围}_{导出日期}'));

// === 模块六 ===
children.push(h2('模块六：报告中心'));
children.push(pBold('功能定位：', '管理所有报告的生命周期，包括查看、搜索、追问、导出。'));

children.push(h3('4.6.1 报告列表'));
children.push(p('展示内容：报告标题、报告状态、关联模板名称、报告周期、创建时间、最后编辑时间、创建人'));
children.push(p('筛选条件：按状态筛选、按报告周期筛选、按模板筛选、按创建人筛选、按关键词搜索（搜索报告标题和正文）'));
children.push(p('排序规则：默认按最后编辑时间倒序'));

children.push(h3('4.6.2 报告状态与操作'));
children.push(makeTable(
  ['状态', '含义', '可执行操作'],
  [
    ['草稿', '报告生成中或追问深化中', '继续对话、追问、重新生成'],
    ['待审核', '追问完成，进入审核阶段', '审核（逐段确认/编辑/删除）、退回草稿继续追问'],
    ['已定稿', '审核完成，报告锁定', '导出、在线分享、创建新版本、查看历史版本'],
    ['已作废', '主动作废', '仅查看'],
  ]
));

children.push(h3('4.6.3 报告版本管理'));
children.push(bullet('定稿后的报告如需修改，需"创建新版本"'));
children.push(bullet('新版本继承上一版本的全部内容，可继续追问和编辑'));
children.push(bullet('版本之间可对比差异（高亮变更内容）'));
children.push(bullet('每个版本独立保存，不覆盖历史版本'));

// === 模块七 ===
children.push(h2('模块七：洞察知识库'));
children.push(pBold('功能定位：', '沉淀报告中的洞察发现，为后续报告生成提供参考，并反馈至根因库和策略库。'));

children.push(h3('4.7.1 洞察记录来源'));
children.push(bullet('报告中高置信度的归因结论（自动提取）'));
children.push(bullet('用户确认的中置信度归因结论（标记后提取）'));
children.push(bullet('用户手动记录的洞察'));
children.push(bullet('归因-策略匹配失败的结论（标记为"待入库根因"，提示录入根因库）'));

children.push(h3('4.7.2 洞察记录内容'));
children.push(p('每条洞察记录包含：洞察结论（一句话）、关联指标、归因路径、适用场景标签、数据时间范围、来源报告、被引用次数'));

children.push(h3('4.7.3 洞察复用规则'));
children.push(bullet('生成新报告时，系统自动检索洞察知识库中与当前分析主题相关的洞察'));
children.push(bullet('相关性判断：指标重叠度+场景标签匹配+时间接近度'));
children.push(bullet('相关洞察作为参考信息提供给AI，但不直接写入报告（避免路径依赖）'));
children.push(bullet('在对话中可主动提问："历史上类似情况是怎么分析的？"'));

// === 模块八 ===
children.push(h2('模块八：数据源管理'));
children.push(pBold('功能定位：', '管理外部上传数据源的生命周期。'));

children.push(h3('4.8.1 数据源列表'));
children.push(p('展示内容：数据源名称、上传时间、上传人、数据时间范围、关联报告数量、数据质量状态'));
children.push(p('筛选条件：按质量状态筛选、按时间范围筛选'));

children.push(h3('4.8.2 数据源校验规则'));
children.push(p('上传后系统自动执行以下校验：'));
children.push(bullet('格式校验：文件格式、编码是否合规'));
children.push(bullet('完整性校验：是否有空行空列、数据断档'));
children.push(bullet('逻辑校验：数值是否在合理范围（如ARPU不可能为负数）、日期是否连续'));
children.push(bullet('口径提示：提醒用户确认数据口径是否与平台定义一致'));

children.push(h3('4.8.3 数据源保留策略'));
children.push(bullet('与报告关联的数据源：随报告保留'));
children.push(bullet('未关联任何报告的数据源：保留30天后自动清理'));
children.push(bullet('手动删除：仅当数据源未关联任何报告时可删除'));

// === 模块九（新增） ===
children.push(h2('模块九：智能洞察推送（新增）'));
children.push(pBold('功能定位：', 'AI主动扫描指标异动，向对应角色推送洞察发现，实现从被动响应到主动发现的升级。'));

children.push(h3('4.9.1 推送场景'));
children.push(makeTable(
  ['推送场景', '触发条件', '推送内容', '推送方式'],
  [
    ['指标异动', '环比/同比超过阈值', '"XX指标环比异动X%，可能原因：…"', '浮动助手通知+待办提醒'],
    ['区域异常', '某地市排名剧烈变动', '"XX地市ARPU排名从第3降至第9"', '浮动助手通知'],
    ['趋势预警', '连续3个月同方向变动', '"XX指标连续3个月下降，预计下月将低于目标值"', '浮动助手通知+月度报告摘要'],
    ['报告到期', '月度报告临近截止日', '"本月经营分析报告尚未生成，是否现在开始？"', '待办提醒'],
    ['定期报告就绪', '定时生成任务完成', '"6月经营分析报告已自动生成，请审核"', '待办提醒+浮动助手通知'],
  ]
));

children.push(h3('4.9.2 推送后的交互'));
children.push(bullet('用户收到推送后，一键即可跳转至AI洞察报告专属页面'));
children.push(bullet('AI已预填充上下文（异动指标、可能原因、相关区域）'));
children.push(bullet('用户确认后直接生成报告，无需重复描述需求'));

children.push(h3('4.9.3 推送频率控制'));
children.push(bullet('同一指标同一异动事件不重复推送'));
children.push(bullet('每日推送上限：每人不超过5条'));
children.push(bullet('用户可配置关注指标清单，只接收关注指标的推送'));
children.push(bullet('推送静默时段：可设置夜间不推送（如22:00-8:00）'));

console.log('Part 4c done: 模块五至九');
// ===== 五、角色-场景-功能矩阵（新增） =====
children.push(h1('五、角色-场景-功能矩阵'));

children.push(p('不同角色关心的内容、使用的功能完全不同。此矩阵直接影响功能优先级和产品设计侧重：'));

children.push(makeTable(
  ['角色', '高频场景', '核心功能', '报告关注点', '一期优先级'],
  [
    ['省公司分析师', '月度报告+从零创建', '模板管理+归因引擎+导出', '全疆数据、多维度归因、策略建议', 'P0'],
    ['省公司经理', '审阅追问+推送触发', '浮动助手+追问+批注+在线分享', '关键结论、风险提示、策略可行性', 'P0'],
    ['地市运营人员', '定期自动生成+指标异动', '定时生成+快捷追问+推送', '本地市数据、区域排名、行动建议', 'P1'],
    ['专业中心分析师', '专项分析+从零创建', '从零创建+深度归因+策略联动', '专项指标、跨区域对比、深度归因', 'P1'],
  ]
));

children.push(p('优先级说明：'));
children.push(bullet('P0（一期必须交付）：省公司分析师和经理是最核心用户，月度报告场景是最高频场景'));
children.push(bullet('P1（一期尽量交付）：地市运营人员如果作为最大用户群，"定期自动生成"应提到一期'));
children.push(bullet('如果地市运营人员占用户主体，则定期自动生成的优先级提升为P0'));

// ===== 六、总体数据流向（新增） =====
children.push(h1('六、总体数据流向'));

children.push(p('数据从来源层经过处理层到产出层，最终消费层包括导出、分享和系统回写：'));

children.push(makeTable(
  ['层次', '包含内容', '说明'],
  [
    ['数据来源层', '平台指标数据、上传文件、策略库、根因库', '双通道数据+平台已有知识库'],
    ['处理层', '智能匹配、归因引擎（六层）、叙述生成、口径校验、策略匹配', '核心AI处理能力'],
    ['产出层', '报告正文、洞察记录、策略推荐、口径标注、推送通知', '结构化产出物'],
    ['消费层', '报告导出(Word/PDF)、在线分享、批注协作、策略库回写、洞察知识库沉淀、根因库反馈', '终端消费和系统闭环'],
  ]
));

children.push(p('关键闭环：'));
children.push(bullet('归因结论 → 洞察知识库 → 下次报告生成时参考'));
children.push(bullet('归因结论 → 根因库 → 策略库 → 归因-策略联动推荐'));
children.push(bullet('用户编辑反馈 → 学习反馈闭环 → 优化生成质量'));

// ===== 七、系统能力衔接 =====
children.push(h1('七、系统能力衔接'));

children.push(h2('7.1 需要平台哪些能力支撑'));
children.push(makeTable(
  ['平台能力', '支撑的功能', '衔接方式'],
  [
    ['指标体系', '数据准备阶段取数、指标选择面板', '通过指标接口获取指标定义和数值'],
    ['指标树', '从指标树发起报告、获取指标间层级关系', '读取指标树结构，带入关联指标'],
    ['区域选择器', '报告区域范围确定', '复用现有区域选择组件和区域数据'],
    ['策略库', '归因-策略联动、策略推荐卡片', '读取根因-策略关联关系和策略7层信息'],
    ['根因库', '归因结论匹配根因', '读取根因诊断标签，写入新发现的根因'],
    ['脱敏引擎', '客户数据脱敏', 'PII字段送入LLM前脱敏处理'],
    ['数据血缘', '归因证据链', '复用血缘关系作为归因的证据支撑'],
    ['权限系统', '报告按角色可见、数据范围控制', '省公司看全疆、地市看本市'],
  ]
));

children.push(h2('7.2 输出什么给平台其他模块'));
children.push(makeTable(
  ['输出内容', '目标模块', '衔接方式'],
  [
    ['归因结论（新发现的根因）', '根因库', '提示用户将归因结论录入根因库'],
    ['策略执行效果', '策略库', '报告中对策略效果的评估反馈至策略库'],
    ['洞察记录', '洞察知识库', '自动提取，供后续报告参考'],
    ['推送通知', '待办系统', '异动推送和报告到期提醒'],
    ['指标异动标记', '首页指标卡片', '已生成报告的指标可标注"已分析"'],
  ]
));

children.push(h2('7.3 与技术方案的Agent编排对应'));
children.push(p('产品定义的6个对话状态，与技术方案的Agent编排一一对应。但工作流编排的技术细节对用户不可见，用户只感知到对话状态的推进。'));
children.push(makeTable(
  ['产品对话状态', '对应的Agent', 'Agent职责'],
  [
    ['需求收集', '需求理解Agent', '解析用户意图，补全缺失信息'],
    ['数据准备', '数据加载Agent', '从平台取数或解析上传文件，做匹配和校验'],
    ['大纲确认', '报告规划Agent', '根据需求+数据生成报告大纲'],
    ['报告生成', '叙述生成Agent', '按大纲逐章生成内容，调用归因引擎'],
    ['追问深化', '归因分析Agent', '执行归因计算，返回结论和证据链'],
    ['审核定稿', '校验Agent', '核实生成内容的数值准确性、口径一致性'],
  ]
));

children.push(h2('7.4 技术能力取舍'));
children.push(makeTable(
  ['技术能力', '是否采用', '决策理由'],
  [
    ['数据加载（平台+文件）', '采用', '双通道数据架构的核心'],
    ['语义识别（模板提取）', '采用', '从历史报告提取模板的核心能力'],
    ['大语言模型（叙述生成）', '采用', '动态叙述段落生成的核心能力'],
    ['向量检索（洞察知识库）', '采用', '历史洞察关联推荐'],
    ['工作流编排', '采用', '对话状态机+Agent调度，用户不可见'],
    ['数据血缘追踪', '采用', '归因证据链的基础'],
    ['安全防护（脱敏/权限）', '采用', '客户数据保护'],
    ['数据探查', '不采用', '平台指标体系已有元数据，无需额外探查'],
    ['数据清洗', '不采用', '平台数据已清洗，上传数据只做格式校验'],
    ['数据转换', '不采用', '不做ETL，上传数据直接匹配使用'],
    ['Dashboard可视化', '降级采用', '不做独立仪表盘，仅在报告内嵌入小型图表'],
  ]
));

children.push(h2('7.5 安全约束对齐'));
children.push(pBold('按模块的安全约束：', ''));
children.push(makeTable(
  ['模块', '安全约束'],
  [
    ['对话式报告生成', '对话历史加密存储；脱敏引擎对送入LLM的客户数据做脱敏；对话内容不用于模型训练'],
    ['报告模板管理', '模板不包含客户级数据，只有指标级引用；模板操作需权限控制'],
    ['数据导入与匹配', '上传文件临时存储，生成完毕后可配置自动清除；上传数据不离开平台安全域'],
    ['归因分析引擎', '归因过程不输出客户明细，只输出聚合结论；因果推断结论标注"AI推断"'],
    ['报告输出与导出', '导出文件加水印（导出人+时间）；已脱敏数据导出时保持脱敏'],
    ['报告中心', '报告按权限可见（省公司看全疆、地市看本市）；删除操作需二次确认'],
    ['洞察知识库', '洞察记录不包含客户级信息；引用洞察时带来源标注'],
    ['数据源管理', '上传数据与报告关联后不可随意删除；数据源操作审计日志'],
    ['智能洞察推送', '推送内容不含客户级数据；推送频率受限防骚扰'],
  ]
));

children.push(pBold('LLM调用专项安全约束：', ''));
children.push(bullet('输入侧：客户手机号、身份证号等PII字段在送入LLM前必须脱敏'));
children.push(bullet('输出侧：LLM生成的数值必须与原始数据交叉校验，不一致则标记"待确认"'));
children.push(bullet('模型选择：境内部署的大模型，数据不出境'));
children.push(bullet('调用审计：每次LLM调用记录输入摘要、输出摘要、耗时，用于追溯'));

console.log('Part 5 done: 矩阵+数据流+系统能力');
// ===== 八、页面清单与原型设计 =====
children.push(h1('八、页面清单与原型设计'));

children.push(h2('8.1 原型设计清单'));
children.push(makeTable(
  ['序号', '页面', '原型深度', '说明'],
  [
    ['1', 'AI洞察报告主页（对话+预览）', 'L3 可交互原型', '核心交互页面，覆盖对话状态机、结构化组件、报告预览'],
    ['2', '报告中心（报告列表）', 'L2 高保真静态', '列表页，结构相对标准'],
    ['3', '模板管理中心', 'L2 高保真静态', '模板列表+模板详情'],
    ['4', '数据源管理', 'L2 高保真静态', '数据源列表+校验状态'],
    ['5', '洞察知识库', 'L2 高保真静态', '洞察记录列表+详情'],
    ['6', '全局浮动AI助手+入口交互', 'L2 高保真静态', '浮动按钮+侧边对话面板+上下文感知'],
  ]
));

children.push(h2('8.2 页面一：AI洞察报告主页'));
children.push(p('页面结构：左右分栏'));
children.push(p('左栏（约60%宽度）：报告预览区'));
children.push(bullet('顶部：报告标题（可编辑）+报告状态标识+模板名称+报告周期'));
children.push(bullet('正文区：按章节展示报告内容，每段左侧有状态标识条'));
children.push(bullet('底部：操作栏（继续追问/进入审核/导出）'));

children.push(p('右栏（约40%宽度）：对话区'));
children.push(bullet('顶部：对话标题区，显示当前状态（"需求收集""数据准备"等）'));
children.push(bullet('中部：对话消息流（系统消息+用户消息+结构化组件消息）'));
children.push(bullet('底部：输入区（文本输入框+快捷指令按钮+附件上传按钮）'));

children.push(p('关键交互：'));
children.push(bullet('1. 点击报告预览区的某段文字 → 右侧对话区自动带入该段上下文'));
children.push(bullet('2. 快捷指令按钮点击 → 输入框自动填入对应文本并发送'));
children.push(bullet('3. 结构化组件（关键发现卡片/匹配结果表/归因路径图）中点击操作按钮 → 执行对应动作'));
children.push(bullet('4. 数据匹配结果表中修改匹配 → 弹出匹配修改面板'));
children.push(bullet('5. 报告预览区直接点击文字 → 进入编辑模式，编辑后标记为"人工编辑"'));

children.push(h2('8.3 页面二：报告中心'));
children.push(p('页面结构：'));
children.push(bullet('顶部：页面标题"报告中心"+新建报告按钮+从模板创建按钮'));
children.push(bullet('筛选区：状态筛选+周期筛选+模板筛选+关键词搜索'));
children.push(bullet('列表区：表格展示，列=报告标题/状态/关联模板/报告周期/创建时间/最后编辑时间/创建人/操作'));
children.push(bullet('操作列：继续编辑（草稿）/审核（待审核）/查看（已定稿）/导出/在线分享/创建新版本/作废'));

children.push(h2('8.4 页面三：模板管理中心'));
children.push(p('页面结构：'));
children.push(bullet('顶部：页面标题"模板管理"+新建模板按钮+从历史报告提取按钮'));
children.push(bullet('筛选区：业务场景筛选+创建方式筛选+关键词搜索'));
children.push(bullet('列表区：卡片式展示，每张卡片=模板名称/适用场景/版本号/关联报告数/创建时间/操作'));
children.push(bullet('模板详情弹窗：展示章节结构树+数据需求清单+变量清单+定时生成配置'));

children.push(h2('8.5 页面四：数据源管理'));
children.push(p('页面结构：'));
children.push(bullet('顶部：页面标题"数据源管理"+上传数据按钮'));
children.push(bullet('筛选区：质量状态筛选+时间范围筛选'));
children.push(bullet('列表区：表格展示，列=数据源名称/上传时间/上传人/数据时间范围/关联报告数/质量状态/操作'));
children.push(bullet('数据源详情弹窗：基本信息+校验结果+数据列预览+关联报告'));

children.push(h2('8.6 页面五：洞察知识库'));
children.push(p('页面结构：'));
children.push(bullet('顶部：页面标题"洞察知识库"+手动记录洞察按钮'));
children.push(bullet('筛选区：场景标签筛选+指标筛选+关键词搜索'));
children.push(bullet('列表区：卡片式展示，每张卡片=洞察结论/关联指标/适用场景标签/来源报告/被引用次数'));
children.push(bullet('展开详情：完整的归因路径+证据链+数据时间范围+策略推荐'));

children.push(h2('8.7 页面六：全局浮动AI助手'));
children.push(p('入口定位：统一入口，上下文自动感知，不做各业务模块内单独放入口。'));

children.push(p('浮动按钮：平台所有页面右下角有一个AI助手图标，点击展开侧边对话面板。'));

children.push(p('浮动助手的能力边界：'));
children.push(makeTable(
  ['能做什么', '不做什么'],
  [
    ['快速问答："6月ARPU多少？""乌鲁木齐流量为什么下降？"', '不在侧边栏里展示完整报告'],
    ['发起报告："帮我生成6月经营分析报告"', '不做报告的逐段审核和编辑'],
    ['上下文感知：自动获取当前页面的指标/区域/时间信息', '不做复杂的数据匹配确认（空间不够）'],
    ['推送展示：展示未读的异动推送和报告到期提醒', ''],
    ['引导跳转：对话进入深度操作时，提示"展开到全屏继续"', ''],
  ]
));

children.push(p('浮动助手的上下文感知规则（含用户画像）：'));
children.push(makeTable(
  ['感知维度', '获取来源', '影响什么'],
  [
    ['当前页面信息', '用户正在浏览的页面', '自动获取指标/区域/时间上下文'],
    ['用户角色', '平台权限系统', '报告的默认区域范围（省公司=全疆，地市=本市）'],
    ['最近操作', '用户行为记录', '"您昨天在分析ARPU，是否继续？"'],
    ['常用模板', '使用频率统计', '首选推荐模板'],
    ['未完成任务', '待办系统', '"您有1份待审核报告"'],
  ]
));

children.push(p('从浮动助手跳转专属页面的时机：'));
children.push(bullet('用户说"帮我生成报告" → 浮动助手引导选择模板/指标 → 点击"开始生成" → 跳转专属页面'));
children.push(bullet('用户说"重点分析ARPU" → 浮动助手确认需求 → 点击"展开全屏编辑" → 跳转专属页面'));
children.push(bullet('收到推送通知后一键点击 → 跳转专属页面，AI已预填充上下文'));

children.push(p('导航菜单直接入口：'));
children.push(bullet('平台导航中增加"AI洞察报告"菜单项，直接进入专属页面'));

console.log('Part 6 done: 页面清单');
// ===== 九、学习反馈闭环（新增） =====
children.push(h1('九、学习反馈闭环'));

children.push(p('AI原生产品区别于传统产品的关键——产品会随使用而进化。用户的每一次编辑、删除、追问选择，都是宝贵的学习信号。'));

children.push(h2('9.1 反馈信号采集'));
children.push(makeTable(
  ['用户行为', '信号含义', '记录内容'],
  [
    ['编辑了AI生成的段落', 'AI生成内容有偏差', '编辑类型：修正数值/调整语调/删减冗余/补充遗漏'],
    ['删除了AI生成的段落', 'AI生成内容不可用', '删除原因标签：数据不准/结论不成立/不需要'],
    ['反复追问某类问题', '用户的分析偏好', '追问主题分布，下次生成时主动包含'],
    ['选择"替换原文"而非"追加"', '追问结果比原文更好', '替换频率和场景，优化生成策略'],
    ['拒绝策略推荐', '推荐策略不适用', '拒绝原因标签，优化策略匹配规则'],
    ['手动修改数据匹配', '自动匹配不准确', '匹配修正记录，优化匹配算法'],
  ]
));

children.push(h2('9.2 反馈应用'));
children.push(bullet('个人层面：根据用户行为优化该用户的生成偏好（如某用户偏好"通俗简明"语调，后续默认使用该语调）'));
children.push(bullet('全局层面：定期汇总反馈数据，用于优化提示词和叙述风格'));
children.push(bullet('知识库层面：高频被追问但未自动包含的分析角度，纳入模板默认大纲'));
children.push(bullet('策略层面：被多次拒绝的策略，标记为"低适用性"，降低推荐优先级'));

children.push(h2('9.3 隐私约束'));
children.push(bullet('反馈数据脱敏处理，不记录报告正文内容'));
children.push(bullet('个人偏好仅对该用户生效，不影响其他用户'));
children.push(bullet('全局优化需汇总至少50条同类型反馈后才生效'));

// ===== 十、异常场景处理 =====
children.push(h1('十、异常场景处理'));

children.push(makeTable(
  ['异常场景', '处理策略'],
  [
    ['LLM生成超时（单段落超过120秒）', '标注"该段落生成超时，已展示部分内容"，用户可选择重试或手动编辑'],
    ['LLM输出数值与原始数据不一致', '标注"待确认"，提示具体差异，不自动修正'],
    ['大文件上传中断', '支持断点续传；无法续传时提示重新上传，已匹配的数据保留'],
    ['数据源不可用（平台接口故障）', '提示"平台数据暂不可用，可通过上传文件提供数据"，自动切换到文件上传通道'],
    ['模板提取质量差（高置信度匹配低于30%）', '提示"该报告结构识别困难，建议手动创建模板或简化报告后重新提取"'],
    ['追问时归因引擎无结果', '明确告知"当前数据不足以支撑更深层的归因分析"，建议补充哪些数据'],
    ['同一报告并发操作', '乐观锁机制，后提交者收到冲突提示，选择覆盖或合并'],
    ['报告导出时数据已变更', '导出时锁定报告数据快照，导出内容与预览一致，不受后续数据变更影响'],
    ['口径不一致', '标注口径差异警告，用户确认后才可使用该数据源'],
    ['归因-策略匹配失败', '提示"建议将此归因结论录入根因库"，记录至洞察知识库'],
    ['推送过于频繁', '执行频率控制：每日每人不超5条，静默时段不推送'],
  ]
));

// ===== 十一、非功能需求 =====
children.push(h1('十一、非功能需求'));

children.push(makeTable(
  ['维度', '要求'],
  [
    ['数据安全', '客户级数据脱敏后才能送入LLM；导出文件加水印；操作审计日志'],
    ['权限控制', '省公司角色看全疆数据，地市角色看本市数据；模板和数据源按创建人权限管理'],
    ['性能基线', '普通报告生成3-5分钟；含深度归因的报告8-12分钟；对话响应首字延迟<3秒'],
    ['并发支持', '支持10个用户同时生成报告'],
    ['兼容性', 'Chrome 90+、Edge 90+；暂无移动端需求'],
    ['数据一致性', '平台数据与上传数据的口径差异必须明确标注，由用户确认选择'],
    ['口径可追溯', '报告中每个指标的数据来源和口径定义必须可追溯，附录提供完整口径清单'],
  ]
));

// ===== 十二、实施建议 =====
children.push(h1('十二、实施建议'));

children.push(h2('12.1 分期路线'));

children.push(pBold('一期（核心可用）：', ''));
children.push(bullet('对话式报告生成（需求收集→数据准备→大纲确认→报告生成→审核定稿）'));
children.push(bullet('模板管理（从零创建+从历史报告提取+变量机制+定时生成配置）'));
children.push(bullet('双通道数据（平台指标直连+文件上传+智能匹配+二维结构识别+口径校验）'));
children.push(bullet('归因分析引擎（前三层：分解+对比+区域，自动触发）'));
children.push(bullet('归因-策略联动（根因匹配+策略推荐）'));
children.push(bullet('报告导出（Word格式）'));
children.push(bullet('报告中心（列表+状态管理+版本管理）'));
children.push(bullet('全局浮动AI助手（上下文感知+快速问答+引导跳转）'));
children.push(bullet('智能洞察推送（指标异动+区域异常推送）'));

children.push(pBold('二期（深化能力）：', ''));
children.push(bullet('归因分析引擎深化（第四至六层：关联归因+客群归因+因果推断）'));
children.push(bullet('追问深化（对话中逐层下钻+结果嵌入）'));
children.push(bullet('洞察知识库（自动提取+关联推荐+根因库反馈）'));
children.push(bullet('结构化组件（关键发现卡片/归因路径图/数据匹配表）'));
children.push(bullet('导出增强（含附录导出+PDF格式）'));
children.push(bullet('报告分享与批注'));
children.push(bullet('学习反馈闭环'));
children.push(bullet('智能洞察推送增强（趋势预警+报告到期提醒）'));

children.push(pBold('三期（持续运营）：', ''));
children.push(bullet('数据源管理（校验+保留策略+质量监控）'));
children.push(bullet('报告版本管理增强（版本对比+历史追溯）'));
children.push(bullet('洞察知识库增强（相似场景推荐+归因模式挖掘）'));
children.push(bullet('多人协作（报告共享+评论批注）'));
children.push(bullet('浮动助手用户画像感知增强'));

children.push(h2('12.2 技术风险'));
children.push(makeTable(
  ['风险', '影响', '缓解措施'],
  [
    ['LLM生成内容与数据不一致', '报告准确性受损', '校验Agent自动交叉核对，不一致段落强制人工确认'],
    ['归因深度受数据限制', '第四至六层归因可能无结果', '明确预期：第四至六层为可选增强，非必须交付'],
    ['模板提取质量不稳定', '识别准确率受报告格式影响', '提供手动调整能力，不依赖100%自动识别'],
    ['大文件上传性能', '50MB文件解析可能较慢', '异步处理+进度展示，不阻塞对话'],
    ['口径不一致导致数据冲突', '报告结论可信度受质疑', '口径标注贯穿全流程，差异由用户确认'],
    ['归因-策略匹配准确率', '推荐策略可能不适用', '标注匹配依据，用户可选择拒绝并反馈原因'],
  ]
));

console.log('Part 7 done: 反馈+异常+非功能+实施');
const path = require('path');

// ===== 十三、与技术方案的深度融合 =====
children.push(h1('十三、与技术方案的深度融合'));

children.push(p('本章从六条主线逐条说清技术方案中的能力如何支撑产品功能，以及产品功能对技术实现的反向要求。不是映射表式的罗列，而是双向对齐的深度融合。'));

// --- 主线1 ---
children.push(h2('13.1 数据血缘追踪与归因证据链'));

children.push(pBold('核心关系', '：归因引擎产出的"证据链"，其技术基础就是数据血缘体系。血缘追踪记录了"数据从哪来、经过什么计算、得到什么结果"，归因引擎的每一层归因都依赖这个追踪能力来证明"结论是有依据的"。'));

children.push(pBold('三层血缘与五层归因的对应', ''));

children.push(makeTable(
  ['血缘层级', '血缘记录的内容', '对应的归因层级', '归因如何使用血缘'],
  [
    ['字段级血缘', '某指标的值由哪个源表、哪个字段、什么计算逻辑得出', '第一层（分解归因）', '分解归因需要知道指标的计算公式（如ARPU=收入/用户数），才能按构成维度拆解'],
    ['加工级血缘', '数据经过哪些ETL步骤、转换规则、聚合逻辑', '第二层（对比归因）+第三层（区域归因）', '对比和区域归因需要确认对比双方口径一致，口径一致性依赖加工级血缘的转换规则'],
    ['应用级血缘', '数据最终被哪些报表、模型、接口消费', '第四层（客群归因）+第五层（因果推断）', '客群归因和因果推断需要关联客群标签的数据来源，应用级血缘指明了标签从哪来'],
  ]
));

children.push(pBold('归因可审计性保障', ''));
children.push(bullet('每条归因结论必须附带血缘路径：从原始数据源→加工逻辑→聚合结果→归因计算→最终结论'));
children.push(bullet('报告导出时，附录中的"归因证据链"本质就是血缘路径的展示'));
children.push(bullet('用户追问"这个结论的依据是什么"时，系统展示的就是该结论的血缘路径'));

children.push(pBold('产品对血缘体系的反向要求', ''));
children.push(bullet('血缘体系必须支持"按指标查询血缘路径"的能力（归因引擎需要从指标出发向上溯源）'));
children.push(bullet('血缘体系必须记录"口径变更历史"（某指标口径从3月起调整了计算方式，归因时需要知道对比基期的口径是否一致）'));
children.push(bullet('血缘体系必须支持"血缘差异对比"（两个指标的血缘路径是否相同，口径是否一致）'));

// --- 主线2 ---
children.push(h2('13.2 对话状态机与LangGraph编排'));

children.push(pBold('核心关系', '：产品定义的6个对话状态，与技术方案的LangGraph Agent编排一一对应。状态之间的转换条件对应LangGraph的条件边，Agent的并行/串行编排对应用户感知的同步/异步响应。'));

children.push(pBold('状态转换与条件边', ''));
children.push(makeTable(
  ['产品状态转换', '触发条件（产品语言）', 'LangGraph条件边（技术实现）'],
  [
    ['需求收集→数据准备', '主题明确+时间确定+区域确定', '需求理解Agent输出包含topic+timeRange+region三个必要字段'],
    ['数据准备→大纲确认', '必需数据覆盖率100%或用户选择跳过', '数据加载Agent输出coverageRatio>=1.0或skipMissingData=true'],
    ['大纲确认→报告生成', '用户明确确认大纲', '用户消息中包含"确认"语义，或点击确认按钮触发webhook'],
    ['报告生成→追问深化', '所有章节生成完毕', '叙述生成Agent输出complete=true'],
    ['追问深化→审核定稿', '用户点击"进入审核"或超时30分钟', '超时定时器触发或用户主动触发'],
  ]
));

children.push(pBold('多Agent并行编排', ''));
children.push(p('报告生成阶段，归因引擎和叙述生成可以并行工作：'));
children.push(bullet('归因引擎先分析指标异动，产出归因结论（带置信度）'));
children.push(bullet('叙述生成Agent同时准备非归因段落的文字（如固定文字、数据填充）'));
children.push(bullet('归因结论产出后，叙述生成Agent将结论融入叙述段落'));
children.push(bullet('用户感知：看到"正在生成第X章…"的进度提示，不感知内部并行'));

children.push(pBold('状态回退与checkpoint', ''));
children.push(bullet('LangGraph每个状态节点执行完毕后保存checkpoint'));
children.push(bullet('追问深化→数据准备的回退：恢复到数据准备阶段的checkpoint，保留已有的对话历史'));
children.push(bullet('审核定稿→追问深化的回退：恢复到追问深化阶段的checkpoint'));
children.push(bullet('不支持跳层回退（如审核定稿→大纲确认），因为中间状态的数据可能已变化'));

children.push(pBold('对话中断恢复', ''));
children.push(bullet('用户关闭浏览器后，LangGraph的状态持久化到数据库'));
children.push(bullet('用户再次打开时，从最近的checkpoint恢复，对话区展示历史消息，预览区展示已生成内容'));
children.push(bullet('如果中断时正在执行Agent（如归因计算中），恢复后根据Agent是否完成决定：已完成则展示结果，未完成则提示"上次分析未完成，是否继续？"'));
children.push(bullet('checkpoint过期策略：草稿状态保留7天，已定稿报告永久保留'));

// --- 主线3 ---
children.push(h2('13.3 语义识别与模板提取'));

children.push(pBold('核心关系', '：产品功能"从历史报告提取模板"的技术实现路径，依赖技术方案的语义识别能力。需要说清从Word文件到可复用模板的每一步技术路径。'));

children.push(pBold('四步技术路径', ''));

children.push(makeTable(
  ['步骤', '技术动作', '产出', '产品呈现'],
  [
    ['第一步：Word结构解析', '解析Word文档的标题层级、段落、表格、图表，构建文档结构树', '结构化的文档树（标题→段落→表格→图表）', '向用户展示"已识别X个章节、Y个段落、Z个表格"'],
    ['第二步：段落类型识别', '对每个段落做分类：固定文字/数据引用/动态叙述/图表', '每个段落的类型标注+识别置信度', '按类型分色展示，低置信度的标黄请用户确认'],
    ['第三步：数据引用点标注', '识别段落中引用的数据（如"56.8元"→ARPU指标），标注引用关系', '数据引用点清单（引用内容+可能对应的指标+置信度）', '展示数据匹配结果表（之前方案中的三色分组）'],
    ['第四步：叙述风格推断', '分析动态叙述段落的语调、结构、常用句式，推断叙述风格配置', '叙述风格配置（语调+是否含策略建议+是否含风险提示）', '展示推断结果，用户可调整'],
  ]
));

children.push(pBold('产品对语义识别的反向要求', ''));
children.push(bullet('识别速度：20页以内的Word文件，5秒内完成结构解析，30秒内完成全部分析'));
children.push(bullet('准确率要求：段落类型识别准确率>=85%（低于此值时提示用户手动调整）'));
children.push(bullet('容错能力：非标准格式的Word（如没有用标题样式而是手动加粗的"标题"）也能识别，但标注为"低置信度"'));
children.push(bullet('增量调整：用户修改识别结果后（如把某个段落从"固定文字"改为"动态叙述"），系统记住该调整，后续类似格式自动应用'));

// --- 主线4 ---
children.push(h2('13.4 向量检索与洞察复用'));

children.push(pBold('核心关系', '：洞察知识库的"关联推荐"能力，技术实现依赖向量检索。需要定义嵌入策略、阈值、过滤机制和防路径依赖方案。'));

children.push(pBold('嵌入策略', ''));
children.push(p('推荐采用"组合嵌入"策略——将洞察结论、关联指标、场景标签组合后做嵌入，而非仅对结论文字做嵌入。原因：仅对结论做嵌入，"ARPU下降主因是低价值套餐"和"DOU上升主因是5G迁转"语义差异大，但都属"结构性变化"类洞察，组合嵌入可以捕获这种关联。'));

children.push(makeTable(
  ['嵌入字段', '权重', '说明'],
  [
    ['洞察结论', '50%', '核心语义，决定"说的是什么"'],
    ['关联指标', '30%', '决定"说的是哪个指标的事"'],
    ['场景标签', '20%', '决定"在什么场景下适用"'],
  ]
));

children.push(pBold('相似度阈值与过滤', ''));
children.push(bullet('召回阈值：0.7（低于0.7的不召回，避免噪音）'));
children.push(bullet('推荐阈值：0.85（高于0.85的自动注入LLM上下文，0.7-0.85的展示给用户"是否参考"）'));
children.push(bullet('时间衰减：超过6个月的洞察，相似度乘以0.8衰减系数；超过12个月的乘以0.5'));
children.push(bullet('过滤机制：排除来源报告与当前报告相同的洞察（避免重复引用自己的结论）'));

children.push(pBold('防路径依赖三道防线', ''));
children.push(bullet('第一道：标注来源。每次引用历史洞察时，向LLM明确标注"以下是历史参考，不等于当前结论"，防止LLM直接复用历史归因'));
children.push(bullet('第二道：多样性约束。每次检索返回的洞察中，归因路径相同的最多保留1条，强制展示不同的归因角度'));
children.push(bullet('第三道：新数据优先。当新数据的归因结果与历史洞察矛盾时，以新数据归因为准，历史洞察降级为"参考"'));
children.push(bullet('用户侧感知：对话中提示"历史上类似场景的分析结论为X，本次分析结论为Y，存在差异"，由用户判断'));

// --- 主线5 ---
children.push(h2('13.5 脱敏引擎与安全约束'));

children.push(pBold('核心关系', '：产品方案中定义的安全约束，需要技术方案的脱敏引擎来落地。需要明确脱敏的调用时机、粒度、反脱敏机制和审计日志范围。'));

children.push(pBold('脱敏调用时机', ''));
children.push(makeTable(
  ['时机', '触发条件', '脱敏内容', '目的'],
  [
    ['LLM调用前', '数据送入LLM之前', '客户手机号、身份证号、姓名、地址等PII字段', '防止PII泄露给大模型'],
    ['展示给用户前', '报告预览区、对话区展示内容时', '按用户权限脱敏（地市角色看不到其他地市的客户明细）', '权限隔离'],
    ['导出时', '生成Word/PDF文件时', '默认脱敏，如需完整数据需审批', '导出物安全'],
  ]
));

children.push(pBold('脱敏粒度规则', ''));
children.push(makeTable(
  ['数据类型', '脱敏方式', '示例'],
  [
    ['手机号', '保留前3后4，中间用*替换', '138****5678'],
    ['身份证号', '保留前3后4，中间用*替换', '650****1234'],
    ['客户姓名', '姓保留，名用*替换', '张**'],
    ['地址', '保留到区县级，具体门牌号用*替换', '乌鲁木齐市天山区***'],
    ['大额数值（如消费金额）', '不脱敏（非PII），但标注口径', '月消费128.5元'],
  ]
));

children.push(pBold('反脱敏机制', ''));
children.push(bullet('LLM生成内容中不会包含原始PII，因此不存在"反脱敏"需求'));
children.push(bullet('报告导出时，若用户有完整数据权限且通过审批，导出的报告中使用原始数据（非脱敏数据）'));
children.push(bullet('审批流程：导出含敏感数据报告→系统自动提交审批→数据安全管理员审批→生成含原始数据版本'));

children.push(pBold('审计日志', ''));
children.push(bullet('记录脱敏前的原始数据标识（不记录原始值，只记录"对某条记录的某字段执行了脱敏"）'));
children.push(bullet('记录LLM调用的输入摘要（脱敏后的文本摘要，非全文）和输出摘要'));
children.push(bullet('记录每次导出的文件标识、导出人、审批人、是否含敏感数据'));
children.push(bullet('审计日志保留3年，仅数据安全管理员可查看'));

// --- 主线6 ---
children.push(h2('13.6 工作流编排与用户无感'));

children.push(pBold('核心关系', '：技术方案的LangGraph工作流编排是底层引擎，用户不应感知Agent调度、并行执行、错误重试等技术细节。需要定义"技术概念→用户感知"的映射规则。'));

children.push(pBold('技术概念与用户感知映射', ''));
children.push(makeTable(
  ['技术概念', '用户感知', '说明'],
  [
    ['Agent调度', '对话状态推进', '用户看到"数据准备中""正在生成大纲"，不看到"数据加载Agent执行中"'],
    ['Agent并行执行', '进度提示', '用户看到"正在生成第3章（同时分析第4章归因）"，不看到"归因Agent和叙述Agent并行"'],
    ['Agent错误重试', '无感知', '内部重试最多3次，用户无感知；3次都失败才提示用户'],
    ['checkpoint保存', '无感知', '用户只感知到"关闭浏览器后可恢复"，不看到"已保存checkpoint"'],
    ['Agent超时', '友好的等待提示', '用户看到"分析需要更长时间，请稍候…"，不看到"Agent执行超时"'],
    ['降级策略', '部分功能不可用提示', '用户看到"深度归因暂时不可用，已展示基础分析结果"，不看到"L5 Agent调用失败"'],
  ]
));

children.push(pBold('错误信息转换规则', ''));
children.push(makeTable(
  ['技术错误', '用户看到的提示', '用户可操作'],
  [
    ['LLM API超时', '该段落生成时间较长，请稍候…', '等待/跳过该段落'],
    ['LLM返回格式异常', '该段落内容需要确认', '查看/编辑/重新生成'],
    ['数据加载失败', '部分数据暂时无法获取', '重试/跳过缺失数据'],
    ['归因计算超时', '深度分析需要更长时间', '等待/使用基础分析结果'],
    ['向量检索服务不可用', '历史洞察参考暂不可用', '不使用参考继续生成'],
    ['脱敏服务不可用', '安全校验中，请稍候', '等待（脱敏不可跳过）'],
  ]
));

children.push(pBold('降级策略', ''));
children.push(p('当技术组件不可用时，产品功能按以下优先级降级（从高到低），确保核心报告生成能力不受影响：'));
children.push(makeTable(
  ['降级优先级', '组件', '降级行为', '对用户的影响'],
  [
    ['1（最先降级）', '洞察知识库检索', '跳过历史洞察参考，AI基于当前数据独立分析', '分析可能缺少历史对比，但报告可正常生成'],
    ['2', '智能洞察推送', '暂停推送，用户需手动发起', '不会收到主动通知，但可正常使用'],
    ['3', '深度归因（第四至六层）', '仅执行前三层归因', '归因深度不够，但基础分析可用'],
    ['4', '模板自动提取', '提示用户手动创建模板', '需要更多手动操作'],
    ['5', '结构化组件（卡片/路径图）', '用纯文字替代结构化展示', '展示形式简化，信息不丢失'],
    ['6（最后降级）', 'LLM叙述生成', '不可降级，必须可用', '核心能力，不可替代'],
  ]
));

// === 生成文档 ===
const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children: children,
  }],
});

const outputPath = path.join(__dirname, '..', 'docs', '需求设计方案', 'AI洞察报告产品设计方案.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log('Document generated:', outputPath);
  console.log('Size:', (buffer.length / 1024).toFixed(1), 'KB');
  console.log('Total children:', children.length);
}).catch(err => {
  console.error('Error:', err);
});

console.log('Part 8 done: 技术融合+生成');
