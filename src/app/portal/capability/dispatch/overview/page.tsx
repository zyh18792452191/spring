'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ClipboardList, Users, Activity, CheckCircle2, Clock, FileText, LayoutDashboard, RefreshCw, Import, Plus } from 'lucide-react';
import { getDispatchTypeByLabel } from '@/lib/dispatch-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import DispatchTrackingProvinceStats from '@/components/DispatchTrackingProvinceStats';
import WorkOrderTypeTreeSelect from '@/components/WorkOrderTypeTreeSelect';
import XinjiangRegionSelector from '@/components/XinjiangRegionSelector';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

function OverviewContent() {
}

// 全局统计数据接口
interface GlobalStats {
  totalOrders: number; // 总工单量
  pendingOrders: number; // 待处理工单数
  ongoingTasks: number; // 在途工单数
  totalStaff: number; // 存量运营人员总数
  completedToday: number; // 今日完成调度数
  activeStaff: number; // 全国在职人数
  inactiveStaff: number; // 全国离职人数
}

// 工单接口
interface WorkOrder {
  id: string;
  orderNo: string;
  title: string;
  type: string; // 调度类型
  status: string; // pending(待办), processing(已办/进行中), completed(已完成)
  tab?: string; // 我发起的、待办、已办
  priority: string; // high, medium, low
  region: string;
  createdAt: string;
  timeoutStatus?: string; // 超时状态：正常、即将超时、已超时
}

// 人员统计接口
interface StaffStats {
  region: string;
  total: number;
  active: number;
  inactive: number;
}

function DispatchOverviewPage() {
  const router = useRouter();
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalOrders: 0,
    pendingOrders: 0,
    ongoingTasks: 0,
    totalStaff: 0,
    completedToday: 0,
    activeStaff: 0,
    inactiveStaff: 0,
  });
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([]);
  const [staffStats, setStaffStats] = useState<StaffStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ordersTab, setOrdersTab] = useState<string>('我发起的'); // 工单列表Tab：我发起的、待办、已办

  // 区域筛选
  const [regionFilter, setRegionFilter] = useState({ cityCode: '', gridCode: '' });

  // 全局筛选条件
  const [globalFilters, setGlobalFilters] = useState({
    scenario: 'all', // 业务场景
    workOrderType: 'all', // 工单类型
    createTimeType: 'all', // 创建时间维度：all-历史所有, day-按日, month-按月
    createTimeValue: '', // 创建时间值：按日为具体日期，按月为月份
  });
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  // 存量运营团队分页
  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const [staffPageSize] = useState(10);

  // 工单列表分页
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [ordersPageSize] = useState(5);

  // 加载全局统计数据
  useEffect(() => {
    loadGlobalStats();
    loadRecentOrders();
    loadStaffStats();

    // 恢复滚动位置
    const savedScrollPosition = localStorage.getItem('dispatch-overview-scroll-position');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition));
      localStorage.removeItem('dispatch-overview-scroll-position');
    }
  }, [ordersTab]); // 添加 ordersTab 依赖，Tab 切换时重新加载工单列表

  const loadGlobalStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dispatch/overview/stats');
      const result = await response.json();

      if (result.success && result.data) {
        setGlobalStats(result.data);
      } else {
        // 如果API调用失败，使用模拟数据
        const fallbackStats: GlobalStats = {
          totalOrders: 630,
          pendingOrders: 322,
          ongoingTasks: 242,
          totalStaff: 7587,
          completedToday: 45,
          activeStaff: 7380,
          inactiveStaff: 207,
        };
        setGlobalStats(fallbackStats);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 如果API调用失败，使用模拟数据
      const fallbackStats: GlobalStats = {
        totalOrders: 630,
        pendingOrders: 322,
        ongoingTasks: 242,
        totalStaff: 7587,
        completedToday: 45,
        activeStaff: 7380,
        inactiveStaff: 207,
      };
      setGlobalStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const response = await fetch(`/api/dispatch/overview/orders?limit=100&tab=${ordersTab}`);
      const result = await response.json();

      if (result.success && result.data) {
        setRecentOrders(result.data);
        setOrdersCurrentPage(1); // 重置分页到第一页
      } else {
        // 使用空数据
        setRecentOrders([]);
        setOrdersCurrentPage(1);
      }
    } catch (error) {
      console.error('加载工单列表失败:', error);
      setRecentOrders([]);
      setOrdersCurrentPage(1);
    }
  };

  const loadStaffStats = async () => {
    try {
      const response = await fetch('/api/staff-management/stats');
      const result = await response.json();

      if (result.success && result.data && result.data.regionStats) {
        const stats: StaffStats[] = result.data.regionStats.map((item: any) => ({
          region: item.region,
          total: item.total,
          active: item.active,
          inactive: item.inactive,
        }));
        setStaffStats(stats);
        // 设置总人数
        const totalActive = stats.reduce((sum, item) => sum + item.active, 0);
        const totalInactive = stats.reduce((sum, item) => sum + item.inactive, 0);
        setGlobalStats(prev => ({
          ...prev,
          totalStaff: result.data.total,
          activeStaff: totalActive,
          inactiveStaff: totalInactive
        }));
      } else {
        // 使用模拟数据
        const mockStats: StaffStats[] = [
          { region: '乌鲁木齐', total: 143, active: 126, inactive: 17 },
          { region: '克拉玛依', total: 120, active: 103, inactive: 17 },
          { region: '吐鲁番', total: 1579, active: 1430, inactive: 149 },
          { region: '哈密', total: 119, active: 109, inactive: 10 },
          { region: '昌吉', total: 168, active: 155, inactive: 13 },
          { region: '博州', total: 190, active: 172, inactive: 18 },
          { region: '巴州', total: 182, active: 166, inactive: 16 },
          { region: '阿克苏', total: 100, active: 93, inactive: 7 },
          { region: '克州', total: 366, active: 339, inactive: 27 },
          { region: '喀什', total: 100, active: 90, inactive: 10 },
        ];
        setStaffStats(mockStats);
        const totalActive = mockStats.reduce((sum, item) => sum + item.active, 0);
        const totalInactive = mockStats.reduce((sum, item) => sum + item.inactive, 0);
        setGlobalStats(prev => ({
          ...prev,
          activeStaff: totalActive,
          inactiveStaff: totalInactive
        }));
      }
    } catch (error) {
      console.error('加载人员统计失败:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGlobalStats();
    loadRecentOrders();
    loadStaffStats();
    setTimeout(() => setRefreshing(false), 500);
  };

  // 重置全局筛选
  const handleResetGlobalFilters = () => {
    setGlobalFilters({
      scenario: 'all',
      workOrderType: 'all',
      createTimeType: 'all',
      createTimeValue: '',
    });
  };

  // 获取状态对应的徽章样式
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">处理中</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">已完成</Badge>;
      case 'timeout':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">超时</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 获取优先级对应的徽章样式
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">高</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">中</Badge>;
      case 'low':
        return <Badge variant="outline">低</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // 跳转到工单列表（带参数）
  const navigateToWorkOrderList = (type: string) => {
    if (type === 'pending') {
      // 待处理跳转到工单列表页（待办Tab）
      router.push(`/portal/capability/dispatch/work-order-list?from=overview&tab=pending`);
    } else {
      // 总工单量、进行中、今日完成跳转到工单综合查询页
      let queryParams = `from=overview&tab=build_area`;
      if (type === 'ongoing') {
        queryParams += '&status=processing';
      } else if (type === 'completed_today') {
        // 今日完成：筛选条件是完成时间为T-1日（昨天）
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        queryParams += `&status=completed&date_type=completed_at&date=${yesterdayStr}`;
      }
      router.push(`/portal/capability/dispatch/work-order-comprehensive?${queryParams}`);
    }
  };

  // 跳转到工单详情
  const navigateToWorkOrderDetail = (orderId: string) => {
    // 查找对应的工单信息
    const order = recentOrders.find(o => o.id === orderId);
    if (!order) {
      console.error('工单不存在:', orderId);
      return;
    }

    // 保存当前滚动位置
    localStorage.setItem('dispatch-overview-scroll-position', window.scrollY.toString());

    // 构造URL参数
    const dispatchType = getDispatchTypeByLabel(order.type || '');
    const params = new URLSearchParams({
      id: orderId,
      type: dispatchType,
      title: order.title,
      status: order.status,
      region: order.region,
      createdAt: order.createdAt,
      orderNo: order.orderNo,
      from: 'overview'
    });
    // 待办工单为处理模式，其余为查看模式
    if (order.tab === '待办' || order.status === 'pending') {
      params.set('mode', 'process');
    }

    router.push(`/workspace/ticket-detail?${params.toString()}`);
  };

  // 跳转到存量运营团队
  const navigateToTeam = () => {
    router.push('/portal/capability/dispatch/team?from=overview');
  };

  // 存量运营团队分页数据
  const staffTotalPages = Math.ceil(staffStats.length / staffPageSize);
  const staffPaginatedData = staffStats.slice(
    (staffCurrentPage - 1) * staffPageSize,
    staffCurrentPage * staffPageSize
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">调度总览</h1>
            <p className="text-gray-600 mt-1">调度中心模块门户，统一管理和监控调度相关业务</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <XinjiangRegionSelector
            value={regionFilter}
            onChange={(cityCode: string, cityName: string, gridCode: string, gridName: string) => {
              setRegionFilter({ cityCode, gridCode });
            }}
          />
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 全局筛选条件 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">业务场景</label>
              <Select
                value={globalFilters.scenario}
                onValueChange={(value) => setGlobalFilters({ ...globalFilters, scenario: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="churn-retention">离网维系</SelectItem>
                  <SelectItem value="mid-high-customer">中高端客户运营</SelectItem>
                  <SelectItem value="usage-operation">用量运营</SelectItem>
                  <SelectItem value="convergence">融合运营</SelectItem>
                  <SelectItem value="international">国际业务运营</SelectItem>
                  <SelectItem value="segment-market">细分市场运营</SelectItem>
                  <SelectItem value="family">家庭运营</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">工单类型</label>
              <WorkOrderTypeTreeSelect
                value={globalFilters.workOrderType}
                onChange={(value) => setGlobalFilters({ ...globalFilters, workOrderType: value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">创建时间</label>
              <div className="flex gap-4 items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="createTimeType"
                    value="all"
                    checked={globalFilters.createTimeType === 'all'}
                    onChange={(e) => setGlobalFilters({ ...globalFilters, createTimeType: e.target.value, createTimeValue: '' })}
                    className="cursor-pointer"
                  />
                  <span className="text-sm">历史所有</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="createTimeType"
                    value="day"
                    checked={globalFilters.createTimeType === 'day'}
                    onChange={(e) => setGlobalFilters({ ...globalFilters, createTimeType: e.target.value, createTimeValue: '' })}
                    className="cursor-pointer"
                  />
                  <span className="text-sm">按日</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="createTimeType"
                    value="month"
                    checked={globalFilters.createTimeType === 'month'}
                    onChange={(e) => setGlobalFilters({ ...globalFilters, createTimeType: e.target.value, createTimeValue: '' })}
                    className="cursor-pointer"
                  />
                  <span className="text-sm">按月</span>
                </label>
                {globalFilters.createTimeType === 'day' && (
                  <Input
                    type="date"
                    value={globalFilters.createTimeValue || selectedDate}
                    onChange={(e) => setGlobalFilters({ ...globalFilters, createTimeValue: e.target.value })}
                    className="w-36"
                  />
                )}
                {globalFilters.createTimeType === 'month' && (
                  <Input
                    type="month"
                    value={globalFilters.createTimeValue || selectedMonth}
                    onChange={(e) => setGlobalFilters({ ...globalFilters, createTimeValue: e.target.value })}
                    className="w-36"
                  />
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleResetGlobalFilters}>
                重置
              </Button>
              <Button onClick={handleRefresh} disabled={refreshing}>
                查询
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 全局统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToWorkOrderList('all')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">总工单量</CardTitle>
            <ClipboardList className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{loading ? '-' : globalStats.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">历史累计工单</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToWorkOrderList('pending')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">待处理</CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{loading ? '-' : globalStats.pendingOrders}</div>
            <p className="text-xs text-gray-500 mt-1">当前操作员待办</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToWorkOrderList('ongoing')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">在途</CardTitle>
            <Activity className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{loading ? '-' : globalStats.ongoingTasks}</div>
            <p className="text-xs text-gray-500 mt-1">所有在途工单</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToWorkOrderList('completed_today')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">今日完成</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{loading ? '-' : globalStats.completedToday}</div>
            <p className="text-xs text-gray-500 mt-1">今日完成工单</p>
          </CardContent>
        </Card>
      </div>

      {/* 功能模块区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 调度跟踪模块 - 分区域调度统计 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <CardTitle>分区域调度跟踪统计</CardTitle>
              </div>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DispatchTrackingProvinceStats />
          </CardContent>
        </Card>

        {/* 工单列表模块 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                <CardTitle>工单列表</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => router.push('/portal/capability/dispatch/work-order-list?from=overview&tab=pending')}>
                  查看全部 <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700" onClick={() => router.push('/portal/capability/dispatch/work-order-comprehensive?from=overview&tab=build_area')}>
                  工单综合查询 <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            {/* Tab 切换 */}
            <div className="flex gap-1 border-b">
              <Button
                variant={ordersTab === '我发起的' ? 'default' : 'ghost'}
                size="sm"
                className={ordersTab === '我发起的' ? 'border-b-2 border-blue-500 rounded-b-none' : 'text-gray-600 hover:text-gray-900'}
                onClick={() => setOrdersTab('我发起的')}
              >
                我发起的
              </Button>
              <Button
                variant={ordersTab === '待办' ? 'default' : 'ghost'}
                size="sm"
                className={ordersTab === '待办' ? 'border-b-2 border-blue-500 rounded-b-none' : 'text-gray-600 hover:text-gray-900'}
                onClick={() => setOrdersTab('待办')}
              >
                待办
              </Button>
              <Button
                variant={ordersTab === '已办' ? 'default' : 'ghost'}
                size="sm"
                className={ordersTab === '已办' ? 'border-b-2 border-blue-500 rounded-b-none' : 'text-gray-600 hover:text-gray-900'}
                onClick={() => setOrdersTab('已办')}
              >
                已办
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.slice((ordersCurrentPage - 1) * ordersPageSize, ordersCurrentPage * ordersPageSize).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{order.title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Badge variant="outline" className="text-xs">{order.orderNo}</Badge>
                      <span>{order.region}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{order.createdAt}</span>
                    </div>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(order.status)}
                      {order.timeoutStatus && (
                        <Badge 
                          variant={order.timeoutStatus === '已超时' ? 'destructive' : order.timeoutStatus === '即将超时' ? 'secondary' : 'outline'} 
                          className="text-xs"
                        >
                          {order.timeoutStatus}
                        </Badge>
                      )}
                    </div>
                    {/* 操作按钮 */}
                    {ordersTab === '待办' ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="ml-2"
                        onClick={() => navigateToWorkOrderDetail(order.id)}
                      >
                        处理
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => navigateToWorkOrderDetail(order.id)}
                      >
                        查看详情
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* 工单列表分页 */}
            {recentOrders.length > ordersPageSize && (
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOrdersCurrentPage(p => Math.max(1, p - 1))}
                    disabled={ordersCurrentPage === 1}
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-gray-600">
                    {ordersCurrentPage} / {Math.ceil(recentOrders.length / ordersPageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOrdersCurrentPage(p => Math.min(Math.ceil(recentOrders.length / ordersPageSize), p + 1))}
                    disabled={ordersCurrentPage >= Math.ceil(recentOrders.length / ordersPageSize)}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DispatchOverviewPage />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
