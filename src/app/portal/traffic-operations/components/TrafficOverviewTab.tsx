'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Bell, TrendingUp, TrendingDown, Minus, Target, Info } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import IndicatorDispatchDialog from '@/components/IndicatorDispatchDialog';

// ======================== 口径说明 ========================
// 所有指标严格按照《流量运营概览页&指标树&客户属性清单@0513》Excel定义
// D列=单位, E列=业务口径（计算口径）
// 特别注意:
// 1. 月流量增幅-环比: (当期值-上期值)/上期值×100%, 单位%
// 2. 月流量份额差值: 本月份额绝对值-上月份额绝对值, 单位% (差值, 非pp)
// 3. DOU环比/同比: 差值(GB), 非变化率
// 4. 累计通信服务收入-环比/同比: (当期值-上期值)/上期值×100%, 单位%
// 5. 饱和度环比/同比: Excel标签与口径互换(环比列的口径=同比公式,反之亦然), 此处按口径含义纠正
// 6. 流量单价: 累计通信服务收入/累计流量到达值, 单位元/GB
// ======================== 口径说明结束 ========================

// 通用Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        {label && <p className="text-xs text-muted-foreground mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name || entry.dataKey}:</span>
            <span className="font-semibold text-foreground">
              {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 趋势箭头组件
function TrendArrow({ value, unit }: { value: number; unit?: string }) {
  if (value > 0) return <span className="text-red-500 text-xs font-medium flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+{value.toFixed(1)}{unit || '%'}</span>;
  if (value < 0) return <span className="text-green-600 text-xs font-medium flex items-center gap-0.5"><TrendingDown className="w-3 h-3" />{value.toFixed(1)}{unit || '%'}</span>;
  return <span className="text-muted-foreground text-xs font-medium flex items-center gap-0.5"><Minus className="w-3 h-3" />0{unit || '%'}</span>;
}

// 口径提示组件
function CaliberTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex ml-1">
      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} />
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-popover border border-border rounded-lg shadow-lg text-xs text-muted-foreground z-50">
          {text}
        </span>
      )}
    </span>
  );
}

// ==================== 核心指标数据 ====================
const coreTrendData = [
  { month: '202510', growth: 7.8, share: 57.6, revenue: 16.2, cumGrowth: 6.9, cumShare: 57.1, cumRevenue: 48.5 },
  { month: '202511', growth: 8.1, share: 57.9, revenue: 16.8, cumGrowth: 7.0, cumShare: 57.3, cumRevenue: 50.8 },
  { month: '202512', growth: 8.3, share: 58.0, revenue: 17.1, cumGrowth: 7.1, cumShare: 57.5, cumRevenue: 52.6 },
  { month: '202601', growth: 8.0, share: 57.8, revenue: 16.9, cumGrowth: 7.0, cumShare: 57.4, cumRevenue: 53.2 },
  { month: '202602', growth: 8.2, share: 58.1, revenue: 17.2, cumGrowth: 7.1, cumShare: 57.6, cumRevenue: 54.8 },
  { month: '202603', growth: 8.5, share: 58.3, revenue: 17.86, cumGrowth: 7.2, cumShare: 57.8, cumRevenue: 53.6 },
];

// ==================== 二级指标趋势数据 ====================
const scaleTrendData = [
  { month: '202510', dailyTraffic: 16.2, monthAvg: 17.5 },
  { month: '202511', dailyTraffic: 16.8, monthAvg: 17.8 },
  { month: '202512', dailyTraffic: 17.2, monthAvg: 18.1 },
  { month: '202601', dailyTraffic: 17.5, monthAvg: 18.3 },
  { month: '202602', dailyTraffic: 18.1, monthAvg: 18.5 },
  { month: '202603', dailyTraffic: 18.6, monthAvg: 18.6 },
];

const valueTrendData = [
  { month: '202510', unitPrice: 5.1, onlineCustomers: 1780 },
  { month: '202511', unitPrice: 5.0, onlineCustomers: 1795 },
  { month: '202512', unitPrice: 4.9, onlineCustomers: 1810 },
  { month: '202601', unitPrice: 4.8, onlineCustomers: 1825 },
  { month: '202602', unitPrice: 4.9, onlineCustomers: 1840 },
  { month: '202603', unitPrice: 4.8, onlineCustomers: 1856 },
];

const douTrendData = [
  { month: '202510', dou: 14.5, cumDou: 12.8 },
  { month: '202511', dou: 14.8, cumDou: 13.1 },
  { month: '202512', dou: 14.9, cumDou: 13.4 },
  { month: '202601', dou: 15.0, cumDou: 13.6 },
  { month: '202602', dou: 15.1, cumDou: 13.9 },
  { month: '202603', dou: 16.8, cumDou: 14.2 },
];

const saturationTrendData = [
  { month: '202510', overall: 74.2, planSat: 68.5 },
  { month: '202511', overall: 75.8, planSat: 70.2 },
  { month: '202512', overall: 76.5, planSat: 71.3 },
  { month: '202601', overall: 77.2, planSat: 71.8 },
  { month: '202602', overall: 77.8, planSat: 72.1 },
  { month: '202603', overall: 76.8, planSat: 72.5 },
];

const qualityTrendData = [
  { month: '202510', highCustomerRatio: 0.6, highTrafficRatio: 2.8 },
  { month: '202511', highCustomerRatio: 0.7, highTrafficRatio: 3.1 },
  { month: '202512', highCustomerRatio: 0.7, highTrafficRatio: 3.2 },
  { month: '202601', highCustomerRatio: 0.8, highTrafficRatio: 3.3 },
  { month: '202602', highCustomerRatio: 0.8, highTrafficRatio: 3.4 },
  { month: '202603', highCustomerRatio: 0.8, highTrafficRatio: 3.5 },
];

// ==================== 流量来源数据 ====================
const trafficSourceData = [
  { name: '存量激发', contribution: 8.6, scale: 48.9, color: '#3B82F6' },
  { name: '沉默激活', contribution: 5.1, scale: 28.9, color: '#10B981' },
  { name: '新入网', contribution: 3.2, scale: 18.2, color: '#6366F1' },
  { name: '流失(离网)', contribution: -2.3, scale: 13.1, color: '#EF4444' },
  { name: '流失(沉默)', contribution: -1.8, scale: 10.2, color: '#F59E0B' },
];

// ==================== 三扩三融数据 ====================
const expansionData = {
  '23类客户三扩三融率': {
    annualTarget: 85, // 年目标%
    cumCompletionRate: 62.3, // 累计完成率%
    timeProgress: 33.3, // 时间进度%
    monthlyScale: 128, // 当月运营规模(万)
    completionDeviation: -29.0, // 完成率偏差(pp)
    trend: [
      { month: '202601', rate: 45.2, scale: 98 },
      { month: '202602', rate: 53.8, scale: 115 },
      { month: '202603', rate: 62.3, scale: 128 },
    ],
  },
  '超套客户累计扩容规模': {
    annualTarget: 200, // 年目标(万户)
    cumCompletionRate: 41.5, // 累计完成率%
    timeProgress: 33.3, // 时间进度%
    monthlyScale: 15.2, // 当月扩容规模(万户)
    completionDeviation: 8.2, // 完成率偏差(pp)
    trend: [
      { month: '202601', rate: 28.5, scale: 10.8 },
      { month: '202602', rate: 35.2, scale: 12.6 },
      { month: '202603', rate: 41.5, scale: 15.2 },
    ],
  },
};

interface TrafficOverviewTabProps {
  isEditMode?: boolean;
  onJumpToTree?: (indicatorName: string) => void;
}

export default function TrafficOverviewTab({ isEditMode, onJumpToTree }: TrafficOverviewTabProps) {
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [currentIndicatorName, setCurrentIndicatorName] = useState('');

  const handleOpenDispatch = (name: string) => {
    setCurrentIndicatorName(name);
    setDispatchDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* ==================== 核心指标区 ==================== */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">核心指标</h3>
          <span className="text-xs text-muted-foreground">数据截至2026年3月</span>
        </div>

        {/* 当月/累计 3+3 对称布局 */}
        <div className="grid grid-cols-6 gap-3 mb-3">
          {/* 左3: 当月维度 */}
          {/* 当月流量增幅 */}
          <div className="col-span-2 border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">当月流量增幅</span>
              <CaliberTip text="口径: 当月截至当天流量/去年同期当月截至当天流量-1, 单位%" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">8.5</span>
              <span className="text-sm text-muted-foreground">%</span>
              <TrendArrow value={0.3} />
            </div>
            <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
              <span>环比 <span className="text-foreground font-medium">+0.3%</span></span>
              <span>绝对值 <span className="text-foreground font-medium">568.2亿MB</span></span>
            </div>
            <div className="h-16 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coreTrendData}>
                  <Line type="monotone" dataKey="growth" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 月流量份额 */}
          <div className="col-span-2 border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">月流量份额</span>
              <CaliberTip text="口径: 当月移动流量/当月(移动+联通+电信流量), 单位%" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">58.3</span>
              <span className="text-sm text-muted-foreground">%</span>
              <TrendArrow value={0.5} />
            </div>
            <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
              <span>份额差值 <span className="text-foreground font-medium">+0.5%</span></span>
            </div>
            <div className="h-16 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coreTrendData}>
                  <Line type="monotone" dataKey="share" stroke="#10B981" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 月通信服务收入 */}
          <div className="col-span-2 border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">月通信服务收入</span>
              <CaliberTip text="口径: 个人无线上网收入, 单位元" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">17.86</span>
              <span className="text-sm text-muted-foreground">亿元</span>
            </div>
            <div className="h-16 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coreTrendData}>
                  <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 右3: 累计维度 */}
          {/* 年累计流量增幅 */}
          <div className="col-span-2 border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">年累计流量增幅</span>
              <CaliberTip text="口径: 年累计流量/去年同期累计流量-1, 单位%" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">7.2</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              累计绝对值 <span className="text-foreground font-medium">1,562.8亿MB</span>
            </div>
            <div className="h-16 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coreTrendData}>
                  <Line type="monotone" dataKey="cumGrowth" stroke="#6366F1" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 累计流量份额 */}
          <div className="col-span-2 border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">累计流量份额</span>
              <CaliberTip text="口径: 累计移动流量/累计(移动+联通+电信流量), 单位%" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">57.8</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <div className="h-16 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coreTrendData}>
                  <Line type="monotone" dataKey="cumShare" stroke="#8B5CF6" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 累计通信服务收入 */}
          <div className="col-span-2 border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">累计通信服务收入</span>
              <CaliberTip text="口径: 当年月的个人无线上网收入累加, 单位元" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">53.6</span>
              <span className="text-sm text-muted-foreground">亿元</span>
            </div>
            <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
              <span>环比 <span className="text-foreground font-medium">+2.1%</span></span>
              <span>同比 <span className="text-foreground font-medium">+5.8%</span></span>
            </div>
            <div className="h-16 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coreTrendData}>
                  <Line type="monotone" dataKey="cumRevenue" stroke="#EC4899" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 客户指标横铺 */}
        <div className="border border-border rounded-lg p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs text-muted-foreground">当月≥1GB上网客户</span>
                  <CaliberTip text="口径: 当月使用流量≥1GB的客户数, 单位户" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-foreground">1,526</span>
                  <span className="text-sm text-muted-foreground">万</span>
                </div>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-muted-foreground">环比 <span className="text-foreground font-medium">+1.2%</span></span>
                <span className="text-muted-foreground">同比 <span className="text-foreground font-medium">+3.5%</span></span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onJumpToTree?.('当月流量增幅')}
                className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                指标树
              </button>
              <button
                onClick={() => handleOpenDispatch('当月≥1GB上网客户')}
                className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                去调度
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* ==================== 二级指标区 ==================== */}
      <div className="grid grid-cols-5 gap-3">
        {/* 流量规模 */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground">流量规模</h4>
          </div>
          <div className="space-y-3">
            {/* 当日流量规模 */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-muted-foreground">当日流量规模</span>
                <CaliberTip text="口径: 当天手机上网流量, 单位MB" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">18.6</span>
                <span className="text-xs text-muted-foreground">亿MB</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>环比<span className="text-foreground font-medium"> +1.5%</span></span>
                <span>同比<span className="text-foreground font-medium"> +9.2%</span></span>
              </div>
            </div>
            {/* 当月日均流量 */}
            <div className="border-t border-border pt-2">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-muted-foreground">当月日均流量</span>
                <CaliberTip text="口径: 当月截至当天总流量/当天是当月第几天, 单位MB" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">18.6</span>
                <span className="text-xs text-muted-foreground">亿MB</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>环比<span className="text-foreground font-medium"> +1.8%</span></span>
                <span>同比<span className="text-foreground font-medium"> +8.5%</span></span>
              </div>
            </div>
          </div>
          <div className="h-20 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scaleTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <Line type="monotone" dataKey="dailyTraffic" name="当日流量" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="monthAvg" name="日均流量" stroke="#10B981" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 价值转化 */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground">价值转化</h4>
          </div>
          <div className="space-y-3">
            {/* 流量单价 */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-muted-foreground">流量单价</span>
                <CaliberTip text="口径: 流量收入/总流量, 单位元/MB" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">4.8</span>
                <span className="text-xs text-muted-foreground">元/GB</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>环比<span className="text-foreground font-medium"> +0.2%</span></span>
                <span>同比<span className="text-red-500 font-medium"> -5.6%</span></span>
              </div>
            </div>
            {/* 上网客户数 */}
            <div className="border-t border-border pt-2">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-muted-foreground">上网客户数</span>
                <CaliberTip text="口径: 当月截至当天流量使用>0的在网用户(去重, 剔除内部测试和物联网), 单位户" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">1,856</span>
                <span className="text-xs text-muted-foreground">万</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>环比<span className="text-foreground font-medium"> +0.8%</span></span>
                <span>同比<span className="text-foreground font-medium"> +3.2%</span></span>
              </div>
            </div>
          </div>
          <div className="h-20 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={valueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <Line type="monotone" dataKey="unitPrice" name="单价" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 流量用量 */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground">流量用量</h4>
          </div>
          <div className="space-y-3">
            {/* 当月DOU */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-muted-foreground">当月DOU</span>
                <CaliberTip text="口径: 当月总流量/当月手机上网客户数, 单位MB/户" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">16.8</span>
                <span className="text-xs text-muted-foreground">GB</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>环比差值<span className="text-foreground font-medium"> +0.3GB</span></span>
                <span>同比差值<span className="text-foreground font-medium"> +2.1GB</span></span>
              </div>
            </div>
            {/* 累计DOU */}
            <div className="border-t border-border pt-2">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-muted-foreground">累计DOU</span>
                <CaliberTip text="口径: 累计总流量/累计手机上网客户数, 单位MB/户" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">14.2</span>
                <span className="text-xs text-muted-foreground">GB</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>环比差值<span className="text-foreground font-medium"> +0.2GB</span></span>
                <span>同比差值<span className="text-foreground font-medium"> +1.8GB</span></span>
              </div>
            </div>
          </div>
          <div className="h-20 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={douTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <Line type="monotone" dataKey="dou" name="当月DOU" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="cumDou" name="累计DOU" stroke="#6366F1" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 饱和度 */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground">饱和度</h4>
          </div>
          <div className="space-y-3">
            {/* 整体饱和度 */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-muted-foreground">整体饱和度</span>
                <CaliberTip text="口径: (未超套流量+超套流量-套外流量)/平均流量资源量, 单位%" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">76.8</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                {/* 按E列口径纠正: 环比=当期值-上期值(差值), 同比=当期值-去年同期值(差值) */}
                <span>环比<span className="text-foreground font-medium"> +1.3%</span></span>
                <span>同比<span className="text-foreground font-medium"> +2.8%</span></span>
              </div>
            </div>
            {/* 当月套餐饱和度 */}
            <div className="border-t border-border pt-2">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-muted-foreground">当月套餐饱和度</span>
                <CaliberTip text="口径: 套餐内使用流量/套餐总量, 单位%" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">72.5</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>环比<span className="text-foreground font-medium"> +1.1%</span></span>
                <span>同比<span className="text-foreground font-medium"> +2.3%</span></span>
              </div>
            </div>
          </div>
          <div className="h-20 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={saturationTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <Line type="monotone" dataKey="overall" name="整体饱和度" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="planSat" name="套餐饱和度" stroke="#EF4444" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 质量 */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground">质量</h4>
          </div>
          <div className="space-y-3">
            {/* 超高客户占比 */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-muted-foreground">超高客户占比(DOU≥300GB)</span>
                <CaliberTip text="口径: DOU≥300GB客户数/手机上网客户数, 单位%" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">0.8</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>环比<span className="text-foreground font-medium"> +0.1%</span></span>
                <span>同比<span className="text-foreground font-medium"> +0.2%</span></span>
              </div>
            </div>
            {/* 超高客户流量占比 */}
            <div className="border-t border-border pt-2">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-muted-foreground">超高客户流量占比(DOU≥300GB)</span>
                <CaliberTip text="口径: DOU≥300GB客户流量/总流量, 单位%" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-foreground">3.5</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>环比<span className="text-foreground font-medium"> +0.3%</span></span>
                <span>同比<span className="text-foreground font-medium"> +0.6%</span></span>
              </div>
            </div>
          </div>
          <div className="h-20 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <Line type="monotone" dataKey="highCustomerRatio" name="客户占比" stroke="#EF4444" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="highTrafficRatio" name="流量占比" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ==================== 流量来源分析区 ==================== */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">流量来源分析</h3>
          <CaliberTip text="新入网贡献: 当年当月有流量且去年同期无流量/去年总流量; 沉默激活/存量激发/流失同理" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* 左: 贡献度表格+饼图 */}
          <div>
            <h4 className="text-xs text-muted-foreground mb-2">流量贡献度(%)</h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 text-muted-foreground font-medium">来源</th>
                  <th className="text-right py-1.5 text-muted-foreground font-medium">贡献(%)</th>
                  <th className="text-right py-1.5 text-muted-foreground font-medium">规模(亿MB)</th>
                </tr>
              </thead>
              <tbody>
                {trafficSourceData.map((item) => (
                  <tr key={item.name} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </td>
                    <td className={`text-right py-1.5 font-medium ${item.contribution > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {item.contribution > 0 ? '+' : ''}{item.contribution}%
                    </td>
                    <td className="text-right py-1.5">{item.scale}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-medium">
                  <td className="py-1.5">净贡献</td>
                  <td className="text-right py-1.5 text-red-500">+12.8%</td>
                  <td className="text-right py-1.5">--</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* 右: 饼图 */}
          <div>
            <h4 className="text-xs text-muted-foreground mb-2">来源结构</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={trafficSourceData.filter(d => d.contribution > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="contribution"
                  nameKey="name"
                  label={({ name, contribution }) => `${name} ${contribution}%`}
                >
                  {trafficSourceData.filter(d => d.contribution > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* ==================== 三扩三融两提升进度区 ==================== */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">三扩三融两提升进度</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(expansionData).map(([name, data]) => (
            <div key={name} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">{name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded ${data.completionDeviation >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {data.completionDeviation >= 0 ? '超前' : '滞后'} {Math.abs(data.completionDeviation).toFixed(1)}pp
                </span>
              </div>
              
              {/* 进度条 + 时间刻度 */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>累计完成率: <span className="text-foreground font-medium">{data.cumCompletionRate}%</span></span>
                  <span>年目标: <span className="text-foreground font-medium">{data.annualTarget}{name.includes('率') ? '%' : '万户'}</span></span>
                </div>
                <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                  {/* 完成率 */}
                  <div
                    className="absolute left-0 top-0 h-full bg-primary/70 rounded-full transition-all"
                    style={{ width: `${Math.min(data.cumCompletionRate, 100)}%` }}
                  />
                  {/* 时间进度线 */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-foreground/50"
                    style={{ left: `${data.timeProgress}%` }}
                  />
                  {/* 时间标签 */}
                  <span className="absolute text-[10px] text-foreground/70" style={{ left: `${data.timeProgress}%`, top: -14, transform: 'translateX(-50%)' }}>
                    时间进度 {data.timeProgress}%
                  </span>
                </div>
                {/* 偏差提示 */}
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">
                    完成率偏差: <span className={data.completionDeviation >= 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                      {data.completionDeviation > 0 ? '+' : ''}{data.completionDeviation.toFixed(1)}pp
                    </span>
                  </span>
                </div>
              </div>

              {/* 当月规模 + 趋势图 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">
                    {name.includes('超套') ? '当月扩容规模' : '当月运营规模'}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">{data.monthlyScale}</span>
                    <span className="text-xs text-muted-foreground">万户</span>
                  </div>
                </div>
                <div className="flex-1 h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 去调度弹窗 */}
      <IndicatorDispatchDialog
        open={dispatchDialogOpen}
        onClose={() => setDispatchDialogOpen(false)}
        indicatorName={currentIndicatorName}
      />
    </div>
  );
}
