// 策略沉淀模块数据底座
// 覆盖：效果库（9.1）/ 最佳实践（9.2）/ 策略版本（9.3）/ 模板管理（9.4）
// 数据来源说明：原型演示数据，生产环境由策略中心执行数据、评估中心评估结果、工单中心派发记录汇聚生成

export type HealthLevel = 'green' | 'yellow' | 'red';

/** 评估摘要五指标（派发量/完成率/触达率/成功率/AI采纳率） */
export interface EffectSummary {
  /** 派发量（户） */
  dispatchVolume: number;
  /** 完成率 */
  completionRate: number;
  /** 触达率 */
  touchRate: number;
  /** 成功率 */
  successRate: number;
  /** AI 采纳率 */
  aiAdoptionRate: number;
}

export interface EffectRecord {
  id: string;
  /** 策略 ID */
  strategyId: string;
  /** 策略名称 */
  strategyName: string;
  /** 业务场景（可多选） */
  scenarios: string[];
  /** 派发时间 */
  dispatchTime: string;
  /** 下发规模（户） */
  scale: number;
  /** 触达率 % */
  touchRate: number;
  /** 办理率 % */
  dealRate: number;
  /** 达成率 %：(current - base) / (target - base) * 100 */
  achievementRate: number;
  baseValue: number;
  currentValue: number;
  targetValue: number;
  /** 改善幅度（正向指标 当前 - 基期） */
  improvement: number;
  /** 指标单位 */
  unit: string;
  /** 评估摘要（五项指标健康度） */
  summary: EffectSummary;
  /** 综合健康度 */
  health: HealthLevel;
  /** 来源工单 */
  workOrderId: string;
}

export const EFFECT_RECORDS: EffectRecord[] = [
  {
    id: 'EFF-202605-001',
    strategyId: 'STR-2026-0101',
    strategyName: '乌鲁木齐流量升档精准推荐策略',
    scenarios: ['流量运营'],
    dispatchTime: '2026-05-06 09:30',
    scale: 48620,
    touchRate: 92.4,
    dealRate: 18.7,
    achievementRate: 86.5,
    baseValue: 12.4,
    currentValue: 15.8,
    targetValue: 16.3,
    improvement: 3.4,
    unit: 'GB/户',
    summary: { dispatchVolume: 48620, completionRate: 86.5, touchRate: 92.4, successRate: 18.7, aiAdoptionRate: 74.2 },
    health: 'green',
    workOrderId: 'IND-2026-0506-012',
  },
  {
    id: 'EFF-202605-002',
    strategyId: 'STR-2026-0108',
    strategyName: '中高端客户宽带续费保有策略',
    scenarios: ['中高端客户运营', '家庭融合运营'],
    dispatchTime: '2026-05-08 14:00',
    scale: 12380,
    touchRate: 88.1,
    dealRate: 42.3,
    achievementRate: 91.2,
    baseValue: 61.5,
    currentValue: 72.8,
    targetValue: 73.9,
    improvement: 11.3,
    unit: '%',
    summary: { dispatchVolume: 12380, completionRate: 91.2, touchRate: 88.1, successRate: 42.3, aiAdoptionRate: 68.5 },
    health: 'green',
    workOrderId: 'STR-2026-0508-004',
  },
  {
    id: 'EFF-202605-003',
    strategyId: 'STR-2026-0115',
    strategyName: '高价值客户离网挽留专属权益策略',
    scenarios: ['离网维系'],
    dispatchTime: '2026-05-11 10:15',
    scale: 8640,
    touchRate: 79.6,
    dealRate: 21.4,
    achievementRate: 68.3,
    baseValue: 3.2,
    currentValue: 4.1,
    targetValue: 4.5,
    improvement: 0.9,
    unit: '分',
    summary: { dispatchVolume: 8640, completionRate: 68.3, touchRate: 79.6, successRate: 21.4, aiAdoptionRate: 55.8 },
    health: 'yellow',
    workOrderId: 'CG-OP-2026-0511-007',
  },
  {
    id: 'EFF-202605-004',
    strategyId: 'STR-2026-0122',
    strategyName: '家庭宽带融合升档策略',
    scenarios: ['家庭融合运营', '流量运营'],
    dispatchTime: '2026-05-13 16:45',
    scale: 23150,
    touchRate: 90.2,
    dealRate: 15.8,
    achievementRate: 54.7,
    baseValue: 48.6,
    currentValue: 52.1,
    targetValue: 55.0,
    improvement: 3.5,
    unit: '元/户',
    summary: { dispatchVolume: 23150, completionRate: 54.7, touchRate: 90.2, successRate: 15.8, aiAdoptionRate: 41.3 },
    health: 'red',
    workOrderId: 'GOD-2026-0513-019',
  },
  {
    id: 'EFF-202605-005',
    strategyId: 'STR-2026-0130',
    strategyName: '国际漫游高流量客户权益推荐',
    scenarios: ['国际业务运营'],
    dispatchTime: '2026-05-15 11:20',
    scale: 3260,
    touchRate: 85.7,
    dealRate: 27.9,
    achievementRate: 78.4,
    baseValue: 6.8,
    currentValue: 8.9,
    targetValue: 9.5,
    improvement: 2.1,
    unit: 'GB/户',
    summary: { dispatchVolume: 3260, completionRate: 78.4, touchRate: 85.7, successRate: 27.9, aiAdoptionRate: 63.1 },
    health: 'yellow',
    workOrderId: 'STR-2026-0515-002',
  },
  {
    id: 'EFF-202605-006',
    strategyId: 'STR-2026-0142',
    strategyName: '低零流量客户唤醒策略',
    scenarios: ['流量运营'],
    dispatchTime: '2026-05-18 09:00',
    scale: 64800,
    touchRate: 94.1,
    dealRate: 11.2,
    achievementRate: 88.9,
    baseValue: 0.6,
    currentValue: 1.4,
    targetValue: 1.5,
    improvement: 0.8,
    unit: 'GB/户',
    summary: { dispatchVolume: 64800, completionRate: 88.9, touchRate: 94.1, successRate: 11.2, aiAdoptionRate: 70.4 },
    health: 'green',
    workOrderId: 'RAS-2026-0518-003',
  },
  {
    id: 'EFF-202605-007',
    strategyId: 'STR-2026-0155',
    strategyName: '存量客户套餐升档策略',
    scenarios: ['中高端客户运营'],
    dispatchTime: '2026-05-20 15:30',
    scale: 18920,
    touchRate: 87.3,
    dealRate: 24.6,
    achievementRate: 82.1,
    baseValue: 32.5,
    currentValue: 37.9,
    targetValue: 39.0,
    improvement: 5.4,
    unit: '元/户',
    summary: { dispatchVolume: 18920, completionRate: 82.1, touchRate: 87.3, successRate: 24.6, aiAdoptionRate: 66.9 },
    health: 'green',
    workOrderId: 'COD-2026-0520-011',
  },
  {
    id: 'EFF-202605-008',
    strategyId: 'STR-2026-0163',
    strategyName: '宽带到期客户续约策略',
    scenarios: ['离网维系', '家庭融合运营'],
    dispatchTime: '2026-05-22 10:40',
    scale: 21570,
    touchRate: 83.5,
    dealRate: 35.2,
    achievementRate: 73.6,
    baseValue: 58.2,
    currentValue: 64.8,
    targetValue: 67.0,
    improvement: 6.6,
    unit: '%',
    summary: { dispatchVolume: 21570, completionRate: 73.6, touchRate: 83.5, successRate: 35.2, aiAdoptionRate: 58.7 },
    health: 'yellow',
    workOrderId: 'IND-2026-0522-008',
  },
  {
    id: 'EFF-202605-009',
    strategyId: 'STR-2026-0171',
    strategyName: '增量客户首充引导策略',
    scenarios: ['增量运营'],
    dispatchTime: '2026-05-25 13:15',
    scale: 15240,
    touchRate: 91.8,
    dealRate: 46.3,
    achievementRate: 94.5,
    baseValue: 22.1,
    currentValue: 31.6,
    targetValue: 32.2,
    improvement: 9.5,
    unit: '%',
    summary: { dispatchVolume: 15240, completionRate: 94.5, touchRate: 91.8, successRate: 46.3, aiAdoptionRate: 72.8 },
    health: 'green',
    workOrderId: 'STR-2026-0525-005',
  },
  {
    id: 'EFF-202605-010',
    strategyId: 'STR-2026-0184',
    strategyName: '中高端客户权益升级策略',
    scenarios: ['中高端客户运营'],
    dispatchTime: '2026-05-27 09:50',
    scale: 9860,
    touchRate: 86.4,
    dealRate: 29.8,
    achievementRate: 64.2,
    baseValue: 4.6,
    currentValue: 5.3,
    targetValue: 5.7,
    improvement: 0.7,
    unit: '项',
    summary: { dispatchVolume: 9860, completionRate: 64.2, touchRate: 86.4, successRate: 29.8, aiAdoptionRate: 52.4 },
    health: 'yellow',
    workOrderId: 'CG-OP-2026-0527-014',
  },
  {
    id: 'EFF-202605-011',
    strategyId: 'STR-2026-0192',
    strategyName: '网格通套餐推荐标准化策略',
    scenarios: ['流量运营', '增量运营'],
    dispatchTime: '2026-05-28 14:25',
    scale: 42360,
    touchRate: 89.6,
    dealRate: 20.1,
    achievementRate: 79.8,
    baseValue: 28.4,
    currentValue: 33.2,
    targetValue: 34.5,
    improvement: 4.8,
    unit: '元/户',
    summary: { dispatchVolume: 42360, completionRate: 79.8, touchRate: 89.6, successRate: 20.1, aiAdoptionRate: 61.2 },
    health: 'yellow',
    workOrderId: 'RAS-2026-0528-006',
  },
  {
    id: 'EFF-202605-012',
    strategyId: 'STR-2026-0205',
    strategyName: '存量客户流量包推荐策略',
    scenarios: ['流量运营'],
    dispatchTime: '2026-05-30 11:05',
    scale: 36780,
    touchRate: 93.2,
    dealRate: 16.4,
    achievementRate: 90.6,
    baseValue: 9.8,
    currentValue: 13.6,
    targetValue: 14.0,
    improvement: 3.8,
    unit: 'GB/户',
    summary: { dispatchVolume: 36780, completionRate: 90.6, touchRate: 93.2, successRate: 16.4, aiAdoptionRate: 69.3 },
    health: 'green',
    workOrderId: 'IND-2026-0530-021',
  },
];

/** 最佳实践评审状态：候选→评审中→已发布→已归档（由评审动作驱动，非采纳次数推导） */
export type ReviewStatus = 'candidate' | 'reviewing' | 'published' | 'archived';

/** 评审记录（评审人 + 结论 + 意见） */
export interface ReviewRecord {
  /** 评审人姓名 */
  reviewer: string;
  /** 评审角色（按业务场景路由） */
  role: string;
  /** 评审结论 */
  result: 'approve' | 'reject';
  /** 评审意见 */
  opinion: string;
  /** 评审时间 */
  at: string;
}

/** 评审人路由：按业务场景路由到对应运营专家 */
export const REVIEWER_ROUTING: Record<string, { reviewer: string; role: string }> = {
  '流量运营': { reviewer: '张伟', role: '流量运营专家' },
  '离网维系': { reviewer: '刘敏', role: '客户运营中心专家' },
  '家庭融合运营': { reviewer: '陈晨', role: '家庭业务部专家' },
  '中高端客户运营': { reviewer: '王强', role: '客户运营中心专家' },
  '国际业务运营': { reviewer: '李娜', role: '国际业务部专家' },
  '增量运营': { reviewer: '赵磊', role: '渠道运营部专家' },
};

/** 审定发布人（市场部策略负责人，评审通过后终审发布） */
export const FINAL_APPROVER = { reviewer: '周伟民', role: '市场部策略负责人' };

/** 最佳实践 */
export interface BestPractice {
  id: string;
  title: string;
  category: string;
  summary: string;
  scenario: string;
  relatedStrategies: number;
  adoptionCount: number;
  publishedAt: string;
  author: string;
  /** 评审状态（由评审动作驱动，非采纳次数推导） */
  reviewStatus: ReviewStatus;
  /** 达成率 %（来源：策略效果库） */
  achievementRate: number;
  /** 改善幅度（百分点，来源：策略效果库） */
  improvement: number;
  /** 评审记录（历史评审意见） */
  reviewRecords: ReviewRecord[];
}

export const BEST_PRACTICES: BestPractice[] = [
  {
    id: 'BP-001',
    title: '流量达量预警客群的高转化升档打法',
    category: '流量运营',
    summary: '针对月度流量使用率达 85% 以上的客户，在账期前 5 天通过短信 + 网格人员外呼双通道触达，推荐升档套餐并附赠流量权益，实测办理率提升 6.2pp。',
    scenario: '流量运营',
    relatedStrategies: 4,
    adoptionCount: 26,
    publishedAt: '2026-05-12',
    author: '市场部·策略组',
    reviewStatus: 'reviewing',
    achievementRate: 86.5,
    improvement: 3.4,
    reviewRecords: [],
  },
  {
    id: 'BP-002',
    title: '高价值客户离网前置挽留组合拳',
    category: '离网维系',
    summary: '对离网评分高于阈值的客户，先由 AI 生成个性化挽留话术，再由专属客户经理在 24 小时内完成触达，权益发放与话术绑定，挽留成功率提升 9.1pp。',
    scenario: '离网维系',
    relatedStrategies: 3,
    adoptionCount: 19,
    publishedAt: '2026-05-14',
    author: '客户运营中心',
    reviewStatus: 'reviewing',
    achievementRate: 88.1,
    improvement: 9.1,
    reviewRecords: [],
  },
  {
    id: 'BP-003',
    title: '宽带到期续约的分层权益设计',
    category: '家庭融合运营',
    summary: '按在网时长与带宽档位分层设计续约权益，在网 3 年以上客户给予免费提速，其余客户采用话费抵扣，续约达成率稳定在 35% 以上。',
    scenario: '家庭融合运营',
    relatedStrategies: 5,
    adoptionCount: 31,
    publishedAt: '2026-05-16',
    author: '家庭业务部',
    reviewStatus: 'published',
    achievementRate: 91.2,
    improvement: 6.6,
    reviewRecords: [
      { reviewer: '陈晨', role: '家庭业务部专家', result: 'approve', opinion: '续约权益分层清晰，达成率与改善幅度双优，同意发布。', at: '2026-05-17 10:20' },
    ],
  },
  {
    id: 'BP-004',
    title: '低零流量客户唤醒的轻触达策略',
    category: '流量运营',
    summary: '面向连续两月流量使用低于 1GB 的客户，采用短信 + APP 弹窗轻触达并附赠 1GB 体验流量，避免频繁打扰，唤醒成功率 11.2%，投诉零增长。',
    scenario: '流量运营',
    relatedStrategies: 2,
    adoptionCount: 14,
    publishedAt: '2026-05-18',
    author: '市场部·策略组',
    reviewStatus: 'candidate',
    achievementRate: 88.9,
    improvement: 3.1,
    reviewRecords: [],
  },
  {
    id: 'BP-005',
    title: '中高端客户权益升级的顾问式营销',
    category: '中高端客户运营',
    summary: '由专属客户经理以顾问视角解读权益价值，配套一页纸权益对比图，权益升级办理率提升至 29.8%。',
    scenario: '中高端客户运营',
    relatedStrategies: 3,
    adoptionCount: 22,
    publishedAt: '2026-05-20',
    author: '客户运营中心',
    reviewStatus: 'reviewing',
    achievementRate: 82.1,
    improvement: 5.4,
    reviewRecords: [],
  },
  {
    id: 'BP-006',
    title: '国际漫游客户的出行前预触达',
    category: '国际业务运营',
    summary: '识别有出境行为的客户后，在出行前 3 天推送漫游流量包与资费说明，转化率 27.9%，同时降低出境高额资费投诉。',
    scenario: '国际业务运营',
    relatedStrategies: 2,
    adoptionCount: 9,
    publishedAt: '2026-05-22',
    author: '国际业务部',
    reviewStatus: 'candidate',
    achievementRate: 81.0,
    improvement: 3.2,
    reviewRecords: [],
  },
  {
    id: 'BP-007',
    title: '增量客户首充引导的入网即触达',
    category: '增量运营',
    summary: '新入网客户在激活后 2 小时内完成首充引导触达，配合首充赠费权益，首充率提升至 46.3%。',
    scenario: '增量运营',
    relatedStrategies: 3,
    adoptionCount: 17,
    publishedAt: '2026-05-24',
    author: '渠道运营部',
    reviewStatus: 'reviewing',
    achievementRate: 94.5,
    improvement: 9.5,
    reviewRecords: [],
  },
  {
    id: 'BP-008',
    title: '网格通标准化推荐话术落地经验',
    category: '流量运营',
    summary: '将高频推荐场景固化为网格通标准话术卡片，一线人员一键调用，话术使用率 89.6%，推荐成功率提升 4.8pp。',
    scenario: '流量运营',
    relatedStrategies: 6,
    adoptionCount: 35,
    publishedAt: '2026-05-26',
    author: '网格运营部',
    reviewStatus: 'published',
    achievementRate: 89.6,
    improvement: 4.8,
    reviewRecords: [
      { reviewer: '张伟', role: '流量运营专家', result: 'approve', opinion: '话术标准化落地效果好，一线复用率高，同意发布。', at: '2026-05-27 09:30' },
    ],
  },
];

/** 策略版本 */
export interface StrategyVersion {
  id: string;
  version: string;
  strategyId: string;
  strategyName: string;
  changeSummary: string;
  changedBy: string;
  changedAt: string;
  /** 用于版本对比的字段快照 */
  snapshot: {
    scenario: string;
    content: string;
    products: string;
    script: string;
  };
}

export const STRATEGY_VERSIONS: StrategyVersion[] = [
  {
    id: 'VER-001',
    version: 'V3.2',
    strategyId: 'STR-2026-0101',
    strategyName: '乌鲁木齐流量升档精准推荐策略',
    changeSummary: '优化触达话术，新增 5G 权益卖点；推荐产品由 30GB 档调整为 40GB 档',
    changedBy: '张伟',
    changedAt: '2026-05-06 09:12',
    snapshot: {
      scenario: '流量运营',
      content: '针对流量使用率达 85% 的客户推荐 40GB 升档套餐，配套 5G 权益卖点',
      products: '5G 畅享套餐 40GB',
      script: '您好，您的本月流量已使用 85%，推荐升级 40GB 套餐，额外赠送 5G 极速权益',
    },
  },
  {
    id: 'VER-002',
    version: 'V3.1',
    strategyId: 'STR-2026-0101',
    strategyName: '乌鲁木齐流量升档精准推荐策略',
    changeSummary: '调整目标客群为流量使用率 ≥ 80%，补充网格人员外呼渠道',
    changedBy: '李娜',
    changedAt: '2026-04-22 15:40',
    snapshot: {
      scenario: '流量运营',
      content: '针对流量使用率达 80% 的客户推荐 30GB 升档套餐',
      products: '5G 畅享套餐 30GB',
      script: '您好，您的本月流量已使用 80%，推荐升级 30GB 套餐',
    },
  },
  {
    id: 'VER-003',
    version: 'V2.0',
    strategyId: 'STR-2026-0101',
    strategyName: '乌鲁木齐流量升档精准推荐策略',
    changeSummary: '策略首次配置完成并上架',
    changedBy: '张伟',
    changedAt: '2026-03-18 11:05',
    snapshot: {
      scenario: '流量运营',
      content: '针对流量使用率达 80% 的客户推荐 20GB 升档套餐',
      products: '5G 畅享套餐 20GB',
      script: '您好，您的本月流量即将用完，推荐升级 20GB 套餐',
    },
  },
  {
    id: 'VER-004',
    version: 'V2.4',
    strategyId: 'STR-2026-0108',
    strategyName: '中高端客户宽带续费保有策略',
    changeSummary: '续费权益分层调整：在网 3 年以上客户免费提速至 500M',
    changedBy: '王强',
    changedAt: '2026-05-08 13:26',
    snapshot: {
      scenario: '中高端客户运营 / 家庭融合运营',
      content: '宽带到期前 15 天启动续费触达，按在网时长分层给权益',
      products: '宽带续费包 500M',
      script: '尊敬的客户，您的宽带到期待续约，续约可免费提速至 500M',
    },
  },
  {
    id: 'VER-005',
    version: 'V1.8',
    strategyId: 'STR-2026-0115',
    strategyName: '高价值客户离网挽留专属权益策略',
    changeSummary: '挽留话术增加客户流失原因针对性回应',
    changedBy: '刘敏',
    changedAt: '2026-05-11 09:50',
    snapshot: {
      scenario: '离网维系',
      content: '对离网评分 ≥ 0.7 的客户提供专属挽留权益',
      products: '专属流量权益包',
      script: '我们关注到您的使用变化，为您准备了专属权益，可为您减免部分费用',
    },
  },
  {
    id: 'VER-006',
    version: 'V1.5',
    strategyId: 'STR-2026-0115',
    strategyName: '高价值客户离网挽留专属权益策略',
    changeSummary: '策略试运行版本，仅覆盖乌鲁木齐主城区',
    changedBy: '刘敏',
    changedAt: '2026-04-28 16:20',
    snapshot: {
      scenario: '离网维系',
      content: '对离网评分 ≥ 0.7 的客户提供通用挽留权益',
      products: '通用流量包',
      script: '为您推荐当前更优惠的套餐',
    },
  },
  {
    id: 'VER-007',
    version: 'V2.2',
    strategyId: 'STR-2026-0122',
    strategyName: '家庭宽带融合升档策略',
    changeSummary: '调整融合升档门槛，单独宽带客户优先推荐融合套餐',
    changedBy: '陈晨',
    changedAt: '2026-05-13 16:10',
    snapshot: {
      scenario: '家庭融合运营 / 流量运营',
      content: '对单独宽带用户推荐融合套餐，提升户均 ARPU',
      products: '家庭融合套餐 千兆',
      script: '办理融合套餐，手机宽带一起优惠，月省 30 元',
    },
  },
  {
    id: 'VER-008',
    version: 'V1.0',
    strategyId: 'STR-2026-0142',
    strategyName: '低零流量客户唤醒策略',
    changeSummary: '策略首次创建',
    changedBy: '赵磊',
    changedAt: '2026-05-18 08:40',
    snapshot: {
      scenario: '流量运营',
      content: '对连续两月流量低于 1GB 的客户赠送体验流量',
      products: '体验流量包 1GB',
      script: '赠送您 1GB 流量体验包，欢迎体验 5G 网络',
    },
  },
];

/** 策略模板 */
export interface StrategyTemplate {
  id: string;
  name: string;
  scenario: string;
  category: string;
  /** 模板包含的配置字段 */
  structure: string[];
  refCount: number;
  creator: string;
  createdAt: string;
}

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'TPL-001',
    name: '流量升档标准模板',
    scenario: '流量运营',
    category: '产品推荐类',
    structure: ['目标客群', '触发条件', '推荐产品', '营销话术', '触达渠道', '执行时限'],
    refCount: 42,
    creator: '市场部·策略组',
    createdAt: '2026-03-10',
  },
  {
    id: 'TPL-002',
    name: '离网挽留标准模板',
    scenario: '离网维系',
    category: '客户保有类',
    structure: ['离网评分阈值', '挽留权益', '挽留话术', '触达渠道', '跟随时限'],
    refCount: 28,
    creator: '客户运营中心',
    createdAt: '2026-03-15',
  },
  {
    id: 'TPL-003',
    name: '宽带续费标准模板',
    scenario: '家庭融合运营',
    category: '客户保有类',
    structure: ['到期提醒时间', '续费权益', '续费话术', '触达渠道'],
    refCount: 21,
    creator: '家庭业务部',
    createdAt: '2026-03-22',
  },
  {
    id: 'TPL-004',
    name: '中高端权益升级模板',
    scenario: '中高端客户运营',
    category: '价值提升类',
    structure: ['客户分层规则', '权益配置', '顾问式话术', '专属客户经理分配'],
    refCount: 17,
    creator: '客户运营中心',
    createdAt: '2026-04-02',
  },
  {
    id: 'TPL-005',
    name: '增量首充引导模板',
    scenario: '增量运营',
    category: '价值提升类',
    structure: ['入网触达时点', '首充权益', '引导话术', '触达渠道'],
    refCount: 12,
    creator: '渠道运营部',
    createdAt: '2026-04-11',
  },
  {
    id: 'TPL-006',
    name: '国际漫游推荐模板',
    scenario: '国际业务运营',
    category: '产品推荐类',
    structure: ['出境行为识别', '漫游产品', '资费说明话术', '触达时点'],
    refCount: 8,
    creator: '国际业务部',
    createdAt: '2026-04-19',
  },
  {
    id: 'TPL-007',
    name: '网格通标准化推荐模板',
    scenario: '流量运营',
    category: '一线执行类',
    structure: ['场景话术卡', '推荐产品', '异议处理要点', '结果反馈字段'],
    refCount: 33,
    creator: '网格运营部',
    createdAt: '2026-04-26',
  },
];