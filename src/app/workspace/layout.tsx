'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Activity,
  TrendingUp,
  Users,
  ClipboardCheck,
  Settings,
  Menu,
  ChevronRight,
  FileText,
  Target,
  Network,
  CreditCard,
  Database,
  UserCog,
  UserPlus,
  AlertCircle,
  Home,
  Send,
  Search,
  Megaphone,
  Package,
  Star,
  Tag,
  Code,
  Calendar,
  CheckCircle,
  MessageSquare,
  Building2,
  FolderTree,
  Briefcase,
  GitBranch,
  LayoutList,
  Inbox,
  Layers,
  Handshake,
  History,
  BookOpen,
  // Smartphone,
  Play,
  LayoutTemplate,
  Monitor,


} from 'lucide-react';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import TabsBar from '@/components/TabsBar';
import { PageDescriptionWidget } from '@/components/PageDescriptionWidget';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { TabsProvider, useTabs } from '@/contexts/TabsContext';

// 辅助图标组件
const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

const navigation = [
  {
    name: '工作台首页',
    href: '/workspace',
    icon: Home,
  },
  // 页面管理菜单（已隐藏）
  // {
  //   name: '页面管理',
  //   icon: FileText,
  //   children: [
  //     { name: '页面数据管理', href: '/workspace/admin/pages', icon: Database },
  //   ]
  // },
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
        name: '商机管理',
        children: [
          { name: '客户商机', href: '/workspace/business-opportunity/customer', icon: Briefcase },
          // { name: '客群商机', href: '/workspace/business-opportunity/group', icon: Users },
          { name: '商机分类管理', href: '/workspace/business-opportunity/category', icon: FolderTree },
          { name: '商机源管理', href: '/workspace/business-opportunity/source', icon: Database },
          { name: '商机业务类型', href: '/workspace/business-opportunity/business-type', icon: Tag },
          { name: '清洗规则管理', href: '/workspace/business-opportunity/cleaning-rules', icon: Settings },
          { name: '商机评级规则', href: '/workspace/business-opportunity/rating-rules', icon: Star },
          { name: '商机调级管理', href: '/workspace/business-opportunity/rating-adjustment', icon: GitBranch },
          { name: '预警规则管理', href: '/workspace/business-opportunity/warning-rules', icon: AlertCircle },
        ]
      },
      {
        name: '预警管理',
        children: [
          { name: '预警配置管理', href: '/workspace/insight/alert/config', icon: Settings },
          { name: '预警清单', href: '/workspace/insight/alert/list', icon: FileText },
          { name: 'AI指标监控预警', href: '/workspace/insight/alert/ai-monitor', icon: Activity },
          { name: '中高端维系预警管理', href: '/workspace/insight/alert/high-end', icon: AlertCircleIcon },
        ]
      },
      {
        name: 'AI洞察管理',
        children: [
          { name: '模板管理', href: '/workspace/ai-insight/templates', icon: LayoutTemplate },
          { name: '数据源管理', href: '/workspace/ai-insight/datasources', icon: Database },
        ]
      },
      {
        name: '常规报告',
        children: [
          { name: '报告管理', href: '/workspace/insight/report/management', icon: FileText },
          { name: '模板管理', href: '/workspace/insight/report/template', icon: FileText },
        ]
      },
    ]
  },

  {
    name: '策略管理',
    icon: Target,
    children: [
      { name: '根因库管理', href: '/workspace/strategy/root-cause', icon: BarChart3 },
      { name: '策略库管理', href: '/workspace/strategy/library', icon: Target },
      { name: '关联关系查询', href: '/workspace/strategy/relation', icon: Network },
      { name: '接收诊断', href: '/workspace/strategy/receive-diagnosis', icon: Inbox },
      {
        name: '策略沉淀',
        children: [
          { name: '效果库', href: '/workspace/strategy-repository/effect', icon: Layers },
          { name: '最佳实践', href: '/workspace/strategy-repository/best-practice', icon: BookOpen },
          { name: '策略版本', href: '/workspace/strategy-repository/version', icon: History },
          { name: '模板管理', href: '/workspace/strategy-repository/template', icon: FileText },
        ]
      },
      // 跨中心协作菜单已隐藏（需求：隐藏跨中心协作菜单）
      // {
      //   name: '跨中心协作',
      //   children: [
      //     { name: '与洞察中心协作', href: '/workspace/strategy-collab/insight', icon: BarChart3 },
      //     { name: '与调度中心协作', href: '/workspace/strategy-collab/dispatch', icon: Send },
      //     { name: '与评估中心协作', href: '/workspace/strategy-collab/evaluation', icon: ClipboardCheck },
      //     { name: '与知识中心协作', href: '/workspace/strategy-collab/knowledge', icon: BookOpen },
      //   ]
      // },
      // 网格通活动配置菜单已隐藏（需求：隐藏剧本营销和网格通活动配置菜单）
      // { name: '网格通活动配置', href: '/workspace/strategy/grid-config', icon: Smartphone },
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
    name: '报表中心',
    icon: LayoutList,
    children: [
      { name: '报表管理', href: '/workspace/report-center/custom-reports', icon: LayoutList },
      { name: '我的报表', href: '/workspace/report-center/report-run', icon: Play },
      { name: '模板管理', href: '/workspace/report-center/templates', icon: LayoutTemplate },
      { name: '全量用户看管关系监控', href: '/workspace/report-center/customer-supervision', icon: Users },
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
        name: '页面场景管理',
        children: [
          { name: '场景管理', href: '/workspace/insight/page-scenario/scenarios', icon: Network },
          { name: '页面管理', href: '/workspace/insight/page-scenario/pages', icon: FileText },
        ]
      },
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
      { name: '投屏管理', href: '/workspace/system/screen', icon: Monitor },
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

function WorkspaceLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { addTab, setActiveTab, tabs } = useTabs();
  const { breadcrumbs, setBreadcrumbs } = useNavigation();

  const toggleExpand = (itemName: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemName)) {
        next.delete(itemName);
      } else {
        next.add(itemName);
      }
      return next;
    });
  };

  // 处理菜单点击，添加标签并导航
  const handleMenuClick = useCallback((name: string, href: string) => {
    addTab({
      id: href,
      title: name,
      path: href,
    });
    setActiveTab(href);
    router.push(href);
  }, [addTab, setActiveTab, router]);

  // 根据当前路径自动激活对应标签
  useEffect(() => {
    if (pathname) {
      // 查找所有匹配当前路径的菜单项
      const findAllMatchingMenuItems = (items: any[], path: string, parents: any[] = []): any[] => {
        const matches: any[] = [];

        for (const item of items) {
          if (item.href && (path === item.href || path.startsWith(item.href + '/'))) {
            matches.push({ ...item, level: parents.length });
          }

          if (item.children) {
            const childMatches = findAllMatchingMenuItems(item.children, path, [...parents, item]);
            matches.push(...childMatches);
          }
        }

        return matches;
      };

      // 查找所有父级菜单项，用于自动展开
      const findParentMenuItems = (items: any[], path: string, parents: any[] = []): any[] => {
        for (const item of items) {
          const hasChildren = item.children && item.children.length > 0;

          // 如果有子菜单，递归查找
          if (hasChildren) {
            const found = findParentMenuItems(item.children, path, [...parents, item]);
            if (found.length > 0) {
              return found;
            }
          } else if (item.href && (path === item.href || path.startsWith(item.href + '/'))) {
            // 如果是叶子节点且路径匹配，返回所有父级菜单
            return [...parents, item];
          }
        }
        return [];
      };

      // 收集所有匹配项
      const allMatches = findAllMatchingMenuItems(navigation, pathname);

      // 找到最精确的匹配（最长路径匹配）
      let bestMatch: any = null;
      if (allMatches.length > 0) {
        // 按 href 长度排序，取最长的（最精确的）
        allMatches.sort((a, b) => (b.href?.length || 0) - (a.href?.length || 0));
        bestMatch = allMatches[0];
      }

      // 如果是工作台首页，特殊处理
      if (pathname === '/workspace') {
        bestMatch = navigation[0]; // 工作台首页
      }

      // 查找并展开所有父级菜单
      const parentItems = findParentMenuItems(navigation, pathname);
      if (parentItems.length > 0) {
        const expandedSet = new Set<string>();
        parentItems.forEach((item) => {
          if (item.name) {
            expandedSet.add(item.name);
          }
        });
        setExpandedItems(expandedSet);
      }

      // 激活对应的标签
      // 优先在 tabs 中查找匹配当前路径的标签
      // 先精确匹配pathname，再按路径前缀匹配（处理ticket-detail等带query参数的非菜单页面）
      const matchingTab = tabs.find(t => t.path === pathname) || tabs.find(t => t.path.startsWith(pathname + '?'));
      if (matchingTab) {
        // 如果 tabs 中已有匹配的标签，直接激活它
        setActiveTab(matchingTab.id);
      } else if (bestMatch && bestMatch.href) {
        // 否则，使用菜单项查找结果
        addTab({
          id: bestMatch.href,
          title: bestMatch.name,
          path: bestMatch.href,
        });
        setActiveTab(bestMatch.href);
      } else if (pathname === '/workspace') {
        setActiveTab('/workspace');
      }
    }
  }, [pathname, addTab, setActiveTab, tabs]);

  // 判断当前路径是否匹配
  // 同级菜单项路径集合：这些路径之间不应存在父子高亮关系
  const siblingMenuPaths = [
    '/workspace/ai-insight',
    '/workspace/ai-insight/reports',
    '/workspace/ai-insight/templates',
    '/workspace/ai-insight/datasources',
    '/workspace/ai-insight/knowledge',
    '/workspace/insight/report/management',
    '/workspace/insight/report/template',
    '/workspace/business-opportunity',
  ];
  const isActive = (path: string) => {
    if (!path) return false;
    // 同级菜单项：精确匹配，避免子路径误高亮（如访问/reports时不应高亮/workspace/ai-insight）
    if (siblingMenuPaths.includes(path) && path !== '/workspace') {
      return pathname === path;
    }
    return pathname === path || (pathname?.startsWith(path + '/') && path !== '/workspace');
  };

  // 检查当前路径是否是某个菜单项的子路径
  const isParentActive = (item: any): boolean => {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      return item.children.some((child: any) => isParentActive(child));
    }
    return false;
  };

  // 递归渲染菜单项
  const renderMenuItem = (item: any, level: number = 0) => {
    const hasChildren = 'children' in item && item.children;
    const isParent = isParentActive(item);
    const isExpanded = expandedItems.has(item.name) || isParent; // 如果是激活的父级菜单，自动展开
    const Icon = item.icon;

    return (
      <div key={item.name}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpand(item.name)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                isParent
                  ? 'bg-[#0085D0] text-white'
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
                    className={`h-4 w-4 flex-shrink-0 transition-transform ${isParent ? 'text-white' : 'text-gray-400'} ${isExpanded ? 'rotate-90' : ''}`}
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
          <button
            onClick={() => handleMenuClick(item.name, item.href)}
            className={cn(
              'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors w-full',
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
          </button>
        )}
      </div>
    );
  };

  // 处理标签点击
  const handleTabClick = useCallback((tab: { id: string; path: string; title: string }) => {
    setActiveTab(tab.id);
    router.push(tab.path);
  }, [setActiveTab, router]);

  // 全屏页面（无侧边栏）：AI洞察助手、策略调度派发页等
  // 剧本营销策划页：从菜单入口进入时全屏，从工单详情进入时带侧边栏(mode=sidebar)
  const isScriptMarketingFullscreen = pathname === '/workspace/script-marketing' && searchParams.get('mode') !== 'sidebar';
  const isFullscreenPage = pathname === '/workspace/ai-insight' || pathname?.includes('/strategy/dispatch') || pathname?.includes('/strategy/match') || isScriptMarketingFullscreen;

  if (isFullscreenPage) {
    return (
      <div className="flex h-screen bg-gray-50 flex-col">
        <Header />
        <TabsBar onTabClick={handleTabClick} />
        <main className="flex-1 overflow-y-auto pt-[64px]">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 flex-col">
      <Header />

      {/* 主内容区域 - 包含左侧菜单 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧侧边栏 */}
        <aside
          className={cn(
            'w-64 border-r bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col pt-[64px]',
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
        <main className="flex-1 overflow-y-auto flex flex-col pt-[64px]">
          {/* 多标签栏 */}
          {tabs.length > 0 && (
            <TabsBar onTabClick={handleTabClick} />
          )}

          {/* 页面内容 */}
          <div className="flex-1">
            {children}
          </div>
        </main>

        {/* 页面业务说明组件 - 已隐藏 */}
      </div>
    </div>
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TabsProvider>
      <NavigationProvider>
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-pulse text-muted-foreground">加载中...</div></div>}>
          <WorkspaceLayoutContent>{children}</WorkspaceLayoutContent>
        </Suspense>
      </NavigationProvider>
    </TabsProvider>
  );
}
