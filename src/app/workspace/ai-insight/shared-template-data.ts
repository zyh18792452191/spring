/**
 * 共享数据 - AI洞察报告模块各页面共用
 */

export interface TemplateSection {
  id: string;
  title: string;
  children?: TemplateSection[];
  paragraphs: {
    type: 'fixed' | 'data' | 'narrative' | 'chart';
    label: string;
    description?: string;
  }[];
}

export interface SharedTemplate {
  id: string;
  name: string;
  tags: string[];
  version: string;
  /** 章节名称列表（从 sections 中提取的平铺标题） */
  chapters: string[];
  sections: TemplateSection[];
  /** 已生成报告数 */
  reportCount: number;
  createdAt: string;
  source: 'extract' | 'create' | 'ai';
}

export const sharedTemplates: SharedTemplate[] = [
  {
    id: 't1', name: '月度经营分析报告', tags: ['月度', '经营分析'], version: 'v2.1',
    chapters: ['经营概览', '重点指标分析', '区域对比', '策略建议'],
    reportCount: 8, createdAt: '2026-01-15', source: 'extract',
    sections: [
      { id: 's1', title: '一、整体经营概况', paragraphs: [{ type: 'fixed', label: '章节概述文字' }, { type: 'data', label: '核心指标卡片（移动ARPU/用户数/DOU/收入）' }, { type: 'narrative', label: '整体趋势分析', description: '语调：专业严谨，含策略建议' }] },
      { id: 's2', title: '二、重点指标分析', children: [
        { id: 's2-1', title: '2.1 流量运营', paragraphs: [{ type: 'data', label: '流量指标数据' }, { type: 'narrative', label: '流量趋势与归因', description: '含归因分析' }] },
        { id: 's2-2', title: '2.2 ARPU分析', paragraphs: [{ type: 'data', label: 'ARPU指标数据' }, { type: 'chart', label: 'ARPU趋势折线图' }, { type: 'narrative', label: 'ARPU归因分析' }] },
        { id: 's2-3', title: '2.3 用户发展', paragraphs: [{ type: 'data', label: '用户发展指标' }, { type: 'narrative', label: '用户增长分析' }] },
      ], paragraphs: [] },
      { id: 's3', title: '三、区域对比', paragraphs: [{ type: 'data', label: '16地市排名表' }, { type: 'chart', label: '地市对比柱状图' }, { type: 'narrative', label: '区域差异分析' }] },
      { id: 's4', title: '四、策略建议', paragraphs: [{ type: 'narrative', label: '策略建议', description: '语调：管理层摘要，含策略建议+风险提示' }] },
    ],
  },
  {
    id: 't2', name: '专项分析报告', tags: ['专项', '通用'], version: 'v1.0',
    chapters: ['分析背景与目标', '数据概览', '归因分析', '策略建议'],
    reportCount: 3, createdAt: '2026-03-20', source: 'create',
    sections: [
      { id: 's1', title: '一、分析背景与目标', paragraphs: [{ type: 'fixed', label: '分析背景说明' }, { type: 'narrative', label: '分析目标' }] },
      { id: 's2', title: '二、数据概览', paragraphs: [{ type: 'data', label: '核心指标数据' }, { type: 'chart', label: '趋势图' }] },
      { id: 's3', title: '三、归因分析', paragraphs: [{ type: 'narrative', label: '归因分析', description: '含归因+置信度' }] },
      { id: 's4', title: '四、策略建议', paragraphs: [{ type: 'narrative', label: '策略建议' }] },
    ],
  },
  {
    id: 't3', name: '季度回顾报告', tags: ['季度', '经营分析'], version: 'v1.3',
    chapters: ['季度总览', 'KPI达成', '趋势变化', '下季展望'],
    reportCount: 2, createdAt: '2026-02-01', source: 'extract',
    sections: [
      { id: 's1', title: '一、季度总览', paragraphs: [{ type: 'data', label: '季度核心指标' }, { type: 'narrative', label: '季度综述' }] },
      { id: 's2', title: '二、KPI达成情况', paragraphs: [{ type: 'data', label: 'KPI达成率' }, { type: 'chart', label: 'KPI达成雷达图' }] },
      { id: 's3', title: '三、趋势变化', paragraphs: [{ type: 'chart', label: '月度趋势图' }, { type: 'narrative', label: '趋势分析' }] },
      { id: 's4', title: '四、下季展望', paragraphs: [{ type: 'narrative', label: '下季度展望与策略', description: '语调：前瞻性建议' }] },
    ],
  },
  {
    id: 't4', name: '流量运营专项分析', tags: ['专项', '流量运营'], version: 'v1.2',
    chapters: ['流量概览', 'DOU分析', '流量价值', '提速建议'],
    reportCount: 5, createdAt: '2026-04-10', source: 'create',
    sections: [
      { id: 's1', title: '一、流量概览', paragraphs: [{ type: 'data', label: '流量核心指标' }, { type: 'narrative', label: '流量态势总览' }] },
      { id: 's2', title: '二、DOU分析', paragraphs: [{ type: 'data', label: 'DOU指标' }, { type: 'chart', label: 'DOU趋势图' }, { type: 'narrative', label: 'DOU归因' }] },
      { id: 's3', title: '三、流量价值', paragraphs: [{ type: 'data', label: '量收剪刀差' }, { type: 'narrative', label: '流量价值评估' }] },
      { id: 's4', title: '四、提速建议', paragraphs: [{ type: 'narrative', label: '提速建议' }] },
    ],
  },
  {
    id: 't5', name: '宽带业务分析', tags: ['专项', '家庭运营'], version: 'v1.0',
    chapters: ['宽带概览', '新增与流失', 'ARPU分析', '竞品对比'],
    reportCount: 1, createdAt: '2026-06-01', source: 'extract',
    sections: [
      { id: 's1', title: '一、宽带概览', paragraphs: [{ type: 'data', label: '宽带核心指标' }, { type: 'narrative', label: '宽带业务总览' }] },
      { id: 's2', title: '二、新增与流失', paragraphs: [{ type: 'data', label: '新增/流失数据' }, { type: 'chart', label: '新增流失趋势图' }] },
      { id: 's3', title: '三、ARPU分析', paragraphs: [{ type: 'data', label: '宽带ARPU' }, { type: 'narrative', label: 'ARPU分析' }] },
      { id: 's4', title: '四、竞品对比', paragraphs: [{ type: 'narrative', label: '竞品对比与建议' }] },
    ],
  },
  {
    id: 't6', name: '风险预警报告', tags: ['风险预警', '通用'], version: 'v1.0',
    chapters: ['预警概览', '风险清单', '影响评估', '处置建议'],
    reportCount: 1, createdAt: '2026-05-15', source: 'extract',
    sections: [
      { id: 's1', title: '一、预警概览', paragraphs: [{ type: 'data', label: '预警统计' }, { type: 'narrative', label: '预警总览' }] },
      { id: 's2', title: '二、风险清单', paragraphs: [{ type: 'data', label: '风险明细表' }, { type: 'narrative', label: '风险分类说明' }] },
      { id: 's3', title: '三、影响评估', paragraphs: [{ type: 'narrative', label: '影响评估' }] },
      { id: 's4', title: '四、处置建议', paragraphs: [{ type: 'narrative', label: '处置建议' }] },
    ],
  },
  {
    id: 't7', name: '中高端客户运营分析', tags: ['专项', '中高端客户运营'], version: 'v1.1',
    chapters: ['客户概览', '保有分析', '价值提升', '流失预警'],
    reportCount: 2, createdAt: '2026-05-01', source: 'create',
    sections: [
      { id: 's1', title: '一、客户概览', paragraphs: [{ type: 'data', label: '中高端客户核心指标' }, { type: 'narrative', label: '客户结构总览' }] },
      { id: 's2', title: '二、保有分析', paragraphs: [{ type: 'data', label: '保有率数据' }, { type: 'chart', label: '保有率趋势图' }] },
      { id: 's3', title: '三、价值提升', paragraphs: [{ type: 'narrative', label: '价值提升路径' }] },
      { id: 's4', title: '四、流失预警', paragraphs: [{ type: 'data', label: '流失预警名单' }, { type: 'narrative', label: '预警策略' }] },
    ],
  },
  {
    id: 't8', name: '离网维系效果分析', tags: ['专项', '离网维系'], version: 'v1.0',
    chapters: ['离网概况', '维系效果', '策略复盘', '优化建议'],
    reportCount: 1, createdAt: '2026-04-20', source: 'extract',
    sections: [
      { id: 's1', title: '一、离网概况', paragraphs: [{ type: 'data', label: '离网核心指标' }, { type: 'narrative', label: '离网态势' }] },
      { id: 's2', title: '二、维系效果', paragraphs: [{ type: 'data', label: '维系成功率' }, { type: 'chart', label: '维系效果趋势图' }] },
      { id: 's3', title: '三、策略复盘', paragraphs: [{ type: 'narrative', label: '维系策略复盘' }] },
      { id: 's4', title: '四、优化建议', paragraphs: [{ type: 'narrative', label: '优化建议' }] },
    ],
  },
];

/* ─── 报告数据 ─── */

export type ReportStatus = 'draft' | 'final' | 'archived';

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  status: 'confirmed' | 'pending' | 'edited' | 'removed';
  paragraphs?: { id: string; content: string; type: 'text' | 'data' | 'chart'; status: 'confirmed' | 'pending' | 'edited' | 'deleted'; algorithmSource?: string }[];
}

export interface Report {
  id: string;
  title: string;
  status: ReportStatus;
  templateName: string;
  period: string;
  createdAt: string;
  updatedAt: string;
  creator: string;
  sections?: ReportSection[];
}

export const sharedReports: Report[] = [
  { id: 'r1', title: '6月经营分析报告', status: 'draft', templateName: '月度经营分析报告 v2.1', period: '2026年6月', createdAt: '06-28 14:30', updatedAt: '06-29 09:15', creator: '张三',
    sections: [
      { id: 's1-1', title: '业务总览', content: '6月整体业务保持稳健增长，收入同比增长5.2%，环比增长1.8%。移动用户净增12.3万户，5G渗透率达到68.5%。', status: 'confirmed' },
      { id: 's1-2', title: '收入分析', content: '主营业务收入82.6亿元，其中移动收入占比62%，宽带收入占比23%，政企收入占比15%。ARPU值43.2元，同比提升0.8元。', status: 'pending' },
      { id: 's1-3', title: '用户发展', content: '移动用户总数1856万户，5G用户1272万户。本月净增用户中5G套餐占比92%。中高端用户保有率96.3%。', status: 'pending' },
    ] },
  { id: 'r2', title: '5月经营分析报告', status: 'final', templateName: '月度经营分析报告 v2.1', period: '2026年5月', createdAt: '05-28 10:00', updatedAt: '05-30 16:20', creator: '张三',
    sections: [
      { id: 's2-1', title: '业务总览', content: '5月整体业务运行平稳，收入同比增长4.8%，环比增长1.2%。移动用户净增10.8万户，5G渗透率达到66.2%。', status: 'confirmed' },
      { id: 's2-2', title: '收入分析', content: '主营业务收入81.2亿元，移动收入同比增长3.5%，宽带收入同比增长6.1%。ARPU值42.4元，环比微降0.3元。', status: 'confirmed' },
      { id: 's2-3', title: '用户发展', content: '移动用户总数1843万户，5G用户1219万户。中高端用户保有率95.8%，离网率1.2%。', status: 'confirmed' },
      { id: 's2-4', title: '竞争态势', content: '竞品A推出低价套餐抢占市场份额，需关注中低端用户流失风险。本地市场份额稳定在58.3%。', status: 'confirmed' },
      { id: 's2-5', title: '结论与建议', content: '建议加大5G套餐推广力度，针对中高端用户推出专属权益包，加强竞品应对策略。', status: 'confirmed' },
    ] },
  { id: 'r3', title: '5G渗透率提升专项分析', status: 'draft', templateName: '专项分析报告 v1.0', period: '2026年Q2', createdAt: '06-25 10:15', updatedAt: '06-27 14:00', creator: '李四',
    sections: [
      { id: 's3-1', title: '5G渗透现状', content: '当前5G渗透率68.5%，距离年度目标75%仍有6.5个百分点差距。Q2渗透率提升3.2个百分点，慢于预期。', status: 'confirmed' },
      { id: 's3-2', title: '提升瓶颈分析', content: '未迁转用户中，42%因终端不支持5G，28%因套餐资费偏高，18%因覆盖感知不佳，12%无明确原因。', status: 'pending' },
      { id: 's3-3', title: '策略建议', content: '建议分三类用户精准施策：终端换机用户推送购机补贴、资费敏感用户推荐低档5G套餐、覆盖感知用户优先安排网络优化。', status: 'pending' },
    ] },
  { id: 'r4', title: '宽带业务分析报告', status: 'final', templateName: '', period: '2026年H1', createdAt: '06-20 09:00', updatedAt: '06-22 11:30', creator: '王五',
    sections: [
      { id: 's4-1', title: '宽带业务总览', content: 'H1宽带用户净增18.6万户，完成全年目标的62%。千兆宽带用户占比提升至35.8%。', status: 'confirmed' },
      { id: 's4-2', title: '收入与ARPU', content: '宽带业务收入19.2亿元，同比增长6.1%。千兆用户ARPU 98元，百兆用户ARPU 56元，融合用户ARPU 128元。', status: 'confirmed' },
    ] },
  { id: 'r5', title: '4月经营分析报告', status: 'final', templateName: '月度经营分析报告 v2.0', period: '2026年4月', createdAt: '04-27 15:00', updatedAt: '04-29 17:45', creator: '张三' },
  { id: 'r6', title: '3月经营分析报告', status: 'final', templateName: '月度经营分析报告 v2.0', period: '2026年3月', createdAt: '03-28 10:30', updatedAt: '03-31 12:00', creator: '张三' },
  { id: 'r7', title: '流量运营专项分析', status: 'archived', templateName: '专项分析报告 v1.0', period: '2026年Q1', createdAt: '03-15 09:00', updatedAt: '04-01 10:00', creator: '赵六' },
  { id: 'r8', title: '2月经营分析报告', status: 'final', templateName: '月度经营分析报告 v1.5', period: '2026年2月', createdAt: '02-26 14:00', updatedAt: '02-28 16:30', creator: '张三' },
  { id: 'r9', title: '离网客户预警分析', status: 'draft', templateName: '', period: '2026年6月', createdAt: '06-30 08:45', updatedAt: '06-30 09:00', creator: '李四' },
  { id: 'r10', title: '中高端客户保有分析', status: 'draft', templateName: '专项分析报告 v1.0', period: '2026年Q2', createdAt: '06-18 11:00', updatedAt: '06-25 15:20', creator: '王五' },
  { id: 'r11', title: '1月经营分析报告', status: 'final', templateName: '月度经营分析报告 v1.5', period: '2026年1月', createdAt: '01-28 10:00', updatedAt: '01-30 14:00', creator: '张三' },
  { id: 'r12', title: '渠道效能分析报告', status: 'final', templateName: '', period: '2025年H2', createdAt: '12-25 09:00', updatedAt: '12-28 11:00', creator: '赵六' },
];
