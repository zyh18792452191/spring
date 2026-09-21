'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Eye, Bell, Send, MapPin, BarChart3, LayoutGrid, List } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import OpportunityFilterPanel from '@/app/workspace/business-opportunity/components/OpportunityFilterPanel';
import OpportunityKanbanCard from '@/app/workspace/business-opportunity/components/OpportunityKanbanCard';

// 三级分类颜色
const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

export default function OperatorTab() {
  const [listTab, setListTab] = useState<'single' | 'group'>('single');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [warningCategoryFilter, setWarningCategoryFilter] = useState<string>('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [batchDispatchDialogOpen, setBatchDispatchDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [customerFilters, setCustomerFilters] = useState<Record<string, string>>({});
  const [groupFilters, setGroupFilters] = useState<Record<string, string>>({});

  // 单客户商机状态分布
  const singleStatusDistribution = [
    { name: '待派发', value: 256, color: '#f59e0b' },
    { name: '待抢单', value: 128, color: '#fb923c' },
    { name: '处理中', value: 312, color: '#3b82f6' },
    { name: '已转化', value: 286, color: '#10b981' },
    { name: '已失败', value: 56, color: '#ef4444' },
    { name: '已逾期', value: 148, color: '#6b7280' },
    { name: '已回收', value: 89, color: '#8b5cf6' },
  ];

  // 商机状态分布
  const groupStatusDistribution = [
    { name: '待派单', value: 42, color: '#f59e0b' },
    { name: '已派单', value: 86, color: '#3b82f6' },
    { name: '已完成', value: 137, color: '#10b981' },
    { name: '已失效', value: 35, color: '#6b7280' },
    { name: '已废弃', value: 18, color: '#9ca3af' },
  ];

  // 商机分类占比（与领导人视角一致）
  const categoryData = [
    { name: '流量达量预警', parent: '风险预警类', count: 4520, executionRate: 78.5, conversionRate: 44.2 },
    { name: '特定内容高频访问', parent: '价值提升类', count: 3180, executionRate: 75.2, conversionRate: 41.8 },
    { name: '地板价套餐查询', parent: '价值提升类', count: 2000, executionRate: 72.6, conversionRate: 39.5 },
    { name: '零流量使用预警', parent: '生命周期类', count: 2758, executionRate: 70.1, conversionRate: 36.3 },
  ];

  // 单客户商机列表
  const singleOpportunities = [
    { id: 'SJ202406010001', businessType: '商机业务名称02', category: '流量达量预警', source: 'CRM系统', rating: '高', status: '待派发', executionCustomer: '991*********1001', region: '乌鲁木齐天山区南塔网格', hours: 2.5, recommendedProducts: [{ id: 'rp1', name: '5G畅享199套餐', category: '套餐产品', price: 199, description: '5G畅享套餐' }], validHours: 6, validityStatus: '即将过期', collectTime: '2024-06-01 10:30', validUntil: '2024-06-07' },
    { id: 'SJ202406010002', businessType: '商机策略009', category: '特定内容高频访问', source: '营销活动平台', rating: '中', status: '待派发', executionCustomer: '991*********1002', region: '克拉玛依沙依巴克区红庙子网格', hours: 4.0, recommendedProducts: [{ id: 'rp2', name: '流量叠加包', category: '流量产品', price: 10, description: '流量叠加包' }], validHours: 48, validityStatus: '正常', collectTime: '2024-06-01 09:15', validUntil: '2024-06-29' },
    { id: 'SJ202406010003', businessType: '测试商机业务-工单', category: '地板价套餐查询', source: '外呼系统', rating: '高', status: '处理中', executionCustomer: '991*********1003', region: '吐鲁番天山区南塔网格', hours: 1.5, recommendedProducts: [{ id: 'rp3', name: '5G套餐升级', category: '套餐产品', price: 159, description: '5G套餐升级' }], validHours: 72, validityStatus: '正常', collectTime: '2024-06-01 08:45', validUntil: '2024-07-03' },
    { id: 'SJ202406010004', businessType: '商机策略010', category: '零流量使用预警', source: '线上渠道', rating: '低', status: '待派发', executionCustomer: '991*********1004', region: '乌鲁木齐沙依巴克区友好路网格', hours: 6.0, recommendedProducts: [{ id: 'rp5', name: '激活礼包', category: '增值产品', price: 0, description: '激活礼包' }], validHours: 0, validityStatus: '已过期', collectTime: '2024-05-31 16:20', validUntil: '2024-06-01' },
    { id: 'SJ202406010005', businessType: '商机业务名称02', category: '流量达量预警', source: '线下营业厅', rating: '高', status: '已逾期', executionCustomer: '991*********1005', region: '巴州水磨沟区建设路网格', hours: 3.2, recommendedProducts: [{ id: 'rp1', name: '5G畅享199套餐', category: '套餐产品', price: 199, description: '5G畅享套餐' }], validHours: 0, validityStatus: '已过期', collectTime: '2024-05-30 14:00', validUntil: '2024-05-31' },
    { id: 'SJ202405310006', businessType: '商机策略009', category: '特定内容高频访问', source: 'CRM系统', rating: '中', status: '已转化', executionCustomer: '991*********1006', region: '哈密新市区北京路网格', hours: 0, recommendedProducts: [{ id: 'rp2', name: '流量叠加包', category: '流量产品', price: 10, description: '流量叠加包' }], validHours: 72, validityStatus: '正常', collectTime: '2024-05-31 11:00', validUntil: '2024-07-01' },
    { id: 'SJ202405310007', businessType: '商机策略010', category: '零流量使用预警', source: '企业微信', rating: '低', status: '待抢单', executionCustomer: '991*********1007', region: '阿克苏达坂城区建丰网格', hours: 8.0, recommendedProducts: [{ id: 'rp5', name: '激活礼包', category: '增值产品', price: 0, description: '激活礼包' }], validHours: 24, validityStatus: '正常', collectTime: '2024-05-31 09:30', validUntil: '2024-06-25' },
  ];

  // 商机列表
  const groupOpportunities = [
    { id: 'KQ202406010001', businessType: '商机业务名称02', category: '特定内容高频访问', rating: '高', status: '待派单', groupName: '高流量潜客群A', groupDesc: '抖音高频/月均DOU超30GB', groupSize: 1250, recommendedStrategy: '推荐大流量套餐升级', region: '乌鲁木齐', collectTime: '2024-06-01 10:00', validUntil: '2024-06-15' },
    { id: 'KQ202406010002', businessType: '商机业务名称02', category: '流量达量预警', rating: '高', status: '已派单', groupName: '达量降速客群B', groupDesc: '月均达量2次以上/4G终端', groupSize: 860, recommendedStrategy: '推荐不限量套餐迁移', region: '吐鲁番', collectTime: '2024-06-01 09:30', validUntil: '2024-06-30' },
    { id: 'KQ202406010003', businessType: '测试商机业务-工单', category: '地板价套餐查询', rating: '中', status: '已完成', groupName: '地板价套餐客群C', groupDesc: '低ARPU高DOU', groupSize: 2340, recommendedStrategy: '推荐融合套餐绑定', region: '克拉玛依', collectTime: '2024-05-31 14:00', validUntil: '2024-06-15' },
    { id: 'KQ202406010004', businessType: '商机策略009', category: '零流量使用预警', rating: '中', status: '待派单', groupName: '零流量沉默客群D', groupDesc: '连续3月零流量/有通话', groupSize: 560, recommendedStrategy: '推荐低门槛流量包激活', region: '乌鲁木齐', collectTime: '2024-06-01 08:00', validUntil: '2024-07-01' },
    { id: 'KQ202405310005', businessType: '商机策略008', category: '流量达量预警', rating: '高', status: '已失效', groupName: '高频达量客群E', groupDesc: '月均达量3次以上/5G终端', groupSize: 420, recommendedStrategy: '推荐5G大流量套餐', region: '阿克苏', collectTime: '2024-05-30 16:00', validUntil: '2024-05-31' },
  ];

  // 预警消息列表
  const warningMessages = [
    { id: 'YJ001', category: '待处理商机积压', level: '重要', levelColor: 'bg-orange-500', content: '乌鲁木齐天山区待处理商机积压达86条，超过阈值50条', time: '2024-07-01 09:30', region: '乌鲁木齐天山区', status: '未处理' },
    { id: 'YJ002', category: '商机逾期', level: '紧急', levelColor: 'bg-red-500', content: '吐鲁番天山区3条商机已逾期超24小时，请立即处理', time: '2024-07-01 08:15', region: '吐鲁番天山区', status: '未处理' },
    { id: 'YJ003', category: '商机源采集异常', level: '紧急', levelColor: 'bg-red-500', content: '微信小程序商机源连续2小时未上报数据，疑似采集异常', time: '2024-07-01 07:00', region: '全疆', status: '未处理' },
    { id: 'YJ004', category: '清洗规则剔除率突增', level: '一般', levelColor: 'bg-yellow-500', content: '去重规则剔除率从8.5%突增至15.2%，超出阈值10%', time: '2024-06-30 22:00', region: '全疆', status: '已处理' },
    { id: 'YJ005', category: '抢单池回收率过高', level: '一般', levelColor: 'bg-yellow-500', content: '克拉玛依沙依巴克区抢单池回收率达32%，超过阈值20%', time: '2024-06-30 18:30', region: '克拉玛依沙依巴克区', status: '已处理' },
    { id: 'YJ006', category: '商机类型转化率过低', level: '重要', levelColor: 'bg-orange-500', content: '零流量使用预警转化率仅28.5%，低于阈值35%', time: '2024-06-30 16:00', region: '全疆', status: '未处理' },
    { id: 'YJ007', category: '待处理商机积压', level: '重要', levelColor: 'bg-orange-500', content: '克拉玛依新市区待处理商机积压达62条，超过阈值50条', time: '2024-06-30 14:20', region: '克拉玛依新市区', status: '已处理' },
    { id: 'YJ008', category: '商机逾期', level: '紧急', levelColor: 'bg-red-500', content: '巴州水磨沟区5条商机已逾期超12小时', time: '2024-06-30 11:00', region: '巴州水磨沟区', status: '未处理' },
  ];

  const warningCategoryOptions = ['待处理商机积压', '商机逾期', '商机类型转化率过低', '清洗规则剔除率突增', '商机源采集异常', '抢单池回收率过高'];
  const filteredWarnings = warningCategoryFilter ? warningMessages.filter(w => w.category === warningCategoryFilter) : warningMessages;

  const levelStyle: Record<string, string> = {
    '紧急': 'bg-red-100 text-red-700',
    '重要': 'bg-orange-100 text-orange-700',
    '一般': 'bg-yellow-100 text-yellow-700',
  };
  const warningStatusStyle: Record<string, string> = {
    '未处理': 'bg-red-100 text-red-700',
    '已处理': 'bg-emerald-100 text-emerald-700',
  };
  const ratingStyle: Record<string, string> = {
    '高': 'bg-red-100 text-red-600',
    '中': 'bg-amber-100 text-amber-600',
    '低': 'bg-emerald-100 text-emerald-600',
  };

  // 单客户状态筛选选项
  const singleStatusOptions = ['待派发', '待抢单', '处理中', '已转化', '已失败', '已逾期', '已回收'];
  // 商机群状态筛选选项
  const groupStatusOptions = ['待派单', '已派单', '已完成', '已失效', '已废弃'];

  const filteredSingleList = singleOpportunities.filter(item => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (customerFilters.rating && item.rating !== customerFilters.rating) return false;
    if (customerFilters.businessType && item.businessType !== customerFilters.businessType) return false;
    if (customerFilters.validityStatus && item.validityStatus !== customerFilters.validityStatus) return false;
    if (customerFilters.source && item.source !== customerFilters.source) return false;
    return true;
  });
  const filteredGroupList = groupOpportunities.filter(item => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (groupFilters.rating && item.rating !== groupFilters.rating) return false;
    if (groupFilters.businessType && item.businessType !== groupFilters.businessType) return false;
    if (groupFilters.region && item.region !== groupFilters.region) return false;
    return true;
  });

  // 批量派单相关
  const dispatchableItems = singleOpportunities.filter(item => item.status === '待派发');
  const allDispatchableSelected = dispatchableItems.length > 0 && dispatchableItems.every(item => selectedCustomerIds.has(item.id));
  const handleSelectAll = () => {
    if (allDispatchableSelected) {
      setSelectedCustomerIds(new Set());
    } else {
      setSelectedCustomerIds(new Set(dispatchableItems.map(item => item.id)));
    }
  };
  const handleSelectRow = (id: string) => {
    setSelectedCustomerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectedItems = singleOpportunities.filter(item => selectedCustomerIds.has(item.id));
  const typeDistribution: Record<string, number> = {};
  const gridDistribution: Record<string, number> = {};
  const ratingDistribution: Record<string, number> = {};
  selectedItems.forEach(item => {
    typeDistribution[item.category] = (typeDistribution[item.category] || 0) + 1;
    const gridMatch = item.region.match(/([^>]+网格)$/);
    const gridName = gridMatch ? gridMatch[1] : item.region;
    gridDistribution[gridName] = (gridDistribution[gridName] || 0) + 1;
    ratingDistribution[item.rating] = (ratingDistribution[item.rating] || 0) + 1;
  });
  const confirmBatchDispatch = () => {
    toast.success(`已成功派发${selectedItems.length}个客户商机调度工单，预计拆${Object.keys(gridDistribution).length}个子单`);
    setBatchDispatchDialogOpen(false);
    setSelectedCustomerIds(new Set());
  };

  return (
    <div className="space-y-4">
      {/* 商机整体情况 */}
      <Card className="p-3">
        <div className="flex items-center">
          <span className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0">整体情况</span>
          <div className="flex-1 flex items-center divide-x divide-border">
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机总量</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">12,458</span>
                <span className="text-xs text-muted-foreground">条</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机执行率</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">82.5</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">商机转化率</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">38.6</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">逾期商机量</div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-foreground">156</span>
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
                  <span className="text-xl font-bold text-foreground">1,020</span>
                  <span className="text-xs text-muted-foreground">条</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8.2%</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月执行率</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">85.3</span>
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+3.1pp</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月转化率</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">40.2</span>
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+1.8pp</span>
                </div>
              </div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-xs text-muted-foreground mb-0.5">本月逾期量</div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-foreground">12</span>
                  <span className="text-xs text-muted-foreground">条</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-emerald-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>-2.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 第二行：状态分布（单客户/商机群） + 商机分类占比 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 商机状态分布 */}
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">商机状态分布</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* 单客户商机 */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">单客户商机</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={singleStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    dataKey="value"
                  >
                    {singleStatusDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={singleStatusDistribution[index].color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {singleStatusDistribution.map((item) => {
                  const total = singleStatusDistribution.reduce((s, d) => s + d.value, 0);
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
            </div>
            {/* 商机 */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">商机</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={groupStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    dataKey="value"
                  >
                    {groupStatusDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={groupStatusDistribution[index].color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {groupStatusDistribution.map((item) => {
                  const total = groupStatusDistribution.reduce((s, d) => s + d.value, 0);
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
            </div>
          </div>
        </Card>

        {/* 商机分类占比 */}
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">商机分类占比</h3>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-[180px]">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="count"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 pt-1">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded bg-muted/40">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[index] }} />
                    <div>
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground block">{item.parent}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">商机量 </span>
                      <span className="font-semibold">{item.count.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">执行率 </span>
                      <span className={`font-semibold ${item.executionRate >= 75 ? 'text-emerald-600' : item.executionRate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                        {item.executionRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">转化率 </span>
                      <span className={`font-semibold ${item.conversionRate >= 40 ? 'text-emerald-600' : item.conversionRate >= 35 ? 'text-amber-600' : 'text-red-600'}`}>
                        {item.conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 预警消息列表 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-500" />
            预警消息
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">分类筛选：</span>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant={warningCategoryFilter === '' ? 'default' : 'outline'}
                className="h-6 text-xs px-2"
                onClick={() => setWarningCategoryFilter('')}
              >
                全部
              </Button>
              {warningCategoryOptions.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={warningCategoryFilter === c ? 'default' : 'outline'}
                  className="h-6 text-xs px-2"
                  onClick={() => setWarningCategoryFilter(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">级别</TableHead>
              <TableHead className="w-[180px]">预警类型</TableHead>
              <TableHead>预警内容</TableHead>
              <TableHead className="w-[120px]">区域</TableHead>
              <TableHead className="w-[140px]">预警时间</TableHead>
              <TableHead className="w-16">状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWarnings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">暂无预警</TableCell>
              </TableRow>
            ) : (
              filteredWarnings.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${w.levelColor}`} />
                      <Badge className={levelStyle[w.level]} variant="secondary">{w.level}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{w.category}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{w.content}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{w.region}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{w.time}</TableCell>
                  <TableCell>
                    <Badge className={warningStatusStyle[w.status]} variant="secondary">{w.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 第三行：商机列表（单客户/商机群切换 + 多维筛选 + 看板/列表模式） */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <Tabs value={listTab} onValueChange={(v) => { setListTab(v as 'single' | 'group'); setStatusFilter(''); setCustomerFilters({}); setGroupFilters({}); }}>
            <TabsList>
              <TabsTrigger value="single" className="text-xs">单客户商机</TabsTrigger>
              <TabsTrigger value="group" className="text-xs">商机</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={viewMode === 'kanban' ? 'default' : 'ghost'} className="h-6 w-6 p-0" onClick={() => setViewMode('kanban')}>
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'} className="h-6 w-6 p-0" onClick={() => setViewMode('list')}>
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* 单客户商机 */}
        {listTab === 'single' && (
          <>
            <OpportunityFilterPanel
              tagFilters={[
                { key: 'status', label: '状态', options: singleStatusOptions.map(s => ({ value: s, label: s, count: singleOpportunities.filter(o => o.status === s).length })) },
                { key: 'rating', label: '评级', options: [{ value: '高', label: '高' }, { value: '中', label: '中' }, { value: '低', label: '低' }] },
              ]}
              tagValues={{ ...customerFilters, status: statusFilter }}
              onTagChange={(key, value) => {
                if (key === 'status') { setStatusFilter(value); }
                else { setCustomerFilters(prev => ({ ...prev, [key]: value })); }
              }}
              selectFilters={[
                { key: 'businessType', label: '业务类型', placeholder: '选择业务类型', options: [{ value: '商机业务名称02', label: '商机业务名称02' }, { value: '测试商机业务-工单', label: '测试商机业务-工单' }, { value: '商机策略009', label: '商机策略009' }, { value: '商机策略010', label: '商机策略010' }] },
                { key: 'source', label: '来源', placeholder: '选择来源', options: [{ value: 'CRM系统', label: 'CRM系统' }, { value: '营销活动平台', label: '营销活动平台' }, { value: '外呼系统', label: '外呼系统' }, { value: '线上渠道', label: '线上渠道' }, { value: '线下营业厅', label: '线下营业厅' }, { value: '企业微信', label: '企业微信' }] },
                { key: 'region', label: '区域', placeholder: '选择区域', options: [{ value: '乌鲁木齐', label: '乌鲁木齐' }, { value: '克拉玛依', label: '克拉玛依' }, { value: '吐鲁番', label: '吐鲁番' }, { value: '阿克苏', label: '阿克苏' }] },
                { key: 'validityStatus', label: '有效期', placeholder: '选择有效期状态', options: [{ value: '即将过期', label: '即将过期' }, { value: '正常', label: '正常' }, { value: '已过期', label: '已过期' }] },
              ]}
              selectValues={customerFilters}
              onSelectChange={(key, value) => setCustomerFilters(prev => ({ ...prev, [key]: value }))}
              idSearchValue={customerFilters.id || ''}
              onIdSearchChange={(value) => setCustomerFilters(prev => ({ ...prev, id: value }))}
              idSearchPlaceholder="搜索商机ID"
            />
            {selectedCustomerIds.size > 0 && (
              <div className="flex items-center gap-3 mt-3 p-2 bg-primary/5 rounded-md border border-primary/20">
                <span className="text-sm font-medium">已选 {selectedCustomerIds.size} 条</span>
                <Button size="sm" className="h-7 text-xs" onClick={() => setBatchDispatchDialogOpen(true)}>
                  <Send className="h-3 w-3 mr-1" />批量派单
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedCustomerIds(new Set())}>
                  取消选择
                </Button>
              </div>
            )}
            {viewMode === 'kanban' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                {filteredSingleList.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-sm text-muted-foreground">暂无数据</div>
                ) : (
                  filteredSingleList.map((opp) => (
                    <OpportunityKanbanCard
                      key={opp.id}
                      data={{
                        type: 'customer',
                        id: opp.id,
                        businessTypeName: opp.businessType,
                        rating: opp.rating,
                        recommendedProducts: opp.recommendedProducts,
                        validHours: opp.validHours || 48,
                        status: opp.status,
                        statusLabel: opp.status,
                        region: opp.region,
                        category: opp.category,
                        collectTime: opp.collectTime,
                        validUntil: opp.validUntil,
                      }}
                      selected={selectedCustomerIds.has(opp.id)}
                      onSelect={() => handleSelectRow(opp.id)}
                      showCheckbox={opp.status === '待派发'}
                    />
                  ))
                )}
              </div>
            ) : (
              <Table className="mt-3">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox checked={allDispatchableSelected && dispatchableItems.length > 0} onCheckedChange={handleSelectAll} />
                    </TableHead>
                    <TableHead>商机ID</TableHead>
                    <TableHead>商机业务类型</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>来源</TableHead>
                    <TableHead>评级</TableHead>
                    <TableHead>推荐产品</TableHead>
                    <TableHead>区域</TableHead>
                    <TableHead>采集时间</TableHead>
                    <TableHead>有效期至</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSingleList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">暂无数据</TableCell>
                    </TableRow>
                  ) : (
                    filteredSingleList.map((opp) => (
                      <TableRow key={opp.id} className={selectedCustomerIds.has(opp.id) ? 'bg-primary/5' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomerIds.has(opp.id)}
                            onCheckedChange={() => handleSelectRow(opp.id)}
                            disabled={opp.status !== '待派发'}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{opp.id}</TableCell>
                        <TableCell className="text-sm">{opp.businessType}</TableCell>
                        <TableCell className="text-sm">{opp.category}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{opp.source}</TableCell>
                        <TableCell>
                          <Badge className={ratingStyle[opp.rating]} variant="secondary">{opp.rating}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{(opp.recommendedProducts && opp.recommendedProducts.length > 0) ? opp.recommendedProducts.map((p: {name: string}) => p.name).join('、') : '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{opp.region || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{opp.collectTime || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{opp.validUntil || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{opp.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 hover:text-blue-800">
                              <Send className="h-3 w-3 mr-1" />派发
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs hover:text-foreground">
                              <Eye className="h-3 w-3 mr-1" />查看
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </>
        )}

        {/* 商机群表格 */}
        {listTab === 'group' && (
          <>
            <OpportunityFilterPanel
              tagFilters={[
                { key: 'status', label: '状态', options: groupStatusOptions.map(s => ({ value: s, label: s, count: groupOpportunities.filter(o => o.status === s).length })) },
                { key: 'rating', label: '评级', options: [{ value: '高', label: '高' }, { value: '中', label: '中' }, { value: '低', label: '低' }] },
              ]}
              tagValues={{ ...groupFilters, status: statusFilter }}
              onTagChange={(key, value) => {
                if (key === 'status') { setStatusFilter(value); }
                else { setGroupFilters(prev => ({ ...prev, [key]: value })); }
              }}
              selectFilters={[
                { key: 'businessType', label: '业务类型', placeholder: '选择业务类型', options: [{ value: '商机业务名称02', label: '商机业务名称02' }, { value: '测试商机业务-工单', label: '测试商机业务-工单' }, { value: '商机策略009', label: '商机策略009' }, { value: '商机策略008', label: '商机策略008' }] },
                { key: 'region', label: '区域', placeholder: '选择区域', options: [{ value: '乌鲁木齐', label: '乌鲁木齐' }, { value: '吐鲁番', label: '吐鲁番' }, { value: '克拉玛依', label: '克拉玛依' }, { value: '阿克苏', label: '阿克苏' }] },
              ]}
              selectValues={groupFilters}
              onSelectChange={(key, value) => setGroupFilters(prev => ({ ...prev, [key]: value }))}
              idSearchValue={groupFilters.id || ''}
              onIdSearchChange={(value) => setGroupFilters(prev => ({ ...prev, id: value }))}
              idSearchPlaceholder="搜索商机ID"
            />
            {viewMode === 'kanban' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                {filteredGroupList.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-sm text-muted-foreground">暂无数据</div>
                ) : (
                  filteredGroupList.map((opp) => (
                    <OpportunityKanbanCard
                      key={opp.id}
                      data={{
                        type: 'group',
                        id: opp.id,
                        businessTypeName: opp.businessType,
                        rating: opp.rating,
                        groupName: opp.groupName,
                        groupScale: opp.groupSize,
                        recommendedStrategy: opp.recommendedStrategy,
                        region: opp.region,
                        status: opp.status,
                        statusLabel: opp.status,
                        category: opp.category,
                        collectTime: opp.collectTime,
                        validUntil: opp.validUntil,
                      }}
                    />
                  ))
                )}
              </div>
            ) : (
              <Table className="mt-3">
                <TableHeader>
                  <TableRow>
                    <TableHead>商机ID</TableHead>
                    <TableHead>商机业务类型</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>评级</TableHead>
                    <TableHead>客群名称</TableHead>
                    <TableHead>客群规模</TableHead>
                    <TableHead>区域</TableHead>
                    <TableHead>推荐策略</TableHead>
                    <TableHead>采集时间</TableHead>
                    <TableHead>有效期至</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroupList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">暂无数据</TableCell>
                    </TableRow>
                  ) : (
                    filteredGroupList.map((opp) => (
                      <TableRow key={opp.id}>
                        <TableCell className="font-mono text-xs">{opp.id}</TableCell>
                        <TableCell className="text-sm">{opp.businessType}</TableCell>
                        <TableCell className="text-sm">{opp.category}</TableCell>
                        <TableCell>
                          <Badge className={ratingStyle[opp.rating]} variant="secondary">{opp.rating}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{opp.groupName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{opp.groupSize}人</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{opp.region || '-'}</TableCell>
                        <TableCell className="text-sm">{opp.recommendedStrategy}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{opp.collectTime || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{opp.validUntil || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{opp.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {opp.status === '待派单' && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 hover:text-blue-800">
                                <Send className="h-3 w-3 mr-1" />派单
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-7 text-xs hover:text-foreground">
                              <Eye className="h-3 w-3 mr-1" />查看
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </Card>

      {/* 批量派单确认弹窗 */}
      <Dialog open={batchDispatchDialogOpen} onOpenChange={setBatchDispatchDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>批量派单确认</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Send className="h-4 w-4 text-blue-600" />
              <span className="font-medium">已选 {selectedCustomerIds.size} 个客户商机</span>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">商机汇总</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(
                  selectedItems.reduce((acc, item) => {
                    acc[item.category] = (acc[item.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between">
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-medium">{count}户</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(
                  selectedItems.reduce((acc, item) => {
                    acc[item.rating] = (acc[item.rating] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([rating, count]) => (
                  <div key={rating} className="flex justify-between">
                    <span className="text-muted-foreground">{rating}评级</span>
                    <span className="font-medium">{count}户</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">区域预览</span>
              </div>
              {(() => {
                const gridDist: Record<string, number> = {};
                selectedItems.forEach(item => {
                  const parts = item.region.split('市');
                  const grid = parts.length > 1 ? parts[1]?.replace(/^(沙依巴克区|天山区|水磨沟区|新市区|头屯河区|达坂城区)/, '') || item.region : item.region;
                  gridDist[grid] = (gridDist[grid] || 0) + 1;
                });
                return Object.entries(gridDist).map(([grid, count]) => (
                  <div key={grid} className="text-sm flex justify-between">
                    <span className="text-muted-foreground">{grid}</span>
                    <span>{count}个客户</span>
                  </div>
                ));
              })()}
              <div className="text-xs text-blue-600 mt-1">
                预计拆{new Set(selectedItems.map(item => item.region)).size}个子单
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">工单类型</span>
                <span className="font-medium">商机调度</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">派发渠道</span>
                <span className="font-medium">调度中心</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDispatchDialogOpen(false)}>取消</Button>
            <Button onClick={confirmBatchDispatch}>确认派单</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
