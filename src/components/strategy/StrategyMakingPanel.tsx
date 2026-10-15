'use client';

import { useState } from 'react';
import { Check, Eye, Pencil, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface StrategyPlan {
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
  scenario?: string; // 运营场景（保留用于向后兼容）
  onNewStrategy?: () => void; // 点击「新建策略」触发（父组件打开新建策略弹窗）
  onConfirm?: (plan: StrategyPlan) => void; // 点击「确认采用该策略」返回完整方案
  onEditPlan?: (plan: StrategyPlan) => void; // 点击方案卡「编辑」触发（父组件打开新建策略弹窗并预填内容）
}

export const PLAN_OPTIONS: StrategyPlan[] = [
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
  onNewStrategy,
  onConfirm,
  onEditPlan,
}: StrategyMakingPanelProps) {
  // 默认选中 AI 推荐方案
  const [selectedPlan, setSelectedPlan] = useState<string>('A');
  const [detailPlan, setDetailPlan] = useState<StrategyPlan | null>(null);

  const currentPlan = PLAN_OPTIONS.find((p) => p.id === selectedPlan) ?? PLAN_OPTIONS[0];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">策略制定</CardTitle>
            <CardDescription>策略比选与 AI 推荐</CardDescription>
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
                <div
                  key={plan.id}
                  className={`relative rounded-lg border p-3 transition-all ${
                    active
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border'
                  }`}
                >
                  {active && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className="block w-full text-left"
                  >
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
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDetailPlan(plan)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Eye className="h-3 w-3" /> 查看详情
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditPlan?.(plan)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
                    >
                      <Pencil className="h-3 w-3" /> 编辑
                    </button>
                  </div>
                </div>
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

        {/* 确认采用 */}
        <div className="flex justify-end">
          <Button onClick={() => onConfirm?.(currentPlan)}>
            <Check className="mr-1 h-4 w-4" /> 确认采用该策略
          </Button>
        </div>
      </CardContent>

      {/* 策略详情弹窗（展示内容与新建策略中 IOP 普通营销下添加的内容一致） */}
      <Dialog open={detailPlan !== null} onOpenChange={(open) => !open && setDetailPlan(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              策略详情
              {detailPlan?.recommended && <Badge className="bg-violet-500 text-white">AI 推荐</Badge>}
            </DialogTitle>
          </DialogHeader>
          {detailPlan && (
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">基础信息</div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <div className="flex justify-between gap-4 py-1">
                    <span className="shrink-0 text-muted-foreground">方案名称</span>
                    <span className="text-right">{detailPlan.name}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-1">
                    <span className="shrink-0 text-muted-foreground">推荐理由</span>
                    <span className="text-right">{detailPlan.reason || '—'}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">目标客群</div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <div className="flex justify-between gap-4 py-1">
                    <span className="shrink-0 text-muted-foreground">目标客群</span>
                    <span className="text-right">{detailPlan.targetGroup}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">触达配置</div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <div className="flex justify-between gap-4 py-1">
                    <span className="shrink-0 text-muted-foreground">推荐产品</span>
                    <span className="text-right">{detailPlan.product}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-1">
                    <span className="shrink-0 text-muted-foreground">触达渠道</span>
                    <span className="text-right">{detailPlan.channel}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-1">
                    <span className="shrink-0 text-muted-foreground">预估转化</span>
                    <span className="text-right text-emerald-600">{detailPlan.conversion}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">营销话术</div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
                  {detailPlan.speech}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
