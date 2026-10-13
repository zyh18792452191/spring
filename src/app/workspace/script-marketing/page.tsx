'use client';

import { Suspense } from 'react';
import { ScriptMarketingContent } from '@/components/strategy/ScriptMarketingEditor';

export default function ScriptMarketingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-muted-foreground">加载中...</div>}>
      <ScriptMarketingContent />
    </Suspense>
  );
}
