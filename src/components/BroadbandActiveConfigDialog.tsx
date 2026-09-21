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

interface BroadbandActiveConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: BroadbandActiveConfigData) => void;
  onPreview?: (data: BroadbandActiveConfigData) => void;
  initialData?: Partial<BroadbandActiveConfigData>;
}

// 环形图指标配置项
interface PieMetricItem {
  id: string;
  indicator: string; // 指标选择器值
  additionalIndicator1: string; // 附加指标1
  additionalIndicator2: string; // 附加指标2
  unit: string; // 单位
}

// 柱状图+折线图指标配置项
interface BarLineMetricItem {
  id: string;
  indicator: string; // 指标选择器值
  indicatorName: string; // 指标名称（输入框）
  unit: string; // 单位
}

export interface BroadbandActiveConfigData {
  indicatorCardName: string; // 指标卡名称
  // 柱状图+折线图配置
  barLineChartName: string; // 图表名称
  barLineLeftAxisMetrics: BarLineMetricItem[]; // 左侧Y轴指标（柱状图）
  barLineRightAxisMetrics: BarLineMetricItem[]; // 右侧Y轴指标（折线图）
  // 环形图配置
  pieChartName: string; // 环形图名称
  pieMetrics: PieMetricItem[]; // 环形图指标配置列表
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

export function BroadbandActiveConfigDialog({
  open,
  onOpenChange,
  onSave,
  onPreview,
  initialData,
}: BroadbandActiveConfigDialogProps) {
  const [formData, setFormData] = useState<BroadbandActiveConfigData>({
    indicatorCardName: initialData?.indicatorCardName || '',
    barLineChartName: initialData?.barLineChartName || '',
    barLineLeftAxisMetrics: initialData?.barLineLeftAxisMetrics?.length ? initialData.barLineLeftAxisMetrics.map((m: any) => ({
      id: m.id,
      indicator: m.indicator || '',
      indicatorName: m.indicatorName || '',
      unit: m.unit || '',
    })) : [
      { id: 'barLeft_1', indicator: '', indicatorName: '', unit: '' },
    ],
    barLineRightAxisMetrics: initialData?.barLineRightAxisMetrics?.length ? initialData.barLineRightAxisMetrics.map((m: any) => ({
      id: m.id,
      indicator: m.indicator || '',
      indicatorName: m.indicatorName || '',
      unit: m.unit || '',
    })) : [
      { id: 'barRight_1', indicator: '', indicatorName: '', unit: '' },
    ],
    pieChartName: initialData?.pieChartName || '',
    pieMetrics: initialData?.pieMetrics?.length ? initialData.pieMetrics.map((m: any) => ({
      id: m.id,
      indicator: m.indicator || '',
      additionalIndicator1: m.additionalIndicator1 || '',
      additionalIndicator2: m.additionalIndicator2 || '',
      unit: m.unit || '',
    })) : [
      { id: 'pie_1', indicator: '', additionalIndicator1: '', additionalIndicator2: '', unit: '' },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 必填字段验证
    if (!formData.indicatorCardName.trim()) {
      newErrors.indicatorCardName = '指标卡名称不能为空';
    }

    if (!formData.barLineChartName.trim()) {
      newErrors.barLineChartName = '图表名称不能为空';
    }

    if (!formData.pieChartName.trim()) {
      newErrors.pieChartName = '图表名称不能为空';
    }

    // 柱状图左侧Y轴指标验证
    if (formData.barLineLeftAxisMetrics.length === 0) {
      newErrors.barLineLeftAxisMetrics = '至少需要配置一个柱状图指标';
    } else {
      // 检查单位一致性
      const firstUnit = formData.barLineLeftAxisMetrics[0].unit;
      const unitMismatch = formData.barLineLeftAxisMetrics.some(m => m.unit !== firstUnit);
      if (unitMismatch) {
        newErrors.barLineLeftAxisMetrics = '所有柱状图指标单位必须一致';
      }
    }

    // 柱状图右侧Y轴指标验证
    if (formData.barLineRightAxisMetrics.length === 0) {
      newErrors.barLineRightAxisMetrics = '至少需要配置一个折线图指标';
    } else {
      // 检查单位一致性
      const firstUnit = formData.barLineRightAxisMetrics[0].unit;
      const unitMismatch = formData.barLineRightAxisMetrics.some(m => m.unit !== firstUnit);
      if (unitMismatch) {
        newErrors.barLineRightAxisMetrics = '所有折线图指标单位必须一致';
      }
    }

    // 环形图指标验证
    if (formData.pieMetrics.length === 0) {
      newErrors.pieMetrics = '至少需要配置一个环形图指标';
    } else {
      // 检查单位一致性
      const firstUnit = formData.pieMetrics[0].unit;
      const unitMismatch = formData.pieMetrics.some(m => m.unit !== firstUnit);
      if (unitMismatch) {
        newErrors.pieMetrics = '所有环形图指标单位必须一致';
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

  // 柱状图左侧Y轴指标操作
  const addBarLineLeftMetric = () => {
    setFormData({
      ...formData,
      barLineLeftAxisMetrics: [
        ...formData.barLineLeftAxisMetrics,
        { id: `barLeft_${Date.now()}`, indicator: '', indicatorName: '', unit: '' },
      ],
    });
    if (errors.barLineLeftAxisMetrics) {
      setErrors({ ...errors, barLineLeftAxisMetrics: '' });
    }
  };

  const removeBarLineLeftMetric = (id: string) => {
    setFormData({
      ...formData,
      barLineLeftAxisMetrics: formData.barLineLeftAxisMetrics.filter(m => m.id !== id),
    });
  };

  const updateBarLineLeftMetric = (id: string, field: keyof BarLineMetricItem, value: string) => {
    let updatedMetric = { ...formData.barLineLeftAxisMetrics.find(m => m.id === id)! };
    
    // 如果修改了指标，自动更新单位
    if (field === 'indicator') {
      const unit = getIndicatorUnit(value);
      updatedMetric = { ...updatedMetric, indicator: value, unit };
    }
    else {
      updatedMetric = { ...updatedMetric, [field]: value };
    }
    
    setFormData({
      ...formData,
      barLineLeftAxisMetrics: formData.barLineLeftAxisMetrics.map(m => m.id === id ? updatedMetric : m),
    });
    
    // 清除错误
    if (errors.barLineLeftAxisMetrics) {
      setErrors({ ...errors, barLineLeftAxisMetrics: '' });
    }
  };

  // 柱状图右侧Y轴指标操作
  const addBarLineRightMetric = () => {
    setFormData({
      ...formData,
      barLineRightAxisMetrics: [
        ...formData.barLineRightAxisMetrics,
        { id: `barRight_${Date.now()}`, indicator: '', indicatorName: '', unit: '' },
      ],
    });
    if (errors.barLineRightAxisMetrics) {
      setErrors({ ...errors, barLineRightAxisMetrics: '' });
    }
  };

  const removeBarLineRightMetric = (id: string) => {
    setFormData({
      ...formData,
      barLineRightAxisMetrics: formData.barLineRightAxisMetrics.filter(m => m.id !== id),
    });
  };

  const updateBarLineRightMetric = (id: string, field: keyof BarLineMetricItem, value: string) => {
    let updatedMetric = { ...formData.barLineRightAxisMetrics.find(m => m.id === id)! };
    
    // 如果修改了指标，自动更新单位
    if (field === 'indicator') {
      const unit = getIndicatorUnit(value);
      updatedMetric = { ...updatedMetric, indicator: value, unit };
    }
    else {
      updatedMetric = { ...updatedMetric, [field]: value };
    }
    
    setFormData({
      ...formData,
      barLineRightAxisMetrics: formData.barLineRightAxisMetrics.map(m => m.id === id ? updatedMetric : m),
    });
    
    // 清除错误
    if (errors.barLineRightAxisMetrics) {
      setErrors({ ...errors, barLineRightAxisMetrics: '' });
    }
  };

  // 环形图指标操作
  const addPieMetric = () => {
    setFormData({
      ...formData,
      pieMetrics: [
        ...formData.pieMetrics,
        { id: `pie_${Date.now()}`, indicator: '', additionalIndicator1: '', additionalIndicator2: '', unit: '' },
      ],
    });
    if (errors.pieMetrics) {
      setErrors({ ...errors, pieMetrics: '' });
    }
  };

  const removePieMetric = (id: string) => {
    setFormData({
      ...formData,
      pieMetrics: formData.pieMetrics.filter(m => m.id !== id),
    });
  };

  const updatePieMetric = (id: string, field: keyof PieMetricItem, value: string) => {
    let updatedMetric = { ...formData.pieMetrics.find(m => m.id === id)! };
    
    // 如果修改了主指标，自动更新单位
    if (field === 'indicator') {
      const unit = getIndicatorUnit(value);
      updatedMetric = { ...updatedMetric, indicator: value, unit };
    }
    else {
      updatedMetric = { ...updatedMetric, [field]: value };
    }
    
    setFormData({
      ...formData,
      pieMetrics: formData.pieMetrics.map(m => m.id === id ? updatedMetric : m),
    });
    
    // 清除错误
    if (errors.pieMetrics) {
      setErrors({ ...errors, pieMetrics: '' });
    }
  };

  const getIndicatorUnit = (indicator: string): string => {
    const option = indicatorOptions.find(opt => opt.value === indicator);
    return option?.unit || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-lg font-semibold">指标卡属性设置</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <DialogDescription className="sr-only">
          配置指标卡的名称和图表指标
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

          {/* 柱状图+折线图配置 */}
          <div className="space-y-3 border p-4 rounded-lg">
            <h4 className="text-base font-semibold text-gray-900">柱状图+折线图配置</h4>
            <div className="space-y-3">
              {/* 图表名称 */}
              <div className="space-y-2">
                <Label htmlFor="barLineChartName" className="text-sm font-medium">
                  图表名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="barLineChartName"
                  value={formData.barLineChartName}
                  onChange={(e) => {
                    setFormData({ ...formData, barLineChartName: e.target.value });
                    if (errors.barLineChartName) {
                      setErrors({ ...errors, barLineChartName: '' });
                    }
                  }}
                  placeholder="请输入图表名称"
                  className={errors.barLineChartName ? 'border-red-500' : ''}
                />
                {errors.barLineChartName && (
                  <p className="text-xs text-red-500">{errors.barLineChartName}</p>
                )}
              </div>

              {/* 左侧Y轴指标配置（柱状图） */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">左侧Y轴指标配置（柱状图）</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBarLineLeftMetric}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    新增指标
                  </Button>
                </div>
                <p className="text-xs text-gray-500">需保证选择的指标单位一致</p>

                {formData.barLineLeftAxisMetrics.map((metric, index) => (
                  <div key={metric.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4 space-y-1">
                      <Select
                        value={metric.indicator}
                        onValueChange={(value) => updateBarLineLeftMetric(metric.id, 'indicator', value)}
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
                        onChange={(e) => updateBarLineLeftMetric(metric.id, 'indicatorName', e.target.value)}
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
                        onClick={() => removeBarLineLeftMetric(metric.id)}
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {errors.barLineLeftAxisMetrics && (
                  <p className="text-xs text-red-500">{errors.barLineLeftAxisMetrics}</p>
                )}
              </div>

              {/* 右侧Y轴指标配置（折线图） */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">右侧Y轴指标配置（折线图）</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBarLineRightMetric}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    新增指标
                  </Button>
                </div>
                <p className="text-xs text-gray-500">需保证选择的指标单位一致</p>

                {formData.barLineRightAxisMetrics.map((metric, index) => (
                  <div key={metric.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4 space-y-1">
                      <Select
                        value={metric.indicator}
                        onValueChange={(value) => updateBarLineRightMetric(metric.id, 'indicator', value)}
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
                        onChange={(e) => updateBarLineRightMetric(metric.id, 'indicatorName', e.target.value)}
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
                        onClick={() => removeBarLineRightMetric(metric.id)}
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {errors.barLineRightAxisMetrics && (
                  <p className="text-xs text-red-500">{errors.barLineRightAxisMetrics}</p>
                )}
              </div>
            </div>
          </div>

          {/* 环形图配置 */}
          <div className="space-y-3 border p-4 rounded-lg">
            <h4 className="text-base font-semibold text-gray-900">环形图配置</h4>
            {/* 图表名称 */}
            <div className="space-y-2">
              <Label htmlFor="pieChartName" className="text-sm font-medium">
                图表名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pieChartName"
                value={formData.pieChartName}
                onChange={(e) => {
                  setFormData({ ...formData, pieChartName: e.target.value });
                  if (errors.pieChartName) {
                    setErrors({ ...errors, pieChartName: '' });
                  }
                }}
                placeholder="请输入图表名称"
                className={errors.pieChartName ? 'border-red-500' : ''}
              />
              {errors.pieChartName && (
                <p className="text-xs text-red-500">{errors.pieChartName}</p>
              )}
            </div>

            {/* 环形图指标配置 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">指标配置</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPieMetric}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  新增指标
                </Button>
              </div>
              <p className="text-xs text-gray-500">需保证选择的指标单位一致</p>

              {formData.pieMetrics.map((metric, index) => (
                <div key={metric.id} className="grid grid-cols-12 gap-1.5 items-center">
                  <div className="col-span-4">
                    <Select
                      value={metric.indicator}
                      onValueChange={(value) => updatePieMetric(metric.id, 'indicator', value)}
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
                  <div className="col-span-2">
                    <Input
                      value={metric.unit}
                      readOnly
                      placeholder="单位"
                      className="text-xs bg-gray-100"
                    />
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={metric.additionalIndicator1}
                      onValueChange={(value) => updatePieMetric(metric.id, 'additionalIndicator1', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="附加指标1" />
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
                  <div className="col-span-2">
                    <Select
                      value={metric.additionalIndicator2}
                      onValueChange={(value) => updatePieMetric(metric.id, 'additionalIndicator2', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="附加指标2" />
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
                  <div className="col-span-2 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePieMetric(metric.id)}
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {errors.pieMetrics && (
                <p className="text-xs text-red-500">{errors.pieMetrics}</p>
              )}
            </div>
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
