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
