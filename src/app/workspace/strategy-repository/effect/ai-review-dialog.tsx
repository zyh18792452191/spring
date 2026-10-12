'use client';

import { BookOpen, RefreshCw, Save, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { EffectRecord } from '../data';

/** AI 复盘弹窗：输入效果数据，产出复盘结论 + 模板候选，支持沉淀知识库 */
export default function AiReviewDialog({
  record,
  onClose,
}: {
  record: EffectRecord | null;
  onClose: () => void;
}) {
  const [saved, setSaved] = useState(false);
  if (!record) return null;

  const reviewReport = {
    conclusion: `${record.strategyName} 本期触达率 ${record.touchRate}%、办理率 ${record.dealRate}%、达成率 ${record.achievementRate}%，整体达成${record.achievementRate >= 70 ? '良好' : '一般'}，改善幅度 ${record.improvement > 0 ? '+' : ''}${record.improvement}%。`,
    attributions: [
      '客群圈选精准度较高，触达响应率优于同类策略均值',
      '短信+外呼双触达组合在首波放量阶段贡献了主要转化',
      '月末账期前集中触达有效拉动了临门一脚办理',
    ],
    reusable: [
      '客群标签组合逻辑可直接复用至同场景活动',
      '权益告知话术模板转化率稳定，建议沉淀为话术模板',
      '双触达+账期节奏可提炼为标准化执行 SOP',
    ],
    improvements: [
      '次波触达对未响应客群的话术可进一步个性化',
      '建议增加企微渠道触达，覆盖短信退订客户',
    ],
    templateCandidates: ['中低端客户升档攻坚模板', '权益告知话术模板'],
    relationStrength: '0.87',
  };

  return (
    <Dialog open={Boolean(record)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 复盘报告
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground mb-1">复盘对象</div>
            <div className="font-medium text-foreground">{record.strategyName}</div>
            <div className="text-xs text-muted-foreground mt-1">{record.strategyId} · 来源活动 {record.workOrderId}</div>
          </div>

          <div>
            <div className="text-xs font-medium text-foreground mb-1">成效结论</div>
            <p className="text-muted-foreground">{reviewReport.conclusion}</p>
          </div>

          <div>
            <div className="text-xs font-medium text-foreground mb-1">关键归因</div>
            <ul className="space-y-1 text-muted-foreground list-disc pl-4">
              {reviewReport.attributions.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>

          <div>
            <div className="text-xs font-medium text-foreground mb-1">可复用要点</div>
            <ul className="space-y-1 text-muted-foreground list-disc pl-4">
              {reviewReport.reusable.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>

          <div>
            <div className="text-xs font-medium text-foreground mb-1">改进建议</div>
            <ul className="space-y-1 text-muted-foreground list-disc pl-4">
              {reviewReport.improvements.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-foreground">模板候选：</div>
            {reviewReport.templateCandidates.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
            <span className="text-xs text-muted-foreground">关联强度更新：</span>
            <span className="text-sm font-semibold text-primary">{reviewReport.relationStrength}</span>
            <span className="text-xs text-muted-foreground">（相似策略智能推荐依据）</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => setSaved(true)}>
            <Save className="h-4 w-4 mr-1" />
            {saved ? '已存为模板' : '存为模板'}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            生成新版本
          </Button>
          <Button size="sm" onClick={onClose}>
            <BookOpen className="h-4 w-4 mr-1" />
            沉淀至知识库
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
