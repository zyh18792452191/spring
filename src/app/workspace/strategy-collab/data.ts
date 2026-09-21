/**
 * 跨中心协作（§10）演示数据
 * 覆盖：与洞察中心 / 调度中心 / 评估中心 / 知识中心的协作内容
 */

/* ========== 10.1 与洞察中心协作 ========== */

export interface InsightIndicatorTemplate {
  id: string;
  name: string;
  scenario: string;
  indicatorCount: number;
  source: string;
  refCount: number;
  updatedAt: string;
  /** 是否已被策略引用 */
  cited: boolean;
}

export const INSIGHT_INDICATOR_TEMPLATES: InsightIndicatorTemplate[] = [
  { id: 'IT-001', name: '流量运营核心指标树', scenario: '流量运营', indicatorCount: 18, source: '洞察中心·指标树模板', refCount: 26, updatedAt: '2026-08-28 09:20', cited: true },
  { id: 'IT-002', name: '存量保有指标树', scenario: '离网维系', indicatorCount: 24, source: '洞察中心·指标树模板', refCount: 19, updatedAt: '2026-08-26 15:40', cited: true },
  { id: 'IT-003', name: '中高端客户价值指标树', scenario: '中高端客户运营', indicatorCount: 16, source: '洞察中心·指标树模板', refCount: 12, updatedAt: '2026-08-25 11:05', cited: false },
  { id: 'IT-004', name: '家庭融合指标树', scenario: '家庭融合运营', indicatorCount: 14, source: '洞察中心·指标树模板', refCount: 9, updatedAt: '2026-08-22 16:30', cited: false },
  { id: 'IT-005', name: '国际业务指标树', scenario: '国际业务运营', indicatorCount: 11, source: '洞察中心·指标树模板', refCount: 5, updatedAt: '2026-08-20 10:15', cited: false },
];

export interface ReceivedDiagnosis {
  id: string;
  indicatorName: string;
  scenario: string;
  rootCause: string;
  strategyCount: number;
  receivedAt: string;
  status: '待接收' | '已接收';
}

export const RECEIVED_DIAGNOSIS_LIST: ReceivedDiagnosis[] = [
  { id: 'DG-20260828-01', indicatorName: '5G套餐办理量', scenario: '流量运营', rootCause: '竞品低价套餐分流，5G升档触点覆盖不足', strategyCount: 3, receivedAt: '2026-08-28 09:35', status: '待接收' },
  { id: 'DG-20260828-02', indicatorName: '宽带续费率', scenario: '家庭融合运营', rootCause: '到期提醒触达不及时，续费权益吸引力不足', strategyCount: 2, receivedAt: '2026-08-28 09:32', status: '待接收' },
  { id: 'DG-20260827-03', indicatorName: '中高端客户离网率', scenario: '离网维系', rootCause: '近三月投诉未解决，客户满意度下降', strategyCount: 4, receivedAt: '2026-08-27 17:50', status: '已接收' },
  { id: 'DG-20260827-04', indicatorName: '家庭组网渗透率', scenario: '家庭融合运营', rootCause: '装维环节未同步推荐组网服务', strategyCount: 1, receivedAt: '2026-08-27 15:10', status: '已接收' },
];

export interface AiInsightReport {
  id: string;
  title: string;
  scenario: string;
  generatedAt: string;
  sections: number;
  /** 是否已在策略制定中引用 */
  cited: boolean;
}

export const AI_INSIGHT_REPORTS: AiInsightReport[] = [
  { id: 'AIR-20260828-01', title: '乌鲁木齐8月流量经营异动归因分析报告', scenario: '流量运营', generatedAt: '2026-08-28 08:50', sections: 6, cited: true },
  { id: 'AIR-20260827-02', title: '宽带到期客户保有专题分析报告', scenario: '家庭融合运营', generatedAt: '2026-08-27 16:20', sections: 5, cited: true },
  { id: 'AIR-20260826-03', title: '中高端客户价值波动分析报告', scenario: '中高端客户运营', generatedAt: '2026-08-26 14:05', sections: 7, cited: false },
  { id: 'AIR-20260825-04', title: '校园市场增量机会洞察报告', scenario: '增量运营', generatedAt: '2026-08-25 10:40', sections: 4, cited: false },
];

/* ========== 10.2 与调度中心协作 ========== */

export interface DispatchedOrder {
  id: string;
  strategyName: string;
  workOrderType: string;
  channel: string;
  dispatchedAt: string;
  targetCount: number;
  playedCount: number;
  status: string;
  progress: number;
  abnormal: string | null;
}

export const DISPATCHED_ORDERS: DispatchedOrder[] = [
  { id: 'WO-20260828-0012', strategyName: '5G套餐升档策略', workOrderType: '策略调度', channel: 'IOP', dispatchedAt: '2026-08-28 09:40', targetCount: 8600, playedCount: 4120, status: '执行中', progress: 48, abnormal: null },
  { id: 'WO-20260828-0013', strategyName: '宽带到期续费策略', workOrderType: '策略调度', channel: '网格通', dispatchedAt: '2026-08-28 09:45', targetCount: 3200, playedCount: 980, status: '执行中', progress: 31, abnormal: '执行进度低于预期' },
  { id: 'WO-20260827-0014', strategyName: '中高端客户关怀策略', workOrderType: '策略调度', channel: '剧本营销', dispatchedAt: '2026-08-27 14:20', targetCount: 2100, playedCount: 2100, status: '已完成', progress: 100, abnormal: null },
  { id: 'WO-20260827-0015', strategyName: '低零流量唤醒策略', workOrderType: '指标调度', channel: 'IOP', dispatchedAt: '2026-08-27 11:10', targetCount: 15000, playedCount: 0, status: '待执行', progress: 0, abnormal: '待执行超时未启动' },
  { id: 'WO-20260826-0016', strategyName: '融合套餐升级策略', workOrderType: '策略调度', channel: '网格通', dispatchedAt: '2026-08-26 16:35', targetCount: 5400, playedCount: 5400, status: '已完成', progress: 100, abnormal: null },
  { id: 'WO-20260826-0017', strategyName: '校园流量包推荐策略', workOrderType: '客群调度', channel: 'IOP', dispatchedAt: '2026-08-26 10:05', targetCount: 7600, playedCount: 2300, status: '已终止', progress: 30, abnormal: '策略调整后终止执行' },
];

/* ========== 10.3 与评估中心协作 ========== */

export type HealthLevel = 'green' | 'yellow' | 'red';

export interface StrategyEvaluationSummary {
  id: string;
  strategyId: string;
  strategyName: string;
  dispatchTime: string;
  reachRate: number;
  dealRate: number;
  achievementRate: number;
  improvement: string;
  health: HealthLevel;
}

export const EVALUATION_SUMMARIES: StrategyEvaluationSummary[] = [
  { id: 'EV-001', strategyId: 'STR-2026-0001', strategyName: '5G套餐升档策略', dispatchTime: '2026-08-20', reachRate: 92, dealRate: 18.6, achievementRate: 88, improvement: '+6.2%', health: 'green' },
  { id: 'EV-002', strategyId: 'STR-2026-0002', strategyName: '宽带到期续费策略', dispatchTime: '2026-08-19', reachRate: 88, dealRate: 11.2, achievementRate: 72, improvement: '+2.4%', health: 'yellow' },
  { id: 'EV-003', strategyId: 'STR-2026-0003', strategyName: '中高端客户关怀策略', dispatchTime: '2026-08-18', reachRate: 95, dealRate: 22.4, achievementRate: 91, improvement: '+8.1%', health: 'green' },
  { id: 'EV-004', strategyId: 'STR-2026-0004', strategyName: '低零流量唤醒策略', dispatchTime: '2026-08-16', reachRate: 63, dealRate: 4.8, achievementRate: 52, improvement: '-1.3%', health: 'red' },
  { id: 'EV-005', strategyId: 'STR-2026-0005', strategyName: '融合套餐升级策略', dispatchTime: '2026-08-15', reachRate: 90, dealRate: 15.4, achievementRate: 79, improvement: '+3.7%', health: 'yellow' },
];

export interface HealthAlert {
  id: string;
  strategyId: string;
  strategyName: string;
  level: HealthLevel;
  metric: string;
  message: string;
  time: string;
}

export const HEALTH_ALERTS: HealthAlert[] = [
  { id: 'HA-001', strategyId: 'STR-2026-0004', strategyName: '低零流量唤醒策略', level: 'red', metric: '办理率', message: '办理率 4.8%，连续两个评估周期低于阈值 8%，建议调整推荐产品与话术', time: '2026-08-28 09:00' },
  { id: 'HA-002', strategyId: 'STR-2026-0002', strategyName: '宽带到期续费策略', level: 'yellow', metric: '达成率', message: '达成率 72%，接近下限阈值 75%，建议关注续费权益吸引力', time: '2026-08-27 09:00' },
  { id: 'HA-003', strategyId: 'STR-2026-0005', strategyName: '融合套餐升级策略', level: 'yellow', metric: '触达率', message: '触达率 90% 但办理率 15.4%，转化链路存在断点，建议排查触点配置', time: '2026-08-26 09:00' },
];

export interface AlertSubscription {
  id: string;
  strategyId: string;
  strategyName: string;
  threshold: string;
  channel: string;
  createdAt: string;
  enabled: boolean;
}

export const ALERT_SUBSCRIPTIONS: AlertSubscription[] = [
  { id: 'SUB-001', strategyId: 'STR-2026-0004', strategyName: '低零流量唤醒策略', threshold: '办理率 < 8%', channel: '站内消息 + 邮件', createdAt: '2026-08-26 10:20', enabled: true },
  { id: 'SUB-002', strategyId: 'STR-2026-0002', strategyName: '宽带到期续费策略', threshold: '达成率 < 75%', channel: '站内消息', createdAt: '2026-08-24 15:45', enabled: true },
];

/* ========== 10.4 与知识中心协作 ========== */

export interface KnowledgeReference {
  id: string;
  title: string;
  category: string;
  refCount: number;
  status: '已上架' | '未上架';
  lastRefAt: string;
}

export const KNOWLEDGE_REFERENCES: KnowledgeReference[] = [
  { id: 'KN-001', title: '5G套餐升档营销话术（标准版）', category: '营销话术', refCount: 38, status: '已上架', lastRefAt: '2026-08-28 09:15' },
  { id: 'KN-002', title: '宽带续费权益说明手册', category: '操作手册', refCount: 26, status: '已上架', lastRefAt: '2026-08-27 16:40' },
  { id: 'KN-003', title: '中高端客户关怀案例集', category: '策略案例', refCount: 21, status: '已上架', lastRefAt: '2026-08-27 11:20' },
  { id: 'KN-004', title: '低零流量客户唤醒成功案例', category: '策略案例', refCount: 17, status: '未上架', lastRefAt: '2026-08-28 08:55' },
  { id: 'KN-005', title: '校园市场流量包推广话术', category: '营销话术', refCount: 12, status: '未上架', lastRefAt: '2026-08-26 14:30' },
  { id: 'KN-006', title: '融合套餐升级操作指引', category: '操作手册', refCount: 9, status: '未上架', lastRefAt: '2026-08-25 10:05' },
];

export interface KnowledgeGap {
  id: string;
  title: string;
  refCount: number;
  suggestion: string;
}

export const KNOWLEDGE_GAPS: KnowledgeGap[] = [
  { id: 'GAP-001', title: '低零流量客户唤醒成功案例', refCount: 17, suggestion: '被策略频繁引用但尚未上架，建议录入知识库并申请审核' },
  { id: 'GAP-002', title: '校园市场流量包推广话术', refCount: 12, suggestion: '一线使用频率较高，建议补充完整话术模板后上架' },
  { id: 'GAP-003', title: '融合套餐升级操作指引', refCount: 9, suggestion: '操作步骤缺少截图说明，建议完善后再提交审核' },
];
