'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StrategyMatchingContent from '@/components/strategy/StrategyMatchingContent';

function StrategyMatchingPageInner() {
  const searchParams = useSearchParams();
  return (
    <StrategyMatchingContent
      indicatorName={searchParams.get('indicatorName') || undefined}
      indicatorId={searchParams.get('indicatorId') || undefined}
      from={searchParams.get('from') || undefined}
      tab={searchParams.get('tab') || undefined}
    />
  );
}

export default function StrategyMatchingPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">加载中...</div></div>}>
      <StrategyMatchingPageInner />
    </Suspense>
  );
}
