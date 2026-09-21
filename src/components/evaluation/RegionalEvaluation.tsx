'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MonthPicker from '@/components/ui/month-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IndicatorSelectDialog } from './IndicatorSelectDialog';
import { TrendingUp, BarChart3, Target, Info, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { SimplePagination } from '@/components/ui/pagination';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// ====== 类型定义 ======
/** ascending=正向指标（越大越好），descending=负向指标（越小越好） */
type Direction = 'ascending' | 'descending';
/** absolute=绝对量指标（户/万元/GB），ratio=比率/均值指标（%/元） */
type ValueType = 'absolute' | 'ratio' | 'average';
/** 指标业务分类 */
type Category = 'traffic' | 'family' | 'incremental' | 'churn' | 'vip' | 'international';
/** 指标可用时间口径 */
type AvailableTimeMode = 'daily' | 'monthly' | 'both';
/** 用户当前选择的时间模式 */
type TimeMode = 'daily' | 'monthly';

/** 区县记录 */
interface DistrictRecord {
  districtCode: string;
  districtName: string;
  baseValue: number;
  currentValue: number;
}

/** 网格记录 */
interface GridRecord {
  gridCode: string;
  gridName: string;
  baseValue: number;
  currentValue: number;
}

/** 工单记录 */
interface WorkOrderRecord {
  workOrderId: string;
  dispatchType: string;
  createdAt: string;
  baseValue: number;
  currentValue: number;
  direction: Direction;
  achieveRate: number;
}

/** 指标聚合数据 */
interface IndicatorAggregate {
  indicatorId: string;
  indicatorName: string;
  unit: string;
  direction: Direction;
  valueType: ValueType;
  category: string;
  availableTimeMode: AvailableTimeMode;
  provinceBaseValue: number;
  provinceTargetValue: number;
  /** 全疆视角：地市排名 */
  regionRecords: {
    region: string;
    regionCode: string;
    baseValue: number;
    currentValue: number;
  }[];
  /** 地市视角：区县排名 */
  districtRecords: DistrictRecord[];
  /** 区县视角：网格排名 */
  gridRecords: GridRecord[];
  /** 网格视角：工单明细 */
  workOrderRecords: WorkOrderRecord[];
}

/** 组件 Props */
interface RegionalEvaluationProps {
  selectedCityCode?: string;
  selectedCityName?: string;
  selectedDistrictCode?: string;
  selectedDistrictName?: string;
  selectedGridCode?: string;
  selectedGridName?: string;
}

// ====== 统一计算函数 ======

/** 改善幅度：正值=改善，负值=恶化 */
function calcImprovement(baseValue: number, currentValue: number, direction: Direction): number {
  return direction === 'ascending' ? currentValue - baseValue : baseValue - currentValue;
}

/** 改善率 = |改善幅度| / |基期值| × 100%（仅绝对量指标适用） */
function calcImproveRate(baseValue: number, currentValue: number, direction: Direction): number | null {
  if (baseValue === 0) return null;
  return Math.abs(calcImprovement(baseValue, currentValue, direction)) / Math.abs(baseValue) * 100;
}

/** 格式化改善幅度 */
function formatImprovement(val: number, unit: string, valueType: ValueType): string {
  const sign = val > 0 ? '+' : '';
  const decimals = (unit === '万元' || unit === '户') ? 0 : 1;
  if (valueType === 'ratio') {
    return `${sign}${val.toFixed(decimals)}${unit === '%' ? 'pp' : unit}`;
  }
  return `${sign}${val.toFixed(decimals)}${unit}`;
}

// ====== 展示模式 ======
type DisplayMode = 'province' | 'city' | 'district' | 'grid';

function getDisplayMode(cityCode?: string, districtCode?: string, gridCode?: string): DisplayMode {
  if (gridCode) return 'grid';
  if (districtCode) return 'district';
  if (cityCode) return 'city';
  return 'province';
}

function getRegionLabel(mode: DisplayMode): string {
  if (mode === 'grid') return '工单';
  return '下级区域';
}

// ====== 模拟数据 ======
const CITIES = [
  { name: '乌鲁木齐', code: '650100' }, { name: '克拉玛依', code: '650200' },
  { name: '吐鲁番', code: '650400' }, { name: '哈密', code: '650500' },
  { name: '昌吉', code: '652300' }, { name: '博州', code: '652700' },
  { name: '巴州', code: '652800' }, { name: '阿克苏', code: '652900' },
  { name: '克州', code: '653000' }, { name: '喀什', code: '653100' },
  { name: '和田', code: '653200' }, { name: '伊犁', code: '654000' },
  { name: '塔城', code: '654200' }, { name: '阿勒泰', code: '654300' },
  { name: '奎屯', code: '654003' }, { name: '石河子', code: '659001' },
];

const DISTRICTS_URUMQI = [
  { name: '天山区', code: '650101' }, { name: '沙依巴克区', code: '650102' },
  { name: '新市区', code: '650103' }, { name: '水磨沟区', code: '650104' },
  { name: '头屯河区', code: '650105' }, { name: '达坂城区', code: '650106' },
  { name: '米东区', code: '650107' }, { name: '乌鲁木齐县', code: '650108' },
];

const GRIDS_TIANSHAN = [
  { name: '解放南路街道', code: '65010101' }, { name: '胜利路街道', code: '65010102' },
  { name: '团结路街道', code: '65010103' }, { name: '延安路街道', code: '65010104' },
  { name: '青年路街道', code: '65010105' }, { name: '南门街道', code: '65010106' },
];

// 确定性伪随机：基于种子字符串生成0~1的数值，确保SSR/CSR一致
function seededRandom(seed: string, index: number): number {
  const str = seed + index;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return (Math.abs(hash) % 10000) / 10000;
}
function seededRange(seed: string, index: number, min: number, max: number): number {
  return min + seededRandom(seed, index) * (max - min);
}

// 指标配置表：42个真实指标（来源：流量运营概览页+指标树）
const INDICATOR_CONFIGS: Array<{
  id: string; name: string; unit: string; direction: 'ascending' | 'descending';
  valueType: 'absolute' | 'ratio' | 'average'; category: 'traffic' | 'churn' | 'family' | 'incremental' | 'vip' | 'international'; availableTimeMode: AvailableTimeMode;
  provinceBase: number; provinceTarget: number; baseRange: [number, number]; deltaRange: [number, number];
}> = [
  // === 核心指标 ===
  { id: 'traffic_growth', name: '流量增幅', unit: '%', direction: 'ascending', valueType: 'ratio', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 8.5, provinceTarget: 12, baseRange: [3, 15], deltaRange: [-2, 5] },
  { id: 'traffic_share', name: '流量份额', unit: '%', direction: 'ascending', valueType: 'ratio', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 33.5, provinceTarget: 36, baseRange: [25, 40], deltaRange: [-1.5, 3] },
  { id: 'cum_service_revenue', name: '累计通信服务收入', unit: '亿元', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 108.6, provinceTarget: 130, baseRange: [4, 18], deltaRange: [-0.5, 2.5] },
  { id: 'over_1gb_users', name: '当月≥1GB上网客户', unit: '亿户', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 1.82, provinceTarget: 2.0, baseRange: [0.08, 0.2], deltaRange: [-0.01, 0.03] },
  // === 规模与客户 ===
  { id: 'daily_traffic', name: '当日流量规模', unit: '亿MB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'daily', provinceBase: 568.2, provinceTarget: 650, baseRange: [25, 60], deltaRange: [-5, 10] },
  { id: 'monthly_avg_traffic', name: '当月日均流量', unit: '亿MB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'daily', provinceBase: 520, provinceTarget: 600, baseRange: [22, 55], deltaRange: [-4, 8] },
  { id: 'internet_users', name: '当月上网客户', unit: '万', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 1850, provinceTarget: 1950, baseRange: [80, 200], deltaRange: [-5, 15] },
  // === 价值与收入 ===
  { id: 'cum_mobile_revenue', name: '累计移动流量收入', unit: '亿元', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 95.2, provinceTarget: 115, baseRange: [3, 15], deltaRange: [-0.3, 2] },
  { id: 'cum_traffic_unit_price', name: '累计流量单价', unit: '元/GB', direction: 'descending', valueType: 'average', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 3.8, provinceTarget: 3.2, baseRange: [3, 5], deltaRange: [-0.5, 0.3] },
  { id: 'data_traffic_revenue', name: '移动数据流量收入', unit: '亿元', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 88.5, provinceTarget: 105, baseRange: [3, 14], deltaRange: [-0.3, 1.8] },
  { id: 'package_split_revenue', name: '套餐拆分流量收入', unit: '亿元', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 72.3, provinceTarget: 85, baseRange: [2.5, 11], deltaRange: [-0.2, 1.5] },
  { id: 'ease_discount_fee', name: '安心优惠费', unit: '万元', direction: 'descending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 3200, provinceTarget: 2500, baseRange: [120, 400], deltaRange: [-50, 30] },
  // === 用量与DOU ===
  { id: 'monthly_dou', name: '当月DOU', unit: 'GB', direction: 'ascending', valueType: 'average', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 15.8, provinceTarget: 18, baseRange: [10, 22], deltaRange: [-1.5, 3] },
  { id: 'cum_dou', name: '累计DOU', unit: 'GB', direction: 'ascending', valueType: 'average', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 92.5, provinceTarget: 108, baseRange: [60, 130], deltaRange: [-5, 15] },
  { id: 'daily_internet_traffic', name: '日上网流量', unit: '亿MB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'daily', provinceBase: 568.2, provinceTarget: 650, baseRange: [25, 60], deltaRange: [-5, 10] },
  { id: 'monthly_cum_traffic', name: '月累计上网流量', unit: '亿MB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 15600, provinceTarget: 18000, baseRange: [600, 1600], deltaRange: [-50, 200] },
  { id: 'intra_prov_roam', name: '省内漫游数据流量', unit: '亿MB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'daily', provinceBase: 85.6, provinceTarget: 100, baseRange: [3, 12], deltaRange: [-1, 2] },
  { id: 'inter_prov_roam', name: '省际漫游数据流量', unit: '亿MB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'daily', provinceBase: 42.3, provinceTarget: 50, baseRange: [1.5, 6], deltaRange: [-0.5, 1] },
  { id: 'avg_3m_traffic', name: '前三个月平均上网流量', unit: 'GB', direction: 'ascending', valueType: 'average', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 14.2, provinceTarget: 16, baseRange: [9, 20], deltaRange: [-1, 2.5] },
  { id: 'cum_internet_traffic', name: '累计上网流量', unit: '亿MB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 16500, provinceTarget: 19000, baseRange: [600, 1700], deltaRange: [-60, 220] },
  { id: 'cum_local_traffic', name: '累计本地数据流量', unit: '亿MB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 14200, provinceTarget: 16500, baseRange: [500, 1500], deltaRange: [-50, 200] },
  { id: 'cum_inter_prov_roam', name: '累计省际漫游数据流量', unit: '亿MB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 1250, provinceTarget: 1500, baseRange: [40, 160], deltaRange: [-5, 20] },
  { id: '5g_data_traffic', name: '5G数据流量', unit: '亿MB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 6800, provinceTarget: 8500, baseRange: [250, 800], deltaRange: [-20, 100] },
  { id: 'remaining_traffic', name: '剩余流量', unit: '亿MB', direction: 'descending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 2800, provinceTarget: 2000, baseRange: [100, 350], deltaRange: [-40, 25] },
  { id: 'last_month_overage_fee', name: '上月超套费', unit: '万元', direction: 'descending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 2800, provinceTarget: 2000, baseRange: [100, 350], deltaRange: [-40, 25] },
  { id: 'avg_3m_dou', name: '近三个月DOU均值', unit: 'GB', direction: 'ascending', valueType: 'average', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 15.2, provinceTarget: 17.5, baseRange: [10, 21], deltaRange: [-1.2, 2.8] },
  // === 饱和度 ===
  { id: 'pkg_saturation', name: '当月套餐饱和度', unit: '%', direction: 'ascending', valueType: 'ratio', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 72.5, provinceTarget: 80, baseRange: [55, 85], deltaRange: [-3, 5] },
  { id: 'overall_saturation', name: '整体饱和度(套+包)', unit: '%', direction: 'ascending', valueType: 'ratio', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 78.3, provinceTarget: 85, baseRange: [60, 90], deltaRange: [-2, 4] },
  { id: 'main_pkg_saturation', name: '主流量套餐饱和度', unit: '%', direction: 'ascending', valueType: 'ratio', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 68.2, provinceTarget: 75, baseRange: [50, 82], deltaRange: [-3, 5] },
  { id: 'usage_saturation', name: '流量套餐使用饱和度', unit: '%', direction: 'ascending', valueType: 'ratio', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 75.6, provinceTarget: 82, baseRange: [58, 88], deltaRange: [-2.5, 4] },
  // === 流量来源 ===
  { id: 'stock_stimulus', name: '存量激发流量贡献', unit: '万GB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 85.2, provinceTarget: 100, baseRange: [3, 12], deltaRange: [-0.5, 2] },
  { id: 'new_subscriber', name: '新入网流量贡献', unit: '万GB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 32.5, provinceTarget: 40, baseRange: [1, 5], deltaRange: [-0.3, 0.8] },
  { id: 'silent_activate', name: '沉默激活流量贡献', unit: '万GB', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 18.3, provinceTarget: 25, baseRange: [0.5, 3], deltaRange: [-0.2, 0.5] },
  { id: 'churn_loss', name: '流失损失-离网流量损失', unit: '万GB', direction: 'descending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 22.5, provinceTarget: 15, baseRange: [0.8, 3.5], deltaRange: [-0.3, 0.5] },
  { id: 'silent_loss', name: '流失损失-沉默流量损失', unit: '万GB', direction: 'descending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 35.8, provinceTarget: 25, baseRange: [1.2, 5], deltaRange: [-0.5, 0.8] },
  // === 重点工作 ===
  { id: 'triple_expand_rate', name: '23类客户三扩三融率', unit: '%', direction: 'ascending', valueType: 'ratio', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 28.5, provinceTarget: 35, baseRange: [18, 38], deltaRange: [-2, 5] },
  { id: 'triple_expand_scale', name: '23类客户三扩三融当月运营规模', unit: '万户', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 125, provinceTarget: 180, baseRange: [5, 18], deltaRange: [-1, 4] },
  // === 质量与超套 ===
  { id: 'over_300gb_pct', name: '300GB以上客户占比', unit: '%', direction: 'descending', valueType: 'ratio', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 3.2, provinceTarget: 2.0, baseRange: [1.5, 5], deltaRange: [-0.8, 0.5] },
  { id: 'over_300gb_traffic_pct', name: '300GB以上流量占比', unit: '%', direction: 'descending', valueType: 'ratio', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 12.5, provinceTarget: 8, baseRange: [6, 18], deltaRange: [-2, 1.5] },
  { id: 'over_pkg_users', name: '是否流量超套客户', unit: '万', direction: 'descending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 68, provinceTarget: 50, baseRange: [2, 10], deltaRange: [-1.5, 0.8] },
  { id: 'traffic_share_users', name: '流量共享用户', unit: '万', direction: 'ascending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 320, provinceTarget: 400, baseRange: [12, 45], deltaRange: [-3, 8] },
  { id: 'zero_traffic_users', name: '是否0流量用户', unit: '万', direction: 'descending', valueType: 'absolute', category: 'traffic', availableTimeMode: 'monthly', provinceBase: 15.2, provinceTarget: 10, baseRange: [0.5, 3], deltaRange: [-0.5, 0.3] },
];

// 根据指标配置生成区域记录（确定性伪随机）
function generateRegionRecords(config: typeof INDICATOR_CONFIGS[0], regions: Array<{name: string; code: string}>) {
  return regions.map((r, i) => {
    const base = config.valueType === 'absolute'
      ? Math.round(config.baseRange[0] + seededRange(config.id + '_base', i, 0, config.baseRange[1] - config.baseRange[0]))
      : Math.round((config.baseRange[0] + seededRange(config.id + '_base', i, 0, config.baseRange[1] - config.baseRange[0])) * 10) / 10;
    const delta = config.valueType === 'absolute'
      ? Math.round(seededRange(config.id + '_delta', i, config.deltaRange[0], config.deltaRange[1]))
      : Math.round(seededRange(config.id + '_delta', i, config.deltaRange[0], config.deltaRange[1]) * 10) / 10;
    const curr = base + delta;
    return { region: r.name, regionCode: r.code, baseValue: base, currentValue: Math.round(curr * 10) / 10 };
  });
}

// 全疆模式数据：42个指标
const PROVINCE_MODE_DATA: IndicatorAggregate[] = INDICATOR_CONFIGS.map(cfg => ({
  indicatorId: cfg.id,
  indicatorName: cfg.name,
  unit: cfg.unit,
  direction: cfg.direction,
  valueType: cfg.valueType,
  category: cfg.category,
  availableTimeMode: cfg.availableTimeMode,
  provinceBaseValue: cfg.provinceBase,
  provinceTargetValue: cfg.provinceTarget,
  regionRecords: generateRegionRecords(cfg, CITIES),
  districtRecords: [],
  gridRecords: [],
  workOrderRecords: [],
}));

// 地市模式数据（乌鲁木齐）：区县级 — 从INDICATOR_CONFIGS动态生成
const CITY_MODE_DATA: Record<string, IndicatorAggregate[]> = {
  '650100': INDICATOR_CONFIGS.map(cfg => ({
    indicatorId: cfg.id, indicatorName: cfg.name, unit: cfg.unit,
    direction: cfg.direction, valueType: cfg.valueType, category: cfg.category,
    availableTimeMode: cfg.availableTimeMode,
    provinceBaseValue: cfg.provinceBase, provinceTargetValue: cfg.provinceTarget,
    regionRecords: [],
    districtRecords: DISTRICTS_URUMQI.map((d, i) => {
      const base = cfg.valueType === 'absolute'
        ? Math.round(cfg.provinceBase * 0.08 + seededRange('city_' + cfg.id + '_base', i, 0, cfg.provinceBase * 0.12))
        : Math.round((seededRange('city_' + cfg.id + '_base', i, cfg.provinceBase * 0.6, cfg.provinceBase * 1.4)) * 10) / 10;
      const delta = cfg.valueType === 'absolute'
        ? Math.round(seededRange('city_' + cfg.id + '_delta', i, -cfg.provinceBase * 0.02, cfg.provinceBase * 0.04))
        : Math.round(seededRange('city_' + cfg.id + '_delta', i, -cfg.provinceBase * 0.1, cfg.provinceBase * 0.15) * 10) / 10;
      return { districtCode: d.code, districtName: d.name, baseValue: base, currentValue: Math.round((base + delta) * 10) / 10 };
    }),
    gridRecords: [], workOrderRecords: [],
  })),
};

// 区县模式数据（天山区）：网格级 — 从INDICATOR_CONFIGS动态生成
const DISTRICT_MODE_DATA: Record<string, IndicatorAggregate[]> = {
  '650101': INDICATOR_CONFIGS.map(cfg => ({
    indicatorId: cfg.id, indicatorName: cfg.name, unit: cfg.unit,
    direction: cfg.direction, valueType: cfg.valueType, category: cfg.category,
    availableTimeMode: cfg.availableTimeMode,
    provinceBaseValue: cfg.provinceBase, provinceTargetValue: cfg.provinceTarget,
    regionRecords: [], districtRecords: [],
    gridRecords: GRIDS_TIANSHAN.map((g, i) => {
      const base = cfg.valueType === 'absolute'
        ? Math.round(cfg.provinceBase * 0.01 + seededRange('dist_' + cfg.id + '_base', i, 0, cfg.provinceBase * 0.015))
        : Math.round((seededRange('dist_' + cfg.id + '_base', i, cfg.provinceBase * 0.6, cfg.provinceBase * 1.4)) * 10) / 10;
      const delta = cfg.valueType === 'absolute'
        ? Math.round(seededRange('dist_' + cfg.id + '_delta', i, -cfg.provinceBase * 0.003, cfg.provinceBase * 0.006) * 10) / 10
        : Math.round(seededRange('dist_' + cfg.id + '_delta', i, -cfg.provinceBase * 0.1, cfg.provinceBase * 0.15) * 10) / 10;
      return { gridCode: g.code, gridName: g.name, baseValue: base, currentValue: Math.round((base + delta) * 10) / 10 };
    }),
    workOrderRecords: [],
  })),
};

// 网格模式数据：工单明细 — 从INDICATOR_CONFIGS动态生成
const GRID_MODE_DATA: Record<string, IndicatorAggregate[]> = {
  '65010101': INDICATOR_CONFIGS.map(cfg => ({
    indicatorId: cfg.id, indicatorName: cfg.name, unit: cfg.unit,
    direction: cfg.direction, valueType: cfg.valueType, category: cfg.category,
    availableTimeMode: cfg.availableTimeMode,
    provinceBaseValue: cfg.provinceBase, provinceTargetValue: cfg.provinceTarget,
    regionRecords: [], districtRecords: [], gridRecords: [],
    workOrderRecords: [
      { workOrderId: 'IND2025060' + seededRange('wo1_' + cfg.id, 0, 1, 9).toFixed(0) + '1', dispatchType: '指标调度', createdAt: `2025-06-0${seededRange('wo1d_' + cfg.id, 0, 1, 9).toFixed(0)}`, baseValue: Math.round(cfg.provinceBase * 0.01 * 10) / 10, currentValue: Math.round(cfg.provinceBase * 0.012 * 10) / 10, direction: cfg.direction, achieveRate: Math.round(seededRange('wo1a_' + cfg.id, 0, 70, 100) * 10) / 10 },
      { workOrderId: 'STR2025060' + seededRange('wo2_' + cfg.id, 0, 1, 9).toFixed(0) + '5', dispatchType: '策略调度', createdAt: `2025-06-${seededRange('wo2d_' + cfg.id, 0, 10, 28).toFixed(0)}`, baseValue: Math.round(cfg.provinceBase * 0.01 * 10) / 10, currentValue: Math.round(cfg.provinceBase * 0.011 * 10) / 10, direction: cfg.direction, achieveRate: Math.round(seededRange('wo2a_' + cfg.id, 0, 60, 95) * 10) / 10 },
      { workOrderId: 'RAS2025060' + seededRange('wo3_' + cfg.id, 0, 1, 9).toFixed(0) + '2', dispatchType: '区域攻坚调度', createdAt: `2025-06-${seededRange('wo3d_' + cfg.id, 0, 10, 28).toFixed(0)}`, baseValue: Math.round(cfg.provinceBase * 0.01 * 10) / 10, currentValue: Math.round(cfg.provinceBase * 0.013 * 10) / 10, direction: cfg.direction, achieveRate: Math.round(seededRange('wo3a_' + cfg.id, 0, 50, 90) * 10) / 10 },
    ],
  })),
};

/** 获取当前视角的指标数据 */
function getIndicatorAggregates(cityCode?: string, districtCode?: string, gridCode?: string): IndicatorAggregate[] {
  if (gridCode && GRID_MODE_DATA[gridCode]) return GRID_MODE_DATA[gridCode];
  if (districtCode && DISTRICT_MODE_DATA[districtCode]) return DISTRICT_MODE_DATA[districtCode];
  if (cityCode && CITY_MODE_DATA[cityCode]) return CITY_MODE_DATA[cityCode];
  return PROVINCE_MODE_DATA;
}

// ====== 组件 ======
export default function RegionalEvaluation({
  selectedCityCode = '',
  selectedCityName = '全疆',
  selectedDistrictCode = '',
  selectedDistrictName = '',
  selectedGridCode = '',
  selectedGridName = '',
}: RegionalEvaluationProps) {
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>('');
  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
  const [regionPage, setRegionPage] = useState(1);
  const [regionPageSize] = useState(10);

  // 账期状态
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-06');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 5, 14)); // T-1
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const displayMode = useMemo(
    () => getDisplayMode(selectedCityCode, selectedDistrictCode, selectedGridCode),
    [selectedCityCode, selectedDistrictCode, selectedGridCode],
  );
  const regionLabel = useMemo(() => getRegionLabel(displayMode), [displayMode]);
  const currentRegionName = useMemo(() => {
    if (displayMode === 'grid') return selectedGridName;
    if (displayMode === 'district') return selectedDistrictName;
    if (displayMode === 'city') return selectedCityName;
    return '全疆';
  }, [displayMode, selectedCityName, selectedDistrictName, selectedGridName]);

  const indicatorAggregates = useMemo(
    () => getIndicatorAggregates(selectedCityCode, selectedDistrictCode, selectedGridCode),
    [selectedCityCode, selectedDistrictCode, selectedGridCode],
  );

  const effectiveIndicatorId = useMemo(() => {
    if (selectedIndicatorId && indicatorAggregates.find(a => a.indicatorId === selectedIndicatorId)) {
      return selectedIndicatorId;
    }
    return indicatorAggregates[0]?.indicatorId || '';
  }, [selectedIndicatorId, indicatorAggregates]);

  const sel = useMemo(
    () => indicatorAggregates.find(a => a.indicatorId === effectiveIndicatorId) || indicatorAggregates[0],
    [effectiveIndicatorId, indicatorAggregates],
  );

  const isAbsolute = sel?.valueType === 'absolute';
  const isDescending = sel?.direction === 'descending';

  // 账期类型：根据指标属性自动决定（daily/both→日，monthly→月）
  const timeMode: TimeMode = sel?.availableTimeMode === 'monthly' ? 'monthly' : 'daily';

  // 指标切换时重置分页
  const handleIndicatorChange = (id: string) => {
    setSelectedIndicatorId(id);
    setRegionPage(1);
  };

  // ====== 排名数据计算 ======
  interface RankItem {
    region: string;
    regionCode: string;
    improvement: number;
    improveRate: number | null;
    baseValue: number;
    currentValue: number;
  }

  const rankData = useMemo((): RankItem[] => {
    if (!sel) return [];
    if (displayMode === 'province') {
      return sel.regionRecords.map(r => ({
        region: r.region, regionCode: r.regionCode,
        improvement: calcImprovement(r.baseValue, r.currentValue, sel.direction),
        improveRate: calcImproveRate(r.baseValue, r.currentValue, sel.direction),
        baseValue: r.baseValue, currentValue: r.currentValue,
      })).sort((a, b) => isAbsolute ? (b.improveRate ?? 0) - (a.improveRate ?? 0) : b.improvement - a.improvement);
    }
    if (displayMode === 'city') {
      return sel.districtRecords.map(r => ({
        region: r.districtName, regionCode: r.districtCode,
        improvement: calcImprovement(r.baseValue, r.currentValue, sel.direction),
        improveRate: calcImproveRate(r.baseValue, r.currentValue, sel.direction),
        baseValue: r.baseValue, currentValue: r.currentValue,
      })).sort((a, b) => isAbsolute ? (b.improveRate ?? 0) - (a.improveRate ?? 0) : b.improvement - a.improvement);
    }
    if (displayMode === 'district') {
      return sel.gridRecords.map(r => ({
        region: r.gridName, regionCode: r.gridCode,
        improvement: calcImprovement(r.baseValue, r.currentValue, sel.direction),
        improveRate: calcImproveRate(r.baseValue, r.currentValue, sel.direction),
        baseValue: r.baseValue, currentValue: r.currentValue,
      })).sort((a, b) => isAbsolute ? (b.improveRate ?? 0) - (a.improveRate ?? 0) : b.improvement - a.improvement);
    }
    return [];
  }, [sel, displayMode, isAbsolute]);

  // ====== 摘要统计 ======
  const summary = useMemo(() => {
    if (rankData.length === 0) return { rate: 0, improvedCount: 0, totalCount: 0 };
    const improvedCount = rankData.filter(r => r.improvement > 0).length;
    const totalCount = rankData.length;
    // 本级区域改善率/改善幅度
    let rate = 0;
    if (sel) {
      if (isAbsolute) {
        // 绝对量指标：本级整体改善率 = Σ(改善幅度) / Σ(基期值) × 100%
        const totalImprovement = rankData.reduce((s, r) => s + r.improvement, 0);
        const totalBase = rankData.reduce((s, r) => s + Math.abs(r.baseValue), 0);
        rate = totalBase > 0 ? Math.round(Math.abs(totalImprovement) / totalBase * 1000) / 10 : 0;
      } else {
        // 比率指标：本级平均改善幅度
        rate = Math.round(rankData.reduce((s, r) => s + r.improvement, 0) / totalCount * 10) / 10;
      }
    }
    return { rate, improvedCount, totalCount };
  }, [rankData, sel, isAbsolute]);

  // ====== 网格模式工单数据 ======
  const gridWorkOrders = useMemo(() => {
    if (displayMode !== 'grid' || !sel) return [];
    return sel.workOrderRecords.map(wo => ({
      ...wo,
      improvement: calcImprovement(wo.baseValue, wo.currentValue, wo.direction),
      improveRate: calcImproveRate(wo.baseValue, wo.currentValue, wo.direction),
    }));
  }, [displayMode, sel]);

  const gridPagedData = useMemo(() => {
    const start = (regionPage - 1) * regionPageSize;
    return gridWorkOrders.slice(start, start + regionPageSize);
  }, [gridWorkOrders, regionPage, regionPageSize]);

  const gridSummary = useMemo(() => {
    if (gridWorkOrders.length === 0) return { total: 0, improvedCount: 0, avgAchieve: 0 };
    const total = gridWorkOrders.length;
    const improvedCount = gridWorkOrders.filter(w => w.improvement > 0).length;
    const avgAchieve = Math.round(gridWorkOrders.reduce((s, w) => s + w.achieveRate, 0) / total * 10) / 10;
    return { total, improvedCount, avgAchieve };
  }, [gridWorkOrders]);

  const regionPagedData = useMemo(() => {
    const start = (regionPage - 1) * regionPageSize;
    return rankData.slice(start, start + regionPageSize);
  }, [rankData, regionPage, regionPageSize]);

  // 柱状图配置
  const chartYLabel = isAbsolute ? '改善率(%)' : `改善幅度(${sel?.unit === '%' ? 'pp' : sel?.unit})`;
  const chartDataKey = isAbsolute ? 'improveRate' : 'improvement';

  // 账期显示值
  const periodDisplay = timeMode === 'monthly'
    ? selectedMonth.replace('-', '年') + '月'
    : format(selectedDate, 'yyyy年M月d日', { locale: zhCN });

  if (!sel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">区域执行效果评估</h2>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            当前区域「{currentRegionName}」暂无评估数据
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 模块标题 */}
      <div className="flex items-center gap-3 border-b pb-3">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">
          {displayMode === 'grid' ? '工单执行效果明细' : '区域执行效果评估'}
        </h2>
        <Badge variant="outline" className="text-xs">
          {displayMode === 'province' ? '全疆视角' : displayMode === 'grid' ? `${selectedGridName}网格` : `${currentRegionName}视角`}
        </Badge>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
            <TooltipContent side="right" className="max-w-sm text-xs">
              <p>绿色=改善，红色=恶化。可加总类指标展示改善率（%）和改善幅度；比值类指标仅展示改善幅度（单位pp）；均值类指标仅展示改善幅度（原始单位）。</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 指标选择 + 账期 + 目标值（全疆视角内嵌） */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* 指标选择按钮（优先选择） */}
        <Target className="h-4 w-4 text-muted-foreground shrink-0" />
        <Button variant="outline" size="sm" className="h-8 text-sm" onClick={() => setIndicatorDialogOpen(true)}>
          {sel.indicatorName}（{sel.unit}）
        </Button>
        <IndicatorSelectDialog
          open={indicatorDialogOpen}
          onClose={() => setIndicatorDialogOpen(false)}
          indicators={indicatorAggregates.map(a => ({ id: a.indicatorId, name: a.indicatorName, unit: a.unit, category: a.category as Category }))}
          selectedId={effectiveIndicatorId}
          onSelect={handleIndicatorChange}
        />

        <div className="h-4 w-px bg-border" />

        {/* 账期：daily/both→日选择器，monthly→月选择器 */}
        {timeMode === 'monthly' ? (
          <MonthPicker value={selectedMonth} onChange={(val: string) => { setSelectedMonth(val); setRegionPage(1); }} />
        ) : (
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-sm gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {format(selectedDate, 'yyyy-MM-dd')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d: Date | undefined) => { if (d) { setSelectedDate(d); setDatePickerOpen(false); setRegionPage(1); } }}
                disabled={(d: Date) => d > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}

        {/* 全疆目标：仅全疆视角内嵌显示 */}
        {displayMode === 'province' && (
          <>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground">全疆目标：</span>
            <span className="text-sm font-semibold">{sel.provinceBaseValue}→{sel.provinceTargetValue}{sel.unit}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  <p>取最近一条关联该指标的全疆级调度工单设置的目标值</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>

      {/* ========== 网格模式：工单执行效果明细 ========== */}
      {displayMode === 'grid' && (
        <>
          {gridWorkOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                当前网格暂无工单执行数据
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 网格模式摘要卡片：2个 */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-muted-foreground">改善工单占比</span>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          <p>改善幅度&gt;0的工单数占总工单数的比例</p>
                        </TooltipContent>
                      </Tooltip></TooltipProvider>
                    </div>
                    <div className="mt-1 text-2xl font-bold text-emerald-600">
                      {gridSummary.improvedCount}<span className="text-sm font-normal text-muted-foreground">/{gridSummary.total}笔</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">平均达成率</span>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          <p>工单达成率 = 各指标达成率的算术平均值</p>
                          <p>单指标达成率 = (当前值-基期值)/(目标值-基期值)×100%</p>
                          <p>基期值=目标值时记100%，&lt;0记0%，&gt;100%记100%</p>
                        </TooltipContent>
                      </Tooltip></TooltipProvider>
                    </div>
                    <div className={`mt-1 text-2xl font-bold ${gridSummary.avgAchieve >= 80 ? 'text-emerald-600' : gridSummary.avgAchieve >= 60 ? 'text-amber-600' : 'text-destructive'}`}>
                      {gridSummary.avgAchieve}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 工单明细表 */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">工单执行明细</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>工单编号</TableHead>
                        <TableHead>调度类型</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead className="text-right">
                          改善幅度
                          <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help ml-0.5 inline" /></TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs">
                              <p>正向指标：当前-基期；负向指标：基期-当前。正值=改善</p>
                            </TooltipContent>
                          </Tooltip></TooltipProvider>
                        </TableHead>
                        <TableHead className="text-right">
                          工单达成率
                          <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help ml-0.5 inline" /></TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs">
                              <p>各指标达成率的算术平均值</p>
                              <p>单指标达成率=(当前值-基期值)/(目标值-基期值)×100%</p>
                            </TooltipContent>
                          </Tooltip></TooltipProvider>
                        </TableHead>
                        <TableHead className="text-right">基期值</TableHead>
                        <TableHead className="text-right">当前值</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gridPagedData.map(wo => {
                        const isImproved = wo.improvement > 0;
                        return (
                          <TableRow key={wo.workOrderId}>
                            <TableCell className="text-sm font-medium text-primary">{wo.workOrderId}</TableCell>
                            <TableCell className="text-sm">{wo.dispatchType}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{wo.createdAt}</TableCell>
                            <TableCell className={`text-right text-sm font-medium ${isImproved ? 'text-emerald-600' : 'text-destructive'}`}>
                              {formatImprovement(wo.improvement, sel.unit, sel.valueType)}
                            </TableCell>
                            <TableCell className={`text-right text-sm font-medium ${wo.achieveRate >= 80 ? 'text-emerald-600' : wo.achieveRate >= 60 ? 'text-amber-600' : 'text-destructive'}`}>
                              {wo.achieveRate.toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">{wo.baseValue}{sel.unit}</TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">{wo.currentValue}{sel.unit}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {gridWorkOrders.length > 0 && (
                    <div className="mt-3"><SimplePagination currentPage={regionPage} pageSize={regionPageSize} totalItems={gridWorkOrders.length} onPageChange={setRegionPage} onPageSizeChange={() => { setRegionPage(1); }} /></div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {/* ========== 全疆/地市/区县模式：区域改善排名 ========== */}
      {displayMode !== 'grid' && (
        <>
          {/* 摘要统计：2卡片 */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {isAbsolute ? '改善率' : '平均改善幅度'}
                  </span>
                  <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      {isAbsolute
                        ? <p>本级整体指标值较基期改善了百分之几（Σ改善幅度÷Σ基期值）</p>
                        : <p>各下级区域改善幅度的算术均值（Σ改善幅度÷区域数）</p>
                      }
                    </TooltipContent>
                  </Tooltip></TooltipProvider>
                </div>
                <div className="mt-1 text-2xl font-bold text-primary">
                  {isAbsolute
                    ? `${summary.rate > 0 ? '+' : ''}${summary.rate}%`
                    : `${summary.rate > 0 ? '+' : ''}${summary.rate}${sel.unit === '%' ? 'pp' : sel.unit}`
                  }
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">{regionLabel}改善占比</span>
                  <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      <p>改善幅度&gt;0的{regionLabel}数 / 总{regionLabel}数</p>
                    </TooltipContent>
                  </Tooltip></TooltipProvider>
                </div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">
                  {summary.improvedCount}/{summary.totalCount}{regionLabel}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({summary.totalCount > 0 ? Math.round(summary.improvedCount / summary.totalCount * 100) : 0}%)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 柱状图 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                「{sel.indicatorName}」各{regionLabel}{isAbsolute ? '改善率' : '改善幅度'}排名
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="region" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit={isAbsolute ? '%' : ''} />
                    <RechartsTooltip
                      formatter={(value: number, name: string) => {
                        if (name === chartDataKey) {
                          return isAbsolute
                            ? [`${value.toFixed(1)}%`, '改善率']
                            : [`${value > 0 ? '+' : ''}${value.toFixed(1)}${sel.unit === '%' ? 'pp' : sel.unit}`, '改善幅度'];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label: string) => `${regionLabel}：${label}`}
                    />
                    <ReferenceLine y={0} stroke="#666" />
                    <Bar dataKey={chartDataKey} radius={[4, 4, 0, 0]}>
                      {rankData.map((entry, index) => {
                        const val = isAbsolute ? (entry.improveRate ?? 0) : entry.improvement;
                        return <Cell key={index} fill={val > 0 ? '#10b981' : '#ef4444'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 区域明细表 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">「{sel.indicatorName}」{regionLabel}执行明细</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{regionLabel}</TableHead>
                    <TableHead className="text-right">
                      改善幅度
                      <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help ml-0.5 inline" /></TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          <p>正向指标：当前-基期；负向指标：基期-当前。正值=改善</p>
                        </TooltipContent>
                      </Tooltip></TooltipProvider>
                    </TableHead>
                    {isAbsolute && (
                      <TableHead className="text-right">
                        改善率
                        <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help ml-0.5 inline" /></TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            <p>改善幅度÷基期值×100%。仅可加总类指标</p>
                          </TooltipContent>
                        </Tooltip></TooltipProvider>
                      </TableHead>
                    )}
                    <TableHead className="text-right">基期值</TableHead>
                    <TableHead className="text-right">当前值</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionPagedData.map(record => {
                    const isImproved = record.improvement > 0;
                    return (
                      <TableRow key={record.region}>
                        <TableCell className="text-sm font-medium">{record.region}</TableCell>
                        <TableCell className={`text-right text-sm font-medium ${isImproved ? 'text-emerald-600' : 'text-destructive'}`}>
                          {formatImprovement(record.improvement, sel.unit, sel.valueType)}
                        </TableCell>
                        {isAbsolute && (
                          <TableCell className={`text-right text-sm font-medium ${isImproved ? 'text-emerald-600' : 'text-destructive'}`}>
                            {record.improveRate !== null ? `${record.improveRate.toFixed(1)}%` : (record.improvement > 0 ? '新建业务' : '—')}
                          </TableCell>
                        )}
                        <TableCell className="text-right text-sm text-muted-foreground">{record.baseValue}{sel.unit}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{record.currentValue}{sel.unit}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {rankData.length > 0 && (
                <div className="mt-3"><SimplePagination currentPage={regionPage} pageSize={regionPageSize} totalItems={rankData.length} onPageChange={setRegionPage} onPageSizeChange={() => { setRegionPage(1); }} /></div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
