
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
