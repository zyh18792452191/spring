'use client';

import { useMemo, useState } from 'react';
import { Activity, ArrowLeft, ChevronLeft, ChevronRight, Download, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import {
  EFFECT_RECORDS,
  type EffectRecord,
  type HealthLevel,
  type EffectSummary,
} from '../data';

const PAGE_SIZE = 15;

const HEALTH_META: Record<HealthLevel, { label: string; className: string }> = {
  green: { label: '健康', className: 'bg-emerald-100 text-emerald-700' },
  yellow: { label: '关注', className: 'bg-amber-100 text-amber-700' },
  red: { label: '预警', className: 'bg-red-100 text-red-700' },
};

const HEALTH_DOT: Record<HealthLevel, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
};

const SUMMARY_ITEMS: { key: keyof EffectSummary; name: string }[] = [
  { key: 'dispatchVolume', name: '下发规模' },
  { key: 'completionRate', name: '完成率' },
  { key: 'touchRate', name: '触达率' },
  { key: 'successRate', name: '成功率' },
  { key: 'aiAdoptionRate', name: 'AI采纳率' },
];

const RATE_THRESHOLDS = { green: 70, yellow: 50 };

const summaryRateLevel = (key: keyof EffectSummary, value: number): HealthLevel => {
  if (key === 'dispatchVolume') return 'green';
  if (value >= RATE_THRESHOLDS.green) return 'green';
  if (value >= RATE_THRESHOLDS.yellow) return 'yellow';
  return 'red';
};

const SCENARIOS = ['流量运营', '中高端客户运营', '离网维系', '家庭融合运营', '国际业务运营', '增量运营'];
const TIME_RANGES = ['近 7 天', '近 30 天', '近 90 天', '本季度'];

export default function StrategyEffectPage() {
  const router = useRouter();
  const [scenario, setScenario] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [health, setHealth] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<EffectRecord | null>(null);

  const filtered = useMemo(() => {
    return EFFECT_RECORDS.filter((item) => {
      const matchScenario = scenario === 'all' || item.scenarios.includes(scenario);
      const matchHealth = health === 'all' || item.health === health;
      const matchKeyword = !keyword.trim() || item.strategyName.includes(keyword.trim()) || item.strategyId.includes(keyword.trim());
      return matchScenario && matchHealth && matchKeyword;
    });
  }, [scenario, health, keyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const count = filtered.length;
    const avgReach = count ? filtered.reduce((sum, item) => sum + item.touchRate, 0) / count : 0;
    const healthy = filtered.filter((item) => item.health === 'green').length;
    const attention = filtered.filter((item) => item.health !== 'green').length;
    return { count, avgReach, healthy, attention };
  }, [filtered]);

  const handleExport = () => {
    const header = ['策略ID', '策略名称', '业务场景', '派发时间', '下发规模', '触达率', '办理率', '达成率', '改善幅度', '来源工单'];
    const rows = filtered.map((item) => [
      item.strategyId,
      item.strategyName,
      item.scenarios.join('、'),
      item.dispatchTime,
      String(item.scale),
      `${item.touchRate}%`,
      `${item.dealRate}%`,
      `${item.achievementRate}%`,
      item.improvement,
      item.workOrderId,
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `策略效果库_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-4">
      {/* 页头 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">策略效果库</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            沉淀策略派发后的执行效果与评估摘要，支持按业务场景、时间范围与健康度筛选，为策略优化与最佳实践提炼提供依据。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="w-4 h-4" />
            导出
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push('/workspace/strategy-repository/best-practice')}>
            <Activity className="w-4 h-4" />
            查看最佳实践
          </Button>
        </div>
      </div>

      {/* 统计条 */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="策略总数" value={String(stats.count)} unit="条" />
        <StatCard label="平均触达率" value={stats.avgReach.toFixed(1)} unit="%" />
        <StatCard label="健康策略" value={String(stats.healthy)} unit="条" tone="up" />
        <StatCard label="需关注策略" value={String(stats.attention)} unit="条" tone="down" />
      </div>

      {/* 筛选条 */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="relative w-[220px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="搜索策略名称 / 策略ID"
            className="h-9 pl-8"
          />
        </div>
        <Select
          value={scenario}
          onValueChange={(value) => {
            setScenario(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="业务场景" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部场景</SelectItem>
            {SCENARIOS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="时间范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部时间</SelectItem>
            {TIME_RANGES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={health}
          onValueChange={(value) => {
            setHealth(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="健康度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部健康度</SelectItem>
            <SelectItem value="green">健康</SelectItem>
            <SelectItem value="yellow">关注</SelectItem>
            <SelectItem value="red">预警</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-muted-foreground">共 {filtered.length} 条</span>
      </div>

      {/* 表格 */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[130px]">策略ID</TableHead>
              <TableHead className="min-w-[220px]">策略名称</TableHead>
              <TableHead className="min-w-[130px]">业务场景</TableHead>
              <TableHead className="min-w-[110px]">派发时间</TableHead>
              <TableHead className="min-w-[100px]">下发规模</TableHead>
              <TableHead className="min-w-[90px]">触达率</TableHead>
              <TableHead className="min-w-[90px]">办理率</TableHead>
              <TableHead className="min-w-[90px]">达成率</TableHead>
              <TableHead className="min-w-[100px]">改善幅度</TableHead>
              <TableHead className="min-w-[220px]">评估摘要</TableHead>
              <TableHead className="min-w-[150px]">来源工单</TableHead>
              <TableHead className="w-[80px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="text-xs font-mono text-muted-foreground">{item.strategyId}</TableCell>
                <TableCell className="text-sm text-foreground">{item.strategyName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{item.scenarios.join('、')}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{item.dispatchTime}</TableCell>
                <TableCell className="text-sm">{item.scale.toLocaleString()}</TableCell>
                <TableCell className="text-sm">{item.touchRate}%</TableCell>
                <TableCell className="text-sm">{item.dealRate}%</TableCell>
                <TableCell className="text-sm font-medium">{item.achievementRate}%</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 text-sm ${
                      item.improvement >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {item.improvement >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {item.improvement > 0 ? '+' : ''}
                    {item.improvement}%
                  </span>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          {SUMMARY_ITEMS.map((summaryItem) => (
                            <span
                              key={summaryItem.key}
                              className={`h-2.5 w-6 rounded-sm ${HEALTH_DOT[summaryRateLevel(summaryItem.key, item.summary[summaryItem.key])]}`}
                              aria-label={`${summaryItem.name}:${HEALTH_META[summaryRateLevel(summaryItem.key, item.summary[summaryItem.key])].label}`}
                            />
                          ))}
                          <Badge variant="secondary" className={`ml-1 text-[11px] ${HEALTH_META[item.health].className}`}>
                            {HEALTH_META[item.health].label}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="space-y-1">
                          {SUMMARY_ITEMS.map((summaryItem) => (
                            <div key={summaryItem.key} className="flex items-center justify-between gap-3 text-xs">
                              <span>{summaryItem.name}</span>
                              <span className="font-medium">
                                {summaryItem.key === 'dispatchVolume'
                                  ? item.summary.dispatchVolume.toLocaleString()
                                  : `${item.summary[summaryItem.key]}%`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-xs font-mono text-primary">{item.workOrderId}</TableCell>
                <TableCell>
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => setDetail(item)}>
                    详情
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pagedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center text-sm text-muted-foreground">
                  暂无符合条件的策略效果数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* 分页 */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground">
            第 {currentPage} / {totalPages} 页，共 {filtered.length} 条
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="h-8 gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="h-8 gap-1"
            >
              下一页
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <EffectDetailDialog record={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function StatCard({ label, value, unit, tone }: { label: string; value: string; unit: string; tone?: 'up' | 'down' }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={`text-2xl font-semibold ${
            tone === 'up' ? 'text-emerald-600' : tone === 'down' ? 'text-amber-600' : 'text-foreground'
          }`}
        >
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function EffectDetailDialog({ record, onClose }: { record: EffectRecord | null; onClose: () => void }) {
  if (!record) return null;
  return (
    <Dialog open={Boolean(record)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{record.strategyName}</span>
            <Badge variant="secondary" className={HEALTH_META[record.health].className}>
              {HEALTH_META[record.health].label}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <InfoRow label="策略ID" value={record.strategyId} mono />
            <InfoRow label="业务场景" value={record.scenarios.join('、')} />
            <InfoRow label="派发时间" value={record.dispatchTime} />
            <InfoRow label="下发规模" value={`${record.scale.toLocaleString()} 户`} />
            <InfoRow label="触达率" value={`${record.touchRate}%`} />
            <InfoRow label="办理率" value={`${record.dealRate}%`} />
            <InfoRow label="达成率" value={`${record.achievementRate}%`} />
            <InfoRow label="改善幅度" value={`${record.improvement > 0 ? '+' : ''}${record.improvement}%`} />
            <InfoRow label="来源工单" value={record.workOrderId} mono />
          </div>

          <div className="rounded-lg border border-border">
            <div className="border-b border-border bg-muted px-3 py-2 text-xs font-medium text-foreground">
              评估摘要（5 类指标健康度）
            </div>
            <div className="divide-y divide-border">
              {SUMMARY_ITEMS.map((summaryItem) => {
                const level = summaryRateLevel(summaryItem.key, record.summary[summaryItem.key]);
                return (
                  <div key={summaryItem.key} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{summaryItem.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">
                        {summaryItem.key === 'dispatchVolume'
                          ? record.summary.dispatchVolume.toLocaleString()
                          : `${record.summary[summaryItem.key]}%`}
                      </span>
                      <Badge variant="secondary" className={`text-[11px] ${HEALTH_META[level].className}`}>
                        {HEALTH_META[level].label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
            评估口径：下发规模=策略派发工单实际下发客户数；触达率=成功触达客户数/下发规模；办理率=办理客户数/成功触达客户数；
            达成率=实际办理量/策略目标量；改善幅度=本期核心指标较基期变化，正值表示指标向好。数据来源为策略调度工单执行结果与评估中心指标数据。
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
              返回列表
            </Button>
            <Button size="sm" onClick={() => window.open(`/workspace/ticket-detail?id=${record.workOrderId}`, '_blank')}>
              查看来源工单
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-foreground ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}