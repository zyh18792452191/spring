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
