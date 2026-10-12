// 策略中心 - 活动实例数据模型（全局活动 ID 贯穿全流程）
// 数据来源说明：原型演示数据；生产环境由诊断结论、策略制定、活动配置、调度派发、评估回流汇聚生成

export type ActivityStatus =
  | '洞察中'
  | '制定中'
  | '调度中'
  | '执行中'
  | '评估中'
  | '沉淀中'
  | '已闭环';

export type ActivityType = 'IOP普通营销' | '剧本营销' | '多波次营销';

export type TimelineNodeStatus = '完成' | '进行中' | '阻塞' | '未开始';

export type ActivityPriority = '高' | '中' | '低';

/** 活动全链路追踪时间轴节点 */
export interface TimelineNode {
  /** 所属中心 */
  center: '洞察中心' | '策略中心' | '调度中心' | '评估中心';
  /** 节点名 */
  nodeName: string;
  /** 节点发生时间 */
  time: string;
  /** 责任人 */
  owner: string;
  /** 产出物 */
  output: string;
  /** 节点状态 */
  status: TimelineNodeStatus;
  /** 可点击跳转路径 */
  link?: string;
}

/** 后评估配置（效果评估体系） */
export interface EvaluationConfig {
  /** 是否开启后评估 */
  enabled: boolean;
  /** 观察周期（自定义） */
  observationPeriod: string;
  /** 业务指标（自定义） */
  metrics: string[];
  /** 目标值 */
  targetValue: string;
  /** 是否开启干预/未干预客群对比 */
  compareIntervention: boolean;
}

/** 目标客群 */
export interface TargetGroup {
  id: string;
  name: string;
  scale: number;
}

/** 活动实例 */
export interface ActivityInstance {
  /** 全局活动 ID */
  id: string;
  name: string;
  /** 关联策略 ID */
  relatedStrategyId: string;
  /** 关联诊断 ID */
  relatedDiagnosisId: string;
  /** 业务场景 */
  scenario: string;
  /** 目标客群 */
  targetGroup: TargetGroup;
  /** 活动类型 */
  type: ActivityType;
  /** 触达渠道 */
  channels: string[];
  /** 营销话术 */
  scripts: string[];
  /** 推荐产品 */
  products: string[];
  /** 优先级 */
  priority: ActivityPriority;
  /** 要求完成时间 */
  deadline: string;
  /** 后评估配置 */
  evaluationConfig: EvaluationConfig;
  /** 活动状态 */
  status: ActivityStatus;
  /** 负责人 */
  owner: string;
  /** 创建时间 */
  createdAt: string;
  /** 全链路时间轴 */
  timeline: TimelineNode[];
}

/** 活动状态流转顺序 */
export const ACTIVITY_STATUS_LIST: ActivityStatus[] = [
  '洞察中',
  '制定中',
  '调度中',
  '执行中',
  '评估中',
  '沉淀中',
  '已闭环',
];

/** 活动类型列表 */
export const ACTIVITY_TYPE_LIST: ActivityType[] = ['IOP普通营销', '剧本营销', '多波次营销'];

/** 业务场景列表 */
export const ACTIVITY_SCENARIO_LIST = [
  '流量运营',
  '中高端客户运营',
  '离网维系',
  '家庭融合运营',
  '国际业务运营',
  '增量运营',
];

/** 状态对应样式（Tailwind 类） */
export const ACTIVITY_STATUS_STYLE: Record<ActivityStatus, string> = {
  洞察中: 'bg-sky-100 text-sky-700',
  制定中: 'bg-indigo-100 text-indigo-700',
  调度中: 'bg-amber-100 text-amber-700',
  执行中: 'bg-blue-100 text-blue-700',
  评估中: 'bg-violet-100 text-violet-700',
  沉淀中: 'bg-teal-100 text-teal-700',
  已闭环: 'bg-emerald-100 text-emerald-700',
};

/** 活动实例演示数据（覆盖 7 个状态，支撑生命周期看板与全链路追踪） */
export const ACTIVITY_INSTANCES: ActivityInstance[] = [
  {
    id: 'ACT-2026-0828-001',
    name: '乌鲁木齐 5G 套餐渗透率升档攻坚活动',
    relatedStrategyId: 'STR-2026-0301',
    relatedDiagnosisId: 'DG-20260828-001',
    scenario: '流量运营',
    targetGroup: { id: 'GRP-650100-01', name: '乌鲁木齐中低端 5G 终端已具备未升档客户', scale: 48620 },
    type: '多波次营销',
    channels: ['短信', '外呼', '企业微信'],
    scripts: ['首波·权益告知话术', '次波·限时升档礼包话术'],
    products: ['5G 升档包 30 元/月', '5G 畅享包 50 元/月'],
    priority: '高',
    deadline: '2026-09-15',
    evaluationConfig: {
      enabled: true,
      observationPeriod: '活动结束后 30 天',
      metrics: ['5G套餐渗透率', '办理量', 'ARPU'],
      targetValue: '渗透率 ≥ 70%',
      compareIntervention: true,
    },
    status: '执行中',
    owner: '张耀辉',
    createdAt: '2026-08-28 09:30',
    timeline: [
      { center: '洞察中心', nodeName: '指标异常检测', time: '2026-08-28 09:10', owner: 'AI 指标诊断', output: '5G套餐渗透率 62.4%，低于目标 70%', status: '完成', link: '/workspace/insight/alert/ai-monitor' },
      { center: '策略中心', nodeName: '接收/受理诊断', time: '2026-08-28 09:30', owner: '张耀辉', output: '承接诊断结论 DG-20260828-001', status: '完成', link: '/workspace/strategy/receive-diagnosis' },
      { center: '策略中心', nodeName: '历史效果参照', time: '2026-08-28 09:45', owner: '张耀辉', output: '命中相似策略 3 条', status: '完成', link: '/workspace/strategy/matching' },
      { center: '策略中心', nodeName: 'AI 定策与比选', time: '2026-08-28 10:20', owner: '张耀辉', output: '选定方案 B（多波次）', status: '完成', link: '/workspace/strategy/matching' },
      { center: '策略中心', nodeName: '活动配置', time: '2026-08-28 11:00', owner: '张耀辉', output: '生成活动实例 ACT-2026-0828-001', status: '完成', link: '/workspace/strategy/activity-config' },
      { center: '策略中心', nodeName: '策略审批', time: '2026-08-28 14:00', owner: '李经理', output: '审批通过', status: '完成', link: '/workspace/strategy/approval' },
      { center: '调度中心', nodeName: '派发配置', time: '2026-08-28 15:00', owner: '调度中心', output: '派发至 IOP 触点，生成工单', status: '完成', link: '/portal/capability/dispatch/overview' },
      { center: '调度中心', nodeName: '执行监控', time: '2026-08-28 16:00', owner: '调度中心', output: '触达进行中，触达率 46%', status: '进行中', link: '/portal/capability/dispatch/overview' },
      { center: '评估中心', nodeName: '效果评估', time: '—', owner: '评估中心', output: '待执行完成', status: '未开始', link: '/portal/capability/evaluation/strategy' },
      { center: '策略中心', nodeName: 'AI 复盘', time: '—', owner: '策略中心', output: '待评估完成', status: '未开始', link: '/workspace/strategy-repository/effect' },
    ],
  },
  {
    id: 'ACT-2026-0827-002',
    name: '克拉玛依宽带续费保有专项活动',
    relatedStrategyId: 'STR-2026-0288',
    relatedDiagnosisId: 'DG-20260828-002',
    scenario: '家庭融合运营',
    targetGroup: { id: 'GRP-650200-01', name: '克拉玛依到期前 15 天未续费客户', scale: 12380 },
    type: 'IOP普通营销',
    channels: ['短信', '掌厅'],
    scripts: ['续费礼包话术'],
    products: ['宽带续费年包'],
    priority: '中',
    deadline: '2026-09-20',
    evaluationConfig: {
      enabled: true,
      observationPeriod: '活动结束后 15 天',
      metrics: ['宽带续费率', '办理量'],
      targetValue: '续费率 ≥ 88%',
      compareIntervention: true,
    },
    status: '评估中',
    owner: '王芳',
    createdAt: '2026-08-27 10:00',
    timeline: [
      { center: '洞察中心', nodeName: '根因诊断分析', time: '2026-08-27 09:12', owner: '指标树诊断', output: '宽带续费率 81.2%，低于目标 88%', status: '完成' },
      { center: '策略中心', nodeName: '接收/受理诊断', time: '2026-08-27 09:30', owner: '王芳', output: '承接诊断结论 DG-20260828-002', status: '完成' },
      { center: '策略中心', nodeName: '活动配置', time: '2026-08-27 11:00', owner: '王芳', output: '生成活动实例 ACT-2026-0827-002', status: '完成' },
      { center: '策略中心', nodeName: '策略审批', time: '2026-08-27 14:00', owner: '李经理', output: '审批通过', status: '完成' },
      { center: '调度中心', nodeName: '派发配置', time: '2026-08-27 15:00', owner: '调度中心', output: '派发至 IOP 触点', status: '完成' },
      { center: '调度中心', nodeName: '执行监控', time: '2026-08-28 18:00', owner: '调度中心', output: '执行完成，触达率 88.1%', status: '完成' },
      { center: '评估中心', nodeName: '效果评估', time: '2026-08-28 19:00', owner: '评估中心', output: '续费率 82.4%，达成率 92.3%', status: '进行中' },
      { center: '策略中心', nodeName: 'AI 复盘', time: '—', owner: '策略中心', output: '待评估完成', status: '未开始' },
    ],
  },
  {
    id: 'ACT-2026-0826-003',
    name: '高价值客户离网挽留权益活动',
    relatedStrategyId: 'STR-2026-0266',
    relatedDiagnosisId: 'DG-20260827-008',
    scenario: '离网维系',
    targetGroup: { id: 'GRP-650100-02', name: '乌鲁木齐异网流量激增高价值客户', scale: 8640 },
    type: '剧本营销',
    channels: ['外呼', '短信'],
    scripts: ['第一幕·关怀触达', '第二幕·权益挽留'],
    products: ['专属权益包'],
    priority: '高',
    deadline: '2026-09-10',
    evaluationConfig: {
      enabled: true,
      observationPeriod: '活动结束后 45 天',
      metrics: ['离网率', '留存率'],
      targetValue: '离网率 ≤ 1.1%',
      compareIntervention: true,
    },
    status: '沉淀中',
    owner: '赵敏',
    createdAt: '2026-08-26 15:00',
    timeline: [
      { center: '洞察中心', nodeName: '根因诊断分析', time: '2026-08-27 17:05', owner: 'AI 指标诊断', output: '离网率 1.32%，高于目标 1.1%', status: '完成' },
      { center: '策略中心', nodeName: '接收/受理诊断', time: '2026-08-27 17:30', owner: '赵敏', output: '承接诊断结论 DG-20260827-008', status: '完成' },
      { center: '策略中心', nodeName: 'AI 定策与比选', time: '2026-08-27 18:00', owner: '赵敏', output: '选定剧本营销方案', status: '完成' },
      { center: '策略中心', nodeName: '活动配置', time: '2026-08-27 18:30', owner: '赵敏', output: '生成活动实例 ACT-2026-0826-003', status: '完成' },
      { center: '策略中心', nodeName: '策略审批', time: '2026-08-27 19:00', owner: '李经理', output: '审批通过', status: '完成' },
      { center: '调度中心', nodeName: '派发配置', time: '2026-08-27 20:00', owner: '调度中心', output: '派发至外呼触点', status: '完成' },
      { center: '调度中心', nodeName: '执行监控', time: '2026-08-28 20:00', owner: '调度中心', output: '执行完成', status: '完成' },
      { center: '评估中心', nodeName: '效果评估', time: '2026-08-29 09:00', owner: '评估中心', output: '离网率降至 1.12%', status: '完成' },
      { center: '策略中心', nodeName: 'AI 复盘', time: '2026-08-29 10:00', owner: '赵敏', output: '复盘报告已生成，模板候选 2 条', status: '进行中' },
    ],
  },
  {
    id: 'ACT-2026-0820-004',
    name: '家庭宽带融合升档专项活动',
    relatedStrategyId: 'STR-2026-0211',
    relatedDiagnosisId: 'DG-20260826-004',
    scenario: '家庭融合运营',
    targetGroup: { id: 'GRP-650300-01', name: '吐鲁番单卡客户', scale: 23150 },
    type: 'IOP普通营销',
    channels: ['短信'],
    scripts: ['融合升档话术'],
    products: ['家庭融合套餐'],
    priority: '中',
    deadline: '2026-09-05',
    evaluationConfig: {
      enabled: true,
      observationPeriod: '活动结束后 30 天',
      metrics: ['融合套餐渗透率'],
      targetValue: '渗透率 ≥ 65%',
      compareIntervention: false,
    },
    status: '已闭环',
    owner: '陈晨',
    createdAt: '2026-08-20 09:00',
    timeline: [
      { center: '洞察中心', nodeName: '指标异常检测', time: '2026-08-26 15:22', owner: '指标树诊断', output: '融合套餐渗透率 58.7%', status: '完成' },
      { center: '策略中心', nodeName: '接收/受理诊断', time: '2026-08-26 16:00', owner: '陈晨', output: '承接诊断结论 DG-20260826-004', status: '完成' },
      { center: '策略中心', nodeName: '活动配置', time: '2026-08-26 17:00', owner: '陈晨', output: '生成活动实例 ACT-2026-0820-004', status: '完成' },
      { center: '策略中心', nodeName: '策略审批', time: '2026-08-26 18:00', owner: '李经理', output: '审批通过', status: '完成' },
      { center: '调度中心', nodeName: '派发配置', time: '2026-08-26 19:00', owner: '调度中心', output: '派发至短信触点', status: '完成' },
      { center: '调度中心', nodeName: '执行监控', time: '2026-08-27 19:00', owner: '调度中心', output: '执行完成', status: '完成' },
      { center: '评估中心', nodeName: '效果评估', time: '2026-08-28 09:00', owner: '评估中心', output: '渗透率 60.2%', status: '完成' },
      { center: '策略中心', nodeName: 'AI 复盘', time: '2026-08-28 11:00', owner: '陈晨', output: '已沉淀模板与最佳实践', status: '完成' },
    ],
  },
  {
    id: 'ACT-2026-0829-005',
    name: '国际漫游高流量客户权益推荐活动',
    relatedStrategyId: 'STR-2026-0333',
    relatedDiagnosisId: 'DG-20260828-003',
    scenario: '国际业务运营',
    targetGroup: { id: 'GRP-650100-03', name: '乌鲁木齐国际漫游高流量客户', scale: 3260 },
    type: '剧本营销',
    channels: ['外呼'],
    scripts: ['漫游权益推荐剧本'],
    products: ['国际漫游流量包'],
    priority: '低',
    deadline: '2026-09-25',
    evaluationConfig: {
      enabled: true,
      observationPeriod: '活动结束后 30 天',
      metrics: ['国际漫游办理量'],
      targetValue: '办理量 ≥ 800',
      compareIntervention: true,
    },
    status: '制定中',
    owner: '张耀辉',
    createdAt: '2026-08-29 09:00',
    timeline: [
      { center: '洞察中心', nodeName: '指标异常检测', time: '2026-08-28 09:15', owner: 'AI 指标诊断', output: '中高端客户保有率 94.6%', status: '完成' },
      { center: '策略中心', nodeName: '接收/受理诊断', time: '2026-08-29 09:00', owner: '张耀辉', output: '承接诊断结论 DG-20260828-003', status: '完成' },
      { center: '策略中心', nodeName: '历史效果参照', time: '进行中', owner: '张耀辉', output: '正在匹配相似策略', status: '进行中' },
      { center: '策略中心', nodeName: 'AI 定策与比选', time: '—', owner: '张耀辉', output: '待完成', status: '未开始' },
    ],
  },
];

/** 活动状态流转（用于审批、追踪等页面的状态推进模拟） */
export function getNextStatus(status: ActivityStatus): ActivityStatus | null {
  const idx = ACTIVITY_STATUS_LIST.indexOf(status);
  if (idx < 0 || idx >= ACTIVITY_STATUS_LIST.length - 1) return null;
  return ACTIVITY_STATUS_LIST[idx + 1];
}

/** 根据状态获取活动数量 */
export function countByStatus(list: ActivityInstance[]): Record<ActivityStatus, number> {
  const result = {} as Record<ActivityStatus, number>;
  ACTIVITY_STATUS_LIST.forEach((s) => {
    result[s] = list.filter((item) => item.status === s).length;
  });
  return result;
}

