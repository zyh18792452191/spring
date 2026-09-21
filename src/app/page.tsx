'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  AlertTriangle,
  Users,
  Wifi,
  BarChart3,
  Activity,
  Target,
  Zap,
  RefreshCw,
  Crown,
  Eye,
  Minus,
  Info,
  Send,
} from 'lucide-react';
import Header from '@/components/Header';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import IndicatorDetailDialog from '@/app/components/home/IndicatorDetailDialog';
import { indicatorModules } from '@/app/data/home/indicatorData';
import type { TimeMode, MainIndicator, SubIndicator } from '@/app/data/home/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ==================== 调度跟踪数据 ====================
type DispatchTimeFilter = 'all' | 'daily' | 'monthly';
type WorkOrderType = 'all' | 'indicator' | 'strategy' | 'group' | 'region' | 'opportunity';
type BusinessScene = 'all' | 'market' | 'traffic' | 'retention' | 'increment';

const WORK_ORDER_TYPE_OPTIONS: { value: WorkOrderType; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'indicator', label: '指标调度' },
  { value: 'strategy', label: '策略调度' },
  { value: 'group', label: '客群调度' },
  { value: 'region', label: '区域攻坚调度' },
  { value: 'opportunity', label: '商机调度' },
];

const BUSINESS_SCENE_OPTIONS: { value: BusinessScene; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'market', label: '大市场' },
  { value: 'traffic', label: '流量运营' },
  { value: 'retention', label: '离网维系' },
  { value: 'increment', label: '增量运营' },
];

interface DispatchSummary {
  total: number;
  inProgress: number;
  overtime: number;
  completed: number;
}

interface DispatchRegionItem {
  name: string;
  total: number;
  inProgress: number;
  overtime: number;
  completed: number;
}

interface DispatchData {
  summary: DispatchSummary;
  regionData: DispatchRegionItem[];
  label: string;
}

const provinceDispatchData: DispatchData = {
  summary: { total: 24889, inProgress: 4956, overtime: 968, completed: 18965 },
  regionData: [
    { name: '乌鲁木齐', total: 3256, inProgress: 648, overtime: 126, completed: 2482 },
    { name: '克拉玛依', total: 2823, inProgress: 562, overtime: 98, completed: 2163 },
    { name: '吐鲁番', total: 1856, inProgress: 368, overtime: 72, completed: 1416 },
    { name: '哈密', total: 1589, inProgress: 316, overtime: 62, completed: 1211 },
    { name: '昌吉', total: 2212, inProgress: 440, overtime: 86, completed: 1686 },
    { name: '博州', total: 1278, inProgress: 254, overtime: 50, completed: 974 },
    { name: '巴州', total: 1912, inProgress: 380, overtime: 74, completed: 1458 },
    { name: '阿克苏', total: 2156, inProgress: 428, overtime: 84, completed: 1644 },
    { name: '克州', total: 989, inProgress: 196, overtime: 38, completed: 755 },
    { name: '喀什', total: 2567, inProgress: 510, overtime: 100, completed: 1957 },
    { name: '和田', total: 1698, inProgress: 338, overtime: 66, completed: 1294 },
    { name: '伊犁', total: 2134, inProgress: 424, overtime: 83, completed: 1627 },
    { name: '塔城', total: 1378, inProgress: 274, overtime: 54, completed: 1050 },
    { name: '阿勒泰', total: 1159, inProgress: 230, overtime: 45, completed: 884 },
    { name: '奎屯', total: 1456, inProgress: 290, overtime: 56, completed: 1110 },
    { name: '石河子', total: 1689, inProgress: 336, overtime: 65, completed: 1288 },
  ],
  label: '全疆',
};

const cityDispatchData: DispatchData = {
  summary: { total: 3256, inProgress: 648, overtime: 126, completed: 2482 },
  regionData: [
    { name: '天山区', total: 526, inProgress: 108, overtime: 22, completed: 396 },
    { name: '沙依巴克区', total: 486, inProgress: 98, overtime: 18, completed: 370 },
    { name: '新市区', total: 512, inProgress: 102, overtime: 20, completed: 390 },
    { name: '水磨沟区', total: 398, inProgress: 78, overtime: 16, completed: 304 },
    { name: '头屯河区', total: 356, inProgress: 72, overtime: 14, completed: 270 },
    { name: '达坂城区', total: 186, inProgress: 38, overtime: 8, completed: 140 },
    { name: '米东区', total: 426, inProgress: 86, overtime: 16, completed: 324 },
    { name: '乌鲁木齐县', total: 168, inProgress: 34, overtime: 6, completed: 128 },
  ],
  label: '乌鲁木齐',
};

const dispatchByType: Record<Exclude<WorkOrderType, 'all'>, DispatchSummary> = {
  indicator: { total: 5892, inProgress: 1178, overtime: 230, completed: 4484 },
  strategy: { total: 4256, inProgress: 851, overtime: 166, completed: 3239 },
  group: { total: 6123, inProgress: 1225, overtime: 239, completed: 4659 },
  region: { total: 4678, inProgress: 934, overtime: 182, completed: 3562 },
  opportunity: { total: 3940, inProgress: 668, overtime: 151, completed: 3021 },
};

const dispatchByScene: Record<Exclude<BusinessScene, 'all'>, DispatchSummary> = {
  market: { total: 8456, inProgress: 1689, overtime: 330, completed: 6437 },
  traffic: { total: 6234, inProgress: 1246, overtime: 243, completed: 4745 },
  retention: { total: 5189, inProgress: 1037, overtime: 203, completed: 3949 },
  increment: { total: 5010, inProgress: 984, overtime: 192, completed: 3834 },
};

function getFilteredSummary(orderType: WorkOrderType, scene: BusinessScene): DispatchSummary {
  let base: DispatchSummary;
  if (orderType !== 'all') {
    base = dispatchByType[orderType];
  } else if (scene !== 'all') {
    base = dispatchByScene[scene];
  } else {
    base = provinceDispatchData.summary;
  }
  return base;
}

// ==================== 日/月维度双值系统 ====================
// 日维度=T-19日累计值，月维度=整月值（即原始value）
// 基于指标ID的确定性映射，确保同一指标每次渲染结果一致
const dailyValueOverrides: Record<string, { value?: number; changeValue?: string; subs?: Record<string, { value?: number; changeValue?: string }> }> = {
  // 大市场关键指标
  'key-chn-yoy': { value: -3.12, changeValue: '-0.24pp', subs: { '较上月同期': { value: -3.45 }, '较上月改善': { value: 0.08 } } },
  'key-personal-yoy': { value: -9.05, changeValue: '-3.82pp', subs: { '较上月同期': { value: -3.87 }, '较上月改善': { value: 0.06 } } },
  'key-family-yoy': { value: -18.42, changeValue: '-2.35pp', subs: { '较上月同期': { value: -2.18 }, '较上月改善': { value: 0.18 } } },
  'key-gotone-churn': { value: 3912, changeValue: '-16.83%', subs: { '较上月同期': { value: -16.83 }, '超限率': { value: -35.27, changeValue: '+4.16pp' } } },
  'key-gotone-scale': { value: 99.41, subs: { '较上月底': { value: -0.18 }, '与目标差值': { value: 0.41 } } },
  'key-downgrade': { value: 1.13, changeValue: '-10.25%', subs: { '较上月同期': { value: -10.25 }, '超限率': { value: -48.63, changeValue: '+5.72pp' } } },
  'key-plan-op': { value: 8.97, changeValue: '+1.38%', subs: { '升档收入': { value: 109.52, changeValue: '-8.76%' }, '较上月同期': { value: 1.38 } } },
  'key-san-kuo': { value: 4.29, changeValue: '-16.85pp', subs: { '三扩三融率': { value: 1.35, changeValue: '-1.23pp' }, '较上月同期': { value: -16.85 } } },
  'key-risk-gov': { value: 1.48, subs: { '当月治理率': { value: 1.53, changeValue: '+1.53pp' }, '当年治理率': { value: 9.18, changeValue: '+0.72pp' } } },
  'key-midhigh-forecast': { value: 102.87, subs: { '环比上月': { value: -0.18 }, '与目标差值': { value: -0.19 } } },
  // 大市场重点指标
  'foc-daily-new': { value: 8175, subs: { '新增份额': { value: 37.95 }, '副卡占比': { value: 30.02 }, '纯新增占比': { value: 59.99 } } },
  'foc-monthly-new': { value: 10.65, changeValue: '+6.23%', subs: { '新增份额': { value: 35.82 }, '副卡占比': { value: 29.47 }, '纯新增占比': { value: 58.13 } } },
  'foc-bill-cust': { value: 1365.23, changeValue: '+0.38%', subs: { '较上月净增': { value: 4.56, changeValue: '-18.34%' }, '较上年末净增': { value: 10.81, changeValue: '+28.56%' }, '月净增份额': { value: 91.27, changeValue: '-1.66pp' } } },
  'foc-churn-cust': { value: 10.14, changeValue: '+6.82%', subs: { '当月离网率': { value: 0.68, changeValue: '+0.03pp' }, '月均离网率': { value: 1.15, changeValue: '-0.05pp' } } },
  'foc-bb-cust': { value: 546.32, changeValue: '+0.35%', subs: { '有线宽带较上月末净增': { value: 1.42, changeValue: '-25.18%' }, '有线宽带较上年末净增': { value: 14.37, changeValue: '+31.82%' }, '家庭宽带较上月末净增': { value: 0.95, changeValue: '-18.74%' }, '家庭宽带较上年末净增': { value: 11.43, changeValue: '+35.61%' } } },
  'foc-daily-bb-new': { value: 2716, subs: { '家宽新增': { value: 2143 }, '企宽新增': { value: 573 } } },
  'foc-monthly-bb-new': { value: 3.41, changeValue: '-13.28%', subs: { '家宽新增': { value: 2.61, changeValue: '-10.95%' }, '企宽新增': { value: 0.63, changeValue: '-17.83%' }, 'FTTR当月新增': { value: 5836 }, 'FTTR当月新增环比': { value: -13.28 } } },
  'foc-open-down': { value: 0.14, subs: { '当月开新降旧占比': { value: 0.16, changeValue: '+0.02pp' }, 'T-1月开新降旧弃旧占比': { value: 2.09 } } },
  // 中高端运营
  'mh-net-add': { value: 2.28, changeValue: '-15.67%', subs: { '环比上月': { value: -15.67 } } },
};

// 获取指标在当前维度下的显示值
function getIndicatorValue(ind: MainIndicator, timeMode: 'daily' | 'monthly'): number {
  if (timeMode === 'monthly' || !dailyValueOverrides[ind.id]) return ind.value;
  return dailyValueOverrides[ind.id].value ?? ind.value;
}

// 获取主指标在当前维度下的较月同期
function getIndicatorChangeValue(ind: MainIndicator, timeMode: 'daily' | 'monthly'): string | undefined {
  if (timeMode === 'monthly' || !dailyValueOverrides[ind.id]) return ind.changeValue;
  return dailyValueOverrides[ind.id].changeValue ?? ind.changeValue;
}

// 获取子指标在当前维度下的值
function getSubValue(ind: MainIndicator, sub: SubIndicator, timeMode: 'daily' | 'monthly'): number {
  if (timeMode === 'monthly' || !dailyValueOverrides[ind.id]?.subs?.[sub.name]) return sub.value;
  return dailyValueOverrides[ind.id]?.subs?.[sub.name]?.value ?? sub.value;
}

// 获取子指标在当前维度下的较月同期
function getSubChangeValue(ind: MainIndicator, sub: SubIndicator, timeMode: 'daily' | 'monthly'): string | undefined {
  if (timeMode === 'monthly' || !dailyValueOverrides[ind.id]?.subs?.[sub.name]) return sub.changeValue;
  return dailyValueOverrides[ind.id]?.subs?.[sub.name]?.changeValue ?? sub.changeValue;
}

// ==================== 辅助函数 ====================
function formatIndicatorValue(value: number, unit: string): string {
  if (unit === '户' && Math.abs(value) >= 10000) return (value / 10000).toFixed(2) + '万';
  if (unit === '%') return value.toFixed(2);
  if (unit === 'GB' || unit === '万户' || unit === '万元' || unit === 'pp') return value.toFixed(2);
  if (Number.isInteger(value) || Math.abs(value) >= 1000) return value.toLocaleString();
  return value.toFixed(2);
}

function getChangeIcon(direction: 'up' | 'down' | 'flat') {
  if (direction === 'up') return <ArrowUp className="h-3 w-3" />;
  if (direction === 'down') return <ArrowDown className="h-3 w-3" />;
  return <Minus className="h-2.5 w-2.5" />;
}

function getChangeColor(name: string, direction: 'up' | 'down' | 'flat'): string {
  if (direction === 'flat') return 'text-gray-400';
  const reverseIndicators = ['离网率', '49元以下占比', '电信过网', '降档规模', '联通'];
  const isReverse = reverseIndicators.some(k => name.includes(k));
  if (isReverse) return direction === 'up' ? 'text-red-500' : 'text-emerald-600';
  return direction === 'up' ? 'text-emerald-600' : 'text-red-500';
}

// ==================== 区块标题 ====================
function SectionTitle({ title, color = 'blue' }: { title: string; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-500',
  };
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className={`h-px w-6 ${colorMap[color] || 'bg-blue-500'}`} />
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

// ==================== 展示形态1：大数字卡片（变化率/绝对值，无天然上限）====================
// 适用：同比增幅、客户数、收入规模等 — 不适合环形/进度条
function BigNumberCard({
  indicator,
  timeMode,
  onClick,
  accentColor = 'blue',
}: {
  indicator: MainIndicator;
  timeMode: TimeMode;
  onClick: () => void;
  accentColor?: string;
}) {
  const hasSub = indicator.subIndicators.length > 0;

  const borderColor: Record<string, string> = {
    blue: 'border-t-blue-500',
    cyan: 'border-t-cyan-500',
    green: 'border-t-green-500',
    orange: 'border-t-orange-500',
    red: 'border-t-red-500',
    purple: 'border-t-purple-500',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 border-t-3 ${borderColor[accentColor] || borderColor.blue} ${
        hasSub ? 'cursor-pointer hover:shadow-md' : ''
      } transition-all`}
      onClick={hasSub ? onClick : undefined}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <p className="text-xs text-gray-500 truncate" title={indicator.name}>{indicator.name}</p>
          {indicator.caliber && (
            <span title={indicator.caliber} className="shrink-0">
              <Info className="h-3 w-3 text-gray-300 hover:text-blue-400 cursor-help" />
            </span>
          )}
        </div>
        {hasSub && (
          <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5" />
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">
          {formatIndicatorValue(getIndicatorValue(indicator, timeMode), indicator.unit)}
        </span>
        <span className="text-xs text-gray-400">{indicator.unit}</span>
      </div>
      {/* 子指标预览：展示全部，统一格式=标签名: 值单位 */}
      {indicator.subIndicators.length > 0 && (
        <div className="space-y-0.5 mt-1.5">
          {indicator.subIndicators.map((sub) => (
            <div key={sub.id} className="flex items-center gap-0.5 text-xs">
              <span className="text-gray-400">{sub.name}:</span>
              <span className={`font-medium ${sub.isPositive !== undefined ? getChangeColor(sub.name, sub.changeDirection || 'flat') : 'text-gray-600'}`}>
                {formatIndicatorValue(getSubValue(indicator, sub, timeMode), sub.unit)}{sub.unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== 展示形态2：横条+图标+色条 ====================
function StripIndicatorCard({
  indicator,
  timeMode,
  onClick,
  colorClass = 'border-l-blue-500',
  iconBgClass = 'bg-blue-50 text-blue-500',
}: {
  indicator: MainIndicator;
  timeMode: TimeMode;
  onClick: () => void;
  colorClass?: string;
  iconBgClass?: string;
}) {
  const hasSub = indicator.subIndicators.length > 0;

  const getIcon = () => {
    const name = indicator.name;
    if (name.includes('收入') || name.includes('增幅')) return <TrendingUp className="h-4 w-4" />;
    if (name.includes('离网') || name.includes('降档')) return <TrendingDown className="h-4 w-4" />;
    if (name.includes('客户') || name.includes('出账')) return <Users className="h-4 w-4" />;
    if (name.includes('全球通')) return <Shield className="h-4 w-4" />;
    if (name.includes('中高端')) return <UserCheck className="h-4 w-4" />;
    if (name.includes('宽带') || name.includes('FTTR')) return <Wifi className="h-4 w-4" />;
    if (name.includes('流量') || name.includes('DOU')) return <Activity className="h-4 w-4" />;
    if (name.includes('份额')) return <BarChart3 className="h-4 w-4" />;
    if (name.includes('三扩') || name.includes('超套')) return <Target className="h-4 w-4" />;
    if (name.includes('风险') || name.includes('预警')) return <AlertTriangle className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-3 border-l-4 ${colorClass} ${
        hasSub ? 'cursor-pointer hover:shadow-md' : ''
      } transition-shadow`}
      onClick={hasSub ? onClick : undefined}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${iconBgClass}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-xs text-gray-500 truncate" title={indicator.name}>{indicator.name}</p>
            {indicator.caliber && (
              <span title={indicator.caliber} className="shrink-0">
                <Info className="h-3 w-3 text-gray-300 hover:text-blue-400 cursor-help" />
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900">
              {formatIndicatorValue(getIndicatorValue(indicator, timeMode), indicator.unit)}
            </span>
            <span className="text-xs text-gray-500">{indicator.unit}</span>
          </div>
          {indicator.subIndicators.length > 0 && (
            <div className="space-y-0.5 mt-0.5">
              {indicator.subIndicators.map((sub) => (
                <div key={sub.id} className="flex items-center gap-0.5 text-xs">
                  <span className="text-gray-400">{sub.name}:</span>
                  <span className={`font-medium ${sub.isPositive !== undefined ? getChangeColor(sub.name, sub.changeDirection || 'flat') : 'text-gray-600'}`}>
                    {formatIndicatorValue(getSubValue(indicator, sub, timeMode), sub.unit)}{sub.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {hasSub && (
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
        )}
      </div>
    </div>
  );
}

// ==================== 展示形态3：环形进度（占比率/保有率/完成率指标）====================
// 适用：保有率、保拓率、份额、完成率等 — 值本身就是百分比
// 注意：保有率/完成率可能>100%（超额完成），需特殊处理
function GaugeCard({
  indicator,
  timeMode,
  onClick,
  gaugeColor = '#3b82f6',
  gaugeType = 'ratio', // ratio=占比型(上限100%), retention=保有率(可>100%), completion=完成率(可>100%)
}: {
  indicator: MainIndicator;
  timeMode: TimeMode;
  onClick: () => void;
  gaugeColor?: string;
  gaugeType?: 'ratio' | 'retention' | 'completion';
}) {
  const hasSub = indicator.subIndicators.length > 0;

  const rawValue = typeof getIndicatorValue(indicator, timeMode) === 'number' ? getIndicatorValue(indicator, timeMode) as number : 0;
  const isNegative = rawValue < 0;
  const isOverflow = rawValue > 100; // 超标标记
  // 环形最多画满100%，>100%时画满环+标注实际值；负值时画最小10%红色环
  const percent = useMemo(() => {
    if (isNegative) return 10;
    return Math.min(rawValue, 100);
  }, [rawValue, isNegative]);

  const pieData = [
    { name: '完成', value: percent },
    { name: '剩余', value: 100 - percent },
  ];

  // 颜色阈值根据gaugeType细化
  const resolvedColor = useMemo(() => {
    // 负值统一红色
    if (isNegative) return '#ef4444';
    if (gaugeType === 'retention') {
      // 保有率：越高越好，阈值更严格
      if (isOverflow) return '#15803d';      // 深绿-超额达标
      if (rawValue >= 98) return '#22c55e';  // 绿色-达标
      if (rawValue >= 95) return gaugeColor;  // 主题色-良好
      if (rawValue >= 90) return '#f59e0b';  // 黄色-注意
      return '#ef4444';                       // 红色-预警
    }
    if (gaugeType === 'completion') {
      // 完成率：100%是标准线
      if (isOverflow) return '#15803d';      // 深绿-超额完成
      if (rawValue >= 100) return '#22c55e'; // 绿色-完成
      if (rawValue >= 90) return gaugeColor;  // 主题色-接近
      if (rawValue >= 80) return '#f59e0b';  // 黄色-落后
      return '#ef4444';                       // 红色-严重落后
    }
    // 占比型（ratio）：60%以下偏低，95%以上算高
    if (rawValue >= 95) return '#22c55e';
    if (rawValue >= 80) return gaugeColor;
    if (rawValue >= 60) return '#f59e0b';
    return '#ef4444';
  }, [rawValue, isOverflow, gaugeType, gaugeColor, isNegative]);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 ${
        hasSub ? 'cursor-pointer hover:shadow-md' : ''
      } transition-all`}
      onClick={hasSub ? onClick : undefined}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={18}
                outerRadius={28}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={resolvedColor} />
                <Cell fill="#f3f4f6" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            {isNegative ? (
              // 负值：红色显示实际负值
              <span className="text-[10px] font-bold text-red-500">{rawValue.toFixed(1)}%</span>
            ) : isOverflow ? (
              // >100%时显示实际值，用深绿色突出
              <span className="text-[10px] font-bold text-green-700">{rawValue.toFixed(1)}%</span>
            ) : (
              <span className="text-xs font-bold text-gray-700">{`${Math.round(percent)}%`}</span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-xs text-gray-500 truncate" title={indicator.name}>{indicator.name}</p>
            {indicator.caliber && (
              <span title={indicator.caliber} className="shrink-0">
                <Info className="h-3 w-3 text-gray-300 hover:text-blue-400 cursor-help" />
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-xl font-bold ${isNegative ? 'text-red-500' : isOverflow ? 'text-green-700' : 'text-gray-900'}`}>
              {formatIndicatorValue(getIndicatorValue(indicator, timeMode), indicator.unit)}
            </span>
            <span className="text-xs text-gray-400">{indicator.unit}</span>
          </div>
          {indicator.subIndicators.length > 0 && (
            <div className="space-y-0.5 mt-0.5">
              {indicator.subIndicators.map((sub) => (
                <div key={sub.id} className="flex items-center gap-0.5 text-xs">
                  <span className="text-gray-400">{sub.name}:</span>
                  <span className={`font-medium ${sub.isPositive !== undefined ? getChangeColor(sub.name, sub.changeDirection || 'flat') : 'text-gray-600'}`}>
                    {formatIndicatorValue(getSubValue(indicator, sub, timeMode), sub.unit)}{sub.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== 展示形态4：带进度条（占比率/完成率指标）====================
// 适用：占比、完成率等 — 进度条的100%就是指标本身的上限
// 注意：完成率可能>100%（超额完成），需特殊处理
function ProgressBarCard({
  indicator,
  timeMode,
  onClick,
  barColor = 'bg-blue-500',
  barType = 'ratio', // ratio=占比型, completion=完成率(可>100%)
}: {
  indicator: MainIndicator;
  timeMode: TimeMode;
  onClick: () => void;
  barColor?: string;
  barType?: 'ratio' | 'completion';
}) {
  const hasSub = indicator.subIndicators.length > 0;
  const sub = hasSub ? indicator.subIndicators[0] : null;

  const rawValue = typeof getIndicatorValue(indicator, timeMode) === 'number' ? getIndicatorValue(indicator, timeMode) as number : 0;
  const isOverflow = rawValue > 100;
  // 进度条最多100%宽，>100%时画满+右侧显示实际值
  const percent = useMemo(() => {
    return Math.min(Math.max(rawValue, 0), 100);
  }, [rawValue]);

  // 进度条颜色根据类型和完成度细化
  const resolvedBarColor = useMemo(() => {
    if (barType === 'completion') {
      if (isOverflow) return 'bg-green-700';   // 深绿-超额完成
      if (rawValue >= 100) return 'bg-green-500';
      if (rawValue >= 90) return barColor;
      if (rawValue >= 80) return 'bg-amber-500';
      return 'bg-red-500';
    }
    // 占比型
    if (rawValue >= 95) return 'bg-green-500';
    if (rawValue >= 80) return barColor;
    if (rawValue >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  }, [rawValue, isOverflow, barType, barColor]);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-3.5 ${
        'cursor-pointer hover:shadow-md transition-all'
      }`}
      onClick={hasSub ? onClick : undefined}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <p className="text-xs text-gray-500 truncate" title={indicator.name}>{indicator.name}</p>
          {indicator.caliber && (
            <span title={indicator.caliber} className="shrink-0">
              <Info className="h-3 w-3 text-gray-300 hover:text-blue-400 cursor-help" />
            </span>
          )}
        </div>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-xl font-bold ${isOverflow ? 'text-green-700' : 'text-gray-900'}`}>
          {formatIndicatorValue(getIndicatorValue(indicator, timeMode), indicator.unit)}
        </span>
        <span className="text-xs text-gray-400">{indicator.unit}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${resolvedBarColor}`} style={{ width: `${percent}%` }} />
      </div>
      {indicator.subIndicators.length > 0 && (
        <div className="space-y-0.5 mt-1.5">
          {indicator.subIndicators.map((sub) => (
            <div key={sub.id} className="flex items-center gap-0.5 text-xs">
              <span className="text-gray-400">{sub.name}:</span>
              <span className={`font-medium ${sub.isPositive !== undefined ? getChangeColor(sub.name, sub.changeDirection || 'flat') : 'text-gray-600'}`}>
                {formatIndicatorValue(getSubValue(indicator, sub, timeMode), sub.unit)}{sub.unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== 展示形态5：分组指标卡片（存量运营风格）====================
// 内部根据指标数据性质自动选择展示形态：占比率→环形进度，绝对值→横条+图标
function GroupIndicatorCard({
  title,
  indicators,
  timeMode,
  onIndicatorClick,
  headerGradient = 'from-blue-50 to-white',
  headerIcon = <Shield className="h-4 w-4 text-blue-500" />,
  horizontalLayout = false,
}: {
  title: string;
  indicators: MainIndicator[];
  timeMode: TimeMode;
  onIndicatorClick: (ind: MainIndicator) => void;
  headerGradient?: string;
  headerIcon?: React.ReactNode;
  horizontalLayout?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className={`flex items-center gap-2 px-4 py-3 border-b bg-gradient-to-r ${headerGradient}`}>
        {headerIcon}
        <h3 className="font-medium text-gray-800 text-sm">{title}</h3>
      </div>
      <div className={`p-3 flex-1 flex flex-col ${horizontalLayout ? 'grid gap-3' : 'gap-2'}`} style={horizontalLayout ? { gridTemplateColumns: `repeat(${indicators.length}, 1fr)` } : undefined}>
        {indicators.map((ind) => {
          const isPercentType = ind.unit === '%' && Math.abs(ind.value) <= 100;
          
          if (isPercentType) {
            // 占比率/保有率 → 迷你环形进度+值（保有率可>100%）
            const rawVal = ind.value;
            const isOver = rawVal > 100;
            const isNeg = rawVal < 0;
            const val = isNeg ? 10 : Math.min(Math.max(rawVal, 0), 100); // 负值显示最小10%红色环
            const ringColor = isNeg ? '#ef4444' : isOver ? '#15803d' : val >= 98 ? '#22c55e' : val >= 90 ? '#3b82f6' : val >= 80 ? '#f59e0b' : '#ef4444';
            return (
              <div
                key={ind.id}
                className="flex items-center gap-3 bg-muted/50 rounded-md px-3 py-2 cursor-pointer hover:bg-muted/80 flex-1 min-h-0"
                onClick={() => onIndicatorClick(ind)}
              >
                <div className="relative w-9 h-9 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ name: '完成', value: val }, { name: '剩余', value: 100 - val }]}
                        innerRadius={10}
                        outerRadius={16}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={ringColor} />
                        <Cell fill="#f3f4f6" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground truncate" title={ind.name}>{ind.name}</p>
                    {ind.caliber && (
                      <span title={ind.caliber} className="shrink-0">
                        <Info className="h-3 w-3 text-gray-300 hover:text-blue-400 cursor-help" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-sm font-semibold ${isNeg ? 'text-red-500' : isOver ? 'text-green-700' : 'text-foreground'}`}>
                      {`${formatIndicatorValue(getIndicatorValue(ind, timeMode), ind.unit)}${ind.unit}`}
                    </span>
                  </div>
                  {ind.subIndicators.length > 0 && (
                    <div className="space-y-0.5 mt-0.5">
                      {ind.subIndicators.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-0.5 text-xs">
                          <span className="text-gray-400">{sub.name}:</span>
                          <span className={`font-medium ${sub.isPositive !== undefined ? getChangeColor(sub.name, sub.changeDirection || 'flat') : 'text-gray-500'}`}>
                            {formatIndicatorValue(getSubValue(ind, sub, timeMode), sub.unit)}{sub.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // 绝对值 → 横条+值
          return (
            <div
              key={ind.id}
              className="bg-muted/50 rounded-md px-3 py-2 cursor-pointer hover:bg-muted/80 flex-1 min-h-0"
              onClick={() => onIndicatorClick(ind)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-sm text-muted-foreground truncate" title={ind.name}>{ind.name}</span>
                  {ind.caliber && (
                    <span title={ind.caliber} className="shrink-0">
                      <Info className="h-3 w-3 text-gray-300 hover:text-blue-400 cursor-help" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm font-semibold text-foreground">
                    {`${formatIndicatorValue(getIndicatorValue(ind, timeMode), ind.unit)}${ind.unit}`}
                  </span>
                </div>
              </div>
              {ind.subIndicators.length > 0 && (
                <div className="space-y-0.5 mt-1">
                  {ind.subIndicators.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-0.5 text-xs">
                      <span className="text-gray-400">{sub.name}:</span>
                      <span className={`font-medium ${sub.isPositive !== undefined ? getChangeColor(sub.name, sub.changeDirection || 'flat') : 'text-gray-500'}`}>
                        {formatIndicatorValue(getSubValue(ind, sub, timeMode), sub.unit)}{sub.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 主页面 ====================
export default function HomePage() {
  const [timeMode, setTimeMode] = useState<TimeMode>('monthly');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [regionValue, setRegionValue] = useState<{ cityCode?: string; gridCode?: string }>({});
  const [regionLabel, setRegionLabel] = useState('全疆');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<MainIndicator | null>(null);

  // 调度跟踪筛选状态
  const [dispatchTimeFilter, setDispatchTimeFilter] = useState<DispatchTimeFilter>('all');
  const [workOrderType, setWorkOrderType] = useState<WorkOrderType>('all');
  const [businessScene, setBusinessScene] = useState<BusinessScene>('all');
  const [dispatchDate, setDispatchDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  });

  // 日期相关
  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const formatYearMonth = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月`;
  const dailyLabel = formatDate(selectedDate);
  const lastMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
  const monthlyLabel = formatYearMonth(lastMonth);

  const changeDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + (direction === 'prev' ? -1 : 1));
      return d;
    });
  };

  // 日历
  const calendarYear = selectedDate.getFullYear();
  const calendarMonth = selectedDate.getMonth();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];

  // 区域
  const isUrumqi = regionValue.cityCode === '650100';
  const regionName = useMemo(() => {
    if (isUrumqi && regionValue.gridCode) return regionLabel || '网格';
    if (isUrumqi) return '乌鲁木齐';
    if (regionValue.cityCode) return regionLabel;
    return '全疆';
  }, [isUrumqi, regionValue, regionLabel]);

  // 调度跟踪数据
  const dispatchData = useMemo(() => isUrumqi ? cityDispatchData : provinceDispatchData, [isUrumqi]);
  const filteredSummary = useMemo(() => getFilteredSummary(workOrderType, businessScene), [workOrderType, businessScene]);
  const filteredCompletionRate = useMemo(() => filteredSummary.total > 0 ? Math.round((filteredSummary.completed / filteredSummary.total) * 100) : 0, [filteredSummary]);

  // 调度跟踪日期格式化
  const dispatchDailyLabel = `${dispatchDate.getFullYear()}-${String(dispatchDate.getMonth() + 1).padStart(2, '0')}-${String(dispatchDate.getDate()).padStart(2, '0')}`;
  const dispatchMonthlyLabel = `${dispatchDate.getFullYear()}年${dispatchDate.getMonth() + 1}月`;
  const changeDispatchDate = (direction: 'prev' | 'next') => {
    setDispatchDate(prev => {
      const d = new Date(prev);
      if (dispatchTimeFilter === 'daily') d.setDate(d.getDate() + (direction === 'prev' ? -1 : 1));
      else d.setMonth(d.getMonth() + (direction === 'prev' ? -1 : 1));
      return d;
    });
  };

  // 指标点击
  const handleIndicatorClick = useCallback((indicator: MainIndicator) => {
    setSelectedIndicator(indicator);
    setDialogOpen(true);
  }, []);
  const handleDialogClose = useCallback(() => { setDialogOpen(false); setSelectedIndicator(null); }, []);

  // 获取模块指标
  const keyModule = indicatorModules.find(m => m.id === 'key-market')!;
  const focusModule = indicatorModules.find(m => m.id === 'focus-market')!;
  const trafficOverviewModule = indicatorModules.find(m => m.id === 'traffic-overview')!;
  const trafficProjectModule = indicatorModules.find(m => m.id === 'traffic-project')!;
  const gotoneModule = indicatorModules.find(m => m.id === 'gotone-retention')!;
  const midHighModule = indicatorModules.find(m => m.id === 'mid-high')!;

  // 可用指标过滤（不匹配维度的指标隐藏不展示）
  const getAvailableIndicators = (module: typeof indicatorModules[0]) => {
    const all = module.indicators;
    const available = all.filter(ind => ind.availableTimeMode === 'both' || ind.availableTimeMode === timeMode);
    const hiddenCount = all.length - available.length;
    return { available, hiddenCount };
  };
  const keyAvail = getAvailableIndicators(keyModule);
  const focusAvail = getAvailableIndicators(focusModule);
  const trafficOverviewAvail = getAvailableIndicators(trafficOverviewModule);
  const trafficProjectAvail = getAvailableIndicators(trafficProjectModule);
  const gotoneAvail = getAvailableIndicators(gotoneModule);
  const midHighAvail = getAvailableIndicators(midHighModule);



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        {/* ====== 页面级筛选栏：仅区域选择器（全局作用域） ====== */}
        <div className="bg-white border-b sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-4">
            <span className="text-xs text-muted-foreground whitespace-nowrap">数据范围</span>
            <XinjiangRegionSelector
              value={{ cityCode: regionValue.cityCode, gridCode: regionValue.gridCode }}
              onChange={(_cityCode: string, _cityName: string, _gridCode: string, _gridName: string) => {
                setRegionValue(prev => ({ ...prev, cityCode: _cityCode || undefined, gridCode: _gridCode || undefined }));
                setRegionLabel(_gridName || _cityName || '全疆');
              }}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-4 space-y-5">

          {/* ====== 数据概览子工具栏：日/月维度 + 日期选择器（仅作用于指标区块） ====== */}
          <div className="bg-white rounded-lg shadow-sm border px-5 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-foreground">数据概览</h2>
            </div>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
              <button className={`px-3 py-1 rounded text-xs font-medium transition-colors ${timeMode === 'daily' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setTimeMode('daily')}>日维度</button>
              <button className={`px-3 py-1 rounded text-xs font-medium transition-colors ${timeMode === 'monthly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setTimeMode('monthly')}>月维度</button>
            </div>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <button onClick={() => changeDate('prev')} className="p-0.5 hover:bg-muted rounded"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
              <div className="relative">
                <button onClick={() => setShowDatePicker(!showDatePicker)} className="text-sm font-medium text-foreground hover:text-primary px-2 py-0.5 rounded hover:bg-primary/5">
                  {timeMode === 'daily' ? dailyLabel : monthlyLabel}
                </button>
                {showDatePicker && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-card border rounded-lg shadow-lg p-3 z-20 w-72">
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth() - 1); setSelectedDate(d); }} className="p-1 hover:bg-muted rounded"><ChevronLeft className="h-4 w-4" /></button>
                      <span className="font-medium text-sm">{calendarYear}年{calendarMonth + 1}月</span>
                      <button onClick={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth() + 1); setSelectedDate(d); }} className="p-1 hover:bg-muted rounded"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                      {weekLabels.map(w => <div key={w} className="text-center text-xs text-muted-foreground py-1">{w}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                      {blanks.map(i => <div key={`b-${i}`} />)}
                      {calendarDays.map(day => {
                        const isToday = day === selectedDate.getDate() && calendarMonth === selectedDate.getMonth() && calendarYear === selectedDate.getFullYear();
                        return <button key={day} onClick={() => { setSelectedDate(new Date(calendarYear, calendarMonth, day)); setShowDatePicker(false); }} className={`text-xs py-1 rounded hover:bg-muted ${isToday ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}>{day}</button>;
                      })}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => changeDate('next')} className="p-0.5 hover:bg-muted rounded"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
            </div>
          </div>

          {/* ====== 区块1：大市场关键指标 — 10个both指标，日/月维度均可展示 ====== */}
          {keyAvail.available.length > 0 && (
          <section>
            <SectionTitle title="大市场关键指标" color="blue" />
            <div className={`grid gap-3 ${keyAvail.available.length <= 6 ? 'grid-cols-3' : keyAvail.available.length <= 8 ? 'grid-cols-4' : 'grid-cols-5'}`}>
              {keyAvail.available.map((ind) => {
                if (ind.id === 'key-midhigh-forecast' || ind.id === 'key-gotone-scale') {
                  return (
                    <GaugeCard
                      key={ind.id}
                      indicator={ind}
                      timeMode={timeMode}
                      onClick={() => handleIndicatorClick(ind)}
                      gaugeColor={ind.id === 'key-midhigh-forecast' ? '#8b5cf6' : '#3b82f6'}
                    />
                  );
                }
                return (
                  <BigNumberCard
                    key={ind.id}
                    indicator={ind}
                    timeMode={timeMode}
                    onClick={() => handleIndicatorClick(ind)}
                    accentColor="blue"
                  />
                );
              })}
            </div>
          </section>
          )}

          {/* ====== 区块2：大市场重点指标 — 日维度8个(grid-cols-4)，月维度6个(grid-cols-3) ====== */}
          {focusAvail.available.length > 0 && (
          <section>
            <SectionTitle title="大市场重点指标" color="orange" />
            <div className={`grid gap-3 ${focusAvail.available.length <= 4 ? 'grid-cols-2' : focusAvail.available.length <= 6 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {focusAvail.available.map((ind) => {
                if (ind.id === 'foc-open-down') {
                  return (
                    <ProgressBarCard
                      key={ind.id}
                      indicator={ind}
                      timeMode={timeMode}
                      onClick={() => handleIndicatorClick(ind)}
                      barColor="bg-orange-500"
                    />
                  );
                }
                return (
                  <StripIndicatorCard
                    key={ind.id}
                    indicator={ind}
                    timeMode={timeMode}
                    onClick={() => handleIndicatorClick(ind)}
                    colorClass="border-l-orange-500"
                    iconBgClass="bg-orange-50 text-orange-500"
                  />
                );
              })}
            </div>
          </section>
          )}

          {/* ====== 区块3：流量运营 — 仅月维度展示（日维度下所有指标均不可用，整个区域隐藏） ====== */}
          {(trafficOverviewAvail.available.length > 0 || trafficProjectAvail.available.length > 0) && (
          <section>
            <SectionTitle title="流量运营" color="cyan" />
            <div className="grid grid-cols-12 gap-4">
              {/* 左侧：流量运营重点指标 — GroupIndicatorCard行布局 */}
              {trafficOverviewAvail.available.length > 0 && (
              <div className="col-span-4 h-full">
                <GroupIndicatorCard
                  title="流量运营重点指标"
                  indicators={trafficOverviewAvail.available}
                  timeMode={timeMode}
                  onIndicatorClick={handleIndicatorClick}
                  headerGradient="from-cyan-50 to-white"
                  headerIcon={<Activity className="h-4 w-4 text-cyan-500" />}
                />
              </div>
              )}
              {/* 右侧：流量头号工程 - 3行分组：占比行(3进度条) + DOU对比行(3大数字) + 超套对比行(3大数字) */}
              {trafficProjectAvail.available.length > 0 && (
              <div className={trafficOverviewAvail.available.length > 0 ? 'col-span-8 h-full' : 'col-span-12 h-full'}>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
                  <div className="flex items-center gap-2 px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-white">
                    <Target className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium text-gray-800 text-sm">流量头号工程</h3>
                  </div>
                  <div className="p-3 space-y-3">
                    {/* 第一行：占比指标（3个进度条横排） */}
                    {trafficProjectAvail.available.length >= 3 && (
                    <div className="grid grid-cols-3 gap-2">
                      {trafficProjectAvail.available.slice(0, 3).map((ind) => (
                        <ProgressBarCard
                          key={ind.id}
                          indicator={ind}
                          timeMode={timeMode}
                          onClick={() => handleIndicatorClick(ind)}
                          barColor="bg-blue-500"
                        />
                      ))}
                    </div>
                    )}
                    {/* 第二行：DOU对比（3个大数字横排） */}
                    {trafficProjectAvail.available.length >= 6 && (
                    <div>
                      <div className="text-xs text-muted-foreground font-medium mb-1.5 px-1">DOU对比</div>
                      <div className="grid grid-cols-3 gap-2">
                        {trafficProjectAvail.available.slice(3, 6).map((ind) => (
                          <BigNumberCard
                            key={ind.id}
                            indicator={ind}
                            timeMode={timeMode}
                            onClick={() => handleIndicatorClick(ind)}
                            accentColor="blue"
                          />
                        ))}
                      </div>
                    </div>
                    )}
                    {/* 第三行：超套对比（3个大数字横排） */}
                    {trafficProjectAvail.available.length >= 9 && (
                    <div>
                      <div className="text-xs text-muted-foreground font-medium mb-1.5 px-1">超套对比</div>
                      <div className="grid grid-cols-3 gap-2">
                        {trafficProjectAvail.available.slice(6, 9).map((ind) => (
                          <BigNumberCard
                            key={ind.id}
                            indicator={ind}
                            timeMode={timeMode}
                            onClick={() => handleIndicatorClick(ind)}
                            accentColor="blue"
                          />
                        ))}
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>
          </section>
          )}

          {/* ====== 区块4：存量运营 — 日维度仅中高端运营(3指标横排)，月维度全球通+中高端(2列) ====== */}
          {(gotoneAvail.available.length > 0 || midHighAvail.available.length > 0) && (
          <section>
            <SectionTitle title="存量运营" color="green" />
            <div className={`grid gap-4 ${gotoneAvail.available.length > 0 && midHighAvail.available.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {gotoneAvail.available.length > 0 && (
              <GroupIndicatorCard
                title="全球通保有"
                indicators={gotoneAvail.available}
                timeMode={timeMode}
                onIndicatorClick={handleIndicatorClick}
                headerGradient="from-blue-50 to-white"
                headerIcon={<Crown className="h-4 w-4 text-blue-500" />}
              />
              )}
              {midHighAvail.available.length > 0 && (
              <GroupIndicatorCard
                title="中高端运营"
                indicators={midHighAvail.available}
                timeMode={timeMode}
                onIndicatorClick={handleIndicatorClick}
                headerGradient="from-green-50 to-white"
                headerIcon={<Eye className="h-4 w-4 text-green-500" />}
                horizontalLayout={timeMode === 'daily'}
              />
              )}
            </div>
          </section>
          )}

          {/* ====== 区块5：调度跟踪 ====== */}
          <section>
            {/* 调度跟踪工具栏 — 与数据概览子工具栏风格一致 */}
            <div className="bg-white rounded-lg shadow-sm border px-5 py-3 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-purple-500" />
                <h2 className="text-sm font-semibold text-foreground">调度跟踪</h2>
              </div>
              <div className="w-px h-5 bg-border" />
              <Select value={businessScene} onValueChange={(v) => setBusinessScene(v as BusinessScene)}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="业务场景" /></SelectTrigger>
                <SelectContent>{BUSINESS_SCENE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={workOrderType} onValueChange={(v) => setWorkOrderType(v as WorkOrderType)}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="工单类型" /></SelectTrigger>
                <SelectContent>{WORK_ORDER_TYPE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
              </Select>
              <div className="w-px h-5 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">创建时间</span>
                <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
                  <button className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${dispatchTimeFilter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setDispatchTimeFilter('all')}>历史所有</button>
                  <button className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${dispatchTimeFilter === 'daily' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setDispatchTimeFilter('daily')}>按日</button>
                  <button className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${dispatchTimeFilter === 'monthly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setDispatchTimeFilter('monthly')}>按月</button>
                </div>
              </div>
              {dispatchTimeFilter === 'daily' && (
                <div className="flex items-center gap-1">
                  <button onClick={() => changeDispatchDate('prev')} className="p-0.5 hover:bg-muted rounded"><ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <span className="text-xs text-foreground font-medium px-1">{dispatchDailyLabel}</span>
                  <button onClick={() => changeDispatchDate('next')} className="p-0.5 hover:bg-muted rounded"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </div>
              )}
              {dispatchTimeFilter === 'monthly' && (
                <div className="flex items-center gap-1">
                  <button onClick={() => changeDispatchDate('prev')} className="p-0.5 hover:bg-muted rounded"><ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <span className="text-xs text-foreground font-medium px-1">{dispatchMonthlyLabel}</span>
                  <button onClick={() => changeDispatchDate('next')} className="p-0.5 hover:bg-muted rounded"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </div>
              )}
              <div className="flex-1" />
              <button className="p-1.5 hover:bg-muted rounded transition-colors" title="刷新"><RefreshCw className="h-4 w-4 text-muted-foreground" /></button>
            </div>

            {/* 调度跟踪内容区 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-3">

              {/* 4个统计大字卡片 */}
              <div className="grid grid-cols-4 gap-4 p-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <p className="text-xs text-blue-100 mb-1">{regionName}总工单量</p>
                  <p className="text-3xl font-bold">{filteredSummary.total.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg p-4 text-white">
                  <p className="text-xs text-orange-100 mb-1">{regionName}在途</p>
                  <p className="text-3xl font-bold">{filteredSummary.inProgress.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white">
                  <p className="text-xs text-red-100 mb-1">{regionName}超时</p>
                  <p className="text-3xl font-bold">{filteredSummary.overtime.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <p className="text-xs text-green-100 mb-1">{regionName}完成率</p>
                  <p className="text-3xl font-bold">{filteredCompletionRate}%</p>
                </div>
              </div>

              {/* 区域数据对比图表 */}
              <div className="px-4 pb-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">{regionName}区域工单分布</h4>
                    <span className="text-xs text-gray-400">共 {dispatchData.regionData.length} 个区域</span>
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dispatchData.regionData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#666' }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
                        <YAxis domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#666' }} axisLine={{ stroke: '#e5e5e5' }} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '12px' }} />
                        <Legend verticalAlign="bottom" height={30} formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>} />
                        <Bar dataKey="total" fill="#3b82f6" name="总工单量" barSize={16} />
                        <Bar dataKey="inProgress" fill="#f97316" name="在途" barSize={16} />
                        <Bar dataKey="overtime" fill="#ef4444" name="超时" barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 指标详情弹窗 */}
      <IndicatorDetailDialog
        open={dialogOpen}
        onOpenChange={(open: boolean) => { if (!open) handleDialogClose(); }}
        indicator={selectedIndicator}
        currentTimeMode={timeMode}
        currentDate={selectedDate}
      />
    </div>
  );
}
