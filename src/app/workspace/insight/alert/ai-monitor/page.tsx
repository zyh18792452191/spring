'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RotateCcw, Plus, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { BusinessSceneSelect } from './components/BusinessSceneSelect';
import { CreateAlertDialog } from './components/CreateAlertDialog';
import {
  AiMonitorRule,
  INITIAL_RULES,
  ViewMode,
  collectLeafScenes,
  formatScenePath,
} from './data';

/** 表格展示行（不汇总 = 单条规则；汇总 = 同指标/同区域合并） */
interface DisplayRow {
  key: string;
  ruleIds: string[];
  indicator: string;
  indicatorCount: number;
  scene: string[];
  granularity: string;
  scope: string;
  scopeCount: number;
  condition: string;
  accuracy: number | null;
  falseCount: number;
  totalCount: number;
  enabled: boolean;
}

const VIEW_MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'none', label: '不汇总' },
  { value: 'indicator', label: '按指标汇总' },
  { value: 'region', label: '按区域汇总' },
];

/** 叶子场景选项（筛选下拉用） */
const LEAF_SCENE_OPTIONS = collectLeafScenes().map((p) => formatScenePath(p));

/** AI 标签（紫色） */
function AiTag() {
  return (
    <Badge className="shrink-0 bg-violet-50 text-violet-600 border-violet-200 text-[10px] px-1.5 py-0">
      AI
    </Badge>
  );
}

/** 依据展示形式聚合规则行 */
function buildRows(rules: AiMonitorRule[], view: ViewMode): DisplayRow[] {
  if (view === 'none') {
    return rules.map((r) => ({
      key: r.id,
      ruleIds: [r.id],
      indicator: r.indicator,
      indicatorCount: 1,
      scene: r.scene,
      granularity: r.granularity,
      scope: r.scope,
      scopeCount: 1,
      condition: r.condition,
      accuracy: r.accuracy,
      falseCount: r.falseCount,
      totalCount: r.totalCount,
      enabled: r.enabled,
    }));
  }

  const groups = new Map<string, AiMonitorRule[]>();
  for (const r of rules) {
    const key = view === 'indicator' ? `ind:${r.indicator}` : `reg:${r.granularity}|${r.scope}`;
    const list = groups.get(key) ?? [];
    list.push(r);
    groups.set(key, list);
  }

  return Array.from(groups.entries()).map(([key, list]) => {
    const first = list[0];
    const allEnabled = list.every((r) => r.enabled);
    const avgAccuracy =
      list.every((r) => r.accuracy !== null)
        ? Math.round((list.reduce((s, r) => s + (r.accuracy ?? 0), 0) / list.length) * 10) / 10
        : null;
    if (view === 'indicator') {
      // 按指标汇总：同指标不同范围合并为一行
      return {
        key,
        ruleIds: list.map((r) => r.id),
        indicator: first.indicator,
        indicatorCount: list.length,
        scene: first.scene,
        granularity: list.every((r) => r.granularity === first.granularity) ? first.granularity : '多个',
        scope: first.scope,
        scopeCount: list.length,
        condition: first.condition,
        accuracy: avgAccuracy,
        falseCount: list.reduce((s, r) => s + r.falseCount, 0),
        totalCount: list.reduce((s, r) => s + r.totalCount, 0),
        enabled: allEnabled,
      };
    }
    // 按区域汇总：同粒度+范围下不同指标合并为一行
    return {
      key,
      ruleIds: list.map((r) => r.id),
      indicator: first.indicator,
      indicatorCount: list.length,
      scene: first.scene,
      granularity: first.granularity,
      scope: first.scope,
      scopeCount: 1,
      condition: first.condition,
      accuracy: avgAccuracy,
      falseCount: list.reduce((s, r) => s + r.falseCount, 0),
      totalCount: list.reduce((s, r) => s + r.totalCount, 0),
      enabled: allEnabled,
    };
  });
}

// ==================== 主组件 ====================

export default function AiMonitorAlertPage() {
  const router = useRouter();

  // 规则列表（新增/启停）
  const [rules, setRules] = useState<AiMonitorRule[]>(INITIAL_RULES);

  // 筛选草稿（搜索按钮应用）
  const [sceneFilter, setSceneFilter] = useState<string[] | null>(null);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  // 展示形式（即时生效）
  const [viewMode, setViewMode] = useState<ViewMode>('none');

  // 新增弹窗
  const [createOpen, setCreateOpen] = useState(false);

  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('10');

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    return rules.filter((r) => {
      if (sceneFilter && formatScenePath(r.scene) !== formatScenePath(sceneFilter)) return false;
      if (kw && !r.indicator.includes(kw) && !formatScenePath(r.scene).includes(kw)) return false;
      return true;
    });
  }, [rules, sceneFilter, keyword]);

  const rows = useMemo(() => buildRows(filtered, viewMode), [filtered, viewMode]);

  const totalPages = Math.max(1, Math.ceil(rows.length / parseInt(pageSize)));
  const paginatedRows = rows.slice(
    (currentPage - 1) * parseInt(pageSize),
    currentPage * parseInt(pageSize)
  );

  // 筛选/汇总后当前页可能越界，自动回退到有效页码
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length, totalPages]);

  const handleSearch = () => {
    setKeyword(keywordDraft.trim());
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSceneFilter(null);
    setKeywordDraft('');
    setKeyword('');
    setViewMode('none');
    setCurrentPage(1);
  };

  const handleCreate = (rule: Omit<AiMonitorRule, 'id'>) => {
    const newRule: AiMonitorRule = {
      ...rule,
      id: `rule-${Date.now()}`,
    };
    setRules((prev) => [newRule, ...prev]);
    setCreateOpen(false);
    setCurrentPage(1);
  };

  const handleToggle = (ruleIds: string[], next: boolean) => {
    setRules((prev) =>
      prev.map((r) => (ruleIds.includes(r.id) ? { ...r, enabled: next } : r))
    );
  };

  const goDetail = (id: string) => {
    router.push(`/workspace/insight/alert/ai-monitor/detail?id=${id}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-full">
      {/* 标题 */}
      <div className="px-6 pt-4 pb-1 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">AI指标监控预警</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            基于 AI 模型自动学习指标判定条件，对异动指标执行监控预警，支持人工确认是否误判
          </p>
        </div>
      </div>

      {/* 筛选区 */}
      <Card className="mx-6 my-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600 whitespace-nowrap">业务场景</span>
          <div className="w-72">
            <BusinessSceneSelect
              value={sceneFilter}
              onChange={(p) => {
                setSceneFilter(p);
                setCurrentPage(1);
              }}
              placeholder="全部业务场景"
              clearable
            />
          </div>

          <span className="text-sm text-gray-600 whitespace-nowrap">指标名称</span>
          <div className="relative">
            <Input
              value={keywordDraft}
              onChange={(e) => setKeywordDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="输入指标名称关键字"
              className="w-56 h-9 pr-8"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <span className="text-sm text-gray-600 whitespace-nowrap">展示形式</span>
          <Select
            value={viewMode}
            onValueChange={(v) => {
              setViewMode(v as ViewMode);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIEW_MODE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            onClick={handleSearch}
            className="bg-[#0085D0] hover:bg-[#006BB0] text-white h-9"
          >
            <Search className="w-4 h-4 mr-1" />
            搜索
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} className="h-9">
            <RotateCcw className="w-4 h-4 mr-1" />
            重置
          </Button>

          <div className="ml-auto">
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="bg-[#0085D0] hover:bg-[#006BB0] text-white h-9"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增
            </Button>
          </div>
        </div>
      </Card>

      {/* 表格 */}
      <Card className="mx-6 mb-4 flex-1 overflow-hidden">
        {viewMode !== 'none' && (
          <div className="px-4 pt-3 text-xs text-gray-500">
            <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
            {viewMode === 'indicator'
              ? '已按指标汇总：同一指标下的多个预警范围合并展示（预警范围列显示范围数量，数值列合计/均值）'
              : '已按区域汇总：同一预警范围内的多个指标合并展示（指标列显示指标数量，数值列合计/均值）'}
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100">
                <TableHead className="font-semibold text-gray-900 min-w-[160px]">指标名称</TableHead>
                <TableHead className="font-semibold text-gray-900 min-w-[170px]">业务场景</TableHead>
                <TableHead className="font-semibold text-gray-900 w-20">预警粒度</TableHead>
                <TableHead className="font-semibold text-gray-900 min-w-[140px]">预警范围</TableHead>
                <TableHead className="font-semibold text-gray-900 min-w-[220px]">当前判定条件</TableHead>
                <TableHead className="font-semibold text-gray-900 w-24">准确率</TableHead>
                <TableHead className="font-semibold text-gray-900 w-24">误报次数</TableHead>
                <TableHead className="font-semibold text-gray-900 w-28">总预警次数</TableHead>
                <TableHead className="font-semibold text-gray-900 w-20">状态</TableHead>
                <TableHead className="font-semibold text-gray-900 w-20">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => {
                  const grouped = row.ruleIds.length > 1;
                  return (
                    <TableRow key={row.key} className="hover:bg-gray-50">
                      <TableCell className="text-gray-900 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[140px]" title={row.indicator}>
                            {row.indicator}
                          </span>
                          {row.indicatorCount > 1 && viewMode === 'region' && (
                            <Badge variant="secondary" className="shrink-0 text-xs bg-blue-50 text-blue-600">
                              共{row.indicatorCount}个指标
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm max-w-[180px] truncate" title={formatScenePath(row.scene)}>
                        {formatScenePath(row.scene)}
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm">{row.granularity}</TableCell>
                      <TableCell className="text-gray-700 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[120px]" title={row.scope}>
                            {row.scope}
                          </span>
                          {row.scopeCount > 1 && viewMode === 'indicator' && (
                            <Badge variant="secondary" className="shrink-0 text-xs bg-blue-50 text-blue-600">
                              共{row.scopeCount}个范围
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <AiTag />
                          <span
                            className={cn(
                              'truncate',
                              row.condition.includes('待首次运行') ? 'text-gray-400' : 'text-gray-700'
                            )}
                            title={row.condition}
                          >
                            {row.condition}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {row.accuracy === null ? (
                          <span className="text-gray-300">—</span>
                        ) : (
                          `${row.accuracy}%`
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">{row.falseCount}</TableCell>
                      <TableCell className="text-sm text-gray-700">{row.totalCount}</TableCell>
                      <TableCell>
                        <Switch
                          checked={row.enabled}
                          onCheckedChange={(next) => handleToggle(row.ruleIds, next)}
                          aria-label="启用状态"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          className="text-[#0085D0] hover:text-[#006BB0] p-0 h-auto text-sm"
                          onClick={() => goDetail(grouped ? row.ruleIds[0] : row.key)}
                          title={grouped ? '查看该组首条规则详情' : '查看详情'}
                        >
                          详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-16 text-gray-400">
                    暂无数据，请调整筛选条件或点击「新增」创建预警规则
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 分页 */}
      <div className="px-6 pb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">共 {rows.length} 项数据</div>
        <div className="flex items-center gap-2">
          <Select
            value={pageSize}
            onValueChange={(v) => {
              setPageSize(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
              <SelectItem value="10">10条/页</SelectItem>
              <SelectItem value="20">20条/页</SelectItem>
              <SelectItem value="50">50条/页</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="w-9 h-9"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <Button
                key={pageNum}
                variant="outline"
                className={cn(
                  'w-9 h-9',
                  currentPage === pageNum && 'bg-[#0085D0] text-white border-[#0085D0] hover:bg-[#006BB0]'
                )}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="icon"
            className="w-9 h-9"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 新增弹窗 */}
      <CreateAlertDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
    </div>
  );
}
