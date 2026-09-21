'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Activity as ActivityIcon, ShoppingBag, RefreshCw } from 'lucide-react';
import type { Indicator, Activity as ActivityType, ProvinceData, NationalData } from '@/lib/types/effect-tracking';
import { getRankChange, getRankChangeText } from '@/lib/types/effect-tracking';
import ProvinceView from '@/components/EffectTracking/ProvinceView';

// 模拟数据
const mockNationalData: NationalData = {
  top5: [
    {
      id: '1',
      name: '5G套餐渗透率',
      code: '5G_RATE',
      currentValue: 45.6,
      targetValue: 50.0,
      change: 3.2,
      changeType: 'up',
      rank: 1,
      previousRank: 3,
      activityCount: 12,
      totalOrders: 150000,
      activities: [
        { id: 'a1', name: '5G优惠套餐推广活动', orderCount: 50000, date: '2025-01', status: '进行中' as const },
        { id: 'a2', name: '5G终端补贴活动', orderCount: 40000, date: '2025-01', status: '进行中' },
        { id: 'a3', name: '企业5G专网推广', orderCount: 35000, date: '2024-12', status: '已完成' },
        { id: 'a4', name: '5G家庭宽带推广', orderCount: 25000, date: '2024-12', status: '已完成' },
      ],
    },
    {
      id: '2',
      name: '宽带千兆用户占比',
      code: 'GIGABIT_RATE',
      currentValue: 38.2,
      targetValue: 45.0,
      change: 2.8,
      changeType: 'up',
      rank: 2,
      previousRank: 5,
      activityCount: 8,
      totalOrders: 120000,
      activities: [
        { id: 'a5', name: '千兆宽带提速活动', orderCount: 45000, date: '2025-01', status: '进行中' },
        { id: 'a6', name: '智能家居套餐推广', orderCount: 35000, date: '2025-01', status: '进行中' },
        { id: 'a7', name: '企业专线升级', orderCount: 25000, date: '2024-12', status: '已完成' },
        { id: 'a8', name: '云宽带推广', orderCount: 15000, date: '2024-11', status: '已完成' },
      ],
    },
    {
      id: '3',
      name: '政企客户ARPU',
      code: 'GOV_ARPU',
      currentValue: 89.5,
      targetValue: 95.0,
      change: 2.1,
      changeType: 'up',
      rank: 3,
      previousRank: 2,
      activityCount: 6,
      totalOrders: 80000,
      activities: [
        { id: 'a9', name: '企业云服务推广', orderCount: 30000, date: '2025-01', status: '进行中' },
        { id: 'a10', name: '数据中心服务推广', orderCount: 25000, date: '2025-01', status: '进行中' },
        { id: 'a11', name: '企业信息化方案', orderCount: 15000, date: '2024-12', status: '已完成' },
        { id: 'a12', name: '物联网服务推广', orderCount: 10000, date: '2024-12', status: '已完成' },
      ],
    },
    {
      id: '4',
      name: '家庭宽带ARPU',
      code: 'HOME_ARPU',
      currentValue: 42.3,
      targetValue: 48.0,
      change: 1.9,
      changeType: 'up',
      rank: 4,
      previousRank: 6,
      activityCount: 10,
      totalOrders: 180000,
      activities: [
        { id: 'a13', name: 'IPTV增值服务推广', orderCount: 50000, date: '2025-01', status: '进行中' },
        { id: 'a14', name: '家庭云盘服务', orderCount: 45000, date: '2025-01', status: '进行中' },
        { id: 'a15', name: '智能家居套餐', orderCount: 40000, date: '2024-12', status: '已完成' },
        { id: 'a16', name: '视频会员捆绑', orderCount: 30000, date: '2024-12', status: '已完成' },
        { id: 'a17', name: '教育内容服务', orderCount: 15000, date: '2024-11', status: '已完成' },
      ],
    },
    {
      id: '5',
      name: '移动业务离网率',
      code: 'CHURN_RATE',
      currentValue: 1.8,
      targetValue: 1.5,
      change: 0.3,
      changeType: 'up',
      rank: 5,
      previousRank: 8,
      activityCount: 5,
      totalOrders: 60000,
      activities: [
        { id: 'a18', name: '老用户回馈活动', orderCount: 25000, date: '2025-01', status: '进行中' },
        { id: 'a19', name: '套餐升级优惠', orderCount: 20000, date: '2025-01', status: '进行中' },
        { id: 'a20', name: '家庭绑定推广', orderCount: 15000, date: '2024-12', status: '已完成' },
      ],
    },
  ],
  bottom5: [
    {
      id: '6',
      name: '5G NR驻留比',
      code: '5G_NR_RATE',
      currentValue: 75.3,
      targetValue: 85.0,
      change: -2.1,
      changeType: 'down',
      rank: 96,
      previousRank: 88,
      activityCount: 3,
      totalOrders: 30000,
      activities: [
        { id: 'a21', name: '5G基站优化', orderCount: 20000, date: '2025-01', status: '进行中' },
        { id: 'a22', name: '5G信号覆盖提升', orderCount: 10000, date: '2024-12', status: '已完成' },
      ],
    },
    {
      id: '7',
      name: '云业务收入占比',
      code: 'CLOUD_REVENUE_RATE',
      currentValue: 12.5,
      targetValue: 18.0,
      change: -1.8,
      changeType: 'down',
      rank: 97,
      previousRank: 90,
      activityCount: 4,
      totalOrders: 40000,
      activities: [
        { id: 'a23', name: '企业云服务推广', orderCount: 20000, date: '2025-01', status: '进行中' },
        { id: 'a24', name: '云存储优惠', orderCount: 15000, date: '2025-01', status: '进行中' },
        { id: 'a25', name: '云安全服务', orderCount: 5000, date: '2024-12', status: '已完成' },
      ],
    },
    {
      id: '8',
      name: '物联网连接数',
      code: 'IOT_CONNECTIONS',
      currentValue: 8900,
      targetValue: 10000,
      change: -1.5,
      changeType: 'down',
      rank: 98,
      previousRank: 92,
      activityCount: 2,
      totalOrders: 25000,
      activities: [
        { id: 'a26', name: '物联网套餐推广', orderCount: 15000, date: '2025-01', status: '进行中' },
        { id: 'a27', name: '智慧城市项目', orderCount: 10000, date: '2024-12', status: '已完成' },
      ],
    },
    {
      id: '9',
      name: '政企客户满意度',
      code: 'GOV_SATISFACTION',
      currentValue: 82.5,
      targetValue: 90.0,
      change: -1.2,
      changeType: 'down',
      rank: 99,
      previousRank: 95,
      activityCount: 3,
      totalOrders: 20000,
      activities: [
        { id: 'a28', name: '客户服务提升', orderCount: 10000, date: '2025-01', status: '进行中' },
        { id: 'a29', name: '客户关怀活动', orderCount: 8000, date: '2025-01', status: '进行中' },
        { id: 'a30', name: '政企专属服务', orderCount: 2000, date: '2024-12', status: '已完成' },
      ],
    },
    {
      id: '10',
      name: '新兴业务收入占比',
      code: 'NEW_BUSINESS_RATE',
      currentValue: 8.2,
      targetValue: 12.0,
      change: -0.9,
      changeType: 'down',
      rank: 100,
      previousRank: 96,
      activityCount: 2,
      totalOrders: 15000,
      activities: [
        { id: 'a31', name: 'AI服务推广', orderCount: 10000, date: '2025-01', status: '进行中' },
        { id: 'a32', name: '区块链应用', orderCount: 5000, date: '2024-12', status: '已完成' },
      ],
    },
  ],
  totalIndicatorCount: 100,
  improvedCount: 58,
  totalActivityCount: 55,
  totalOrders: 700000,
};

export default function EffectTrackingPage() {
  const [activeTab, setActiveTab] = useState<'national' | 'city'>('national');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [expandedIndicators, setExpandedIndicators] = useState<Set<string>>(new Set());
  const [data] = useState<NationalData>(mockNationalData);

  // 切换指标展开/收起
  const toggleIndicator = (indicatorId: string) => {
    setExpandedIndicators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(indicatorId)) {
        newSet.delete(indicatorId);
      } else {
        newSet.add(indicatorId);
      }
      return newSet;
    });
  };

  // 渲染指标卡片
  const renderIndicatorCard = (indicator: Indicator, type: 'top' | 'bottom') => {
    const isExpanded = expandedIndicators.has(indicator.id);
    const isTop = type === 'top';

    return (
      <Card key={indicator.id} className="overflow-hidden">
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleIndicator(indicator.id)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                  isTop ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {indicator.rank}
                </span>
                <span className="text-sm text-gray-500">
                  {indicator.code}
                </span>
                {indicator.previousRank && (
                  <span className="text-sm font-medium">
                    {getRankChangeText(getRankChange(indicator.rank, indicator.previousRank))}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{indicator.name}</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {indicator.currentValue}
              </div>
              <div className={`text-sm flex items-center justify-end gap-1 ${
                indicator.changeType === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {indicator.changeType === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span>{Math.abs(indicator.change)}{indicator.name.includes('占比') || indicator.name.includes('渗透率') ? 'pp' : '%'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ActivityIcon size={14} />
              <span>{indicator.activityCount} 个活动</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShoppingBag size={14} />
              <span>{(indicator.totalOrders / 10000).toFixed(1)} 万单</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={14} />
              <span>目标: {indicator.targetValue}</span>
            </div>
          </div>
        </div>

        {/* 活动详情（展开时显示） */}
        {isExpanded && (
          <div className="border-t bg-gray-50 p-4">
            <h4 className="font-semibold text-gray-900 mb-3">活动详情</h4>
            <div className="space-y-2">
              {indicator.activities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{activity.name}</span>
                      <Badge variant={
                        activity.status === '进行中' ? 'default' :
                        activity.status === '已完成' ? 'secondary' : 'outline'
                      }>
                        {activity.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">{activity.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {(activity.orderCount / 10000).toFixed(1)} 万单
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">效果跟踪</h1>
          <p className="text-gray-600 mt-1">跟踪全疆及各地市指标改善情况及活动效果</p>
        </div>

        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="national">全疆视图</TabsTrigger>
            <TabsTrigger value="province">分地市视图</TabsTrigger>
          </TabsList>

          {/* 全疆视图 */}
          <TabsContent value="national">
            <div className="grid grid-cols-2 gap-6">
              {/* Top5 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="text-green-600" size={24} />
                    Top 5 改善指标
                  </h2>
                  <Button variant="outline" size="sm">
                    <RefreshCw size={14} className="mr-2" />
                    刷新
                  </Button>
                </div>
                <div className="space-y-3">
                  {data.top5.map(indicator => renderIndicatorCard(indicator, 'top'))}
                </div>
              </div>

              {/* Bottom5 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingDown className="text-red-600" size={24} />
                    Bottom 5 改善指标
                  </h2>
                  <Button variant="outline" size="sm">
                    <RefreshCw size={14} className="mr-2" />
                    刷新
                  </Button>
                </div>
                <div className="space-y-3">
                  {data.bottom5.map(indicator => renderIndicatorCard(indicator, 'bottom'))}
                </div>
              </div>
            </div>

            {/* 全疆概况 */}
            <Card className="mt-6 p-6">
              <h3 className="font-bold text-gray-900 mb-4">全疆概况</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{data.totalIndicatorCount}</div>
                  <div className="text-sm text-gray-600">总指标数</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{data.improvedCount}</div>
                  <div className="text-sm text-gray-600">改善指标数</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{data.totalActivityCount}</div>
                  <div className="text-sm text-gray-600">总活动数</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {(data.totalOrders / 10000).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">总订购量（万单）</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* 分地市视图 */}
          <TabsContent value="province">
            <div className="mb-4">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="选择地市" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="650100">乌鲁木齐</SelectItem>
                  <SelectItem value="650200">克拉玛依</SelectItem>
                  <SelectItem value="650100">乌鲁木齐</SelectItem>
                  <SelectItem value="650200">克拉玛依</SelectItem>
                  <SelectItem value="650400">吐鲁番</SelectItem>
                  <SelectItem value="650500">哈密</SelectItem>
                  <SelectItem value="652300">昌吉</SelectItem>
                  <SelectItem value="652700">博州</SelectItem>
                  <SelectItem value="652800">巴州</SelectItem>
                  <SelectItem value="652900">阿克苏</SelectItem>
                  <SelectItem value="653000">克州</SelectItem>
                  <SelectItem value="653100">喀什</SelectItem>
                  <SelectItem value="653200">和田</SelectItem>
                  <SelectItem value="654000">伊犁</SelectItem>
                  <SelectItem value="654200">塔城</SelectItem>
                  <SelectItem value="654300">阿勒泰</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCity ? (
              <ProvinceView
                provinceCode={selectedCity}
                provinceName={
                  selectedCity === '650100' ? '乌鲁木齐' :
                  selectedCity === '650200' ? '克拉玛依' :
                  selectedCity === '650400' ? '吐鲁番' :
                  selectedCity === '650500' ? '哈密' :
                  selectedCity === '652300' ? '昌吉' :
                  selectedCity === '652700' ? '博州' :
                  selectedCity === '652800' ? '巴州' :
                  selectedCity === '652900' ? '阿克苏' :
                  selectedCity === '653000' ? '克州' :
                  selectedCity === '653100' ? '喀什' :
                  selectedCity === '653200' ? '和田' :
                  selectedCity === '654000' ? '伊犁' :
                  selectedCity === '654200' ? '塔城' :
                  selectedCity === '654300' ? '阿勒泰' :
                  '未知地市'
                }
                data={{
                  provinceCode: selectedCity,
                  provinceName: selectedCity === '110000' ? '乌鲁木齐' : '未知地州',
                  improvedCount: Math.floor(Math.random() * 20) + 40,
                  totalIndicatorCount: 100,
                  activityCount: Math.floor(Math.random() * 20) + 10,
                  totalOrders: Math.floor(Math.random() * 100000) + 50000,
                  averageImprovementRate: parseFloat((Math.random() * 5 + 2).toFixed(1)),
                  indicators: [], // 模拟数据
                }}
              />
            ) : (
              <Card className="p-12 text-center">
                <p className="text-gray-500">请从上方下拉列表中选择地市</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
