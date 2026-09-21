'use client';

import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertPeriodRecord } from '../data';

interface ViewAlertDialogProps {
  open: boolean;
  record: AlertPeriodRecord | null;
  onOpenChange: (open: boolean) => void;
}

/** 查看预警弹窗：展示 AI 预警依据与人工确认信息 */
export function ViewAlertDialog({ open, record, onOpenChange }: ViewAlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>预警信息</DialogTitle>
        </DialogHeader>

        {record && (
          <div className="space-y-4">
            {/* 预警依据（AI 生成） */}
            <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI 预警依据
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">指标账期</p>
                  <p className="text-gray-900 mt-0.5">{record.period}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">指标数值</p>
                  <p className="text-gray-900 mt-0.5 font-medium">{record.value}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">更新时间</p>
                  <p className="text-gray-900 mt-0.5">{record.updatedAt}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">是否执行指标预警</p>
                  <p className="mt-1">
                    {record.execStatus === 'alerted' ? (
                      <Badge className="bg-red-50 text-red-600 border-red-100">已执行已预警</Badge>
                    ) : (
                      <Badge className="bg-green-50 text-green-600 border-green-100">已执行未预警</Badge>
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">判定条件</p>
                  <p className="text-gray-900 mt-0.5">{record.condition}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">判定条件说明</p>
                  <p className="text-gray-700 mt-0.5 leading-relaxed">{record.conditionDesc}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">预警说明</p>
                  <p className="text-gray-700 mt-0.5 leading-relaxed">{record.alertDesc}</p>
                </div>
              </div>
            </div>

            {/* 确认信息 */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
              <p className="text-sm font-medium text-gray-900 mb-3">确认信息</p>
              <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">是否误判</p>
                  <p className="mt-1">
                    {record.misjudge === 'yes' ? (
                      <Badge className="bg-red-50 text-red-600 border-red-100">误判</Badge>
                    ) : (
                      <Badge className="bg-green-50 text-green-600 border-green-100">未误判</Badge>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">确认人</p>
                  <p className="text-gray-900 mt-0.5">{record.confirmUser ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">确认时间</p>
                  <p className="text-gray-900 mt-0.5">{record.confirmTime ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
