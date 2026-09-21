'use client';

import { useState } from 'react';
import { useMounted } from '@/hooks/useMounted';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TrendingUp, TrendingDown, Send, Eye, XCircle, ChevronRight, ChevronLeft, Trash2, Database, ClipboardList, Target, Filter, MapPin, CheckCircle, Clock, ArrowUpDown, Upload, Plus, Building2, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';
import type { CategoryDataItem } from './BusinessOpportunityTab';

// 三级分类颜色
const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

// 评级配置
const RATING_LEVELS: Record<string, { label: string; color: string }> = {
  '高': { label: '高', color: 'bg-red-100 text-red-700' },
  '中': { label: '中', color: 'bg-yellow-100 text-yellow-700' },
  '低': { label: '低', color: 'bg-green-100 text-green-700' },
};

// 客户商机状态配置
const CUSTOMER_STATUS: Record<string, { label: string; color: string }> = {
  '待派单': { label: '待派单', color: 'bg-blue-100 text-blue-700' },
  '待抢单': { label: '待抢单', color: 'bg-purple-100 text-purple-700' },
  '执行中': { label: '执行中', color: 'bg-orange-100 text-orange-700' },
  '已完结': { label: '已完结', color: 'bg-green-100 text-green-700' },
};

// 客群商机状态配置
const GROUP_STATUS: Record<string, { label: string; color: string }> = {
  '待调度': { label: '待调度', color: 'bg-blue-100 text-blue-700' },
  '调度中': { label: '调度中', color: 'bg-orange-100 text-orange-700' },
  '已完成': { label: '已完成', color: 'bg-green-100 text-green-700' },
  '已废弃': { label: '已废弃', color: 'bg-gray-100 text-gray-700' },
};

// 默认商机分类数据（流量运营）
const DEFAULT_CATEGORY_DATA: CategoryDataItem[] = [
  { name: '流量达量预警', parent: '风险预警类', count: 4520, executionRate: 78.5, conversionRate: 44.2 },
  { name: '特定内容高频访问', parent: '价值提升类', count: 3180, executionRate: 75.2, conversionRate: 41.8 },
  { name: '地板价套餐查询', parent: '价值提升类', count: 2000, executionRate: 72.6, conversionRate: 39.5 },
  { name: '零流量使用预警', parent: '生命周期类', count: 2758, executionRate: 70.1, conversionRate: 36.3 },
];

interface GridManagerTabProps {
  categoryData?: CategoryDataItem[];
}

export default function GridManagerTab({ categoryData }: GridManagerTabProps) {
  // 使用传入的分类数据或默认值
  const categories = categoryData && categoryData.length > 0 ? categoryData : DEFAULT_CATEGORY_DATA;
  const categoryNames = categories.map(c => c.name);

  // Tab和筛选状态
  const [customerStatusFilter, setCustomerStatusFilter] = useState<string>('');

  // 弹窗状态
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [customerDetailDialogOpen, setCustomerDetailDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [abandonDialogOpen, setAbandonDialogOpen] = useState(false);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [groupDetailDialogOpen, setGroupDetailDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // 派单表单
  const [dispatchForm, setDispatchForm] = useState({
    businessScenario: '',
    orderType: '',
    orderTitle: '',
    orderDesc: '',
    dueDate: '',
    product: '',
    system: 'wanggetong',
    executionRole: '',
    approver: '',
  });

  // 调度表单
  const [scheduleStep, setScheduleStep] = useState(1);
  const [scheduleForm, setScheduleForm] = useState({
    selectedTags: [] as string[],
    selectedRegions: [] as string[],
    orderType: '',
    orderTitle: '',
    orderDesc: '',
    dueDate: '',
    product: '',
    system: 'wanggetong',
    executionRole: '',
    approver: '',
    businessScenario: '',
  });

  // 废弃原因
  const [abandonReason, setAbandonReason] = useState('');

  // 调级相关状态
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<any>(null);
  const [adjustForm, setAdjustForm] = useState({
    newRating: '',
    reason: '',
    approver: '',
    approverName: '',
    attachment: '',
  });
  const [approverDialogOpen, setApproverDialogOpen] = useState(false);
  const [tempApprover, setTempApprover] = useState('');
  const [approverSearch, setApproverSearch] = useState('');

  const approverList = [
    { id: '1', name: '李主管', dept: '新疆市场部' },
    { id: '2', name: '赵部长', dept: '新疆运维部' },
    { id: '3', name: '王经理', dept: '乌鲁木齐分公司' },
    { id: '4', name: '孙主管', dept: '昌吉分公司' },
    { id: '5', name: '陈组长', dept: '伊犁分公司' },
  ];

  const handleOpenRatingAdjust = (opp: any) => {
    setAdjustTarget(opp);
    setAdjustForm({
      newRating: '',
      reason: '',
      approver: '',
      approverName: '',
      attachment: '',
    });
    setAdjustDialogOpen(true);
  };

  const handleSubmitAdjust = () => {
    if (!adjustForm.newRating || !adjustForm.reason || !adjustForm.approver) {
      return;
    }
    setAdjustDialogOpen(false);
  };

  // 客户商机状态选项
  const customerStatusOptions = ['待派单', '待抢单', '执行中', '已完结'];
  // 客群商机状态选项
  const groupStatusOptions = ['待调度', '调度中', '已完成', '已废弃'];

  // 评级样式
  const ratingStyle: Record<string, string> = {
    '高': 'bg-red-50 text-red-600 border-red-200',
    '中': 'bg-amber-50 text-amber-600 border-amber-200',
    '低': 'bg-slate-50 text-slate-600 border-slate-200',
  };

  // 分配状态 - 4种状态
  const allocationStatus = [
    { name: '待调度', value: 48, color: '#94a3b8' },
    { name: '调度中', value: 254, color: '#3b82f6' },
    { name: '已完成', value: 35, color: '#10b981' },
    { name: '已废弃', value: 5, color: '#9ca3af' },
  ];

  // 执行趋势
  const trendData = [
    { day: '6/25', dispatched: 12, completed: 8, newAdded: 15 },
    { day: '6/26', dispatched: 18, completed: 12, newAdded: 20 },
    { day: '6/27', dispatched: 15, completed: 14, newAdded: 12 },
    { day: '6/28', dispatched: 22, completed: 10, newAdded: 18 },
    { day: '6/29', dispatched: 16, completed: 16, newAdded: 14 },
    { day: '6/30', dispatched: 20, completed: 18, newAdded: 22 },
    { day: '7/01', dispatched: 25, completed: 20, newAdded: 16 },
  ];

  // 客户商机列表
  const customerOpportunities = [
    { id: 'KH202406010001', businessType: '商机业务名称02', category: '风险预警类 > 流量预警 > 流量达量预警', source: '微信小程序', businessScenario: '流量运营', rating: '高', executionCustomer: '991*********1234', region: '乌鲁木齐天山区', collectTime: '2024-06-01 10:30', validUntil: '2024-06-15', validHours: 48, status: '待派单', recommendedProduct: '5G流量包', recommendedReason: '客户流量使用量高，适合推荐流量包', executionRecords: [{ action: '派单', time: '2024-06-01 11:00', operator: '系统', result: '已派发至抢单池' }] },
    { id: 'KH202406010002', businessType: '商机业务名称02', category: '价值提升类 > 特定内容 > 特定内容高频访问', source: 'APP埋点', businessScenario: '流量运营', rating: '中', executionCustomer: '991*********5678', region: '克拉玛依天山区', collectTime: '2024-06-01 09:15', validUntil: '2024-06-14', validHours: 48, status: '待抢单', recommendedProduct: '流量叠加包', recommendedReason: '高频访问内容，推荐流量包', executionRecords: [{ action: '派单', time: '2024-06-01 10:00', operator: '系统', result: '已派发至抢单池' }] },
    { id: 'KH202406010003', businessType: '测试商机业务-工单', category: '价值提升类 > 套餐查询 > 地板价套餐查询', source: '营业厅', businessScenario: '中高端保有', rating: '高', executionCustomer: '991*********9012', region: '吐鲁番天山区', collectTime: '2024-06-01 08:45', validUntil: '2024-06-13', validHours: 48, status: '执行中', recommendedProduct: '5G套餐升级', recommendedReason: '地板价套餐查询，推荐升级', executionRecords: [{ action: '派单', time: '2024-06-01 09:00', operator: '系统', result: '已派发' }, { action: '抢单', time: '2024-06-01 09:30', operator: '网格长A', result: '已抢单' }] },
    { id: 'KH202405310004', businessType: '商机策略009', category: '生命周期类 > 零流量 > 零流量使用预警', source: '外呼系统', businessScenario: '离网维系', rating: '低', executionCustomer: '991*********3456', region: '哈密新市区', collectTime: '2024-05-31 16:20', validUntil: '2024-06-10', validHours: 48, status: '已完结', recommendedProduct: '激活礼包', recommendedReason: '零流量用户，推荐激活', executionRecords: [{ action: '派单', time: '2024-05-31 17:00', operator: '系统', result: '已派发' }, { action: '抢单', time: '2024-05-31 17:30', operator: '网格长B', result: '已抢单' }, { action: '办结', time: '2024-06-01 10:00', operator: '网格长B', result: '成功激活' }] },
  ];

  // 筛选后的客户商机列表
  const filteredCustomerList = customerStatusFilter
    ? customerOpportunities.filter(opp => opp.status === customerStatusFilter)
    : customerOpportunities;

  return (
    <div className="space-y-6">
      {/* 核心指标卡片 */}
      <Card className="p-3">
        <div className="flex items-center">
          <span className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0">整体情况</span>
          <div className="flex-1 flex items-center divide-x divide-border">
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机总量</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">342</span>
                <span className="text-xs text-muted-foreground">条</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机执行率</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">85.4</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机转化率</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">42.1</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">逾期商机量</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">12</span>
                <span className="text-xs text-muted-foreground">条</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 本月商机情况 */}
      <Card className="p-3">
        <div className="flex items-center">
          <span className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0">本月情况</span>
          <div className="flex-1 flex items-center divide-x divide-border">
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月商机量</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">86</span>
                  <span className="text-xs text-muted-foreground">条</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+5.8%</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月执行率</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">88.2</span>
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+2.3pp</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月转化率</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">44.5</span>
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+1.2pp</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月逾期量</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">3</span>
                  <span className="text-xs text-muted-foreground">条</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>-1.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 第二行：分配状态 + 执行趋势 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">分配状态</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={allocationStatus}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
              >
                {allocationStatus.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={allocationStatus[index].color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {allocationStatus.map((item) => {
              const total = allocationStatus.reduce((s, d) => s + d.value, 0);
              return (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium">{item.value}</span>
                  <span className="text-muted-foreground">({((item.value / total) * 100).toFixed(1)}%)</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="col-span-2 p-5">
          <h3 className="text-sm font-medium mb-4">近7日执行趋势</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="dispatched" name="调度量" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="completed" name="完成量" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="newAdded" name="新增" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 商机管理列表区域 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">商机管理列表</h3>
          <Link href="/workspace/business-opportunity/customer" className="text-xs text-primary hover:underline">
            查看更多 →
          </Link>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">状态筛选：</span>
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant={customerStatusFilter === '' ? 'default' : 'outline'}
                  className="h-6 text-xs px-2"
                  onClick={() => setCustomerStatusFilter('')}
                >
                  全部
                </Button>
                {customerStatusOptions.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={customerStatusFilter === s ? 'default' : 'outline'}
                    className="h-6 text-xs px-2"
                    onClick={() => setCustomerStatusFilter(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商机ID</TableHead>
                  <TableHead>商机业务类型</TableHead>
                  <TableHead>商机分类</TableHead>
                  <TableHead>商机源</TableHead>
                  <TableHead>运营场景</TableHead>
                  <TableHead>评级</TableHead>
                  <TableHead>客户信息</TableHead>
                  <TableHead>区域信息</TableHead>
                  <TableHead>采集时间</TableHead>
                  <TableHead>有效期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomerList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filteredCustomerList.map((opp) => (
                    <TableRow key={opp.id}>
                      <TableCell className="font-mono text-xs">{opp.id}</TableCell>
                      <TableCell className="text-sm">{opp.businessType}</TableCell>
                      <TableCell className="text-sm">{opp.category}</TableCell>
                      <TableCell className="text-sm">{opp.source}</TableCell>
                      <TableCell className="text-sm text-primary">{opp.businessScenario}</TableCell>
                      <TableCell>
                        <Badge className={ratingStyle[opp.rating]} variant="secondary">{opp.rating}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm font-mono">{opp.executionCustomer}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{opp.region}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{opp.collectTime}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{opp.validUntil}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          opp.status === '待派单' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                          opp.status === '待抢单' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          opp.status === '执行中' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }>{opp.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {opp.status === '待派单' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 text-xs text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                setSelectedOpportunity(opp);
                                setDispatchForm({
                                  ...dispatchForm,
                                  businessScenario: opp.businessScenario || ''
                                });
                                setDispatchDialogOpen(true);
                              }}
                            >
                              <Send className="h-3 w-3 mr-1" />派单
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-xs text-gray-500 hover:text-foreground"
                            onClick={() => {
                              setSelectedOpportunity(opp);
                              setCustomerDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />详情
                          </Button>
                          {(opp.status === '待派单' || opp.status === '待抢单') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-orange-600 hover:text-orange-800"
                              onClick={() => handleOpenRatingAdjust(opp)}
                            >
                              <ArrowUpDown className="h-3 w-3 mr-1" />调级
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </div>
      </Card>


      {/* 客户商机派单弹窗 */}
      <Dialog open={dispatchDialogOpen} onOpenChange={setDispatchDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>派单确认</DialogTitle>
            <DialogDescription>确认将此商机通过网格通系统派发</DialogDescription>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="space-y-4">
              {/* 商机基本信息 */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  商机基本信息
                </h4>
                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">商机ID</div>
                    <div className="font-medium text-blue-600">{selectedOpportunity.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">商机评级</div>
                    <Badge variant="outline" className={`${RATING_LEVELS[selectedOpportunity.rating].color} font-medium`}>
                      {RATING_LEVELS[selectedOpportunity.rating].label}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1">商机分类</div>
                    <div className="text-sm">{selectedOpportunity.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">执行客户</div>
                    <div className="text-sm font-medium font-mono">{selectedOpportunity.executionCustomer}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1">区域信息</div>
                    <div className="text-sm">{selectedOpportunity.region}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">采集时间</div>
                    <div className="text-sm">{selectedOpportunity.collectTime}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">有效期</div>
                    <div className="text-sm">{selectedOpportunity.validHours || 48}小时</div>
                  </div>
                </div>
              </div>

              {/* 推荐信息 */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  推荐信息
                </h4>
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">推荐产品</div>
                    <div className="text-sm font-medium text-blue-800">{selectedOpportunity.recommendedProduct || '5G流量包'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">推荐原因</div>
                    <div className="text-sm text-blue-700 leading-relaxed">{selectedOpportunity.recommendedReason || '客户流量使用量高，适合推荐流量包'}</div>
                  </div>
                </div>
              </div>

              {/* 派单配置 */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  派单配置
                </h4>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  {/* 运营场景 - 选择框不可修改，自动回显 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20 shrink-0">运营场景</span>
                    <Select value={selectedOpportunity.businessScenario || ''} disabled>
                      <SelectTrigger className="flex-1 bg-gray-100 cursor-not-allowed">
                        <SelectValue placeholder="运营场景" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="流量运营">流量运营</SelectItem>
                        <SelectItem value="中高端保有">中高端保有</SelectItem>
                        <SelectItem value="离网维系">离网维系</SelectItem>
                        <SelectItem value="家庭运营">家庭运营</SelectItem>
                        <SelectItem value="校园运营">校园运营</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* 工单类型 - 选择框不可修改 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20 shrink-0">工单类型</span>
                    <Select value="商机调度" disabled>
                      <SelectTrigger className="flex-1 bg-gray-100 cursor-not-allowed">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="商机调度">商机调度</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* 工单标题 - 输入框可修改 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20 shrink-0">工单标题</span>
                    <Input 
                      className="flex-1" 
                      value={dispatchForm.orderTitle}
                      onChange={(e) => setDispatchForm({...dispatchForm, orderTitle: e.target.value})}
                      placeholder="请输入工单标题"
                    />
                  </div>
                  {/* 工单描述 - 输入框可修改 */}
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-gray-600 w-20 shrink-0 pt-2">工单描述</span>
                    <Textarea 
                      className="flex-1 min-h-[80px]" 
                      value={dispatchForm.orderDesc}
                      onChange={(e) => setDispatchForm({...dispatchForm, orderDesc: e.target.value})}
                      placeholder="请输入工单描述"
                    />
                  </div>
                  {/* 要求完成时间 - 时间选择框 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20 shrink-0">要求完成时间</span>
                    <Input 
                      type="datetime-local"
                      className="flex-1"
                      value={dispatchForm.dueDate}
                      onChange={(e) => setDispatchForm({...dispatchForm, dueDate: e.target.value})}
                    />
                  </div>
                  {/* 推荐产品 - 输入框可修改 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20 shrink-0">推荐产品</span>
                    <Input 
                      className="flex-1" 
                      value={dispatchForm.product}
                      onChange={(e) => setDispatchForm({...dispatchForm, product: e.target.value})}
                      placeholder="请输入推荐产品"
                    />
                  </div>
                  {/* 派发系统 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20 shrink-0">派发系统</span>
                    <div className="flex-1">
                      <RadioGroup value={dispatchForm.system} onValueChange={(v) => setDispatchForm({...dispatchForm, system: v})} className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="wanggetong" id="dispatch-wanggetong" />
                          <Label htmlFor="dispatch-wanggetong" className="text-sm font-normal cursor-pointer">网格通</Label>
                          <span className="text-xs text-muted-foreground">当前仅支持网格通系统</span>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  {/* 执行角色 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20 shrink-0">执行角色 <span className="text-red-500">*</span></span>
                    <div className="flex-1">
                      <RadioGroup value={dispatchForm.executionRole} onValueChange={(v) => setDispatchForm({...dispatchForm, executionRole: v})} className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="city-ops" id="dispatch-city-ops" />
                          <Label htmlFor="dispatch-city-ops" className="text-sm font-normal cursor-pointer">地市集运</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="grid-manager" id="dispatch-grid-manager" />
                          <Label htmlFor="dispatch-grid-manager" className="text-sm font-normal cursor-pointer">网格经理</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  {/* 审批人 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20 shrink-0">审批人</span>
                    <Select value={dispatchForm.approver} onValueChange={(v) => setDispatchForm({...dispatchForm, approver: v})}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="选择审批人" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approver1">张主任（市场部）</SelectItem>
                        <SelectItem value="approver2">李经理（运营部）</SelectItem>
                        <SelectItem value="approver3">王总监（客服中心）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 提示信息 */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-sm text-amber-700">
                  派单后商机将通过网格通系统执行，审批通过后分配至{dispatchForm.executionRole === 'city-ops' ? '地市集运' : dispatchForm.executionRole === 'grid-manager' ? '网格经理' : '对应角色'}处理。
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispatchDialogOpen(false)}>取消</Button>
            <Button className="bg-[#0085D0] hover:bg-[#0070B8]" onClick={() => { setDispatchDialogOpen(false); toast.success('派单成功'); }}>确认派单</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 客户商机详情弹窗 */}
      <Dialog open={customerDetailDialogOpen} onOpenChange={setCustomerDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              商机详情
            </DialogTitle>
            <DialogDescription>查看商机的详细信息与执行情况</DialogDescription>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="space-y-4">
              <Tabs defaultValue="basic">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="basic">基本信息</TabsTrigger>
                  <TabsTrigger value="execution">执行轨迹</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">商机ID</div>
                      <div className="font-medium text-blue-600">{selectedOpportunity.id}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">商机评级</div>
                      <Badge className={`${RATING_LEVELS[selectedOpportunity.rating].color} font-normal`}>{RATING_LEVELS[selectedOpportunity.rating].label}</Badge>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">商机分类</div>
                      <div className="text-sm">{selectedOpportunity.category}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">商机源</div>
                      <div className="text-sm">{selectedOpportunity.source}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">运营场景</div>
                      <div className="text-sm">{selectedOpportunity.businessScenario}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">执行客户</div>
                      <div className="text-sm font-medium font-mono">{selectedOpportunity.executionCustomer}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">区域信息</div>
                      <div className="text-sm">{selectedOpportunity.region}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">采集时间</div>
                      <div className="text-sm">{selectedOpportunity.collectTime}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">有效期</div>
                      <div className="text-sm">{selectedOpportunity.validHours}小时</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">状态</div>
                      <Badge className={`${CUSTOMER_STATUS[selectedOpportunity.status].color} font-normal`}>{CUSTOMER_STATUS[selectedOpportunity.status].label}</Badge>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="execution" className="space-y-4 pt-4">
                  {selectedOpportunity.conversionResult && (
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">转化结果：</span>
                        {selectedOpportunity.conversionResult === 'SUCCESS' ? (
                          <Badge className="bg-green-100 text-green-600 font-normal">转化成功</Badge>
                        ) : selectedOpportunity.conversionResult === 'FAILED' ? (
                          <Badge className="bg-red-100 text-red-600 font-normal">转化失败</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-600 font-normal">处理中</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedOpportunity.conversionDetail && selectedOpportunity.conversionResult === 'SUCCESS' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-700">转化成功</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">办理产品：</span>
                          <span className="font-medium ml-2">{selectedOpportunity.conversionDetail.product}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">月费金额：</span>
                          <span className="font-medium ml-2 text-green-600">¥{selectedOpportunity.conversionDetail.amount}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedOpportunity.conversionDetail && selectedOpportunity.conversionResult === 'FAILED' && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-700">转化失败</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">失败原因：</span>
                        <span className="ml-2">{selectedOpportunity.conversionDetail.reason}</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      执行轨迹
                    </h4>
                    <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
                      {selectedOpportunity.executionRecords?.map((record: any, index: number) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-white border-2 border-blue-400" />
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{record.action}</span>
                              <span className="text-xs text-gray-400">{record.time}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>操作人：{record.operator}</span>
                              <span>结果：{record.result}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDetailDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 客群商机调度弹窗 */}
      <Dialog open={scheduleDialogOpen} onOpenChange={(open) => { setScheduleDialogOpen(open); if (!open) { setScheduleStep(1); } }}>
        <DialogContent className="!w-[1100px] !max-w-[1100px] max-h-[90vh] !p-0 flex flex-col">
          {/* 隐藏的无障碍标题 */}
          <DialogTitle className="sr-only">
            {scheduleStep === 1 ? '客群圈选' : '调度派发'}
          </DialogTitle>

          {/* 标题栏 */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-[#EAF2FF] shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {scheduleStep === 1 ? '客群商机调度' : '调度派发'}
            </h2>
            <button
              onClick={() => setScheduleDialogOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center gap-8 px-6 py-3 border-b bg-[#F5F7FF] shrink-0">
            {scheduleStep === 1 ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#3B82F6] flex items-center justify-center">
                    <span className="text-white text-sm font-medium">1</span>
                  </div>
                  <span className="text-sm font-medium text-[#3B82F6]">客群圈选</span>
                </div>
                <div className="w-20 h-0.5 bg-[#3B82F6]"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">2</span>
                  </div>
                  <span className="text-sm font-medium text-gray-400">调度派发</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#3B82F6] flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-[#3B82F6]">客群圈选</span>
                </div>
                <div className="w-20 h-0.5 bg-[#3B82F6]"></div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#3B82F6] flex items-center justify-center">
                    <span className="text-white text-sm font-medium">2</span>
                  </div>
                  <span className="text-sm font-medium text-[#3B82F6]">调度派发</span>
                </div>
              </>
            )}
          </div>

          {/* 内容区域 */}
          <div className="p-6 overflow-y-auto flex-1">
            {selectedGroup && (
              scheduleStep === 1 ? (
                /* 第一步：客群圈选 */
                <div className="space-y-6">
                  {/* 商机信息 */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />商机信息
                    </h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">商机ID：</span>
                        <span className="text-blue-800 font-medium">{selectedGroup.id}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">商机分类：</span>
                        <span className="text-blue-800">{selectedGroup.category}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">客群规模：</span>
                        <span className="text-blue-800 font-medium">{selectedGroup.groupSize?.toLocaleString() || 1250}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">推荐策略：</span>
                        <span className="text-blue-800">流量包智能推荐</span>
                      </div>
                    </div>
                  </div>

                  {/* 圈选标签和圈选区域 */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* 左侧：圈选标签 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Filter className="w-4 h-4 text-blue-500" />圈选标签
                        </h4>
                        <span className="text-xs text-gray-400">已选 {scheduleForm.selectedTags?.length || 0} 项</span>
                      </div>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {[
                          { id: 'tag1', name: '客户价值', options: [{ id: 't1-1', label: '高价值', ratio: '35%'}, { id: 't1-2', label: '中价值', ratio: '45%'}, { id: 't1-3', label: '低价值', ratio: '20%'}] },
                          { id: 'tag2', name: '流量使用', options: [{ id: 't2-1', label: '高流量', ratio: '28%'}, { id: 't2-2', label: '中流量', ratio: '52%'}, { id: 't2-3', label: '低流量', ratio: '20%'}] },
                        ].map(group => (
                          <div key={group.id} className="border border-gray-100 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">{group.name}</span>
                              <span className="text-xs text-gray-400">可多选</span>
                            </div>
                            <div className="space-y-1.5">
                              {group.options.map(option => (
                                <button
                                  key={option.id}
                                  onClick={() => {
                                    const currentTags = scheduleForm.selectedTags || [];
                                    const newTags = currentTags.includes(option.id)
                                      ? currentTags.filter(t => t !== option.id)
                                      : [...currentTags, option.id];
                                    setScheduleForm({...scheduleForm, selectedTags: newTags});
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 border rounded-md transition-colors text-sm ${
                                    (scheduleForm.selectedTags || []).includes(option.id)
                                      ? 'border-[#3B82F6] bg-[#E6F0FF] text-[#3B82F6] font-medium'
                                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                                  }`}
                                >
                                  <span>{option.label}</span>
                                  <span className="text-xs text-gray-400">{option.ratio}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 右侧：圈选区域 */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-[#F9FAFB] px-4 py-3 border-b">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />圈选区域
                          </h4>
                          <span className="text-xs text-gray-500">已选 {(scheduleForm.selectedRegions || []).length} 个区域</span>
                        </div>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-[#F9FAFB] sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={(scheduleForm.selectedRegions || []).length === 3}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setScheduleForm({...scheduleForm, selectedRegions: ['r1', 'r2', 'r3']});
                                    } else {
                                      setScheduleForm({...scheduleForm, selectedRegions: []});
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">区域</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">客群规模</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">占比</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { id: 'r1', name: '乌鲁木齐天山区', scale: 456, ratio: '36.5%' },
                              { id: 'r2', name: '克拉玛依天山区', scale: 328, ratio: '26.2%' },
                              { id: 'r3', name: '吐鲁番天山区', scale: 466, ratio: '37.3%' },
                            ].map(region => (
                              <tr key={region.id} className="border-t border-gray-100 hover:bg-[#F9FAFB]">
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={(scheduleForm.selectedRegions || []).includes(region.id)}
                                    onChange={() => {
                                      const currentRegions = scheduleForm.selectedRegions || [];
                                      const newRegions = currentRegions.includes(region.id)
                                        ? currentRegions.filter(r => r !== region.id)
                                        : [...currentRegions, region.id];
                                      setScheduleForm({...scheduleForm, selectedRegions: newRegions});
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{region.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{region.scale}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{region.ratio}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* 第二步：调度派发 */
                <div className="space-y-6">
                  {/* 客群信息 - 一行展示 */}
                  <div className="flex gap-4">
                    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">客群规模：</span>
                      <span className="text-sm font-medium text-[#3B82F6]">{selectedGroup.groupSize?.toLocaleString() || 1250}</span>
                    </div>
                    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">圈选标签：</span>
                      <span className="text-sm text-gray-900">
                        {(scheduleForm.selectedTags || []).length > 0 ? `已选${scheduleForm.selectedTags.length}项` : '未选择'}
                      </span>
                    </div>
                    <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">圈选区域：</span>
                      <span className="text-sm text-gray-900">
                        {(scheduleForm.selectedRegions || []).length > 0 ? `已选${scheduleForm.selectedRegions.length}个区域` : '未选择'}
                      </span>
                    </div>
                  </div>

                  {/* 表单 - 单列垂直排列 */}
                  <div className="space-y-4">
                    {/* 运营场景 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        运营场景
                      </Label>
                      <Input
                        value={selectedGroup.businessScenario || ''}
                        disabled
                        className="mt-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* 工单类型 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        工单类型
                      </Label>
                      <Input
                        value="商机调度"
                        disabled
                        className="mt-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* 工单标题 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        工单标题 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={scheduleForm.orderTitle}
                        onChange={(e) => setScheduleForm({...scheduleForm, orderTitle: e.target.value})}
                        placeholder="请输入"
                        className="mt-2"
                      />
                    </div>

                    {/* 要求完成时间 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        要求完成时间 <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          type="date"
                          value={scheduleForm.dueDate}
                          onChange={(e) => setScheduleForm({...scheduleForm, dueDate: e.target.value})}
                          className="pr-10"
                          placeholder="请选择"
                        />
                      </div>
                    </div>

                    {/* 工单描述 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        工单描述
                      </Label>
                      <Textarea
                        value={scheduleForm.orderDesc}
                        onChange={(e) => setScheduleForm({...scheduleForm, orderDesc: e.target.value})}
                        placeholder="请输入"
                        className="mt-2 min-h-[100px]"
                      />
                    </div>

                    {/* 推荐产品 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        推荐产品
                      </Label>
                      <Input
                        value={scheduleForm.product}
                        onChange={(e) => setScheduleForm({...scheduleForm, product: e.target.value})}
                        placeholder="请输入"
                        className="mt-2"
                      />
                    </div>

                    {/* 派发系统 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        派发系统
                      </Label>
                      <div className="mt-2">
                        <RadioGroup value={scheduleForm.system} onValueChange={(v) => setScheduleForm({...scheduleForm, system: v})} className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="wanggetong" id="schedule-wanggetong" />
                            <Label htmlFor="schedule-wanggetong" className="text-sm font-normal cursor-pointer">网格通</Label>
                            <span className="text-xs text-muted-foreground">当前仅支持网格通系统</span>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    {/* 执行角色 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        执行角色 <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-2">
                        <RadioGroup value={scheduleForm.executionRole} onValueChange={(v) => setScheduleForm({...scheduleForm, executionRole: v})} className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="city-ops" id="schedule-city-ops" />
                            <Label htmlFor="schedule-city-ops" className="text-sm font-normal cursor-pointer">地市集运</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="grid-manager" id="schedule-grid-manager" />
                            <Label htmlFor="schedule-grid-manager" className="text-sm font-normal cursor-pointer">网格经理</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    {/* 审批人 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        审批人 <span className="text-red-500">*</span>
                      </Label>
                      <Select value={scheduleForm.approver} onValueChange={(v) => setScheduleForm({...scheduleForm, approver: v})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="请选择审批人" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approver-1">王总（总部领导）</SelectItem>
                          <SelectItem value="approver-2">李总（市场部）</SelectItem>
                          <SelectItem value="approver-3">张总（运营部）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-white shrink-0">
            <div>
              {scheduleStep === 1 ? (
                <div className="text-sm text-gray-600">
                  已选 <span className="font-medium text-[#3B82F6]">{(scheduleForm.selectedRegions || []).length}</span> 个区域
                </div>
              ) : (
                <Button variant="outline" onClick={() => setScheduleStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" />上一步
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>取消</Button>
              {scheduleStep === 1 ? (
                <Button 
                  className="bg-[#3B82F6] hover:bg-[#2563EB]" 
                  onClick={() => setScheduleStep(2)}
                >
                  下一步<ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  className="bg-[#3B82F6] hover:bg-[#2563EB]" 
                  onClick={() => { setScheduleDialogOpen(false); toast.success('调度成功'); }}
                  disabled={!scheduleForm.orderTitle || !scheduleForm.approver || !scheduleForm.dueDate}
                >
                  <Send className="w-4 h-4 mr-1" />确认调度
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 客群商机废弃弹窗 */}
      <Dialog open={abandonDialogOpen} onOpenChange={setAbandonDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              废弃商机
            </DialogTitle>
            <DialogDescription>确认废弃该客群商机</DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="mb-2"><span className="text-gray-500">商机ID：</span>{selectedGroup.id}</div>
                <div><span className="text-gray-500">客群名称：</span>{selectedGroup.groupName}</div>
              </div>
              <div className="space-y-2">
                <Label>废弃原因</Label>
                <Textarea value={abandonReason} onChange={(e) => setAbandonReason(e.target.value)} placeholder="请输入废弃原因" rows={3} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAbandonDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={() => { setAbandonDialogOpen(false); toast.success('废弃成功', { description: '客群商机已废弃' }); }}>确认废弃</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 客群商机执行情况弹窗 */}
      <Dialog open={executionDialogOpen} onOpenChange={setExecutionDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-500" />调度执行情况
            </DialogTitle>
            <DialogDescription>查看客群商机的调度信息和执行轨迹</DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{selectedGroup.groupName}</div>
                    <div className="text-xs text-gray-500 mt-1">{selectedGroup.id} · {selectedGroup.region}</div>
                  </div>
                  <Badge className={GROUP_STATUS[selectedGroup.status]?.color}>
                    {GROUP_STATUS[selectedGroup.status]?.label}
                  </Badge>
                </div>
              </div>

              {/* 调度信息 */}
              {selectedGroup.dispatchInfo && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    调度信息
                  </h4>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50 rounded-lg text-sm">
                    <div>
                      <span className="text-gray-500">派发对象：</span>
                      <span className="font-medium text-blue-700">{selectedGroup.dispatchInfo.targetName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">处理时效：</span>
                      <span className="font-medium">{selectedGroup.dispatchInfo.deadline}天</span>
                    </div>
                    <div>
                      <span className="text-gray-500">派发时间：</span>
                      <span className="font-medium">{selectedGroup.dispatchInfo.dispatchTime}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">调度备注：</span>
                      <span className="text-gray-700">{selectedGroup.dispatchInfo.remark || '-'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 转化结果 - 已完成时显示 */}
              {selectedGroup.status === 'completed' && selectedGroup.conversionResult && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    转化结果
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-green-600">{selectedGroup.conversionResult.successCount}</div>
                      <div className="text-xs text-gray-500">成功转化</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-red-500">{selectedGroup.conversionResult.failCount}</div>
                      <div className="text-xs text-gray-500">转化失败</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-amber-600">{selectedGroup.conversionResult.pendingCount}</div>
                      <div className="text-xs text-gray-500">待转化</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-600">¥{selectedGroup.conversionResult.totalAmount?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">月费收入</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 执行轨迹 */}
              {selectedGroup.executionRecords && selectedGroup.executionRecords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    执行轨迹
                  </h4>
                  <div className="relative pl-6 border-l-2 border-gray-200 space-y-3">
                    {selectedGroup.executionRecords.map((record: any, index: number) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-white border-2 border-blue-400" />
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{record.action}</span>
                            <span className="text-xs text-gray-400">{record.time}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>操作人：{record.operator}</span>
                            <span>结果：{record.result}</span>
                          </div>
                          {record.detail && (
                            <div className="mt-1 text-xs text-blue-600">{record.detail}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setExecutionDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 客群商机详情弹窗 */}
      <Dialog open={groupDetailDialogOpen} onOpenChange={setGroupDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              商机详情
            </DialogTitle>
            <DialogDescription>查看客群商机的详细信息</DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">商机ID</div>
                <div className="font-medium text-blue-600">{selectedGroup.id}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">商机评级</div>
                <Badge className={`${RATING_LEVELS[selectedGroup.rating].color} font-normal`}>{RATING_LEVELS[selectedGroup.rating].label}</Badge>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">商机分类</div>
                <div className="text-sm">{selectedGroup.category}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">运营场景</div>
                <div className="text-sm">{selectedGroup.businessScenario}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">客群名称</div>
                <div className="text-sm font-medium">{selectedGroup.groupName}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">客群规模</div>
                <div className="text-sm">{selectedGroup.groupSize}人</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                <div className="text-xs text-gray-500 mb-1">状态</div>
                <Badge className={`${GROUP_STATUS[selectedGroup.status].color} font-normal`}>{GROUP_STATUS[selectedGroup.status].label}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDetailDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 调级申请弹窗 */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              <DialogTitle>商机调级申请</DialogTitle>
            </div>
            <DialogDescription>填写调级信息，提交后进入审批流程</DialogDescription>
          </DialogHeader>
          {adjustTarget && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
                <div>
                  <span className="text-muted-foreground">商机编码：</span>
                  <span className="font-medium">{adjustTarget.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">商机名称：</span>
                  <span className="font-medium">{adjustTarget.businessType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">当前评级：</span>
                  <Badge className={`font-normal ${adjustTarget.rating === '高' ? 'bg-red-100 text-red-700' : adjustTarget.rating === '中' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>{adjustTarget.rating}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">当前状态：</span>
                  <Badge variant="secondary" className="font-normal">{adjustTarget.status}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm"><span className="text-red-500">*</span> 新评级</Label>
                <Select value={adjustForm.newRating} onValueChange={(v) => setAdjustForm({ ...adjustForm, newRating: v })}>
                  <SelectTrigger><SelectValue placeholder="请选择新评级" /></SelectTrigger>
                  <SelectContent className="z-[10000]">
                    <SelectItem value="高">高</SelectItem>
                    <SelectItem value="中">中</SelectItem>
                    <SelectItem value="低">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm"><span className="text-red-500">*</span> 调级原因</Label>
                <Textarea
                  placeholder="请输入调级原因(200字以内)"
                  maxLength={200}
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="resize-none"
                  rows={3}
                />
                <div className="text-right text-xs text-muted-foreground">{adjustForm.reason.length}/200</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm"><span className="text-red-500">*</span> 附件上传</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">点击上传附件</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">支持PDF、图片等格式</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm"><span className="text-red-500">*</span> 审批人</Label>
                <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => setApproverDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  {adjustForm.approverName || '选择审批人'}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmitAdjust} disabled={!adjustForm.newRating || !adjustForm.reason || !adjustForm.approver}>提交调级申请</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 审批人选择弹窗 */}
      <Dialog open={approverDialogOpen} onOpenChange={setApproverDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>选择审批人</DialogTitle>
          </DialogHeader>
          <div className="flex gap-3 h-[360px]">
            <div className="w-[200px] flex flex-col border rounded-lg">
              <div className="p-2 border-b text-sm font-medium flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> 组织架构
              </div>
              <div className="flex-1 overflow-auto p-2 text-sm text-muted-foreground">
                <div className="p-2 bg-muted/50 rounded cursor-pointer">中国移动通信集团新疆有限公司</div>
              </div>
            </div>
            <div className="flex-1 flex flex-col border rounded-lg">
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="输入人员名称" className="pl-8" value={approverSearch} onChange={(e) => setApproverSearch(e.target.value)} />
                </div>
              </div>
              <div className="flex-1 overflow-auto p-1">
                {approverList
                  .filter(a => !approverSearch || a.name.includes(approverSearch) || a.dept.includes(approverSearch))
                  .map(a => (
                    <div
                      key={a.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${tempApprover === a.id ? 'bg-muted/50' : ''}`}
                      onClick={() => setTempApprover(a.id)}
                    >
                      <div className={`h-4 w-4 rounded-full border-2 ${tempApprover === a.id ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`} />
                      <span className="text-sm">{a.name}</span>
                      <span className="text-xs text-muted-foreground">（{a.dept}）</span>
                    </div>
                  ))}
                {approverList.filter(a => !approverSearch || a.name.includes(approverSearch) || a.dept.includes(approverSearch)).length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">未找到匹配的人员</div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproverDialogOpen(false)}>取消</Button>
            <Button onClick={() => {
              const selected = approverList.find(a => a.id === tempApprover);
              if (selected) {
                setAdjustForm({ ...adjustForm, approver: selected.id, approverName: `${selected.name}（${selected.dept}）` });
              }
              setApproverDialogOpen(false);
            }}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
