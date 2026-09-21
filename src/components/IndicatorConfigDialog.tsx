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

interface IndicatorConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: IndicatorConfigData) => void;
  onPreview?: (data: IndicatorConfigData) => void;
  initialData?: Partial<IndicatorConfigData>;
  // 配置选项
  options?: {
    fixLeftAxisToBar?: boolean; // 左侧Y轴是否固定为柱状图不可修改
  };
}

// 顶部指标项
interface TopMetricItem {
  id: string;
  indicatorName: string; // 指标名称（输入）
  defaultIndicator: string; // 默认指标（选择）
  defaultIndicatorUnit: string; // 默认指标单位
  additionalIndicator?: string; // 附加指标（选择，可选）
  additionalIndicatorUnit?: string; // 附加指标单位
  additionalIndicatorName?: string; // 附加指标名称（输入，可选）
}

// 坐标轴指标配置项
interface AxisMetricItem {
  id: string;
  indicator: string; // 指标选择器值
  indicatorName: string; // 指标名称（输入框）
  unit: string; // 单位
}

export interface IndicatorConfigData {
  indicatorCardName: string; // 指标卡名称
  topMetrics: TopMetricItem[]; // 顶部指标列表（最多4个）
  axis1Metrics: AxisMetricItem[]; // 坐标轴1的指标配置（左侧Y轴 - 堆叠柱状图）
  axis2Metrics: AxisMetricItem[]; // 坐标轴2的指标配置（右侧Y轴 - 折线图）
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

export function IndicatorConfigDialog({
  open,
  onOpenChange,
  onSave,
  onPreview,
  initialData,
  options = {},
}: IndicatorConfigDialogProps) {
  const { fixLeftAxisToBar = false } = options;
  
  const [formData, setFormData] = useState<IndicatorConfigData>({
    indicatorCardName: initialData?.indicatorCardName || '',
    topMetrics: initialData?.topMetrics?.length ? initialData.topMetrics.map((m: any) => ({
      id: m.id,
      indicatorName: m.indicatorName || '',
      defaultIndicator: m.defaultIndicator || '',
      defaultIndicatorUnit: m.defaultIndicatorUnit || '',
      additionalIndicator: m.additionalIndicator || '',
      additionalIndicatorUnit: m.additionalIndicatorUnit || '',
      additionalIndicatorName: m.additionalIndicatorName || '',
    })) : [
      { 
        id: 'top_1', 
        indicatorName: '', 
        defaultIndicator: '', 
        defaultIndicatorUnit: '',
        additionalIndicator: '',
        additionalIndicatorUnit: '',
        additionalIndicatorName: '',
      },
    ],
    axis1Metrics: initialData?.axis1Metrics?.length ? initialData.axis1Metrics.map((m: any) => ({
      id: m.id,
      indicator: m.indicator || '',
      indicatorName: m.indicatorName || '',
      unit: m.unit || '',
    })) : [
      { id: 'axis1_1', indicator: '', indicatorName: '', unit: '' },
    ],
    axis2Metrics: initialData?.axis2Metrics?.length ? initialData.axis2Metrics.map((m: any) => ({
      id: m.id,
      indicator: m.indicator || '',
      indicatorName: m.indicatorName || '',
      unit: m.unit || '',
    })) : [
      { id: 'axis2_1', indicator: '', indicatorName: '', unit: '' },
    ],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 必填字段验证
    if (!formData.indicatorCardName.trim()) {
      newErrors.indicatorCardName = '指标卡名称不能为空';
    }

    // 顶部指标验证
    if (formData.topMetrics.length === 0) {
      newErrors.topMetrics = '至少需要配置一个顶部指标';
    }
    formData.topMetrics.forEach((metric, index) => {
      if (!metric.indicatorName.trim()) {
        newErrors[`topMetricIndicatorName_${index}`] = `顶部指标${index + 1}的指标名称不能为空`;
      }
      if (!metric.defaultIndicator) {
        newErrors[`topMetricDefaultIndicator_${index}`] = `顶部指标${index + 1}的默认指标不能为空`;
      }
      // 附加指标改为非必选，移除验证
    });

    // 坐标轴1指标验证
    if (formData.axis1Metrics.length === 0) {
      newErrors.axis1Metrics = '至少需要配置一个坐标轴1指标';
    } else {
      // 检查单位一致性
      const firstUnit = formData.axis1Metrics[0].unit;
      const unitMismatch = formData.axis1Metrics.some(m => m.unit !== firstUnit);
      if (unitMismatch) {
        newErrors.axis1Metrics = '坐标轴1的所有指标单位必须一致';
      }
    }

    // 坐标轴2指标验证
    if (formData.axis2Metrics.length === 0) {
      newErrors.axis2Metrics = '至少需要配置一个坐标轴2指标';
    } else if (formData.axis2Metrics.length > 0) {
      // 检查单位一致性
      const firstUnit = formData.axis2Metrics[0].unit;
      const unitMismatch = formData.axis2Metrics.some(m => m.unit !== firstUnit);
      if (unitMismatch) {
        newErrors.axis2Metrics = '坐标轴2的所有指标单位必须一致';
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

  // 顶部指标操作
  const addTopMetric = () => {
    if (formData.topMetrics.length < 4) {
      setFormData({
        ...formData,
        topMetrics: [
          ...formData.topMetrics,
          { 
            id: `top_${Date.now()}`, 
            indicatorName: '', 
            defaultIndicator: '', 
            defaultIndicatorUnit: '',
            additionalIndicator: '',
            additionalIndicatorUnit: '',
            additionalIndicatorName: '',
          },
        ],
      });
      if (errors.topMetrics) {
        setErrors({ ...errors, topMetrics: '' });
      }
    }
  };

  const removeTopMetric = (id: string) => {
    setFormData({
      ...formData,
      topMetrics: formData.topMetrics.filter(m => m.id !== id),
    });
  };

  const updateTopMetric = (id: string, field: keyof TopMetricItem, value: string) => {
    let updatedMetric = { ...formData.topMetrics.find(m => m.id === id)! };
    
    // 如果修改了默认指标，自动更新默认指标单位
    if (field === 'defaultIndicator') {
      const unit = getIndicatorUnit(value);
      updatedMetric = { ...updatedMetric, defaultIndicator: value, defaultIndicatorUnit: unit };
    }
    // 如果修改了附加指标，自动更新附加指标单位
    else if (field === 'additionalIndicator') {
      const unit = getIndicatorUnit(value);
      updatedMetric = { ...updatedMetric, additionalIndicator: value, additionalIndicatorUnit: unit };
    }
    else {
      updatedMetric = { ...updatedMetric, [field]: value };
    }
    
    setFormData({
      ...formData,
      topMetrics: formData.topMetrics.map(m => m.id === id ? updatedMetric : m),
    });
    
    // 清除错误 - 根据新的字段名清除
    const index = formData.topMetrics.findIndex(m => m.id === id);
    if (field === 'indicatorName') {
      const errorKey = `topMetricIndicatorName_${index}`;
      if (errors[errorKey]) {
        setErrors({ ...errors, [errorKey]: '' });
      }
    } else if (field === 'defaultIndicator') {
      const errorKey = `topMetricDefaultIndicator_${index}`;
      if (errors[errorKey]) {
        setErrors({ ...errors, [errorKey]: '' });
      }
    }
  };

  // 坐标轴指标操作
  const addAxisMetric = (axis: 1 | 2) => {
    if (axis === 1) {
      setFormData({
        ...formData,
        axis1Metrics: [
          ...formData.axis1Metrics,
          { id: `axis1_${Date.now()}`, indicator: '', indicatorName: '', unit: '' },
        ],
      });
    } else {
      setFormData({
        ...formData,
        axis2Metrics: [
          ...formData.axis2Metrics,
          { id: `axis2_${Date.now()}`, indicator: '', indicatorName: '', unit: '' },
        ],
      });
    }
    if (errors[`axis${axis}Metrics`]) {
      setErrors({ ...errors, [`axis${axis}Metrics`]: '' });
    }
  };

  const removeAxisMetric = (axis: 1 | 2, id: string) => {
    if (axis === 1) {
      setFormData({
        ...formData,
        axis1Metrics: formData.axis1Metrics.filter(m => m.id !== id),
      });
    } else {
      setFormData({
        ...formData,
        axis2Metrics: formData.axis2Metrics.filter(m => m.id !== id),
      });
    }
  };

  const updateAxisMetric = (axis: 1 | 2, id: string, field: keyof AxisMetricItem, value: string) => {
    let updatedMetric = { ...(axis === 1 ? formData.axis1Metrics.find(m => m.id === id)! : formData.axis2Metrics.find(m => m.id === id)!) };
    
    // 如果修改了指标选择器，自动更新单位
    if (field === 'indicator') {
      const unit = getIndicatorUnit(value);
      updatedMetric = { ...updatedMetric, indicator: value, unit };
    }
    else {
      updatedMetric = { ...updatedMetric, [field]: value };
    }
    
    if (axis === 1) {
      setFormData({
        ...formData,
        axis1Metrics: formData.axis1Metrics.map(m => m.id === id ? updatedMetric : m),
      });
    } else {
      setFormData({
        ...formData,
        axis2Metrics: formData.axis2Metrics.map(m => m.id === id ? updatedMetric : m),
      });
    }
  };

  const getIndicatorUnit = (indicator: string): string => {
    const option = indicatorOptions.find(opt => opt.value === indicator);
    return option?.unit || '';
  };

  const handleIndicatorChange = (axis: 1 | 2, id: string, value: string) => {
    const unit = getIndicatorUnit(value);
    updateAxisMetric(axis, id, 'indicator', value);
    updateAxisMetric(axis, id, 'unit', unit);
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
          配置指标卡的名称、顶部指标、左侧Y轴指标和右侧Y轴指标
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

          {/* 顶部指标配置 */}
          <div className="space-y-3 border p-4 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">顶部指标配置</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTopMetric}
                disabled={formData.topMetrics.length >= 4}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                新增指标
              </Button>
            </div>
            <p className="text-xs text-gray-500">最多可配置4个顶部指标</p>

            {formData.topMetrics.map((metric, index) => (
              <div key={metric.id} className={`grid gap-2 items-center ${fixLeftAxisToBar ? 'grid-cols-10' : 'grid-cols-12'}`}>
                {/* 默认指标（选择） */}
                <div className={`space-y-1 ${fixLeftAxisToBar ? 'col-span-5' : 'col-span-3'}`}>
                  <Select
                    value={metric.defaultIndicator}
                    onValueChange={(value) => updateTopMetric(metric.id, 'defaultIndicator', value)}
                  >
                    <SelectTrigger className={`text-xs ${errors[`topMetricDefaultIndicator_${index}`] ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="默认指标" />
                    </SelectTrigger>
                    <SelectContent>
                      {indicatorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`topMetricDefaultIndicator_${index}`] && (
                    <p className="text-xs text-red-500">{errors[`topMetricDefaultIndicator_${index}`]}</p>
                  )}
                </div>
                {/* 指标名称（输入） */}
                <div className={`space-y-1 ${fixLeftAxisToBar ? 'col-span-4' : 'col-span-2'}`}>
                  <Input
                    value={metric.indicatorName}
                    onChange={(e) => updateTopMetric(metric.id, 'indicatorName', e.target.value)}
                    placeholder="指标名称"
                    className={`text-[11px] py-1 ${errors[`topMetricIndicatorName_${index}`] ? 'border-red-500' : ''}`}
                  />
                  {errors[`topMetricIndicatorName_${index}`] && (
                    <p className="text-xs text-red-500">{errors[`topMetricIndicatorName_${index}`]}</p>
                  )}
                </div>
                
                {/* 附加指标和附加指标名称（仅当 fixLeftAxisToBar 为 false 时显示） */}
                {!fixLeftAxisToBar && (
                  <>
                    {/* 附加指标（选择，可选） */}
                    <div className="col-span-3">
                      <Select
                        value={metric.additionalIndicator || ''}
                        onValueChange={(value) => updateTopMetric(metric.id, 'additionalIndicator', value)}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="附加指标" />
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
                    {/* 附加指标名称（输入，可选） */}
                    <div className="col-span-3">
                      <Input
                        value={metric.additionalIndicatorName || ''}
                        onChange={(e) => updateTopMetric(metric.id, 'additionalIndicatorName', e.target.value)}
                        placeholder="附加指标名称"
                        className="text-[11px] py-1"
                      />
                    </div>
                  </>
                )}
                
                {/* 删除按钮 */}
                <div className={`flex justify-end ${fixLeftAxisToBar ? 'col-span-1' : 'col-span-1 ml-auto'}`}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTopMetric(metric.id)}
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {errors.topMetrics && (
              <p className="text-xs text-red-500">{errors.topMetrics}</p>
            )}
          </div>

          {/* 左侧Y轴指标配置 */}
          <div className="space-y-3 border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                左侧Y轴指标配置（{fixLeftAxisToBar ? '堆叠柱状图' : '柱状图'}）
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addAxisMetric(1)}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                新增指标
              </Button>
            </div>
            <p className="text-xs text-gray-500">需保证指标之间的单位一致</p>

            {formData.axis1Metrics.map((metric, index) => (
              <div key={metric.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4 space-y-1">
                  <Select
                    value={metric.indicator}
                    onValueChange={(value) => handleIndicatorChange(1, metric.id, value)}
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
                <div className="col-span-5 space-y-1">
                  <Input
                    value={metric.indicatorName}
                    onChange={(e) => updateAxisMetric(1, metric.id, 'indicatorName', e.target.value)}
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
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAxisMetric(1, metric.id)}
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {errors.axis1Metrics && (
              <p className="text-xs text-red-500">{errors.axis1Metrics}</p>
            )}
          </div>

          {/* 右侧Y轴指标配置 */}
          <div className="space-y-3 border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">右侧Y轴指标配置（折线图）</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addAxisMetric(2)}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                新增指标
              </Button>
            </div>
            <p className="text-xs text-gray-500">需保证选择的指标单位一致</p>

            {formData.axis2Metrics.map((metric, index) => (
              <div key={metric.id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4 space-y-1">
                  <Select
                    value={metric.indicator}
                    onValueChange={(value) => handleIndicatorChange(2, metric.id, value)}
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
                <div className="col-span-5 space-y-1">
                  <Input
                    value={metric.indicatorName}
                    onChange={(e) => updateAxisMetric(2, metric.id, 'indicatorName', e.target.value)}
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
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAxisMetric(2, metric.id)}
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {errors.axis2Metrics && (
              <p className="text-xs text-red-500">{errors.axis2Metrics}</p>
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
            className="px-6 py-2 bg-[#0066CC] hover:bg-[#0055aa] text-white"
          >
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
