'use client';

import { useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SPEECH_LIBRARY, SPEECH_SCENARIOS, type SpeechItem } from '@/data/speech-library';

interface SpeechSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (speech: SpeechItem) => void;
  defaultScenario?: string;
}

export default function SpeechSelector({
  open,
  onOpenChange,
  onSelect,
  defaultScenario,
}: SpeechSelectorProps) {
  const [scenario, setScenario] = useState<string>(defaultScenario || '全部');
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    return SPEECH_LIBRARY.filter((s) => {
      const matchScenario = scenario === '全部' || s.scenario === scenario;
      const matchKeyword =
        !keyword.trim() || s.title.includes(keyword.trim()) || s.content.includes(keyword.trim());
      return matchScenario && matchKeyword;
    });
  }, [scenario, keyword]);

  const handleSelect = (speech: SpeechItem) => {
    onSelect(speech);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>选择已有话术</DialogTitle>
          <DialogDescription>
            话术来源于活动执行结果的沉淀，按运营场景分类管理
          </DialogDescription>
        </DialogHeader>

        {/* 场景筛选 + 搜索 */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setScenario('全部')}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                scenario === '全部'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              全部
            </button>
            {SPEECH_SCENARIOS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScenario(s)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  scenario === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索话术标题或内容"
              className="pl-9"
            />
          </div>
        </div>

        {/* 话术列表 */}
        <div className="-mr-2 flex-1 space-y-2 overflow-y-auto pr-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Search className="mb-2 h-8 w-8" />
              <p className="text-sm">未找到匹配的话术</p>
            </div>
          ) : (
            filtered.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-border p-3 transition-colors hover:border-primary/40"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{s.title}</span>
                    <Badge variant="secondary">{s.scenario}</Badge>
                    <Badge variant="outline">{s.channel}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">转化率 {s.conversionRate}</span>
                    <Button size="sm" onClick={() => handleSelect(s)}>
                      选择
                    </Button>
                  </div>
                </div>
                <p className="mb-1.5 text-sm leading-relaxed text-muted-foreground">{s.content}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  <span>沉淀自：{s.source}</span>
                  <span>·</span>
                  <span>{s.updatedAt}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
