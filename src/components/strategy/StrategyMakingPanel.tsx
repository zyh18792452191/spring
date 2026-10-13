'use client';

import { useState } from 'react';
import { Check, Library, Plus, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SpeechSelector from './SpeechSelector';
import { AI_SPEECH_TEMPLATES, type SpeechItem } from '@/data/speech-library';

interface StrategyPlan {
  id: string;
  name: string;
  targetGroup: string;
  product: string;
  channel: string;
  speech: string;
  conversion: string;
  recommended: boolean;
  reason: string;
}

interface StrategyMakingPanelProps {
  scenario?: string; // 运营场景（用于话术库筛选 + AI 推荐模板）
  onNewStrategy?: () => void; // 点击「新建策略」触发（父组件打开新建活动弹窗）
  onConfirm?: (data: {
    plan: string;
    speech: string;
    speechSource: 'manual' | 'ai' | 'library';
  }) => void;
}

const PLAN_OPTIONS: StrategyPlan[] = [
  {
    id: 'A',
    name: '方案 A · 升档礼包',
    targetGroup: '流量超套中高端客户',
    product: '5G 流量升档包',
    channel: '短信 + 外呼',
    speech: '您好，您本月流量使用已接近套餐上限，升级至 XX 元档可享 XXGB 大流量 + 视频会员，本月办理加赠 XXGB，是否为您办理？',
    conversion: '23.5%',
    recommended: true,
    reason: '历史转化率最高，目标客群匹配度 92%，与当前指标「当月流量增幅」高度相关',
  },
  {
    id: 'B',
    name: '方案 B · 流量加餐包',
    targetGroup: '流量即将用尽客户',
    product: '流量加餐包',
    channel: '短信 + 掌厅',
    speech: '您好，检测到您本月流量即将用尽，现有 XX 元加餐包可享 XXGB 流量，当月有效，点击即可快速办理，避免超出产生额外费用。',
    conversion: '18.2%',
    recommended: false,
    reason: '',
  },
  {
    id: 'C',
    name: '方案 C · 家庭共享升级',
    targetGroup: '家庭融合潜在客户',
    product: '家庭共享套餐',
    channel: '外呼 + 企业微信',
    speech: '您好，您的套餐可升级为家庭共享套餐，全家共享流量与通话更划算，是否为您介绍详情？',
    conversion: '15.8%',
    recommended: false,
    reason: '',
  },
];

export default function StrategyMakingPanel({
  scenario = '流量运营',
  onNewStrategy,
  onConfirm,
}: StrategyMakingPanelProps) {
  // 默认选中 AI 推荐方案
  const [selectedPlan, setSelectedPlan] = useState<string>('A');
  const [speech, setSpeech] = useState<string>(PLAN_OPTIONS[0].speech);
  const [speechSource, setSpeechSource] = useState<'manual' | 'ai' | 'library'>('ai');
  const [showAiSpeech, setShowAiSpeech] = useState(false);
  const [speechSelectorOpen, setSpeechSelectorOpen] = useState(false);

  const currentPlan = PLAN_OPTIONS.find((p) => p.id === selectedPlan) ?? PLAN_OPTIONS[0];
  const aiTemplates = AI_SPEECH_TEMPLATES[scenario] ?? AI_SPEECH_TEMPLATES['流量运营'];

  const handleSelectPlan = (plan: StrategyPlan) => {
    setSelectedPlan(plan.id);
    setSpeech(plan.speech);
    setSpeechSource('ai');
  };

  const handleSelectLibrarySpeech = (item: SpeechItem) => {
    setSpeech(item.content);
    setSpeechSource('library');
  };

  const handleAiTemplate = (template: string) => {
    setSpeech(template);
    setSpeechSource('ai');
    setShowAiSpeech(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">策略制定</CardTitle>
            <CardDescription>策略比选、AI 推荐与话术管理</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={onNewStrategy}>
            <Plus className="mr-1 h-3.5 w-3.5" /> 新建策略
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 策略方案比选 */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> 方案比选（点击选中，AI 推荐方案已高亮）
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {PLAN_OPTIONS.map((plan) => {
              const active = selectedPlan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className={`relative rounded-lg border p-3 text-left transition-all ${
                    active
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {active && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                    {plan.recommended && <Badge className="bg-violet-500 text-white">AI 推荐</Badge>}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>客群：{plan.targetGroup}</div>
                    <div>产品：{plan.product}</div>
                    <div>渠道：{plan.channel}</div>
                    <div className="text-emerald-600">预估转化：{plan.conversion}</div>
                  </div>
                </button>
              );
            })}
          </div>
          {currentPlan.recommended && (
            <div className="mt-2 flex items-start gap-1.5 rounded-md bg-violet-50 px-3 py-2 text-xs text-violet-700">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>推荐理由：{currentPlan.reason}</span>
            </div>
          )}
        </div>

        {/* 话术管理 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Wand2 className="h-3.5 w-3.5" /> 营销话术
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAiSpeech((v) => !v)}
              >
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
                  onClick={() => handleAiTemplate(t)}
                  className="block w-full rounded-md bg-white px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-violet-50"
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <Textarea
            value={speech}
            onChange={(e) => {
              setSpeech(e.target.value);
              setSpeechSource('manual');
            }}
            rows={3}
            placeholder="请输入话术内容，或点击 AI 推荐 / 已有话术填入"
          />
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>话术来源：</span>
            <Badge variant="outline">
              {speechSource === 'manual' ? '自主输入' : speechSource === 'ai' ? 'AI 推荐' : '已有话术'}
            </Badge>
          </div>
        </div>

        {/* 确认采用 */}
        <div className="flex justify-end">
          <Button
            onClick={() =>
              onConfirm?.({
                plan: currentPlan.name,
                speech,
                speechSource,
              })
            }
          >
            确认采用该策略
          </Button>
        </div>
      </CardContent>

      {/* 已有话术选择弹窗 */}
      <SpeechSelector
        open={speechSelectorOpen}
        onOpenChange={setSpeechSelectorOpen}
        onSelect={handleSelectLibrarySpeech}
        defaultScenario={scenario}
      />
    </Card>
  );
}
