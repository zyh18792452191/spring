'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, ClipboardCheck, Rocket, Search, Star, TrendingDown, TrendingUp, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { BEST_PRACTICES, FINAL_APPROVER, REVIEWER_ROUTING, type BestPractice, type ReviewRecord } from '../data';

interface CategoryNode {
  name: string;
  count: number;
  children?: CategoryNode[];
}

/** 评审状态 → 展示标签（显式状态，由评审动作驱动） */
function statusMeta(status: BestPractice['reviewStatus']): { label: string; className: string } {
  switch (status) {
    case 'published': return { label: '已发布', className: 'bg-emerald-100 text-emerald-700' };
    case 'reviewing': return { label: '评审中', className: 'bg-amber-100 text-amber-700' };
    case 'candidate': return { label: '候选', className: 'bg-blue-100 text-blue-700' };
    case 'archived': return { label: '已归档', className: 'bg-muted text-muted-foreground' };
  }
}

/** 格式化当前时间（评审记录时间戳） */
function nowString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BestPracticePage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string[]>(['业务场景', '策略类型']);
  const [activeScenario, setActiveScenario] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [detail, setDetail] = useState<BestPractice | null>(null);
  const [practices, setPractices] = useState<BestPractice[]>(BEST_PRACTICES);
  const [reviewTarget, setReviewTarget] = useState<BestPractice | null>(null);

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
    return practices.filter((item) => {
      const matchScenario = activeScenario === 'all' || item.scenario === activeScenario || item.category === activeScenario;
      const matchKeyword =
        !keyword.trim() || item.title.includes(keyword.trim()) || item.summary.includes(keyword.trim());
      return matchScenario && matchKeyword;
    });
  }, [activeScenario, keyword, practices]);

  const toggleExpand = (name: string) => {
    setExpanded((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
  };

  const submitReview = (id: string, result: 'approve' | 'reject', opinion: string) => {
    setPractices((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const route = REVIEWER_ROUTING[p.scenario] ?? FINAL_APPROVER;
        const record: ReviewRecord = {
          reviewer: route.reviewer,
          role: route.role,
          result,
          opinion: opinion.trim() || (result === 'approve' ? '同意发布' : '退回候选'),
          at: nowString(),
        };
        return {
          ...p,
          reviewStatus: result === 'approve' ? 'published' : 'candidate',
          reviewRecords: [...p.reviewRecords, record],
        };
      }),
    );
    setReviewTarget(null);
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

      {/* 入选标准 + 名次盯控 */}
      <div className="grid grid-cols-[1fr_260px] gap-3">
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">入选标准：</span>
          策略效果库中「达成率 ≥ 80% 且 改善幅度 ≥ 3%」的策略经 AI 复盘提炼为最佳实践，进入
          <span className="mx-1 rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">候选</span>→
          <span className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">评审中</span>→
          <span className="mx-1 rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">已发布</span>
          生命周期，低采纳且长期未更新的实践自动归档。
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs font-medium text-foreground mb-2">名次盯控</div>
          {(() => {
            const sorted = [...BEST_PRACTICES].sort((a, b) => b.adoptionCount - a.adoptionCount);
            const top = sorted[0];
            const bottom = sorted[sorted.length - 1];
            return (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-600"><TrendingUp className="w-3.5 h-3.5" />TOP1</span>
                  <span className="text-foreground">{top.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-red-500"><TrendingDown className="w-3.5 h-3.5" />末尾</span>
                  <span className="text-foreground">{bottom.title}</span>
                </div>
              </div>
            );
          })()}
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
                <div className="flex shrink-0 items-center gap-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {item.category}
                  </Badge>
                  {(() => {
                    const sm = statusMeta(item.reviewStatus);
                    return <Badge variant="outline" className={`border-0 ${sm.className}`}>{sm.label}</Badge>;
                  })()}
                </div>
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
                <div className="flex items-center gap-1">
                  {(item.reviewStatus === 'candidate' || item.reviewStatus === 'reviewing') && (
                    <Button variant="link" size="sm" className="h-auto gap-1 p-0 text-primary" onClick={() => setReviewTarget(item)}>
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      评审
                    </Button>
                  )}
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => setDetail(item)}>
                    查看详情
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto gap-1 p-0 text-primary"
                    onClick={() => router.push(`/workspace/strategy/matching?template=${encodeURIComponent(item.id)}&from=best-practice`)}
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    一键复用
                  </Button>
                </div>
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

      <BestPracticeDialog record={detail} onClose={() => setDetail(null)} onReview={(item) => { setDetail(null); setReviewTarget(item); }} />
      <ReviewDialog key={reviewTarget?.id ?? 'empty'} record={reviewTarget} onClose={() => setReviewTarget(null)} onSubmit={submitReview} />
    </div>
  );
}

function BestPracticeDialog({ record, onClose, onReview }: { record: BestPractice | null; onClose: () => void; onReview: (item: BestPractice) => void }) {
  if (!record) return null;
  const sm = statusMeta(record.reviewStatus);
  return (
    <Dialog open={Boolean(record)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{record.title}</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {record.category}
            </Badge>
            <Badge variant="outline" className={`border-0 ${sm.className}`}>{sm.label}</Badge>
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
              <span className="text-muted-foreground">达成率</span>
              <span className="text-foreground">{record.achievementRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">改善幅度</span>
              <span className="text-foreground">+{record.improvement}pp</span>
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
          {record.reviewRecords.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-foreground">评审记录</div>
              {record.reviewRecords.map((r, i) => (
                <div key={i} className="rounded-lg border border-border p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{r.reviewer}</span>
                    <span className="text-muted-foreground">{r.role}</span>
                    {r.result === 'approve'
                      ? <Badge variant="outline" className="border-0 bg-emerald-100 text-emerald-700">通过</Badge>
                      : <Badge variant="outline" className="border-0 bg-red-100 text-red-700">驳回</Badge>}
                    <span className="ml-auto text-muted-foreground">{r.at}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{r.opinion}</p>
                </div>
              ))}
            </div>
          )}
          <div className="text-xs leading-relaxed text-muted-foreground">
            数据来源：最佳实践由策略效果库中达成率与改善幅度双优的策略提炼形成，采纳次数统计策略库中引用该实践的策略数量；
            关联策略清单可在策略库中按"引用实践"筛选查看。
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              关闭
            </Button>
            {(record.reviewStatus === 'candidate' || record.reviewStatus === 'reviewing') && (
              <Button size="sm" onClick={() => onReview(record)}>
                <ClipboardCheck className="mr-1 h-3.5 w-3.5" />
                评审
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => window.open('/workspace/strategy/library', '_blank')}>
              去策略库引用
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReviewDialog({ record, onClose, onSubmit }: { record: BestPractice | null; onClose: () => void; onSubmit: (id: string, result: 'approve' | 'reject', opinion: string) => void }) {
  const [result, setResult] = useState<'approve' | 'reject'>('approve');
  const [opinion, setOpinion] = useState('');

  if (!record) return null;
  const route = REVIEWER_ROUTING[record.scenario] ?? FINAL_APPROVER;
  const sm = statusMeta(record.reviewStatus);

  return (
    <Dialog open={Boolean(record)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>评审最佳实践</span>
            <Badge variant="outline" className={`border-0 ${sm.className}`}>{sm.label}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <div className="font-medium text-foreground">{record.title}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="bg-primary/10 text-primary">{record.category}</Badge>
              <span>场景：{record.scenario}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center">
            <div>
              <div className="text-lg font-semibold text-foreground">{record.achievementRate}%</div>
              <div className="text-xs text-muted-foreground">达成率</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">+{record.improvement}pp</div>
              <div className="text-xs text-muted-foreground">改善幅度</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{record.adoptionCount}</div>
              <div className="text-xs text-muted-foreground">采纳次数</div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">当前评审人</span>
              <span className="text-foreground">{route.reviewer}（{route.role}）</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">审定发布</span>
              <span className="text-foreground">{FINAL_APPROVER.reviewer}（{FINAL_APPROVER.role}）</span>
            </div>
          </div>

          {record.reviewRecords.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-foreground">历史评审记录</div>
              {record.reviewRecords.map((r, i) => (
                <div key={i} className="rounded-lg border border-border p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{r.reviewer}</span>
                    <span className="text-muted-foreground">{r.role}</span>
                    {r.result === 'approve'
                      ? <Badge variant="outline" className="border-0 bg-emerald-100 text-emerald-700">通过</Badge>
                      : <Badge variant="outline" className="border-0 bg-red-100 text-red-700">驳回</Badge>}
                    <span className="ml-auto text-muted-foreground">{r.at}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{r.opinion}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label>评审结论</Label>
            <RadioGroup value={result} onValueChange={(v) => setResult(v === 'reject' ? 'reject' : 'approve')} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="approve" id="review-approve" />
                <Label htmlFor="review-approve" className="cursor-pointer font-normal">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />通过（发布）
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="reject" id="review-reject" />
                <Label htmlFor="review-reject" className="cursor-pointer font-normal">
                  <XCircle className="h-4 w-4 text-red-500" />驳回（退回候选）
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>评审意见</Label>
            <Textarea
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              placeholder={result === 'approve' ? '说明通过理由，如达成率与改善幅度双优、可复制性等' : '说明驳回原因及改进建议'}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
            <Button size="sm" onClick={() => onSubmit(record.id, result, opinion)}>提交评审</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}