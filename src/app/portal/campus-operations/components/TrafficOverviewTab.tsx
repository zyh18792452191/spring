'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Info, Users, BarChart3, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { useMounted } from '@/hooks/useMounted';

interface TrafficOverviewTabProps {
  regionDisplay: string;
}

// 新疆维吾尔自治区16地市分公司
const cities = ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '阿克苏', '克孜勒苏', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '奎屯', '石河子'];

// 颜色配置
const COLORS = {
  blue: '#2563FF',
  green: '#52C41A',
  orange: '#FF8C00',
  purple: '#722ED1',
  red: '#FF4D4F',
};

export default function TrafficOverviewTab({ regionDisplay }: TrafficOverviewTabProps) {
  
  const mounted = useMounted();
  
  // ========== 「客」分组数据 ==========
  const customerMetrics = {
    total: { value: '4,137.9', unit: '万户', mom: 2.1, yoy: 5.8, trend: 'up' },
    newAdd: { value: '+8.24', unit: '万户', daily: 0.5, yoy: 7.5, trend: 'up' },
    key23: { value: '4000', unit: '万户', mom: 50, yoy: 35.2, trend: 'up' },
    overPackage: { value: '4000', unit: '万户', mom: 50, yoy: 28.5, trend: 'up' },
    lowValue: { value: '4000', unit: '万户', mom: 0.5, yoy: 12.3, trend: 'up' },
  };

  // 当月累计手机上网客户趋势数据（近6个月）
  const customerMonthTrendData = [
    { month: '1月', customers: 4050, yoy: 5.2 },
    { month: '2月', customers: 4080, yoy: 6.1 },
    { month: '3月', customers: 4102, yoy: 4.8 },
    { month: '4月', customers: 4120, yoy: 7.3 },
    { month: '5月', customers: 4128, yoy: 5.5 },
    { month: '6月', customers: 4138, yoy: 2.1 },
  ];

  // 月新增客户趋势数据（近6个月）
  const newCustomerTrendData = [
    { month: '1月', newAdd: 6.5, yoy: 12.3 },
    { month: '2月', newAdd: 7.2, yoy: 8.5 },
    { month: '3月', newAdd: 7.8, yoy: 10.2 },
    { month: '4月', newAdd: 8.0, yoy: 6.8 },
    { month: '5月', newAdd: 8.1, yoy: 9.1 },
    { month: '6月', newAdd: 8.24, yoy: 7.5 },
  ];

  // 23类重点客户三扩三融量级趋势数据（近6个月）
  const key23TrendData = [
    { month: '1月', value: 3200, yoy: 28.5 },
    { month: '2月', value: 3400, yoy: 32.1 },
    { month: '3月', value: 3600, yoy: 30.8 },
    { month: '4月', value: 3750, yoy: 33.5 },
    { month: '5月', value: 3900, yoy: 34.2 },
    { month: '6月', value: 4000, yoy: 35.2 },
  ];

  // 当月超套客户趋势数据（近6个月）
  const overPackageTrendData = [
    { month: '1月', value: 3500, yoy: 22.3 },
    { month: '2月', value: 3600, yoy: 24.5 },
    { month: '3月', value: 3700, yoy: 25.8 },
    { month: '4月', value: 3800, yoy: 26.2 },
    { month: '5月', value: 3900, yoy: 27.5 },
    { month: '6月', value: 4000, yoy: 28.5 },
  ];

  // 低价值套餐客户迁出量级趋势数据（近6个月）
  const lowValueTrendData = [
    { month: '1月', value: 3800, yoy: 8.5 },
    { month: '2月', value: 3850, yoy: 9.2 },
    { month: '3月', value: 3900, yoy: 10.5 },
    { month: '4月', value: 3920, yoy: 11.2 },
    { month: '5月', value: 3950, yoy: 11.8 },
    { month: '6月', value: 4000, yoy: 12.3 },
  ];

  // ========== 「量」分组数据 ==========
  const trafficMetrics = {
    daily: { value: '920.5', unit: 'GB', mom: -50, trend: 'down' },
    monthly: { value: '128.1', unit: '亿MB', mom: -9.7, trend: 'down' },
    yearly: { value: '3,720.7', unit: '亿MB', mom: 12.3, trend: 'up' },
  };

  const trafficGrowthData = cities.map(city => ({
    city,
    daily: Math.floor(Math.random() * 500 + 100),
    monthly: Math.floor(Math.random() * 50 + 10),
  }));

  const trafficShareData = [
    { name: '非校园', value: 75 },
    { name: '校园', value: 25 },
  ];

  const trafficIndicators = [
    { name: '流量环比增幅', value: -9.7, trend: 'down' },
    { name: '流量同比增幅', value: 14.8, trend: 'up' },
    { name: '当月流量份额', value: 14.8, trend: 'up' },
    { name: '新增激发贡献', value: -9.7, trend: 'down' },
    { name: '存量激发贡献', value: 14.8, trend: 'up' },
  ];

  // 流量来源分析数据
  const trafficSourceData = [
    { name: '存量激发', value: 5.2 },
    { name: '新入网', value: 2.1 },
    { name: '沉默激活', value: 1.5 },
    { name: '流失损失(离网)', value: -0.2 },
    { name: '流失损失(沉默)', value: -0.1 },
  ];

  // ========== 「收」分组数据 ==========
  const revenueMetrics = {
    total: { value: '4,568.9', unit: '万元' },
    price: { value: '3.2', unit: '元/G' },
    packagePrice: { value: '2.8', unit: '元/G' },
    addOnPrice: { value: '4.5', unit: '元/G' },
    overPrice: { value: '10.0', unit: '元/G' },
    darpu: { value: '45.7', unit: '元' },
    overRatio: { value: '5.2', unit: '%' },
    packageRatio: { value: '65.4', unit: '%' },
    addOnRatio: { value: '20', unit: '%' },
    otherRatio: { value: '9.4', unit: '%' },
  };

  // DARPU占比饼图数据
  const darpuPieData = [
    { name: '套内分摊', value: 65.4, color: COLORS.blue },
    { name: '流量包', value: 20, color: COLORS.green },
    { name: '超套费', value: 5.2, color: COLORS.orange },
    { name: '其他', value: 9.4, color: COLORS.purple },
  ];

  const revenueByCity = cities.map(city => ({
    city,
    套餐分摊: Math.floor(Math.random() * 3000 + 2000),
    流量包: Math.floor(Math.random() * 800 + 400),
    流量超套: Math.floor(Math.random() * 400 + 100),
  }));

  // 流量收入趋势数据（近6个月）
  const revenueTrendData = [
    { month: '1月', revenue: 4200, yoy: 8.5 },
    { month: '2月', revenue: 4350, yoy: 10.2 },
    { month: '3月', revenue: 4100, yoy: 6.8 },
    { month: '4月', revenue: 4480, yoy: 12.5 },
    { month: '5月', revenue: 4520, yoy: 11.3 },
    { month: '6月', revenue: 4569, yoy: 9.7 },
  ];

  // ========== 「质」分组数据 ==========
  const qualityMetrics = {
    monthlyTime: { value: '5.2', unit: '小时' },
    dailyTime: { value: '0.4', unit: '小时/日' },
    freeResource: { value: '20.5', unit: 'GB' },
    dou: { value: '14.4', unit: 'GB' },
    saturation: { value: '78.5', unit: '%' },
  };

  // 当月累计使用时长趋势数据（近6个月）
  const monthlyTimeTrendData = [
    { month: '1月', value: 4.8, yoy: 8.2 },
    { month: '2月', value: 4.9, yoy: 7.5 },
    { month: '3月', value: 5.0, yoy: 6.8 },
    { month: '4月', value: 5.1, yoy: 5.5 },
    { month: '5月', value: 5.1, yoy: 4.2 },
    { month: '6月', value: 5.2, yoy: 3.8 },
  ];

  // 日均户均使用时长趋势数据（近6个月）
  const dailyTimeTrendData = [
    { month: '1月', value: 0.35, yoy: 5.2 },
    { month: '2月', value: 0.36, yoy: 4.8 },
    { month: '3月', value: 0.37, yoy: 4.5 },
    { month: '4月', value: 0.38, yoy: 3.8 },
    { month: '5月', value: 0.39, yoy: 3.2 },
    { month: '6月', value: 0.4, yoy: 2.8 },
  ];

  const douStructure = [
    { range: '100G+', value: 10, trend: -9.7 },
    { range: '30-100GB', value: 15, trend: -9.7 },
    { range: '10-30GB', value: 20, trend: -9.7 },
    { range: '1-10GB', value: 25, trend: -9.7 },
    { range: '0-1GB', value: 30, trend: -9.7 },
  ];

  // DOU结构饼图颜色（共用图例）
  const douPieColors = ['#1a365d', '#2c5282', '#3182ce', '#63b3ed', '#bee3f8'];

  // 客户DOU结构变化饼图数据
  const douStructurePieData = douStructure.map((item, idx) => ({
    name: item.range,
    value: item.value,
    color: douPieColors[idx],
  }));

  // 超套客户结构饼图数据
  const overPackageStructureData = [
    { name: '100G+', value: 15, color: douPieColors[0] },
    { name: '30-100GB', value: 25, color: douPieColors[1] },
    { name: '10-30GB', value: 30, color: douPieColors[2] },
    { name: '1-10GB', value: 20, color: douPieColors[3] },
    { name: '0-1GB', value: 10, color: douPieColors[4] },
  ];

  // 低价值套餐客户结构饼图数据
  const lowValueStructureData = [
    { name: '100G+', value: 5, color: douPieColors[0] },
    { name: '30-100GB', value: 10, color: douPieColors[1] },
    { name: '10-30GB', value: 15, color: douPieColors[2] },
    { name: '1-10GB', value: 35, color: douPieColors[3] },
    { name: '0-1GB', value: 35, color: douPieColors[4] },
  ];

  // 渲染指标卡片
  const renderMetricCard = (
    name: string,
    value: string,
    unit: string,
    trend?: { value: number; label?: string },
    showChart?: boolean,
    chartData?: { month: string; value: number }[],
    chartHeight: number = 60
  ) => (
    <div className="bg-white rounded-lg p-3 flex flex-col h-full">
      <div className="mb-1">
        <span className="text-xs font-semibold text-black">{name}</span>
      </div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-lg font-bold text-gray-900">
          {value}
          <span className="text-xs text-gray-500 ml-0.5">{unit}</span>
        </span>
        {trend && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">{trend.label || '环比'}</span>
            <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.value >= 0 ? (
              <TrendingUp className="w-2.5 h-2.5 text-green-600" />
            ) : (
              <TrendingDown className="w-2.5 h-2.5 text-red-600" />
            )}
          </div>
        )}
      </div>
      {showChart && chartData && (
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="value" stroke={COLORS.green} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  // 渲染半圆仪表盘
  const renderGauge = (value: number, color: string, label: string, subText?: string) => (
    <div className="bg-white rounded-lg p-3 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-black">{label}</span>
        <a href="#" className="text-xs text-[#2563FF] hover:underline">去调度</a>
      </div>
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="relative w-20 h-16">
          <ResponsiveContainer width={80} height={80}>
            <PieChart>
              <Pie
                data={[{ value }, { value: 100 - value }]}
                cx="50%"
                cy="70%"
                innerRadius={24}
                outerRadius={32}
                dataKey="value"
                startAngle={180}
                endAngle={0}
              >
                <Cell fill={color} />
                <Cell fill="#E5E7EB" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center" style={{ top: '60%' }}>
            <span className="text-base font-bold text-gray-900">{value}%</span>
          </div>
        </div>
        {subText && <span className="text-xs text-gray-500 mt-1">{subText}</span>}
      </div>
    </div>
  );


  
  if (!mounted) return null;
  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      
      {/* ========== 「客」分组 ========== */}
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          客户指标
        </h3>
        
        {/* 核心客户：1+1 布局 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* 左侧主卡片 - 当月累计手机上网客户 */}
          <div className="bg-gray-50 border border-blue-100 rounded-lg p-3">
            <div className="bg-white rounded-lg p-3 flex flex-col h-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-black">当月累计手机上网客户</span>
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  {customerMetrics.total.value}
                  <span className="text-sm text-gray-500 ml-1">{customerMetrics.total.unit}</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">环比</span>
                  <span className="text-xs text-green-600">+{customerMetrics.total.mom}%</span>
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={80}>
                  <ComposedChart data={customerMonthTrendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Bar yAxisId="left" dataKey="customers" fill={COLORS.blue} radius={[2, 2, 0, 0]} barSize={16} />
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke={COLORS.green} strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* 右侧 - 月新增 */}
          <div className="bg-[#E8F4FD] rounded-lg p-3">
            <div className="bg-white rounded-lg p-3 flex flex-col h-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-black">月新增客户</span>
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  {customerMetrics.newAdd.value}
                  <span className="text-sm text-gray-500 ml-1">{customerMetrics.newAdd.unit}</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">较昨日</span>
                  <span className="text-xs text-green-600">+{customerMetrics.newAdd.daily}%</span>
                  <TrendingUp className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={80}>
                  <ComposedChart data={newCustomerTrendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Bar yAxisId="left" dataKey="newAdd" fill={COLORS.blue} radius={[2, 2, 0, 0]} barSize={16} />
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke={COLORS.green} strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        {/* 重点客群标签监控：3卡片布局 */}
        <div className="bg-[#F0F0FF] rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-2 font-medium">重点客群标签监控</div>
          <div className="grid grid-cols-3 gap-3">
            {/* 23类重点客户三扩三融量级 */}
            <div className="bg-white rounded-lg p-3 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-black truncate">23类重点客户三扩三融量级</span>
                <Info className="w-3 h-3 text-gray-400 cursor-help flex-shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-lg font-bold text-gray-900">
                  {customerMetrics.key23.value}
                  <span className="text-xs text-gray-500 ml-0.5">{customerMetrics.key23.unit}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">环比</span>
                  <span className="text-xs text-green-600">+{customerMetrics.key23.mom}%</span>
                  <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">同比</span>
                  <span className="text-xs text-green-600">+{customerMetrics.key23.yoy}%</span>
                  <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={60}>
                  <ComposedChart data={key23TrendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Bar yAxisId="left" dataKey="value" fill={COLORS.blue} radius={[2, 2, 0, 0]} barSize={12} />
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke={COLORS.green} strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* 当月超套客户 */}
            <div className="bg-white rounded-lg p-3 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-black truncate">当月超套客户</span>
                <Info className="w-3 h-3 text-gray-400 cursor-help flex-shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-lg font-bold text-gray-900">
                  {customerMetrics.overPackage.value}
                  <span className="text-xs text-gray-500 ml-0.5">{customerMetrics.overPackage.unit}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">环比</span>
                  <span className="text-xs text-green-600">+{customerMetrics.overPackage.mom}%</span>
                  <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">同比</span>
                  <span className="text-xs text-green-600">+{customerMetrics.overPackage.yoy}%</span>
                  <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={60}>
                  <ComposedChart data={overPackageTrendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Bar yAxisId="left" dataKey="value" fill={COLORS.blue} radius={[2, 2, 0, 0]} barSize={12} />
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke={COLORS.green} strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* 低价值套餐客户迁出量级 */}
            <div className="bg-white rounded-lg p-3 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-black truncate">低价值套餐客户迁出量级</span>
                <Info className="w-3 h-3 text-gray-400 cursor-help flex-shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-lg font-bold text-gray-900">
                  {customerMetrics.lowValue.value}
                  <span className="text-xs text-gray-500 ml-0.5">{customerMetrics.lowValue.unit}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">环比</span>
                  <span className="text-xs text-green-600">+{customerMetrics.lowValue.mom}%</span>
                  <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">同比</span>
                  <span className="text-xs text-green-600">+{customerMetrics.lowValue.yoy}%</span>
                  <TrendingUp className="w-2.5 h-2.5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={60}>
                  <ComposedChart data={lowValueTrendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Bar yAxisId="left" dataKey="value" fill={COLORS.blue} radius={[2, 2, 0, 0]} barSize={12} />
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke={COLORS.green} strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 「量」分组 ========== */}
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-green-500" />
          流量指标
        </h3>
        
        {/* 累计流量核心指标：3卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-[#E8F4FD] rounded-lg p-3">
            {renderMetricCard('当日累计手机上网流量', trafficMetrics.daily.value, trafficMetrics.daily.unit, { value: trafficMetrics.daily.mom })}
          </div>
          <div className="bg-[#E8F4FD] rounded-lg p-3">
            {renderMetricCard('当月累计手机上网流量', trafficMetrics.monthly.value, trafficMetrics.monthly.unit, { value: trafficMetrics.monthly.mom })}
          </div>
          <div className="bg-[#E8F4FD] rounded-lg p-3">
            {renderMetricCard('当年累计手机上网流量', trafficMetrics.yearly.value, trafficMetrics.yearly.unit, { value: trafficMetrics.yearly.mom })}
          </div>
        </div>
        
        {/* 流量结构 + 流量指标：左右布局 */}
        <div className="grid grid-cols-3 gap-4">
          {/* 左侧：流量结构占比 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-2 font-medium">流量结构占比（月）</div>
            <div className="flex items-center justify-center">
              <div className="relative w-28 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficShareData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      dataKey="value"
                      labelLine={false}
                    >
                      <Cell fill={COLORS.blue} />
                      <Cell fill={COLORS.green} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="ml-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#2563FF]"></div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">75%</div>
                    <div className="text-xs text-gray-500">非校园流量</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#52C41A]"></div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">25%</div>
                    <div className="text-xs text-gray-500">校园流量</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧：流量增幅、流量份额、流量来源分析 */}
          <div className="col-span-2 grid grid-cols-3 gap-3">
            {/* 流量增幅 */}
            <div className="bg-[#E8F4FD] rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-2 font-medium">流量增幅</div>
              <div className="bg-white rounded-lg p-2 mb-2 text-center">
                <div className="text-xl font-bold text-gray-900">14.8%</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">同比</div>
                  <div className="text-sm font-bold text-green-600">+14.8%</div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">环比</div>
                  <div className="text-sm font-bold text-red-600">-9.7%</div>
                </div>
              </div>
            </div>
            
            {/* 流量份额 */}
            <div className="bg-[#E8F4FD] rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-2 font-medium">流量份额</div>
              <div className="bg-white rounded-lg p-2 mb-2 text-center">
                <div className="text-xl font-bold text-gray-900">14.8%</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">同比</div>
                  <div className="text-sm font-bold text-green-600">+2.3%</div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">环比</div>
                  <div className="text-sm font-bold text-green-600">+1.5%</div>
                </div>
              </div>
            </div>
            
            {/* 流量来源分析 */}
            <div className="bg-[#F0F0FF] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-600 font-medium">流量来源分析</div>
                <Info className="w-3 h-3 text-gray-400 cursor-help" />
              </div>
              <div className="space-y-1.5">
                {trafficSourceData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-16 text-xs text-gray-600 truncate">{item.name}</div>
                    <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden relative">
                      <div 
                        className={`absolute h-full rounded ${item.value >= 0 ? 'bg-blue-500' : 'bg-red-400'}`}
                        style={{
                          left: item.value >= 0 ? '50%' : `${50 + item.value * 8}%`,
                          width: `${Math.abs(item.value) * 8}%`
                        }}
                      />
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />
                    </div>
                    <div className={`w-10 text-xs font-medium text-right ${item.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {item.value >= 0 ? '+' : ''}{item.value}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 「收」分组 ========== */}
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-orange-500" />
          收入指标
        </h3>
        
        {/* 流量收入 + 单价分析 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* 流量收入 */}
          <div className="bg-gray-50 border border-orange-100 rounded-lg p-3">
            <div className="bg-white rounded-lg p-3 h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-black">流量收入</span>
                <Info className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-gray-900">{revenueMetrics.total.value}</span>
                <span className="text-sm text-gray-500">{revenueMetrics.total.unit}</span>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={80}>
                  <ComposedChart data={revenueTrendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="revenue" fill={COLORS.orange} radius={[2, 2, 0, 0]} barSize={16} name="收入(万元)" />
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke={COLORS.green} strokeWidth={2} dot={{ r: 2 }} name="同比(%)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* 单价分析 */}
          <div className="bg-[#FFF7E6] rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-2 font-medium">单价分析（元/G）</div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-base font-bold text-gray-900">{revenueMetrics.price.value}</div>
                  <div className="text-xs text-gray-500">流量单价</div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-base font-bold text-blue-600">{revenueMetrics.packagePrice.value}</div>
                  <div className="text-xs text-gray-500">套内流量单价</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-base font-bold text-green-600">{revenueMetrics.addOnPrice.value}</div>
                  <div className="text-xs text-gray-500">套餐包流量单价</div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="text-base font-bold text-red-600">{revenueMetrics.overPrice.value}</div>
                  <div className="text-xs text-gray-500">流量超套单价</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* DARPU套内分摊与占比 */}
          <div className="bg-[#E8F4FD] rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-2 font-medium">DARPU套内分摊与占比</div>
            <div className="flex items-center gap-4">
              {/* 左侧：DARPU值 */}
              <div className="text-center min-w-[80px]">
                <div className="text-3xl font-bold text-gray-900">{revenueMetrics.darpu.value}</div>
                <div className="text-xs text-gray-500 mt-1">DARPU（元）</div>
              </div>
              {/* 右侧：饼图+图例 */}
              <div className="flex items-center flex-1 gap-4">
                <div className="relative w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={darpuPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={58}
                        dataKey="value"
                        labelLine={false}
                      >
                        {darpuPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* 图例 - 单列 */}
                <div className="flex flex-col gap-2">
                  {darpuPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-gray-600">{item.name}</span>
                      <span className="text-xs font-medium text-gray-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 收入构成图表 */}
        <div className="bg-[#E8F4FD] rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-2 font-medium">收入构成（按区域，万元）</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByCity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="city" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="套餐分摊" stackId="a" fill={COLORS.blue} radius={[0, 0, 0, 0]} />
                <Bar dataKey="流量包" stackId="a" fill={COLORS.green} />
                <Bar dataKey="流量超套" stackId="a" fill={COLORS.orange} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========== 「质」分组 ========== */}
      <div className="p-3">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          使用质量
        </h3>
        
        {/* 一行展示所有指标 */}
        <div className="bg-[#F5F7FA] rounded-lg p-3">
          <div className="grid grid-cols-5 gap-3">
            {/* 当月累计使用时长 */}
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-black">当月累计使用时长</span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">{qualityMetrics.monthlyTime.value}<span className="text-xs text-gray-500 ml-0.5">{qualityMetrics.monthlyTime.unit}</span></div>
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyTimeTrendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Bar yAxisId="left" dataKey="value" fill={COLORS.purple} radius={[2, 2, 0, 0]} barSize={10} />
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke={COLORS.green} strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* 日均户均使用时长 */}
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-black">日均户均使用时长</span>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2">{qualityMetrics.dailyTime.value}<span className="text-xs text-gray-500 ml-0.5">{qualityMetrics.dailyTime.unit}</span></div>
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyTimeTrendData}>
                    <XAxis dataKey="month" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" hide />
                    <YAxis yAxisId="right" orientation="right" hide />
                    <Bar yAxisId="left" dataKey="value" fill={COLORS.purple} radius={[2, 2, 0, 0]} barSize={10} />
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke={COLORS.green} strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* 户均免费资源 */}
            <div className="bg-white rounded-lg p-3 flex flex-col justify-center">
              <span className="text-xs font-semibold text-black mb-2">户均免费资源</span>
              <div className="text-2xl font-bold text-gray-900">{qualityMetrics.freeResource.value}<span className="text-xs text-gray-500 ml-0.5">{qualityMetrics.freeResource.unit}</span></div>
            </div>
            
            {/* 当月DOU */}
            <div className="bg-white rounded-lg p-3 flex flex-col justify-center">
              <span className="text-xs font-semibold text-black mb-2">当月DOU</span>
              <div className="text-2xl font-bold text-gray-900">{qualityMetrics.dou.value}<span className="text-xs text-gray-500 ml-0.5">{qualityMetrics.dou.unit}</span></div>
            </div>
            
            {/* 流量饱和度 */}
            <div className="bg-white rounded-lg p-3 flex flex-col justify-center">
              <span className="text-xs font-semibold text-black mb-2">流量饱和度（不含递延）</span>
              <div className="text-2xl font-bold text-gray-900">{qualityMetrics.saturation.value}<span className="text-xs text-gray-500 ml-0.5">{qualityMetrics.saturation.unit}</span></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
