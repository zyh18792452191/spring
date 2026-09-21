'use client';

import React from 'react';
import { TrendingUp, TrendingDown, GraduationCap, Building2, Package, Radio, Smartphone, Wifi, ShoppingCart, Users, DollarSign, Target, BarChart3, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useMounted } from '@/hooks/useMounted';

interface CampusOverviewTabProps {
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
  cyan: '#0891B2',
  pink: '#EC4899',
};

export default function CampusOverviewTab({ regionDisplay }: CampusOverviewTabProps) {
  const mounted = useMounted();

  // ========== 1. 学生客户 ==========
  const studentHeadlines = {
    total: { value: '328.5', unit: '万户', mom: 3.2, yoy: 8.5 },
    broadband: { value: '156.2', unit: '万户', mom: 5.1, yoy: 12.3 },
    newSemester: { value: '28.6', unit: '万户', target: 35, progress: 81.7 },
    campusArpu: { value: '38.5', unit: '元', mom: 2.8, yoy: 5.2 },
  };

  // 学生客户趋势
  const studentTrendData = [
    { month: '1月', value: 285, yoy: 5.2 },
    { month: '2月', value: 290, yoy: 5.8 },
    { month: '3月', value: 298, yoy: 6.1 },
    { month: '4月', value: 305, yoy: 6.5 },
    { month: '5月', value: 315, yoy: 7.2 },
    { month: '6月', value: 320, yoy: 7.8 },
    { month: '7月', value: 318, yoy: 7.5 },
    { month: '8月', value: 322, yoy: 8.0 },
    { month: '9月', value: 329, yoy: 8.5 },
  ];

  // 校园市场份额饼图
  const marketShareData = [
    { name: '本公司', value: 42, color: COLORS.blue },
    { name: '竞争A', value: 35, color: COLORS.orange },
    { name: '竞争B', value: 15, color: COLORS.green },
    { name: '其他', value: 8, color: '#94A3B8' },
  ];

  // ========== 2. 院校覆盖 ==========
  const schoolMetrics = {
    total: { value: '1,286', unit: '所' },
    managed: { value: '862', unit: '所', rate: 67 },
    abClass: { value: '435', unit: '所', rate: 33.8 },
    broadbandCovered: { value: '1,105', unit: '所', rate: 85.9 },
    infoCoop: { value: '268', unit: '所', rate: 20.8 },
    lowPenetration: { value: '328', unit: '所' },
  };

  // 院校渗透率趋势
  const schoolPenetrationData = [
    { month: '3月', high: 58, mid: 42, low: 35 },
    { month: '4月', high: 60, mid: 44, low: 36 },
    { month: '5月', high: 62, mid: 45, low: 38 },
    { month: '6月', high: 65, mid: 47, low: 40 },
    { month: '7月', high: 68, mid: 48, low: 42 },
    { month: '8月', high: 72, mid: 52, low: 45 },
    { month: '9月', high: 78, mid: 58, low: 50 },
  ];

  // ========== 3. 产品销量 ==========
  const productMetrics = [
    { name: '校园卡放号', icon: Smartphone, daily: '1.2万', monthly: '8.6万', mom: 15.2, yoy: 22.8, color: COLORS.blue },
    { name: '校园宽带', icon: Wifi, daily: '0.8万', monthly: '5.2万', mom: 12.5, yoy: 18.3, color: COLORS.cyan },
    { name: '融合套餐', icon: Package, daily: '0.6万', monthly: '4.1万', mom: 8.6, yoy: 25.4, color: COLORS.purple },
    { name: '权益包', icon: Star, daily: '2.3万', monthly: '15.8万', mom: 5.2, yoy: 30.1, color: COLORS.orange },
  ];

  // ========== 4. 渠道效率 ==========
  const channelMetrics = {
    orange: {
      name: '校园代理（橙人）',
      icon: Radio,
      color: 'bg-orange-500',
      active: { value: '3,286', unit: '人', rate: 78.5 },
      coverage: { value: '1,052', unit: '所', rate: 81.8 },
      sales: { daily: '3,200', monthly: '2.1万', share: 35.2 },
    },
    physical: {
      name: '实体渠道',
      icon: Building2,
      color: 'bg-blue-500',
      active: { value: '156', unit: '个', rate: 82.3 },
      coverage: { value: '186', unit: '所', rate: 14.5 },
      sales: { daily: '4,500', monthly: '3.2万', share: 45.8 },
    },
    online: {
      name: '线上渠道',
      icon: Package,
      color: 'bg-green-500',
      active: { value: '5', unit: '个', rate: 100 },
      coverage: { value: '1,286', unit: '所', rate: 100 },
      sales: { daily: '1,800', monthly: '1.2万', share: 19.0 },
    },
  };

  // 渠道销量对比
  const channelSalesData = cities.slice(0, 8).map(city => ({
    city,
    橙人: Math.floor(Math.random() * 2000 + 500),
    实体: Math.floor(Math.random() * 3000 + 800),
    线上: Math.floor(Math.random() * 1500 + 300),
  }));

  // ========== 5. 秋开攻坚 ==========
  const autumnTracking = {
    overview: {
      newStudents: { target: 35, current: 28.6, rate: 81.7 },
      activity: { rate: 85.2, mom: 5.8 },
      broadband: { target: 8, current: 6.5, rate: 81.3 },
    },
    // 各院校分类进度
    categories: [
      {
        name: 'AB类重点院校',
        count: 435,
        color: 'border-blue-400',
        bg: 'bg-blue-50',
        items: [
          { name: '新生入网', current: '12.5万', target: 15, rate: 83.3 },
          { name: '宽带预约', current: '3.2万', target: 4, rate: 80.0 },
          { name: '迎新活动', current: '286', target: 350, rate: 81.7 },
        ],
      },
      {
        name: '集团纳管院校',
        count: 862,
        color: 'border-purple-400',
        bg: 'bg-purple-50',
        items: [
          { name: '新生入网', current: '8.6万', target: 10, rate: 86.0 },
          { name: '宽带预约', current: '2.1万', target: 2.5, rate: 84.0 },
          { name: '迎新活动', current: '520', target: 600, rate: 86.7 },
        ],
      },
      {
        name: '低占攻坚院校',
        count: 328,
        color: 'border-orange-400',
        bg: 'bg-orange-50',
        items: [
          { name: '新生入网', current: '4.2万', target: 6, rate: 70.0 },
          { name: '宽带预约', current: '0.8万', target: 1.2, rate: 66.7 },
          { name: '迎新活动', current: '168', target: 220, rate: 76.4 },
        ],
      },
    ],
  };

  // 秋开区域进度
  const autumnRegionData = cities.slice(0, 10).map(city => ({
    city,
    progress: Math.floor(Math.random() * 30 + 60),
    target: 100,
  }));

  // ========== 渲染辅助 ==========
  const renderTrendBadge = (label: string, value: number) => (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {value >= 0 ? '+' : ''}{value}%
      </span>
      {value >= 0 ? <TrendingUp className="w-2.5 h-2.5 text-green-600" /> : <TrendingDown className="w-2.5 h-2.5 text-red-600" />}
    </div>
  );

  const renderProgressRing = (rate: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const r = size === 'sm' ? 16 : size === 'md' ? 22 : 32;
    const stroke = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (rate / 100) * circumference;
    const w = (r + stroke) * 2;

    return (
      <div className="relative inline-flex items-center justify-center" style={{ width: w, height: w }}>
        <svg width={w} height={w} className="-rotate-90">
          <circle cx={r + stroke} cy={r + stroke} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
          <circle
            cx={r + stroke}
            cy={r + stroke}
            r={r}
            stroke={COLORS.blue}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute font-bold text-${size === 'sm' ? '[10px]' : size === 'md' ? 'xs' : 'sm'}`}>
          {rate}%
        </span>
      </div>
    );
  };


  if (!mounted) return null;
  return (
    <div className="space-y-4">

      {/* ================================================================== */}
      {/* 1. 学生客户                                                           */}
      {/* ================================================================== */}
      {false && <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {/* Section Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-gray-800">学生客户</h3>
            <span className="text-xs text-gray-400 ml-2">校园市场核心用户规模与价值</span>
          </div>
        </div>

        <div className="p-3">
          {/* 核心指标：4大卡片 */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {/* 校园客户总数 */}
            <div className="bg-blue-50/60 rounded-lg p-3">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1.5">校园客户总数</div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-2xl font-bold text-gray-900">{studentHeadlines.total.value}</span>
                  <span className="text-sm text-gray-400">{studentHeadlines.total.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderTrendBadge('环比', studentHeadlines.total.mom)}
                  {renderTrendBadge('同比', studentHeadlines.total.yoy)}
                </div>
              </div>
            </div>

            {/* 宽带渗透 */}
            <div className="bg-cyan-50/60 rounded-lg p-3">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1.5">校园宽带客户</div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-2xl font-bold text-gray-900">{studentHeadlines.broadband.value}</span>
                  <span className="text-sm text-gray-400">{studentHeadlines.broadband.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderTrendBadge('环比', studentHeadlines.broadband.mom)}
                  {renderTrendBadge('同比', studentHeadlines.broadband.yoy)}
                </div>
              </div>
            </div>

            {/* 秋开新生入网 */}
            <div className="bg-orange-50/60 rounded-lg p-3">
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-xs text-gray-500">秋开新生入网</div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded font-medium">秋开专项</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-2xl font-bold text-gray-900">{studentHeadlines.newSemester.value}</span>
                  <span className="text-sm text-gray-400">{studentHeadlines.newSemester.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">目标{studentHeadlines.newSemester.target}{studentHeadlines.newSemester.unit}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-2">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${studentHeadlines.newSemester.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-orange-600">{studentHeadlines.newSemester.progress}%</span>
                </div>
              </div>
            </div>

            {/* 校园ARPU */}
            <div className="bg-purple-50/60 rounded-lg p-3">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1.5">校园ARPU</div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-2xl font-bold text-gray-900">{studentHeadlines.campusArpu.value}</span>
                  <span className="text-sm text-gray-400">{studentHeadlines.campusArpu.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  {renderTrendBadge('环比', studentHeadlines.campusArpu.mom)}
                  {renderTrendBadge('同比', studentHeadlines.campusArpu.yoy)}
                </div>
              </div>
            </div>
          </div>

          {/* 趋势图 + 份额图：左右布局 */}
          <div className="grid grid-cols-3 gap-3">
            {/* 左侧：客户增长趋势（占2/3） */}
            <div className="col-span-2 bg-[#E8F4FD] rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-2 font-medium">校园客户增长趋势</div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={studentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="value" fill={COLORS.blue} radius={[2, 2, 0, 0]} barSize={16} name="客户数(万户)" />
                    <Line yAxisId="right" type="monotone" dataKey="yoy" stroke={COLORS.green} strokeWidth={2} dot={{ r: 3 }} name="同比(%)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 右侧：市场份额饼图（占1/3） */}
            <div className="bg-[#F0F0FF] rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-2 font-medium">校园市场份额</div>
              <div className="flex items-center justify-center gap-4">
                <div className="relative w-28 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={marketShareData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {marketShareData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2">
                  {marketShareData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600">{item.name}</span>
                      <span className="text-xs font-bold text-gray-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>}

      {/* ================================================================== */}
      {/* 2. 院校覆盖                                                           */}
      {/* ================================================================== */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {/* Section Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-transparent">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-gray-800">院校覆盖</h3>
            <span className="text-xs text-gray-400 ml-2">运营商在校园市场的"阵地"规模</span>
          </div>
        </div>

        <div className="p-3">
          {/* 院校核心指标：5个 */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {[
              { label: '覆盖院校总数', value: schoolMetrics.total.value, unit: schoolMetrics.total.unit, color: 'border-emerald-300', icon: Building2 },
              { label: '集团纳管院校', value: schoolMetrics.managed.value, unit: schoolMetrics.managed.unit, rate: schoolMetrics.managed.rate, color: 'border-blue-300', icon: Target },
              { label: 'AB类重点院校', value: schoolMetrics.abClass.value, unit: schoolMetrics.abClass.unit, rate: schoolMetrics.abClass.rate, color: 'border-purple-300', icon: Star },
              { label: '宽带已覆盖', value: schoolMetrics.broadbandCovered.value, unit: schoolMetrics.broadbandCovered.unit, rate: schoolMetrics.broadbandCovered.rate, color: 'border-cyan-300', icon: Wifi },
              { label: '信息化合作', value: schoolMetrics.infoCoop.value, unit: schoolMetrics.infoCoop.unit, rate: schoolMetrics.infoCoop.rate, color: 'border-orange-300', icon: BarChart3 },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className={`bg-white rounded-lg border ${item.color} p-3`}>
                  <div className="flex items-center gap-2 mb-2">
                    <IconComp className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 truncate">{item.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1.5">
                    <span className="text-xl font-bold text-gray-900">{item.value}</span>
                    <span className="text-xs text-gray-400">{item.unit}</span>
                  </div>
                  {item.rate !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.rate}%` }} />
                      </div>
                      <span className="text-xs font-medium text-emerald-600">{item.rate}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 院校渗透率趋势图 */}
          <div className="bg-emerald-50/40 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-2 font-medium">院校渗透率趋势（按院校分类）</div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={schoolPenetrationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="high" fill={COLORS.blue} name="AB类渗透率(%)" barSize={14} />
                  <Bar dataKey="mid" fill={COLORS.green} name="纳管院校(%)" barSize={14} />
                  <Bar dataKey="low" fill={COLORS.orange} name="低占院校(%)" barSize={14} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 3. 产品销量                                                           */}
      {/* ================================================================== */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {/* Section Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-violet-50/50 to-transparent">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-bold text-gray-800">产品销量</h3>
            <span className="text-xs text-gray-400 ml-2">校园市场核心产品日均/月均销量</span>
          </div>
        </div>

        <div className="p-3">
          {/* 4个产品卡片 */}
          <div className="grid grid-cols-4 gap-3">
            {productMetrics.map((p, idx) => {
              const IconComp = p.icon;
              return (
                <div key={idx} className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${p.color}15` }}>
                      <IconComp className="w-4 h-4" style={{ color: p.color }} />
                    </div>
                    <span className="text-sm font-bold text-gray-800">{p.name}</span>
                  </div>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-gray-900">{p.daily}</span>
                      <span className="text-xs text-gray-400">/日均</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-semibold text-gray-600">{p.monthly}</span>
                      <span className="text-xs text-gray-400">/月均</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderTrendBadge('环比', p.mom)}
                    {renderTrendBadge('同比', p.yoy)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 4. 渠道效率                                                           */}
      {/* ================================================================== */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {/* Section Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-transparent">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-800">渠道效率</h3>
            <span className="text-xs text-gray-400 ml-2">橙人、实体、线上三渠道运营效能</span>
          </div>
        </div>

        <div className="p-3">
          {/* 三渠道卡片 + 区域对比图：左右布局 */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Object.values(channelMetrics).map((ch) => {
              const IconComp = ch.icon;
              return (
                <div key={ch.name} className="bg-white rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <div className={`w-7 h-7 rounded-md ${ch.color} flex items-center justify-center`}>
                      <IconComp className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-800">{ch.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {/* 活跃人数 */}
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-0.5">活跃{ch.name.includes('代理') ? '人数' : ch.name.includes('实体') ? '渠道' : '入口'}</div>
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-base font-bold text-gray-900">{ch.active.value}</span>
                        <span className="text-[10px] text-gray-400">{ch.active.unit}</span>
                      </div>
                      <div className="text-[10px] text-emerald-600">{ch.active.rate}%</div>
                    </div>
                    {/* 院校覆盖 */}
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-0.5">院校覆盖</div>
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-base font-bold text-gray-900">{ch.coverage.value}</span>
                        <span className="text-[10px] text-gray-400">{ch.coverage.unit}</span>
                      </div>
                      <div className="text-[10px] text-blue-600">{ch.coverage.rate}%</div>
                    </div>
                    {/* 月销量 */}
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-0.5">月均销量</div>
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-base font-bold text-gray-900">{ch.sales.monthly}</span>
                      </div>
                      <div className="text-[10px] text-violet-600">{ch.sales.share}%</div>
                    </div>
                  </div>
                  {/* 进度条 */}
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>活跃率</span><span className="text-emerald-600">{ch.active.rate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${ch.active.rate}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>院校覆盖率</span><span className="text-blue-600">{ch.coverage.rate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${ch.coverage.rate}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 渠道销量区域对比 */}
          <div className="bg-amber-50/40 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-2 font-medium">各渠道区域销量对比</div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="city" tick={{ fontSize: 10 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="橙人" fill={COLORS.orange} name="橙人" barSize={12} />
                  <Bar dataKey="实体" fill={COLORS.blue} name="实体" barSize={12} />
                  <Bar dataKey="线上" fill={COLORS.green} name="线上" barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 5. 秋开攻坚                                                           */}
      {/* ================================================================== */}
      {false && <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {/* Section Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-red-50/50 to-transparent">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-gray-800">秋开攻坚</h3>
            <span className="text-xs text-gray-400 ml-2">秋季开学季核心目标跟踪</span>
            {/* 秋开总览小标签 */}
            <div className="ml-auto flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">新生入网</span>
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${autumnTracking.overview.newStudents.rate}%` }} />
                </div>
                <span className="font-medium text-red-600">{autumnTracking.overview.newStudents.rate}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">活跃率</span>
                <span className="font-medium text-emerald-600">{autumnTracking.overview.activity.rate}%</span>
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">宽带预约</span>
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${autumnTracking.overview.broadband.rate}%` }} />
                </div>
                <span className="font-medium text-cyan-600">{autumnTracking.overview.broadband.rate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3">
          {/* 3个院校分类攻坚卡片 */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {autumnTracking.categories.map((cat, idx) => (
              <div key={idx} className={`rounded-lg border-l-4 ${cat.color} ${cat.bg} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                  <span className="text-xs text-gray-500">{cat.count}所</span>
                </div>
                <div className="space-y-2.5">
                  {cat.items.map((item, iidx) => (
                    <div key={iidx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">{item.name}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-gray-900">{item.current}</span>
                          <span className="text-[10px] text-gray-400">/ {item.target}{item.name.includes('活动') ? '场' : '万'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${item.rate}%` }} />
                        </div>
                        <span className="text-xs font-medium text-blue-600 w-10 text-right">{item.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 秋开区域进度 */}
          {false && <div className="bg-red-50/30 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-2 font-medium">秋开区域攻坚进度</div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={autumnRegionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="city" tick={{ fontSize: 10 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="progress" fill={COLORS.red} name="完成进度(%)" barSize={20} radius={[3, 3, 0, 0]}>
                    {autumnRegionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.progress >= 80 ? COLORS.green : entry.progress >= 60 ? COLORS.orange : COLORS.red} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="target" stroke={COLORS.red} strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="目标线(100%)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>}
        </div>
      </div>}

    </div>
  );
}
