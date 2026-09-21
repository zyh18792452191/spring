'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import { PageDescriptionWidget } from '@/components/PageDescriptionWidget';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // 存量视图页面全屏独立布局，不渲染标准导航栏
  const isFullScreen = pathname?.startsWith('/portal/stock-view');

  if (isFullScreen) {
    return <div className="h-screen overflow-hidden">{children}</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Header />
      <main className="flex-1 overflow-auto pt-[64px]">
        {children}
      </main>
      <PageDescriptionWidget />
    </div>
  );
}
