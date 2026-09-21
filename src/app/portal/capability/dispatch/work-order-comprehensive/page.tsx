'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, X, ChevronRight, ChevronDown, FileText, Download, ArrowLeft, ExternalLink } from 'lucide-react';

// 工单类型分类定义
const workOrderCategories = {
  全部类型: { count: 630 },
  生产类: {
    count: 485,
    children: {
      '中高端策略调度': { count: 233 },
      '中高端客群调度': { count: 206 },
      '离网维系策略调度': { count: 0 },
      '离网维系客群调度': { count: 46 },
    },
  },
  管理类: {
    count: 42,
    children: {
      '中高端指标调度': { count: 42 },
      '离网维系指标调度': { count: 0 },
    },
  },
  审批类: {
    count: 88,
    children: {
      '公告审批': { count: 0 },
      '素材授权': { count: 3 },
      '导出审批': { count: 13 },
      '导出审批任务': { count: 72 },
    },
  },
  测试: { count: 15 },
};

// 查询类型定义
type QueryType = '按接单区域查询' | '按建单区域查询';

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
const generateWorkOrders = (type: QueryType, count: number): WorkOrder[] => {
  const provinces = ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博州', '巴州', '阿克苏', '克州', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '奎屯', '石河子'];
  const orders: WorkOrder[] = [];

  const stages = ['用户任务', '管理员审批', '运营审核人员审批', '领导审批', '已结束'];
  const statuses = ['处理中', '已完成'];
  const processStatuses = ['进行中', '已完成'];
  const timeoutStatuses = ['正常', '即将超时', '已超时'];
  const creators = ['集团管理员', '超级管理员', '权限审核人员', '运营审核人员'];
  const departments = ['集团总部', '省级运营中心', '客户服务中心', '产品运营中心'];
  const types = [
    '审批类/导出审批任务',
    '审批类/公告审批',
    '审批类/导出审批',
    '审批类/素材授权',
    '生产类/中高端策略调度',
    '生产类/中高端客群调度',
    '生产类/中高端指标调度',
    '管理类/中高端管理调度',
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
    '客户流失预警指标调度',
    '拍照离网客户规模改善策略调度',
    '离网客户价值保有率指标调度',
    '场景化原子产品收入改善策略调度',
    '数据导出申请调度',
    '业务审批调度',
  ];

  for (let i = 0; i < count; i++) {
    const isCompleted = Math.random() > 0.6;
    const randomType = types[Math.floor(Math.random() * types.length)];
    const [mainType, subType] = randomType.split('/');
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    orders.push({
      id: `000491${String(80000000 + i * 1000000).slice(-11)}`,
      title: randomTitle,
      type: mainType,
      subType: subType || '',
      province: provinces[i % provinces.length],
      currentStage: isCompleted ? '已结束' : stages[Math.floor(Math.random() * 4)],
      currentHandler: isCompleted ? '-' : `角色:${creators[i % creators.length]}`,
      orderStatus: isCompleted ? '已完成' : '处理中',
      processStatus: isCompleted ? '已完成' : '进行中',
      handleResult: isCompleted && Math.random() > 0.5 ? '通过' : undefined,
      timeoutStatus: timeoutStatuses[Math.floor(Math.random() * 3)],
      remainingTime: Math.random() > 0.5 ? `${Math.floor(Math.random() * 48)}小时${Math.floor(Math.random() * 60)}分钟` : '-',
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
  '按接单区域查询': generateWorkOrders('按接单区域查询', 242),
  '按建单区域查询': generateWorkOrders('按建单区域查询', 242),
};

// 工单综合查询内容组件
function WorkOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromOverview = searchParams.get('from') === 'overview';

  // 默认值初始化状态
  const [activeTab, setActiveTab] = useState<QueryType>('按建单区域查询');
  const [selectedCategory, setSelectedCategory] = useState('全部类型');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['生产类', '审批类', '管理类']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 筛选字段
  const [filters, setFilters] = useState({
    orderNumber: '',
    orderTitle: '',
    province: 'all',
    orderStatus: 'all',
    processStatus: 'all',
    dateFilter: 'all',
    createTimeStart: '',
    createTimeEnd: '',
    completedTimeStart: '',
    completedTimeEnd: '',
  });

  // 映射tab参数到QueryType
  const getTabFromParam = (param: string | null): QueryType => {
    if (param === 'build_area') return '按建单区域查询';
    if (param === 'receive_area') return '按接单区域查询';
    if (param === '按建单区域查询' || param === '按接单区域查询') return param as QueryType;
    return '按建单区域查询';
  };

  // 映射英文状态参数到中文
  const getStatusFromParam = (param: string | null): string => {
    if (!param) return 'all';
    const statusMap: Record<string, string> = {
      'processing': '进行中',
      'completed': '已完成',
      'pending': '处理中',
      'terminated': '已终止',
    };
    return statusMap[param] || 'all';
  };

  // 从URL参数初始化状态（只在客户端执行）
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const statusParam = searchParams.get('status');
    const dateParam = searchParams.get('date');
    const provinceParam = searchParams.get('province');

    if (tabParam) {
      setActiveTab(getTabFromParam(tabParam));
    }

    if (statusParam) {
      setFilters(prev => ({ ...prev, orderStatus: getStatusFromParam(statusParam) }));
    }

    if (dateParam) {
      setFilters(prev => ({ ...prev, dateFilter: dateParam }));
    }

    if (provinceParam) {
      setFilters(prev => ({ ...prev, province: provinceParam }));
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
    if (filters.orderStatus && filters.orderStatus !== 'all') {
      orders = orders.filter(order => order.orderStatus === filters.orderStatus);
    }
    if (filters.processStatus && filters.processStatus !== 'all') {
      orders = orders.filter(order => order.processStatus === filters.processStatus);
    }
    if (filters.dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      orders = orders.filter(order => order.createTime.startsWith(today.replace(/-/g, '-')));
    } else if (filters.dateFilter === 'week') {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      orders = orders.filter(order => {
        const orderDate = new Date(order.createTime);
        return orderDate >= weekAgo;
      });
    } else if (filters.dateFilter === 'month') {
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      orders = orders.filter(order => {
        const orderDate = new Date(order.createTime);
        return orderDate >= monthAgo;
      });
    }

    // 创建时间范围筛选
    if (filters.createTimeStart) {
      orders = orders.filter(order => {
        const orderDate = new Date(order.createTime.split(' ')[0]).getTime();
        const startDate = new Date(filters.createTimeStart).getTime();
        return orderDate >= startDate;
      });
    }
    if (filters.createTimeEnd) {
      orders = orders.filter(order => {
        const orderDate = new Date(order.createTime.split(' ')[0]).getTime();
        const endDate = new Date(filters.createTimeEnd).getTime();
        return orderDate <= endDate;
      });
    }

    // 完成时间范围筛选
    if (filters.completedTimeStart) {
      orders = orders.filter(order => {
        if (order.orderStatus !== '已完成') return false;
        const completedDate = new Date(order.updateTime.split(' ')[0]).getTime();
        const startDate = new Date(filters.completedTimeStart).getTime();
        return completedDate >= startDate;
      });
    }
    if (filters.completedTimeEnd) {
      orders = orders.filter(order => {
        if (order.orderStatus !== '已完成') return false;
        const completedDate = new Date(order.updateTime.split(' ')[0]).getTime();
        const endDate = new Date(filters.completedTimeEnd).getTime();
        return completedDate <= endDate;
      });
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
      orderStatus: 'all',
      processStatus: 'all',
      dateFilter: 'all',
      createTimeStart: '',
      createTimeEnd: '',
      completedTimeStart: '',
      completedTimeEnd: '',
    });
    setCurrentPage(1);
  };

  // 异步导出
  const handleExport = () => {
    console.log('异步导出工单数据');
    // 实际应用中应该调用导出API
  };

  // 查看详情
  const handleViewDetail = (orderId: string) => {
    router.push(`/portal/capability/dispatch/work-order-detail?id=${orderId}${isFromOverview ? '&from=overview' : ''}`);
  };

  // 返回总览页
  const handleBack = () => {
    router.push('/portal/capability/dispatch/overview');
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
            {isFromOverview && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            )}
            <h1 className="text-2xl font-bold text-foreground">流程工单</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as QueryType);
          setCurrentPage(1);
          setSelectedCategory('全部类型');
        }} className="space-y-6">
          {/* Tab 切换 */}
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="按接单区域查询">按接单区域查询</TabsTrigger>
            <TabsTrigger value="按建单区域查询">按建单区域查询</TabsTrigger>
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
                {/* 工单查询区 */}
                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="border-b p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">工单查询</h3>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        高级查询 <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-4 items-end">
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
                        <label className="text-sm font-medium">工单状态</label>
                        <Select value={filters.orderStatus} onValueChange={(value) => setFilters({ ...filters, orderStatus: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="全部" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">全部</SelectItem>
                            <SelectItem value="处理中">处理中</SelectItem>
                            <SelectItem value="已完成">已完成</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">流程状态</label>
                        <Select value={filters.processStatus} onValueChange={(value) => setFilters({ ...filters, processStatus: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="全部" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">全部</SelectItem>
                            <SelectItem value="进行中">进行中</SelectItem>
                            <SelectItem value="已完成">已完成</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">创建时间</label>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            value={filters.createTimeStart}
                            onChange={(e) => setFilters({ ...filters, createTimeStart: e.target.value })}
                          />
                          <span className="text-sm self-center">至</span>
                          <Input
                            type="date"
                            value={filters.createTimeEnd}
                            onChange={(e) => setFilters({ ...filters, createTimeEnd: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">完成时间</label>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            value={filters.completedTimeStart}
                            onChange={(e) => setFilters({ ...filters, completedTimeStart: e.target.value })}
                          />
                          <span className="text-sm self-center">至</span>
                          <Input
                            type="date"
                            value={filters.completedTimeEnd}
                            onChange={(e) => setFilters({ ...filters, completedTimeEnd: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 col-span-4">
                        <Button
                          variant="outline"
                          onClick={handleReset}
                        >
                          <X className="mr-2 h-4 w-4" />
                          重置
                        </Button>
                        <Button
                          onClick={() => setCurrentPage(1)}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      异步导出
                    </Button>
                  </div>

                  {/* 表格内容 - 支持横向滚动 */}
                  <div className="relative">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead className="min-w-[160px]">工单编号</TableHead>
                            <TableHead className="min-w-[200px]">工单标题</TableHead>
                            <TableHead className="min-w-[180px]">工单类型</TableHead>
                            <TableHead className="min-w-[100px]">省</TableHead>
                            <TableHead className="min-w-[120px]">当前环节</TableHead>
                            <TableHead className="min-w-[150px]">当前处理人</TableHead>
                            <TableHead className="min-w-[100px]">工单状态</TableHead>
                            <TableHead className="min-w-[100px]">流程状态</TableHead>
                            <TableHead className="min-w-[100px]">处理结果</TableHead>
                            <TableHead className="min-w-[100px]">超时状态</TableHead>
                            <TableHead className="min-w-[120px]">剩余处理时间</TableHead>
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
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{order.title}</TableCell>
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
                              <TableCell>
                                {order.handleResult ? (
                                  <Badge variant={order.handleResult === '通过' ? 'default' : 'destructive'}>
                                    {order.handleResult}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
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
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetail(order.id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  详情 <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
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
export default function WorkOrderComprehensivePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <WorkOrderContent />
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
