'use client';

import { Suspense } from 'react';
import ActivityConfigForm from '@/components/strategy/ActivityConfigForm';

export default function ActivityConfigPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">加载中...</div></div>}>
      <ActivityConfigForm mode="full" />
    </Suspense>
  );
}
