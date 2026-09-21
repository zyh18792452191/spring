'use client';

import { Info, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, AreaChart, Area } from 'recharts';
import { Card } from '@/components/ui/card';
import { useMounted } from '@/hooks/useMounted';

// 自定义图表提示框
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isPieChart = payload.length === 1 && payload[0].payload && payload[0].payload.name;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        {label && !isPieChart && <p className="text-xs text-gray-600 mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => {
          const keyMap: Record<string, { name: string; unit: string }> = {
            'value': { name: '当月离网客户数', unit: '万' },
            'rate': { name: '离网率', unit: '%' },
            'yoy': { name: '同比变化', unit: '%' },
            'monthlyAvg': { name: '累计月均离网率', unit: '%' },
            'age': { name: '年龄', unit: '岁' },
            'arpu': { name: 'ARPU', unit: '元' },
            'scale': { name: '离网规模', unit: '万' },
            'name': { name: '名称', unit: '' }
          };
          
          const keyInfo = keyMap[entry.dataKey] || { name: entry.dataKey, unit: '' };
          const displayName = keyInfo.name;
          let unit = keyInfo.unit;
          
          if (entry.payload && entry.payload.unit) {
            unit = entry.payload.unit;
          }
          
          if (entry.dataKey === 'rate') {
            unit = '%';
          }
          
          if (isPieChart && entry.payload && entry.payload.name) {
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-semibold text-gray-900">
                  {entry.payload.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}{unit}
                </span>
              </div>
            );
          }
          
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700">{displayName}:</span>
              <span className="font-semibold text-gray-900">
                {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                {unit}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function OverviewTab({ isEditMode, onJumpToTree }: { isEditMode?: boolean; onJumpToTree: (indicatorName: string) => void }) {
  const mounted = useMounted();
  // 整体离网指标数据
  const overallChurnMetrics = [
    {
      id: 1,
      name: '当月全量离网客户数',
      value: '45.6万',
      yoy: '+2.1',
      yoyUnit: '',
      yoyLabel: '同比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'barline' as const,
      businessScope: '统计当月所有离网客户的数量',
      hasEntrances: true,
      indicatorName: '当月全量离网客户数',
      chartData: [
        { month: '2月', value: 42.3, yoy: 1.8 },
        { month: '3月', value: 43.1, yoy: 1.9 },
        { month: '4月', value: 44.5, yoy: 3.2 },
        { month: '5月', value: 45.2, yoy: 1.6 },
        { month: '6月', value: 44.8, yoy: -0.9 },
        { month: '7月', value: 45.6, yoy: 1.8 }
      ]
    },
    {
      id: 2,
      name: '当月拍照中高端离网客户数',
      value: '12.3万',
      yoy: '+1.8',
      yoyUnit: '',
      yoyLabel: '同比',
      status: 'warning' as const,
      color: '#FF9500',
      chartType: 'barline' as const,
      businessScope: '统计当月拍照中高端客户的离网数量',
      hasEntrances: true,
      indicatorName: '当月拍照中高端离网客户数',
      chartData: [
        { month: '2月', value: 11.5, yoy: 2.6 },
        { month: '3月', value: 11.8, yoy: 2.6 },
        { month: '4月', value: 12.0, yoy: 1.7 },
        { month: '5月', value: 12.1, yoy: 0.8 },
        { month: '6月', value: 12.0, yoy: -0.8 },
        { month: '7月', value: 12.3, yoy: 2.5 }
      ]
    },
    {
      id: 3,
      name: '当月拍照全球通离网客户数',
      value: '5.8万',
      yoy: '+3.2',
      yoyUnit: '',
      yoyLabel: '同比',
      status: 'danger' as const,
      color: '#FF0000',
      chartType: 'barline' as const,
      businessScope: '统计当月拍照全球通客户的离网数量',
      hasEntrances: true,
      indicatorName: '当月拍照全球通离网客户数',
      chartData: [
        { month: '2月', value: 5.2, yoy: 3.8 },
        { month: '3月', value: 5.4, yoy: 3.8 },
        { month: '4月', value: 5.6, yoy: 3.7 },
        { month: '5月', value: 5.7, yoy: 1.8 },
        { month: '6月', value: 5.6, yoy: -1.8 },
        { month: '7月', value: 5.8, yoy: 3.6 }
      ]
    },
    {
      id: 4,
      name: '离网率',
      value: '1.2%',
      yoy: '+0.1',
      yoyUnit: 'pp',
      yoyLabel: '环比',
      status: 'normal' as const,
      color: '#0066CC',
      chartType: 'barline' as const,
      businessScope: '柱：当月离网率（离网客户数/总客户数）；线：累计月均离网率（年初至今月均离网率）',
      chartData: [
        { month: '2月', value: 1.15, monthlyAvg: 1.18 },
        { month: '3月', value: 1.18, monthlyAvg: 1.18 },
        { month: '4月', value: 1.20, monthlyAvg: 1.18 },
        { month: '5月', value: 1.19, monthlyAvg: 1.18 },
        { month: '6月', value: 1.18, monthlyAvg: 1.18 },
        { month: '7月', value: 1.20, monthlyAvg: 1.18 }
      ]
    }
  ];

  // 离网方式数据
  // 客户属性数据（用于离网客户特征分析）
  const customerAttributeData = {
    // 物理属性：年龄分布
    physical: {
      name: '物理属性 - 年龄分布',
      businessScope: '不同年龄段客户的离网规模和离网率',
      chartData: [
        { age: '0-18岁', scale: 6.5, rate: 2.1 },
        { age: '18-25岁', scale: 8.2, rate: 2.8 },
        { age: '25-30岁', scale: 14.2, rate: 3.5 },
        { age: '30-50岁', scale: 13.8, rate: 3.1 },
        { age: '50-70岁', scale: 5.4, rate: 2.4 },
        { age: '70岁及以上', scale: 2.5, rate: 1.8 }
      ]
    },
    // 资费属性：ARPU分层
    tariff: {
      name: '资费属性 - ARPU分层',
      businessScope: '不同ARPU分层客户的离网规模和离网率',
      chartData: [
        { arpu: '50元以下', scale: 18.5, rate: 4.2 },
        { arpu: '50-100元', scale: 14.8, rate: 3.5 },
        { arpu: '100-150元', scale: 7.2, rate: 2.8 },
        { arpu: '150-200元', scale: 3.6, rate: 2.1 },
        { arpu: '200元以上', scale: 1.5, rate: 1.5 }
      ]
    },
    // 业务属性：带宽分段
    business: {
      name: '业务属性 - 带宽分段',
      businessScope: '不同带宽分段客户的离网规模和离网率（含无宽带）',
      chartData: [
        { bandwidth: '无宽带', scale: 22.3, rate: 3.8 },
        { bandwidth: '50M以下', scale: 8.5, rate: 2.9 },
        { bandwidth: '50-100M', scale: 7.2, rate: 2.5 },
        { bandwidth: '100-200M', scale: 5.8, rate: 2.1 },
        { bandwidth: '200M以上', scale: 1.8, rate: 1.6 }
      ]
    },
    // 卡槽属性：卡槽状态
    slot: {
      name: '卡槽属性 - 卡槽状态',
      businessScope: '不同卡槽状态客户的离网规模和离网率',
      chartData: [
        { slot: '单卡槽', scale: 16.2, rate: 3.2 },
        { slot: '双卡槽-主卡', scale: 18.5, rate: 2.8 },
        { slot: '双卡槽-副卡', scale: 10.9, rate: 2.4 }
      ]
    }
  };

  // 客群看管数据
  const churnSegmentData = [
    { segment: '宽带沉默客户', scale: 856.3, yoy: '+2.1%', status: 'warning' as const, businessScope: '长期未使用宽带服务的客户' },
    { segment: '无宽带潜在离网风险客户', scale: 1248.5, yoy: '+3.8%', status: 'danger' as const, businessScope: '无宽带业务且有离网风险的客户' },
    { segment: '合约3个月内到期客户', scale: 2356.8, yoy: '+1.5%', status: 'warning' as const, businessScope: '合约期限在未来3个月内到期的客户' },
    { segment: '欠费停机超过6个月客户', scale: 1523.6, yoy: '+4.2%', status: 'danger' as const, businessScope: '因欠费停机时间超过6个月的客户' },
    { segment: '高额停机超过6个月客户', scale: 685.4, yoy: '+2.8%', status: 'danger' as const, businessScope: '高额消费停机时间超过6个月的客户' },
    { segment: '预销号超过6个月客户', scale: 456.7, yoy: '+1.9%', status: 'warning' as const, businessScope: '已申请预销号但尚未实际销号超过6个月的客户' }
  ];

  // 补充指标数据
  const supplementaryMetrics = [
    { name: '身份证离网客户数', value: 1256.8, yoy: '+5.2%', status: 'danger' as const, businessScope: '身份证下所有号码全部离网的客户数量' },
    { name: '部分号码离网客户数', value: 3456.2, yoy: '+3.5%', status: 'warning' as const, businessScope: '身份证下部分号码离网的客户数量' },
    { name: '重入网客户数', value: 789.4, yoy: '+2.8%', status: 'normal' as const, businessScope: '曾经离网后又重新入网的客户数量' }
  ];


  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* 整体离网指标 - 1行4列 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          整体离网指标
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {overallChurnMetrics.map((metric) => (
            <Card key={metric.id} className="p-4 hover:shadow-lg transition-shadow relative">
              {/* 告警图标 */}
              {metric.hasEntrances && (
                <AlertTriangle className="absolute top-2 right-2 h-4 w-4 text-orange-500 cursor-pointer" />
              )}

              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    <h4 className="text-sm text-gray-600">{metric.name}</h4>
                    <div className="relative group cursor-pointer">
                      <Info className="h-3.5 w-3.5 text-gray-400 hover:text-[#0066CC]" />
                      <div className="absolute left-0 top-6 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-normal">
                          {metric.businessScope}
                        </div>
                      </div>
                    </div>
                    {/* 去调度、指标树分析入口 */}
                    {metric.hasEntrances && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          className="text-xs text-[#0066CC] cursor-pointer hover:underline"
                          onClick={() => {
                            const url = `/workspace/strategy/dispatch?indicatorName=${encodeURIComponent(metric.indicatorName)}&from=churn-retention`;
                            window.location.href = url;
                          }}
                        >
                          去调度
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          className="text-xs text-[#0066CC] cursor-pointer hover:underline"
                          onClick={() => onJumpToTree(metric.indicatorName)}
                        >
                          指标树分析
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                    {metric.yoy !== '-' && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">{metric.yoyLabel || '同比'}</span>
                        <span className="text-xs font-medium text-green-600">
                          {metric.yoy}{metric.yoyUnit || ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 图表区域 */}
              <div className="border-t pt-2">
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    {metric.chartType === 'barline' ? (
                      <ComposedChart data={metric.chartData}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar yAxisId="left" dataKey="value" fill={metric.color} radius={[3, 3, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey={metric.id === 4 ? 'monthlyAvg' : 'yoy'} stroke="#00B050" strokeWidth={2} dot={{ r: 3 }} />
                      </ComposedChart>
                    ) : (
                      <LineChart data={metric.chartData}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 离网客户特征分析 - 改名自离网方式分析 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          离网客户特征分析
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* 物理属性 - 年龄分布 */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-gray-700">① 物理属性 - 年龄分布</h4>
              <div className="relative group cursor-pointer">
                <Info className="h-3.5 w-3.5 text-gray-400 hover:text-[#0066CC]" />
                <div className="absolute left-0 top-5 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                  <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-normal">
                    {customerAttributeData.physical.businessScope}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#0066CC] rounded-sm"></div>
                <span>离网规模（万）</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-1 bg-[#00B050] rounded-sm"></div>
                <span>离网率（%）</span>
              </span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={customerAttributeData.physical.chartData}>
                  <XAxis dataKey="age" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="scale" fill="#0066CC" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#00B050" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 资费属性 - ARPU分层 */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-gray-700">② 资费属性 - ARPU分层</h4>
              <div className="relative group cursor-pointer">
                <Info className="h-3.5 w-3.5 text-gray-400 hover:text-[#0066CC]" />
                <div className="absolute left-0 top-5 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                  <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-normal">
                    {customerAttributeData.tariff.businessScope}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#0066CC] rounded-sm"></div>
                <span>离网规模（万）</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-1 bg-[#00B050] rounded-sm"></div>
                <span>离网率（%）</span>
              </span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={customerAttributeData.tariff.chartData}>
                  <XAxis dataKey="arpu" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="scale" fill="#0066CC" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#00B050" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 业务属性 - 带宽分段 */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-gray-700">③ 业务属性 - 带宽分段</h4>
              <div className="relative group cursor-pointer">
                <Info className="h-3.5 w-3.5 text-gray-400 hover:text-[#0066CC]" />
                <div className="absolute left-0 top-5 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                  <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-normal">
                    {customerAttributeData.business.businessScope}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#0066CC] rounded-sm"></div>
                <span>离网规模（万）</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-1 bg-[#00B050] rounded-sm"></div>
                <span>离网率（%）</span>
              </span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={customerAttributeData.business.chartData}>
                  <XAxis dataKey="bandwidth" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="scale" fill="#0066CC" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#00B050" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 卡槽属性 - 卡槽状态 */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-gray-700">④ 卡槽属性 - 卡槽状态</h4>
              <div className="relative group cursor-pointer">
                <Info className="h-3.5 w-3.5 text-gray-400 hover:text-[#0066CC]" />
                <div className="absolute left-0 top-5 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                  <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-normal">
                    {customerAttributeData.slot.businessScope}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#0066CC] rounded-sm"></div>
                <span>离网规模（万）</span>
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-1 bg-[#00B050] rounded-sm"></div>
                <span>离网率（%）</span>
              </span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={customerAttributeData.slot.chartData}>
                  <XAxis dataKey="slot" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="scale" fill="#0066CC" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#00B050" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* 客群看管 - 重点客群看管 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-[#0066CC] rounded"></div>
          客群看管 - 重点客群看管
        </h3>
        <div className="grid grid-cols-6 gap-3">
          {churnSegmentData.map((item, index) => (
            <Card key={index} className="p-3 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600 truncate">{item.segment}</span>
                  <div className="relative group cursor-pointer flex-shrink-0">
                    <Info className="h-3 w-3 text-gray-400 hover:text-[#0066CC]" />
                    <div className="absolute left-0 top-5 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                      <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-normal">
                        {item.businessScope}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-lg font-bold text-gray-900">{item.scale}万</div>
                <div className={`text-xs ${item.status === 'warning' ? 'text-orange-600' : item.status === 'danger' ? 'text-red-600' : 'text-green-600'}`}>
                  环比 {item.yoy}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* 补充指标 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            {supplementaryMetrics.map((item, index) => (
              <Card key={index} className="p-3 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <div className="relative group cursor-pointer flex-shrink-0">
                      <Info className="h-3 w-3 text-gray-400 hover:text-[#0066CC]" />
                      <div className="absolute left-0 top-5 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                        <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs whitespace-normal">
                          {item.businessScope}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-xl font-bold text-[#0066CC]">{item.value}万</div>
                  <div className="text-sm text-gray-600">
                    环比 {item.yoy}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 指标树内容组件
