'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StrategyMatchingContent from '@/components/strategy/StrategyMatchingContent';
import StrategyMatchingContentLegacy from '@/components/strategy/StrategyMatchingContentLegacy';

function StrategyMatchingPageInner() {
  const searchParams = useSearchParams();
  const indicatorName = searchParams.get('indicatorName') || searchParams.get('indicator') || undefined;
  const indicatorId = searchParams.get('indicatorId') || undefined;
  const from = searchParams.get('from') || undefined;
  const tab = searchParams.get('tab') || undefined;
  const template = searchParams.get('template') || undefined;
  const conclusion = searchParams.get('conclusion') || undefined;

  // 流量运营场景走新的策略匹配流程（数据洞察→策略匹配→调度派发），
  // 其余场景回退到 3645634 版本的五步全流程（接收诊断→历史效果参照→AI定策与比选→策略编辑→活动配置）。
  if (from === 'traffic-operations') {
    return (
      <StrategyMatchingContent
        indicatorName={indicatorName}
        indicatorId={indicatorId}
        from={from}
        tab={tab}
        template={template}
        conclusion={conclusion}
      />
    );
  }

  return (
    <StrategyMatchingContentLegacy
      indicatorName={indicatorName}
      indicatorId={indicatorId}
      from={from}
      tab={tab}
      template={template}
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
