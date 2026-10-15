'use client';

import { Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ActivityConfigForm, { type ActivitySubmitData } from './ActivityConfigForm';
import type { ActivityType } from '@/lib/strategy-activity';

interface ActivityConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: (data: ActivitySubmitData) => void;
  initialName?: string;
  initialType?: ActivityType;
  initialScenario?: string;
  hideTargetGroup?: boolean;
  initialData?: Partial<ActivitySubmitData>;
}

export default function ActivityConfigDialog({ open, onOpenChange, onSubmitted, initialName, initialType, initialScenario, hideTargetGroup, initialData }: ActivityConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[1100px]">
        <DialogHeader>
          <DialogTitle>新建策略</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-1">
          {open && (
            <Suspense fallback={<div className="flex h-40 items-center justify-center text-sm text-muted-foreground">加载中...</div>}>
              <ActivityConfigForm mode="create-only" onSubmitted={onSubmitted} initialName={initialName} initialType={initialType} initialScenario={initialScenario} hideTargetGroup={hideTargetGroup} initialData={initialData} />
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
