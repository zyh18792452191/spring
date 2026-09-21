'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, Plus, Clock, AlertCircle, TrendingUp, LayoutDashboard, Target, Bell, Search, ChevronRight, CheckCircle, Calendar, FileText, AlertTriangle, MoreHorizontal, Grid, AppWindow, Workflow } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTabs } from '@/contexts/TabsContext';
import { toast } from 'sonner';

// 模拟数据
const metricsData = [
  {
    id: 1,
    name: '拍照中高端综合保有率',
    value: '96.86%',
    changeText: '环比 96.86%',
    isPositive: true,
    iconColor: 'bg-blue-500',
  },
  {
    id: 2,
    name: '拍照中高端客户价值保有率',
    value: '97.55%',
    changeText: '值 97.55%',
    isPositive: true,
    iconColor: 'bg-green-500',
  },
  {
    id: 3,
    name: '场景化原子产品收入',
    value: '万元',
    changeText: '环比 %',
    isPositive: false,
    iconColor: 'bg-orange-500',
  },
  {
    id: 4,
    name: '拍照中高端客户规模保有率',
    value: '96.17%',
    changeText: '环比 96.17%',
    isPositive: true,
    iconColor: 'bg-orange-500',
  },
  {
    id: 5,
    name: '中高端客户规模',
    value: '4.36亿',
    changeText: '环比 0.23%',
    isPositive: true,
    iconColor: 'bg-purple-500',
  },
  {
    id: 6,
    name: '拍照中高端升档增收价值',
    value: '11544.9万元',
    changeText: '值 11544.9万元',
    isPositive: true,
    iconColor: 'bg-blue-500',
  },
];

const commonApps = [
  { name: '一经平台', icon: LayoutDashboard, color: 'bg-blue-500' },
  { name: '智慧大脑', icon: Target, color: 'bg-purple-500' },
  { name: '商机中心', icon: Bell, color: 'bg-green-500' },
  { name: '市场指标调度', icon: TrendingUp, color: 'bg-orange-500' },
  { name: '产品枢纽平台', icon: Search, color: 'bg-red-500' },
  { name: '触点融通平台', icon: ChevronRight, color: 'bg-cyan-500' },
  { name: '流程治理平台', color: 'bg-pink-500' },
  { name: '一级能力运营', color: 'bg-indigo-500' },
];

const commonFunctions = [
  { name: '指标树分析', icon: Target, color: 'bg-blue-500' },
  { name: '策略匹配', icon: TrendingUp, color: 'bg-green-500' },
  { name: '调度派发', icon: Workflow, color: 'bg-orange-500' },
  { name: '效果评估', icon: CheckCircle, color: 'bg-purple-500' },
  { name: '工单管理', icon: FileText, color: 'bg-red-500' },
];

// 工单类型定义
type WorkOrderType = 'indicator' | 'strategy' | 'customer-group' | 'customer-opportunity-dispatch' | 'group-opportunity-dispatch' | 'region-assault';

// 调度类型的工单模板
const workOrderTemplates = {
  indicator: {
    titles: ['一降到底改善指标调度', '中高端客户保有率指标调度', '拍照中高端升档增收指标调度', '5G套包升档指标调度', '全球通保有率改善指标调度', '客户流失预警指标调度', '离网客户价值保有率指标调度'],
    businessType: '管理类/指标调度',
    prefix: 'IND',
    label: '指标调度'
  },
  strategy: {
    titles: ['异网主卡客户迎回策略执行', '零融合客户融合推广策略', '高价值客户维系策略执行', '离网预警客户挽留策略', '中高端客户升档策略执行'],
    businessType: '生产类/策略调度',
    prefix: 'STR',
    label: '策略调度'
  },
  'customer-group': {
    titles: ['高价值离网客群维系调度', '异网主卡客群营销调度', '低流量客群激活调度', '零融合客群转化调度', '中高端客群保有调度'],
    businessType: '生产类/客群调度',
    prefix: 'GRP',
    label: '客群调度'
  },
  'customer-opportunity-dispatch': {
    titles: ['流量达量预警客户调度', '5G终端低迁转客户调度', '高DOU低套餐客户调度', '地板价高流量客户调度', '离网预警客户调度', '中高端携转风险客户调度'],
    businessType: '生产类/客户商机调度',
    prefix: 'COD',
    label: '客户商机调度'
  },
  'group-opportunity-dispatch': {
    titles: ['高价值离网客群调度', '5G终端低迁转客群调度', '流量达量预警客群调度', '中高端携转风险客群调度', '零融合客群调度', '家庭宽带潜客群调度'],
    businessType: '生产类/客群商机调度',
    prefix: 'GOD',
    label: '客群商机调度'
  },
  'region-assault': {
    titles: ['天山区流量攻坚调度', '沙依巴克区5G迁转攻坚调度'],
    businessType: '生产类/区域攻坚调度',
    prefix: 'RAS',
    label: '区域攻坚调度'
  }
};

// 生成模拟工单数据（包含五种调度类型）
const generateWorkOrders = (count: number, type: 'initiated' | 'pending' | 'completed') => {
  const workOrders = [];
  const types: WorkOrderType[] = ['indicator', 'strategy', 'customer-group', 'customer-opportunity-dispatch', 'group-opportunity-dispatch', 'region-assault'];

  const statusList = type === 'initiated' ? ['timeout', 'pending', 'completed'] :
                    type === 'pending' ? ['pending'] :
                    ['completed'];

  const statusTextList = type === 'initiated' ? ['已超时', '进行中', '已完成'] :
                       type === 'pending' ? ['进行中'] :
                       ['已完成'];

  for (let i = 0; i < count; i++) {
    const statusIndex = type === 'initiated' ? i % 3 : 0;
    const orderType = types[i % types.length]; // 循环分配所有类型
    const template = workOrderTemplates[orderType];
    const titleIndex = Math.floor(i / types.length) % template.titles.length;
    const month = 1 + Math.floor(i / 30);
    const day = (i % 30) + 1;
    const sequenceNum = Math.floor(i / types.length) + 1;

    // 根据工单类型生成区域信息
    const gridNames = ['南塔网格', '红庙子网格', '友好路网格', '喀什东路网格', '北京路网格', '建设路网格', '新华路网格', '解放路网格'];
    let area = '';
    if (orderType === 'customer-opportunity-dispatch') {
      // 客户商机调度：批量选客派单，显示客户数和网格数
      const customerCount = 15 + (i % 6) * 5; // 15~40个客户
      const gridCount = 1 + (i % 4); // 1~4个网格
      area = `${customerCount}个客户 · ${gridCount}个网格`;
    } else if (orderType === 'group-opportunity-dispatch') {
      // 客群商机调度：按网格拆单，显示覆盖网格数
      area = `${2 + (i % 5)}个网格`;
    } else if (orderType === 'region-assault') {
      // 区域攻坚调度：按区域圈选，显示小区数和客户数
      const communityCount = 3 + (i % 4); // 3~6个小区
      const customerCount = 1500 + (i % 5) * 500; // 1500~3500户
      area = `${communityCount}个小区 · ${customerCount}户`;
    }

    workOrders.push({
      id: `${template.prefix}-${String(sequenceNum).padStart(4, '0')}`,
      title: `${template.titles[titleIndex]}-${type === 'initiated' ? '第' + sequenceNum + '期' : sequenceNum}`,
      type: orderType, // 工单类型
      businessType: template.businessType, // 业务类型
      status: statusList[statusIndex],
      createTime: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(10 + (i % 8)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
      statusText: statusTextList[statusIndex],
      area: area,
    });
  }

  return workOrders;
};

const myInitiatedWorkOrders = generateWorkOrders(464, 'initiated');
const myPendingWorkOrders = generateWorkOrders(99, 'pending');
const myCompletedWorkOrders = generateWorkOrders(40, 'completed');

const alerts = [
  {
    id: 1,
    indicator: '拍照中高端升档增收价值',
    level: '橙色预警',
    levelType: 'orange',
    content: '全国拍照中高端升档增收价值>0.00 (实际…',
  },
  {
    id: 2,
    indicator: '拍照中高端升档增收价值',
    level: '橙色预警',
    levelType: 'orange',
    content: '全国拍照中高端升档增收价值>0.00 (实际…',
  },
  {
    id: 3,
    indicator: '拍照中高端升档增收价值',
    level: '橙色预警',
    levelType: 'orange',
    content: '全国拍照中高端升档增收价值>0.00 (实际…',
  },
  {
    id: 4,
    indicator: '拍照中高端升档增收价值',
    level: '橙色预警',
    levelType: 'orange',
    content: '全国拍照中高端升档增收价值>0.00 (实际…',
  },
];

// 消息列表 mock 数据（预警规则产生的告警）
const messageList = [
  { id: 'msg001', type: '待处理商机积压', content: '流量运营-客户商机池待调度商机积压 156 条，已超过阈值 100，请及时处理', read: false, time: '2024-01-15 10:30' },
  { id: 'msg002', type: '商机逾期', content: '客群商机 GOD202401150003 已逾期 12 小时，请跟进执行', read: false, time: '2024-01-15 09:15' },
  { id: 'msg003', type: '客群转化率过低', content: '客群"中高端保有-第3批"转化率 8.5%，低于阈值 15%', read: false, time: '2024-01-15 08:00' },
  { id: 'msg004', type: '清洗规则剔除率突增', content: '商机源"营销活动平台"清洗剔除率突增至 42%，请检查规则配置', read: true, time: '2024-01-14 18:20' },
  { id: 'msg005', type: '商机源采集异常', content: '商机源"外呼系统"近 1 小时采集量为 0，可能存在接口异常', read: false, time: '2024-01-14 16:45' },
  { id: 'msg006', type: '待处理商机积压', content: '中高端客户运营-待调度客群积压 89 条，接近阈值 100', read: true, time: '2024-01-14 14:10' },
  { id: 'msg007', type: '预测模型准确率下降', content: '客户商机预测模型近 7 日准确率降至 78%，低于基线 85%', read: false, time: '2024-01-14 11:30' },
  { id: 'msg008', type: '商机逾期', content: '客户商机 COD202401140007 已逾期 6 小时', read: true, time: '2024-01-14 09:00' },
];

// 运营日历数据 - 每天展示工单信息
const calendarData: Record<number, { count: number; title?: string; targetCount?: number }> = {
  5: { count: 2 },
  12: { count: 1, title: '中高端客户保有率提升', targetCount: 5000 },
  15: { count: 3 },
  18: { count: 1, title: '拍照客户规模提升', targetCount: 3000 },
  22: { count: 2 },
  25: { count: 4 },
  28: { count: 1, title: '客户流失预警处理', targetCount: 1500 },
};

// 策略评估卡片数据
const strategyEvaluation = [
  { label: '策略数量', value: '15', unit: '个', yoy: '+650.0%', isPositive: true, isLeftCard: true },
  { label: '执行中', value: '15', unit: '个', yoy: '+650.0%', isPositive: true },
  { label: '执行率', value: '100.0%', unit: '', yoy: '+650.0%', isPositive: true },
  { label: '触达客户数', value: '0', unit: '个', yoy: '+0.0%', isPositive: true },
  { label: '业务量', value: '0', unit: '个', yoy: '+0.0%', isPositive: true },
  { label: '接通量', value: '0', unit: '个', yoy: '+0.0%', isPositive: true },
  { label: '接通率', value: '0.0%', unit: '', yoy: '+0.0%', isPositive: true },
  { label: '成功量', value: '0', unit: '个', yoy: '+0.0%', isPositive: true },
  { label: '成功率', value: '0.0%', unit: '', yoy: '+0.0%', isPositive: true },
];

// 工单分析数据
const workOrderAnalysisTabs = ['全部', '生产类', '管理类'] as const;
type WorkOrderTabType = typeof workOrderAnalysisTabs[number];

const workOrderAnalysisData = {
  all: [
    { name: '待处理量(当月…)', value: 205, unit: '个', yoy: -10.5 },
    { name: '已处理量(当月…)', value: 0, unit: '个', yoy: 0.0 },
    { name: '派单量', value: 205, unit: '个', yoy: -10.5 },
    { name: '待处理量', value: 205, unit: '个', yoy: -10.5 },
    { name: '已处理量', value: 0, unit: '个', yoy: 0.0 },
    { name: '超时量', value: 0, unit: '个', yoy: 0.0 },
    { name: '触达客户数', value: 0, unit: '个', yoy: 0.0 },
    { name: '营销成功量', value: 0, unit: '个', yoy: 0.0 },
  ],
  production: [
    { name: '待处理量(当月…)', value: 150, unit: '个', yoy: -8.2 },
    { name: '已处理量(当月…)', value: 0, unit: '个', yoy: 0.0 },
    { name: '派单量', value: 150, unit: '个', yoy: -8.2 },
    { name: '待处理量', value: 150, unit: '个', yoy: -8.2 },
    { name: '已处理量', value: 0, unit: '个', yoy: 0.0 },
    { name: '超时量', value: 0, unit: '个', yoy: 0.0 },
    { name: '触达客户数', value: 0, unit: '个', yoy: 0.0 },
    { name: '营销成功量', value: 0, unit: '个', yoy: 0.0 },
  ],
  management: [
    { name: '待处理量(当月…)', value: 55, unit: '个', yoy: -15.3 },
    { name: '已处理量(当月…)', value: 0, unit: '个', yoy: 0.0 },
    { name: '派单量', value: 55, unit: '个', yoy: -15.3 },
    { name: '待处理量', value: 55, unit: '个', yoy: -15.3 },
    { name: '已处理量', value: 0, unit: '个', yoy: 0.0 },
    { name: '超时量', value: 0, unit: '个', yoy: 0.0 },
    { name: '触达客户数', value: 0, unit: '个', yoy: 0.0 },
    { name: '营销成功量', value: 0, unit: '个', yoy: 0.0 },
  ],
};

export default function WorkspacePage() {
  const router = useRouter();
  const { addTab, setActiveTab } = useTabs();
  const [rightTab, setRightTab] = useState<'common-apps' | 'common-functions'>('common-apps');
  const [activeWorkTab, setActiveWorkTab] = useState<'initiated' | 'pending' | 'completed' | 'message'>('initiated');
  const [workOrderAnalysisTab, setWorkOrderAnalysisTab] = useState<WorkOrderTabType>('全部');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [messages, setMessages] = useState(messageList);
  const unreadCount = messages.filter(m => !m.read).length;

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // 获取当前tab对应的工单列表
  const getCurrentWorkOrders = () => {
    switch (activeWorkTab) {
      case 'initiated':
        return myInitiatedWorkOrders;
      case 'pending':
        return myPendingWorkOrders;
      case 'completed':
        return myCompletedWorkOrders;
      default:
        return myInitiatedWorkOrders;
    }
  };

  // 获取当前页数据
  const getPaginatedWorkOrders = () => {
    const allWorkOrders = getCurrentWorkOrders();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allWorkOrders.slice(startIndex, endIndex);
  };

  // 获取总记录数
  const getTotalRecords = () => {
    return getCurrentWorkOrders().length;
  };

  // 获取总页数
  const getTotalPages = () => {
    return Math.ceil(getTotalRecords() / pageSize);
  };

  // 切换tab时重置页码
  const handleWorkTabChange = (tab: 'initiated' | 'pending' | 'completed' | 'message') => {
    setActiveWorkTab(tab);
    setCurrentPage(1);
  };

  // 消息标记已读
  const handleMessageDetail = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    toast.success('已查看消息详情');
  };

  // 处理页码跳转
  const handlePageJump = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input[type="number"]') as HTMLInputElement;
    const page = parseInt(input?.value || '1', 10);
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 获取当前月份的日历数据
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: number[] = [];
    // 填充空白（用0表示）
    for (let i = 0; i < startDay; i++) {
      days.push(0);
    }
    // 填充日期
    for (let  i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const calendarDays = getCalendarDays(currentMonth);

  const goToWorkOrderDetail = (id: string) => {
    // 获取工单信息
    const workOrder = myInitiatedWorkOrders.find(wo => wo.id === id) ||
                       myPendingWorkOrders.find(wo => wo.id === id) ||
                       myCompletedWorkOrders.find(wo => wo.id === id);
    const title = workOrder ? workOrder.title : '工单详情';
    const orderType = workOrder?.type || 'indicator';
    const businessType = workOrder?.businessType || '管理类/指标调度';
    const status = workOrder?.status || 'pending';

    // 添加tab - 使用固定的id，这样在工单详情页中可以正确激活
    addTab({
      id: '/workspace/ticket-detail',
      title: `工单详情`,
      path: `/workspace/ticket-detail`
    });

    // 设置为激活tab
    setActiveTab('/workspace/ticket-detail');

    // 跳转到详情页，传递工单类型参数和来源路径
    const fromPath = encodeURIComponent('/workspace');
    router.push(`/workspace/ticket-detail?id=${encodeURIComponent(id)}&type=${orderType}&title=${encodeURIComponent(title)}&businessType=${encodeURIComponent(businessType)}&status=${status}&fromPath=${fromPath}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* 第一行：运营日历 + 右侧（常用功能/常用应用+我的工作） */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 运营日历 - 占6列的3/5 = 60% */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">运营日历</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <span className="text-sm text-gray-700">
                  {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="text-center text-xs text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayData = day > 0 ? calendarData[day] : null;
                const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-[80px] border rounded-md p-2 flex flex-col justify-between cursor-pointer transition-colors ${
                      day === 0
                        ? 'bg-gray-50'
                        : isToday
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    {day > 0 && (
                      <>
                        <div className={`text-sm ${isToday ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        {dayData && (
                          <div className="text-xs text-gray-500">
                            {dayData.count === 1 && dayData.title ? (
                              <div className="truncate" title={dayData.title}>
                                {dayData.title}
                              </div>
                            ) : (
                              <div className="text-center bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                {dayData.count}单
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右侧 - 占6列的2/5 = 40% */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* 常用功能/常用应用 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">常用功能</h2>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setRightTab('common-functions')}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      rightTab === 'common-functions' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    功能
                  </button>
                  <button
                    onClick={() => setRightTab('common-apps')}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      rightTab === 'common-apps' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    应用
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {rightTab === 'common-functions'
                  ? commonFunctions.map((item, index) => (
                      <button
                        key={index}
                        className="flex flex-col items-center gap-1.5 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className={`p-1.5 rounded-lg ${item.color} text-white`}>
                          {item.icon && <item.icon className="w-4 h-4" />}
                        </div>
                        <span className="text-[10px] text-gray-700 text-center leading-tight">{item.name}</span>
                      </button>
                    ))
                  : commonApps.map((item, index) => (
                      <button
                        key={index}
                        className="flex flex-col items-center gap-1.5 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-white`}>
                          {item.icon && <item.icon className="w-4 h-4" />}
                        </div>
                        <span className="text-[10px] text-gray-700 text-center leading-tight">{item.name}</span>
                      </button>
                    ))}
              </div>
            </div>

            {/* 我的工作 */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex-1 flex flex-col">
              {/* 标题 + 右上角操作（超时/催办/更多 与"我的工作"同一行） */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">我的工作</h2>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-red-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">超时</span>
                  </button>
                  <button className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-red-500 relative">
                    <Bell className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">催办</span>
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] rounded-full w-3 h-3 flex items-center justify-center">
                      2
                    </span>
                  </button>
                  <button className="flex items-center gap-0.5 text-[11px] text-gray-600 hover:text-gray-900">
                    <span className="hidden sm:inline">更多</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tab切换（待办/已办/消息 独占一行，不再与操作按钮同行） */}
              <div className="flex items-center mb-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleWorkTabChange('initiated')}
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-t transition-colors ${
                      activeWorkTab === 'initiated' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>我发起的</span>
                    <span className="text-[10px] opacity-80">{myInitiatedWorkOrders.length}</span>
                  </button>
                  <button
                    onClick={() => handleWorkTabChange('pending')}
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-t transition-colors ${
                      activeWorkTab === 'pending' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>待办</span>
                    <span className="text-[10px] opacity-80">{myPendingWorkOrders.length}</span>
                  </button>
                  <button
                    onClick={() => handleWorkTabChange('completed')}
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-t transition-colors ${
                      activeWorkTab === 'completed' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>已办</span>
                    <span className="text-[10px] opacity-80">{myCompletedWorkOrders.length}</span>
                  </button>
                  <button
                    onClick={() => handleWorkTabChange('message')}
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-t transition-colors ${
                      activeWorkTab === 'message' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>消息</span>
                    {unreadCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 leading-none py-0.5">{unreadCount}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* 工单列表 / 消息列表 */}
              <div className="flex-1 flex flex-col min-h-0">
                {activeWorkTab === 'message' ? (
                  /* 消息列表 */
                  <div className="flex-1 overflow-y-auto">
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex items-center justify-between px-2 py-2 ${
                          index < messages.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        {/* 消息类型标签 */}
                        <span
                          className={`px-1.5 py-0.5 text-[10px] rounded flex-shrink-0 ${
                            message.type === '待处理商机积压' || message.type === '商机逾期'
                              ? 'bg-red-50 text-red-600'
                              : message.type === '客群转化率过低' || message.type === '预测模型准确率下降' || message.type === '清洗规则剔除率突增'
                              ? 'bg-amber-50 text-amber-600'
                              : message.type === '商机源采集异常'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {message.type}
                        </span>
                        {/* 已读/未读标签 */}
                        <span
                          className={`px-1.5 py-0.5 text-[10px] rounded flex-shrink-0 ml-1 ${
                            message.read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {message.read ? '已读' : '未读'}
                        </span>
                        <span className="flex-1 text-[11px] text-gray-900 ml-2 truncate" title={message.content}>
                          {message.content}
                        </span>
                        <span className="text-[10px] text-gray-500 ml-2 flex-shrink-0">{message.time}</span>
                        <button
                          onClick={() => handleMessageDetail(message.id)}
                          className="text-[11px] text-blue-600 hover:text-blue-700 ml-2 flex-shrink-0"
                        >
                          详情
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-0 overflow-y-auto">
                      {getPaginatedWorkOrders().map((workOrder, index) => (
                        <div
                          key={workOrder.id}
                          className={`flex items-center justify-between px-2 py-2 ${
                            index < getPaginatedWorkOrders().length - 1 ? 'border-b border-gray-100' : ''
                          }`}
                        >
                          {/* 类型标签 */}
                          <span
                            className={`px-1.5 py-0.5 text-[10px] rounded flex-shrink-0 ${
                              workOrder.type === 'indicator' ? 'bg-blue-100 text-blue-700' :
                              workOrder.type === 'strategy' ? 'bg-green-100 text-green-700' :
                              workOrder.type === 'customer-group' ? 'bg-orange-100 text-orange-700' :
                              workOrder.type === 'customer-opportunity-dispatch' ? 'bg-purple-100 text-purple-700' :
                              workOrder.type === 'group-opportunity-dispatch' ? 'bg-cyan-100 text-cyan-700' :
                              workOrder.type === 'region-assault' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {workOrder.type === 'indicator' ? '指标调度' :
                             workOrder.type === 'strategy' ? '策略调度' :
                             workOrder.type === 'customer-group' ? '客群调度' :
                             workOrder.type === 'customer-opportunity-dispatch' ? '客户商机调度' :
                             workOrder.type === 'group-opportunity-dispatch' ? '客群商机调度' :
                             workOrder.type === 'region-assault' ? '区域攻坚调度' :
                             workOrder.type}
                          </span>
                          {/* 状态标签 */}
                          <span
                            className={`px-1.5 py-0.5 text-[10px] text-white rounded flex-shrink-0 ml-1 ${
                              workOrder.status === 'timeout' ? 'bg-red-500' :
                              workOrder.status === 'pending' ? 'bg-blue-500' :
                              'bg-green-500'
                            }`}
                          >
                            {workOrder.statusText === '已超时' ? '超时' : workOrder.statusText === '进行中' ? '正常' : '已完成'}
                          </span>
                          <span className="flex-1 text-[11px] text-gray-900 ml-2 truncate">{workOrder.title}</span>
                          {(workOrder.type === 'customer-opportunity-dispatch' || workOrder.type === 'group-opportunity-dispatch' || workOrder.type === 'region-assault') && workOrder.area && (
                            <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0 max-w-[120px] truncate">{workOrder.area}</span>
                          )}
                          <span className="text-[10px] text-gray-500 ml-2 flex-shrink-0">{workOrder.createTime.split(' ')[0]}</span>
                          <button
                            onClick={() => goToWorkOrderDetail(workOrder.id)}
                            className="text-[11px] text-blue-600 hover:text-blue-700 ml-2 flex-shrink-0"
                          >
                            详情
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 分页 */}
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-100">
                      <span className="text-[10px] text-gray-500">
                        共{getTotalRecords()}条记录，第{currentPage}/{getTotalPages()}页
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`px-2 py-0.5 text-[11px] rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          上一页
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                          disabled={currentPage === getTotalPages()}
                          className={`px-2 py-0.5 text-[11px] rounded ${currentPage === getTotalPages() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          下一页
                        </button>
                        <form onSubmit={handlePageJump} className="flex items-center gap-1 ml-2">
                          <span className="text-[10px] text-gray-500">跳转</span>
                          <input
                            type="number"
                            min="1"
                            max={getTotalPages()}
                            defaultValue={currentPage}
                            className="w-10 px-1 py-0.5 text-[11px] border border-gray-300 rounded text-center focus:outline-none focus:border-blue-500"
                          />
                          <button type="submit" className="px-2 py-0.5 text-[11px] text-gray-600 hover:bg-gray-100 rounded">
                            跳转
                          </button>
                        </form>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 第二行：左侧（重要指标+预警列表） + 右侧（工单分析+策略评估） */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左侧 - 占60% */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* 重要指标 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">重要指标</h2>
                <button className="text-xs text-blue-600 hover:text-blue-700">更多</button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {metricsData.map((metric) => (
                  <div key={metric.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <div className={`w-8 h-8 rounded-full ${metric.iconColor} flex items-center justify-center flex-shrink-0`}>
                          <div className="w-3 h-3 bg-white rounded" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] text-gray-600 mb-1 leading-tight">{metric.name}</h3>
                          <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-[16px] font-semibold text-gray-900">{metric.value}</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-[12px]">
                            {metric.isPositive ? (
                              <ArrowUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-red-500" />
                            )}
                            <span className={metric.isPositive ? 'text-green-500' : 'text-red-500'}>
                              {metric.changeText}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 预警列表 */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">预警列表</h2>
                <button className="text-xs text-blue-600 hover:text-blue-700">更多</button>
              </div>

              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-[14px] text-gray-500 text-left py-2 font-medium">预警指标</th>
                      <th className="text-[14px] text-gray-500 text-left py-2 font-medium">预警等级</th>
                      <th className="text-[14px] text-gray-500 text-left py-2 font-medium">预警内容</th>
                      <th className="text-[14px] text-gray-500 text-left py-2 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-2 text-[14px] text-gray-900">{alert.indicator}</td>
                        <td className="py-2">
                          <span className="px-2 py-0.5 text-[14px] bg-orange-100 text-orange-600 rounded">
                            {alert.level}
                          </span>
                        </td>
                        <td className="py-2 text-[14px] text-gray-900 truncate max-w-xs">{alert.content}</td>
                        <td className="py-2">
                          <button className="text-[14px] text-blue-600 hover:text-blue-700">去调度</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 右侧 - 占40% */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* 工单分析 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-4">
                  {workOrderAnalysisTabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setWorkOrderAnalysisTab(tab)}
                      className={`text-sm pb-1 border-b-2 transition-colors ${
                        workOrderAnalysisTab === tab
                          ? 'border-blue-600 text-blue-600 font-medium'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  更多
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {workOrderAnalysisData[workOrderAnalysisTab === '全部' ? 'all' : workOrderAnalysisTab === '生产类' ? 'production' : 'management'].map((item, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 rounded-lg p-2 hover:shadow-md transition-shadow"
                  >
                    <div className="text-[10px] text-gray-600 mb-1 truncate">{item.name}</div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-base font-bold text-gray-900">{item.value}</span>
                      <span className="text-[10px] text-gray-500">{item.unit}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {item.yoy < 0 ? (
                        <>
                          <ArrowDown className="w-2.5 h-2.5 text-red-500" />
                          <span className="text-[10px] text-red-500">{item.yoy}%</span>
                        </>
                      ) : item.yoy > 0 ? (
                        <>
                          <ArrowUp className="w-2.5 h-2.5 text-green-500" />
                          <span className="text-[10px] text-green-500">+{item.yoy}%</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] text-green-500">+{item.yoy}%</span>
                        </>
                      )}
                      <span className="text-[10px] text-gray-400">环比</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 策略评估 */}
            <div className="bg-white rounded-lg shadow-sm p-3 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-gray-900">策略评估</h2>
                <button className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  更多
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-2.5 flex-1 min-h-0">
                {/* 左侧大卡片 */}
                {strategyEvaluation.filter(item => item.isLeftCard).map((item) => (
                  <div key={item.label} className="w-1/3 bg-blue-50 rounded-lg p-3 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <LayoutDashboard className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-[13px] text-gray-700">{item.label}</h3>
                      </div>
                    </div>
                    <div className="mb-1.5">
                      <span className="text-[16px] font-semibold text-gray-900">{item.value}</span>
                      <span className="text-[13px] text-gray-700 ml-1">{item.unit}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <ArrowUp className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="text-[13px] text-green-500">{item.yoy}</span>
                    </div>
                  </div>
                ))}

                {/* 右侧网格 */}
                <div className="w-2/3 grid grid-cols-3 gap-2">
                  {strategyEvaluation.filter(item => !item.isLeftCard).map((item, index) => (
                    <div key={item.label} className="bg-blue-50 rounded-lg p-2">
                      <h3 className="text-[11px] text-gray-700 mb-1.5 leading-tight">{item.label}</h3>
                      <div className="mb-1">
                        <span className="text-[14px] font-semibold text-gray-900">{item.value}</span>
                        <span className="text-[11px] text-gray-700 ml-0.5">{item.unit}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <ArrowUp className="w-2.5 h-2.5 text-green-500 flex-shrink-0" />
                        <span className="text-[11px] text-green-500">{item.yoy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
