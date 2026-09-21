'use client';

import { useState } from 'react';
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
import ProductSelector, { type ProductItem } from '@/components/ProductSelector';
import { TrendingUp, TrendingDown, Send, Eye, XCircle, ChevronRight, ChevronLeft, Trash2, Database, Target, Filter, MapPin, CheckCircle, Clock, BarChart3, Package, X, Plus, ArrowUpDown, Upload, Building2, Search, Settings } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import type { CategoryDataItem } from './BusinessOpportunityTab';
import OpportunityFilterPanel from '@/app/workspace/business-opportunity/components/OpportunityFilterPanel';


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
  '调级中': { label: '调级中', color: 'bg-orange-100 text-orange-700' },
  '已完成': { label: '已完成', color: 'bg-green-100 text-green-700' },
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

interface OperatorTabProps {
  categoryData?: CategoryDataItem[];
}

export default function OperatorTab({ categoryData }: OperatorTabProps) {
  // 使用传入的分类数据或默认值
  const categories = categoryData && categoryData.length > 0 ? categoryData : DEFAULT_CATEGORY_DATA;
  const [customerStatusFilter, setCustomerStatusFilter] = useState<string>('');
  const [customerFilters, setCustomerFilters] = useState<Record<string, string>>({});
  const [searchCategoryL1, setSearchCategoryL1] = useState<string>('');
  const [searchCategoryL2, setSearchCategoryL2] = useState<string>('');
  const [searchCategoryL3, setSearchCategoryL3] = useState<string>('');


  // 弹窗状态
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [customerDetailDialogOpen, setCustomerDetailDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [abandonDialogOpen, setAbandonDialogOpen] = useState(false);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [groupDetailDialogOpen, setGroupDetailDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // 派单状态（与客户商机派单弹窗保持一致）
  const [dispatchSystem, setDispatchSystem] = useState<'网格通' | '在线'>('网格通');
  const [executionRole, setExecutionRole] = useState<string>('');
  const [dispatchApprover, setDispatchApprover] = useState<string>('');
  const [dispatchScenario, setDispatchScenario] = useState<string>('');
  const [dispatchDesc, setDispatchDesc] = useState<string>('');
  const [dispatchOrderTitle, setDispatchOrderTitle] = useState<string>('');
  const [dispatchDueDate, setDispatchDueDate] = useState<string>('');

  // 派单：切换派发系统时重置执行角色
  const handleDispatchSystemChange = (system: '网格通' | '在线') => {
    setDispatchSystem(system);
    setExecutionRole('');
  };

  // 派单确认
  const confirmDispatch = () => {
    if (!dispatchScenario) { toast.error('请选择运营场景'); return; }
    if (!dispatchOrderTitle) { toast.error('请输入工单标题'); return; }
    if (!dispatchApprover) { toast.error('请选择审批人'); return; }
    setDispatchDialogOpen(false);
    setSelectedOpportunity(null);
    toast.success('派单成功', { description: `已将此商机派发至${dispatchSystem}` });
  };

  // 批量派单确认
  const confirmBatchDispatch = () => {
    setBatchDispatchDialogOpen(false);
    setSelectedCustomerIds([]);
    toast.success('批量派单成功', { description: `已将 ${selectedCustomerIds.length} 个客户商机派发至${dispatchSystem}` });
  };

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

  // 推荐产品选择
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [productSelectorContext, setProductSelectorContext] = useState<'single' | 'batch' | undefined>('single');
  const [singleDispatchProducts, setSingleDispatchProducts] = useState<ProductItem[]>([]);
  const [batchDispatchProducts, setBatchDispatchProducts] = useState<ProductItem[]>([]);

  // 调级弹窗状态
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<typeof customerOpportunities[number] | null>(null);
  const [adjustForm, setAdjustForm] = useState<{ newRating: string; reason: string; approver: string; attachments: string[] }>({ newRating: '', reason: '', approver: '', attachments: [] });

  // 审批人选择弹窗状态
  const [approverDialogOpen, setApproverDialogOpen] = useState(false);
  const [approverSearch, setApproverSearch] = useState('');
  const [tempApprover, setTempApprover] = useState('');
  // 审批人弹窗服务于哪个表单：single=单条调级，dispatch=单条派单
  const [approverTarget, setApproverTarget] = useState<'single' | 'dispatch'>('single');

  const approverList = [
    { id: 'li_manager', name: '李主管', dept: '新疆市场部' },
    { id: 'zhao_director', name: '赵部长', dept: '新疆运维部' },
    { id: 'wang_manager', name: '王经理', dept: '乌鲁木齐分公司' },
    { id: 'sun_supervisor', name: '孙主管', dept: '昌吉分公司' },
    { id: 'chen_leader', name: '陈组长', dept: '伊犁分公司' },
  ];

  const handleOpenRatingAdjust = (item: typeof customerOpportunities[number]) => {
    setAdjustTarget(item);
    setAdjustForm({ newRating: '', reason: '', approver: '', attachments: [] });
    setAdjustDialogOpen(true);
  };

  const handleSubmitAdjust = () => {
    if (!adjustForm.newRating || !adjustForm.reason || !adjustForm.approver) { return; }
    setAdjustDialogOpen(false);
    setAdjustTarget(null);
  };

  // 客户商机状态选项
  const customerStatusOptions = ['待派单', '调级中', '已完成'];
  // 客群商机状态选项
  const groupStatusOptions = ['待调度', '调度中', '已完成', '已废弃'];

  // 评级样式
  const ratingStyle: Record<string, string> = {
    '高': 'bg-red-50 text-red-600 border-red-200',
    '中': 'bg-amber-50 text-amber-600 border-amber-200',
    '低': 'bg-slate-50 text-slate-600 border-slate-200',
  };

  // 批量选择状态
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  // 批量派单弹窗
  const [batchDispatchDialogOpen, setBatchDispatchDialogOpen] = useState(false);

  // 客户商机列表（扩充数据，含网格信息，支持批量派单）
  const customerOpportunities = [
    { id: 'KH202406010001', businessType: '商机业务名称02', opportunityName: '5G畅享套餐升级商机', category: '风险预警类 > 流量预警 > 流量达量预警', source: '微信小程序', businessScenario: '流量运营', rating: '高', executionCustomer: '991*********1234', region: '乌鲁木齐天山区', grid: '南塔网格', collectTime: '2024-06-01 10:30', validUntil: '2024-06-15', validHours: 48, validityStatus: '即将过期', status: '待派单', recommendedProducts: [{ id: 'PROD001', code: '5G-CX-199', name: '5G畅享199套餐', category: 'base-5g', price: 199, description: '含60GB流量+1000分钟通话' }], recommendedReason: '客户流量使用量高，适合推荐流量包' },
    { id: 'KH202406010002', businessType: '商机业务名称02', opportunityName: '高频内容流量推荐', category: '价值提升类 > 特定内容 > 特定内容高频访问', source: 'APP埋点', businessScenario: '流量运营', rating: '中', executionCustomer: '991*********5678', region: '乌鲁木齐天山区', grid: '南塔网格', collectTime: '2024-06-01 09:15', validUntil: '2024-06-14', validHours: 48, validityStatus: '正常', status: '待派单', recommendedProducts: [{ id: 'PROD006', code: 'LL-JY-10G', name: '10GB流量加油包', category: 'addon-data', price: 30, description: '当月有效10GB流量' }], recommendedReason: '高频访问内容，推荐流量包' },
    { id: 'KH202406010003', businessType: '测试商机业务-工单', opportunityName: '地板价套餐升级', category: '价值提升类 > 套餐查询 > 地板价套餐查询', source: '营业厅', businessScenario: '流量运营', rating: '高', executionCustomer: '991*********9012', region: '乌鲁木齐天山区', grid: '北门网格', collectTime: '2024-06-01 08:45', validUntil: '2024-06-13', validHours: 48, validityStatus: '正常', status: '待派单', recommendedProducts: [{ id: 'PROD002', code: '5G-CX-129', name: '5G畅享129套餐', category: 'base-5g', price: 129, description: '含30GB流量+500分钟通话' }], recommendedReason: '地板价套餐查询，推荐升级' },
    { id: 'KH202405310004', businessType: '商机策略009', opportunityName: '零流量用户激活', category: '生命周期类 > 零流量 > 零流量使用预警', source: '外呼系统', businessScenario: '流量运营', rating: '低', executionCustomer: '991*********3456', region: '乌鲁木齐天山区', grid: '幸福路网格', collectTime: '2024-05-31 16:20', validUntil: '2024-06-10', validHours: 48, validityStatus: '已过期', status: '待派单', recommendedProducts: [{ id: 'PROD006', code: 'LL-JY-10G', name: '10GB流量加油包', category: 'addon-data', price: 30, description: '当月有效10GB流量' }], recommendedReason: '零流量用户，推荐激活' },
    { id: 'KH202406010005', businessType: '商机业务名称02', opportunityName: '大流量套餐推荐', category: '风险预警类 > 流量预警 > 流量达量预警', source: '微信小程序', businessScenario: '流量运营', rating: '高', executionCustomer: '991*********7890', region: '乌鲁木齐天山区', grid: '南塔网格', collectTime: '2024-06-01 11:00', validUntil: '2024-06-16', validHours: 48, validityStatus: '即将过期', status: '待派单', recommendedProducts: [{ id: 'PROD001', code: '5G-CX-199', name: '5G畅享199套餐', category: 'base-5g', price: 199, description: '含60GB流量+1000分钟通话' }], recommendedReason: '流量使用量高，推荐5G套餐' },
    { id: 'KH202406010006', businessType: '测试商机业务-工单', opportunityName: '套餐升级推荐', category: '价值提升类 > 套餐查询 > 地板价套餐查询', source: '营业厅', businessScenario: '流量运营', rating: '中', executionCustomer: '991*********4567', region: '乌鲁木齐天山区', grid: '北门网格', collectTime: '2024-06-01 10:15', validUntil: '2024-06-14', validHours: 48, validityStatus: '正常', status: '待派单', recommendedProducts: [{ id: 'PROD002', code: '5G-CX-129', name: '5G畅享129套餐', category: 'base-5g', price: 129, description: '含30GB流量+500分钟通话' }], recommendedReason: '地板价套餐，推荐升级' },
    { id: 'KH202406010007', businessType: '商机业务名称02', opportunityName: '高频访问流量包', category: '价值提升类 > 特定内容 > 特定内容高频访问', source: 'APP埋点', businessScenario: '流量运营', rating: '高', executionCustomer: '991*********2345', region: '乌鲁木齐天山区', grid: '幸福路网格', collectTime: '2024-06-01 09:50', validUntil: '2024-06-15', validHours: 48, validityStatus: '正常', status: '调级中', recommendedProducts: [{ id: 'PROD006', code: 'LL-JY-10G', name: '10GB流量加油包', category: 'addon-data', price: 30, description: '当月有效10GB流量' }], recommendedReason: '高频访问，推荐流量包' },
    { id: 'KH202406010008', businessType: '商机策略009', opportunityName: '沉默用户唤醒', category: '生命周期类 > 零流量 > 零流量使用预警', source: '外呼系统', businessScenario: '离网维系', rating: '低', executionCustomer: '991*********6789', region: '乌鲁木齐天山区', grid: '南塔网格', collectTime: '2024-05-31 15:30', validUntil: '2024-06-09', validHours: 48, validityStatus: '已过期', status: '已完成', recommendedProducts: [{ id: 'PROD006', code: 'LL-JY-10G', name: '10GB流量加油包', category: 'addon-data', price: 30, description: '当月有效10GB流量' }], recommendedReason: '零流量用户，推荐激活' },
  ];

  // 客群商机列表（核心业务区）
  // 区域选项与分类级联选项（从数据提取）
  const regionOptions = Array.from(new Set(customerOpportunities.map(o => o.region)));
  const categoryLevel1Options = Array.from(new Set(customerOpportunities.map(o => o.category.split(' > ')[0])));
  const categoryLevel2Options = searchCategoryL1
    ? Array.from(new Set(customerOpportunities.filter(o => o.category.startsWith(searchCategoryL1 + ' > ')).map(o => o.category.split(' > ')[1])))
    : [];
  const categoryLevel3Options = searchCategoryL1 && searchCategoryL2
    ? Array.from(new Set(customerOpportunities.filter(o => o.category.startsWith(searchCategoryL1 + ' > ' + searchCategoryL2 + ' > ')).map(o => o.category.split(' > ')[2])))
    : [];
  // 筛选后的客户商机列表
  const filteredCustomerList = customerOpportunities.filter(opp => {
    if (customerStatusFilter && opp.status !== customerStatusFilter) return false;
    if (customerFilters.rating && opp.rating !== customerFilters.rating) return false;
    if (customerFilters.businessScenario && opp.businessScenario !== customerFilters.businessScenario) return false;
    if (customerFilters.businessType && opp.businessType !== customerFilters.businessType) return false;
    if (customerFilters.source && opp.source !== customerFilters.source) return false;
    if (customerFilters.region && opp.region !== customerFilters.region) return false;
    if (searchCategoryL1 && !opp.category.startsWith(searchCategoryL1)) return false;
    if (searchCategoryL2 && !opp.category.includes(' > ' + searchCategoryL2 + ' > ')) return false;
    if (searchCategoryL3 && !opp.category.endsWith(' > ' + searchCategoryL3)) return false;
    return true;
  });

  // 批量选择：可派单的客户（仅待派单状态可勾选）
  const dispatchableCustomerIds = filteredCustomerList.filter(o => o.status === '待派单').map(o => o.id);
  const allDispatchableSelected = dispatchableCustomerIds.length > 0 && dispatchableCustomerIds.every(id => selectedCustomerIds.includes(id));
  
  const toggleSelectAll = () => {
    if (allDispatchableSelected) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds([...dispatchableCustomerIds]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedCustomerIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 批量派单汇总统计
  const selectedCustomers = customerOpportunities.filter(o => selectedCustomerIds.includes(o.id));
  const batchRatingStats = selectedCustomers.reduce((acc, o) => {
    acc[o.rating] = (acc[o.rating] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const batchGridStats = selectedCustomers.reduce((acc, o) => {
    const g = o.grid || '未分配';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);



  // 预测质量漏斗数据
  const predictionFunnel = [
    { stage: '采集', count: 12458, rate: 100, color: '#3b82f6' },
    { stage: '清洗后', count: 10820, rate: 86.8, color: '#6366f1' },
    { stage: '入模', count: 9560, rate: 88.4, color: '#8b5cf6' },
    { stage: '预测产出', count: 8562, rate: 89.6, color: '#a78bfa' },
  ];

  // 商机状态分布 - 待派单/调级中/已完成
  const customerStatusDistribution = [
    { name: '待派单', value: 186, color: '#94a3b8' },
    { name: '调级中', value: 312, color: '#f59e0b' },
    { name: '已完成', value: 687, color: '#10b981' },
  ];

  // 策略效率数据
  const strategyEfficiency = [
    { name: '套餐升级', count: 156, conversionRate: 42.5, avgDays: 3.2 },
    { name: '融合绑定', count: 128, conversionRate: 38.2, avgDays: 4.5 },
    { name: '流量包激活', count: 98, conversionRate: 35.8, avgDays: 2.8 },
    { name: '终端换机', count: 85, conversionRate: 45.2, avgDays: 5.1 },
    { name: '宽带新增', count: 72, conversionRate: 41.0, avgDays: 3.8 },
  ];

  return (
    <div className="space-y-6">
      {/* 核心指标卡片 - 与领导人样式一致 */}
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

      {/* 第二行：商机状态分布 + 商机分类分布 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 商机状态分布 */}
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">商机状态分布</h3>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-[160px]">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={customerStatusDistribution} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                    {customerStatusDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={customerStatusDistribution[index].color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5 pt-1">
              {customerStatusDistribution.map((item) => {
                const total = customerStatusDistribution.reduce((s, d) => s + d.value, 0);
                return (
                  <div key={item.name} className="flex items-center justify-between p-1.5 rounded bg-muted/40">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold">{item.value}</span>
                      <span className="text-muted-foreground">({((item.value / total) * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* 商机分类分布 */}
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">商机分类分布</h3>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-[160px]">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categories.map(c => ({ name: c.name, value: c.count }))} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                    {categories.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5 pt-1">
              {categories.map((item, index) => {
                const total = categories.reduce((s, d) => s + d.count, 0);
                return (
                  <div key={item.name} className="flex items-center justify-between p-1.5 rounded bg-muted/40">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                      <span className="text-xs">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold">{item.count}</span>
                      <span className="text-muted-foreground">({((item.count / total) * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* 策略效率看板 - 隐藏 */}
      {false && (
        <Card className="p-5">
          <h3 className="text-sm font-medium mb-4">策略效率看板</h3>
        </Card>
      )}

      {/* 商机管理列表区域 */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">商机管理列表</h3>
          <div className="flex items-center gap-3">
            <Link href="/workspace/business-opportunity/customer" className="text-xs text-primary hover:underline">
              查看更多 →
            </Link>
          </div>
        </div>

          <div>
            <OpportunityFilterPanel
              tagFilters={[
                { key: 'status', label: '状态', options: customerStatusOptions.map(s => ({ value: s, label: s, count: customerOpportunities.filter(o => o.status === s).length })) },
                { key: 'rating', label: '评级', options: [{ value: '高', label: '高' }, { value: '中', label: '中' }, { value: '低', label: '低' }] },
              ]}
              tagValues={{ ...customerFilters, status: customerStatusFilter }}
              onTagChange={(key, value) => {
                if (key === 'status') { setCustomerStatusFilter(value); }
                else { setCustomerFilters(prev => ({ ...prev, [key]: value })); }
              }}
              selectFilters={[
                { key: 'businessType', label: '业务类型', placeholder: '选择业务类型', options: [{ value: '商机业务名称02', label: '商机业务名称02' }, { value: '测试商机业务-工单', label: '测试商机业务-工单' }, { value: '商机策略009', label: '商机策略009' }, { value: '商机策略008', label: '商机策略008' }, { value: '商机策略010', label: '商机策略010' }] },
                { key: 'source', label: '商机源', placeholder: '选择商机源', options: [{ value: '微信小程序', label: '微信小程序' }, { value: 'APP埋点', label: 'APP埋点' }, { value: '营业厅', label: '营业厅' }, { value: '外呼系统', label: '外呼系统' }] },
                { key: 'region', label: '区域', placeholder: '选择区域', options: regionOptions.map(r => ({ value: r, label: r })) },
              ]}
              selectValues={customerFilters}
              onSelectChange={(key, value) => setCustomerFilters(prev => ({ ...prev, [key]: value }))}
              cascadeFilters={[
                {
                  key: 'category',
                  levels: [
                    { key: 'categoryL1', label: '一级分类', placeholder: '请选择', options: categoryLevel1Options.map(c => ({ value: c, label: c })) },
                    { key: 'categoryL2', label: '二级分类', placeholder: '请选择', options: categoryLevel2Options.map(c => ({ value: c, label: c })), parentKey: 'categoryL1' },
                    { key: 'categoryL3', label: '三级分类', placeholder: '请选择', options: categoryLevel3Options.map(c => ({ value: c, label: c })), parentKey: 'categoryL2' },
                  ],
                },
              ]}
              cascadeValues={{ categoryL1: searchCategoryL1, categoryL2: searchCategoryL2, categoryL3: searchCategoryL3 }}
              onCascadeChange={(key, value) => {
                if (key === 'categoryL1') {
                  setSearchCategoryL1(value);
                  setSearchCategoryL2('');
                  setSearchCategoryL3('');
                } else if (key === 'categoryL2') {
                  setSearchCategoryL2(value);
                  setSearchCategoryL3('');
                } else {
                  setSearchCategoryL3(value);
                }
              }}
              idSearchValue={customerFilters.id || ''}
              onIdSearchChange={(value) => setCustomerFilters(prev => ({ ...prev, id: value }))}
              idSearchPlaceholder="搜索商机ID"
            />
            {selectedCustomerIds.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-muted-foreground">已选 <span className="text-primary font-medium">{selectedCustomerIds.length}</span> 条</span>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => { setDispatchSystem('网格通'); setExecutionRole(''); setBatchDispatchDialogOpen(true); }}
                >
                  <Send className="h-3 w-3 mr-1" />批量派单
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setSelectedCustomerIds([])}
                >
                  取消选择
                </Button>
              </div>
            )}
            <Table className="mt-3">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allDispatchableSelected && dispatchableCustomerIds.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="h-4 w-4"
                      />
                    </TableHead>
                    <TableHead>商机ID</TableHead>
                    <TableHead>商机业务类型</TableHead>
                    <TableHead>商机分类</TableHead>
                    <TableHead>商机源</TableHead>
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
                  {filteredCustomerList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">暂无数据</TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomerList.map((opp) => (
                      <TableRow key={opp.id} className={selectedCustomerIds.includes(opp.id) ? 'bg-primary/5' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomerIds.includes(opp.id)}
                            onCheckedChange={() => toggleSelectOne(opp.id)}
                            disabled={opp.status !== '待派单'}
                            className="h-4 w-4"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{opp.id}</TableCell>
                        <TableCell className="text-sm">{opp.businessType}</TableCell>
                        <TableCell className="text-sm">{opp.category}</TableCell>
                        <TableCell className="text-sm">{opp.source}</TableCell>
                        <TableCell>
                          <Badge className={ratingStyle[opp.rating]} variant="secondary">{opp.rating}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{opp.recommendedProducts?.map(p => p.name).join('、') || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{opp.region || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{opp.collectTime || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{opp.validUntil || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            opp.status === '待派单' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                            opp.status === '调级中' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }>{opp.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {opp.status === '待派单' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 text-xs text-blue-600 hover:text-blue-800"
                                  onClick={() => {
                                    setSelectedOpportunity(opp);
                                    setSingleDispatchProducts(opp.recommendedProducts || []);
                                    setDispatchSystem('网格通');
                                    setExecutionRole('');
                                    setDispatchApprover('');
                                    setDispatchScenario('');
                                    setDispatchDesc('');
                                    setDispatchOrderTitle(opp.category.split(' > ').pop() || '');
                                    setDispatchDueDate('');
                                    setDispatchDialogOpen(true);
                                  }}
                                >
                                  <Send className="h-3 w-3 mr-1" />派单
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 text-xs text-orange-600 hover:text-orange-800"
                                  onClick={() => handleOpenRatingAdjust(opp)}
                                >
                                  <ArrowUpDown className="h-3 w-3 mr-1" />调级
                                </Button>
                              </>
                            )}
                            {opp.status === '调级中' && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 text-xs text-orange-600 hover:text-orange-800"
                                onClick={() => handleOpenRatingAdjust(opp)}
                              >
                                <ArrowUpDown className="h-3 w-3 mr-1" />调级
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>派单确认</DialogTitle>
            <DialogDescription>确认将此商机派发至{dispatchSystem}</DialogDescription>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Database className="w-4 h-4" />商机基本信息</h4>
                <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                  <div><div className="text-xs text-muted-foreground mb-1">商机ID</div><div className="font-medium text-primary">{selectedOpportunity.id}</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">商机评级</div><Badge variant="outline" className={`${RATING_LEVELS[selectedOpportunity.rating].color} font-medium`}>{RATING_LEVELS[selectedOpportunity.rating].label}</Badge></div>
                  <div className="col-span-2"><div className="text-xs text-muted-foreground mb-1">商机分类</div><div className="text-sm">{selectedOpportunity.category}</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">执行客户</div><div className="text-sm font-medium font-mono">{selectedOpportunity.executionCustomer}</div></div>
                  <div className="col-span-2"><div className="text-xs text-muted-foreground mb-1">区域信息</div><div className="text-sm">{selectedOpportunity.region}</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">采集时间</div><div className="text-sm">{selectedOpportunity.collectTime}</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">采集周期</div><div className="text-sm">{selectedOpportunity.collectCycle || '-'}</div></div>
                </div>
              </div>
              {selectedOpportunity.recommendedReason && (
                <div className="text-xs text-muted-foreground">推荐原因：{selectedOpportunity.recommendedReason}</div>
              )}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Send className="w-4 h-4" />派单配置</h4>
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>运营场景</span>
                    <Select value={dispatchScenario} onValueChange={setDispatchScenario}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="请选择运营场景" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="流量运营">流量运营</SelectItem>
                        <SelectItem value="中高端运营">中高端运营</SelectItem>
                        <SelectItem value="离网维系">离网维系</SelectItem>
                        <SelectItem value="家庭运营">家庭运营</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-20 shrink-0">工单类型</span>
                    <Select value="商机调度" disabled>
                      <SelectTrigger className="flex-1 bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="商机调度">商机调度</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>工单标题</span><Input className="flex-1" placeholder="请输入工单标题" value={dispatchOrderTitle} onChange={(e) => setDispatchOrderTitle(e.target.value)} /></div>
                  <div className="flex items-start gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0 mt-2">工单描述</span><Textarea className="flex-1 min-h-[80px]" placeholder="请输入工单描述（选填）" value={dispatchDesc} onChange={(e) => setDispatchDesc(e.target.value)} /></div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0">要求完成时间</span><Input type="datetime-local" className="flex-1" value={dispatchDueDate} onChange={(e) => setDispatchDueDate(e.target.value)} /></div>
                  <div className="space-y-2"><span className="text-sm text-muted-foreground">推荐产品</span>
                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                      {singleDispatchProducts.map(p => (
                        <span key={p.id} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/5 rounded text-xs">
                          {p.name} <span className="text-muted-foreground">¥{p.price}</span>
                          <X className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setSingleDispatchProducts(prev => prev.filter(pp => pp.id !== p.id))} />
                        </span>
                      ))}
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setProductSelectorContext('single'); setProductSelectorOpen(true); }}>+ 选择推荐产品</Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>派发系统</span>
                    <div className="flex-1 flex gap-3">
                      {(['网格通', '在线'] as const).map(sys => (
                        <label key={sys} className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-all ${dispatchSystem === sys ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-foreground'}`}>
                          <input type="radio" name="dispatchSystem" checked={dispatchSystem === sys} onChange={() => handleDispatchSystemChange(sys)} className="accent-primary" />
                          <span className="text-sm">{sys}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>执行角色</span>
                    <div className="flex-1 flex gap-3">
                      {dispatchSystem === '网格通' ? (
                        ['地市集运', '网格经理'].map(role => (
                          <label key={role} className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-all ${executionRole === role ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-foreground'}`}>
                            <input type="radio" name="executionRole" checked={executionRole === role} onChange={() => setExecutionRole(role)} className="accent-primary" />
                            <span className="text-sm">{role}</span>
                          </label>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-primary bg-primary/5 text-primary">
                          <input type="radio" checked readOnly className="accent-primary" />
                          <span className="text-sm">10086</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>审批人</span>
                    <Button type="button" variant="outline" className="flex-1 justify-start" onClick={() => { setApproverTarget('dispatch'); setTempApprover(dispatchApprover); setApproverSearch(''); setApproverDialogOpen(true); }}>
                      {dispatchApprover
                        ? (() => { const p = approverList.find(a => a.id === dispatchApprover); return p ? `${p.name}（${p.dept}）` : dispatchApprover; })()
                        : <span className="text-muted-foreground flex items-center"><Plus className="w-4 h-4 mr-1" />选择审批人</span>}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100"><div className="text-sm text-amber-700">派单后商机将进入{dispatchSystem}执行流程，审批通过后分配至{executionRole || '对应角色'}处理。</div></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispatchDialogOpen(false)}>取消</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={confirmDispatch}>确认派单</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量派单弹窗 */}
      <Dialog open={batchDispatchDialogOpen} onOpenChange={setBatchDispatchDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>批量派单确认</DialogTitle>
            <DialogDescription>确认将选中的 {selectedCustomerIds.length} 个客户商机批量派发至{dispatchSystem}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Settings className="w-4 h-4" />调度配置</h4>
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>派发系统</span>
                  <div className="flex-1 flex gap-3">
                    {(['网格通', '在线'] as const).map(sys => (
                      <label key={sys} className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-all ${dispatchSystem === sys ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-foreground'}`}>
                        <input type="radio" name="batchDispatchSystem" checked={dispatchSystem === sys} onChange={() => handleDispatchSystemChange(sys)} className="accent-primary" />
                        <span className="text-sm">{sys}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-20 shrink-0"><span className="text-red-500 mr-0.5">*</span>执行角色</span>
                  <div className="flex-1 flex gap-3">
                    {dispatchSystem === '网格通' ? (
                      ['地市集运', '网格经理'].map(role => (
                        <label key={role} className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-all ${executionRole === role ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-foreground'}`}>
                          <input type="radio" name="batchExecutionRole" checked={executionRole === role} onChange={() => setExecutionRole(role)} className="accent-primary" />
                          <span className="text-sm">{role}</span>
                        </label>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-primary bg-primary/5 text-primary">
                        <input type="radio" checked readOnly className="accent-primary" />
                        <span className="text-sm">10086</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><BarChart3 className="w-4 h-4" />商机汇总</h4>
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                <div><div className="text-xs text-muted-foreground mb-1">选中商机数</div><div className="font-medium text-primary">{selectedCustomerIds.length} 个</div></div>
                <div><div className="text-xs text-muted-foreground mb-1">涉及网格数</div><div className="font-medium text-primary">{Object.keys(batchGridStats).length} 个</div></div>
                <div className="col-span-2"><div className="text-xs text-muted-foreground mb-1">评级分布</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(batchRatingStats).map(([rating, count]) => <Badge key={rating} variant="outline" className="text-xs">{rating}({count})</Badge>)}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><MapPin className="w-4 h-4" />区域预览</h4>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="space-y-2">
                  {Object.entries(batchGridStats).map(([grid, count]) => (
                    <div key={grid} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{grid}</span><span className="text-primary font-medium">{count} 个客户</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-primary/20 text-sm text-primary">
                  预计拆 {Object.keys(batchGridStats).length} 个子单（按网格拆分）
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2"><Package className="w-4 h-4" />推荐产品</h4>
              <div className="p-3 bg-muted/30 rounded-lg border">
                {batchDispatchProducts.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {batchDispatchProducts.map(p => (
                      <div key={p.id} className="flex items-center gap-1 px-2 py-1 bg-primary/5 rounded border border-primary/10">
                        <span className="text-sm">{p.name}</span>
                        <span className="text-xs text-muted-foreground">¥{p.price}</span>
                        <X className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-destructive" onClick={() => setBatchDispatchProducts(prev => prev.filter(pp => pp.id !== p.id))} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂未选择推荐产品</p>
                )}
                <Button variant="outline" size="sm" onClick={() => { setProductSelectorContext('batch'); setProductSelectorOpen(true); }}>
                  <Plus className="w-3.5 h-3.5 mr-1" />选择推荐产品
                </Button>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-sm text-amber-700">批量派单后，{dispatchSystem}将按网格自动拆分 {selectedCustomerIds.length} 个商机的子工单，并分配至对应{executionRole || '角色'}处理。</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDispatchDialogOpen(false)}>取消</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={confirmBatchDispatch}>确认派单</Button>
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
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">执行客户</div>
                      <div className="text-sm font-medium font-mono">{selectedOpportunity.executionCustomer}</div>
                    </div>
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
                      {selectedOpportunity.executionRecords?.map((record: { time: string; action: string; operator: string; result: string }, index: number) => (
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
                            <RadioGroupItem value="wanggetong" id="op-schedule-wanggetong" />
                            <Label htmlFor="op-schedule-wanggetong" className="text-sm font-normal cursor-pointer">网格通</Label>
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
                            <RadioGroupItem value="city-ops" id="op-schedule-city-ops" />
                            <Label htmlFor="op-schedule-city-ops" className="text-sm font-normal cursor-pointer">地市集运</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="grid-manager" id="op-schedule-grid-manager" />
                            <Label htmlFor="op-schedule-grid-manager" className="text-sm font-normal cursor-pointer">网格经理</Label>
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
                    {selectedGroup.executionRecords.map((record: { time: string; action: string; operator: string; result: string; detail?: string }, index: number) => (
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
      {/* 推荐产品选择弹窗 */}
      <ProductSelector
        open={productSelectorOpen}
        onOpenChange={(open: boolean) => { setProductSelectorOpen(open); if (!open) setProductSelectorContext(undefined); }}
        onConfirm={(products) => {
          if (productSelectorContext === 'single') {
            setSingleDispatchProducts(products);
          } else if (productSelectorContext === 'batch') {
            setBatchDispatchProducts(products);
          }
          setProductSelectorOpen(false);
          setProductSelectorContext(undefined);
        }}
        selectedIds={productSelectorContext === 'single' ? singleDispatchProducts.map(p => p.id) : productSelectorContext === 'batch' ? batchDispatchProducts.map(p => p.id) : []}
      />
      {/* 调级弹窗 */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              商机调级申请
            </DialogTitle>
            <DialogDescription>填写调级信息，提交后进入审批流程</DialogDescription>
          </DialogHeader>
          {adjustTarget && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">商机编码</div>
                  <div className="text-sm font-medium">{adjustTarget.id}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">商机名称</div>
                  <div className="text-sm font-medium">{adjustTarget.opportunityName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">当前评级</div>
                  <Badge className={
                    adjustTarget.rating === '高' ? 'bg-red-100 text-red-700 border-red-200' :
                    adjustTarget.rating === '中' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }>{adjustTarget.rating}</Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">当前状态</div>
                  <Badge variant="secondary">{adjustTarget.status}</Badge>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium"><span className="text-red-500">*</span> 新评级</Label>
                <Select value={adjustForm.newRating} onValueChange={(v) => setAdjustForm(prev => ({ ...prev, newRating: v }))}>
                  <SelectTrigger><SelectValue placeholder="请选择新评级" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="高">高</SelectItem>
                    <SelectItem value="中">中</SelectItem>
                    <SelectItem value="低">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium"><span className="text-red-500">*</span> 调级原因</Label>
                <Textarea
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="请输入调级原因(200字以内)"
                  maxLength={200}
                  className="resize-none"
                  rows={3}
                />
                <div className="text-right text-xs text-muted-foreground">{adjustForm.reason.length}/200</div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">附件上传</Label>
                <div className="border border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">点击上传附件</div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5">支持PDF、图片等格式</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium"><span className="text-red-500">*</span> 审批人</Label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => { setApproverTarget('single'); setTempApprover(adjustForm.approver); setApproverSearch(''); setApproverDialogOpen(true); }}
                >
                  {adjustForm.approver ? (
                    <span className="text-foreground">{approverList.find(a => a.id === adjustForm.approver)?.name}（{approverList.find(a => a.id === adjustForm.approver)?.dept}）</span>
                  ) : (
                    <span className="flex items-center gap-1"><Plus className="h-4 w-4" />选择审批人</span>
                  )}
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmitAdjust} className="bg-orange-500 hover:bg-orange-600">提交调级申请</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 审批人选择弹窗 */}
      <Dialog open={approverDialogOpen} onOpenChange={setApproverDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>选择审批人</DialogTitle>
          </DialogHeader>
          <div className="flex gap-3 py-2" style={{ minHeight: '300px' }}>
            <div className="w-1/3 border-r pr-3">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Building2 className="h-3 w-3" />组织架构</div>
              <div className="text-sm font-medium p-2 bg-muted/50 rounded cursor-pointer">中国移动通信集团新疆有限公司</div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="输入人员名称"
                  value={approverSearch}
                  onChange={(e) => setApproverSearch(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
              <div className="flex-1 overflow-auto space-y-1">
                {approverList
                  .filter(a => !approverSearch || a.name.includes(approverSearch) || a.dept.includes(approverSearch))
                  .map(a => (
                    <label
                      key={a.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${tempApprover === a.id ? 'bg-muted/50' : ''}`}
                    >
                      <input
                        type="radio"
                        checked={tempApprover === a.id}
                        onChange={() => setTempApprover(a.id)}
                        className="accent-primary"
                      />
                      <span className="text-sm">{a.name}</span>
                      <span className="text-xs text-muted-foreground">{a.dept}</span>
                    </label>
                  ))
                }
                {approverList.filter(a => !approverSearch || a.name.includes(approverSearch) || a.dept.includes(approverSearch)).length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">未找到匹配的人员</div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproverDialogOpen(false)}>取消</Button>
            <Button onClick={() => { if (approverTarget === 'dispatch') { setDispatchApprover(tempApprover); } else { setAdjustForm(prev => ({ ...prev, approver: tempApprover })); } setApproverDialogOpen(false); }}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
