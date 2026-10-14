'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, ChevronDown, Menu, X, ChevronRight } from 'lucide-react';
import { CampLogo } from '@/components/CampLogo';

interface HeaderProps {
  isWorkspace?: boolean;
  forceActivePath?: string;
}

// 菜单项配置
interface MenuItem {
  name: string;
  path: string;
  href?: string; // 可选的链接地址
  hidden?: boolean;
  externalUrl?: string; // 外部链接
  style?: React.CSSProperties; // 自定义样式
  className?: string; // 自定义类名
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    name: '运营概览',
    path: '/',
  },
  {
    name: '市场运营',
    path: '/portal/market',
    children: [
      {
        name: '运营总览',
        path: '/portal/market/overview',
        hidden: true,
        children: [
          { name: '市场运营总览', path: '/portal/market/overview' },
        ],
      },
      {
        name: '存量运营',
        path: '/portal/customer/retention',
        children: [
          { name: '流量运营', path: '/portal/traffic-operations' },
          { name: '中高端运营', path: '/portal/mid-high-customer-operations' },
          { name: '离网维系', path: '/portal/churn-retention' },
          { name: '家庭运营', path: '/portal/family-operations' },
        ],
      },
      {
        name: '细分市场运营',
        path: '/portal/segment-market',
        children: [
          { name: '国际运营', path: '/portal/customer/international/metrics' },
          { name: '校园运营', path: '/portal/campus-operations' },
        ],
      },
    ],
  },
  /* [HIDDEN] 暂时隐藏精益运营菜单
  {
    name: '精益运营',
    path: '/portal/lean',
    children: [
      { name: '运营驾驶舱', path: '/portal/lean/cockpit' },
      {
        name: '事前预警',
        path: '/portal/lean/pre-warning',
        children: [
          { name: '预警任务管理', path: '/portal/lean/pre-warning/task-manage' },
          { name: '预警任务审批', path: '/portal/lean/pre-warning/task-approval' },
          {
            name: '预警工单管理',
            path: '/portal/lean/pre-warning/ticket-manage',
            children: [
              { name: '保有预警工单', path: '/portal/lean/pre-warning/ticket-manage/retain' },
              { name: '保有工单审批', path: '/portal/lean/pre-warning/ticket-manage/retain-approval' },
            ],
          },
          { name: '全量用户看管关系监控', path: '/portal/lean/pre-warning/custody-monitor' },
        ],
      },
      {
        name: '任务工作台',
        path: '/portal/lean/task-workbench',
        children: [
          { name: '我的保有任务', path: '/portal/lean/task-workbench/my-retain-task' },
          { name: '我的督办任务', path: '/portal/lean/task-workbench/my-supervision-task' },
        ],
      },
      {
        name: '事中监控',
        path: '/portal/lean/in-process',
        children: [
          { name: '一线任务执行监控', path: '/portal/lean/in-process/frontline-monitor' },
          { name: '集运任务执行盯控', path: '/portal/lean/in-process/centralized-monitor' },
        ],
      },
      {
        name: '任务督办',
        path: '/portal/lean/supervision',
        children: [
          { name: '督办管理', path: '/portal/lean/supervision/manage' },
        ],
      },
      {
        name: '效果评估',
        path: '/portal/lean/evaluation',
        children: [
          { name: '携转预警情况分析', path: '/portal/lean/evaluation/port-out-analysis' },
          { name: '宽带离网预警情况分析', path: '/portal/lean/evaluation/broadband-churn-analysis' },
          { name: '全球通离网预警分析', path: '/portal/lean/evaluation/globalton-churn-analysis' },
          { name: '投诉工单预警情况分析', path: '/portal/lean/evaluation/complaint-analysis' },
          { name: '热线商机预警情况分析', path: '/portal/lean/evaluation/hotline-analysis' },
          { name: '异动客户预警情况分析', path: '/portal/lean/evaluation/anomaly-analysis' },
          { name: '离网追溯反馈分析', path: '/portal/lean/evaluation/churn-trace-analysis' },
          { name: '停机赢回预警情况分析', path: '/portal/lean/evaluation/suspend-winback-analysis' },
          { name: '铁通赢回预警情况分析', path: '/portal/lean/evaluation/tietong-winback-analysis' },
          { name: '一事一案分析', path: '/portal/lean/evaluation/case-analysis' },
          { name: '运营驾驶舱(大屏)', path: '/portal/lean/evaluation/dashboard' },
        ],
      },
      { name: '投屏管理', path: '/portal/lean/system/screen-manage' },
    ],
  },
  HIDDEN: 精益运营菜单结束 */
  // {
  //   name: '增量运营',
  //   path: '/portal/incremental-operations',
  //   hidden: true,
  //   children: [
  //     { name: '新增市场', path: '/portal/incremental-operations' },
  //   ],
  // },
  // {
  //   name: '国际运营',
  //   path: '/portal/customer/international',
  //   hidden: true,
  //   children: [
  //     { name: '关键指标分析', path: 'https://gn2p5qvx9m.coze.site/portal/customer/international/metrics' },
  //   ],
  // },
  // {
  //   name: '产品运营',
  //   path: '/portal/product',
  //   hidden: true,
  //   children: [{ name: '产品总览', path: '/portal/product/overview' }],
  // },
  // {
  //   name: '渠道运营',
  //   path: '/portal/channel',
  //   hidden: true,
  //   children: [
  //     { name: 'APP运营', path: '/portal/channel/app' },
  //     { name: '企微运营', path: '/portal/channel/enterprise' },
  //     { name: '泛全终端运营', path: '/portal/channel/terminal' },
  //     { name: '渠道充值监控', path: '/portal/channel/recharge' },
  //   ],
  // },
  {
    name: '客服数智运营',
    path: '/portal/service',
    hidden: true,
    children: [
      {
        name: '客服运营',
        path: '/portal/service/operation',
        children: [{ name: '服务反馈', path: '/portal/service/operation/feedback' }],
      },
    ],
  },
  {
    name: '政企数智运营',
    path: '/portal/enterprise',
    hidden: true,
    children: [
      {
        name: '业务运营',
        path: '/portal/enterprise/business',
        children: [{ name: '139门户', path: '/portal/enterprise/business/139-portal' }],
      },
    ],
  },
  {
    name: '能力中心',
    path: '/portal/capability',
    children: [
      {
        name: '洞察中心',
        path: '/portal/capability/insight',
        children: [
          { name: '洞察总览', path: '/portal/capability/insight/overview' },
          { name: '指标树模板', path: '/portal/capability/insight/tree-templates' },
          { name: '智能分析报告', path: '/portal/capability/insight/reports' },
          { name: 'AI洞察助手', path: '/workspace/ai-insight' },
        ],
      },
      {
        name: '策略中心',
        path: '/portal/capability/strategy',
        children: [
          { name: '策略总览', path: '/portal/capability/strategy/overview' },
          { name: '剧本营销', path: '/portal/capability/strategy/script-marketing', hidden: true },
          { name: '策略沉淀', path: '/workspace/strategy-repository/effect' },
          { name: '跨中心协作', path: '/workspace/strategy-collab/insight', hidden: true },
          { name: '接收诊断', path: '/workspace/strategy/receive-diagnosis' },
          { name: '策略审批', path: '/workspace/strategy/approval' },
          { name: '活动全链路追踪', path: '/workspace/strategy/activity-track' },
          { name: '网格通活动配置', path: '/workspace/strategy/grid-config', hidden: true },
        ],
      },
      {
        name: '调度中心',
        path: '/portal/capability/dispatch',
        children: [
          { name: '调度总览', path: '/portal/capability/dispatch/overview' },
          { name: '运营人员管理', path: '/portal/capability/dispatch/team' },
        ],
      },
      {
        name: '评估中心',
        path: '/portal/capability/evaluation',
        children: [
          { name: '评估总览', path: '/portal/capability/evaluation-center' },
          { name: '工单分析', path: '/portal/capability/evaluation/workorders' },
          { name: '策略分析', path: '/portal/capability/evaluation/strategy' },
        ],
      },
      // {
      //   name: '内容中心',
      //   path: '/portal/capability/content',
      //   children: [
      //     { name: '案例广场', path: '/portal/capability/content/cases' },
      //     { name: '素材广场', path: '/portal/capability/content/materials' },
      //   ],
      // },
      {
        name: '知识中心',
        path: '/portal/capability/knowledge',
        children: [
          { name: '知识库管理', path: '/portal/capability/knowledge/list' },
          { name: '审核管理', path: '/portal/capability/knowledge/audit' },
        ],
      },
      {
        name: '下载中心',
        path: '/portal/capability/download',
        children: [
          { name: '下载专区', path: '/portal/capability/download/zone' },
          { name: '导出文件下载', path: '/portal/capability/download/files' },
        ],
      },
      {
        name: '消息中心',
        path: '/portal/capability/message',
        children: [{ name: '消息列表', path: '/portal/capability/message/list' }],
      },
    ],
  },
  {
    name: '驾驶舱',
    path: '/portal/stock-view',
  },
  // 隐藏的菜单项
  {
    name: '模型广场',
    path: '/portal/models',
    hidden: true,
    children: [
      { name: '模型中心', path: '/portal/models/center' },
      { name: '标签中心', path: '/portal/models/labels' },
    ],
  },
  {
    name: 'AI+运营驾驶舱',
    path: '/portal/ai',
    hidden: true,
  },

  {
    name: '我的工作台',
    path: '/workspace',
  },
];

// 递归查找当前路径对应的菜单项
function findActiveMenuItem(pathname: string, items: MenuItem[]): MenuItem | null {
  for (const item of items) {
    if (!item || !item.path) continue;
    if (pathname === item.path || pathname.startsWith(item.path + '/')) {
      return item;
    }
    if (item.children) {
      const found = findActiveMenuItem(pathname, item.children);
      if (found) return found;
    }
  }
  return null;
}

// 递归查找当前路径对应的所有父级菜单项
function findActiveMenuPath(pathname: string, items: MenuItem[]): MenuItem[] {
  if (!items || items.length === 0) return [];
  for (const item of items) {
    if (!item) continue;
    if (item.children && item.children.length > 0) {
      // 如果有子菜单，先检查子菜单
      const childPath = findActiveMenuPath(pathname, item.children);
      if (childPath.length > 0) {
        // 子菜单找到匹配，将当前菜单项添加到路径前面
        return [item, ...childPath];
      }
    }
    // 如果路径完全匹配或路径以当前菜单项路径开头，并且没有更深层的匹配
    if (item.path && (pathname === item.path || pathname.startsWith(item.path + '/'))) {
      return [item];
    }
  }
  return [];
}

// 自定义菜单组件 - 支持四级菜单，二级在左，三四级在右
function MenuDropdown({
  item,
  isActive,
  onClose,
  hoveredChild,
  onChildHover,
  onMouseEnter,
  onMouseLeave,
  hoveredGrandChild,
  onGrandChildHover,
}: {
  item: MenuItem;
  isActive: (item: MenuItem) => boolean;
  onClose: () => void;
  hoveredChild: string | null;
  onChildHover: (name: string | null) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  hoveredGrandChild?: string | null;
  onGrandChildHover?: (name: string | null) => void;
}) {
  if (!item.children || item.children.length === 0) return null;

  // 过滤隐藏的菜单项
  const visibleChildren = item.children.filter(child => !child.hidden);

  // 找到当前悬停的二级菜单
  const currentHoveredChild = visibleChildren.find(child => child.name === hoveredChild);
  
  // 检查当前二级菜单的子项是否需要扁平化：
  // 如果三级只有一个子项且与父级同名（如"流量运营"→"流量运营"），直接提升四级为三级
  const getEffectiveChildren = (child: MenuItem | undefined) => {
    if (!child?.children || child.children.length === 0) return [];
    // 只有一个子项且同名，扁平化
    if (child.children.length === 1 && child.children[0].name === child.name) {
      return child.children[0].children || [];
    }
    return child.children;
  };
  
  const effectiveChildren = getEffectiveChildren(currentHoveredChild);
  const isFlattened = currentHoveredChild?.children?.length === 1 && 
    currentHoveredChild?.children?.[0]?.name === currentHoveredChild?.name;
  
  // 检查有效子项中是否还有更深层级（四级→变为有效三级后的子项）
  const hasFourthLevel = effectiveChildren.some(
    child => child.children && child.children.length > 0
  );
  
  // 找到当前悬停的三级菜单（在扁平化后的列表中）
  const currentHoveredGrandChild = effectiveChildren.find(
    grandChild => grandChild.name === hoveredGrandChild
  );

  return (
    <div
      className="fixed left-0 top-0 right-0 bg-white border-t border-b border-gray-200 shadow-xl z-50"
      style={{ marginTop: '64px' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-full max-h-[400px] overflow-y-auto">
        <div className="flex">
          {/* 左侧：二级菜单（运营场景） */}
          <div className="w-52 min-w-[200px] bg-gray-50 py-4 border-r border-gray-300">
            <div className="space-y-1">
              {visibleChildren.map((child) => (
                <div
                  key={child.path + child.name}
                  className={`px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${
                    hoveredChild === child.name
                      ? 'bg-[#60B3E2] text-white'
                      : isActive(child)
                      ? 'bg-blue-100 text-[#0085D0]'
                      : 'text-gray-700 hover:bg-blue-100 hover:text-[#60B3E2]'
                  }`}
                  onMouseEnter={() => {
                    onChildHover(child.name);
                    // 自动选中第一个有效三级菜单（考虑扁平化）
                    const effectiveKids = getEffectiveChildren(child);
                    const visibleEffective = effectiveKids.filter(gc => !gc.hidden);
                    if (visibleEffective.length > 0) {
                      onGrandChildHover?.(visibleEffective[0].name);
                    } else {
                      onGrandChildHover?.(null);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span style={child.style}>{child.name}</span>
                    {child.children && child.children.length > 0 && (
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：三级和四级菜单 */}
          <div className="flex-1 bg-white py-5 px-6 min-w-[320px]">
            {currentHoveredChild && effectiveChildren.length > 0 ? (
              hasFourthLevel && !isFlattened ? (
                /* 有四级菜单且未扁平化的布局：标题 + 竖排列表，每个三级下方展示其四级 */
                <div className="flex flex-col">
                  {/* 标题行 */}
                  <div className="pb-3 mb-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-[#1a3a5c]">{currentHoveredChild.name}</h3>
                  </div>
                  {/* 三级菜单区域 */}
                  <div className="flex gap-10">
                    {currentHoveredChild.children!
                      .filter(grandChild => !grandChild.hidden)
                      .map((grandChild) => (
                        <div key={grandChild.path + grandChild.name} className="flex flex-col">
                          {/* 三级菜单标题 */}
                          <div
                            className={`py-2 text-sm font-medium mb-1 ${
                              isActive(grandChild) ? 'text-[#0085D0]' : 'text-gray-700'
                            }`}
                          >
                            <span style={grandChild.style}>{grandChild.name}</span>
                          </div>
                          
                          {/* 四级菜单：直接在三级下方展示 */}
                          {grandChild.children && grandChild.children.length > 0 ? (
                            <div className="flex flex-col">
                              {grandChild.children
                                .filter(ggChild => !ggChild.hidden)
                                .map((ggChild) => (
                                  ggChild.externalUrl ? (
                                    <a
                                      key={ggChild.name}
                                      href={ggChild.externalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-between gap-2 text-sm py-2 px-2 rounded text-gray-600 hover:text-[#0085D0] hover:bg-blue-50 transition-colors"
                                    >
                                      {ggChild.name}
                                      <ChevronRight className="h-3 w-3 flex-shrink-0 text-gray-400" />
                                    </a>
                                  ) : (
                                    <Link
                                      key={ggChild.path}
                                      href={ggChild.path}
                                      onClick={onClose}
                                      className={`flex items-center justify-between gap-2 text-sm py-2 px-2 rounded transition-colors ${
                                        isActive(ggChild)
                                          ? 'text-[#0085D0] font-medium bg-blue-50'
                                          : 'text-gray-600 hover:text-[#0085D0] hover:bg-blue-50'
                                      }`}
                                    >
                                      {ggChild.name}
                                      <ChevronRight className="h-3 w-3 flex-shrink-0 text-gray-400" />
                                    </Link>
                                  )
                                ))}
                            </div>
                          ) : (
                            /* 三级没有四级时，三级本身可点击 */
                            grandChild.externalUrl ? (
                              <a
                                href={grandChild.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={onClose}
                                className="flex items-center justify-between gap-2 text-sm py-2 px-2 rounded text-gray-600 hover:text-[#0085D0] hover:bg-blue-50 transition-colors"
                              >
                                点击进入
                                <ChevronRight className="h-3 w-3 flex-shrink-0 text-gray-400" />
                              </a>
                            ) : (
                              <Link
                                href={grandChild.href || grandChild.path}
                                onClick={onClose}
                                className="flex items-center justify-between gap-2 text-sm py-2 px-2 rounded text-gray-600 hover:text-[#0085D0] hover:bg-blue-50 transition-colors"
                              >
                                点击进入
                                <ChevronRight className="h-3 w-3 flex-shrink-0 text-gray-400" />
                              </Link>
                            )
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ) : isFlattened ? (
                /* 扁平化布局（二级同名子项已提升）：标题 + 横排列表，无多余层级 */
                <div className="flex flex-col">
                  {/* 标题行 */}
                  <div className="pb-3 mb-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-[#1a3a5c]">{currentHoveredChild.name}</h3>
                  </div>
                  {/* 有效三级菜单横排列表 */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {effectiveChildren
                      .filter(child => !child.hidden)
                      .map((child) => (
                        child.externalUrl ? (
                          <a
                            key={child.name}
                            href={child.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onClose}
                            className="flex items-center gap-1.5 text-sm py-2 px-3 rounded text-gray-700 hover:text-[#0085D0] hover:bg-blue-50 transition-colors"
                          >
                            {child.name}
                            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                          </a>
                        ) : (
                          <Link
                            key={child.path}
                            href={child.href || child.path}
                            onClick={onClose}
                            className={`flex items-center gap-1.5 text-sm py-2 px-3 rounded transition-colors ${
                              isActive(child)
                                ? 'text-[#0085D0] font-medium bg-blue-50'
                                : 'text-gray-700 hover:text-[#0085D0] hover:bg-blue-50'
                            }`}
                          >
                            {child.name}
                            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                          </Link>
                        )
                      ))}
                  </div>
                </div>
              ) : (
                /* 没有四级菜单的布局：标题 + 横排列表 */
                <div className="flex flex-col">
                  {/* 标题行 */}
                  <div className="pb-3 mb-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-[#1a3a5c]">{currentHoveredChild.name}</h3>
                  </div>
                  {/* 三级菜单横排列表 */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {effectiveChildren
                      .filter(child => !child.hidden)
                      .map((child) => (
                        child.externalUrl ? (
                          <a
                            key={child.name}
                            href={child.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onClose}
                            className="flex items-center gap-1.5 text-sm py-2 px-3 rounded text-gray-700 hover:text-[#0085D0] hover:bg-blue-50 transition-colors"
                          >
                            {child.name}
                            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                          </a>
                        ) : (
                          <Link
                            key={child.path}
                            href={child.href || child.path}
                            onClick={onClose}
                            className={`flex items-center gap-1.5 text-sm py-2 px-3 rounded transition-colors ${
                              isActive(child)
                                ? 'text-[#0085D0] font-medium bg-blue-50'
                                : 'text-gray-700 hover:text-[#0085D0] hover:bg-blue-50'
                            }`}
                          >
                            {child.name}
                            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                          </Link>
                        )
                      ))}
                  </div>
                </div>
              )
            ) : currentHoveredChild ? (
              <div className="text-sm text-gray-400 py-8 text-center">
                暂无子菜单
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header({ isWorkspace = false, forceActivePath }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredChild, setHoveredChild] = useState<string | null>(null);
  const [hoveredGrandChild, setHoveredGrandChild] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  // 使用forceActivePath或当前pathname
  const effectivePath = forceActivePath || pathname || '';
  const isWorkspacePage = pathname?.startsWith('/workspace') || isWorkspace;
  const activeMenuPath = useMemo(() => findActiveMenuPath(effectivePath, menuItems), [effectivePath]);
  const activeMenuItem = activeMenuPath[activeMenuPath.length - 1];

  // 判断菜单项是否在激活路径中
  const isActive = (item: MenuItem): boolean => {
    return activeMenuPath.some(activeItem => activeItem && activeItem.path === item.path);
  };

  const handleMouseEnter = (itemName: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredItem(itemName);

    // 查找对应的菜单项，并自动高亮第一个二级菜单
    const menuItem = menuItems.find(item => item.name === itemName);
    if (menuItem && menuItem.children && menuItem.children.length > 0) {
      const visibleChildren = menuItem.children.filter(child => !child.hidden);
      if (visibleChildren.length > 0) {
        setHoveredChild(visibleChildren[0].name);
        // 如果有四级菜单，自动高亮第一个四级菜单
        const firstChild = visibleChildren[0];
        if (firstChild.children && firstChild.children.length > 0) {
          setHoveredGrandChild(firstChild.children[0].name);
        } else {
          setHoveredGrandChild(null);
        }
      }
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setHoveredChild(null);
      setHoveredGrandChild(null);
    }, 500);
  };

  const handleDropdownMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setHoveredChild(null);
      setHoveredGrandChild(null);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="border-b" style={{ borderColor: '#E5F1F8' }}>
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0">
              <CampLogo />
            </Link>

            {/* 主导航 */}
            <nav className="hidden md:flex items-center gap-1">
              {menuItems.filter(item => !item.hidden && item.name !== '我的工作台').map((item, index) => (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.children && item.children.length > 0 ? (
                    <button
                      className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                        isActive(item)
                          ? 'text-[#0085D0]'
                          : hoveredItem === item.name
                          ? 'text-[#60B3E2]'
                          : item.className || 'text-gray-600 hover:text-[#60B3E2]'
                      }`}
                    >
                      {item.name}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  ) : (
                    <Link
                      href={item.href || item.path}
                      className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                        isActive(item)
                          ? 'text-[#0085D0]'
                          : item.className || 'text-gray-600 hover:text-[#0085D0]'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}

                  {/* 下拉菜单 */}
                  {item.children && item.children.filter(c => !c.hidden).length > 0 && hoveredItem === item.name && (
                    <MenuDropdown
                      item={item}
                      isActive={isActive}
                      onClose={() => setHoveredItem(null)}
                      hoveredChild={hoveredChild}
                      onChildHover={setHoveredChild}
                      hoveredGrandChild={hoveredGrandChild}
                      onGrandChildHover={setHoveredGrandChild}
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    />
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* 右侧 */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索..."
                className="w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:border-[#0085D0] focus:outline-none focus:ring-1 focus:ring-[#0085D0]"
              />
            </div>

            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full" style={{ backgroundColor: '#ED1C24' }}></span>
            </button>

            {/* 我的工作台 */}
            <Link
              href="/workspace"
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                pathname === '/workspace' ? 'text-[#0085D0]' : 'text-gray-600 hover:text-[#0085D0]'
              }`}
            >
              我的工作台
            </Link>

            <div className="flex items-center gap-2 pl-4 border-l">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                style={{ background: 'linear-gradient(135deg, #0085D0 0%, #60B3E2 100%)' }}
              >
                张
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-medium text-gray-900">张三</p>
                <p className="text-xs text-gray-500">运营人员</p>
              </div>
            </div>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t bg-white px-6 py-4 space-y-2">
          {menuItems.filter(item => !item.hidden).map((item) => (
            <div key={item.href || item.path}>
              <Link
                href={item.href || item.path}
                className={`block py-2 text-sm font-medium ${
                  isActive(item) ? 'text-[#0085D0]' : 'text-gray-600'
                }`}
              >
                {item.name}
              </Link>
              {item.children && item.children.length > 0 && (
                <div className="pl-4 space-y-1 mt-1">
                  {item.children.filter(c => !c.hidden).map((child) => (
                    <Link
                      key={child.path}
                      href={child.path}
                      className="block py-1.5 text-xs text-gray-600"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
