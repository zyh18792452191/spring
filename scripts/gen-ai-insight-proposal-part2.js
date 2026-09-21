
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
