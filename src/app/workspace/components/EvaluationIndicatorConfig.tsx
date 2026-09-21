'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { EvaluationIndicator } from '@/lib/evaluation-indicator';

interface EvaluationIndicatorConfigProps {
  /** 评估指标数据 */
  value: EvaluationIndicator;
  /** 变更回调 */
  onChange: (value: EvaluationIndicator) => void;
  /** 可选指标列表（指标调度时只有1个，策略/客群调度从关联指标选，区域攻坚从93条指标选） */
  availableIndicators: { id: string; name: string; unit: string }[];
  /** 是否允许选择指标（指标调度时为false，自动带出） */
  selectable?: boolean;
  /** 是否展示当前值（只读） */
  showCurrentValue?: boolean;
}

const DIRECTION_OPTIONS = [
  { value: 'up', label: '提升 ↑（越大越好）' },
  { value: 'down', label: '降低 ↓（越小越好）' },
] as const;

export default function EvaluationIndicatorConfig({
  value,
  onChange,
  availableIndicators,
  selectable = true,
  showCurrentValue = false,
}: EvaluationIndicatorConfigProps) {
  const selectedIndicator = availableIndicators.find(i => i.id === value.indicatorId);

  const handleIndicatorChange = (indicatorId: string) => {
    const indicator = availableIndicators.find(i => i.id === indicatorId);
    if (indicator) {
      onChange({
        ...value,
        indicatorId: indicator.id,
        indicatorName: indicator.name,
        unit: indicator.unit,
      });
    }
  };

  const handleFieldChange = (field: keyof EvaluationIndicator, val: string | number) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-100">
      <div className="flex items-center gap-2 mb-3">
        <Label className="text-sm font-medium text-blue-900">评估指标</Label>
        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
          调度完成后自动对比该指标改善情况
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 指标选择/展示 */}
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">指标名称</Label>
          {selectable ? (
            <Select value={value.indicatorId} onValueChange={handleIndicatorChange}>
              <SelectTrigger className="h-9 bg-white">
                <SelectValue placeholder="请选择评估指标" />
              </SelectTrigger>
              <SelectContent>
                {availableIndicators.map(indicator => (
                  <SelectItem key={indicator.id} value={indicator.id}>
                    {indicator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-9 px-3 flex items-center bg-white rounded-md border text-sm text-gray-900">
              {value.indicatorName || '-'}
            </div>
          )}
        </div>

        {/* 改善方向 */}
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">改善方向</Label>
          <Select
            value={value.direction}
            onValueChange={(v) => handleFieldChange('direction', v as 'up' | 'down')}
          >
            <SelectTrigger className="h-9 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIRECTION_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 基期值（自动取值，只读） */}
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">
            基期值（调度创建时自动取值）
          </Label>
          <div className="h-9 px-3 flex items-center bg-gray-50 rounded-md border text-sm text-gray-500">
            {value.baseValue !== undefined && value.baseValue !== null
              ? `${value.baseValue}${value.unit || ''}`
              : '创建时自动取值'}
          </div>
        </div>

        {/* 目标值（人工填写） */}
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">
            <span className="text-red-500">*</span> 目标值
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={value.targetValue ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                handleFieldChange('targetValue', v === '' ? 0 : parseFloat(v));
              }}
              placeholder="请输入目标值"
              className="h-9 bg-white"
            />
            {selectedIndicator?.unit && (
              <span className="text-sm text-gray-500 whitespace-nowrap">{selectedIndicator.unit}</span>
            )}
          </div>
        </div>

        {/* 当前值（跟踪周期结束时自动取值，仅查看时展示） */}
        {showCurrentValue && (
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">
              当前值（跟踪周期结束时自动取值）
            </Label>
            <div className="h-9 px-3 flex items-center bg-gray-50 rounded-md border text-sm text-gray-500">
              {value.currentValue !== undefined && value.currentValue !== null
                ? `${value.currentValue}${value.unit || ''}`
                : '待评估'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
