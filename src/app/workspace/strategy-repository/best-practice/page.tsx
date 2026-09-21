'use client';

import { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Search, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { BEST_PRACTICES, type BestPractice } from '../data';

interface CategoryNode {
  name: string;
  count: number;
  children?: CategoryNode[];
}

export default function BestPracticePage() {
  const [expanded, setExpanded] = useState<string[]>(['业务场景', '策略类型']);
  const [activeScenario, setActiveScenario] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [detail, setDetail] = useState<BestPractice | null>(null);

  const tree = useMemo<CategoryNode[]>(() => {
    const scenarioMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();
    BEST_PRACTICES.forEach((item) => {
      scenarioMap.set(item.scenario, (scenarioMap.get(item.scenario) || 0) + 1);
      categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
    });
    return [
      {
        name: '业务场景',
        count: BEST_PRACTICES.length,
        children: Array.from(scenarioMap.entries()).map(([name, count]) => ({ name, count })),
      },
      {
        name: '策略类型',
        count: BEST_PRACTICES.length,
        children: Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count })),
      },
    ];
  }, []);

  const filtered = useMemo(() => {
    return BEST_PRACTICES.filter((item) => {
      const matchScenario = activeScenario === 'all' || item.scenario === activeScenario || item.category === activeScenario;
      const matchKeyword =
        !keyword.trim() || item.title.includes(keyword.trim()) || item.summary.includes(keyword.trim());
      return matchScenario && matchKeyword;
    });
  }, [activeScenario, keyword]);

  const toggleExpand = (name: string) => {
    setExpanded((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">最佳实践</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            沉淀高转化、可复用的营销策略实践，支持按业务场景与策略类型检索，为策略制定提供参考模板。
          </p>
        </div>
        <div className="relative w-[240px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索实践标题 / 摘要"
            className="h-9 pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-4">
        {/* 左侧分类树 */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div
            className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm ${
              activeScenario === 'all' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
            }`}
            onClick={() => setActiveScenario('all')}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              全部实践
            </span>
            <span className="text-xs text-muted-foreground">{BEST_PRACTICES.length}</span>
          </div>
          <Separator className="my-2" />
          {tree.map((group) => (
            <div key={group.name} className="mb-1">
              <div
                className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                onClick={() => toggleExpand(group.name)}
              >
                {expanded.includes(group.name) ? (
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                {group.name}
              </div>
              {expanded.includes(group.name) && (
                <div className="ml-4 space-y-0.5">
                  {group.children?.map((child) => (
                    <div
                      key={`${group.name}-${child.name}`}
                      className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs ${
                        activeScenario === child.name ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                      }`}
                      onClick={() => setActiveScenario(child.name)}
                    >
                      <span>{child.name}</span>
                      <span>{child.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 右侧卡片网格 */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="flex flex-col rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary">
                  {item.category}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span>场景：{item.scenario}</span>
                <span>关联策略 {item.relatedStrategies} 条</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  采纳 {item.adoptionCount} 次
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">
                  {item.author} · {item.publishedAt}
                </span>
                <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => setDetail(item)}>
                  查看详情
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              暂无符合条件的实践案例
            </div>
          )}
        </div>
      </div>

      <BestPracticeDialog record={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function BestPracticeDialog({ record, onClose }: { record: BestPractice | null; onClose: () => void }) {
  if (!record) return null;
  return (
    <Dialog open={Boolean(record)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{record.title}</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {record.category}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="leading-relaxed text-muted-foreground">{record.summary}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">业务场景</span>
              <span className="text-foreground">{record.scenario}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">关联策略</span>
              <span className="text-foreground">{record.relatedStrategies} 条</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">采纳次数</span>
              <span className="text-foreground">{record.adoptionCount} 次</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">发布时间</span>
              <span className="text-foreground">{record.publishedAt}</span>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-muted-foreground">
            数据来源：最佳实践由策略效果库中达成率与改善幅度双优的策略提炼形成，采纳次数统计策略库中引用该实践的策略数量；
            关联策略清单可在策略库中按"引用实践"筛选查看。
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              关闭
            </Button>
            <Button size="sm" onClick={() => window.open('/workspace/strategy/library', '_blank')}>
              去策略库引用
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}