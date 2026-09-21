'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { BusinessSceneSelect } from './BusinessSceneSelect';
import { SearchablePicker } from './SearchablePicker';
import {
  AiMonitorRule,
  AlertGranularity,
  GRANULARITY_OPTIONS,
  INDICATOR_OPTIONS,
  SCOPE_OPTIONS,
  findIndicatorLabel,
} from '../data';

type NewRule = Omit<AiMonitorRule, 'id'>;

interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rule: NewRule) => void;
}

type FieldKey = 'scene' | 'granularity' | 'indicator' | 'scope';

/** 新增AI指标监控预警弹窗（业务场景/预警粒度/指标/预警范围 4 项必填） */
export function CreateAlertDialog({ open, onOpenChange, onSubmit }: CreateAlertDialogProps) {
  const [scenePath, setScenePath] = useState<string[] | null>(null);
  const [granularity, setGranularity] = useState<AlertGranularity | ''>('');
  const [indicator, setIndicator] = useState(''); // 指标 option value
  const [scope, setScope] = useState('');
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const scopeOptions = granularity
    ? SCOPE_OPTIONS[granularity].map((name) => ({ value: name, label: name }))
    : [];

  const handleGranularityChange = (v: string) => {
    setGranularity(v as AlertGranularity);
    setScope('');
    setErrors((prev) => ({ ...prev, granularity: undefined, scope: undefined }));
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      // 关闭时保留最近一次填写内容（重新打开可继续编辑）
    }
    onOpenChange(next);
  };

  const handleSubmit = () => {
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    if (!scenePath) nextErrors.scene = '请选择业务场景';
    if (!granularity) nextErrors.granularity = '请选择预警粒度';
    if (!indicator) nextErrors.indicator = '请选择指标';
    if (!scope) nextErrors.scope = '请选择预警范围';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const rule: NewRule = {
      indicator: findIndicatorLabel(indicator),
      scene: scenePath!,
      granularity: granularity as AlertGranularity,
      scope,
      condition: 'AI 自动学习生成中（待首次运行）',
      accuracy: null,
      falseCount: 0,
      totalCount: 0,
      enabled: true,
    };
    onSubmit(rule);
    // 复位表单
    setScenePath(null);
    setGranularity('');
    setIndicator('');
    setScope('');
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>新增AI指标监控预警</DialogTitle>
          <DialogDescription>
            配置监控指标与预警粒度/范围，系统将基于 AI 模型自动学习判定条件并在指标异动时预警
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 业务场景 */}
          <div className="grid grid-cols-[96px_1fr] items-start gap-4">
            <Label className="pt-2 text-sm text-gray-700">
              <span className="text-red-500 mr-0.5">*</span>业务场景
            </Label>
            <div>
              <BusinessSceneSelect
                value={scenePath}
                onChange={(p) => {
                  setScenePath(p);
                  setErrors((prev) => ({ ...prev, scene: undefined }));
                }}
                placeholder="请选择业务场景"
                clearable={false}
              />
              {errors.scene && <p className="mt-1 text-xs text-red-500">{errors.scene}</p>}
            </div>
          </div>

          {/* 预警粒度 */}
          <div className="grid grid-cols-[96px_1fr] items-start gap-4">
            <Label className="pt-2 text-sm text-gray-700">
              <span className="text-red-500 mr-0.5">*</span>预警粒度
            </Label>
            <div>
              <Select value={granularity} onValueChange={handleGranularityChange}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="请选择预警粒度" />
                </SelectTrigger>
                <SelectContent>
                  {GRANULARITY_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.granularity && <p className="mt-1 text-xs text-red-500">{errors.granularity}</p>}
            </div>
          </div>

          {/* 指标 */}
          <div className="grid grid-cols-[96px_1fr] items-start gap-4">
            <Label className="pt-2 text-sm text-gray-700">
              <span className="text-red-500 mr-0.5">*</span>指标
            </Label>
            <div>
              <SearchablePicker
                options={INDICATOR_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                value={indicator}
                onChange={(v) => {
                  setIndicator(v);
                  setErrors((prev) => ({ ...prev, indicator: undefined }));
                }}
                placeholder="请选择指标（支持名称搜索）"
              />
              {errors.indicator && <p className="mt-1 text-xs text-red-500">{errors.indicator}</p>}
            </div>
          </div>

          {/* 预警范围（随粒度联动） */}
          <div className="grid grid-cols-[96px_1fr] items-start gap-4">
            <Label className="pt-2 text-sm text-gray-700">
              <span className="text-red-500 mr-0.5">*</span>预警范围
            </Label>
            <div>
              <SearchablePicker
                options={scopeOptions}
                value={scope}
                onChange={(v) => {
                  setScope(v);
                  setErrors((prev) => ({ ...prev, scope: undefined }));
                }}
                placeholder={granularity ? `请选择${granularity}（支持名称搜索）` : '请先选择预警粒度'}
                disabled={!granularity}
              />
              {errors.scope && <p className="mt-1 text-xs text-red-500">{errors.scope}</p>}
              {granularity && !errors.scope && (
                <p className="mt-1 text-xs text-gray-400">
                  当前粒度下共 {scopeOptions.length} 个可选范围
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            className={cn('bg-[#0085D0] hover:bg-[#006BB0] text-white')}
          >
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
