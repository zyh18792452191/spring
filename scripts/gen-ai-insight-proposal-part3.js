
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
