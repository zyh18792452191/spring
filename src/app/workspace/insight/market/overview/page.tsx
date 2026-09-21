'use client';

import { useState } from 'react';
import { ArrowLeft, Settings, Search, TrendingUp, TrendingDown, AlertTriangle, LayoutDashboard, BarChart3, Users, Target } from 'lucide-react';
import DataInsightReports from '@/components/DataInsightReports';

export default function MarketOverviewPage() {
  // 指标卡数据
  const [metricCards] = useState([
    {
      id: 'churn_rate',
      name: '离网客户率',
      value: '5.2%',
      yoy: -0.3,
      hasTree: true,
      isAlert: false
    },
    {
      id: 'churn_value',
      name: '离网客户价值保有率',
      value: '78.5%',
      yoy: 2.1,
      hasTree: true,
      isAlert: true
    },
    {
      id: 'churn_volume',
      name: '离网客户规模',
      value: '125.6万',
      yoy: -8.2,
      hasTree: false,
      isAlert: false
    },
    {
      id: 'retention_rate',
      name: '客户保有率',
      value: '94.8%',
      yoy: 0.5,
      hasTree: true,
      isAlert: false
    }
  ]);

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // 去分析 - 跳转到指标树页面
  const handleGoAnalysis = (metricId: string) => {
    console.log('跳转到指标树页面，选中指标:', metricId);
    // 跳转到离网维系指标树页面
    window.location.href = '/workspace/insight/churn/tree';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">市场运营总览</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <LayoutDashboard className="w-4 h-4" />
              <span>市场数智运营</span>
              <span>/</span>
              <span>运营总览</span>
              <span>/</span>
              <span className="text-gray-900">市场运营总览</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索指标..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="p-6">
        {/* 页面标题和说明 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">市场运营总览</h2>
          <p className="text-gray-600">
            展示离网客户相关核心指标，支持通过指标树进行深度分析和根因定位
          </p>
        </div>

        {/* 指标卡区域 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">客户 - 细分客户 - 离网</h3>
            <span className="text-sm text-gray-500">共 {metricCards.length} 个指标</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map((card) => (
              <div
                key={card.id}
                className="relative bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* 指标名称 */}
                <div className="text-sm text-gray-500 mb-2">{card.name}</div>

                {/* 指标值 */}
                <div className="text-3xl font-bold text-gray-900 mb-3">{card.value}</div>

                {/* 环比 */}
                <div className="flex items-center gap-1">
                  {card.yoy >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ${card.yoy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {card.yoy > 0 ? '+' : ''}{card.yoy}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">环比</span>
                </div>

                {/* 预警图标 */}
                {card.isAlert && (
                  <div className="absolute top-4 right-4">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  </div>
                )}

                {/* 去分析按钮 - 仅配置了指标树的指标才显示 */}
                {card.hasTree && hoveredCard === card.id && (
                  <button
                    onClick={() => handleGoAnalysis(card.id)}
                    className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-md"
                  >
                    <BarChart3 className="w-4 h-4" />
                    去分析
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 功能说明卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">指标树分析</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              配置了指标树的指标，鼠标悬浮后会显示"去分析"按钮。点击后跳转至指标树页面，支持深度分析和根因定位。
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">已配置指标树</span>
              <span className="text-gray-500">的指标支持此功能</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">预警指标</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              触发预警规则的指标会显示预警图标，支持在概览、指标树、工作台等页面查看预警信息并快速响应。
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">预警中</span>
              <span className="text-gray-500">的指标需要重点关注</span>
            </div>
          </div>
        </div>

        {/* 数据洞察报告 */}
        <div className="mb-6">
          <DataInsightReports 
            pageId="insight.market.overview" 
            maxDisplay={3} 
            showViewAll={true} 
          />
        </div>
      </div>
    </div>
  );
}
