// 效果跟踪模块类型定义

export interface Activity {
  id: string;
  name: string;
  orderCount: number;
  date: string;
  status: '进行中' | '已完成' | '计划中';
  description?: string;
}

export interface Indicator {
  id: string;
  name: string;
  code: string;
  currentValue: number;
  targetValue: number;
  change: number; // 变化百分比
  changeType: 'up' | 'down'; // up表示改善，down表示恶化
  rank: number; // 排名
  previousRank?: number; // 上期排名（用于计算排名变化）

  // 活动数据
  activityCount: number; // 活动总数
  totalOrders: number; // 总业务订购量
  activities: Activity[]; // 活动列表
}

export interface ProvinceIndicator {
  indicatorId: string;
  indicatorName: string;
  currentValue: number;
  targetValue: number;
  change: number;
  changeType: 'up' | 'down';
  rank: number; // 在该省的排名

  // 该省针对该指标的活动
  activityCount: number;
  totalOrders: number;
  activities: Activity[];
}

export interface ProvinceData {
  provinceCode: string;
  provinceName: string;

  // 该省的指标概况
  improvedCount: number; // 改善的指标数
  totalIndicatorCount: number; // 总指标数
  activityCount: number; // 活动总数
  totalOrders: number; // 总订购量
  averageImprovementRate: number; // 平均改善率

  // 该省的所有指标
  indicators: ProvinceIndicator[];
}

export interface NationalData {
  // Top5 指标
  top5: Indicator[];
  // Bottom5 指标
  bottom5: Indicator[];

  // 全国概况
  totalIndicatorCount: number;
  improvedCount: number;
  totalActivityCount: number;
  totalOrders: number;
}

export interface ProvinceSelectOption {
  code: string;
  name: string;
}

// 获取排名变化
export function getRankChange(currentRank: number, previousRank?: number): number {
  if (previousRank === undefined) return 0;
  return previousRank - currentRank; // 正数表示排名上升（改善）
}

// 获取排名变化文本
export function getRankChangeText(rankChange: number): string {
  if (rankChange > 0) return `↑${rankChange}`;
  if (rankChange < 0) return `↓${Math.abs(rankChange)}`;
  return '-';
}
