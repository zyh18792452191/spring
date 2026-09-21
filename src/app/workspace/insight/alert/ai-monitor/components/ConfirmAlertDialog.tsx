'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertPeriodRecord, MisjudgeStatus } from '../data';

interface ConfirmAlertDialogProps {
  open: boolean;
  record: AlertPeriodRecord | null;
  onOpenChange: (open: boolean) => void;
  /** 确认结果：misjudge=no 未误判 / yes 误判 */
  onConfirm: (record: AlertPeriodRecord, misjudge: Exclude<MisjudgeStatus, 'pending'>) => void;
}

/** 确认预警弹窗：展示 AI 预警依据，由人工判断是否误判 */
export function ConfirmAlertDialog({ open, record, onOpenChange, onConfirm }: ConfirmAlertDialogProps) {
  const [misjudge, setMisjudge] = useState<Exclude<MisjudgeStatus, 'pending'>>('no');

  const handleSubmit = () => {
    if (!record) return;
    onConfirm(record, misjudge);
    onOpenChange(false);
    setMisjudge('no');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>确认预警</DialogTitle>
          <DialogDescription>
            系统对该账期指标执行了预警判定，请结合预警依据确认该次预警是否为误判
          </DialogDescription>
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
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">判定条件</p>
                  <p className="text-gray-900 mt-0.5">{record.condition}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">判定条件说明</p>
                  <p className="text-gray-700 mt-0.5 leading-relaxed">{record.conditionDesc}</p>
                </div>
              </div>
            </div>

            {/* 是否误判 */}
            <div>
              <Label className="text-sm text-gray-700">
                <span className="text-red-500 mr-0.5">*</span>是否误判
              </Label>
              <RadioGroup
                value={misjudge}
                onValueChange={(v) => setMisjudge(v as Exclude<MisjudgeStatus, 'pending'>)}
                className="flex gap-8 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="mj-no" />
                  <Label htmlFor="mj-no" className="font-normal text-sm text-gray-700 cursor-pointer">
                    未误判（预警合理）
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="mj-yes" />
                  <Label htmlFor="mj-yes" className="font-normal text-sm text-gray-700 cursor-pointer">
                    误判（预警不合理）
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            className={cn('bg-[#0085D0] hover:bg-[#006BB0] text-white')}
          >
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
