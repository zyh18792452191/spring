// 多时间周期数据系统

// 时间周期类型
// 已注释的时间周期：today、yesterday、last7days、thisMonth、last30days
export type TimePeriod = 'lastMonth';
// | 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'last30days';

// 时间周期显示名称
export const timePeriodLabels: Record<TimePeriod, string> = {
  // today: '今日',
  // yesterday: '昨日',
  // last7days: '近7天',
  // thisMonth: '本月',
  lastMonth: '上月',
};

// 区域类型

// 省份代码映射
export const provinceCodeMap: Record<string, string> = {
  '乌鲁木齐': 'WLMQ',
  '克拉玛依': 'KLYM',
  '吐鲁番': 'TLF',
  '哈密': 'HM',
  '昌吉': 'CJ',
  '博州': 'BETL',
  '巴州': 'BYGL',
  '阿克苏': 'AKS',
  '克州': 'KZ',
  '喀什': 'KS',
  '和田': 'HT',
  '伊犁': 'YL',
  '塔城': 'TC',
  '阿勒泰': 'ALT',
  '奎屯': 'KT',
  '石河子': 'SHZ',
};

// 指标值数据（各指标的实际值）
export interface MetricValue {
  // 工单相关
  workOrderCount: number;          // 工单派单量
  workOrderCompletionRate: number; // 工单完成率 (%)
  workOrderTimeoutRate: number;    // 工单超时率 (%)
  
  // 策略相关
  strategyCount: number;           // 策略发布数
  aiStrategyRate: number;          // AI策略占比 (%)
  strategyExecutionRate: number;   // 策略执行率 (%)
  
  // 其他指标
  avgProcessTime: number;          // 平均处理时长 (小时)
  customerRetention: number;       // 客户留存率 (%)
  resourceUtilization: number;     // 资源利用率 (%)
}

// 指标得分（各指标的得分）
export interface MetricScores {
  workOrder: number;               // 工单得分
  strategy: number;                // 策略得分
  quality: number;                 // 质量得分
  efficiency: number;              // 效能得分
  customer: number;                // 客户得分
}

// 维度得分（五维健康度）
export interface DimensionScores {
  quantity: number;    // 量（规模）得分
  quality: number;     // 质（质量）得分
  structure: number;   // 构（结构）得分
  effect: number;      // 效（效果）得分
}

// 总分
export interface OverallScore {
  overall: number;                 // 综合得分 (overallHealth)
}

// 区域时间周期数据
export interface RegionTimeData {
  timePeriod: TimePeriod;
  region: string;
  regionCode: string;
  metricValues: MetricValue;
  metricScores: MetricScores;
  dimensionScores: DimensionScores;
  overallScore: OverallScore;
  level: 'excellent' | 'good' | 'average' | 'improvement';
  changeFromPrevious?: {
    overall: number;  // 相对于上一周期的变化
    business: number;
    execution: number;
    strategy: number;
    customer: number;
    resource: number;
  };
}

// 数据字典：按区域代码 -> 时间周期 -> 数据
export interface RegionDataMap {
  [regionCode: string]: {
    [timePeriod: string]: RegionTimeData;
  };
}

// 全疆数据（特殊区域代码 'ALL'）
export const xinjiangData: Record<TimePeriod, RegionTimeData> = {
  /*
  today: {
    timePeriod: 'today',
    region: '全疆',
    regionCode: 'ALL',
    metricValues: {
      workOrderCount: 12856,
      workOrderCompletionRate: 96.8,
      workOrderTimeoutRate: 3.2,
      strategyCount: 245,
      aiStrategyRate: 78.6,
      strategyExecutionRate: 89.5,
      avgProcessTime: 2.5,
      customerRetention: 92.5,
      resourceUtilization: 85.3 },
    metricScores: {
      workOrder: 94.5,
      strategy: 91.8,
      quality: 93.2,
      efficiency: 88.5,
      customer: 90.5 },
    dimensionScores: {
      quantity: 94.5,
      quality: 92.3,
      structure: 91.8,
      effect: 90.5 },
    overallScore: {
      overall: 91.5 },
    level: 'excellent',
    changeFromPrevious: {
      overall: 1.2,
      business: 0.8,
      execution: 1.5,
      strategy: 2.1,
      customer: 1.0,
      resource: 0.5 } },
  */
  /*
  yesterday: {
    timePeriod: 'yesterday',
    region: '全疆',
    regionCode: 'ALL',
    metricValues: {
      workOrderCount: 12520,
      workOrderCompletionRate: 96.0,
      workOrderTimeoutRate: 3.8,
      strategyCount: 238,
      aiStrategyRate: 77.5,
      strategyExecutionRate: 88.2,
      avgProcessTime: 2.6,
      customerRetention: 91.8,
      resourceUtilization: 84.8 },
    metricScores: {
      workOrder: 93.8,
      strategy: 90.5,
      quality: 92.5,
      efficiency: 87.8,
      customer: 89.8 },
    dimensionScores: {
      quantity: 93.8,
      quality: 90.8,
      structure: 90.5,
      effect: 89.8 },
    overallScore: {
      overall: 90.5 },
    level: 'excellent' },
  */
  /*
  last7days: {
    timePeriod: 'last7days',
    region: '全疆',
    regionCode: 'ALL',
    metricValues: {
      workOrderCount: 88450,
      workOrderCompletionRate: 95.8,
      workOrderTimeoutRate: 3.5,
      strategyCount: 1720,
      aiStrategyRate: 77.8,
      strategyExecutionRate: 88.5,
      avgProcessTime: 2.55,
      customerRetention: 92.0,
      resourceUtilization: 85.0 },
    metricScores: {
      workOrder: 93.5,
      strategy: 90.8,
      quality: 92.8,
      efficiency: 88.0,
      customer: 90.0 },
    dimensionScores: {
      quantity: 93.5,
      quality: 91.0,
      structure: 90.8,
      effect: 90.0 },
    overallScore: {
      overall: 90.7 },
    level: 'excellent',
    changeFromPrevious: {
      overall: 1.5,
      business: 1.2,
      execution: 1.8,
      strategy: 2.5,
      customer: 1.3,
      resource: 0.8 } },
  */
  /*
  thisMonth: {
    timePeriod: 'thisMonth',
    region: '全疆',
    regionCode: 'ALL',
    metricValues: {
      workOrderCount: 378520,
      workOrderCompletionRate: 96.2,
      workOrderTimeoutRate: 3.3,
      strategyCount: 7350,
      aiStrategyRate: 78.2,
      strategyExecutionRate: 89.0,
      avgProcessTime: 2.52,
      customerRetention: 92.3,
      resourceUtilization: 85.2 },
    metricScores: {
      workOrder: 94.0,
      strategy: 91.2,
      quality: 93.0,
      efficiency: 88.2,
      customer: 90.2 },
    dimensionScores: {
      quantity: 94.0,
      quality: 91.5,
      structure: 91.2,
      effect: 90.2 },
    overallScore: {
      overall: 91.0 },
    level: 'excellent',
    changeFromPrevious: {
      overall: 2.0,
      business: 1.5,
      execution: 2.2,
      strategy: 3.0,
      customer: 1.8,
      resource: 1.0 } },
  */
  lastMonth: {
    timePeriod: 'lastMonth',
    region: '全疆',
    regionCode: 'ALL',
    metricValues: {
      workOrderCount: 365800,
      workOrderCompletionRate: 95.5,
      workOrderTimeoutRate: 3.8,
      strategyCount: 7120,
      aiStrategyRate: 76.5,
      strategyExecutionRate: 87.5,
      avgProcessTime: 2.58,
      customerRetention: 91.5,
      resourceUtilization: 84.5 },
    metricScores: {
      workOrder: 92.5,
      strategy: 89.5,
      quality: 91.8,
      efficiency: 87.0,
      customer: 89.0 },
    dimensionScores: {
      quantity: 92.5,
      quality: 90.0,
      structure: 89.5,
      effect: 89.0 },
    overallScore: {
      overall: 89.6 },
    level: 'excellent' },
  /*
  last30days: {
    timePeriod: 'last30days',
    region: '全疆',
    regionCode: 'ALL',
    metricValues: {
      workOrderCount: 744320,
      workOrderCompletionRate: 95.9,
      workOrderTimeoutRate: 3.4,
      strategyCount: 14470,
      aiStrategyRate: 77.6,
      strategyExecutionRate: 88.8,
      avgProcessTime: 2.54,
      customerRetention: 92.1,
      resourceUtilization: 85.1 },
    metricScores: {
      workOrder: 93.2,
      strategy: 90.5,
      quality: 92.5,
      efficiency: 87.8,
      customer: 90.0 },
    dimensionScores: {
      quantity: 93.2,
      quality: 91.0,
      structure: 90.5,
      effect: 90.0 },
    overallScore: {
      overall: 90.5 },
    level: 'excellent',
    changeFromPrevious: {
      overall: 1.8,
      business: 1.5,
      execution: 2.0,
      strategy: 2.8,
      customer: 1.5,
      resource: 1.2 } },
  */
};

// 生成确定性随机数的辅助函数
let seed = 12345;
function seededRandom() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// 16个地市分公司的数据生成函数
function generateProvinceData(
  region: string,
  regionCode: string,
  baseScores: {
    business: number;
    execution: number;
    strategy: number;
    customer: number;
    resource: number;
  }
): Record<TimePeriod, RegionTimeData> {
  // 已注释的时间周期：today、yesterday、last7days、thisMonth、last30days
  const timePeriods: TimePeriod[] = ['lastMonth'];
  // const timePeriods: TimePeriod[] = ['today', 'yesterday', 'last7days', 'thisMonth', 'lastMonth', 'last30days'];
  seed = regionCode.length * 10; // 根据区域代码设置种子
  
  return timePeriods.reduce((acc, period, index) => {
    // 为不同时间周期生成略有不同的数据
    const variation = (index % 3) * 2 - 2; // -2, 0, 2, -2, 0, 2
    
    const data: RegionTimeData = {
      timePeriod: period,
      region,
      regionCode,
      metricValues: {
        workOrderCount: Math.round(baseScores.business * 100 + variation * 10),
        workOrderCompletionRate: Math.min(99, Math.max(85, baseScores.execution + variation * 0.5)),
        workOrderTimeoutRate: Math.max(0, Math.min(10, 5 - baseScores.execution * 0.02)),
        strategyCount: Math.round(baseScores.strategy * 2 + variation),
        aiStrategyRate: Math.min(95, Math.max(60, baseScores.strategy + variation * 0.3)),
        strategyExecutionRate: Math.min(99, Math.max(80, baseScores.strategy + variation * 0.5)),
        avgProcessTime: Math.max(1, Math.min(5, 5 - baseScores.execution * 0.03)),
        customerRetention: Math.min(98, Math.max(80, baseScores.customer + variation * 0.3)),
        resourceUtilization: Math.min(95, Math.max(70, baseScores.resource + variation * 0.4)) },
      metricScores: {
        workOrder: Math.min(100, Math.max(60, baseScores.business + variation * 0.5)),
        strategy: Math.min(100, Math.max(60, baseScores.strategy + variation * 0.5)),
        quality: Math.min(100, Math.max(60, (baseScores.business + baseScores.execution) / 2 + variation * 0.3)),
        efficiency: Math.min(100, Math.max(60, baseScores.resource + variation * 0.5)),
        customer: Math.min(100, Math.max(60, baseScores.customer + variation * 0.5)) },
      dimensionScores: {
        quantity: Math.min(100, Math.max(60, baseScores.business + variation * 0.5)),
        quality: Math.min(100, Math.max(60, baseScores.execution + variation * 0.5)),
        structure: Math.min(100, Math.max(60, baseScores.strategy + variation * 0.5)),
        effect: Math.min(100, Math.max(60, baseScores.customer + variation * 0.5)) },
      overallScore: {
        overall: Math.min(100, Math.max(60, (
          baseScores.business +
          baseScores.execution +
          baseScores.strategy +
          baseScores.customer
        ) / 4 + variation * 0.3)) },
      level: baseScores.business >= 80 ? 'excellent' :
             baseScores.business >= 60 ? 'average' : 'improvement' };
    
    acc[period] = data;
    return acc;
  }, {} as Record<TimePeriod, RegionTimeData>);
}

// 新疆16地市分公司的数据
export const provinceData: RegionDataMap = {
  'WLMQ': generateProvinceData('乌鲁木齐', 'WLMQ', { business: 93.5, execution: 92.8, strategy: 95.0, customer: 94.5, resource: 94.8 }),
  'KLYM': generateProvinceData('克拉玛依', 'KLYM', { business: 92.0, execution: 91.5, strategy: 93.2, customer: 92.8, resource: 93.0 }),
  'TLF': generateProvinceData('吐鲁番', 'TLF', { business: 87.5, execution: 86.8, strategy: 88.2, customer: 87.0, resource: 87.5 }),
  'HM': generateProvinceData('哈密', 'HM', { business: 86.2, execution: 85.5, strategy: 87.0, customer: 86.0, resource: 86.5 }),
  'CJ': generateProvinceData('昌吉', 'CJ', { business: 89.0, execution: 88.2, strategy: 89.5, customer: 88.8, resource: 89.2 }),
  'BETL': generateProvinceData('博州', 'BETL', { business: 84.5, execution: 83.8, strategy: 85.2, customer: 84.0, resource: 84.8 }),
  'BYGL': generateProvinceData('巴州', 'BYGL', { business: 86.0, execution: 85.5, strategy: 86.8, customer: 85.2, resource: 86.2 }),
  'AKS': generateProvinceData('阿克苏', 'AKS', { business: 83.8, execution: 83.0, strategy: 84.5, customer: 83.2, resource: 84.0 }),
  'KZ': generateProvinceData('克州', 'KZ', { business: 81.5, execution: 80.8, strategy: 82.2, customer: 81.0, resource: 81.8 }),
  'KS': generateProvinceData('喀什', 'KS', { business: 83.0, execution: 82.5, strategy: 83.8, customer: 82.0, resource: 83.2 }),
  'HT': generateProvinceData('和田', 'HT', { business: 80.5, execution: 80.0, strategy: 81.2, customer: 80.0, resource: 80.8 }),
  'YL': generateProvinceData('伊犁', 'YL', { business: 88.2, execution: 87.5, strategy: 88.8, customer: 87.8, resource: 88.5 }),
  'TC': generateProvinceData('塔城', 'TC', { business: 85.5, execution: 84.8, strategy: 86.2, customer: 85.0, resource: 85.5 }),
  'ALT': generateProvinceData('阿勒泰', 'ALT', { business: 84.0, execution: 83.5, strategy: 84.8, customer: 83.5, resource: 84.2 }),
  'SHZ': generateProvinceData('石河子', 'SHZ', { business: 90.0, execution: 89.5, strategy: 90.8, customer: 90.0, resource: 90.5 }) };

// 获取指定区域和时间周期的数据
export function getRegionData(regionCode: string, timePeriod: TimePeriod): RegionTimeData | null {
  if (regionCode === 'ALL') {
    return xinjiangData[timePeriod] || null;
  }
  return provinceData[regionCode]?.[timePeriod] || null;
}

// 获取所有区域在指定时间周期的数据（用于地图显示）
export function getAllRegionsData(timePeriod: TimePeriod): RegionTimeData[] {
  const data: RegionTimeData[] = [xinjiangData[timePeriod]];
  
  Object.keys(provinceData).forEach(code => {
    const regionData = provinceData[code][timePeriod];
    if (regionData) {
      data.push(regionData);
    }
  });
  
  return data;
}
