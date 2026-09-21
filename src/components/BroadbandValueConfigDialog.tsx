'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';

interface BroadbandValueConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: BroadbandValueConfigData) => void;
  onPreview?: (data: BroadbandValueConfigData) => void;
  initialData?: Partial<BroadbandValueConfigData>;
}

// 指标配置项
interface MetricItem {
  id: string;
  indicator: string; // 指标选择器值
  indicatorName: string; // 指标名称（输入框）
  unit: string; // 单位
}

export interface BroadbandValueConfigData {
  indicatorCardName: string; // 指标卡名称
  metrics: MetricItem[]; // 指标配置列表（折线图）
}

const indicatorOptions = [
  { value: 'arrival', label: '到达量', unit: '户' },
  { value: 'newAdd', label: '新增量', unit: '户' },
  { value: 'netIncrement', label: '净增量', unit: '户' },
  { value: 'churn', label: '离网量', unit: '户' },
  { value: 'arpu', label: 'ARPU', unit: '元' },
  { value: 'activeRate', label: '活跃率', unit: '%' },
  { value: 'yoy', label: '环比', unit: '%' },
];

export function BroadbandValueConfigDialog({
  open,
  onOpenChange,
  onSave,
  onPreview,
  initialData,
}: BroadbandValueConfigDialogProps) {
  const [formData, setFormData] = useState<BroadbandValueConfigData>({
    indicatorCardName: initialData?.indicatorCardName || '',
    metrics: initialData?.metrics?.length ? initialData.metrics.map((m: any) => ({
      id: m.id,
      indicator: m.indicator || '',
      indicatorName: m.indicatorName || '',
      unit: m.unit || '',
    })) : [
      { id: 'metric_1', indicator: '', indicatorName: '', unit: '' },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 必填字段验证
    if (!formData.indicatorCardName.trim()) {
      newErrors.indicatorCardName = '指标卡名称不能为空';
    }

    // 指标验证
    if (formData.metrics.length === 0) {
      newErrors.metrics = '至少需要配置一个指标';
    } else {
      // 检查单位一致性
      const firstUnit = formData.metrics[0].unit;
      const unitMismatch = formData.metrics.some(m => m.unit !== firstUnit);
      if (unitMismatch) {
        newErrors.metrics = '所有指标单位必须一致';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave?.(formData);
      onOpenChange(false);
    }
  };

  const handlePreview = () => {
    if (validateForm()) {
      onPreview?.(formData);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // 指标操作
  const addMetric = () => {
    setFormData({
      ...formData,
      metrics: [
        ...formData.metrics,
        { id: `metric_${Date.now()}`, indicator: '', indicatorName: '', unit: '' },
      ],
    });
    if (errors.metrics) {
      setErrors({ ...errors, metrics: '' });
    }
  };

  const removeMetric = (id: string) => {
    setFormData({
      ...formData,
      metrics: formData.metrics.filter(m => m.id !== id),
    });
  };

  const updateMetric = (id: string, field: keyof MetricItem, value: string) => {
    let updatedMetric = { ...formData.metrics.find(m => m.id === id)! };
    
    // 如果修改了指标，自动更新单位
    if (field === 'indicator') {
      const unit = getIndicatorUnit(value);
      updatedMetric = { ...updatedMetric, indicator: value, unit };
    }
    else {
      updatedMetric = { ...updatedMetric, [field]: value };
    }
    
    if (field === 'indicator') {
      setFormData({
        ...formData,
        metrics: formData.metrics.map(m => m.id === id ? updatedMetric : m),
      });
    } else {
      setFormData({
        ...formData,
        metrics: formData.metrics.map(m => m.id === id ? updatedMetric : m),
      });
    }
    
    // 清除错误
    if (errors.metrics) {
      setErrors({ ...errors, metrics: '' });
    }
  };

  const getIndicatorUnit = (indicator: string): string => {
    const option = indicatorOptions.find(opt => opt.value === indicator);
    return option?.unit || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-lg font-semibold">指标卡属性设置</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <DialogDescription className="sr-only">
          配置指标卡的名称和折线图指标
        </DialogDescription>

        <div className="space-y-6 py-6">
          {/* 指标卡名称 */}
          <div className="space-y-2">
            <Label htmlFor="indicatorCardName" className="text-sm font-medium">
              指标卡名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="indicatorCardName"
              value={formData.indicatorCardName}
              onChange={(e) => {
                setFormData({ ...formData, indicatorCardName: e.target.value });
                if (errors.indicatorCardName) {
                  setErrors({ ...errors, indicatorCardName: '' });
                }
              }}
              placeholder="请输入指标卡名称"
              className={errors.indicatorCardName ? 'border-red-500' : ''}
            />
            {errors.indicatorCardName && (
              <p className="text-xs text-red-500">{errors.indicatorCardName}</p>
            )}
          </div>

          {/* 指标配置（折线图） */}
          <div className="space-y-3 border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">指标配置（折线图）</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMetric}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                新增指标
              </Button>
            </div>
            <p className="text-xs text-gray-500">需保证选择的指标单位一致</p>

            {formData.metrics.map((metric, index) => (
              <div key={metric.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4 space-y-1">
                  <Select
                    value={metric.indicator}
                    onValueChange={(value) => updateMetric(metric.id, 'indicator', value)}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="选择指标" />
                    </SelectTrigger>
                    <SelectContent>
                      {indicatorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-4 space-y-1">
                  <Input
                    value={metric.indicatorName}
                    onChange={(e) => updateMetric(metric.id, 'indicatorName', e.target.value)}
                    placeholder="指标名称"
                    className="text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    value={metric.unit}
                    readOnly
                    placeholder="单位"
                    className="text-xs bg-gray-100"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMetric(metric.id)}
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {errors.metrics && (
              <p className="text-xs text-red-500">{errors.metrics}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
          >
            取消
          </Button>
          <Button
            variant="outline"
            onClick={handlePreview}
            className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
          >
            预览
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 py-2 bg-[#0085D0] text-white hover:bg-[#0070B8]"
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
