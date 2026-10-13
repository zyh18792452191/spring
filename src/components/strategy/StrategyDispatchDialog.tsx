'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StrategyDispatchContent, { type StrategyDispatchSubmitPayload } from './StrategyDispatchContent';
import StrategyMakingPanel from './StrategyMakingPanel';
import ActivityConfigDialog from './ActivityConfigDialog';
import { recordActivityInstance } from '@/lib/activity-instances';

interface StrategyDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indicatorName: string;
  scenario?: string;
  from?: string;
  showStrategyMaking?: boolean; // 页面已完成策略制定时传 false，弹窗内仅展示调度派发表单
}

export default function StrategyDispatchDialog({
  open,
  onOpenChange,
  indicatorName,
  scenario = '流量运营',
  from = 'traffic-operations',
  showStrategyMaking = true,
}: StrategyDispatchDialogProps) {
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [confirmedStrategy, setConfirmedStrategy] = useState<{ plan: string; speech: string } | null>(null);

  const handleSubmitSuccess = (payload: StrategyDispatchSubmitPayload) => {
    // 提交后除生成调度工单外，同步生成活动实例，可在活动配置中查看
    recordActivityInstance({
      name: payload.orderTitle,
      type: payload.dispatchSystem === '剧本营销' ? '剧本营销' : 'IOP普通营销',
      scenario,
      source: '策略调度',
      dispatchSystem: payload.dispatchSystem,
      strategyPlan: confirmedStrategy?.plan,
      speech: confirmedStrategy?.speech,
    });
    onOpenChange(false);
  };

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
            {showStrategyMaking && (
              <>
                <StrategyMakingPanel
                  scenario={scenario}
                  onNewStrategy={() => setActivityDialogOpen(true)}
                  onConfirm={(data) => setConfirmedStrategy({ plan: data.plan, speech: data.speech })}
                />

                {confirmedStrategy && (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    已采用策略：{confirmedStrategy.plan}
                  </div>
                )}
              </>
            )}

            {/* 提交调度流程（保持原有调度派发流程不变） */}
            <StrategyDispatchContent
              indicatorName={indicatorName}
              from={from}
              embed
              onSubmitSuccess={handleSubmitSuccess}
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
          setConfirmedStrategy({ plan: '新建策略活动', speech: '' });
        }}
      />
    </>
  );
}
