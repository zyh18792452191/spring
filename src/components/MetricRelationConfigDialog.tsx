'use client';

import React, { useState, useEffect } from 'react';
import { Info, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MetricSelectorDialog from './MetricSelectorDialog';

interface MetricRelationConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: {
    id: number;
    code: string;
    name: string;
    type: string;
  } | null;
  onSave?: (data: RelationData) => void;
}

interface RelationData {
  metricId: number;
  yoyMetricId?: string;
  momMetricId?: string;
}

interface SelectedMetric {
  id: number;
  code: string;
  name: string;
  type: string;
}

export default function MetricRelationConfigDialog({
  open,
  onOpenChange,
  metric,
  onSave,
}: MetricRelationConfigDialogProps) {
  const [yoyMetric, setYoyMetric] = useState<SelectedMetric | null>(null);
  const [momMetric, setMomMetric] = useState<SelectedMetric | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [yoySelectorOpen, setYoySelectorOpen] = useState(false);
  const [momSelectorOpen, setMomSelectorOpen] = useState(false);

  // 当打开弹窗时，加载已有的关联关系
  useEffect(() => {
    if (open && metric) {
      // TODO: 从API加载已有的关联关系
      // 这里暂时清空
      setYoyMetric(null);
      setMomMetric(null);
    }
  }, [open, metric]);

  const handleClearYoy = () => {
    setYoyMetric(null);
  };

  const handleClearMom = () => {
    setMomMetric(null);
  };

  const handleSelectYoy = (selected: SelectedMetric) => {
    setYoyMetric(selected);
  };

  const handleSelectMom = (selected: SelectedMetric) => {
    setMomMetric(selected);
  };

  const handleSave = async () => {
    if (!metric) return;

    setIsLoading(true);
    try {
      // TODO: 调用API保存关联关系
      const data: RelationData = {
        metricId: metric.id,
        yoyMetricId: yoyMetric?.code || undefined,
        momMetricId: momMetric?.code || undefined,
      };
      
      console.log('保存关联关系:', data);
      onSave?.(data);
      onOpenChange(false);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!metric) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">关联配置</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* 当前指标信息 */}
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">当前指标</div>
              <div className="font-medium text-gray-900">
                {metric.name}
                <span className="ml-2 text-sm text-gray-500 font-normal">（{metric.type}类型）</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">编码：{metric.code}</div>
            </div>

            {/* 同比指标选择 */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-gray-700">同比指标</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px]">
                      <p className="text-xs">选择该指标的同比指标，建立关联关系。同比指标将用于展示该指标的同比增长情况。</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {yoyMetric ? (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{yoyMetric.name}</div>
                    <div className="text-xs text-gray-500">{yoyMetric.code}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    onClick={handleClearYoy}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-between text-gray-500 hover:text-gray-700 h-[60px]"
                  onClick={() => setYoySelectorOpen(true)}
                >
                  <span>点击选择同比指标</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* 环比指标选择 */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-gray-700">环比指标</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px]">
                      <p className="text-xs">选择该指标的环比指标，建立关联关系。环比指标将用于展示该指标的环比增长情况。</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {momMetric ? (
                <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{momMetric.name}</div>
                    <div className="text-xs text-gray-500">{momMetric.code}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    onClick={handleClearMom}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-between text-gray-500 hover:text-gray-700 h-[60px]"
                  onClick={() => setMomSelectorOpen(true)}
                >
                  <span>点击选择环比指标</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* 提示信息 */}
            <div className="text-xs text-gray-400 bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-600 mb-1">说明</div>
              <ul className="list-disc list-inside space-y-1 text-gray-500">
                <li>同比指标：展示指标与上年同期相比的变化情况</li>
                <li>环比指标：展示指标与上一周期相比的变化情况</li>
                <li>关联关系建立后，可在指标分析时自动展示关联数据</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : '确定'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 同比指标选择器 */}
      <MetricSelectorDialog
        open={yoySelectorOpen}
        onOpenChange={setYoySelectorOpen}
        title="选择同比指标"
        filterType="同比"
        excludeIds={metric ? [metric.id] : []}
        onSelect={handleSelectYoy}
      />

      {/* 环比指标选择器 */}
      <MetricSelectorDialog
        open={momSelectorOpen}
        onOpenChange={setMomSelectorOpen}
        title="选择环比指标"
        filterType="环比"
        excludeIds={metric ? [metric.id] : []}
        onSelect={handleSelectMom}
      />
    </>
  );
}
