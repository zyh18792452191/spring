'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  X,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// 工单类型分类定义
const workOrderCategories = {
  全部类型: { count: 322 },
  生产类: {
    count: 294,
    children: {
      '中高端策略调度': { count: 134 },
      '中高端客群调度': { count: 159 },
      '离网维系策略调度': { count: 0 },
      '离网维系客群调度': { count: 1 },
    },
  },
  管理类: {
    count: 0,
    children: {
      '中高端指标调度': { count: 0 },
      '离网维系指标调度': { count: 0 },
    },
  },
  审批类: {
    count: 23,
    children: {
      '公告审批': { count: 0 },
      '素材授权': { count: 0 },
      '导出审批': { count: 1 },
      '导出审批任务': { count: 22 },
    },
  },
  测试: { count: 5 },
};

// 工单类型定义
type WorkOrderType = '我发起的' | '待办' | '已办';

// 工单数据定义
interface WorkOrder {
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

// 测试数据生成
const generateWorkOrders = (type: WorkOrderType, count: number): WorkOrder[] => {
  const provinces = ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '阿克苏', '克州', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '奎屯', '石河子'];
  const orders: WorkOrder[] = [];

  const stages = ['用户任务', '领导审批', '集团负责人', '已结束'];
  const statuses = ['处理中', '已完成'];
  const processStatuses = ['进行中', '已完成'];
  const timeoutStatuses = ['正常', '即将超时', '已超时'];
  const creators = ['集团管理员', '超级管理员', '总部领导'];
  const departments = ['集团总部', '省级运营中心', '客户服务中心'];
  const types = [
    '审批类/导出审批任务',
    '生产类/中高端策略调度',
    '生产类/中高端客群调度',
    '生产类/中高端指标调度',
  ];
  const titles = [
    '高价值潜在离网客户客群调度',
    '一降到底改善指标调度',
    '中高端客户保有率指标调度',
    '拍照中高端升档增收价值指标调度',
    '家庭宽带续费率改善策略调度',
    '5G套包升档指标调度',
    '流量包渗透率改善策略调度',
    '全球通保有率改善指标调度',
    '拍照中高端综合保有率改善策略调度',
    '中高端客户规模保有率改善策略调度',
    '客户流失预警指标调度',
    '拍照离网客户规模改善策略调度',
    '离网客户价值保有率指标调度',
    '场景化原子产品收入改善策略调度',
  ];

  for (let i = 0; i < count; i++) {
    const isCompleted = type === '我发起的' || type === '已办';
    const randomType = types[Math.floor(Math.random() * types.length)];
    const [mainType, subType] = randomType.split('/');
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    orders.push({
      id: `00048${String(1000000 + i * 1000).slice(-7)}`,
      title: type === '我发起的'
        ? `xx部门${creators[i % creators.length]}因${randomTitle}申请`
        : `${randomTitle}${i + 1}`,
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
      updateTime: `2026-02-${String(10 + Math.floor(Math.random() * 20)).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      createTime: `2026-02-${String(10 + Math.floor(Math.random() * 20)).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      creator: creators[i % creators.length],
      creatorDepartment: departments[i % departments.length],
    });
  }
  return orders;
};

// Tab数据配置
const tabData = {
  '我发起的': generateWorkOrders('我发起的', 58),
  '待办': generateWorkOrders('待办', 322),
  '已办': generateWorkOrders('已办', 57),
};

// 工单列表内容组件
function WorkOrderListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPage = searchParams.get('from');
  const isFromOverview = fromPage === 'overview';
  const isFromBusiness = fromPage?.startsWith('business-');
  
  // 从URL参数读取业务Tab和工单面板状态
  const businessTab = searchParams.get('businessTab') || '';
  const workOrderTab = searchParams.get('workOrderTab') || '';

  // from 参数到路径的映射
  const fromPathMap: Record<string, string> = {
    'overview': '/portal/capability/dispatch/overview',
    'business-international': '/portal/customer/international/metrics',
    'business-mid-high': '/portal/mid-high-customer-operations',
    'business-churn': '/portal/churn-retention',
    'business-traffic': '/portal/traffic-operations',
    'business-voice': '/portal/voice-operations',
  };

  // 是否显示返回按钮
  const showBackButton = isFromOverview || isFromBusiness;

  // 默认值初始化状态
  const [activeTab, setActiveTab] = useState<WorkOrderType>('待办');
  const [selectedCategory, setSelectedCategory] = useState('全部类型');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['生产类', '审批类', '管理类']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选字段
  const [filters, setFilters] = useState({
    orderNumber: '',
    orderTitle: '',
    province: 'all',
  });

  // 从URL参数初始化状态（只在客户端执行）
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'pending' || tabParam === 'ongoing') {
      setActiveTab('待办');
    } else if (tabParam === 'completed_today') {
      setActiveTab('已办');
    }
  }, [searchParams]);

  // 处理分类展开/收起
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // 过滤数据
  const filteredOrders = useMemo(() => {
    let orders = tabData[activeTab];

    // 按工单类型筛选
    if (selectedCategory !== '全部类型') {
      orders = orders.filter(order => {
        const categoryData = workOrderCategories[selectedCategory as keyof typeof workOrderCategories];
        if (typeof categoryData === 'object' && 'children' in categoryData) {
          const subTypes = Object.keys(categoryData.children || {});
          return subTypes.includes(order.subType) || order.type === selectedCategory;
        }
        return order.subType === selectedCategory;
      });
    }

    // 按筛选条件过滤
    if (filters.orderNumber) {
      orders = orders.filter(order => order.id.includes(filters.orderNumber));
    }
    if (filters.orderTitle) {
      orders = orders.filter(order => order.title.includes(filters.orderTitle));
    }
    if (filters.province && filters.province !== 'all') {
      orders = orders.filter(order => order.province === filters.province);
    }

    return orders;
  }, [activeTab, selectedCategory, filters]);

  // 分页数据
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 重置筛选
  const handleReset = () => {
    setFilters({
      orderNumber: '',
      orderTitle: '',
      province: 'all',
    });
    setCurrentPage(1);
  };

  // 处理工单
  const handleProcess = (orderId: string) => {
    console.log('处理工单:', orderId);
  };

  // 查看工单
  const handleView = (orderId: string) => {
    console.log('查看工单:', orderId);
  };

  // 返回上一级页面
  const handleBack = () => {
    if (fromPage && fromPathMap[fromPage]) {
      // 构建返回URL，携带工单面板状态参数
      let returnUrl = fromPathMap[fromPage];
      
      // 如果是从业务页面返回，需要携带完整参数
      if (fromPage.startsWith('business-')) {
        const params = new URLSearchParams();
        params.set('fromWorkOrder', 'true');
        params.set('workOrderPanel', 'open');
        if (workOrderTab) {
          params.set('workOrderTab', workOrderTab);
        }
        
        // 如果有业务Tab，添加到hash
        if (businessTab) {
          returnUrl = `${returnUrl}#${businessTab}?${params.toString()}`;
        } else {
          returnUrl = `${returnUrl}?${params.toString()}`;
        }
      }
      
      router.push(returnUrl);
    } else {
      router.push('/portal/capability/dispatch/overview');
    }
  };

  // 获取状态徽章样式
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case '处理中':
        return 'default';
      case '已完成':
        return 'secondary';
      case '进行中':
        return 'default';
      default:
        return 'outline';
    }
  };

  // 获取超时状态样式
  const getTimeoutStatusColor = (status: string) => {
    switch (status) {
      case '已超时':
        return 'text-red-600 bg-red-50';
      case '即将超时':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 页面标题 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            )}
            <h1 className="text-2xl font-bold text-foreground">工单列表</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as WorkOrderType);
          setCurrentPage(1);
          setSelectedCategory('全部类型');
        }} className="space-y-6">
          {/* Tab 切换 */}
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="我发起的">
              我发起的 {tabData['我发起的'].length > 0 && (
                <Badge variant="secondary" className="ml-2">{tabData['我发起的'].length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="待办">
              待办 {tabData['待办'].length > 0 && (
                <Badge variant="secondary" className="ml-2">{tabData['待办'].length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="已办">
              已办 {tabData['已办'].length > 0 && (
                <Badge variant="secondary" className="ml-2">{tabData['已办'].length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* 左侧工单类型筛选 */}
              <div className="col-span-3">
                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="border-b p-4">
                    <h3 className="font-semibold">工单类型</h3>
                  </div>
                  <div className="p-4">
                    {/* 搜索框 */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="请输入工单类型"
                          className="pl-9"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 类型列表 */}
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-1">
                        {Object.entries(workOrderCategories).map(([name, data]) => {
                          const count = typeof data === 'object' && 'count' in data ? data.count : 0;
                          const hasChildren = typeof data === 'object' && 'children' in data;
                          const isExpanded = expandedCategories.includes(name);
                          const isSelected = selectedCategory === name;

                          return (
                            <div key={name}>
                              {/* 主分类 */}
                              <button
                                onClick={() => {
                                  setSelectedCategory(name);
                                  setCurrentPage(1);
                                  if (hasChildren) {
                                    toggleCategory(name);
                                  }
                                }}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {hasChildren && (
                                    isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )
                                  )}
                                  <span>{name}</span>
                                </span>
                                <Badge variant={isSelected ? "secondary" : "outline"} className="text-xs">
                                  {count}
                                </Badge>
                              </button>

                              {/* 子分类 */}
                              {hasChildren && isExpanded && (
                                <div className="ml-4 mt-1 space-y-1">
                                  {Object.entries((data as any).children || {}).map(([subName, subData]) => {
                                    const subCount = subData && typeof subData === 'object' && 'count' in subData ? (subData as any).count : 0;
                                    const isSubSelected = selectedCategory === subName;

                                    return (
                                      <button
                                        key={subName}
                                        onClick={() => {
                                          setSelectedCategory(subName);
                                          setCurrentPage(1);
                                        }}
                                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                                          isSubSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                        }`}
                                      >
                                        <span>{subName}</span>
                                        <Badge variant={isSubSelected ? "secondary" : "outline"} className="text-xs">
                                          {subCount}
                                        </Badge>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>

              {/* 右侧主要内容 */}
              <div className="col-span-9 space-y-4">
                {/* 筛选区 */}
                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="border-b p-4">
                    <h3 className="font-semibold">查询条件</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">工单编号</label>
                        <Input
                          placeholder="请输入编号"
                          value={filters.orderNumber}
                          onChange={(e) => setFilters({ ...filters, orderNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">工单标题</label>
                        <Input
                          placeholder="请输入标题"
                          value={filters.orderTitle}
                          onChange={(e) => setFilters({ ...filters, orderTitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">建单省</label>
                        <Select
                          value={filters.province}
                          onValueChange={(value) => setFilters({ ...filters, province: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="请选择" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">请选择</SelectItem>
                            <SelectItem value="全国">全国</SelectItem>
                            <SelectItem value="乌鲁木齐">乌鲁木齐</SelectItem>
                            <SelectItem value="克拉玛依">克拉玛依</SelectItem>
                            <SelectItem value="哈密">哈密</SelectItem>
                            <SelectItem value="吐鲁番">吐鲁番</SelectItem>
                            <SelectItem value="昌吉">昌吉</SelectItem>
                            <SelectItem value="克州">克州</SelectItem>
                            <SelectItem value="博州">博州</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-2">
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="flex-1"
                        >
                          <X className="mr-2 h-4 w-4" />
                          重置
                        </Button>
                        <Button
                          onClick={() => setCurrentPage(1)}
                          className="flex-1"
                        >
                          <Search className="mr-2 h-4 w-4" />
                          查询
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 数据表格 */}
                <div className="rounded-lg border bg-card shadow-sm">
                  {/* 操作按钮 */}
                  <div className="border-b px-4 py-3 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      共 {filteredOrders.length} 条
                    </div>
                  </div>

                  {/* 表格内容 - 支持横向滚动 */}
                  <div className="relative">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead className="min-w-[160px] sticky left-0 bg-background shadow-r">工单编号</TableHead>
                            <TableHead className="min-w-[180px]">工单标题</TableHead>
                            <TableHead className="min-w-[150px]">工单类型</TableHead>
                            <TableHead className="min-w-[100px]">省</TableHead>
                            <TableHead className="min-w-[120px]">当前环节</TableHead>
                            <TableHead className="min-w-[150px]">当前处理人</TableHead>
                            <TableHead className="min-w-[100px]">工单状态</TableHead>
                            <TableHead className="min-w-[100px]">流程状态</TableHead>
                            {activeTab !== '待办' && <TableHead className="min-w-[100px]">处理结果</TableHead>}
                            <TableHead className="min-w-[100px]">超时状态</TableHead>
                            <TableHead className="min-w-[120px]">剩余时长</TableHead>
                            <TableHead className="min-w-[120px]">超时时间</TableHead>
                            <TableHead className="min-w-[160px]">更新时间</TableHead>
                            <TableHead className="min-w-[160px]">创建时间</TableHead>
                            <TableHead className="min-w-[120px]">创建人</TableHead>
                            <TableHead className="min-w-[150px]">创建人部门</TableHead>
                            <TableHead className="min-w-[100px] sticky right-0 bg-background shadow-l">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedOrders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium sticky left-0 bg-background shadow-r">
                                <span className="text-sm">{order.id}</span>
                              </TableCell>
                              <TableCell className="max-w-[180px] truncate">
                                {order.title}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="text-sm">{order.type}</div>
                                  {order.subType && (
                                    <div className="text-xs text-muted-foreground">{order.subType}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{order.province}</TableCell>
                              <TableCell>{order.currentStage}</TableCell>
                              <TableCell className="max-w-[150px] truncate text-sm">
                                {order.currentHandler}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                                  {order.orderStatus}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(order.processStatus)}>
                                  {order.processStatus}
                                </Badge>
                              </TableCell>
                              {activeTab !== '待办' && (
                                <TableCell>
                                  {order.handleResult ? (
                                    <Badge variant={order.handleResult === '通过' ? 'default' : 'destructive'}>
                                      {order.handleResult}
                                    </Badge>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            )}
                            <TableCell>
                              <Badge className={`text-xs ${getTimeoutStatusColor(order.timeoutStatus)}`}>
                                {order.timeoutStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>{order.remainingTime}</TableCell>
                            <TableCell>{order.timeoutTime}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {order.updateTime}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {order.createTime}
                            </TableCell>
                            <TableCell>{order.creator}</TableCell>
                            <TableCell className="text-sm">{order.creatorDepartment}</TableCell>
                            <TableCell className="sticky right-0 bg-background shadow-l">
                              <div className="flex gap-2">
                                {activeTab === '待办' ? (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleProcess(order.id)}
                                  >
                                    处理
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleView(order.id)}
                                  >
                                    查看详情
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                  {/* 分页区 */}
                  <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-3">
                    <div className="text-sm text-muted-foreground">
                      共 {filteredOrders.length} 条
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {pageSize}条/页
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        上一页
                      </Button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => 
                            page === 1 || 
                            page === totalPages || 
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          )
                          .map((page, idx, arr) => (
                            <React.Fragment key={page}>
                              {idx > 0 && arr[idx - 1] !== page - 1 && (
                                <span className="px-2 text-muted-foreground">...</span>
                              )}
                              <Button
                                size="sm"
                                variant={currentPage === page ? "default" : "outline"}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        下一页
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">前往</span>
                        <Input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={currentPage}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val >= 1 && val <= totalPages) {
                              setCurrentPage(val);
                            }
                          }}
                          className="w-16 h-8"
                        />
                        <span className="text-sm text-muted-foreground">页</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 页面导出 - 使用 Suspense 包裹以支持 useSearchParams
export default function WorkOrderListPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <WorkOrderListContent />
    </Suspense>
  );
}

// 加载骨架屏组件
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Skeleton className="h-[600px] rounded-lg" />
          </div>
          <div className="col-span-9 space-y-4">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
