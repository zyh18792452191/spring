'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface Metric {
  id: string;
  name: string;
  code: string;
  period: string; // '日' 或 '月'
  value: string;
  latestPeriod?: string; // 该指标的最新数据账期（如 '2025-03-20' 或 '2025-03'）
}

interface MetricExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMetrics: Metric[];
  onExport: (params: ExportParams) => void;
}

export interface ExportParams {
  dayPeriod?: string; // 日账期（格式：2025-03-20）
  monthPeriod?: string; // 月账期（格式：2025-03）
}

export default function MetricExportDialog({
  open,
  onOpenChange,
  selectedMetrics,
  onExport,
}: MetricExportDialogProps) {
  const [dayPeriod, setDayPeriod] = useState('');
  const [monthPeriod, setMonthPeriod] = useState('');

  // 计算选中的指标统计
  const stats = {
    total: selectedMetrics.length,
    day: selectedMetrics.filter(m => m.period === '日').length,
    month: selectedMetrics.filter(m => m.period === '月').length,
  };

  // 计算默认账期（T-1日期或T-1月份）
  useEffect(() => {
    const getTMinus1Date = () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    };

    const getTMinus1Month = () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    };

    setDayPeriod(getTMinus1Date());
    setMonthPeriod(getTMinus1Month());
  }, []);

  // 处理导出
  const handleExport = () => {
    const params: ExportParams = {};

    if (stats.day > 0) {
      params.dayPeriod = dayPeriod;
    }
    if (stats.month > 0) {
      params.monthPeriod = monthPeriod;
    }

    onExport(params);
    onOpenChange(false);
  };

  // 重置状态
  useEffect(() => {
    if (open) {
      // 重置为默认账期
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">指标数据导出</DialogTitle>
          <DialogDescription>
            已选中 {stats.total} 个指标（日指标 {stats.day} 个，月指标 {stats.month} 个）
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 账期选择 */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            {/* 日账期选择 */}
            {stats.day > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  日账期
                </Label>
                <InputWithDatePicker
                  value={dayPeriod}
                  onChange={setDayPeriod}
                  placeholder="选择日期"
                  type="date"
                />
                <p className="text-xs text-gray-500">
                  将导出日指标账期为 {dayPeriod} 的数据
                </p>
              </div>
            )}

            {/* 月账期选择 */}
            {stats.month > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  月账期
                </Label>
                <InputWithDatePicker
                  value={monthPeriod}
                  onChange={setMonthPeriod}
                  placeholder="选择月份"
                  type="month"
                />
                <p className="text-xs text-gray-500">
                  将导出月指标账期为 {monthPeriod} 的数据
                </p>
              </div>
            )}

            {/* 说明 */}
            <div className="p-3 bg-blue-100 rounded-md">
              <p className="text-xs text-blue-800">
                <strong>导出说明：</strong>
                {stats.day > 0 && stats.month > 0
                  ? `将导出两份报表：一份日报表（${dayPeriod}），一份月报表（${monthPeriod}）`
                  : stats.day > 0
                  ? `将导出日报表（${dayPeriod}）`
                  : `将导出月报表（${monthPeriod}）`
                }
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            确定导出
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 一个简单的日期输入组件
function InputWithDatePicker({
  value,
  onChange,
  placeholder,
  type,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: 'date' | 'month';
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
