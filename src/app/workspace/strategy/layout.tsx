'use client';

import { ReactNode } from 'react';
import { PageDescriptionWidget } from '@/components/PageDescriptionWidget';

export default function StrategyLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 这个 layout 完全覆盖 workspace/layout.tsx
  // workspace/layout.tsx 包含了 Header 和左侧菜单栏
  // 这里我们什么都不做，让子页面自己定义布局
  return (
    <>
      {children}
      <PageDescriptionWidget />
    </>
  );
}
