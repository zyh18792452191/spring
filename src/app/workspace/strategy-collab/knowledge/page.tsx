'use client';

import { useState } from 'react';
import { BookOpen, FileQuestion, Library, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { KNOWLEDGE_GAPS, KNOWLEDGE_REFERENCES, type KnowledgeReference } from '../data';

export default function StrategyCollabKnowledgePage() {
  const [references, setReferences] = useState<KnowledgeReference[]>(KNOWLEDGE_REFERENCES);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [hint, setHint] = useState('');

  const handleApplyPublish = (item: KnowledgeReference) => {
    if (pendingIds.includes(item.id)) return;
    setPendingIds((prev) => [...prev, item.id]);
    setReferences((prev) => prev.map((ref) => (ref.id === item.id ? { ...ref, status: '已上架' } : ref)));
    setHint(`已将《${item.title}》提交知识中心上架申请，审核通过后策略将可直接引用该知识`);
  };

  const handleRequestReview = (title: string) => {
    setHint(`已向知识中心提交《${title}》的补充完善请求，待知识中心修订后回传审核结果`);
  };

  const publishedCount = references.filter((item) => item.status === '已上架').length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">与知识中心协作</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            策略引用知识中心的营销话术、策略案例与操作手册，并识别知识缺口，支持申请上架与请求审核。
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-md border border-border bg-muted/40 px-4 py-2">
          <div className="text-xs text-muted-foreground">
            已上架知识 <span className="ml-1 text-base font-semibold text-foreground">{publishedCount}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            待补充缺口 <span className="ml-1 text-base font-semibold text-foreground">{KNOWLEDGE_GAPS.length}</span>
          </div>
        </div>
      </div>

      {hint && (
        <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          {hint}
        </div>
      )}

      {/* 知识引用情况 */}
      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Library className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">知识引用情况</h2>
          <span className="text-xs text-muted-foreground">数据来源：知识中心知识条目 × 策略库引用关系</span>
        </header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[70px]">编号</TableHead>
              <TableHead className="min-w-[240px]">知识标题</TableHead>
              <TableHead className="min-w-[110px]">知识分类</TableHead>
              <TableHead className="min-w-[90px]">引用次数</TableHead>
              <TableHead className="min-w-[90px]">上架状态</TableHead>
              <TableHead className="min-w-[140px]">最近引用时间</TableHead>
              <TableHead className="min-w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {references.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                <TableCell className="text-sm font-medium text-foreground">{item.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.category}</Badge>
                </TableCell>
                <TableCell className="text-sm text-foreground">{item.refCount}</TableCell>
                <TableCell>
                  {item.status === '已上架' ? (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                      {pendingIds.includes(item.id) ? '待审核' : '已上架'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">未上架</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.lastRefAt}</TableCell>
                <TableCell>
                  {item.status === '已上架' ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto gap-1 p-0 text-primary"
                      onClick={() => handleApplyPublish(item)}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      申请上架
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* 知识缺口提示 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">知识缺口提示</h2>
          <span className="text-xs text-muted-foreground">被策略高频引用但尚未上架或内容不完整，需补充后审核</span>
        </div>
        {KNOWLEDGE_GAPS.map((gap) => (
          <div
            key={gap.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4"
          >
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{gap.title}</span>
                <Badge variant="secondary">引用 {gap.refCount} 次</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{gap.suggestion}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyPublish({ id: gap.id, title: gap.title, category: '策略案例', refCount: gap.refCount, status: '未上架', lastRefAt: '—' })}
              >
                申请上架
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleRequestReview(gap.title)}>
                请求审核
              </Button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}