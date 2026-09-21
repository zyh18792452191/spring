'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Info } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useMounted } from '@/hooks/useMounted';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  strategyEvaluationSummary,
  regionStrategySummaryMap,
  StrategyEvaluationSummaryData,
  StrategyKPI,
  StrategyMonthlyTrend,
  StrategyEffectDistribution,
  RegionStrategyRank,
} from '@/lib/evaluation-data';

// 格式化变化值
const formatChange = (change: number, changeUnit: 'pp' | 'absolute'): string => {
  const prefix = change > 0 ? '+' : '';
  if (changeUnit === 'pp') {
    return `${prefix}${change.toFixed(1)}pp`;
  }
  return `${prefix}${change}`;
};

// 获取变化值的颜色类
const getChangeColorClass = (change: number, label: string): string => {
  // 对于所有KPI，上升都是好的
  if (change > 0) return 'text-green-600 dark:text-green-400';
  if (change < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-500 dark:text-gray-400';
};

// 获取变化图标
const ChangeIcon = ({ change }: { change: number }) => {
  if (change > 0) return <TrendingUp className="w-3 h-3" />;
  if (change < 0) return <TrendingDown className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
};

// KPI卡片组件
const KPICard = memo(({ kpi }: { kpi: StrategyKPI }) => {
  const changeColorClass = getChangeColorClass(kpi.change, kpi.label);
  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild><Info className="w-3 h-3 text-muted-foreground/60 cursor-help" /></TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs p-3 text-xs space-y-1.5">
              <p className="font-semibold text-foreground">业务说明</p>
              <p>{kpi.description}</p>
              <p className="font-semibold text-foreground pt-1">统计公式</p>
              <p className="font-mono">{kpi.formula}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
        <span className="text-sm text-muted-foreground">{kpi.unit}</span>
      </div>
      <div className={`flex items-center gap-1 text-xs ${changeColorClass}`}>
        <ChangeIcon change={kpi.change} />
        <span>{formatChange(kpi.change, kpi.changeUnit)}</span>
        <span className="text-muted-foreground">较上月</span>
      </div>
    </div>
  );
});
KPICard.displayName = 'KPICard';

// 策略执行趋势图
const StrategyTrendChart = memo(({ data }: { data: StrategyMonthlyTrend[] }) => {
  const chartData = useMemo(() =>
    data.map(item => ({
      month: item.month.slice(5), // "2026-05" → "05"
      派发数量: item.dispatched,
      已完成数量: item.completed,
      成功率: item.successRate,
    })),
    [data]
  );

  const tooltipFormatter = useCallback((value: number, name: string) => {
    if (name === '成功率') return [`${value}%`, name];
    return [value, name];
  }, []);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#6b7280' }}
        />
        <YAxis
          yAxisId="count"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          allowDecimals={false}
        />
        <YAxis
          yAxisId="rate"
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickFormatter={(v: number) => `${v}%`}
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
          height={36}
          iconType="line"
          formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="派发数量"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
          isAnimationActive={false}
        />
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="已完成数量"
          stroke="#16a34a"
          strokeWidth={2}
          dot={{ fill: '#16a34a', strokeWidth: 2, r: 3 }}
          isAnimationActive={false}
        />
        <Line
          yAxisId="rate"
          type="monotone"
          dataKey="成功率"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});
StrategyTrendChart.displayName = 'StrategyTrendChart';

// 策略效果分布环形图
const EffectDistributionChart = memo(({ data }: { data: StrategyEffectDistribution[] }) => {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.count, 0), [data]);

  const customLegend = useCallback(() => (
    <div className="flex flex-col gap-2 mt-2">
      {data.map((item) => (
        <div key={item.level} className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{item.count}</span>
            <span className="text-muted-foreground">({item.percentage}%)</span>
          </div>
        </div>
      ))}
    </div>
  ), [data]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={data.filter(d => d.count > 0)}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={3}
              dataKey="count"
              isAnimationActive={false}
            >
              {data.filter(d => d.count > 0).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-foreground">{total}</span>
          <span className="text-[10px] text-muted-foreground">策略总数</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        {customLegend()}
      </div>
    </div>
  );
});
EffectDistributionChart.displayName = 'EffectDistributionChart';

// 区域排名组件
const RegionRankList = memo(({ title, regions, isTop }: { title: string; regions: RegionStrategyRank[]; isTop: boolean }) => {
  if (regions.length === 0) {
    return (
      <div className="flex-1">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">{title}</h4>
        <div className="text-xs text-muted-foreground py-4 text-center">当前区域无下级对比数据</div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">{title}</h4>
      <div className="space-y-2">
        {regions.map((region) => {
          const badgeClass = isTop
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
          return (
            <div key={region.name} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                  {region.rank}
                </span>
                <span className="text-sm font-medium text-foreground">{region.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${isTop ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {region.successRate}%
                </span>
                <span className={`text-[10px] ${region.change > 0 ? 'text-green-500' : region.change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {region.change > 0 ? `+${region.change}` : region.change < 0 ? `${region.change}` : '-'}pp
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
RegionRankList.displayName = 'RegionRankList';



// 主组件
interface StrategyEvaluationSummaryProps {
  selectedCityCode: string;
  selectedCityName: string;
}

export function StrategyEvaluationSummary({ selectedCityCode, selectedCityName }: StrategyEvaluationSummaryProps) {
  const mounted = useMounted();

  // 根据区域选择获取数据
  const data: StrategyEvaluationSummaryData = useMemo(() => {
    if (selectedCityCode && selectedCityName !== '全疆') {
      return regionStrategySummaryMap[selectedCityName] || strategyEvaluationSummary;
    }
    return strategyEvaluationSummary;
  }, [selectedCityCode, selectedCityName]);

  if (!mounted) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20V10M18 20V4M6 20v-4" />
              </svg>
            </div>
            <CardTitle className="text-lg">策略评估</CardTitle>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {selectedCityName === '全疆' ? '全疆' : selectedCityName}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary hover:text-primary/80"
            onClick={() => window.location.href = '/portal/capability/evaluation-center/strategy'}
          >
            进入策略评估 <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPI卡片 */}
        <div className="grid grid-cols-5 gap-3">
          {data.kpis.map((kpi) => (
            <KPICard key={kpi.label} kpi={kpi} />
          ))}
        </div>

        {/* 趋势图 + 效果分布 */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              策略执行趋势
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help inline ml-1" /></TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs p-3 text-xs space-y-1.5">
                    <p><span className="font-semibold">派发数量</span>：当月新增派发的策略笔数</p>
                    <p><span className="font-semibold">已完成数量</span>：当月执行完毕的策略笔数（含成功和未成功）</p>
                    <p><span className="font-semibold">成功率</span>：成功转化客户数 ÷ 触达客户数 × 100%（月度汇总）</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h4>
            <StrategyTrendChart data={data.monthlyTrend} />
          </div>
          <div className="col-span-2">
            <div className="flex items-center gap-1.5 mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">策略效果分布</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs p-3 text-xs space-y-1.5 bg-white border border-[#e5e7eb] shadow-lg text-[#333333]">
                    <p className="font-semibold text-foreground mb-1">统计口径</p>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-600" />高效策略：成功率 &gt; 10%</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-600" />有效策略：5% ≤ 成功率 ≤ 10%</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" />低效策略：1% ≤ 成功率 &lt; 5%</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-600" />无效策略：成功率 &lt; 1%</div>
                    <p className="text-muted-foreground pt-1">成功率 = 成功转化客户数 ÷ 触达客户数 × 100%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <EffectDistributionChart data={data.effectDistribution} />
          </div>
        </div>

        {/* 区域排名 */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            区域策略效果排名
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help inline ml-1" /></TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs p-3 text-xs space-y-1.5">
                  <p><span className="font-semibold">成功率</span>：该地市所有已执行策略的成功转化客户数 ÷ 触达客户数 × 100%</p>
                  <p><span className="font-semibold">较上月变化</span>：本月成功率 - 上月成功率，单位pp</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h4>
          <div className="flex gap-6">
            <RegionRankList title="Top 5" regions={data.topRegions} isTop={true} />
            <div className="w-px bg-border" />
            <RegionRankList title="Bottom 5" regions={data.bottomRegions} isTop={false} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
