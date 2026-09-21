'use client';

import React, { memo, useMemo, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Trophy, AlertCircle, ArrowUpRight, ArrowDownRight, MoreHorizontal, Bell, ChevronRight, Star, AlertTriangle, ArrowRight, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell, Legend, BarChart, Bar, ComposedChart } from 'recharts';
import { useMounted } from '@/hooks/useMounted';
import {
  workOrderImprovementOverview,
  excellentWorkOrders,
  needImprovementWorkOrders,
  focusWorkOrders,
  WorkOrderImprovementDetail,
  WorkOrderType,
  ImprovementGrade,
  ImprovementTimePeriod,
} from '@/lib/evaluation-data';

// 近6个月标签
const monthLabels = ['7月', '8月', '9月', '10月', '11月', '12月'];

// 计算均分刻度值
const calculateEvenTicks = (data: number[], count: number, padding: number = 0): number[] => {
  if (data.length === 0) return [];
  const min = Math.min(...data) - padding;
  const max = Math.max(...data) + padding;
  const step = (max - min) / (count - 1);
  const ticks = Array.from({ length: count }, (_, i) => {
    const tick = min + step * i;
    // 确保返回合理的数值，避免计算错误
    return Number(tick.toFixed(2));
  });
  return ticks;
};

// 简单的趋势图组件（使用 React.memo 优化性能）
const TrendChart = memo(({ data, color, height = 120, padding = 0 }: { data: number[]; color: string; height?: number; padding?: number }) => {
  // 使用 useMemo 缓存图表数据
  const chartData = useMemo(() => 
    data.map((value, index) => ({
      month: monthLabels[index],
      value,
    })), 
  [data]
  );

  // 使用 useMemo 缓存刻度计算
  const ticks = useMemo(() => calculateEvenTicks(data, 5, padding), [data, padding]);

  // 使用 useCallback 缓存 formatter 函数
  const tooltipFormatter = useCallback((value: number) => [`${value}%`, '达成率'], []);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#6b7280' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#6b7280' }}
          domain={[ticks[0], ticks[ticks.length - 1]] as [number, number]}
          ticks={ticks}
          tickCount={ticks.length}
          allowDecimals={true}
          allowDataOverflow={true}
          tickFormatter={(value) => `${Number(value).toFixed(2)}%`}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
          }}
          formatter={tooltipFormatter}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${color})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

TrendChart.displayName = 'TrendChart';

// 平均达成率趋势图组件（柱状图+折线图，使用 React.memo 优化性能）
const AverageTrendChart = memo(({ data, trendData, color, height = 200, padding = 0 }: { data: number[]; trendData: number[]; color: string; height?: number; padding?: number }) => {
  // 使用 useMemo 缓存图表数据
  const chartData = useMemo(() => 
    data.map((value, index) => ({
      month: monthLabels[index],
      improvement: value,
      trend: trendData[index],
    })), 
  [data, trendData]
  );

  // 使用 useMemo 缓存刻度计算
  const improvementTicks = useMemo(() => calculateEvenTicks(data, 5, padding), [data, padding]);
  const trendTicks = useMemo(() => trendData.length > 0 ? calculateEvenTicks(trendData, 5, 0) : [0, 1, 2, 3, 4], [trendData]);

  // 使用 useCallback 缓存 formatter 函数
  const tooltipFormatter = useCallback((value: number, name: string) => {
    if (name === '平均达成率') {
      return [`${value}%`, name];
    }
    return [`${value.toFixed(2)}pp`, name];
  }, []);

  // 自定义图例渲染函数
  const renderLegend = () => (
    <div className="flex items-center justify-center gap-6 mt-2">
      {/* 平均达成率 - 柱状图图例 */}
      <div className="flex items-center gap-2">
        <div
          style={{
            width: 16,
            height: 16,
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
        <span style={{ fontSize: '12px', color: '#6b7280' }}>平均达成率（%）</span>
      </div>
      {/* 环比 - 折线图图例 */}
      <div className="flex items-center gap-2">
        <svg width={24} height={16} viewBox="0 0 24 16">
          <line
            x1={0}
            y1={8}
            x2={24}
            y2={8}
            stroke="#ef4444"
            strokeWidth={2}
          />
          <circle cx={6} cy={8} r={2} fill="#ef4444" />
          <circle cx={12} cy={8} r={2} fill="#ef4444" />
          <circle cx={18} cy={8} r={2} fill="#ef4444" />
        </svg>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>环比</span>
      </div>
    </div>
  );


  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#6b7280' }}
        />
        <YAxis
          yAxisId="improvement"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#6b7280' }}
          domain={[improvementTicks[0], improvementTicks[improvementTicks.length - 1]] as [number, number]}
          ticks={improvementTicks}
          tickCount={improvementTicks.length}
          allowDecimals={true}
          allowDataOverflow={true}
          tickFormatter={(value) => `${Number(value).toFixed(2)}`}
        />
        <YAxis
          yAxisId="trend"
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#6b7280' }}
          domain={[trendTicks[0], trendTicks[trendTicks.length - 1]] as [number, number]}
          ticks={trendTicks}
          tickCount={trendTicks.length}
          allowDecimals={true}
          allowDataOverflow={true}
          tickFormatter={(value) => `${Number(value).toFixed(2)}`}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
          }}
          formatter={tooltipFormatter}
        />
        <Legend
          verticalAlign="bottom"
          height={40}
          content={renderLegend}
        />
        <Bar yAxisId="improvement" dataKey="improvement" name="平均达成率" fill={color} radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false} />
        <Line yAxisId="trend" dataKey="trend" name="环比" stroke="#ef4444" strokeWidth={2} type="monotone" dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
});

AverageTrendChart.displayName = 'AverageTrendChart';

// 获取等级配置
const getGradeConfig = (grade: ImprovementGrade) => {
  if (grade === 'excellent') {
    return {
      icon: '🟢',
      label: '优秀',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
  }
  if (grade === 'average') {
    return {
      icon: '🟡',
      label: '一般',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
  }
  return {
    icon: '🔴',
    label: '待优化',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
};

// 根据得分获取颜色类
const getScoreColorClass = (score: number) => {
  if (score >= 80) {
    return 'text-green-600 dark:text-green-400';
  }
  if (score >= 60) {
    return 'text-yellow-600 dark:text-yellow-400';
  }
  return 'text-red-600 dark:text-red-400';
};

// 格式化数字：去掉小数点后多余的0
const formatNumber = (value: number | string, decimals: number = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return parseFloat(num.toFixed(decimals)).toString();
};

// 根据归因获取操作按钮
const getActionButton = (workOrder: WorkOrderImprovementDetail) => {
  // 直接使用 handlingSuggestion 字段作为按钮标签
  return { label: workOrder.handlingSuggestion || '重新调度', action: 'reschedule' };
};

// 获取达成率颜色类名
const getAchievementRateColor = (rate: number) => {
  return rate >= 80 ? 'text-green-600' : rate >= 40 ? 'text-yellow-600' : 'text-red-600';
};

// 获取达成率背景颜色类名
const getAchievementRateBgColor = (rate: number) => {
  return rate >= 80 ? 'bg-green-500' : rate >= 40 ? 'bg-yellow-500' : 'bg-red-500';
};

// 指标详情弹窗内容组件
const MetricTooltipContent = ({ metrics }: { metrics: WorkOrderImprovementDetail['improvementMetricSummary'] }) => {
  return (
    <div className="space-y-2 max-w-xs">
      <div className="font-semibold text-xs border-b border-gray-200 dark:border-gray-600 pb-1.5 mb-2 text-gray-900 dark:text-white">
        指标详情
      </div>
      {metrics.map((metric, idx) => (
        <div key={idx} className="space-y-1.5 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
          <div className="font-medium text-xs text-gray-900 dark:text-white">
            {metric.metricName}
            {metric.unit && <span className="ml-1 text-gray-600 dark:text-gray-400">（{metric.unit}）</span>}
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <span className="text-gray-700 dark:text-gray-300">原值</span>
              <div className="font-semibold text-gray-900 dark:text-white">{metric.previousValue?.toFixed(2) ?? '-'}</div>
            </div>
            <div>
              <span className="text-gray-700 dark:text-gray-300">现值</span>
              <div className="font-semibold text-gray-900 dark:text-white">{metric.currentValue?.toFixed(2) ?? '-'}</div>
            </div>
            <div>
              <span className="text-gray-700 dark:text-gray-300">目标值</span>
              <div className="font-semibold text-gray-900 dark:text-white">{metric.targetValue?.toFixed(2) ?? '-'}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-700 dark:text-gray-300 font-medium">达成率:</span>
            <span className={`font-bold ${getAchievementRateColor(metric.targetAchievementRate)}`}>
              {metric.targetAchievementRate}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// 改善等级占比环形图组件（使用 React.memo 优化性能）
const GradeDistributionPieChart = memo(({ data }: { data: Array<{ grade: ImprovementGrade; gradeName: string; count: number; percentage: number }> }) => {
  // 使用 useMemo 缓存图表数据
  const pieData = useMemo(() => 
    data.map(item => ({
      name: item.gradeName,
      value: item.count,
      color: item.grade === 'excellent' ? '#16a34a' : item.grade === 'average' ? '#ca8a04' : '#dc2626',
      percentage: item.percentage,
      grade: item.grade,
    })), 
  [data]
  );

  // 使用 useCallback 缓存 formatter 函数
  const tooltipFormatter = useCallback((value: number, name: string, props: any) => {
    const item = props.payload;
    return [
      [
        <div key="standard" className="text-gray-600 text-xs">
          达成率标准: {item.grade === 'excellent' ? '≥80分' : item.grade === 'average' ? '60-79分' : '<60分'}
        </div>,
        <div key="percentage" className="font-medium">
          占比: {item.percentage}%
        </div>,
        <div key="count" className="text-gray-600 text-xs">
          工单量: {value.toLocaleString()}条
        </div>,
      ],
      name,
    ];
  }, []);

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={65}
          paddingAngle={5}
          dataKey="value"
          isAnimationActive={false}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
          }}
          formatter={tooltipFormatter}
        />
      </PieChart>
    </ResponsiveContainer>
  );
});

GradeDistributionPieChart.displayName = 'GradeDistributionPieChart';

// 获取排名徽章样式
const getRankBadgeClass = (rank: number) => {
  if (rank === 0) return 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-white text-xs font-bold';
  if (rank === 1) return 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-white text-xs font-bold';
  if (rank === 2) return 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-400 text-white text-xs font-bold';
  return 'text-sm';
};

// 判断指标是否为正向指标（越高越好）
const isPositiveMetric = (metricName: string): boolean => {
  const positiveMetrics = [
    '流量增幅', '当月日均流量', '5G数据流量', '当月套餐饱和度',
    '保有率', '中高端保有率', '融合率', '家庭ARPU',
    '新入网客户数', '新入网ARPU', '中高端ARPU',
    '国际漫游收入', '国际出访客户数', '携转净增',
    '整体饱和度(套+包)', '预警准确率', '维系触达率',
    '23类客户三扩三融率', '流量份额',
  ];
  // 负向指标（越低越好）：离网率、是否流量超套客户
  return positiveMetrics.includes(metricName);
};

// 计算指标变化
const calculateMetricChange = (previousValue: number, currentValue: number) => {
  const change = currentValue - previousValue;
  const changeRate = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  return {
    change,
    changeRate: Math.abs(changeRate).toFixed(2),
    isIncrease: change > 0,
    isDecrease: change < 0,
  };
};

// 格式化区域显示
const formatRegions = (regions: string[] | undefined): string => {
  if (!regions || regions.length === 0) return '-';
  if (regions.length <= 3) {
    return regions.join('、');
  }
  return `${regions.slice(0, 3).join('、')}等${regions.length}个区域`;
};

// 获取工单类型映射
const workOrderTypeMap: Record<WorkOrderType, string> = {
  indicator: '指标调度',
  strategy: '策略调度',
  group: '客群调度',
  customer: '客户商机调度',
  other: '其他',
};

// 重点关注工单TOP 5
const topFocusWorkOrders = focusWorkOrders.slice(0, 5);

// 获取待优化工单的操作按钮配置
const getActionButtons = (item: WorkOrderImprovementDetail) => {
  const buttons: {
    label: string;
    variant: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
    className: string;
  }[] = [];

  // 添加"查看详情"按钮（始终显示）
  buttons.push({
    label: '查看详情',
    variant: 'ghost',
    className: 'text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
  });

  // 根据处理建议添加对应的操作按钮
  if (item.handlingSuggestion === '再次调度') {
    buttons.push({
      label: '调度',
      variant: 'outline',
      className: 'text-xs border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30',
    });
  } else if (item.handlingSuggestion === '发起督办') {
    buttons.push({
      label: '督办',
      variant: 'outline',
      className: 'text-xs border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900/30',
    });
  } else if (item.handlingSuggestion === '调整策略') {
    buttons.push({
      label: '策略调整',
      variant: 'outline',
      className: 'text-xs border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/30',
    });
  } else if (item.handlingSuggestion === '流程优化') {
    buttons.push({
      label: '流程优化',
      variant: 'outline',
      className: 'text-xs border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/30',
    });
  }

  return buttons;
};

export function WorkOrderImprovementOverview({ selectedCityCode, selectedCityName }: { selectedCityCode: string; selectedCityName: string }) {
  const mounted = useMounted();
  const [importanceLevelFilter, setImportanceLevelFilter] = useState<'all' | '公司领导调度' | '公司部门调度'>('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<'all' | 'production' | 'management'>('all');
  const [dispatchTypeFilter, setDispatchTypeFilter] = useState<string>('all');
  const [top5Filter, setTop5Filter] = useState<'all' | 'production' | 'management'>('all');
  const [bottom5Filter, setBottom5Filter] = useState<'all' | 'production' | 'management'>('all');

  // 重点工单分页状态
  const [focusWorkOrdersCurrentPage, setFocusWorkOrdersCurrentPage] = useState(1);
  const focusWorkOrdersPageSize = 5;

  // 移除重要级别弹窗状态
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [workOrderToRemove, setWorkOrderToRemove] = useState<string | null>(null);

  // 根据筛选条件过滤重点工单
  const filteredFocusWorkOrders = useMemo(() => {
    return topFocusWorkOrders.filter((workOrder) => {
      const importanceMatch = importanceLevelFilter === 'all' || workOrder.importanceLevel === importanceLevelFilter;
      const businessTypeMatch = businessTypeFilter === 'all' ||
        (businessTypeFilter === 'production' && workOrder.businessType === '生产类') ||
        (businessTypeFilter === 'management' && workOrder.businessType === '管理类');
      const dispatchTypeMatch = dispatchTypeFilter === 'all' || workOrder.dispatchType === dispatchTypeFilter;
      const regionMatch = !selectedCityCode || (workOrder.regions && workOrder.regions.length > 0 && workOrder.regions.some((r: string) => r.includes(selectedCityName) || selectedCityName === '全疆'));
      return importanceMatch && businessTypeMatch && dispatchTypeMatch && regionMatch;
    });
  }, [importanceLevelFilter, businessTypeFilter, dispatchTypeFilter, selectedCityCode, selectedCityName]);

  // 重点工单分页逻辑
  const focusWorkOrdersTotalPages = Math.ceil(filteredFocusWorkOrders.length / focusWorkOrdersPageSize);
  const paginatedFocusWorkOrders = useMemo(() => {
    const startIndex = (focusWorkOrdersCurrentPage - 1) * focusWorkOrdersPageSize;
    const endIndex = startIndex + focusWorkOrdersPageSize;
    return filteredFocusWorkOrders.slice(startIndex, endIndex);
  }, [filteredFocusWorkOrders, focusWorkOrdersCurrentPage, focusWorkOrdersPageSize]);

  // 筛选条件变化时重置页码
  const handleBusinessTypeFilterChange = (value: string) => {
    setBusinessTypeFilter(value as any);
    setFocusWorkOrdersCurrentPage(1);
  };

  const handleImportanceLevelFilterChange = (value: string) => {
    setImportanceLevelFilter(value as any);
    setFocusWorkOrdersCurrentPage(1);
  };

  // 移除重要级别处理函数
  const handleRemoveImportance = (workOrderId: string) => {
    setWorkOrderToRemove(workOrderId);
    setRemoveDialogOpen(true);
  };

  const confirmRemoveImportance = () => {
    if (workOrderToRemove) {
      // 这里可以添加实际的移除逻辑，例如调用API或更新状态
      console.log('移除工单重要级别:', workOrderToRemove);
      // 暂时从filteredFocusWorkOrders中移除（实际应用中应该从数据源移除）
      setRemoveDialogOpen(false);
      setWorkOrderToRemove(null);
    }
  };

  const cancelRemoveImportance = () => {
    setRemoveDialogOpen(false);
    setWorkOrderToRemove(null);
  };

  // 根据筛选条件过滤Top 5工单
  const filteredTop5WorkOrders = useMemo(() => {
    return excellentWorkOrders.filter((workOrder) => {
      return top5Filter === 'all' || workOrder.businessType === (top5Filter === 'production' ? '生产类' : '管理类');
    }).slice(0, 5);
  }, [top5Filter]);

  // 根据筛选条件过滤Bottom 5工单
  const filteredBottom5WorkOrders = useMemo(() => {
    return needImprovementWorkOrders.filter((workOrder) => {
      return bottom5Filter === 'all' || workOrder.businessType === (bottom5Filter === 'production' ? '生产类' : '管理类');
    }).slice(0, 5);
  }, [bottom5Filter]);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* 重点工单列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" />
              <CardTitle className="text-lg">重点工单</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Tabs value={businessTypeFilter} onValueChange={handleBusinessTypeFilterChange}>
                <TabsList className="bg-gray-100 dark:bg-gray-800 p-0.5 h-8">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm rounded-md px-3 py-1 text-xs data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                  >
                    全部
                  </TabsTrigger>
                  <TabsTrigger
                    value="production"
                    className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                  >
                    生产类
                  </TabsTrigger>
                  <TabsTrigger
                    value="management"
                    className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                  >
                    管理类
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={importanceLevelFilter} onValueChange={handleImportanceLevelFilterChange}>
                <TabsList className="bg-gray-100 dark:bg-gray-800 p-0.5 h-8">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm rounded-md px-3 py-1 text-xs data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                  >
                    全部
                  </TabsTrigger>
                  <TabsTrigger
                    value="公司领导调度"
                    className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                  >
                    公司领导调度
                  </TabsTrigger>
                  <TabsTrigger
                    value="公司部门调度"
                    className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                  >
                    公司部门调度
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={dispatchTypeFilter} onValueChange={setDispatchTypeFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="调度类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部调度类型</SelectItem>
                  <SelectItem value="指标调度">指标调度</SelectItem>
                  <SelectItem value="策略调度">策略调度</SelectItem>
                  <SelectItem value="客群调度">客群调度</SelectItem>
                  <SelectItem value="客户商机调度">客户商机调度</SelectItem>
                  <SelectItem value="客群商机调度">客群商机调度</SelectItem>
                  <SelectItem value="区域攻坚调度">区域攻坚调度</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="场景" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部场景</SelectItem>
                  <SelectItem value="traffic">流量运营</SelectItem>
                  <SelectItem value="churn">离网维系</SelectItem>
                  <SelectItem value="family">家庭运营</SelectItem>
                  <SelectItem value="incremental">增量运营</SelectItem>
                  <SelectItem value="high-end">中高端客户运营</SelectItem>
                  <SelectItem value="international">国际业务运营</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                更多 &gt;&gt;
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-2 px-3 font-medium text-center">工单信息</TableHead>
                <TableHead className="py-2 px-3 font-medium text-center">涉及区域</TableHead>
                <TableHead className="py-2 px-3 font-medium text-center">重要级别</TableHead>
                <TableHead className="py-2 px-3 font-medium text-center">
                  <div className="flex items-center justify-center gap-1">
                    当前达成率（%）
                    <TooltipProvider><ShadcnTooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-gray-400 cursor-help" /></TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        <p>工单达成率 = 各指标达成率的算术平均值</p>
                        <p>单指标达成率 = (当前值-基期值)/(目标值-基期值)×100%</p>
                      </TooltipContent>
                    </ShadcnTooltip></TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className="py-2 px-3 font-medium text-center">指标情况</TableHead>
                <TableHead className="py-2 px-3 font-medium text-center">工单下发时间</TableHead>
                <TableHead className="py-2 px-3 font-medium text-center">要求完成时间</TableHead>
                <TableHead className="py-2 px-3 text-center font-medium">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFocusWorkOrders.map((workOrder, index) => (
                <TableRow key={workOrder.id} className="border-b border-gray-100 dark:border-gray-800">
                  <TableCell className="py-3 px-3">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{workOrder.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {workOrder.businessType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {workOrder.scenario}{workOrder.dispatchType}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <span className="text-sm">{formatRegions(workOrder.regions)}</span>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-center">
                    <Badge variant="outline" className="text-xs">
                      {workOrder.importanceLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <div className="flex items-center justify-center">
                      <span className={`${getAchievementRateColor(workOrder.effectScore)} text-sm font-bold`}>
                        {workOrder.effectScore}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <TooltipProvider>
                      <ShadcnTooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-2 cursor-help">
                            {workOrder.improvementMetricSummary.map((metric, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col gap-1 w-full"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">{metric.metricName}</span>
                                  <span className={`${getAchievementRateColor(metric.targetAchievementRate)} text-xs font-medium`}>
                                    {metric.targetAchievementRate}%
                                  </span>
                                </div>
                                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${getAchievementRateBgColor(metric.targetAchievementRate)}`}
                                    style={{ width: `${metric.targetAchievementRate}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg max-w-md">
                          <MetricTooltipContent metrics={workOrder.improvementMetricSummary} />
                        </TooltipContent>
                      </ShadcnTooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <span className="text-sm">{workOrder.issueTime}</span>
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <span className="text-sm">{workOrder.requiredCompletionTime}</span>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                        onClick={() => handleRemoveImportance(workOrder.id)}
                      >
                        移除重要级别
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        查看
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* 分页组件 */}
          {filteredFocusWorkOrders.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                共 {filteredFocusWorkOrders.length} 项数据
              </div>
              <div className="flex items-center gap-4">
                {/* 分页控制 */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={focusWorkOrdersCurrentPage === 1}
                    onClick={() => setFocusWorkOrdersCurrentPage(focusWorkOrdersCurrentPage - 1)}
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </Button>
                  {Array.from({ length: Math.min(focusWorkOrdersTotalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (focusWorkOrdersTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (focusWorkOrdersCurrentPage <= 3) {
                      pageNum = i + 1;
                    } else if (focusWorkOrdersCurrentPage >= focusWorkOrdersTotalPages - 2) {
                      pageNum = focusWorkOrdersTotalPages - 4 + i;
                    } else {
                      pageNum = focusWorkOrdersCurrentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={focusWorkOrdersCurrentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 p-0 ${focusWorkOrdersCurrentPage === pageNum ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                        onClick={() => setFocusWorkOrdersCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={focusWorkOrdersCurrentPage === focusWorkOrdersTotalPages}
                    onClick={() => setFocusWorkOrdersCurrentPage(focusWorkOrdersCurrentPage + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                {/* 页码跳转 */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">前往</span>
                  <Input
                    type="number"
                    min="1"
                    max={focusWorkOrdersTotalPages}
                    className="w-16 h-8 text-center text-sm"
                    placeholder="页"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const page = parseInt(e.currentTarget.value);
                        if (page >= 1 && page <= focusWorkOrdersTotalPages) {
                          setFocusWorkOrdersCurrentPage(page);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">页</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        {/* 移除重要级别确认对话框 */}
        <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">确认移除重要级别</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 pt-2">
                是否确认移除该条工单的重要级别信息？移除后该条工单将不会显示在重点工单区域内。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={cancelRemoveImportance}
              >
                取消
              </Button>
              <Button
                variant="default"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={confirmRemoveImportance}
              >
                确认移除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
      {/* 工单改善情况卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">工单评估</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary/80"
              onClick={() => window.location.href = '/portal/capability/evaluation-center/work-order'}
            >
              进入工单评估 <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 上方：平均达成率、趋势图、改善等级占比环形图 - 合并为一个卡片 */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：平均达成率数值及趋势图（左右排列）- 占2列 */}
              <div className="col-span-1 lg:col-span-2">
                <div className="flex items-center gap-6">
                  {/* 左边：平均达成率数值 */}
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">平均达成率</span>
                      <TooltipProvider><ShadcnTooltip><TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-gray-400 cursor-help" /></TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          <p>工单达成率 = 各指标达成率的算术平均值</p>
                          <p>单指标达成率 = (当前值-基期值)/(目标值-基期值)×100%</p>
                          <p>基期值=目标值时记100%，&lt;0记0%，&gt;100%记100%</p>
                        </TooltipContent>
                      </ShadcnTooltip></TooltipProvider>
                    </div>
                    <span className={`text-4xl font-bold ${getScoreColorClass(workOrderImprovementOverview.averageImprovementRate)}`}>
                      {workOrderImprovementOverview.averageImprovementRate}%
                    </span>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mt-2">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {workOrderImprovementOverview.averageImprovementRateChange}pp
                      </span>
                    </div>
                  </div>
                  {/* 右边：趋势图 */}
                  <div className="flex-1">
                    <AverageTrendChart
                      data={workOrderImprovementOverview.averageImprovementRateTrend}
                      trendData={workOrderImprovementOverview.averageImprovementRateChangeTrend}
                      color="#2563eb"
                      padding={5}
                    />
                  </div>
                </div>
              </div>

              {/* 右侧：改善等级占比环形图 + 图例 - 占1列 */}
              <div>
                <div className="flex items-center gap-4">
                  {/* 环形图 */}
                  <div className="w-[60%]">
                    <GradeDistributionPieChart
                      data={workOrderImprovementOverview.gradeDistribution}
                    />
                  </div>
                  {/* 图例 */}
                  <div className="flex flex-col items-start gap-3">
                    {workOrderImprovementOverview.gradeDistribution.map((item, index) => {
                      const gradeConfig = getGradeConfig(item.grade);
                      const color = item.grade === 'excellent' ? '#16a34a' : item.grade === 'average' ? '#ca8a04' : '#dc2626';
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-sm" 
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-[10px] text-gray-600 dark:text-gray-400">
                            {gradeConfig.label}工单 {item.percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 各场景执行情况 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">分场景评估</h4>
            <div className="overflow-x-auto pb-2" style={{ width: '100%' }}>
              <div className="flex gap-4" style={{ minWidth: '1400px' }}>
                {workOrderImprovementOverview.scenarioExecutionStatus.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex-none"
                      style={{ width: '200px' }}
                    >
                      {/* 场景名称 */}
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.scenarioName}
                        </h5>
                      </div>

                      {/* 平均达成率 */}
                      <div className="mb-2">
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">平均达成率</div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-xl font-bold ${getScoreColorClass(item.averageImprovementRate)}`}>
                            {item.averageImprovementRate}%
                          </span>
                          <span className={`text-[10px] ${item.rateChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.rateChange > 0 ? '↑' : '↓'}{Math.abs(item.rateChange)}pp
                          </span>
                        </div>
                      </div>

                      {/* 评估的工单总量 */}
                      <div className="mb-2">
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">评估的工单总量</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.totalWorkOrders}
                        </div>
                      </div>

                      {/* 工单关联指标数 */}
                      <div>
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">工单关联指标数</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.totalMetrics}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            （改善指标占比 {item.growthMetricRate}%）
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 各场景工单达成率 - 已隐藏 */}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 工单达成Top 5 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-lg">工单达成Top 5</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Tabs value={top5Filter} onValueChange={(value) => setTop5Filter(value as any)}>
                  <TabsList className="bg-gray-100 dark:bg-gray-800 p-0.5 h-8">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm rounded-md px-3 py-1 text-xs data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                    >
                      全部
                    </TabsTrigger>
                    <TabsTrigger
                      value="production"
                      className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                    >
                      生产类
                    </TabsTrigger>
                    <TabsTrigger
                      value="management"
                      className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                    >
                      管理类
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900">
                  <TableHead className="text-xs font-semibold text-gray-900 dark:text-white py-3 px-2 text-center">
                    工单信息
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-900 dark:text-white py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      达成率（%）
                      <TooltipProvider><ShadcnTooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-gray-400 cursor-help" /></TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          <p>工单达成率 = 各指标达成率的算术平均值</p>
                          <p>单指标达成率 = (当前值-基期值)/(目标值-基期值)×100%</p>
                        </TooltipContent>
                      </ShadcnTooltip></TooltipProvider>
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-900 dark:text-white py-3 px-2 text-center">
                    执行结果
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTop5WorkOrders.map((item, index) => {
                  const gradeConfig = getGradeConfig(item.grade);
                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <TableCell className="py-3 px-2">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 py-0.5">
                              {item.businessType}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 py-0.5">
                              {item.scenario}{item.dispatchType}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-2 text-center">
                        <span className={`text-base font-bold ${gradeConfig.color}`}>
                          {formatNumber(item.effectScore)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-2">
                        <TooltipProvider>
                          <ShadcnTooltip>
                            <TooltipTrigger asChild>
                              <div className="space-y-1 cursor-help">
                                {item.improvementMetricSummary.map((metric, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col gap-1 w-full"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">{metric.metricName}</span>
                                      <span className={`${getAchievementRateColor(metric.targetAchievementRate)} text-xs font-medium`}>
                                        {metric.targetAchievementRate}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${getAchievementRateBgColor(metric.targetAchievementRate)}`}
                                        style={{ width: `${metric.targetAchievementRate}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                                {item.attributionSummary && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span>{item.attributionSummary}</span>
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg max-w-md">
                              <MetricTooltipContent metrics={item.improvementMetricSummary} />
                            </TooltipContent>
                          </ShadcnTooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="py-3 px-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 工单达成Bottom 5 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-lg">
                  工单达成Bottom 5
                </CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Tabs value={bottom5Filter} onValueChange={(value) => setBottom5Filter(value as any)}>
                  <TabsList className="bg-gray-100 dark:bg-gray-800 p-0.5 h-8">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm rounded-md px-3 py-1 text-xs data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                    >
                      全部
                    </TabsTrigger>
                    <TabsTrigger
                      value="production"
                      className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                    >
                      生产类
                    </TabsTrigger>
                    <TabsTrigger
                      value="management"
                      className="rounded-md px-3 py-1 text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-600"
                    >
                      管理类
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900">
                  <TableHead className="text-xs font-semibold text-gray-900 dark:text-white py-3 px-2 text-center">
                    工单信息
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-900 dark:text-white py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      达成率（%）
                      <TooltipProvider><ShadcnTooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-gray-400 cursor-help" /></TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          <p>工单达成率 = 各指标达成率的算术平均值</p>
                          <p>单指标达成率 = (当前值-基期值)/(目标值-基期值)×100%</p>
                        </TooltipContent>
                      </ShadcnTooltip></TooltipProvider>
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-900 dark:text-white py-3 px-2 text-center">
                    执行结果
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-900 dark:text-white py-3 px-2 text-center">
                    操作
                  </TableHead>
                  <TableHead className="py-3 px-2 text-center">
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBottom5WorkOrders.map((item, index) => {
                  const gradeConfig = getGradeConfig(item.grade);
                  const actionButton = getActionButton(item);
                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <TableCell className="py-3 px-2">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 py-0.5">
                              {item.businessType}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 py-0.5">
                              {item.scenario}{item.dispatchType}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-2 text-center">
                        <span className={`text-base font-bold ${gradeConfig.color}`}>
                          {formatNumber(item.effectScore)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-2">
                        <TooltipProvider>
                          <ShadcnTooltip>
                            <TooltipTrigger asChild>
                              <div className="space-y-2 cursor-help">
                                {item.improvementMetricSummary.map((metric, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col gap-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">{metric.metricName}</span>
                                      <span className={`${getAchievementRateColor(metric.targetAchievementRate)} text-xs font-medium`}>
                                        {metric.targetAchievementRate}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${getAchievementRateBgColor(metric.targetAchievementRate)}`}
                                        style={{ width: `${metric.targetAchievementRate}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                                {item.optimizationReason && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                                    <span>{item.optimizationReason}</span>
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg max-w-md">
                              <MetricTooltipContent metrics={item.improvementMetricSummary} />
                            </TooltipContent>
                          </ShadcnTooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="py-3 px-2 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] h-7 px-2 py-1"
                        >
                          {actionButton.label}
                        </Button>
                      </TableCell>
                      <TableCell className="py-3 px-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
