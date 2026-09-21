'use client';

import { BarChart3, TrendingUp, PieChart, Calendar, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">数据统计</h2>
          <p className="text-sm text-gray-500">
            查看和分析运营数据
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            筛选
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            导出
          </Button>
        </div>
      </div>

      {/* 时间选择器 */}
      <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>统计周期：</span>
        </div>
        <div className="flex gap-2">
          {['本周', '本月', '本季度', '本年'].map((period) => (
            <button
              key={period}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === '本月'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="营地总收入"
          value="¥128,500"
          change="+15.3%"
          icon={BarChart3}
          trend="up"
          color="blue"
        />
        <StatCard
          title="总客流量"
          value="2,456"
          change="+8.7%"
          icon={TrendingUp}
          trend="up"
          color="green"
        />
        <StatCard
          title="装备借用率"
          value="78.5%"
          change="+2.1%"
          icon={PieChart}
          trend="up"
          color="purple"
        />
        <StatCard
          title="客户满意度"
          value="4.8"
          change="+0.2"
          icon={TrendingUp}
          trend="up"
          color="orange"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 营地收入趋势 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">营地收入趋势</h3>
            <span className="text-xs text-gray-500">单位：万元</span>
          </div>
          <div className="h-64 rounded-lg bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-400">图表组件开发中...</p>
            </div>
          </div>
        </div>

        {/* 装备使用统计 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">装备使用统计</h3>
          </div>
          <div className="h-64 rounded-lg bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-400">图表组件开发中...</p>
            </div>
          </div>
        </div>

        {/* 客流量分布 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">各营地客流量对比</h3>
          </div>
          <div className="h-64 rounded-lg bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-400">图表组件开发中...</p>
            </div>
          </div>
        </div>

        {/* 装备借用排行 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">装备借用排行榜</h3>
          </div>
          <div className="space-y-3">
            {topEquipment.map((item, index) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  index < 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.count}次</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 详细数据表格 */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">详细数据报表</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-600">
                <th className="px-6 py-3 text-left">营地名称</th>
                <th className="px-6 py-3 text-left">客流量</th>
                <th className="px-6 py-3 text-left">收入</th>
                <th className="px-6 py-3 text-left">装备使用率</th>
                <th className="px-6 py-3 text-left">满意度</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campData.map((camp, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{camp.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{camp.visitors}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{camp.revenue}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{camp.usageRate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{camp.satisfaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: any;
  trend: 'up' | 'down';
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, change, icon: Icon, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg">
          <Icon className={`h-6 w-6 ${colorClasses[color]}`} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
          {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingUp className="h-4 w-4 rotate-180" />}
          {change}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="mt-1 text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}

const topEquipment = [
  { name: '高山帐篷', count: 128, percentage: 100 },
  { name: '防潮睡袋', count: 95, percentage: 74 },
  { name: '登山杖', count: 87, percentage: 68 },
  { name: '户外炊具套装', count: 72, percentage: 56 },
  { name: '防水背包', count: 65, percentage: 51 },
];

const campData = [
  {
    name: '山区训练营地',
    visitors: 680,
    revenue: '¥45,600',
    usageRate: '82%',
    satisfaction: '4.9',
  },
  {
    name: '森林探险营地',
    visitors: 520,
    revenue: '¥38,200',
    usageRate: '78%',
    satisfaction: '4.8',
  },
  {
    name: '高原适应营地',
    visitors: 480,
    revenue: '¥32,800',
    usageRate: '75%',
    satisfaction: '4.7',
  },
  {
    name: '荒野生存训练营地',
    visitors: 420,
    revenue: '¥28,500',
    usageRate: '71%',
    satisfaction: '4.6',
  },
  {
    name: '湖泊休闲营地',
    visitors: 356,
    revenue: '¥25,400',
    usageRate: '68%',
    satisfaction: '4.5',
  },
];
