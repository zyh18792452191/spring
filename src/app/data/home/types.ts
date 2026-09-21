// 首页指标展示 - 类型定义

/** 时间模式 */
export type TimeMode = 'daily' | 'monthly';

/** 区域层级 */
export type RegionLevel = 'province' | 'city' | 'district' | 'grid' | 'microgrid';

/** 指标可用时间口径 */
export type AvailableTimeMode = 'daily' | 'monthly' | 'both';

/** 卡片展示模式 */
export type CardDisplayMode = 'key' | 'focus' | 'simple';
// key=关键指标（辅助数据内嵌2行），focus=重点指标（子指标列表），simple=无子指标

/** 变化方向 */
export type ChangeDirection = 'up' | 'down' | 'flat';

/** 子指标 */
export interface SubIndicator {
  id: string;
  name: string;
  unit: string;
  value: number;                     // 月维度值（默认值，both型指标在月维度下使用此值）
  dailyValue?: number;               // 日维度值（both型指标专用，日维度下使用此值；不填则使用value）
  changeValue?: string;              // 较上月同期值。有值=该子指标有较上月同期对比维度，无值=该子指标本身是变化量无需再算环比
  changeDirection?: ChangeDirection; // 有changeValue时必填
  isPositive?: boolean;              // 变化方向是否为正向（对业务有利）
}

/** 主指标 */
export interface MainIndicator {
  id: string;
  name: string;
  unit: string;
  value: number;                     // 月维度值（默认值，both型指标在月维度下使用此值）
  dailyValue?: number;               // 日维度值（both型指标专用，日维度下使用此值；不填则使用value）
  changeValue?: string;              // 较上月同期值，仅both型指标(出账客户、当月新增客户数)有值，其余为空
  changeDirection?: ChangeDirection;
  isPositive?: boolean;
  availableTimeMode: AvailableTimeMode;
  subIndicators: SubIndicator[];
  cardDisplayMode: CardDisplayMode;
  source: string;              // 图片来源
  caliber?: string;            // 业务口径说明（定义、统计口径、数据来源、计算公式）
}

/** 指标模块 */
export interface IndicatorModule {
  id: string;
  name: string;
  source: string;
  indicators: MainIndicator[];
}

/** 区域节点 */
export interface RegionNode {
  code: string;
  name: string;
  level: RegionLevel;
  parentCode: string | null;
  children: RegionNode[];
}

/** 弹窗中区域指标行的子指标值 */
export interface SubIndicatorValue {
  name: string;
  unit: string;
  value: string;
  change?: string;               // 较上月同期值，有值=维度值型，无值=变化量型
  direction?: ChangeDirection;   // 有change时必填
  isPositive?: boolean;          // 变化方向是否为正向
}

/** 弹窗中区域指标行 */
export interface RegionIndicatorRow {
  regionCode: string;
  regionName: string;
  mainValue: string;
  mainChange?: string;
  mainChangeDirection?: ChangeDirection;
  mainIsPositive?: boolean;
  subValues: SubIndicatorValue[];
}

/** 面包屑节点 */
export interface BreadcrumbNode {
  code: string;
  name: string;
  level: RegionLevel;
}
