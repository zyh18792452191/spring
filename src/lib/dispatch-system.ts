/**
 * 派发体系类型定义与工具函数
 * 
 * 依据：0605版调度派发PRD Table 11
 * - 指标调度(IND)：派发系统=市场运营平台（本系统）
 * - 策略调度(STR)：派发系统=IOP / 网格通 / 剧本营销（三选一）
 * - 客群调度(CG-OP)：派发系统=IOP / 网格通 / 剧本营销（三选一）
 * - 客户商机调度(COD)：派发系统=网格通
 * - 客群商机调度(GOD)：派发系统=网格通
 * - 区域攻坚调度(RAS)：派发系统=网格通
 * 
 * 剧本营销说明：
 * - 派发系统选"剧本营销"时，审批通过后不自动派发，而是给发起人生成待办工单
 * - 发起人在待办工单中点击"发起剧本营销"跳转IOP剧本营销页面完成配置
 * - 下游执行仍走IOP通道，但创建的是剧本营销活动（多波次/批量策划）而非普通单次活动
 */

/** 派发系统类型 */
export type DispatchSystem = 'platform' | 'IOP' | 'wanggetong' | 'script-marketing';

/** 调度类型枚举 */
export type DispatchType = 
  | 'indicator'           // 指标调度
  | 'strategy'            // 策略调度
  | 'customer-group'      // 客群调度
  | 'customer-opportunity-dispatch' // 客户商机调度
  | 'group-opportunity-dispatch'    // 客群商机调度
  | 'region-assault'      // 区域攻坚调度
  | 'alert-dispatch'      // 预警调度
  | 'retention-task'      // 保有任务
  | 'alert-approval'      // 预警规则审批
  | 'supervision-dispatch'; // 督办调度

/** 调度类型中文映射 */
export const dispatchTypeLabels: Record<DispatchType, string> = {
  'indicator': '指标调度',
  'strategy': '策略调度',
  'customer-group': '客群调度',
  'customer-opportunity-dispatch': '客户商机调度',
  'group-opportunity-dispatch': '客群商机调度',
  'region-assault': '区域攻坚调度',
  'alert-dispatch': '预警调度',
  'retention-task': '保有任务调度',
  'alert-approval': '预警规则审批',
  'supervision-dispatch': '督办调度',
};

/** 中文调度类型→英文枚举的反向映射 */
const dispatchTypeReverseMap: Record<string, DispatchType> = Object.fromEntries(
  Object.entries(dispatchTypeLabels).map(([en, zh]) => [zh, en as DispatchType])
);

/**
 * 根据中文调度类型名称获取英文枚举值
 * 
 * 特殊处理：
 * - "商机调度"是工单筛选中的笼统说法，默认映射为"客户商机调度"
 * - 带业务前缀的调度类型（如"国际业务策略调度"、"中高端指标调度"），会自动提取核心调度类型
 * 
 * @param label 中文调度类型名称
 * @param fallback 找不到时的回退值，默认 'indicator'
 */
export function getDispatchTypeByLabel(label: string, fallback: DispatchType = 'indicator'): DispatchType {
  if (!label) return fallback;
  // 已经是英文枚举值，直接返回
  if (dispatchTypeLabels[label as DispatchType]) return label as DispatchType;
  // 中文精确匹配
  if (dispatchTypeReverseMap[label]) return dispatchTypeReverseMap[label];
  // "商机调度"是工单筛选中的笼统分类名，映射为客户商机调度
  if (label === '商机调度') return 'customer-opportunity-dispatch';
  // 带业务前缀的调度类型（如"国际业务策略调度"、"离网维系客群调度"），提取核心调度类型
  for (const [zhLabel, enType] of Object.entries(dispatchTypeReverseMap)) {
    if (label.endsWith(zhLabel) || label.includes(zhLabel)) {
      return enType as DispatchType;
    }
  }
  return fallback;
}

/** 判断工单是否为审批类（预警规则审批 或 当前环节包含审批/领导） */
export function isApprovalType(type: string, currentStep?: string): boolean {
  return !!(type === 'alert-approval' || currentStep?.includes('审批') || currentStep?.includes('领导'));
}

/** 派发系统中文映射 */
export const dispatchSystemLabels: Record<DispatchSystem, string> = {
  'platform': '市场运营平台',
  'IOP': 'IOP',
  'wanggetong': '网格通',
  'script-marketing': '剧本营销',
};

/**
 * 根据调度类型和工单实际派发系统，确定dispatchSystem值
 * 
 * @param type 调度类型
 * @param selectedSystem 策略/客群调度在派单时选择的执行渠道（'IOP'/'网格通'/'剧本营销'）
 * @returns DispatchSystem值
 */
export function resolveDispatchSystem(
  type: DispatchType | string,
  selectedSystem?: string
): DispatchSystem {
  switch (type) {
    case 'indicator':
      return 'platform';
    case 'strategy':
    case 'customer-group':
      // 策略/客群调度：根据派单时选择的系统决定
      if (selectedSystem === '剧本营销') return 'script-marketing';
      return selectedSystem === '网格通' ? 'wanggetong' : 'IOP';
    case 'customer-opportunity-dispatch':
    case 'group-opportunity-dispatch':
    case 'region-assault':
    case 'alert-dispatch':
    case 'retention-task':
    case 'alert-approval':
      return 'wanggetong';
    default:
      return 'IOP';
  }
}

/**
 * 判断调度类型是否为商机类调度（使用商机共享组件）
 */
export function isOpportunityType(type: DispatchType | string): boolean {
  return ['customer-opportunity-dispatch', 'group-opportunity-dispatch', 'region-assault'].includes(type);
}

/**
 * 判断工单是否为剧本营销派发
 * 剧本营销：审批通过后不自动派发，而是给发起人生成待办工单
 */
export function isScriptMarketing(dispatchSystem: DispatchSystem | string): boolean {
  return dispatchSystem === 'script-marketing';
}

/**
 * 判断调度类型是否固定走网格通（不需要选择执行渠道）
 */
export function isFixedWanggetong(type: DispatchType | string): boolean {
  return ['customer-opportunity-dispatch', 'group-opportunity-dispatch', 'region-assault', 'alert-dispatch', 'retention-task', 'alert-approval'].includes(type);
}

/**
 * 判断调度类型是否支持IOP/网格通二选一
 */
export function isDualChannelType(type: DispatchType | string): boolean {
  return ['strategy', 'customer-group'].includes(type);
}
