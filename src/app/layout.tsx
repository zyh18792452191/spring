import type { Metadata } from 'next';
import EditorWrapper from '@/components/EditorWrapper';
import HideDevTools from '@/components/HideDevTools';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '新疆移动市场运营平台',
    template: '%s | 新疆移动市场运营平台',
  },
  description: '新疆市场数智运营平台，提供全方位的市场运营、商机管理、调度执行和数据分析功能',
  keywords: [
    '新疆市场运营',
    '商机管理',
    '调度执行',
    '运营平台',
    '数据分析',
    '数智运营',
  ],
  authors: [{ name: '市场运营平台' }],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: '市场运营平台',
    description: '专业的营地装备与人员运营管理系统',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {/* 开发工具Inspector已隐藏 */}
        {/* {isDev && <Inspector />} */}
        {/* 隐藏Next.js开发工具浮动按钮 */}
        <HideDevTools />
        <EditorWrapper>
          {children}
        </EditorWrapper>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
