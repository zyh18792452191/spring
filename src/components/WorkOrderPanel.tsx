'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getDispatchTypeByLabel } from '@/lib/dispatch-system';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';

// 工单数据类型
export interface WorkOrder {
  id: string;
  title: string;
  type: string;
  subType: string;
  province: string;
  currentStage: string;
  currentHandler: string;
  orderStatus: string;
  processStatus: string;
  handleResult?: string;
  timeoutStatus: string;
  remainingTime: string;
  timeoutTime: string;
  updateTime: string;
  createTime: string;
  creator: string;
  creatorDepartment: string;
}

// 工单类型
type WorkOrderTabType = '我发起的' | '待办' | '已办';

// 生成模拟工单数据
const generateWorkOrders = (type: WorkOrderTabType, scenario: string, count: number): WorkOrder[] => {
  const orders: WorkOrder[] = [];
  const provinces = ['全疆','乌鲁木齐','克拉玛依','吐鲁番','哈密','昌吉','博州','巴州','阿克苏','克州','喀什','和田','伊犁','塔城','阿勒泰','奎屯','石河子'];
  const stages = ['省专公司处理', '领导审批', '集团负责人', '已结束'];
  const statuses = ['处理中', '已完成'];
  const processStatuses = ['进行中', '已完成'];
  const timeoutStatuses = ['正常', '即将超时', '已超时'];
  const creators = ['集团管理员', '超级管理员', '总部领导'];
  const departments = ['集团总部', '省级运营中心', '客户服务中心'];
  
  // 根据业务场景设置工单类型
  const scenarioTypes: Record<string, string[]> = {
    'international': ['生产类/国际业务策略调度', '生产类/国际业务客群调度', '管理类/国际业务指标调度'],
    'mid-high': ['生产类/中高端策略调度', '生产类/中高端客群调度', '管理类/中高端指标调度'],
    'churn': ['生产类/离网维系策略调度', '生产类/离网维系客群调度', '管理类/离网维系指标调度'],
    'traffic': ['生产类/流量运营策略调度', '生产类/流量运营客群调度'],
    'voice': ['生产类/语音运营策略调度', '生产类/语音运营客群调度'],
    'incremental': ['生产类/增量运营策略调度', '生产类/增量运营客群调度', '管理类/增量运营指标调度'],
    'default': ['生产类/策略调度', '生产类/客群调度', '管理类/指标调度'],
  };
  
  const types = scenarioTypes[scenario] || scenarioTypes['default'];
  
  const titles: Record<string, string[]> = {
    'international': [
      '国漫产品订购量提升',
      '出访客户收入改善',
      '全球通礼包激活率提升',
      '国际漫游业务推广',
      '出境客户保有率提升',
    ],
    'mid-high': [
      '中高端客户保有率提升',
      '高价值客户维系',
      '中高端升档增收',
      'VIP客户专属服务',
    ],
    'churn': [
      '离网客户价值保有',
      '客户流失预警处理',
      '拍照客户规模提升',
      '潜在离网客户挽留',
    ],
    'traffic': [
      '流量包渗透率改善',
      '流量使用率提升',
      '流量预警客户关怀',
    ],
    'voice': [
      '语音包渗透率提升',
      '通话质量改善',
      '语音业务推广',
    ],
    'incremental': [
      '新增客户规模提升',
      '一级新增放号量改善',
      '省级新增放号量提升',
      'T+6留存率优化',
      '新增客户质量改善',
    ],
    'default': [
      '业务指标提升',
      '客户保有率改善',
      '服务质量优化',
    ],
  };
  
  const scenarioTitles = titles[scenario] || titles['default'];

  for (let i = 0; i < count; i++) {
    const isCompleted = type === '我发起的' || type === '已办';
    const randomType = types[Math.floor(Math.random() * types.length)];
    const [mainType, subType] = randomType.split('/');
    const randomTitle = scenarioTitles[Math.floor(Math.random() * scenarioTitles.length)];

    orders.push({
      id: `00048${String(1000000 + i * 1000).slice(-7)}`,
      title: type === '我发起的'
        ? `${randomTitle}申请-${i + 1}`
        : `${randomTitle}-${i + 1}`,
      type: mainType,
      subType: subType || '',
      province: provinces[i % provinces.length],
      currentStage: isCompleted ? '已结束' : stages[Math.floor(Math.random() * 3)],
      currentHandler: isCompleted ? '-' : `角色:${creators[i % creators.length]}`,
      orderStatus: isCompleted ? '已完成' : '处理中',
      processStatus: isCompleted ? '已完成' : '进行中',
      handleResult: isCompleted && Math.random() > 0.5 ? '通过' : undefined,
      timeoutStatus: timeoutStatuses[Math.floor(Math.random() * 3)],
      remainingTime: '-',
      timeoutTime: '-',
      updateTime: `2026-02-${String(10 + Math.floor(Math.random() * 20)).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      createTime: `2026-02-${String(10 + Math.floor(Math.random() * 20)).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      creator: creators[i % creators.length],
      creatorDepartment: departments[i % departments.length],
    });
  }
  return orders;
};

// Props 类型
interface WorkOrderPanelProps {
  /** 业务场景标识 */
  scenario: 'international' | 'mid-high' | 'churn' | 'traffic' | 'voice' | 'incremental' | 'default';
  /** 初始是否展开 */
  defaultExpanded?: boolean;
  /** 面板宽度 */
  width?: number;
  /** 工单详情跳转路径 */
  detailPath?: string;
}

/**
 * 工单面板组件
 * 用于在业务页面右侧展示工单列表（我发起的、待办、已办）
 */
export default function WorkOrderPanel({
  scenario,
  defaultExpanded = false,
  width = 800,
  detailPath,
}: WorkOrderPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL参数恢复状态
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const panelParam = searchParams.get('workOrderPanel');
      return panelParam === 'open' || defaultExpanded;
    }
    return defaultExpanded;
  });
  
  const [activeTab, setActiveTab] = useState<WorkOrderTabType>(() => {
    if (typeof window !== 'undefined') {
      const tabParam = searchParams.get('workOrderTab') as WorkOrderTabType;
      if (tabParam && ['我发起的', '待办', '已办'].includes(tabParam)) {
        return tabParam;
      }
    }
    return '待办';
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // 客户端挂载状态 - 用于避免hydration错误
  const [isMounted, setIsMounted] = useState(false);
  const [clientTabData, setClientTabData] = useState<{
    '我发起的': WorkOrder[];
    '待办': WorkOrder[];
    '已办': WorkOrder[];
  }>({
    '我发起的': [],
    '待办': [],
    '已办': [],
  });

  // 在客户端生成随机数据
  useEffect(() => {
    setClientTabData({
      '我发起的': generateWorkOrders('我发起的', scenario, 5),
      '待办': generateWorkOrders('待办', scenario, 7),
      '已办': generateWorkOrders('已办', scenario, 12),
    });
    setIsMounted(true);
  }, [scenario]);
  
  // 使用客户端数据
  const tabData = clientTabData;

  // 分页数据
  const currentOrders = tabData[activeTab];
  const totalPages = Math.ceil(currentOrders.length / pageSize);
  const paginatedOrders = currentOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Tab 切换时重置页码
  const handleTabChange = (tab: WorkOrderTabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // 获取超时状态样式
  const getTimeoutStatusStyle = (status: string) => {
    switch (status) {
      case '已超时':
        return 'bg-red-100 text-red-600';
      case '即将超时':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-green-100 text-green-600';
    }
  };

  // 获取工单状态样式
  const getOrderStatusStyle = (status: string) => {
    return status === '已完成' 
      ? 'bg-gray-100 text-gray-600' 
      : 'bg-blue-100 text-blue-600';
  };

  // 构建 from 参数
  const fromParam = `business-${scenario}`;

  // 获取当前业务页面的Tab（从URL hash中读取）
  const getCurrentBusinessTab = (): string => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash || '';
    }
    return '';
  };

  // 处理工单（待办）
  const handleProcess = (order: WorkOrder) => {
    const businessTab = getCurrentBusinessTab();
    const dispatchType = getDispatchTypeByLabel(order.subType);
    const params = new URLSearchParams({
      from: fromParam,
      id: order.id,
      type: dispatchType,
      title: order.title,
      status: order.orderStatus,
      region: order.province,
      createdAt: order.createTime,
      orderNo: order.id,
    });
    // 携带当前业务Tab和工单面板状态
    if (businessTab) {
      params.set('businessTab', businessTab);
    }
    params.set('workOrderTab', activeTab);
    params.set('mode', 'process');
    router.push(`/workspace/ticket-detail?${params.toString()}`);
  };

  // 查看详情（我发起的、已办）
  const handleView = (order: WorkOrder) => {
    const businessTab = getCurrentBusinessTab();
    const dispatchType = getDispatchTypeByLabel(order.subType);
    const params = new URLSearchParams({
      from: fromParam,
      id: order.id,
      type: dispatchType,
      title: order.title,
      status: order.orderStatus,
      region: order.province,
      createdAt: order.createTime,
      orderNo: order.id,
    });
    // 携带当前业务Tab和工单面板状态
    if (businessTab) {
      params.set('businessTab', businessTab);
    }
    params.set('workOrderTab', activeTab);
    params.set('mode', 'view');
    router.push(`/workspace/ticket-detail?${params.toString()}`);
  };

  // 跳转到工单列表页
  const handleGoToWorkOrderList = () => {
    const businessTab = getCurrentBusinessTab();
    const params = new URLSearchParams({
      from: fromParam,
    });
    // 携带当前业务Tab和工单面板状态
    if (businessTab) {
      params.set('businessTab', businessTab);
    }
    params.set('workOrderTab', activeTab);
    router.push(`/portal/capability/dispatch/work-order-list?${params.toString()}`);
  };

  return (
    <>
      {/* 折叠状态下的触发按钮 */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-white shadow-lg border border-gray-200 rounded-l-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-1"
          style={{ width: '32px', height: '80px' }}
        >
          <span className="text-xs text-gray-700 font-medium writing-vertical" style={{ writingMode: 'vertical-rl' }}>
            工单列表
          </span>
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
      )}

      {/* 工单面板 */}
      <div
        className={`fixed right-0 top-0 h-full bg-white shadow-xl border-l border-gray-200 z-50 transition-transform duration-300 ${
          isExpanded ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: `${width}px` }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">工单列表</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToWorkOrderList}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              更多
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-gray-200">
          {(['我发起的', '待办', '已办'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 px-2 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>{tab}</span>
              <Badge
                variant={activeTab === tab ? 'default' : 'secondary'}
                className={`ml-1 text-[10px] px-1.5 py-0 ${
                  activeTab === tab ? 'bg-blue-600' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isMounted ? tabData[tab].length : '...'}
              </Badge>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        {/* 工单列表 */}
        <ScrollArea className="flex-1" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="p-3 space-y-2">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg p-4 hover:shadow-md transition-all border border-gray-200"
                >
                  {/* 第一行：工单编号 + 状态标签 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {order.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${getOrderStatusStyle(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      {order.timeoutStatus !== '正常' && (
                        <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${getTimeoutStatusStyle(order.timeoutStatus)}`}>
                          {order.timeoutStatus === '已超时' && <AlertCircle className="h-3 w-3" />}
                          {order.timeoutStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 第二行：工单标题 */}
                  <div className="text-sm font-medium text-gray-900 mb-3 line-clamp-2 min-h-[40px]">
                    {order.title}
                  </div>

                  {/* 第三行：类型 + 省 + 环节 */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {order.subType || order.type}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span>{order.province}</span>
                    <span className="text-gray-400">|</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {order.currentStage}
                    </span>
                  </div>

                  {/* 第四行：创建时间 + 创建人 + 操作按钮 */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>创建时间：{order.createTime}</span>
                      <span>创建人：{order.creator}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={activeTab === '待办' ? 'default' : 'outline'}
                      className="h-7 px-3 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        activeTab === '待办' ? handleProcess(order) : handleView(order);
                      }}
                    >
                      {activeTab === '待办' ? '处理' : '详情'}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                暂无工单
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                共 {currentOrders.length} 条
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <span className="text-xs text-gray-600 px-2">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 展开时的遮罩层 */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/5 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
