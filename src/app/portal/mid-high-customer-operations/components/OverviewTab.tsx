'use client';

import { Info, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, AreaChart, Area } from 'recharts';
import { useMounted } from '@/hooks/useMounted';

// 类型定义
interface MetricData {
  id: number;
  name: string;
  indicatorName?: string; // 指标名称（用于跳转到指标树）
  value: string;
  yoy: string;
  yoyUnit?: string; // 环比单位：'%'（数值类指标）或 'pp'（比率类指标）
  yoyLabel?: string; // 同比或环比
  status?: 'normal' | 'warning' | 'danger';
  color?: string;
  chartType: 'line' | 'barline' | 'barLine' | 'area' | 'gauge' | 'bar' | 'valueOnly';
  chartData?: Array<{ month: string; value?: number; change?: number; revenue?: number; retainRate?: number; scale?: number }>;
  businessScope?: string; // 业务口径说明
  hasEntrances?: boolean; // 是否有入口（去调度、指标树分析、告警）
  isRateIndicator?: boolean; // 是否是比率类指标（保有率、渗透率等），Y轴从90%开始
  trend?: 'up' | 'down' | 'flat'; // 趋势方向
  barColor?: string; // 柱状图颜色
  lineColor?: string; // 折线颜色
  gaugeColor?: string; // 仪表盘颜色
  gaugeScale?: string; // 仪表盘刻度
  gaugeUnit?: string; // 仪表盘单位
  subtitle?: string; // 副标题
}

interface SegmentData {
  segment: string;
  scale: number;
  yoy: string;
  status: 'normal' | 'warning';
  businessScope: string;
}

// 根据截图更新的整体指标数据 - 4个指标（1行4列）
const overallMetricsNew: MetricData[] = [
  {
    id: 1,
    name: '中高端客户规模',
    value: '5.97',
    yoy: '0',
    yoyUnit: '',
    yoyLabel: '环比',
    status: 'normal',
    color: '#2563FF',
    chartType: 'line',
    chartData: [
      { month: '202508', value: 100 },
      { month: '202509', value: 105 },
      { month: '202510', value: 110 },
      { month: '202511', value: 102 },
      { month: '202512', value: 106 }
    ]
  },
  {
    id: 2,
    name: '当月中高端客户降档率',
    value: '',
    yoy: '',
    yoyUnit: '',
    chartType: 'barLine',
    barColor: '#2563FF',
    lineColor: '#52C41A',
    chartData: [
      { month: '202508', value: 0.0, change: -1.2 },
      { month: '202509', value: 0.0, change: -1.5 },
      { month: '202510', value: 0.0, change: 2.5 },
      { month: '202511', value: 0.0, change: -2.2 },
      { month: '202512', value: 0.0, change: 0.35 }
    ]
  },
  {
    id: 3,
    name: '当月中高端客户携出率',
    value: '',
    yoy: '',
    yoyUnit: '',
    chartType: 'barLine',
    barColor: '#2563FF',
    lineColor: '#52C41A',
    chartData: [
      { month: '202508', value: 4.5, change: 2.4 },
      { month: '202509', value: 4.8, change: 2.3 },
      { month: '202510', value: 5.5, change: 2.6 },
      { month: '202511', value: 5.0, change: 2.5 },
      { month: '202512', value: 4.72, change: 2.0 }
    ]
  },
  {
    id: 4,
    name: '中高端客户规模保有率',
    value: '98.12',
    yoy: '3.51',
    yoyUnit: '%',
    yoyLabel: '环比',
    status: 'warning',
    color: '#2563FF',
    chartType: 'area',
    chartData: [
      { month: '202508', value: 95 },
      { month: '202509', value: 105 },
      { month: '202510', value: 98 },
      { month: '202511', value: 95 },
      { month: '202512', value: 98.12 }
    ]
  }
];

// 风险度数据 - 4个指标
const riskMetricsNew: MetricData[] = [
  {
    id: 1,
    name: '中高端客户携出规模',
    value: '0.35',
    yoy: '-0.01',
    yoyUnit: '%',
    trend: 'down',
    color: '#2563FF',
    chartType: 'line',
    chartData: [
      { month: '202508', value: 114 },
      { month: '202509', value: 112 },
      { month: '202510', value: 116 },
      { month: '202511', value: 111 },
      { month: '202512', value: 111 }
    ]
  },
  {
    id: 2,
    name: '联通',
    value: '69.84',
    yoy: '',
    yoyUnit: '%',
    chartType: 'gauge',
    gaugeColor: '#f1f5f9',
    gaugeScale: '71.08',
    gaugeUnit: '万户'
  },
  {
    id: 3,
    name: '电信',
    value: '30.16',
    yoy: '',
    yoyUnit: '%',
    chartType: 'gauge',
    gaugeColor: '#f1f5f9',
    gaugeScale: '30.7',
    gaugeUnit: '万户'
  },
  {
    id: 4,
    name: '当月中高端客户异网主卡率',
    value: '6.9',
    yoy: '4.42',
    yoyUnit: '%',
    trend: 'up',
    color: '#2563FF',
    chartType: 'line',
    chartData: [
      { month: '202508', value: 6.5 },
      { month: '202509', value: 6.7 },
      { month: '202510', value: 6.8 },
      { month: '202511', value: 7.0 },
      { month: '202512', value: 6.9 }
    ]
  },
  {
    id: 5,
    name: '当月中高端客户超套客户占比',
    value: '15.24',
    yoy: '-0.5',
    yoyUnit: '%',
    trend: 'down',
    color: '#2563FF',
    chartType: 'line',
    chartData: [
      { month: '202508', value: 15.5 },
      { month: '202509', value: 15.2 },
      { month: '202510', value: 15.3 },
      { month: '202511', value: 15.0 },
      { month: '202512', value: 15.24 }
    ]
  }
];

// 稳定度数据 - 4个指标
const stabilityMetricsNew: MetricData[] = [
  {
    id: 1,
    name: '当月中高端客户宽带渗透率',
    value: '',
    yoy: '',
    chartType: 'barLine',
    barColor: '#2563FF',
    lineColor: '#52C41A',
    chartData: [
      { month: '202508', value: 0.3, change: 0.2 },
      { month: '202509', value: 0.6, change: 0.6 },
      { month: '202510', value: 0.3, change: 0.4 },
      { month: '202511', value: 0.6, change: 0.2 },
      { month: '202512', value: 0.3, change: 0.0 }
    ]
  },
  {
    id: 2,
    name: '当月中高端客户宽带到期续约率',
    value: '',
    yoy: '',
    chartType: 'barLine',
    barColor: '#2563FF',
    lineColor: '#52C41A',
    chartData: [
      { month: '202508', value: 70, change: -9.5 },
      { month: '202509', value: 80, change: -8.0 },
      { month: '202510', value: 72, change: -8.5 },
      { month: '202511', value: 68, change: -9.0 },
      { month: '202512', value: 75, change: -8.0 }
    ]
  },
  {
    id: 3,
    name: '当月中高端客户权益渗透率',
    value: '',
    yoy: '',
    chartType: 'barLine',
    barColor: '#2563FF',
    lineColor: '#52C41A',
    chartData: [
      { month: '202508', value: 1.8, change: -0.1 },
      { month: '202509', value: 2.0, change: 0.0 },
      { month: '202510', value: 1.5, change: -0.2 },
      { month: '202511', value: 1.8, change: 0.1 },
      { month: '202512', value: 2.0, change: 0.0 }
    ]
  },
  {
    id: 4,
    name: '当月中高端客户终端硬件融合率',
    value: '',
    yoy: '',
    chartType: 'barLine',
    barColor: '#2563FF',
    lineColor: '#52C41A',
    chartData: [
      { month: '202508', value: 3, change: 8.0 },
      { month: '202509', value: 9, change: 9.5 },
      { month: '202510', value: 6, change: 8.5 },
      { month: '202511', value: 3, change: 8.0 },
      { month: '202512', value: 6, change: 7.0 }
    ]
  }
];

// 留存度数据 - 4个指标
const retentionMetricsNew: MetricData[] = [
  {
    id: 1,
    name: '当月中高端客户拆机意向客户数',
    value: '',
    yoy: '',
    yoyUnit: '户',
    chartType: 'bar',
    barColor: '#2563FF',
    chartData: [
      { month: '202508', value: 123 },
      { month: '202509', value: 128 },
      { month: '202510', value: 120 },
      { month: '202511', value: 122 },
      { month: '202512', value: 128 }
    ]
  },
  {
    id: 2,
    name: '热线工单',
    value: '2.77',
    yoy: '',
    yoyUnit: '万',
    subtitle: '工单数量',
    chartType: 'valueOnly'
  },
  {
    id: 3,
    name: '分公司工单',
    value: '12.48',
    yoy: '',
    yoyUnit: '万',
    subtitle: '工单数量',
    chartType: 'valueOnly'
  },
  {
    id: 4,
    name: '中高端客户拆机率',
    value: '',
    yoy: '',
    chartType: 'barLine',
    barColor: '#2563FF',
    lineColor: '#52C41A',
    chartData: [
      { month: '202508', value: 0.6, change: -0.2 },
      { month: '202509', value: 0.3, change: 0.0 },
      { month: '202510', value: 0.6, change: -0.1 },
      { month: '202511', value: 0.3, change: 0.0 },
      { month: '202512', value: 0.6, change: -0.1 }
    ]
  },
  {
    id: 5,
    name: '当月中高端客户离网率',
    value: '',
    yoy: '',
    chartType: 'barLine',
    barColor: '#2563FF',
    lineColor: '#52C41A',
    chartData: [
      { month: '202508', value: 0.5, change: 1.5 },
      { month: '202509', value: 1.5, change: 2.0 },
      { month: '202510', value: 1.0, change: 1.8 },
      { month: '202511', value: 1.5, change: 2.2 },
      { month: '202512', value: 1.0, change: 1.8 }
    ]
  }
];

// 满意度数据 - 3个指标
const satisfactionMetricsNew: MetricData[] = [
  {
    id: 1,
    name: '中高端客户满意度',
    value: '9.14',
    yoy: '-10.42',
    yoyUnit: '%',
    trend: 'down',
    color: '#2563FF',
    chartType: 'line',
    chartData: [
      { month: '202508', value: 8.0 },
      { month: '202509', value: 8.0 },
      { month: '202510', value: 8.0 },
      { month: '202511', value: 8.0 },
      { month: '202512', value: 9.14 }
    ]
  },
  {
    id: 2,
    name: '中高端客户手机满意度',
    value: '8.55',
    yoy: '-0.24',
    yoyUnit: '%',
    trend: 'down',
    color: '#2563FF',
    chartType: 'line',
    chartData: [
      { month: '202508', value: 8.4 },
      { month: '202509', value: 8.5 },
      { month: '202510', value: 8.6 },
      { month: '202511', value: 8.7 },
      { month: '202512', value: 8.55 }
    ]
  },
  {
    id: 3,
    name: '中高端客户宽带满意度',
    value: '8.14',
    yoy: '8.64',
    yoyUnit: '%',
    trend: 'up',
    color: '#2563FF',
    chartType: 'line',
    chartData: [
      { month: '202508', value: 8.0 },
      { month: '202509', value: 8.0 },
      { month: '202510', value: 8.0 },
      { month: '202511', value: 7.0 },
      { month: '202512', value: 8.14 }
    ]
  }
];

// MetricChart 组件 - 渲染不同类型的图表
function MetricChart({ metric, chartHeight = 100 }: { metric: any; chartHeight?: number }) {
  const mounted = useMounted();
  switch (metric.chartType) {
    case 'line':

      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={metric.chartData} margin={{ top: 5, right: 10, bottom: -10, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 10, padding: '2px 4px' }} />
            <Line type="monotone" dataKey="value" stroke={metric.color || '#2563FF'} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );

    case 'area':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={metric.chartData} margin={{ top: 5, right: 10, bottom: -10, left: -10 }}>
            <defs>
              <linearGradient id={`areaGrad_${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.color || '#2563FF'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={metric.color || '#2563FF'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 10, padding: '2px 4px' }} />
            <Area type="monotone" dataKey="value" stroke={metric.color || '#2563FF'} strokeWidth={2} fill={`url(#areaGrad_${metric.id})`} />
          </AreaChart>
        </ResponsiveContainer>
      );

    case 'dualLine':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart data={metric.chartData} margin={{ top: 5, right: 10, bottom: -10, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 10, padding: '2px 4px' }} />
            <Line type="monotone" dataKey={metric.chartData[0]?.rate !== undefined ? 'rate' : 'value'} stroke={metric.barColor || '#2563FF'} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="change" stroke={metric.lineColor || '#52C41A'} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      );

    case 'barLine':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart data={metric.chartData} margin={{ top: 5, right: 10, bottom: -10, left: -10 }}>
            <defs>
              <linearGradient id={`barGrad_${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.barColor || '#2563FF'} stopOpacity={1} />
                <stop offset="100%" stopColor={metric.barColor || '#2563FF'} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 10, padding: '2px 4px' }} />
            <Bar dataKey="value" fill={`url(#barGrad_${metric.id})`} radius={[4, 4, 0, 0]} barSize={12} />
            <Line type="monotone" dataKey="change" stroke={metric.lineColor || '#52C41A'} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      );

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={metric.chartData} margin={{ top: 5, right: 10, bottom: -10, left: -10 }}>
            <defs>
              <linearGradient id={`barGrad_${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.barColor || '#2563FF'} stopOpacity={1} />
                <stop offset="100%" stopColor={metric.barColor || '#2563FF'} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#666' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 10, padding: '2px 4px' }} />
            <Bar dataKey="value" fill={`url(#barGrad_${metric.id})`} radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
}

// OverviewTab 组件 - 渲染新的模块结构
export function OverviewTab({ isEditMode, onJumpToTree }: { isEditMode: boolean; onJumpToTree?: (indicatorName: string) => void }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* 整体指标 - 4个卡片 1+3布局 */}
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-800 mb-3">整体指标</h3>
        {/* 整体采用 1+3 布局 */}
        <div className="flex gap-4">
          {/* 左侧：主卡片 - 独立蓝色背景容器 */}
          <div className="w-[280px] flex-shrink-0 rounded-lg bg-gray-50 border border-blue-100 p-3">
            <div className="bg-white rounded-lg p-3 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-black">{overallMetricsNew[0].name}</span>
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </div>
                <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
              </div>
              {overallMetricsNew[0].value && (
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-xl font-bold ${overallMetricsNew[0].status === 'warning' ? 'text-orange-500' : 'text-gray-900'}`}>
                      {overallMetricsNew[0].value}
                    </span>
                    <span className="text-sm text-gray-500">{overallMetricsNew[0].yoyUnit === '%' ? '%' : overallMetricsNew[0].yoyUnit === 'pp' ? '%' : overallMetricsNew[0].yoyUnit}</span>
                  </div>
                  {overallMetricsNew[0].yoy && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">{overallMetricsNew[0].yoyLabel}</span>
                      <span className={`text-xs font-medium ${overallMetricsNew[0].trend === 'up' ? 'text-green-600' : overallMetricsNew[0].trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                        {overallMetricsNew[0].trend === 'up' ? '+' : ''}{overallMetricsNew[0].yoy}{overallMetricsNew[0].yoyUnit === 'pp' ? 'pp' : overallMetricsNew[0].yoyUnit}
                      </span>
                      {overallMetricsNew[0].trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                      {overallMetricsNew[0].trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                      {overallMetricsNew[0].status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
                    </div>
                  )}
                  {!overallMetricsNew[0].yoy && overallMetricsNew[0].status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
                </div>
              )}
              {overallMetricsNew[0].chartType === 'barLine' && (
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-[#2563FF]"></div>
                    <span className="text-xs text-black">携出率</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-[#52C41A]"></div>
                    <span className="text-xs text-[#52C41A]">环比</span>
                  </div>
                </div>
              )}
              <div className="flex-1">
                <MetricChart metric={overallMetricsNew[0]} chartHeight={100} />
              </div>
            </div>
          </div>
          
          {/* 右侧：三个卡片共同紫色背景容器 */}
          <div className="flex-1 rounded-lg bg-purple-50 border border-purple-100 p-3 flex gap-3">
            {overallMetricsNew.slice(1).map((metric) => (
              <div key={metric.id} className="flex-1 bg-white rounded-lg p-3 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">{metric.name}</span>
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  </div>
                  <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                </div>
                {metric.value && (
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-bold ${metric.status === 'warning' ? 'text-orange-500' : 'text-gray-900'}`}>
                        {metric.value}
                      </span>
                      <span className="text-sm text-gray-500">{metric.yoyUnit === '%' ? '%' : metric.yoyUnit === 'pp' ? '%' : metric.yoyUnit}</span>
                    </div>
                    {metric.yoy && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">{metric.yoyLabel}</span>
                        <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                          {metric.trend === 'up' ? '+' : ''}{metric.yoy}{metric.yoyUnit === 'pp' ? 'pp' : metric.yoyUnit}
                        </span>
                        {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                        {metric.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                        {metric.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
                      </div>
                    )}
                    {!metric.yoy && metric.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
                  </div>
                )}
                {metric.chartType === 'barLine' && (
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-[#2563FF]"></div>
                      <span className="text-xs text-black">{metric.name === '当月中高端客户降档率' ? '降档率' : '携出率'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#52C41A]"></div>
                      <span className="text-xs text-[#52C41A]">环比</span>
                    </div>
                  </div>
                )}
                {metric.chartType === 'line' && metric.name === '当月全球通降档率' && (
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#52C41A]"></div>
                      <span className="text-xs text-[#52C41A]">环比</span>
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <MetricChart metric={metric} chartHeight={100} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 风险度 - 左右两组，左组3卡片，右组2卡片 */}
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-800 mb-3">风险度</h3>
        
        {/* 左组：携出规模 + 联通 + 电信 | 右组：异网主卡率 + 超套占比 */}
        <div className="grid grid-cols-5 gap-4">
          {/* 左组 - 浅蓝背景，包含3个卡片（1宽+2窄） */}
          <div className="col-span-3 bg-[#E8F4FD] rounded-lg p-3">
            <div className="grid grid-cols-4 gap-3">
              {/* 中高端客户携出规模 - 占2列 */}
              <div className="bg-white rounded-lg p-3 flex flex-col justify-between h-full col-span-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 ">
                      <span className="text-sm font-semibold text-black">{riskMetricsNew[0].name}</span>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </div>
                    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                  </div>
                  <div className="flex items-baseline justify-between w-full mb-1">
                    <span className="text-lg font-bold text-gray-900">
  {riskMetricsNew[0].value}
  <span className="text-xs text-gray-500 ml-0.5">{riskMetricsNew[0].yoyUnit}</span>
</span>
                    {riskMetricsNew[0].yoy && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs">环比</span><span className="text-xs text-red-600">
                        {riskMetricsNew[0].yoy}{riskMetricsNew[0].yoyUnit}
                      </span>
                      <TrendingDown className="w-2.5 h-2.5 text-red-600" />
                    </div>
                  )}
                  </div>
                
                </div>
                <div className="flex-1">
                  <MetricChart metric={riskMetricsNew[0]} chartHeight={80} />
                </div>
              </div>

              {/* 联通仪表盘 */}
              <div className="bg-white rounded-lg p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-black">联通</span>
                  <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                </div>
                <div className="flex flex-col items-center justify-center flex-1 -mt-1">
                  <div className="relative w-20 h-20">
                    <PieChart width={80} height={100}>
                      <Pie
                        data={[{ value: 69.84 }, { value: 30.16 }]}
                        cx="50%"
                        cy="60%"
                        innerRadius={26}
                        outerRadius={36}
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                      >
                        <Cell fill="#FF8C00" />
                        <Cell fill="#f0f0f0" />
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center" style={{ top: '70%' }}>
                      <span className="text-base font-bold text-gray-900">69.84%</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">联通占比(%)</span>
                  <span className="text-xs text-green-600 font-medium">规模71.08万户</span>
                </div>
              </div>

              {/* 电信仪表盘 */}
              <div className="bg-white rounded-lg p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-black">电信</span>
                  <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                </div>
                <div className="flex flex-col items-center justify-center flex-1 -mt-1">
                  <div className="relative w-20 h-20">
                    <PieChart width={80} height={100}>
                      <Pie
                        data={[{ value: 30.16 }, { value: 69.84 }]}
                        cx="50%"
                        cy="60%"
                        innerRadius={26}
                        outerRadius={36}
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                      >
                        <Cell fill="#2563FF" />
                        <Cell fill="#f0f0f0" />
                      </Pie>
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center" style={{ top: '70%' }}>
                      <span className="text-base font-bold text-gray-800">30.16%</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">电信占比(%)</span>
                  <span className="text-xs text-green-600 font-medium">规模30.7万户</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右组 - 浅紫背景，包含2个卡片 */}
          <div className="col-span-2 bg-[#F0F0FF] rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3">
              {/* 当月中高端客户异网主卡率 */}
              <div className="bg-white rounded-lg p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-black">{riskMetricsNew[3].name}</span>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </div>
                    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                  </div>
                  <div className="flex items-baseline justify-between w-full mb-1">
                   <span className="text-lg font-bold text-gray-900">
  {riskMetricsNew[3].value}
  <span className="text-xs text-gray-500 ml-0.5">{riskMetricsNew[3].yoyUnit}</span>
</span>
                 {riskMetricsNew[3].yoy && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs">环比</span>
                      <span className="text-xs text-green-600">
                        +{riskMetricsNew[3].yoy}{riskMetricsNew[3].yoyUnit}
                      </span>
                      <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                    </div>
                  )}
                  </div>
                  
                </div>
                <div className="flex-1">
                  <MetricChart metric={riskMetricsNew[3]} chartHeight={80} />
                </div>
              </div>

              {/* 当月中高端客户超套客户占比 */}
              <div className="bg-white rounded-lg p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-black">{riskMetricsNew[4].name}</span>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </div>
                    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                  </div>
                  <div className="flex items-baseline justify-between w-full mb-1">
                    <span className="text-lg font-bold text-gray-900">
  {riskMetricsNew[4].value}
  <span className="text-xs text-gray-500 ml-0.5">{riskMetricsNew[4].yoyUnit}</span>
</span>
                 {riskMetricsNew[4].yoy && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs">环比</span>
                      <span className="text-xs text-red-600">
                        {riskMetricsNew[4].yoy}{riskMetricsNew[4].yoyUnit}
                      </span>
                      <TrendingDown className="w-2.5 h-2.5 text-red-600" />
                    </div>
                  )}
                  </div>
                 
                </div>
                <div className="flex-1">
                  <MetricChart metric={riskMetricsNew[4]} chartHeight={80} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 稳定度 - 左右两组，左组2卡片，右组2卡片 */}
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-800 mb-3">稳定度</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* 左组 - 浅蓝背景，包含2个卡片 */}
          <div className="bg-[#E8F4FD] rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-black">{stabilityMetricsNew[0].name}</span>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </div>
                    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-[#2563FF]"></div>
                      <span className="text-xs text-black">占比</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#52C41A]"></div>
                      <span className="text-xs text-[#52C41A]">环比</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <MetricChart metric={stabilityMetricsNew[0]} chartHeight={80} />
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-black">{stabilityMetricsNew[1].name}</span>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </div>
                    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-[#2563FF]"></div>
                      <span className="text-xs text-black">占比</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#52C41A]"></div>
                      <span className="text-xs text-[#52C41A]">环比</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <MetricChart metric={stabilityMetricsNew[1]} chartHeight={80} />
                </div>
              </div>
            </div>
          </div>

          {/* 右组 - 浅紫背景，包含2个卡片 */}
          <div className="bg-[#F0F5FF] rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-black">{stabilityMetricsNew[2].name}</span>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </div>
                    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-[#2563FF]"></div>
                      <span className="text-xs text-black">占比</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#52C41A]"></div>
                      <span className="text-xs text-[#52C41A]">环比</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <MetricChart metric={stabilityMetricsNew[2]} chartHeight={80} />
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-black">{stabilityMetricsNew[3].name}</span>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </div>
                    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-[#2563FF]"></div>
                      <span className="text-xs text-black">占比</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#52C41A]"></div>
                      <span className="text-xs text-[#52C41A]">环比</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <MetricChart metric={stabilityMetricsNew[3]} chartHeight={80} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 留存度 - 左右两组，左组3卡片，右组2卡片 */}
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-800 mb-3">留存度</h3>
        
        <div className="grid grid-cols-5 gap-4">
          {/* 左组 - 浅蓝背景，包含3个卡片 */}
          <div className="col-span-3 bg-[#E8F4FD] rounded-lg p-3">
            <div className="grid grid-cols-3 gap-3">
              {/* 当月中高端客户拆机意向客户数 */}
              <div className="bg-white rounded-lg p-3 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-black">{retentionMetricsNew[0].name}</span>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </div>
                    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-sm bg-[#2563FF]"></div>
                    <span className="text-xs text-black">客户数</span>
                  </div>
                </div>
                <div className="flex-1">
                  <MetricChart metric={retentionMetricsNew[0]} chartHeight={80} />
                </div>
              </div>

              {/* 热线工单 */}
            <div className="bg-white rounded-lg p-3 flex flex-col h-full">
  {/* 标题行（保持不动） */}
  <div className="flex items-center justify-between mb-1">
    <span className="text-sm font-semibold text-black">{retentionMetricsNew[1].name}</span>
    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
  </div>

  {/* 核心修改：去掉多余的 div 包装，让 flex-1 直接作用于内容容器 */}
  <div className="flex-1 flex flex-col items-center justify-center">
    {/* 数值 + 单位：增大字体权重 */}
    <div className="flex items-baseline gap-1 mb-1">
      <span className="text-2xl font-bold text-gray-900">{retentionMetricsNew[1].value}</span>
      <span className="text-sm text-gray-500">{retentionMetricsNew[1].yoyUnit}</span>
    </div>
    {/* 副标题：保持原样 */}
    <div className="text-sm text-gray-500">{retentionMetricsNew[1].subtitle}</div>
  </div>
</div>

              {/* 分公司工单 */}
            <div className="bg-white rounded-lg p-3 flex flex-col h-full">
  {/* 标题行 不动 */}
  <div className="flex items-center justify-between mb-1">
    <span className="text-sm font-semibold text-black">{retentionMetricsNew[2].name}</span>
    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
  </div>

  {/* 中间内容：垂直 + 水平居中 */}
  <div className="flex-1 flex flex-col items-center justify-center">
    <div className="flex items-baseline gap-1 mb-1">
      <span className="text-2xl font-bold text-gray-900">{retentionMetricsNew[2].value}</span>
      <span className="text-sm text-gray-500">{retentionMetricsNew[2].yoyUnit}</span>
    </div>
    <div className="text-sm text-gray-500">{retentionMetricsNew[2].subtitle}</div>
  </div>
</div>
            </div>
          </div>

          {/* 右组 - 浅紫背景，包含2个卡片 */}
          <div className="col-span-2 bg-[#F0F0FF] rounded-lg p-3">
            <div className="grid grid-cols-2 gap-3">
              {/* 中高端客户拆机率 */}
              <div className="bg-white rounded-lg p-3 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-black">{retentionMetricsNew[3].name}</span>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </div>
                    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-[#2563FF]"></div>
                      <span className="text-xs text-black">占比</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#52C41A]"></div>
                      <span className="text-xs text-[#52C41A]">环比</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <MetricChart metric={retentionMetricsNew[3]} chartHeight={80} />
                </div>
              </div>

              {/* 当月中高端客户离网率 */}
              <div className="bg-white rounded-lg p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-black">{retentionMetricsNew[4].name}</span>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </div>
                    <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-[#2563FF]"></div>
                      <span className="text-xs text-black">离网率</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#52C41A]"></div>
                      <span className="text-xs text-[#52C41A]">环比</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <MetricChart metric={retentionMetricsNew[4]} chartHeight={80} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 满意度 - 3个卡片 */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">满意度</h3>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="grid grid-cols-3 gap-4">
            {satisfactionMetricsNew.map((metric) => (
              <div key={metric.id} className="bg-white rounded-lg p-3 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">{metric.name}</span>
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                  </div>
                  <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-bold text-gray-900">{metric.value}</span>
                  <span className="text-sm text-gray-500">分</span>
                  {metric.yoy && (
                    <div className="flex items-center gap-1 ml-2 ml-auto">
                      <span className="text-xs text-gray-400">环比</span>
                      <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.trend === 'up' ? '+' : ''}{metric.yoy}{metric.yoyUnit}
                      </span>
                      {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                      {metric.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <MetricChart metric={metric} chartHeight={100} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

