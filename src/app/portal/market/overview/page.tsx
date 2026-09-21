'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import Image from 'next/image';
import ChinaMap from '@/components/ChinaMap';
import { useMounted } from '@/hooks/useMounted';

// 类型定义
interface MetricCard {
  title: string;
  value: string;
  unit?: string;
  trend: string;
  trendValue: string;
  isPositive: boolean;
  icon: string;
}

interface ProvinceData {
  province: string;
  [key: string]: string | number;
}

interface ProductRank {
  rank: number;
  name: string;
  value: string;
  unit: string;
  trend: string;
  trendType: 'positive' | 'negative';
}

interface CustomerMetric {
  title: string;
  value: string;
  unit: string;
  trend: string;
  trendValue: string;
  isPositive: boolean;
  icon: string;
}

// 模拟数据 - 顶部4个指标卡片
const topMetrics: MetricCard[] = [
  {
    title: '整体收入规模',
    value: '22.89',
    unit: '亿元',
    trend: '环比',
    trendValue: '0.05%',
    isPositive: true,
    icon: '/market-overview/card-icon1.png'
  },
  {
    title: '通信服务收入年累计',
    value: '196.12',
    unit: '亿元',
    trend: '环比',
    trendValue: '0.03%',
    isPositive: true,
    icon: '/market-overview/card-icon2.png'
  },
  {
    title: '在网客户规模',
    value: '9.85',
    unit: '亿户',
    trend: '环比',
    trendValue: '-0.01%',
    isPositive: false,
    icon: '/market-overview/card-icon3.png'
  },
  {
    title: '5G套餐渗透率',
    value: '55.23',
    unit: '%',
    trend: '环比',
    trendValue: '+0.52pp',
    isPositive: true,
    icon: '/market-overview/card-icon4.png'
  }
];

// 模拟数据 - 价值保有（多条折线）
const valueRetentionData: ProvinceData[] = [
  { province: '吐鲁番', 中高端客户: '96.17', 高价值客户: '98.23', 全球通: '95.45' },
  { province: '哈密', 中高端客户: '95.89', 高价值客户: '97.89', 全球通: '95.12' },
  { province: '昌吉', 中高端客户: '96.45', 高价值客户: '98.45', 全球通: '95.89' },
  { province: '博州', 中高端客户: '95.23', 高价值客户: '97.23', 全球通: '94.67' },
  { province: '巴州', 中高端客户: '94.89', 高价值客户: '96.89', 全球通: '94.23' },
  { province: '克州', 中高端客户: '95.67', 高价值客户: '97.67', 全球通: '95.01' },
  { province: '喀什', 中高端客户: '95.34', 高价值客户: '97.34', 全球通: '94.78' },
  { province: '伊犁', 中高端客户: '95.12', 高价值客户: '97.12', 全球通: '94.56' },
  { province: '阿克苏', 中高端客户: '94.67', 高价值客户: '96.67', 全球通: '94.12' },
  { province: '和田', 中高端客户: '95.89', 高价值客户: '97.89', 全球通: '95.34' },
];

// 模拟数据 - 规模保有（多条折线）
const scaleRetentionData: ProvinceData[] = [
  { province: '吐鲁番', 'ARPU>100': '85.23', 'ARPU50-100': '78.45', 'ARPU<50': '65.12' },
  { province: '哈密', 'ARPU>100': '84.89', 'ARPU50-100': '77.89', 'ARPU<50': '64.56' },
  { province: '昌吉', 'ARPU>100': '85.67', 'ARPU50-100': '78.89', 'ARPU<50': '65.78' },
  { province: '博州', 'ARPU>100': '83.45', 'ARPU50-100': '76.67', 'ARPU<50': '63.23' },
  { province: '巴州', 'ARPU>100': '82.78', 'ARPU50-100': '75.89', 'ARPU<50': '62.67' },
  { province: '克州', 'ARPU>100': '84.12', 'ARPU50-100': '77.23', 'ARPU<50': '64.12' },
  { province: '喀什', 'ARPU>100': '83.89', 'ARPU50-100': '76.89', 'ARPU<50': '63.78' },
  { province: '伊犁', 'ARPU>100': '83.56', 'ARPU50-100': '76.45', 'ARPU<50': '63.45' },
  { province: '阿克苏', 'ARPU>100': '82.67', 'ARPU50-100': '75.67', 'ARPU<50': '62.89' },
  { province: '和田', 'ARPU>100': '84.45', 'ARPU50-100': '77.67', 'ARPU<50': '64.45' },
];

// 模拟数据 - 产品TOP3
const productRanks: Record<string, ProductRank[]> = {
  high: [
    { rank: 1, name: '云电脑', value: '109156.74', unit: '万元', trend: '+15.67%', trendType: 'positive' },
    { rank: 2, name: '云手机', value: '75516.94', unit: '万元', trend: '+12.34%', trendType: 'positive' },
    { rank: 3, name: '云VR', value: '52345.12', unit: '万元', trend: '+8.89%', trendType: 'positive' },
  ],
  low: [
    { rank: 1, name: '咪咕阅读', value: '8993.17', unit: '万元', trend: '-5.4%', trendType: 'negative' },
    { rank: 2, name: '视频彩铃', value: '79721.39', unit: '万元', trend: '+0.99%', trendType: 'positive' },
    { rank: 3, name: '云手机', value: '75516.94', unit: '万元', trend: '+5.36%', trendType: 'positive' },
  ],
  negative: [
    { rank: 1, name: '咪咕音乐', value: '1.77', unit: '万元', trend: '-4.84%', trendType: 'negative' },
    { rank: 2, name: '5G新通话', value: '6747.24', unit: '万元', trend: '+11.55%', trendType: 'positive' },
    { rank: 3, name: '云VR', value: '1.86', unit: '万元', trend: '-6.94%', trendType: 'negative' },
  ]
};

// 模拟数据 - 客户指标
const customerMetrics: CustomerMetric[] = [
  {
    title: '拍照中高端客户规模保有率',
    value: '96.17',
    unit: '%',
    trend: '环比',
    trendValue: '+0.12pp',
    isPositive: true,
    icon: '/market-overview/customer-icon1.png'
  },
  {
    title: '中高端客户ARPU',
    value: '85.23',
    unit: '元',
    trend: '环比',
    trendValue: '+0.45%',
    isPositive: true,
    icon: '/market-overview/customer-icon2.png'
  },
  {
    title: '中高端客户DOU',
    value: '12.56',
    unit: 'GB',
    trend: '环比',
    trendValue: '+2.34%',
    isPositive: true,
    icon: '/market-overview/customer-icon3.png'
  },
  {
    title: '中高端客户MOU',
    value: '345.67',
    unit: '分钟',
    trend: '环比',
    trendValue: '-0.89%',
    isPositive: false,
    icon: '/market-overview/customer-icon4.png'
  },
  {
    title: '全球通客户保有率',
    value: '95.45',
    unit: '%',
    trend: '环比',
    trendValue: '+0.08pp',
    isPositive: true,
    icon: '/market-overview/customer-icon5.png'
  },
  {
    title: '神州行客户保有率',
    value: '92.34',
    unit: '%',
    trend: '环比',
    trendValue: '-0.23pp',
    isPositive: false,
    icon: '/market-overview/customer-icon6.png'
  }
];

// 模拟数据 - 渠道指标
const channelMetrics = [
  {
    title: '线上渠道整体销售占比',
    value: '71.3',
    unit: '%',
    trend: '环比',
    trendValue: '+1.26pp',
    isPositive: true,
    icon: '/market-overview/channel-icon1.png'
  },
  {
    title: '线上号卡销量',
    value: '12345',
    unit: '万',
    trend: '环比',
    trendValue: '+5.67%',
    isPositive: true,
    icon: '/market-overview/channel-icon2.png'
  },
  {
    title: '线上流量包销量',
    value: '67890',
    unit: '万',
    trend: '环比',
    trendValue: '+8.23%',
    isPositive: true,
    icon: '/market-overview/channel-icon3.png'
  },
  {
    title: '线上宽带销量',
    value: '2345',
    unit: '万',
    trend: '环比',
    trendValue: '+3.45%',
    isPositive: true,
    icon: '/market-overview/channel-icon4.png'
  }
];

// 模拟数据 - 中国地图31省份数据
const chinaMapData = [
  { name: '乌鲁木齐', value: 2.3, growthRate: 3.5, revenue: '1256.7亿元', customers: '2856万户' },

  { name: '阿克苏', value: 0.8, growthRate: 1.5, revenue: '890.2亿元', customers: '3456万户' },

  { name: '昌吉', value: 0.6, growthRate: 1.2, revenue: '678.9亿元', customers: '2567万户' },

  { name: '克拉玛依', value: 2.5, growthRate: 4.2, revenue: '1456.8亿元', customers: '3124万户' },
  { name: '哈密', value: 2.8, growthRate: 3.8, revenue: '2345.6亿元', customers: '5678万户' },
  { name: '昌吉', value: 2.6, growthRate: 4.1, revenue: '2123.4亿元', customers: '5123万户' },
  { name: '塔城', value: 1.1, growthRate: 1.8, revenue: '789.5亿元', customers: '3124万户' },
  { name: '和田', value: 1.4, growthRate: 2.3, revenue: '956.7亿元', customers: '2890万户' },
  { name: '阿勒泰', value: 0.7, growthRate: 1.1, revenue: '523.4亿元', customers: '2234万户' },
  { name: '博州', value: 2.1, growthRate: 2.9, revenue: '1890.2亿元', customers: '4890万户' },
  { name: '巴州', value: 1.5, growthRate: 2.1, revenue: '1123.5亿元', customers: '4567万户' },
  { name: '喀什', value: 1.3, growthRate: 1.9, revenue: '987.6亿元', customers: '3456万户' },
  { name: '伊犁', value: 1.2, growthRate: 1.7, revenue: '876.5亿元', customers: '3321万户' },
  { name: '吐鲁番', value: 3.2, growthRate: 4.5, revenue: '3456.7亿元', customers: '7890万户' },

  { name: '石河子', value: 1.0, growthRate: 1.5, revenue: '678.9亿元', customers: '2345万户' },
  { name: '克州', value: 1.8, growthRate: 2.4, revenue: '1345.6亿元', customers: '4567万户' },
  { name: '乌鲁木齐', value: 0.5, growthRate: 0.9, revenue: '345.7亿元', customers: '1876万户' },

  { name: '博州', value: 0.1, growthRate: 0.3, revenue: '56.7亿元', customers: '234万户' },

  { name: '克拉玛依', value: 0.3, growthRate: 0.5, revenue: '234.5亿元', customers: '1456万户' },
  { name: '吐鲁番', value: 0.1, growthRate: 0.4, revenue: '89.6亿元', customers: '534万户' },
  { name: '哈密', value: 0.1, growthRate: 0.3, revenue: '78.9亿元', customers: '432万户' },
  { name: '昌吉', value: 0.4, growthRate: 0.7, revenue: '312.4亿元', customers: '1567万户' },
];

export default function MarketOverviewPage() {
  const [activeMarketTab, setActiveMarketTab] = useState<'value' | 'scale'>('value');
  const [activeCustomerTab, setActiveCustomerTab] = useState<'segment' | 'market'>('segment');
  const [activeCustomerSubTab, setActiveCustomerSubTab] = useState<'中高端客户' | '全球通'>('中高端客户');
  const [activeChannelTab, setActiveChannelTab] = useState<'online' | 'offline'>('online');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const mounted = useMounted();

  // 处理省份点击
  const handleProvinceClick = (province: string) => {
    setSelectedProvince(province);
    console.log('选中省份:', province);
    // 这里可以添加更多逻辑，比如更新右侧数据等
  };

  // 获取折线配置
  const getLineConfigs = (dataKey: string, color: string) => ({
    type: 'monotone' as const,
    dataKey,
    stroke: color,
    strokeWidth: 2,
    dot: { r: 4 },
    activeDot: { r: 6 }
  });

  if (!mounted) return null;
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 面包屑 */}
      <div className="mb-4 text-sm text-gray-600">
        市场数智运营 / 市场运营总览
      </div>

      {/* 顶部4个大卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {topMetrics.map((metric, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base text-gray-700 mb-3">{metric.title}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                  {metric.unit && <span className="text-sm text-gray-600">{metric.unit}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{metric.trend}</span>
                  <span className={`text-sm font-semibold ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trendValue}
                  </span>
                  {metric.isPositive ? (
                    <Image src="/market-overview/icon_up.png" alt="up" width={12} height={12} />
                  ) : (
                    <Image src="/market-overview/icon_down.png" alt="down" width={12} height={12} />
                  )}
                </div>
              </div>
              <div className="ml-4">
                <Image src={metric.icon} alt={metric.title} width={60} height={60} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 中间三栏布局 */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        {/* 左侧 - 市场模块 */}
        <div className="col-span-3">
          <Card className="p-4 h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">市场</h2>
            </div>
            
            <Tabs value={activeMarketTab} onValueChange={(v) => setActiveMarketTab(v as 'value' | 'scale')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="value">价值保有</TabsTrigger>
                <TabsTrigger value="scale">规模保有</TabsTrigger>
              </TabsList>

              <TabsContent value="value">
                <ResponsiveContainer width="100%" height={480}>
                  <LineChart data={valueRetentionData}>
                    <XAxis dataKey="province" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line {...getLineConfigs('中高端客户', '#0085D0')} />
                    <Line {...getLineConfigs('高价值客户', '#60B3E2')} />
                    <Line {...getLineConfigs('全球通', '#C0E1F3')} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="scale">
                <ResponsiveContainer width="100%" height={480}>
                  <LineChart data={scaleRetentionData}>
                    <XAxis dataKey="province" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line {...getLineConfigs('ARPU>100', '#0085D0')} />
                    <Line {...getLineConfigs('ARPU50-100', '#60B3E2')} />
                    <Line {...getLineConfigs('ARPU<50', '#C0E1F3')} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* 中间 - 中国地图 */}
        <div className="col-span-6">
          <Card className="p-4 h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">全国分布</h2>
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#52C41A' }}></div>
                  <span>高增长</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFF7E6' }}></div>
                  <span>中等增长</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF4D4F' }}></div>
                  <span>低增长</span>
                </div>
              </div>
            </div>

            {/* 中国地图 */}
            <ChinaMap
              data={chinaMapData}
              onProvinceClick={handleProvinceClick}
              selectedProvince={selectedProvince}
            />

            {/* 选中的省份信息展示 */}
            {selectedProvince && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      当前选中：{selectedProvince}
                    </h4>
                    {chinaMapData.find(d => d.name === selectedProvince) && (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">收入规模：</span>
                          <span className="font-semibold text-gray-900">
                            {chinaMapData.find(d => d.name === selectedProvince)?.revenue}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">客户规模：</span>
                          <span className="font-semibold text-gray-900">
                            {chinaMapData.find(d => d.name === selectedProvince)?.customers}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">增长率：</span>
                          <span className={`font-semibold ${
                            chinaMapData.find(d => d.name === selectedProvince)?.growthRate && chinaMapData.find(d => d.name === selectedProvince)!.growthRate > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {chinaMapData.find(d => d.name === selectedProvince)?.growthRate && chinaMapData.find(d => d.name === selectedProvince)!.growthRate > 0 ? '+' : ''}
                            {chinaMapData.find(d => d.name === selectedProvince)?.growthRate}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedProvince('')}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                  >
                    清除选择
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* 右侧 - 产品模块 */}
        <div className="col-span-3">
          <Card className="p-4 h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">产品</h2>
            </div>
            
            <h3 className="text-sm font-semibold text-teal-500 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded"></span>
              收入增幅高TOP3
            </h3>
            <div className="space-y-2 mb-6">
              {productRanks.high.map((item) => (
                <div key={item.rank} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      item.rank === 1 ? 'bg-orange-500' : item.rank === 2 ? 'bg-gray-400' : 'bg-amber-600'
                    }`}>
                      {item.rank}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{item.value}</div>
                    <div className="text-xs text-gray-500">{item.unit}</div>
                  </div>
                  <div className={`text-xs ${item.trendType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.trend}
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-orange-500 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded"></span>
              收入增幅低TOP3
            </h3>
            <div className="space-y-2 mb-6">
              {productRanks.low.map((item) => (
                <div key={item.rank} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      item.rank === 1 ? 'bg-orange-500' : item.rank === 2 ? 'bg-gray-400' : 'bg-amber-600'
                    }`}>
                      {item.rank}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{item.value}</div>
                    <div className="text-xs text-gray-500">{item.unit}</div>
                  </div>
                  <div className={`text-xs ${item.trendType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.trend}
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-red-500 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-red-500 rounded"></span>
              收入负增长TOP3
            </h3>
            <div className="space-y-2">
              {productRanks.negative.map((item) => (
                <div key={item.rank} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      item.rank === 1 ? 'bg-orange-500' : item.rank === 2 ? 'bg-gray-400' : 'bg-amber-600'
                    }`}>
                      {item.rank}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{item.value}</div>
                    <div className="text-xs text-gray-500">{item.unit}</div>
                  </div>
                  <div className={`text-xs ${item.trendType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.trend}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 底部两栏布局 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 左侧 - 客户模块 */}
        <div className="col-span-1">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">客户</h2>
            </div>

            <Tabs value={activeCustomerTab} onValueChange={(v) => setActiveCustomerTab(v as 'segment' | 'market')}>
              <div className="flex gap-4 mb-4">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCustomerTab === 'segment' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveCustomerTab('segment')}
                >
                  细分客户
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCustomerTab === 'market' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveCustomerTab('market')}
                >
                  细分市场
                </button>
              </div>

              <TabsContent value="segment">
                <div className="flex gap-4 mb-4 border-b">
                  {['中高端客户', '全球通'].map((tab) => (
                    <button
                      key={tab}
                      className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                        activeCustomerSubTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveCustomerSubTab(tab as '中高端客户' | '全球通')}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {customerMetrics.map((metric, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <Image src={metric.icon} alt={metric.title} width={32} height={32} />
                        <div className="flex-1">
                          <h4 className="text-xs text-gray-600 mb-2 line-clamp-2">{metric.title}</h4>
                          <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-xl font-bold text-gray-900">{metric.value}</span>
                            <span className="text-xs text-gray-500">{metric.unit}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">{metric.trend}</span>
                            <span className={`text-xs ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.trendValue}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="market">
                <div className="text-center py-8 text-gray-500">
                  <p>细分市场数据开发中...</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* 右侧 - 渠道模块 */}
        <div className="col-span-1">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">渠道</h2>
            </div>

            <Tabs value={activeChannelTab} onValueChange={(v) => setActiveChannelTab(v as 'online' | 'offline')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="online">线上渠道</TabsTrigger>
                <TabsTrigger value="offline">线下渠道</TabsTrigger>
              </TabsList>

              <TabsContent value="online">
                <div className="grid grid-cols-2 gap-4">
                  {channelMetrics.map((metric, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <Image src={metric.icon} alt={metric.title} width={32} height={32} />
                        <div className="flex-1">
                          <h4 className="text-xs text-gray-600 mb-2">{metric.title}</h4>
                          <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-xl font-bold text-gray-900">{metric.value}</span>
                            <span className="text-xs text-gray-500">{metric.unit}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">{metric.trend}</span>
                            <span className={`text-xs ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {metric.trendValue}
                            </span>
                            {metric.isPositive && (
                              <Image src="/market-overview/icon_up.png" alt="up" width={12} height={12} />
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">渠道分布</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {['APP', '小程序', '网站', '抖音'].map((channel) => (
                      <div key={channel} className="bg-gray-50 rounded p-3 text-center">
                        <div className="text-lg font-bold text-gray-900">{(Math.random() * 30 + 10).toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">{channel}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="offline">
                <div className="text-center py-8 text-gray-500">
                  <p>线下渠道数据开发中...</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
