'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, LineChart, Users, TrendingDown, Activity, Target } from 'lucide-react';

// 概览Tab内容组件
function OverviewTab() {
  const [selectedPeriod, setSelectedPeriod] = useState('本月');
  
  const metrics = [
    {
      title: '预警客户数',
      value: '12,458',
      change: '+2.3%',
      trend: 'up',
      icon: AlertTriangle,
      color: '#FF6B6B'
    },
    {
      title: '维系成功数',
      value: '8,326',
      change: '+5.8%',
      trend: 'up',
      icon: Target,
      color: '#51CF66'
    },
    {
      title: '维系成功率',
      value: '66.9%',
      change: '+3.5%',
      trend: 'up',
      icon: Activity,
      color: '#0085D0'
    },
    {
      title: '高价值客户预警',
      value: '2,156',
      change: '-1.2%',
      trend: 'down',
      icon: Users,
      color: '#F59E0B'
    }
  ];

  const alerts = [
    {
      level: '高危',
      count: 245,
      color: '#FF6B6B'
    },
    {
      level: '中危',
      count: 1892,
      color: '#F59E0B'
    },
    {
      level: '低危',
      count: 10321,
      color: '#0085D0'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 时间选择器 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setSelectedPeriod('本月')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPeriod === '本月'
              ? 'bg-[#0085D0] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          本月
        </button>
        <button
          onClick={() => setSelectedPeriod('上月')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPeriod === '上月'
              ? 'bg-[#0085D0] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          上月
        </button>
        <button
          onClick={() => setSelectedPeriod('本季度')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPeriod === '本季度'
              ? 'bg-[#0085D0] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          本季度
        </button>
      </div>

      {/* 整体指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${metric.color}15` }}
              >
                <metric.icon className="h-6 w-6" style={{ color: metric.color }} />
              </div>
              <span className="text-sm">
                <span className={`font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</h3>
            <p className="text-sm text-gray-500">{metric.title}</p>
          </div>
        ))}
      </div>

      {/* 预警分布 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">预警客户分布</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alerts.map((alert) => (
            <div key={alert.level} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{alert.level}</span>
                <span className="text-2xl font-bold" style={{ color: alert.color }}>
                  {alert.count.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(alert.count / 12458) * 100}%`,
                    backgroundColor: alert.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 去调度区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">去调度</h2>
          <button className="px-4 py-2 bg-[#0085D0] text-white text-sm font-medium rounded-lg hover:bg-[#006BB5] transition-colors">
            创建维系任务
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0085D0] transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">高危预警客户</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">245</p>
            <p className="text-sm text-gray-500">需立即处理</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0085D0] transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <LineChart className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">预警趋势异常</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">89</p>
            <p className="text-sm text-gray-500">重点关注</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:border-[#0085D0] transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">高价值客户预警</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">156</p>
            <p className="text-sm text-gray-500">优先处理</p>
          </div>
        </div>
      </div>

      {/* 预警指标 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">预警指标配置</h2>
          <button className="text-[#0085D0] text-sm font-medium hover:underline">
            配置预警阈值
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">指标名称</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">预警阈值</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">当前值</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">预警状态</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">操作</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: '离网预警客户数', threshold: '≥ 5000', current: '12,458', status: 'danger' },
                { name: '维系成功率', threshold: '≥ 60%', current: '66.9%', status: 'normal' },
                { name: '高价值客户预警率', threshold: '≤ 10%', current: '17.3%', status: 'warning' },
                { name: '高危客户数', threshold: '≤ 200', current: '245', status: 'danger' },
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-700">{item.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.threshold}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{item.current}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'danger'
                          ? 'bg-red-100 text-red-700'
                          : item.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.status === 'danger' ? '高危' : item.status === 'warning' ? '预警' : '正常'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-[#0085D0] text-sm hover:underline">查看详情</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 指标树Tab内容组件
function IndicatorTreeTab({ treeName }: { treeName: string }) {
  const [zoom, setZoom] = useState(100);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">{treeName}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100"
            title="缩小"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100"
            title="放大"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => setZoom(100)}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            重置
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 指标树展示区域 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div
            className="relative overflow-auto border border-gray-200 rounded-lg p-4"
            style={{ height: '600px' }}
          >
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                minWidth: '800px'
              }}
            >
              {/* 指标树示例结构 */}
              <div className="space-y-2">
                {/* 一级指标 */}
                <div className="flex items-center gap-2">
                  <button
                    className="w-6 h-6 rounded-full bg-[#0085D0] text-white text-sm font-bold hover:bg-[#006BB5]"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-gray-50 border-2 border-[#0085D0] rounded-lg p-3">
                    <div className="font-semibold text-gray-900">{treeName}</div>
                    <div className="text-sm text-gray-600 mt-1">数值: 12,458 | 环比: +2.3%</div>
                  </div>
                </div>

                {/* 二级指标 */}
                <div className="ml-8 space-y-2">
                  {[
                    { name: '潜在离网客户', value: '8,326', change: '+5.8%' },
                    { name: '高风险离网客户', value: '2,156', change: '-1.2%' },
                    { name: '一般风险离网客户', value: '1,976', change: '+3.1%' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        className="w-6 h-6 rounded-full bg-[#0085D0] text-white text-sm font-bold hover:bg-[#006BB5]"
                      >
                        -
                      </button>
                      <div
                        className={`flex-1 border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedNode === item.name
                            ? 'bg-blue-50 border-[#0085D0]'
                            : 'bg-white border-gray-200 hover:border-[#0085D0]'
                        }`}
                        onClick={() => setSelectedNode(item.name)}
                      >
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600 mt-1">数值: {item.value} | 环比: {item.change}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧面板 */}
        <div className="space-y-4">
          {/* 预警列表 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">预警指标</h3>
            <div className="space-y-2">
              {[
                { name: '离网预警率', value: '17.3%', level: 'warning' },
                { name: '高危客户占比', value: '1.97%', level: 'danger' },
                { name: '维系成功率', value: '66.9%', level: 'normal' },
              ].map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-sm text-gray-700">{alert.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{alert.value}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        alert.level === 'danger'
                          ? 'bg-red-500'
                          : alert.level === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 指标分析 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">指标分析</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                趋势分析
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                同比分析
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                环比分析
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                异常分析
              </button>
            </div>
          </div>

          {/* 客群分析 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">客群分析</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                客户画像
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                行为特征
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                消费特征
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChurnPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const indicatorTrees = [
    '当月全量离网客户',
    '当月拍照中高端离网客户',
    '当月携出离网客户',
    '当月价值下降离网客户',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">离网维系</h1>
        <p className="text-sm text-gray-500 mt-1">离网客户维系与管理</p>
      </div>

      {/* Tab切换 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white"
          >
            概览
          </TabsTrigger>
          {indicatorTrees.map((tree) => (
            <TabsTrigger
              key={tree}
              value={tree}
              className="data-[state=active]:bg-[#0085D0] data-[state=active]:text-white"
            >
              {tree}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>

        {indicatorTrees.map((tree) => (
          <TabsContent key={tree} value={tree} className="mt-6">
            <IndicatorTreeTab treeName={tree} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
