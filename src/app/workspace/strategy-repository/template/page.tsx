'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, FileText, Rocket, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { STRATEGY_TEMPLATES, type StrategyTemplate } from '../data';

const PAGE_SIZE = 15;

export default function StrategyTemplatePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [scenario, setScenario] = useState('all');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState<StrategyTemplate | null>(null);
  const [copiedIds, setCopiedIds] = useState<string[]>([]);

  const scenarioOptions = useMemo(() => Array.from(new Set(STRATEGY_TEMPLATES.map((item) => item.scenario))), []);
  const categoryOptions = useMemo(() => Array.from(new Set(STRATEGY_TEMPLATES.map((item) => item.category))), []);

  const filtered = useMemo(() => {
    return STRATEGY_TEMPLATES.filter((item) => {
      const matchKeyword = !keyword.trim() || item.name.includes(keyword.trim()) || item.id.toLowerCase().includes(keyword.trim().toLowerCase());
      const matchScenario = scenario === 'all' || item.scenario === scenario;
      const matchCategory = category === 'all' || item.category === category;
      return matchKeyword && matchScenario && matchCategory;
    });
  }, [keyword, scenario, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCopy = (id: string) => {
    setCopiedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">模板管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          沉淀标准化策略模板，明确模板包含的配置字段，供策略新增时一键套用，减少重复配置。
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
            placeholder="搜索模板名称 / 模板ID"
            className="h-9 pl-8"
          />
        </div>
        <select
          value={scenario}
          onChange={(event) => {
            setScenario(event.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">全部适用场景</option>
          {scenarioOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">全部分类</option>
          {categoryOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">共 {filtered.length} 个模板</span>
      </div>

      {/* 模板列表 */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[90px]">模板ID</TableHead>
              <TableHead className="min-w-[180px]">模板名称</TableHead>
              <TableHead className="min-w-[120px]">适用场景</TableHead>
              <TableHead className="min-w-[110px]">分类</TableHead>
              <TableHead className="min-w-[320px]">模板结构</TableHead>
              <TableHead className="min-w-[90px]">引用次数</TableHead>
              <TableHead className="min-w-[140px]">创建人</TableHead>
              <TableHead className="min-w-[110px]">创建时间</TableHead>
              <TableHead className="min-w-[140px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                <TableCell className="text-sm font-medium text-foreground">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.scenario}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.category}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.structure.slice(0, 4).map((field) => (
                      <Badge key={field} variant="outline" className="px-1.5 py-0 text-[11px] font-normal">
                        {field}
                      </Badge>
                    ))}
                    {item.structure.length > 4 && (
                      <span className="text-xs text-muted-foreground">等 {item.structure.length} 项</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-foreground">{item.refCount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.creator}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.createdAt}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto gap-1 p-0 text-primary"
                      onClick={() => setDetailTarget(item)}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      详情
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto gap-1 p-0 text-muted-foreground"
                      disabled={copiedIds.includes(item.id)}
                      onClick={() => handleCopy(item.id)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedIds.includes(item.id) ? '已复制' : '复制模板'}
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto gap-1 p-0 text-primary"
                      onClick={() => router.push(`/workspace/strategy/matching?template=${encodeURIComponent(item.id)}&from=template`)}
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      应用此模板
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pagedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground">
                  暂无模板
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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

      {/* 模板详情弹窗 */}
      <Dialog open={Boolean(detailTarget)} onOpenChange={(open) => !open && setDetailTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailTarget?.name}</DialogTitle>
          </DialogHeader>
          {detailTarget && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  模板ID：<span className="font-mono text-foreground">{detailTarget.id}</span>
                </div>
                <div>
                  分类：<span className="text-foreground">{detailTarget.category}</span>
                </div>
                <div>
                  适用场景：<span className="text-foreground">{detailTarget.scenario}</span>
                </div>
                <div>
                  引用次数：<span className="text-foreground">{detailTarget.refCount}</span>
                </div>
                <div>
                  创建人：<span className="text-foreground">{detailTarget.creator}</span>
                </div>
                <div>
                  创建时间：<span className="text-foreground">{detailTarget.createdAt}</span>
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-foreground">模板包含的配置字段</div>
                <div className="flex flex-wrap gap-2">
                  {detailTarget.structure.map((field, index) => (
                    <span
                      key={field}
                      className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs text-foreground"
                    >
                      {index + 1}. {field}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-md bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                使用说明：在策略库新增策略时选择该模板，系统将按上述字段顺序生成待填写的策略结构，填写完成后保存即形成一条新策略。
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setDetailTarget(null)}>
                  关闭
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}