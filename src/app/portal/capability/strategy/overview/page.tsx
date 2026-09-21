'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  BarChart3,
  Lightbulb,
  Users,
  UserCheck,
  ClipboardList,
  Send,
  UsersRound,
  PhoneCall,
  CheckCircle,
  Download,
  CalendarRange,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useMounted } from '@/hooks/useMounted';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ===== 日期区间工具 =====
const ANCHOR_END = '2026-06-15';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function shiftDays(base: string, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

function buildSeries(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || s > e) return [];
  const out: string[] = [];
  const cur = new Date(s);
  let guard = 0;
  while (cur <= e && guard < 120) {
    out.push(`${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
    guard += 1;
  }
  return out;
}

// 确定性种子：保证同一区间数据稳定（避免渲染抖动）
function seedOf(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

function formatNum(v: number, decimals: number) {
  return v.toFixed(decimals);
}

// ===== 统计卡口径（以 14 天为基准，按所选区间天数换算）=====
const STAT_META = [
  { key: 'scenarioCount', label: '指标场景', base: 6, unit: '个', decimals: 0, icon: FileText },
  { key: 'indicatorCount', label: '指标总数', base: 42, unit: '个', decimals: 0, icon: BarChart3 },
  { key: 'suggestionCount', label: '策略建议总数', base: 126, unit: '个', decimals: 0, icon: Lightbulb },
  { key: 'customerGroupCount', label: '客群总数', base: 18, unit: '个', decimals: 0, icon: Users },
  { key: 'coverageUserScale', label: '覆盖用户总规模', base: 268.4, unit: '万', decimals: 1, icon: UserCheck },
  { key: 'taskCount', label: '策略推荐任务总数', base: 1000, unit: '个', decimals: 0, icon: ClipboardList },
  { key: 'dispatchCount', label: '策略推荐下发总数', base: 687, unit: '个', decimals: 0, icon: Send },
  { key: 'dispatchUserScale', label: '策略推荐下发用户总规模', base: 154.61, unit: '万', decimals: 2, icon: UsersRound },
  { key: 'contactCount', label: '策略推荐下发用户总接触量', base: 18.07, unit: '万', decimals: 2, icon: PhoneCall },
  { key: 'handleCount', label: '下发用户总办理量', base: 168, unit: '个', decimals: 0, icon: CheckCircle },
];

// ===== 趋势图口径 =====
const TREND_META = [
  { key: 'indicator', title: '指标总数（个）', base: 42, decimals: 0 },
  { key: 'suggestion', title: '策略建议总数（个）', base: 126, decimals: 0 },
  { key: 'customerGroup', title: '客群总数（个）', base: 18, decimals: 0 },
  { key: 'coverageUser', title: '覆盖用户总规模（万）', base: 268.4, decimals: 1 },
  { key: 'contact', title: '策略推荐接触数（个）', base: 1807, decimals: 0 },
  { key: 'handle', title: '策略推荐办理量（个）', base: 168, decimals: 0 },
];

const SCENARIO_OPTIONS = [
  { value: 'all', label: '全部业务场景' },
  { value: 'churn', label: '离网维系' },
  { value: 'highvalue', label: '中高端客户运营' },
  { value: 'family', label: '家庭运营' },
  { value: 'traffic', label: '流量运营' },
  { value: 'international', label: '国际业务运营' },
];

const RANGE_PRESETS = [
  { value: '7', label: '近 7 天' },
  { value: '14', label: '近 14 天' },
  { value: '30', label: '近 30 天' },
  { value: 'custom', label: '自定义区间' },
];

export default function StrategyOverviewPage() {
  const [scenario, setScenario] = useState<string>('all');
  const [preset, setPreset] = useState<string>('custom');
  const [dateFrom, setDateFrom] = useState('2026-06-08');
  const [dateTo, setDateTo] = useState(ANCHOR_END);
  const mounted = useMounted();

  const { stats, charts, dayCount } = useMemo(() => {
    const series = buildSeries(dateFrom, dateTo);
    const days = Math.max(series.length, 1);
    const factor = days / 14;
    // 选定某业务场景时，展示该场景子集数据
    const scopeFactor = scenario === 'all' ? 1 : 0.62;

    const statList = STAT_META.map((m) => ({
      ...m,
      value: formatNum(m.base * factor * scopeFactor, m.decimals),
    }));

    const chartList = TREND_META.map((m) => {
      const daily = (m.base / days) * scopeFactor;
      const seed = seedOf(`${m.key}-${dateFrom}-${dateTo}-${scenario}`);
      const data = series.map((label, i) => ({
        date: label,
        本时间段: Number(
          (daily * (0.85 + 0.3 * Math.abs(Math.sin((seed % 7) + i * 0.8)))).toFixed(m.decimals),
        ),
        上时间段: Number(
          (daily * 0.88 * (0.85 + 0.3 * Math.abs(Math.cos((seed % 5) + i * 0.7)))).toFixed(m.decimals),
        ),
      }));
      return { key: m.key, title: m.title, data };
    });

    return { stats: statList, charts: chartList, dayCount: days };
  }, [dateFrom, dateTo, scenario]);

  if (!mounted) return null;

  const scenarioLabel = SCENARIO_OPTIONS.find((s) => s.value === scenario)?.label ?? '全部业务场景';

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value === 'custom') return;
    const days = Number(value);
    setDateTo(ANCHOR_END);
    setDateFrom(shiftDays(ANCHOR_END, -(days - 1)));
  };

  const handleExport = () => {
    const rows: string[][] = [
      ['策略总览 - 导出数据'],
      ['统计区间', `${dateFrom} 至 ${dateTo}`, '区间天数', String(dayCount)],
      ['业务场景', scenarioLabel],
      [],
      ['统计指标', '数值', '单位'],
      ...stats.map((s) => [s.label, s.value, s.unit]),
      [],
      ['趋势指标', '日期', '本时间段', '上时间段'],
    ];
    charts.forEach((c) => {
      c.data.forEach((d) => {
        rows.push([c.title, String(d.date), String(d.本时间段), String(d.上时间段)]);
      });
    });
    const csv = rows.map((r) => r.map((c) => `"${c ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `策略总览_${dateFrom}_${dateTo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4">
      {/* 面包屑 */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/portal/capability/dispatch/overview">能力中心</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/portal/capability/strategy/overview">策略中心</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>策略总览</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* 顶部筛选栏：业务场景 + 统计区间 + 导出 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger className="w-[180px] h-8 bg-white text-sm">
              <SelectValue placeholder="选择业务场景" />
            </SelectTrigger>
            <SelectContent>
              {SCENARIO_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[140px] h-8 bg-white text-sm">
              <SelectValue placeholder="统计区间" />
            </SelectTrigger>
            <SelectContent>
              {RANGE_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 bg-white rounded px-3 h-8 text-sm border">
            <CalendarRange size={14} className="text-muted-foreground" />
            <input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPreset('custom');
              }}
              className="h-6 bg-transparent text-foreground outline-none text-sm"
            />
            <span className="text-muted-foreground">至</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPreset('custom');
              }}
              className="h-6 bg-transparent text-foreground outline-none text-sm"
            />
            <span className="text-xs text-muted-foreground">共 {dayCount} 天</span>
          </div>
        </div>

        <Button variant="outline" size="sm" className="h-8 bg-white" onClick={handleExport}>
          <Download size={14} className="mr-1" />
          导出
        </Button>
      </div>

      {/* 策略统计卡片 - 2行×5列 */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {stats.map((stat) => {
          const IconComp = stat.icon;
          return (
            <Card key={stat.key} className="bg-white border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                  <IconComp size={18} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground truncate">{stat.label}</div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-semibold text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.unit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 趋势图表 - 3行×2列 */}
      <div className="grid grid-cols-2 gap-3">
        {charts.map((chart) => (
          <Card key={chart.key} className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-foreground mb-3">{chart.title}</div>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart.data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`fillCurrent-${chart.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1677FF" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1677FF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id={`fillLast-${chart.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C0C0C0" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#C0C0C0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#999' }}
                      axisLine={{ stroke: '#e8e8e8' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#999' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 6,
                        border: '1px solid #e8e8e8',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="line"
                      wrapperStyle={{ fontSize: 11, marginBottom: 4 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="本时间段"
                      stroke="#1677FF"
                      strokeWidth={2}
                      fill={`url(#fillCurrent-${chart.key})`}
                      dot={false}
                      activeDot={{ r: 3, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="上时间段"
                      stroke="#C0C0C0"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      fill={`url(#fillLast-${chart.key})`}
                      dot={false}
                      activeDot={{ r: 3, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
