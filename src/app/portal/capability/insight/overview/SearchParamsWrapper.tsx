'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

interface SearchParamsHandlerProps {
  onViewModeChange: (viewMode: 'tree' | 'metric') => void;
  onScrollToChange: (scrollTo: string | null) => void;
}

function SearchParamsHandler({ onViewModeChange, onScrollToChange }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();

  // 从 URL 参数读取视图模式
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'metric' || viewParam === 'tree') {
      onViewModeChange(viewParam);
    }
  }, [searchParams, onViewModeChange]);

  // 滚动到指定的指标卡片
  useEffect(() => {
    const scrollToParam = searchParams.get('scrollTo');
    if (scrollToParam) {
      onScrollToChange(scrollToParam);
    }
  }, [searchParams, onScrollToChange]);

  return null;
}

export default function SearchParamsWrapper(props: SearchParamsHandlerProps) {
  return (
    <Suspense fallback={null}>
      <SearchParamsHandler {...props} />
    </Suspense>
  );
}
