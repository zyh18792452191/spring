'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3,
  TrendingUp,
  Users,
  ClipboardCheck,
  Settings,
  Menu,
  X,
  ChevronRight,
  Search,
  Bell,
  User,
  FileText,
  Target,
  Smartphone,
  ShoppingBag,
  Gift,
  Crown,
  Globe,
  Briefcase,
  Shield,
  Network,
  Zap,
  Phone,
  Monitor,
  UserPlus,
  Home,
  Megaphone,
  Package,
  Star,
  AlertTriangle,
  UserCog,
  CheckCircle,
  Send,
  Code,
  Tag
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CampLogo } from '@/components/CampLogo';
import Header from '@/components/Header';
import TabsBar from '@/components/TabsBar';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { TabsProvider, useTabs } from '@/contexts/TabsContext';

// 辅助图标组件 - 只自定义lucide-react中没有的
const Plane = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12h20"/>
    <path d="M12 2v20"/>
    <path d="M19.5 12L2.5 19"/>
    <path d="M19.5 12L2.5 5"/>
  </svg>
);

const Eye = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4"/>
    <path d="M12 16h.01"/>
  </svg>
);

const Heart = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const PlusCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="16"/>
    <line x1="8" x2="16" y1="12" y2="12"/>
  </svg>
);

const MessageSquare = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const Building2 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
    <path d="M10 6h4"/>
    <path d="M10 10h4"/>
    <path d="M10 14h4"/>
    <path d="M10 18h4"/>
  </svg>
);

const Database = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);

const CreditCard = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="5" rx="2"/>
    <line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);

const Calendar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const PlaneTakeoff = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12h20"/>
    <path d="M20 2v4"/>
    <path d="M20 6l-2 2"/>
    <path d="M20 2l-2 2"/>
  </svg>
);

const PlaneLanding = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12h20"/>
    <path d="M4 22v-4"/>
    <path d="M4 18l2-2"/>
    <path d="M4 22l2-2"/>
  </svg>
);

const navigation = [
  {
    name: '工作台首页',
    href: '/workspace',
    icon: Home,
  },
  {
    name: '洞察管理',
    icon: TrendingUp,
    children: [
      {
        name: '指标管理',
        children: [
          { name: '指标库管理', href: '/workspace/insight/metrics/library', icon: Database },
          { name: '指标组管理', href: '/workspace/insight/metrics/group', icon: Network },
          { name: '指标卡管理', href: '/workspace/insight/metrics/card', icon: CreditCard },
          { name: '指标树管理', href: '/workspace/insight/metrics/tree', icon: FileText },
          { name: '指标看管人', href: '/workspace/insight/metrics/guardian', icon: UserCog },
        ]
      },
      {
        name: '客群标签管理',
        children: [
          { name: '客群管理', href: '/workspace/insight/tags/segment', icon: Users },
          { name: '客户标签管理', href: '/workspace/insight/tags/customer', icon: UserPlus },
        ]
      },
      {
        name: '预警管理',
        children: [
          { name: '预警配置管理', href: '/workspace/insight/alert/config', icon: Settings },
          { name: '预警清单', href: '/workspace/insight/alert/list', icon: FileText },
          { name: '中高端维系预警管理', href: '/workspace/insight/alert/high-end', icon: AlertCircle },
        ]
      },
      {
        name: '智能报告管理',
        children: [
          { name: '模板管理', href: '/workspace/insight/report/template', icon: FileText },
          { name: '报告管理', href: '/workspace/insight/report/list', icon: FileText },
        ]
      }
    ]
  },
  {
    name: '策略管理',
    icon: Target,
    children: [
      { name: '指标策略', href: '/workspace/strategy/metrics', icon: BarChart3 },
      { name: '策略管理', href: '/workspace/strategy/list', icon: Target },
    ]
  },
  {
    name: '调度管理',
    icon: Send,
    children: [
      { name: '工单提交', href: '/workspace/dispatch/submit', icon: Send },
      { name: '工单处理', href: '/workspace/dispatch/process', icon: ClipboardCheck },
      { name: '工单查询', href: '/workspace/dispatch/query', icon: Search },
      {
        name: '工单配置管理',
        children: [
          { name: '工单类型管理', href: '/workspace/dispatch/config/type', icon: Settings },
          { name: '流程配置', href: '/workspace/dispatch/config/process', icon: Network },
        ]
      }
    ]
  },
  {
    name: '内容管理',
    icon: Megaphone,
    children: [
      { name: '素材管理', href: '/workspace/content/material', icon: Package },
      { name: '案例管理', href: '/workspace/content/case', icon: Star },
      {
        name: '内容配置管理',
        children: [
          { name: '表单配置化管理', href: '/workspace/content/config/form', icon: FileText },
          { name: '内容标签管理', href: '/workspace/content/config/tags', icon: Tag },
        ]
      }
    ]
  },
  {
    name: '开发管理',
    icon: Code,
    children: [
      {
        name: '任务管理',
        children: [
          { name: '定时任务管理', href: '/workspace/dev/task/schedule', icon: Calendar },
          { name: '执行记录管理', href: '/workspace/dev/task/record', icon: FileText },
        ]
      },
      { name: '数据底座', href: '/workspace/dev/database', icon: Database },
      {
        name: '智能体管理',
        children: [
          { name: '提示词模板', href: '/workspace/dev/agent/prompt', icon: FileText },
          { name: '特征配置', href: '/workspace/dev/agent/feature', icon: Settings },
          { name: '输出配置', href: '/workspace/dev/agent/output', icon: Network },
          { name: '数据稽核', href: '/workspace/dev/agent/audit', icon: CheckCircle },
        ]
      }
    ]
  },
  {
    name: '系统管理',
    icon: Settings,
    children: [
      { name: '消息模板管理', href: '/workspace/system/message-template', icon: MessageSquare },
      { name: '公告管理', href: '/workspace/system/announcement', icon: Megaphone },
      {
        name: '角色权限管理',
        children: [
          { name: '用户管理', href: '/workspace/system/rbac/user', icon: Users },
          { name: '组织管理', href: '/workspace/system/rbac/org', icon: Building2 },
          { name: '菜单管理', href: '/workspace/system/rbac/menu', icon: Menu },
          { name: '角色管理', href: '/workspace/system/rbac/role', icon: UserCog },
          { name: '数据字典', href: '/workspace/system/rbac/dict', icon: Database },
          { name: '日志管理', href: '/workspace/system/rbac/log', icon: FileText },
          { name: '菜单API管理', href: '/workspace/system/rbac/api', icon: Network },
        ]
      }
    ]
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['我的工作台']));

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  // 递归渲染菜单项
  const renderMenuItem = (item: any, level: number = 0) => {
    const isActive = pathname === item.href;
    const hasChildren = 'children' in item && item.children;
    const isExpanded = expandedItems.has(item.name);
    const Icon = item.icon;

    return (
      <div key={item.name}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpand(item.name)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                isActive
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
            
            {!sidebarCollapsed && isExpanded && (
              <div className="space-y-1 mt-1">
                {item.children.map((child: any) => renderMenuItem(child, level + 1))}
              </div>
            )}
          </>
        ) : (
          <Link
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
              isActive
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

  // 面包屑导航组件
  function Breadcrumbs() {
    const { breadcrumbs } = useNavigation();

    if (breadcrumbs.length === 0) {
      return null;
    }

    return (
      <div className="px-6 py-3 bg-white border-b border-gray-200">
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-[#0085D0] transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? 'text-[#0085D0] font-medium' : 'text-gray-600'}>
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>
    );
  }

  function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    // 如果是 strategy 相关的页面，不渲染 Header 和左侧菜单
    // 这些页面自己会渲染 Portal 风格的布局
    const isStrategyPage = pathname?.startsWith('/workspace/strategy');

    if (isStrategyPage) {
      return <>{children}</>;
    }

    return (
      <div className="flex h-screen bg-gray-50 flex-col">
        <Header />

        {/* 主内容区域 - 包含左侧菜单 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧侧边栏 */}
          <aside
            className={cn(
              'w-64 border-r bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col',
              sidebarCollapsed ? 'w-20' : 'w-64'
            )}
          >
            {/* 导航菜单 */}
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
              {navigation.map((item) => renderMenuItem(item))}
            </nav>

            {/* 收起/展开按钮 */}
            <div className="border-t px-4 py-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex w-full items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded"
              >
                <Menu className="h-4 w-4" />
                {!sidebarCollapsed && <span>{sidebarCollapsed ? '展开' : '收起'}</span>}
              </button>
            </div>
          </aside>

          {/* 页面内容区域 */}
          <main className="flex-1 overflow-y-auto flex flex-col">
            {/* 面包屑导航 */}
            <Breadcrumbs />

            {/* 页面内容 */}
            <div className="flex-1 p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <NavigationProvider>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </NavigationProvider>
  );
}
