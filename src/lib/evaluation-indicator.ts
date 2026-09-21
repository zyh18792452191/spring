/**
 * 调度区域评估 - 评估指标类型定义
 * 
 * 适用调度类型：指标调度、策略调度、客群调度、区域攻坚调度
 * 不适用：客户商机调度、客群商机调度（客户级操作，不做区域评估）
 */

/** 改善方向 */
export type ImprovementDirection = 'up' | 'down';

/** 评估指标 */
export interface EvaluationIndicator {
  /** 指标ID（关联首页93条指标体系） */
  indicatorId: string;
  /** 指标名称，如"5G渗透率""DOU同比增长率" */
  indicatorName: string;
  /** 单位，如"%"、"元"、"GB" */
  unit: string;
  /** 改善方向：up=越大越好(如渗透率)，down=越小越好(如离网率) */
  direction: ImprovementDirection;
  /** 基期值：调度创建时该指标在覆盖区域的当期值，系统自动取值 */
  baseValue: number;
  /** 目标值：派发时人工设定 */
  targetValue: number;
  /** 当前值：跟踪周期结束时系统自动取值（调度未结束则为undefined） */
  currentValue?: number;
}

/** 评估状态 */
export type EvaluationStatus = 'achieved' | 'not_achieved' | 'pending';

/** 评估状态中文映射 */
export const evaluationStatusLabels: Record<EvaluationStatus, string> = {
  'achieved': '已达标',
  'not_achieved': '未达标',
  'pending': '待评估',
};

/**
 * 计算改善幅度
 * 无论direction如何，正数=改善，负数=恶化
 */
export function calcImprovement(indicator: EvaluationIndicator): number {
  const raw = (indicator.currentValue ?? 0) - indicator.baseValue;
  return indicator.direction === 'up' ? raw : -raw;
}

/**
 * 计算改善率
 * 改善率 = 改善幅度 / |基期值| × 100%
 */
export function calcImprovementRate(indicator: EvaluationIndicator): number {
  if (indicator.baseValue === 0) return 0;
  return (calcImprovement(indicator) / Math.abs(indicator.baseValue)) * 100;
}

/**
 * 计算目标达成率
 * 达成率 = (当前值 - 基期值) / (目标值 - 基期值) × 100%
 * direction=down时取反
 */
export function calcAchievementRate(indicator: EvaluationIndicator): number {
  const denominator = indicator.targetValue - indicator.baseValue;
  if (denominator === 0) return 0;
  const numerator = (indicator.currentValue ?? 0) - indicator.baseValue;
  const rate = (numerator / denominator) * 100;
  return indicator.direction === 'up' ? rate : -rate;
}

/**
 * 判断评估状态
 */
export function getEvaluationStatus(indicator: EvaluationIndicator): EvaluationStatus {
  if (indicator.currentValue === undefined || indicator.currentValue === null) {
    return 'pending';
  }
  const rate = calcAchievementRate(indicator);
  return rate >= 100 ? 'achieved' : 'not_achieved';
}

/**
 * 判断调度类型是否支持区域评估
 */
export function supportsRegionalEvaluation(type: string): boolean {
  return ['indicator', 'strategy', 'customer-group', 'region-assault'].includes(type);
}

/**
 * 场景-指标模块映射关系
 * 
 * 不同调度类型+入口场景对应允许选择的指标模块：
 * - 指标调度：由首页指标树触发，评估指标从大市场关键+重点指标选
 * - 策略调度：策略中心关联全场景根因，评估范围更广
 * - 客群调度：客群圈选围绕大市场核心指标
 * - 区域攻坚调度（流量入口）：只选流量运营相关指标
 * - 区域攻坚调度（中高端入口）：只选中高端+大市场重点指标
 * - 区域攻坚调度（离网维系入口）：只选大市场重点指标
 * - 区域攻坚调度（家庭运营入口）：只选全球通保有+大市场重点指标
 * 
 * key格式：`${dispatchType}-${scenario}` 或 `${dispatchType}`（无场景区分时）
 */
export const SCENARIO_INDICATOR_MODULES: Record<string, string[]> = {
  // 指标调度：大市场关键+重点
  'indicator': ['key-market', 'focus-market'],
  // 策略调度：大市场关键+重点+全球通+中高端
  'strategy': ['key-market', 'focus-market', 'gotone-retention', 'mid-high'],
  // 客群调度：大市场关键+重点
  'customer-group': ['key-market', 'focus-market'],
  // 区域攻坚调度 - 流量场景：流量运营重点+流量头号工程
  'region-assault-traffic': ['traffic-overview', 'traffic-project'],
  // 区域攻坚调度 - 中高端场景：中高端+大市场重点
  'region-assault-mid-high': ['mid-high', 'focus-market'],
  // 区域攻坚调度 - 离网维系场景：大市场重点
  'region-assault-churn-retention': ['focus-market'],
  // 区域攻坚调度 - 家庭运营场景：全球通保有+大市场重点
  'region-assault-family': ['gotone-retention', 'focus-market'],
};

/**
 * 根据调度类型和场景获取允许的指标模块ID列表
 */
export function getAllowedModuleIds(dispatchType: string, scenario?: string): string[] {
  if (dispatchType === 'region-assault' && scenario) {
    return SCENARIO_INDICATOR_MODULES[`region-assault-${scenario}`] ?? ['key-market', 'focus-market'];
  }
  return SCENARIO_INDICATOR_MODULES[dispatchType] ?? ['key-market', 'focus-market'];
}

/** 可选评估指标列表（从首页93条指标中抽取适合做区域评估的指标） */
export const availableEvaluationIndicators = [
  { indicatorId: 'key-chn-yoy', indicatorName: '当月CHN收入同比增幅', unit: '%', direction: 'up' as ImprovementDirection },
  { indicatorId: 'key-personal-yoy', indicatorName: '当月个人叠加态收入同比增幅', unit: '%', direction: 'up' as ImprovementDirection },
  { indicatorId: 'key-5g-penetration', indicatorName: '5G渗透率', unit: '%', direction: 'up' as ImprovementDirection },
  { indicatorId: 'key-broadband-penetration', indicatorName: '宽带渗透率', unit: '%', direction: 'up' as ImprovementDirection },
  { indicatorId: 'key-hd-penetration', indicatorName: '高清渗透率', unit: '%', direction: 'up' as ImprovementDirection },
  { indicatorId: 'key-arpu', indicatorName: 'ARPU', unit: '元', direction: 'up' as ImprovementDirection },
  { indicatorId: 'key-dou', indicatorName: 'DOU', unit: 'GB', direction: 'up' as ImprovementDirection },
  { indicatorId: 'key-dou-yoy', indicatorName: 'DOU同比增长率', unit: '%', direction: 'up' as ImprovementDirection },
  { indicatorId: 'key-churn-rate', indicatorName: '离网率', unit: '%', direction: 'down' as ImprovementDirection },
  { indicatorId: 'key-new-customer', indicatorName: '净增客户数', unit: '万户', direction: 'up' as ImprovementDirection },
  { indicatorId: 'focus-5g-upgrade', indicatorName: '5G套餐升档率', unit: '%', direction: 'up' as ImprovementDirection },
  { indicatorId: 'focus-traffic-package', indicatorName: '流量包订购率', unit: '%', direction: 'up' as ImprovementDirection },
  { indicatorId: 'focus-broadband-new', indicatorName: '宽带新增率', unit: '%', direction: 'up' as ImprovementDirection },
  { indicatorId: 'focus-value-uplift', indicatorName: '价值提升率', unit: '%', direction: 'up' as ImprovementDirection },
  { indicatorId: 'focus-conversion-rate', indicatorName: '营销转化率', unit: '%', direction: 'up' as ImprovementDirection },
  { indicatorId: 'focus-market-share', indicatorName: '市场份额', unit: '%', direction: 'up' as ImprovementDirection },
];
