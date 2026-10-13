'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StrategyDispatchContent from './StrategyDispatchContent';
import StrategyMakingPanel from './StrategyMakingPanel';
import ActivityConfigDialog from './ActivityConfigDialog';

interface StrategyDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indicatorName: string;
  scenario?: string;
  from?: string;
}

export default function StrategyDispatchDialog({
  open,
  onOpenChange,
  indicatorName,
  scenario = '流量运营',
  from = 'traffic-operations',
}: StrategyDispatchDialogProps) {
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [confirmedPlan, setConfirmedPlan] = useState<string | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden sm:max-w-[1240px]">
          <DialogHeader>
            <DialogTitle>策略调度</DialogTitle>
            <DialogDescription>制定策略活动，并提交调度派发</DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {/* 策略制定环节（调度流程中的一个环节，不跳转页面） */}
            <StrategyMakingPanel
              scenario={scenario}
              onNewStrategy={() => setActivityDialogOpen(true)}
              onConfirm={(data) => setConfirmedPlan(data.plan)}
            />

            {confirmedPlan && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                已采用策略：{confirmedPlan}
              </div>
            )}

            {/* 提交调度流程（保持原有调度派发流程不变） */}
            <StrategyDispatchContent
              indicatorName={indicatorName}
              from={from}
              embed
              onSubmitSuccess={() => onOpenChange(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 新建策略活动弹窗（复用活动配置的新建活动视图） */}
      <ActivityConfigDialog
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        onSubmitted={() => {
          setActivityDialogOpen(false);
          setConfirmedPlan('新建策略活动');
        }}
      />
    </>
  );
}
