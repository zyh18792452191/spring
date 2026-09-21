'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, ChevronRight, Settings, Info, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, AreaChart, Area } from 'recharts';
import IndicatorTree, { IndicatorCardData } from '@/components/IndicatorTree';
import AnalysisPanel from '@/components/AnalysisPanel';
import DataInsightReports from '@/components/DataInsightReports';
import WorkOrderPanel from '@/components/WorkOrderPanel';
import IndicatorDispatchDialog from '@/components/IndicatorDispatchDialog';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import { textConfig } from '@/config/textConfig';
import { useMounted } from '@/hooks/useMounted';

// 类型定义
interface MetricData {
  id: number;
  name: string;
  indicatorName?: string;
  value: string;
  yoy: string;
  yoyUnit?: string;
  yoyLabel?: string;
  status: 'normal' | 'warning' | 'danger';
  color: string;
  chartType: 'line' | 'barline';
  chartData: Array<{ month: string; value?: number; change?: number }>;
  businessScope?: string;
  hasEntrances?: boolean;
  isRateIndicator?: boolean;
}

// 概览页指标数据 - 使用8月-次年1月的数据
const overviewMetrics: MetricData[] = [
  {
    id: 1,
    name: '新增客户规模',
    value: '125.6万户',
    yoy: '+5.2',
    yoyUnit: '%',
    yoyLabel: '环比',
    status: 'warning',
    color: '#3B82F6',
    chartType: 'barline',
    businessScope: '当月新入网客户，取自当月最后一天单一用户信息日表中，限定入网日期为当月的用户数(剔除测试和物联网用户)',
    hasEntrances: true,
    isRateIndicator: false,
    chartData: [
      { month: '8月', value: 108, change: 3.2 },
      { month: '9月', value: 112, change: 3.7 },
      { month: '10月', value: 116, change: 3.6 },
      { month: '11月', value: 119, change: 2.6 },
      { month: '12月', value: 122, change: 2.5 },
      { month: '1月', value: 125.6, change: 2.9 }
    ]
  },
  {
    id: 2,
    name: '一级新增放号量',
    value: '36.5万户',
    yoy: '+3.8',
    yoyUnit: '%',
    yoyLabel: '环比',
    status: 'warning',
    color: '#3B82F6',
    chartType: 'barline',
    businessScope: '运营平台累计计算二级指标值',
    hasEntrances: true,
    isRateIndicator: false,
    chartData: [
      { month: '8月', value: 30.2, change: 2.1 },
      { month: '9月', value: 31.5, change: 4.3 },
      { month: '10月', value: 32.8, change: 4.1 },
      { month: '11月', value: 34.0, change: 3.7 },
      { month: '12月', value: 35.2, change: 3.5 },
      { month: '1月', value: 36.5, change: 3.7 }
    ]
  },
  {
    id: 3,
    name: '省级新增放号量',
    value: '1021.4万户',
    yoy: '+6.5',
    yoyUnit: '%',
    yoyLabel: '环比',
    status: 'warning',
    color: '#3B82F6',
    chartType: 'barline',
    businessScope: '运营平台累计计算二级指标值',
    hasEntrances: true,
    isRateIndicator: false,
    chartData: [
      { month: '8月', value: 850, change: 4.5 },
      { month: '9月', value: 890, change: 4.7 },
      { month: '10月', value: 920, change: 3.4 },
      { month: '11月', value: 950, change: 3.3 },
      { month: '12月', value: 980, change: 3.2 },
      { month: '1月', value: 1021.4, change: 4.2 }
    ]
  },
  {
    id: 4,
    name: 'T+6留存率',
    value: '68.5%',
    yoy: '+1.2',
    yoyUnit: 'pp',
    yoyLabel: '环比',
    status: 'normal',
    color: '#3B82F6',
    chartType: 'barline',
    businessScope: '账期：最新出账月份-6，账期当年出账留存客户数之和/账期当月新增客户数',
    hasEntrances: false,
    isRateIndicator: true,
    chartData: [
      { month: '8月', value: 65.2, change: 0.8 },
      { month: '9月', value: 66.0, change: 0.8 },
      { month: '10月', value: 66.8, change: 0.8 },
      { month: '11月', value: 67.3, change: 0.5 },
      { month: '12月', value: 67.8, change: 0.5 },
      { month: '1月', value: 68.5, change: 0.7 }
    ]
  }
];

// 重入网占比数据
const reEntryData = [
  { month: '8月', value: 14.8, change: 0.3 },
  { month: '9月', value: 15.2, change: 0.4 },
  { month: '10月', value: 15.8, change: 0.6 },
  { month: '11月', value: 16.2, change: 0.4 },
  { month: '12月', value: 16.5, change: 0.3 },
  { month: '1月', value: 16.8, change: 0.3 }
];

// T+1月ARPU数据
const arpuData = [
  { month: '8月', arpu: 41.2, below50Rate: 42.5 },
  { month: '9月', arpu: 42.0, below50Rate: 40.8 },
  { month: '10月', arpu: 43.5, below50Rate: 38.2 },
  { month: '11月', arpu: 44.8, below50Rate: 36.5 },
  { month: '12月', arpu: 45.5, below50Rate: 34.2 },
  { month: '1月', arpu: 46.2, below50Rate: 32.8 }
];

// T+6留存率分析数据 - 面积图
const retentionAnalysisData = [
  { month: '8月', value: 65.2 },
  { month: '9月', value: 66.0 },
  { month: '10月', value: 66.8 },
  { month: '11月', value: 67.3 },
  { month: '12月', value: 67.8 },
  { month: '1月', value: 68.5 }
];

// 渠道效能数据 - 环形图（省级渠道 vs 一级渠道）
const channelPieData = [
  { name: '省级渠道', value: 96.5, color: '#3B82F6' },
  { name: '一级渠道', value: 3.5, color: '#10B981' }
];

// 渠道类型排名数据
const channelRankData = [
  { name: '实体渠道', value: 63.3, color: '#3B82F6' },
  { name: '直销渠道', value: 19.2, color: '#10B981' },
  { name: '线上渠道', value: 15.1, color: '#F59E0B' },
  { name: '泛渠道', value: 1.4, color: '#8B5CF6' },
  { name: '政企渠道', value: 0.9, color: '#EC4899' }
];

// 整体增量指标树数据
const incrementalIndicatorTree: IndicatorCardData = {
  id: 'root',
  label: '分类节点',
  name: '整体增量指标',
  value: '',
  level: 0,
  children: [
    {
      id: 'new-customer-scale',
      label: '分类节点',
      name: '新增客户规模',
      value: '125.6万',
      level: 1,
      children: [
        {
          id: 'new-customer-channel',
          label: '分类节点',
          name: '按渠道',
          value: '',
          level: 2,
          children: [
            { id: 'entity-channel', label: '指标节点', name: '实体渠道', value: '79.5万', level: 3 },
            { id: 'direct-channel', label: '指标节点', name: '直销渠道', value: '24.1万', level: 3 },
            { id: 'online-channel', label: '指标节点', name: '线上渠道', value: '19.0万', level: 3 },
            { id: 'pan-channel', label: '指标节点', name: '泛渠道', value: '1.8万', level: 3 },
            { id: 'enterprise-channel', label: '指标节点', name: '政企渠道', value: '1.1万', level: 3 }
          ]
        },
        {
          id: 'new-customer-province',
          label: '分类节点',
          name: '按地州',
          value: '',
          level: 2,
          children: [
            { id: 'province-gd', label: '指标节点', name: '吐鲁番', value: '15.2万', level: 3 },
            { id: 'province-js', label: '指标节点', name: '哈密', value: '12.8万', level: 3 },
            { id: 'province-zj', label: '指标节点', name: '昌吉', value: '11.5万', level: 3 },
            { id: 'province-sd', label: '指标节点', name: '博州', value: '10.6万', level: 3 },
            { id: 'province-hn', label: '指标节点', name: '巴州', value: '9.8万', level: 3 }
          ]
        }
      ]
    },
    {
      id: 'first-level-new',
      label: '分类节点',
      name: '一级新增放号量',
      value: '36.5万',
      level: 1,
      children: [
        { id: 'first-level-package', label: '指标节点', name: '套餐办理', value: '18.2万', level: 2 },
        { id: 'first-level-service', label: '指标节点', name: '服务办理', value: '12.3万', level: 2 },
        { id: 'first-level-other', label: '指标节点', name: '其他', value: '6.0万', level: 2 }
      ]
    },
    {
      id: 'province-level-new',
      label: '分类节点',
      name: '省级新增放号量',
      value: '1021.4万',
      level: 1,
      children: [
        { id: 'province-new-gd', label: '指标节点', name: '吐鲁番', value: '125.6万', level: 2 },
        { id: 'province-new-js', label: '指标节点', name: '哈密', value: '98.5万', level: 2 },
        { id: 'province-new-zj', label: '指标节点', name: '昌吉', value: '85.2万', level: 2 },
        { id: 'province-new-sd', label: '指标节点', name: '博州', value: '76.8万', level: 2 },
        { id: 'province-new-other', label: '指标节点', name: '其他地州', value: '635.3万', level: 2 }
      ]
    }
  ]
};

// 分析面板数据生成函数
const generateAnalysisData = (indicatorId: string) => {
  const analysisReasons = [
    '新增客户规模环比增长5.2%，主要受益于夏季促销活动带动，实体渠道贡献最大',
    'T+6留存率仍有提升空间，建议加强新客户首月关怀和套餐匹配',
    '渠道效能分析显示实体渠道占比63.3%，线上渠道增长潜力待挖掘'
  ];

  const regionData = [
    { name: '吐鲁番', value: 15.2 },
    { name: '哈密', value: 12.8 },
    { name: '昌吉', value: 11.5 },
    { name: '博州', value: 10.6 },
    { name: '巴州', value: 9.8 }
  ];

  const trendData = [
    { month: '8月', value: 108 },
    { month: '9月', value: 112 },
    { month: '10月', value: 116 },
    { month: '11月', value: 119 },
    { month: '12月', value: 122 },
    { month: '1月', value: 125.6 }
  ];

  return {
    analysisReasons,
    regionData,
    topRegions: ['吐鲁番', '哈密', '昌吉'],
    bottomRegions: ['巴州', '博州'],
    trendData
  };
};

// 指标卡片组件
function MetricCard({ metric, onDispatch }: { metric: MetricData; onDispatch?: () => void }) {
  const isPositive = !metric.yoy.startsWith('-');

  
  return (
    <Card className="p-4 bg-white border border-gray-200 shadow-sm relative">
      {/* 卡片头部 */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900">{metric.name}</h3>
            {/* 预警标识 */}
            {metric.status === 'warning' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    <p className="text-amber-600 font-medium">指标需关注：环比增长放缓</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {metric.status === 'danger' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    <p className="text-red-600 font-medium">指标预警：环比下降</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px] text-xs">
                  <p>{metric.businessScope}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {metric.hasEntrances && (
          <div className="flex items-center gap-1.5 text-xs">
            <button className="text-blue-600 hover:text-blue-700 hover:underline">去调度</button>
            <span className="text-gray-300">|</span>
            <button className="text-blue-600 hover:text-blue-700 hover:underline">指标树分析</button>
          </div>
        )}
      </div>
      
      {/* 核心数值和环比 */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
        <span className="text-sm text-gray-500">{metric.yoyLabel}</span>
        <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4 mr-0.5" /> : <TrendingDown className="w-4 h-4 mr-0.5" />}
          {metric.yoy}{metric.yoyUnit}
        </span>
      </div>
      
      {/* 趋势图表 */}
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={metric.chartData}>
            <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis 
              yAxisId="left" 
              tick={{ fontSize: 9 }} 
              axisLine={false} 
              tickLine={false}
              domain={metric.isRateIndicator ? [60, 100] : ['auto', 'auto']}
              width={30}
            />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
            <RechartsTooltip 
              contentStyle={{ fontSize: 12, padding: '4px 8px' }}
              formatter={(value: number, name: string) => [value, name === 'value' ? '指标值' : '环比变化']}
            />
            <Bar yAxisId="left" dataKey="value" fill="#3B82F6" radius={[2, 2, 0, 0]} barSize={16} />
            <Line yAxisId="right" type="monotone" dataKey="change" stroke="#10B981" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// 质量分析模块组件
function QualityAnalysisCard({ 
  title, 
  subtitle, 
  children,
  showWarning = false,
  warningText
}: { 
  title: string; 
  subtitle: string; 
  children: React.ReactNode;
  showWarning?: boolean;
  warningText?: string;
}) {
  return (
    <Card className="p-4 bg-white border border-gray-200 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        {showWarning && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px] text-xs">
                <p className="text-amber-600 font-medium">{warningText || '需要关注'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[280px] text-xs">
              <p>{subtitle}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {children}
    </Card>
  );
}

// 概览Tab组件
function OverviewTab({ onJumpToTree }: { onJumpToTree?: () => void }) {
  return (
    <div className="space-y-4">
      {/* 整体增量指标 */}
      <div>
        <h2 className="text-base font-medium text-gray-900 mb-3">整体增量指标</h2>
        <div className="grid grid-cols-4 gap-4">
          {overviewMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
      
      {/* 新增客户质量分析 */}
      <div>
        <h2 className="text-base font-medium text-gray-900 mb-3">新增客户质量分析</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* ① 重入网占比分析 */}
          <QualityAnalysisCard 
            title="① 重入网占比分析" 
            subtitle="1-（累计纯新增客户数/累计新增出账客户数）"
          >
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={reEntryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar yAxisId="left" dataKey="value" fill="#3B82F6" radius={[2, 2, 0, 0]} barSize={18} name="重入网占比(%)" />
                  <Line yAxisId="right" type="monotone" dataKey="change" stroke="#10B981" strokeWidth={2} dot={false} name="环比变化" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </QualityAnalysisCard>
          
          {/* ② 新增次月ARPU分析 */}
          <QualityAnalysisCard 
            title="② 新增次月ARPU分析" 
            subtitle="年均T+1月留存平均折后ARPU"
          >
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={arpuData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar yAxisId="left" dataKey="arpu" fill="#8B5CF6" radius={[2, 2, 0, 0]} barSize={18} name="T+1月ARPU(元)" />
                  <Line yAxisId="right" type="monotone" dataKey="below50Rate" stroke="#F59E0B" strokeWidth={2} dot={false} name="50元以下占比(%)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </QualityAnalysisCard>
          
          {/* ③ 留存率分析 */}
          <QualityAnalysisCard 
            title="③ 留存率分析" 
            subtitle="账期：最新出账月份-6，账期当年出账留存客户数之和/账期当月新增客户数"
          >
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={retentionAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[60, 70]} width={35} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="T+6留存率(%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </QualityAnalysisCard>
          
          {/* ④ 渠道效能分析 */}
          <QualityAnalysisCard 
            title="④ 渠道效能分析" 
            subtitle="一级渠道与省级渠道新增放号量占比对比"
          >
            <div className="flex items-center h-36">
              <div className="w-1/2 h-full flex flex-col items-center justify-center relative">
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={channelPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {channelPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* 环形图图例 */}
                <div className="absolute bottom-2 left-1/4 flex gap-3 text-xs">
                  {channelPieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-1/2 pl-2">
                <h5 className="text-xs font-medium text-gray-700 mb-2">渠道类型排名</h5>
                <div className="space-y-1.5">
                  {channelRankData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </QualityAnalysisCard>
        </div>
      </div>
    </div>
  );
}

// 指标树内容组件
function IndicatorTreeContent({ 
  treeData, 
  indicatorName, 
  selectedMonth, 
  currentTab,
  selectedRegion,
  regionDisplay 
}: { 
  treeData: IndicatorCardData; 
  indicatorName: string;
  selectedMonth?: string;
  currentTab?: string;
  selectedRegion?: { cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean };
  regionDisplay?: string;
}) {
  const [selectedIndicator, setSelectedIndicator] = useState<string>('root');
  const [indicatorTreeData] = useState<IndicatorCardData[]>([treeData]);

  const handleCardClick = (id: string) => {
    setSelectedIndicator(id);
  };

  const dynamicAnalysisData = selectedIndicator
    ? generateAnalysisData(selectedIndicator)
    : generateAnalysisData('root');

  const getPageId = () => {
    if (indicatorName === '新增客户规模') {
      return 'portal.incremental.new-customer-scale';
    } else if (indicatorName === '一级新增放号量') {
      return 'portal.incremental.first-level-new';
    } else if (indicatorName === '省级新增放号量') {
      return 'portal.incremental.province-level-new';
    }
    return 'portal.incremental.overview';
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-220px)]">
      {/* 左侧指标树 */}
      <div className="w-[60%] overflow-auto border border-gray-200 rounded-lg bg-white p-4">
        <IndicatorTree
          data={indicatorTreeData}
          onCardClick={handleCardClick}
          selectedId={selectedIndicator}
        />
      </div>

      {/* 右侧分析面板 */}
      <div className="w-[40%] overflow-hidden flex flex-col gap-4">
        <div className="flex-1">
          <AnalysisPanel
            indicatorName={indicatorName}
            selectedIndicator={selectedIndicator}
            indicatorTreeData={indicatorTreeData}
            analysisReasons={dynamicAnalysisData.analysisReasons}
            regionData={dynamicAnalysisData.regionData}
            topRegions={dynamicAnalysisData.topRegions}
            bottomRegions={dynamicAnalysisData.bottomRegions}
            trendData={dynamicAnalysisData.trendData}
            currentTab={currentTab}
            from="incremental-operations"
            businessScenario="增量运营"
            selectedRegion={selectedRegion}
            regionDisplay={regionDisplay}
          />
        </div>

        <div className="border border-gray-200 rounded-lg">
          <DataInsightReports
            pageId={getPageId()}
            maxDisplay={3}
            showViewAll={true}
          />
        </div>
      </div>
    </div>
  );
}

// 主页面组件
export default function IncrementalOperationsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [selectedRegion, setSelectedRegion] = useState<{ cityCode: string; districtCode: string; gridCode: string; isProvince?: boolean }>({ cityCode: '', districtCode: '', gridCode: '', isProvince: true }); // 默认新疆维吾尔自治区全疆
  const [regionDisplay, setRegionDisplay] = useState<string>('新疆维吾尔自治区全疆');
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);
  const [selectedIndicatorForDispatch, setSelectedIndicatorForDispatch] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const mounted = useMounted();

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleJumpToTree = () => {
    setActiveTab('new-customer-scale');
  };

  if (!mounted) return null;
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 */}
      <div className="px-6 pt-4 pb-0">
        {/* 面包屑导航 + 一级Tab胶囊 */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-[#0085D0]">
            <span>市场运营</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span>存量运营</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-700 font-medium">增量运营</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="px-3 py-1 rounded-full text-xs font-medium bg-[#0085D0] text-white"
            >
              指标洞察
            </button>
          </div>
        </div>
      </div>

      {/* 二级Tab + 筛选器 */}
      <Card className="mx-6 mb-4 p-3">
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent h-auto p-0 gap-1">
                <TabsTrigger 
                  value="overview" 
                  className="px-4 py-1.5 text-sm rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
                >
                  概览
                </TabsTrigger>
              <TabsTrigger 
                value="new-customer-scale"
                className="px-4 py-1.5 text-sm rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
              >
                新增客户规模
              </TabsTrigger>
              <TabsTrigger 
                value="first-level-new"
                className="px-4 py-1.5 text-sm rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
              >
                一级新增放号量
              </TabsTrigger>
              <TabsTrigger 
                value="province-level-new"
                className="px-4 py-1.5 text-sm rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
              >
                省级新增放号量
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-3">
            <a
              href="/portal/capability/insight/tree-templates"
              className="text-sm text-[#2563FF] hover:underline cursor-pointer"
            >
              指标树模板
            </a>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none min-w-[130px]"
            />
            <XinjiangRegionSelector
              value={selectedRegion}
              onChange={(cityCode: string, cityName: string, districtCode: string, districtName: string, gridCode: string, gridName: string, isProvince?: boolean) => {
                setSelectedRegion({ cityCode, districtCode, gridCode, isProvince });
                if (isProvince) {
                  setRegionDisplay('新疆维吾尔自治区全疆');
                } else {
                  setRegionDisplay(gridCode ? `${cityName}/${districtName}/${gridName}` : districtCode ? `${cityName}/${districtName}` : cityName);
                }
              }}
            />
          </div>
        </div>
      </Card>

      {/* 主内容区 */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="mt-0">
            <OverviewTab onJumpToTree={handleJumpToTree} />
          </TabsContent>

          <TabsContent value="new-customer-scale" className="mt-0">
            <IndicatorTreeContent
              treeData={incrementalIndicatorTree.children?.[0] || incrementalIndicatorTree}
              indicatorName="新增客户规模"
              selectedMonth={selectedMonth}
              currentTab="new-customer-scale"
              selectedRegion={selectedRegion}
              regionDisplay={regionDisplay}
            />
          </TabsContent>

          <TabsContent value="first-level-new" className="mt-0">
            <IndicatorTreeContent
              treeData={incrementalIndicatorTree.children?.[1] || incrementalIndicatorTree}
              indicatorName="一级新增放号量"
              selectedMonth={selectedMonth}
              currentTab="first-level-new"
              selectedRegion={selectedRegion}
              regionDisplay={regionDisplay}
            />
          </TabsContent>

          <TabsContent value="province-level-new" className="mt-0">
            <IndicatorTreeContent
              treeData={incrementalIndicatorTree.children?.[2] || incrementalIndicatorTree}
              indicatorName="省级新增放号量"
              selectedMonth={selectedMonth}
              currentTab="province-level-new"
              selectedRegion={selectedRegion}
              regionDisplay={regionDisplay}
            />
          </TabsContent>

          <TabsContent value="indicator-tree" className="mt-0">
            <IndicatorTreeContent
              treeData={incrementalIndicatorTree}
              indicatorName="整体增量指标"
              selectedMonth={selectedMonth}
              currentTab="indicator-tree"
              selectedRegion={selectedRegion}
              regionDisplay={regionDisplay}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 工单面板 */}
      <Suspense fallback={null}>
        <WorkOrderPanel scenario="incremental" />
      </Suspense>

      {/* 调度对话框 */}
      <IndicatorDispatchDialog
        open={isDispatchDialogOpen}
        onClose={() => setIsDispatchDialogOpen(false)}
        indicatorName={selectedIndicatorForDispatch}
      />
    </div>
  );
}
