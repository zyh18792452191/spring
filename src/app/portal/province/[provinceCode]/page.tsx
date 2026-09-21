'use client';

import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Users, BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';

// 地市代码到名称的映射
const provinceMap: Record<string, { name: string; fullName: string }> = {
  wulumuqi: { name: '乌鲁木齐', fullName: '乌鲁木齐' },
  kelamayi: { name: '克拉玛依', fullName: '克拉玛依' },
  tulufan: { name: '吐鲁番', fullName: '吐鲁番' },
  hami: { name: '哈密', fullName: '哈密' },
  changji: { name: '昌吉', fullName: '昌吉回族自治州' },
  boertala: { name: '博州', fullName: '博州蒙古自治州' },
  bayinguoleng: { name: '巴州', fullName: '巴州蒙古自治州' },
  akesu: { name: '阿克苏', fullName: '阿克苏' },
  kezhou: { name: '克州', fullName: '克孜勒苏柯尔克孜自治州' },
  kashi: { name: '喀什', fullName: '喀什' },
  hetian: { name: '和田', fullName: '和田' },
  yili: { name: '伊犁', fullName: '伊犁哈萨克自治州' },
  tacheng: { name: '塔城', fullName: '塔城' },
  aletai: { name: '阿勒泰', fullName: '阿勒泰' },
  shihezi: { name: '石河子', fullName: '石河子' },

};

// 示意指标卡片数据
const indicatorCards = [
  { title: '市场份额', value: '58.3%', change: '+1.2%', trend: 'up' },
  { title: '客户保有率', value: '92.5%', change: '+0.8%', trend: 'up' },
  { title: '流量使用率', value: '78.6%', change: '-1.5%', trend: 'down' },
  { title: '待处理工单', value: '23', change: '-5', trend: 'up' },
];

// 示意功能模块
const featureModules = [
  {
    title: '指标监控',
    description: '实时监控区内关键运营指标',
    icon: BarChart3,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: '策略执行',
    description: '查看区内策略执行情况',
    icon: TrendingUp,
    color: 'bg-green-50 text-green-600',
  },
  {
    title: '工单管理',
    description: '处理区内运营工单',
    icon: Clock,
    color: 'bg-orange-50 text-orange-600',
  },
  {
    title: '客户维系',
    description: '区内客户维系分析',
    icon: Users,
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function ProvincePage() {
  const params = useParams();
  const provinceCode = params.provinceCode as string;
  const provinceInfo = provinceMap[provinceCode];

  // 如果地市代码无效，显示错误页面
  if (!provinceInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <MapPin className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">地市不存在</h1>
          <p className="text-gray-600 mb-6">
            未找到对应的地市信息，请检查访问路径是否正确
          </p>
          <Button onClick={() => window.location.href = '/'}>
            返回首页
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑 */}
      <div className="mb-2 px-6 pt-4 text-sm text-gray-600">
        <nav className="flex items-center gap-2">
          <a href="/" className="hover:text-[#0085D0]">首页</a>
          <span>/</span>
          <a href="/portal/province" className="hover:text-[#0085D0]">省公司专区</a>
          <span>/</span>
          <span className="font-medium text-gray-900">{provinceInfo.name}运营专区</span>
        </nav>
      </div>

      {/* 页面头部 */}
      <div className="px-6 py-4">
        <Card className="p-6 bg-gradient-to-r from-[#0085D0] to-[#60B3E2] text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{provinceInfo.name}运营专区</h1>
              <p className="text-white/80 mt-1">{provinceInfo.fullName}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 示意内容区域 */}
      <div className="px-6 pb-6">
        {/* 示意提示 */}
        <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              此页面为示意页面，实际页面内容由各省公司自行开发和维护。
            </p>
          </div>
        </Card>

        {/* 示意指标卡片 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">关键指标</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {indicatorCards.map((indicator, index) => (
            <Card key={index} className="p-5">
              <p className="text-sm text-gray-500 mb-1">{indicator.title}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-900">{indicator.value}</span>
                <span className={`text-sm ${indicator.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {indicator.change}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* 示意功能模块 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">功能模块</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureModules.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
