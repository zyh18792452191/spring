
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
