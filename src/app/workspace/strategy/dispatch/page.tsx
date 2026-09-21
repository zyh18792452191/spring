'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StrategyDispatchContent from '@/components/strategy/StrategyDispatchContent';

function StrategyDispatchPageInner() {
  const searchParams = useSearchParams();
  return (
    <StrategyDispatchContent
      indicatorName={searchParams.get('indicatorName') || undefined}
      from={searchParams.get('from') || undefined}
    />
  );
}

export default function StrategyDispatchPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">加载中...</div></div>}>
      <StrategyDispatchPageInner />
    </Suspense>
  );
}
