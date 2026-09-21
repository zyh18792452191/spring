'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, GitCompare, History, RotateCcw, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { STRATEGY_VERSIONS, type StrategyVersion } from '../data';

const PAGE_SIZE = 15;

const SNAPSHOT_FIELDS: { key: keyof StrategyVersion['snapshot']; label: string }[] = [
  { key: 'scenario', label: '适用场景' },
  { key: 'content', label: '策略内容' },
  { key: 'products', label: '推荐产品' },
  { key: 'script', label: '营销话术' },
];

export default function StrategyVersionPage() {
  const [keyword, setKeyword] = useState('');
  const [changedBy, setChangedBy] = useState('all');
  const [page, setPage] = useState(1);

  const [compareTarget, setCompareTarget] = useState<StrategyVersion | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<StrategyVersion | null>(null);
  const [rollbackDone, setRollbackDone] = useState<string[]>([]);

  const changedByOptions = useMemo(
    () => Array.from(new Set(STRATEGY_VERSIONS.map((item) => item.changedBy))),
    [],
  );

  const filtered = useMemo(() => {
    return STRATEGY_VERSIONS.filter((item) => {
      const matchKeyword =
        !keyword.trim() ||
        item.strategyName.includes(keyword.trim()) ||
        item.strategyId.toLowerCase().includes(keyword.trim().toLowerCase());
      const matchOperator = changedBy === 'all' || item.changedBy === changedBy;
      return matchKeyword && matchOperator;
    });
  }, [keyword, changedBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 同一策略的上一个版本（用于左右对比）
  const previousVersion = useMemo(() => {
    if (!compareTarget) return null;
    const sameStrategy = STRATEGY_VERSIONS.filter((item) => item.strategyId === compareTarget.strategyId);
    const index = sameStrategy.findIndex((item) => item.id === compareTarget.id);
    return index >= 0 && index < sameStrategy.length - 1 ? sameStrategy[index + 1] : null;
  }, [compareTarget]);

  const handleRollback = () => {
    if (!rollbackTarget) return;
    setRollbackDone((prev) => (prev.includes(rollbackTarget.id) ? prev : [...prev, rollbackTarget.id]));
    setRollbackTarget(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">策略版本</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          记录策略内容的每一次变更，支持版本对比与一键回滚，保障策略调整可追溯、可恢复。
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-[260px]">
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
        <select
          value={changedBy}
          onChange={(event) => {
            setChangedBy(event.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">全部变更人</option>
          {changedByOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">共 {filtered.length} 条版本记录</span>
      </div>

      {/* 版本列表 */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[90px]">版本号</TableHead>
              <TableHead className="min-w-[120px]">策略ID</TableHead>
              <TableHead className="min-w-[200px]">策略名称</TableHead>
              <TableHead className="min-w-[280px]">变更摘要</TableHead>
              <TableHead className="min-w-[100px]">变更人</TableHead>
              <TableHead className="min-w-[140px]">变更时间</TableHead>
              <TableHead className="min-w-[160px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {item.version}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.strategyId}</TableCell>
                <TableCell className="max-w-[240px] truncate text-sm text-foreground">{item.strategyName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.changeSummary}</TableCell>
                <TableCell className="text-sm text-foreground">{item.changedBy}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.changedAt}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto gap-1 p-0 text-primary"
                      onClick={() => setCompareTarget(item)}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      版本对比
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto gap-1 p-0 text-muted-foreground"
                      disabled={rollbackDone.includes(item.id)}
                      onClick={() => setRollbackTarget(item)}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {rollbackDone.includes(item.id) ? '已回滚' : '回滚'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pagedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  暂无版本记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* 分页 */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <span>
              共 {filtered.length} 条 · 第 {page}/{totalPages} 页
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 版本对比弹窗 */}
      <Dialog open={Boolean(compareTarget)} onOpenChange={(open) => !open && setCompareTarget(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-primary" />
              版本对比 · {compareTarget?.strategyName}
            </DialogTitle>
          </DialogHeader>
          {compareTarget && (
            <div className="space-y-3 text-sm">
              <div className="text-xs text-muted-foreground">
                变更摘要：{compareTarget.changeSummary} · {compareTarget.changedBy} {compareTarget.changedAt}
              </div>
              {!previousVersion && (
                <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                  该版本为首个版本，无可对比的历史版本，以下展示当前版本内容快照。
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border">
                  <div className="border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium text-foreground">
                    当前版本 {compareTarget.version}
                  </div>
                  <div className="space-y-3 p-3">
                    {SNAPSHOT_FIELDS.map((field) => (
                      <div key={field.key}>
                        <div className="text-xs text-muted-foreground">{field.label}</div>
                        <div className="mt-0.5 text-sm leading-relaxed text-foreground">
                          {compareTarget.snapshot[field.key]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border">
                  <div className="border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium text-foreground">
                    {previousVersion ? `上一版本 ${previousVersion.version}` : '无历史版本'}
                  </div>
                  <div className="space-y-3 p-3">
                    {previousVersion ? (
                      SNAPSHOT_FIELDS.map((field) => {
                        const changed = previousVersion.snapshot[field.key] !== compareTarget.snapshot[field.key];
                        return (
                          <div key={field.key}>
                            <div className="text-xs text-muted-foreground">{field.label}</div>
                            <div
                              className={`mt-0.5 rounded px-1 text-sm leading-relaxed ${
                                changed ? 'bg-amber-50 text-amber-700' : 'text-foreground'
                              }`}
                            >
                              {previousVersion.snapshot[field.key]}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-muted-foreground">—</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-xs leading-relaxed text-muted-foreground">
                对比规则：逐字段比对两个版本的快照内容，存在差异的字段以高亮标识；版本快照由策略库每次保存时自动生成。
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setCompareTarget(null)}>
                  关闭
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 回滚确认弹窗 */}
      <Dialog open={Boolean(rollbackTarget)} onOpenChange={(open) => !open && setRollbackTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              回滚确认
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              确认将策略「{rollbackTarget?.strategyName}」（{rollbackTarget?.strategyId}）回滚至版本{' '}
              <span className="font-mono text-foreground">{rollbackTarget?.version}</span>？
            </p>
            <div className="rounded-md bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
              回滚后将使用该版本快照覆盖当前策略内容，并自动生成一条新的版本记录；已派发工单不受影响。
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setRollbackTarget(null)}>
                取消
              </Button>
              <Button size="sm" onClick={handleRollback}>
                确认回滚
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}