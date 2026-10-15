'use client';

import { useState } from 'react';
import { Library, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import SpeechSelector from './SpeechSelector';
import { AI_SPEECH_TEMPLATES, type SpeechItem } from '@/data/speech-library';

export type SpeechSource = 'manual' | 'ai' | 'library';

interface MarketingSpeechEditorProps {
  scenario?: string;
  value: string;
  source: SpeechSource;
  onChange: (speech: string, source: SpeechSource) => void;
}

// 营销话术编辑区：文本输入 + AI 推荐 + 已有话术，供策略制定 / 新建策略复用
export default function MarketingSpeechEditor({
  scenario = '流量运营',
  value,
  source,
  onChange,
}: MarketingSpeechEditorProps) {
  const [showAiSpeech, setShowAiSpeech] = useState(false);
  const [speechSelectorOpen, setSpeechSelectorOpen] = useState(false);

  const aiTemplates = AI_SPEECH_TEMPLATES[scenario] ?? AI_SPEECH_TEMPLATES['流量运营'];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Wand2 className="h-3.5 w-3.5" /> 营销话术
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" onClick={() => setShowAiSpeech((v) => !v)}>
            <Wand2 className="mr-1 h-3.5 w-3.5" /> AI 推荐
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSpeechSelectorOpen(true)}>
            <Library className="mr-1 h-3.5 w-3.5" /> 已有话术
          </Button>
        </div>
      </div>

      {/* AI 推荐话术列表 */}
      {showAiSpeech && (
        <div className="mb-2 space-y-1.5 rounded-md border border-violet-200 bg-violet-50/50 p-2">
          <div className="text-xs font-medium text-violet-700">AI 推荐话术（点击填入）</div>
          {aiTemplates.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange(t, 'ai');
                setShowAiSpeech(false);
              }}
              className="block w-full rounded-md bg-white px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-violet-50"
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value, 'manual')}
        rows={3}
        placeholder="请输入话术内容，或点击 AI 推荐 / 已有话术填入"
      />
      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <span>话术来源：</span>
        <Badge variant="outline">
          {source === 'manual' ? '自主输入' : source === 'ai' ? 'AI 推荐' : '已有话术'}
        </Badge>
      </div>

      {/* 已有话术选择弹窗 */}
      <SpeechSelector
        open={speechSelectorOpen}
        onOpenChange={setSpeechSelectorOpen}
        onSelect={(item: SpeechItem) => onChange(item.content, 'library')}
        defaultScenario={scenario}
      />
    </div>
  );
}
