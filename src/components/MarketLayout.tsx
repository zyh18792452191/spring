'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Users,
  BarChart3,
  Target,
  LayoutDashboard,
  AlertCircle,
  FileText,
  Network,
  ChevronRight,
  Search,
  Bell,
  User,
  Home,
  ClipboardCheck,
  Send,
  Calendar,
  Wifi,
  Phone,
  Globe,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CampLogo } from '@/components/CampLogo';
import Header from '@/components/Header';

// 左侧菜单配置 - 市场运营相关（场景化统一入口，每个场景一个菜单项）
const marketNavigation = [
  {
    name: '运营总览',
    href: '/portal/market/overview',
    icon: BarChart3,
  },
  {
    name: '存量运营',
    icon: Home,
    children: [
      { name: '流量运营', href: '/portal/traffic-operations', icon: Wifi },
      { name: '中高端运营', href: '/portal/mid-high-customer-operations', icon: Users },
      { name: '离网维系', href: '/portal/churn-retention', icon: Phone },
      { name: '家庭运营', href: 'https://by8rvwqvk9.coze.site/portal/family-operations', icon: Users },
    ],
  },
  {
    name: '细分市场运营',
    icon: Globe,
    children: [
      { name: '国际运营', href: '/portal/customer/international/metrics', icon: Globe },
      { name: '校园运营', href: '/portal/campus-operations', icon: LayoutDashboard },
    ],
  },
];

interface MarketLayoutProps {
  children: React.ReactNode;
  forceActivePath?: string;
}

export default function MarketLayout({ children, forceActivePath }: MarketLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['存量运营']));

  // 判断菜单项是否激活
  const isActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const toggleExpand = (name: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setExpandedItems(newSet);
  };

  const renderMenuItem = (item: any, level: number = 0): React.ReactNode => {
    const hasChildren = 'children' in item && item.children && item.children.length > 0;
    const hasExternalUrl = 'externalUrl' in item && item.externalUrl;
    const isExpanded = expandedItems.has(item.name);
    const Icon = item.icon;

    return (
      <div key={item.name}>
        {hasExternalUrl ? (
          // 外部链接
          <a
            href={item.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100',
              sidebarCollapsed && 'justify-center px-0',
              level > 0 && 'pl-4'
            )}
            style={level > 0 ? { paddingLeft: `${level * 16 + 16}px` } : {}}
            title={sidebarCollapsed ? item.name : ''}
          >
            {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
            {!sidebarCollapsed && <span>{item.name}</span>}
          </a>
        ) : hasChildren ? (
          <>
            <div className="flex items-center">
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors flex-1',
                    isActive(item.href)
                      ? 'bg-[#0085D0] text-white'
                      : 'text-gray-700 hover:bg-gray-100',
                    sidebarCollapsed && 'justify-center px-0'
                  )}
                  style={level > 0 ? { paddingLeft: `${level * 16 + 16}px` } : {}}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              ) : (
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-colors flex-1',
                    isActive(item.href || '')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100',
                    sidebarCollapsed && 'justify-center px-0',
                    level > 0 && 'pl-4'
                  )}
                  style={level > 0 ? { paddingLeft: `${level * 16 + 16}px` } : {}}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronRight
                        className={`h-4 w-4 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </>
                  )}
                </button>
              )}
              {item.href && !sidebarCollapsed && (
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <ChevronRight
                    className={`h-4 w-4 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
              )}
            </div>

            {!sidebarCollapsed && isExpanded && (
              <div className="space-y-1 mt-1">
                {item.children.map((child: any) => renderMenuItem(child, level + 1))}
              </div>
            )}
          </>
        ) : (
          <Link
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'bg-[#0085D0] text-white'
                : 'text-gray-700 hover:bg-gray-100',
              sidebarCollapsed && 'justify-center px-0',
              level > 0 && 'pl-4'
            )}
            style={level > 0 ? { paddingLeft: `${level * 16 + 16}px` } : {}}
            title={sidebarCollapsed ? item.name : ''}
          >
            {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
            {!sidebarCollapsed && <span>{item.name}</span>}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col">
      <Header forceActivePath={forceActivePath} />

      {/* 主内容区域 - 包含左侧菜单 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧侧边栏 */}
        <aside
          className={cn(
            'w-64 border-r bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col pt-[64px]',
            sidebarCollapsed ? 'w-20' : 'w-64'
          )}
        >
          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold text-[#0085D0]">市场运营</h2>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {marketNavigation.map((item) => renderMenuItem(item))}
          </nav>

          {/* 收起/展开按钮 */}
          <div className="border-t px-4 py-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex w-full items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span>收起</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* 页面内容区域 */}
        <main className="flex-1 overflow-y-auto pt-[64px]">
          {children}
        </main>
      </div>
    </div>
  );
}
